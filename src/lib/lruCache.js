/**
 * High-performance Least Recently Used (LRU) Cache
 * Optimized for ImageBitmaps and memory-heavy decoded media.
 */
export class LRUCache {
  /**
   * @param {number} maxCapacity Maximum number of entries to retain.
   * @param {((key: any, value: any) => void) | null} onEvict Optional cleanup hook invoked when an entry is evicted.
   */
  constructor(maxCapacity = 80, onEvict = null) {
    this.maxCapacity = Math.max(1, maxCapacity);
    this.onEvict = onEvict;
    this.cache = new Map();
  }

  /**
   * Retrieves an item and marks it as most recently used.
   * @param {any} key
   * @returns {any}
   */
  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    // Refresh access order (delete and re-insert)
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Checks if key exists without altering access order.
   * @param {any} key
   * @returns {boolean}
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Inserts or updates an item in the cache.
   * If capacity is exceeded, evicts the oldest entry and invokes onEvict.
   * @param {any} key
   * @param {any} value
   */
  put(key, value) {
    if (this.cache.has(key)) {
      // If updating existing, remove old entry first
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxCapacity) {
      // Evict oldest (first element in Map insertion order)
      const oldestKey = this.cache.keys().next().value;
      const oldestValue = this.cache.get(oldestKey);
      this.cache.delete(oldestKey);
      if (typeof this.onEvict === "function") {
        try {
          this.onEvict(oldestKey, oldestValue);
        } catch (err) {
          console.warn("[LRUCache] Error during eviction callback:", err);
        }
      }
    }
    this.cache.set(key, value);
  }

  /**
   * Deletes a specific key from the cache.
   * @param {any} key
   * @returns {boolean}
   */
  delete(key) {
    if (this.cache.has(key)) {
      const value = this.cache.get(key);
      this.cache.delete(key);
      if (typeof this.onEvict === "function") {
        try {
          this.onEvict(key, value);
        } catch (err) {
          console.warn("[LRUCache] Error during eviction callback:", err);
        }
      }
      return true;
    }
    return false;
  }

  /**
   * Clears the entire cache, executing onEvict for all retained items.
   */
  clear() {
    if (typeof this.onEvict === "function") {
      for (const [key, value] of this.cache.entries()) {
        try {
          this.onEvict(key, value);
        } catch (err) {
          console.warn("[LRUCache] Error clearing entry:", key, err);
        }
      }
    }
    this.cache.clear();
  }

  /**
   * Current number of items in cache.
   */
  get size() {
    return this.cache.size;
  }

  /**
   * Returns array of keys currently in cache.
   */
  keys() {
    return Array.from(this.cache.keys());
  }
}
