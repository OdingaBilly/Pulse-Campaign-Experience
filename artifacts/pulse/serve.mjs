import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./dist/public', import.meta.url)));
const port = Number(process.env.PORT || 3000);
const contentTypes = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.txt': 'text/plain; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
};

function resolveRequestPath(requestUrl) {
  const pathname = decodeURIComponent(new URL(requestUrl, 'http://localhost').pathname);
  const candidate = resolve(root, `.${pathname}`);
  const isInsideRoot = candidate === root || relative(root, candidate).startsWith('..') === false;
  return isInsideRoot ? candidate : null;
}

async function getFilePath(requestUrl) {
  const candidate = resolveRequestPath(requestUrl);
  if (candidate) {
    try {
      const details = await stat(candidate);
      if (details.isFile()) return candidate;
    } catch {
      // SPA routes intentionally fall through to index.html.
    }
  }
  return resolve(root, 'index.html');
}

const server = createServer(async (request, response) => {
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    response.writeHead(405, { Allow: 'GET, HEAD' });
    response.end();
    return;
  }

  try {
    const filePath = await getFilePath(request.url || '/');
    const body = await readFile(filePath);
    const extension = extname(filePath).toLowerCase();
    const isAsset = request.url?.startsWith('/assets/');

    response.writeHead(200, {
      'Cache-Control': isAsset
        ? 'public, max-age=31536000, immutable'
        : 'no-cache',
      'Content-Type': contentTypes[extension] || 'application/octet-stream',
      'Content-Length': body.byteLength,
      'X-Content-Type-Options': 'nosniff',
    });
    if (request.method === 'HEAD') response.end();
    else response.end(body);
  } catch {
    response.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Unable to serve the Pulse application.');
  }
});

server.on('error', (error) => {
  console.error('Pulse static server failed', error);
  process.exitCode = 1;
});

server.listen(port, '0.0.0.0');