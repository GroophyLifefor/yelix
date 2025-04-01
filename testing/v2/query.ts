import { type Ctx, inp, type OpenAPIDoc, type ValidationType } from "@/mod.ts";
import type { QueryType } from "@/src/types/types.d.ts";
import { YelixCache } from "@/src/utils/cache.ts";

export const cache = new YelixCache<string>();

// API endpoint handler
export async function GET(ctx: Ctx) {
  const requestData = ctx.get("dataValidation").user;
  const query: QueryType = requestData.query;

  const data = "Hello, " + query.name;
  return await ctx.text(data, 200);
}

// API endpoint configs
export const path = "/api/query";
export const middlewares = ["dataValidation"];

// API endpoint data validation
export const validation: ValidationType = {
  query: {
    name: inp().string().min(3),
    public: inp().object({
      username: inp().string().min(3),
      age: inp().number().min(18),
    }),

    country: inp().string().enum(["USA", "Canada", "Mexico"]),
    limit: inp().number().enum([5, 10, 20, 50]),
    date: inp()
      .date()
      .enum([new Date("2023-01-01"), new Date("2024-12-31")]),
  },
};

export const openAPI: OpenAPIDoc = {
  description: "Get user.",
  responses: {
    200: {
      type: "application/json",
      zodSchema: inp().string(),
    },
  },
};
