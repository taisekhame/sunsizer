"use client";

import React from "react";
import { formatNaira } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";
import type { CostSummary } from "@/lib/calculations/types";
import { issueQuotation } from "@/lib/actions/quotations";

interface StepCostProps {
  costSummary: CostSummary | null;
  markupPercent: number;
  projectId?: string | null;
}

export function StepCost({ costSummary, markupPercent, projectId }: StepCostProps) {
  const [isIssuing, setIsIssuing] = React.useState(false);
  const [issuedQuotation, setIssuedQuotation] = React.useState<{ id: string; number: string } | null>(null);

  if (!costSummary) {
    return (
      <div>
        <h2 className="text-xl font-[family-name:var(--font-heading)] text-foreground mb-1">
          Cost &amp; Quotation
        </h2>
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm font-[family-name:var(--font-ui)]">
            Complete the previous steps to see cost breakdown.
          </p>
        </div>
      </div>
    );
  }

  const handleIssueQuotation = async () => {
    if (!projectId) {
      toast.error("Please save the project first (click Save Project).");
      return;
    }
    setIsIssuing(true);
    try {
      const result = await issueQuotation({
        projectId,
        lines: costSummary.lines.map((l) => ({
          id: l.id,
          description: l.description,
          quantity: l.quantity,
          unit: l.unit,
          unitPrice: l.unitPrice,
          lineTotal: l.lineTotal,
        })),
        subtotal: costSummary.subtotal,
        markupRate: costSummary.markupRate,
        markupAmount: costSummary.markupAmount,
        grandTotal: costSummary.grandTotal,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        setIssuedQuotation({ id: result.id!, number: result.number! });
        toast.success(`Quotation ${result.number} issued!`);
      }
    } catch {
      toast.error("Failed to issue quotation");
    }
    setIsIssuing(false);
  };

  const handleDownloadPdf = () => {
    if (!issuedQuotation) {
      toast.error("Issue a quotation first.");
      return;
    }
    window.open(`/api/quotation-pdf?id=${issuedQuotation.id}`, "_blank");
  };

  return (
    <div>
      <h2 className="text-xl font-[family-name:var(--font-heading)] text-foreground mb-1">
        Cost &amp; Quotation
      </h2>
      <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground mb-6">
        Itemised cost breakdown using placeholder prices. Real prices are set in the admin panel.
      </p>

      {/* Cost table */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm font-[family-name:var(--font-ui)]">
          <thead>
            <tr className="border-b-2 border-border text-left">
              <th className="pb-3 pr-2 font-medium text-muted-foreground">Description</th>
              <th className="pb-3 px-2 font-medium text-muted-foreground text-center w-16">Qty</th>
              <th className="pb-3 px-2 font-medium text-muted-foreground text-center w-14">Unit</th>
              <th className="pb-3 px-2 font-medium text-muted-foreground text-right w-32">Unit Price</th>
              <th className="pb-3 pl-2 font-medium text-muted-foreground text-right w-32">Line Total</th>
            </tr>
          </thead>
          <tbody>
            {costSummary.lines.map((line) => (
              <tr key={line.id} className="border-b border-border/50">
                <td className="py-3 pr-2">{line.description}</td>
                <td className="py-3 px-2 text-center">{line.quantity}</td>
                <td className="py-3 px-2 text-center text-muted-foreground">{line.unit}</td>
                <td className="py-3 px-2 text-right">{formatNaira(line.unitPrice)}</td>
                <td className="py-3 pl-2 text-right font-medium">{formatNaira(line.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="space-y-2 max-w-sm ml-auto">
        <div className="flex justify-between text-sm font-[family-name:var(--font-ui)]">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">{formatNaira(costSummary.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm font-[family-name:var(--font-ui)]">
          <span className="text-muted-foreground">Markup ({markupPercent}%)</span>
          <span className="font-medium">{formatNaira(costSummary.markupAmount)}</span>
        </div>
        <div className="border-t-2 border-border pt-2">
          <div className="flex justify-between items-center bg-accent rounded-lg px-4 py-3">
            <span className="text-sm font-bold font-[family-name:var(--font-ui)] text-accent-foreground">
              Grand Total
            </span>
            <span className="text-xl font-[family-name:var(--font-heading)] text-accent-foreground">
              {formatNaira(costSummary.grandTotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Issued quotation info */}
      {issuedQuotation && (
        <div className="mt-6 p-4 rounded-lg border border-accent/50 bg-accent/10">
          <p className="text-sm font-[family-name:var(--font-ui)] font-medium">
            ✅ Quotation <span className="font-bold">{issuedQuotation.number}</span> issued successfully
          </p>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3 mt-8">
        <Button
          variant="outline"
          onClick={handleDownloadPdf}
          disabled={!issuedQuotation}
        >
          <Download className="h-4 w-4 mr-2" />
          Download PDF
        </Button>
        <Button
          variant="accent"
          onClick={handleIssueQuotation}
          disabled={isIssuing || !!issuedQuotation}
        >
          {isIssuing ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Issuing...</>
          ) : issuedQuotation ? (
            <><FileText className="h-4 w-4 mr-2" /> Issued</>
          ) : (
            <><FileText className="h-4 w-4 mr-2" /> Issue Quotation</>
          )}
        </Button>
      </div>
    </div>
  );
}
