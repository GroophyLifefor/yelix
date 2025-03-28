// deno-lint-ignore-file no-explicit-any
import type { YelixInput } from "@/src/validation/inp.ts";
import {
  type FailedMessage,
  type Rule,
  YelixValidationBase,
} from "@/src/validation/ValidationBase.ts";

class ArrayZod extends YelixValidationBase {
  private input: YelixInput;

  constructor(_input: YelixInput) {
    super();
    this.input = _input;

    this.required();
    this.isValidType();
  }

  required(failedMessage?: FailedMessage): this {
    this.addRule(
      "required",
      (value: any) => {
        return {
          isOk: value !== undefined && value !== null && Array.isArray(value),
        };
      },
      failedMessage ? failedMessage : "This field is required.",
    );
    return this;
  }

  optional(): this {
    this.removeRule("required");
    return this;
  }

  isValidType(failedMessage?: FailedMessage): this {
    this.addRule(
      "isValidType",
      (value: any) => ({
        isOk: Array.isArray(value) || value === null || value === undefined,
      }),
      failedMessage ? failedMessage : "Value must be an array",
    );
    return this;
  }

  min(minLength: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "min",
      (value: any) => ({
        isOk: Array.isArray(value) && value.length >= minLength,
      }),
      failedMessage
        ? failedMessage
        : `Array must have at least ${minLength} items`,
    );
    return this;
  }

  max(maxLength: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "max",
      (value: any) => ({
        isOk: Array.isArray(value) && value.length <= maxLength,
      }),
      failedMessage
        ? failedMessage
        : `Array must have at most ${maxLength} items`,
    );
    return this;
  }

  length(exactLength: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "length",
      (value: any) => ({
        isOk: Array.isArray(value) && value.length === exactLength,
      }),
      failedMessage
        ? failedMessage
        : `Array must have exactly ${exactLength} items`,
    );
    return this;
  }

  notEmpty(failedMessage?: FailedMessage): this {
    this.addRule(
      "notEmpty",
      (value: any) => ({
        isOk: Array.isArray(value) && value.length > 0,
      }),
      failedMessage ? failedMessage : "Array must not be empty",
    );
    return this;
  }

  unique(failedMessage?: FailedMessage): this {
    this.addRule(
      "unique",
      (value: any) => ({
        isOk: Array.isArray(value) && 
          value.length === new Set(value).size,
      }),
      failedMessage ? failedMessage : "Array must contain unique items",
    );
    return this;
  }

  includes(item: any, failedMessage?: FailedMessage): this {
    this.addRule(
      "includes",
      (value: any) => ({
        isOk: Array.isArray(value) && value.includes(item),
      }),
      failedMessage ? failedMessage : `Array must include ${item}`,
    );
    return this;
  }

  every(validator: YelixValidationBase, failedMessage?: FailedMessage): this {
    this.addRule(
      "every",
      (value: any) => {
        if (!Array.isArray(value)) return { isOk: false };
        return {
          isOk: value.every((item) => validator.validate(item).isOk),
        };
      },
      failedMessage ? failedMessage : "All items must pass validation",
    );
    return this;
  }

  some(validator: YelixValidationBase, failedMessage?: FailedMessage): this {
    this.addRule(
      "some",
      (value: any) => {
        if (!Array.isArray(value)) return { isOk: false };
        return {
          isOk: value.some((item) => validator.validate(item).isOk),
        };
      },
      failedMessage ? failedMessage : "At least one item must pass validation",
    );
    return this;
  }

  customRule(rule: Rule, title: string, failedMessage?: FailedMessage): this {
    this.addRule(title, rule, failedMessage);
    return this;
  }
}

export { ArrayZod };
