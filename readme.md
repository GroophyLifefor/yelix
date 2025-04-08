# Yelix

[![JSR](https://jsr.io/badges/@murat/yelix)](https://jsr.io/@murat/yelix/)

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

<details>
<summary>Technical Information</summary>


### Generated Files

When you run `deno task dev`, actually, it runs 
```
deno run --watch --allow-run --allow-net --allow-read --allow-env https://docs.yelix.dev/dev.ts
```

## What Happens Behind the Scenes

When you run this command:

1. **Run dev.ts via Dev task**: When you run `deno task dev`, it executes the `dev.ts` script.
2. 1. **Endpoint Resolution**: The `resolveEndpoints.ts` script scans your `api` directory and generates proper static imports in `endpoints.ts`.
1. 2. **Server Startup**: The Yelix server (`main.ts`) loads these endpoints and starts listening for requests
2. 3. **File Watching**: Two watchers run simultaneously:
      - One watches the `api` folder and regenerates `endpoints.ts` when files change
      - Another watches your entire project and restarts the server when needed
3. 4. **Sibling closure**: When your `main.ts` process is terminated, the resolver process is also terminated. This ensures that all processes are properly cleaned up.

## Technical Implementation

The `dev.ts` script orchestrates this process by:
- Spawning the resolver process with file watching enabled
- Running the main server with the `--watch` flag for hot reloading
- Managing process lifecycle and termination

The resolver handles the critical task of transforming your directory structure into Deno Deploy-compatible static imports, creating entries like:

```typescript
// In endpoints.ts (auto-generated)
const endpoints = [
  await import("./api/hello.ts"),
  await import("./api/users.ts"),
  // All your API endpoints are automatically included
];
```

## Why This Matters

Deno Deploy has a strict requirement: imports must be static string literals. This architecture automatically handles this constraint while providing a seamless development experience where you can add new API endpoints without manually updating imports.

You can focus on building your API endpoints while the system handles the deployment compatibility for you.

</details>


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
