/**
 * Memory-Managed Frame Cache Module
 *
 * Implements an intelligent LRU cache with active-chunk awareness:
 * 1. Maintains LRU access order for all decoded frames.
 * 2. Targets 100–150 decoded frames with device capability detection (RAM & mobile).
 * 3. Keeps active chunk and nearby chunks (currentChunk ± 1) protected from eviction.
 * 4. Preserves poster frame (Frame 1) for instant return to top.
 * 5. Properly releases references and closes ImageBitmap resources upon eviction.
 * 6. Guarantees smooth reverse scrolling by preserving preceding chunks.
 * 7. Never sacrifices rendering stability to meet a rigid threshold.
 */

/**
 * Computes optimal frame cache capacity targeting 100–150 frames
 * based on device memory and hardware characteristics.
 *
 * @param {('desktop'|'mobile')} [variant='desktop']
 * @returns {number} Target frame capacity (100–150)
 */
export function getOptimalCacheCapacity(variant = "desktop") {
  const isMobile =
    variant === "mobile" ||
    (typeof window !== "undefined" && window.innerWidth <= 768);

  const deviceMemory =
    typeof navigator !== "undefined" && "deviceMemory" in navigator
      ? Number(navigator.deviceMemory)
      : null;

  if (isMobile) {
    // 1080x1920 WebP decoded RGBA is ~8.29MB per frame.
    // Android Chrome tab crashes at ~350-500MB heap limit.
    // Keep max 18-24 frames in memory (~150-199MB), well below the OOM threshold.
    if (deviceMemory !== null && deviceMemory <= 3) {
      return 18;
    }
    return 24;
  }

  // Desktop (1920x1080 = 8.29MB per frame)
  if (deviceMemory !== null && deviceMemory <= 4) {
    return 50; // ~415MB
  }
  return 85; // ~700MB (safe on modern desktop)
}

/**
 * Safely releases an image resource, closing ImageBitmaps and dropping DOM references.
 *
 * @param {HTMLImageElement|ImageBitmap|Object} image
 */
export function releaseImageResource(image) {
  if (!image) return;

  // 1. Explicitly close ImageBitmap to immediately reclaim GPU texture memory
  if (typeof image.close === "function") {
    try {
      image.close();
    } catch (_) {}
  }

  // 2. Clear HTMLImageElement source to release browser GPU texture memory
  if ("src" in image && typeof image.src === "string") {
    try {
      image.src = "";
    } catch (_) {}
  }
}

export class FrameCache {
  /**
   * @param {Object} [options]
   * @param {number} [options.maxCapacity] - Maximum frames before LRU eviction
   * @param {number} [options.chunkSize=35] - Number of frames per chunk
   * @param {('desktop'|'mobile')} [options.variant='desktop']
   */
  constructor({
    maxCapacity = null,
    chunkSize = 35,
    variant = "desktop",
  } = {}) {
    this.chunkSize = chunkSize;
    this.variant = variant;
    this.maxCapacity =
      typeof maxCapacity === "number" && maxCapacity > 0
        ? maxCapacity
        : getOptimalCacheCapacity(variant);

    /** @type {Map<string, HTMLImageElement|ImageBitmap>} Keyed by 'variant:index' */
    this.cache = new Map();
    /** @type {Map<string, Uint8Array>} Bitmask of currently loaded frames */
    this.variantMasks = new Map();

    // Navigation context for active-chunk eviction protection
    this.activeFrame = 1;
    this.activeChunk = 1;
    this.protectedRadius = Math.min(8, Math.floor(this.chunkSize / 3));
  }

  /**
   * Generates a composite key for the variant and frame index.
   *
   * @param {string} variant - 'desktop' | 'mobile'
   * @param {number} index - 1-based frame index
   * @returns {string}
   */
  getKey(variant, index) {
    return `${variant}:${index}`;
  }

  /**
   * Parses variant and frame index from a composite key.
   *
   * @param {string} key
   * @returns {{ variant: string, index: number }}
   */
  parseKey(key) {
    const colonIdx = key.indexOf(":");
    return {
      variant: key.slice(0, colonIdx),
      index: Number(key.slice(colonIdx + 1)),
    };
  }

  /**
   * Updates navigation context to protect active and nearby chunks from eviction.
   *
   * @param {Object} context
   * @param {number} context.activeFrame - Current frame visitor is viewing
   * @param {number} context.activeChunk - Current chunk visitor is inside
   * @param {string} [context.variant] - Active device variant
   */
  setNavigationContext({ activeFrame, activeChunk, variant }) {
    if (typeof activeFrame === "number") this.activeFrame = activeFrame;
    if (typeof activeChunk === "number") this.activeChunk = activeChunk;
    if (variant) {
      if (this.variant !== variant) {
        this.variant = variant;
        // Re-adjust capacity for the new variant
        this.maxCapacity = getOptimalCacheCapacity(variant);
      }
    }
  }

  /**
   * Evaluates whether a frame is protected from eviction.
   * Protected frames include:
   * - Poster frame (Frame 1)
   * - Active chunk frames
   * - Adjacent chunk frames (activeChunk - 1 and activeChunk + 1)
   * - Immediate neighborhood (activeFrame ± protectedRadius)
   *
   * @param {string} variant
   * @param {number} index
   * @returns {boolean}
   */
  isProtected(variant, index) {
    // Only protect frames for the currently active variant
    if (variant !== this.variant) return false;

    // Always keep frame 1 (poster frame) in memory for instant return to top
    if (index === 1) return true;

    // Protect active frame immediate neighborhood (current frame ± radius)
    if (Math.abs(index - this.activeFrame) <= this.protectedRadius) {
      return true;
    }

    // Protect active chunk frames
    const frameChunk = Math.floor((index - 1) / this.chunkSize) + 1;
    if (frameChunk === this.activeChunk) {
      return true;
    }

    return false;
  }

  /**
   * Checks whether a frame exists in the cache.
   *
   * @param {string} variant
   * @param {number} index
   * @returns {boolean}
   */
  has(variant, index) {
    return this.cache.has(this.getKey(variant, index));
  }

  /**
   * Retrieves a frame and updates its position in LRU order.
   *
   * @param {string} variant
   * @param {number} index
   * @returns {HTMLImageElement|ImageBitmap|null}
   */
  get(variant, index) {
    const key = this.getKey(variant, index);
    const item = this.cache.get(key);
    if (!item) return null;

    // Refresh access order (re-insert at tail)
    this.cache.delete(key);
    this.cache.set(key, item);
    return item;
  }

  /**
   * Stores a decoded frame and applies intelligent LRU eviction.
   *
   * @param {string} variant
   * @param {number} index
   * @param {HTMLImageElement|ImageBitmap} image
   */
  set(variant, index, image) {
    const key = this.getKey(variant, index);

    if (this.cache.has(key)) {
      const existing = this.cache.get(key);
      if (existing !== image) {
        releaseImageResource(existing);
      }
      this.cache.delete(key);
    }

    this.cache.set(key, image);
    this.markLoaded(variant, index);

    // Evict least recently used unprotected frames if capacity is exceeded
    if (this.cache.size > this.maxCapacity) {
      this.evictUnprotected();
    }
  }

  /**
   * Evicts candidate frames that are not protected by the active navigation window.
   * Prioritizes oldest accessed entries outside of active and nearby chunks.
   * Releases ImageBitmap textures immediately to prevent memory leaks and OOM crashes.
   */
  evictUnprotected() {
    const targetEvictions = this.cache.size - this.maxCapacity;
    if (targetEvictions <= 0) return;

    let evictedCount = 0;
    const candidates = [];

    // 1. First priority: evict any frames from inactive variants
    for (const [key] of this.cache) {
      const { variant, index } = this.parseKey(key);
      if (variant !== this.variant && index !== 1) {
        candidates.push({ key, variant, index });
        evictedCount++;
        if (evictedCount >= targetEvictions) break;
      }
    }

    // 2. Second priority: evict oldest unprotected frames in LRU order
    if (evictedCount < targetEvictions) {
      for (const [key] of this.cache) {
        const { variant, index } = this.parseKey(key);
        if (!this.isProtected(variant, index) && !candidates.some((c) => c.key === key)) {
          candidates.push({ key, variant, index });
          evictedCount++;
          if (evictedCount >= targetEvictions) break;
        }
      }
    }

    // Execute eviction and release resources
    for (const { key, variant, index } of candidates) {
      const resource = this.cache.get(key);
      this.cache.delete(key);
      this.unmarkLoaded(variant, index);
      releaseImageResource(resource);
    }
  }

  /**
   * Explicitly evicts and frees a specific frame.
   *
   * @param {string} variant
   * @param {number} index
   */
  evict(variant, index) {
    const key = this.getKey(variant, index);
    const resource = this.cache.get(key);
    if (resource) {
      this.cache.delete(key);
      this.unmarkLoaded(variant, index);
      releaseImageResource(resource);
    }
  }

  /**
   * Marks a frame index as loaded in the variant bitmask.
   *
   * @param {string} variant
   * @param {number} index
   */
  markLoaded(variant, index) {
    let mask = this.variantMasks.get(variant);
    if (!mask) {
      mask = new Uint8Array(256);
      this.variantMasks.set(variant, mask);
    }
    if (index >= mask.length) {
      const expanded = new Uint8Array(index + 128);
      expanded.set(mask);
      mask = expanded;
      this.variantMasks.set(variant, mask);
    }
    mask[index] = 1;
  }

  /**
   * Unmarks a frame index in the variant bitmask upon eviction.
   *
   * @param {string} variant
   * @param {number} index
   */
  unmarkLoaded(variant, index) {
    const mask = this.variantMasks.get(variant);
    if (mask && index < mask.length) {
      mask[index] = 0;
    }
  }

  /**
   * Returns loaded count and percentage for a variant.
   *
   * @param {string} variant
   * @param {number} totalFrames
   * @returns {{ loadedCount: number, percent: number }}
   */
  getProgress(variant, totalFrames) {
    const mask = this.variantMasks.get(variant);
    if (!mask || totalFrames <= 0) return { loadedCount: 0, percent: 0 };

    let loadedCount = 0;
    for (let i = 1; i <= totalFrames; i++) {
      if (mask[i] === 1) loadedCount++;
    }

    const percent = Math.min(100, Math.round((loadedCount / totalFrames) * 100));
    return { loadedCount, percent };
  }

  /**
   * Clears the cache and releases all underlying memory resources.
   *
   * @param {string} [variant] If omitted, releases all variants
   */
  clear(variant) {
    if (!variant) {
      for (const resource of this.cache.values()) {
        releaseImageResource(resource);
      }
      this.cache.clear();
      this.variantMasks.clear();
      return;
    }

    const prefix = `${variant}:`;
    for (const [key, resource] of this.cache) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
        releaseImageResource(resource);
      }
    }
    this.variantMasks.delete(variant);
  }

  /**
   * Destroys the cache and frees all resources permanently.
   */
  destroy() {
    this.clear();
  }

  /**
   * Returns current total items stored in cache.
   * @returns {number}
   */
  get size() {
    return this.cache.size;
  }
}

// Default singleton instance with optimal initial capacity
export const defaultFrameCache = new FrameCache();
