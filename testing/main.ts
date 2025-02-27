import {
  Yelix,
  requestDataValidationMiddleware,
  type Middleware,
} from '@/mod.ts';
import * as path from "jsr:@std/path@1.0.8";

const loggerMiddleware: Middleware = async (request, next, yelix) => {
  yelix.log('New request to', request.ctx.req.path);
  await next();
  yelix.log('Request completed with', request.ctx.res.status);
};

async function main() {
  const app = new Yelix({
    debug: true,
    port: 3030,
  });

  const currentDir = Deno.cwd();
  const API_Folder = path.join(currentDir, 'testing', 'api');
  await app.loadEndpointsFromFolder(API_Folder);

  app.setMiddleware('logger', loggerMiddleware);
  app.setMiddleware('dataValidation', requestDataValidationMiddleware);

  app.serve();
}



await main();
