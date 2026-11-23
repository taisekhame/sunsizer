"use client";

import React from "react";
import { AlertTriangle } from "lucide-react";
import { formatNumber } from "@/lib/utils";
import type { SystemDesign, ValidationIssue } from "@/lib/calculations/types";

interface StepResultsProps {
  design: SystemDesign | null;
  issues: ValidationIssue[];
}

export function StepResults({ design, issues }: StepResultsProps) {
  const warnings = issues.filter((i) => i.level === "warning");

  if (!design) {
    return (
      <div>
        <h2 className="text-xl font-[family-name:var(--font-heading)] text-foreground mb-1">Results</h2>
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-sm font-[family-name:var(--font-ui)]">
            Complete the previous steps to see your system design results.
          </p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      label: "Inverter",
      value: `${design.inverter.recommendedKva} kVA`,
      sub: `Required: ${design.inverter.requiredKw.toFixed(2)} kW / ${design.inverter.requiredKva.toFixed(2)} kVA`,
      accent: false,
    },
    {
      label: "Battery Bank",
      value: `${design.battery.numberOfBatteries} ${design.battery.numberOfBatteries === 1 ? "battery" : "batteries"}`,
      sub: design.battery.description,
      accent: false,
    },
    {
      label: "System Voltage",
      value: `${design.battery.systemVoltage} V`,
      sub: `${design.battery.installedKwh.toFixed(2)} kWh installed`,
      accent: false,
    },
    {
      label: "PV Array",
      value: `${design.pv.numberOfPanels} panels`,
      sub: `${design.pv.installedKwp.toFixed(2)} kWp installed (required ${design.pv.requiredKwp.toFixed(2)} kWp)`,
      accent: false,
    },
    {
      label: "Backup Time",
      value: `${design.backupTimeHours.toFixed(1)} hours`,
      sub: "Estimated backup at average load (not the chosen backup hours)",
      accent: true,
    },
    {
      label: "MPPT Charge Current",
      value: `${design.mpptChargingCurrentA.toFixed(1)} A`,
      sub: "Approximate charging current",
      accent: false,
    },
  ];

  return (
    <div>
      <h2 className="text-xl font-[family-name:var(--font-heading)] text-foreground mb-1">
        System Design Results
      </h2>
      <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground mb-6">
        All values computed from your load audit and design choices.
      </p>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="mb-6 space-y-2">
          {warnings.map((w, i) => (
            <div
              key={i}
              className="flex items-start gap-3 rounded-lg border border-accent/50 bg-accent/10 p-3"
            >
              <AlertTriangle className="h-4 w-4 text-foreground mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-[family-name:var(--font-ui)] text-foreground">{w.message}</p>
                {w.fix && (
                  <p className="text-xs font-[family-name:var(--font-body)] text-muted-foreground mt-0.5">
                    Suggestion: {w.fix}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border p-5 ${
              s.accent
                ? "bg-accent text-accent-foreground border-accent/50"
                : "bg-card text-foreground border-border"
            }`}
          >
            <p className="text-xs font-[family-name:var(--font-ui)] font-medium uppercase tracking-wider opacity-70 mb-2">
              {s.label}
            </p>
            <p className="text-2xl font-[family-name:var(--font-heading)] mb-1">{s.value}</p>
            <p className="text-xs font-[family-name:var(--font-body)] opacity-60">{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Load summary */}
      <div className="mt-6 rounded-xl border border-border bg-muted/50 p-4">
        <h3 className="text-sm font-[family-name:var(--font-ui)] font-medium mb-3">Load Summary</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm font-[family-name:var(--font-ui)]">
          <div>
            <p className="text-muted-foreground text-xs">Connected Load</p>
            <p className="font-medium">{formatNumber(design.load.connectedLoadW)} W</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Daily Energy</p>
            <p className="font-medium">{formatNumber(design.load.dailyEnergyWh)} Wh</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Daily Energy</p>
            <p className="font-medium">{design.load.dailyEnergyKwh.toFixed(2)} kWh</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Average Power</p>
            <p className="font-medium">{design.load.averagePowerW.toFixed(1)} W</p>
          </div>
        </div>
      </div>
    </div>
  );
}
