/**
 * Frame Cache Module
 *
 * Provides dedicated memory storage for decoded Image instances across
 * desktop and mobile variants. Prevents duplicate network downloads,
 * provides instant O(1) frame retrieval during scroll scrubbing,
 * and maintains loaded bitmasks for progress calculation.
 */

export class FrameCache {
  /**
   * @param {number} [maxCapacity=400] Optional max frames before eviction (0 = unbounded)
   */
  constructor(maxCapacity = 400) {
    this.maxCapacity = maxCapacity;
    /** @type {Map<string, HTMLImageElement>} */
    this.cache = new Map();
    /** @type {Map<string, Uint8Array>} */
    this.variantMasks = new Map();
  }

  /**
   * Generates a composite key for the variant and frame index.
   *
   * @param {string} variant - 'desktop' | 'mobile'
   * @param {number} index - 1-based frame index
   * @returns {string} Composite cache key
   */
  getKey(variant, index) {
    return `${variant}:${index}`;
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
   * Retrieves a frame from the cache. Updates LRU access order.
   *
   * @param {string} variant
   * @param {number} index
   * @returns {HTMLImageElement|null}
   */
  get(variant, index) {
    const key = this.getKey(variant, index);
    const item = this.cache.get(key);
    if (!item) return null;

    // Refresh position for LRU
    this.cache.delete(key);
    this.cache.set(key, item);
    return item;
  }

  /**
   * Stores a loaded image into the cache.
   *
   * @param {string} variant
   * @param {number} index
   * @param {HTMLImageElement} image
   */
  set(variant, index, image) {
    const key = this.getKey(variant, index);

    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.maxCapacity > 0 && this.cache.size >= this.maxCapacity) {
      // Evict oldest accessed item
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, image);
    this.markLoaded(variant, index);
  }

  /**
   * Records that this index has loaded in the variant's mask.
   *
   * @param {string} variant
   * @param {number} index
   */
  markLoaded(variant, index) {
    let mask = this.variantMasks.get(variant);
    if (!mask) {
      mask = new Uint8Array(256); // Adequate for sequence lengths
      this.variantMasks.set(variant, mask);
    }
    if (index >= mask.length) {
      const expanded = new Uint8Array(index + 64);
      expanded.set(mask);
      mask = expanded;
      this.variantMasks.set(variant, mask);
    }
    mask[index] = 1;
  }

  /**
   * Computes the number of loaded frames for a variant within a specified range.
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
   * Clears the entire cache or specific variant.
   *
   * @param {string} [variant] If omitted, clears all variants
   */
  clear(variant) {
    if (!variant) {
      this.cache.clear();
      this.variantMasks.clear();
      return;
    }

    const prefix = `${variant}:`;
    for (const key of this.cache.keys()) {
      if (key.startsWith(prefix)) {
        this.cache.delete(key);
      }
    }
    this.variantMasks.delete(variant);
  }

  /**
   * Returns current total items stored.
   * @returns {number}
   */
  get size() {
    return this.cache.size;
  }
}

// Default singleton instance
export const defaultFrameCache = new FrameCache();
