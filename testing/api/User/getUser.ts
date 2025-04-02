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
      zodSchema: inp().object({
        message: inp().string(),
        data: inp().object({
          registerType: inp().string(),
          registerDate: inp().string(),
          lastLoginDate: inp().string(),
          email: inp().string(),
          name: inp().string(),
          username: inp().string(),
          picture: inp().string().optional(),
        }),
      }),
    },
    404: {
      type: "application/json",
      zodSchema: inp().object({
        message: inp().string(),
      }),
    },
  },
};
