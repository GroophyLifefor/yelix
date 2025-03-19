// deno-lint-ignore-file no-explicit-any
import type { YelixInput } from "@/src/validation/inp.ts";
import {
  type FailedMessage,
  type Rule,
  YelixValidationBase,
} from "@/src/validation/ValidationBase.ts";

class FileZod extends YelixValidationBase {
  private input: YelixInput;

  constructor(_input: YelixInput) {
    super();
    this.input = _input;
  }

  required(failedMessage?: FailedMessage): this {
    this.addRule(
      "required",
      (value: any) => {
        return {
          isOk: value !== undefined && value !== null,
        };
      },
      failedMessage ? failedMessage : "This field is required.",
    );
    return this;
  }

  multipleFiles(): this {
    this.getType = "getAll";
    return this;
  }

  minFilesCount(count: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "minFilesCount",
      (value: any) => {
        return {
          isOk: value.length >= count,
        };
      },
      failedMessage
        ? failedMessage
        : (value: any) =>
          `Minimum number of files is ${count}. Got ${value.length}`,
    );
    return this;
  }

  maxFilesCount(count: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "maxFilesCount",
      (value: any) => {
        return {
          isOk: value.length <= count,
        };
      },
      failedMessage
        ? failedMessage
        : (value: any) =>
          `Maximum number of files is ${count}. Got ${value.length}`,
    );
    return this;
  }

  maxSize(size: number): this {
    this.addRule("maxSize", (value: any) => {
      return {
        isOk: value.size <= size,
      };
    });
    return this;
  }

  minSize(size: number, failedMessage?: FailedMessage): this {
    this.addRule(
      "minSize",
      (value: any) => {
        return {
          isOk: value.size >= size,
        };
      },
      failedMessage ? failedMessage : `File must be at least ${size} bytes`,
    );
    return this;
  }

  mimeType(mimeType: string | string[], failedMessage?: FailedMessage): this {
    this.addRule(
      "mimeType",
      (value: any) => {
        const mimes = Array.isArray(mimeType) ? mimeType : [mimeType];
        const values = Array.isArray(value) ? value : [value];
        for (const val of values) {
          if (!mimes.includes(val.type)) {
            return {
              isOk: false,
            };
          }
        }
        return {
          isOk: true,
        };
      },
      failedMessage
        ? failedMessage
        : (value: any) =>
          `File must be of type ${
            Array.isArray(mimeType) ? mimeType.join(" or ") : mimeType
          }. Got ${value.type}`,
    );
    return this;
  }

  customRule(rule: Rule, title: string, failedMessage?: FailedMessage): this {
    this.addRule(title, rule, failedMessage);
    return this;
  }
}

export { FileZod };
