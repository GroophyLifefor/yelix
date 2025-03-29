import { inp } from "@/mod.ts";
import { assert } from "@/test/validation/helper.ts";

Deno.test("Object validation - basic types and required", () => {
  const validator = inp().object();
  assert(validator.validate({}), true);
  assert(validator.validate({ key: "value" }), true);
  assert(validator.validate(null), false);
  assert(validator.validate(undefined), false);
  assert(validator.validate("not an object"), false);
  assert(validator.validate([]), false);
});

Deno.test("Object validation - optional", () => {
  const validator = inp().object().optional();

  assert(validator.validate({}), true);
  assert(validator.validate({ test: "value" }), true);
  assert(validator.validate(undefined), true);
  assert(validator.validate(null), true);
  assert(validator.validate("string"), false);
  assert(validator.validate(123), false);
});

Deno.test("Object validation - hasKey", () => {
  const validator = inp().object().hasKey("name");

  assert(validator.validate({ name: "test" }), true);
  assert(validator.validate({ name: null }), true);
  assert(validator.validate({}), false);
  assert(validator.validate({ other: "value" }), false);
});

Deno.test("Object validation - minKeys/maxKeys", () => {
  const minValidator = inp().object().minKeys(2);
  const maxValidator = inp().object().maxKeys(2);

  assert(minValidator.validate({ a: 1, b: 2 }), true);
  assert(minValidator.validate({ a: 1, b: 2, c: 3 }), true);
  assert(minValidator.validate({ a: 1 }), false);

  assert(maxValidator.validate({ a: 1 }), true);
  assert(maxValidator.validate({ a: 1, b: 2 }), true);
  assert(maxValidator.validate({ a: 1, b: 2, c: 3 }), false);
});

Deno.test("Object validation - exactKeys", () => {
  const validator = inp().object().exactKeys(["name", "age"]);

  assert(validator.validate({ name: "test", age: 25 }), true);
  assert(validator.validate({ name: "test" }), false);
  assert(validator.validate({ name: "test", age: 25, extra: true }), false);
  assert(validator.validate({}), false);
});

Deno.test("Object validation - nested validation", () => {
  const validator = inp().object({
    name: inp().string().min(2),
    age: inp().number().range(0, 120),
    address: inp().object({
      city: inp().string(),
      zip: inp().string(),
    }),
  });

  assert(
    validator.validate({
      name: "John",
      age: 30,
      address: {
        city: "New York",
        zip: "10001",
      },
    }),
    true,
  );

  assert(
    validator.validate({
      name: "J",
      age: 30,
      address: {
        city: "New York",
        zip: "10001",
      },
    }),
    false,
  );

  assert(
    validator.validate({
      name: "John",
      age: 150,
      address: {
        city: "New York",
        zip: "10001",
      },
    }),
    false,
  );
});
