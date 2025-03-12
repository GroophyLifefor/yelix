import { requestDataValidationMiddleware, Yelix } from "@/mod.ts";
import * as path from "jsr:@std/path@1.0.8";

async function main() {
  const app = new Yelix({
    debug: false,
    port: 3030,
  });

  const currentDir = Deno.cwd();
  const API_Folder = path.join(currentDir, "testing", "api");
  await app.loadEndpointsFromFolder(API_Folder);

  // const openAPI = new YelixOpenAPI({
  //   title: 'Yelix Testing API',
  //   version: '1.0.0',
  //   description: 'This is a testing API for Yelix',
  // });

  // app.app.get('/yelix-openapi-beta-raw', (c) => {
  //   return c.json(openAPI.getJSON(), 200);
  // });

  // app.app.get(
  //   '/docs-beta',
  //   apiReference({
  //     theme: 'saturn',
  //     favicon: '/public/favicon.ico',
  //     pageTitle: 'Yelix API Docs',
  //     spec: { url: '/yelix-openapi-beta-raw' },
  //   })
  // );

  // if (openAPI._openAPI && openAPI._openAPI.paths) {
  //   openAPI._openAPI.paths['/yelix-openapi-beta-raw'] = {
  //     get: {
  //       tags: ['Documentation'],
  //       summary: 'Get OpenAPI JSON',
  //       description:
  //         'Retrieve the complete OpenAPI specification in JSON format',
  //       operationId: 'getOpenAPISpec',
  //       parameters: [
  //         {
  //           name: 'format',
  //           in: 'query',
  //           description: 'Response format type',
  //           required: false,
  //           schema: {
  //             type: 'string',
  //             enum: ['json', 'yaml'],
  //             default: 'json',
  //           },
  //         },
  //       ],
  //       responses: {
  //         200: {
  //           description: 'Successful Response',
  //           content: {
  //             'application/json': {
  //               schema: {
  //                 type: 'object',
  //               },
  //               examples: {
  //                 simple: {
  //                   summary: 'Basic API Structure',
  //                   value: {
  //                     openapi: '3.1.0',
  //                     info: {
  //                       title: 'Example API',
  //                       version: '1.0.0',
  //                     },
  //                     paths: {
  //                       '/api/hello': {
  //                         get: {
  //                           summary: 'Hello World Endpoint',
  //                         },
  //                       },
  //                     },
  //                   },
  //                 },
  //                 full: {
  //                   summary: 'Complete API Structure',
  //                   value: {
  //                     openapi: '3.1.0',
  //                     info: {
  //                       title: 'Yelix Testing API',
  //                       version: '1.0.0',
  //                       description: 'Full API documentation with examples',
  //                     },
  //                     paths: {},
  //                     components: {
  //                       schemas: {},
  //                       securitySchemes: {},
  //                     },
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //         400: {
  //           description: 'Invalid format specified',
  //           content: {
  //             'application/json': {
  //               schema: {
  //                 type: 'object',
  //                 properties: {
  //                   error: {
  //                     type: 'string',
  //                     example: 'Invalid format specified. Use json or yaml',
  //                   },
  //                 },
  //               },
  //             },
  //           },
  //         },
  //       },
  //     },
  //   };
  // }

  app.initOpenAPI({
    path: "/docs",
    title: "Yelix Testing API",
    description: "This is a testing API for Yelix",
    servers: [
      {
        url: "http://localhost:3030",
        description: "Local Server",
      },
    ],
  });

  app.setMiddleware("dataValidation", requestDataValidationMiddleware);

  app.serve();
}

await main();
