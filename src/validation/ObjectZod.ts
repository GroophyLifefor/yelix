// deno-lint-ignore-file no-explicit-any
import type { YelixInput } from '@/src/validation/inp.ts';
import {
  type FailedMessage,
  type Rule,
  type UnknownObject,
  YelixValidationBase,
} from '@/mod.ts';

class ObjectZod extends YelixValidationBase {
  private input: YelixInput;

  constructor(_input: YelixInput, obj?: UnknownObject) {
    super();
    this.input = _input;

    this.required();
    this.isValidType();

    this.loadKeys(obj);
  }

  private loadKeys(_obj?: UnknownObject) {
    const validateObject = (obj?: UnknownObject) => {
      if (obj) {
        const keys = Object.keys(obj);
        for (const key of keys) {
          this.addRule(
            key,
            (value: any) => {
              if (obj[key] instanceof YelixValidationBase) {
                const nestedValue =
                  value && typeof value === 'object' ? value[key] : undefined;
                return obj[key].validate(nestedValue, {
                  key: key,
                });
              }
              return { isOk: false };
            },
            (error) => {
              return error.result.errors;
            }
          );
        }
      }
    };
    validateObject(_obj);
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

  isValidType(failedMessage?: FailedMessage): this {
    this.addRule(
      'isValidType',
      (value: any) => ({
      isOk: value === null || value === undefined ? true : typeof value === 'object' && value !== null && !Array.isArray(value)
      }),
      failedMessage ? failedMessage : 'Value must be an object, not an array'
    );
    return this;
  }

  optional(): this {
    this.removeRule('required');
    return this;
  }

  hasKey(key: string, failedMessage?: FailedMessage): this {
    this.addRule(
      'hasKey',
      (value: any) => ({
        isOk: typeof value === 'object' && value !== null && key in value,
      }),
      failedMessage ? failedMessage : `Object must have key "${key}"`
    );
    return this;
  }

  minKeys(count: number, failedMessage?: FailedMessage): this {
    this.addRule(
      'minKeys',
      (value: any) => ({
        isOk:
          typeof value === 'object' &&
          value !== null &&
          Object.keys(value).length >= count,
      }),
      failedMessage ? failedMessage : `Object must have at least ${count} keys`
    );
    return this;
  }

  maxKeys(count: number, failedMessage?: FailedMessage): this {
    this.addRule(
      'maxKeys',
      (value: any) => ({
        isOk:
          typeof value === 'object' &&
          value !== null &&
          Object.keys(value).length <= count,
      }),
      failedMessage ? failedMessage : `Object must have at most ${count} keys`
    );
    return this;
  }

  exactKeys(keys: string[], failedMessage?: FailedMessage): this {
    this.addRule(
      'exactKeys',
      (value: any) => {
        if (typeof value !== 'object' || value === null) return { isOk: false };
        const objKeys = Object.keys(value);
        return {
          isOk:
            objKeys.length === keys.length &&
            keys.every((key) => objKeys.includes(key)),
        };
      },
      failedMessage
        ? failedMessage
        : `Object must have exactly these keys: ${keys.join(', ')}`
    );
    return this;
  }
}

export { ObjectZod };
