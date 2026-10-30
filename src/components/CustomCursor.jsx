"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

/**
 * Luxury Custom Cursor Component
 *
 * Features:
 * - Ultra-smooth trailing outer halo using GSAP quickTo
 * - Precise inner amber point
 * - Expands and brightens when hovering over interactive elements (buttons, links, cards)
 * - Automatically hidden on touch / coarse pointer devices
 * - Completely unobtrusive and hardware accelerated
 */
export default function CustomCursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    // Check if device supports fine hover (desktop)
    if (typeof window === "undefined" || !window.matchMedia("(pointer: fine)").matches) {
      return;
    }

    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    // High-performance GSAP quickTo setters
    const setDotX = gsap.quickTo(dot, "x", { duration: 0.08, ease: "power2.out" });
    const setDotY = gsap.quickTo(dot, "y", { duration: 0.08, ease: "power2.out" });
    const setRingX = gsap.quickTo(ring, "x", { duration: 0.32, ease: "power2.out" });
    const setRingY = gsap.quickTo(ring, "y", { duration: 0.32, ease: "power2.out" });

    const handleMouseMove = (e) => {
      if (!isVisible) setIsVisible(true);

      const { clientX: x, clientY: y } = e;
      setDotX(x);
      setDotY(y);
      setRingX(x);
      setRingY(y);

      // Check if hovering over interactive element
      const target = e.target;
      const isInteractive = Boolean(
        target?.closest("button, a, input, [role='button'], .cursor-pointer")
      );
      setIsHovered(isInteractive);
    };

    const handleMouseLeave = () => {
      setIsVisible(false);
    };

    const handleMouseEnter = () => {
      setIsVisible(true);
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    document.addEventListener("mouseleave", handleMouseLeave);
    document.addEventListener("mouseenter", handleMouseEnter);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseleave", handleMouseLeave);
      document.removeEventListener("mouseenter", handleMouseEnter);
    };
  }, [isVisible]);

  // Animate ring scale and glow on hover change
  useEffect(() => {
    const ring = ringRef.current;
    if (!ring) return;

    if (isHovered) {
      gsap.to(ring, {
        scale: 1.7,
        borderColor: "rgba(251, 191, 36, 0.7)",
        backgroundColor: "rgba(251, 191, 36, 0.08)",
        duration: 0.3,
        ease: "power2.out",
      });
    } else {
      gsap.to(ring, {
        scale: 1,
        borderColor: "rgba(251, 191, 36, 0.3)",
        backgroundColor: "rgba(251, 191, 36, 0.02)",
        duration: 0.3,
        ease: "power2.out",
      });
    }
  }, [isHovered]);

  return (
    <div
      aria-hidden="true"
      className={`hidden md:block pointer-events-none fixed inset-0 z-50 transition-opacity duration-300 ${
        isVisible ? "opacity-100" : "opacity-0"
      }`}
    >
      {/* Precision Inner Dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-1.5 h-1.5 -ml-[3px] -mt-[3px] rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] pointer-events-none"
      />

      {/* Trailing Outer Ring / Halo */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-8 h-8 -ml-4 -mt-4 rounded-full border border-amber-400/30 bg-amber-400/[0.02] backdrop-blur-[0.5px] pointer-events-none shadow-[0_0_15px_rgba(0,0,0,0.5)]"
      />
    </div>
  );
}
