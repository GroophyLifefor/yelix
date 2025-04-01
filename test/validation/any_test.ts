import { inp } from "@/mod.ts";
import { assert } from "@/test/validation/helper.ts";

Deno.test("Any validation - basic required", () => {
  const validator = inp().any();
  assert(validator.validate({}), true);
  assert(validator.validate([]), true);
  assert(validator.validate("test"), true);
  assert(validator.validate(123), true);
  assert(validator.validate(true), true);
  assert(validator.validate(false), true);
  assert(validator.validate(null), false);
  assert(validator.validate(undefined), false);
});

Deno.test("Any validation - optional", () => {
  const validator = inp().any().optional();

  assert(validator.validate({}), true);
  assert(validator.validate([]), true);
  assert(validator.validate("test"), true);
  assert(validator.validate(123), true);
  assert(validator.validate(true), true);
  assert(validator.validate(undefined), true);
  assert(validator.validate(null), true);
});

Deno.test("Any validation - with custom rule", () => {
  const validator = inp().any().addRule(
    "isPositiveNumber",
    null,
    // deno-lint-ignore no-explicit-any
    (value: any) => ({
      isOk: typeof value === "number" && value > 0,
    }),
    "Value must be a positive number",
  );

  assert(validator.validate(42), true);
  assert(validator.validate(0), false);
  assert(validator.validate(-1), false);
  assert(validator.validate("123"), false);
  assert(validator.validate({}), false);
});

Deno.test("Any validation - chaining rules", () => {
  const validator = inp().any()
    .optional()
    .addRule(
      "isStringOrNumber",
      null,
      // deno-lint-ignore no-explicit-any
      (value: any) => ({
        isOk: value === undefined || value === null ||
          typeof value === "string" || typeof value === "number",
      }),
      "Value must be a string or number",
    );

  assert(validator.validate("test"), true);
  assert(validator.validate(123), true);
  assert(validator.validate(null), true);
  assert(validator.validate(undefined), true);
  assert(validator.validate({}), false);
  assert(validator.validate([]), false);
  assert(validator.validate(true), false);
});
