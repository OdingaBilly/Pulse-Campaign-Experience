# Pulse deployment

Pulse is a static React single-page application. Every host must build the
workspace from the repository root and serve `artifacts/pulse/dist/public`.
The SPA fallback to `index.html` is required so `/control` and `/community`
continue to work after a direct refresh.

## Shared build contract

```bash
pnpm install --frozen-lockfile
pnpm --filter @workspace/pulse run build
```

Static output:

```text
artifacts/pulse/dist/public
```

Before publishing, run the deployment smoke check:

```bash
pnpm run test:deployment
```

It builds Pulse without Replit-only environment variables, validates the
provider configuration files, checks the generated entry files, and verifies
SPA fallback responses through the production static server.

## Providers

- **Replit:** managed by `artifacts/pulse/.replit-artifact/artifact.toml`.
- **Vercel:** import the repository; `vercel.json` supplies the install command,
  build command, output directory, and SPA rewrite.
- **Render:** use the root `render.yaml` blueprint as a Static Site.
- **Netlify:** use the root `netlify.toml` configuration.
- **Cloudflare Pages:** use `wrangler.toml` or set the same shared build
  contract and output directory in the Pages project settings.
- **Railway:** use the root `railway.json`. Railway runs the small Node static
  server in `artifacts/pulse/serve.mjs` and supplies its `PORT` automatically.

## Responsive behavior

The app supports narrow mobile widths from 320px, uses `svh`/`dvh` for mobile
viewport height, honors safe-area insets, preserves browser zoom, and keeps
keyboard focus visible. Verify at minimum:

- 320px and 402px mobile
- 768px tablet
- 1024px laptop
- 1440px desktop

No provider-specific environment variables or secrets are required for the
current synthetic-data build.