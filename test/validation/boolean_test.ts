import { inp } from "@/mod.ts";
import { assert } from "@/test/validation/helper.ts";

Deno.test("Boolean validation - basic types and required", () => {
  const validator = inp().boolean();
  assert(validator.validate(true), true);
  assert(validator.validate(false), true);
  assert(validator.validate(null), false);
  assert(validator.validate(undefined), false);
  assert(validator.validate("true"), false);
  assert(validator.validate(1), false);
  assert(validator.validate(0), false);
});

Deno.test("Boolean validation - true only", () => {
  const validator = inp().boolean().true();
  assert(validator.validate(true), true);
  assert(validator.validate(false), false);
  assert(validator.validate(null), false);
  assert(validator.validate(undefined), false);
});

Deno.test("Boolean validation - false only", () => {
  const validator = inp().boolean().false();
  assert(validator.validate(false), true);
  assert(validator.validate(true), false);
  assert(validator.validate(null), false);
  assert(validator.validate(undefined), false);
});

Deno.test("Boolean validation - equals", () => {
  const trueValidator = inp().boolean().equals(true);
  const falseValidator = inp().boolean().equals(false);

  assert(trueValidator.validate(true), true);
  assert(trueValidator.validate(false), false);
  assert(falseValidator.validate(false), true);
  assert(falseValidator.validate(true), false);
});

Deno.test("Boolean validation - notEquals", () => {
  const notTrueValidator = inp().boolean().notEquals(true);
  const notFalseValidator = inp().boolean().notEquals(false);

  assert(notTrueValidator.validate(false), true);
  assert(notTrueValidator.validate(true), false);
  assert(notFalseValidator.validate(true), true);
  assert(notFalseValidator.validate(false), false);
});

Deno.test("Boolean validation - transform string inputs", () => {
  const validator = inp().boolean().transform();

  // Valid transformations
  assert(validator.validate("true"), true);
  assert(validator.validate("true"), true, "value");
  assert(validator.validate("false"), true);
  assert(validator.validate("false"), false, "value");

  // Case insensitive checks
  assert(validator.validate("TRUE"), true);
  assert(validator.validate("TRUE"), true, "value");
  assert(validator.validate("FALSE"), true);
  assert(validator.validate("FALSE"), false, "value");

  // Invalid string inputs
  assert(validator.validate("yes"), false, "isOk");
  assert(validator.validate("no"), false, "isOk");
  assert(validator.validate("t"), false, "isOk");
  assert(validator.validate("f"), false, "isOk");
});

Deno.test("Boolean validation - transform numeric inputs", () => {
  const validator = inp().boolean().transform();

  assert(validator.validate(1), true);
  assert(validator.validate(1), true, "value");
  assert(validator.validate(0), true);
  assert(validator.validate(0), false, "value");
  assert(validator.validate("1"), true);
  assert(validator.validate("1"), true, "value");
  assert(validator.validate("0"), true);
  assert(validator.validate("0"), false, "value");
});

Deno.test("Boolean validation - transform invalid inputs", () => {
  const validator = inp().boolean().transform();

  assert(validator.validate("yes"), false);
  assert(validator.validate("no"), false);
  assert(validator.validate(2), false);
  assert(validator.validate(-1), false);
  assert(validator.validate({}), false);
  assert(validator.validate([]), false);
});

Deno.test("Boolean validation - optional", () => {
  const validator = inp().boolean().optional();

  assert(validator.validate(true), true);
  assert(validator.validate(false), true);
  assert(validator.validate(undefined), true);
  assert(validator.validate(null), true);
  assert(validator.validate("true"), false);
  assert(validator.validate(1), false);
});

Deno.test("Boolean validation - chaining multiple validations", () => {
  const validator = inp().boolean()
    .transform()
    .true();

  assert(validator.validate(true), true);
  assert(validator.validate("true"), true);
  assert(validator.validate("TRUE"), true);
  assert(validator.validate(1), true);
  assert(validator.validate("1"), true);
  assert(validator.validate(false), false);
  assert(validator.validate("false"), false);
  assert(validator.validate(0), false);
  assert(validator.validate(null), false);
});

Deno.test("Boolean validation - transform with other validations", () => {
  const validator = inp().boolean()
    .transform()
    .equals(true);

  assert(validator.validate("true"), true);
  assert(validator.validate(1), true);
  assert(validator.validate("1"), true);
  assert(validator.validate(true), true);
  assert(validator.validate("false"), false);
  assert(validator.validate(0), false);
  assert(validator.validate("0"), false);
  assert(validator.validate(false), false);
});
