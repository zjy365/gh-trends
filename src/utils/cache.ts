interface CacheItem {
  data: any;
  expiry: number;
}

// 内存缓存
const memoryCache: Map<string, CacheItem> = new Map();

// 默认缓存配置
const DEFAULT_TTL = 3600; // 1小时
const DEFAULT_MAX_SIZE = 100;

export class Cache {
  private enabled: boolean;
  private maxSize: number;

  constructor(enabled = true, maxSize = DEFAULT_MAX_SIZE) {
    this.enabled = enabled;
    this.maxSize = maxSize;
  }

  /**
   * 从缓存获取数据
   * @param key 缓存键
   * @returns 缓存数据或null
   */
  get(key: string): any | null {
    if (!this.enabled) return null;

    const item = memoryCache.get(key);
    if (!item) return null;

    // 检查是否过期
    if (Date.now() > item.expiry) {
      memoryCache.delete(key);
      return null;
    }

    return item.data;
  }

  /**
   * 存储数据到缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttlSeconds 缓存时间(秒)
   */
  set(key: string, data: any, ttlSeconds = DEFAULT_TTL): void {
    if (!this.enabled) return;

    // 计算过期时间
    const expiry = Date.now() + ttlSeconds * 1000;

    // 保存到缓存
    memoryCache.set(key, { data, expiry });

    // 清理过多的缓存项
    if (memoryCache.size > this.maxSize) {
      this.prune();
    }
  }

  /**
   * 清除所有缓存
   */
  clear(): void {
    memoryCache.clear();
  }

  /**
   * 清理过期缓存
   */
  private prune(): void {
    // 如果缓存大小不超过限制，不需要清理
    if (memoryCache.size <= this.maxSize) return;

    // 获取所有缓存条目，按过期时间排序
    const entries = Array.from(memoryCache.entries()).sort((a, b) => a[1].expiry - b[1].expiry);

    // 计算需要删除的数量
    const deleteCount = memoryCache.size - this.maxSize;

    // 删除最早过期的条目
    for (let i = 0; i < deleteCount; i++) {
      memoryCache.delete(entries[i][0]);
    }
  }
}

// 导出默认实例
export const cache = new Cache();

// 简便函数
export function cacheGet(key: string): any | null {
  return cache.get(key);
}

export function cacheSet(key: string, data: any, ttlSeconds = DEFAULT_TTL): void {
  cache.set(key, data, ttlSeconds);
}

export function clearCache(): void {
  cache.clear();
}
