"use client";

import {
  Zap,
  Battery,
  Sun,
  Calculator,
  FileText,
  Database,
  ArrowRight,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { GrainGradient } from "@paper-design/shaders-react";

/* ───────────── Trust Strip ───────────── */
export function TrustStrip() {
  return (
    <section className="py-12 border-y border-border/50">
      <div className="max-w-6xl mx-auto px-6">
        <p className="text-center text-sm font-[family-name:var(--font-ui)] text-muted-foreground mb-6">
          Trusted by solar installers across Nigeria
        </p>
        <div className="flex items-center justify-center gap-8 flex-wrap">
          {["SolarTech", "GreenPower", "EcoEnergy", "SunVolt", "PowerHouse"].map(
            (name) => (
              <div
                key={name}
                className="h-10 px-6 bg-muted rounded-lg flex items-center justify-center text-sm font-[family-name:var(--font-ui)] text-muted-foreground"
              >
                {name}
              </div>
            ),
          )}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Features ───────────── */
const features = [
  { icon: Zap, title: "Load Audit", description: "Add appliances, set quantities and usage hours. Get instant connected load and daily energy totals." },
  { icon: Calculator, title: "Smart Sizing", description: "Automatic inverter sizing with standard kVA steps, design margin and power factor calculations." },
  { icon: Battery, title: "Battery Sizing", description: "Lithium and tubular battery paths with proper DoD, efficiency and series/parallel configuration." },
  { icon: Sun, title: "PV Array Sizing", description: "Panel count computed from daily energy, peak sun hours and performance ratio." },
  { icon: FileText, title: "PDF Quotations", description: "Branded quotation PDFs with itemised costs, company details, terms and validity period." },
  { icon: Database, title: "Component Database", description: "Manage inverters, batteries, panels and accessories with dated pricing and audit trails." },
];

export function Features() {
  return (
    <section id="features" className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-heading)] text-center mb-4">
          Everything You Need to Quote Solar
        </h2>
        <p className="text-center font-[family-name:var(--font-body)] text-muted-foreground mb-14 max-w-2xl mx-auto">
          From load audit to signed quotation  - a complete workflow designed for solar professionals.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <div
              key={f.title}
              className="bg-card rounded-xl border border-border p-6 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center mb-4">
                <f.icon className="h-5 w-5 text-foreground" />
              </div>
              <h3 className="text-lg font-[family-name:var(--font-heading)] mb-2">{f.title}</h3>
              <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground leading-relaxed">
                {f.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── How It Works ───────────── */
const steps = [
  { num: 1, title: "Load Audit", description: "Add your customer's appliances and their daily usage. SunSizer calculates total connected load and energy demand." },
  { num: 2, title: "Design Choices", description: "Choose battery type, backup hours, panel size and system configuration. The engine sizes everything instantly." },
  { num: 3, title: "Results", description: "Review the complete system design  - inverter, batteries, panels, backup time and MPPT current  - with engineering warnings." },
  { num: 4, title: "Cost & Quotation", description: "See itemised costs from your component database, adjust markup, and issue a branded PDF quotation." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 px-6 bg-card border-y border-border/50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-heading)] text-center mb-4">
          How It Works
        </h2>
        <p className="text-center font-[family-name:var(--font-body)] text-muted-foreground mb-14 max-w-xl mx-auto">
          Four simple steps from site visit to signed quotation.
        </p>
        <div className="relative space-y-0">
          {steps.map((s, i) => (
            <div key={s.num} className="relative flex gap-6 pb-10">
              {/* Connector line */}
              {i < steps.length - 1 && (
                <div className="absolute left-5 top-12 w-0.5 h-[calc(100%-2rem)] bg-border" />
              )}
              {/* Step number */}
              <div className="relative z-10 flex-shrink-0 w-10 h-10 rounded-full bg-accent flex items-center justify-center text-sm font-bold font-[family-name:var(--font-ui)] text-accent-foreground">
                {s.num}
              </div>
              <div className="pt-1">
                <h3 className="text-lg font-[family-name:var(--font-heading)] mb-1">{s.title}</h3>
                <p className="text-sm font-[family-name:var(--font-body)] text-muted-foreground leading-relaxed">
                  {s.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── FAQ ───────────── */
const faqs = [
  { q: "What is solar PV system sizing?", a: "Solar PV sizing is the process of calculating the right inverter, battery bank and solar panel array to meet a customer's energy needs. It considers daily energy consumption, backup requirements, and site-specific conditions like peak sun hours." },
  { q: "How does SunSizer calculate battery requirements?", a: "SunSizer uses industry-standard formulas considering average power consumption, backup hours, depth of discharge (DoD), inverter efficiency and battery efficiency. It supports both lithium (LiFePO4) and tubular lead-acid batteries with appropriate DoD values." },
  { q: "Can I use my own component prices?", a: "Yes. SunSizer includes a component database where you manage your own inverters, batteries, panels and accessories with current pricing. Prices are date-stamped so old quotations always show the prices they were issued with." },
  { q: "Is SunSizer suitable for residential and commercial systems?", a: "SunSizer handles systems from 1.5 kVA residential setups to 30 kVA commercial installations. The standard inverter sizes cover the most common range; larger projects can be flagged for custom engineering." },
  { q: "Can I generate branded quotation PDFs?", a: "Yes. Each quotation generates a professional PDF with your company details, logo, customer information, load summary, system design, itemised costs with markup, terms and conditions, and a validity period." },
];

export function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  return (
    <section id="faq" className="py-20 px-6">
      <div className="max-w-3xl mx-auto">
        <h2 className="text-3xl sm:text-4xl font-[family-name:var(--font-heading)] text-center mb-14">
          Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((f, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-5 text-left font-[family-name:var(--font-ui)] text-sm font-medium text-foreground hover:bg-muted/50 transition-colors"
              >
                {f.q}
                <ChevronDown
                  className={`h-4 w-4 text-muted-foreground transition-transform ${openIdx === i ? "rotate-180" : ""}`}
                />
              </button>
              {openIdx === i && (
                <div className="px-5 pb-5 text-sm font-[family-name:var(--font-body)] text-muted-foreground leading-relaxed">
                  {f.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────── Final CTA (black grain variant - white text allowed on black) ───────────── */
export function FinalCTA() {
  return (
    <section className="relative py-32 sm:py-40 px-6 overflow-hidden">
      {/* Black grain gradient background */}
      <GrainGradient
        colorBack="#000000"
        colors={["#1a1a1a", "#FFD749", "#0d0d0d", "#2a2000"]}
        softness={0.6}
        intensity={0.25}
        noise={0.3}
        speed={0.3}
        shape="corners"
        style={{
          position: "absolute",
          inset: 0,
          zIndex: 0,
        }}
      />
      <div className="relative z-[1] max-w-3xl mx-auto text-center flex flex-col items-center justify-center gap-6">
        <p className="text-sm font-[family-name:var(--font-ui)] text-[#FFD749] uppercase tracking-widest font-semibold">
          Get Started Today
        </p>
        <h2 className="text-4xl sm:text-5xl lg:text-6xl font-[family-name:var(--font-heading)] text-white leading-tight">
          Ready to Size Your Next System?
        </h2>
        <p className="text-lg sm:text-xl font-[family-name:var(--font-body)] text-white/70 max-w-xl mx-auto leading-relaxed">
          Join thousands of solar professionals and DIY enthusiasts who save hours on every quotation. Start for free, no credit card required.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
          <Button asChild size="lg" variant="accent" className="text-base px-10 py-6 rounded-xl text-lg font-semibold">
            <Link href="/register">
              Get Started Free
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button
            asChild
            size="lg"
            className="text-base px-10 py-6 rounded-xl text-lg font-semibold bg-transparent border-2 border-white/30 text-white hover:bg-white/10"
          >
            <Link href="/projects/new">
              Try a Quotation
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ───────────── Footer ───────────── */
export function Footer() {
  return (
    <footer className="bg-primary py-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Top row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-lg bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground">
                S
              </div>
              <span className="text-lg font-[family-name:var(--font-heading)] text-primary-foreground">
                SunSizer
              </span>
            </div>
            <p className="text-sm font-[family-name:var(--font-body)] text-primary-foreground/50 leading-relaxed">
              Professional solar PV system sizing, cost estimation and quotation
              generation for companies and individuals.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-[family-name:var(--font-ui)] font-semibold text-primary-foreground/40 uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-3 text-sm font-[family-name:var(--font-ui)]">
              <li>
                <a href="#features" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#faq" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                  FAQ
                </a>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-xs font-[family-name:var(--font-ui)] font-semibold text-primary-foreground/40 uppercase tracking-wider mb-4">
              Account
            </h4>
            <ul className="space-y-3 text-sm font-[family-name:var(--font-ui)]">
              <li>
                <Link href="/login" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                  Log In
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-primary-foreground/60 hover:text-primary-foreground transition-colors">
                  Create Account
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-[family-name:var(--font-ui)] font-semibold text-primary-foreground/40 uppercase tracking-wider mb-4">
              Contact
            </h4>
            <ul className="space-y-3 text-sm font-[family-name:var(--font-body)]">
              <li className="text-primary-foreground/50">
                support@sunsizer.app
              </li>
              <li className="text-primary-foreground/50">
                Lagos, Nigeria
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-[family-name:var(--font-ui)] text-primary-foreground/40">
            &copy; {new Date().getFullYear()} SunSizer. All rights reserved.
          </p>
          <p className="text-xs font-[family-name:var(--font-ui)] text-primary-foreground/30">
            Solar PV sizing made simple.
          </p>
        </div>
      </div>
    </footer>
  );
}
