"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function saveProject(data: {
  title: string;
  customerId?: string;
  systemType?: string;
  mode?: string;
  inputs: Record<string, unknown>;
  assumptions: Record<string, unknown>;
  results: Record<string, unknown> | null;
  formulaVersion: string;
  status?: string;
  projectId?: string;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  if (data.projectId) {
    // Update existing project
    const { error } = await supabase
      .from("projects")
      .update({
        title: data.title,
        customer_id: data.customerId || null,
        system_type: data.systemType || "OFF_GRID",
        mode: data.mode || "BASIC",
        inputs: data.inputs,
        assumptions: data.assumptions,
        results: data.results,
        formula_version: data.formulaVersion,
        status: data.status || "DRAFT",
        updated_at: new Date().toISOString(),
      })
      .eq("id", data.projectId);

    if (error) return { error: error.message };
    revalidatePath("/projects");
    return { id: data.projectId };
  }

  // Create new project
  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      title: data.title,
      created_by: user.id,
      customer_id: data.customerId || null,
      system_type: data.systemType || "OFF_GRID",
      mode: data.mode || "BASIC",
      inputs: data.inputs,
      assumptions: data.assumptions,
      results: data.results,
      formula_version: data.formulaVersion,
      status: data.status || "DRAFT",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };
  revalidatePath("/projects");
  return { id: project.id };
}

export async function getProjects() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, customers(name)")
    .order("updated_at", { ascending: false });

  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function getProject(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*, customers(name, email, phone, address)")
    .eq("id", id)
    .single();

  if (error) return { error: error.message };
  return { data };
}

export async function deleteProject(id: string) {
  const supabase = await createClient();
  const { error } = await supabase.from("projects").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/projects");
  return { success: true };
}
