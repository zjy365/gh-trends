interface CacheItem {
  data: any
  expiry: number
}

// Memory cache
const memoryCache: Map<string, CacheItem> = new Map()

// Default cache configuration
const DEFAULT_TTL = 3600 // 1 hour
const DEFAULT_MAX_SIZE = 100

export class Cache {
  private enabled: boolean
  private maxSize: number

  constructor(enabled = true, maxSize = DEFAULT_MAX_SIZE) {
    this.enabled = enabled
    this.maxSize = maxSize
  }

  /**
   * Get data from cache
   * @param key Cache key
   * @returns Cached data or null
   */
  get(key: string): any | null {
    if (!this.enabled) return null

    const item = memoryCache.get(key)
    if (!item) return null

    // Check if expired
    if (Date.now() > item.expiry) {
      memoryCache.delete(key)
      return null
    }

    return item.data
  }

  /**
   * Store data to cache
   * @param key Cache key
   * @param data Cache data
   * @param ttlSeconds Cache time-to-live (seconds)
   */
  set(key: string, data: any, ttlSeconds = DEFAULT_TTL): void {
    if (!this.enabled) return

    // Calculate expiry time
    const expiry = Date.now() + ttlSeconds * 1000

    // Save to cache
    memoryCache.set(key, { data, expiry })

    // Clean up excess cache items
    if (memoryCache.size > this.maxSize) {
      this.prune()
    }
  }

  /**
   * Clear all cache
   */
  clear(): void {
    memoryCache.clear()
  }

  /**
   * Clean expired cache
   */
  private prune(): void {
    // If cache size doesn't exceed limit, no cleanup needed
    if (memoryCache.size <= this.maxSize) return

    // Get all cache entries, sorted by expiry time
    const entries = Array.from(memoryCache.entries()).sort((a, b) => a[1].expiry - b[1].expiry)

    // Calculate number of entries to delete
    const deleteCount = memoryCache.size - this.maxSize

    // Delete entries that expire earliest
    for (let i = 0; i < deleteCount; i++) {
      memoryCache.delete(entries[i][0])
    }
  }
}

// Export default instance
export const cache = new Cache()

// Convenience functions
export function cacheGet(key: string): any | null {
  return cache.get(key)
}

export function cacheSet(key: string, data: any, ttlSeconds = DEFAULT_TTL): void {
  cache.set(key, data, ttlSeconds)
}

export function clearCache(): void {
  cache.clear()
}
