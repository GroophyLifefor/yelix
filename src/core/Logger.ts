// deno-lint-ignore-file no-explicit-any
import { yelix_log, yelixClientLog } from "@/src/utils/logging.ts";
import type { Yelix } from "@/src/core/Yelix.ts";

export class Logger {
  private debug: boolean;
  private yelix: Yelix;

  constructor(yelix: Yelix, debug: boolean) {
    this.debug = debug;
    this.yelix = yelix;
  }

  clientLog(...params: any): void {
    yelixClientLog(...params);
  }

  log(...params: any): void {
    const props = [
      "%c INFO %c",
      "background-color: white; color: black;",
      "background-color: inherit",
      ...params,
    ];
    yelix_log(this.yelix, ...props);
  }

  warn(...params: any): void {
    const props = [
      "%c WARN %c",
      "background-color: orange;",
      "background-color: inherit",
      ...params,
    ];
    yelix_log(this.yelix, ...props);
  }

  throw(...params: any): void {
    const props = [
      "%c WARN %c",
      "background-color: red;",
      "background-color: inherit",
      ...params,
    ];
    yelix_log(this.yelix, ...props);
    console.error("❌", ...params);
    throw new Error(...params);
  }
}
