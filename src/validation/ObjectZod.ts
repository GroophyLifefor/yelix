// deno-lint-ignore-file no-explicit-any
import type { YelixInput } from "@/src/validation/inp.ts";
import {
  type AbstractValidationBase,
  type FailedMessage,
  type ValidateConfig,
  type ValidateResult,
  type ValidationError,
  YelixValidationBase,
} from "@/mod.ts";

type Mutable<T> = { -readonly [K in keyof T]: T[K] };

class ObjectZod<T extends Record<string, AbstractValidationBase<any>>>
  extends YelixValidationBase<T> {
  input: YelixInput;
  subFields: Mutable<T>;
  override type: string = "object";

  constructor(_input: YelixInput, obj?: T) {
    super();
    this.input = _input;

    this.required();
    this.isValidType();

    this.subFields = obj ?? ({} as T);
    this.loadKeys(this.subFields);
  }

  private setSubField<K extends keyof T>(
    key: K,
    value: YelixValidationBase<any>,
  ) {
    this.subFields[key] = value as unknown as T[K];
  }

  private loadKeys(obj?: T) {
    if (obj) {
      Object.keys(obj).forEach((key) => {
        this.setSubField(
          key as keyof T,
          obj[key] as unknown as YelixValidationBase<any>,
        );
      });
    }
  }

  getSchema(): T {
    return this.subFields;
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
      null,
      (value: any) => ({
        isOk: value === null || value === undefined
          ? true
          : typeof value === "object" &&
            value !== null &&
            !Array.isArray(value),
      }),
      failedMessage ? failedMessage : "Value must be an object, not an array",
    );
    return this;
  }

  optional(): this {
    this.removeRule("required");
    return this;
  }

  hasKey(key: string, failedMessage?: FailedMessage): this {
    this.addRule(
      "hasKey",
      key,
      (value: any, key: string) => ({
        isOk: typeof value === "object" && value !== null && key in value,
      }),
      failedMessage ? failedMessage : `Object must have key "${key}"`,
    );
    return this;
  }

  minKeys(count: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "minKeys",
      count,
      (value: any, count: number) => ({
        isOk: typeof value === "object" &&
          value !== null &&
          Object.keys(value).length >= count,
      }),
      failedMessage ? failedMessage : `Object must have at least ${count} keys`,
    );
    return this;
  }

  maxKeys(count: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "maxKeys",
      count,
      (value: any, count: number) => ({
        isOk: typeof value === "object" &&
          value !== null &&
          Object.keys(value).length <= count,
      }),
      failedMessage ? failedMessage : `Object must have at most ${count} keys`,
    );
    return this;
  }

  exactKeys(keys: string[], failedMessage?: FailedMessage): this {
    this.addRule(
      "exactKeys",
      keys,
      (value: any, keys: string[]) => {
        if (typeof value !== "object" || value === null) return { isOk: false };
        const objKeys = Object.keys(value);
        return {
          isOk: objKeys.length === keys.length &&
            keys.every((key) => objKeys.includes(key)),
        };
      },
      failedMessage
        ? failedMessage
        : `Object must have exactly these keys: ${keys.join(", ")}`,
    );
    return this;
  }

  override validate(value: any, config?: ValidateConfig): ValidateResult {
    const baseResult = super.validate(value, config);

    if (!baseResult.isOk || value === null || value === undefined) {
      return baseResult;
    }

    const subFieldErrors: ValidationError[] = [];

    for (const [key, validator] of Object.entries(this.subFields)) {
      const fieldValue = value[key];
      const fieldResult = validator.validate(fieldValue);

      if (!fieldResult.isOk) {
        fieldResult.errors.forEach(
          (error: { message: string; key: string; from: string }) => {
            subFieldErrors.push({
              message: error.message,
              key: `${key}.${error.key || ""}`.replace(/\.$/, ""),
              from: error.from as "query" | "body" | "formData",
            });
          },
        );
      }
    }

    return {
      ...baseResult,
      isOk: subFieldErrors.length === 0,
      errors: subFieldErrors.length > 0
        ? [...baseResult.errors, ...subFieldErrors]
        : baseResult.errors,
    };
  }
}

export { ObjectZod };
