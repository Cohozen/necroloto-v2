# Prompts de design — Connexion / Inscription & Admin

Prompts manquants des maquettes (Phase 5). À donner tels quels à l'outil de génération
pour produire `docs/mockups/screens/auth.js` et `docs/mockups/screens/admin.js`, dans la
**même DA et le même format** que les écrans existants (`dashboard.js`, `forms.js`, etc.).

Les écrans cibles sont listés dans [front-web-pages.md](front-web-pages.md) :
- **Connexion / Inscription** — section « Public / Auth » (Clerk, thème dark/néon).
- **Admin global** — « Éditer une célébrité » (catalogue, admin global uniquement).
- **Admin de cercle** — onglet « Réglages » + « Membres » (admin de cercle uniquement).

---

## Bloc de contexte commun (à préfixer aux deux prompts)

> Tu génères des **maquettes haute-fidélité** pour Necroloto V2, un « celebrity death pool ».
> DA : **néon / arcade, dark-mode intégral**, mobile-first. Écris du JS dans le même style
> que `docs/mockups/screens/*.js` : un IIFE `(function(){ const N = window.NECRO; … })()`
> qui expose des fonctions retournant des **chaînes HTML**, puis les attache à `N`.
>
> **Helpers dispo sur `N`** : `icon(name, size, stroke)`, `pixel(name, color, scale)`
> (pixel-art : `invader`, `ghost`, `skull`), `avatar(player, size, cls)`,
> `portrait(celeb, opts)`, `logo(scale)`, `fmt(n)`, `statusPill(celeb)`.
>
> **Tokens couleur** : `--nl-bg` #0B0B0F (charbon), `--nl-surf`/`-2`/`-3` (profondeur),
> `--nl-neon` #39FF6A (vert toxique = en vie / score), `--nl-coral` #FF5A3C
> (décès / points), `--nl-magenta` #FF2E97 (= vous), `--nl-ink`/`-2`/`-3` (texte),
> `--nl-line`/`-2` (filets), `--nl-glow` (intensité du glow). La profondeur vient des
> **dégradés + grain**, pas des bordures. Police d'affichage : Saira Condensed (`nl-display`).
>
> **Classes / composants** : `nl-card`, `nl-card-flat`, `nl-toprule`, glows
> `nl-glow-green`/`-coral`/`-mag` ; boutons `nl-btn nl-btn-primary` / `nl-btn-ghost` /
> `nl-btn-sm` ; champs `nl-field` + `nl-label` + `nl-help` + `nl-input` (états
> `nl-input--focus`/`--error`/`--ok`) + `nl-msg nl-msg--error`/`--ok` ; `nl-switch`
> (`nl-switch--on`) ; `nl-choice` + `nl-choicecard` (`--on`) ; `nl-otp` (`--error`,
> cellules `--active`/`--filled`/`--empty`) ; `nl-codebox` ; pills/chips `nl-pill`,
> `nl-chip`, `nl-eyebrow`, `nl-display`, `nl-h1`/`nl-h2`, `nl-muted`/`nl-dim`,
> `nl-empty-art`, `nl-success`. Réutilise les primitives `field()`, `input()`, `msg()`,
> `switchRow()`, `choice()`, `otp()` de `forms.js`.
>
> **Shells** : desktop = rail latéral gauche `nl-side` (logo invader + nav + avatar bas) +
> `nl-topbar` ; mobile = `nl-mtop` en tête + bottom tab `nl-mbottom` (`nl-mtab`,
> `nl-mfab`). Pour les écrans-formulaire, calque-toi sur `deskShell()` / `mobShell()` de
> `forms.js`. Chaque artboard porte `data-screen-label="…"`.
>
> Livre **desktop + mobile** pour chaque écran, et les **états clés** (vide, focus,
> erreur, chargement, succès) en variantes séparées.

---

## Prompt A — Connexion / Inscription (Clerk, thème néon)

> En prod, l'auth passe par **Clerk** (`<SignIn>` / `<SignUp>` montés sur les routes
> `sign-in.$` / `sign-up.$`). On ne refait pas le moteur Clerk : on maquette la **coque
> custom** qui l'enrobe et le **thème néon** que recevra l'`appearance` de Clerk. Le but
> est de donner au dev les valeurs visuelles à mapper sur les variables Clerk
> (`colorPrimary`, `colorBackground`, cards, inputs, boutons, dividers, footer links).
>
> Génère `screens/auth.js` avec :
>
> **1. Écran « marketing split » (desktop)** — layout deux colonnes plein écran sur la
> coque néon (`<div class="nl">` + grain) :
> - **Gauche** : ambiance de marque. Grand `logo()`, accroche « Défiez le destin », une
>   ligne de pitch (`nl-muted`), pixel-art `invader`/`skull` en glow discret, et 2-3
>   `nl-pill` de réassurance (« Gratuit », « Entre potes », « Saison 2026 »).
> - **Droite** : la **carte d'auth** (`nl-card nl-toprule`, max-width ~420px) qui simule
>   le rendu Clicker themé : titre `nl-display` « Connexion », sous-titre, **boutons
>   sociaux** (Google / Apple) en `nl-btn-ghost` avec icône, séparateur « ou » sur
>   `nl-line`, champ e-mail (`field()` + `input({icon:"mail"})`), bouton primaire pleine
>   largeur `nl-btn nl-btn-primary` (`bolt` + « Continuer »), et footer « Pas de compte ?
>   **S'inscrire** » avec le lien en `--nl-neon`.
>
> **2. Connexion — mobile** : la même carte d'auth, plein écran via une coque type
> `mobShell` (sans bottom tab — on est avant l'app), logo en tête, champ e-mail focus
> (`nl-input--focus` + `nl-caret`), boutons sociaux empilés, footer lien inscription.
>
> **3. Inscription — mobile** : variante avec champs e-mail + (optionnel) pseudo, mention
> CGU `nl-help`, bouton « Créer mon compte ». Mets en avant qu'un **pseudo** alimentera le
> `User` côté API.
>
> **4. Vérification e-mail (OTP)** — réutilise `otp()` de `forms.js` : titre « Entrez le
> code », sous-titre « Code envoyé à v…@…», `nl-otp` en saisie active, lien « Renvoyer le
> code » (`nl-dim` + accent), variante **erreur** (`nl-otp--error` + `msg("error", …)`).
>
> **5. États** : bouton **chargement** (spinner néon dans `nl-btn-primary`), **erreur
> d'identifiants** (`nl-input--error` + `nl-msg--error` « E-mail ou code incorrect »),
> et une variante **redirect/loading** (l'app gate de `_app.tsx` : skeleton néon « On
> prépare votre cockpit… » avec pixel-art `invader` pulsant).
>
> **6. Board « thème Clerk »** (un artboard de référence, comme `statesBoard`) : mappe
> chaque zone Clerk → token Necroloto (carte → `--nl-surf`/`nl-toprule`, primary →
> `--nl-neon`, input focus → ring néon, error → `--nl-coral`, divider → `--nl-line`,
> footer link → `--nl-neon`), sous forme de petite légende exploitable par le dev.
>
> Expose : `N.authSplitDesktop`, `N.signInMobile`, `N.signUpMobile`, `N.verifyOtp`,
> `N.authLoading`, `N.clerkThemeBoard`.

---

## Prompt B — Admin (admin global & admin de cercle)

> Deux contextes d'admin distincts, à ne pas mélanger (cf. les guards de l'API) :
> - **Admin global** (`AdminGuard`, rôle Clerk `public_metadata.roles`) → **mutations du
>   catalogue célébrités** uniquement.
> - **Admin de cercle** (`CircleAdminGuard`, `Membership.role`) → **réglages + membres**
>   d'un cercle.
> Signale visuellement le pouvoir admin par un **badge néon discret** (`nl-pill` avec
> icône `bolt`/`lock`, « Admin »), jamais agressif.
>
> Génère `screens/admin.js` avec :
>
> ### Admin global — catalogue célébrités
> **1. Liste / table catalogue (desktop)** — dans le shell desktop (rail + `nl-topbar`,
> fil d'Ariane « Catalogue / Admin ») : barre d'outils (recherche command-palette,
> `nl-chip` « + Nouvelle célébrité », filtre statut vivant·e/décédé·e), puis un **tableau
> dense** : colonnes Portrait (`portrait()`), Nom, Naissance, **Statut** (`statusPill()`),
> **Points**, nb de paris, actions (Éditer `pencil`, recalculer points `refresh`). Lignes
> sur `nl-card-flat`, hover glow néon.
>
> **2. Éditer / créer une célébrité (desktop, formulaire)** — calque `deskShell`, carte
> `nl-card nl-toprule` :
> - **En-tête** : grand `portrait()` + bouton « Changer la photo » (upload Supabase
>   Storage), nom en `nl-display`.
> - **Champs** (`field()` + `input()`) : Nom, Date de naissance, Wikidata QID
>   (`input({icon:"globe"})` + `nl-help` « Auto-renseigné depuis Wikidata »), et un bloc
>   **Statut** : switch « Décédé·e » (`switchRow`) qui révèle un champ **Date de décès**.
> - **Encart scoring** (`nl-card-flat` + `nl-glow-coral`) : explique que renseigner une
>   date de décès déclenche `recalculatePoints` — « seules les listes pariées sur **2026**
>   marqueront ». Montre un avant/après points (`nl-kpi`).
> - Boutons : `nl-btn-primary` « Enregistrer » + `nl-btn-ghost` « Annuler ». Variante
>   **création** (champs vides, état `default`) et **édition** (pré-rempli).
>
> **3. États** : champ Wikidata en **chargement** (« Récupération depuis Wikidata… »
> spinner), **succès** d'import (`nl-input--ok`), **conflit** (`nl-msg--error` « QID déjà
> dans le catalogue »), confirmation **suppression** (modale `nl-card` + `skull`, action
> destructive en `--nl-coral`).
>
> **4. Mobile** : version compacte de la fiche d'édition (`mobShell`, footer collant avec
> « Enregistrer »).
>
> ### Admin de cercle — réglages & membres
> **5. Réglages du cercle (desktop + mobile)** — onglet « Réglages » de l'écran cercle.
> Réutilise les `switchRow()` de `forms.js` : Nom du cercle (`field` éditable),
> Visibilité (`choice()` privé/public), bloc « Saison 2026 » (autoriser nouveaux paris /
> liste modifiable / mises visibles), **Code d'invitation** (`nl-codebox` + bouton
> « Régénérer » / « Révoquer »), et une **zone danger** (`nl-toprule` corail) :
> « Supprimer le cercle » / « Quitter ».
>
> **6. Membres & rôles (desktop + mobile)** — liste des membres : `avatar()` + pseudo +
> rang, un `nl-pill` de rôle (Admin / Membre), menu d'actions par ligne (Promouvoir admin
> `crown`, Retirer `x` en corail). En tête, un `nl-chip` « Inviter » qui rappelle le code.
> Variante mobile en cartes empilées.
>
> Expose : `N.adminCatalogDesktop`, `N.celebEditDesktop`, `N.celebEditMobile`,
> `N.celebCreateDesktop`, `N.circleSettingsDesktop`, `N.circleSettingsMobile`,
> `N.circleMembersDesktop`, `N.circleMembersMobile`.

---

## Prompt C — Admin de cercle (réglages & membres)

> **Préfixe avec le bloc de contexte commun ci-dessus.** `admin.js` ne couvre que le
> catalogue **global** ; ce prompt génère le fichier manquant `docs/mockups/screens/circle-admin.js`
> pour l'**admin de cercle** (pouvoir issu de `Membership.role`, pas du rôle global). Onglets
> internes d'un écran cercle : `Classement · Paris · Membres · Réglages` — ici **Réglages** et
> **Membres**, vus par un admin de cercle. Signale le pouvoir par un `nl-rolebadge` discret
> « Admin du cercle » (icône `crown`), jamais agressif.
>
> Réutilise les primitives de `forms.js` (`field`/`input`, `switchRow`, `choice`, `nl-codebox`)
> et le shell desktop `deskShell` (rail avec **Cercles actif**, fil d'Ariane « Mes cercles /
> <nom du cercle> / Réglages »). Desktop + mobile pour chaque écran.
>
> **1. Réglages du cercle (desktop + mobile)** — carte `nl-card nl-toprule`, max-width ~620px :
> - `field("Nom du cercle", …)` éditable + `field` visibilité via `choice("prive"/"public")`.
> - Bloc « Saison 2026 » : `switchRow` × 3 (Autoriser de nouveaux paris / Liste modifiable /
>   Mises visibles), exactement comme `createBody`.
> - **Code d'invitation** : `nl-codebox` affichant le code (ex. `NEC–7F3`) + boutons
>   `nl-btn-ghost` « Régénérer » et « Révoquer » ; `nl-help` « Valable toute la saison ».
> - **Zone danger** (`nl-card-flat` + `nl-toprule--coral`, en bas, séparée) : « Quitter le
>   cercle » et, réservé au créateur, « Supprimer le cercle » en `nl-btn-danger` (`skull`).
>   Prévois une **modale de confirmation** suppression (réutilise le style de `adminDeleteDesktop`).
>
> **2. Membres & rôles (desktop + mobile)** — en-tête : titre « Membres · N » + `nl-chip`
> « Inviter » (rappelle le code). Liste type `nl-listrow` : `avatar(joueur)` + pseudo + rang
> (#) + score, un `nl-pill` de rôle (**Admin** néon / **Membre** neutre), et un menu d'actions
> par ligne — **Promouvoir admin** (`crown`), **Rétrograder**, **Retirer** (`x`, corail). La
> ligne « Vous » est marquée (`nl-av--ring`, pill « vous »). Variante mobile en cartes empilées.
> Ajoute un petit **état de confirmation** pour « Retirer » (action destructive).
>
> Expose : `N.circleSettingsDesktop`, `N.circleSettingsMobile`,
> `N.circleMembersDesktop`, `N.circleMembersMobile`, `N.circleLeaveDeleteModal`.

---

### Notes d'intégration (pour le dev, pas pour la génération)
- Auth réelle = composants **Clerk** themés via `appearance` ; ces maquettes ne servent
  qu'à fixer les valeurs néon à injecter, + les écrans custom autour (loading gate de
  `src/routes/_app.tsx`).
- Catalogue/édition célébrité = endpoints **admin global** ; réglages/membres = endpoints
  **admin de cercle**. Le scoring reste centralisé (`CelebritiesService.recalculatePoints`).
