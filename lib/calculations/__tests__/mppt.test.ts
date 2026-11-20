import { describe, it, expect } from "vitest";
import { calcMpptCurrent } from "@/lib/calculations/mppt";
import { calcPv } from "@/lib/calculations/pv";
import { calcLoadAudit } from "@/lib/calculations/load";
import { DEFAULT_ASSUMPTIONS, DEFAULT_CHOICES, DEMO_APPLIANCES, MPPT_EFFICIENCY } from "@/lib/calculations/constants";
import type { Appliance } from "@/lib/calculations/types";

const demoAppliances: Appliance[] = [...DEMO_APPLIANCES];

describe("MPPT Charge Current", () => {
  describe("calcMpptCurrent  - demo example", () => {
    const load = calcLoadAudit(demoAppliances);
    const pv = calcPv(load, DEFAULT_CHOICES, DEFAULT_ASSUMPTIONS);
    const current = calcMpptCurrent(pv, 24);

    it("MPPT current ≈ 126.58 A", () => {
      expect(current).toBeCloseTo(126.58, 1);
    });
    it("follows the formula: (P_installed × 0.98) / V_system", () => {
      const expected = (pv.installedWatts * MPPT_EFFICIENCY) / 24;
      expect(current).toBeCloseTo(expected, 4);
    });
  });

  describe("calcMpptCurrent  - 48V system", () => {
    const pv = { requiredKwp: 5, requiredWatts: 5000, numberOfPanels: 8, installedWatts: 4960, installedKwp: 4.96 };
    const current = calcMpptCurrent(pv, 48);

    it("computes correctly for 48V", () => {
      expect(current).toBeCloseTo((4960 * 0.98) / 48, 1);
    });
  });
});
