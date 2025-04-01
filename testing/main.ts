import {
  type Ctx,
  type Endpoint,
  inp,
  type Middleware,
  requestDataValidationYelixMiddleware,
  Yelix,
} from "@/mod.ts";
import * as path from "jsr:@std/path@1.0.8";
import type { OptionalAppConfigType } from "@/src/types/types.d.ts";

type AppConfig = {
  yelix?: OptionalAppConfigType;
  app?: {
    serve: boolean;
  };
};

export async function main(config?: AppConfig) {
  const currentDir = Deno.cwd();
  const API_Folder = path.join(currentDir, "testing", "v2");

  const app = new Yelix(
    config?.yelix ? config.yelix : {
      debug: false,
      port: 3030,
      watchDir: API_Folder,
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

  app.docsManager.YelixOpenAPI?.customValidationDescription("min", (min) => {
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

  if (!(config?.app?.serve === false)) {
    await app.serve();
  }

  return app;
}

if (import.meta.main) {
  const validator = inp().string().toNumber().min(3).max(5);

  // some test
  console.log(validator.validate("4").isOk); // true
  console.log(validator.validate("3").isOk); // true
  console.log(validator.validate("2").isOk); // false, min 3
  console.log(validator.validate("6").isOk); // false, max 5
  console.log(validator.validate("asdasd").isOk); // false, not a number
  console.log(validator.validate("4").value); // 4

  //await main();
}
