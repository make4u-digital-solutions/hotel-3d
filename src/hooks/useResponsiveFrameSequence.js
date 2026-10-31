"use client";

/**
 * useResponsiveFrameSequence Hook
 *
 * Provides responsive frame selection for the hotel animation:
 * - Detects viewport using a consistent breakpoint (default 768px).
 * - Selects exactly one sequence ('desktop' or 'mobile') at any time via useSyncExternalStore.
 * - Authoritatively reads frame count, dimensions, and paths from FRAME_MANIFEST.
 * - Ensures desktop and mobile frames are never loaded simultaneously.
 * - Safely handles browser resizing and orientation changes.
 * - Automatically cleans up in-flight requests and previous frame caches on transition.
 * - Does NOT start preloading every frame (on-demand loading only).
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  BREAKPOINT_MOBILE_MAX,
  FRAME_MANIFEST,
  getFrameUrlFromManifest,
  getManifest,
} from "@/lib/hotel/manifest";
import { loadFrameImage } from "@/lib/hotel/frameLoader";
import { FrameCache } from "@/lib/hotel/frameCache";

/**
 * Server snapshot: defaults to desktop during SSR
 */
function getServerSnapshot() {
  return "desktop";
}

export function useResponsiveFrameSequence({
  breakpoint = BREAKPOINT_MOBILE_MAX,
  autoLoadFirstFrame = true,
  onSequenceChange,
} = {}) {
  // Memoized external store subscriber
  const subscribe = useCallback(
    (callback) => {
      if (typeof window === "undefined") return () => {};

      const mediaQuery = window.matchMedia(`(max-width: ${breakpoint}px)`);
      const orientationQuery = window.matchMedia("(orientation: portrait)");

      const handleChange = () => {
        callback();
      };

      if (typeof mediaQuery.addEventListener === "function") {
        mediaQuery.addEventListener("change", handleChange);
        orientationQuery.addEventListener("change", handleChange);
      } else {
        mediaQuery.addListener(handleChange);
        orientationQuery.addListener(handleChange);
      }

      window.addEventListener("orientationchange", handleChange);

      return () => {
        if (typeof mediaQuery.removeEventListener === "function") {
          mediaQuery.removeEventListener("change", handleChange);
          orientationQuery.removeEventListener("change", handleChange);
        } else {
          mediaQuery.removeListener(handleChange);
          orientationQuery.removeListener(handleChange);
        }
        window.removeEventListener("orientationchange", handleChange);
      };
    },
    [breakpoint]
  );

  // Memoized external store snapshot getter
  const getSnapshot = useCallback(() => {
    if (typeof window === "undefined") return "desktop";
    return window.innerWidth <= breakpoint ? "mobile" : "desktop";
  }, [breakpoint]);

  // Authoritative variant state synchronized to browser viewport
  const variant = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const [activeFrame, setActiveFrame] = useState(1);
  const [loadedCount, setLoadedCount] = useState(0);

  // Authoritative manifest for currently active sequence
  const manifest = getManifest(variant);

  // Dedicated in-memory cache for the active sequence
  const cacheRef = useRef(null);
  if (cacheRef.current == null) {
    cacheRef.current = new FrameCache(250);
  }

  // In-flight request tracking for clean aborting
  const inFlightControllersRef = useRef(null);
  if (inFlightControllersRef.current == null) {
    inFlightControllersRef.current = new Map();
  }

  const activeVariantRef = useRef(variant);
  const prevVariantRef = useRef(variant);

  /**
   * Generates URL for a given frame index based on currently active manifest
   */
  const getFrameUrl = useCallback(
    (frameIndex) => {
      return getFrameUrlFromManifest(manifest, frameIndex);
    },
    [manifest]
  );

  /**
   * Aborts all currently in-flight network requests.
   */
  const abortPendingRequests = useCallback(() => {
    const controllers = inFlightControllersRef.current;
    if (controllers) {
      controllers.forEach((controller) => {
        try {
          controller.abort();
        } catch (_) {}
      });
      controllers.clear();
    }
  }, []);

  /**
   * Loads a single frame on-demand without bulk preloading.
   * Guarantees no race condition across sequence transitions.
   *
   * @param {number} frameIndex - 1-based frame index
   * @param {string} targetVariant - Variant to load for
   * @returns {Promise<HTMLImageElement|null>}
   */
  const loadFrame = useCallback(
    async (frameIndex, targetVariant) => {
      const cache = cacheRef.current;
      const controllers = inFlightControllersRef.current;
      if (!cache || !controllers) return null;

      // 1. Check if already cached
      if (cache.has(targetVariant, frameIndex)) {
        return cache.get(targetVariant, frameIndex);
      }

      // 2. Check if already downloading
      if (controllers.has(frameIndex)) {
        return null;
      }

      const controller = new AbortController();
      controllers.set(frameIndex, controller);

      const targetManifest = getManifest(targetVariant);
      const url = getFrameUrlFromManifest(targetManifest, frameIndex);

      try {
        const img = await loadFrameImage(url, controller.signal);

        controllers.delete(frameIndex);

        // Discard if the active variant shifted while downloading
        if (activeVariantRef.current !== targetVariant) {
          return null;
        }

        if (img) {
          cache.set(targetVariant, frameIndex, img);
          const { loadedCount: count } = cache.getProgress(
            targetVariant,
            targetManifest.totalFrames
          );
          setLoadedCount(count);
          return img;
        }

        return null;
      } catch (_) {
        controllers.delete(frameIndex);
        return null;
      }
    },
    []
  );

  /**
   * Synchronously retrieves a frame from cache if loaded,
   * or triggers on-demand background fetch if absent.
   */
  const getFrame = useCallback(
    (frameIndex) => {
      const current = activeVariantRef.current;
      const cache = cacheRef.current;
      if (!cache) return null;

      const img = cache.get(current, frameIndex);
      if (img) return img;

      // Fetch on-demand (does NOT trigger mass preload)
      loadFrame(frameIndex, current);
      return null;
    },
    [loadFrame]
  );

  /**
   * Checks whether a specific frame is already loaded into memory.
   */
  const isFrameLoaded = useCallback((frameIndex) => {
    return cacheRef.current ? cacheRef.current.has(activeVariantRef.current, frameIndex) : false;
  }, []);

  // Sequence transition handler: aborts old fetches and flushes previous cache
  useEffect(() => {
    const previousVariant = prevVariantRef.current;
    activeVariantRef.current = variant;

    if (previousVariant !== variant) {
      // 1. Immediately abort in-flight requests from the previous sequence
      abortPendingRequests();

      // 2. Clear old sequence cached frames to free memory
      if (cacheRef.current) {
        cacheRef.current.clear(previousVariant);
      }
      setLoadedCount(0);

      prevVariantRef.current = variant;

      if (onSequenceChange) {
        onSequenceChange({
          previousVariant,
          nextVariant: variant,
          manifest: getManifest(variant),
        });
      }
    }

    // 3. Load only the starting frame on-demand (no mass preloading)
    if (autoLoadFirstFrame) {
      loadFrame(activeFrame || 1, variant);
    }

    return () => {
      abortPendingRequests();
    };
  }, [variant, abortPendingRequests, autoLoadFirstFrame, activeFrame, loadFrame, onSequenceChange]);

  return {
    variant,
    isMobile: variant === "mobile",
    isDesktop: variant === "desktop",
    manifest,
    totalFrames: manifest.totalFrames,
    dimensions: {
      width: manifest.width,
      height: manifest.height,
      aspectRatio: manifest.aspectRatio,
    },
    activeFrame,
    setActiveFrame,
    loadedCount,
    getFrameUrl,
    loadFrame: (index) => loadFrame(index, variant),
    getFrame,
    isFrameLoaded,
  };
}
