"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getComponents(category?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("components")
    .select("*, prices(id, unit_price, is_placeholder, effective_from, created_at)")
    .order("category", { ascending: true })
    .order("model", { ascending: true });

  if (category) {
    query = query.eq("category", category);
  }

  const { data, error } = await query;
  if (error) return { error: error.message, data: [] };

  // Sort numerically by spec value within each category
  const sorted = [...(data || [])].sort((a, b) => {
    const sa = (a as { specs: Record<string, unknown> }).specs || {};
    const sb = (b as { specs: Record<string, unknown> }).specs || {};
    const catA = (a as { category: string }).category;
    const catB = (b as { category: string }).category;
    const catOrder: Record<string, number> = { INVERTER: 0, BATTERY: 1, PANEL: 2, ACCESSORY: 3 };
    const catDiff = (catOrder[catA] ?? 9) - (catOrder[catB] ?? 9);
    if (catDiff !== 0) return catDiff;
    if (catA === "INVERTER") return (Number(sa.kva) || 0) - (Number(sb.kva) || 0);
    if (catA === "PANEL") return (Number(sa.watts) || 0) - (Number(sb.watts) || 0);
    return ((a as { model: string }).model || "").localeCompare((b as { model: string }).model || "");
  });

  return { data: sorted };
}

export async function getComponent(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("components")
    .select("*, prices(id, unit_price, is_placeholder, effective_from, created_by, created_at)")
    .eq("id", id)
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function createComponent(data: {
  category: string;
  brand: string;
  model: string;
  specs: Record<string, unknown>;
  datasheet_url?: string;
  warranty?: string;
  verified?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "ADMIN") return { error: "Admin access required" };

  const { data: component, error } = await supabase
    .from("components")
    .insert({
      category: data.category,
      brand: data.brand,
      model: data.model,
      specs: data.specs,
      datasheet_url: data.datasheet_url || null,
      warranty: data.warranty || null,
      verified: data.verified || false,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/admin/components");
  revalidatePath("/components");
  return { id: component.id };
}

export async function updateComponent(
  id: string,
  data: {
    brand?: string;
    model?: string;
    specs?: Record<string, unknown>;
    datasheet_url?: string;
    warranty?: string;
    verified?: boolean;
    active?: boolean;
  },
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase
    .from("components")
    .update({
      ...data,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/admin/components");
  revalidatePath("/components");
  return { success: true };
}

export async function addPrice(data: {
  componentId: string;
  unitPrice: number;
  isPlaceholder?: boolean;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { error } = await supabase.from("prices").insert({
    component_id: data.componentId,
    unit_price: data.unitPrice,
    is_placeholder: data.isPlaceholder ?? false,
    created_by: user.id,
  });

  if (error) return { error: error.message };
  revalidatePath("/admin/components");
  revalidatePath("/components");
  return { success: true };
}

/** Returns the latest price for each component, plus component details. */
export async function getLatestPrices() {
  const supabase = await createClient();
  const { data: components, error } = await supabase
    .from("components")
    .select("id, category, brand, model, specs, verified, active, prices(id, unit_price, is_placeholder, effective_from)")
    .eq("active", true)
    .order("category")
    .order("model");

  if (error) return { error: error.message, data: [] };

  // For each component, pick the latest price
  const result = (components || []).map((c) => {
    const prices = (c.prices as Array<{ id: string; unit_price: number; is_placeholder: boolean; effective_from: string }>) || [];
    const sorted = prices.sort((a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime());
    const latest = sorted[0] || null;
    return {
      ...c,
      latestPrice: latest ? latest.unit_price : 0,
      isPlaceholder: latest ? latest.is_placeholder : true,
    };
  });

  // Sort numerically by spec value within each category
  result.sort((a, b) => {
    const sa = a.specs as Record<string, unknown>;
    const sb = b.specs as Record<string, unknown>;
    const catOrder: Record<string, number> = { INVERTER: 0, BATTERY: 1, PANEL: 2, ACCESSORY: 3 };
    const catDiff = (catOrder[a.category] ?? 9) - (catOrder[b.category] ?? 9);
    if (catDiff !== 0) return catDiff;
    if (a.category === "INVERTER") return (Number(sa.kva) || 0) - (Number(sb.kva) || 0);
    if (a.category === "PANEL") return (Number(sa.watts) || 0) - (Number(sb.watts) || 0);
    return a.model.localeCompare(b.model);
  });

  return { data: result };
}

/** Build a PriceBook from the database for use with the calculation engine. */
export async function buildPriceBookFromDb() {
  const { data, error } = await getLatestPrices();
  if (error || !data.length) return null;

  const inverterByKva: Record<number, number> = {};
  let lithiumBattery = 0;
  let tubularBattery = 0;
  const panelByWatts: Record<number, number> = {};
  let dcProtectionSet = 0;
  let cablesSet = 0;
  let mountingSet = 0;
  let installationLabour = 0;

  for (const c of data) {
    const specs = c.specs as Record<string, unknown>;
    const price = c.latestPrice;

    if (c.category === "INVERTER" && specs.kva) {
      inverterByKva[specs.kva as number] = price;
    } else if (c.category === "BATTERY") {
      if (specs.type === "lithium") lithiumBattery = price;
      else if (specs.type === "tubular") tubularBattery = price;
    } else if (c.category === "PANEL" && specs.watts) {
      panelByWatts[specs.watts as number] = price;
    } else if (c.category === "ACCESSORY") {
      if (specs.type === "dc_protection") dcProtectionSet = price;
      else if (specs.type === "cables") cablesSet = price;
      else if (specs.type === "mounting") mountingSet = price;
      else if (specs.type === "labour") installationLabour = price;
    }
  }

  return {
    inverterByKva,
    lithiumBattery,
    tubularBattery,
    panelByWatts,
    dcProtectionSet,
    cablesSet,
    mountingSet,
    installationLabour,
  };
}
