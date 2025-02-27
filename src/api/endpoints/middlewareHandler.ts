import type { H } from 'hono/types';
import { createMiddleware } from 'hono/factory';
import type { Yelix, Ctx } from '@/mod.ts';
import type { ApplyMiddlewareParams, ParsedEndpoint } from '@/src/types/types.d.ts';

async function applyMiddleware(
  yelix: Yelix,
  request: ApplyMiddlewareParams,
  next: () => Promise<void>
  // deno-lint-ignore no-explicit-any
): Promise<any> {
  if (yelix.middlewares[request.middleware]) {
    return await yelix.middlewares[request.middleware](request, next, yelix);
  } else {
    console.warn(`Middleware ${request.middleware} not found`, request);
    return null;
  }
}

export function buildMiddlewareSteps(
  yelix: Yelix,
  endpoint: ParsedEndpoint,
  middlewareKeys: string[]
): H[] {
  const { path, middlewares, methods, exports } = endpoint;
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

          const middlewareData = await applyMiddleware(yelix, {
            ctx: c,
            middleware,
            endpoint: {
              path,
              middlewares,
              methods,
              exports
            },
          }, nextFn);

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

  return steps;
}
