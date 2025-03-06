import { assertEquals } from "@std/assert";
import type { Yelix } from "@/mod.ts";
import type { Endpoint } from "@/src/types/types.d.ts";
import { defaultAfter, defaultBefore, test } from "@/test/debugging_helper.ts";

test({
  title: "Endpoint loading",
  before: defaultBefore,
  after: defaultAfter,
  test(app: Yelix) {
    const testEndpoint: Endpoint = {
      path: "/test",
      async GET(ctx) {
        return await ctx.text("test", 200);
      },
    };

    app.loadEndpoints([testEndpoint]);
    assertEquals(app.endpointList.length, 1);
    assertEquals(app.endpointList[0].path, "/test");

    return app;
  },
});
