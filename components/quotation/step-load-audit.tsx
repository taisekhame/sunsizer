"use client";

import React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { APPLIANCE_PRESETS } from "@/lib/calculations/constants";
import { generateId, formatNumber } from "@/lib/utils";
import type { Appliance, LoadAudit } from "@/lib/calculations/types";

interface StepLoadAuditProps {
  appliances: Appliance[];
  setAppliances: React.Dispatch<React.SetStateAction<Appliance[]>>;
  loadAudit: LoadAudit;
}

export function StepLoadAudit({ appliances, setAppliances, loadAudit }: StepLoadAuditProps) {
  const addAppliance = (preset?: (typeof APPLIANCE_PRESETS)[number]) => {
    const newAppliance: Appliance = preset
      ? {
          id: generateId(),
          preset: preset.name,
          name: preset.name,
          quantity: 1,
          watts: preset.watts,
          hoursPerDay: preset.hours,
        }
      : {
          id: generateId(),
          preset: "Custom",
          name: "",
          quantity: 1,
          watts: 0,
          hoursPerDay: 0,
        };
    setAppliances((prev) => [...prev, newAppliance]);
  };

  const updateAppliance = (id: string, field: keyof Appliance, value: string | number) => {
    setAppliances((prev) =>
      prev.map((a) => (a.id === id ? { ...a, [field]: value } : a)),
    );
  };

  const removeAppliance = (id: string) => {
    setAppliances((prev) => prev.filter((a) => a.id !== id));
  };

  const handlePresetChange = (id: string, presetName: string) => {
    if (presetName === "Custom") {
      setAppliances((prev) =>
        prev.map((a) =>
          a.id === id ? { ...a, preset: "Custom", name: "" } : a,
        ),
      );
      return;
    }
    const preset = APPLIANCE_PRESETS.find((p) => p.name === presetName);
    if (!preset) return;
    setAppliances((prev) =>
      prev.map((a) =>
        a.id === id
          ? { ...a, preset: presetName, name: presetName, watts: preset.watts, hoursPerDay: preset.hours }
          : a,
      ),
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div>
          <h2 className="text-xl font-[family-name:var(--font-heading)] text-foreground">
            Load Audit
          </h2>
          <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground mt-1">
            Add your customer&apos;s appliances and their daily usage.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="pro-mode" className="text-xs text-muted-foreground">Professional Mode</Label>
          <Switch id="pro-mode" disabled />
          <Badge variant="secondary" className="text-[10px]">Coming Soon</Badge>
        </div>
      </div>

      {/* Preset buttons */}
      <div className="flex flex-wrap gap-2 mt-4 mb-4">
        {APPLIANCE_PRESETS.map((p) => (
          <Button
            key={p.name}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => addAppliance(p)}
            className="text-xs"
          >
            <Plus className="h-3 w-3 mr-1" />
            {p.name}
          </Button>
        ))}
        <Button type="button" variant="outline" size="sm" onClick={() => addAppliance()} className="text-xs">
          <Plus className="h-3 w-3 mr-1" />
          Custom
        </Button>
      </div>

      {/* Appliance table */}
      {appliances.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-[family-name:var(--font-ui)]">
            <thead>
              <tr className="border-b border-border text-left">
                <th className="pb-2 pr-2 font-medium text-muted-foreground">Appliance</th>
                <th className="pb-2 px-2 font-medium text-muted-foreground w-20">Qty</th>
                <th className="pb-2 px-2 font-medium text-muted-foreground w-24">Watts</th>
                <th className="pb-2 px-2 font-medium text-muted-foreground w-24">Hours/Day</th>
                <th className="pb-2 px-2 font-medium text-muted-foreground w-28 text-right">Daily Wh</th>
                <th className="pb-2 pl-2 w-10"></th>
              </tr>
            </thead>
            <tbody>
              {appliances.map((a) => (
                <tr key={a.id} className="border-b border-border/50">
                  <td className="py-2 pr-2">
                    {a.preset === "Custom" ? (
                      <Input
                        value={a.name}
                        onChange={(e) => updateAppliance(a.id, "name", e.target.value)}
                        placeholder="Appliance name"
                        className="h-8 text-sm"
                      />
                    ) : (
                      <select
                        value={a.preset}
                        onChange={(e) => handlePresetChange(a.id, e.target.value)}
                        className="h-8 w-full rounded-md border border-border bg-background px-2 text-sm font-[family-name:var(--font-ui)] focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        {APPLIANCE_PRESETS.map((p) => (
                          <option key={p.name} value={p.name}>{p.name}</option>
                        ))}
                        <option value="Custom">Custom</option>
                      </select>
                    )}
                  </td>
                  <td className="py-2 px-2">
                    <Input
                      type="number"
                      min={1}
                      value={a.quantity}
                      onChange={(e) => updateAppliance(a.id, "quantity", parseInt(e.target.value) || 0)}
                      className="h-8 text-sm text-center"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Input
                      type="number"
                      min={0}
                      value={a.watts}
                      onChange={(e) => updateAppliance(a.id, "watts", parseInt(e.target.value) || 0)}
                      className="h-8 text-sm text-center"
                    />
                  </td>
                  <td className="py-2 px-2">
                    <Input
                      type="number"
                      min={0}
                      max={24}
                      value={a.hoursPerDay}
                      onChange={(e) => updateAppliance(a.id, "hoursPerDay", parseFloat(e.target.value) || 0)}
                      className="h-8 text-sm text-center"
                    />
                  </td>
                  <td className="py-2 px-2 text-right font-medium">
                    {formatNumber(a.quantity * a.watts * a.hoursPerDay)}
                  </td>
                  <td className="py-2 pl-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeAppliance(a.id)}
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {appliances.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm font-[family-name:var(--font-ui)]">
            Click a preset above to add appliances, or add a custom one.
          </p>
        </div>
      )}

      {/* Totals */}
      {appliances.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-4">
          <div className="bg-muted rounded-lg px-4 py-3 flex-1 min-w-[140px]">
            <p className="text-xs font-[family-name:var(--font-ui)] text-muted-foreground">Connected Load</p>
            <p className="text-lg font-[family-name:var(--font-heading)]">
              {formatNumber(loadAudit.connectedLoadW)} W
            </p>
          </div>
          <div className="bg-muted rounded-lg px-4 py-3 flex-1 min-w-[140px]">
            <p className="text-xs font-[family-name:var(--font-ui)] text-muted-foreground">Daily Energy</p>
            <p className="text-lg font-[family-name:var(--font-heading)]">
              {formatNumber(loadAudit.dailyEnergyWh)} Wh
            </p>
          </div>
          <div className="bg-accent rounded-lg px-4 py-3 flex-1 min-w-[140px]">
            <p className="text-xs font-[family-name:var(--font-ui)] text-accent-foreground/70">Daily Energy</p>
            <p className="text-lg font-[family-name:var(--font-heading)] text-accent-foreground">
              {loadAudit.dailyEnergyKwh.toFixed(2)} kWh/day
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
