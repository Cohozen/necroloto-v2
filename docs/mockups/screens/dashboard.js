/* Dashboard / cockpit — desktop + mobile */
(function () {
  const N = window.NECRO;
  const { icon, pixel, avatar, portrait, logo, fmt } = N;

  function nav(active) {
    const items = [["home", "home"], ["trophy", "leaderboard"], ["cards", "draft"], ["user", "profile"]];
    return `<aside class="nl-side">
      <div style="color:var(--nl-neon);margin-bottom:18px;filter:drop-shadow(0 0 calc(var(--nl-glow)*10px) rgba(var(--nl-neon-rgb)/.7))">${pixel("invader", "currentColor", 4)}</div>
      ${items.map(([ic, id]) => `<div class="nl-navitem ${id === active ? "nl-navitem--on" : ""}">${icon(ic, 22)}</div>`).join("")}
      <div style="flex:1"></div>
      ${avatar(N.players.you, 42, "nl-av--ring")}
    </aside>`;
  }

  function circleCard(c) {
    const ringTop = c.top3.map((id, i) => avatar(N.players[id], 34, i === 0 ? "nl-av--ring" : "")).join("");
    const accentGlow = c.accent === "mag" ? "nl-glow-mag" : c.accent === "coral" ? "nl-glow-coral" : "";
    const rankStr = c.public ? "#" + fmt(c.rank) : "#" + c.rank;
    const lead = c.rank === 1;
    return `<div class="nl-circle nl-toprule ${lead ? "nl-glow-green" : ""}">
      <div class="nl-circle__top">
        <div style="display:flex;gap:13px;align-items:center;min-width:0">
          <div class="nl-circle__crest">${pixel("invader", "currentColor", 3)}</div>
          <div style="min-width:0">
            <div class="nl-circle__name">${c.name}</div>
            <div class="nl-circle__meta" style="margin-top:6px">${N.privacyPill(c)}<span class="nl-pill">${icon("user", 13, 1.8)} ${fmt(c.members)}</span></div>
          </div>
        </div>
        <span class="nl-icon-btn" style="width:34px;height:34px;border-radius:10px;color:var(--nl-ink-3)">${icon("chevR", 16)}</span>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
        <span class="nl-stack">${ringTop}</span>
        ${lead ? `<span class="nl-streak">${icon("bolt", 13)} En tête</span>` : `<span class="nl-dim" style="font-size:12px">vous • ${rankStr}</span>`}
      </div>
      <div class="nl-circle__stats">
        <div class="nl-circle__rank"><span class="nl-eyebrow">Votre rang</span><b style="${lead ? "color:var(--nl-neon)" : ""}">${rankStr}</b></div>
        <span class="nl-score ${lead ? "" : "nl-score--flat"}">${c.pts} pts</span>
      </div>
    </div>`;
  }

  function feedItem(f, compact) {
    const c = N.celebById[f.celeb];
    return `<div class="nl-feed" style="${compact ? "padding:10px 12px" : ""}">
      <span style="display:flex;color:var(--nl-coral);filter:drop-shadow(0 0 calc(var(--nl-glow)*8px) rgba(var(--nl-coral-rgb)/.6))">${pixel("ghost", "currentColor", compact ? 3 : 4)}</span>
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.name}, ${c.age}</div>
        <div class="nl-dim" style="font-size:12px">${f.n} joueur·s ont marqué · ${f.when}</div>
      </div>
      <span class="nl-score nl-score--gain">+${f.pts}</span>
    </div>`;
  }

  // mini portraits for the current bet
  function betThumbs(ids, size) {
    return ids.map((id) => `<div style="width:${size}px">${portrait(N.celebById[id], { letter: size * 0.42, radius: 9 })}</div>`).join("");
  }

  function betCard(big) {
    const picks = ["gloria", "babet", "strog", "yola", "glen"];
    return `<div class="nl-card nl-toprule" style="padding:20px;display:flex;flex-direction:column;gap:16px">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div><div class="nl-eyebrow">Pari en cours</div><div class="nl-h2" style="margin-top:4px">Saison 2026</div></div>
        <span class="nl-pill" style="color:var(--nl-coral);border-color:rgba(var(--nl-coral-rgb)/.4)">${icon("lock", 13, 1.8)} clôture 31 déc.</span>
      </div>
      <div style="display:flex;align-items:flex-end;gap:14px">
        <div class="nl-display" style="font-size:${big ? 46 : 40}px">12<span style="color:var(--nl-ink-3);font-size:.6em"> / 15</span></div>
        <div class="nl-muted" style="font-size:13px;padding-bottom:6px">célébrités<br>sélectionnées</div>
      </div>
      <div class="nl-bar"><i style="width:80%"></i></div>
      <div style="display:flex;align-items:center;gap:8px">${betThumbs(picks, 40)}<div style="width:40px;height:40px;border-radius:9px;border:1px dashed var(--nl-line-2);display:flex;align-items:center;justify-content:center;color:var(--nl-ink-3)">${icon("plus", 18)}</div></div>
      <button class="nl-btn nl-btn-primary" style="width:100%">${icon("bolt", 16)} Continuer mon pari</button>
    </div>`;
  }

  // ---------- DESKTOP ----------
  function dashboardDesktop() {
    return `<div class="nl" data-screen-label="Dashboard · desktop">
      <div style="display:flex;height:100%;position:relative;z-index:1">
        ${nav("home")}
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          <div class="nl-topbar">
            <div><div class="nl-eyebrow">Bonsoir, Vous</div><div class="nl-h1" style="font-size:24px;margin-top:2px">Cockpit</div></div>
            <div class="nl-search" style="margin-left:18px">${icon("search", 16)} Rechercher une célébrité, un cercle… <kbd>⌘K</kbd></div>
            <div style="flex:1"></div>
            <div class="nl-year">${icon("cal", 16)}<b>2026</b>${icon("chevD", 15)}</div>
            <span class="nl-icon-btn">${icon("bell", 18)}</span>
          </div>

          <div style="flex:1;min-height:0;overflow:hidden;padding:22px;display:grid;grid-template-columns:1.7fr 1fr;gap:18px;align-content:start">
            <!-- left column -->
            <div style="display:flex;flex-direction:column;gap:18px;min-width:0">
              <!-- hero stat band -->
              <div class="nl-card nl-toprule nl-glow-green" style="padding:24px;display:grid;grid-template-columns:auto 1fr;gap:28px;align-items:center">
                <div style="display:flex;flex-direction:column;gap:6px">
                  <span class="nl-eyebrow">Score global</span>
                  <div class="nl-display nl-neon-ink" style="font-size:84px">${fmt(1630)}</div>
                  <div style="display:flex;gap:8px;align-items:center"><span class="nl-streak">${icon("flame", 13)} Série 3</span><span class="nl-pill">${icon("arrowU", 13, 2)} +185 cette sem.</span></div>
                </div>
                <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:18px;border-left:1px solid var(--nl-line);padding-left:28px">
                  <div class="nl-kpi"><span class="nl-kpi__v">4</span><span class="nl-kpi__l">Cercles</span></div>
                  <div class="nl-kpi"><span class="nl-kpi__v" style="color:var(--nl-coral)">9</span><span class="nl-kpi__l">Décès marqués</span></div>
                  <div class="nl-kpi"><span class="nl-kpi__v">#2</span><span class="nl-kpi__l">Meilleur rang</span></div>
                </div>
              </div>

              <!-- circles -->
              <div style="display:flex;align-items:center;justify-content:space-between">
                <div class="nl-h2">Vos cercles</div>
                <span class="nl-chip">${icon("plus", 14)} Nouveau cercle</span>
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">
                ${N.circles.map(circleCard).join("")}
              </div>
            </div>

            <!-- right rail -->
            <div style="display:flex;flex-direction:column;gap:18px;min-width:0">
              ${betCard(true)}
              <div style="display:flex;align-items:center;justify-content:space-between">
                <div class="nl-h2">Décès récents</div>
                <span class="nl-dim" style="font-size:12px">qui ont marqué</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:10px">
                ${N.feed.map((f) => feedItem(f)).join("")}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ---------- MOBILE ----------
  function dashboardMobile() {
    return `<div class="nl" data-screen-label="Dashboard · mobile">
      <div class="nl-scroll" style="display:flex;flex-direction:column">
        <div class="nl-mtop" style="position:relative;z-index:1">
          ${logo(0.95)}
          <div style="flex:1"></div>
          <span class="nl-icon-btn" style="width:38px;height:38px">${icon("bell", 18)}</span>
          ${avatar(N.players.you, 38, "nl-av--ring")}
        </div>

        <div style="position:relative;z-index:1;flex:1;overflow:hidden;padding:4px 16px 96px;display:flex;flex-direction:column;gap:14px">
          <!-- hero -->
          <div class="nl-card nl-toprule nl-glow-green" style="padding:18px">
            <div style="display:flex;align-items:flex-end;justify-content:space-between;gap:10px">
              <div>
                <span class="nl-eyebrow">Score global · 2026</span>
                <div class="nl-display nl-neon-ink" style="font-size:64px;margin-top:2px">${fmt(1630)}</div>
              </div>
              <div style="display:flex;flex-direction:column;gap:6px;align-items:flex-end">
                <span class="nl-streak">${icon("flame", 13)} Série 3</span>
                <span class="nl-pill" style="color:var(--nl-neon);border-color:rgba(var(--nl-neon-rgb)/.4)">${icon("arrowU", 12, 2)} +185</span>
              </div>
            </div>
            <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin-top:14px;border-top:1px solid var(--nl-line);padding-top:12px">
              <div class="nl-kpi"><span class="nl-kpi__v" style="font-size:26px">4</span><span class="nl-kpi__l">Cercles</span></div>
              <div class="nl-kpi"><span class="nl-kpi__v" style="font-size:26px;color:var(--nl-coral)">9</span><span class="nl-kpi__l">Décès</span></div>
              <div class="nl-kpi"><span class="nl-kpi__v" style="font-size:26px">#2</span><span class="nl-kpi__l">Top rang</span></div>
            </div>
          </div>

          <!-- bet CTA compact -->
          <div class="nl-card nl-toprule" style="padding:15px;display:flex;align-items:center;gap:14px">
            <div style="flex:1;min-width:0">
              <div class="nl-eyebrow">Pari en cours · 2026</div>
              <div style="display:flex;align-items:baseline;gap:6px;margin-top:3px;white-space:nowrap"><span class="nl-display" style="font-size:30px">12<span style="color:var(--nl-ink-3)"> / 15</span></span><span class="nl-muted" style="font-size:12px">sélectionnées</span></div>
              <div class="nl-bar" style="margin-top:8px"><i style="width:80%"></i></div>
            </div>
            <button class="nl-btn nl-btn-primary nl-btn-sm" style="flex:0 0 auto">${icon("bolt", 15)} Continuer</button>
          </div>

          <!-- recent deaths -->
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div class="nl-h2" style="font-size:17px">Décès récents</div>
            <span class="nl-dim" style="font-size:12px">qui ont marqué</span>
          </div>
          ${N.feed.slice(0, 2).map((f) => feedItem(f, true)).join("")}

          <!-- circles -->
          <div class="nl-h2" style="font-size:17px;margin-top:2px">Vos cercles</div>
          ${circleCard(N.circles[1])}
          ${circleCard(N.circles[0])}
        </div>

        <!-- bottom tab -->
        <nav class="nl-mbottom">
          <span class="nl-mtab nl-mtab--on">${icon("home", 22)} Accueil</span>
          <span class="nl-mtab">${icon("trophy", 22)} Classement</span>
          <span class="nl-mfab">${icon("plus", 24, 2.2)}</span>
          <span class="nl-mtab">${icon("cards", 22)} Mon pari</span>
          <span class="nl-mtab">${icon("user", 22)} Profil</span>
        </nav>
      </div>
    </div>`;
  }

  N.dashboardDesktop = dashboardDesktop;
  N.dashboardMobile = dashboardMobile;
  N.circleCard = circleCard;
  N.navRail = nav;
  N.feedItem = feedItem;
})();
