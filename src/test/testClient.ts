// deno-lint-ignore-file no-explicit-any
import type { Yelix } from "@/src/core/Yelix.ts";

/**
 * Represents the type of response received from the server
 * @enum {string}
 */
enum ResponseType {
  JSON = "json",
  TEXT = "text",
}

/**
 * Interface representing the structure of a Yelix response
 * @template T The type of the JSON response data
 * @example
 * type HelloResponse = { message: string };
 * const response: YelixResponse<HelloResponse>;
 */
interface YelixResponse<T = any> {
  req: Response;
  res: {
    responseType: ResponseType;
    text: string;
    json: T;
  };
}

/**
 * Configuration type extending RequestInit with required method
 */
type Config = {
  method: string;
  logging?: boolean;
} & RequestInit;

/**
 * Debug utility to print route information from both Yelix and Hono
 * @param app The Yelix application instance
 * @example
 * ```typescript
 * const app = new Yelix();
 * debugRoutes(app);
 * ```
 */
function debugRoutes(app: Yelix): void {
  const debugInfo = {
    yelixEndpoints: app.endpointList,
    honoRoutes: null as any,
  };

  const honoApp: any = app.app;

  if (!honoApp) {
    console.error("No Hono app instance found");
    return;
  }

  if (typeof honoApp.routes === "function") {
    debugInfo.honoRoutes = honoApp.routes();
  } else if (honoApp._handlers) {
    debugInfo.honoRoutes = honoApp._handlers;
  }

  console.log("=== DEBUG ROUTE INFORMATION ===");
  console.table(debugInfo);
  console.log("=== END DEBUG INFO ===");
}

/**
 * Internal helper to handle response parsing and type detection
 * @internal
 */
async function handleResponse(
  res: Response,
): Promise<{ response: any; type: ResponseType }> {
  try {
    const clone = res.clone();
    const json = await clone.json();
    return { response: json, type: ResponseType.JSON };
  } catch {
    const text = await res.text();
    return { response: text, type: ResponseType.TEXT };
  }
}

/**
 * Makes a request to the Yelix application and returns a typed response
 * @param app The Yelix application instance
 * @param path The endpoint path to request
 * @param config Request configuration including method and other fetch options
 * @returns Promise resolving to YelixResponse
 *
 * @example
 * ```typescript
 * // Simple GET request
 * const response = await request(app, '/api/hello?name=world', {
 *   method: 'GET'
 * });
 *
 * // Assertions in tests
 * expect(response.req.status).toBe(200);
 * expect(response.res.responseType).toBe(ResponseType.TEXT);
 * expect(response.res.text).toBe('Hello, world');
 *
 * // POST request with body
 * const response = await request(app, '/api/users', {
 *   method: 'POST',
 *   body: JSON.stringify({ name: 'John' }),
 *   headers: {
 *     'Content-Type': 'application/json'
 *   }
 * });
 * ```
 *
 * @throws {Error} When the Yelix app is not initialized
 * @throws {Error} When no response is received from the server
 */
async function request(
  app: Yelix,
  path: string,
  config: Config,
): Promise<YelixResponse> {
  const hono = app.app;
  if (!hono) {
    throw new Error("Yelix application instance not initialized");
  }

  const res = await hono.request(path, config);
  if (!res) {
    throw new Error(`No response received for ${config.method} ${path}`);
  }

  const { response, type } = await handleResponse(res);

  // Log request details
  const requestBody = config?.body && typeof config.body === "string"
    ? JSON.parse(config.body)
    : {};

  if (config?.logging !== false) {
    console.log({
      request: {
        method: config?.method,
        path,
        body: requestBody,
      },
      response,
    });
  }

  return {
    req: res,
    res: {
      responseType: type,
      text: type === ResponseType.TEXT ? response : JSON.stringify(response),
      json: type === ResponseType.JSON ? response : null,
    },
  };
}

export { debugRoutes, request, ResponseType, type YelixResponse };
