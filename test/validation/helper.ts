import type { ValidateResult } from "@/mod.ts";
import { assertEquals } from "@std/assert/equals";

function assert(
  value: ValidateResult,
  // deno-lint-ignore no-explicit-any
  expect: any,
  field: "isOk" | "value" = "isOk",
) {
  try {
    assertEquals(value[field], expect);
  } catch (e) {
    console.log("info:", {
      rules: value.validatorInstance.rules.map((r) => ({
        title: r.title,
        value: r.value,
        errors: value.errors,
      })),
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
