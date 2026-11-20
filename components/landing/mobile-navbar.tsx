"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

/* ─── Fullscreen Mobile Navbar for SunSizer ─── */
/* Adapted from mobile-navbar-design.tsx (Luxora) */
/* Only visible on screens < md (768px) */

const CLIPS = {
  bottom: {
    closedInitial: "polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%)",
    open: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)",
    closedFinal: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
  },
};

const NAV_LINKS = [
  { label: "Home", href: "#hero" },
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "FAQ", href: "#faq" },
];

const ACTION_LINKS = [
  { label: "Log In", href: "/login" },
  { label: "Start a Quotation", href: "/projects/new", primary: true },
];

/* ─── Character-split hover link ─── */
function NavLinkHover({
  label,
  href,
  onClick,
}: {
  label: string;
  href: string;
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="group/link-hover inline-block no-underline"
    >
      <span className="sr-only">{label}</span>
      <span
        aria-hidden="true"
        className="relative inline-block overflow-hidden align-middle leading-[1.08]"
      >
        {[...label].map((char, index) => (
          <span
            key={index}
            className="relative inline-block whitespace-pre transition-transform duration-500 ease-[cubic-bezier(0.625,0.05,0,1)] group-hover/link-hover:-translate-y-[1.2em] group-focus-visible/link-hover:-translate-y-[1.2em]"
            style={{
              textShadow: "0 1.2em currentColor",
              transitionDelay: `${index * 0.015}s`,
            }}
          >
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </span>
    </a>
  );
}

/* ─── Focusable element helpers ─── */
const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),[tabindex]:not([tabindex="-1"])';

export function MobileNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const overlayRef = useRef<HTMLElement | null>(null);
  const linksWrapperRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | gsap.core.Tween | null>(null);
  const isAnimatingRef = useRef(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const toggleButtonRef = useRef<HTMLButtonElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const linksRef = useRef<(HTMLDivElement | null)[]>([]);
  const actionsRef = useRef<(HTMLAnchorElement | null)[]>([]);
  const taglineRef = useRef<HTMLParagraphElement | null>(null);

  const { closedInitial, open: openClipPath, closedFinal } = CLIPS.bottom;

  /* ─── Smooth-scroll to anchor ─── */
  const scrollToAnchor = useCallback(
    (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
      e.preventDefault();
      const target = document.querySelector(href);
      if (!target) return;
      target.scrollIntoView({ behavior: "smooth", block: "start" });
    },
    []
  );

  /* ─── Scroll detection for glass header ─── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ─── Lock body scroll while open ─── */
  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  /* ─── Focus trap + Escape key ─── */
  useEffect(() => {
    if (!isOpen) return;

    const container = rootRef.current;
    if (!container) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseMenu();
        return;
      }

      if (e.key !== "Tab") return;

      const focusable = Array.from(
        container.querySelectorAll(FOCUSABLE)
      ) as HTMLElement[];
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ─── Reduced motion check ─── */
  const isReducedMotion = () =>
    typeof window !== "undefined" &&
    window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches === true;

  /* ─── Menu open ─── */
  const onOpenMenu = () => {
    previousFocusRef.current = document.activeElement as HTMLElement;
    setIsOpen(true);
    timelineRef.current?.kill();

    // Reset inner content to hidden
    gsap.set(linksRef.current, { y: 30, opacity: 0 });
    gsap.set(actionsRef.current, { y: 14, opacity: 0 });
    gsap.set(taglineRef.current, { y: -12, opacity: 0 });
    gsap.set(overlayRef.current, { clipPath: closedInitial });
    gsap.set(linksWrapperRef.current, { opacity: 1, scale: 1 });

    if (isReducedMotion()) {
      gsap.set(overlayRef.current, { clipPath: openClipPath, autoAlpha: 0 });
      gsap.set(linksRef.current, { y: 0, opacity: 1 });
      gsap.set(actionsRef.current, { y: 0, opacity: 1 });
      gsap.set(taglineRef.current, { y: 0, opacity: 1 });

      timelineRef.current = gsap.to(overlayRef.current, {
        autoAlpha: 1,
        duration: 0.2,
        ease: "power2.out",
        onStart: () => {
          isAnimatingRef.current = true;
        },
        onComplete: () => {
          isAnimatingRef.current = false;
          toggleButtonRef.current?.focus();
        },
      });
      return;
    }

    const timeline = gsap.timeline({
      onStart: () => {
        isAnimatingRef.current = true;
      },
      onComplete: () => {
        isAnimatingRef.current = false;
        toggleButtonRef.current?.focus();
      },
    });

    timelineRef.current = timeline;

    // Clip-path wipe in
    timeline.to(overlayRef.current, {
      clipPath: openClipPath,
      duration: 1.2,
      delay: 0.2,
      ease: "power4.inOut",
    });

    // Staggered content reveals
    timeline.fromTo(
      linksRef.current,
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, ease: "power2.out", stagger: 0.07 },
      "-=0.4"
    );
    timeline.fromTo(
      taglineRef.current,
      { y: -12, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
      "-=0.6"
    );
    timeline.fromTo(
      actionsRef.current,
      { y: 14, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.06 },
      "-=0.4"
    );
  };

  /* ─── Menu close ─── */
  const onCloseMenu = () => {
    setIsOpen(false);
    timelineRef.current?.kill();

    const restoreFocus = () => {
      if (
        previousFocusRef.current &&
        document.contains(previousFocusRef.current)
      ) {
        previousFocusRef.current.focus();
      }
    };

    if (isReducedMotion()) {
      gsap.set(linksWrapperRef.current, { scale: 1, opacity: 1 });
      timelineRef.current = gsap.to(overlayRef.current, {
        autoAlpha: 0,
        duration: 0.2,
        ease: "power2.out",
        onStart: () => {
          isAnimatingRef.current = true;
        },
        onComplete: () => {
          isAnimatingRef.current = false;
          gsap.set(overlayRef.current, { clipPath: closedFinal });
          restoreFocus();
        },
      });
      return;
    }

    const timeline = gsap.timeline({
      onStart: () => {
        isAnimatingRef.current = true;
      },
      onComplete: () => {
        isAnimatingRef.current = false;
        restoreFocus();
      },
    });

    timelineRef.current = timeline;
    timeline
      .to(linksWrapperRef.current, {
        scale: 0.9,
        opacity: 0.5,
        duration: 0.7,
        ease: "power2.in",
      })
      .to(
        overlayRef.current,
        { clipPath: closedFinal, duration: 1.2, ease: "power4.inOut" },
        "<"
      );
  };

  /* ─── Toggle ─── */
  const onToggleMenu = () => {
    if (isAnimatingRef.current) return;
    isOpen ? onCloseMenu() : onOpenMenu();
  };

  /* ─── Link click: close menu + smooth scroll ─── */
  const onNavLinkClick = (
    e: React.MouseEvent<HTMLAnchorElement>,
    href: string
  ) => {
    onCloseMenu();
    setTimeout(() => {
      scrollToAnchor(e, href);
    }, 800);
  };

  return (
    <div ref={rootRef} className="md:hidden">
      {/* ── Fixed Header (mobile only) ── */}
      <header
        className={`fixed top-0 left-0 right-0 z-[70] flex h-16 items-center justify-between px-4 transition-all duration-350 ${
          scrolled && !isOpen
            ? "bg-[#FAFAFA]/80 backdrop-blur-[16px] border-b border-border shadow-[0_8px_30px_rgba(28,28,28,.06)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <Link
          href="/"
          className="flex items-center gap-2 font-[family-name:var(--font-heading)] text-lg font-bold transition-colors duration-300"
          style={{
            color: isOpen ? "#FFD749" : "#000000",
          }}
        >
          <div
            className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-colors duration-300"
            style={{
              backgroundColor: isOpen ? "#FFD749" : "#FFD749",
              color: "#000000",
            }}
          >
            S
          </div>
          SunSizer
        </Link>

        {/* Hamburger Toggle */}
        <button
          ref={toggleButtonRef}
          onClick={onToggleMenu}
          aria-label="Toggle menu"
          aria-expanded={isOpen}
          className="flex size-10 cursor-pointer flex-col items-center justify-center gap-1.5"
        >
          <span
            className={`block h-0.5 w-6 transition-all duration-700 ease-in-out delay-300 ${
              isOpen
                ? "translate-y-[7px] rotate-45 bg-white"
                : "bg-black"
            }`}
          />
          <span
            className={`block h-0.5 w-6 transition-all duration-500 delay-300 ${
              isOpen ? "scale-x-0 opacity-0" : "bg-black"
            }`}
          />
          <span
            className={`block h-0.5 w-6 transition-all duration-700 ease-in-out delay-300 ${
              isOpen
                ? "-translate-y-[9px] -rotate-45 bg-white"
                : "bg-black"
            }`}
          />
        </button>
      </header>

      {/* ── Fullscreen Overlay Nav ── */}
      <nav
        ref={overlayRef}
        style={{ clipPath: closedInitial, backgroundColor: "#000000" }}
        className={`fixed inset-0 z-[60] flex flex-col items-center justify-center overflow-y-auto ${
          isOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
        aria-hidden={!isOpen}
        role="navigation"
      >
        <div
          ref={linksWrapperRef}
          className="flex h-screen w-screen flex-col justify-between gap-6 px-6 py-10 pt-24 text-white overflow-y-auto"
        >
          {/* Tagline */}
          <p
            ref={taglineRef}
            className="text-sm font-[family-name:var(--font-ui)] text-[#FFD749] font-medium"
            style={{ opacity: 0 }}
          >
            Smart Solar PV Sizing & Quotations
          </p>

          {/* Nav Links */}
          <div className="flex flex-col gap-0 flex-1 justify-center">
            {NAV_LINKS.map((link, index) => (
              <div
                key={link.label}
                ref={(el) => {
                  linksRef.current[index] = el;
                }}
                className="z-[60] text-[12vw] leading-[1.2] font-[family-name:var(--font-heading)]"
                style={{ opacity: 0, transform: "translateY(30px)" }}
              >
                <NavLinkHover
                  label={link.label}
                  href={link.href}
                  onClick={(e) => onNavLinkClick(e, link.href)}
                />
              </div>
            ))}
          </div>

          {/* Bottom: Action buttons */}
          <div className="flex flex-col gap-3 pb-6">
            {ACTION_LINKS.map((action, index) => (
              <Link
                key={action.label}
                href={action.href}
                ref={(el) => {
                  actionsRef.current[index] = el;
                }}
                onClick={() => onCloseMenu()}
                className={`block w-full text-center py-3.5 rounded-xl font-[family-name:var(--font-ui)] text-base font-semibold transition-colors ${
                  action.primary
                    ? "bg-[#FFD749] text-black hover:bg-[#f0c930]"
                    : "border border-white/30 text-white hover:bg-white/10"
                }`}
                style={{ opacity: 0, transform: "translateY(14px)" }}
                tabIndex={isOpen ? 0 : -1}
              >
                {action.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </div>
  );
}
