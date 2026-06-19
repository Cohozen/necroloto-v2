# 🗺️ Roadmap — Necroloto V2

Backlog des prochaines features, au-delà du wiring web initial. Non priorisé de façon
ferme — à arbitrer au fil de l'eau.

## ✅ Livré

- 🔄 **Synchronisation Wikidata en masse** — sélection multiple dans l'admin, **asynchrone**
  via un job runner in-process (`POST /jobs/bulk-enrich` crée un `SyncJob` et rend la main ;
  le front poll `GET /jobs/:id`). **Sémaphore global** partagé entre tous les jobs, échecs
  isolés par fiche, historique sur `/admin/automation`. Aussi `DELETE /celebrities/bulk`.
  _Reste possible_ : migrer vers BullMQ/Redis si le volume l'exige (jobs `RUNNING` perdus au
  redéploy, réconciliés en `FAILED` au boot).
- 📅 **Saisons en base** — modèle `Season` (`year @unique` + `openDate`/`betStartDate`/
  `betEndDate`/`closeDate`), admin `/admin/seasons` (CRUD, anti-chevauchement, doublon → 409).
  `SeasonsService` résout la **saison active** via une bascule globale → remplace les
  `getUTCFullYear()` / `CURRENT_YEAR` (API + web `useSeasonYear` / `useSeasonYearTabs`).
- 🎟️ **Modèle « paris avant la saison »** — les paris N+1 s'ouvrent ~1 mois avant le début de
  la saison ; verrous **par phase** (`getSeasonPhase` → `assertCanBet`) : libre pendant
  `betting`, flag-gated en `season-open` (`allowEdit`/`allowNewBet`), verrouillé avant/après.
  Exposé via `CircleSummary.seasonPhase` / `revealed`.
- 🤫 **Secret des paris + onglet « Paris »** — paris des autres masqués côté serveur tant que
  `now < openDate` ou `betsVisible = false` (fiche, classement, `GET /circle/:id/bets`).
  Défauts cercle : `betsVisible` ON, `allowEdit` OFF.
- 💀 **Détection automatique des décès** — cron Wikidata quotidien (4h, `DeathDetectionService`)
  qui détecte et score en direct + déclenchement manuel (`POST /automation/detect-deaths`).
  Chaque run = `SyncJob` (`DEATH_SCAN`), visible sur `/admin/automation`.
- 🔐 **Écrans auth custom** — `SignInForm` / `SignUpForm` / `ForgotPasswordForm` (hooks
  headless Clerk, Google SSO, reset par code) remplacent les widgets prebuilt.

## 🎯 Backlog priorisable

- ⏳ **Compte à rebours dashboard** — afficher le temps restant avant l'ouverture des paris
  de la prochaine saison. S'appuie sur `seasonPhase` / `betStartDate` (déjà dispos via
  `useCircleSummaries`) ; remplacer le label statique de `BetProgressCard`
  (`apps/web/src/components/dashboard/BetProgressCard.tsx`).
- ⌘ **Recherche globale Cmd+K** — câbler l'input « ⌘K » aujourd'hui **décoratif** de la
  TopBar (`apps/web/src/components/layout/TopBar.tsx`) au `CommandDialog` déjà présent
  (`apps/web/src/components/ui/command.tsx`, lib `cmdk`) : raccourci clavier global +
  recherche célébrités / cercles.
- ➕ **Ajouter une célébrité hors base lors du pari** — pendant la composition du pari
  (`apps/web/src/routes/_app/celebrities/index.tsx`, sélection-only aujourd'hui), permettre
  de proposer/créer une célébrité absente du catalogue. Création actuellement **admin-only**
  (`POST /celebrities`, `@UseGuards(AdminGuard)`). À cadrer : proposition à valider par un
  admin vs création directe + enrichissement Wikidata automatique.
- 🔔 **Notifications** — page + génération sur événements (décès d'une célébrité pariée,
  nouveau membre, ouverture/fermeture de saison, changement de place au classement…).
  S'appuie sur l'intégration **Resend** (e-mails) encore *pending*. Modèle `Notification`
  côté API + centre de notifications côté web.
- 🔢 **Nombre de paris configurable par cercle** — aujourd'hui figé à
  `MAX_BET_CELEBRITIES = 50` (`apps/web/src/lib/api/queries.ts`). Champ sur le modèle
  `Circle` (Prisma) + réglage dans `/circles/$id/settings`, appliqué à la validation du
  draft et au compteur. (Même endroit que les verrous de `BetsService.assertCanBet`.)
- 🏆 **Refonte du système de points + cote** — le barème actuel est « trop plat ». Pondérer
  le gain par une **cote** par célébrité (dérivée de l'âge / état de santé via Wikidata, ou
  ajustée à la main en admin), bonus de précision (mois / cause), malus, séries. Logique
  centralisée dans `packages/shared/scoring` (`calculPointByCelebrity`) — garder
  l'idempotence et le recalcul via `CelebritiesService.recalculatePoints`. Concrétise le copy
  déjà présent (« plus la cote est haute, plus le pari rapporte gros »).

## 🧪 Propositions à arbitrer

- 🎆 **Soirée live Nouvel An** — vue temps réel des décès et points qui tombent (moment fort
  du jeu).
- 🥇 **Palmarès all-time / historique des saisons** — classement inter-saisons, archives.
- 🎖️ **Trophées / badges** — gamification (meilleure cote trouvée, saison parfaite, séries…).
- 📣 **Partage social** — image de podium générée pour partage hors-app.
- 🌍 **Classement global inter-cercles** — au-delà du leaderboard par cercle.

## 🛠️ Tech / dette

- ✔️ **Validation DTO** — décorer les DTOs (class-validator) pour activer le `whitelist` du
  `ValidationPipe` global (cf. « Known debt » dans CLAUDE.md).
- 🔑 **Contrainte `@unique` sur `User.clerkId`** — après dédoublonnage, pour verrouiller
  l'intégrité du provisioning (cf. fix de réconciliation par email).
