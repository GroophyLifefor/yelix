import type { Ctx } from "@/src/types/types.d.ts";

/**
 * Represents a cached item with its value and expiration time.
 * @template T The type of the cached value
 */
interface CacheItem<T> {
  /** The cached value */
  value: T;
  /** Timestamp when the item expires (in milliseconds since epoch), or -1 for no expiration */
  expiresAt: number;
}

/**
 * Represents either a string key from the ttlEnum or a direct millisecond value
 */
export type TTLValue = keyof typeof ttlEnum | number;

/**
 * Enumeration of common TTL (Time-To-Live) values in a human-readable format
 * Values are in milliseconds
 */
export const ttlEnum = {
  "1s": 1000,
  "2s": 2000,
  "3s": 3000,
  "4s": 4000,
  "5s": 5000,
  "10s": 10000,
  "15s": 15000,
  "30s": 30000,
  "1m": 60000,
  "2m": 120000,
  "3m": 180000,
  "4m": 240000,
  "5m": 300000,
  "10m": 600000,
  "15m": 900000,
  "30m": 1800000,
  "1h": 3600000,
  "2h": 7200000,
  "3h": 10800000,
  "4h": 14400000,
  "5h": 18000000,
  "6h": 21600000,
  "12h": 43200000,
  "1d": 86400000,
  "2d": 172800000,
  "3d": 259200000,
  "4d": 345600000,
  "5d": 432000000,
  "6d": 518400000,
  "7d": 604800000,
};

/**
 * Converts a TTL value to milliseconds
 * @param ttl - TTL value as either a string key from ttlEnum or direct millisecond value
 * @returns The TTL in milliseconds, or -1 for no expiration
 */
export function ttlToMs(ttl: TTLValue): number {
  if (typeof ttl === "number") return ttl;
  return ttlEnum[ttl] || -1;
}

/**
 * A generic in-memory cache implementation with TTL support
 * @template T The type of values to be stored in the cache
 */
export class YelixCache<T> {
  /** Internal storage for cached items */
  private cache: Map<string, CacheItem<T>>;

  /**
   * Creates a new instance of YelixCache
   */
  constructor() {
    this.cache = new Map();
  }

  /**
   * Stores a value in the cache with an optional expiration time
   * @param ctx - Optional context to set cache hit/miss headers
   * @param key - Unique identifier for the cached item
   * @param value - The value to cache
   * @param ttl - Time-to-live in milliseconds or a key from ttlEnum, defaults to -1 (no expiration)
   */
  set(ctx: Ctx | null, key: string, value: T, ttl: TTLValue = -1): void {
    const ttlMs = ttlToMs(ttl);
    const expiresAt = ttlMs === -1 ? ttlMs : Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });

    ctx?.set("x-cache", "miss");
  }

  /**
   * Retrieves a value from the cache
   * @param ctx - Optional context to set cache hit/miss headers
   * @param key - Unique identifier for the cached item
   * @returns The cached value or undefined if not found or expired
   */
  get(ctx: Ctx | null, key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expiresAt && item.expiresAt !== -1) {
      this.cache.delete(key);
      return undefined;
    }

    ctx?.set("x-cache", "hit");

    return item.value;
  }

  /**
   * Checks if a key exists in the cache and is not expired
   * @param ctx - Optional context to set cache hit/miss headers
   * @param key - Unique identifier for the cached item
   * @returns True if the key exists and is not expired, false otherwise
   */
  has(ctx: Ctx | null, key: string): boolean {
    return this.get(ctx, key) !== undefined;
  }

  /**
   * Removes an item from the cache
   * @param ctx - Optional context (not used in this method)
   * @param key - Unique identifier for the cached item
   * @returns True if an item was removed, false otherwise
   */
  delete(_ctx: Ctx | null, key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Removes all items from the cache
   * @param ctx - Optional context (not used in this method)
   */
  clear(_ctx: Ctx | null): void {
    this.cache.clear();
  }

  /**
   * Removes all expired items from the cache
   * @param ctx - Optional context (not used in this method)
   */
  cleanup(_ctx: Ctx | null): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt && item.expiresAt !== -1) {
        this.cache.delete(key);
      }
    }
  }
}
