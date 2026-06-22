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
- ⏳ **Compte à rebours dashboard** — `CountdownCard` (rail droit, après `BetProgressCard`)
  décompte néon J/H/M dérivé client-side de `useSeasons()` via `nextCountdownTarget`
  (`adapters.ts`) : **fin des paris** (`betEndDate`, corail) si une fenêtre est ouverte, sinon
  **ouverture des paris** (`betStartDate`, néon) de la prochaine saison, sinon masqué. Refresh à
  la minute (pas de secondes).
- ➕ **Ajouter une célébrité hors base lors du pari** — bouton « Ajouter » dans le draft
  (`ProposeCelebrityDialog` : recherche Wikidata d'abord, repli manuel) → `POST /celebrities/propose`
  (ouvert à tous). La fiche est créée **PENDING** (`CelebrityStatus`, default APPROVED), visible du
  **seul proposeur** jusqu'à validation ; le scoring est inchangé (le statut gère la visibilité, pas
  les points). Dédup par `wikidataId @unique` + nom exact, enrich inline si QID. Validation admin
  (onglet « En attente » : approve / reject / vérif Wikidata) + **fusion** des doublons
  (`MergeCelebrityDialog`, `merge` durci contre la collision de PK `CelebritiesOnBet`).
- 🔍 **Recherche globale ⌘K** — palette `GlobalSearchDialog` (cmdk) ouverte au raccourci global
  **⌘K / Ctrl+K** ou au clic (barre TopBar desktop devenue cliquable + bouton loupe mobile).
  Deux groupes navigables au clavier : **Cercles** (`GET /circle/search` — publics + cercles du
  joueur) et **Célébrités** (`POST /celebrities/search`, visibilité PENDING/APPROVED). Recherche
  côté serveur (`shouldFilter={false}`), terme recherché surligné, Entrée → fiche cercle ou
  célébrité. _Reste possible_ : étendre aux paris, recherches récentes.
- 🔔 **Notifications in-app (phases 1 & 2)** — modèle `Notification` (store par utilisateur) peuplé
  en asynchrone via `@nestjs/event-emitter` : handlers `@OnEvent` dans `NotificationsModule`,
  émetteurs dans les modules domaine. Événements : **décès d'une célébrité pariée**
  (`DeathDetectionService` + saisie admin), **nouveau membre de cercle**, **jalons de saison**
  (`SeasonSchedulerService` : ouverture des paris / ouverture / fermeture), **propositions de
  célébrités** (`proposal.pending` → admins via `ADMIN_CLERK_IDS`, `proposal.approved`/`rejected` →
  proposeur), **bienvenue** à la 1ère connexion (`user.welcomed`), **vainqueur de saison** (sur
  `season.closed`, gagnant calculé par cercle via `BetsService`) et **rappel paris bientôt fermés**
  (~3 j avant `betEndDate`, une fois via `Season.betsClosingNotifiedAt`, aux membres sans pari pour
  l'année). Page web `/notifications` (lecture auto + suppression) + badge cloche
  (`GET /notifications/unread-count`). Destinataires des events globaux = membres de cercle.

## 🎯 Backlog priorisable

- 📧 **Notifications — canaux de diffusion** — sur le même store : **e-mail** via **Resend**
  (encore *pending*) et **Web Push (PWA / service worker)** pour le push mobile (Web Push API ;
  iOS ≥ 16.4 uniquement si la PWA est installée sur l'écran d'accueil — clés VAPID + table
  `PushSubscription` + lib `web-push`).
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
- 🥇 **Palmarès all-time / historique des saisons** — classement inter-saisons, archives.
  Idéalement **par cercle** (un palmarès propre à chaque cercle, au fil des saisons).
- 🎖️ **Trophées / badges** — gamification (meilleure cote trouvée, saison parfaite, séries…).
  Une petite partie existe déjà **en front sur les profils** ; large marge pour aller beaucoup
  plus loin.
- 🌍 **Classement global inter-cercles** — au-delà du leaderboard par cercle, mais **uniquement
  sur les cercles publics**.

## 🛠️ Tech / dette

- ✔️ **Validation DTO** — décorer les DTOs (class-validator) pour activer le `whitelist` du
  `ValidationPipe` global (cf. « Known debt » dans CLAUDE.md).
- 🔑 **Contrainte `@unique` sur `User.clerkId`** — après dédoublonnage, pour verrouiller
  l'intégrité du provisioning (cf. fix de réconciliation par email).
