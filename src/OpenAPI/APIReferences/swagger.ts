import { APIReferenceBase } from "@/src/OpenAPI/APIReferences/base.ts";
import type { Ctx } from "@/mod.ts";
import { SwaggerUI, type SwaggerUIOptions } from "npm:@hono/swagger-ui@~0.5.1";

export class SwaggerReference extends APIReferenceBase {
  override referenceTitle = "Swagger";
  override path = "/swagger";
  private config: SwaggerUIOptions;

  constructor(path?: string, config?: SwaggerUIOptions) {
    const _path = path || "/swagger";

    super(_path);

    this.path = _path;
    this.config = {
      ...config,
      url: "/yelix-openapi-raw",
    };
  }

  override getResponse(ctx: Ctx): Response {
    const pageTitle = "Swagger | Yelix API Reference";
    return ctx.html(`
      <html lang="en">
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <meta name="description" content="Custom Swagger" />
          <link rel="icon" type="image/png" href="https://docs.yelix.dev/img/swagger-logo.png" />
          <title>${pageTitle}</title>
        </head>
        ${SwaggerUI(this.config)}
      </html>
    `);
  }
}
