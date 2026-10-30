"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LRUCache } from "./lruCache";

/**
 * Intelligent Image Sequence Preloader & Progressive Background Caching Hook
 *
 * Guarantees:
 * - All 248 frames are preserved in memory without premature eviction
 * - First 50 frames are loaded before signaling readiness
 * - Remaining frames (51 to 248) are streamed progressively in the background
 * - Re-trigger canvas redraw if the active frame finishes loading
 */
export function useFrameSequence({
  totalFrames = 248,
  initialBatchSize = 50,
  basePath = "/hotel-frames/",
  cacheCapacity = 300, // Ample capacity for all 248 frames
  concurrency = 4,
  onActiveFrameReady,
} = {}) {
  const [initialProgress, setInitialProgress] = useState(0);
  const [isInitialReady, setIsInitialReady] = useState(false);
  const [totalProgress, setTotalProgress] = useState(0);
  const [isAllLoaded, setIsAllLoaded] = useState(false);
  const [loadedCount, setLoadedCount] = useState(0);
  const [bufferMask, setBufferMask] = useState(() => new Uint8Array(totalFrames + 1));

  // Frame URL resolver: frame_0001.webp to frame_0248.webp
  const getFrameUrl = useCallback(
    (index) => {
      const padded = String(index).padStart(4, "0");
      return `${basePath}frame_${padded}.webp`;
    },
    [basePath]
  );

  // Permanent frame storage map (index -> HTMLImageElement | ImageBitmap)
  // Ensures NO frame is ever evicted or lost during scrolling
  const framesMapRef = useRef(new Map());
  const lruCacheRef = useRef(null);
  const activeRequestsRef = useRef(new Map()); // index -> AbortController
  const queueRef = useRef([]); // priority queue of frame indices to load
  const inFlightCountRef = useRef(0);
  const loadedMaskRef = useRef(new Uint8Array(totalFrames + 1));
  const isDestroyedRef = useRef(false);
  const currentTargetFrameRef = useRef(1);
  const processQueueRef = useRef(null);
  const onActiveFrameReadyRef = useRef(onActiveFrameReady);

  useEffect(() => {
    onActiveFrameReadyRef.current = onActiveFrameReady;
  }, [onActiveFrameReady]);

  // Initialize Cache
  useEffect(() => {
    isDestroyedRef.current = false;
    const activeRequests = activeRequestsRef.current;
    const framesMap = framesMapRef.current;

    lruCacheRef.current = new LRUCache(cacheCapacity, (key, value) => {
      // Eviction callback only if explicitly needed
      if (value && typeof value.close === "function") {
        try {
          value.close();
        } catch (_) {}
      }
    });

    return () => {
      isDestroyedRef.current = true;
      activeRequests.forEach((controller) => {
        try {
          controller.abort();
        } catch (_) {}
      });
      activeRequests.clear();

      if (lruCacheRef.current) {
        lruCacheRef.current.clear();
      }
      framesMap.clear();
    };
  }, [cacheCapacity]);

  // Decode image asynchronously and safely into memory
  const loadSingleFrame = useCallback(
    async (index, signal) => {
      // 1. Check permanent map first
      if (framesMapRef.current.has(index)) {
        return framesMapRef.current.get(index);
      }

      const url = getFrameUrl(index);

      // Standard robust HTMLImageElement with async .decode()
      // Browser retains image in memory and decodes without blocking main thread
      return new Promise((resolve) => {
        if (signal?.aborted || isDestroyedRef.current) {
          return resolve(null);
        }

        const img = new Image();
        img.crossOrigin = "anonymous";

        const onAbort = () => {
          img.src = "";
          resolve(null);
        };

        if (signal) {
          signal.addEventListener("abort", onAbort, { once: true });
        }

        img.onload = async () => {
          if (signal) signal.removeEventListener("abort", onAbort);
          if (signal?.aborted || isDestroyedRef.current) return resolve(null);

          try {
            if ("decode" in img) {
              await img.decode();
            }
          } catch (_) {
            // decode failure is non-fatal
          }

          // Store in both permanent map and LRU cache
          framesMapRef.current.set(index, img);
          lruCacheRef.current?.set(index, img);

          // If this was the frame the user is waiting to view, notify immediately
          if (index === currentTargetFrameRef.current && onActiveFrameReadyRef.current) {
            onActiveFrameReadyRef.current(index);
          }

          resolve(img);
        };

        img.onerror = () => {
          if (signal) signal.removeEventListener("abort", onAbort);
          resolve(null);
        };

        img.src = url;
      });
    },
    [getFrameUrl]
  );

  // Schedule next queue pump
  const scheduleNextPump = useCallback(() => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(() => processQueueRef.current?.(), { timeout: 80 });
    } else {
      setTimeout(() => processQueueRef.current?.(), 16);
    }
  }, []);

  // Pump queue worker with concurrency control
  const processQueue = useCallback(() => {
    if (isDestroyedRef.current) return;

    while (inFlightCountRef.current < concurrency && queueRef.current.length > 0) {
      const index = queueRef.current.shift();

      // Skip if already in permanent storage or actively downloading
      if (framesMapRef.current.has(index) || activeRequestsRef.current.has(index)) {
        continue;
      }

      inFlightCountRef.current++;
      const controller = new AbortController();
      activeRequestsRef.current.set(index, controller);

      loadSingleFrame(index, controller.signal)
        .then((result) => {
          activeRequestsRef.current.delete(index);
          inFlightCountRef.current--;

          if (result && !isDestroyedRef.current) {
            loadedMaskRef.current[index] = 1;

            // Recalculate progress accurately
            let count = 0;
            let initialCount = 0;
            for (let i = 1; i <= totalFrames; i++) {
              if (loadedMaskRef.current[i] === 1) {
                count++;
                if (i <= initialBatchSize) initialCount++;
              }
            }

            setLoadedCount(count);
            setBufferMask(new Uint8Array(loadedMaskRef.current));

            const newInitialProgress = Math.min(
              100,
              Math.round((initialCount / initialBatchSize) * 100)
            );
            setInitialProgress(newInitialProgress);

            if (initialCount >= initialBatchSize) {
              setIsInitialReady(true);
            }

            const newTotalProgress = Math.round((count / totalFrames) * 100);
            setTotalProgress(newTotalProgress);

            if (count >= totalFrames) {
              setIsAllLoaded(true);
            }
          }

          scheduleNextPump();
        })
        .catch(() => {
          activeRequestsRef.current.delete(index);
          inFlightCountRef.current--;
          setTimeout(scheduleNextPump, 50);
        });
    }
  }, [concurrency, initialBatchSize, loadSingleFrame, scheduleNextPump, totalFrames]);

  useEffect(() => {
    processQueueRef.current = processQueue;
  }, [processQueue]);

  // Request frames prioritized around a specific active index
  const prioritizeFrames = useCallback(
    (targetIndex, radius = 15) => {
      currentTargetFrameRef.current = targetIndex;
      const priorityIndices = [];

      // Forward priority window
      for (let offset = 0; offset <= radius; offset++) {
        const forward = targetIndex + offset;
        if (forward <= totalFrames && !framesMapRef.current.has(forward)) {
          priorityIndices.push(forward);
        }
        if (offset > 0) {
          const backward = targetIndex - offset;
          if (backward >= 1 && !framesMapRef.current.has(backward)) {
            priorityIndices.push(backward);
          }
        }
      }

      // Prepend to queue without duplicates
      if (priorityIndices.length > 0) {
        const existingSet = new Set(priorityIndices);
        const remainingQueue = queueRef.current.filter((idx) => !existingSet.has(idx));
        queueRef.current = [...priorityIndices, ...remainingQueue];
        processQueue();
      }
    },
    [processQueue, totalFrames]
  );

  // Initial load effect: enqueue all frames, initial 50 first
  useEffect(() => {
    const initialQueue = [];
    for (let i = 1; i <= initialBatchSize; i++) {
      initialQueue.push(i);
    }

    const remainingQueue = [];
    for (let i = initialBatchSize + 1; i <= totalFrames; i++) {
      remainingQueue.push(i);
    }

    queueRef.current = [...initialQueue, ...remainingQueue];
    processQueue();

    return () => {
      queueRef.current = [];
    };
  }, [initialBatchSize, processQueue, totalFrames]);

  // Access a frame from cache or permanent storage
  const getFrame = useCallback(
    (index) => {
      // 1. Check permanent map first
      if (framesMapRef.current.has(index)) {
        return framesMapRef.current.get(index);
      }
      // 2. Check LRU cache
      if (lruCacheRef.current?.has(index)) {
        return lruCacheRef.current.get(index);
      }
      // If not present, prioritize loading it immediately
      prioritizeFrames(index, 10);
      return null;
    },
    [prioritizeFrames]
  );

  // Check if frame index is loaded
  const isFrameLoaded = useCallback((index) => {
    return framesMapRef.current.has(index);
  }, []);

  return {
    initialProgress,
    isInitialReady,
    totalProgress,
    isAllLoaded,
    loadedCount,
    totalFrames,
    bufferMask,
    getFrame,
    isFrameLoaded,
    prioritizeFrames,
  };
}
