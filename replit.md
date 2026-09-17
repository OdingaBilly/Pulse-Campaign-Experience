# Pulse Campaign Experience

Pulse is a shared campaign operating system with an operational control room for campaign teams and an approachable community portal for residents and participants.

## Run & Operate

- `pnpm --filter @workspace/pulse run dev` — run the Pulse web app through the managed workflow
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `artifacts/pulse/src/App.tsx` — route-aware app shell, landing page, Mission Control, and Community Portal
- `artifacts/pulse/src/data/repository.ts` — typed synthetic campaign repository and shared domain contracts
- `artifacts/pulse/src/index.css` — Pulse visual tokens, typography, global reset, and reduced-motion rules
- `attached_assets/` — supplied Pulse wordmark reference asset
- `lib/api-spec/openapi.yaml` — shared API source of truth for future kernel-backed phases

## Architecture decisions

- Phase 1 keeps data local and synthetic; the UI reads through repository functions so a future Pulse Kernel adapter can replace the source without rewriting presentation.
- `/control` and `/community` share the same campaign vocabulary and domain objects but expose different levels of operational detail.
- Community interactions are intentionally aggregate-only and privacy-forward; no participant profiles, political preferences, or individualized targeting are represented.
- The visual system favors editorial hierarchy, deliberate whitespace, thin borders, and restrained motion over dense dashboard chrome.

## Product

- Landing page entry point with Mission Control and Community Portal paths
- Campaign Pulse score, operational metrics, current reality signals, regional coverage, project pipeline, and decision timeline
- Public campaign vision, projects, progress states, aggregate polls, events, and private signal submission
- Responsive behavior for desktop, tablet, and mobile with visible focus states and reduced-motion support

## User preferences

Keep Pulse calm, editorial, and information-first. Avoid generic SaaS dashboard patterns.

## Gotchas

- This first phase is synthetic and disconnected from the API server by design; do not imply real campaign or participant data.
- If backend integration is added later, preserve the repository boundary and shared contract names.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
