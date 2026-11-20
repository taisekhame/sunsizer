"use client";

import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { saveProject } from "@/lib/actions/projects";
import { FORMULA_VERSION } from "@/lib/calculations/constants";

import { DEFAULT_ASSUMPTIONS, DEFAULT_CHOICES, PRICE_BOOK, DEFAULT_MARKUP_PERCENT } from "@/lib/calculations/constants";
import { calcLoadAudit } from "@/lib/calculations/load";
import { calcSystemDesign } from "@/lib/calculations/engine";
import { buildCostLines, calcCost } from "@/lib/calculations/cost";
import { validateInputs, hasErrors } from "@/lib/calculations/validate";
import type { Appliance, Assumptions, DesignChoices, SystemDesign, CostSummary } from "@/lib/calculations/types";

import { StepLoadAudit } from "./step-load-audit";
import { StepDesignChoices } from "./step-design-choices";
import { StepResults } from "./step-results";
import { StepCost } from "./step-cost";

const steps = [
  { id: "load-audit", title: "Load Audit" },
  { id: "design-choices", title: "Design Choices" },
  { id: "results", title: "Results" },
  { id: "cost", title: "Cost & Quotation" },
];

const contentVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

export default function QuotationFlow() {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [appliances, setAppliances] = useState<Appliance[]>([]);
  const [choices, setChoices] = useState<DesignChoices>({ ...DEFAULT_CHOICES });
  const [assumptions] = useState<Assumptions>({ ...DEFAULT_ASSUMPTIONS });
  const [markupPercent, setMarkupPercent] = useState(DEFAULT_MARKUP_PERCENT);

  const loadAudit = useMemo(() => calcLoadAudit(appliances), [appliances]);

  const design = useMemo<SystemDesign | null>(() => {
    if (appliances.length === 0 || loadAudit.connectedLoadW <= 0) return null;
    return calcSystemDesign(appliances, choices, assumptions);
  }, [appliances, choices, assumptions, loadAudit]);

  const costSummary = useMemo<CostSummary | null>(() => {
    if (!design) return null;
    const lines = buildCostLines(design, choices, PRICE_BOOK);
    return calcCost(lines, markupPercent / 100);
  }, [design, choices, markupPercent]);

  const issues = useMemo(() => {
    if (appliances.length === 0) return [];
    return validateInputs(appliances, assumptions, choices);
  }, [appliances, assumptions, choices]);

  const isStepValid = useCallback(() => {
    switch (currentStep) {
      case 0:
        return appliances.length > 0 && loadAudit.connectedLoadW > 0 && !hasErrors(issues);
      case 1:
        return choices.backupHours > 0 && choices.panelWatts > 0;
      case 2:
        return design !== null;
      case 3:
        return costSummary !== null;
      default:
        return true;
    }
  }, [currentStep, appliances, loadAudit, issues, choices, design, costSummary]);

  const nextStep = () => {
    if (currentStep < steps.length - 1) setCurrentStep((p) => p + 1);
  };
  const prevStep = () => {
    if (currentStep > 0) setCurrentStep((p) => p - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await saveProject({
        title: `Solar System Design  - ${new Date().toLocaleDateString()}`,
        systemType: "OFF_GRID",
        mode: "BASIC",
        inputs: {
          appliances,
          choices,
          markupPercent,
        },
        assumptions: assumptions as unknown as Record<string, unknown>,
        results: design ? {
          load: design.load,
          inverter: design.inverter,
          battery: design.battery,
          pv: design.pv,
          backupTimeHours: design.backupTimeHours,
          mpptChargingCurrentA: design.mpptChargingCurrentA,
          cost: costSummary,
        } : null,
        formulaVersion: FORMULA_VERSION,
        status: design ? "VALIDATED" : "DRAFT",
        projectId: projectId || undefined,
      });

      if (result.error) {
        toast.error(result.error);
      } else {
        setProjectId(result.id!);
        toast.success("Project saved successfully!");
      }
    } catch {
      toast.error("Failed to save project. Please try again.");
    }
    setIsSubmitting(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 md:py-8">
      {/* Progress indicator */}
      <motion.div
        className="mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              whileHover={{ scale: 1.1 }}
            >
              <motion.div
                className={cn(
                  "w-4 h-4 rounded-full cursor-pointer transition-colors duration-300",
                  index < currentStep
                    ? "bg-accent"
                    : index === currentStep
                      ? "bg-accent ring-4 ring-accent/20"
                      : "bg-muted",
                )}
                onClick={() => {
                  if (index <= currentStep) setCurrentStep(index);
                }}
                whileTap={{ scale: 0.95 }}
              />
              <motion.span
                className={cn(
                  "text-xs mt-1.5 hidden sm:block font-[family-name:var(--font-ui)]",
                  index === currentStep
                    ? "text-foreground font-medium"
                    : "text-muted-foreground",
                )}
              >
                {step.title}
              </motion.span>
            </motion.div>
          ))}
        </div>
        <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-2">
          <motion.div
            className="h-full bg-accent"
            initial={{ width: 0 }}
            animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </motion.div>

      {/* Form card */}
      <Card className="border border-border shadow-sm rounded-2xl overflow-hidden bg-card">
        <div>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              <CardContent className="p-6 md:p-8">
                {currentStep === 0 && (
                  <StepLoadAudit
                    appliances={appliances}
                    setAppliances={setAppliances}
                    loadAudit={loadAudit}
                  />
                )}
                {currentStep === 1 && (
                  <StepDesignChoices
                    choices={choices}
                    setChoices={setChoices}
                    markupPercent={markupPercent}
                    setMarkupPercent={setMarkupPercent}
                  />
                )}
                {currentStep === 2 && (
                  <StepResults design={design} issues={issues} />
                )}
                {currentStep === 3 && (
                  <StepCost costSummary={costSummary} markupPercent={markupPercent} projectId={projectId} />
                )}
              </CardContent>
            </motion.div>
          </AnimatePresence>

          <CardFooter className="flex justify-between pt-4 pb-6 px-6 md:px-8 border-t border-border/50">
            <Button
              type="button"
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center gap-1 rounded-xl"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            <Button
              type="button"
              onClick={currentStep === steps.length - 1 ? handleSubmit : nextStep}
              disabled={!isStepValid() || isSubmitting}
              variant={currentStep === steps.length - 1 ? "accent" : "default"}
              className="flex items-center gap-1 rounded-xl"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                </>
              ) : currentStep === steps.length - 1 ? (
                <>
                  Save Project <Check className="h-4 w-4" />
                </>
              ) : (
                <>
                  Next <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          </CardFooter>
        </div>
      </Card>

      {/* Step indicator */}
      <motion.div
        className="mt-4 text-center text-sm text-muted-foreground font-[family-name:var(--font-ui)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        Step {currentStep + 1} of {steps.length}: {steps[currentStep].title}
      </motion.div>
    </div>
  );
}
