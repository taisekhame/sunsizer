"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GrainGradient } from "@paper-design/shaders-react";

/**
 * Hero section using Paper Shaders' GrainGradient  - adapted from
 * design-references/grain-gradient-hero-section.tsx.
 *
 * Adaptations per SAMPLE CODE RULES:
 * - Gradient recoloured to our palette: #FAFAFA base with gentle #FFD749 warmth
 * - Text over it is BLACK (sample used white  - breaks our rule)
 * - Heading in Varela Round, subtitle in Martel, CTA in Montserrat
 * - Shader positioned absolute INSIDE the hero (sample used fixed/whole page)
 * - CTA: black button with white text + accent button with black text
 */
export function Hero() {
  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      {/* Paper Shaders animated grain-gradient  - absolute inside hero only */}
      <GrainGradient
        colorBack="#FAFAFA"
        colors={["#FFD749", "#FFF3C4", "#FAFAFA", "#F5E6A3"]}
        softness={0.7}
        intensity={0.3}
        noise={0.2}
        speed={0.4}
        shape="corners"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      />

      {/* Soft fade to main background at the bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[1]" />

      {/* Content */}
      <div className="relative z-[2] text-center px-6 sm:px-8 max-w-4xl mx-auto pt-24">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-heading)] text-foreground mb-6 leading-tight">
          Size Solar Systems in Minutes, Not Hours
        </h1>
        <p className="max-w-2xl text-lg sm:text-xl font-[family-name:var(--font-body)] text-foreground/70 mx-auto mb-10">
          Professional PV sizing, cost estimation and quotation generation for
          solar installers and energy companies.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="text-base px-8 rounded-xl bg-foreground text-background hover:bg-foreground/90 font-[family-name:var(--font-ui)]"
          >
            <Link href="/projects/new">
              Start Your First Quotation
              <ArrowRight className="ml-1 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            variant="outline"
            className="text-base px-8 rounded-xl font-[family-name:var(--font-ui)]"
          >
            <a href="#features">Learn More</a>
          </Button>
        </div>
      </div>
    </section>
  );
}
