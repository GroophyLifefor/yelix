// deno-lint-ignore-file no-explicit-any
import { Hono } from "hono";
import { loadEndpoints, loadEndpointsFromFolder } from "@/src/api/endpoints/loadEndpoints.ts";
import { serveEndpoints } from "@/src/api/endpoints/serveEndpoints.ts";
import type { AppConfigType, ParsedEndpoint, Middleware, OptionalAppConfigType, Endpoint } from "@/src/types/types.d.ts";
import { yelix_log } from "@/src/utils/logging.ts";

const defaultConfig: AppConfigType = {
  debug: false,
  port: 3030,
};

class Yelix {
  app: Hono;
  endpointList: ParsedEndpoint[] = [];
  middlewares: Record<string, Middleware> = {};
  appConfig: AppConfigType = defaultConfig;
  private isLoadingEndpoints: boolean = false;

  constructor(appConfig: OptionalAppConfigType) {
    const config = { ...defaultConfig, ...appConfig };
    this.appConfig = config;
    this.app = new Hono();
  }

  log(...params: any): void {
    const props = [
      '%c INFO %c',
      'background-color: white; color: black;',
      'background-color: inherit',
      ...params
    ]
    yelix_log(this, ...props);
  }

  warn(...params: any): void {
    const props = [
      '%c WARN %c',
      'background-color: orange;',
      'background-color: inherit',
      ...params
    ]
    yelix_log(this, ...props);
  }

  throw(...params: any): void {
    const props = [
      '%c WARN %c',
      'background-color: red;',
      'background-color: inherit',
      ...params
    ]
    yelix_log(this, ...props);
    console.error('❌', ...params);
    throw new Error(...params);
  }

  setMiddleware(name: string, middleware: Middleware) {
    this.middlewares[name] = middleware;
  }

  loadEndpoints(endpointEntries: Endpoint[]) {
    const endpoints = loadEndpoints(this, endpointEntries);
    endpoints.forEach((endpoint) => {
      this.endpointList.push(endpoint);
    });
  }

  async loadEndpointsFromFolder(path: string): Promise<void> {
    const isDenoDeploy = Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;

    if (isDenoDeploy) {
      this.throw('Deno Deploy does not support dynamic imports');
    }

    this.isLoadingEndpoints = true;
    const endpoints = await loadEndpointsFromFolder(this, path);
    endpoints.forEach((endpoint) => {
      this.endpointList.push(endpoint);
    });
    this.isLoadingEndpoints = false;
  }

  serve() {
    if (this.isLoadingEndpoints) {
      this.warn('Endpoints are still loading, you may not await the loadEndpointsFromFolder method');
    }
    
    serveEndpoints(this, this.endpointList);
    Deno.serve({ port: this.appConfig.port }, this.app.fetch);
  }
}

export { Yelix };