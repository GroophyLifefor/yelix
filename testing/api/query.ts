import {
  type Ctx,
  getValidatedQuery,
  type Infer,
  inp,
  type OpenAPIDoc,
} from "@/mod.ts";
import { YelixCache } from "@/src/utils/cache.ts";

export const cache = new YelixCache<string>();

// API endpoint handler
export async function GET(ctx: Ctx) {
  const query = getValidatedQuery<Infer<typeof validation.query>>(ctx);

  const data = "Hello, " + query.name;
  return await ctx.text(data, 200);
}

// API endpoint configs
export const path = "/api/query";
export const middlewares = ["dataValidation"];

export const t = {
  name: inp().string().min(3),
  age: inp().string().toNumber().min(18),
};

// API endpoint data validation
export const validation = {
  query: {
    name: inp().string().min(3),
    age: inp().string().toNumber().min(18),
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
