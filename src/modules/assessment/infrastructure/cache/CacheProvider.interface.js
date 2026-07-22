/**
 * Interface / Base Class for Cache Providers.
 * Abstract interface ready for Redis, Memcached, or In-Memory caching.
 */
export class CacheProvider {
  /**
   * Retrieves a value from the cache.
   * @param {string} key
   * @returns {Promise<any|null>}
   */
  async get(key) {
    throw new Error("get() must be implemented by concrete cache provider");
  }

  /**
   * Sets a value in the cache with an optional TTL in seconds.
   * @param {string} key
   * @param {any} value
   * @param {number} [ttlSeconds=300]
   * @returns {Promise<void>}
   */
  async set(key, value, ttlSeconds = 300) {
    throw new Error("set() must be implemented by concrete cache provider");
  }

  /**
   * Deletes a key from the cache.
   * @param {string} key
   * @returns {Promise<void>}
   */
  async del(key) {
    throw new Error("del() must be implemented by concrete cache provider");
  }
}
