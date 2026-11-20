// =============================================================================
// Solar PV Calculation Engine  - Validation
// Rules from the PDFs [G2 Part 17].
// =============================================================================

import type { Appliance, Assumptions, DesignChoices, SystemDesign, ValidationIssue } from "./types";

/**
 * Basic validation [G2 Part 17]:
 *  - reject zero/negative quantity, watts, hours (error)
 *  - warn when hours > 24 (warning, still calculated)
 *  - reject zero/negative design assumptions and choices (error)
 */
export function validateInputs(
  appliances: Appliance[],
  assumptions: Assumptions,
  choices: DesignChoices,
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (appliances.length === 0) {
    issues.push({ level: "error", message: "Add at least one appliance to start sizing." });
  }

  appliances.forEach((a, i) => {
    const label = a.name.trim() || `Row ${i + 1}`;
    if (!(a.quantity > 0))
      issues.push({ level: "error", message: `${label}: quantity must be greater than zero.`, value: a.quantity, limit: 0, fix: "Set quantity to at least 1." });
    if (!(a.watts > 0))
      issues.push({ level: "error", message: `${label}: watts must be greater than zero.`, value: a.watts, limit: 0, fix: "Set watts to a positive number." });
    if (!(a.hoursPerDay > 0))
      issues.push({ level: "error", message: `${label}: hours per day must be greater than zero.`, value: a.hoursPerDay, limit: 0, fix: "Set hours to at least 1." });
    if (a.hoursPerDay > 24) {
      issues.push({
        level: "warning",
        message: `${label}: ${a.hoursPerDay} hours per day exceeds 24. Check this is intended.`,
        value: a.hoursPerDay,
        limit: 24,
        fix: "Reduce hours to 24 or less, unless multiple shifts are intended.",
      });
    }
  });

  const assumptionChecks: { key: keyof Assumptions; label: string; maxOne?: boolean }[] = [
    { key: "peakSunHours", label: "Peak sun hours" },
    { key: "performanceRatio", label: "Performance ratio", maxOne: true },
    { key: "powerFactor", label: "Power factor", maxOne: true },
    { key: "designMargin", label: "Design margin" },
    { key: "inverterEfficiency", label: "Inverter efficiency", maxOne: true },
    { key: "batteryEfficiency", label: "Battery efficiency", maxOne: true },
  ];

  assumptionChecks.forEach(({ key, label, maxOne }) => {
    if (!(assumptions[key] > 0)) {
      issues.push({ level: "error", message: `${label} must be greater than zero.`, value: assumptions[key], limit: 0 });
    }
    if (maxOne && assumptions[key] > 1) {
      issues.push({ level: "error", message: `${label} cannot be more than 1.`, value: assumptions[key], limit: 1 });
    }
  });

  if (!(choices.backupHours > 0))
    issues.push({ level: "error", message: "Backup hours must be greater than zero." });
  if (!(choices.panelWatts > 0))
    issues.push({ level: "error", message: "Panel wattage must be greater than zero." });

  return issues;
}

/** Check if issues contain any errors (blocks validation). */
export function hasErrors(issues: ValidationIssue[]): boolean {
  return issues.some((i) => i.level === "error");
}

/** Post-design engineering warnings. */
export function validateDesign(design: SystemDesign): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (design.inverter.exceedsLargestSize) {
    issues.push({
      level: "warning",
      message: `Required inverter size (${design.inverter.requiredKva.toFixed(1)} kVA) exceeds the largest standard size (30 kVA). Consider splitting into multiple inverters.`,
      value: design.inverter.requiredKva,
      limit: 30,
      fix: "Split the load across multiple inverters or reduce the connected load.",
    });
  }

  if (design.backupTimeHours < 4) {
    issues.push({
      level: "warning",
      message: `Backup time is only ${design.backupTimeHours.toFixed(1)} hours. Consider adding more batteries for adequate backup.`,
      value: design.backupTimeHours,
      limit: 4,
      fix: "Increase battery count or reduce load.",
    });
  }

  return issues;
}
