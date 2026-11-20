// =============================================================================
// Solar PV Calculation Engine  - MPPT Charge Current
// Formula from the PDFs [G1 §8, G2 Part 7].
// =============================================================================

import type { PvResult } from "./types";
import { MPPT_EFFICIENCY } from "./constants";

/**
 * Formula 13 [G1 §8, G2 Part 7]
 *   I_charge (A) ≈ (P_PV,installed × η_MPPT) ÷ V_system   (η_MPPT = 0.98)
 */
export function calcMpptCurrent(pv: PvResult, systemVoltage: number): number {
  return (pv.installedWatts * MPPT_EFFICIENCY) / systemVoltage;
}
