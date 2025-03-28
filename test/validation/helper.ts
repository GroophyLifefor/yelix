import type { ValidateResult } from "@/mod.ts";
import { assertEquals } from "@std/assert/equals";

// deno-lint-ignore no-explicit-any
function assert(value: ValidateResult, expect: any, field: 'isOk' | 'value' = 'isOk') {
  try {
    assertEquals(value[field], expect);
  } catch (e) {
    console.log('info:', {
      value: value.value,
      errors: value.errors,
      expect: expect,
      got: value[field],
      field: field,
    });
    throw e;
  }
}

export { assert };