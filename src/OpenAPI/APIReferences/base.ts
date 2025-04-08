import type { Yelix } from "@/src/core/Yelix.ts";
import type { Ctx } from "@/mod.ts";

class APIReferenceBase {
  referenceTitle: string = "API Reference";
  path: string;

  constructor(path: string) {
    this.path = path ||
      "/" + this.referenceTitle.toLowerCase().replace(/\s+/g, "-");
  }

  /**
   * Gets the API reference response.
   * This method should be overridden in derived classes.
   * @param ctx The context object
   */
  getResponse(ctx: Ctx): Response | Promise<Response> {
    return ctx.text(
      "API Reference not implemented. Please use the Yelix API documentation for more information.",
      501,
    );
  }

  serve(yelix: Yelix): void {
    yelix.app.get(this.path, (ctx) => {
      return this.getResponse(ctx);
    });
  }
}

export { APIReferenceBase };
