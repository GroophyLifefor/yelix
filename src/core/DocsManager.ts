import type { Hono } from "hono";
import { apiReference } from "npm:@scalar/hono-api-reference@0.5.172";
import { YelixOpenAPI } from "@/src/OpenAPI/index.ts";
import type { InitOpenAPIParams } from "@/src/types/types.d.ts";

export class DocsManager {
  private app: Hono;
  YelixOpenAPI?: YelixOpenAPI;
  docsPath?: string;

  constructor(app: Hono) {
    this.app = app;
  }

  initOpenAPI(
    config: InitOpenAPIParams,
  ): { title: string; description: string } {
    const path = config.path || "/docs";
    this.docsPath = path;

    this.YelixOpenAPI = new YelixOpenAPI({
      title: config.title || "Yelix API",
      version: config.version || "1.0.0",
      description: config.description || "Yelix API Documentation",
      servers: config.servers || [],
    });

    this.app.get("/yelix-openapi-raw", (c) => {
      return c.json(this.YelixOpenAPI!.getJSON(), 200);
    });

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

    return {
      title: "OpenAPI Docs",
      description: path,
    };
  }

  getOpenAPI(): YelixOpenAPI | undefined {
    return this.YelixOpenAPI;
  }
}
