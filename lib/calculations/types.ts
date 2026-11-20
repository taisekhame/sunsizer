// =============================================================================
// Solar PV Calculation Engine  - Types
// Pure type definitions: safe to import with `import type` anywhere.
// =============================================================================

export type BatteryType = "lithium" | "tubular";
export type SystemType = "OFF_GRID" | "HYBRID" | "GRID_TIED";
export type DesignMode = "BASIC" | "PROFESSIONAL";

export interface Appliance {
  id: string;
  /** Preset label from the dropdown, or "Custom". */
  preset: string;
  /** Display name (equals preset unless preset is "Custom"). */
  name: string;
  quantity: number;
  /** Rated power of ONE unit in watts. */
  watts: number;
  hoursPerDay: number;
}

export interface Assumptions {
  peakSunHours: number;       // PSH, h/day  - default 5
  performanceRatio: number;   // PR  - default 0.75
  powerFactor: number;        // PF  - default 0.8
  designMargin: number;       // SF applied to connected load  - default 1.25
  inverterEfficiency: number; // η_inv  - default 0.93
  batteryEfficiency: number;  // η_bat  - default 0.95
}

export interface DesignChoices {
  backupHours: number;
  batteryType: BatteryType;
  panelWatts: number;
}

export interface LoadAudit {
  connectedLoadW: number;
  dailyEnergyWh: number;
  dailyEnergyKwh: number;
  averagePowerW: number;
}

export interface InverterResult {
  requiredKw: number;
  requiredKva: number;
  recommendedKva: number;
  recommendedKw: number;
  exceedsLargestSize: boolean;
}

export interface BatteryResult {
  dod: number;
  requiredWh: number;
  requiredKwh: number;
  systemVoltage: number;
  requiredAh: number;
  numberOfBatteries: number;
  seriesCount: number;
  parallelCount: number;
  installedWh: number;
  installedKwh: number;
  description: string;
}

export interface PvResult {
  requiredKwp: number;
  requiredWatts: number;
  numberOfPanels: number;
  installedWatts: number;
  installedKwp: number;
}

export interface SystemDesign {
  load: LoadAudit;
  inverter: InverterResult;
  battery: BatteryResult;
  pv: PvResult;
  backupTimeHours: number;
  mpptChargingCurrentA: number;
}

export interface ValidationIssue {
  level: "error" | "warning";
  message: string;
  value?: number;
  limit?: number;
  fix?: string;
}

export interface PriceBook {
  inverterByKva: Record<number, number>;
  lithiumBattery: number;
  tubularBattery: number;
  panelByWatts: Record<number, number>;
  dcProtectionSet: number;
  cablesSet: number;
  mountingSet: number;
  installationLabour: number;
}

export interface CostLine {
  id: string;
  description: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  lineTotal: number;
}

export interface CostSummary {
  lines: CostLine[];
  subtotal: number;
  markupRate: number;
  markupAmount: number;
  grandTotal: number;
}

export interface DesignResult {
  design: SystemDesign;
  issues: ValidationIssue[];
  assumptions: Assumptions;
  choices: DesignChoices;
  formulaVersion: string;
}
