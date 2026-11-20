// =============================================================================
// Solar PV Calculation Engine  - PV Array Sizing
// Formulae from the PDFs [G1 §6, G2 5.2–5.3].
// =============================================================================

import type { Assumptions, DesignChoices, LoadAudit, PvResult } from "./types";

// Guards float noise.
const ceilSafe = (x: number): number => Math.ceil(Math.round(x * 1e9) / 1e9);

/**
 * Formula 8 [G1 §6, G2 5.2]  P_PV (kWp) = E_daily (kWh/day) ÷ (PSH × PR)
 * Formula 9 [G1 §6, G2 5.3]  N_panels = ceil( P_required (W) ÷ P_panel (W) )
 *                            Installed (W) = N_panels × P_panel
 */
export function calcPv(load: LoadAudit, choices: DesignChoices, a: Assumptions): PvResult {
  const requiredKwp = load.dailyEnergyKwh / (a.peakSunHours * a.performanceRatio);
  const requiredWatts = requiredKwp * 1000;
  const numberOfPanels = Math.max(1, ceilSafe(requiredWatts / choices.panelWatts));
  const installedWatts = numberOfPanels * choices.panelWatts;
  return {
    requiredKwp,
    requiredWatts,
    numberOfPanels,
    installedWatts,
    installedKwp: installedWatts / 1000,
  };
}
