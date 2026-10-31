/**
 * Progressive Frame Manager Module
 *
 * Requirements:
 * 1. Divides frames into chunks of 50.
 * 2. Keeps initial 50-frame loading behavior (Chunk 1).
 * 3. Requests additional chunks as the visitor approaches them.
 * 4. Prioritizes the chunk containing the currently requested frame.
 * 5. Prefetches nearby chunks in the scrolling direction.
 * 6. If the visitor jumps to a distant frame, requests its chunk directly without
 *    downloading unreached intermediate chunks.
 * 7. Deduplicates requests via O(1) set lookups and active in-flight request tracking.
 * 8. Avoids downloading the entire sequence automatically.
 * 9. Supports nearest-neighbor fallback so the last displayed frame remains visible
 *    while a new frame is decoded.
 */

import { getFrameUrl } from "./config.js";
import { loadFrameImage } from "./frameLoader.js";

export const DEFAULT_CHUNK_SIZE = 50;
export const DEFAULT_PREFETCH_THRESHOLD = 15; // Frames from chunk boundary to trigger prefetch

export class FrameManager {
  /**
   * @param {Object} options
   * @param {import('./frameCache').FrameCache} options.cache - Shared frame cache instance
   * @param {number} [options.concurrency=6] - Max parallel network requests (6–8)
   * @param {number} [options.chunkSize=50] - Number of frames per chunk
   * @param {number} [options.prefetchThreshold=15] - Boundary proximity threshold for prefetching
   */
  constructor({
    cache,
    concurrency = 8,
    chunkSize = DEFAULT_CHUNK_SIZE,
    prefetchThreshold = DEFAULT_PREFETCH_THRESHOLD,
  }) {
    this.cache = cache;
    this.concurrency = concurrency;
    this.chunkSize = chunkSize;
    this.prefetchThreshold = prefetchThreshold;

    /** @type {string} Current sequence variant ('desktop' | 'mobile') */
    this.activeVariant = "desktop";
    /** @type {typeof import('./config').SEQUENCE_CONFIG['desktop']} */
    this.activeConfig = null;

    /** @type {number[]} Priority queue of frame indices to download */
    this.queue = [];
    /** @type {Set<number>} O(1) set of frame indices currently queued */
    this.queueSet = new Set();
    /** @type {Map<number, AbortController>} Active in-flight requests */
    this.activeRequests = new Map();
    this.inFlightCount = 0;

    // Track chunk states: Set of chunk indices that have been queued or requested
    this.requestedChunks = new Set();

    // Track user navigation state
    this.lastRequestedFrame = 1;
    this.lastScrollDirection = 1; // 1 = forward, -1 = reverse
    this.lastRenderedFrame = 1;

    // Lifecycle flags
    this.isDestroyed = false;
    this.isPaused = false;

    // Event subscribers
    this.onProgressCallback = null;
    this.onInitialReadyCallback = null;
    this.onFirstFrameReadyCallback = null;
    this.onFrameLoadedCallback = null;

    // Bound pump
    this.processQueue = this.processQueue.bind(this);
  }

  /**
   * Returns the 1-based chunk index for a given frame.
   * (e.g., frames 1-50 -> chunk 1, 51-100 -> chunk 2)
   *
   * @param {number} frameIndex - 1-based frame index
   * @returns {number} 1-based chunk index
   */
  getChunkIndex(frameIndex) {
    return Math.floor((frameIndex - 1) / this.chunkSize) + 1;
  }

  /**
   * Returns the frame range for a given chunk index.
   *
   * @param {number} chunkIndex - 1-based chunk index
   * @returns {{ chunkIndex: number, startFrame: number, endFrame: number, count: number }}
   */
  getChunkRange(chunkIndex) {
    const totalFrames = this.activeConfig ? this.activeConfig.totalFrames : 190;
    const startFrame = (chunkIndex - 1) * this.chunkSize + 1;
    const endFrame = Math.min(chunkIndex * this.chunkSize, totalFrames);
    const count = Math.max(0, endFrame - startFrame + 1);
    return { chunkIndex, startFrame, endFrame, count };
  }

  /**
   * Returns the total number of chunks in the active sequence.
   *
   * @returns {number}
   */
  get totalChunks() {
    if (!this.activeConfig || !this.activeConfig.totalFrames) return 1;
    return Math.ceil(this.activeConfig.totalFrames / this.chunkSize);
  }

  /**
   * Sets or switches the active sequence configuration.
   * Loads ONLY Chunk 1 (the initial 50 frames).
   *
   * @param {typeof import('./config').SEQUENCE_CONFIG['desktop']} sequenceConfig
   */
  setSequence(sequenceConfig) {
    if (!sequenceConfig) return;

    if (this.activeVariant !== sequenceConfig.id) {
      this.cancelPendingRequests();
    }

    this.activeVariant = sequenceConfig.id;
    this.activeConfig = sequenceConfig;

    // Apply device-tailored chunking and concurrency from sequenceConfig
    if (sequenceConfig.chunkSize) this.chunkSize = sequenceConfig.chunkSize;
    if (sequenceConfig.concurrency) this.concurrency = sequenceConfig.concurrency;
    if (sequenceConfig.prefetchThreshold) this.prefetchThreshold = sequenceConfig.prefetchThreshold;

    // Reset queue and chunk tracking
    this.queue = [];
    this.queueSet.clear();
    this.requestedChunks.clear();

    // Reset navigation context on FrameCache
    if (typeof this.cache.setNavigationContext === "function") {
      this.cache.setNavigationContext({
        activeFrame: 1,
        activeChunk: 1,
        variant: sequenceConfig.id,
      });
    }

    // Enqueue Chunk 1 only (progressive initial batch)
    // Mobile: 15-20 frames (~120-160MB). Desktop: 25-35 frames.
    // Subsequent chunks are fetched on-demand via sliding-window scroll prefetch.
    this.enqueueChunk(1, { priorityFrame: 1, direction: 1 });

    // If poster (frame 1) is already cached, notify immediately
    const existingPoster = this.cache.get(this.activeVariant, 1);
    if (existingPoster && this.onFirstFrameReadyCallback) {
      this.onFirstFrameReadyCallback(existingPoster);
    }

    this.emitProgress();
    this.processQueue();
  }

  /**
   * Enqueues frames belonging to a chunk, ordering them based on proximity to a priority frame.
   *
   * @param {number} chunkIndex - 1-based chunk index
   * @param {Object} [options]
   * @param {number} [options.priorityFrame] - Specific frame to place first in the chunk
   * @param {number} [options.direction=1] - Preferred traversal direction (1 or -1)
   * @param {boolean} [options.prepend=false] - Whether to prepend to the front of queue
   */
  enqueueChunk(chunkIndex, { priorityFrame, direction = 1, prepend = false } = {}) {
    if (!this.activeConfig) return;

    const { startFrame, endFrame } = this.getChunkRange(chunkIndex);
    if (startFrame > endFrame) return;

    this.requestedChunks.add(chunkIndex);

    // Build frame list for this chunk
    const chunkFrames = [];
    for (let f = startFrame; f <= endFrame; f++) {
      // Deduplicate: skip if already in cache, downloading, or already queued
      if (
        !this.cache.has(this.activeVariant, f) &&
        !this.activeRequests.has(f) &&
        !this.queueSet.has(f)
      ) {
        chunkFrames.push(f);
      }
    }

    if (chunkFrames.length === 0) {
      this.emitProgress();
      return;
    }

    // Sort frames: prioritize priorityFrame first, then radiate out in scroll direction
    const center = typeof priorityFrame === "number" ? priorityFrame : (direction > 0 ? startFrame : endFrame);

    chunkFrames.sort((a, b) => {
      // Distance from center
      const distA = Math.abs(a - center);
      const distB = Math.abs(b - center);

      if (distA !== distB) {
        return distA - distB;
      }

      // Favor scrolling direction on ties
      const signA = Math.sign(a - center);
      const signB = Math.sign(b - center);
      if (signA === direction) return -1;
      if (signB === direction) return 1;
      return 0;
    });

    // Mark as queued in the Set
    chunkFrames.forEach((f) => this.queueSet.add(f));

    if (prepend) {
      this.queue = [...chunkFrames, ...this.queue];
    } else {
      this.queue.push(...chunkFrames);
    }
  }

  /**
   * Requests a specific frame as the visitor approaches or navigates to it.
   * Handles:
   * - Immediate priority for targetFrame
   * - Chunk preloading
   * - Distant frame jump detection
   * - Directional prefetching of adjacent chunks
   *
   * @param {number} targetFrame - 1-based frame index
   * @param {number} [direction=1] - 1 for forward, -1 for reverse
   * @returns {HTMLImageElement|null} The cached image if available, or null
   */
  requestFrame(targetFrame, direction = 1) {
    if (!this.activeConfig || this.isDestroyed) return null;

    const total = this.activeConfig.totalFrames;
    const clampedFrame = Math.min(total, Math.max(1, targetFrame));

    const previousFrame = this.lastRequestedFrame;
    this.lastRequestedFrame = clampedFrame;
    this.lastScrollDirection = direction;

    const currentChunk = this.getChunkIndex(clampedFrame);
    const previousChunk = this.getChunkIndex(previousFrame);

    // Synchronize navigation context with FrameCache for active-chunk eviction protection
    if (typeof this.cache.setNavigationContext === "function") {
      this.cache.setNavigationContext({
        activeFrame: clampedFrame,
        activeChunk: currentChunk,
        variant: this.activeVariant,
      });
    }

    // 1. Check for Distant Frame Jump (jumped across > 1 chunk)
    const isDistantJump = Math.abs(currentChunk - previousChunk) > 1;

    if (isDistantJump) {
      this.handleDistantJump(clampedFrame, currentChunk, direction);
    } else {
      // 2. Normal sequential scrolling / scrubbing: ensure target frame's chunk is loaded
      if (!this.cache.has(this.activeVariant, clampedFrame)) {
        this.enqueueChunk(currentChunk, {
          priorityFrame: clampedFrame,
          direction,
          prepend: true,
        });
      }

      // If targetFrame is in queue, move it to the very front
      this.promoteFrameInQueue(clampedFrame);

      // 3. Directional prefetch: check if approaching boundary of current chunk
      this.checkBoundaryPrefetch(clampedFrame, currentChunk, direction);
    }

    this.processQueue();

    // Return image if already cached
    const cached = this.cache.get(this.activeVariant, clampedFrame);
    if (cached) {
      this.lastRenderedFrame = clampedFrame;
    }
    return cached;
  }

  /**
   * Handles a jump to a distant frame:
   * - Cancels in-flight requests that are outside the target chunk.
   * - Purges stale unreached queue items from previous chunks.
   * - Enqueues the target chunk immediately with targetFrame at highest priority.
   *
   * @param {number} targetFrame
   * @param {number} targetChunk
   * @param {number} direction
   */
  handleDistantJump(targetFrame, targetChunk, direction) {
    const { startFrame, endFrame } = this.getChunkRange(targetChunk);

    // Cancel in-flight requests outside the target chunk to free bandwidth
    this.activeRequests.forEach((controller, frameIndex) => {
      if (frameIndex < startFrame || frameIndex > endFrame) {
        try {
          controller.abort();
        } catch (_) {}
        this.activeRequests.delete(frameIndex);
        this.inFlightCount = Math.max(0, this.inFlightCount - 1);
      }
    });

    // Remove pending frames from other chunks that are far away
    const retainedQueue = [];
    this.queueSet.clear();

    this.queue.forEach((f) => {
      if (f >= startFrame && f <= endFrame) {
        retainedQueue.push(f);
        this.queueSet.add(f);
      }
    });

    this.queue = retainedQueue;

    // Enqueue the target chunk with high priority
    this.enqueueChunk(targetChunk, {
      priorityFrame: targetFrame,
      direction,
      prepend: true,
    });
  }

  /**
   * Moves a specific frame to the front of the queue if it is currently waiting.
   *
   * @param {number} frameIndex
   */
  promoteFrameInQueue(frameIndex) {
    if (!this.queueSet.has(frameIndex)) {
      // If not yet queued and not in cache/downloading, enqueue it at head
      if (
        !this.cache.has(this.activeVariant, frameIndex) &&
        !this.activeRequests.has(frameIndex)
      ) {
        this.queue.unshift(frameIndex);
        this.queueSet.add(frameIndex);
      }
      return;
    }

    const idx = this.queue.indexOf(frameIndex);
    if (idx > 0) {
      this.queue.splice(idx, 1);
      this.queue.unshift(frameIndex);
    }
  }

  /**
   * Inspects proximity to chunk boundaries and prefetches the next chunk in the scroll direction.
   *
   * @param {number} frame
   * @param {number} chunkIndex
   * @param {number} direction
   */
  checkBoundaryPrefetch(frame, chunkIndex, direction) {
    const { startFrame, endFrame } = this.getChunkRange(chunkIndex);

    // Forward scrolling: approaching chunk end -> prefetch next chunk
    if (direction > 0 && frame >= endFrame - this.prefetchThreshold) {
      const nextChunk = chunkIndex + 1;
      if (nextChunk <= this.totalChunks && !this.requestedChunks.has(nextChunk)) {
        this.enqueueChunk(nextChunk, { direction: 1, prepend: false });
      }
    }

    // Reverse scrolling: approaching chunk start -> prefetch previous chunk
    if (direction < 0 && frame <= startFrame + this.prefetchThreshold) {
      const prevChunk = chunkIndex - 1;
      if (prevChunk >= 1 && !this.requestedChunks.has(prevChunk)) {
        this.enqueueChunk(prevChunk, { direction: -1, prepend: false });
      }
    }
  }

  /**
   * Returns the closest loaded frame to the requested target frame.
   * Guarantees the canvas never goes blank during scrubbing.
   *
   * @param {number} targetFrame
   * @param {number} [searchRadius=30]
   * @returns {{ image: HTMLImageElement|null, frameIndex: number }}
   */
  getClosestLoadedFrame(targetFrame, searchRadius = 30) {
    if (!this.activeConfig) return { image: null, frameIndex: 1 };

    // 1. Direct hit
    const exact = this.cache.get(this.activeVariant, targetFrame);
    if (exact) {
      this.lastRenderedFrame = targetFrame;
      return { image: exact, frameIndex: targetFrame };
    }

    // 2. Search nearest neighbors within searchRadius
    const total = this.activeConfig.totalFrames;
    for (let offset = 1; offset <= searchRadius; offset++) {
      // Check in reverse of last direction first (favoring recently viewed)
      const backward = targetFrame - offset;
      if (backward >= 1) {
        const bImg = this.cache.get(this.activeVariant, backward);
        if (bImg) {
          return { image: bImg, frameIndex: backward };
        }
      }

      const forward = targetFrame + offset;
      if (forward <= total) {
        const fImg = this.cache.get(this.activeVariant, forward);
        if (fImg) {
          return { image: fImg, frameIndex: forward };
        }
      }
    }

    // 3. Fallback to last successfully rendered frame
    const lastImg = this.cache.get(this.activeVariant, this.lastRenderedFrame);
    if (lastImg) {
      return { image: lastImg, frameIndex: this.lastRenderedFrame };
    }

    // 4. Ultimate fallback: frame 1 (poster)
    const poster = this.cache.get(this.activeVariant, 1);
    return { image: poster, frameIndex: 1 };
  }

  /**
   * Worker pump: processes frames from the priority queue up to the concurrency limit.
   */
  processQueue() {
    if (this.isDestroyed || this.isPaused || !this.activeConfig) return;

    while (this.inFlightCount < this.concurrency && this.queue.length > 0) {
      const frameIndex = this.queue.shift();
      this.queueSet.delete(frameIndex);

      // Deduplicate: skip if already in cache or active
      if (
        this.cache.has(this.activeVariant, frameIndex) ||
        this.activeRequests.has(frameIndex)
      ) {
        continue;
      }

      this.inFlightCount++;
      const controller = new AbortController();
      this.activeRequests.set(frameIndex, controller);

      const url = getFrameUrl(this.activeVariant, frameIndex);

      loadFrameImage(url, controller.signal)
        .then((img) => {
          this.activeRequests.delete(frameIndex);
          this.inFlightCount--;

          if (img && !this.isDestroyed) {
            this.cache.set(this.activeVariant, frameIndex, img);

            // Special event for initial poster
            if (frameIndex === 1 && this.onFirstFrameReadyCallback) {
              this.onFirstFrameReadyCallback(img);
            }

            if (this.onFrameLoadedCallback) {
              this.onFrameLoadedCallback(frameIndex, img);
            }

            this.emitProgress();
          }

          this.processQueue();
        })
        .catch(() => {
          this.activeRequests.delete(frameIndex);
          this.inFlightCount--;
          this.processQueue();
        });
    }
  }

  /**
   * Schedules the next pump cycle.
   */
  scheduleNextPump() {
    if (this.queue.length > 0 && this.inFlightCount < this.concurrency) {
      setTimeout(() => this.processQueue(), 4);
    }
  }

  /**
   * Emits progress events for initial 50-frame buffering and overall sequence stats.
   */
  emitProgress() {
    if (!this.activeConfig) return;

    const initialBatch =
      this.activeConfig.initialBatchSize ||
      Math.min(this.chunkSize, this.activeConfig.totalFrames);
    const { loadedCount: initialLoaded } = this.cache.getProgress(
      this.activeVariant,
      initialBatch
    );

    const initialPercent = Math.min(100, Math.round((initialLoaded / initialBatch) * 100));
    // Ready when initial progressive batch completes or at least 10 frames + poster ready
    const isInitialReady =
      initialLoaded >= initialBatch ||
      (initialLoaded >= 10 && Boolean(this.cache.get(this.activeVariant, 1)));

    const { loadedCount: totalLoaded } = this.cache.getProgress(
      this.activeVariant,
      this.activeConfig.totalFrames
    );

    if (this.onProgressCallback) {
      this.onProgressCallback({
        loadedCount: totalLoaded,
        initialLoaded,
        initialBatchSize: initialBatch,
        initialPercent,
        isInitialReady,
        totalFrames: this.activeConfig.totalFrames,
        variant: this.activeVariant,
        activeChunks: Array.from(this.requestedChunks),
      });
    }

    if (isInitialReady && this.onInitialReadyCallback) {
      this.onInitialReadyCallback();
      this.onInitialReadyCallback = null;
    }
  }

  /**
   * Cancels all pending in-flight requests.
   */
  cancelPendingRequests() {
    this.activeRequests.forEach((controller) => {
      try {
        controller.abort();
      } catch (_) {}
    });
    this.activeRequests.clear();
    this.inFlightCount = 0;
  }

  /**
   * Destroys the manager, cancels all requests, and clears queues.
   */
  destroy() {
    this.isDestroyed = true;
    this.cancelPendingRequests();
    this.queue = [];
    this.queueSet.clear();
    this.requestedChunks.clear();
    this.onProgressCallback = null;
    this.onInitialReadyCallback = null;
    this.onFirstFrameReadyCallback = null;
    this.onFrameLoadedCallback = null;
  }
}
