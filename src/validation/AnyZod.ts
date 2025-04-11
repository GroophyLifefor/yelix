// deno-lint-ignore-file no-explicit-any
import type { YelixInput } from "@/src/validation/inp.ts";
import {
  type FailedMessage,
  YelixValidationBase,
} from "@/src/validation/ValidationBase.ts";

class AnyZod extends YelixValidationBase<any> {
  input: YelixInput;
  override type: string = "any";

  constructor(_input: YelixInput) {
    super();
    this.input = _input;

    this.required();
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

  optional(): this {
    this.removeRule("required");
    return this;
  }
}

export { AnyZod };
