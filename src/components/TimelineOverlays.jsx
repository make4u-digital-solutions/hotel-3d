"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Interior Scroll Timeline Sections
 * Explicit frame boundaries across the 248-frame sequence.
 */
export const INTERIOR_SECTIONS = [
  {
    id: "entrance",
    number: "01",
    label: "Entrance",
    title: "Grand Arrival Portal",
    specs: "Ceiling 3.8m · Monolithic Limestone",
    description:
      "A dramatic limestone portal designed to channel coastal breezes with ambient recessed cove illumination.",
    startFrame: 6,
    endFrame: 42,
    position: "left",
  },
  {
    id: "living",
    number: "02",
    label: "Living Room",
    title: "The Great Salon",
    specs: "Double-Height Glass · Natural Oak",
    description:
      "Floor-to-ceiling panoramic ocean glazing blending effortlessly with low-profile Belgian linen furnishings.",
    startFrame: 44,
    endFrame: 82,
    position: "right",
  },
  {
    id: "kitchen",
    number: "03",
    label: "Kitchen",
    title: "Culinary Atelier",
    specs: "Calacatta Quartzite · Fluted Walnut",
    description:
      "Sculpted stone prep island complemented by integrated concealed cabinetry and precision architectural task lights.",
    startFrame: 84,
    endFrame: 124,
    position: "left",
  },
  {
    id: "bedroom",
    number: "04",
    label: "Bedroom",
    title: "Master Sanctuary",
    specs: "Acoustic Slat Detailing · Sunrise Terrace",
    description:
      "Intentionally oriented toward the morning dawn with direct access to private shaded cantilever terraces.",
    startFrame: 126,
    endFrame: 166,
    position: "right",
  },
  {
    id: "bathroom",
    number: "05",
    label: "Bathroom",
    title: "Wellness Spa Suite",
    specs: "Honed Basalt Tub · Rain Portal",
    description:
      "Monolithic soaking tub and minimalist brushed fixtures centered directly under a frameless natural skylight.",
    startFrame: 168,
    endFrame: 206,
    position: "left",
  },
  {
    id: "garden",
    number: "06",
    label: "Garden",
    title: "Botanical Pavilion",
    specs: "Reflective Water Mirror · Native Palms",
    description:
      "An open-air sanctuary framed by native coastal flora, reflecting infinity pools, and warm sunset lighting.",
    startFrame: 208,
    endFrame: 246,
    position: "right",
  },
];

/**
 * TimelineOverlays Component
 *
 * Driven by GSAP Timelines linked directly to ScrollTrigger progress.
 *
 * Requirements:
 * - 6 interior spaces: Entrance, Living Room, Kitchen, Bedroom, Bathroom, Garden
 * - Driven by specific frame ranges across the 248-frame sequence
 * - Glassmorphism cards with minimal aesthetic text
 * - Animates opacity, translateY, and blur with premium easing
 * - Neatly positioned along the sides/bottom so architecture is never obscured
 * - Appears only during corresponding frame ranges, disappearing cleanly on transitions
 */
export default function TimelineOverlays({
  triggerRef,
  totalFrames = 248,
}) {
  const containerRef = useRef(null);
  const cardRefs = useRef({});

  useEffect(() => {
    const triggerEl = triggerRef?.current;
    if (!triggerEl || typeof window === "undefined") return;

    // Use GSAP context for clean scoping and teardown
    const ctx = gsap.context(() => {
      // Master GSAP timeline scrubbed 1:1 by ScrollTrigger
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerEl,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      // Total timeline duration normalized to 1
      INTERIOR_SECTIONS.forEach((section) => {
        const el = cardRefs.current[section.id];
        if (!el) return;

        // Normalize frame boundaries to [0, 1] timeline progress
        const start = section.startFrame / totalFrames;
        const fadeInEnd = (section.startFrame + 7) / totalFrames;
        const fadeOutStart = (section.endFrame - 7) / totalFrames;
        const end = section.endFrame / totalFrames;

        // Initial state: hidden, shifted down, blurred
        gsap.set(el, {
          opacity: 0,
          y: 28,
          filter: "blur(12px)",
          pointerEvents: "none",
        });

        // 1. Fade IN + Slide UP + De-blur
        tl.to(
          el,
          {
            opacity: 1,
            y: 0,
            filter: "blur(0px)",
            pointerEvents: "auto",
            ease: "power2.out",
            duration: Math.max(0.001, fadeInEnd - start),
          },
          start
        );

        // 2. Fade OUT + Slide UP + Blur out before next section starts
        tl.to(
          el,
          {
            opacity: 0,
            y: -28,
            filter: "blur(12px)",
            pointerEvents: "none",
            ease: "power2.in",
            duration: Math.max(0.001, end - fadeOutStart),
          },
          fadeOutStart
        );
      });
    }, containerRef);

    return () => {
      ctx.revert();
    };
  }, [triggerRef, totalFrames]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-25 overflow-hidden select-none"
    >
      {INTERIOR_SECTIONS.map((section) => {
        const isLeft = section.position === "left";

        return (
          <div
            key={section.id}
            ref={(node) => {
              cardRefs.current[section.id] = node;
            }}
            className={`absolute bottom-12 sm:bottom-16 w-[90%] max-w-[340px] sm:max-w-[370px] ${
              isLeft
                ? "left-6 sm:left-10 lg:left-14"
                : "right-6 sm:right-10 lg:right-14"
            }`}
            style={{
              opacity: 0,
              transform: "translateY(28px)",
              filter: "blur(12px)",
            }}
          >
            {/* Glassmorphic Aesthetic Card */}
            <div className="relative p-5 sm:p-6 rounded-2xl bg-zinc-950/45 backdrop-blur-xl border border-white/[0.09] shadow-2xl shadow-black/80 overflow-hidden">
              {/* Top ambient amber hairline */}
              <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

              {/* Section Tag */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                  <span className="text-[10px] font-mono uppercase tracking-[0.26em] text-amber-300 font-medium">
                    {section.number} · {section.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-zinc-500 tracking-wider">
                  Frames {String(section.startFrame).padStart(3, "0")}–{String(section.endFrame).padStart(3, "0")}
                </span>
              </div>

              {/* Title */}
              <h3 className="text-lg sm:text-xl font-light font-serif tracking-wide text-white mb-1">
                {section.title}
              </h3>

              {/* Architectural Specs */}
              <p className="text-[10px] sm:text-[11px] font-mono text-amber-200/70 tracking-wider mb-2">
                {section.specs}
              </p>

              {/* Description */}
              <p className="text-xs text-zinc-300/85 font-light leading-relaxed">
                {section.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
