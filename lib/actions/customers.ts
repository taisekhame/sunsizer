"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*")
    .order("name", { ascending: true });

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function getCustomer(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customers")
    .select("*, projects(*)")
    .eq("id", id)
    .single();

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
