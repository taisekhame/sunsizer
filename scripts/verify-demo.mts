// Quick sanity check of the engine against the guides' demo example.
// Run with: npm run verify   (Node 22+, tsx runner)

import { DEFAULT_ASSUMPTIONS, DEFAULT_CHOICES, PRICE_BOOK, DEMO_APPLIANCES } from "../lib/calculations/constants.ts";
import { calcLoadAudit } from "../lib/calculations/load.ts";
import { calcSystemDesign } from "../lib/calculations/engine.ts";
import { buildCostLines, calcCost } from "../lib/calculations/cost.ts";
import type { Appliance } from "../lib/calculations/types.ts";

const appliances: Appliance[] = [...DEMO_APPLIANCES];

let failed = 0;
function check(label: string, actual: number, expected: number, tol = 0.005) {
  const ok = Math.abs(actual - expected) <= tol;
  if (!ok) failed++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}: ${actual} (expected ${expected})`);
}

console.log("=== SunSizer Verify Script ===\n");
console.log("--- Load Audit ---");
const load = calcLoadAudit(appliances);
check("Connected load (W)", load.connectedLoadW, 1870, 0);
check("Daily energy (Wh)", load.dailyEnergyWh, 9640, 0);
check("Daily energy (kWh)", load.dailyEnergyKwh, 9.64, 0);
check("Average power (W)", load.averagePowerW, 401.67, 0.01);

console.log("\n--- Lithium Design ---");
const lithium = calcSystemDesign(appliances, DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS)!;
check("Inverter required kW", lithium.inverter.requiredKw, 2.3375, 0.0001);
check("Inverter required kVA", lithium.inverter.requiredKva, 2.9219, 0.0001);
check("Inverter recommended kVA", lithium.inverter.recommendedKva, 3.5, 0);
check("System voltage (V)", lithium.battery.systemVoltage, 24, 0);
check("Lithium required kWh", lithium.battery.requiredKwh, 4.546, 0.001);
check("Lithium batteries", lithium.battery.numberOfBatteries, 1, 0);
check("PV required kWp", lithium.pv.requiredKwp, 2.5707, 0.0001);
check("Panels (620 W)", lithium.pv.numberOfPanels, 5, 0);
check("Installed kWp", lithium.pv.installedKwp, 3.1, 0);
check("Backup time, lithium (h)", lithium.backupTimeHours, 9.01, 0.01);
check("MPPT current (A)", lithium.mpptChargingCurrentA, 126.58, 0.01);

console.log("\n--- Tubular Design ---");
const tubular = calcSystemDesign(
  appliances,
  { ...DEFAULT_CHOICES, batteryType: "tubular" },
  DEFAULT_ASSUMPTIONS,
)!;
check("Tubular required kWh", tubular.battery.requiredKwh, 7.274, 0.001);
check("Tubular series", tubular.battery.seriesCount, 2, 0);
check("Tubular parallel", tubular.battery.parallelCount, 2, 0);
check("Tubular batteries", tubular.battery.numberOfBatteries, 4, 0);

console.log("\n--- Cost ---");
const expectedSubtotal =
  1_200_000 + 1_500_000 + 5 * 180_000 + 150_000 + 200_000 + 250_000 + 250_000;
const cost = calcCost(buildCostLines(lithium, DEFAULT_CHOICES, PRICE_BOOK), 0.15);
check("Subtotal (NGN)", cost.subtotal, expectedSubtotal, 0);
check("Markup amount (NGN)", cost.markupAmount, expectedSubtotal * 0.15, 0.5);
check("Grand total (NGN)", cost.grandTotal, expectedSubtotal * 1.15, 0.5);

console.log(
  failed === 0
    ? "\n✅ All checks passed."
    : `\n❌ ${failed} check(s) failed.`,
);
process.exit(failed === 0 ? 0 : 1);
