import {
  apiReference,
  type ApiReferenceOptions,
} from "npm:@scalar/hono-api-reference@0.5.172";
import { APIReferenceBase } from "@/src/OpenAPI/APIReferences/base.ts";
import type { Ctx } from "@/mod.ts";

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

  override async getResponse(ctx: Ctx): Promise<Response> {
    const spec = "/yelix-openapi-raw";
    const html = await getScalarHTML(spec, this.config);
    return (await html(
      ctx,
      // deno-lint-ignore require-await
      async () => Promise.resolve(),
      // deno-lint-ignore no-explicit-any
    )) as any;
  }
}

async function getScalarHTML(
  spec: string,
  config?: ApiReferenceOptions,
) {
  const pageTitle = "Scalar | Yelix API Reference";
  const defaultConfig = {
    theme: "saturn",
    favicon: "https://docs.yelix.dev/img/scalar-logo.png",
    pageTitle,
  };
  const apiReferenceConfig = Object.assign(defaultConfig, config);

  apiReferenceConfig.spec = { url: spec };

  return await apiReference(apiReferenceConfig);
}
