# Front web — pages & navigation (V2)

Référence pour les maquettes (Phase 5). Proposition de navigation **remaniée** par
rapport à la v1 (Next.js), pensée **mobile-first** (DA néon / arcade sombre).

> Note : ce sont des écrans/flux, pas des routes figées. Le routing réel sera décidé
> à l'implémentation (Vite + TanStack Router). Les chemins ci-dessous sont indicatifs.

> **Statut d'implémentation (`apps/web`)** — la nav réelle suit les labels des maquettes
> (Accueil / Classement / Mon pari / Profil + FAB), pas exactement le modèle ci-dessous.
> Faits (données mock) : **Dashboard** `/dashboard`, **Classement** `/circles/$id`,
> **Fiche célébrité** `/celebrities/$id`, **Mon pari / catalogue** `/celebrities`.
> À venir : hub cercles, créer/rejoindre, profil, landing, puis branchement API.

## Modèle de navigation

- **Bottom tab bar** (4 onglets, mobile-first) :
  `🏠 Accueil` · `🏆 Cercles` · `🎭 Catalogue` · `👤 Profil`
- **L'année est un élément de nav de premier ordre** : un sélecteur d'année visible
  dans tout le contexte « cercle » (fini les années codées en dur de la v1).
- **Dans un cercle** : onglets internes `Classement · Paris · Membres · Réglages`.

## Écrans à maquetter

### Public / Auth
- **Landing `/`** — logo, accroche (« Défiez le destin »), CTA S'inscrire / Connexion,
  règles du jeu en bref.
- **Connexion / Inscription** — Clerk (peu de design custom, mais caler le thème dark/néon).

### Onglet Accueil (dashboard global) `/`
- Vue d'ensemble joueur : **mes cercles** (cartes), **score agrégé**, bandeau
  **décès récents** ayant marqué des points, **CTA vers mon pari de l'année en cours**.
- Remplace le `/overview` v1 ; ne duplique plus « mon pari » avec l'accueil cercle.

### Onglet Cercles `/circles`
- **Hub « mes cercles »** (vrai écran, pas une redirection comme en v1) : liste/switcher
  de cercles + actions **Créer un cercle** et **Rejoindre via code**.
- **Créer un cercle** — nom, visibilité (privé/public), réglages initiaux. *(nouveau — absent en v1)*
- **Rejoindre un cercle** — saisie d'un code. *(nouveau — absent en v1)*

### Écran Cercle `/circles/[id]` (onglets + sélecteur d'année)
- **Classement** — leaderboard : avatars, points, rang, **podium top 3** mis en avant
  (glow néon), triable, filtrable par année. Cœur compétitif.
- **Paris** — tous les paris du cercle pour l'année ; détail d'un pari (sur qui a parié
  un joueur). *(fusionne `/rank` + `/bets` de la v1 en onglets d'un même écran)*
- **Membres** — liste des membres + rôles.
- **Réglages** — paramètres du cercle (**admin de cercle** uniquement).

### Composer mon pari `/circles/[id]/bet/[year]`
- « Draft » du joueur : **recherche** (command palette), cartes célébrités avec
  **photo, nom, âge/naissance**, sélection/désélection fluide, **compteur de sélection**.

### Onglet Catalogue `/celebrities`
- **Browse global** des célébrités + recherche. Exploration/curiosité (distinct de
  « composer mon pari », qui est l'action de jeu).
- **Fiche célébrité `/celebrities/[id]`** — grande photo, nom, naissance, **statut
  (vivant·e / décédé·e + date)**, et **qui a parié sur elle** dans mes cercles. Données Wikidata.
- **Éditer une célébrité** — formulaire (**admin global** uniquement).

### Onglet Profil `/profile`
- Profil utilisateur + édition (nom, avatar…).

## Priorité maquettes (les 4 écrans clés validés)
1. **Accueil / dashboard** (avec breakpoints mobile + desktop)
2. **Classement d'un cercle** (avec breakpoints mobile + desktop)
3. **Mon pari / catalogue** (recherche + cartes célébrités)
4. **Fiche célébrité** (états vivant·e / décédé·e)

## Écarts notables vs v1 (pour mémoire)
- `/circles` devient un vrai hub (au lieu d'une redirection vers le 1er cercle).
- `/overview` et `/circles/[id]` ne se chevauchent plus (dashboard global vs accueil cercle).
- `/rank` + `/bets` fusionnés en onglets.
- Années codées en dur → sélecteur d'année.
- Créer / Rejoindre un cercle deviennent de vrais écrans (onboarding).
