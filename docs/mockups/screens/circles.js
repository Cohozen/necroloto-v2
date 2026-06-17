/* « Mes cercles » hub — circle card component + filled/empty states, desktop + mobile */
(function () {
  const N = window.NECRO;
  const { icon, pixel, avatar, logo } = N;

  // podium points per circle (leader, 2nd, 3rd) aligned with circle.top3
  const POD = {
    caveau:    [510, 470, 360],
    faucheurs: [615, 420, 405],
    bureau:    [640, 520, 410],
    grim:      [9820, 9510, 9300],
  };
  // my rank label per circle
  const MYRANK = {
    caveau:    { rank: "#1", state: "lead", tag: "En tête" },
    faucheurs: { rank: "#2", state: "", tag: null },
    bureau:    { rank: "#5", state: "", tag: null },
    grim:      { rank: "#318", state: "low", tag: null },
  };

  // ---- mini podium preview (2-1-3 order) ----
  function miniPodium(c) {
    const pts = POD[c.id];
    const order = [[1, c.top3[1], pts[1]], [0, c.top3[0], pts[0]], [2, c.top3[2], pts[2]]];
    return `<div class="nl-mpod">
      ${order.map(([slot, pid, pt]) => {
        const place = slot + 1;
        const p = N.players[pid];
        const size = place === 1 ? 34 : 28;
        return `<div class="nl-mpod__cell nl-mpod__cell--${place}">
          <div class="nl-mpod__medal">${place}</div>
          ${avatar(p, size, place === 1 ? "nl-av--ring" : "")}
          <div class="nl-mpod__name">${p.isYou ? "Vous" : p.name.split(" ")[0]}</div>
          <div class="nl-mpod__pts">${N.fmt(pt)}</div>
        </div>`;
      }).join("")}
    </div>`;
  }

  // ===========================================================
  //  CIRCLE CARD — the deliverable component
  // ===========================================================
  function circleCard(c) {
    const mr = MYRANK[c.id];
    const lead = mr.state === "lead";
    return `<article class="nl-circle nl-toprule ${lead ? "nl-glow-green" : ""}" style="gap:14px">
      <div class="nl-circle__top">
        <div style="display:flex;gap:13px;align-items:center;min-width:0">
          <div class="nl-circle__crest">${pixel("invader", "currentColor", 3)}</div>
          <div style="min-width:0;display:flex;flex-direction:column;gap:7px">
            <div class="nl-circle__name" style="line-height:1.2">${c.name}</div>
            <div class="nl-circle__meta">
              ${N.privacyPill(c)}
              <span class="nl-pill">${icon("user", 13, 1.8)} ${N.fmt(c.members)}</span>
              ${mr.tag ? `<span class="nl-streak">${icon("bolt", 12)} ${mr.tag}</span>` : ""}
            </div>
          </div>
        </div>
        <span class="nl-icon-btn" style="width:34px;height:34px;border-radius:10px;color:var(--nl-ink-3)">${icon("chevR", 16)}</span>
      </div>

      ${miniPodium(c)}

      <div class="nl-circle__stats" style="border-top:1px solid var(--nl-line);padding-top:13px">
        <div class="nl-rankchip ${lead ? "nl-rankchip--lead" : mr.state === "low" ? "nl-rankchip--low" : ""}">
          <span>Mon rang</span><b>${mr.rank}</b>
        </div>
        <div style="display:flex;align-items:center;gap:9px">
          <span class="nl-score ${lead ? "" : "nl-score--flat"}">${N.fmt(c.pts)} pts</span>
          <button class="nl-btn nl-btn-sm ${lead ? "nl-btn-primary" : "nl-btn-ghost"}">Voir</button>
        </div>
      </div>
    </article>`;
  }
  N.circleCard2 = circleCard;

  // shared action buttons
  const btnCreate = (sm) => `<button class="nl-btn nl-btn-primary${sm ? " nl-btn-sm" : ""}">${icon("plus", sm ? 15 : 17, 2.2)} Créer un cercle</button>`;
  const btnJoin = (sm) => `<button class="nl-btn nl-btn-ghost${sm ? " nl-btn-sm" : ""}">${icon("hash", sm ? 15 : 17)} Rejoindre via code</button>`;

  // desktop side rail with Cercles active
  function rail() {
    const items = [["home", 0], ["circles", 1], ["trophy", 0], ["cards", 0]];
    return `<aside class="nl-side">
      <div style="color:var(--nl-neon);margin-bottom:18px;filter:drop-shadow(0 0 calc(var(--nl-glow)*10px) rgba(var(--nl-neon-rgb)/.7))">${pixel("invader", "currentColor", 4)}</div>
      ${items.map(([ic, on]) => `<div class="nl-navitem ${on ? "nl-navitem--on" : ""}">${icon(ic, 22)}</div>`).join("")}
      <div style="flex:1"></div>
      ${avatar(N.players.you, 42, "nl-av--ring")}
    </aside>`;
  }

  // mobile bottom tab with Cercles active
  function mtab() {
    return `<nav class="nl-mbottom">
      <span class="nl-mtab">${icon("home", 22)} Accueil</span>
      <span class="nl-mtab nl-mtab--on">${icon("circles", 22)} Cercles</span>
      <span class="nl-mfab">${icon("plus", 24, 2.2)}</span>
      <span class="nl-mtab">${icon("trophy", 22)} Classement</span>
      <span class="nl-mtab">${icon("user", 22)} Profil</span>
    </nav>`;
  }

  // ===========================================================
  //  FILLED — desktop
  // ===========================================================
  function hubDesktop() {
    const order = ["caveau", "faucheurs", "bureau", "grim"];
    return `<div class="nl" data-screen-label="Mes cercles · desktop">
      <div style="display:flex;height:100%;position:relative;z-index:1">
        ${rail()}
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          <div class="nl-topbar">
            <div><div class="nl-eyebrow">Hub</div><div class="nl-h1" style="font-size:24px;margin-top:2px">Mes cercles</div></div>
            <div class="nl-search" style="margin-left:18px">${icon("search", 16)} Rechercher un cercle… <kbd>⌘K</kbd></div>
            <div style="flex:1"></div>
            ${btnJoin()}
            ${btnCreate()}
          </div>

          <div style="display:flex;align-items:center;gap:12px;padding:14px 22px;border-bottom:1px solid var(--nl-line)">
            <span class="nl-seg"><span class="nl-seg__i nl-seg__i--on">Tous · 4</span><span class="nl-seg__i">Privés · 3</span><span class="nl-seg__i">Publics · 1</span></span>
            <div style="flex:1"></div>
            <span class="nl-dim" style="font-size:13px">Saison 2026</span>
            <span class="nl-chip">${icon("filter", 14)} Mon rang</span>
          </div>

          <div style="flex:1;min-height:0;overflow:hidden;padding:22px;display:grid;grid-template-columns:repeat(3,1fr);gap:18px;align-content:start">
            ${order.map((id) => circleCard(N.circles.find((c) => c.id === id))).join("")}
            <div class="nl-ghostcard" style="min-height:230px;flex-direction:column;gap:14px">
              <div class="nl-empty-art" style="width:74px;height:74px"><span>${icon("plus", 26, 2)}</span></div>
              <div style="text-align:center"><div style="color:var(--nl-ink-2);font-weight:700">Un cercle de plus ?</div><div style="font-size:12px;margin-top:2px">Créez-en un ou entrez un code</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ===========================================================
  //  FILLED — mobile
  // ===========================================================
  function hubMobile() {
    const order = ["caveau", "faucheurs"];
    return `<div class="nl" data-screen-label="Mes cercles · mobile">
      <div class="nl-scroll" style="display:flex;flex-direction:column">
        <div class="nl-mtop" style="position:relative;z-index:1">
          <div><div class="nl-eyebrow">Hub</div><div class="nl-h1" style="font-size:23px;margin-top:2px">Mes cercles</div></div>
          <div style="flex:1"></div>
          <span class="nl-icon-btn" style="width:38px;height:38px">${icon("search", 18)}</span>
        </div>

        <div style="position:relative;z-index:1;flex:1;overflow:hidden;padding:6px 16px 96px;display:flex;flex-direction:column;gap:13px">
          <!-- prominent actions -->
          <div style="display:flex;gap:10px">
            <button class="nl-btn nl-btn-primary" style="flex:1">${icon("plus", 16, 2.2)} Créer</button>
            <button class="nl-btn nl-btn-ghost" style="flex:1">${icon("hash", 16)} Code</button>
          </div>

          <div style="display:flex;align-items:center;gap:9px;margin-top:2px">
            <span class="nl-seg"><span class="nl-seg__i nl-seg__i--on">Tous</span><span class="nl-seg__i">Privés</span><span class="nl-seg__i">Publics</span></span>
            <div style="flex:1"></div>
            <span class="nl-dim" style="font-size:12px">4 cercles</span>
          </div>

          ${order.map((id) => circleCard(N.circles.find((c) => c.id === id))).join("")}
        </div>

        ${mtab()}
      </div>
    </div>`;
  }

  // ===========================================================
  //  EMPTY — desktop
  // ===========================================================
  function emptyDesktop() {
    return `<div class="nl" data-screen-label="Mes cercles · vide · desktop">
      <div style="display:flex;height:100%;position:relative;z-index:1">
        ${rail()}
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          <div class="nl-topbar">
            <div><div class="nl-eyebrow">Hub</div><div class="nl-h1" style="font-size:24px;margin-top:2px">Mes cercles</div></div>
            <div style="flex:1"></div>
            <span class="nl-pill">${icon("user", 13, 1.8)} @croque_mort</span>
          </div>

          <div style="flex:1;min-height:0;overflow:hidden;display:flex;align-items:center;justify-content:center;padding:30px">
            <div style="max-width:520px;width:100%;text-align:center;display:flex;flex-direction:column;align-items:center;gap:18px">
              <div class="nl-empty-art"><span>${pixel("invader", "currentColor", 6)}</span></div>
              <div>
                <div class="nl-h1" style="font-size:30px">Aucun cercle… pour l'instant</div>
                <p class="nl-muted" style="font-size:15px;margin:10px auto 0;max-width:42ch;text-wrap:pretty">Un cercle, c'est votre bande de pronostiqueurs. Créez le vôtre et invitez vos potes, ou rejoignez-en un avec le code qu'on vous a filé.</p>
              </div>
              <div style="display:flex;gap:12px;margin-top:4px">
                ${btnCreate()}
                ${btnJoin()}
              </div>
              <div class="nl-codein" style="margin-top:8px">
                ${icon("hash", 18)}
                <span class="nl-codein__dots"><b>N</b><b>E</b><b>C</b>•••</span>
                <button class="nl-btn nl-btn-sm">Rejoindre</button>
              </div>
              <div style="display:flex;gap:22px;margin-top:8px;color:var(--nl-ink-3);font-size:12.5px">
                <span style="display:flex;align-items:center;gap:7px">${icon("lock", 14, 1.8)} Privé entre amis</span>
                <span style="display:flex;align-items:center;gap:7px">${icon("globe", 14, 1.8)} Ou cercles publics</span>
                <span style="display:flex;align-items:center;gap:7px">${icon("bolt", 14)} Gratuit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ===========================================================
  //  EMPTY — mobile
  // ===========================================================
  function emptyMobile() {
    return `<div class="nl" data-screen-label="Mes cercles · vide · mobile">
      <div class="nl-scroll" style="display:flex;flex-direction:column">
        <div class="nl-mtop" style="position:relative;z-index:1">
          <div class="nl-h1" style="font-size:23px">Mes cercles</div>
          <div style="flex:1"></div>
          ${avatar(N.players.you, 38, "nl-av--ring")}
        </div>

        <div style="position:relative;z-index:1;flex:1;overflow:hidden;padding:16px 22px 96px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center">
          <div class="nl-empty-art"><span>${pixel("invader", "currentColor", 5)}</span></div>
          <div>
            <div class="nl-h1" style="font-size:25px">Aucun cercle ici</div>
            <p class="nl-muted" style="font-size:14.5px;margin:9px auto 0;max-width:32ch;text-wrap:pretty">Créez votre bande de pronostiqueurs ou rejoignez-en une avec un code.</p>
          </div>
          <div style="display:flex;flex-direction:column;gap:11px;width:100%;max-width:320px;margin-top:4px">
            ${btnCreate()}
            ${btnJoin()}
          </div>
          <div class="nl-codein" style="margin-top:4px">
            ${icon("hash", 18)}
            <span class="nl-codein__dots"><b>N</b><b>E</b><b>C</b>•••</span>
            <button class="nl-btn nl-btn-sm">OK</button>
          </div>
        </div>

        ${mtab()}
      </div>
    </div>`;
  }

  // ===========================================================
  //  COMPONENT SPEC board
  // ===========================================================
  function cardSpec() {
    const states = [
      { id: "caveau", note: "En tête — glow néon, score plein, CTA primaire" },
      { id: "faucheurs", note: "Milieu de tableau — rang neutre, CTA fantôme" },
      { id: "grim", note: "Public, gros effectif — rang lointain, points atténués" },
    ];
    return `<div class="nl" data-screen-label="Composant · carte de cercle" style="height:auto;overflow:auto">
      <div style="position:relative;z-index:1;padding:30px 34px 40px;display:flex;flex-direction:column;gap:22px">
        <header style="display:flex;flex-direction:column;gap:6px">
          ${logo(1.05)}
          <div class="nl-h1" style="font-size:26px;margin-top:8px">Composant — carte de cercle</div>
          <div class="nl-muted" style="font-size:14px;max-width:64ch">Crest + nom, badge privé/public, nb de membres, aperçu du podium (top 3), mon rang et mon score. Trois états dérivés des mêmes données.</div>
        </header>
        <div style="display:grid;grid-template-columns:repeat(3,minmax(300px,1fr));gap:20px;align-items:start">
          ${states.map((s) => `<div style="display:flex;flex-direction:column;gap:10px">
            <div style="width:100%">${circleCard(N.circles.find((c) => c.id === s.id))}</div>
            <div class="nl-dim" style="font-size:12px;display:flex;gap:7px;align-items:flex-start"><span style="color:var(--nl-neon)">${icon("check", 14, 2.2)}</span><span>${s.note}</span></div>
          </div>`).join("")}
        </div>
      </div>
    </div>`;
  }

  N.hubDesktop = hubDesktop;
  N.hubMobile = hubMobile;
  N.emptyDesktop = emptyDesktop;
  N.emptyMobile = emptyMobile;
  N.cardSpec = cardSpec;
})();
