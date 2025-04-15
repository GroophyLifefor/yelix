import { type Ctx, getValidatedBody, type Infer, inp, OpenAPIDoc } from '@/mod.ts';
import { YelixCache } from '@/src/utils/cache.ts';

export const cache = new YelixCache<string>();

// API endpoint handler
export async function POST(ctx: Ctx) {
  const body = getValidatedBody<Infer<typeof validation.body.subFields>>(ctx);

  const data = 'Hello, ' + body.username;
  return await ctx.text(data, 200);
}

// API endpoint configs
export const path = '/api/bodyAll';
export const middlewares = ['dataValidation'];

// API endpoint data validation
export const validation = {
  body: inp().object({
    username: inp().string().min(3).max(255).setExampleInput('Hello Input'),
    email: inp().string().email(),
    page: inp().number().min(5).setExampleInput(34),
    limit: inp().number().min(5).max(10),
    date: inp().date(),
    array: inp().array(inp().string()),
    array2: inp().array(inp().number()),
    object: inp().object({
      asd: inp().string(),
      asdf: inp().number(),
    }),
    boolean: inp().boolean(),
  }),
};

export const openAPI: OpenAPIDoc = {
  description: 'Get user.',
  responses: {
    200: {
      type: 'application/json',
      zodSchema: inp().object({
        username: inp().string().min(3).max(255).setExampleOutput('Hello output'),
        email: inp().string().email(),
        page: inp().number().min(5).setExampleOutput(35),
        limit: inp().number().min(5).max(10),
        date: inp().date(),
        array: inp().array(inp().string()),
        array2: inp().array(inp().number()),
        object: inp().object({
          asd: inp().string(),
          asdf: inp().number(),
        }),
        boolean: inp().boolean(),
      }),
    },
  },
};
