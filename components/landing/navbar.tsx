"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Home, Sparkles, ListChecks, HelpCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { name: "Home", url: "#hero", sectionId: "hero", icon: Home },
  { name: "Features", url: "#features", sectionId: "features", icon: Sparkles },
  { name: "How It Works", url: "#how-it-works", sectionId: "how-it-works", icon: ListChecks },
  { name: "FAQ", url: "#faq", sectionId: "faq", icon: HelpCircle },
];

export function LandingNavbar() {
  const [activeTab, setActiveTab] = useState("Home");
  const [scrolled, setScrolled] = useState(false);
  const manualClickRef = useRef(false);

  /* ─── Scroll detection for glass effect ─── */
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    handleScroll();
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  /* ─── IntersectionObserver for scroll-aware active state ─── */
  useEffect(() => {
    const sectionIds = navItems.map((item) => item.sectionId);
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (sections.length === 0) return;

    // Track which sections are currently intersecting and by how much
    const visibleMap = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        // Skip observer updates briefly after a manual click
        if (manualClickRef.current) return;

        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleMap.set(entry.target.id, entry.intersectionRatio);
          } else {
            visibleMap.delete(entry.target.id);
          }
        });

        // Pick the section with the highest intersection ratio
        let best: string | null = null;
        let bestRatio = 0;
        visibleMap.forEach((ratio, id) => {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        });

        if (best) {
          const match = navItems.find((item) => item.sectionId === best);
          if (match) setActiveTab(match.name);
        }
      },
      {
        // Multiple thresholds for finer tracking
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        // Offset for the fixed header
        rootMargin: "-80px 0px -40% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  /* ─── Handle manual click  - temporarily pause observer ─── */
  const handleNavClick = (name: string) => {
    setActiveTab(name);
    manualClickRef.current = true;
    // Resume observer after scroll animation settles
    setTimeout(() => {
      manualClickRef.current = false;
    }, 1000);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 hidden md:flex items-center justify-between px-4 md:px-8 py-3 transition-all duration-300",
        scrolled && "bg-background/80 backdrop-blur-lg border-b border-border/50",
      )}
    >
      <Link href="/" className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-xl text-foreground">
        <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-sm font-bold text-accent-foreground">
          S
        </div>
        SunSizer
      </Link>

      <nav className="hidden md:block">
        <div className="flex items-center gap-1 bg-white/80 border border-border/60 backdrop-blur-lg py-1 px-1 rounded-full shadow-sm">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.name;
            return (
              <a
                key={item.name}
                href={item.url}
                onClick={() => handleNavClick(item.name)}
                className={cn(
                  "relative cursor-pointer text-sm font-medium font-[family-name:var(--font-ui)] px-5 py-2 rounded-full transition-colors",
                  "text-foreground/70 hover:text-foreground",
                  isActive && "text-foreground",
                )}
              >
                <span className="hidden lg:inline">{item.name}</span>
                <span className="lg:hidden">
                  <Icon size={18} strokeWidth={2} />
                </span>
                {isActive && (
                  <motion.div
                    layoutId="landing-lamp"
                    className="absolute inset-0 w-full bg-accent/10 rounded-full -z-10"
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-accent rounded-t-full">
                      <div className="absolute w-12 h-6 bg-accent/20 rounded-full blur-md -top-2 -left-2" />
                      <div className="absolute w-8 h-6 bg-accent/20 rounded-full blur-md -top-1" />
                      <div className="absolute w-4 h-4 bg-accent/20 rounded-full blur-sm top-0 left-2" />
                    </div>
                  </motion.div>
                )}
              </a>
            );
          })}
        </div>
      </nav>

      <div className="flex items-center gap-3">
        <Link
          href="/login"
          className="text-sm font-medium font-[family-name:var(--font-ui)] text-foreground/70 hover:text-foreground transition-colors hidden sm:block"
        >
          Log in
        </Link>
        <Link
          href="/projects/new"
          className="inline-flex items-center justify-center h-9 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-medium font-[family-name:var(--font-ui)] hover:bg-primary/90 transition-colors"
        >
          Start a Quotation
        </Link>
      </div>
    </header>
  );
}
