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
  `node apps/api/scripts/verify-phase3.mjs`, `verify-auth.mjs`, `verify-storage.mjs`,
  `verify-jobs.mjs` (async job runner — needs `dist/`, i.e. `pnpm --filter necroloto-api build` first).

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
- Celebrity catalog mutations + **season** mutations = global admin only. Circle settings/members
  = circle admin. **Exception**: `POST /celebrities/propose` is open to any authenticated user (see
  "Celebrity proposals"), and `GET /celebrities/wikidata/search` was relaxed to `ClerkAuthGuard`
  (read-only) so the bet-draft proposal flow can search Wikidata.
- **Celebrity proposals (user-submitted, admin-validated)**: `Celebrity.status`
  (`CelebrityStatus` PENDING/APPROVED/REJECTED, **default APPROVED** so legacy/admin-created rows are
  inert) + `proposedBy` (a soft `User.id`, **no FK**) + `proposedAt`. A player adds a missing celebrity
  from the bet draft via `CelebritiesService.propose` (`POST /celebrities/propose`): created PENDING,
  immediately usable in their bet. **Dedup**: a Wikidata pick reuses any existing row for that
  `wikidataId @unique` (refused if that entity is already REJECTED; P2002 race re-fetches the existing
  row, à la `UsersService.create`); a manual entry reuses an exact case-insensitive name match. With a
  `wikidataId` the row is **enriched inline** (`enrich` → dates/photo/role + `recalculatePoints`).
  **Visibility, not scoring**: status governs *who sees* the row, never points — `recalculatePoints` is
  untouched, so a PENDING that dies still scores for its proposer. A PENDING is visible **only to its
  proposer**: `findAll`/`search` filter `OR[{APPROVED},{PENDING, proposedBy: viewer}]`, `findOne` 404s a
  foreign PENDING (admins pass via the `@IsAdminClaim()` decorator), and `deathFeed` is `APPROVED`-only.
  `proposedBy`/`proposedAt` ride **only** the admin payload (`findPage`, which gains a `pending` filter +
  `proposedAt desc` order) — never the public catalogue. Admins validate via `:id/approve` (optional
  Wikidata enrich) / `:id/reject` (kept REJECTED + pulled from every bet, so no bet keeps an unvalidated
  pick). **Merge** (`POST /:sourceId/merge/:targetId`, admin) folds a duplicate into a target: it now
  drops source `CelebritiesOnBet` rows that would collide with the target on the `(betId, celebrityId)`
  PK **before** redirecting the rest, then `recalculatePoints(target)` (the old naive `updateMany` would
  500 on a bet listing both).
- **Seasons drive "the current year"**: a `Season` (`year @unique` + `openDate`/`betStartDate`/
  `betEndDate`/`closeDate`) is configured by global admins. ⚠️ **Betting precedes the season**: a
  season's betting window (`[betStartDate, betEndDate]`) is normally the ~month *before* `openDate`
  (e.g. season 2027: bets Dec 2026, season Jan→Dec 2027). `SeasonsService.getActiveYear()` resolves
  the active season with a **global switch**: (1) the season whose betting window is open now, else
  (2) the season whose `[openDate, closeDate]` contains now, else (3) most recent, else
  `new Date().getUTCFullYear()` — so the whole app (bets rank/position, deaths feed, circle summary,
  web `useSeasonYear`) targets N+1 as soon as N+1's betting opens. **`Bet.year` is unchanged** — one
  season = one calendar year, so scoring (which matches `deathYear === bet.year`) is untouched and
  there is **no `seasonId` FK** on `Bet`. `assertValid` validates the **two windows independently**
  (`betStart ≤ betEnd` and `open ≤ close`, **no cross-window ordering**) and forbids overlap of the
  `[openDate, closeDate]` window only (betting windows may fall in the previous year); duplicate year
  → 409 via the `year @unique` P2002 mapping. The whole thing is a **no-op until a season row exists**
  (fallbacks preserve V1 behaviour), so the migration (`add_season`, additive table-only) is a safe
  prod deploy. ⚠️ DTO dates arrive as **ISO strings** (transform-only `ValidationPipe`) — the service
  coerces with `new Date()`, and `update` merges only the dates actually sent (the DTO carries
  untouched fields as `undefined`, which would otherwise blank the window).
- **Bet locks (phase-based)**: betting happens **before** the season opens, so `BetsService.create` /
  `replaceCelebrities` gate on the **season phase** (`SeasonsService.getSeasonPhase`: `none` / `before`
  / `betting` / `season-open` / `closed`) via `assertCanBet(year, mode, flag)`, not on a single
  betting-window-AND-flag rule. Rule: during `betting` create/edit are **always** allowed (the window
  IS betting time); during `season-open` they need the circle "rallonge" flag (`allowNewBet` to join
  late, `allowEdit` to finish an existing bet); `before`/`closed` → 403; `none` (no season) → V1 compat
  (the flag is the only gate). The front mirrors this from `CircleSummary.seasonPhase` (+ `allowEdit`/
  `allowNewBet`) to drive the draft's read-only banners. ⚠️ this changed `allowNewBet`/`allowEdit`
  semantics: they no longer block during the open betting window.
- **Bet secrecy (server-side)**: other members' picks stay **secret** until the season is revealed
  (`SeasonsService.isRevealed` → `now ≥ openDate`) **and** the circle has `betsVisible`; the viewer
  always sees their own. Enforced in `celebrities.findOne` (fiche bettors), `bets.rankByYearAndCircle`
  (leader roster blanked, ranks/points kept) and `GET /circle/:id/bets` (the "Paris" tab). The viewer
  is resolved from the JWT via the `@CurrentClerkId()` param-decorator (`modules/auth/
  current-user.decorator.ts`) → `User` by `clerkId` (note: `clerkId` not unique → `findFirst`).
- **Async jobs** (`modules/jobs`): long/networked admin work runs **in-process** (no queue infra —
  no Redis), tracked in the `SyncJob` table (status + progress counters + JSON `payload`/`result`).
  `JobsService.enqueueBulkEnrich` creates the row and **fire-and-forgets** the worker (`void
  this.runBulkEnrich(...)`), so `POST /jobs/bulk-enrich` returns a `202` immediately; the front polls
  `GET /jobs/:id`. A **single global `Semaphore`** (hand-rolled — `p-limit` v6 is ESM-only, breaks the
  CJS build) caps concurrent Wikidata `enrich` calls **across all jobs**, so launching several syncs
  at once stays polite. Per-item failures are isolated into `result.errors`. ⚠️ The in-process
  trade-off: a job left `RUNNING`/`PENDING` when the process restarts (Railway redeploy) is
  **reconciled to `FAILED`** on boot (`onApplicationBootstrap`) — there is no resume. Death detection
  (`DeathDetectionService`, daily `@Cron` at 4h + manual `POST /automation/detect-deaths`) is wrapped
  in `JobsService.recordDeathScan` so each run is a `DEATH_SCAN` `SyncJob` — both job types surface on
  the admin `/admin/automation` screen (`GET /jobs`). The bulk-enrich endpoint lives on `JobsController`
  (not `CelebritiesController`) to keep module deps one-directional (`JobsModule` → `CelebritiesModule`).

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
  detail), and admin (`/admin/celebrities/*` — CRUD + Wikidata search/enrich + bulk actions;
  `/admin/seasons/*` — season CRUD). UI aggregates the raw CRUD doesn't expose get dedicated
  endpoints (`GET /circle/user/:id/summary` — returns `allowEdit`/`allowNewBet`, `bettingOpen`,
  `seasonPhase` **and `revealed`**; `GET /circle/:id/bets` for the "Paris" tab (viewer-aware secrecy);
  `GET /celebrities/deaths/feed`; `GET /celebrities/admin/list` for the paginated admin catalogue;
  `DELETE /celebrities/bulk` for bulk delete and `POST /jobs/bulk-enrich` for **async** bulk Wikidata
  sync (see "Async jobs"); `GET /seasons`, `GET /seasons/active`); simpler ones (dashboard score band,
  profile stats) are composed client-side from existing endpoints.
- **Dashboard countdown** (`CountdownCard`, right rail after `BetProgressCard`): a neon J/H/M
  countdown driven **client-side** from `useSeasons()` via `nextCountdownTarget` (`adapters.ts`):
  it targets the **end of betting** (`betEndDate`, coral) when a season's bet window is open now,
  else the **opening of betting** (`betStartDate`, neon) of the nearest upcoming season, else
  renders nothing. The co-located `useCountdown` hook refreshes **every minute** (so seconds are
  intentionally not shown).
- **Season year (web)**: `useSeasonYear()` (active season's `year`, falling back to
  `new Date().getFullYear()` while loading / without a backend) replaces the scattered `CURRENT_YEAR`
  in `/dashboard`, the `/celebrities` draft and the leaderboard; `useSeasonYearTabs()` builds the
  leaderboard's year tabs from the configured seasons (`GET /seasons`) instead of a hardcoded window.
  `CelebrityForm`'s scoring preview keeps `new Date().getFullYear()` (cosmetic only).
- **Admin** (`/admin/celebrities/*`): the catalogue uses `GET /celebrities/admin/list` —
  **server-side** name search, status filter and alphabetical order, paginated and driven by
  `useInfiniteQuery` (infinite scroll). Rows carry checkboxes (+ a select-all header) feeding a
  floating `BulkActionBar` for **bulk delete** (`DELETE /celebrities/bulk`) and **bulk Wikidata
  sync** (`POST /jobs/bulk-enrich` — **async job**, see "Async jobs"; `BulkActionBar` shows live
  `processed/total` from the polled job, recap toast on completion); results surface via sonner
  toasts. Only the **per-row "Recalculer" button stays decorative**
  (recalc is automatic on update server-side). The form sends ISO dates; `wikidataId` is set only
  via `POST /celebrities/:id/enrich` (no field on the create/update DTOs), reached through the
  `WikidataSearchDialog`. The status filter gains an **"En attente"** tab (`status=pending`); pending
  rows show the proposal badge and swap their edit/recalc actions for **approve / reject / verify-on-
  Wikidata / merge** (`useApproveCelebrity`/`useRejectCelebrity`/`useMergeCelebrities`; see "Celebrity
  proposals"). Merge opens `MergeCelebrityDialog` (search the approved catalogue for the target).
  Photo upload (`POST /celebrities/:id/photo`, multipart) is **not wired
  yet** — the client only does JSON. **Responsive**: the catalogue is a dense `CelebrityTable`
  (`hidden md:block`, widened Statut/Actions tracks so a pending row's two badges + four actions fit)
  on desktop, swapped for a stacked `CelebrityCard` list (`md:hidden`, large touch targets, labelled
  approve/reject buttons) on mobile; the `CatalogToolbar` stacks (full-width search, horizontally
  scrollable filter pills via the `no-scrollbar` utility) and the `BulkActionBar` lets its buttons take
  a full-width row below `sm`. All `/admin/*` routes are gated by the `_app/admin.tsx` layout
  route on the Clerk `public_metadata.roles` admin claim (mirrors the API `AdminGuard`); non-admins
  get the `AdminForbidden` screen. The gate is bypassed when Clerk is unconfigured (previewable dev).
- **Admin — Seasons** (`/admin/seasons/*`): list + create/edit on the `SeasonForm` component
  (`year`, optional `name`, four `datetime-local` dates with a client-side ordering check; server is
  the authority — overlap/ordering/duplicate-year errors surface via sonner toasts). The list shows a
  date-derived status badge (`upcoming` / `open` / `bets-open` / `closed`, via `seasonStatus` in
  `adapters.ts`). Reached from a dedicated admin rail link in `SideNav`; `AdminHeader` takes a
  `section` prop for the breadcrumb. Same admin gate as the celebrities screens.
- **Admin — Automation** (`/admin/automation`): history of recent jobs (`useRecentJobs` → `GET /jobs`,
  refetched every 5s) — both `WIKIDATA_BULK_ENRICH` and `DEATH_SCAN` rows, with a status badge
  (`SYNC_JOB_STATUS_*` labels/tones in `types/job.ts`) and a per-type summary. A "Lancer le scan"
  button triggers `useDetectDeaths` (`POST /automation/detect-deaths`). The catalogue's bulk sync polls
  via `useSyncJob(jobId)` (refetch ~1.5s until terminal). Dedicated admin rail link (`Bot` icon),
  same admin gate.
- **Bet model**: a bet is unique per `(userId, circleId, year)` — in practice one bet per user per
  season. The `/celebrities` draft is "Mon pari": it edits the bet of the **selected circle** (a
  circle selector defaults to the bet's circle, or the user's first), seeding the celebrity
  selection from it and saving via `POST /bets` (create) or `PATCH /bets/:id/celebrities` (replace,
  ≥1 celebrity required). The draft caps selection at `MAX_BET_CELEBRITIES` (50, a shared constant
  in `queries.ts`; client-side only — the API enforces no cap yet, per-circle config is in
  `docs/ROADMAP.md`). **Deceased celebrities are hidden** from the draft grid, and the draft is
  **read-only** (cards + validate disabled, with a phase-specific banner) driven by
  `CircleSummary.seasonPhase` + `allowEdit`/`allowNewBet` (see "Bet locks": free during `betting`,
  flag-gated in `season-open`, locked `before`/`closed`). The fiche's bettors list is gated
  server-side (see "Bet secrecy") and still narrowed client-side to the viewer's circles. An
  **"Ajouter une célébrité"** button (hidden when locked) opens `ProposeCelebrityDialog`
  (`components/celebrities/`): a two-step flow — Wikidata search first (reuses `useWikidataSearch`),
  manual fallback ("je ne trouve pas") — calling `useProposeCelebrity`; the returned id is added
  straight to the selection and pending cards carry an "En attente" badge (`proposalStatus` on the
  `CelebritySummary`, an axis **orthogonal** to alive/deceased). See "Celebrity proposals".
- **Celebrity fiche** (`/celebrities/$id`, `useCelebrity` → `GET /celebrities/:id`): a **read-only
  public detail** open to any authenticated user (not admin-gated). Reached by clicking a celebrity
  in `LeaderPicksCard` (so from **both** the "Paris" tab and the leaderboard — one shared component)
  and via an **"Eye" action** on each approved row of the admin catalogue (`CelebrityRow` /
  `CelebrityCard`). Shows the portrait (Wikidata `photo` over the gradient, monogram fallback —
  `CelebrityPortrait` gained a `photo` prop), Wikidata facts (role/category/birth/age), a `PointsHero`
  (awarded vs potential, on the **active season** via `useSeasonYear`), and **"Qui a parié dessus"
  grouped by season** ("Cette saison" first, then past years desc — `Bettor.year` carried from
  `bet.year`; the API already returns every year). Bettors are gated server-side (see "Bet secrecy")
  then narrowed to the viewer's circles. The back button uses `router.history.back()` when there is
  history (returns to the originating circle leaderboard), falling back to the catalogue link on a
  direct/deep-link load (`useCanGoBack`). Photo upload still isn't wired; in local dev the `photo`
  URLs may 404 (Storage not cloned). Global search will later reuse this same screen.
- **"Paris" tab** (`/circles/$id/bets`, `useCircleBets` → `GET /circle/:id/bets`): lists every
  member's bet for the selected season; before reveal (or with `betsVisible` off) the server returns
  only the viewer's own bet and the page shows a "secret" banner. The leaderboard's `LeaderPicksCard`
  is likewise hidden behind a "Paris secrets" card until `isSeasonRevealed(season) && betsVisible`
  (`adapters.ts`). New circles default to **`betsVisible` on, `allowEdit` off** (`change_circle_setting_defaults`
  migration). "Mises visibles" only applies once the season is open; "Liste modifiable" only during
  the open season (a straggler "rallonge") — both re-copywrited in the circle settings screen.
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
