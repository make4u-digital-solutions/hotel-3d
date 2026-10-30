"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { LRUCache } from "./lruCache";

/**
 * Intelligent Image Sequence Preloader & Progressive Background Caching Hook
 *
 * @param {Object} options
 * @param {number} [options.totalFrames=248] - Total number of frames in sequence
 * @param {number} [options.initialBatchSize=50] - Number of initial frames to load before readiness
 * @param {string} [options.basePath="/hotel-frames/"] - Directory containing frames
 * @param {number} [options.cacheCapacity=120] - Max decoded frames to retain in memory
 * @param {number} [options.concurrency=4] - Max simultaneous background network requests
 */
export function useFrameSequence({
  totalFrames = 248,
  initialBatchSize = 50,
  basePath = "/hotel-frames/",
  cacheCapacity = 120,
  concurrency = 4,
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

  // References to keep state across renders without causing re-renders
  const lruCacheRef = useRef(null);
  const activeRequestsRef = useRef(new Map()); // index -> AbortController
  const queueRef = useRef([]); // priority queue of frame indices to load
  const inFlightCountRef = useRef(0);
  const loadedMaskRef = useRef(new Uint8Array(totalFrames + 1));
  const isDestroyedRef = useRef(false);
  const currentTargetFrameRef = useRef(1);
  const processQueueRef = useRef(null);

  // Initialize LRU Cache
  useEffect(() => {
    isDestroyedRef.current = false;
    const activeRequests = activeRequestsRef.current;
    lruCacheRef.current = new LRUCache(cacheCapacity, (key, value) => {
      // Clean up GPU memory for ImageBitmap
      if (value && typeof value.close === "function") {
        try {
          value.close();
        } catch (_) {}
      }
    });

    return () => {
      isDestroyedRef.current = true;
      // Abort all in-flight requests
      activeRequests.forEach((controller) => {
        try {
          controller.abort();
        } catch (_) {}
      });
      activeRequests.clear();

      if (lruCacheRef.current) {
        lruCacheRef.current.clear();
      }
    };
  }, [cacheCapacity]);

  // Decode image asynchronously into an ImageBitmap or HTMLImageElement
  const loadSingleFrame = useCallback(
    async (index, signal) => {
      // Check cache first
      if (lruCacheRef.current?.has(index)) {
        return lruCacheRef.current.get(index);
      }

      const url = getFrameUrl(index);

      // Prefer fetch + createImageBitmap for zero main-thread decode jank
      if (typeof window !== "undefined" && "createImageBitmap" in window) {
        try {
          const res = await fetch(url, { signal });
          if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
          const blob = await res.blob();
          if (signal?.aborted || isDestroyedRef.current) return null;

          const bitmap = await createImageBitmap(blob);
          if (signal?.aborted || isDestroyedRef.current) {
            if (typeof bitmap.close === "function") bitmap.close();
            return null;
          }

          lruCacheRef.current?.set(index, bitmap);
          return bitmap;
        } catch (err) {
          if (err.name === "AbortError" || signal?.aborted) return null;
          // Fallback to HTMLImageElement if fetch/bitmap fails
        }
      }

      // Fallback: standard HTMLImageElement with async .decode()
      return new Promise((resolve, reject) => {
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
            // decode failure is non-fatal, image is still loaded
          }

          lruCacheRef.current?.set(index, img);
          resolve(img);
        };

        img.onerror = (err) => {
          if (signal) signal.removeEventListener("abort", onAbort);
          reject(err);
        };

        img.src = url;
      });
    },
    [getFrameUrl]
  );

  // Schedule queue pump
  const scheduleNextPump = useCallback(() => {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(() => processQueueRef.current?.(), { timeout: 100 });
    } else {
      setTimeout(() => processQueueRef.current?.(), 16);
    }
  }, []);

  // Pump queue worker
  const processQueue = useCallback(() => {
    if (isDestroyedRef.current) return;

    while (inFlightCountRef.current < concurrency && queueRef.current.length > 0) {
      const index = queueRef.current.shift();

      // Skip if already in cache or actively loading
      if (lruCacheRef.current?.has(index) || activeRequestsRef.current.has(index)) {
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

            // Recalculate progress
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
        if (forward <= totalFrames && !loadedMaskRef.current[forward]) {
          priorityIndices.push(forward);
        }
        if (offset > 0) {
          const backward = targetIndex - offset;
          if (backward >= 1 && !loadedMaskRef.current[backward]) {
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

  // Initial load effect
  useEffect(() => {
    // 1. Initial batch: frames 1 to initialBatchSize
    const initialQueue = [];
    for (let i = 1; i <= initialBatchSize; i++) {
      initialQueue.push(i);
    }

    // 2. Remaining frames: initialBatchSize + 1 to totalFrames
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

  // Access a frame from cache or retrieve fallback
  const getFrame = useCallback(
    (index) => {
      if (!lruCacheRef.current) return null;
      const frame = lruCacheRef.current.get(index);
      if (!frame && !loadedMaskRef.current[index]) {
        // Frame not loaded, prioritize it!
        prioritizeFrames(index, 10);
      }
      return frame;
    },
    [prioritizeFrames]
  );

  // Check if frame index is loaded
  const isFrameLoaded = useCallback(
    (index) => {
      return Boolean(loadedMaskRef.current[index]);
    },
    []
  );

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
