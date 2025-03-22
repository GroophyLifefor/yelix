// deno-lint-ignore-file no-explicit-any
import type { Yelix } from "@/src/core/Yelix.ts";

type Config = {
  method: string;
} & RequestInit;

class YelixTestClient {
  private app: Yelix | null = null;

  debugRoutes() {
    const app: any = this.app;
    if (!app) {
      throw new Error("No app found");
    }
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
}

async function request(app: Yelix, path: string, config: Config): Promise<any> {
  const hono = app.app;
  if (!hono) {
    throw new Error("No app found");
  }

  const res = await hono.request(path, config);

  if (!res) {
    throw new Error("No response");
  }

  let response;
  try {
    const clone = res.clone();
    response = await clone.json();
  } catch {
    response = await res.text();
  }

  console.log(
    "REQUEST  ",
    `${config?.method} ${path}`,
    config?.body && typeof config.body === "string"
      ? JSON.parse(config?.body)
      : {},
  );
  console.log("RESPONSE ", response);

  return {
    req: res,
    res: {
      responseType: typeof response === "string" ? "text" : "json",
      text: response,
      json: response,
    },
  };
}

export { request, YelixTestClient };
