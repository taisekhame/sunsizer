import { describe, it, expect } from "vitest";
import { calcLoadAudit, isValidAppliance } from "@/lib/calculations/load";
import { DEMO_APPLIANCES } from "@/lib/calculations/constants";
import type { Appliance } from "@/lib/calculations/types";

const demoAppliances: Appliance[] = [...DEMO_APPLIANCES];

describe("Load Audit", () => {
  describe("isValidAppliance", () => {
    it("returns true for valid appliance", () => {
      expect(isValidAppliance({ id: "1", preset: "TV", name: "TV", quantity: 2, watts: 120, hoursPerDay: 6 })).toBe(true);
    });
    it("returns false for zero quantity", () => {
      expect(isValidAppliance({ id: "1", preset: "TV", name: "TV", quantity: 0, watts: 120, hoursPerDay: 6 })).toBe(false);
    });
    it("returns false for zero watts", () => {
      expect(isValidAppliance({ id: "1", preset: "TV", name: "TV", quantity: 2, watts: 0, hoursPerDay: 6 })).toBe(false);
    });
    it("returns false for zero hours", () => {
      expect(isValidAppliance({ id: "1", preset: "TV", name: "TV", quantity: 2, watts: 120, hoursPerDay: 0 })).toBe(false);
    });
  });

  describe("calcLoadAudit  - demo example", () => {
    const result = calcLoadAudit(demoAppliances);

    it("connected load = 1,870 W", () => {
      expect(result.connectedLoadW).toBe(1870);
    });
    it("daily energy = 9,640 Wh", () => {
      expect(result.dailyEnergyWh).toBe(9640);
    });
    it("daily energy = 9.64 kWh", () => {
      expect(result.dailyEnergyKwh).toBe(9.64);
    });
    it("average power ≈ 401.67 W", () => {
      expect(result.averagePowerW).toBeCloseTo(401.67, 1);
    });
  });

  describe("calcLoadAudit  - empty list", () => {
    const result = calcLoadAudit([]);
    it("returns all zeros", () => {
      expect(result.connectedLoadW).toBe(0);
      expect(result.dailyEnergyWh).toBe(0);
      expect(result.dailyEnergyKwh).toBe(0);
      expect(result.averagePowerW).toBe(0);
    });
  });

  describe("calcLoadAudit  - single appliance", () => {
    const result = calcLoadAudit([
      { id: "1", preset: "TV", name: "TV", quantity: 1, watts: 100, hoursPerDay: 10 },
    ]);
    it("connected load = 100 W", () => {
      expect(result.connectedLoadW).toBe(100);
    });
    it("daily energy = 1,000 Wh", () => {
      expect(result.dailyEnergyWh).toBe(1000);
    });
  });

  describe("calcLoadAudit  - filters invalid rows", () => {
    const result = calcLoadAudit([
      { id: "1", preset: "TV", name: "TV", quantity: 1, watts: 100, hoursPerDay: 10 },
      { id: "2", preset: "X", name: "X", quantity: 0, watts: 50, hoursPerDay: 5 }, // invalid
    ]);
    it("only counts valid rows", () => {
      expect(result.connectedLoadW).toBe(100);
      expect(result.dailyEnergyWh).toBe(1000);
    });
  });
});
