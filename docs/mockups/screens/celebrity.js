/* Fiche célébrité — desktop (alive + dead) + mobile */
(function () {
  const N = window.NECRO;
  const { icon, pixel, avatar, portrait, statusPill } = N;
  const CIRCLES_BY_BETTOR = ["Les Faucheurs du Dimanche", "Caveau de Famille", "Bureau Maudit", "Grim Reapers FC"];

  function fact(label, value, accent) {
    return `<div style="display:flex;flex-direction:column;gap:3px">
      <span class="nl-eyebrow">${label}</span>
      <span class="nl-display" style="font-size:26px;${accent ? "color:" + accent : ""}">${value}</span>
    </div>`;
  }

  function bettorRow(pid, c, idx) {
    const p = N.players[pid];
    const dead = c.status === "deceased";
    const circle = CIRCLES_BY_BETTOR[idx % CIRCLES_BY_BETTOR.length];
    return `<div style="display:flex;align-items:center;gap:13px;padding:11px 13px;border-radius:13px;background:var(--nl-surf);border:1px solid ${p.isYou ? "rgba(var(--nl-neon-rgb)/.4)" : "var(--nl-line)"}">
      ${avatar(p, 40, p.isYou ? "nl-av--ring" : "")}
      <div style="flex:1;min-width:0">
        <div style="font-weight:700;font-size:14px">${p.name}${p.isYou ? ' <span style="color:var(--nl-neon)">· vous</span>' : ""}</div>
        <div class="nl-dim" style="font-size:12px">${icon("user", 11, 1.8)} ${circle}</div>
      </div>
      ${dead ? `<span class="nl-score nl-score--gain">+${c.pts}</span>`
              : `<div style="text-align:right"><div class="nl-dim" style="font-size:10px;letter-spacing:.1em;text-transform:uppercase">potentiel</div><div class="nl-mono" style="font-weight:700;color:var(--nl-neon)">+${c.pts}</div></div>`}
    </div>`;
  }

  function pointsHero(c) {
    const dead = c.status === "deceased";
    if (dead) {
      return `<div class="nl-card nl-glow-coral" style="padding:20px;display:flex;align-items:center;gap:20px">
        <span style="display:flex;color:var(--nl-coral);filter:drop-shadow(0 0 calc(var(--nl-glow)*12px) rgba(var(--nl-coral-rgb)/.6))">${pixel("ghost", "currentColor", 6)}</span>
        <div style="flex:1">
          <div class="nl-eyebrow">Points attribués · décès confirmé</div>
          <div style="display:flex;align-items:baseline;gap:10px;margin-top:4px">
            <span class="nl-display nl-coral-ink" style="font-size:54px">+${c.pts}</span>
            <span class="nl-muted" style="font-size:14px">à ${c.bettors.length} joueur·s · ${c.deathLabel}</span>
          </div>
        </div>
      </div>`;
    }
    return `<div class="nl-card nl-glow-green" style="padding:20px;display:flex;align-items:center;gap:20px">
      <div style="width:64px;height:64px;border-radius:16px;display:flex;align-items:center;justify-content:center;background:rgba(var(--nl-neon-rgb)/.1);color:var(--nl-neon)">${icon("bolt", 30)}</div>
      <div style="flex:1">
        <div class="nl-eyebrow">Gain potentiel · si décès en 2026</div>
        <div style="display:flex;align-items:baseline;gap:10px;margin-top:4px">
          <span class="nl-display nl-neon-ink" style="font-size:54px">+${c.pts}</span>
          <span class="nl-muted" style="font-size:14px">cote ${c.cote} · ${c.bettors.length} parieur·s</span>
        </div>
      </div>
    </div>`;
  }

  // ---------- DESKTOP ----------
  function celebrityDesktop(id) {
    const c = N.celebById[id];
    const dead = c.status === "deceased";
    return `<div class="nl" data-screen-label="Fiche · ${dead ? "décédé" : "vivant"}">
      <div style="display:flex;height:100%;position:relative;z-index:1">
        ${N.navRail("draft")}
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          <div class="nl-topbar">
            <span class="nl-icon-btn">${icon("chevR", 18)}</span>
            <span class="nl-dim" style="font-size:13px">Catalogue <span style="opacity:.5">/</span> <span style="color:var(--nl-ink)">Fiche célébrité</span></span>
            <div style="flex:1"></div>
            <button class="nl-btn nl-btn-ghost nl-btn-sm">${icon("plus", 15)} Ajouter à mon pari</button>
            <span class="nl-icon-btn">${icon("bell", 18)}</span>
          </div>

          <div style="flex:1;min-height:0;overflow:hidden;padding:26px;display:grid;grid-template-columns:380px 1fr;gap:28px;align-content:start">
            <!-- portrait column -->
            <div style="display:flex;flex-direction:column;gap:16px">
              <div style="position:relative">
                <div style="width:100%;aspect-ratio:1/1">${portrait(c, { letter: 150, radius: 20 })}</div>
                <div style="position:absolute;left:16px;bottom:16px;z-index:3">${statusPill(c, { date: true })}</div>
              </div>
              <div class="nl-card-flat" style="padding:18px;display:grid;grid-template-columns:1fr 1fr;gap:18px">
                ${fact("Naissance", "°" + c.born)}
                ${fact("Âge", c.age + " ans")}
                ${fact("Cote", c.cote, "var(--nl-neon)")}
                <div style="display:flex;flex-direction:column;gap:6px"><span class="nl-eyebrow">Catégorie</span><span class="nl-pill" style="align-self:flex-start">${c.role}</span></div>
              </div>
            </div>

            <!-- info column -->
            <div style="display:flex;flex-direction:column;gap:20px;min-width:0">
              <div>
                <div class="nl-eyebrow">${c.role}</div>
                <h1 class="nl-display" style="font-size:64px;margin:6px 0 0;line-height:.95">${c.name}</h1>
              </div>
              ${pointsHero(c)}

              <div>
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:13px">
                  <div class="nl-h2">Qui a parié dessus</div>
                  <span class="nl-dim" style="font-size:12px">dans vos cercles · ${c.bettors.length} joueur·s</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:11px">
                  ${c.bettors.map((pid, i) => bettorRow(pid, c, i)).join("")}
                </div>
              </div>

              <div style="display:flex;align-items:center;gap:10px;color:var(--nl-ink-3);font-size:12px;margin-top:auto">
                ${icon("globe", 14, 1.8)} Données biographiques synchronisées depuis Wikidata · maj il y a 3 j
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ---------- MOBILE ----------
  function celebrityMobile(id) {
    const c = N.celebById[id];
    const dead = c.status === "deceased";
    return `<div class="nl" data-screen-label="Fiche · mobile">
      <div class="nl-scroll" style="display:flex;flex-direction:column">
        <!-- portrait header -->
        <div style="position:relative;z-index:1;height:340px;flex:0 0 auto">
          ${portrait(c, { letter: 130, radius: 0 })}
          <div style="position:absolute;inset:0;background:linear-gradient(180deg, transparent 35%, var(--nl-bg) 98%)"></div>
          <div style="position:absolute;top:14px;left:14px;right:14px;display:flex;align-items:center;gap:10px">
            <span class="nl-icon-btn" style="width:38px;height:38px;background:rgba(11,11,15,.5);backdrop-filter:blur(6px)">${icon("chevR", 18)}</span>
            <div style="flex:1"></div>
            <span class="nl-icon-btn" style="width:38px;height:38px;background:rgba(11,11,15,.5);backdrop-filter:blur(6px)">${icon("plus", 18)}</span>
          </div>
          <div style="position:absolute;left:16px;right:16px;bottom:14px;z-index:2">
            <div class="nl-eyebrow">${c.role}</div>
            <h1 class="nl-display" style="font-size:38px;margin:5px 0 8px;line-height:.95">${c.name}</h1>
            ${statusPill(c, { date: true })}
          </div>
        </div>

        <div style="position:relative;z-index:1;flex:1;overflow:hidden;padding:14px 16px 96px;display:flex;flex-direction:column;gap:14px">
          <div class="nl-card-flat" style="padding:14px;display:flex;justify-content:space-around;text-align:center">
            ${fact("Né", "°" + c.born)}${fact("Âge", c.age)}${fact("Cote", c.cote, "var(--nl-neon)")}
          </div>
          ${pointsHero(c)}
          <div class="nl-h2" style="font-size:16px">Qui a parié dessus</div>
          ${c.bettors.slice(0, 3).map((pid, i) => bettorRow(pid, c, i)).join("")}
          <div style="display:flex;align-items:center;gap:8px;color:var(--nl-ink-3);font-size:11px;justify-content:center">
            ${icon("globe", 13, 1.8)} Données Wikidata
          </div>
        </div>

        <nav class="nl-mbottom">
          <span class="nl-mtab">${icon("home", 22)} Accueil</span>
          <span class="nl-mtab">${icon("trophy", 22)} Classement</span>
          <span class="nl-mfab">${icon("plus", 24, 2.2)}</span>
          <span class="nl-mtab nl-mtab--on">${icon("cards", 22)} Mon pari</span>
          <span class="nl-mtab">${icon("user", 22)} Profil</span>
        </nav>
      </div>
    </div>`;
  }

  N.celebrityDesktop = celebrityDesktop;
  N.celebrityMobile = celebrityMobile;
})();
