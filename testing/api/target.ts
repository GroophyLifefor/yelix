// deno-lint-ignore-file no-explicit-any
import type { Ctx, ValidationType } from "@/mod.ts";
import z from "zod";
import type { QueryType } from "@/src/types/types.d.ts";
import { YelixCache } from "@/src/utils/cache.ts";

export const cache = new YelixCache<string>();

// API endpoint handler
export async function GET(ctx: Ctx) {
  const requestData = ctx.get('dataValidation').user
  const query: QueryType = requestData.query;

  if (cache.has(ctx, query.name)) {
    const cachedData = cache.get(ctx, query.name)!;
    return await ctx.text(cachedData + ' - (cached)', 200);
  }

  const data = 'Hello, ' + query.name;
  cache.set(ctx, query.name, data, '5s');

  return await ctx.text(data, 200);
}

// API endpoint configs
// if path is not provided, it just a file
// export const path = '/api/hello';
export const middlewares = ['dataValidation'];

// API endpoint data validation
export const validation: ValidationType = {
  query: {
    name: z.string()
  },
};

// API endpoint openAPI documentation
export const openAPI: any = {
  description:
    "This endpoint returns a greeting message with the name provided in the query parameter.",
  tags: ['Hello'],
  responses: {
    201: {
      type: 'application/json',
      zodSchema: z.string(),
    },
  },
};
