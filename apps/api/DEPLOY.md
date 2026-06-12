# Déploiement de l'API (Railway)

L'API se déploie via le `Dockerfile` à la **racine du monorepo** (contexte racine
pour embarquer `@necroloto/shared`). Config dans `railway.json`.

## 1. Variables d'environnement à définir sur Railway

| Variable | Valeur | Notes |
|---|---|---|
| `DATABASE_URL` | transaction pooler Supabase (port **6543**, `?pgbouncer=true`) | runtime |
| `DIRECT_URL` | session pooler Supabase (port **5432**) | migrations |
| `CLERK_JWT_KEY` | clé publique JWT Clerk | vérif des tokens |
| `CLERK_SECRET_KEY` | secret Clerk | optionnel — repli pour l'admin global |
| `FRONTEND_ORIGIN` | origines autorisées (CORS), séparées par virgule | à remplir quand le front existe |

> Ne PAS définir `PORT` : Railway l'injecte automatiquement (l'app l'écoute, bind `0.0.0.0`).
> Ne PAS mettre `NEON_DATABASE_URL` (utile seulement à la migration ponctuelle).

## 2. Déployer

Le `railway.json` configure tout : builder Dockerfile, migrations en pre-deploy,
commande de démarrage.

- **pre-deploy** : `pnpm exec prisma migrate deploy` (applique les migrations en attente, idempotent)
- **start** : `node dist/src/main.js`

### Option A — Railway CLI (depuis ce dossier monorepo)
```bash
npm i -g @railway/cli
railway login
railway init        # ou: railway link  (pour rattacher un service existant)
railway up          # build le Dockerfile et déploie
```

### Option B — GitHub
1. `git init && git add . && git commit -m "init necroloto-v2"`
2. Pousser sur un repo GitHub.
3. Sur Railway : New Project → Deploy from GitHub repo → sélectionner le repo.
   Railway détecte `railway.json` et le `Dockerfile` à la racine.

## 3. Vérifier
- Healthcheck : `GET /` doit répondre `Hello World!` (route non protégée).
- `GET /celebrities` sans token → `401` (garde Clerk active).
- Logs de pre-deploy : « All migrations have been successfully applied » (ou « No pending migrations »).
