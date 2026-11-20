// =============================================================================
// Solar PV Calculation Engine  - Battery Bank Sizing
// Formulae from the PDFs [G1 §4–5, G2 3.1–3.3].
// =============================================================================

import type { Assumptions, BatteryResult, DesignChoices, InverterResult, LoadAudit } from "./types";
import { DOD, LITHIUM_UNIT, SMALL_SYSTEM_MAX_KVA, TUBULAR_UNIT } from "./constants";

// Guards float noise such as 4.000000001 -> 5 when rounding up.
const ceilSafe = (x: number): number => Math.ceil(Math.round(x * 1e9) / 1e9);

/** System DC voltage: 24 V when inverter ≤ 3.5 kVA, otherwise 48 V. */
export function systemVoltageFor(recommendedKva: number): number {
  return recommendedKva <= SMALL_SYSTEM_MAX_KVA ? 24 : 48;
}

/**
 * Formula 5 [G1 §4, G2 3.1]
 *   E_battery,nominal (Wh) = (P_average × T_backup) ÷ (DoD × η_inv × η_bat)
 * Formula 6 [G1 §4]
 *   Ah = E_battery,nominal (Wh) ÷ V_system
 * Formula 7 [G1 §4]  LITHIUM
 *   N = ceil( required kWh ÷ 5.12 kWh )            (one 51.2 V 100 Ah unit)
 * Formula 7b [G2 3.3] TUBULAR (one battery = 12 V 220 Ah)
 *   Ns = V_system ÷ 12
 *   Np = ceil( required Ah ÷ 220 )
 *   N  = Ns × Np
 */
export function calcBattery(
  load: LoadAudit,
  inverter: InverterResult,
  choices: DesignChoices,
  a: Assumptions,
): BatteryResult {
  const dod = DOD[choices.batteryType];
  const requiredWh = (load.averagePowerW * choices.backupHours) / (dod * a.inverterEfficiency * a.batteryEfficiency);
  const systemVoltage = systemVoltageFor(inverter.recommendedKva);
  const requiredAh = requiredWh / systemVoltage;

  if (choices.batteryType === "lithium") {
    const n = Math.max(1, ceilSafe(requiredWh / 1000 / LITHIUM_UNIT.kwh));
    const installedKwh = n * LITHIUM_UNIT.kwh;
    return {
      dod,
      requiredWh,
      requiredKwh: requiredWh / 1000,
      systemVoltage,
      requiredAh,
      numberOfBatteries: n,
      seriesCount: 1,
      parallelCount: n,
      installedWh: installedKwh * 1000,
      installedKwh,
      description: `${n} × 51.2V 100Ah LiFePO4 (${LITHIUM_UNIT.kwh} kWh each)`,
    };
  }

  // Tubular path
  const series = Math.max(1, ceilSafe(systemVoltage / TUBULAR_UNIT.voltage));
  const parallel = Math.max(1, ceilSafe(requiredAh / TUBULAR_UNIT.ah));
  const n = series * parallel;
  const installedWh = n * TUBULAR_UNIT.voltage * TUBULAR_UNIT.ah;
  return {
    dod,
    requiredWh,
    requiredKwh: requiredWh / 1000,
    systemVoltage,
    requiredAh,
    numberOfBatteries: n,
    seriesCount: series,
    parallelCount: parallel,
    installedWh,
    installedKwh: installedWh / 1000,
    description: `${n} × 12V 220Ah tubular (${series} in series × ${parallel} parallel)`,
  };
}

/**
 * Formula 14 [G1 §9, G2 Part 4]
 *   T (h) = (E_installed,nominal × DoD × η_bat × η_inv) ÷ P_load
 * P_load = average power (Wh/day ÷ 24).
 */
export function calcBackupTime(battery: BatteryResult, load: LoadAudit, a: Assumptions): number {
  if (load.averagePowerW <= 0) return 0;
  return (battery.installedWh * battery.dod * a.batteryEfficiency * a.inverterEfficiency) / load.averagePowerW;
}
