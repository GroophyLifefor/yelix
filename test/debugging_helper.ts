// deno-lint-ignore-file no-explicit-any

import { Yelix } from "@/mod.ts";
import constants from "@/test/constant.ts";

/**
 * Helper function to debug Yelix route registration
 * @param app Yelix application instance
 */
export function debugRoutes(app: any) {
  console.log("=== DEBUG ROUTE INFORMATION ===");
  console.log("Endpoints registered in Yelix:", app.endpointList);

  // Try to access Hono's internal route registry
  if (app.app && typeof app.app.routes === "function") {
    console.log("Hono routes:", app.app.routes());
  } else if (app.app && app.app._handlers) {
    console.log("Hono handlers:", app.app._handlers);
  } else {
    console.log("Unable to access Hono route registry");
    console.log("app.app structure:", Object.keys(app.app || {}));
  }

  console.log("=== END DEBUG INFO ===");
}

type TestParams = {
  title: string;
  before?: () => Promise<any> | any;
  test: (...arg0: any[]) => Promise<any> | any;
  after?: (...arg0: any[]) => Promise<void> | void;
};

export function defaultBefore() {
  const app = new Yelix({
    serverPort: constants.testingPort,
    showWelcomeMessage: false,
  });

  app.serve();

  return app;
}

export async function defaultAfter(app: Yelix) {
  await app.kill();
}

/**
 * Helper function to simplify testing with async functions
 * like -> after(test(before()))
 * @param params Test parameters
 */
export function test(params: TestParams) {
  Deno.test(params.title, async () => {
    try {
      let beforeData = null;
      if (params.before) {
        beforeData = await params.before();
      }
      const data = await params.test(beforeData);
      if (params.after) {
        await params.after(data);
      }
    } catch (e) {
      console.error("Test failed:", e);
    }
  });
}
