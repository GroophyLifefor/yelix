import { APIReferenceBase } from "@/src/OpenAPI/APIReferences/base.ts";
import type { Ctx } from "@/mod.ts";

export class StoplightReference extends APIReferenceBase {
  override referenceTitle = "Stoplight";
  override path = "/stoplight";

  constructor(path?: string) {
    const _path = path || "/stoplight";
    super(_path);

    this.path = _path;
  }

  override getResponse(ctx: Ctx): Response | Promise<Response> {
    const pageTitle = this.referenceTitle + " | Yelix API Docs";
    const spec = "/yelix-openapi-raw";
    const html = getStoplightHTML(pageTitle, spec);
    return ctx.html(html, 200);
  }
}

function getStoplightHTML(pageTitle: string, spec: string) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
    <title>${pageTitle}</title>
    <link rel="icon" type="image/png" href="https://docs.yelix.dev/img/stoplight-logo.png" />
  
    <script src="https://unpkg.com/@stoplight/elements/web-components.min.js"></script>
    <link rel="stylesheet" href="https://unpkg.com/@stoplight/elements/styles.min.css">
  </head>
  <body>

    <elements-api
      apiDescriptionUrl="${spec}"
      router="hash"
    />

  </body>
</html>`;
}
