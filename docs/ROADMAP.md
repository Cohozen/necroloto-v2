# 🗺️ Roadmap — Necroloto V2

Backlog des prochaines features, au-delà du wiring web initial. Non priorisé de façon
ferme — à arbitrer au fil de l'eau.

## ✅ Livré

- 🏷️ **Facettes catalogue & filtres** — `enrich` récupère trois facettes Wikidata sur `Celebrity`
  (migration additive `add_celebrity_facets`) : **nationalité** (P27), **genre** (P21 → Homme/Femme/Autre)
  et **catégorie** (bucket grossier mappé depuis l'occupation P106 via `occupation-categories.ts` — ~12
  buckets ; le `role` texte-libre reste). Filtrage **server-side & orthogonal** partagé (`buildFacetWhere` :
  catégorie/nationalité/genre + tranche d'âge → bornes `birth`) sur le draft (`findCataloguePage`) et l'admin
  (`findPage`) ; `GET /celebrities/facets` peuple les menus. UI : **barre de filtres unifiée** qui passe à la
  ligne (`CelebrityFilters` + `FilterSelect`, âge en dropdown, reset toujours visible, compteur inline),
  axe **Wikidata lié/non-lié** sorti du statut (combinable), bouton d'ajout remonté en en-tête. Aussi : **label
  vivant/décédé genré** (`StatusBadge`) et **nationalité affichée sur la fiche**. Script `verify-facets.mjs`
  (vérif + backfill local). **Bulk-enrich résilient au rate-limiting** : `WikidataService.fetchJson` retry
  429/503 avec backoff (`Retry-After`), sémaphore baissé à 2, et photo re-téléchargée **seulement si absente**
  (un scan complet de prod tombait en cascade de 429 après ~70 fiches). _Reste_ : relancer le bulk-enrich
  post-déploiement pour peupler les fiches prod ; photo-upload toujours non câblé.
- 🖼️ **Formulaire d'édition célébrité (admin) enrichi** — la fiche admin **affiche enfin la photo**
  Wikidata dans le portrait (était monogramme-only) et la **catégorie / nationalité** en lecture seule
  (`IconField` gagne un prop `readOnly`). Deux boutons de resync dans le bloc Wikidata : **« Synchroniser
  la photo »** (`enrich` `photoOnly` — re-télécharge **uniquement** la photo, forcée) et **« Tout
  synchroniser »** (`forcePhoto` — re-enrichit tout + force la photo), contournant le skip-photo du
  bulk-enrich. Plus **« Retirer la source »** (`DELETE /celebrities/:id/wikidata` → `wikidataId` null,
  données conservées). Pages d'édition/création élargies à `max-w-6xl` (alignées sur la liste admin).
  Détail → `CLAUDE.md` §Async jobs + §Front admin.
- 📱 **PWA + Web Push** — l'app web est désormais **installable** (manifest + service worker via
  `vite-plugin-pwa` en stratégie `injectManifest`, SW custom `apps/web/src/sw.ts` pour les
  handlers `push`/`notificationclick`, icônes générées par `scripts/generate-favicon.mjs`). Les
  **notifications in-app existantes sont poussées** vers les appareils abonnés : modèle Prisma
  `PushSubscription` (`endpoint @unique`) + `PushModule`/`PushService` (lib `web-push`, clés VAPID),
  branché sur le point de convergence `NotificationsService.create/createMany` (couvre donc **tous**
  les types d'events). Subs mortes (404/410) purgées à l'envoi ; **no-op sans clés VAPID** (déployable
  sans config). Front : toggle « Notifications push » dans `/profile` (`usePushSubscription` +
  `POST/DELETE /push/subscribe`) + bouton admin « Tester une notification » (`POST /push/test`).
  ⚠️ contexte sécurisé requis (HTTPS / `localhost`) ; iOS ≥ 16.4 **uniquement PWA installée sur l'écran
  d'accueil** ; **Brave** bloque le service push Google par défaut (message d'aide dédié). Env requis :
  `VAPID_PUBLIC_KEY`/`VAPID_PRIVATE_KEY`/`VAPID_SUBJECT` (API Railway) + `VITE_VAPID_PUBLIC_KEY`
  (web Vercel).
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
  headless Clerk, Google SSO, reset par code) remplacent les widgets prebuilt. Inscription =
  flux 2 phases e-mail/mot de passe + **vérification par code e-mail** (`email_code`, OTP) avec
  champ de confirmation du mot de passe.
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
- ✨ **Polissage UX post-déploiement (prod)** — lot de raffinements suite à l'usage réel : **photos
  de célébrités** dans toutes les listes (draft, paris/pronos, admin — `CelebrityPortrait` + fallback
  `onError`) ; admin **filtre « Sans Wikidata »** (`wikidata=unlinked`) + **indicateur** de liaison
  par ligne ; tri des paris **décès-puis-alphabétique** ; **layout masonry** des paris desktop ;
  membres **par ordre alphabétique** ; **dropdown « Déconnexion »** dans la sidebar desktop ; fiche :
  **« Pari manqué »** sur un pari d'année passée non gagnant (au lieu d'un potentiel) + **lien
  Wikidata** ; **filtres admin** et **année sélectionnée d'un cercle** persistés en **querystring**
  (TanStack Router `validateSearch`) — survivent au retour/refresh ; **favicon** dérivé du logo
  « invader » néon de la TopBar (`apps/web/public/`, généré par `scripts/generate-favicon.mjs`).
- ✨ **Polissage UX (lot 2)** — **draft de paris paginé en scroll infini** (nouvel endpoint public
  `GET /celebrities/catalogue` : vivants seulement, alphabétique, recherche serveur débouncée,
  `take`/`skip` ; `useCatalogueCelebrities` + sentinel `IntersectionObserver`, calqué sur l'admin) —
  le catalogue n'est plus chargé d'un coup ; badge « N / 50 sélectionnées » retiré (le `DraftTray` le
  porte déjà). **Création de cercle** : bloc dates de la saison active (fenêtres paris/saison + statut)
  + les 3 toggles désormais **câblés** (`allowEdit`/`betsVisible` n'étaient que décoratifs), « Liste
  modifiable » **désactivé tant que les paris sont ouverts** (la rallonge n'a de sens qu'une fois
  fermés). **Décès récents du dashboard** rendus cliquables vers la fiche célébrité.
- 🛡️ **Validation DTO** — tous les DTOs portent désormais des décorateurs class-validator
  (dates via `@Type(() => Date)`), et le `ValidationPipe` global tourne en **whitelist +
  forbidNonWhitelisted** (`apps/api/src/main.ts`) : les champs inconnus sont retirés/rejetés (400)
  et les types validés. `enableImplicitConversion` reste off (coercition pilotée par les `@Type`).
- 🔑 **Contrainte `@unique` sur `User.clerkId`** — verrouille l'invariant de provisioning (un
  `User` par identité Clerk). Migration `add_user_clerkid_unique` (index unique seul) précédée du
  script de dédoublonnage `apps/api/scripts/dedupe-clerk-ids.mjs` (`--apply`, à lancer avant le
  deploy prod). Les lookups simples passent en `findUnique` ; la réconciliation par email de
  `UsersService.create` est conservée.
- 🚫 **Pari sans célébrité déjà décédée** — `BetsService.create` / `replaceCelebrities` rejettent
  (400, noms en clair) un pari listant une personne morte **avant** la saison via
  `assertNoDeceased(ids, year)` (sur le `Celebrity.death` stocké, sans appel Wikidata). Un décès de
  l'**année pariée** reste autorisé (pick gagnant / rallonge `season-open`). Filets côté front :
  la grille du draft masque déjà les défunts et `ProposeCelebrityDialog` **grise les résultats
  Wikidata décédés** (badge « Décédé(e) ») ; la sauvegarde remonte le message d'erreur en toast.
  Au passage, le doublon de pari (`@@unique([userId, circleId, year])` P2002) est mappé en **409**
  (avant : 500).

## 🎯 Backlog priorisable

- 📧 **Notifications — canal e-mail** — sur le même store, diffusion par **e-mail** via **Resend**
  (encore *pending*). Le canal **Web Push** est désormais livré (voir ci-dessus).
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

- _(rien d'urgent en cours — voir « Known debt » dans CLAUDE.md.)_
