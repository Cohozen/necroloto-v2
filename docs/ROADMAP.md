# Roadmap — Necroloto V2

Backlog des prochaines features, au-delà du wiring web initial. Non priorisé de façon
ferme — à arbitrer au fil de l'eau.

## Demandées

### Notifications
Page notifications + génération sur événements (décès d'une célébrité pariée, nouveau
membre dans un cercle, ouverture/fermeture de saison, passage de place au classement…).
S'appuie sur l'intégration **Resend** (e-mails) encore *pending*. Prévoir un modèle
`Notification` côté API + un centre de notifications côté web.

### Synchronisation Wikidata en masse — _fait (v2, asynchrone)_
Livré : sélection multiple dans l'admin, désormais **asynchrone via un job runner in-process**
(`POST /jobs/bulk-enrich` crée un `SyncJob` et rend la main tout de suite ; le front poll
`GET /jobs/:id` pour la progression). Un **sémaphore global** plafonne la concurrence des appels
Wikidata, partagé entre tous les jobs (plusieurs syncs en parallèle sans saturer l'API). Échecs
isolés par fiche, historique consultable sur `/admin/automation`. Aussi `DELETE /celebrities/bulk`.
**Reste possible** : migrer vers BullMQ/Redis si le volume l'exige (le worker in-process perd les
jobs `RUNNING` au redéploy — réconciliés en `FAILED` au boot).

### Nombre de paris configurable par cercle
Aujourd'hui figé à `MAX_BET_CELEBRITIES = 50` (`apps/web/src/lib/api/queries.ts`).
Ajouter un champ sur le modèle `Circle` (Prisma) + réglage dans `/circles/$id/settings`,
appliqué à la validation du draft et à l'affichage du compteur. (Note : les verrous
`Circle.allowEdit` / `allowNewBet` existants sont désormais **appliqués** côté serveur dans
`BetsService` — même endroit à étendre pour le cap par cercle.)

### Refonte du système de points
Le barème actuel est « trop plat ». Pistes : pondérer le gain par la **cote** de la
célébrité, bonus de précision (mois / cause de décès), malus, séries. Logique centralisée
dans `packages/shared/scoring` (`calculPointByCelebrity`) — garder l'idempotence et le
recalcul via `CelebritiesService.recalculatePoints`.

### Système de cote
Cote par célébrité (dérivée de l'âge / état de santé via Wikidata, ou ajustée à la main
en admin). Alimente la refonte du scoring ci-dessus et concrétise le copy déjà présent
(« plus la cote est haute, plus le pari rapporte gros »).

### Saisons en base — _fait_
Livré : modèle `Season` (`year @unique` + dates `openDate`/`betStartDate`/`betEndDate`/`closeDate`),
admin `/admin/seasons` (CRUD, anti-chevauchement + ordre des dates, doublon d'année → 409).
`SeasonsService` résout la **saison active par fenêtre de dates** (fallback : plus récente, puis
année UTC courante) → remplace les `new Date().getUTCFullYear()` / `CURRENT_YEAR` côté API et web
(`useSeasonYear` / `useSeasonYearTabs`). `Bet.year` inchangé (1 saison = 1 année calendaire).
La **fenêtre de paris** verrouille `BetsService.create`/`replaceCelebrities` (403 hors
`[betStartDate, betEndDate]`), exposé via `CircleSummary.bettingOpen` → bannière draft. Rétro-compatible :
no-op tant qu'aucune saison n'existe. **Reste à faire** : notifications ouverture/clôture (cf.
Notifications), palmarès all-time / archives (ci-dessous) — débloqués par cette table.
**Reste possible** : champ `name` libre par saison déjà en place ; pas encore de FK `seasonId` sur
`Bet` (volontaire — `year` reste la clé du scoring).

## Propositions à arbitrer

- **Détection automatique des décès** — _fait_ : cron Wikidata quotidien (4h)
  (`DeathDetectionService`) qui détecte les décès des fiches suivies et score en direct,
  + déclenchement manuel (`POST /automation/detect-deaths`). Chaque exécution est enregistrée
  comme `SyncJob` (type `DEATH_SCAN`) et visible sur `/admin/automation`.
- **Soirée live Nouvel An** — vue temps réel des décès et points qui tombent (moment fort
  du jeu).
- **Palmarès all-time / historique des saisons** — classement inter-saisons, archives.
- **Trophées / badges** — gamification (meilleure cote trouvée, saison parfaite, séries…).
- **Partage social** — image de podium générée pour partage hors-app.
- **Classement global inter-cercles** — au-delà du leaderboard par cercle.

## Tech / dette à traiter en parallèle

- **Écrans auth custom** — remplacer les composants prebuilt Clerk par un formulaire
  headless (`@clerk/elements`) maîtrisé visuellement. Tâche dédiée (surface auth sensible).
- **Validation DTO** — décorer les DTOs (class-validator) pour activer le `whitelist` du
  `ValidationPipe` global (cf. « Known debt » dans CLAUDE.md).
- **Contrainte `@unique` sur `User.clerkId`** — après dédoublonnage, pour verrouiller
  l'intégrité du provisioning (cf. fix de réconciliation par email).
