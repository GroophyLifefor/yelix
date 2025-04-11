// deno-lint-ignore-file no-explicit-any
import type { YelixInput } from "@/src/validation/inp.ts";
import {
  type FailedMessage,
  YelixValidationBase,
} from "@/src/validation/ValidationBase.ts";
import { inp, type NumberZod } from "@/mod.ts";

class StringZod extends YelixValidationBase<string> {
  input: YelixInput;
  override type: string = "string";

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
      failedMessage
        ? failedMessage
        : "This field must be a string and is required.",
    );
    return this;
  }

  isValidType(failedMessage?: FailedMessage): this {
    this.addRule(
      "isValidType",
      "string",
      (value: any) => ({
        isOk: value === null || value === undefined
          ? true
          : typeof value === "string",
      }),
      failedMessage ? failedMessage : "Value must be a string",
    );
    return this;
  }

  optional(): this {
    this.removeRule("required");
    return this;
  }

  trim(failedMessage?: FailedMessage): this {
    this.addRule(
      "trim",
      null,
      (value: any) => {
        if (typeof value !== "string") {
          return { isOk: false };
        }
        const trimmed = value.trim();
        return {
          isOk: true,
          newValue: trimmed,
        };
      },
      failedMessage ? failedMessage : "This field is not a string.",
      true, // Mark this as a transformer that should run first
    );
    return this;
  }

  max(maxLength: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "max",
      maxLength,
      (value: any, maxLength: number) => ({
        isOk: typeof value === "string" && value.length <= maxLength,
      }),
      failedMessage
        ? failedMessage
        : () => `String must be at most ${maxLength} characters long`,
    );
    return this;
  }

  min(minLength: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "min",
      minLength,
      (value: any, minLength: number) => ({
        isOk: typeof value === "string" && value.length >= minLength,
      }),
      failedMessage
        ? failedMessage
        : () => `String must be at least ${minLength} characters long`,
    );
    return this;
  }

  length(exactLength: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "length",
      exactLength,
      (value: any, exactLength: number) => ({
        isOk: typeof value === "string" && value.length === exactLength,
      }),
      failedMessage
        ? failedMessage
        : `String must be exactly ${exactLength} characters long`,
    );
    return this;
  }

  email(failedMessage?: FailedMessage): this {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    this.addRule(
      "email",
      null,
      (value: any) => ({
        isOk: typeof value === "string" && emailRegex.test(value),
      }),
      failedMessage ? failedMessage : "Invalid email address",
    );
    return this;
  }

  url(failedMessage?: FailedMessage): this {
    this.addRule(
      "url",
      null,
      (value: any) => {
        try {
          new URL(value);
          return { isOk: true };
        } catch {
          return { isOk: false };
        }
      },
      failedMessage ? failedMessage : "Invalid URL",
    );
    return this;
  }

  regex(pattern: RegExp, failedMessage?: FailedMessage): this {
    this.addRule(
      "regex",
      pattern,
      (value: any, pattern: RegExp) => ({
        isOk: typeof value === "string" && pattern.test(value),
      }),
      failedMessage ? failedMessage : "String does not match pattern",
    );
    return this;
  }

  includes(searchString: string, failedMessage?: FailedMessage): this {
    this.addRule(
      "includes",
      searchString,
      (value: any, searchString: string) => ({
        isOk: typeof value === "string" && value.includes(searchString),
      }),
      failedMessage ? failedMessage : `String must include "${searchString}"`,
    );
    return this;
  }

  startsWith(searchString: string, failedMessage?: FailedMessage): this {
    this.addRule(
      "startsWith",
      searchString,
      (value: any, searchString: string) => ({
        isOk: typeof value === "string" && value.startsWith(searchString),
      }),
      failedMessage
        ? failedMessage
        : `String must start with "${searchString}"`,
    );
    return this;
  }

  endsWith(searchString: string, failedMessage?: FailedMessage): this {
    this.addRule(
      "endsWith",
      searchString,
      (value: any, searchString: string) => ({
        isOk: typeof value === "string" && value.endsWith(searchString),
      }),
      failedMessage ? failedMessage : `String must end with "${searchString}"`,
    );
    return this;
  }

  datetime(failedMessage?: FailedMessage): this {
    const isoDatetimeRegex =
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[-+]\d{2}:?\d{2})?$/;
    this.addRule(
      "datetime",
      null,
      (value: any) => ({
        isOk: typeof value === "string" && isoDatetimeRegex.test(value),
      }),
      failedMessage ? failedMessage : "Invalid ISO 8601 datetime",
    );
    return this;
  }

  ip(failedMessage?: FailedMessage): this {
    const ipv4Regex =
      /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    const ipv6Regex =
      /^(?:(?:[a-fA-F0-9]{1,4}:){7}[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,7}:|(?:[a-fA-F0-9]{1,4}:){1,6}:[a-fA-F0-9]{1,4}|(?:[a-fA-F0-9]{1,4}:){1,5}(?::[a-fA-F0-9]{1,4}){1,2}|(?:[a-fA-F0-9]{1,4}:){1,4}(?::[a-fA-F0-9]{1,4}){1,3}|(?:[a-fA-F0-9]{1,4}:){1,3}(?::[a-fA-F0-9]{1,4}){1,4}|(?:[a-fA-F0-9]{1,4}:){1,2}(?::[a-fA-F0-9]{1,4}){1,5}|[a-fA-F0-9]{1,4}:(?:(?::[a-fA-F0-9]{1,4}){1,6})|:(?:(?::[a-fA-F0-9]{1,4}){1,7}|:))$/;
    this.addRule(
      "ip",
      null,
      (value: any) => ({
        isOk: typeof value === "string" &&
          (ipv4Regex.test(value) || ipv6Regex.test(value)),
      }),
      failedMessage ? failedMessage : "Invalid IP address",
    );
    return this;
  }

  toLowerCase(failedMessage?: FailedMessage): this {
    this.addRule(
      "toLowerCase",
      null,
      (value: any) => {
        if (typeof value !== "string") {
          return { isOk: false };
        }
        return {
          isOk: true,
          newValue: value.toLowerCase(),
        };
      },
      failedMessage ? failedMessage : "Value must be a string",
      true, // Mark this as a transformer that should run first
    );
    return this;
  }

  toUpperCase(failedMessage?: FailedMessage): this {
    this.addRule(
      "toUpperCase",
      null,
      (value: any) => ({
        isOk: typeof value === "string",
        newValue: value.toUpperCase(),
      }),
      failedMessage ? failedMessage : "Value must be a string",
    );
    return this;
  }

  date(failedMessage?: FailedMessage): this {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    this.addRule(
      "date",
      null,
      (value: any) => ({
        isOk: typeof value === "string" && dateRegex.test(value),
      }),
      failedMessage ? failedMessage : "Invalid ISO date format (YYYY-MM-DD)",
    );
    return this;
  }

  time(failedMessage?: FailedMessage): this {
    const timeRegex = /^(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d+)?$/;
    this.addRule(
      "time",
      null,
      (value: any) => ({
        isOk: typeof value === "string" && timeRegex.test(value),
      }),
      failedMessage
        ? failedMessage
        : "Invalid ISO time format (HH:mm:ss[.SSSSSS])",
    );
    return this;
  }

  base64(failedMessage?: FailedMessage): this {
    const base64Regex = /^[A-Za-z0-9+/]*={0,2}$/;
    this.addRule(
      "base64",
      null,
      (value: any) => ({
        isOk: typeof value === "string" && base64Regex.test(value),
      }),
      failedMessage ? failedMessage : "Invalid base64 string",
    );
    return this;
  }

  enum(enums: string[], failedMessage?: FailedMessage): this {
    this.addRule(
      "enum",
      enums,
      (value: any, enums: string[]) => ({
        isOk: typeof value === "string" && enums.includes(value),
      }),
      failedMessage
        ? failedMessage
        : () => `Value must be one of: ${enums.join(", ")}`,
    );
    return this;
  }

  toNumber(failedMessage?: FailedMessage): NumberZod {
    const numberZod = inp().number() as NumberZod;

    numberZod.addRule(
      "toNumber",
      this,
      (value: any, validator: StringZod) => {
        if (typeof value !== "string") {
          return { isOk: false };
        }

        const numRegex = /^-?(?:\d+(?:\.\d*)?|\.\d+)$/;
        if (!numRegex.test(value)) {
          return { isOk: false };
        }
        const parsedValue = Number(value);

        const validation = validator.validate(value);
        if (!validation.isOk) {
          return { isOk: false };
        }

        return {
          isOk: true,
          newValue: parsedValue,
        };
      },
      failedMessage ? failedMessage : () => `Value must be a number`,
      true,
      true,
    );

    return numberZod;
  }
}

export { StringZod };
