"use client";

import { useEffect, useRef, useCallback } from "react";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

/**
 * Custom React hook to initialize Lenis Smooth Scroll and synchronize with GSAP ScrollTrigger.
 *
 * Provides:
 * - Ultra-smooth cinematic inertia scrolling
 * - Bidirectional synchronization with GSAP ScrollTrigger
 * - GSAP Ticker-driven updates for synchronized 60/120Hz rendering
 * - lagSmoothing(0) to prevent frame jumps
 * - Thorough cleanup on unmount to prevent memory leaks
 *
 * @param {Object} [options]
 * @param {boolean} [options.enabled=true]
 * @param {number} [options.duration=1.2] - Scroll animation duration in seconds
 * @param {Function} [options.easing] - Easing curve function
 * @param {number} [options.wheelMultiplier=1.0] - Sensitivity multiplier for mouse wheels
 * @param {number} [options.touchMultiplier=1.8] - Sensitivity multiplier for touch gestures
 * @returns {{ lenisRef: React.MutableRefObject<Lenis|null>, scrollTo: Function }}
 */
export function useLenis({
  enabled = true,
  duration = 1.2,
  easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Apple-grade exponential ease-out
  wheelMultiplier = 1.0,
  touchMultiplier = 1.8,
  ...customOptions
} = {}) {
  const lenisRef = useRef(null);
  const optionsRef = useRef(customOptions);

  useEffect(() => {
    optionsRef.current = customOptions;
  });

  useEffect(() => {
    if (!enabled || typeof window === "undefined") return;

    // 1. Initialize Lenis instance with cinematic configuration
    const lenis = new Lenis({
      duration,
      easing,
      orientation: "vertical",
      gestureOrientation: "vertical",
      smoothWheel: true,
      wheelMultiplier,
      touchMultiplier,
      autoRaf: false, // Driven by GSAP ticker
      ...optionsRef.current,
    });

    lenisRef.current = lenis;

    // 2. Synchronize Lenis scroll events with GSAP ScrollTrigger updates
    const handleScroll = () => {
      ScrollTrigger.update();
    };
    lenis.on("scroll", handleScroll);

    // 3. Connect Lenis raf loop directly to GSAP Ticker
    // GSAP ticker provides time in seconds; Lenis raf expects milliseconds
    const tickerUpdate = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(tickerUpdate);

    // 4. Disable lagSmoothing in GSAP ticker so scroll and frames never de-sync or jump
    gsap.ticker.lagSmoothing(0);

    // 5. Initial refresh of ScrollTrigger with Lenis scroll boundaries
    ScrollTrigger.refresh();

    // 6. Complete cleanup on unmount
    return () => {
      gsap.ticker.remove(tickerUpdate);
      lenis.off("scroll", handleScroll);
      lenis.destroy();
      lenisRef.current = null;
      ScrollTrigger.refresh();
    };
  }, [enabled, duration, easing, wheelMultiplier, touchMultiplier]);

  // Programmatic smooth scroll helper
  const scrollTo = useCallback((target, scrollOptions = {}) => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(target, scrollOptions);
    }
  }, []);

  return { lenisRef, scrollTo };
}

export default useLenis;
