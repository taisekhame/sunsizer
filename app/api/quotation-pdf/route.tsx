import { NextRequest, NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { createClient } from "@/lib/supabase/server";
import { QuotationPdfDocument } from "@/lib/pdf/quotation-pdf";
import React from "react";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const quotationId = searchParams.get("id");

  if (!quotationId) {
    return NextResponse.json({ error: "Missing quotation ID" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  // Fetch quotation with project and customer
  const { data: quotation, error } = await supabase
    .from("quotations")
    .select("*, projects(title, customer_id, inputs, results, customers(name, email, phone, address))")
    .eq("id", quotationId)
    .single();

  if (error || !quotation) {
    return NextResponse.json({ error: "Quotation not found" }, { status: 404 });
  }

  // Fetch company settings
  const { data: settings } = await supabase
    .from("company_settings")
    .select("*")
    .limit(1)
    .single();

  const project = quotation.projects as unknown as Record<string, unknown> | null;
  const customer = project?.customers as unknown as { name: string; email: string; phone: string; address: string } | null;
  const results = project?.results as Record<string, unknown> | null;

  const load = results?.load as { connectedLoadW?: number; dailyEnergyKwh?: number } | null;
  const inverter = results?.inverter as { recommendedKva?: number } | null;
  const battery = results?.battery as { numberOfBatteries?: number; description?: string; systemVoltage?: number } | null;
  const pv = results?.pv as { numberOfPanels?: number; installedKwp?: number } | null;
  const backupTimeHours = results?.backupTimeHours as number | undefined;

  const lines = (quotation.lines as Array<{
    description: string;
    quantity: number;
    unit: string;
    unitPrice: number;
    lineTotal: number;
  }>) || [];

  const design = load && inverter && battery && pv ? {
    connectedLoadW: load.connectedLoadW || 0,
    dailyEnergyKwh: load.dailyEnergyKwh || 0,
    inverterKva: inverter.recommendedKva || 0,
    batteryCount: battery.numberOfBatteries || 0,
    batteryDescription: battery.description || "",
    panelCount: pv.numberOfPanels || 0,
    installedKwp: pv.installedKwp || 0,
    backupTimeHours: backupTimeHours || 0,
    systemVoltage: battery.systemVoltage || 24,
  } : null;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const doc = React.createElement(QuotationPdfDocument as any, {
    quotationNumber: quotation.number,
    issuedAt: quotation.issued_at,
    validDays: quotation.valid_days,
    company: {
      name: settings?.company_name || "Solar Company",
      address: settings?.address || "",
      phone: settings?.phone || "",
      email: settings?.email || "",
      bankDetails: settings?.bank_details || "",
      terms: settings?.terms || "",
    },
    customer,
    design,
    lines,
    subtotal: Number(quotation.subtotal),
    markupRate: Number(quotation.markup_rate),
    markupAmount: Number(quotation.markup_amount),
    grandTotal: Number(quotation.grand_total),
  });

  const pdfBuffer = await renderToBuffer(doc as never);

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quotation.number}.pdf"`,
    },
  });
}
