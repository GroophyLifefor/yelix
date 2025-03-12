// deno-lint-ignore-file no-explicit-any
import { Hono } from "hono";
import {
  loadEndpoints,
  loadEndpointsFromFolder,
} from "@/src/api/endpoints/loadEndpoints.ts";
import { serveEndpoints } from "@/src/api/endpoints/serveEndpoints.ts";
import type {
  AppConfigType,
  CORSParams,
  Endpoint,
  InitOpenAPIParams,
  Middleware,
  MiddlewareList,
  OptionalAppConfigType,
  ParsedEndpoint,
} from "@/src/types/types.d.ts";
import { yelix_log, yelixClientLog } from "@/src/utils/logging.ts";
import { sayWelcome } from "@/src/utils/welcome.ts";
import version from "@/version.ts";
import { simpleLoggerMiddeware } from "@/src/api/middlewares/simpleLogger.ts";
import { apiReference } from "npm:@scalar/hono-api-reference@0.5.172";
import { serveIndexPage } from "@/src/api/indexPage/getHtml.ts";
import { cors } from "hono/cors";
import { YelixOpenAPI } from "@/src/OpenAPI/index.ts";

const defaultConfig: AppConfigType = {
  debug: false,
  port: 3030,
  noWelcome: false,
  dontIncludeDefaultMiddlewares: false,
  dontServeIndexPage: false,
};

class Yelix {
  app: Hono;
  endpointList: ParsedEndpoint[] = [];
  middlewares: MiddlewareList[] = [];
  appConfig: AppConfigType = defaultConfig;
  docsPath?: string;
  YelixOpenAPI?: YelixOpenAPI;

  private isLoadingEndpoints: boolean = false;
  private __server: any;
  // @type {HttpServer<NetAddr>}
  private __sigintListener: any;
  private __servedInformations: { title: string; description: string }[] = [];

  constructor(appConfig?: OptionalAppConfigType) {
    const config = { ...defaultConfig, ...appConfig };
    this.appConfig = config;
    this.app = new Hono();

    if (!config.noWelcome) {
      sayWelcome();
    }

    if (!config.dontIncludeDefaultMiddlewares) {
      this.setMiddleware("*", simpleLoggerMiddeware);
    }

    if (!this.appConfig.dontServeIndexPage) {
      serveIndexPage({ yelix: this });
    }
  }

  // this will be shown even not debug mode
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
    yelix_log(this, ...props);
  }

  warn(...params: any): void {
    const props = [
      "%c WARN %c",
      "background-color: orange;",
      "background-color: inherit",
      ...params,
    ];
    yelix_log(this, ...props);
  }

  throw(...params: any): void {
    const props = [
      "%c WARN %c",
      "background-color: red;",
      "background-color: inherit",
      ...params,
    ];
    yelix_log(this, ...props);
    console.error("❌", ...params);
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
    const isDenoDeploy = Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;

    if (isDenoDeploy) {
      this.throw("Deno Deploy does not support dynamic imports");
    }

    this.isLoadingEndpoints = true;
    const endpoints = await loadEndpointsFromFolder(this, path);
    endpoints.forEach((endpoint) => {
      this.endpointList.push(endpoint);
    });
    this.isLoadingEndpoints = false;
  }

  initOpenAPI(config: InitOpenAPIParams) {
    const path = config.path || "/docs";
    this.docsPath = path;

    this.__servedInformations.push({
      title: "OpenAPI Docs",
      description: path,
    });

    this.YelixOpenAPI = new YelixOpenAPI({
      title: config.title || "Yelix API",
      version: config.version || "1.0.0",
      description: config.description || "Yelix API Documentation",
    });

    this.app.get("/yelix-openapi-raw", (c) => {
      return c.json(this.YelixOpenAPI!.getJSON(), 200);
    });

    this.app.get(
      this.docsPath,
      apiReference({
        theme: "saturn",
        favicon: "/public/favicon.ico",
        pageTitle: "Yelix API Docs",
        spec: { url: "/yelix-openapi-raw" },
      }),
    );

    const defaultConfig = {
      theme: "saturn",
      favicon: "/public/favicon.ico",
      pageTitle: "Yelix API Docs",
    };
    const apiReferenceConfig = Object.assign(
      defaultConfig,
      config.apiReferenceConfig,
    );

    apiReferenceConfig.spec = { url: "/yelix-openapi-raw" };

    this.app.get(path, apiReference(apiReferenceConfig));
  }

  private __addLocalInformationToInitiate(addr: any) {
    const hostname = addr.hostname;
    const isLocalhost = hostname === "0.0.0.0";
    const port = addr.port;
    const addrStr = isLocalhost
      ? `http://localhost:${port}`
      : `http://${hostname}:${port}`;

    this.__servedInformations.unshift({
      title: "Local",
      description: addrStr,
    });
  }

  private onListen(addr: any, yelix: Yelix) {
    this.__addLocalInformationToInitiate(addr);

    const packageVersion = version;

    yelix.clientLog();
    yelix.clientLog(
      "  %c 𝕐 Yelix %c" + packageVersion,
      "color: orange;",
      "color: inherit",
    );
    const maxLength = Math.max(
      ...this.__servedInformations.map((i) => i.title.length),
    );
    this.__servedInformations.forEach((info) => {
      yelix.clientLog(
        `   - ${info.title.padEnd(maxLength)}:   ${info.description}`,
      );
    });
    yelix.clientLog();
  }

  cors(opt: CORSParams) {
    this.app.use(
      opt.affectRoute || "*",
      cors({
        origin: opt.origin,
        allowMethods: opt.allowMethods,
        allowHeaders: opt.allowHeaders,
        maxAge: opt.maxAge,
        credentials: opt.credentials,
        exposeHeaders: opt.exposeHeaders,
      }),
    );
  }

  serve() {
    if (this.isLoadingEndpoints) {
      this.warn(
        "Endpoints are still loading, you may not await the loadEndpointsFromFolder method",
      );
    }

    serveEndpoints(this, this.endpointList);
    const server = Deno.serve(
      {
        port: this.appConfig.port,
        onListen: (_: any) => this.onListen(_, this),
      },
      this.app.fetch,
    );

    this.__server = server;
    this.__sigintListener = () => {
      yelixClientLog("interrupted!");
      this.kill();
      Deno.exit();
    };

    Deno.addSignalListener("SIGINT", this.__sigintListener);
  }

  async kill() {
    if (this.__server) {
      await this.__server.shutdown();
      Deno.removeSignalListener("SIGINT", this.__sigintListener);
    } else {
      yelixClientLog(
        "You tried to kill the server but it was not running. This is fine.",
      );
    }
  }
}

export { Yelix };
