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
  yelix.log("📂 Loading endpoints from folder", _path);
  const files = Deno.readDirSync(_path);
  const endpoints = [];

  for (const file of files) {
    const fullPath = path.join(_path, file.name);

    if (file.isDirectory) {
      // Recursively load endpoints from subfolder
      yelix.log(`📁 Processing subfolder: ${file.name}`);
      const subEndpoints = await loadEndpointsFromFolder(yelix, fullPath);
      endpoints.push(...subEndpoints);
    } else if (file.isFile) {
      yelix.log(`📄 Processing file: ${file.name}`);
      // Add cache busting query parameter to force reload
      const cacheBuster = `?cacheBust=${Date.now()}`;
      const globePath = "file:" + fullPath + cacheBuster;

      try {
        // Force reload by bypassing cache
        const endpoint = await import(globePath);
        yelix.log(`✅ Successfully imported endpoint from ${file.name}`);
        endpoints.push(endpoint);
      } catch (err) {
        yelix.warn(`Failed to import ${file.name}: ${err}`);
      }
    }
  }

  return loadEndpoints(yelix, endpoints.flat());
}

function loadEndpoints(yelix: Yelix, endpoints: Endpoint[]) {
  yelix.log(`🔍 Processing ${endpoints.length} endpoints`);
  const parsedEndpoints: ParsedEndpoint[] = [];

  for (const [index, endpoint] of endpoints.entries()) {
    yelix.log(`🔍 Processing endpoint ${index + 1}/${endpoints.length}`);

    // Look for Path Export, path is required
    const path = endpoint.path;
    if (!path) {
      yelix.log("❌ ERROR: Missing path in endpoint");
      continue;
    }
    yelix.log(`📍 Found path: ${path}`);

    // Look for Methods Export
    const methods: ParsedMethod[] = [];
    const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
    yelix.log(`🔍 Checking for HTTP methods in endpoint: ${path}`);

    allowedMethods.forEach((method) => {
      if (endpoint[method as keyof Endpoint]) {
        yelix.log(`✅ Found ${method} method for ${path}`);
        methods.push({
          method,
          handler: endpoint[method as keyof Endpoint] as EndpointHandler,
        });
      }
    });

    if (methods.length === 0) {
      yelix.log(`❌ ERROR: No methods found for endpoint: ${path}`);
      throw new Error(
        "LOADENDPOINTS - ERROR - No methods found for endpoint, path: " + path,
      );
    }
    yelix.log(`✅ Total methods found for ${path}: ${methods.length}`);

    const otherExports: ExportsType = {};
    const excludes = ["path", ...allowedMethods, "middlewares"];
    const keys = Object.keys(endpoint);
    yelix.log(`🔍 Processing additional exports for ${path}`);
    keys.forEach((key) => {
      if (!excludes.includes(key)) {
        yelix.log(`✅ Found additional export: ${key}`);
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
    yelix.log(`🔍 Processing ${middlewareKeys.length} middlewares for ${path}`);
    const middlewares = buildMiddlewareSteps(
      yelix,
      parsedEndpoint,
      middlewareKeys,
    );
    parsedEndpoint.middlewares = middlewares;
    yelix.log(`✅ Successfully processed middlewares for ${path}`);

    parsedEndpoints.push(parsedEndpoint);
    yelix.log(`✅ Finished processing endpoint: ${path}`);
  }

  yelix.log(
    `✅ Completed processing all endpoints. Total: ${parsedEndpoints.length}`,
  );
  return parsedEndpoints;
}

export { loadEndpoints, loadEndpointsFromFolder };
