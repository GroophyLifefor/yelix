import { type Ctx, inp, type OpenAPIDoc, type ValidationType } from "@/mod.ts";
import { YelixCache } from "@/src/utils/cache.ts";

export const cache = new YelixCache<string>();

// API endpoint handler
export async function POST(ctx: Ctx) {
  const requestData = ctx.get("dataValidation").user;
  const body = requestData.body;

  const data = "Hello, " + body.name;
  return await ctx.json({
    isOk: true,
    message: data,
    createdAt: new Date().toISOString(),
  }, 200);
}

// API endpoint configs
export const path = "/api/jsonResponse";
export const middlewares = ["dataValidation"];

// API endpoint data validation
export const validation: ValidationType = {
  body: inp().object({
    name: inp().string().min(3),
    inner1: inp().object({
      inner2: inp().object({
        inner3: inp().string().min(3),
      }),
    }),
  }),
};

export const openAPI: OpenAPIDoc = {
  description: "Get user.",
  responses: {
    200: {
      type: "application/json",
      zodSchema: inp().object({
        isOk: inp().boolean(),
        message: inp().string(),
        createdAt: inp().string().datetime(),
      }),
    },
  },
};
