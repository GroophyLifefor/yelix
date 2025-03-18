import type { Ctx, OpenAPIDoc, ValidationType } from "@/mod.ts";
import z from "zod";
import type { QueryType } from "@/src/types/types.d.ts";
import { YelixCache } from "@/src/utils/cache.ts";

export const cache = new YelixCache<string>();

// API endpoint handler
export async function GET(ctx: Ctx) {
  const requestData = ctx.get("dataValidation").user;
  const query: QueryType = requestData.query;

  if (!query.name) {
    return await ctx.json({
      message: "Name is required",
      requestId: 1,
    }, 400);
  }

  if (cache.has(ctx, query.name)) {
    const cachedData = cache.get(ctx, query.name)!;
    return await ctx.text(cachedData + " - (cached)", 200);
  }

  const data = "Hello, " + query.name;
  cache.set(ctx, query.name, data, "5s");
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return await ctx.text(data, 200);
}

// API endpoint configs
export const path = "/api/hello";
export const middlewares = ["dataValidation"];

// API endpoint data validation
export const validation: ValidationType = {
  query: {
    name: z.string().min(1),
  },
};

export const openAPI: OpenAPIDoc = {
  hide: true,
  description: "Approves a pending local event request.",
  tags: ["Local Events"],
  // query: {
  //   name: {
  //     description: "Name of the person to greet",
  //   }
  // },
  responses: {
    200: {
      type: "application/json",
      zodSchema: z.object({
        message: z.string(),
      }),
    },
    400: {
      type: "application/json",
      zodSchema: z.object({
        message: z.string(),
        requestId: z.string(),
      }),
    },
  },
};
