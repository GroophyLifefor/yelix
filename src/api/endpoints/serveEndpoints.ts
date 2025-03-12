import type { Handler, Hono } from "hono";
import type { ParsedEndpoint } from "@/src/types/types.d.ts";
import type { H } from "hono/types";
import type {
  AddOpenAPIEndpointResponseParams,
  OpenAPIMethods,
  OpenAPIYelixDoc,
} from "@/src/OpenAPI/index.ts";
import type { Yelix } from "@/src/core/Yelix.ts";
import type { NewEndpointParams } from "@/src/OpenAPI/index.ts";

interface MethodMap {
  [key: string]: (path: string, ...handlers: H[]) => void;
}

function createMethodMap(app: Hono): MethodMap {
  // deno-lint-ignore no-explicit-any
  const options = (path: string, ...handlers: any[]) =>
    app.on("OPTIONS", path, ...(handlers as [Handler]));

  return {
    GET: app.get.bind(app),
    POST: app.post.bind(app),
    PUT: app.put.bind(app),
    DELETE: app.delete.bind(app),
    PATCH: app.patch.bind(app),
    OPTIONS: options,
  };
}

function serveEndpoints(yelix: Yelix, endpointList: ParsedEndpoint[]) {
  const methodMap = createMethodMap(yelix.app);

  for (const endpoint of endpointList) {
    const methods = endpoint.methods;
    const middlewares = endpoint.middlewares;

    for (const method of methods) {
      yelix.log(`Serving ${method.method} ${endpoint.path}`);

      const isHide = (endpoint?.openAPI as OpenAPIYelixDoc)?.hide ?? false;

      const newAPIDoc: NewEndpointParams = {
        path: endpoint.path,
        method: method.method.toUpperCase() as OpenAPIMethods,
        title: endpoint.openAPI?.title ?? "",
        description: endpoint.openAPI?.description ?? "",
        tags: endpoint.openAPI?.tags,
        responses: (endpoint.openAPI?.responses as Record<
          string,
          AddOpenAPIEndpointResponseParams
        >) ?? {},
        validation: endpoint.exports?.validation,
        query: endpoint.openAPI?.query ?? {},
      };

      if (!isHide) yelix.YelixOpenAPI?.addNewEndpoint(newAPIDoc);

      methodMap[method.method](endpoint.path, ...middlewares, async (c) => {
        const res = await method.handler(c);
        return res;
      });
    }
  }
}

export { serveEndpoints };
