/**
 * High-performance Least Recently Used (LRU) Cache
 * Designed for efficient image and ImageBitmap memory management.
 */
export class LRUCache {
  /**
   * @param {number} capacity - Maximum number of items before eviction
   * @param {Function} [onEvict] - Optional callback when an item is evicted: (key, value) => void
   */
  constructor(capacity = 80, onEvict = null) {
    if (capacity <= 0) {
      throw new Error("LRUCache capacity must be greater than 0");
    }
    this.capacity = capacity;
    this.onEvict = onEvict;
    this.cache = new Map();
  }

  /**
   * Get an item and mark it as most recently used.
   * @param {*} key
   * @returns {*}
   */
  get(key) {
    if (!this.cache.has(key)) return undefined;
    const value = this.cache.get(key);
    // Refresh order by re-inserting
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  /**
   * Check if a key is present without updating LRU order.
   * @param {*} key
   * @returns {boolean}
   */
  has(key) {
    return this.cache.has(key);
  }

  /**
   * Peek at value without updating LRU order.
   * @param {*} key
   * @returns {*}
   */
  peek(key) {
    return this.cache.get(key);
  }

  /**
   * Store an item. If capacity exceeded, evicts the least recently used item.
   * @param {*} key
   * @param {*} value
   */
  set(key, value) {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.capacity) {
      // First key in Map iterator is the oldest / least recently used
      const oldestKey = this.cache.keys().next().value;
      const oldestValue = this.cache.get(oldestKey);
      this.cache.delete(oldestKey);
      if (this.onEvict) {
        try {
          this.onEvict(oldestKey, oldestValue);
        } catch (e) {
          console.error("Error in LRUCache onEvict:", e);
        }
      }
    }
    this.cache.set(key, value);
  }

  /**
   * Remove a specific key
   * @param {*} key
   * @returns {boolean}
   */
  delete(key) {
    if (!this.cache.has(key)) return false;
    const value = this.cache.get(key);
    this.cache.delete(key);
    if (this.onEvict) {
      try {
        this.onEvict(key, value);
      } catch (e) {
        console.error("Error in LRUCache onEvict:", e);
      }
    }
    return true;
  }

  /**
   * Clear all entries, notifying evictions
   */
  clear() {
    if (this.onEvict) {
      for (const [key, value] of this.cache.entries()) {
        try {
          this.onEvict(key, value);
        } catch (e) {
          console.error("Error in LRUCache onEvict:", e);
        }
      }
    }
    this.cache.clear();
  }

  /**
   * Number of items currently in cache
   * @returns {number}
   */
  get size() {
    return this.cache.size;
  }

  /**
   * Get all active keys
   * @returns {Array}
   */
  keys() {
    return Array.from(this.cache.keys());
  }
}
