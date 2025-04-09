// deno-lint-ignore-file no-explicit-any
import type { YelixInput } from "@/src/validation/inp.ts";
import {
  type FailedMessage,
  YelixValidationBase,
} from "@/src/validation/ValidationBase.ts";

class ArrayZod<T> extends YelixValidationBase<T[]> {
  input: YelixInput;
  override type: string = "array";

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
      (value: T[]) => {
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
      "array",
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
      minLength,
      (value: T[], minLength: number) => ({
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
      maxLength,
      (value: T[], maxLength: number) => ({
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
      exactLength,
      (value: T[], exactLength: number) => ({
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
      null,
      (value: T[]) => ({
        isOk: Array.isArray(value) && value.length > 0,
      }),
      failedMessage ? failedMessage : "Array must not be empty",
    );
    return this;
  }

  unique(failedMessage?: FailedMessage): this {
    this.addRule(
      "unique",
      null,
      (value: T[]) => ({
        isOk: Array.isArray(value) && value.length === new Set(value).size,
      }),
      failedMessage ? failedMessage : "Array must contain unique items",
    );
    return this;
  }

  includes(item: T, failedMessage?: FailedMessage): this {
    this.addRule(
      "includes",
      item,
      (value: T[], item: T) => ({
        isOk: Array.isArray(value) && value.includes(item),
      }),
      failedMessage ? failedMessage : `Array must include ${item}`,
    );
    return this;
  }

  every(validator: YelixValidationBase, failedMessage?: FailedMessage): this {
    this.addRule(
      "every",
      validator,
      (value: T[], validator: YelixValidationBase) => {
        if (!Array.isArray(value)) {
          return {
            isOk: false,
            errors: [{ message: "Value is not an array" }],
          };
        }

        const results = value.map((item, index) => {
          const result = validator.validate(item);
          return {
            index,
            isOk: result.isOk,
            errors: result.errors,
            value: item,
          };
        });

        const failedValidations = results.filter((r) => !r.isOk);
        const isValid = failedValidations.length === 0;

        return {
          isOk: isValid,
          errors: isValid ? [] : failedValidations.map((r) => ({
            path: `[${r.index}]`,
            value: r.value,
            errors: r.errors,
          })),
        };
      },
      failedMessage ? failedMessage : "All items must pass validation",
    );
    return this;
  }

  some(validator: YelixValidationBase, failedMessage?: FailedMessage): this {
    this.addRule(
      "some",
      validator,
      (value: T[], validator: YelixValidationBase) => {
        if (!Array.isArray(value)) return { isOk: false };

        const results = value.map((item, index) => {
          const result = validator.validate(item);
          return {
            index,
            ...result,
          };
        });

        const hasValidItem = results.some((r) => r.isOk);

        return {
          isOk: hasValidItem,
          errors: hasValidItem ? [] : results.map((r) => ({
            index: r.index,
            errors: r.errors,
          })),
        };
      },
      failedMessage ? failedMessage : "At least one item must pass validation",
    );
    return this;
  }
}

export { ArrayZod };
