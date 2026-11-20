// =============================================================================
// Solar PV Calculation Engine  - Cost Module
// Formulae from the PDFs [G1 §12, G2 13.1–13.3].
// =============================================================================

import type { CostLine, CostSummary, DesignChoices, PriceBook, SystemDesign } from "./types";

/**
 * Turns a sized system into itemised cost lines using a price book.
 * `overrides` lets the user edit any unit price by line id.
 */
export function buildCostLines(
  design: SystemDesign,
  choices: DesignChoices,
  prices: PriceBook,
  overrides: Record<string, number> = {},
): Omit<CostLine, "lineTotal">[] {
  const isLithium = choices.batteryType === "lithium";
  const batteryUnitPrice = isLithium ? prices.lithiumBattery : prices.tubularBattery;
  const base: Omit<CostLine, "lineTotal">[] = [
    {
      id: "inverter",
      description: `${design.inverter.recommendedKva} kVA hybrid inverter`,
      quantity: 1,
      unit: "pc",
      unitPrice: prices.inverterByKva[design.inverter.recommendedKva] ?? 0,
    },
    {
      id: "battery",
      description: isLithium
        ? "Lithium LiFePO4 battery 51.2V 100Ah (5.12 kWh)"
        : "Tubular lead-acid battery 12V 220Ah",
      quantity: design.battery.numberOfBatteries,
      unit: "pc",
      unitPrice: batteryUnitPrice,
    },
    {
      id: "panels",
      description: `${choices.panelWatts} W solar panel`,
      quantity: design.pv.numberOfPanels,
      unit: "pc",
      unitPrice: prices.panelByWatts[choices.panelWatts] ?? 0,
    },
    { id: "dc", description: "DC protection (set)", quantity: 1, unit: "set", unitPrice: prices.dcProtectionSet },
    { id: "cables", description: "Cables (set)", quantity: 1, unit: "set", unitPrice: prices.cablesSet },
    { id: "mounting", description: "Mounting materials (set)", quantity: 1, unit: "set", unitPrice: prices.mountingSet },
    { id: "labour", description: "Installation labour", quantity: 1, unit: "job", unitPrice: prices.installationLabour },
  ];
  return base.map((l) => {
    const o = overrides[l.id];
    return o !== undefined && Number.isFinite(o) && o >= 0 ? { ...l, unitPrice: o } : l;
  });
}

/**
 * Formula 17 [G1 §12, G2 13.1]  Line total = Quantity × Unit price
 *                               Cost base   = Σ line totals
 * Formula 18 [G1 §12, G2 13.3]  Selling price = Cost × (1 + Markup rate)
 */
export function calcCost(lines: Omit<CostLine, "lineTotal">[], markupRate: number): CostSummary {
  const full: CostLine[] = lines.map((l) => ({ ...l, lineTotal: l.quantity * l.unitPrice }));
  const subtotal = full.reduce((s, l) => s + l.lineTotal, 0);
  const rate = Number.isFinite(markupRate) && markupRate > 0 ? markupRate : 0;
  const markupAmount = subtotal * rate;
  return { lines: full, subtotal, markupRate: rate, markupAmount, grandTotal: subtotal + markupAmount };
}
