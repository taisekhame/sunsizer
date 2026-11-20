"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCompanySettings() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("company_settings")
    .select("*")
    .limit(1)
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function updateCompanySettings(settings: {
  company_name?: string;
  address?: string;
  phone?: string;
  email?: string;
  bank_details?: string;
  default_markup?: number;
  default_valid_days?: number;
  terms?: string;
  logo_url?: string | null;
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

  // Get the current settings row ID
  const { data: current } = await supabase
    .from("company_settings")
    .select("id")
    .limit(1)
    .single();

  if (!current) return { error: "No settings found" };

  const { error } = await supabase
    .from("company_settings")
    .update({
      ...settings,
      updated_at: new Date().toISOString(),
    })
    .eq("id", current.id);

  if (error) return { error: error.message };
  revalidatePath("/admin/settings");
  return { success: true };
}
