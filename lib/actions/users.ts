"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

async function getCurrentUserRole() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, role: null };

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  return { user, role: profile?.role || "INSTALLER" };
}

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

  const { data: profile } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  if (profile?.role !== "ADMIN") return { error: "Admin access required" };

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
  const { user, role } = await getCurrentUserRole();
  if (!user) return { totalProjects: 0, totalCustomers: 0, quotedValue: 0, pendingQuotations: 0 };

  const isAdmin = role === "ADMIN";

  let projectsQuery = supabase.from("projects").select("id, status", { count: "exact" });
  let customersQuery = supabase.from("customers").select("id", { count: "exact" });
  const quotationsQuery = supabase.from("quotations").select("id, grand_total, status, project_id");

  if (!isAdmin) {
    projectsQuery = projectsQuery.eq("created_by", user.id);
    customersQuery = customersQuery.eq("created_by", user.id);
  }

  const [projectsRes, customersRes, quotationsRes] = await Promise.all([
    projectsQuery,
    customersQuery,
    quotationsQuery,
  ]);

  const totalProjects = projectsRes.count || 0;
  const totalCustomers = customersRes.count || 0;

  let quotations = quotationsRes.data || [];

  // For installers, filter quotations to only those belonging to their projects
  if (!isAdmin) {
    const myProjectIds = new Set((projectsRes.data || []).map((p: { id: string }) => p.id));
    quotations = quotations.filter((q: { project_id: string }) => myProjectIds.has(q.project_id));
  }

  const quotedValue = quotations.reduce((sum: number, q: { grand_total: number }) => sum + (Number(q.grand_total) || 0), 0);
  const pendingQuotations = quotations.filter((q: { status: string }) => q.status === "ISSUED").length;

  return { totalProjects, totalCustomers, quotedValue, pendingQuotations };
}

export async function getRecentProjects(limit = 5) {
  const supabase = await createClient();
  const { user, role } = await getCurrentUserRole();
  if (!user) return [];

  let query = supabase
    .from("projects")
    .select("id, title, status, updated_at, customers(name)")
    .order("updated_at", { ascending: false })
    .limit(limit);

  if (role !== "ADMIN") {
    query = query.eq("created_by", user.id);
  }

  const { data, error } = await query;

  if (error) return [];
  return data || [];
}
