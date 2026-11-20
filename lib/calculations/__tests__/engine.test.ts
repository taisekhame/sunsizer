import { describe, it, expect } from "vitest";
import { calcSystemDesign, runDesign } from "@/lib/calculations/engine";
import { DEFAULT_ASSUMPTIONS, DEFAULT_CHOICES, DEMO_APPLIANCES, FORMULA_VERSION } from "@/lib/calculations/constants";
import type { Appliance, DesignChoices } from "@/lib/calculations/types";

const demoAppliances: Appliance[] = [...DEMO_APPLIANCES];

describe("Engine  - calcSystemDesign", () => {
  describe("demo example  - lithium", () => {
    const design = calcSystemDesign(demoAppliances, DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS)!;

    it("is not null", () => {
      expect(design).not.toBeNull();
    });
    it("load connected = 1870 W", () => {
      expect(design.load.connectedLoadW).toBe(1870);
    });
    it("inverter recommended = 3.5 kVA", () => {
      expect(design.inverter.recommendedKva).toBe(3.5);
    });
    it("battery count = 1", () => {
      expect(design.battery.numberOfBatteries).toBe(1);
    });
    it("panels = 5", () => {
      expect(design.pv.numberOfPanels).toBe(5);
    });
    it("backup ≈ 9.01h", () => {
      expect(design.backupTimeHours).toBeCloseTo(9.01, 1);
    });
    it("MPPT ≈ 126.58A", () => {
      expect(design.mpptChargingCurrentA).toBeCloseTo(126.58, 0);
    });
  });

  describe("demo example  - tubular", () => {
    const tubularChoices: DesignChoices = { ...DEFAULT_CHOICES, batteryType: "tubular" };
    const design = calcSystemDesign(demoAppliances, tubularChoices, DEFAULT_ASSUMPTIONS)!;

    it("battery count = 4", () => {
      expect(design.battery.numberOfBatteries).toBe(4);
    });
    it("series = 2, parallel = 2", () => {
      expect(design.battery.seriesCount).toBe(2);
      expect(design.battery.parallelCount).toBe(2);
    });
  });

  describe("returns null for empty appliances", () => {
    it("returns null", () => {
      expect(calcSystemDesign([], DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS)).toBeNull();
    });
  });

  describe("returns null for all-zero appliances", () => {
    it("returns null", () => {
      const apps: Appliance[] = [
        { id: "1", preset: "X", name: "X", quantity: 0, watts: 0, hoursPerDay: 0 },
      ];
      expect(calcSystemDesign(apps, DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS)).toBeNull();
    });
  });
});

describe("Engine  - runDesign", () => {
  it("returns design result with formula version", () => {
    const result = runDesign(demoAppliances, DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS);
    expect(result).not.toBeNull();
    expect(result!.formulaVersion).toBe(FORMULA_VERSION);
    expect(result!.assumptions).toEqual(DEFAULT_ASSUMPTIONS);
    expect(result!.choices).toEqual(DEFAULT_CHOICES);
  });

  it("returns null for empty appliances", () => {
    expect(runDesign([], DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS)).toBeNull();
  });
});

describe("Multi-scale system sizing", () => {
  it("6 kVA system", () => {
    const apps: Appliance[] = [
      { id: "1", preset: "AC", name: "AC", quantity: 2, watts: 1500, hoursPerDay: 8 },
      { id: "2", preset: "Fan", name: "Fan", quantity: 4, watts: 75, hoursPerDay: 10 },
      { id: "3", preset: "Bulb", name: "Bulb", quantity: 10, watts: 15, hoursPerDay: 6 },
      { id: "4", preset: "Fridge", name: "Fridge", quantity: 1, watts: 250, hoursPerDay: 10 },
    ];
    const design = calcSystemDesign(apps, DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS)!;
    expect(design).not.toBeNull();
    expect(design.inverter.recommendedKva).toBe(6);
    expect(design.battery.systemVoltage).toBe(48);
  });

  it("10 kVA system", () => {
    const apps: Appliance[] = [
      { id: "1", preset: "AC", name: "AC", quantity: 3, watts: 1500, hoursPerDay: 8 },
      { id: "2", preset: "Fridge", name: "Fridge", quantity: 2, watts: 250, hoursPerDay: 10 },
      { id: "3", preset: "Pump", name: "Pump", quantity: 1, watts: 750, hoursPerDay: 2 },
      { id: "4", preset: "Bulb", name: "Bulb", quantity: 20, watts: 15, hoursPerDay: 6 },
    ];
    const design = calcSystemDesign(apps, DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS)!;
    expect(design).not.toBeNull();
    expect(design.inverter.recommendedKva).toBe(10);
    expect(design.battery.systemVoltage).toBe(48);
  });

  it("15 kVA system", () => {
    const apps: Appliance[] = [
      { id: "1", preset: "AC", name: "AC", quantity: 5, watts: 1500, hoursPerDay: 8 },
      { id: "2", preset: "Fridge", name: "Fridge", quantity: 3, watts: 250, hoursPerDay: 10 },
      { id: "3", preset: "Pump", name: "Pump", quantity: 2, watts: 750, hoursPerDay: 4 },
      { id: "4", preset: "Freezer", name: "Freezer", quantity: 2, watts: 200, hoursPerDay: 10 },
    ];
    const design = calcSystemDesign(apps, DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS)!;
    expect(design).not.toBeNull();
    expect(design.inverter.recommendedKva).toBe(20);
  });

  it("30 kVA system", () => {
    const apps: Appliance[] = [
      { id: "1", preset: "AC", name: "AC", quantity: 10, watts: 1500, hoursPerDay: 10 },
      { id: "2", preset: "Pump", name: "Pump", quantity: 3, watts: 750, hoursPerDay: 6 },
      { id: "3", preset: "Freezer", name: "Freezer", quantity: 5, watts: 200, hoursPerDay: 10 },
    ];
    const design = calcSystemDesign(apps, DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS)!;
    expect(design).not.toBeNull();
    expect(design.inverter.recommendedKva).toBe(30);
  });
});
