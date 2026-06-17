/* Profil — desktop + mobile (Profil tab active) */
(function () {
  const N = window.NECRO;
  const { icon, pixel, avatar, logo } = N;

  const ME = { name: "Camille Voss", handle: "@croque_mort", initial: "V", grad: 2, joined: "déc. 2024" };

  // ---- pieces ----
  function statTile(opts) {
    // { ic, value, label, tone }
    const tone = opts.tone ? ` nl-stat-tile--${opts.tone}` : "";
    return `<div class="nl-stat-tile${tone}">
      <span class="nl-toprule-i"></span>
      <div style="display:flex;align-items:center;justify-content:space-between">
        <div class="nl-stat-tile__ic">${icon(opts.ic, 18)}</div>
        ${opts.chip ? `<span class="nl-pill" style="height:22px;padding:0 8px;font-size:11px">${opts.chip}</span>` : ""}
      </div>
      <div class="nl-stat-tile__v">${opts.value}</div>
      <div class="nl-stat-tile__l">${opts.label}</div>
    </div>`;
  }

  function badge(opts) {
    // { ic, t, d, tone, locked }
    const cls = "nl-badge" + (opts.tone ? ` nl-badge--${opts.tone}` : "") + (opts.locked ? " nl-badge--locked" : "");
    return `<div class="${cls}">
      <div class="nl-badge__medal">${icon(opts.locked ? "lock" : opts.ic, 22)}</div>
      <div class="nl-badge__t">${opts.t}</div>
      <div class="nl-badge__d">${opts.d}</div>
    </div>`;
  }

  const BADGES = [
    { ic: "fire", t: "Série de 3", d: "3 saisons d'affilée", tone: "" },
    { ic: "medal", t: "Sur le podium", d: "Top 3 d'un cercle", tone: "mag" },
    { ic: "skull", t: "Première proie", d: "1er pronostic juste", tone: "coral" },
    { ic: "star", t: "Oracle", d: "5 décès marqués", tone: "" },
    { t: "Sans-faute", d: "Verrouillé", locked: true },
  ];

  function statsGrid() {
    return `${statTile({ ic: "bolt", value: N.fmt(1630), label: "Score total", chip: "+185" })}
      ${statTile({ ic: "circles", value: "4", label: "Cercles" })}
      ${statTile({ ic: "trophy", value: "#2", label: "Meilleur rang", tone: "mag" })}
      ${statTile({ ic: "skull", value: "9", label: "Décès marqués", tone: "coral" })}`;
  }

  function settingsList() {
    const row = (ic, t, d, opts) => `<div class="nl-listrow ${opts && opts.danger ? "nl-listrow--danger" : ""}">
      <div class="nl-listrow__ic">${icon(ic, 17)}</div>
      <div style="flex:1;min-width:0"><div class="nl-listrow__t">${t}</div>${d ? `<div class="nl-listrow__d">${d}</div>` : ""}</div>
      ${opts && opts.right ? opts.right : `<span class="nl-listrow__chev">${icon("chevR", 16)}</span>`}
    </div>`;
    return `<div class="nl-list">
      ${row("pencil", "Pseudo & avatar", "Modifier votre identité de joueur")}
      ${row("shield", "Compte & sécurité", "E-mail, mot de passe, connexion")}
      ${row("bell", "Notifications", "Décès, classements, invitations", { right: `<span class="nl-switch nl-switch--on"><span class="nl-switch__knob"></span></span>` })}
      ${row("lock", "Confidentialité", "Profil public, mises visibles")}
    </div>`;
  }

  function logoutList() {
    return `<div class="nl-list">
      <div class="nl-listrow nl-listrow--danger">
        <div class="nl-listrow__ic">${icon("logout", 17)}</div>
        <div style="flex:1"><div class="nl-listrow__t">Déconnexion</div></div>
        <span class="nl-listrow__chev">${icon("chevR", 16)}</span>
      </div>
    </div>`;
  }

  // profile header (avatar + identity), variant: 'big' (desktop) | 'mob'
  function profHeader(variant) {
    const big = variant === "big";
    const avSize = big ? 92 : 76;
    return `<div class="nl-profhead" style="padding:${big ? "26px 28px" : "22px 20px"}">
      <div class="nl-profhead__grid"></div>
      <div style="position:relative;z-index:1;display:flex;align-items:center;gap:${big ? 22 : 16}px">
        <div class="nl-prof-av">
          ${avatar(ME, avSize, "nl-av--ring")}
          <div class="nl-prof-av__edit">${icon("camera", 15, 1.9)}</div>
        </div>
        <div style="flex:1;min-width:0;display:flex;flex-direction:column;gap:7px">
          <div class="nl-prof-name" style="font-size:${big ? 32 : 26}px">${ME.name}</div>
          <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
            <span class="nl-prof-handle">${ME.handle}</span>
            <span class="nl-dim" style="font-size:12px">· depuis ${ME.joined}</span>
          </div>
          <div class="nl-level" style="margin-top:2px">
            <span class="nl-level__rank">RANG #2</span>
            <span class="nl-streak">${icon("fire", 13)} Série 3</span>
          </div>
        </div>
        ${big ? `<button class="nl-btn nl-btn-ghost nl-btn-sm" style="align-self:flex-start">${icon("pencil", 15)} Modifier le profil</button>` : ""}
      </div>
    </div>`;
  }

  function rail() {
    const items = [["home", 0], ["circles", 0], ["trophy", 0], ["cards", 0]];
    return `<aside class="nl-side">
      <div style="color:var(--nl-neon);margin-bottom:18px;filter:drop-shadow(0 0 calc(var(--nl-glow)*10px) rgba(var(--nl-neon-rgb)/.7))">${pixel("invader", "currentColor", 4)}</div>
      ${items.map(([ic, on]) => `<div class="nl-navitem ${on ? "nl-navitem--on" : ""}">${icon(ic, 22)}</div>`).join("")}
      <div style="flex:1"></div>
      <div class="nl-navitem nl-navitem--on" style="width:46px;height:46px;padding:0">${avatar(ME, 38)}</div>
    </aside>`;
  }

  function mtab() {
    return `<nav class="nl-mbottom">
      <span class="nl-mtab">${icon("home", 22)} Accueil</span>
      <span class="nl-mtab">${icon("circles", 22)} Cercles</span>
      <span class="nl-mfab">${icon("plus", 24, 2.2)}</span>
      <span class="nl-mtab">${icon("trophy", 22)} Classement</span>
      <span class="nl-mtab nl-mtab--on">${icon("user", 22)} Profil</span>
    </nav>`;
  }

  // ---- sections ----
  function sectionLabel(t, extra) {
    return `<div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
      <div class="nl-eyebrow">${t}</div>${extra || ""}
    </div>`;
  }

  // ============================================================
  //  DESKTOP
  // ============================================================
  function profileDesktop() {
    return `<div class="nl" data-screen-label="Profil · desktop">
      <div style="display:flex;height:100%;position:relative;z-index:1">
        ${rail()}
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          <div class="nl-topbar">
            <div><div class="nl-eyebrow">Compte</div><div class="nl-h1" style="font-size:24px;margin-top:2px">Profil</div></div>
            <div style="flex:1"></div>
            <span class="nl-pill">${icon("cal", 13, 1.8)} Saison 2026</span>
            <span class="nl-icon-btn">${icon("settings", 18)}</span>
          </div>

          <div style="flex:1;min-height:0;overflow:hidden;padding:24px;display:flex;flex-direction:column;gap:20px;align-content:start">
            ${profHeader("big")}
            <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:20px;align-items:start;min-height:0">
              <div style="display:flex;flex-direction:column;gap:18px;min-width:0">
                ${sectionLabel("Statistiques", `<span class="nl-dim" style="font-size:12px">toutes saisons</span>`)}
                <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px">${statsGrid()}</div>
                ${sectionLabel("Badges arcade", `<span class="nl-dim" style="font-size:12px">4 / 5 débloqués</span>`)}
                <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:12px">${BADGES.map(badge).join("")}</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:18px;min-width:0">
                ${sectionLabel("Réglages du compte")}
                ${settingsList()}
                ${logoutList()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ============================================================
  //  MOBILE
  // ============================================================
  function profileMobile() {
    return `<div class="nl" data-screen-label="Profil · mobile">
      <div class="nl-scroll" style="display:flex;flex-direction:column">
        <div class="nl-mtop" style="position:relative;z-index:1">
          <div class="nl-h1" style="font-size:22px">Profil</div>
          <div style="flex:1"></div>
          <span class="nl-icon-btn" style="width:38px;height:38px">${icon("settings", 18)}</span>
        </div>

        <div style="position:relative;z-index:1;flex:1;overflow:hidden;padding:6px 16px 96px;display:flex;flex-direction:column;gap:16px">
          ${profHeader("mob")}
          <button class="nl-btn nl-btn-ghost" style="width:100%">${icon("pencil", 15)} Modifier le profil</button>

          ${sectionLabel("Statistiques")}
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">${statsGrid()}</div>

          ${sectionLabel("Badges arcade", `<span class="nl-dim" style="font-size:12px">4 / 5</span>`)}
          <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:10px">${BADGES.slice(0, 4).map(badge).join("")}</div>

          ${sectionLabel("Réglages du compte")}
          ${settingsList()}
          ${logoutList()}
        </div>

        ${mtab()}
      </div>
    </div>`;
  }

  N.profileDesktop = profileDesktop;
  N.profileMobile = profileMobile;
})();
