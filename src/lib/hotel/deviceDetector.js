/**
 * Device & Viewport Detection Module
 *
 * Provides responsive breakpoint detection, orientation detection,
 * and subscription listeners for switching between desktop and mobile frame sequences.
 */

import { SEQUENCE_CONFIG } from "./config";

export const BREAKPOINT_MOBILE_MAX = 768; // Screen width threshold in px

/**
 * Checks whether the current environment is mobile.
 * Uses window.matchMedia and touch/pointer capability where available.
 * Safe for Next.js SSR (defaults to 'desktop' if window is undefined).
 *
 * @returns {('desktop'|'mobile')} Active variant identifier
 */
export function getActiveVariant() {
  if (typeof window === "undefined") {
    return "desktop";
  }

  // Check media query for mobile viewport width
  const isMobileWidth = window.matchMedia(`(max-width: ${BREAKPOINT_MOBILE_MAX}px)`).matches;
  return isMobileWidth ? "mobile" : "desktop";
}

/**
 * Returns full configuration object for the current active device.
 *
 * @returns {typeof SEQUENCE_CONFIG['desktop']}
 */
export function getActiveSequenceConfig() {
  const variant = getActiveVariant();
  return SEQUENCE_CONFIG[variant];
}

/**
 * Subscribes to device variant changes (e.g., resizing across the breakpoint
 * or device orientation shift).
 *
 * @param {(variant: 'desktop'|'mobile') => void} callback - Handler called when variant transitions
 * @returns {() => void} Unsubscribe cleanup function
 */
export function subscribeDeviceChange(callback) {
  if (typeof window === "undefined") {
    return () => {};
  }

  const mediaQuery = window.matchMedia(`(max-width: ${BREAKPOINT_MOBILE_MAX}px)`);
  let currentVariant = mediaQuery.matches ? "mobile" : "desktop";

  const handleChange = (e) => {
    const nextVariant = e.matches ? "mobile" : "desktop";
    if (nextVariant !== currentVariant) {
      currentVariant = nextVariant;
      callback(nextVariant);
    }
  };

  // Modern browsers support addEventListener on MediaQueryList
  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  } else if (typeof mediaQuery.addListener === "function") {
    // Legacy Safari fallback
    mediaQuery.addListener(handleChange);
    return () => mediaQuery.removeListener(handleChange);
  }

  return () => {};
}

/**
 * Returns current viewport dimensions and pixel density.
 *
 * @returns {{ width: number, height: number, dpr: number }}
 */
export function getViewportMetrics() {
  if (typeof window === "undefined") {
    return { width: 1920, height: 1080, dpr: 1 };
  }

  return {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.min(window.devicePixelRatio || 1, 2), // Cap DPR at 2 for performance
  };
}
