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
> Docker/Colima).

### 1. Installer + démarrer Supabase en local (étape commune)

```bash
pnpm install
colima start                                    # démarrer le moteur Docker (ne s'auto-lance pas)
supabase start --workdir apps/api               # Postgres + Storage locaux ; clés via `supabase status`
pnpm --filter necroloto-api exec prisma migrate deploy   # appliquer le schéma à la base locale
```

`supabase status` affiche les URLs et clés locales (notamment `SUPABASE_SECRET_KEY`)
dont tu auras besoin ci-dessous. `supabase stop` pour arrêter la stack.

### 2. Lancer l'app en natif

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

---

### Données de prod en local (optionnel)

`supabase start` démarre une base **vide** (le schéma est appliqué par `prisma migrate
deploy`). Pour travailler sur de vraies données, clone les données de prod :

```bash
apps/api/scripts/clone-prod-to-local.sh
```

Prérequis : le `DIRECT_URL` de prod dans `apps/api/.env.production.local`. Le script copie
**uniquement les lignes de la base** — **pas les fichiers Storage** (images), donc les URLs
photo pointeront vers des fichiers absents en local. Les données **persistent** dans le volume
Docker entre `supabase stop`/`start` : c'est un instantané figé à la date du dernier clone.

Pour **rafraîchir** depuis la prod, repars d'une base vide (le clone charge par-dessus
l'existant, sans purge) :

```bash
supabase stop --no-backup                                 # ⚠️ supprime le volume de données local
supabase start --workdir apps/api
pnpm --filter necroloto-api exec prisma migrate deploy
apps/api/scripts/clone-prod-to-local.sh
```

> `supabase db reset` n'est pas adapté ici : le schéma est géré par les migrations **Prisma**,
> pas par `supabase/migrations`.

Référence des variables : [apps/api/.env.example](apps/api/.env.example). La procédure complète
de dev local (env local vs prod, clone des données de prod, mise en garde sur les fichiers
Storage) est détaillée dans la section « Local dev environment » de [CLAUDE.md](CLAUDE.md).

## Commandes (racine)

| Commande | Effet |
|---|---|
| `pnpm build` | Build de tous les packages (Turbo, ordre des dépendances) |
| `pnpm dev` | Lance les serveurs de dev (Turbo) |
| `pnpm test` | Tests |
| `pnpm lint` | Analyse Biome (lecture seule) |
| `pnpm format` | Formatage Biome (écriture) |
| `pnpm check` | Biome lint + fixes sûrs |

## Règles de score

`points = f(âge au décès)` : ≥85 → 1, ≥75 → 2, ≥65 → 3, ≥55 → 4, sinon 5.
Un décès ne rapporte qu'aux paris **de l'année du décès**. Source de vérité :
[`packages/shared/src/scoring.ts`](packages/shared/src/scoring.ts).

Le recalcul est **centralisé et idempotent** : `CelebritiesService.recalculatePoints(id)`
est l'unique source de vérité, rejouée à chaque création/édition d'une célébrité et après
chaque modification de paris. Un décès ne score que les paris dont l'année correspond à
l'année du décès.

## Automatisations backend (crons, Wikidata, jobs)

Le backend n'a **aucune infra de queue** (pas de Redis/BullMQ) : tout tourne **in-process**
dans le conteneur API. Trois briques se combinent.

### Wikidata (`modules/wikidata`)

Client **lecture seule** de l'API Wikidata (`www.wikidata.org/w/api.php`), **sans clé API**,
avec un `User-Agent` descriptif (exigé par Wikidata). Il sert à deux choses :

- **Recherche** par nom (`wbsearchentities`, FR) et récupération d'entités par Q-id
  (`wbgetentities`, batché par 50), parsées en `WikidataSummary` (libellé, description,
  naissance P569, décès P570, photo Commons P18, métiers P106, `instance of human` P31=Q5).
  Les humains sont remontés en tête des résultats.
- **Enrichissement** d'une fiche (`CelebritiesService.enrich`) : remplit naissance / décès /
  rôle (1er métier P106 résolu en libellé FR) / photo, et stocke le `wikidataId` lié. Les
  valeurs Wikidata priment, les valeurs manquantes ne sont pas écrasées ; **ré-exécutable** et
  suivi d'un `recalculatePoints` (un décès peut être nouvellement connu). La **photo Commons
  est ré-hébergée** dans le bucket Supabase Storage (repli sur l'URL Commons si Storage est
  désactivé ou si le téléchargement échoue).

### Tâches planifiées (`@nestjs/schedule`, `ScheduleModule.forRoot()`)

Deux crons quotidiens (heure du serveur), volontairement décalés :

| Cron | Heure | Service | Rôle |
|---|---|---|---|
| `EVERY_DAY_AT_4AM` | 4 h | `DeathDetectionService` (`modules/automation`) | **Détection des décès** : interroge Wikidata pour toutes les célébrités *suivies mais vivantes* (`wikidataId != null` et `death == null`), enregistre les nouveaux décès, rescore et émet l'event `celebrity.died`. Idempotent. |
| `0 5 * * *` | 5 h | `SeasonSchedulerService` (`modules/seasons`) | **Jalons de saison** : transforme les transitions de dates en events. Curseur monotone `Season.notifiedMilestone` (ouverture des paris → ouverture → fermeture, chaque jalon **une seule fois**) + **rappel « paris bientôt fermés »** ~3 j avant `betEndDate` (une fois via `Season.betsClosingNotifiedAt`). |

La détection des décès est aussi déclenchable **manuellement** par un admin via
`POST /automation/detect-deaths`.

### Jobs asynchrones (`modules/jobs`, table `SyncJob`)

Le travail long/réseau (sync Wikidata en masse, scans de décès) est tracé dans la table
`SyncJob` (statut + compteurs de progression + `payload`/`result` JSON).

- **Bulk-enrich** (`POST /jobs/bulk-enrich`) crée la ligne et **fire-and-forget** le worker →
  réponse `202` immédiate ; le front poll `GET /jobs/:id`. Un **sémaphore global** (3 en
  parallèle, fait main car `p-limit` v6 est ESM-only et casse le build CJS) limite les appels
  Wikidata concurrents **tous jobs confondus**. Les échecs par fiche sont isolés dans
  `result.errors`.
- **Scans de décès** sont enrobés en `DEATH_SCAN` (`recordDeathScan`), donc cron et
  déclenchement manuel apparaissent tous deux dans l'historique `GET /jobs` (écran admin
  `/admin/automation`).
- ⚠️ **Compromis in-process** : un job laissé `RUNNING`/`PENDING` à un redéploiement Railway
  est **réconcilié en `FAILED`** au boot (`onApplicationBootstrap`) — pas de reprise.

### Notifications (`modules/notifications`, `@nestjs/event-emitter`)

Toutes ces automatisations **émettent des events** (`celebrity.died`, jalons de saison,
`bets.closingSoon`, lifecycle des propositions…) consommés en asynchrone par
`NotificationsService` (`@OnEvent`, fire-and-forget try/catch) pour peupler les notifications
in-app. Sens unique : les modules domaine n'importent que `notifications/events.ts` (constantes
+ types), donc aucun cycle. Détail complet des events et destinataires dans
[CLAUDE.md](CLAUDE.md) (section « Notifications »).

## Déploiement

API sur Railway via Docker — procédure complète dans
[apps/api/DEPLOY.md](apps/api/DEPLOY.md). Déclenché par un push sur `main`.
