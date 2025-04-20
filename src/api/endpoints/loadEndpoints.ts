import type {
  Endpoint,
  EndpointHandler,
  ExportsType,
  ParsedEndpoint,
  ParsedMethod,
} from "@/src/types/types.d.ts";
import * as path from "jsr:@std/path@1.0.8";
import type { Yelix } from "@/mod.ts";
import { buildMiddlewareSteps } from "./middlewareHandler.ts";

async function loadEndpointsFromFolder(
  yelix: Yelix,
  _path: string,
): Promise<ParsedEndpoint[]> {
  yelix.logger.debug(["📂 Loading endpoints from folder", _path]);
  const files = Deno.readDirSync(_path);
  const endpoints = [];

  for (const file of files) {
    const fullPath = path.join(_path, file.name);

    if (file.isDirectory) {
      // Recursively load endpoints from subfolder
      yelix.logger.debug(`📁 Processing subfolder: ${file.name}`);
      const subEndpoints = await loadEndpointsFromFolder(yelix, fullPath);
      endpoints.push(...subEndpoints);
    } else if (file.isFile) {
      yelix.logger.debug(`📄 Processing file: ${file.name}`);
      // Add cache busting query parameter to force reload
      const cacheBuster = `?cacheBust=${Date.now()}`;
      const globePath = "file:" + fullPath + cacheBuster;

      try {
        // Force reload by bypassing cache
        const endpoint = await import(globePath);
        yelix.logger.debug(
          `✅ Successfully imported endpoint from ${file.name}`,
        );
        endpoints.push(endpoint);
      } catch (err) {
        yelix.logger.warn(`Failed to import ${file.name}: ${err}`);
      }
    }
  }

  return loadEndpoints(yelix, endpoints.flat());
}

function loadEndpoints(yelix: Yelix, endpoints: Endpoint[]) {
  yelix.logger.debug(`🔍 Processing ${endpoints.length} endpoints`);
  const parsedEndpoints: ParsedEndpoint[] = [];

  for (const [index, endpoint] of endpoints.entries()) {
    yelix.logger.debug(
      `🔍 Processing endpoint ${index + 1}/${endpoints.length}`,
    );

    if ("methods" in endpoint && Array.isArray(endpoint.methods)) {
      yelix.logger.debug(
        `📍 Found already processed endpoint: ${endpoint.path}`,
      );
      parsedEndpoints.push(endpoint as unknown as ParsedEndpoint);
      continue;
    }

    // Look for Path Export, path is required
    const path = endpoint.path;
    if (!path) {
      yelix.logger.debug("❌ ERROR: Missing path in endpoint");
      continue;
    }
    yelix.logger.debug(`📍 Found path: ${path}`);

    // Look for Methods Export
    const methods: ParsedMethod[] = [];
    const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
    yelix.logger.debug(`🔍 Checking for HTTP methods in endpoint: ${path}`);

    allowedMethods.forEach((method) => {
      if (endpoint[method as keyof Endpoint]) {
        yelix.logger.debug(`✅ Found ${method} method for ${path}`);
        methods.push({
          method,
          handler: endpoint[method as keyof Endpoint] as EndpointHandler,
        });
      }
    });

    if (methods.length === 0) {
      yelix.logger.debug(`❌ ERROR: No methods found for endpoint: ${path}`);
      throw new Error(
        "LOADENDPOINTS - ERROR - No methods found for endpoint, path: " + path,
      );
    }
    yelix.logger.debug(`✅ Total methods found for ${path}: ${methods.length}`);

    const otherExports: ExportsType = {};
    const excludes = ["path", ...allowedMethods, "middlewares"];
    const keys = Object.keys(endpoint);
    yelix.logger.debug(`🔍 Processing additional exports for ${path}`);
    keys.forEach((key) => {
      if (!excludes.includes(key)) {
        yelix.logger.debug(`✅ Found additional export: ${key}`);
        otherExports[key] = endpoint[key as keyof Endpoint];
      }
    });

    const parsedEndpoint: ParsedEndpoint = {
      path,
      methods,
      middlewares: [],
      exports: otherExports,
      openAPI: endpoint.openAPI || undefined,
    };

    const middlewareKeys = endpoint.middlewares ?? [];
    yelix.logger.debug(
      `🔍 Processing ${middlewareKeys.length} middlewares for ${path}`,
    );
    const middlewares = buildMiddlewareSteps(
      yelix,
      parsedEndpoint,
      middlewareKeys,
    );
    parsedEndpoint.middlewares = middlewares;
    yelix.logger.debug(`✅ Successfully processed middlewares for ${path}`);

    parsedEndpoints.push(parsedEndpoint);
    yelix.logger.debug(`✅ Finished processing endpoint: ${path}`);
  }

  yelix.logger.debug(
    `✅ Completed processing all endpoints. Total: ${parsedEndpoints.length}`,
  );
  return parsedEndpoints;
}

export { loadEndpoints, loadEndpointsFromFolder };
