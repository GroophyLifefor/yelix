import type { Ctx, ValidationType } from "@/mod.ts";
import z from "zod";

// API endpoint handler
export async function GET(ctx: Ctx) {
  const requestData = ctx.get('dataValidation').user
  const query: QueryType = requestData.query;

  return await ctx.text('Hello, ' + query.name, 200);
}

// API endpoint configs
export const path = '/api/hello';
export const middlewares = ['logger', 'dataValidation'];

// API endpoint data validation
export const validation: ValidationType = {
  query: {
    name: z.string()
  },
};
const querySchema = z.object(validation.query as z.ZodRawShape);
type QueryType = z.infer<typeof querySchema>;