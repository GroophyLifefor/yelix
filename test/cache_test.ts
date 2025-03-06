import { assertEquals } from "@std/assert";
import { YelixCache } from "@/mod.ts";

function createMockCtx() {
  return {
    headers: new Headers(),
    get(key: string) {
      return this.headers.get(key);
    },
    set(key: string, value: string) {
      this.headers.set(key, value);
    },
    clear() {
      this.headers = new Headers();
    },
  } as any;
}

// Test basic operations
Deno.test("Basic cache operations", () => {
  const cache = new YelixCache<string>();
  
  // Test set and get
  cache.set(null, "key1", "value1");
  assertEquals(cache.get(null, "key1"), "value1");
  
  // Test has
  assertEquals(cache.has(null, "key1"), true);
  assertEquals(cache.has(null, "nonexistent"), false);
  
  // Test delete
  cache.delete(null, "key1");
  assertEquals(cache.has(null, "key1"), false);
  assertEquals(cache.get(null, "key1"), undefined);
  
  // Test clear
  cache.set(null, "key2", "value2");
  cache.set(null, "key3", "value3");
  cache.clear(null);
  assertEquals(cache.has(null, "key2"), false);
  assertEquals(cache.has(null, "key3"), false);
});

// Test different value types
Deno.test("Cache with different value types", () => {
  const cache = new YelixCache<any>();
  
  // Test string
  cache.set(null, "string", "hello");
  assertEquals(cache.get(null, "string"), "hello");
  
  // Test number
  cache.set(null, "number", 123);
  assertEquals(cache.get(null, "number"), 123);
  
  // Test boolean
  cache.set(null, "boolean", true);
  assertEquals(cache.get(null, "boolean"), true);
  
  // Test object
  const obj = { name: "test", value: 42 };
  cache.set(null, "object", obj);
  assertEquals(cache.get(null, "object"), obj);
  
  // Test array
  const arr = [1, 2, 3];
  cache.set(null, "array", arr);
  assertEquals(cache.get(null, "array"), arr);
});

// Test TTL formats
Deno.test("TTL format variations", () => {
  const cache = new YelixCache<string>();
  
  // Test numeric TTL
  cache.set(null, "numeric", "value", 1000);
  assertEquals(cache.get(null, "numeric"), "value");
  
  // Test string TTL from enum
  cache.set(null, "enum", "value", "1s");
  assertEquals(cache.get(null, "enum"), "value");
  
  // Test negative TTL (no expiration)
  cache.set(null, "noexpire", "value", -1);
  assertEquals(cache.get(null, "noexpire"), "value");
});

// Test context headers
Deno.test("Cache context headers", () => {
  const cache = new YelixCache<string>();
  const mockCtx = createMockCtx();
  
  // Test cache miss
  cache.set(mockCtx, "key", "value");
  assertEquals(mockCtx.get("x-cache"), "miss");
  
  // Test cache hit
  mockCtx.clear();
  cache.get(mockCtx, "key");
  assertEquals(mockCtx.get("x-cache"), "hit");
  
  // Test cache miss on non-existent key
  mockCtx.clear();
  cache.get(mockCtx, "nonexistent");
  assertEquals(mockCtx.get("x-cache"), null);
});

// Test cleanup functionality
Deno.test("Cache cleanup", () => {
  const cache = new YelixCache<string>();
  
  // Set multiple items with different TTLs
  cache.set(null, "permanent", "value1", -1);
  cache.set(null, "shortTTL", "value2", 1);
  cache.set(null, "mediumTTL", "value3", 1000);
  
  // Force immediate expiration for some items
  const item = (cache as any).cache.get("shortTTL");
  item.expiresAt = Date.now() - 1000;
  
  // Run cleanup
  cache.cleanup(null);
  
  // Check results
  assertEquals(cache.has(null, "permanent"), true);
  assertEquals(cache.has(null, "shortTTL"), false);
  assertEquals(cache.has(null, "mediumTTL"), true);
});

// Test edge cases
Deno.test("Cache edge cases", () => {
  const cache = new YelixCache<any>();
  
  // Test undefined and null values
  cache.set(null, "undefined", undefined);
  cache.set(null, "null", null);
  assertEquals(cache.get(null, "undefined"), undefined);
  assertEquals(cache.get(null, "null"), null);
  
  // Test empty string key
  cache.set(null, "", "empty");
  assertEquals(cache.get(null, ""), "empty");
  
  // Test special characters in keys
  cache.set(null, "!@#$%^&*()", "special");
  assertEquals(cache.get(null, "!@#$%^&*()"), "special");
  
  // Test overwriting values
  cache.set(null, "overwrite", "original");
  cache.set(null, "overwrite", "new");
  assertEquals(cache.get(null, "overwrite"), "new");
});

// Test multiple operations sequence
Deno.test("Complex operation sequence", () => {
  const cache = new YelixCache<string>();
  
  // Sequential operations
  cache.set(null, "key1", "value1");
  cache.set(null, "key2", "value2");
  assertEquals(cache.get(null, "key1"), "value1");
  
  cache.delete(null, "key1");
  assertEquals(cache.get(null, "key1"), undefined);
  assertEquals(cache.get(null, "key2"), "value2");
  
  cache.set(null, "key2", "updated");
  assertEquals(cache.get(null, "key2"), "updated");
  
  // Cleanup and verify
  cache.cleanup(null);
  assertEquals(cache.has(null, "key2"), true);
});
