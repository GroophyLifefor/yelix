// deno-lint-ignore-file no-explicit-any
import type { YelixInput } from "@/src/validation/inp.ts";
import {
  type FailedMessage,
  YelixValidationBase,
} from "@/src/validation/ValidationBase.ts";

class NumberZod extends YelixValidationBase<number> {
  input: YelixInput;
  override type: string = "number";

  constructor(_input: YelixInput) {
    super();
    this.input = _input;

    this.required();
    this.isValidType();
  }

  required(failedMessage?: FailedMessage): this {
    this.addRule(
      "required",
      null,
      (value: any) => {
        return {
          isOk: value !== undefined && value !== null,
        };
      },
      failedMessage ? failedMessage : "This field is required.",
    );
    return this;
  }

  isValidType(failedMessage?: FailedMessage): this {
    this.addRule(
      "isValidType",
      "number",
      (value: any) => ({
        isOk: value === null || value === undefined
          ? true
          : typeof value === "number",
      }),
      failedMessage ? failedMessage : "Value must be a number",
    );
    return this;
  }

  optional(): this {
    this.removeRule("required");
    return this;
  }

  min(minValue: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "min",
      minValue,
      (value: any, minValue: number) => ({
        isOk: typeof value === "number" && value >= minValue,
      }),
      failedMessage
        ? failedMessage
        : `Number must be greater than or equal to ${minValue}`,
    );
    return this;
  }

  max(maxValue: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "max",
      maxValue,
      (value: any, maxValue: number) => ({
        isOk: typeof value === "number" && value <= maxValue,
      }),
      failedMessage
        ? failedMessage
        : `Number must be less than or equal to ${maxValue}`,
    );
    return this;
  }

  integer(failedMessage?: FailedMessage): this {
    this.addRule(
      "integer",
      null,
      (value: any) => ({
        isOk: typeof value === "number" && Number.isInteger(value),
      }),
      failedMessage ? failedMessage : "Number must be an integer",
    );
    return this;
  }

  positive(failedMessage?: FailedMessage): this {
    this.addRule(
      "positive",
      null,
      (value: any) => ({
        isOk: typeof value === "number" && value > 0,
      }),
      failedMessage ? failedMessage : "Number must be positive",
    );
    return this;
  }

  negative(failedMessage?: FailedMessage): this {
    this.addRule(
      "negative",
      null,
      (value: any) => ({
        isOk: typeof value === "number" && value < 0,
      }),
      failedMessage ? failedMessage : "Number must be negative",
    );
    return this;
  }

  range(min: number, max: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "range",
      [min, max],
      (value: any, [min, max]: number[]) => ({
        isOk: typeof value === "number" && value >= min && value <= max,
      }),
      failedMessage
        ? failedMessage
        : `Number must be between ${min} and ${max}`,
    );
    return this;
  }

  multipleOf(base: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "multipleOf",
      base,
      (value: any, base: number) => ({
        isOk: typeof value === "number" && value % base === 0,
      }),
      failedMessage ? failedMessage : `Number must be a multiple of ${base}`,
    );
    return this;
  }

  finite(failedMessage?: FailedMessage): this {
    this.addRule(
      "finite",
      null,
      (value: any) => ({
        isOk: typeof value === "number" && Number.isFinite(value),
      }),
      failedMessage ? failedMessage : "Number must be finite",
    );
    return this;
  }

  safe(failedMessage?: FailedMessage): this {
    this.addRule(
      "safe",
      null,
      (value: any) => ({
        isOk: typeof value === "number" && Number.isSafeInteger(value),
      }),
      failedMessage ? failedMessage : "Number must be a safe integer",
    );
    return this;
  }

  enum(enums: number[], failedMessage?: FailedMessage): this {
    this.addRule(
      "enum",
      enums,
      (value: any, enums: number[]) => ({
        isOk: typeof value === "number" && enums.includes(value),
      }),
      failedMessage
        ? failedMessage
        : `Value must be one of: ${enums.join(", ")}`,
    );
    return this;
  }
}

export { NumberZod };
