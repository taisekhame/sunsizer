import { describe, it, expect } from "vitest";
import { calcPv } from "@/lib/calculations/pv";
import { calcLoadAudit } from "@/lib/calculations/load";
import { DEFAULT_ASSUMPTIONS, DEFAULT_CHOICES, DEMO_APPLIANCES } from "@/lib/calculations/constants";
import type { Appliance } from "@/lib/calculations/types";

const demoAppliances: Appliance[] = [...DEMO_APPLIANCES];

describe("PV Array Sizing", () => {
  describe("calcPv  - demo example (620W panels)", () => {
    const load = calcLoadAudit(demoAppliances);
    const result = calcPv(load, DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS);

    it("required kWp ≈ 2.5707", () => {
      expect(result.requiredKwp).toBeCloseTo(2.5707, 3);
    });
    it("5 panels", () => {
      expect(result.numberOfPanels).toBe(5);
    });
    it("installed kWp = 3.1", () => {
      expect(result.installedKwp).toBe(3.1);
    });
    it("installed watts = 3100", () => {
      expect(result.installedWatts).toBe(3100);
    });
  });

  describe("calcPv  - demo example with 550W panels", () => {
    const load = calcLoadAudit(demoAppliances);
    const choices550 = { ...DEFAULT_CHOICES, panelWatts: 550 };
    const result = calcPv(load, choices550, DEFAULT_ASSUMPTIONS);

    it("required kWp is the same", () => {
      expect(result.requiredKwp).toBeCloseTo(2.5707, 3);
    });
    it("5 panels at 550W (ceil(2570.67/550) = 5)", () => {
      expect(result.numberOfPanels).toBe(5);
    });
    it("installed kWp = 2.75", () => {
      expect(result.installedKwp).toBe(2.75);
    });
  });

  describe("calcPv  - large system", () => {
    // 15 kVA scale: ~30 kWh/day
    const appliances: Appliance[] = [
      { id: "1", preset: "AC", name: "AC", quantity: 5, watts: 1500, hoursPerDay: 8 },
      { id: "2", preset: "Fridge", name: "Fridge", quantity: 3, watts: 250, hoursPerDay: 10 },
      { id: "3", preset: "Pump", name: "Pump", quantity: 2, watts: 750, hoursPerDay: 4 },
    ];
    const load = calcLoadAudit(appliances);
    const result = calcPv(load, { backupHours: 8, batteryType: "lithium", panelWatts: 620 }, DEFAULT_ASSUMPTIONS);

    it("daily energy is high", () => {
      expect(load.dailyEnergyKwh).toBeGreaterThan(20);
    });
    it("computes required kWp correctly", () => {
      const expected = load.dailyEnergyKwh / (5 * 0.75);
      expect(result.requiredKwp).toBeCloseTo(expected, 4);
    });
    it("panel count rounds up correctly", () => {
      const expectedPanels = Math.ceil(result.requiredKwp * 1000 / 620);
      expect(result.numberOfPanels).toBe(expectedPanels);
    });
  });

  describe("calcPv  - minimum 1 panel", () => {
    const load = calcLoadAudit([
      { id: "1", preset: "Bulb", name: "Bulb", quantity: 1, watts: 5, hoursPerDay: 1 },
    ]);
    const result = calcPv(load, DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS);
    it("at least 1 panel", () => {
      expect(result.numberOfPanels).toBeGreaterThanOrEqual(1);
    });
  });
});
