/* Foundations boards — split into 5 distinct pages for readability:
   01 Couleurs · 02 Typographie · 03 Boutons & contrôles ·
   04 Badges & avatars · 05 États clés                               */
(function () {
  const N = window.NECRO;
  const { icon, pixel, avatar, portrait, statusPill, logo } = N;

  function swatch(hex, name, code, dark) {
    return `<div class="nl-swatch" style="background:${hex};${dark ? "" : "color:#07140b;border-color:rgba(0,0,0,.2)"}">
      <b>${name}</b><code style="${dark ? "" : "color:rgba(0,0,0,.6)"}">${code}</code>
    </div>`;
  }

  function panel(label, body, span) {
    return `<section class="nl-card-flat nl-toprule" style="padding:22px;grid-column:span ${span || 1};display:flex;flex-direction:column;gap:16px">
      <div class="nl-eyebrow">${label}</div>${body}
    </section>`;
  }

  // Shared page chrome: numbered badge + title + tiny logo, on the neon shell.
  function pageShell(num, title, sub, body) {
    const badge = `<div style="width:48px;height:48px;flex:0 0 auto;border-radius:13px;display:flex;align-items:center;justify-content:center;
      font-family:var(--nl-display);font-weight:800;font-size:23px;color:var(--nl-neon);
      border:1px solid rgba(var(--nl-neon-rgb)/.4);background:rgba(var(--nl-neon-rgb)/.08);
      box-shadow:0 0 calc(var(--nl-glow)*18px) rgba(var(--nl-neon-rgb)/calc(var(--nl-glow)*.32))">${num}</div>`;
    return `<div class="nl" data-screen-label="${title}" style="height:auto">
      <div style="position:relative;z-index:1;padding:32px 36px 38px;display:flex;flex-direction:column;gap:24px">
        <header style="display:flex;align-items:center;gap:16px">
          ${badge}
          <div style="min-width:0">
            <div class="nl-eyebrow" style="margin-bottom:5px">Système néon / arcade · ${num} / 05</div>
            <div class="nl-h1" style="font-size:26px">${title}</div>
            <div class="nl-muted" style="font-size:14px;margin-top:3px;max-width:520px">${sub}</div>
          </div>
          <div style="margin-left:auto;align-self:flex-start">${logo(0.95)}</div>
        </header>
        ${body}
      </div>
    </div>`;
  }

  /* ===== 01 · COULEURS ===== */
  function foundationsColors() {
    const surfaces = `
      <div style="display:grid;grid-template-columns:repeat(2,1fr);gap:10px">
        ${swatch("#0B0B0F", "Charbon", "--nl-bg", true)}
        ${swatch("#14141C", "Surface", "--nl-surf", true)}
        ${swatch("#1A1A24", "Surface 2", "--nl-surf-2", true)}
        ${swatch("#22222E", "Surface 3", "--nl-surf-3", true)}
      </div>
      <div class="nl-dim" style="font-size:12px">Dark-mode intégral — la profondeur vient des dégradés + grain, pas des bordures.</div>`;

    const accents = `
      <div style="display:grid;grid-template-columns:repeat(1,1fr);gap:10px">
        ${swatch("#39FF6A", "Vert toxique", "--nl-neon")}
        ${swatch("#FF5A3C", "Corail", "--nl-coral")}
        ${swatch("#FF2E97", "Magenta", "--nl-magenta")}
      </div>
      <div class="nl-dim" style="font-size:12px">Néon = en vie / score · Corail = décès / points gagnés · Magenta = vous.</div>`;

    const ink = `
      <div style="display:flex;gap:22px;align-items:center;flex-wrap:wrap;color:var(--nl-ink-2);font-size:13px">
        <span style="display:flex;align-items:center;gap:8px"><i style="width:16px;height:16px;border-radius:4px;background:#F3F4F8"></i> Ink #F3F4F8</span>
        <span style="display:flex;align-items:center;gap:8px"><i style="width:16px;height:16px;border-radius:4px;background:#9B9CAC"></i> Muted #9B9CAC</span>
        <span style="display:flex;align-items:center;gap:8px"><i style="width:16px;height:16px;border-radius:4px;background:#5E5F6E"></i> Dim #5E5F6E</span>
      </div>`;

    const body = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start">
        ${panel("Surfaces — charbon / anthracite", surfaces)}
        ${panel("Accents néon — codes hex", accents)}
        ${panel("Texte / Ink — 3 niveaux", ink, 2)}
      </div>`;
    return pageShell("01", "Couleurs", "Palette charbon + trois accents néon. Contraste AA garanti sur fond sombre.", body);
  }

  /* ===== 02 · TYPOGRAPHIE ===== */
  function foundationsType() {
    const type = `
      <div style="display:flex;flex-direction:column;gap:16px">
        <div>
          <div class="nl-display nl-neon-ink" style="font-size:76px">1 240</div>
          <div class="nl-dim" style="font-size:12px;margin-top:4px">Display · Saira Condensed 800 — scores &amp; classement</div>
        </div>
        <hr class="nl-divider">
        <div style="display:flex;align-items:baseline;gap:18px;flex-wrap:wrap">
          <span class="nl-h1">Aa Titre</span>
          <span class="nl-h2 nl-muted">Aa Section</span>
          <span style="font-size:15px">Aa Corps de texte</span>
          <span class="nl-eyebrow">Aa Eyebrow</span>
        </div>
        <div class="nl-dim" style="font-size:12px">UI · Space Grotesk — 27 / 19 / 15 / 11 px</div>
        <hr class="nl-divider">
        <div class="nl-mono" style="font-size:14px;color:var(--nl-ink-2)">mono · Space Mono — cote 4.20 · +140 pts · 02:14:55</div>
        <div class="nl-dim" style="font-size:12px">Chiffres techniques : cotes, comptes à rebours, deltas de points.</div>
      </div>`;
    return pageShell("02", "Typographie", "Display condensé pour les scores, Space Grotesk pour l’UI, mono pour les chiffres techniques.", panel("Échelle typographique", type));
  }

  /* ===== 03 · BOUTONS & CONTRÔLES ===== */
  function foundationsButtons() {
    const buttons = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <button class="nl-btn nl-btn-primary">${icon("bolt", 16)} Parier maintenant</button>
        <button class="nl-btn nl-btn-ghost">${icon("plus", 16)} Rejoindre un cercle</button>
        <button class="nl-btn">Secondaire</button>
        <span class="nl-icon-btn">${icon("bell", 18)}</span>
      </div>
      <div class="nl-dim" style="font-size:12px">Primaire (néon plein) → action de pari · Ghost → action secondaire · Icône → utilitaire.</div>`;

    const tabs = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <span class="nl-tabs"><span class="nl-tab nl-tab--on">Classement</span><span class="nl-tab">Mises</span><span class="nl-tab">Activité</span></span>
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <span class="nl-chip nl-chip--on">${icon("flame", 14)} En vie</span>
        <span class="nl-chip">Tous</span>
      </div>
      <div class="nl-dim" style="font-size:12px">Onglets segmentés pour la navigation d’un cercle · chips pour filtrer le catalogue.</div>`;

    const body = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start">
        ${panel("Boutons", buttons)}
        ${panel("Onglets · filtres", tabs)}
      </div>`;
    return pageShell("03", "Boutons & contrôles", "Hiérarchie d’actions claire et contrôles de navigation / filtrage réutilisables.", body);
  }

  /* ===== 04 · BADGES & AVATARS ===== */
  function foundationsBadges() {
    const you = N.players.you;
    const sample = N.celebById;

    const statuses = `
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        ${statusPill(sample.vane)}
        ${statusPill(sample.gloria, { date: true })}
      </div>
      <div style="display:flex;gap:10px;flex-wrap:wrap;align-items:center">
        <span class="nl-score">+420 pts</span>
        <span class="nl-score nl-score--gain">${pixel("ghost", "currentColor", 2)} +140</span>
        <span class="nl-score nl-score--flat">0 pt</span>
        <span class="nl-streak">${icon("flame", 13)} Série 6</span>
        <span class="nl-odds">cote 4.2</span>
      </div>`;

    const avatars = `
      <div style="display:flex;gap:18px;align-items:center;flex-wrap:wrap">
        <span class="nl-stack">
          ${avatar(N.players.mort, 38)}${avatar(N.players.lea, 38)}${avatar(N.players.priya, 38)}
          <span class="nl-more" style="width:38px;height:38px">+5</span>
        </span>
        ${avatar(you, 46, "nl-av--ring")}
        ${avatar(N.players.sasha, 46, "nl-av--ring-mag")}
      </div>
      <div class="nl-dim" style="font-size:12px">Stack pour les membres d’un cercle · anneau néon = vous · anneau magenta = leader.</div>`;

    const circleCard = `
      <div class="nl-circle nl-toprule" style="width:100%">
        <div class="nl-circle__top">
          <div style="display:flex;gap:12px;align-items:center;min-width:0">
            <div class="nl-circle__crest">${pixel("invader", "currentColor", 3)}</div>
            <div style="min-width:0">
              <div class="nl-circle__name">Les Faucheurs du Dimanche</div>
              <div class="nl-circle__meta" style="margin-top:5px">${N.privacyPill(N.circles[0])}<span class="nl-pill">${icon("user", 13, 1.8)} 8</span></div>
            </div>
          </div>
        </div>
        <div class="nl-circle__stats">
          <div class="nl-circle__rank"><span class="nl-eyebrow">Votre rang</span><b>#2</b></div>
          <span class="nl-score">420 pts</span>
        </div>
      </div>`;

    const lbStates = `
      <div class="nl-lb" style="width:100%">
        <div class="nl-lbrow nl-lbrow--leader">
          <div class="nl-lbrow__rank">01</div>
          <div class="nl-lbrow__id">${avatar(N.players.sasha, 38, "nl-av--ring")}<div><div class="nl-lbrow__name">Sasha Volkov</div><div class="nl-lbrow__sub">4 décès · série 1</div></div></div>
          <div class="nl-lbrow__pts">615<small>pts</small></div>
        </div>
        <div class="nl-lbrow nl-lbrow--me">
          <div class="nl-lbrow__rank">02</div>
          <div class="nl-lbrow__id">${avatar(you, 38)}<div><div class="nl-lbrow__name">Vous</div><div class="nl-lbrow__sub">3 décès · série 3</div></div></div>
          <div class="nl-lbrow__pts">420<small>pts</small></div>
        </div>
        <div class="nl-lbrow nl-lbrow--last">
          <div class="nl-lbrow__rank">08</div>
          <div class="nl-lbrow__id">${avatar(N.players.gege, 38)}<div><div class="nl-lbrow__name">Tonton Gégé</div><div class="nl-lbrow__sub nl-coral-ink">lanterne rouge</div></div></div>
          <div class="nl-lbrow__pts">120<small>pts</small></div>
        </div>
      </div>`;

    const body = `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start">
        ${panel("Statuts · scores · cotes", statuses)}
        ${panel("Avatars", avatars)}
        ${panel("Carte cercle", circleCard)}
        ${panel("Ligne de classement — leader · vous · lanterne rouge", lbStates)}
      </div>`;
    return pageShell("04", "Badges & avatars", "Statuts vie/mort, scores néon, identités joueurs et les deux cartes structurantes du jeu.", body);
  }

  /* ===== 05 · ÉTATS CLÉS ===== */
  function foundationsStates() {
    const sample = N.celebById;

    const celebAlive = `
      <div class="nl-celeb" style="width:188px">
        <div class="nl-celeb__pic">${portrait(sample.buck, { letter: 60 })}</div>
        <div>
          <div class="nl-celeb__name">Buck Thunderlane</div>
          <div class="nl-celeb__sub">87 ans · °1938</div>
        </div>
        <div class="nl-celeb__foot">${statusPill(sample.buck)}<span class="nl-odds">6.5</span></div>
      </div>`;
    const celebDead = `
      <div class="nl-celeb nl-celeb--sel" style="width:188px">
        <div class="nl-celeb__check">${icon("check", 16, 2.4)}</div>
        <div class="nl-celeb__pic">${portrait(sample.gloria, { letter: 60 })}</div>
        <div>
          <div class="nl-celeb__name">Dame Gloria Ravensworth</div>
          <div class="nl-celeb__sub">96 ans · °1929</div>
        </div>
        <div class="nl-celeb__foot">${statusPill(sample.gloria, { date: true })}<span class="nl-score nl-score--gain" style="height:26px;font-size:15px">+140</span></div>
      </div>`;

    const body = `
      <section class="nl-card-flat nl-toprule" style="padding:24px;display:flex;flex-direction:column;gap:16px">
        <div class="nl-eyebrow">États clés — carte célébrité : vivante vs décédée (sélectionnée)</div>
        <div style="display:flex;gap:22px;flex-wrap:wrap;align-items:flex-start">
          <div style="display:flex;flex-direction:column;gap:8px"><span class="nl-dim" style="font-size:12px">Vivant·e — pas encore de points</span>${celebAlive}</div>
          <div style="display:flex;flex-direction:column;gap:8px"><span class="nl-dim" style="font-size:12px">Décédé·e — a rapporté des points, sélectionnée</span>${celebDead}</div>
          <div style="flex:1;min-width:240px;align-self:stretch;border-left:1px solid var(--nl-line);padding-left:22px;display:flex;flex-direction:column;gap:12px">
            <span class="nl-dim" style="font-size:12px">Bandeau « décès récents »</span>
            <div class="nl-feed">
              <span style="display:flex;color:var(--nl-coral);filter:drop-shadow(0 0 calc(var(--nl-glow)*8px) rgba(var(--nl-coral-rgb)/.7))">${pixel("ghost", "currentColor", 4)}</span>
              <div style="flex:1;min-width:0">
                <div style="font-weight:700;font-size:14px">Dame Gloria Ravensworth, 96</div>
                <div class="nl-dim" style="font-size:12px">a rapporté des points à 3 joueurs · il y a 2 j</div>
              </div>
              <span class="nl-score nl-score--gain">+140</span>
            </div>
            <div class="nl-bar"><i style="width:64%"></i></div>
            <span class="nl-dim" style="font-size:12px">Barre de progression — saison 2026</span>
          </div>
        </div>
      </section>`;
    return pageShell("05", "États clés", "Les états qui portent le jeu : une célébrité vivante vs décédée sélectionnée, et le flux des décès récents.", body);
  }

  N.foundationsColors  = foundationsColors;
  N.foundationsType    = foundationsType;
  N.foundationsButtons = foundationsButtons;
  N.foundationsBadges  = foundationsBadges;
  N.foundationsStates  = foundationsStates;
})();
