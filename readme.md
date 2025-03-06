# Yelix

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

### Create a new project

```sh
# Initialize a new Deno project
deno init my-app

# Change to project directory
cd my-app

# Install Yelix
deno add jsr:@murat/yelix
```

### Create your server

Update your `main.ts` file with the following code:

```typescript
import { Yelix } from "jsr:@murat/yelix";
import * as path from "jsr:@std/path@1.0.8";

async function main() {
  // Port is 3030 by default
  const app = new Yelix();

  // Load endpoints from an 'api' folder
  const currentDir = Deno.cwd();
  const API_Folder = path.join(currentDir, "api");
  await app.loadEndpointsFromFolder(API_Folder);

  app.serve();
}

await main();
```

### Create an API endpoint

Create a new folder named `api` in your project directory, then add a file
`hello.ts` with:

```typescript
import type { Ctx } from "jsr:@murat/yelix";

// API endpoint handler
export async function GET(ctx: Ctx) {
  return await ctx.text("Hello World!", 200);
}

// API endpoint configs
export const path = "/api/hello";
```

### Run your server

Start the development server with:

```sh
deno run --watch --allow-net --allow-read --allow-env main.ts
```

Command flags:

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

## License

Yelix is licensed under the MIT License.
