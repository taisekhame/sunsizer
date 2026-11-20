"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

export async function getQuotations(projectId?: string) {
  const supabase = await createClient();
  let query = supabase
    .from("quotations")
    .select("*, projects(title, customers(name))")
    .order("issued_at", { ascending: false });

  if (projectId) {
    query = query.eq("project_id", projectId);
  }

  const { data, error } = await query;
  if (error) return { error: error.message, data: [] };
  return { data: data || [] };
}

export async function getQuotation(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("quotations")
    .select("*, projects(title, customer_id, customers(name, email, phone, address))")
    .eq("id", id)
    .single();

  if (error) return { error: error.message };
  return { data };
}

/** Generate the next quotation number: QT-YYYY-NNN */
async function generateQuotationNumber(): Promise<string> {
  const supabase = await createClient();
  const year = new Date().getFullYear();
  const prefix = `QT-${year}-`;

  const { data } = await supabase
    .from("quotations")
    .select("number")
    .like("number", `${prefix}%`)
    .order("number", { ascending: false })
    .limit(1);

  let seq = 1;
  if (data && data.length > 0) {
    const last = data[0].number;
    const parts = last.split("-");
    const lastSeq = parseInt(parts[2], 10);
    if (!isNaN(lastSeq)) seq = lastSeq + 1;
  }

  return `${prefix}${String(seq).padStart(3, "0")}`;
}

export async function issueQuotation(data: {
  projectId: string;
  lines: Array<{
    id: string;
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    lineTotal: number;
  }>;
  subtotal: number;
  markupRate: number;
  markupAmount: number;
  grandTotal: number;
  validDays?: number;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Not authenticated" };

  const number = await generateQuotationNumber();

  const { data: quotation, error } = await supabase
    .from("quotations")
    .insert({
      project_id: data.projectId,
      number,
      lines: data.lines,
      subtotal: data.subtotal,
      markup_rate: data.markupRate,
      markup_amount: data.markupAmount,
      grand_total: data.grandTotal,
      valid_days: data.validDays || 30,
    })
    .select("id, number")
    .single();

  if (error) return { error: error.message };

  // Update project status to QUOTED
  await supabase
    .from("projects")
    .update({ status: "QUOTED", updated_at: new Date().toISOString() })
    .eq("id", data.projectId);

  revalidatePath("/projects");
  revalidatePath(`/projects/${data.projectId}`);
  return { id: quotation.id, number: quotation.number };
}

export async function updateQuotationStatus(id: string, status: "ISSUED" | "ACCEPTED" | "EXPIRED") {
  const supabase = await createClient();
  const { error } = await supabase
    .from("quotations")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  revalidatePath("/projects");
  return { success: true };
}

export async function updateQuotationPdfUrl(id: string, pdfUrl: string) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("quotations")
    .update({ pdf_url: pdfUrl, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) return { error: error.message };
  return { success: true };
}
