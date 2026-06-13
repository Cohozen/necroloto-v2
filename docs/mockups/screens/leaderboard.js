/* Classement d'un cercle — desktop + mobile */
(function () {
  const N = window.NECRO;
  const { icon, pixel, avatar, portrait, statusPill } = N;
  const circle = N.circles[0]; // Les Faucheurs du Dimanche
  const LB = N.leaderboard;

  function yearFilter(active) {
    return ["2024", "2025", "2026"].map((y) =>
      `<span class="nl-tab ${y === active ? "nl-tab--on" : ""}">${y}</span>`).join("");
  }

  // podium cell
  function pod(entry, place) {
    const p = N.players[entry.p];
    const cls = `nl-pod nl-pod--${place}`;
    const ring = place === 1 ? "nl-av--ring" : "";
    const me = p.isYou ? `<span class="nl-pill" style="height:22px;padding:0 8px;color:var(--nl-neon);border-color:rgba(var(--nl-neon-rgb)/.4)">vous</span>` : "";
    return `<div class="${cls}">
      <div class="nl-pod__medal">${place}</div>
      ${avatar(p, place === 1 ? 60 : 50, ring)}
      <div style="display:flex;flex-direction:column;gap:3px;align-items:center">
        <div class="nl-pod__name">${p.name}</div>
        <div class="nl-dim" style="font-size:11px">${entry.hits} décès marqués</div>
      </div>
      <div class="nl-pod__pts">${entry.pts}</div>
      ${me || `<span class="nl-dim" style="font-size:11px;letter-spacing:.1em;text-transform:uppercase">pts</span>`}
    </div>`;
  }

  // leaderboard row (ranks 4..8)
  function row(entry, rank, compact) {
    const p = N.players[entry.p];
    const last = rank === LB.length;
    const me = p.isYou;
    const cls = "nl-lbrow" + (last ? " nl-lbrow--last" : "") + (me ? " nl-lbrow--me" : "");
    const picks = entry.picks.slice(0, 4).map((id) =>
      `<div style="width:24px">${portrait(N.celebById[id], { letter: 11, radius: 6 })}</div>`).join("");
    return `<div class="${cls}">
      <div class="nl-lbrow__rank">${String(rank).padStart(2, "0")}</div>
      <div class="nl-lbrow__id">
        ${avatar(p, 40)}
        <div style="min-width:0">
          <div class="nl-lbrow__name">${p.name}${me ? ' <span style="color:var(--nl-neon)">· vous</span>' : ""}</div>
          <div class="nl-lbrow__sub">${last ? '<span class="nl-coral-ink">lanterne rouge</span>' : `${entry.hits} décès`} · ${p.streak ? "série " + p.streak : "—"}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:16px">
        ${compact ? "" : `<div style="display:flex;align-items:center;gap:6px" title="mises">
          <span class="nl-stack" style="margin-right:2px">${picks}</span>
          <span class="nl-dim" style="font-size:11px">${entry.picks.length} mises</span>
        </div>`}
        <div class="nl-lbrow__pts">${entry.pts}<small>pts</small></div>
      </div>
    </div>`;
  }

  // "sur qui a parié X" rail
  function picksRail(entry) {
    const p = N.players[entry.p];
    const rows = entry.picks.map((id) => {
      const c = N.celebById[id];
      const dead = c.status === "deceased";
      return `<div style="display:flex;align-items:center;gap:11px;padding:9px 11px;border-radius:11px;background:var(--nl-surf);border:1px solid ${dead ? "rgba(var(--nl-coral-rgb)/.3)" : "var(--nl-line)"}">
        <div style="width:38px">${portrait(c, { letter: 15, radius: 8 })}</div>
        <div style="flex:1;min-width:0">
          <div style="font-weight:600;font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.name}</div>
          <div class="nl-dim" style="font-size:11px">${c.role}</div>
        </div>
        ${dead ? `<span class="nl-score nl-score--gain" style="height:26px;font-size:14px">+${c.pts}</span>`
                : `<span class="nl-status nl-status--alive" style="height:24px;font-size:11px"><span class="nl-dot nl-dot--alive"></span></span>`}
      </div>`;
    }).join("");
    return `<div class="nl-card nl-toprule" style="padding:18px;display:flex;flex-direction:column;gap:14px;min-width:0">
      <div style="display:flex;align-items:center;gap:11px">
        ${avatar(p, 38, "nl-av--ring")}
        <div style="flex:1;min-width:0"><div class="nl-eyebrow">Mises de</div><div style="font-weight:700;font-size:15px">${p.name}</div></div>
        <span class="nl-icon-btn" style="width:32px;height:32px;border-radius:9px;color:var(--nl-ink-3)">${icon("chevD", 16)}</span>
      </div>
      <div style="display:flex;align-items:center;gap:8px">
        <span class="nl-score">${entry.pts} pts</span>
        <span class="nl-pill">${entry.hits} décès</span>
        <span class="nl-pill">${entry.picks.length} célébrités</span>
      </div>
      <hr class="nl-divider">
      <div style="display:flex;flex-direction:column;gap:8px">${rows}</div>
    </div>`;
  }

  function header(compact) {
    return `<div style="display:flex;align-items:center;gap:13px;min-width:0">
      <div class="nl-circle__crest" style="width:${compact ? 40 : 46}px;height:${compact ? 40 : 46}px">${pixel("invader", "currentColor", 3)}</div>
      <div style="min-width:0">
        <div class="nl-h1" style="font-size:${compact ? 19 : 23}px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${circle.name}</div>
        <div class="nl-circle__meta" style="margin-top:4px">${N.privacyPill(circle)}<span class="nl-pill">${icon("user", 13, 1.8)} ${circle.members}</span></div>
      </div>
    </div>`;
  }

  // ---------- DESKTOP ----------
  function leaderboardDesktop() {
    return `<div class="nl" data-screen-label="Classement · desktop">
      <div style="display:flex;height:100%;position:relative;z-index:1">
        ${N.navRail("leaderboard")}
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          <div class="nl-topbar">
            ${header()}
            <div style="flex:1"></div>
            <span class="nl-tabs">${yearFilter("2026")}</span>
            <span class="nl-icon-btn">${icon("search", 18)}</span>
            <button class="nl-btn nl-btn-ghost nl-btn-sm">${icon("user", 15)} Inviter</button>
          </div>

          <div style="flex:1;min-height:0;overflow:hidden;padding:22px;display:grid;grid-template-columns:1.55fr 1fr;gap:20px;align-content:start">
            <div style="display:flex;flex-direction:column;gap:18px;min-width:0">
              <!-- podium -->
              <div class="nl-card" style="padding:26px 22px 20px;background:radial-gradient(120% 130% at 50% -20%, rgba(var(--nl-neon-rgb)/.08), transparent 60%), linear-gradient(180deg, var(--nl-surf-2), var(--nl-surf))">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:24px">
                  <div class="nl-eyebrow">Podium · saison 2026</div>
                  <span class="nl-dim" style="font-size:12px">8 joueurs · 31 mises</span>
                </div>
                <div class="nl-podium">
                  ${pod(LB[1], 2)}${pod(LB[0], 1)}${pod(LB[2], 3)}
                </div>
              </div>
              <!-- rest of the field -->
              <div class="nl-lb">
                ${LB.slice(3).map((e, i) => row(e, i + 4)).join("")}
              </div>
            </div>

            <!-- rail -->
            <div style="display:flex;flex-direction:column;gap:14px;min-width:0">
              ${picksRail(LB[0])}
              <div class="nl-feed">
                <span style="display:flex;color:var(--nl-coral)">${pixel("ghost", "currentColor", 4)}</span>
                <div style="flex:1"><div style="font-weight:700;font-size:13px">Babette Trompette a marqué</div><div class="nl-dim" style="font-size:11px">+185 pts pour Sasha, vous, Léa…</div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // ---------- MOBILE ----------
  function leaderboardMobile() {
    return `<div class="nl" data-screen-label="Classement · mobile">
      <div class="nl-scroll" style="display:flex;flex-direction:column">
        <div class="nl-mtop" style="position:relative;z-index:1;gap:10px">
          <span class="nl-icon-btn" style="width:38px;height:38px">${icon("chevR", 18)}<span style="display:none"></span></span>
          ${header(true)}
        </div>
        <div style="position:relative;z-index:1;padding:0 16px 8px"><span class="nl-tabs" style="display:flex">${yearFilter("2026")}</span></div>

        <div style="position:relative;z-index:1;flex:1;overflow:hidden;padding:8px 16px 96px;display:flex;flex-direction:column;gap:12px">
          <!-- podium compact -->
          <div class="nl-card" style="padding:20px 12px 14px">
            <div class="nl-podium">${pod(LB[1], 2)}${pod(LB[0], 1)}${pod(LB[2], 3)}</div>
          </div>
          <!-- list (compact: next ranks + lanterne rouge) -->
          <div class="nl-lb">
            ${[LB[3], LB[4]].map((e, i) => row(e, i + 4, true)).join("")}
            <div style="display:flex;align-items:center;justify-content:center;gap:10px;padding:3px 0;color:var(--nl-ink-3)">
              <hr class="nl-divider" style="flex:1"><span style="font-size:11px;letter-spacing:.1em">3 joueurs · rangs 06–07</span><hr class="nl-divider" style="flex:1">
            </div>
            ${row(LB[7], 8, true)}
          </div>
        </div>

        <nav class="nl-mbottom">
          <span class="nl-mtab">${icon("home", 22)} Accueil</span>
          <span class="nl-mtab nl-mtab--on">${icon("trophy", 22)} Classement</span>
          <span class="nl-mfab">${icon("plus", 24, 2.2)}</span>
          <span class="nl-mtab">${icon("cards", 22)} Mon pari</span>
          <span class="nl-mtab">${icon("user", 22)} Profil</span>
        </nav>
      </div>
    </div>`;
  }

  N.leaderboardDesktop = leaderboardDesktop;
  N.leaderboardMobile = leaderboardMobile;
})();
