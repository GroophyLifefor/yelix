import { inp } from "@/mod.ts";
import { assert } from "@/test/validation/helper.ts";

Deno.test("Number validation - basic types and required", () => {
  const validator = inp().number();
  assert(validator.validate(123), true);
  assert(validator.validate(0), true);
  assert(validator.validate(-123), true);
  assert(validator.validate(null), false);
  assert(validator.validate(undefined), false);
  assert(validator.validate(""), false);
  assert(validator.validate("asd"), false);
});

Deno.test("Number validation - min/max", () => {
  const minValidator = inp().number().min(5);
  const maxValidator = inp().number().max(10);

  assert(minValidator.validate(4), false);
  assert(minValidator.validate(5), true);
  assert(minValidator.validate(6), true);

  assert(maxValidator.validate(11), false);
  assert(maxValidator.validate(10), true);
  assert(maxValidator.validate(9), true);
});

Deno.test("Number validation - integer", () => {
  const validator = inp().number().integer();
  assert(validator.validate(123), true);
  assert(validator.validate(-123), true);
  assert(validator.validate(0), true);
  assert(validator.validate(123.456), false);
});

Deno.test("Number validation - positive/negative", () => {
  const positiveValidator = inp().number().positive();
  const negativeValidator = inp().number().negative();

  assert(positiveValidator.validate(1), true);
  assert(positiveValidator.validate(0), false);
  assert(positiveValidator.validate(-1), false);

  assert(negativeValidator.validate(1), false);
  assert(negativeValidator.validate(0), false);
  assert(negativeValidator.validate(-1), true);
});

Deno.test("Number validation - range", () => {
  const validator = inp().number().range(5, 10);
  assert(validator.validate(4), false);
  assert(validator.validate(5), true);
  assert(validator.validate(7), true);
  assert(validator.validate(10), true);
  assert(validator.validate(11), false);
});

Deno.test("Number validation - multipleOf", () => {
  const validator = inp().number().multipleOf(3);
  assert(validator.validate(0), true);
  assert(validator.validate(3), true);
  assert(validator.validate(6), true);
  assert(validator.validate(-3), true);
  assert(validator.validate(4), false);
  assert(validator.validate(3.5), false);
});

Deno.test("Number validation - finite", () => {
  const validator = inp().number().finite();
  assert(validator.validate(123), true);
  assert(validator.validate(-123), true);
  assert(validator.validate(0), true);
  assert(validator.validate(Infinity), false);
  assert(validator.validate(-Infinity), false);
});

Deno.test("Number validation - safe integer", () => {
  const validator = inp().number().safe();
  assert(validator.validate(123), true);
  assert(validator.validate(-123), true);
  assert(validator.validate(0), true);
  assert(validator.validate(Number.MAX_SAFE_INTEGER), true);
  assert(validator.validate(Number.MIN_SAFE_INTEGER), true);
  assert(validator.validate(Number.MAX_SAFE_INTEGER + 1), false);
  assert(validator.validate(Number.MIN_SAFE_INTEGER - 1), false);
});

Deno.test("Number validation - chaining multiple validations", () => {
  const validator = inp().number()
    .required()
    .range(0, 100)
    .integer()
    .multipleOf(5);

  assert(validator.validate(0), true);
  assert(validator.validate(50), true);
  assert(validator.validate(100), true);
  assert(validator.validate(-5), false);
  assert(validator.validate(101), false);
  assert(validator.validate(23), false);
  assert(validator.validate(25.5), false);
  assert(validator.validate(null), false);
});

Deno.test("Number validation - optional", () => {
  const validator = inp().number().optional();

  assert(validator.validate(123), true);
  assert(validator.validate(0), true);
  assert(validator.validate(undefined), true);
  assert(validator.validate(null), true);
  assert(validator.validate("123"), false);
  assert(validator.validate(""), false);
});
