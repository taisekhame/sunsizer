import { getLatestPrices } from "@/lib/actions/components";
import { formatNaira } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Cpu } from "lucide-react";

export default async function ComponentsPage() {
  const { data: components } = await getLatestPrices();

  const categories = ["INVERTER", "BATTERY", "PANEL", "ACCESSORY"] as const;

  return (
    <div>
      <h1 className="text-2xl font-[family-name:var(--font-heading)] text-foreground mb-1">Components</h1>
      <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground mb-8">
        Browse available solar components and their current prices.
      </p>

      {components.length === 0 ? (
        <div className="bg-card rounded-xl border border-border p-8 text-center">
          <Cpu className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-sm font-[family-name:var(--font-ui)] text-muted-foreground">
            No components available. Admin must seed the database first.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {categories.map((cat) => {
            const items = components.filter((c) => c.category === cat).sort((a, b) => {
              const sa = a.specs as Record<string, unknown>;
              const sb = b.specs as Record<string, unknown>;
              if (cat === "INVERTER") return (Number(sa.kva) || 0) - (Number(sb.kva) || 0);
              if (cat === "PANEL") return (Number(sa.watts) || 0) - (Number(sb.watts) || 0);
              return a.model.localeCompare(b.model);
            });
            if (items.length === 0) return null;
            return (
              <div key={cat}>
                <h2 className="text-lg font-[family-name:var(--font-heading)] text-foreground mb-3">
                  {cat === "INVERTER" ? "Inverters" : cat === "BATTERY" ? "Batteries" : cat === "PANEL" ? "Solar Panels" : "Accessories"}
                </h2>
                <div className="bg-card rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-sm font-[family-name:var(--font-ui)]">
                    <thead>
                      <tr className="border-b border-border text-left">
                        <th className="px-6 py-3 font-medium text-muted-foreground">Model</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground">Brand</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-right">Unit Price</th>
                        <th className="px-4 py-3 font-medium text-muted-foreground text-center w-24">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((c) => (
                        <tr key={c.id} className="border-b border-border/50">
                          <td className="px-6 py-3 font-medium">{c.model}</td>
                          <td className="px-4 py-3 text-muted-foreground">{c.brand}</td>
                          <td className="px-4 py-3 text-right">
                            <span className="font-medium">{formatNaira(c.latestPrice)}</span>
                            {c.isPlaceholder && (
                              <span className="ml-1.5 text-[10px] text-muted-foreground">⚑</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {!c.verified && (
                              <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                                <AlertTriangle className="w-3 h-3" /> Unverified
                              </span>
                            )}
                            {c.verified && <Badge variant="secondary" className="text-[10px]">Verified</Badge>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
