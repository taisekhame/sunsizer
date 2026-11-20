// =============================================================================
// Solar PV Calculation Engine  - Load Audit
// Formulae from the PDFs [G1 §2, G2 1.1–1.3].
// =============================================================================

import type { Appliance, LoadAudit } from "./types";

/** A row counts toward the maths only if all three numbers are > 0. */
export function isValidAppliance(a: Appliance): boolean {
  return a.quantity > 0 && a.watts > 0 && a.hoursPerDay > 0;
}

/**
 * Formula 1 [G1 §2, G2 1.1]  P_connected (W) = Σ (Quantity_i × Power_i)
 * Formula 2 [G1 §2, G2 1.2]  E_daily  (Wh)   = Σ (Quantity_i × Power_i × Hours_i)
 *                            E_daily  (kWh)  = E_daily (Wh) ÷ 1000
 * Formula 2b [G2 1.3]        P_average (W)   = E_daily (Wh) ÷ 24
 *
 * Only valid rows (all values > 0) are counted.
 */
export function calcLoadAudit(appliances: Appliance[]): LoadAudit {
  const rows = appliances.filter(isValidAppliance);
  const connectedLoadW = rows.reduce((sum, a) => sum + a.quantity * a.watts, 0);
  const dailyEnergyWh = rows.reduce((sum, a) => sum + a.quantity * a.watts * a.hoursPerDay, 0);
  return {
    connectedLoadW,
    dailyEnergyWh,
    dailyEnergyKwh: dailyEnergyWh / 1000,
    averagePowerW: dailyEnergyWh / 24,
  };
}
