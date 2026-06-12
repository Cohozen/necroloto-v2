# CLAUDE.md

Guidance for working in this repo. Read alongside [README.md](README.md).

## What this is

Necroloto V2 — a "celebrity death pool" game. Monorepo (pnpm + Turborepo):

- `apps/api` — **NestJS API, the single backend brain**. All business logic lives here.
- `packages/shared` — `@necroloto/shared`: scoring (`calculPointByCelebrity`, `deathYear`, UTC-based) and enums. Built with `tsc`, consumed by the API.
- Front web (Vite/React/TanStack/shadcn) and mobile (Expo) are planned, not built yet.

Stack: NestJS 11, Prisma 7 (pg adapter), Supabase Postgres + Storage, Clerk auth.

## Commands

- `pnpm build` — Turbo build (shared → api). API build = `prisma generate && nest build`.
- `pnpm --filter necroloto-api start:dev` — run the API locally.
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

## Known debt

- DTOs lack class-validator decorators, so the global `ValidationPipe` runs in
  `transform`-only mode (no `whitelist`). Decorate DTOs to tighten this.
- pg adapter logs a benign `client.query when already executing` deprecation warning.
