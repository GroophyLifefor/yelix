import { Ctx } from '@/src/types/types.d.ts';

interface CacheItem<T> {
  value: T;
  expiresAt: number;
}

export type TTLValue = keyof typeof ttlEnum | number;

export const ttlEnum = {
  '1s': 1000,
  '2s': 2000,
  '3s': 3000,
  '4s': 4000,
  '5s': 5000,
  '10s': 10000,
  '15s': 15000,
  '30s': 30000,
  '1m': 60000,
  '2m': 120000,
  '3m': 180000,
  '4m': 240000,
  '5m': 300000,
  '10m': 600000,
  '15m': 900000,
  '30m': 1800000,
  '1h': 3600000,
  '2h': 7200000,
  '3h': 10800000,
  '4h': 14400000,
  '5h': 18000000,
  '6h': 21600000,
  '12h': 43200000,
  '1d': 86400000,
  '2d': 172800000,
  '3d': 259200000,
  '4d': 345600000,
  '5d': 432000000,
  '6d': 518400000,
  '7d': 604800000,
};

/**
 * Converts a TTL value to milliseconds
 */
export function ttlToMs(ttl: TTLValue): number {
  if (typeof ttl === 'number') return ttl;
  return ttlEnum[ttl] || -1;
}

export class YelixCache<T> {
  private cache: Map<string, CacheItem<T>>;

  constructor() {
    this.cache = new Map();
  }

  set(ctx: Ctx | null, key: string, value: T, ttl: TTLValue = -1): void {
    const ttlMs = ttlToMs(ttl);
    const expiresAt = ttlMs === -1 ? ttlMs : Date.now() + ttlMs;
    this.cache.set(key, { value, expiresAt });

    ctx?.set('x-cache', 'miss');
  }

  get(ctx: Ctx | null, key: string): T | undefined {
    const item = this.cache.get(key);
    if (!item) return undefined;

    if (Date.now() > item.expiresAt && item.expiresAt !== -1) {
      this.cache.delete(key);
      return undefined;
    }

    ctx?.set('x-cache', 'hit');

    return item.value;
  }

  has(ctx: Ctx | null, key: string): boolean {
    return this.get(ctx, key) !== undefined;
  }

  delete(_ctx: Ctx | null, key: string): boolean {
    return this.cache.delete(key);
  }

  clear(_ctx: Ctx | null): void {
    this.cache.clear();
  }

  cleanup(_ctx: Ctx | null): void {
    const now = Date.now();
    for (const [key, item] of this.cache.entries()) {
      if (now > item.expiresAt && item.expiresAt !== -1) {
        this.cache.delete(key);
      }
    }
  }
}
