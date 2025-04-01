import { FileZod } from "@/src/validation/FileZod.ts";
import { StringZod } from "@/src/validation/StringZod.ts";
import { ObjectZod } from "@/src/validation/ObjectZod.ts";
import { NumberZod } from "@/src/validation/NumberZod.ts";
import { ArrayZod } from "@/src/validation/ArrayZod.ts";
import { DateZod } from "@/src/validation/DateZod.ts";
import { BooleanZod } from "@/src/validation/BooleanZod.ts";
import { AnyZod } from "@/src/validation/AnyZod.ts";
import type { DateConfig, UnknownObject } from "@/mod.ts";

export type InferStringInput = string;

export type InferFileInput = {
  name: string;
  size: number;
  type: string;
  content?: File | Blob;
};

export type InferMultipleFileInput = Array<InferFileInput>;

export type InferYelixInput<T> = T extends ReturnType<YelixInput["string"]>
  ? InferStringInput
  // deno-lint-ignore no-explicit-any
  : T extends ReturnType<YelixInput["file"]> & { multipleFiles(): any }
    ? InferMultipleFileInput
  : T extends ReturnType<YelixInput["file"]> ? InferFileInput
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
    | BooleanZod
    | AnyZod
    | undefined;

  file(): FileZod {
    if (this._zod) {
      throw new Error("Input type already set.");
    }

    const zod = new FileZod(this) as FileZod;
    this._zod = zod;
    return zod;
  }

  string(): StringZod {
    if (this._zod) {
      throw new Error("Input type already set.");
    }

    const zod = new StringZod(this);
    this._zod = zod;
    return zod;
  }

  object(_obj?: UnknownObject): ObjectZod {
    if (this._zod) {
      throw new Error("Input type already set.");
    }

    const zod = new ObjectZod(this, _obj);
    this._zod = zod;
    return zod;
  }

  number(): NumberZod {
    if (this._zod) {
      throw new Error("Input type already set.");
    }

    const zod = new NumberZod(this);
    this._zod = zod;
    return zod;
  }

  array(): ArrayZod {
    if (this._zod) {
      throw new Error("Input type already set.");
    }

    const zod = new ArrayZod(this);
    this._zod = zod;
    return zod;
  }

  date(config?: DateConfig): DateZod {
    if (this._zod) {
      throw new Error("Input type already set.");
    }

    const zod = new DateZod(this, config);
    this._zod = zod;
    return zod;
  }

  boolean(): BooleanZod {
    if (this._zod) {
      throw new Error("Input type already set.");
    }

    const zod = new BooleanZod(this);
    this._zod = zod;
    return zod;
  }

  any(): AnyZod {
    if (this._zod) {
      throw new Error("Input type already set.");
    }

    const zod = new AnyZod(this);
    this._zod = zod;
    return zod;
  }
}

function inp(): YelixInput {
  return new YelixInput();
}

export { inp, YelixInput };
