// =============================================================================
// Solar PV Calculation Engine  - Main Entry Point
// One function: runDesign(inputs, assumptions, components) → results + issues.
// The engine runs in the browser for live feedback and on the server for saves.
// =============================================================================

import type { Appliance, Assumptions, DesignChoices, DesignResult, SystemDesign, ValidationIssue } from "./types";
import { FORMULA_VERSION } from "./constants";
import { calcLoadAudit } from "./load";
import { calcInverter } from "./inverter";
import { calcBattery, calcBackupTime } from "./battery";
import { calcPv } from "./pv";
import { calcMpptCurrent } from "./mppt";
import { validateInputs, hasErrors, validateDesign } from "./validate";

/**
 * Full system design in one call.
 * Returns null when there is nothing valid to size yet.
 */
export function calcSystemDesign(
  appliances: Appliance[],
  choices: DesignChoices,
  assumptions: Assumptions,
): SystemDesign | null {
  const issues = validateInputs(appliances, assumptions, choices);
  const load = calcLoadAudit(appliances);
  if (hasErrors(issues) || load.connectedLoadW <= 0) return null;

  const inverter = calcInverter(load, assumptions);
  const battery = calcBattery(load, inverter, choices, assumptions);
  const pv = calcPv(load, choices, assumptions);
  return {
    load,
    inverter,
    battery,
    pv,
    backupTimeHours: calcBackupTime(battery, load, assumptions),
    mpptChargingCurrentA: calcMpptCurrent(pv, battery.systemVoltage),
  };
}

/**
 * Full design run with validation, assumptions and formula version.
 */
export function runDesign(
  appliances: Appliance[],
  choices: DesignChoices,
  assumptions: Assumptions,
): DesignResult | null {
  const inputIssues = validateInputs(appliances, assumptions, choices);
  const design = calcSystemDesign(appliances, choices, assumptions);

  if (!design) return null;

  const designIssues = validateDesign(design);
  const allIssues: ValidationIssue[] = [...inputIssues, ...designIssues];

  return {
    design,
    issues: allIssues,
    assumptions,
    choices,
    formulaVersion: FORMULA_VERSION,
  };
}
