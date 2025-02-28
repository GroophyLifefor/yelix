// deno-lint-ignore-file no-explicit-any
import type { Yelix } from "@/mod.ts";

function yelix_log(parent: Yelix, ...params: any): void {
  if (parent.appConfig.debug) {
    yelixClientLog(...params);
  }
}

function yelixClientLog(...params: any): void {
  console.log(...params);
}

export { yelix_log, yelixClientLog };