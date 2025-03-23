// deno-lint-ignore-file no-explicit-any

/** Represents a basic store item containing a value of type T */
interface StoreItem<T> {
  value: T;
}

/**
 * A simple key-value store implementation
 * @template T The type of values stored in the store
 */
export class Store<T = any> {
  private storage: Map<string, StoreItem<T>> = new Map();

  /**
   * Sets a value in the store
   * @param key The key to store the value under
   * @param value The value to store
   */
  set(key: string, value: T): void {
    const item: StoreItem<T> = { value };
    this.storage.set(key, item);
  }

  /**
   * Retrieves a value from the store
   * @param key The key to look up
   * @returns The stored value, or undefined if not found
   */
  get(key: string): T | undefined {
    const item = this.storage.get(key);
    return item?.value;
  }

  /**
   * Removes a value from the store
   * @param key The key to remove
   * @returns true if the item was deleted, false if it didn't exist
   */
  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  /**
   * Removes all items from the store
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Checks if a key exists in the store
   * @param key The key to check
   * @returns true if the key exists and has a value, false otherwise
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
}

/** Represents a store item with an expiration timestamp */
interface ExpireableStoreItem<T> {
  value: T;
  expireAt: number;
}

/**
 * A key-value store with automatic expiration of items
 * @template T The type of values stored in the store
 */
export class ExpireableStore<T = any> {
  private storage: Map<string, ExpireableStoreItem<T>> = new Map();
  private ttl: number;

  /**
   * Creates a new ExpireableStore
   * @param ttl Time to live in milliseconds for stored items
   */
  constructor(ttl: number) {
    this.ttl = ttl;
  }

  /**
   * Sets a value in the store with automatic expiration
   * @param key The key to store the value under
   * @param value The value to store
   */
  set(key: string, value: T): void {
    const item: ExpireableStoreItem<T> = {
      value,
      expireAt: Date.now() + this.ttl,
    };
    this.storage.set(key, item);
  }

  /**
   * Retrieves a non-expired value from the store
   * @param key The key to look up
   * @returns The stored value if found and not expired, undefined otherwise
   */
  get(key: string): T | undefined {
    const item = this.storage.get(key);
    if (item && item.expireAt > Date.now()) {
      return item.value;
    }
    return undefined;
  }

  /**
   * Removes a value from the store
   * @param key The key to remove
   * @returns true if the item was deleted, false if it didn't exist
   */
  delete(key: string): boolean {
    return this.storage.delete(key);
  }

  /**
   * Removes all items from the store
   */
  clear(): void {
    this.storage.clear();
  }

  /**
   * Checks if a key exists in the store and its value hasn't expired
   * @param key The key to check
   * @returns true if the key exists and its value hasn't expired, false otherwise
   */
  has(key: string): boolean {
    return this.get(key) !== undefined;
  }
}
