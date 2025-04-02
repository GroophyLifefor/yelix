import { type Ctx, inp, type OpenAPIDoc, type ValidationType } from "@/mod.ts";
import type { QueryType } from "@/src/types/types.d.ts";

export async function GET(ctx: Ctx) {
  const requestData = ctx.get("dataValidation").user;
  const query: QueryType = requestData.query;

  const data = "Hello, " + query.name;
  return await ctx.text(data, 200);
}

export const path = "/api/hello";
export const middlewares = ["dataValidation"];

export const validation: ValidationType = {
  query: {
    name: inp().string().min(3),
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
