import { inp } from "@/mod.ts";
import { assert } from "@/test/validation/helper.ts";

Deno.test("Array validation - basic types and required", () => {
  const validator = inp().array();
  assert(validator.validate([]), true);
  assert(validator.validate([1, 2, 3]), true);
  assert(validator.validate(["test"]), true);
  assert(validator.validate(null), false);
  assert(validator.validate(undefined), false);
  assert(validator.validate({}), false);
  assert(validator.validate("not an array"), false);
  assert(validator.validate(123), false);
});

Deno.test("Array validation - optional", () => {
  const validator = inp().array().optional();
  
  assert(validator.validate([]), true);
  assert(validator.validate([1, 2, 3]), true);
  assert(validator.validate(undefined), true);
  assert(validator.validate(null), true);
  assert(validator.validate({}), false);
  assert(validator.validate("string"), false);
});

Deno.test("Array validation - length constraints", () => {
  const minValidator = inp().array().min(2);
  const maxValidator = inp().array().max(3);
  const exactValidator = inp().array().length(2);
  
  // Min length tests
  assert(minValidator.validate([1, 2]), true);
  assert(minValidator.validate([1, 2, 3]), true);
  assert(minValidator.validate([1]), false);
  assert(minValidator.validate([]), false);
  
  // Max length tests
  assert(maxValidator.validate([1]), true);
  assert(maxValidator.validate([1, 2, 3]), true);
  assert(maxValidator.validate([1, 2, 3, 4]), false);
  
  // Exact length tests
  assert(exactValidator.validate([1, 2]), true);
  assert(exactValidator.validate([1]), false);
  assert(exactValidator.validate([1, 2, 3]), false);
});

Deno.test("Array validation - notEmpty", () => {
  const validator = inp().array().notEmpty();
  
  assert(validator.validate([1]), true);
  assert(validator.validate(["test"]), true);
  assert(validator.validate([null]), true);
  assert(validator.validate([]), false);
});

Deno.test("Array validation - unique", () => {
  const validator = inp().array().unique();
  
  assert(validator.validate([1, 2, 3]), true);
  assert(validator.validate(["a", "b", "c"]), true);
  assert(validator.validate([1, 2, 2]), false);
  assert(validator.validate(["a", "b", "b"]), false);
  assert(validator.validate([true, false]), true);
  assert(validator.validate([true, true]), false);
  assert(validator.validate([]), true);
});

Deno.test("Array validation - includes", () => {
  const numberValidator = inp().array().includes(42);
  const stringValidator = inp().array().includes("test");
  
  assert(numberValidator.validate([42]), true);
  assert(numberValidator.validate([1, 42, 3]), true);
  assert(numberValidator.validate([1, 2, 3]), false);
  
  assert(stringValidator.validate(["test"]), true);
  assert(stringValidator.validate(["a", "test", "b"]), true);
  assert(stringValidator.validate(["a", "b", "c"]), false);
});

Deno.test("Array validation - every", () => {
  const numberValidator = inp().array().every(inp().number().min(0));
  const stringValidator = inp().array().every(inp().string().min(2));
  
  assert(numberValidator.validate([1, 2, 3]), true);
  assert(numberValidator.validate([]), true);
  assert(numberValidator.validate([0]), true);
  assert(numberValidator.validate([-1, 1, 2]), false);
  assert(numberValidator.validate([1, "2", 3]), false);
  
  assert(stringValidator.validate(["test", "hello"]), true);
  assert(stringValidator.validate([]), true);
  assert(stringValidator.validate(["a"]), false);
  assert(stringValidator.validate(["test", "a"]), false);
});

Deno.test("Array validation - some", () => {
  const numberValidator = inp().array().some(inp().number().min(10));
  const stringValidator = inp().array().some(inp().string().email());
  
  assert(numberValidator.validate([5, 15, 3]), true);
  assert(numberValidator.validate([15]), true);
  assert(numberValidator.validate([1, 2, 3]), false);
  assert(numberValidator.validate([]), false);
  
  assert(stringValidator.validate(["test@example.com", "notanemail"]), true);
  assert(stringValidator.validate(["test@example.com"]), true);
  assert(stringValidator.validate(["test", "notanemail"]), false);
  assert(stringValidator.validate([]), false);
});

Deno.test("Array validation - complex chaining", () => {
  const validator = inp().array()
    .notEmpty()
    .min(2)
    .max(4)
    .unique()
    .every(inp().number().range(0, 100));
    
  assert(validator.validate([10, 20, 30]), true);
  assert(validator.validate([10, 20]), true);
  assert(validator.validate([10, 20, 30, 40]), true);
  assert(validator.validate([]), false);
  assert(validator.validate([10]), false);
  assert(validator.validate([10, 20, 30, 40, 50]), false);
  assert(validator.validate([10, 10, 20]), false);
  assert(validator.validate([10, -1, 20]), false);
  assert(validator.validate([10, 101, 20]), false);
});

Deno.test("Array validation - nested validation", () => {
  const validator = inp().array().every(
    inp().object({
      id: inp().number().min(1),
      name: inp().string().min(2),
      tags: inp().array().every(inp().string())
    })
  );
  
  assert(validator.validate([
    { id: 1, name: "test", tags: ["a", "b"] },
    { id: 2, name: "hello", tags: ["c"] }
  ]), true);
  
  assert(validator.validate([
    { id: 0, name: "test", tags: ["a"] }
  ]), false);
  
  assert(validator.validate([
    { id: 1, name: "t", tags: ["a"] }
  ]), false);
  
  assert(validator.validate([
    { id: 1, name: "test", tags: [1] }
  ]), false);
});

Deno.test("Array validation - custom rule", () => {
  const validator = inp().array().customRule(
    (value) => ({
      isOk: Array.isArray(value) && 
        value.every((n) => typeof n === "number" && n % 2 === 0)
    }),
    "evenNumbers",
    "All numbers must be even"
  );
  
  assert(validator.validate([2, 4, 6]), true);
  assert(validator.validate([]), true);
  assert(validator.validate([2]), true);
  assert(validator.validate([1, 2, 4]), false);
  assert(validator.validate([2, "4", 6]), false);
});
