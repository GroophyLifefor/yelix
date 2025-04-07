import type { Ctx, Yelix } from '@/mod.ts';
import type { DocsManager } from '@/src/core/DocsManager.ts';

type IndexPageParams = {
  yelix: Yelix;
  docsManager: DocsManager;
  docsPath?: string;
};

export function serveIndexPage(params: IndexPageParams) {
  params.yelix.app.notFound((ctx: Ctx) => {
    if (ctx.req.path === '/') {
      return ctx.html(
        getHtml({ docsPaths: params.docsManager.servedPaths }),
        200
      );
    }

    return new Response('Not Found', { status: 404 });
  });
}

function uppercaseFirstChar(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function getHtml({
  docsPaths,
}: {
  docsPaths?: { key: string; path: string }[];
}): string {
  return /*html*/ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome to Yelix</title>
  <link rel="icon" type="image/png" href="https://docs.yelix.dev/img/yelix-logo-w512.png" />
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
      max-width: 600px;
      width: 100%;
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
      margin-bottom: 0px;
      margin-top: 8px;
    }

    p.apireftitle {
      margin-top: 32px;
    }

    ul {
      margin-top: 4px;
      list-style: none;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    li {
      outline: 1px solid #3490dc;
      display: flex;
      padding: 12px;
      border-radius: 8px;
      text-align: left;
    }

    li img {
      width: 48px;
      height: 48px;
      margin-right: 12px;
      border-radius: 50%;
    }

    li h4 {
      margin: 0;
      font-size: 1.5rem;
      color: #3490dc;
      font-weight: 600;
      line-height: 1;
    }

    li div {
      display: flex;
      flex-direction: column;
      align-items: start;
      gap: 4px;
    }

    a {
      color: #3490dc;
      text-decoration: none;
      display: flex;
      width: 100%;
      height: 100%;
    }
    a:hover {
      text-decoration: underline;
    }
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 0.9; }
    }

    @media (max-width: 768px) {
      .container {
        padding: 1.5rem;
      }
      h1 {
        font-size: 2.5rem;
      }
      p {
        font-size: 1.1rem;
      }
      li h4 {
        font-size: 1.25rem;
      }
      li {
        padding: 8px;
      }
      li img {
        width: 36px;
        height: 36px;
      }
    }

    @media (max-width: 480px) {
      .container {
        padding: 1rem;
      }
      h1 {
        font-size: 2rem;
      }
      p {
        font-size: 1rem;
      }
      li h4 {
        font-size: 1.1rem;
      }
      li span {
        font-size: 0.9rem;
      }
      li img {
        width: 32px;
        height: 32px;
        margin-right: 8px;
      }
    }

    @media (max-width: 300px) {
      .container {
        padding: 0.75rem;
      }
      h1 {
        font-size: 1.5rem;
      }
      p {
        font-size: 0.9rem;
      }
      li {
        padding: 6px;
      }
      li h4 {
        font-size: 1rem;
      }
      li span {
        font-size: 0.8rem;
      }
      li img {
        width: 24px;
        height: 24px;
        margin-right: 6px;
      }
    }

    @media (max-width: 200px) {
      .container {
        padding: 0.5rem;
      }
      h1 {
        font-size: 1.2rem;
      }
      p {
        font-size: 0.8rem;
      }
      li {
        padding: 4px;
      }
      li h4 {
        font-size: 0.9rem;
      }
      li span {
        font-size: 0.7rem;
      }
      li img {
        width: 20px;
        height: 20px;
        margin-right: 4px;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Yelix</h1>
    <p>A powerful web server library</p>
    ${
      docsPaths && docsPaths.length > 0
        ? `<p class="apireftitle">API References</p>
           <ul>
             ${docsPaths
               .map(
                 ({ key, path }) =>
                   `<li>
                      <a href="${path}" target="_blank">
                        <img src="https://docs.yelix.dev/img/${key}-logo.png" alt="docs" width="20" height="20">
                        <div>
                          <h4>${uppercaseFirstChar(key)}</h4>
                          <span>Move to ${key} API Reference</span>
                        </div>
                      </a>
                   </li>`
               )
               .join('')}
           </ul>`
        : ''
    }
  </div>
</body>
</html>
`;
}
