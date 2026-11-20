"use client";

import React, { useState, useEffect, useTransition } from "react";
import { DollarSign, Plus, Pencil, ChevronDown, ChevronUp, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { formatNaira } from "@/lib/utils";
import {
  getComponents,
  createComponent,
  updateComponent,
  addPrice,
} from "@/lib/actions/components";

type PriceRow = { id: string; unit_price: number; is_placeholder: boolean; effective_from: string; created_at: string };
type ComponentRow = {
  id: string;
  category: string;
  brand: string;
  model: string;
  specs: Record<string, unknown>;
  verified: boolean;
  active: boolean;
  prices: PriceRow[];
};

const CATEGORIES = ["INVERTER", "BATTERY", "PANEL", "ACCESSORY"] as const;

export function AdminComponentsClient() {
  const [components, setComponents] = useState<ComponentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterCat, setFilterCat] = useState<string>("ALL");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [addDialog, setAddDialog] = useState(false);
  const [priceDialog, setPriceDialog] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const loadAll = async () => {
    setLoading(true);
    const { data } = await getComponents();
    setComponents(data as ComponentRow[]);
    setLoading(false);
  };

  useEffect(() => { loadAll(); }, []);

  const filtered = filterCat === "ALL" ? components : components.filter((c) => c.category === filterCat);

  const latestPrice = (c: ComponentRow): PriceRow | null => {
    if (!c.prices?.length) return null;
    return [...c.prices].sort((a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime())[0];
  };

  const handleAddComponent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const specsRaw: Record<string, unknown> = {};
      const cat = form.get("category") as string;
      if (cat === "INVERTER") specsRaw.kva = Number(form.get("spec_kva"));
      if (cat === "BATTERY") specsRaw.type = form.get("spec_type");
      if (cat === "PANEL") specsRaw.watts = Number(form.get("spec_watts"));
      if (cat === "ACCESSORY") specsRaw.type = form.get("spec_type");

      const result = await createComponent({
        category: cat,
        brand: (form.get("brand") as string) || "",
        model: (form.get("model") as string) || "",
        specs: specsRaw,
      });
      if (result.error) { toast.error(result.error); return; }
      toast.success("Component added");
      setAddDialog(false);
      loadAll();
    });
  };

  const handleAddPrice = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!priceDialog) return;
    const form = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await addPrice({
        componentId: priceDialog,
        unitPrice: Number(form.get("unit_price")),
        isPlaceholder: form.get("is_placeholder") === "on",
      });
      if (result.error) { toast.error(result.error); return; }
      toast.success("Price added");
      setPriceDialog(null);
      loadAll();
    });
  };

  const handleToggleActive = (id: string, active: boolean) => {
    startTransition(async () => {
      const result = await updateComponent(id, { active: !active });
      if (result.error) { toast.error(result.error); return; }
      toast.success(active ? "Component deactivated" : "Component activated");
      loadAll();
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-[family-name:var(--font-heading)] text-foreground mb-1">Components &amp; Prices</h1>
          <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground">
            Manage inverters, batteries, panels and accessories. Add dated pricing.
          </p>
        </div>
        <Button variant="accent" onClick={() => setAddDialog(true)}>
          <Plus className="h-4 w-4 mr-1" /> Add Component
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {["ALL", ...CATEGORIES].map((cat) => (
          <Button
            key={cat}
            variant={filterCat === cat ? "accent" : "outline"}
            size="sm"
            onClick={() => setFilterCat(cat)}
          >
            {cat === "ALL" ? "All" : cat.charAt(0) + cat.slice(1).toLowerCase()}
          </Button>
        ))}
      </div>

      <div className="bg-card rounded-xl border border-border">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground font-[family-name:var(--font-ui)]">Loading...</div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <DollarSign className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm font-[family-name:var(--font-ui)] text-muted-foreground">No components found.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {filtered.map((c) => {
              const lp = latestPrice(c);
              const isExpanded = expanded === c.id;
              return (
                <div key={c.id}>
                  <div
                    className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setExpanded(isExpanded ? null : c.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-[family-name:var(--font-ui)] font-medium text-foreground">{c.model}</span>
                        <Badge variant="outline" className="text-[10px]">{c.category}</Badge>
                        {!c.verified && (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-muted-foreground">
                            <AlertTriangle className="w-3 h-3" /> Not verified
                          </span>
                        )}
                        {!c.active && <Badge variant="destructive" className="text-[10px]">Inactive</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{c.brand}</p>
                    </div>
                    <div className="flex items-center gap-4 shrink-0">
                      <div className="text-right">
                        <p className="text-sm font-[family-name:var(--font-ui)] font-medium">
                          {lp ? formatNaira(lp.unit_price) : "No price"}
                        </p>
                        {lp?.is_placeholder && (
                          <p className="text-[10px] text-muted-foreground">Placeholder</p>
                        )}
                      </div>
                      {isExpanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                    </div>
                  </div>
                  {isExpanded && (
                    <div className="px-6 pb-4 border-t border-border/30">
                      <div className="flex gap-2 my-3">
                        <Button variant="outline" size="sm" onClick={() => setPriceDialog(c.id)}>
                          <Plus className="w-3 h-3 mr-1" /> Add Price
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleToggleActive(c.id, c.active)}>
                          {c.active ? "Deactivate" : "Activate"}
                        </Button>
                      </div>
                      {/* Price history */}
                      <p className="text-xs font-[family-name:var(--font-ui)] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                        Price History
                      </p>
                      {c.prices?.length ? (
                        <div className="space-y-1">
                          {[...c.prices]
                            .sort((a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime())
                            .map((p) => (
                              <div key={p.id} className="flex items-center justify-between text-xs font-[family-name:var(--font-ui)] py-1">
                                <span>{formatNaira(p.unit_price)}</span>
                                <span className="text-muted-foreground">
                                  {p.is_placeholder && "⚑ Placeholder · "}
                                  {new Date(p.effective_from).toLocaleDateString()}
                                </span>
                              </div>
                            ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No prices set.</p>
                      )}
                      {/* Specs */}
                      <p className="text-xs font-[family-name:var(--font-ui)] font-semibold text-muted-foreground uppercase tracking-wider mt-4 mb-2">
                        Specs
                      </p>
                      <pre className="text-xs text-muted-foreground bg-muted rounded p-2 overflow-x-auto">
                        {JSON.stringify(c.specs, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Component Dialog */}
      {addDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-[family-name:var(--font-heading)] mb-4">Add Component</h2>
            <form onSubmit={handleAddComponent} className="space-y-4">
              <div>
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  name="category"
                  required
                  className="flex h-9 w-full rounded-lg border border-border bg-transparent px-3 py-1 text-sm font-[family-name:var(--font-ui)]"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c.charAt(0) + c.slice(1).toLowerCase()}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="brand">Brand</Label>
                  <Input id="brand" name="brand" placeholder="Generic" />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input id="model" name="model" required placeholder="e.g. 5 kVA Inverter" />
                </div>
              </div>
              <div>
                <Label>Key Spec</Label>
                <Input name="spec_kva" placeholder="kVA (for inverter)" className="mb-1" />
                <Input name="spec_watts" placeholder="Watts (for panel)" className="mb-1" />
                <Input name="spec_type" placeholder="Type: lithium/tubular/dc_protection/cables/mounting/labour" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setAddDialog(false)}>Cancel</Button>
                <Button type="submit" variant="accent" disabled={isPending}>
                  {isPending ? "Adding..." : "Add"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Price Dialog */}
      {priceDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-card border border-border rounded-2xl shadow-xl w-full max-w-sm p-6">
            <h2 className="text-lg font-[family-name:var(--font-heading)] mb-4">Add New Price</h2>
            <form onSubmit={handleAddPrice} className="space-y-4">
              <div>
                <Label htmlFor="unit_price">Unit Price (₦) *</Label>
                <Input id="unit_price" name="unit_price" type="number" required min="0" step="1" />
              </div>
              <div className="flex items-center gap-2">
                <input type="checkbox" id="is_placeholder" name="is_placeholder" className="rounded" />
                <Label htmlFor="is_placeholder" className="text-sm">Mark as placeholder price</Label>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setPriceDialog(null)}>Cancel</Button>
                <Button type="submit" variant="accent" disabled={isPending}>
                  {isPending ? "Adding..." : "Add Price"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
