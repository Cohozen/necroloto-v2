# Necroloto V2

Jeu de pronostics entre amis : chaque 31 décembre, on liste des célébrités
susceptibles de mourir l'année suivante. Un décès rapporte des points (1 à 5,
**plus la personne est jeune, plus ça rapporte**). On joue en « cercles » (groupes).

Cette V2 reconstruit le projet sur une base propre et découplée, prête pour une
app mobile : une **API NestJS** comme backend unique, **Supabase** (Postgres +
storage), **Clerk** pour l'authentification, et un **front web** (Vite/React)
dont **tous les écrans sont branchés à l'API** (cercles, dashboard, profil,
célébrités/paris, et l'administration du catalogue). L'app mobile (Expo) reste à venir.

## Architecture

```
Front web (Vite/React)      ─┐
App mobile (à venir, Expo)  ─┼── HTTP ──▶  API NestJS  ──Prisma──▶ Supabase Postgres
                             ┘               │                     Supabase Storage (images)
                                             ├─ Clerk (vérif JWT)
                                             └─ jobs Wikidata : décès + enrichissement
```

- **Backend = cerveau unique** : toute la logique métier (scoring, classements,
  autorisations) vit dans l'API. Web et mobile ne feront que la consommer.
- **Auth** : Clerk (conservé de la V1).
- **Données** : Supabase Postgres (migré depuis Neon), accès via Prisma.

## Structure du monorepo

```
necroloto-v2/
├── apps/
│   ├── api/            # API NestJS (voir apps/api/DEPLOY.md)
│   └── web/            # Front web (Vite + React + Tailwind v4 + shadcn)
├── docs/
│   ├── mockups/        # design system néon/arcade généré (source du thème web)
│   └── front-web-pages.md  # navigation V2 + écrans
├── packages/
│   └── shared/         # @necroloto/shared : scoring + enums partagés
├── Dockerfile          # build de l'API pour la prod (contexte = racine, déployé sur Railway)
├── Dockerfile.dev      # image hot-reload pour la variante Docker locale (API + web)
├── docker-compose.yml  # stack dev conteneurisée (API + web), voir « Démarrage » 2B
├── railway.json        # déploiement Railway
├── biome.json          # lint + format (Biome)
└── turbo.json          # orchestration des builds
```

## Prérequis

- Node ≥ 20
- pnpm 11 (`corepack enable pnpm`)
- Pour le dev local de l'API : un moteur Docker (ex. [Colima](https://github.com/abiosoft/colima))
  + la [Supabase CLI](https://supabase.com/docs/guides/cli) — voir « Démarrage » ci-dessous.

## Démarrage

> **Important** — on développe toujours contre une stack **Supabase locale**, jamais
> contre la prod. Cette stack tourne **sur la machine hôte** via la Supabase CLI (dans
> Docker/Colima), que l'app soit ensuite lancée en natif **ou** en conteneurs.

### 1. Installer + démarrer Supabase en local (étape commune)

```bash
pnpm install
colima start                                    # démarrer le moteur Docker (ne s'auto-lance pas)
supabase start --workdir apps/api               # Postgres + Storage locaux ; clés via `supabase status`
pnpm --filter necroloto-api exec prisma migrate deploy   # appliquer le schéma à la base locale
```

`supabase status` affiche les URLs et clés locales (notamment `SUPABASE_SECRET_KEY`)
dont tu auras besoin ci-dessous. `supabase stop` pour arrêter la stack.

### 2A. Lancer l'app en natif (recommandé)

Crée les deux fichiers d'env locaux (gitignorés), puis lance API + web :

```bash
# API — pointer sur le Supabase local
cp apps/api/.env.example apps/api/.env
#   DATABASE_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres
#   DIRECT_URL=postgresql://postgres:postgres@127.0.0.1:54322/postgres   (pas de pooler en local)
#   SUPABASE_URL=http://127.0.0.1:54321
#   SUPABASE_SECRET_KEY=<sb_secret_... depuis `supabase status`>
#   CLERK_JWT_KEY / CLERK_SECRET_KEY=<instance Clerk dev>

# Web — apps/web/.env.local
#   VITE_API_URL=http://localhost:3000
#   VITE_CLERK_PUBLISHABLE_KEY=<pk_... instance Clerk dev>   (optionnel : sans clé, l'UI reste prévisualisable sans auth)

pnpm --filter necroloto-api start:dev     # API sur :3000
pnpm --filter necroloto-web dev           # web sur :5173
```

### 2B. Lancer l'app en conteneurs (variante Docker)

Alternative à 2A : l'**API (:3000) et le web (:5173)** tournent en conteneurs
**hot-reload**, branchés sur la **même** Supabase locale de l'étape 1. Supabase n'est
pas conteneurisé ici — les conteneurs joignent l'hôte via `host.docker.internal` (et
**non** `127.0.0.1`, qui désignerait le conteneur lui-même), d'où un fichier d'env dédié :

```bash
cp .env.docker.example .env.docker        # puis y coller SUPABASE_SECRET_KEY (et les clés Clerk)
pnpm docker:up                            # docker compose up --build
pnpm docker:down                          # arrêter   ·   pnpm docker:logs pour suivre
```

Le conteneur API exécute `prisma generate` + `migrate deploy` à son démarrage ; l'image
n'est rebuildée que si `package.json`/lockfile changent. ⚠️ Comme `SUPABASE_URL` vaut
`http://host.docker.internal:54321`, les URLs publiques d'images générées contiennent ce
hôte (non résolu par le navigateur) — sans impact sur le reste, mais pour bosser sur les
**photos de célébrités**, lance plutôt l'API en natif (2A).

---

Référence des variables : [apps/api/.env.example](apps/api/.env.example) (API) et
[.env.docker.example](.env.docker.example) (variante Docker). La procédure complète de dev
local (env local vs prod, clone des données de prod, mise en garde sur les fichiers Storage)
est détaillée dans la section « Local dev environment » de [CLAUDE.md](CLAUDE.md).

## Commandes (racine)

| Commande | Effet |
|---|---|
| `pnpm build` | Build de tous les packages (Turbo, ordre des dépendances) |
| `pnpm dev` | Lance les serveurs de dev (Turbo) |
| `pnpm test` | Tests |
| `pnpm lint` | Analyse Biome (lecture seule) |
| `pnpm format` | Formatage Biome (écriture) |
| `pnpm check` | Biome lint + fixes sûrs |
| `pnpm docker:up` / `docker:down` / `docker:logs` | Variante Docker locale (cf. « Démarrage » 2B) |

## Règles de score

`points = f(âge au décès)` : ≥85 → 1, ≥75 → 2, ≥65 → 3, ≥55 → 4, sinon 5.
Un décès ne rapporte qu'aux paris **de l'année du décès**. Source de vérité :
[`packages/shared/src/scoring.ts`](packages/shared/src/scoring.ts).

## Déploiement

API sur Railway via Docker — procédure complète dans
[apps/api/DEPLOY.md](apps/api/DEPLOY.md). Déclenché par un push sur `main`.
