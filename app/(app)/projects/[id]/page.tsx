import { notFound } from "next/navigation";
import Link from "next/link";
import { getProject } from "@/lib/actions/projects";
import { getQuotations } from "@/lib/actions/quotations";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatNaira, formatNumber } from "@/lib/utils";
import { ArrowLeft, FileText } from "lucide-react";

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { data: project, error } = await getProject(id);
  if (error || !project) return notFound();

  const { data: quotations } = await getQuotations(id);

  const results = project.results as Record<string, unknown> | null;
  const inputs = project.inputs as { appliances?: unknown[]; choices?: Record<string, unknown>; markupPercent?: number } | null;
  const load = results?.load as { connectedLoadW?: number; dailyEnergyKwh?: number } | null;
  const inverter = results?.inverter as { recommendedKva?: number } | null;
  const battery = results?.battery as { numberOfBatteries?: number; description?: string; seriesCount?: number; parallelCount?: number; systemVoltage?: number; installedKwh?: number } | null;
  const pv = results?.pv as { numberOfPanels?: number; installedKwp?: number } | null;
  const cost = results?.cost as { subtotal?: number; markupAmount?: number; grandTotal?: number } | null;
  const backupTime = results?.backupTimeHours as number | undefined;
  const customer = project.customers as { name: string; email: string; phone: string; address: string } | null;

  return (
    <div>
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm font-[family-name:var(--font-ui)] text-muted-foreground hover:text-foreground mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-[family-name:var(--font-heading)] text-foreground mb-1">
            {project.title}
          </h1>
          <div className="flex items-center gap-3 text-sm font-[family-name:var(--font-ui)] text-muted-foreground">
            <Badge variant={project.status === "QUOTED" ? "default" : project.status === "VALIDATED" ? "secondary" : "outline"}>
              {project.status}
            </Badge>
            <span>{project.system_type.replace("_", " ")}</span>
            <span>·</span>
            <span>Created {new Date(project.created_at).toLocaleDateString()}</span>
          </div>
        </div>
        <Button asChild variant="accent" size="sm">
          <Link href={`/projects/new?edit=${project.id}`}>Edit Design</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer info */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-[family-name:var(--font-ui)] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Customer
          </h2>
          {customer ? (
            <div className="space-y-1 text-sm font-[family-name:var(--font-body)]">
              <p className="font-medium text-foreground">{customer.name}</p>
              {customer.email && <p className="text-muted-foreground">{customer.email}</p>}
              {customer.phone && <p className="text-muted-foreground">{customer.phone}</p>}
              {customer.address && <p className="text-muted-foreground">{customer.address}</p>}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">No customer assigned</p>
          )}
        </div>

        {/* Load summary */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h2 className="text-sm font-[family-name:var(--font-ui)] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Load Summary
          </h2>
          {load ? (
            <div className="space-y-2 text-sm font-[family-name:var(--font-ui)]">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Connected Load</span>
                <span className="font-medium">{formatNumber(load.connectedLoadW || 0)} W</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Daily Energy</span>
                <span className="font-medium">{(load.dailyEnergyKwh || 0).toFixed(2)} kWh</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Appliances</span>
                <span className="font-medium">{inputs?.appliances?.length || 0} items</span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground font-[family-name:var(--font-body)]">No design calculated</p>
          )}
        </div>

        {/* Cost summary */}
        <div className="bg-accent rounded-xl border border-accent/50 p-5 text-accent-foreground">
          <h2 className="text-sm font-[family-name:var(--font-ui)] font-semibold uppercase tracking-wider opacity-70 mb-3">
            Cost Summary
          </h2>
          {cost ? (
            <div className="space-y-2 text-sm font-[family-name:var(--font-ui)]">
              <div className="flex justify-between">
                <span className="opacity-70">Subtotal</span>
                <span className="font-medium">{formatNaira(cost.subtotal || 0)}</span>
              </div>
              <div className="flex justify-between">
                <span className="opacity-70">Markup</span>
                <span className="font-medium">{formatNaira(cost.markupAmount || 0)}</span>
              </div>
              <div className="border-t border-black/20 pt-2 flex justify-between">
                <span className="font-bold">Grand Total</span>
                <span className="text-xl font-[family-name:var(--font-heading)]">{formatNaira(cost.grandTotal || 0)}</span>
              </div>
            </div>
          ) : (
            <p className="text-sm opacity-70 font-[family-name:var(--font-body)]">No cost calculated</p>
          )}
        </div>
      </div>

      {/* System design details */}
      {results && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {inverter && (
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-[family-name:var(--font-ui)] text-muted-foreground uppercase tracking-wider mb-1">Inverter</p>
              <p className="text-lg font-[family-name:var(--font-heading)]">{inverter.recommendedKva} kVA</p>
            </div>
          )}
          {battery && (
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-[family-name:var(--font-ui)] text-muted-foreground uppercase tracking-wider mb-1">Batteries</p>
              <p className="text-lg font-[family-name:var(--font-heading)]">
                {battery.numberOfBatteries} x {battery.description || "Battery"}
              </p>
              {battery.seriesCount != null && battery.parallelCount != null && (
                <p className="text-xs font-[family-name:var(--font-body)] text-muted-foreground mt-1">
                  {battery.seriesCount} series x {battery.parallelCount} parallel
                </p>
              )}
            </div>
          )}
          {pv && (
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-[family-name:var(--font-ui)] text-muted-foreground uppercase tracking-wider mb-1">PV Array</p>
              <p className="text-lg font-[family-name:var(--font-heading)]">{pv.numberOfPanels} panels ({pv.installedKwp?.toFixed(2)} kWp)</p>
            </div>
          )}
          {backupTime !== undefined && (
            <div className="bg-card rounded-xl border border-border p-4">
              <p className="text-xs font-[family-name:var(--font-ui)] text-muted-foreground uppercase tracking-wider mb-1">Backup Time</p>
              <p className="text-lg font-[family-name:var(--font-heading)]">{(backupTime as number).toFixed(1)} hours</p>
            </div>
          )}
        </div>
      )}

      {/* Quotations */}
      <div className="mt-8 bg-card rounded-xl border border-border p-6">
        <h2 className="text-lg font-[family-name:var(--font-heading)] mb-4">Quotations</h2>
        {quotations.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-8 h-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm font-[family-name:var(--font-ui)] text-muted-foreground">
              No quotations issued yet.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {quotations.map((q) => (
              <div key={q.id} className="flex items-center justify-between py-3 px-4 rounded-lg border border-border/50">
                <div>
                  <p className="text-sm font-[family-name:var(--font-ui)] font-medium">{q.number}</p>
                  <p className="text-xs text-muted-foreground">
                    Issued {new Date(q.issued_at).toLocaleDateString()} · Valid {q.valid_days} days
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-[family-name:var(--font-heading)]">{formatNaira(q.grand_total)}</span>
                  <Badge variant={q.status === "ACCEPTED" ? "default" : q.status === "EXPIRED" ? "destructive" : "outline"}>
                    {q.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
