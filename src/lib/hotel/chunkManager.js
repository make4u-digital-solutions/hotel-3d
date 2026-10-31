/**
 * Chunk & Queue Manager Module
 *
 * Coordinates concurrent frame streaming with priority queuing.
 * Ensures the initial critical batch is buffered before interaction,
 * prioritizes immediate surrounding frames when scrubbing, and loads
 * remaining frames in the background via idle tasks.
 */

import { getFrameUrl } from "./config";
import { loadFrameImage } from "./frameLoader";

export class ChunkManager {
  /**
   * @param {Object} options
   * @param {import('./frameCache').FrameCache} options.cache - Shared frame cache instance
   * @param {number} [options.concurrency=5] - Maximum parallel network requests
   */
  constructor({ cache, concurrency = 5 }) {
    this.cache = cache;
    this.concurrency = concurrency;

    /** @type {string} Current sequence variant ('desktop' | 'mobile') */
    this.activeVariant = "desktop";
    /** @type {typeof import('./config').SEQUENCE_CONFIG['desktop']} */
    this.activeConfig = null;

    /** @type {number[]} Priority queue of frame numbers to fetch */
    this.queue = [];
    /** @type {Map<number, AbortController>} In-flight requests */
    this.activeRequests = new Map();
    this.inFlightCount = 0;
    this.isDestroyed = false;
    this.isPaused = false;

    // Callbacks
    this.onProgressCallback = null;
    this.onInitialReadyCallback = null;
    this.onAllLoadedCallback = null;

    // Bound worker pump
    this.processQueue = this.processQueue.bind(this);
  }

  /**
   * Sets or switches the active sequence configuration and begins preloading.
   *
   * @param {typeof import('./config').SEQUENCE_CONFIG['desktop']} sequenceConfig
   */
  setSequence(sequenceConfig) {
    if (!sequenceConfig) return;

    // If changing variant, abort in-flight requests from old sequence
    if (this.activeVariant !== sequenceConfig.id) {
      this.cancelPendingRequests();
    }

    this.activeVariant = sequenceConfig.id;
    this.activeConfig = sequenceConfig;
    this.queue = [];

    // Stage initial batch into priority queue
    const initialBatch = sequenceConfig.initialBatchSize || 30;
    const initialIndices = [];
    for (let i = 1; i <= Math.min(initialBatch, sequenceConfig.totalFrames); i++) {
      initialIndices.push(i);
    }

    // Stage remaining sequence
    const remainingIndices = [];
    for (let i = initialBatch + 1; i <= sequenceConfig.totalFrames; i++) {
      remainingIndices.push(i);
    }

    this.queue = [...initialIndices, ...remainingIndices];
    this.processQueue();
  }

  /**
   * Dynamically boosts priority of frames surrounding a target index (scrubbing window).
   *
   * @param {number} targetIndex - Active frame index the user is viewing
   * @param {number} [radius=12] - Number of frames ahead and behind to prioritize
   */
  prioritizeWindow(targetIndex, radius = 12) {
    if (!this.activeConfig || this.isDestroyed) return;

    const total = this.activeConfig.totalFrames;
    const prioritized = [];

    // Prioritize forward first (typical scroll direction)
    for (let i = 0; i <= radius; i++) {
      const forward = targetIndex + i;
      if (forward <= total && !this.cache.has(this.activeVariant, forward)) {
        prioritized.push(forward);
      }
      if (i > 0) {
        const backward = targetIndex - i;
        if (backward >= 1 && !this.cache.has(this.activeVariant, backward)) {
          prioritized.push(backward);
        }
      }
    }

    if (prioritized.length > 0) {
      const prioritySet = new Set(prioritized);
      const filteredQueue = this.queue.filter((idx) => !prioritySet.has(idx));
      this.queue = [...prioritized, ...filteredQueue];
      this.processQueue();
    }
  }

  /**
   * Processes queued frames up to the concurrency ceiling.
   */
  processQueue() {
    if (this.isDestroyed || this.isPaused || !this.activeConfig) return;

    while (this.inFlightCount < this.concurrency && this.queue.length > 0) {
      const frameIndex = this.queue.shift();

      // Skip if already in cache or currently loading
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
            this.emitProgress();
          }

          this.scheduleNextPump();
        })
        .catch(() => {
          this.activeRequests.delete(frameIndex);
          this.inFlightCount--;
          this.scheduleNextPump();
        });
    }
  }

  /**
   * Schedules the next pump cycle using requestIdleCallback where available.
   */
  scheduleNextPump() {
    if (typeof window !== "undefined" && "requestIdleCallback" in window) {
      window.requestIdleCallback(() => this.processQueue(), { timeout: 80 });
    } else {
      setTimeout(() => this.processQueue(), 16);
    }
  }

  /**
   * Emits progress events to subscribers.
   */
  emitProgress() {
    if (!this.activeConfig) return;

    const total = this.activeConfig.totalFrames;
    const initialBatch = this.activeConfig.initialBatchSize || 30;
    const { loadedCount } = this.cache.getProgress(this.activeVariant, total);

    const initialPercent = Math.min(100, Math.round((loadedCount / initialBatch) * 100));
    const totalPercent = Math.min(100, Math.round((loadedCount / total) * 100));

    const isInitialReady = loadedCount >= initialBatch;
    const isAllLoaded = loadedCount >= total;

    if (this.onProgressCallback) {
      this.onProgressCallback({
        loadedCount,
        totalFrames: total,
        initialBatchSize: initialBatch,
        initialPercent,
        totalPercent,
        isInitialReady,
        isAllLoaded,
        variant: this.activeVariant,
      });
    }

    if (isInitialReady && this.onInitialReadyCallback) {
      this.onInitialReadyCallback();
      this.onInitialReadyCallback = null; // Fire once
    }

    if (isAllLoaded && this.onAllLoadedCallback) {
      this.onAllLoadedCallback();
      this.onAllLoadedCallback = null; // Fire once
    }
  }

  /**
   * Cancels all currently in-flight network requests.
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
   * Pauses the queue worker.
   */
  pause() {
    this.isPaused = true;
  }

  /**
   * Resumes the queue worker.
   */
  resume() {
    this.isPaused = false;
    this.processQueue();
  }

  /**
   * Destroys manager, cancels all active fetches, and flushes queue.
   */
  destroy() {
    this.isDestroyed = true;
    this.cancelPendingRequests();
    this.queue = [];
    this.onProgressCallback = null;
    this.onInitialReadyCallback = null;
    this.onAllLoadedCallback = null;
  }
}
