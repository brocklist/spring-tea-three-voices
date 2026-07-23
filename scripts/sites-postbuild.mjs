import { copyFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const serverEntry = join(root, 'dist', 'server', 'index.js');
const hostingSource = join(root, '.openai', 'hosting.json');
const hostingOutput = join(root, 'dist', '.openai', 'hosting.json');

mkdirSync(dirname(serverEntry), { recursive: true });
mkdirSync(dirname(hostingOutput), { recursive: true });
copyFileSync(hostingSource, hostingOutput);

writeFileSync(
  serverEntry,
  `const worker = {
  async fetch(request, env) {
    const url = new URL(request.url);
    const assetResponse = await env.ASSETS.fetch(request);

    if (assetResponse.status !== 404) {
      return assetResponse;
    }

    if (request.method !== "GET" && request.method !== "HEAD") {
      return assetResponse;
    }

    const accept = request.headers.get("accept") || "";
    const isPageNavigation = accept.includes("text/html") || !url.pathname.includes(".");

    if (!isPageNavigation) {
      return assetResponse;
    }

    return env.ASSETS.fetch(new Request(new URL("/index.html", request.url), request));
  },
};

export default worker;
`,
);
