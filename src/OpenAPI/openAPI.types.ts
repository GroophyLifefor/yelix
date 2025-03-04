import type { z } from 'zod';
import type { ValidationType } from '@/mod.ts';

export type OpenAPIMethods =
  | 'get'
  | 'post'
  | 'put'
  | 'delete'
  | 'patch'
  | 'options'
  | 'head'
  | 'connect'
  | 'trace';

export type OpenAPISchema = {
  type: string; // e.g., "string", "number", "array", etc.
  format?: string; // Optional, e.g., "date-time", "email"
  properties?: Record<string, OpenAPISchema>; // For object types
  items?: OpenAPISchema; // For array types
  required?: string[]; // For required fields
  enum?: (string | number)[]; // For enumerated values
};

export type OpenAPISecurityScheme = {
  bearerAuth: {
    type: 'http';
    scheme: 'bearer';
    description: "Use Bearer Token for authorization. Format: 'Bearer <token>'";
  };
};

export type OpenAPIParameter = {
  name: string; // Parameter name
  in: 'query' | 'header' | 'path' | 'cookie'; // Parameter location
  required: boolean; // Whether the parameter is required
  schema: OpenAPISchema; // Schema of the parameter
};

export type OpenAPIRequestBody = {
  description?: string; // Optional description of the request body
  required: boolean; // Whether the request body is required
  content: Record<
    string /* MIME type, e.g., "application/json" */,
    {
      schema: OpenAPISchema; // Schema of the request body
    }
  >;
};

export type OpenAPIResponse = {
  description: string;
  content: Record<
    string /* MIME type, e.g., "application/json" */,
    {
      schema: OpenAPISchema; // Schema of the response body
    }
  >;
};

export type OpenAPIPath = {
  [method in OpenAPIMethods]?: {
    description: string;
    operationId: string;
    parameters?: OpenAPIParameter[]; // Query, header, path, or cookie parameters
    requestBody?: OpenAPIRequestBody; // For methods like POST or PUT
    responses: Record<string /* HTTP status code */, OpenAPIResponse>; // Response details
    tags?: string[]; // Optional tags for the endpoint
  };
};

export type OpenAPIServer = {
  url: string;
  description: string;
};

export type OpenAPIType = {
  openapi: string; // e.g., "3.1.0"
  info: {
    title: string;
    description: string;
    version: string;
  };
  servers: OpenAPIServer[];
  paths: Record<string /* Path, e.g., "/hello" */, OpenAPIPath>;
  components: {
    securitySchemes: OpenAPISecurityScheme;
  };
};

export type InitializeOpenAPIParams = {
  title: string;
  description: string;
  servers: OpenAPIServer[];
  excludeMethods?: OpenAPIMethods[];
};

export type AddOpenAPIEndpointResponseParams = {
  type: string; // MIME type
  zodSchema: z.ZodObject<z.ZodRawShape> | z.ZodString | null;
};

export type AddOpenAPIEndpointParams = {
  path: string;
  method: OpenAPIMethods;
  inputs: ValidationType;
  responses: Record<string /* status code */, AddOpenAPIEndpointResponseParams>;
  description: string;
  tags?: string[];
};

export type OpenAPIDocSimpleResponse = {
  type: string;
  zodSchema: z.ZodObject<z.ZodRawShape> | z.ZodString | null;
};

export type OpenAPIDoc = {
  description: string;
  tags?: string[];
  responses: Record<string, OpenAPIDocSimpleResponse>;
};
