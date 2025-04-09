import { FileZod } from '@/src/validation/FileZod.ts';
import { StringZod } from '@/src/validation/StringZod.ts';
import { ObjectZod } from '@/src/validation/ObjectZod.ts';
import { NumberZod } from '@/src/validation/NumberZod.ts';
import { ArrayZod } from '@/src/validation/ArrayZod.ts';
import { DateZod } from '@/src/validation/DateZod.ts';
import { BooleanZod } from '@/src/validation/BooleanZod.ts';
import { AnyZod } from '@/src/validation/AnyZod.ts';
import type { DateConfig, YelixValidationBase } from '@/mod.ts';

export type Infer<T> = T extends YelixValidationBase<infer U>
  ? U
  : T extends { [key: string]: YelixValidationBase<infer U> }
  ? { [K in keyof T]: Infer<T[K]> }
  : T extends ArrayZod<infer U>
  ? U[] // Extract the element type inside an ArrayZod
  : never;

function inp(): YelixInput {
  return new YelixInput();
}

class YelixInput {
  private _zod:
    | FileZod
    | StringZod
    // deno-lint-ignore no-explicit-any
    | ObjectZod<any>
    | NumberZod
    // deno-lint-ignore no-explicit-any
    | ArrayZod<any>
    | DateZod
    | BooleanZod
    | AnyZod
    | undefined;

  file(): FileZod {
    if (this._zod) {
      throw new Error('Input type already set.');
    }

    const zod = new FileZod(this) as FileZod;
    this._zod = zod;
    return zod;
  }

  string(): StringZod {
    if (this._zod) {
      throw new Error('Input type already set.');
    }

    const zod = new StringZod(this);
    this._zod = zod;
    return zod;
  }

  // deno-lint-ignore no-explicit-any
  object<T extends Record<string, YelixValidationBase<any>>>(
    obj?: T
  ): ObjectZod<T> {
    if (this._zod) {
      throw new Error('Input type already set.');
    }

    const zod = new ObjectZod(this, obj);
    this._zod = zod;
    return zod;
  }

  number(): NumberZod {
    if (this._zod) {
      throw new Error('Input type already set.');
    }

    const zod = new NumberZod(this);
    this._zod = zod;
    return zod;
  }

  array<T>(
    validator?: YelixValidationBase
  ): ArrayZod<T | Infer<typeof validator>> {
    if (this._zod) {
      throw new Error('Input type already set.');
    }

    if (validator) {
      const v = new ArrayZod<Infer<typeof validator>>(this);
      this._zod = v;
      return v;
    }

    const zod = new ArrayZod<T>(this);
    this._zod = zod;
    return zod;
  }

  date(config?: DateConfig): DateZod {
    if (this._zod) {
      throw new Error('Input type already set.');
    }

    const zod = new DateZod(this, config);
    this._zod = zod;
    return zod;
  }

  boolean(): BooleanZod {
    if (this._zod) {
      throw new Error('Input type already set.');
    }

    const zod = new BooleanZod(this);
    this._zod = zod;
    return zod;
  }

  any(): AnyZod {
    if (this._zod) {
      throw new Error('Input type already set.');
    }

    const zod = new AnyZod(this);
    this._zod = zod;
    return zod;
  }
}

// Export the function and class at the end
export { inp, YelixInput };
