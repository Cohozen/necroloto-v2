# CLAUDE.md

Guidance for working in this repo. Read alongside [README.md](README.md).

## What this is

Necroloto V2 — a "celebrity death pool" game. Monorepo (pnpm + Turborepo):

- `apps/api` — **NestJS API, the single backend brain**. All business logic lives here.
- `apps/web` — **front web** (Vite + React 19 + TS, TanStack Router/Query, Tailwind v4 +
  shadcn, Clerk). UI built; not yet wired to the API (screens use mock data marked `// TEMP`).
  See the "Front web" section below.
- `packages/shared` — `@necroloto/shared`: scoring (`calculPointByCelebrity`, `deathYear`, UTC-based) and enums. Built with `tsc`, consumed by the API.
- Mobile (Expo) is planned, not built yet.

Stack: NestJS 11, Prisma 7 (pg adapter), Supabase Postgres + Storage, Clerk auth.
Front: Vite 6, React 19, TanStack Router + Query, Tailwind v4, shadcn/ui.

## Commands

- `pnpm build` — Turbo build (shared → api → web). API build = `prisma generate && nest build`.
- `pnpm --filter necroloto-api start:dev` — run the API locally.
- `pnpm --filter necroloto-web dev` — run the web app (Vite, port 5173).
- `pnpm --filter necroloto-web build` — web build (`tsc -b && vite build`).
- `pnpm --filter @necroloto/shared test` — scoring unit tests (node:test).
- `pnpm lint` / `pnpm format` — Biome (read-only / write).
- Integration checks (need `apps/api/.env`, run against real Supabase, mostly read-only):
  `node apps/api/scripts/verify-phase3.mjs`, `verify-auth.mjs`, `verify-storage.mjs`.

## Gotchas (learned the hard way)

- **Biome `useImportType` is OFF on purpose** (`biome.json`). It converts injected
  classes/DTOs to `import type`, which erases the runtime import NestJS DI and
  class-validator need (reflect-metadata) → broken at runtime. Do NOT re-enable it,
  and prefer `pnpm format` over `biome check --write` on NestJS files.
- **Supabase connection**: pooler host is `aws-1-eu-west-3` (not aws-0). `DATABASE_URL`
  = transaction pooler `:6543?pgbouncer=true` (runtime, via pg adapter in
  `PrismaService`). `DIRECT_URL` = session pooler `:5432` (migrations). The direct
  `db.<ref>.supabase.co` host is IPv6-only — unusable from many local machines.
- **Interactive Prisma transactions are avoided** for pgBouncer safety — use the
  batched `prisma.$transaction([...])` array form (see `BetsService.replaceCelebrities`,
  `CelebritiesService.recalculatePoints`).
- **Prisma 7 `prisma-client` generator** emits TypeScript into `apps/api/generated/`,
  compiled by `nest build` into `dist/generated`. Because `generated/` is a sibling of
  `src/`, the build output is `dist/src/main.js` (not `dist/main.js`). `start:prod` and
  the Dockerfile point there.
- **`prisma.config.ts`** datasource uses `DIRECT_URL ?? DATABASE_URL` (CLI/migrations
  need a session connection). The runtime client ignores this and uses `DATABASE_URL`.
- **pnpm 11** requires `allowBuilds` in `pnpm-workspace.yaml` to run Prisma's postinstall.

## Conventions

- **Scoring is centralized**: `CelebritiesService.recalculatePoints(celebrityId)` is the
  single source of truth, called on celebrity create/update and after bet edits. A death
  scores only bets whose `year` matches the death year; idempotent.
- **Authorization**: `ClerkAuthGuard` (controller-level, verifies JWT) + method-level
  `AdminGuard` (global admin via Clerk `public_metadata.roles` claim — the Clerk session
  token must include `public_metadata`) and `CircleAdminGuard` (circle admin via
  `Membership.role`, maps JWT `sub` → `User.clerkId`).
- Celebrity catalog mutations = global admin only. Circle settings/members = circle admin.

## Front web (`apps/web`)

- **Stack**: Vite + React 19 + TS, **TanStack Router** (file-based routes in `src/routes/`,
  `routeTree.gen.ts` is generated — git-tracked but Biome-ignored), **TanStack Query**,
  Tailwind v4 (`@tailwindcss/vite`), shadcn/ui (new-york), Clerk (`@clerk/clerk-react`).
- **Design system**: ported from the generated mockups in `docs/mockups/` (`necroloto.css`,
  `landing.css`) into `src/styles/globals.css` as a Tailwind v4 `@theme` (neon/arcade tokens:
  `bg-neon`, `text-ink-2`, `border-line`, …). Glow/grain effects live as `--shadow-*`,
  `text-glow-*` `@utility`, the `.neon-surface` wrapper, and `--glow` intensity var. Visual
  reference page: route `/dev/design-system`. Screen markup reference: `docs/mockups/screens/*.js`.
- **Conventions**: one component per file / one file per component; types & interfaces in
  separate files (`*.types.ts` co-located, domain models in `src/types/`). shadcn primitives
  in `src/components/ui/` are re-themed in place. Layout chrome in `src/components/layout/`.
- **Mock data**: screens currently render mock data marked `// TEMP` — to be replaced by a
  typed API client (`src/lib/api/`) + TanStack Query. The API has **no Swagger**, so types
  are hand-written; reuse `@necroloto/shared` enums where possible.
- **Auth**: `ClerkProvider` is mounted **only if** `VITE_CLERK_PUBLISHABLE_KEY` is set (see
  `src/lib/auth/clerk.ts`), so the UI stays previewable without keys. The auth gate lives in
  `src/routes/_app.tsx` (`SignedIn` / `RedirectToSignIn`). Needs `VITE_API_URL` +
  `VITE_CLERK_PUBLISHABLE_KEY` (in `apps/web/.env.local`) and `http://localhost:5173` added
  to the API's `FRONTEND_ORIGIN` to talk to a real backend.
- **Biome**: `css.parser.tailwindDirectives: true` lets Biome parse Tailwind v4 at-rules
  (`@theme`, `@utility`). `routeTree.gen.ts` and `docs/mockups/**` are ignored; `apps/web/
  src/components/ui/**` has a11y rule overrides for vendored shadcn patterns.

## Commit hygiene

Commit **often and in small, coherent steps** — one logical change per commit — so the
history stays a readable thread and any step can be rolled back in isolation.

- Commit as soon as a unit of work builds and its checks pass; don't batch unrelated
  changes into one big commit.
- Write clear messages: `type(scope): summary` (e.g. `feat(api): …`, `chore: …`,
  `fix(shared): …`), with a short body explaining the *why* when it isn't obvious.
- Keep each commit green (build + relevant tests pass) so `git bisect` / rollback stays useful.
- Separate mechanical changes (formatting, renames) from behavioural ones — never mix them
  in the same commit, or diffs become impossible to review and reverts drag in real changes.

## Known debt

- DTOs lack class-validator decorators, so the global `ValidationPipe` runs in
  `transform`-only mode (no `whitelist`). Decorate DTOs to tighten this.
- pg adapter logs a benign `client.query when already executing` deprecation warning.
