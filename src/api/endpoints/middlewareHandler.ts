// deno-lint-ignore-file no-explicit-any
import type { H } from 'hono/types';
import { createMiddleware } from 'hono/factory';
import type { Yelix, Ctx } from '@/mod.ts';
import type {
  ApplyMiddlewareParams,
  Middleware,
  ParsedEndpoint,
} from '@/src/types/types.d.ts';
import { AddOpenAPIEndpointParams, OpenAPIMethods } from "@/src/OpenAPI/openAPI.types.ts";

async function applyMiddleware(
  yelix: Yelix,
  request: ApplyMiddlewareParams,
  next: () => Promise<void>,
  middlewareFn?: Middleware
): Promise<any> {
  if (middlewareFn) {
    return await middlewareFn(request, next, yelix);
  } else {
    const middleware = yelix.middlewares.find(
      (m) => m.match === request.middleware
    );
    if (middleware) {
      return await middleware.middleware(request, next, yelix);
    } else {
      console.warn(`Middleware ${request.middleware} not found`, request);
      return null;
    }
  }
}

export function buildMiddlewareSteps(
  yelix: Yelix,
  endpoint: ParsedEndpoint,
  middlewareKeys: string[]
): H[] {
  const { path, middlewares, methods, exports, openAPI } = endpoint;
  const steps: H[] = [];

  const middlewareList = middlewareKeys || [];

  for (const middleware of middlewareList) {
    // if (middleware === 'auth:validToken') {
    //   steps.push(auth_validToken);
    //   continue;
    // }

    if (typeof middleware === 'string') {
      const middlewareF = createMiddleware(
        async (c: Ctx, next: () => Promise<void>) => {
          let isNext = false;
          const nextFn = async () => {
            isNext = true;
            await next();
          };

          const middlewareData = await applyMiddleware(
            yelix,
            {
              ctx: c,
              middleware,
              endpoint: {
                path,
                middlewares,
                methods,
                exports,
              },
            },
            nextFn
          );

          if (middlewareData?.base?.responseStatus === 'end') {
            c.status(middlewareData.base.status);
            const responseBody =
              typeof middlewareData.base.body === 'string'
                ? JSON.parse(middlewareData.base.body)
                : middlewareData.base.body;
            return c.json(responseBody);
          }

          if (!c.get(middleware)) {
            c.set(middleware, {
              middleware: middleware,
              base: {},
              user: middlewareData?.user,
            });
          }
          if (!isNext) {
            await next();
          }
        }
      );

      steps.push(middlewareF);
    }
  }

  // Regex match middlewares
  const allMiddlewares = yelix.middlewares;
  for (const middleware of allMiddlewares) {
    if (typeof middleware.match === 'string' && middleware.match !== '*') {
      continue;
    }

    if (middleware.match === '*' || middleware.match.test(path)) {
      steps.push(
        createMiddleware(async (c: Ctx, next: () => Promise<void>) => {
          let isNext = false;
          const nextFn = async () => {
            isNext = true;
            await next();
          };

          const middlewareData = await applyMiddleware(
            yelix,
            {
              ctx: c,
              middleware: middleware.middleware.name,
              endpoint: {
                path,
                middlewares,
                methods,
                exports,
              },
            },
            nextFn,
            middleware.middleware
          );

          if (middlewareData?.base?.responseStatus === 'end') {
            c.status(middlewareData.base.status);
            const responseBody =
              typeof middlewareData.base.body === 'string'
                ? JSON.parse(middlewareData.base.body)
                : middlewareData.base.body;
            return c.json(responseBody);
          }

          if (!c.get(middleware.middleware.name)) {
            c.set(middleware.middleware.name, {
              middleware: middleware.middleware.name,
              base: {},
              user: middlewareData?.user,
            });
          }
          if (!isNext) {
            await next();
          }
        })
      );
    }
  }

  return steps;
}
