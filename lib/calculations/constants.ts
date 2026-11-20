// =============================================================================
// Solar PV Calculation Engine  - Constants
// Engineering defaults from the two PDFs.
// =============================================================================

import type { Assumptions, BatteryType, DesignChoices } from "./types";

/** Formula version identifier  - stored with every design for traceability. */
export const FORMULA_VERSION = "v1.0.0";

/** Standard inverter sizes in kVA. */
export const STANDARD_INVERTER_KVA = [1.5, 2.5, 3.5, 5, 6, 7.5, 10, 15, 20, 30] as const;

/** Depth of discharge by chemistry [G1 §5 table]. */
export const DOD: Record<BatteryType, number> = { lithium: 0.8, tubular: 0.5 };

/** One lithium unit: 51.2 V × 100 Ah = 5.12 kWh [G1 §4 Formula 7]. */
export const LITHIUM_UNIT = { voltage: 51.2, ah: 100, kwh: 5.12 } as const;

/** One tubular lead-acid unit: 12 V × 220 Ah [G1 §5]. */
export const TUBULAR_UNIT = { voltage: 12, ah: 220 } as const;

/** MPPT conversion efficiency [G1 §8 Formula 13]. */
export const MPPT_EFFICIENCY = 0.98;

/** Systems with inverter ≤ 3.5 kVA use 24 V; larger use 48 V. */
export const SMALL_SYSTEM_MAX_KVA = 3.5;

/** Engineering defaults from the PDFs. */
export const DEFAULT_ASSUMPTIONS: Assumptions = {
  peakSunHours: 5,
  performanceRatio: 0.75,
  powerFactor: 0.8,
  designMargin: 1.25,
  inverterEfficiency: 0.93,
  batteryEfficiency: 0.95,
};

/** Default design choices. */
export const DEFAULT_CHOICES: DesignChoices = {
  backupHours: 8,
  batteryType: "lithium",
  panelWatts: 620,
};

/** Backup hours options. */
export const BACKUP_HOUR_OPTIONS = [4, 6, 8, 10, 12, 24] as const;

/** Panel wattage options. */
export const PANEL_WATT_OPTIONS = [550, 620] as const;

/** Default markup percentage. */
export const DEFAULT_MARKUP_PERCENT = 15;

/** Appliance presets: selecting one pre-fills typical watts/hours (still editable). */
export const APPLIANCE_PRESETS: { name: string; watts: number; hours: number }[] = [
  { name: "Television", watts: 120, hours: 6 },
  { name: "Refrigerator", watts: 250, hours: 10 },
  { name: "Ceiling Fan", watts: 75, hours: 8 },
  { name: "Bulbs", watts: 15, hours: 6 },
  { name: "Laptop", watts: 90, hours: 5 },
  { name: "Water Pump", watts: 750, hours: 2 },
  { name: "Air Conditioner", watts: 1500, hours: 8 },
  { name: "Freezer", watts: 200, hours: 10 },
];

/** Demo load from the guides: 1,870 W connected, 9,640 Wh = 9.64 kWh/day. */
export const DEMO_APPLIANCES = [
  { id: "demo-tv", preset: "Television", name: "Television", quantity: 2, watts: 120, hoursPerDay: 6 },
  { id: "demo-fridge", preset: "Refrigerator", name: "Refrigerator", quantity: 1, watts: 250, hoursPerDay: 10 },
  { id: "demo-fan", preset: "Ceiling Fan", name: "Ceiling Fan", quantity: 4, watts: 75, hoursPerDay: 8 },
  { id: "demo-bulbs", preset: "Bulbs", name: "Bulbs", quantity: 10, watts: 15, hoursPerDay: 6 },
  { id: "demo-laptop", preset: "Laptop", name: "Laptop", quantity: 2, watts: 90, hoursPerDay: 5 },
  { id: "demo-pump", preset: "Water Pump", name: "Water Pump", quantity: 1, watts: 750, hoursPerDay: 2 },
] as const;

/**
 * DEMO PLACEHOLDER PRICES (NGN)  - not verified market prices.
 * From the guides: 10 kVA inverter 2,500,000 · lithium battery 1,500,000 ·
 * 620 W panel 180,000 · DC protection 150,000 · cables 200,000 ·
 * mounting 250,000 · installation labour 250,000.
 * Other sizes are invented placeholders.
 */
export const PRICE_BOOK = {
  inverterByKva: {
    1.5: 650_000,
    2.5: 900_000,
    3.5: 1_200_000,
    5: 1_500_000,
    6: 1_800_000,
    7.5: 2_100_000,
    10: 2_500_000,
    15: 3_800_000,
    20: 5_000_000,
    30: 7_500_000,
  } as Record<number, number>,
  lithiumBattery: 1_500_000,
  tubularBattery: 320_000,
  panelByWatts: {
    550: 160_000,
    620: 180_000,
  } as Record<number, number>,
  dcProtectionSet: 150_000,
  cablesSet: 200_000,
  mountingSet: 250_000,
  installationLabour: 250_000,
};
