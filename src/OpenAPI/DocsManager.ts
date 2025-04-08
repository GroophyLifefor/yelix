import { YelixOpenAPI } from "./Core/index.ts";
import type { InitOpenAPIParams } from "@/src/types/types.d.ts";
import type { ServerManager } from "@/src/core/ServerManager.ts";
import type { APIReferenceBase } from "@/src/OpenAPI/APIReferences/base.ts";
import type { Yelix } from "@/src/core/Yelix.ts";

type ErrorExplain = {
  [key: string]: (path?: string) => string;
};

/**
 * Error explanation messages for common documentation-related errors.
 * Provides consistent, informative error messages with links to documentation.
 */
const explainError: ErrorExplain = {
  /**
   * Error message for when a documentation path is not defined.
   * @returns A formatted error message with documentation link
   */
  docsPath: () =>
    "path parameter is not defined. \nPlease look at the docs for more information: https://yelix-docs.deno.dev/docs/endpoints/OpenAPI-documentation",

  /**
   * Error message for when a documentation path is already being served.
   * @param path - The path that is already being served
   * @returns A formatted error message with documentation link
   */
  servedPath: (path?: string) =>
    `Docs path ${path} is already served. It's caused by calling serve modules multiple times with the same path. \nPlease look at the docs for more information: https://yelix-docs.deno.dev/docs/endpoints/OpenAPI-documentation`,
};

/**
 * Manages OpenAPI documentation for Yelix applications.
 * Provides functionality for initializing OpenAPI, serving API references,
 * and managing validation rules.
 */
export class DocsManager {
  /** Yelix instance this documentation manager is attached to */
  private yelix: Yelix;

  /** Server manager used to register served documentation information */
  private serverManager: ServerManager;

  /** OpenAPI instance for generating API documentation */
  YelixOpenAPI?: YelixOpenAPI;

  /** Collection of paths that are currently being served with their reference keys */
  servedPaths: { key: string; path: string }[] = [];

  /**
   * Creates a new DocsManager instance.
   *
   * @param yelix - The Yelix instance to attach to
   * @param serverManager - The server manager for registering documentation endpoints
   */
  constructor(yelix: Yelix, serverManager: ServerManager) {
    this.yelix = yelix;
    this.serverManager = serverManager;
  }

  /**
   * Initializes OpenAPI documentation with the provided configuration.
   * Sets up a basic API endpoint to serve the raw OpenAPI JSON.
   *
   * @param config - Configuration parameters for OpenAPI documentation
   */
  initOpenAPI(config: InitOpenAPIParams): void {
    this.YelixOpenAPI = new YelixOpenAPI({
      title: config.title || "Yelix API",
      version: config.version || "1.0.0",
      description: config.description || "Yelix API Documentation",
      servers: config.servers || [],
    });

    this.yelix.app.get("/yelix-openapi-raw", (c) => {
      return c.json(this.YelixOpenAPI!.getJSON(), 200);
    });
  }

  /**
   * Serves the API reference documentation for the provided API reference object.
   *
   * @param APIReference - An object implementing the `APIReferenceBase` interface,
   * which contains the API reference details such as the path and reference title.
   *
   * @remarks
   * This method validates the provided path, adds it to the list of served paths,
   * and invokes the `serve` method on the API reference object to initialize serving.
   * Additionally, it registers the served API documentation information with the
   * server manager for further use.
   */
  serveAPIReference(APIReference: APIReferenceBase) {
    const path = APIReference.path;
    this.isPathValid(path);
    this.servedPaths.push({ key: APIReference.referenceTitle, path });

    APIReference.serve(this.yelix);

    this.serverManager.addServedInformation({
      title: `API Docs (${APIReference.referenceTitle} UI)`,
      description: path,
    });
  }

  private isPathValid(path: string): void {
    if (!path) {
      throw new Error(explainError.docsPath());
    }

    if (this.servedPaths.find((p) => p.path === path)) {
      throw new Error(explainError.servedPath(path));
    }
  }

  /**
   * Registers a custom validation rule description for a specific kind.
   * If a description for the given kind already exists, it will be overridden.
   *
   * @param kind - The type of validation rule to describe.
   * @param fn - A function that takes any input and returns a string describing the validation rule.
   * @returns A boolean indicating whether an existing description was overridden (`true`) or not (`false`).
   */
  // deno-lint-ignore no-explicit-any
  describeValidationRule(kind: string, fn: (_: any) => string): boolean {
    return this.YelixOpenAPI?.describeValidationRule(kind, fn) ?? false;
  }

  getOpenAPI(): YelixOpenAPI | undefined {
    return this.YelixOpenAPI;
  }
}
