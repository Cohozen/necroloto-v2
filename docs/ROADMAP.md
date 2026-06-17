# Roadmap — Necroloto V2

Backlog des prochaines features, au-delà du wiring web initial. Non priorisé de façon
ferme — à arbitrer au fil de l'eau.

## Demandées

### Notifications
Page notifications + génération sur événements (décès d'une célébrité pariée, nouveau
membre dans un cercle, ouverture/fermeture de saison, passage de place au classement…).
S'appuie sur l'intégration **Resend** (e-mails) encore *pending*. Prévoir un modèle
`Notification` côté API + un centre de notifications côté web.

### Synchronisation Wikidata en masse
Bouton admin pour relancer l'enrichissement de **toutes** les célébrités depuis Wikidata
(au lieu du `POST /celebrities/:id/enrich` unitaire actuel). À orchestrer côté API,
idéalement via un job/queue pour ne pas bloquer la requête (volume + rate limit Wikidata).

### Nombre de paris configurable par cercle
Aujourd'hui figé à `MAX_BET_CELEBRITIES = 50` (`apps/web/src/lib/api/queries.ts`).
Ajouter un champ sur le modèle `Circle` (Prisma) + réglage dans `/circles/$id/settings`,
appliqué à la validation du draft et à l'affichage du compteur.

### Refonte du système de points
Le barème actuel est « trop plat ». Pistes : pondérer le gain par la **cote** de la
célébrité, bonus de précision (mois / cause de décès), malus, séries. Logique centralisée
dans `packages/shared/scoring` (`calculPointByCelebrity`) — garder l'idempotence et le
recalcul via `CelebritiesService.recalculatePoints`.

### Système de cote
Cote par célébrité (dérivée de l'âge / état de santé via Wikidata, ou ajustée à la main
en admin). Alimente la refonte du scoring ci-dessus et concrétise le copy déjà présent
(« plus la cote est haute, plus le pari rapporte gros »).

### Saisons en base
Remplacer `new Date().getFullYear()` / `CURRENT_YEAR` par un modèle `Season` configurable
via l'admin (dates d'ouverture/clôture, saison active). Touche le web partout où l'année
courante est dérivée du client (`dashboard`, `celebrities`, `circles/new`, `CelebrityForm`…).

## Propositions à arbitrer

- **Détection automatique des décès** — cron Wikidata pour scorer en direct sans saisie
  admin manuelle. Complète la sync de masse.
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
