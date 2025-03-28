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
export const path = "/api/validationTest";
export const middlewares = ["dataValidation"];

// API endpoint data validation
export const validation: ValidationType = {
  query: {
    name: inp().string().min(3),
  },
  body: inp().object({
    username: inp().string(),
    email: inp().string().email(),
    test: inp().object({
      test2: inp().string(),
    }),
    age: inp().number().min(18).max(99),
    friendNames: inp().array().every(inp().string()),
  }),
  formData: {
    username: inp().string(),
    email: inp().string().email(),
    age: inp().number().min(18).max(99),
    friendNames: inp().array().every(inp().string()),
    photos: inp().file().maxSize(5 * 1024 * 1024).maxFilesCount(5),
    createdAt: inp().date().min(new Date("2021-01-01")).max(new Date("2021-12-31")),
  }
};