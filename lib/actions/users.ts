"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getUsers() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function updateUserRole(userId: string, role: "ADMIN" | "INSTALLER") {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  // Check the current user is an admin
  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "ADMIN") return { error: "Admin access required" };

  // Don't allow admins to demote themselves (prevent lockout)
  if (user.id === userId && role !== "ADMIN") {
    return { error: "You cannot change your own role" };
  }

  const { error } = await supabase
    .from("users")
    .update({ role, updated_at: new Date().toISOString() })
    .eq("id", userId);

  if (error) return { error: error.message };
  revalidatePath("/admin/users");
  return { success: true };
}

export async function getDashboardStats() {
  const supabase = await createClient();

  const [projectsRes, customersRes, quotationsRes] = await Promise.all([
    supabase.from("projects").select("id, status", { count: "exact" }),
    supabase.from("customers").select("id", { count: "exact" }),
    supabase.from("quotations").select("id, grand_total, status"),
  ]);

  const totalProjects = projectsRes.count || 0;
  const totalCustomers = customersRes.count || 0;

  const quotations = quotationsRes.data || [];
  const quotedValue = quotations.reduce((sum, q) => sum + (Number(q.grand_total) || 0), 0);
  const pendingQuotations = quotations.filter((q) => q.status === "ISSUED").length;

  return { totalProjects, totalCustomers, quotedValue, pendingQuotations };
}

export async function getRecentProjects(limit = 5) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("id, title, status, updated_at, customers(name)")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (error) return [];
  return data || [];
}
