"use client";

/**
 * HotelScenes Component
 *
 * Implements scene-based HTML text and content transitions synchronized to GSAP ScrollTrigger:
 * 1. Hotel exterior
 * 2. Hotel entrance
 * 3. Reception and lobby
 * 4. Restaurant and lounge
 * 5. Guest suite
 * 6. Final hotel reveal
 *
 * Key Architecture:
 * - Pure independent HTML elements for tags, headings, specs, descriptions, and CTA buttons.
 * - Smooth GSAP ScrollTrigger scrubbing transitions (fade, glide, blur dissipation).
 * - Exact frame sequence boundaries calculated dynamically from manifest.
 * - Zero interference with Canvas rendering or FrameManager.
 * - Responsive layout adapted for desktop and mobile.
 */

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HOTEL_SCENES } from "@/lib/hotel/config.js";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HotelScenes({
  triggerRef,
  totalFrames = 190,
  onActionClick,
}) {
  const containerRef = useRef(null);
  const sceneRefs = useRef({});
  const cardRefs = useRef({});

  // GSAP ScrollTrigger Timeline for the 6 scenes
  useEffect(() => {
    const triggerEl = triggerRef?.current;
    if (!triggerEl || typeof window === "undefined") return;

    const ctx = gsap.context(() => {
      // Create master scrub timeline driven by scroll progress
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerEl,
          start: "top top",
          end: "bottom bottom",
          scrub: true,
        },
      });

      HOTEL_SCENES.forEach((scene) => {
        const el = sceneRefs.current[scene.id];
        if (!el) return;

        const start = scene.startProgress;
        const end = scene.endProgress;
        const span = end - start;
        const fadeInEnd = start + span * 0.22;
        const fadeOutStart = end - span * 0.22;

        const tagEl = el.querySelector(".scene-tag");
        const titleEl = el.querySelector(".scene-title");
        const specsEl = el.querySelector(".scene-specs");
        const descEl = el.querySelector(".scene-desc");
        const ctaEl = el.querySelector(".scene-cta");

        // Initial hidden state
        gsap.set(el, {
          opacity: 0,
          y: 32,
          pointerEvents: "none",
        });

        if (tagEl) gsap.set(tagEl, { opacity: 0, y: 10 });
        if (titleEl) gsap.set(titleEl, { opacity: 0, y: 14 });
        if (specsEl) gsap.set(specsEl, { opacity: 0, y: 10 });
        if (descEl) gsap.set(descEl, { opacity: 0, y: 10 });
        if (ctaEl) gsap.set(ctaEl, { opacity: 0, scale: 0.95 });

        // 1. Entrance Transition (Fade in + slide up)
        tl.to(
          el,
          {
            opacity: 1,
            y: 0,
            pointerEvents: "auto",
            ease: "power2.out",
            duration: Math.max(0.001, fadeInEnd - start),
          },
          start
        );

        // Staggered text elements entrance
        if (tagEl) {
          tl.to(tagEl, { opacity: 1, y: 0, duration: span * 0.15, ease: "power2.out" }, start + span * 0.04);
        }
        if (titleEl) {
          tl.to(titleEl, { opacity: 1, y: 0, duration: span * 0.18, ease: "power2.out" }, start + span * 0.07);
        }
        if (specsEl) {
          tl.to(specsEl, { opacity: 1, y: 0, duration: span * 0.15, ease: "power2.out" }, start + span * 0.10);
        }
        if (descEl) {
          tl.to(descEl, { opacity: 1, y: 0, duration: span * 0.18, ease: "power2.out" }, start + span * 0.12);
        }
        if (ctaEl) {
          tl.to(ctaEl, { opacity: 1, scale: 1, duration: span * 0.15, ease: "back.out(1.4)" }, start + span * 0.15);
        }

        // 2. Exit Transition (Fade out + slide up)
        tl.to(
          el,
          {
            opacity: 0,
            y: -24,
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
  }, [triggerRef]);

  // Subtle Mouse Parallax Effect on Desktop Cards
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const handleMouseMove = (e) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;

      Object.values(cardRefs.current).forEach((cardEl) => {
        if (!cardEl) return;
        gsap.to(cardEl, {
          x: nx * 12,
          y: ny * 8,
          rotateY: nx * 3,
          rotateX: -ny * 3,
          duration: 0.5,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    };

    const handleMouseLeave = () => {
      Object.values(cardRefs.current).forEach((cardEl) => {
        if (!cardEl) return;
        gsap.to(cardEl, {
          x: 0,
          y: 0,
          rotateY: 0,
          rotateX: 0,
          duration: 0.7,
          ease: "power2.out",
          overwrite: "auto",
        });
      });
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 pointer-events-none z-25 overflow-hidden select-none"
      style={{ perspective: "1000px" }}
    >
      {HOTEL_SCENES.map((scene) => {
        const isLeft = scene.position === "left";
        const isCenter = scene.position === "center";

        // Responsive position styling
        const positionClass = isCenter
          ? "bottom-8 sm:bottom-12 left-1/2 -translate-x-1/2 w-[92%] sm:w-[85%] max-w-[480px]"
          : isLeft
          ? "bottom-8 sm:bottom-12 left-4 sm:left-10 lg:left-14 w-[92%] sm:w-[85%] max-w-[420px]"
          : "bottom-8 sm:bottom-12 right-4 sm:right-10 lg:right-14 w-[92%] sm:w-[85%] max-w-[420px]";

        return (
          <div
            key={scene.id}
            ref={(node) => {
              sceneRefs.current[scene.id] = node;
            }}
            className={`absolute ${positionClass}`}
            style={{
              opacity: 0,
              transform: "translateY(32px)",
              pointerEvents: "none",
            }}
          >
            {/* Inner Glassmorphism Card (for subtle 3D tilt) */}
            <div
              ref={(node) => {
                cardRefs.current[scene.id] = node;
              }}
              style={{ transformStyle: "preserve-3d" }}
              className="relative p-5 sm:p-7 rounded-3xl bg-zinc-950/60 backdrop-blur-2xl border border-white/[0.12] shadow-2xl shadow-black/90 overflow-hidden"
            >
              {/* Amber Hairline Highlight */}
              <div className="absolute inset-x-0 top-0 h-[1.5px] bg-gradient-to-r from-transparent via-amber-400/50 to-transparent" />

              {/* Scene Tag */}
              <div className="scene-tag flex items-center gap-2 mb-2.5">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-sm shadow-amber-400" />
                <span className="text-[10px] sm:text-xs font-mono uppercase tracking-[0.25em] text-amber-300 font-semibold">
                  {scene.tag}
                </span>
              </div>

              {/* Scene Heading */}
              <h2 className="scene-title text-xl sm:text-2xl font-light font-serif tracking-wide text-white mb-1.5 leading-snug">
                {scene.title}
              </h2>

              {/* Architectural Specifications */}
              {scene.specs && (
                <p className="scene-specs text-[11px] sm:text-xs font-mono text-amber-200/80 tracking-wide mb-2.5">
                  {scene.specs}
                </p>
              )}

              {/* Scene Description */}
              <p className="scene-desc text-xs sm:text-sm text-zinc-300/90 font-light leading-relaxed mb-4">
                {scene.description}
              </p>

              {/* Interactive CTA Button */}
              {scene.cta && (
                <div className="scene-cta pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      if (onActionClick) {
                        onActionClick(scene);
                      }
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 rounded-full bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-mono font-medium tracking-wider uppercase transition-all duration-200 cursor-pointer pointer-events-auto active:scale-95"
                  >
                    <span>{scene.cta}</span>
                    <span className="text-amber-400 font-semibold transition-transform duration-200 group-hover:translate-x-1">
                      →
                    </span>
                  </button>
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
