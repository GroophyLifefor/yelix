import { type Ctx, inp, type OpenAPIDoc } from "jsr:@murat/yelix";

export async function GET(ctx: Ctx) {
  const userid = ctx.req.param("userid");

  console.log("userid", userid);

  return await ctx.json(
    {
      message: `Hello ${userid}`,
    },
    200,
  );
}

export const path = "/api/user/:userid";

export const openAPI: OpenAPIDoc = {
  description: "Returns hello world",
  tags: ["Global"],
  responses: {
    200: {
      type: "application/json",
      zodSchema: inp().string(),
    },
  },
};
