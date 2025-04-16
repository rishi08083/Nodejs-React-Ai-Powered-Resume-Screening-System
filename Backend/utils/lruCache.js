const { LRUCache } = require("lru-cache");
class LRUCacheOptimized {
  constructor(options = {}) {
    this.maxSize = options.maxSize || 1000;
    this.maxAge = options.maxAge || 60 * 60 * 1000;
    this.cache = new LRUCache({
      max: this.maxSize,
      maxAge: this.maxAge,
    });
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      sets: 0,
      gets: 0,
    };
  }
  get(key) {
    this.stats.gets++;
    const value = this.cache.get(key);
    if (value) {
      this.stats.hits++;
    } else {
      this.stats.misses++;
    }
    return value;
  }
  set(key, value) {
    this.stats.sets++;
    this.cache.set(key, value);
    console.log("Cached data successfully");
  }
  delete(key) {
    return this.cache.delete(key);
  }
  clear() {
    this.cache.clear();
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      sets: 0,
    };
  }
  getStats() {
    return this.stats;
  }
}
module.exports = LRUCacheOptimized;
