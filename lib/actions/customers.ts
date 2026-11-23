"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getCurrentUserRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, role: null, supabase };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return { user, role: profile?.role || "INSTALLER", supabase };
}

export async function getCustomers() {
  const { user, role, supabase } = await getCurrentUserRole();
  if (!user) return { error: "Not authenticated", data: [] };

  let query = supabase
    .from("customers")
    .select("*")
    .order("name", { ascending: true });

  if (role !== "ADMIN") {
    query = query.eq("created_by", user.id);
  }

  const { data, error } = await query;

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function getCustomer(id: string) {
  const { user, role, supabase } = await getCurrentUserRole();
  if (!user) return { error: "Not authenticated" };

  let query = supabase
    .from("customers")
    .select("*, projects(*)")
    .eq("id", id);

  if (role !== "ADMIN") {
    query = query.eq("created_by", user.id);
  }

  const { data, error } = await query.single();

  if (error) return { error: error.message };
  return { data };
}

export async function createCustomer(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: formData.get("name") as string,
      phone: (formData.get("phone") as string) || "",
      email: (formData.get("email") as string) || "",
      address: (formData.get("address") as string) || "",
      site_address: (formData.get("site_address") as string) || "",
      notes: (formData.get("notes") as string) || "",
      created_by: user.id,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/customers");
  return { id: data.id };
}

/** Create a customer from plain object (used by quick-add in quotation flow). */
export async function createCustomerQuick(input: { name: string; phone?: string; email?: string; address?: string }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const { data, error } = await supabase
    .from("customers")
    .insert({
      name: input.name,
      phone: input.phone || "",
      email: input.email || "",
      address: input.address || "",
      site_address: "",
      notes: "",
      created_by: user.id,
    })
    .select("id, name")
    .single();

  if (error) return { error: error.message };
  return { id: data.id, name: data.name };
}

export async function updateCustomer(id: string, formData: FormData) {
  const supabase = await createClient();

  const { error } = await supabase
    .from("customers")
    .update({
      name: formData.get("name") as string,
      phone: (formData.get("phone") as string) || "",
      email: (formData.get("email") as string) || "",
      address: (formData.get("address") as string) || "",
      site_address: (formData.get("site_address") as string) || "",
      notes: (formData.get("notes") as string) || "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/customers");
  return { success: true };
}

export async function deleteCustomer(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/customers");
  return { success: true };
}
