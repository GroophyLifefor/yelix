import {
  type Ctx,
  type Endpoint,
  type Middleware,
  type OptionalAppConfigType,
  requestDataValidationYelixMiddleware,
  Yelix,
} from "@/mod.ts";
import * as path from "jsr:@std/path@1.0.8";

export async function main(yelix?: OptionalAppConfigType) {
  const currentDir = Deno.cwd();
  const API_Folder = path.join(currentDir, "testing", "api");

  const app = new Yelix(
    yelix ? yelix : {
      environment: "dev",
      serverPort: 3030,
      // watchDirectory: API_Folder,
    },
  );

  await app.loadEndpointsFromFolder(API_Folder);

  app.initOpenAPI({
    path: "/docs",
    title: "Yelix Testing API",
    description: "This is a testing API for Yelix",
    servers: [
      {
        url: "http://localhost:3030",
        description: "Local Server _asd_ *askjads* **asdasda**",
      },
      {
        url: "http://localhost:3080",
        description: "Test Server",
      },
    ],
  });

  app.customValidationDescription("min", (min) => {
    return "- Minimum value should be " + min;
  });

  const hello: Endpoint = {
    path: "/hello",
    GET: (ctx: Ctx) => {
      return ctx.json({ message: "Hello World!" });
    },
  };
  app.loadEndpoints([hello]);

  const middleware: Middleware = (ctx, next) => {
    console.log("Middleware", ctx);
    return next();
  };
  app.setMiddleware("test", middleware);

  app.setMiddleware("dataValidation", requestDataValidationYelixMiddleware);

  await app.serve();

  return app;
}

if (import.meta.main) {
  await main();
}
