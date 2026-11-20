import { describe, it, expect } from "vitest";
import { calcBattery, calcBackupTime, systemVoltageFor } from "@/lib/calculations/battery";
import { calcLoadAudit } from "@/lib/calculations/load";
import { calcInverter } from "@/lib/calculations/inverter";
import { DEFAULT_ASSUMPTIONS, DEFAULT_CHOICES, DEMO_APPLIANCES } from "@/lib/calculations/constants";
import type { Appliance, DesignChoices } from "@/lib/calculations/types";

const demoAppliances: Appliance[] = [...DEMO_APPLIANCES];

describe("Battery Sizing", () => {
  describe("systemVoltageFor", () => {
    it("returns 24V for ≤ 3.5 kVA", () => {
      expect(systemVoltageFor(1.5)).toBe(24);
      expect(systemVoltageFor(2.5)).toBe(24);
      expect(systemVoltageFor(3.5)).toBe(24);
    });
    it("returns 48V for > 3.5 kVA", () => {
      expect(systemVoltageFor(5)).toBe(48);
      expect(systemVoltageFor(10)).toBe(48);
      expect(systemVoltageFor(30)).toBe(48);
    });
  });

  describe("calcBattery  - demo lithium", () => {
    const load = calcLoadAudit(demoAppliances);
    const inverter = calcInverter(load, DEFAULT_ASSUMPTIONS);
    const result = calcBattery(load, inverter, DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS);

    it("DoD = 0.80 for lithium", () => {
      expect(result.dod).toBe(0.8);
    });
    it("system voltage = 24V", () => {
      expect(result.systemVoltage).toBe(24);
    });
    it("required kWh ≈ 4.546", () => {
      expect(result.requiredKwh).toBeCloseTo(4.546, 2);
    });
    it("1 lithium battery", () => {
      expect(result.numberOfBatteries).toBe(1);
    });
    it("installed kWh = 5.12", () => {
      expect(result.installedKwh).toBe(5.12);
    });
    it("series = 1 for lithium", () => {
      expect(result.seriesCount).toBe(1);
    });
  });

  describe("calcBattery  - demo tubular", () => {
    const load = calcLoadAudit(demoAppliances);
    const inverter = calcInverter(load, DEFAULT_ASSUMPTIONS);
    const tubularChoices: DesignChoices = { ...DEFAULT_CHOICES, batteryType: "tubular" };
    const result = calcBattery(load, inverter, tubularChoices, DEFAULT_ASSUMPTIONS);

    it("DoD = 0.50 for tubular", () => {
      expect(result.dod).toBe(0.5);
    });
    it("required kWh ≈ 7.274", () => {
      expect(result.requiredKwh).toBeCloseTo(7.274, 2);
    });
    it("series = 2 (24V / 12V)", () => {
      expect(result.seriesCount).toBe(2);
    });
    it("parallel = 2", () => {
      expect(result.parallelCount).toBe(2);
    });
    it("total = 4 batteries", () => {
      expect(result.numberOfBatteries).toBe(4);
    });
  });

  describe("calcBackupTime  - demo lithium", () => {
    const load = calcLoadAudit(demoAppliances);
    const inverter = calcInverter(load, DEFAULT_ASSUMPTIONS);
    const battery = calcBattery(load, inverter, DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS);
    const backupTime = calcBackupTime(battery, load, DEFAULT_ASSUMPTIONS);

    it("backup time ≈ 9.01 hours", () => {
      expect(backupTime).toBeCloseTo(9.01, 1);
    });
  });

  describe("calcBackupTime  - zero load returns 0", () => {
    const load = calcLoadAudit([]);
    it("returns 0 for empty load", () => {
      const battery = {
        dod: 0.8, requiredWh: 0, requiredKwh: 0, systemVoltage: 24,
        requiredAh: 0, numberOfBatteries: 1, seriesCount: 1, parallelCount: 1,
        installedWh: 5120, installedKwh: 5.12, description: "test",
      };
      expect(calcBackupTime(battery, load, DEFAULT_ASSUMPTIONS)).toBe(0);
    });
  });

  describe("calcBattery  - larger 48V system", () => {
    // 5 kVA system → 48V
    const appliances: Appliance[] = [
      { id: "1", preset: "AC", name: "AC", quantity: 2, watts: 1500, hoursPerDay: 8 },
      { id: "2", preset: "Fridge", name: "Fridge", quantity: 1, watts: 250, hoursPerDay: 10 },
      { id: "3", preset: "Fan", name: "Fan", quantity: 4, watts: 75, hoursPerDay: 8 },
      { id: "4", preset: "Bulb", name: "Bulb", quantity: 10, watts: 15, hoursPerDay: 6 },
    ];
    const load = calcLoadAudit(appliances);
    const inverter = calcInverter(load, DEFAULT_ASSUMPTIONS);
    const tubularChoices: DesignChoices = { backupHours: 8, batteryType: "tubular", panelWatts: 620 };
    const result = calcBattery(load, inverter, tubularChoices, DEFAULT_ASSUMPTIONS);

    it("system voltage = 48V for 5 kVA", () => {
      expect(inverter.recommendedKva).toBeGreaterThan(3.5);
      expect(result.systemVoltage).toBe(48);
    });
    it("tubular series = 4 for 48V", () => {
      expect(result.seriesCount).toBe(4);
    });
  });
});
