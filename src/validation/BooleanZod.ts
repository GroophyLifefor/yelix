// deno-lint-ignore-file no-explicit-any
import type { YelixInput } from "@/src/validation/inp.ts";
import {
  type FailedMessage,
  YelixValidationBase,
} from "@/src/validation/ValidationBase.ts";

class BooleanZod extends YelixValidationBase {
  input: YelixInput;

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
      (value: any) => ({
        isOk: value !== undefined && value !== null,
      }),
      failedMessage
        ? failedMessage
        : "This field must be a boolean and is required.",
    );
    return this;
  }

  isValidType(failedMessage?: FailedMessage): this {
    this.addRule(
      "isValidType",
      "boolean",
      (value: any) => ({
        isOk: value === null || value === undefined
          ? true
          : typeof value === "boolean",
      }),
      failedMessage ? failedMessage : "Value must be a boolean",
    );
    return this;
  }

  optional(): this {
    this.removeRule("required");
    return this;
  }

  true(failedMessage?: FailedMessage): this {
    this.addRule(
      "true",
      null,
      (value: any) => ({
        isOk: value === true,
      }),
      failedMessage ? failedMessage : "Value must be true",
    );
    return this;
  }

  false(failedMessage?: FailedMessage): this {
    this.addRule(
      "false",
      null,
      (value: any) => ({
        isOk: value === false,
      }),
      failedMessage ? failedMessage : "Value must be false",
    );
    return this;
  }

  transform(failedMessage?: FailedMessage): this {
    this.addRule(
      "transform",
      null,
      (value: any) => {
        // Handle string inputs
        if (typeof value === "string") {
          const lowercased = value.toLowerCase().trim();
          if (lowercased === "true") return { isOk: true, newValue: true };
          if (lowercased === "false") return { isOk: true, newValue: false };
        }

        // Handle numeric inputs
        if (value === 1 || value === "1") return { isOk: true, newValue: true };
        if (value === 0 || value === "0") {
          return { isOk: true, newValue: false };
        }

        // Handle boolean inputs (pass through)
        if (typeof value === "boolean") return { isOk: true, newValue: value };

        // Invalid input
        return {
          isOk: false,
          errors: [{
            message: failedMessage || "Cannot transform value to boolean",
            key: "",
            title: "transform",
          }],
        };
      },
      failedMessage ? failedMessage : "Cannot transform value to boolean",
      true, // Mark as transformer
    );
    return this;
  }

  equals(compareValue: boolean, failedMessage?: FailedMessage): this {
    this.addRule(
      "equals",
      compareValue,
      (value: any, compareValue: boolean) => ({
        isOk: value === compareValue,
      }),
      failedMessage ? failedMessage : `Value must be equal to ${compareValue}`,
    );
    return this;
  }

  notEquals(compareValue: boolean, failedMessage?: FailedMessage): this {
    this.addRule(
      "notEquals",
      compareValue,
      (value: any, compareValue: boolean) => ({
        isOk: value !== compareValue,
      }),
      failedMessage
        ? failedMessage
        : `Value must not be equal to ${compareValue}`,
    );
    return this;
  }
}

export { BooleanZod };
