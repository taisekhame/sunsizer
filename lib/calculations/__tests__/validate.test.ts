import { describe, it, expect } from "vitest";
import { validateInputs, hasErrors, validateDesign } from "@/lib/calculations/validate";
import { calcSystemDesign } from "@/lib/calculations/engine";
import { DEFAULT_ASSUMPTIONS, DEFAULT_CHOICES, DEMO_APPLIANCES } from "@/lib/calculations/constants";
import type { Appliance, Assumptions, DesignChoices } from "@/lib/calculations/types";

const demoAppliances: Appliance[] = [...DEMO_APPLIANCES];

describe("Validation", () => {
  describe("validateInputs  - valid demo inputs", () => {
    const issues = validateInputs(demoAppliances, DEFAULT_ASSUMPTIONS, DEFAULT_CHOICES);
    it("no errors for demo data", () => {
      expect(hasErrors(issues)).toBe(false);
    });
  });

  describe("validateInputs  - empty appliances", () => {
    const issues = validateInputs([], DEFAULT_ASSUMPTIONS, DEFAULT_CHOICES);
    it("error: at least one appliance", () => {
      expect(hasErrors(issues)).toBe(true);
      expect(issues.some((i) => i.message.includes("at least one appliance"))).toBe(true);
    });
  });

  describe("validateInputs  - appliance with zero watts", () => {
    const badApps: Appliance[] = [
      { id: "1", preset: "X", name: "Bad", quantity: 1, watts: 0, hoursPerDay: 5 },
    ];
    const issues = validateInputs(badApps, DEFAULT_ASSUMPTIONS, DEFAULT_CHOICES);
    it("error: watts must be > 0", () => {
      expect(hasErrors(issues)).toBe(true);
      expect(issues.some((i) => i.message.includes("watts must be greater than zero"))).toBe(true);
    });
  });

  describe("validateInputs  - hours > 24 is warning not error", () => {
    const apps: Appliance[] = [
      { id: "1", preset: "X", name: "MultiShift", quantity: 1, watts: 100, hoursPerDay: 36 },
    ];
    const issues = validateInputs(apps, DEFAULT_ASSUMPTIONS, DEFAULT_CHOICES);
    it("warning present", () => {
      expect(issues.some((i) => i.level === "warning" && i.message.includes("exceeds 24"))).toBe(true);
    });
    it("not an error", () => {
      expect(hasErrors(issues)).toBe(false);
    });
  });

  describe("validateInputs  - bad assumptions", () => {
    const badAssumptions: Assumptions = {
      ...DEFAULT_ASSUMPTIONS,
      performanceRatio: 1.5,
    };
    const issues = validateInputs(demoAppliances, badAssumptions, DEFAULT_CHOICES);
    it("error: PR > 1", () => {
      expect(hasErrors(issues)).toBe(true);
      expect(issues.some((i) => i.message.includes("Performance ratio cannot be more than 1"))).toBe(true);
    });
  });

  describe("validateInputs  - zero backup hours", () => {
    const badChoices: DesignChoices = { ...DEFAULT_CHOICES, backupHours: 0 };
    const issues = validateInputs(demoAppliances, DEFAULT_ASSUMPTIONS, badChoices);
    it("error: backup hours > 0", () => {
      expect(hasErrors(issues)).toBe(true);
    });
  });

  describe("validateDesign  - demo has no warnings", () => {
    const design = calcSystemDesign(demoAppliances, DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS)!;
    const issues = validateDesign(design);
    it("no design warnings for demo", () => {
      expect(issues).toHaveLength(0);
    });
  });

  describe("hasErrors", () => {
    it("returns false for empty array", () => {
      expect(hasErrors([])).toBe(false);
    });
    it("returns false for warnings only", () => {
      expect(hasErrors([{ level: "warning", message: "test" }])).toBe(false);
    });
    it("returns true when errors present", () => {
      expect(hasErrors([{ level: "error", message: "test" }])).toBe(true);
    });
  });
});
