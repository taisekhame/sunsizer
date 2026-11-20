import { describe, it, expect } from "vitest";
import { calcInverter, roundUpToStandardKva } from "@/lib/calculations/inverter";
import { DEFAULT_ASSUMPTIONS, DEMO_APPLIANCES, STANDARD_INVERTER_KVA } from "@/lib/calculations/constants";
import { calcLoadAudit } from "@/lib/calculations/load";
import type { Appliance } from "@/lib/calculations/types";

const demoAppliances: Appliance[] = [...DEMO_APPLIANCES];

describe("Inverter Sizing", () => {
  describe("roundUpToStandardKva", () => {
    it("rounds 2.9219 up to 3.5 kVA", () => {
      const { size, exceeds } = roundUpToStandardKva(2.9219);
      expect(size).toBe(3.5);
      expect(exceeds).toBe(false);
    });
    it("rounds 1.0 up to 1.5 kVA", () => {
      expect(roundUpToStandardKva(1.0).size).toBe(1.5);
    });
    it("returns exact match for 5.0 kVA", () => {
      expect(roundUpToStandardKva(5.0).size).toBe(5);
    });
    it("flags exceeds for > 30 kVA", () => {
      const { size, exceeds } = roundUpToStandardKva(35);
      expect(size).toBe(30);
      expect(exceeds).toBe(true);
    });
    it("handles all standard sizes correctly", () => {
      STANDARD_INVERTER_KVA.forEach((kva) => {
        const { size } = roundUpToStandardKva(kva);
        expect(size).toBe(kva);
      });
    });
  });

  describe("calcInverter  - demo example", () => {
    const load = calcLoadAudit(demoAppliances);
    const result = calcInverter(load, DEFAULT_ASSUMPTIONS);

    it("required kW = 2.3375", () => {
      expect(result.requiredKw).toBeCloseTo(2.3375, 4);
    });
    it("required kVA = 2.9219", () => {
      expect(result.requiredKva).toBeCloseTo(2.9219, 3);
    });
    it("recommended kVA = 3.5", () => {
      expect(result.recommendedKva).toBe(3.5);
    });
    it("recommended kW = 2.8", () => {
      expect(result.recommendedKw).toBeCloseTo(2.8, 1);
    });
    it("does not exceed largest size", () => {
      expect(result.exceedsLargestSize).toBe(false);
    });
  });

  describe("calcInverter  - 6 kVA scale", () => {
    // 6 kVA system: connected load ~3840 W → 4.8 kW → 6.0 kVA → 6 kVA
    const appliances: Appliance[] = [
      { id: "1", preset: "AC", name: "AC", quantity: 2, watts: 1500, hoursPerDay: 8 },
      { id: "2", preset: "Fan", name: "Fan", quantity: 4, watts: 75, hoursPerDay: 10 },
      { id: "3", preset: "Bulb", name: "Bulb", quantity: 10, watts: 15, hoursPerDay: 6 },
      { id: "4", preset: "Fridge", name: "Fridge", quantity: 1, watts: 250, hoursPerDay: 10 },
    ];
    const load = calcLoadAudit(appliances);
    const result = calcInverter(load, DEFAULT_ASSUMPTIONS);

    it("connected load = 3,700 W", () => {
      expect(load.connectedLoadW).toBe(3700);
    });
    it("required kW = 4.625", () => {
      expect(result.requiredKw).toBeCloseTo(4.625, 3);
    });
    it("recommended kVA = 6", () => {
      expect(result.recommendedKva).toBe(6);
    });
  });

  describe("calcInverter  - 10 kVA scale", () => {
    // Load ~6000 W → 7.5 kW → 9.375 kVA → 10 kVA
    const appliances: Appliance[] = [
      { id: "1", preset: "AC", name: "AC", quantity: 3, watts: 1500, hoursPerDay: 8 },
      { id: "2", preset: "Fridge", name: "Fridge", quantity: 2, watts: 250, hoursPerDay: 10 },
      { id: "3", preset: "Pump", name: "Pump", quantity: 1, watts: 750, hoursPerDay: 2 },
      { id: "4", preset: "Bulb", name: "Bulb", quantity: 20, watts: 15, hoursPerDay: 6 },
    ];
    const load = calcLoadAudit(appliances);
    const result = calcInverter(load, DEFAULT_ASSUMPTIONS);

    it("connected load = 6,050 W", () => {
      expect(load.connectedLoadW).toBe(6050);
    });
    it("recommended kVA = 10", () => {
      expect(result.recommendedKva).toBe(10);
    });
  });
});
