import type { Ctx, OpenAPIDoc } from "@/mod.ts";
import z from "zod";

// API endpoint handler
export async function GET(ctx: Ctx) {
  const user = {
    username: "John Doe",
    email: "john@gmail.com",
    age: 25,
    friendNames: ["Alice", "Bob", "Charlie"],
    country: "USA",
  };

  return await ctx.json(user, 200);
}

// API endpoint configs
export const path = "/api/getUser";

export const openAPI: OpenAPIDoc = {
  hide: true,
  description: "Get user.",
  responses: {
    200: {
      type: "application/json",
      zodSchema: z.object({
        username: z.string(),
        email: z.string().email(),
        age: z.number().min(18).max(99),
        friendNames: z.array(z.string()),
        country: z.enum(["USA", "UK", "India"]),
      }),
    },
  },
};
