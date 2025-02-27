import type { Yelix } from "@/mod.ts";

// deno-lint-ignore no-explicit-any
function yelix_log(parent: Yelix, ...params: any): void {
  if (parent.appConfig.debug) {
    console.log(...params);
  }
}

export { yelix_log };