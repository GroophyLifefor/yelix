import { inp } from "@/mod.ts";
import { assert } from "@/test/validation/helper.ts";

Deno.test("String validation - basic types", () => {
  const validator = inp().string();
  assert(validator.validate("hello"), true);
  assert(validator.validate(""), true);
  assert(validator.validate(123), false);
  assert(validator.validate(null), false);
  assert(validator.validate(undefined), false);
});

Deno.test("String validation - trim", () => {
  const validator = inp().string().trim();
  assert(validator.validate("  hello  "), "hello", "value");
  assert(validator.validate("\n\thello\n"), "hello", "value");
  assert(validator.validate("hello"), "hello", "value");
});

Deno.test("String validation - length constraints", () => {
  const maxValidator = inp().string().max(5);
  const minValidator = inp().string().min(3);
  const exactValidator = inp().string().length(4);

  assert(maxValidator.validate("hello"), true);
  assert(maxValidator.validate("hello!"), false);
  assert(minValidator.validate("hi"), false);
  assert(minValidator.validate("hello"), true);
  assert(exactValidator.validate("test"), true);
  assert(exactValidator.validate("tests"), false);
});

Deno.test("String validation - email", () => {
  const validator = inp().string().email();

  assert(validator.validate("test@example.com"), true);
  assert(validator.validate("test.name@example.co.uk"), true);
  assert(validator.validate("invalid.email"), false);
  assert(validator.validate("@example.com"), false);
  assert(validator.validate("test@"), false);
  assert(validator.validate("test@.com"), false);
});

Deno.test("String validation - URL", () => {
  const validator = inp().string().url();

  assert(validator.validate("https://example.com"), true);
  assert(validator.validate("http://localhost:3000"), true);
  assert(validator.validate("ftp://files.example.com"), true);
  assert(validator.validate("not-a-url"), false);
  assert(validator.validate("http://"), false);
});

Deno.test("String validation - regex", () => {
  const validator = inp().string().regex(/^[A-Z][a-z]+$/);

  assert(validator.validate("Hello"), true);
  assert(validator.validate("HELLO"), false);
  assert(validator.validate("hello"), false);
  assert(validator.validate("Hello123"), false);
});

Deno.test("String validation - string content", () => {
  const validator = inp().string()
    .includes("test")
    .startsWith("unit")
    .endsWith("now");

  assert(validator.validate("unit-test-now"), true);
  assert(validator.validate("unit-testing-later"), false);
  assert(validator.validate("not-test-now"), false);
});

Deno.test("String validation - case transformations", () => {
  const lowerValidator = inp().string().toLowerCase();
  const upperValidator = inp().string().toUpperCase();

  assert(lowerValidator.validate("HELLO"), "hello", "value");
  assert(upperValidator.validate("hello"), "HELLO", "value");
  assert(lowerValidator.validate("MiXeD"), "mixed", "value");
});

Deno.test("String validation - datetime formats", () => {
  const dateValidator = inp().string().date();
  const timeValidator = inp().string().time();
  const datetimeValidator = inp().string().datetime();

  assert(dateValidator.validate("2023-12-31"), true);
  assert(dateValidator.validate("2023/12/31"), false);

  assert(timeValidator.validate("23:59:59"), true);
  assert(timeValidator.validate("23:59:59.123"), true);
  assert(timeValidator.validate("24:00:00"), false);

  assert(datetimeValidator.validate("2023-12-31T23:59:59Z"), true);
  assert(datetimeValidator.validate("2023-12-31T23:59:59+01:00"), true);
  assert(datetimeValidator.validate("2023-12-31 23:59:59"), false);
});

Deno.test("String validation - IP addresses", () => {
  const validator = inp().string().ip();

  // IPv4
  assert(validator.validate("192.168.1.1"), true);
  assert(validator.validate("255.255.255.255"), true);
  assert(validator.validate("256.1.2.3"), false);
  assert(validator.validate("1.2.3.256"), false);

  // IPv6
  assert(validator.validate("2001:0db8:85a3:0000:0000:8a2e:0370:7334"), true);
  assert(validator.validate("fe80::1"), true);
  assert(validator.validate("::1"), true);
  assert(
    validator.validate("2001:0db8:85a3:0000:0000:8a2e:0370:7334:extra"),
    false,
  );
});

Deno.test("String validation - base64", () => {
  const validator = inp().string().base64();

  assert(validator.validate("SGVsbG8gV29ybGQ="), true);
  assert(validator.validate("SGVsbG8="), true);
  assert(validator.validate("SGVsbG8"), true);
  assert(validator.validate("SGVsbG8%"), false);
  assert(validator.validate("SGVsbG8=="), true);
  assert(validator.validate("SGVsbG8==="), false);
});

Deno.test("String validation - chaining multiple validations", () => {
  const validator = inp().string()
    .trim()
    .min(3)
    .max(10)
    .regex(/^[a-z]+$/)
    .toLowerCase();

  assert(validator.validate("  HELLO  "), true);
  assert(validator.validate("  HELLO  "), "hello", "value");
  assert(validator.validate("hi"), false);
  assert(validator.validate("hello world"), false);
  assert(validator.validate("Hello123"), false);
});

Deno.test("String validation - optional", () => {
  const validator = inp().string().optional();

  assert(validator.validate("hello"), true);
  assert(validator.validate(""), true);
  assert(validator.validate(undefined), true);
  assert(validator.validate(null), true);
  assert(validator.validate(123), false);
  assert(validator.validate({}), false);
});

Deno.test("String validation - enum", () => {
  const validator = inp().string().enum(["admin", "user", "guest"]);

  assert(validator.validate("admin"), true);
  assert(validator.validate("user"), true);
  assert(validator.validate("guest"), true);
  assert(validator.validate("other"), false);
  assert(validator.validate(""), false);
});

Deno.test("String validation - toNumber", () => {
  const validator = inp().string().toNumber().min(3).max(5);

  assert(validator.validate("4"), true);
  assert(validator.validate("3"), true);
  assert(validator.validate("5"), true);
  assert(validator.validate("2"), false);
  assert(validator.validate("6"), false);
  assert(validator.validate("abc"), false);
  assert(validator.validate("4.5"), true);
  assert(validator.validate("4"), 4, "value");
});

Deno.test("String validation - toNumber with decimal", () => {
  const validator = inp().string().toNumber();

  assert(validator.validate("4.5"), true);
  assert(validator.validate("-3.14"), true);
  assert(validator.validate("123.456"), true);
  assert(validator.validate("abc"), false);
  assert(validator.validate("4.5.6"), false);
  assert(validator.validate("4.5"), 4.5, "value");
});

Deno.test("String validation - toNumber edge cases", () => {
  const validator = inp().string().toNumber();

  // Basic number strings
  assert(validator.validate("0"), true);
  assert(validator.validate("-0"), false);
  assert(validator.validate("+0"), false);
  assert(validator.validate("42"), true);
  assert(validator.validate("-42"), true);
  assert(validator.validate("+42"), false);

  // Decimal numbers
  assert(validator.validate("3.14"), true);
  assert(validator.validate("-3.14"), true);
  assert(validator.validate("+3.14"), false);
  assert(validator.validate(".14"), true);
  assert(validator.validate("0.0"), true);
  assert(validator.validate("0."), true);

  // Scientific notation
  assert(validator.validate("1e5"), false);
  assert(validator.validate("1E5"), false);
  assert(validator.validate("1.23e-4"), false);
  assert(validator.validate("-1.23E+4"), false);

  // Special numbers
  assert(validator.validate("Infinity"), false);
  assert(validator.validate("-Infinity"), false);
  assert(validator.validate("NaN"), false); // NaN is technically a number but usually unwanted

  // Invalid formats
  assert(validator.validate("12.34.56"), false);
  assert(validator.validate("1,234"), false);
  assert(validator.validate("1_234"), false);
  assert(validator.validate(" 123"), false);
  assert(validator.validate("123 "), false);
  assert(validator.validate("12 34"), false);
  assert(validator.validate("0xFF"), false);
  assert(validator.validate("123abc"), false);
  assert(validator.validate("abc123"), false);
  assert(validator.validate(""), false);
  assert(validator.validate("e1"), false);
  assert(validator.validate("."), false);

  // Value transformations
  assert(validator.validate("42"), 42, "value");
  assert(validator.validate("-42.5"), -42.5, "value");
  assert(validator.validate(".5"), 0.5, "value");
});

Deno.test("String validation - toNumber with constraints", () => {
  const validator = inp().string()
    .toNumber()
    .min(-10)
    .max(10)
    .multipleOf(0.5);

  // Valid numbers within constraints
  assert(validator.validate("0"), true);
  assert(validator.validate("10"), true);
  assert(validator.validate("-10"), true);
  assert(validator.validate("5.5"), true);
  assert(validator.validate("-3.5"), true);
  assert(validator.validate("0.5"), true);

  // Invalid numbers outside constraints
  assert(validator.validate("10.1"), false);
  assert(validator.validate("-10.1"), false);
  assert(validator.validate("5.7"), false); // not multiple of 0.5
  assert(validator.validate("1.23"), false); // not multiple of 0.5
});

Deno.test("String validation - toNumber with integer constraints", () => {
  const validator = inp().string()
    .toNumber()
    .integer()
    .positive();

  // Valid integers
  assert(validator.validate("42"), true);
  assert(validator.validate("1"), true);
  assert(validator.validate("9007199254740991"), true); // MAX_SAFE_INTEGER

  // Invalid numbers
  assert(validator.validate("3.14"), false);
  assert(validator.validate("-42"), false);
  assert(validator.validate("0"), false);
  assert(validator.validate("1.0"), true); // Edge case: 1.0 is actually an integer
  assert(validator.validate("9007199254740992"), true); // Beyond MAX_SAFE_INTEGER but still a valid number
});

Deno.test("String validation - toNumber whitespace handling", () => {
  const validator = inp().string().toNumber();

  //  trims whitespace
  assert(validator.validate(" 123"), false);
  assert(validator.validate("123 "), false);
  assert(validator.validate(" 123 "), false);
  assert(validator.validate("\t123"), false);
  assert(validator.validate("123\n"), false);
});
