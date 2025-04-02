# Yelix

[![JSR](https://jsr.io/badges/@murat/yelix)](https://jsr.io/@murat/yelix)

Yelix is a powerful web server library built specifically for
[Deno](https://deno.land/), leveraging the [Hono](https://hono.dev/) framework
in the background. It simplifies backend development with automated features,
including built-in data validation, OpenAPI 3.1 support, and auto-generated
backend documentation.

## Features

- **Hono-based routing** – Fast and lightweight request handling.
- **Automatic data validation** – Supports query and body validation using
  [Zod](https://zod.dev/).
- **OpenAPI 3.1 integration** – Auto-generates API documentation.
- **Backend documentation generation** – Creates comprehensive API docs with
  minimal setup.
- **Optional automation** – Features can be enabled or disabled as needed.
- **Deno-native** – Designed specifically for Deno with TypeScript support.
- **API folder structure** - Load endpoints from dedicated folders.

## Installation

```sh
deno add jsr:@murat/yelix
```

## Getting Started

### Prerequisites

- [Deno](https://deno.land/) installed on your system

### Create a New Project

Generate a new Yelix project with a single command:

```sh
deno run --allow-write --allow-read https://yelix-docs.deno.dev/yelix-template.ts
```

This will create a new project with the following structure:
```
api/
└── hello.ts
deno.json
main.ts
```

### Example Endpoint

Here's how a basic endpoint looks in Yelix (`api/hello.ts`):

```typescript
import type { Ctx } from "jsr:@murat/yelix";

export async function GET(ctx: Ctx) {
  return await ctx.text("Hello World!", 200);
}

export const path = "/api/hello";
```

### Running Your Server

Start the development server:

```sh
deno task dev
```

Command flags (automatically included in deno.json):
- `--watch`: Automatically reloads server when changes are made
- `--allow-net`: Permits network access for serving
- `--allow-read`: Allows file access for loading endpoints
- `--allow-env`: Checking where is deployed for Deno Deploy

Visit `http://localhost:3030/api/hello` to see your endpoint in action.

## Deployment Notes

⚠️ **Caution**: Deno Deploy doesn't support the `loadEndpointsFromFolder` method
due to security restrictions around dynamic importing. When deploying to Deno
Deploy, use the `loadEndpoints` method instead.

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to
improve Yelix.

## Early Supporters

[@erenkulaksiz](https://github.com/erenkulaksiz),
[@mertssmnoglu](https://github.com/mertssmnoglu)

## License

Yelix is licensed under the MIT License.
