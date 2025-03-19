import { FileZod } from "@/src/validation/FileZod.ts";
import { StringZod } from "@/src/validation/StringZod.ts";

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
  private _zod: FileZod | StringZod | undefined;

  file(): FileZod {
    if (this._zod) {
      throw new Error("Input type already set.");
    }

    this._zod = new FileZod(this);
    return this._zod;
  }

  string(): StringZod {
    if (this._zod) {
      throw new Error("Input type already set.");
    }

    this._zod = new StringZod(this);
    return this._zod;
  }
}

function inp(): YelixInput {
  return new YelixInput();
}

export { inp, YelixInput };
