import {
  type Ctx,
  getValidatedBody,
  getValidatedFormData,
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
  const _body = getValidatedBody<Infer<typeof validation.body.subFields>>(ctx);
  const _formData = getValidatedFormData<Infer<typeof validation.formData>>(
    ctx,
  );

  const data = "Hello, " + query.name;
  return await ctx.text(data, 200);
}

// API endpoint configs
export const path = "/api/query";
export const middlewares = ["dataValidation"];

// API endpoint data validation
export const validation = {
  query: {
    name: inp().string().min(3),
    age: inp().string().toNumber().min(18),
  },
  body: inp().object({
    name: inp().string(),
    age: inp().number(),
  }),
  formData: {
    photoName: inp().string(),
    photos: inp().file().multipleFiles(),
    age: inp().number(),
    createdAt: inp().date(),
  },
  string: inp().string(),
  number: inp().number(),
  boolean: inp().boolean(),
  date: inp().date(),
  file: inp().file(),
  fileMultiple: inp().file().multipleFiles(),
  array: inp().array(inp().string()),
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
