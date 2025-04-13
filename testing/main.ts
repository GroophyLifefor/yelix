import {
  type Ctx,
  type Endpoint,
  type Middleware,
  type OptionalAppConfigType,
  RedocReference,
  requestDataValidationYelixMiddleware,
  ScalarReference,
  StoplightReference,
  SwaggerReference,
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
    },
  );

  await app.loadEndpointsFromFolder(API_Folder);

  app.initOpenAPI({
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

  app.serveAPIReference(new RedocReference());
  app.serveAPIReference(new ScalarReference());
  app.serveAPIReference(new SwaggerReference());
  app.serveAPIReference(new StoplightReference());

  app.docsManager.describeValidationRule("min", (min) => {
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
