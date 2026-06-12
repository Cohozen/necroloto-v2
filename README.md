# Necroloto V2

Jeu de pronostics entre amis : chaque 31 décembre, on liste des célébrités
susceptibles de mourir l'année suivante. Un décès rapporte des points (1 à 5,
**plus la personne est jeune, plus ça rapporte**). On joue en « cercles » (groupes).

Cette V2 reconstruit le projet sur une base propre et découplée, prête pour une
app mobile : une **API NestJS** comme backend unique, **Supabase** (Postgres +
storage), **Clerk** pour l'authentification, et un front web à venir.

## Architecture

```
Front web (à venir, Vite/React)  ─┐
App mobile (à venir, Expo)        ─┼── HTTP ──▶  API NestJS  ──Prisma──▶ Supabase Postgres
                                   ┘               │                     Supabase Storage (images)
                                                   ├─ Clerk (vérif JWT)
                                                   └─ (à venir) jobs Wikidata : décès + enrichissement
```

- **Backend = cerveau unique** : toute la logique métier (scoring, classements,
  autorisations) vit dans l'API. Web et mobile ne feront que la consommer.
- **Auth** : Clerk (conservé de la V1).
- **Données** : Supabase Postgres (migré depuis Neon), accès via Prisma.

## Structure du monorepo

```
necroloto-v2/
├── apps/
│   └── api/            # API NestJS (voir apps/api/DEPLOY.md)
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

## Démarrage

```bash
pnpm install

# Configurer l'API
cp apps/api/.env.example apps/api/.env   # puis remplir les valeurs

# Lancer l'API en dev
pnpm --filter necroloto-api start:dev
```

Variables d'environnement : voir [apps/api/.env.example](apps/api/.env.example)
(connexions Supabase pooler, clés Clerk, storage).

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
