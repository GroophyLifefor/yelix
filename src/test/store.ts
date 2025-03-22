// deno-lint-ignore-file no-explicit-any
interface StoreItem<T> {
  value: T;
}

export class Store<T = any> {
  private storage: Map<string, StoreItem<T>> = new Map();

  set(key: string, value: T): void {
    const item: StoreItem<T> = { value };
    this.storage.set(key, item);
  }

  get(key: string): T | undefined {
    const item = this.storage.get(key);
    return item?.value;
  }

  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
}

interface ExpireableStoreItem<T> {
  value: T;
  expireAt: number;
}

export class ExpireableStore<T = any> {
  private storage: Map<string, ExpireableStoreItem<T>> = new Map();
  private ttl: number;

  constructor(ttl: number) {
    this.ttl = ttl;
  }

  set(key: string, value: T): void {
    const item: ExpireableStoreItem<T> = {
      value,
      expireAt: Date.now() + this.ttl,
    };
    this.storage.set(key, item);
  }

  get(key: string): T | undefined {
    const item = this.storage.get(key);
    if (item && item.expireAt > Date.now()) {
      return item.value;
    }
    return undefined;
  }

  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  clear(): void {
    this.storage.clear();
  }

  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
}
