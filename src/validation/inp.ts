import { FileZod } from '@/src/validation/FileZod.ts';
import { StringZod } from '@/src/validation/StringZod.ts';
import { ObjectZod } from '@/src/validation/ObjectZod.ts';
import type { DateConfig, UnknownObject } from '@/mod.ts';
import { NumberZod } from '@/src/validation/NumberZod.ts';
import { ArrayZod } from '@/src/validation/ArrayZod.ts';
import { DateZod } from '@/src/validation/DateZod.ts';

export type InferStringInput = string;

export type InferFileInput = {
  name: string;
  size: number;
  type: string;
  content?: File | Blob;
};

export type InferMultipleFileInput = Array<InferFileInput>;

export type InferYelixInput<T> = T extends ReturnType<YelixInput['string']>
  ? InferStringInput
  : // deno-lint-ignore no-explicit-any
  T extends ReturnType<YelixInput['file']> & { multipleFiles(): any }
  ? InferMultipleFileInput
  : T extends ReturnType<YelixInput['file']>
  ? InferFileInput
  : unknown;

export type InferYelixSchema<T> = {
  [K in keyof T]: InferYelixInput<T[K]>;
};

class YelixInput {
  private _zod:
    | FileZod
    | StringZod
    | ObjectZod
    | NumberZod
    | ArrayZod
    | DateZod
    | undefined;

  file(): FileZod {
    if (this._zod) {
      throw new Error('Input type already set.');
    }

    this._zod = new FileZod(this);
    return this._zod;
  }

  string(): StringZod {
    if (this._zod) {
      throw new Error('Input type already set.');
    }

    this._zod = new StringZod(this);
    return this._zod;
  }

  object(_obj?: UnknownObject): ObjectZod {
    if (this._zod) {
      throw new Error('Input type already set.');
    }

    this._zod = new ObjectZod(this, _obj);
    return this._zod;
  }

  number(): NumberZod {
    if (this._zod) {
      throw new Error('Input type already set.');
    }

    this._zod = new NumberZod(this);
    return this._zod;
  }

  array(): ArrayZod {
    if (this._zod) {
      throw new Error('Input type already set.');
    }

    this._zod = new ArrayZod(this);
    return this._zod;
  }

  date(config?: DateConfig): DateZod {
    if (this._zod) {
      throw new Error('Input type already set.');
    }

    this._zod = new DateZod(this, config);
    return this._zod;
  }
}

function inp(): YelixInput {
  return new YelixInput();
}

export { inp, YelixInput };
