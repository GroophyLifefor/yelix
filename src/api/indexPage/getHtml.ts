import type { Ctx, Yelix } from "@/mod.ts";

type IndexPageParams = {
  yelix: Yelix;
  docsPath?: string;
};

export function serveIndexPage(params: IndexPageParams) {
  params.yelix.app.notFound((ctx: Ctx) => {
    if (ctx.req.path === '/') {
      return ctx.html(getHtml({ docsPath: params.docsPath }), 200);
    }

    return new Response('Not Found', { status: 404 });
  });
}

function getHtml({ docsPath }: {
  docsPath?: string;
}): string {
  return /*html*/ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Yelix</title>
  <meta name="description" content="Yelix - A powerful web server library">
  <style>
    body {
      margin: 0;
      font-family: system-ui, -apple-system, sans-serif;
      background: linear-gradient(135deg, #1a1a1a, #2a2a2a);
      color: #fff;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 800px;
    }
    h1 {
      font-size: 3.5rem;
      margin: 0;
      background: linear-gradient(45deg, #3490dc, #38c172);
      background-clip: text;
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      animation: slideIn 0.8s ease-out;
    }
    p {
      font-size: 1.25rem;
      line-height: 1.6;
      opacity: 0.9;
      animation: fadeIn 1s ease-out 0.3s both;
    }
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 0.9; }
    }

    a {
      color: #3490dc;
      text-decoration: none;
      font-weight: bold;
    }

    a:hover {
      text-decoration: underline;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Yelix</h1>
    <p>A powerful web server library</p>
    ${
      docsPath
        ? `<p>
            Lemme see your docs: 
            <a href="${docsPath}">${docsPath}</a>
          </p>`
        : ''
    }
  </div>
</body>
</html>
`;
}
