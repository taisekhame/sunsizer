// =============================================================================
// Solar PV Calculation Engine  - Inverter Sizing
// Formulae from the PDFs [G1 §3, G2 2.1–2.3].
// =============================================================================

import type { Assumptions, InverterResult, LoadAudit } from "./types";
import { STANDARD_INVERTER_KVA } from "./constants";

/** Round a kVA requirement UP to the nearest standard size. */
export function roundUpToStandardKva(kva: number): { size: number; exceeds: boolean } {
  const found = STANDARD_INVERTER_KVA.find((s) => s >= kva - 1e-9);
  if (found !== undefined) return { size: found, exceeds: false };
  return { size: STANDARD_INVERTER_KVA[STANDARD_INVERTER_KVA.length - 1], exceeds: true };
}

/**
 * Formula 3 [G1 §3]  P_inv,prelim (kW) = P_connected × SF  (SF = design margin, 1.25)
 *   Basic mode assumes ALL connected loads can run together.
 * Formula 4 [G1 §3]  S (kVA) = P (kW) ÷ PF                 (PF = 0.8)
 * Recommendation     = smallest standard kVA size ≥ S.
 * Recommended kW     = recommended kVA × PF.
 */
export function calcInverter(load: LoadAudit, a: Assumptions): InverterResult {
  const requiredKw = (load.connectedLoadW * a.designMargin) / 1000;
  const requiredKva = requiredKw / a.powerFactor;
  const { size, exceeds } = roundUpToStandardKva(requiredKva);
  return {
    requiredKw,
    requiredKva,
    recommendedKva: size,
    recommendedKw: size * a.powerFactor,
    exceedsLargestSize: exceeds,
  };
}
