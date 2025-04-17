import { APIReferenceBase } from "@/src/OpenAPI/APIReferences/base.ts";
import type { ApiReferenceOptions, Ctx } from "@/mod.ts";

export class ScalarReference extends APIReferenceBase {
  override referenceTitle = "Scalar";
  override path = "/scalar";
  private config: ApiReferenceOptions;

  constructor(path?: string, config?: ApiReferenceOptions) {
    const defaultConfig = {
      theme: "saturn",
      favicon: "https://docs.yelix.dev/img/scalar-logo.png",
    };
    const apiReferenceConfig = Object.assign(defaultConfig, config);
    apiReferenceConfig.spec = { url: "/yelix-openapi-raw" };
    const _path = path || "/scalar";

    super(_path);

    this.path = _path;
    this.config = apiReferenceConfig;
  }

  override getResponse(ctx: Ctx): Response | Promise<Response> {
    const pageTitle = this.referenceTitle + " | Yelix API Docs";
    const spec = "/yelix-openapi-raw";
    const html = getScalarHTML(pageTitle, spec, this.config || {});
    return ctx.html(html, 200);
  }
}

function getScalarHTML(
  pageTitle: string,
  spec: string,
  config?: ApiReferenceOptions,
) {
  return `<!doctype html>
<html>
  <head>
    <title>${pageTitle}</title>
    <meta charset="utf-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1" />
  </head>
  <body>
    <script
      id="api-reference"
      data-url="${spec}"></script>

    <!-- Optional: You can set a full configuration object like this: -->
    <script>
      var configuration = ${JSON.stringify(config)};

      document.getElementById('api-reference').dataset.configuration =
        JSON.stringify(configuration)
    </script>

    <script src="https://cdn.jsdelivr.net/npm/@scalar/api-reference"></script>
  </body>
</html>`;
}
