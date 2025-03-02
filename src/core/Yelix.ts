// deno-lint-ignore-file no-explicit-any
import { Hono } from 'hono';
import {
  loadEndpoints,
  loadEndpointsFromFolder,
} from '@/src/api/endpoints/loadEndpoints.ts';
import { serveEndpoints } from '@/src/api/endpoints/serveEndpoints.ts';
import type {
  AppConfigType,
  ParsedEndpoint,
  Middleware,
  OptionalAppConfigType,
  Endpoint,
  MiddlewareList
} from '@/src/types/types.d.ts';
import { yelix_log, yelixClientLog } from '@/src/utils/logging.ts';
import { sayWelcome } from '@/src/utils/welcome.ts';
import version from '@/version.ts';
import { simpleLoggerMiddeware } from "@/src/api/middlewares/simpleLogger.ts";

const defaultConfig: AppConfigType = {
  debug: false,
  port: 3030,
  noWelcome: false,
  dontIncludeDefaultMiddlewares: false,
};

class Yelix {
  app: Hono;
  endpointList: ParsedEndpoint[] = [];
  middlewares: MiddlewareList[] = [];
  appConfig: AppConfigType = defaultConfig;
  private isLoadingEndpoints: boolean = false;

  constructor(appConfig?: OptionalAppConfigType) {
    const config = { ...defaultConfig, ...appConfig };
    this.appConfig = config;
    this.app = new Hono();

    if (!config.noWelcome) {
      sayWelcome();
    }

    if (!config.dontIncludeDefaultMiddlewares) {
      this.setMiddleware('*', simpleLoggerMiddeware);
    }
  }

  // this will be shown even not debug mode
  clientLog(...params: any): void {
    yelixClientLog(...params);
  }

  log(...params: any): void {
    const props = [
      '%c INFO %c',
      'background-color: white; color: black;',
      'background-color: inherit',
      ...params,
    ];
    yelix_log(this, ...props);
  }

  warn(...params: any): void {
    const props = [
      '%c WARN %c',
      'background-color: orange;',
      'background-color: inherit',
      ...params,
    ];
    yelix_log(this, ...props);
  }

  throw(...params: any): void {
    const props = [
      '%c WARN %c',
      'background-color: red;',
      'background-color: inherit',
      ...params,
    ];
    yelix_log(this, ...props);
    console.error('❌', ...params);
    throw new Error(...params);
  }

  setMiddleware(name: string | RegExp, middleware: Middleware) {
    this.middlewares.push({ match: name, middleware });
  }

  loadEndpoints(endpointEntries: Endpoint[]) {
    const endpoints = loadEndpoints(this, endpointEntries);
    endpoints.forEach((endpoint) => {
      this.endpointList.push(endpoint);
    });
  }

  async loadEndpointsFromFolder(path: string): Promise<void> {
    const isDenoDeploy = Deno.env.get('DENO_DEPLOYMENT_ID') !== undefined;

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

  private onListen(addr: any, yelix: Yelix) {
    const packageVersion = version;

    const hostname = addr.hostname;
    const isLocalhost = hostname === '0.0.0.0';
    const port = addr.port;
    const addrStr = isLocalhost
      ? `http://localhost:${port}`
      : `http://${hostname}:${port}`;

    yelix.clientLog();
    yelix.clientLog(
      '  %c 𝕐 Yelix %c' + packageVersion,
      'color: orange;',
      'color: inherit'
    );
    yelix.clientLog(`   - Local:   ${addrStr}`);
    yelix.clientLog();
  }

  serve() {
    if (this.isLoadingEndpoints) {
      this.warn(
        'Endpoints are still loading, you may not await the loadEndpointsFromFolder method'
      );
    }

    serveEndpoints(this, this.endpointList);
    Deno.serve(
      {
        port: this.appConfig.port,
        onListen: (_: any) => this.onListen(_, this),
      },
      this.app.fetch
    );
  }
}

export { Yelix };
