# Yelix

Yelix is a powerful web server library built specifically for [Deno](https://deno.land/), leveraging the [Hono](https://hono.dev/) framework in the background. It simplifies backend development with automated features, including built-in data validation, OpenAPI 3.1 support, and auto-generated backend documentation.

## Features

- **Hono-based routing** – Fast and lightweight request handling.
- **Automatic data validation** – Supports query and body validation using [Zod](https://zod.dev/).
- **OpenAPI 3.1 integration** – Auto-generates API documentation.
- **Backend documentation generation** – Creates comprehensive API docs with minimal setup.
- **Optional automation** – Features can be enabled or disabled as needed.
- **Deno-native** – Designed specifically for Deno with TypeScript support.

## Installation

```sh
deno add yelix
```

## Getting Started

Here's a quick example to get you started:

```typescript
import { Yelix } from "https://deno.land/x/yelix/mod.ts";
import { z } from "https://deno.land/x/zod/mod.ts";

const app = new Yelix();

app.get("/hello", {
  query: z.object({ name: z.string().min(1) }),
}, (c) => {
  const { name } = c.query;
  return c.json({ message: `Hello, ${name}!` });
});

app.listen(3000);
```

## API Documentation

Once the server is running, visit `http://localhost:3000/docs` to view the auto-generated OpenAPI documentation.

## Configuration

Yelix provides optional configurations to customize features like validation, documentation, and logging.

```typescript
const app = new Yelix({
  enableDocs: true,
  validateRequests: true,
});
```

## Contributing

Contributions are welcome! Feel free to submit issues or pull requests to improve Yelix.

## License

Yelix is licensed under the MIT License.

