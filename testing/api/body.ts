import { type Ctx, inp, type ValidationType } from "@/mod.ts";
import { YelixCache } from "@/src/utils/cache.ts";

export const cache = new YelixCache<string>();

// API endpoint handler
export async function POST(ctx: Ctx) {
  const requestData = ctx.get("dataValidation").user;
  const query = requestData.body;

  const data = "Hello, " + query.name;
  return await ctx.text(data, 200);
}

// API endpoint configs
export const path = "/api/body";
export const middlewares = ["dataValidation"];

// API endpoint data validation
export const validation: ValidationType = {
  body: inp().object({
    username: inp().string().min(3).max(255),
    email: inp().string().email(),
  }),
};
