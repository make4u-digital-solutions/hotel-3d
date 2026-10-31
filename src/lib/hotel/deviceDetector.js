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
 */
export function getDeviceVariantServerSnapshot() {
  return "desktop";
}

export function getDeviceVariantClientSnapshot() {
  return getActiveVariant();
}

export function getActiveVariant() {
  if (typeof window === "undefined") {
    return "desktop";
  }

  // 1. Direct viewport width check
  if (window.innerWidth <= BREAKPOINT_MOBILE_MAX) {
    return "mobile";
  }

  // 2. Physical device screen width check
  if (typeof window.screen !== "undefined" && window.screen.width <= BREAKPOINT_MOBILE_MAX) {
    return "mobile";
  }

  // 3. Media query check for mobile viewport
  try {
    const isMobileWidth = window.matchMedia(`(max-width: ${BREAKPOINT_MOBILE_MAX}px)`).matches;
    if (isMobileWidth) {
      return "mobile";
    }
  } catch (_) {}

  // 4. Mobile user-agent check on touch devices
  if (typeof navigator !== "undefined" && navigator.userAgent) {
    const ua = navigator.userAgent;
    if (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua)) {
      if (window.innerWidth <= 1024) {
        return "mobile";
      }
    }
  }

  return "desktop";
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
 * Evaluates device hardware capabilities (RAM, CPU cores, screen DPR)
 * to assign safe memory thresholds that prevent OOM tab crashes on Android Chrome.
 *
 * @returns {{ isMobile: boolean, isLowMemory: boolean, targetCapacity: number, concurrency: number, dprCap: number }}
 */
export function getDevicePerformanceProfile() {
  if (typeof window === "undefined") {
    return { isMobile: false, isLowMemory: false, targetCapacity: 85, concurrency: 4, dprCap: 2.0 };
  }

  const isMobile = getActiveVariant() === "mobile";

  const deviceMemory =
    typeof navigator !== "undefined" && "deviceMemory" in navigator
      ? Number(navigator.deviceMemory)
      : null;

  const hardwareConcurrency =
    typeof navigator !== "undefined" && "hardwareConcurrency" in navigator
      ? Number(navigator.hardwareConcurrency)
      : 4;

  const isLowMemory =
    isMobile ||
    (deviceMemory !== null && deviceMemory <= 4) ||
    hardwareConcurrency <= 4;

  let targetCapacity = 85;
  let concurrency = 4;
  let dprCap = 2.0;

  if (isMobile) {
    // 1080x1920 WebP decoded RGBA is ~8.29MB per frame.
    // Android Chrome tab crashes at ~350-500MB heap limit.
    if (deviceMemory !== null && deviceMemory <= 3) {
      targetCapacity = 18; // ~149MB decoded memory
      concurrency = 2;
      dprCap = 1.0;
    } else {
      targetCapacity = 24; // ~199MB decoded memory
      concurrency = 2;
      dprCap = 1.5;
    }
  } else {
    if (isLowMemory) {
      targetCapacity = 50; // ~415MB
      concurrency = 3;
      dprCap = 1.5;
    } else {
      targetCapacity = 85; // ~700MB
      concurrency = 4;
      dprCap = 2.0;
    }
  }

  return {
    isMobile,
    isLowMemory,
    targetCapacity,
    concurrency,
    dprCap,
  };
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
  let currentVariant = getActiveVariant();

  const checkAndNotify = () => {
    const nextVariant = getActiveVariant();
    if (nextVariant !== currentVariant) {
      currentVariant = nextVariant;
      callback(nextVariant);
    }
  };

  window.addEventListener("resize", checkAndNotify, { passive: true });
  window.addEventListener("orientationchange", checkAndNotify, { passive: true });

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", checkAndNotify);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(checkAndNotify);
  }

  return () => {
    window.removeEventListener("resize", checkAndNotify);
    window.removeEventListener("orientationchange", checkAndNotify);
    if (typeof mediaQuery.removeEventListener === "function") {
      mediaQuery.removeEventListener("change", checkAndNotify);
    } else if (typeof mediaQuery.removeListener === "function") {
      mediaQuery.removeListener(checkAndNotify);
    }
  };
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

  const profile = getDevicePerformanceProfile();
  return {
    width: window.innerWidth,
    height: window.innerHeight,
    dpr: Math.min(window.devicePixelRatio || 1, profile.dprCap),
  };
}
