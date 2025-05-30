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
import { sayWelcome } from "@/src/utils/welcome.ts";
import { simpleLoggerMiddleware } from "@/src/api/middlewares/simpleLogger.ts";
import { serveIndexPage } from "@/src/api/indexPage/getHtml.ts";
import { cors } from "hono/cors";
import { ServerManager } from "./ServerManager.ts";
import type { APIReferenceBase } from "@/src/OpenAPI/APIReferences/base.ts";
import { watchHotModuleReload } from "@/src/core/HMR.ts";
import { DocsManager } from "@/src/OpenAPI/DocsManager.ts";
import type { ILogger } from "@/src/Logger/CoreLogger.ts";
import { LoggerFactory } from "@/src/Logger/LoggerFactory.ts";

const defaultConfig: AppConfigType = {
  environment: "dev",
  serverPort: 3030,
  showWelcomeMessage: true,
  includeDefaultMiddlewares: true,
  serveIndexPage: true,
};

type ActionMeta = {
  actionTitle: string;
  actionFn: (...params: any[]) => any | Promise<any>;
  actionParams: any[];
};

class Yelix {
  app: Hono;
  endpointList: ParsedEndpoint[] = [];
  middlewares: MiddlewareList[] = [];
  appConfig: AppConfigType = defaultConfig;
  isFirstServe: boolean = true;
  logger: ILogger;

  private docsManager: DocsManager;
  private serverManager: ServerManager;
  private isLoadingEndpoints: boolean = false;
  private actionMetaList: ActionMeta[] = [];

  constructor(appConfig?: OptionalAppConfigType) {
    const config = { ...defaultConfig, ...appConfig };
    this.appConfig = config;
    this.app = new Hono();
    this.logger = LoggerFactory.createLogger(config.environment);
    this.serverManager = new ServerManager(this);
    this.docsManager = new DocsManager(this, this.serverManager);

    if (config.showWelcomeMessage == true && config.environment !== "test") {
      sayWelcome();
    }

    if (config.includeDefaultMiddlewares) {
      this.setMiddleware("*", simpleLoggerMiddleware);
    }

    if (config.serveIndexPage) {
      serveIndexPage({ yelix: this, docsManager: this.docsManager });
    }

    this.serverManager.addServedInformation({
      title: "Environment",
      description: config.environment,
    });

    watchHotModuleReload(this);
  }

  setMiddleware(name: string | RegExp, middleware: Middleware) {
    this.actionMetaList.push({
      actionTitle: "setMiddleware",
      actionFn: this.setMiddleware.bind(this),
      actionParams: [name, middleware],
    });

    this.middlewares.push({ match: name, middleware });
  }

  loadEndpoints(endpointEntries: Endpoint[]) {
    this.actionMetaList.push({
      actionTitle: "loadEndpoints",
      actionFn: this.loadEndpoints.bind(this),
      actionParams: [endpointEntries],
    });

    const endpoints = loadEndpoints(this, endpointEntries);
    endpoints.forEach((endpoint) => {
      this.endpointList.push(endpoint);
    });
  }

  async loadEndpointsFromFolder(path: string): Promise<void> {
    const isDenoDeploy = Deno.env.get("DENO_DEPLOYMENT_ID") !== undefined;

    if (isDenoDeploy) {
      const errMessage =
        "Deno Deploy does not support dynamic imports, Look Yelix's Static Endpoint Generation(SEG) feature.";
      this.logger.fatal(errMessage);
      throw new Error(errMessage);
    }

    this.isLoadingEndpoints = true;

    this.actionMetaList.push({
      actionTitle: "loadEndpointsFromFolder",
      actionFn: this.loadEndpointsFromFolder.bind(this),
      actionParams: [path],
    });

    const endpoints = await loadEndpointsFromFolder(this, path);
    endpoints.forEach((endpoint) => {
      this.endpointList.push(endpoint);
    });
    this.isLoadingEndpoints = false;
  }

  initOpenAPI(config: InitOpenAPIParams): void {
    this.actionMetaList.push({
      actionTitle: "initOpenAPI",
      actionFn: this.initOpenAPI.bind(this),
      actionParams: [config],
    });

    this.docsManager.initOpenAPI(config);
  }

  serveAPIReference(APIReference: APIReferenceBase) {
    this.actionMetaList.push({
      actionTitle: "serveAPIReference",
      actionFn: this.serveAPIReference.bind(this),
      actionParams: [APIReference],
    });

    this.docsManager.serveAPIReference(APIReference);
  }

  cors(opt: CORSParams) {
    this.actionMetaList.push({
      actionTitle: "cors",
      actionFn: this.cors.bind(this),
      actionParams: [opt],
    });

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

  async serve() {
    this.actionMetaList.push({
      actionTitle: "serve",
      actionFn: this.serve.bind(this),
      actionParams: [],
    });

    if (this.isLoadingEndpoints) {
      this.logger.warn(
        "Endpoints are still loading, you may not await the loadEndpointsFromFolder method",
      );
    }

    serveEndpoints(this, this.docsManager, this.endpointList);

    if (this.appConfig.environment !== "test") {
      // Start server only if not in test mode
      await this.serverManager.startServer(
        this.appConfig.serverPort,
        this.app.fetch,
      );
    }

    this.isFirstServe = false;
  }

  async kill(forceAfterMs = 3000) {
    await this.serverManager.kill(forceAfterMs);
  }

  async restartEndpoints(startPrefix = "╓ ", prefix = "║ ", endPrefix = "╙ ") {
    try {
      this.logger.info(startPrefix + "Restarting server...");
      const startms = performance.now();

      // Step 1: Gracefully shutdown the current server
      this.logger.debug(prefix + "Shutting down current server...");
      await this.kill(0);

      // Step 2: Reset application state
      this.logger.debug(prefix + "Resetting application state...");
      this.app = new Hono();
      this.serverManager = new ServerManager(this);
      this.docsManager = new DocsManager(this, this.serverManager);
      this.middlewares = [];
      this.endpointList = [];

      // Step 3: Save pending actions and clear queue
      const actions = [...this.actionMetaList];
      this.actionMetaList = [];

      // Step 4: Setup initial configuration
      if (this.appConfig.serveIndexPage) {
        serveIndexPage({ yelix: this, docsManager: this.docsManager });
      }

      // Step 5: Replay actions in order
      for (const meta of actions) {
        this.logger.debug(prefix + `Running ${meta.actionTitle}...`);
        await meta.actionFn(...meta.actionParams);
      }

      // Step 6: Ensure server gets restarted by explicitly calling serve
      // Find if serve was already called in actions
      const serveActionExists = actions.some((a) => a.actionTitle === "serve");

      if (!serveActionExists) {
        this.logger.debug(prefix + "Restarting server...");
        await this.serve();
      }

      const endms = performance.now();
      this.logger.info([
        endPrefix + "Server restarted successfully in",
        Math.round(endms - startms),
        "ms (+200ms debounce)",
      ]);
    } catch (error) {
      this.logger.fatal("Error during server restart:", { error });

      // Attempt recovery
      this.logger.info("Attempting recovery...");
      try {
        await this.serve();
        this.logger.info("Recovery successful");
      } catch (recoveryError) {
        this.logger.fatal("Recovery failed:", { error: recoveryError });
      }
    }
  }

  describeValidationRule(key: string, fn: (value: any) => string) {
    if (!this.docsManager.YelixOpenAPI) {
      this.logger.fatal("OpenAPI is not initialized");
      return;
    }

    this.actionMetaList.push({
      actionTitle: "describeValidationRule",
      actionFn: this.describeValidationRule.bind(this),
      actionParams: [key, fn],
    });

    this.docsManager.YelixOpenAPI.describeValidationRule(key, fn);
  }
}

export { Yelix };
