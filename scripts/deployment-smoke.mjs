import { spawn } from 'node:child_process';
import { readFile, readdir } from 'node:fs/promises';
import { request as httpRequest } from 'node:http';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = resolve(fileURLToPath(new URL('..', import.meta.url)));
const pulseRoot = resolve(workspaceRoot, 'artifacts/pulse');
const outputRoot = resolve(pulseRoot, 'dist/public');
const indexPath = resolve(outputRoot, 'index.html');
const port = 4173;

const providerConfigs = {
  json: ['vercel.json', 'railway.json'],
  yaml: ['render.yaml'],
  toml: ['netlify.toml', 'wrangler.toml'],
};

function fail(message) {
  throw new Error(message);
}

function assert(condition, message) {
  if (!condition) fail(message);
}

function stripTomlComment(line) {
  let quote;
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if ((character === '"' || character === "'") && line[index - 1] !== '\\') {
      quote = quote === character ? undefined : quote || character;
    }
    if (character === '#' && !quote) return line.slice(0, index);
  }
  return line;
}

function validateToml(source, file) {
  let section;
  const keys = new Set();

  for (const [lineNumber, rawLine] of source.split(/\r?\n/).entries()) {
    const line = stripTomlComment(rawLine).trim();
    if (!line) continue;

    const arraySectionMatch = line.match(/^\[\[([A-Za-z0-9_.-]+)\]\]$/);
    if (arraySectionMatch) {
      section = arraySectionMatch[1];
      continue;
    }

    const sectionMatch = line.match(/^\[([A-Za-z0-9_.-]+)\]$/);
    if (sectionMatch) {
      section = sectionMatch[1];
      continue;
    }

    const assignment = line.match(/^([A-Za-z0-9_.-]+)\s*=\s*(.+)$/);
    assert(
      assignment,
      `${file}:${lineNumber + 1} is not a valid TOML table or assignment`,
    );

    const [, key, value] = assignment;
    const fullKey = section ? `${section}.${key}` : key;
    assert(!keys.has(fullKey), `${file}:${lineNumber + 1} duplicates ${fullKey}`);
    keys.add(fullKey);

    if (value.startsWith('[')) {
      assert(value.endsWith(']'), `${file}:${lineNumber + 1} has an unclosed array`);
      continue;
    }
    if (value.startsWith('"') || value.startsWith("'")) {
      assert(
        value.length >= 2 && value.endsWith(value[0]),
        `${file}:${lineNumber + 1} has an unclosed string`,
      );
      continue;
    }
    assert(
      /^(?:true|false|-?\d+(?:\.\d+)?|[A-Za-z0-9_.:+-]+)$/.test(value),
      `${file}:${lineNumber + 1} has an invalid TOML value`,
    );
  }
}

function validateYaml(source, file) {
  let previousIndent = 0;

  for (const [lineNumber, rawLine] of source.split(/\r?\n/).entries()) {
    if (!rawLine.trim() || rawLine.trimStart().startsWith('#')) continue;
    assert(!rawLine.includes('\t'), `${file}:${lineNumber + 1} uses tabs for indentation`);

    const indent = rawLine.length - rawLine.trimStart().length;
    assert(indent % 2 === 0, `${file}:${lineNumber + 1} has uneven indentation`);
    assert(
      indent <= previousIndent + 2,
      `${file}:${lineNumber + 1} skips an indentation level`,
    );
    previousIndent = indent;

    const content = rawLine.trim();
    const isListItem = content.startsWith('- ');
    const mapping = isListItem ? content.slice(2).trim() : content;
    assert(
      (isListItem && mapping.length > 0) ||
        mapping === '-' ||
        /^[A-Za-z_][A-Za-z0-9_.-]*\s*:(?:\s+.*)?$/.test(mapping),
      `${file}:${lineNumber + 1} is not a valid YAML mapping or list item`,
    );
    assert(
      !/^(?:[^'"\\]|\\.)*['"]$/.test(mapping) ||
        (mapping.match(/"/g) || []).length % 2 === 0,
      `${file}:${lineNumber + 1} has an unclosed YAML string`,
    );
  }
}

async function validateProviderConfigs() {
  for (const file of providerConfigs.json) {
    const path = resolve(workspaceRoot, file);
    try {
      JSON.parse(await readFile(path, 'utf8'));
    } catch (error) {
      fail(`${file} is not valid JSON: ${error.message}`);
    }
  }

  for (const file of providerConfigs.yaml) {
    validateYaml(await readFile(resolve(workspaceRoot, file), 'utf8'), file);
  }

  for (const file of providerConfigs.toml) {
    validateToml(await readFile(resolve(workspaceRoot, file), 'utf8'), file);
  }
}

function cleanBuildEnvironment() {
  return {
    PATH: process.env.PATH,
    HOME: process.env.HOME,
    LANG: process.env.LANG || 'C.UTF-8',
    CI: 'true',
    NODE_ENV: 'production',
  };
}

function runBuild() {
  return new Promise((resolveBuild, rejectBuild) => {
    const build = spawn(
      'pnpm',
      ['--filter', '@workspace/pulse', 'run', 'build'],
      {
        cwd: workspaceRoot,
        env: cleanBuildEnvironment(),
        stdio: 'inherit',
      },
    );

    build.on('error', rejectBuild);
    build.on('exit', (code, signal) => {
      if (code === 0) resolveBuild();
      else rejectBuild(new Error(`Pulse build failed (${signal || `exit ${code}`})`));
    });
  });
}

async function assertStaticOutput() {
  const index = await readFile(indexPath, 'utf8');
  assert(index.includes('<div id="root">'), 'dist/public/index.html is missing the app root');

  const assetsRoot = resolve(outputRoot, 'assets');
  const assets = await readdir(assetsRoot);
  assert(assets.length > 0, 'dist/public/assets is missing generated assets');
}

function startStaticServer() {
  const server = spawn('node', [resolve(pulseRoot, 'serve.mjs')], {
    cwd: pulseRoot,
    env: { ...cleanBuildEnvironment(), PORT: String(port) },
    stdio: ['ignore', 'inherit', 'inherit'],
  });

  return server;
}

function get(pathname) {
  return new Promise((resolveResponse, rejectResponse) => {
    const request = httpRequest(
      { hostname: '127.0.0.1', port, path: pathname, method: 'GET' },
      (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('end', () => {
          resolveResponse({
            body: Buffer.concat(chunks).toString('utf8'),
            headers: response.headers,
            statusCode: response.statusCode,
          });
        });
      },
    );
    request.on('error', rejectResponse);
    request.end();
  });
}

async function waitForServer(server) {
  const deadline = Date.now() + 5000;
  let lastError;

  while (Date.now() < deadline) {
    if (server.exitCode !== null) {
      fail(`Static server exited before it was ready (${server.exitCode})`);
    }
    try {
      await get('/');
      return;
    } catch (error) {
      lastError = error;
      await new Promise((resolveDelay) => setTimeout(resolveDelay, 100));
    }
  }

  fail(`Static server did not become ready: ${lastError?.message || 'timeout'}`);
}

async function assertSpaRoutes(expectedIndex) {
  for (const pathname of ['/', '/control', '/community']) {
    const response = await get(pathname);
    assert(response.statusCode === 200, `${pathname} returned HTTP ${response.statusCode}`);
    assert(
      response.headers['content-type']?.startsWith('text/html'),
      `${pathname} did not return HTML`,
    );
    assert(response.body === expectedIndex, `${pathname} did not return the SPA entry`);
  }
}

async function main() {
  await validateProviderConfigs();
  await runBuild();
  await assertStaticOutput();

  const expectedIndex = await readFile(indexPath, 'utf8');
  const server = startStaticServer();
  try {
    await waitForServer(server);
    await assertSpaRoutes(expectedIndex);
  } finally {
    if (server.exitCode === null) {
      server.kill('SIGTERM');
      await new Promise((resolveServer) => server.once('exit', resolveServer));
    }
  }

  console.log('Deployment smoke check passed.');
}

main().catch((error) => {
  console.error(`Deployment smoke check failed: ${error.message}`);
  process.exitCode = 1;
});