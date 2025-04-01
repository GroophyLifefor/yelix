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
import { simpleLoggerMiddeware } from "@/src/api/middlewares/simpleLogger.ts";
import { serveIndexPage } from "@/src/api/indexPage/getHtml.ts";
import { cors } from "hono/cors";
import { Logger } from "./Logger.ts";
import { ServerManager } from "./ServerManager.ts";
import { DocsManager } from "./DocsManager.ts";
import { debounce } from "@/src/utils/debounce.ts";

const defaultConfig: AppConfigType = {
  environment: "dev",
  serverPort: 3030,
  showWelcomeMessage: true,
  includeDefaultMiddlewares: true,
  serveIndexPage: true,
  watchDirectory: undefined,
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
  docsManager: DocsManager;

  private logger: Logger;
  private serverManager: ServerManager;
  private isLoadingEndpoints: boolean = false;
  private actionMetaList: ActionMeta[] = [];

  constructor(appConfig?: OptionalAppConfigType) {
    const config = { ...defaultConfig, ...appConfig };
    this.appConfig = config;
    this.app = new Hono();
    this.logger = new Logger(this, config.environment === "debug");
    this.serverManager = new ServerManager(this, this.logger);
    this.docsManager = new DocsManager(this.app);

    if (config.showWelcomeMessage == true && config.environment !== "test") {
      sayWelcome();
    }

    if (config.includeDefaultMiddlewares) {
      this.setMiddleware("*", simpleLoggerMiddeware);
    }

    if (config.serveIndexPage) {
      serveIndexPage({ yelix: this, docsManager: this.docsManager });
    }

    if (config.watchDirectory) {
      this.watch();
      const afterWatchDir = config.watchDirectory
        .replace(Deno.cwd(), ".")
        .replaceAll("\\", "/");
      this.serverManager.addServedInformation({
        title: "Watching",
        description: afterWatchDir,
      });
    }
  }

  // Delegate logging methods to Logger
  clientLog(...params: any): void {
    this.logger.clientLog(...params);
  }

  log(...params: any): void {
    this.logger.log(...params);
  }

  warn(...params: any): void {
    this.logger.warn(...params);
  }

  throw(...params: any): void {
    this.logger.throw(...params);
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
      this.throw("Deno Deploy does not support dynamic imports");
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

  initOpenAPI(config: InitOpenAPIParams) {
    this.actionMetaList.push({
      actionTitle: "initOpenAPI",
      actionFn: this.initOpenAPI.bind(this),
      actionParams: [config],
    });

    const info = this.docsManager.initOpenAPI(config);
    this.serverManager.addServedInformation(info);
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
      this.warn(
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

  async watch() {
    if (typeof this.appConfig.watchDirectory !== "string") {
      this.throw("watchDirectory is not defined in appConfig");
      return;
    }

    let _events: Deno.FsEvent[] = [];
    const log = debounce(() => {
      const rawEvents = _events;
      _events = [];

      // remove duplicate events
      const events = rawEvents.filter((event, index, self) => {
        return index === self.findIndex((t) => t.paths[0] === event.paths[0]);
      });

      for (const event of events) {
        const afterWatchDir = event.paths[0].replace(
          this.appConfig.watchDirectory!, // non-null assertion operator
          "",
        );
        console.log("⊚ [%s] %s", event.kind, afterWatchDir);
      }
      this.restartEndpoints();
    }, 200);

    const watcher = Deno.watchFs(this.appConfig.watchDirectory);

    for await (const event of watcher) {
      log();
      _events.push(event);
    }
  }

  async restartEndpoints() {
    try {
      this.logger.clientLog("╓ Restarting server...");
      const startms = performance.now();

      // Step 1: Gracefully shutdown the current server
      this.logger.log("║ Shutting down current server...");
      await this.kill(0);

      // Step 2: Reset application state
      this.logger.log("║ Resetting application state...");
      this.app = new Hono();
      this.serverManager = new ServerManager(this, this.logger);
      this.docsManager = new DocsManager(this.app);
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
        this.logger.log(`║ Running ${meta.actionTitle}...`);
        await meta.actionFn(...meta.actionParams);
      }

      // Step 6: Ensure server gets restarted by explicitly calling serve
      // Find if serve was already called in actions
      const serveActionExists = actions.some((a) => a.actionTitle === "serve");

      if (!serveActionExists) {
        this.logger.log("║ Restarting server...");
        await this.serve();
      }

      const endms = performance.now();
      this.logger.clientLog(
        "╙ Server restarted successfully in",
        Math.round(endms - startms),
        "ms (+200ms debounce)",
      );
    } catch (error) {
      this.logger.throw("Error during server restart:", error);

      // Attempt recovery
      this.logger.clientLog("Attempting recovery...");
      try {
        await this.serve();
        this.logger.clientLog("Recovery successful");
      } catch (recoveryError) {
        this.logger.throw("Recovery failed:", recoveryError);
      }
    }
  }
}

export { Yelix };
