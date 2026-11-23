"use client";

import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BACKUP_HOUR_OPTIONS, PANEL_WATT_OPTIONS, DEFAULT_ASSUMPTIONS } from "@/lib/calculations/constants";
import { cn } from "@/lib/utils";
import type { DesignChoices, BatteryType } from "@/lib/calculations/types";

interface StepDesignChoicesProps {
  choices: DesignChoices;
  setChoices: React.Dispatch<React.SetStateAction<DesignChoices>>;
  markupPercent: number;
  setMarkupPercent: React.Dispatch<React.SetStateAction<number>>;
}

export function StepDesignChoices({ choices, setChoices, markupPercent, setMarkupPercent }: StepDesignChoicesProps) {
  const setBatteryType = (type: BatteryType) => setChoices((p) => ({ ...p, batteryType: type }));
  const setPanelWatts = (w: number) => setChoices((p) => ({ ...p, panelWatts: w }));
  const setBackupHours = (h: number) => setChoices((p) => ({ ...p, backupHours: h }));

  return (
    <div>
      <h2 className="text-xl font-[family-name:var(--font-heading)] text-foreground mb-1">
        Design Choices
      </h2>
      <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground mb-6">
        Configure the system parameters for this installation.
      </p>

      {/* Battery Type */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">Battery Type</Label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {([
            { type: "lithium" as const, label: "Lithium (LiFePO4)", desc: "51.2V 100Ah units, 80% DoD, longer lifespan" },
            { type: "tubular" as const, label: "Tubular Lead-Acid", desc: "12V 220Ah units, 50% DoD, lower cost" },
          ]).map((opt) => (
            <button
              key={opt.type}
              type="button"
              onClick={() => setBatteryType(opt.type)}
              className={cn(
                "text-left rounded-xl border-2 p-4 transition-all",
                choices.batteryType === opt.type
                  ? "border-accent bg-accent/5"
                  : "border-border hover:border-accent/50",
              )}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm font-medium font-[family-name:var(--font-ui)]">{opt.label}</span>
                {choices.batteryType === opt.type && (
                  <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                    <div className="w-2 h-2 rounded-full bg-accent-foreground" />
                  </div>
                )}
              </div>
              <p className="text-xs font-[family-name:var(--font-body)] text-muted-foreground">{opt.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Backup Hours */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">Backup Hours</Label>
        <div className="flex flex-wrap gap-2">
          {BACKUP_HOUR_OPTIONS.map((h) => (
            <button
              key={h}
              type="button"
              onClick={() => setBackupHours(h)}
              className={cn(
                "px-4 py-2 rounded-lg border text-sm font-[family-name:var(--font-ui)] transition-all",
                choices.backupHours === h
                  ? "bg-accent text-accent-foreground border-accent font-medium"
                  : "border-border hover:border-accent/50",
              )}
            >
              {h}h
            </button>
          ))}
        </div>
      </div>

      {/* Panel Wattage */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">Panel Wattage</Label>
        <div className="grid grid-cols-2 gap-3 max-w-sm">
          {PANEL_WATT_OPTIONS.map((w) => (
            <button
              key={w}
              type="button"
              onClick={() => setPanelWatts(w)}
              className={cn(
                "text-center rounded-xl border-2 p-3 transition-all text-sm font-[family-name:var(--font-ui)]",
                choices.panelWatts === w
                  ? "border-accent bg-accent/5 font-medium"
                  : "border-border hover:border-accent/50",
              )}
            >
              {w} W
            </button>
          ))}
        </div>
      </div>

      {/* System Type */}
      <div className="mb-6">
        <Label className="text-sm font-medium mb-3 block">System Type</Label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {([
            { value: "OFF_GRID", label: "Off-Grid", available: true },
            { value: "HYBRID", label: "Hybrid", available: false },
            { value: "GRID_TIED", label: "Grid-Tied", available: false },
          ]).map((opt) => (
            <div
              key={opt.value}
              className={cn(
                "text-center rounded-xl border-2 p-3 transition-all text-sm font-[family-name:var(--font-ui)]",
                opt.available
                  ? "border-accent bg-accent/5 font-medium"
                  : "border-border opacity-60 cursor-not-allowed",
              )}
            >
              {opt.label}
              {!opt.available && <Badge variant="secondary" className="ml-2 text-[10px]">Soon</Badge>}
            </div>
          ))}
        </div>
      </div>

      {/* Markup */}
      <div className="max-w-xs mb-6">
        <Label htmlFor="markup" className="text-sm font-medium mb-2 block">
          Markup (%)
        </Label>
        <Input
          id="markup"
          type="number"
          min={0}
          max={100}
          value={markupPercent}
          onChange={(e) => setMarkupPercent(parseFloat(e.target.value) || 0)}
          className="w-28"
        />
      </div>

      {/* Design Assumptions (read-only) */}
      <div className="rounded-xl border border-border bg-muted/50 p-4">
        <h3 className="text-sm font-[family-name:var(--font-ui)] font-medium mb-3">
          Design Assumptions
        </h3>
        <p className="text-xs font-[family-name:var(--font-body)] text-muted-foreground mb-3">
          These engineering defaults are used in all calculations.
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm font-[family-name:var(--font-ui)]">
          <div>
            <p className="text-muted-foreground text-xs">Peak Sun Hours</p>
            <p className="font-medium">{DEFAULT_ASSUMPTIONS.peakSunHours} h/day</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Performance Ratio</p>
            <p className="font-medium">{DEFAULT_ASSUMPTIONS.performanceRatio}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Power Factor</p>
            <p className="font-medium">{DEFAULT_ASSUMPTIONS.powerFactor}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Design Margin</p>
            <p className="font-medium">{DEFAULT_ASSUMPTIONS.designMargin}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Inverter Efficiency</p>
            <p className="font-medium">{DEFAULT_ASSUMPTIONS.inverterEfficiency}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Battery Efficiency</p>
            <p className="font-medium">{DEFAULT_ASSUMPTIONS.batteryEfficiency}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
