# CLAUDE.md

Guidance for working in this repo. Read alongside [README.md](README.md).

## What this is

Necroloto V2 — a "celebrity death pool" game. Monorepo (pnpm + Turborepo):

- `apps/api` — **NestJS API, the single backend brain**. All business logic lives here.
- `apps/web` — **front web** (Vite + React 19 + TS, TanStack Router/Query, Tailwind v4 +
  shadcn, Clerk). All mockup screens built and **wired to the API** via a typed client
  in `src/lib/api/` (circles, dashboard, profile, celebrities catalogue/draft + detail, and
  admin). See the "Front web" section below.
- `packages/shared` — `@necroloto/shared`: scoring (`calculPointByCelebrity`, `deathYear`, UTC-based)
  and enums. Built with `tsc`, consumed by the API **and the web** (the web imports the subpath
  `@necroloto/shared/scoring` — see the Front web gotcha).
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

## Local dev environment

Develop against a **local Supabase stack**, never prod. Prod config stays as-is
(Railway env vars + prod Supabase project); only `apps/api/.env` differs locally.

- **Prereqs**: a Docker engine (we use **Colima** — `colima start` / `colima stop`,
  it does not auto-start at login) + the **Supabase CLI** (`brew install supabase/tap/supabase`).
- **Bring it up**: `cd apps/api && supabase start` (config in `supabase/config.toml`;
  analytics/vector is disabled there — its container can't mount the Docker socket
  under Colima). `supabase status` prints the local URLs/keys. `supabase stop` to tear down.
- **Env split**: prod values live in `apps/api/.env.production.local` (gitignored);
  `apps/api/.env` points at local — DB `postgresql://postgres:postgres@127.0.0.1:54322/postgres`
  (both `DATABASE_URL` and `DIRECT_URL`, no pooler), `SUPABASE_URL=http://127.0.0.1:54321`,
  local `SUPABASE_SECRET_KEY` from `supabase status`. The runtime loads `.env` via
  `import 'dotenv/config'` at the top of `main.ts` (Railway sets real env vars, no `.env`
  file → dotenv is a no-op there).
- **Schema**: `pnpm exec prisma migrate deploy` (from `apps/api`) applies migrations to
  the local DB. Prisma migrations remain the single source of truth for the schema.
- **Clone prod data**: `apps/api/scripts/clone-prod-to-local.sh` dumps prod *data only*
  (schema stays Prisma-owned) and loads it locally. **Storage files (images) are NOT
  copied** — only DB rows; `storage.objects` will point at missing files. The dump
  contains real user data — keep it out of git.
- **Docker variant** (optional, for the app itself): `docker-compose.yml` +
  `Dockerfile.dev` run the **API (:3000) and web (:5173) in hot-reload containers**,
  wired to the *same* host Supabase CLI stack via `host.docker.internal`. `pnpm docker:up`
  (build + up), `pnpm docker:down`. Env lives in root `.env.docker` (copy from
  `.env.docker.example`; uses `host.docker.internal` hosts, **not** `127.0.0.1`). The API
  container runs `prisma generate` + `migrate deploy` on start. `node_modules` and
  `apps/api/generated` are **container-owned anonymous volumes** (the host's macOS binaries
  must not shadow the container's linux ones). The dev image needs `apps/web`, which the
  root `.dockerignore` excludes — hence the dedicated `Dockerfile.dev.dockerignore`.
  ⚠️ With `SUPABASE_URL=host.docker.internal:54321`, `getPublicUrl` bakes that host into
  image URLs (unreachable from the browser); fine for the wired slices, but run the API
  natively for celebrity-photo work.

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
- **Bet locks**: `BetsService.create` / `replaceCelebrities` enforce the circle's flags —
  `ForbiddenException` when `allowNewBet=false` (new bet) or `allowEdit=false` (edit a bet's
  celebrities). This is the real guard behind the draft's read-only mode.

## Front web (`apps/web`)

- **Stack**: Vite + React 19 + TS, **TanStack Router** (file-based routes in `src/routes/`,
  `routeTree.gen.ts` is generated — git-tracked but Biome-ignored), **TanStack Query**,
  Tailwind v4 (`@tailwindcss/vite`), shadcn/ui (new-york), Clerk (`@clerk/clerk-react`).
- **Design system**: ported from the generated mockups in `docs/mockups/` (`necroloto.css`,
  `landing.css`) into `src/styles/globals.css` as a Tailwind v4 `@theme` (neon/arcade tokens:
  `bg-neon`, `text-ink-2`, `border-line`, …). Glow/grain effects live as `--shadow-*`,
  `text-glow-*` `@utility`, the `.neon-surface` wrapper, and `--glow` intensity var. Screen
  markup reference: `docs/mockups/screens/*.js`.
- **Conventions**: one component per file / one file per component; types & interfaces in
  separate files (`*.types.ts` co-located, domain models in `src/types/`). shadcn primitives
  in `src/components/ui/` are re-themed in place. Layout chrome in `src/components/layout/`.
- **App chrome**: avatars render the **neon-gradient initials fallback only** (the Clerk photo is
  not used); the account avatar lives in the mobile top bar (`UserMenu`, dropdown) and at the bottom
  of the desktop side rail (no dropdown). The desktop year selector was removed. A sonner `Toaster`
  is mounted in `routes/__root.tsx` for app-wide toasts. Enabled buttons get `cursor: pointer` via a
  base rule in `globals.css`.
- **API client** (`src/lib/api/`): a Clerk-authenticated fetch wrapper (`client.ts` — Bearer
  token, `ApiError`) provided via `ApiClientProvider`/`context.ts` (anonymous variant when Clerk
  is unconfigured, so the UI stays previewable); hand-written DTOs (`types.ts` — the API has **no
  Swagger**; reuse `@necroloto/shared` enums), centralized `queryKeys` (`keys.ts`), TanStack Query
  hooks (`queries.ts`), and `Api*→UI` adapters (`adapters.ts`). The Clerk user is resolved to a DB
  `User` row and **provisioned on first sign-in** by `CurrentUserProvider` (GET `/users/clerk/:id`,
  POST `/users` on miss); read it via `useCurrentUser()`. Reuse this pattern for new slices.
  ⚠️ `POST /users` (`UsersService.create`) is **idempotent**: it returns the existing row for a
  known `clerkId`, or **relinks the `clerkId` onto the row matching the email** (email is
  `@unique`, `clerkId` is not) — so a verified email signing in under a new `clerkId` (prod row
  cloned locally, Clerk instance migration) reconciles instead of hitting the unique(email)
  constraint. Adding `@unique` on `User.clerkId` (after dedup) is tracked in `docs/ROADMAP.md`.
  ⚠️ Nest serializes a `null` handler return as an **empty body** — `client.ts` returns `null`
  (not `undefined`) on 204/empty, else TanStack Query throws "query data cannot be undefined".
- **Wired vs mock**: every screen is wired — circles (`/circles` hub, `/circles/new`,
  `/circles/join`, leaderboard `/circles/$id`, `/circles/$id/settings`, `/circles/$id/members`),
  `/dashboard`, `/profile`, celebrities (`/celebrities` catalogue + bet draft, `/celebrities/$id`
  detail), and admin (`/admin/celebrities/*` — CRUD + Wikidata search/enrich + bulk actions). UI
  aggregates the raw CRUD doesn't expose get dedicated endpoints (`GET /circle/user/:id/summary` —
  now also returns `allowEdit`/`allowNewBet`; `GET /celebrities/deaths/feed`; `GET
  /celebrities/admin/list` for the paginated admin catalogue; `DELETE /celebrities/bulk` and `POST
  /celebrities/bulk/enrich` for bulk admin actions); simpler ones (dashboard score band, profile
  stats) are composed client-side from existing endpoints.
- **Admin** (`/admin/celebrities/*`): the catalogue uses `GET /celebrities/admin/list` —
  **server-side** name search, status filter and alphabetical order, paginated and driven by
  `useInfiniteQuery` (infinite scroll). Rows carry checkboxes (+ a select-all header) feeding a
  floating `BulkActionBar` for **bulk delete** (`DELETE /celebrities/bulk`) and **bulk Wikidata
  sync** (`POST /celebrities/bulk/enrich`, sequential server-side loop, per-item failures isolated);
  results surface via sonner toasts. Only the **per-row "Recalculer" button stays decorative**
  (recalc is automatic on update server-side). The form sends ISO dates; `wikidataId` is set only
  via `POST /celebrities/:id/enrich` (no field on the create/update DTOs), reached through the
  `WikidataSearchDialog`. Photo upload (`POST /celebrities/:id/photo`, multipart) is **not wired
  yet** — the client only does JSON. All `/admin/*` routes are gated by the `_app/admin.tsx` layout
  route on the Clerk `public_metadata.roles` admin claim (mirrors the API `AdminGuard`); non-admins
  get the `AdminForbidden` screen. The gate is bypassed when Clerk is unconfigured (previewable dev).
- **Bet model**: a bet is unique per `(userId, circleId, year)` — in practice one bet per user per
  season. The `/celebrities` draft is "Mon pari": it edits the bet of the **selected circle** (a
  circle selector defaults to the bet's circle, or the user's first), seeding the celebrity
  selection from it and saving via `POST /bets` (create) or `PATCH /bets/:id/celebrities` (replace,
  ≥1 celebrity required). The draft caps selection at `MAX_BET_CELEBRITIES` (50, a shared constant
  in `queries.ts`; client-side only — the API enforces no cap yet, per-circle config is in
  `docs/ROADMAP.md`). **Deceased celebrities are hidden** from the draft grid, and the draft is
  **read-only** (cards + validate disabled, with a banner) when the selected circle is locked —
  `allowEdit=false` for an existing bet, `allowNewBet=false` for a first bet (both surfaced in the
  circle summary and enforced server-side, see "Bet locks"). The fiche's bettors list is filtered
  client-side to the viewer's circles.
- ⚠️ **`@necroloto/shared` is CommonJS** (`"type": "commonjs"`). Its barrel `index.js` uses
  `__exportStar`, which rollup/esbuild can't statically analyze → the web imports the subpath
  `@necroloto/shared/scoring` (a single-file module with direct named exports). `vite.config.ts`
  needs `optimizeDeps.include: ['@necroloto/shared/scoring']` (dev) **and**
  `build.commonjsOptions.include: [/node_modules/, /packages\/shared/]` (build — the workspace dep
  is linked outside `node_modules`, so rollup's commonjs transform must be told to cover it).
- **Auth**: `ClerkProvider` is mounted **only if** `VITE_CLERK_PUBLISHABLE_KEY` is set (see
  `src/lib/auth/clerk.ts`), so most of the UI stays previewable without keys. The auth gate lives in
  `src/routes/_app.tsx` (`SignedIn` / `RedirectToSignIn`). Needs `VITE_API_URL` +
  `VITE_CLERK_PUBLISHABLE_KEY` (in `apps/web/.env.local`) and `http://localhost:5173` added
  to the API's `FRONTEND_ORIGIN` to talk to a real backend. A dedicated **e2e test account**
  (password login on the Clerk dev instance) lives in `apps/web/.env.test.local` (gitignored), as
  `LOGIN_TEST` / `PASSWORD_TEST` — use it to sign in when driving the authenticated browser preview.
- **Custom auth forms** (no Clerk widget): `/sign-in`, `/sign-up`, `/forgot-password` render
  hand-built forms in `src/components/auth/` (`SignInForm`/`SignUpForm`/`ForgotPasswordForm`)
  driven by the headless `useSignIn`/`useSignUp` hooks; Google SSO uses `authenticateWithRedirect`
  (helper in `auth/sso.ts`) returning to the `/sso-callback` route (`AuthenticateWithRedirectCallback`).
  All sit inside the marketing `AuthLayout` shell. Shared bits: `AuthField` (icon input + password
  reveal), `GoogleButton`, `AuthFeedback` (`getClerkErrorMessage` + coral `AuthErrorBanner` +
  `AuthFormLoader`). Sign-up is **email + password only, no OTP** (assumes the Clerk instance does not
  require email verification — non-`complete` status surfaces an error). Forgot-password is a 2-phase
  `reset_password_email_code` flow (request code → OTP via the restyled `ui/input-otp` + new password).
  ⚠️ Unlike the rest of the app, these routes **require Clerk keys** — without `ClerkProvider` the
  `useSignIn`/`useSignUp` hooks throw (there is no dev fallback anymore). `main.tsx` sets
  `signInUrl`/`signUpUrl` + `signInFallbackRedirectUrl`/`signUpFallbackRedirectUrl="/dashboard"` on
  `ClerkProvider`. The old prebuilt-widget approach (`clerkAppearance`, `AuthDevNotice`) is gone.
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
