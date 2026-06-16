# Necroloto V2

Jeu de pronostics entre amis : chaque 31 décembre, on liste des célébrités
susceptibles de mourir l'année suivante. Un décès rapporte des points (1 à 5,
**plus la personne est jeune, plus ça rapporte**). On joue en « cercles » (groupes).

Cette V2 reconstruit le projet sur une base propre et découplée, prête pour une
app mobile : une **API NestJS** comme backend unique, **Supabase** (Postgres +
storage), **Clerk** pour l'authentification, et un **front web** (Vite/React,
en cours — UI construite, API branchée sur presque tous les écrans : cercles,
dashboard, profil, célébrités/paris ; seul l'admin reste en données mock).

## Architecture

```
Front web (Vite/React, en cours)  ─┐
App mobile (à venir, Expo)         ─┼── HTTP ──▶  API NestJS  ──Prisma──▶ Supabase Postgres
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
├── Dockerfile          # build de l'API (contexte = racine)
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

```bash
pnpm install

# Stack Supabase locale (Postgres + Storage en Docker) — ne dev jamais contre la prod
colima start                       # démarrer le moteur Docker
cd apps/api && supabase start      # démarrer la stack (URLs/clés via `supabase status`)
pnpm exec prisma migrate deploy    # appliquer le schéma à la base locale
cd ../..

# Configurer l'API (le .env est déjà câblé sur le local après `supabase start`)
# cp apps/api/.env.example apps/api/.env   # uniquement pour repartir du modèle prod/cloud

# Lancer l'API en dev
pnpm --filter necroloto-api start:dev

# Lancer le front web en dev (port 5173)
pnpm --filter necroloto-web dev
```

Variables d'environnement : voir [apps/api/.env.example](apps/api/.env.example).
La procédure de dev local (env local vs prod, clone des données de prod, mise en
garde sur les fichiers Storage) est détaillée dans la section « Local dev environment »
de [CLAUDE.md](CLAUDE.md). Pour le front (au branchement API) : `apps/web/.env.local`
avec `VITE_API_URL` et `VITE_CLERK_PUBLISHABLE_KEY`.

### Variante Docker (API + web conteneurisés)

Pour lancer l'app (API :3000 + web :5173) en conteneurs **hot-reload** plutôt qu'en
natif, le tout branché sur la même stack Supabase CLI :

```bash
colima start
cd apps/api && supabase start && supabase status   # récupérer SUPABASE_SECRET_KEY
cd ../..
cp .env.docker.example .env.docker                 # puis remplir les secrets
pnpm docker:up                                     # docker compose up --build
```

Le conteneur API exécute `prisma generate` + `migrate deploy` au démarrage. Rebuild
de l'image seulement si `package.json`/lockfile changent. `pnpm docker:down` pour
arrêter. ⚠️ En mode Docker, `SUPABASE_URL` vaut `host.docker.internal:54321`, donc les
URLs publiques d'images générées contiennent ce hôte (non résolu par le navigateur) —
sans impact sur les tranches branchées, mais pour bosser sur les photos de célébrités,
lancer l'API en natif.

## Commandes (racine)

| Commande | Effet |
|---|---|
| `pnpm build` | Build de tous les packages (Turbo, ordre des dépendances) |
| `pnpm test` | Tests |
| `pnpm lint` | Analyse Biome (lecture seule) |
| `pnpm format` | Formatage Biome (écriture) |
| `pnpm check` | Biome lint + fixes sûrs |

## Règles de score

`points = f(âge au décès)` : ≥85 → 1, ≥75 → 2, ≥65 → 3, ≥55 → 4, sinon 5.
Un décès ne rapporte qu'aux paris **de l'année du décès**. Source de vérité :
[`packages/shared/src/scoring.ts`](packages/shared/src/scoring.ts).

## Déploiement

API sur Railway via Docker — procédure complète dans
[apps/api/DEPLOY.md](apps/api/DEPLOY.md). Déclenché par un push sur `main`.
