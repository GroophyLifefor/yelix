import { inp } from "@/mod.ts";
import { assert } from "@/test/validation/helper.ts";

Deno.test("Date validation - basic types and required", () => {
  const validator = inp().date();
  assert(validator.validate(new Date()), true);
  assert(validator.validate("2024-01-01"), true);
  assert(validator.validate(null), false);
  assert(validator.validate(undefined), false);
  assert(validator.validate("invalid date"), false);
  assert(validator.validate(123), false);
});

Deno.test("Date validation - isDate", () => {
  const validator = inp().date().isDate();
  const now = new Date();

  assert(validator.validate(now), true);
  assert(validator.validate("2024-01-01"), true);
  assert(validator.validate("2024/01/01"), true);
  assert(validator.validate("Jan 1, 2024"), true);
  assert(validator.validate("invalid"), false);
  assert(validator.validate("2024-13-01"), false);
});

Deno.test("Date validation - min/max", () => {
  const minDate = new Date("2024-01-01");
  const maxDate = new Date("2024-12-31");
  const validator = inp().date().min(minDate).max(maxDate);

  assert(validator.validate(new Date("2024-06-15")), true);
  assert(validator.validate(new Date("2024-01-01")), true);
  assert(validator.validate(new Date("2024-12-31")), true);
  assert(validator.validate(new Date("2023-12-31")), false);
  assert(validator.validate(new Date("2025-01-01")), false);
});

Deno.test("Date validation - format", () => {
  const validator = inp().date().format("yyyy-MM-dd");

  const date = new Date("2024-01-15");
  assert(validator.validate(date), "2024-01-15", "value");

  const validator2 = inp().date().format({
    format: "dd/MM/yyyy",
    locale: "en-GB",
  });
  assert(validator2.validate(date), "15/01/2024", "value");
});

Deno.test("Date validation - timezone", () => {
  const validator = inp().date().timezone("America/New_York");
  const date = new Date("2024-01-01T12:00:00Z");

  assert(validator.validate(date), true);
  assert(validator.validate("invalid"), false);
});

Deno.test("Date validation - future/past", () => {
  const futureValidator = inp().date().future();
  const pastValidator = inp().date().past();

  const futureDate = new Date(Date.now() + 86400000); // tomorrow
  const pastDate = new Date(Date.now() - 86400000); // yesterday

  assert(futureValidator.validate(futureDate), true);
  assert(futureValidator.validate(pastDate), false);

  assert(pastValidator.validate(pastDate), true);
  assert(pastValidator.validate(futureDate), false);
});

Deno.test("Date validation - weekday", () => {
  const validator = inp().date().weekday([0, 6]); // weekends only

  assert(validator.validate(new Date("2024-01-06")), true); // Saturday
  assert(validator.validate(new Date("2024-01-07")), true); // Sunday
  assert(validator.validate(new Date("2024-01-08")), false); // Monday
});

Deno.test("Date validation - age", () => {
  const validator = inp().date().age(18);

  const over18 = new Date();
  over18.setFullYear(over18.getFullYear() - 19);

  const under18 = new Date();
  under18.setFullYear(under18.getFullYear() - 17);

  assert(validator.validate(over18), true);
  assert(validator.validate(under18), false);

  // Edge case: exactly 18
  const exactly18 = new Date();
  exactly18.setFullYear(exactly18.getFullYear() - 18);
  assert(validator.validate(exactly18), true);
});

Deno.test("Date validation - optional", () => {
  const validator = inp().date().optional();

  assert(validator.validate(new Date()), true);
  assert(validator.validate(undefined), true);
  assert(validator.validate(null), true);
  assert(validator.validate("not a date"), false);
  assert(validator.validate(123), false);
});

Deno.test("Date validation - chaining multiple validations", () => {
  const validator = inp().date()
    .required()
    .min(new Date("2024-01-01"))
    .max(new Date("2024-12-31"))
    .weekday([1, 2, 3, 4, 5]) // weekdays only
    .format("yyyy-MM-dd");

  const validDate = new Date("2024-01-15"); // Monday
  const invalidWeekend = new Date("2024-01-13"); // Saturday
  const invalidYear = new Date("2025-01-15");

  assert(validator.validate(validDate), true);
  assert(validator.validate(invalidWeekend), false);
  assert(validator.validate(invalidYear), false);
});

Deno.test("Date validation - enum", () => {
  const dates = [
    new Date("2024-01-01"),
    new Date("2024-06-15"),
    new Date("2024-12-31"),
  ];
  const validator = inp().date().enum(dates);

  assert(validator.validate(new Date("2024-01-01")), true);
  assert(validator.validate(new Date("2024-06-15")), true);
  assert(validator.validate(new Date("2024-12-31")), true);
  assert(validator.validate(new Date("2024-02-01")), false);
  assert(validator.validate(new Date("2025-01-01")), false);
});
