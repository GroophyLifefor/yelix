import { inp, type Ctx, type ValidationType } from "@/mod.ts";
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
  },
};