import { z } from 'zod';
import type {
  AddOpenAPIEndpointParams,
  OpenAPIPath,
  OpenAPISchema,
  OpenAPIType,
  InitializeOpenAPIParams,
} from './openAPI.types.ts';

let openAPI: OpenAPIType = {
  openapi: '3.1.0',
  info: {
    title: '',
    description: '',
    version: '1.0.0',
  },
  servers: [],
  paths: {},
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        description:
          "Use Bearer Token for authorization. Format: 'Bearer <token>'",
      },
    },
  },
};

let openAPIExcludeMethods: string | string[] = [];

function initOpenAPI({
  title,
  description,
  servers,
  excludeMethods,
}: InitializeOpenAPIParams): void {
  if (excludeMethods) {
    openAPIExcludeMethods = excludeMethods;
  }
  openAPI = {
    openapi: '3.1.0',
    info: {
      title,
      description,
      version: '1.0.0',
    },
    servers: servers,
    paths: {},
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          description:
            "Use Bearer Token for authorization. Format: 'Bearer <token>'",
        },
      },
    },
  };
}

function addOpenAPIEndpoint(
  addOpenAPIEndpointParams: AddOpenAPIEndpointParams
) {
  if (openAPIExcludeMethods.includes(addOpenAPIEndpointParams.method)) {
    return;
  }

  const operationId = `${
    addOpenAPIEndpointParams.method
  }_${addOpenAPIEndpointParams.path.replace(/[^a-zA-Z0-9]/g, '_')}`;

  const endpoint: OpenAPIPath = {
    [addOpenAPIEndpointParams.method]: {
      description: addOpenAPIEndpointParams.description,
      operationId,
      parameters: addOpenAPIEndpointParams.inputs?.query
        ? Object.entries(addOpenAPIEndpointParams.inputs.query).map(
            ([key, zodSchema]) => ({
              name: key,
              in: 'query',
              required: !(zodSchema instanceof z.ZodOptional),
              schema: zodToJsonSchema(zodSchema as z.ZodTypeAny),
            })
          )
        : [],
      requestBody: addOpenAPIEndpointParams.inputs?.body
        ? {
            required: true,
            content: {
              'application/json': {
                schema: zodToJsonSchema(
                  addOpenAPIEndpointParams.inputs.body as z.ZodTypeAny
                ),
              },
            },
          }
        : undefined,
      responses: {},
      tags: addOpenAPIEndpointParams.tags,
    },
  };

  for (const [status, response] of Object.entries(
    addOpenAPIEndpointParams.responses
  )) {
    const method = endpoint[addOpenAPIEndpointParams.method];
    if (method) {
      const schema = response.zodSchema
        ? zodToJsonSchema(response.zodSchema)
        : null;

      method.responses[status] = {
        description: `Response for status code ${status}`,
        content: {
          [response.type]: {
            schema: schema || { type: 'string' },
          },
        },
      };
    }
  }

  openAPI.paths[addOpenAPIEndpointParams.path] = {
    ...openAPI.paths[addOpenAPIEndpointParams.path],
    ...endpoint,
  };
}

function zodToJsonSchema(zodSchema: z.ZodTypeAny): OpenAPISchema {
  if (!zodSchema) return { type: 'object' };
  if (zodSchema instanceof z.ZodObject) {
    const properties: Record<string, OpenAPISchema> = {};
    Object.entries(zodSchema.shape).forEach(([key, value]) => {
      properties[key] = zodToJsonSchema(value as z.ZodTypeAny);
    });
    return { type: 'object', properties };
  }
  return { type: 'string' };
}

export {
  openAPI,
  initOpenAPI,
  addOpenAPIEndpoint,
  type InitializeOpenAPIParams,
};
