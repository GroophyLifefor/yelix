import type { Hono } from 'hono';
import {
  apiReference,
  type ApiReferenceOptions,
} from 'npm:@scalar/hono-api-reference@0.5.172';
import { YelixOpenAPI } from '@/src/OpenAPI/index.ts';
import type { InitOpenAPIParams } from '@/src/types/types.d.ts';
import { SwaggerUI, type SwaggerUIOptions } from 'npm:@hono/swagger-ui';
import type { ServerManager } from '@/src/core/ServerManager.ts';
import { getRedocHTML } from '@/src/OpenAPI/APIReferences/redoc.ts';
import { getStoplightHTML } from '@/src/OpenAPI/APIReferences/stoplight.ts';

type ErrorExplain = {
  [key: string]: (path?: string) => string;
};

const explainError: ErrorExplain = {
  docsPath: () =>
    'path parameter is not defined. \nPlease look at the docs for more information: https://yelix-docs.deno.dev/docs/endpoints/OpenAPI-documentation',
  servedPath: (path?: string) =>
    `Docs path ${path} is already served. It's caused by calling serve modules multiple times with the same path. \nPlease look at the docs for more information: https://yelix-docs.deno.dev/docs/endpoints/OpenAPI-documentation`,
};

export class DocsManager {
  private app: Hono;
  private serverManager: ServerManager;
  YelixOpenAPI?: YelixOpenAPI;
  servedPaths: { key: string; path: string }[] = [];

  constructor(app: Hono, serverManager: ServerManager) {
    this.app = app;
    this.serverManager = serverManager;
  }

  initOpenAPI(config: InitOpenAPIParams): {
    serve: {
      serveScalarUI: (path: string, config?: ApiReferenceOptions) => void;
      serveSwaggerUI: (path: string, config?: SwaggerUIOptions) => void;
      serveRedocUI: (path?: string) => void;
      serveStoplightUI: (path?: string) => void;
    };
  } {
    this.YelixOpenAPI = new YelixOpenAPI({
      title: config.title || 'Yelix API',
      version: config.version || '1.0.0',
      description: config.description || 'Yelix API Documentation',
      servers: config.servers || [],
    });

    this.app.get('/yelix-openapi-raw', (c) => {
      return c.json(this.YelixOpenAPI!.getJSON(), 200);
    });

    return {
      serve: {
        serveScalarUI: this.serveScalarUI.bind(this),
        serveSwaggerUI: this.serveSwaggerUI.bind(this),
        serveRedocUI: this.serveRedocUI.bind(this),
        serveStoplightUI: this.serveStoplightUI.bind(this),
      },
    };
  }

  private serveScalarUI(path: string, config?: ApiReferenceOptions) {
    const pageTitle = 'Scalar | Yelix API Reference';
    const defaultConfig = {
      theme: 'saturn',
      favicon: 'https://docs.yelix.dev/img/scalar-logo.png',
      pageTitle,
    };
    const apiReferenceConfig = Object.assign(defaultConfig, config);

    apiReferenceConfig.spec = { url: '/yelix-openapi-raw' };
    if (!path) {
      throw new Error(explainError.docsPath());
    }

    if (this.servedPaths.find((p) => p.path === path)) {
      throw new Error(explainError.servedPath(path));
    }
    this.servedPaths.push({ key: 'scalar', path });

    this.app.get(path, apiReference(apiReferenceConfig));

    this.serverManager.addServedInformation({
      title: 'API Docs (Scalar UI)',
      description: path,
    });
  }

  private serveSwaggerUI(path?: string, config?: SwaggerUIOptions) {
    const pageTitle = 'Swagger | Yelix API Reference';
    const swaggerConfig = {
      url: '/yelix-openapi-raw',
      ...config,
    };

    if (!path) {
      throw new Error(explainError.docsPath());
    }

    if (this.servedPaths.find((p) => p.path === path)) {
      throw new Error(explainError.servedPath(path));
    }
    this.servedPaths.push({ key: 'swagger', path });

    this.app.get(path, (c) => {
      return c.html(`
        <html lang="en">
          <head>
            <meta charset="utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1" />
            <meta name="description" content="Custom Swagger" />
            <link rel="icon" type="image/png" href="https://docs.yelix.dev/img/swagger-logo.png" />
            <title>${pageTitle}</title>
          </head>
          ${SwaggerUI(swaggerConfig)}
        </html>
      `);
    });

    this.serverManager.addServedInformation({
      title: 'API Docs (Swagger UI)',
      description: path,
    });
  }

  private serveRedocUI(path?: string) {
    const pageTitle = 'Redoc | Yelix API Reference';

    if (!path) {
      throw new Error(explainError.docsPath());
    }

    if (this.servedPaths.find((p) => p.path === path)) {
      throw new Error(explainError.servedPath(path));
    }
    this.servedPaths.push({ key: 'redoc', path });

    this.app.get(path, (c) => {
      return c.html(getRedocHTML(pageTitle, '/yelix-openapi-raw'));
    });

    this.serverManager.addServedInformation({
      title: 'API Docs (Redoc UI)',
      description: path,
    });
  }

  private serveStoplightUI(path?: string) {
    const pageTitle = 'Stoplight | Yelix API Reference';

    if (!path) {
      throw new Error(explainError.docsPath());
    }

    if (this.servedPaths.find((p) => p.path === path)) {
      throw new Error(explainError.servedPath(path));
    }
    this.servedPaths.push({ key: 'stoplight', path });

    this.app.get(path, (c) => {
      return c.html(getStoplightHTML(pageTitle, '/yelix-openapi-raw'));
    });

    this.serverManager.addServedInformation({
      title: 'API Docs (Stoplight UI)',
      description: path,
    });
  }

  getOpenAPI(): YelixOpenAPI | undefined {
    return this.YelixOpenAPI;
  }
}
