import { requestDataValidationMiddleware, Yelix } from "@/mod.ts";
import * as path from "jsr:@std/path@1.0.8";

async function main() {
  const app = new Yelix({
    debug: false,
    port: 3030,
  });

  app.initOpenAPI({
    path: "/docs",
    title: "Yelix Testing API",
    description: "This is a testing API for Yelix",
    servers: [
      {
        url: "http://localhost:3000",
        description: "Local Server",
      },
    ],
    excludeMethods: ["options"],
  });

  const currentDir = Deno.cwd();
  const API_Folder = path.join(currentDir, "testing", "api");
  await app.loadEndpointsFromFolder(API_Folder);

  app.setMiddleware("dataValidation", requestDataValidationMiddleware);

  app.serve();
}

await main();
