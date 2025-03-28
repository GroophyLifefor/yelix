// deno-lint-ignore-file no-explicit-any
import type { YelixInput } from '@/src/validation/inp.ts';
import {
  type FailedMessage,
  YelixValidationBase,
} from '@/src/validation/ValidationBase.ts';

class FileZod extends YelixValidationBase {
  private input: YelixInput;

  constructor(_input: YelixInput) {
    super();
    this.input = _input;

    this.required();
    this.isValidType();
  }

  required(failedMessage?: FailedMessage): this {
    this.addRule(
      'required',
      (value: any) => {
        return {
          isOk: value !== undefined && value !== null,
        };
      },
      failedMessage ? failedMessage : 'This field is required.'
    );
    return this;
  }

  private isValidTypeCheck(value: any): boolean {
    return value === null || value === undefined
      ? true
      : Array.isArray(value)
      ? value.every((f) => f instanceof File)
      : value instanceof File;
  }

  isValidType(failedMessage?: FailedMessage): this {
    this.addRule(
      'isValidType',
      (value: any) => ({
        isOk: this.isValidTypeCheck(value),
      }),
      failedMessage
        ? failedMessage
        : 'Value must be a file or an array of files'
    );
    return this;
  }

  optional(): this {
    this.removeRule('required');
    return this;
  }

  multipleFiles(): this {
    this.getType = 'getAll';
    return this;
  }

  minFilesCount(count: number, failedMessage?: FailedMessage): this {
    this.addRule(
      'minFilesCount',
      (value: any) => {
        return {
          isOk: value.length >= count,
        };
      },
      failedMessage
        ? failedMessage
        : (value: any) =>
            `Minimum number of files is ${count}. Got ${value.length}`
    );
    return this;
  }

  maxFilesCount(count: number, failedMessage?: FailedMessage): this {
    this.addRule(
      'maxFilesCount',
      (value: any) => {
        if (value === null || value === undefined) {
          return { isOk: true };
        }
        const values = Array.isArray(value) ? value : [value];
        return {
          isOk: values.length <= count,
        };
      },
      failedMessage
        ? failedMessage
        : (value: any) =>
            `Maximum number of files is ${count}. Got ${
              value ? (Array.isArray(value) ? value.length : 1) : 0
            }`
    );
    return this;
  }

  maxSize(size: number, failedMessage?: FailedMessage): this {
    this.addRule(
      'maxSize',
      (value: any) => {
        const files = Array.isArray(value) ? value : [value];
        for (const file of files) {
          if (this.isValidTypeCheck(file)) {
            return {
              isOk: false,
            };
          }
          if (file.size > size) {
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
            `File size must not exceed ${size} bytes. Got ${
              Array.isArray(value)
                ? value.map((f) => f.size).join(', ')
                : value.size
            }`
    );
    return this;
  }

  minSize(size: number, failedMessage?: FailedMessage): this {
    this.addRule(
      'minSize',
      (value: any) => {
        return {
          isOk: value.size >= size,
        };
      },
      failedMessage ? failedMessage : `File must be at least ${size} bytes`
    );
    return this;
  }

  mimeType(mimeType: string | string[], failedMessage?: FailedMessage): this {
    this.addRule(
      'mimeType',
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
              Array.isArray(mimeType) ? mimeType.join(' or ') : mimeType
            }. Got ${value.type}`
    );
    return this;
  }
}

export { FileZod };
