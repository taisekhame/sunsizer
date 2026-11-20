import { describe, it, expect } from "vitest";
import { buildCostLines, calcCost } from "@/lib/calculations/cost";
import { calcSystemDesign } from "@/lib/calculations/engine";
import { DEFAULT_ASSUMPTIONS, DEFAULT_CHOICES, DEMO_APPLIANCES, PRICE_BOOK } from "@/lib/calculations/constants";
import type { Appliance } from "@/lib/calculations/types";

const demoAppliances: Appliance[] = [...DEMO_APPLIANCES];

describe("Cost Module", () => {
  const design = calcSystemDesign(demoAppliances, DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS)!;

  describe("buildCostLines  - demo", () => {
    const lines = buildCostLines(design, DEFAULT_CHOICES, PRICE_BOOK);

    it("produces 7 lines", () => {
      expect(lines).toHaveLength(7);
    });
    it("inverter line has 3.5 kVA at ₦1,200,000", () => {
      const inv = lines.find((l) => l.id === "inverter");
      expect(inv?.unitPrice).toBe(1_200_000);
      expect(inv?.quantity).toBe(1);
    });
    it("battery line has 1 lithium at ₦1,500,000", () => {
      const bat = lines.find((l) => l.id === "battery");
      expect(bat?.unitPrice).toBe(1_500_000);
      expect(bat?.quantity).toBe(1);
    });
    it("panels line has 5 at ₦180,000", () => {
      const pan = lines.find((l) => l.id === "panels");
      expect(pan?.unitPrice).toBe(180_000);
      expect(pan?.quantity).toBe(5);
    });
  });

  describe("buildCostLines  - with overrides", () => {
    const lines = buildCostLines(design, DEFAULT_CHOICES, PRICE_BOOK, { inverter: 999_000 });
    it("override applies to specified line", () => {
      const inv = lines.find((l) => l.id === "inverter");
      expect(inv?.unitPrice).toBe(999_000);
    });
    it("other lines unaffected", () => {
      const bat = lines.find((l) => l.id === "battery");
      expect(bat?.unitPrice).toBe(1_500_000);
    });
  });

  describe("calcCost  - demo at 15% markup", () => {
    const lines = buildCostLines(design, DEFAULT_CHOICES, PRICE_BOOK);
    const cost = calcCost(lines, 0.15);

    it("subtotal = ₦4,450,000", () => {
      expect(cost.subtotal).toBe(4_450_000);
    });
    it("markup amount = ₦667,500", () => {
      expect(cost.markupAmount).toBe(667_500);
    });
    it("grand total = ₦5,117,500", () => {
      expect(cost.grandTotal).toBe(5_117_500);
    });
    it("markup rate = 0.15", () => {
      expect(cost.markupRate).toBe(0.15);
    });
    it("line totals are correct", () => {
      cost.lines.forEach((l) => {
        expect(l.lineTotal).toBe(l.quantity * l.unitPrice);
      });
    });
  });

  describe("calcCost  - zero markup", () => {
    const lines = buildCostLines(design, DEFAULT_CHOICES, PRICE_BOOK);
    const cost = calcCost(lines, 0);

    it("markup amount = 0", () => {
      expect(cost.markupAmount).toBe(0);
    });
    it("grand total equals subtotal", () => {
      expect(cost.grandTotal).toBe(cost.subtotal);
    });
  });

  describe("calcCost  - negative markup treated as 0", () => {
    const lines = buildCostLines(design, DEFAULT_CHOICES, PRICE_BOOK);
    const cost = calcCost(lines, -0.1);
    it("markup = 0", () => {
      expect(cost.markupAmount).toBe(0);
      expect(cost.grandTotal).toBe(cost.subtotal);
    });
  });
});
