/* Admin de cercle — pouvoir issu de Membership.role (≠ rôle global "admin").
   Onglets internes d'un cercle : Classement · Paris · Membres · Réglages.
   Ici : Réglages + Membres & rôles, vus par un admin (et créateur) du cercle.
   Shell = deskShell (rail Cercles actif) + fil d'Ariane « Mes cercles / <nom> / … ».
   Réutilise les primitives field/input/msg/switchRow/choice + nl-codebox de forms.js. */
(function () {
  const N = window.NECRO;
  const { icon, pixel, avatar } = N;

  // circle in scope + its membership roster (Membership.role) ----------------
  const CIRCLE = N.circles.find((c) => c.id === "faucheurs"); // « Les Faucheurs du Dimanche »
  // role comes from Membership, not the global account role
  const ROLE = { you: "admin", sasha: "admin", lea: "membre", mort: "membre", priya: "membre", funk: "membre", mamie: "membre", gege: "membre" };
  const CREATOR = "you"; // only the creator may delete the circle
  const MEMBERS = N.leaderboard.map((row, i) => {
    const p = N.players[row.p];
    return { p, rank: i + 1, pts: row.pts, hits: row.hits, role: ROLE[p.id] || "membre", isYou: !!p.isYou, creator: p.id === CREATOR };
  });

  // ---------- form primitives (mirrors forms.js, self-contained) ----------
  function field(label, sub, inputHtml, footHtml) {
    return `<div class="nl-field">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div class="nl-label">${label}</div>
        ${sub ? `<span class="nl-charcount">${sub}</span>` : ""}
      </div>
      ${inputHtml}
      ${footHtml || ""}
    </div>`;
  }
  function input(opts) {
    const st = opts.state || "default";
    const cls = "nl-input" + (st === "focus" ? " nl-input--focus" : st === "error" ? " nl-input--error" : st === "ok" ? " nl-input--ok" : "");
    const isPh = !opts.text;
    const txt = opts.text || opts.placeholder || "";
    return `<div class="${cls}">
      ${opts.icon ? `<span class="nl-input__ic">${icon(opts.icon, 18, 1.8)}</span>` : ""}
      <span class="nl-input__text ${isPh ? "is-placeholder" : ""}">${txt}${opts.caret ? '<span class="nl-caret"></span>' : ""}</span>
      ${st === "ok" ? `<span class="nl-input__ic" style="color:var(--nl-neon)">${icon("check", 18, 2.4)}</span>` : ""}
    </div>`;
  }
  function msg(kind, text) {
    const ic = kind === "error" ? "skull" : "check";
    return `<div class="nl-msg nl-msg--${kind}">${icon(ic, 15, 2)} ${text}</div>`;
  }
  function switchRow(ic, title, desc, on) {
    return `<div class="nl-setrow">
      <div class="nl-setrow__ic">${icon(ic, 19)}</div>
      <div style="flex:1;min-width:0"><div class="nl-setrow__t">${title}</div><div class="nl-setrow__d">${desc}</div></div>
      <div class="nl-switch ${on ? "nl-switch--on" : ""}"><div class="nl-switch__knob"></div></div>
    </div>`;
  }
  function choice(sel) {
    const card = (id, ic, t, d) => `<div class="nl-choicecard ${sel === id ? "nl-choicecard--on" : ""}">
      <div class="nl-choicecard__check">${icon("check", 12, 3)}</div>
      <span class="nl-choicecard__ic">${icon(ic, 22, 1.8)}</span>
      <div class="nl-choicecard__t">${t}</div>
      <div class="nl-choicecard__d">${d}</div>
    </div>`;
    return `<div class="nl-choice">
      ${card("prive", "lock", "Privé", "Sur invitation, via un code partagé")}
      ${card("public", "globe", "Public", "Visible et rejoignable par tous")}
    </div>`;
  }

  // ---------- circle-admin chrome ----------
  // discreet circle-power badge — neon (in-circle authority), distinct from the
  // coral GLOBAL admin badge used in the catalogue.
  function roleBadge(sm) {
    return `<span class="nl-rolebadge" style="color:var(--nl-neon);background:rgba(var(--nl-neon-rgb)/.1);border-color:rgba(var(--nl-neon-rgb)/.4)${sm ? ";height:26px;padding:0 9px 0 8px" : ""}">${icon("crown", sm ? 12 : 13, 2)} Admin du cercle</span>`;
  }

  function rail() {
    const items = [["home", 0], ["circles", 1], ["trophy", 0], ["cards", 0]];
    return `<aside class="nl-side">
      <div style="color:var(--nl-neon);margin-bottom:18px;filter:drop-shadow(0 0 calc(var(--nl-glow)*10px) rgba(var(--nl-neon-rgb)/.7))">${pixel("invader", "currentColor", 4)}</div>
      ${items.map(([ic, on]) => `<div class="nl-navitem ${on ? "nl-navitem--on" : ""}">${icon(ic, 22)}</div>`).join("")}
      <div style="flex:1"></div>
      ${avatar(N.players.you, 42, "nl-av--ring")}
    </aside>`;
  }

  const TABS = ["Classement", "Paris", "Membres", "Réglages"];
  function tabsHtml(active) {
    return `<span class="nl-tabs">${TABS.map((t) => `<span class="nl-tab ${t === active ? "nl-tab--on" : ""}">${t}</span>`).join("")}</span>`;
  }

  function circleHeader(active) {
    return `<div style="display:flex;align-items:center;gap:14px;padding:16px 26px;border-bottom:1px solid var(--nl-line)">
      <div class="nl-circle__crest" style="width:42px;height:42px;border-radius:12px;flex:0 0 auto">${pixel("invader", "currentColor", 3)}</div>
      <div style="min-width:0">
        <div class="nl-display" style="font-size:24px;line-height:1;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${CIRCLE.name}</div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:7px;white-space:nowrap">${N.privacyPill(CIRCLE)}<span class="nl-pill" style="white-space:nowrap">${icon("user", 13, 1.8)} ${CIRCLE.members} membres</span><span class="nl-dim" style="font-size:12.5px">Saison 2026</span></div>
      </div>
      <div style="flex:1"></div>
      ${tabsHtml(active)}
    </div>`;
  }

  function deskShell(label, crumbTail, active, bodyHtml) {
    return `<div class="nl" data-screen-label="${label}">
      <div style="display:flex;height:100%;position:relative;z-index:1">
        ${rail()}
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          <div class="nl-topbar">
            <span class="nl-icon-btn">${icon("chevR", 18)}</span>
            <span class="nl-dim" style="font-size:13px">Mes cercles <span style="opacity:.5">/</span> <span style="color:var(--nl-ink-2)">${CIRCLE.name}</span> <span style="opacity:.5">/</span> <span style="color:var(--nl-ink)">${crumbTail}</span></span>
            <div style="flex:1"></div>
            ${roleBadge()}
            <span class="nl-icon-btn">${icon("bell", 18)}</span>
          </div>
          ${circleHeader(active)}
          <div style="flex:1;min-height:0;overflow:hidden;display:flex;justify-content:center;padding:28px 26px">
            ${bodyHtml}
          </div>
        </div>
      </div>
    </div>`;
  }

  // mobile shell — in-circle sub-page (back + title + role badge + scrollable tabs)
  function mobShell(label, title, active, bodyHtml, overlayHtml) {
    return `<div class="nl" data-screen-label="${label}">
      <div class="nl-scroll" style="display:flex;flex-direction:column">
        <div class="nl-mtop" style="position:relative;z-index:1;gap:10px">
          <span class="nl-icon-btn" style="width:38px;height:38px">${icon("chevR", 18)}</span>
          <div style="min-width:0">
            <div class="nl-dim" style="font-size:11px;letter-spacing:.06em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${CIRCLE.name}</div>
            <div class="nl-h1" style="font-size:21px;line-height:1.1">${title}</div>
          </div>
          <div style="flex:1"></div>
          ${roleBadge(true)}
        </div>
        <div style="position:relative;z-index:1;padding:4px 0 10px;overflow-x:auto;-webkit-overflow-scrolling:touch">
          <div style="padding:0 16px">${tabsHtml(active)}</div>
        </div>
        <div style="position:relative;z-index:1;flex:1;overflow:hidden;padding:6px 16px 22px;display:flex;flex-direction:column;gap:16px">
          ${bodyHtml}
        </div>
      </div>
      ${overlayHtml || ""}
    </div>`;
  }

  // shared bits ---------------------------------------------------------------
  function codeBlock(compact, success) {
    return `<div class="nl-field">
      <div class="nl-label">Code d'invitation</div>
      <div class="nl-codebox">
        <span style="color:var(--nl-neon);display:flex;flex:0 0 auto">${icon("hash", compact ? 20 : 22)}</span>
        <span class="nl-codebox__code" style="flex:1;text-align:left${compact ? ";font-size:26px" : ""}">NEC–7F3</span>
        <button class="nl-icon-btn" style="width:40px;height:40px;color:var(--nl-neon);flex:0 0 auto" title="Copier">${icon("cards", 18)}</button>
      </div>
      <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap">
        <button class="nl-btn nl-btn-ghost nl-btn-sm">${icon("refresh", 15, 2)} Régénérer</button>
        <button class="nl-btn nl-btn-sm" style="color:var(--nl-ink-2)">${icon("x", 15, 2)} Révoquer</button>
        <span class="nl-dim" style="font-size:12px;margin-left:auto">Valable toute la saison</span>
      </div>
      ${success ? msg("ok", "Nouveau code généré · l'ancien ne fonctionne plus") : ""}
    </div>`;
  }

  function seasonBlock() {
    return `<div class="nl-field">
      <div class="nl-label">Réglages de la saison <small>2026</small></div>
      <div style="display:flex;flex-direction:column;gap:10px">
        ${switchRow("ticket", "Autoriser de nouveaux paris", "Les membres peuvent rejoindre en cours d'année", true)}
        ${switchRow("cards", "Liste modifiable", "Modifier sa sélection jusqu'au 31 déc.", true)}
        ${switchRow("eye", "Mises visibles", "Chacun voit sur qui les autres ont parié", false)}
      </div>
    </div>`;
  }

  // danger zone — coral hairline. « Quitter » for everyone, « Supprimer » creator-only.
  function dangerZone(compact) {
    return `<div class="nl-card nl-toprule nl-toprule--coral" style="padding:${compact ? 18 : 22}px;display:flex;flex-direction:column;gap:14px">
      <div>
        <div class="nl-eyebrow" style="color:var(--nl-coral)">Zone de danger</div>
        <p class="nl-help" style="margin-top:6px;max-width:52ch">Quitter libère votre place ; un autre admin garde la main. Supprimer efface le cercle et son classement pour les ${CIRCLE.members} membres — définitivement.</p>
      </div>
      <div class="nl-setrow" style="border-color:var(--nl-line)">
        <div class="nl-setrow__ic" style="color:var(--nl-ink-2);background:var(--nl-surf-3);border-color:var(--nl-line)">${icon("logout", 18)}</div>
        <div style="flex:1;min-width:0"><div class="nl-setrow__t">Quitter le cercle</div><div class="nl-setrow__d">Vous pourrez le rejoindre à nouveau avec le code</div></div>
        <button class="nl-btn nl-btn-sm" style="color:var(--nl-coral);border-color:rgba(var(--nl-coral-rgb)/.35)">Quitter</button>
      </div>
      <div class="nl-setrow" style="border-color:rgba(var(--nl-coral-rgb)/.3);background:linear-gradient(100deg,rgba(var(--nl-coral-rgb)/.06),var(--nl-surf) 60%)">
        <div class="nl-setrow__ic" style="color:var(--nl-coral);background:rgba(var(--nl-coral-rgb)/.12);border-color:rgba(var(--nl-coral-rgb)/.3)">${icon("skull", 18)}</div>
        <div style="flex:1;min-width:0"><div class="nl-setrow__t">Supprimer le cercle</div><div class="nl-setrow__d">Réservé au créateur · action irréversible</div></div>
        <button class="nl-btn nl-btn-danger nl-btn-sm">${icon("skull", 15, 2)} Supprimer</button>
      </div>
    </div>`;
  }

  // ============================================================
  //  1 · RÉGLAGES DU CERCLE
  // ============================================================
  function settingsCard(compact) {
    return `<div class="nl-card nl-toprule" style="padding:${compact ? 20 : 26}px;display:flex;flex-direction:column;gap:22px">
      ${field("Nom du cercle", "24 / 30",
        input({ state: "focus", icon: "circles", text: CIRCLE.name, caret: true }),
        `<div class="nl-help">Visible par tous les membres. Changez-le quand vous voulez.</div>`)}
      ${field("Visibilité", "", choice("prive"))}
      ${seasonBlock()}
      ${codeBlock(compact, true)}
      <button class="nl-btn nl-btn-primary" style="height:50px;font-size:15px;align-self:flex-start;min-width:190px">${icon("check", 16, 2.4)} Enregistrer</button>
    </div>`;
  }

  function circleSettingsDesktop() {
    const body = `<div style="width:100%;max-width:620px;display:flex;flex-direction:column;gap:18px">
      ${settingsCard(false)}
      ${dangerZone(false)}
    </div>`;
    return deskShell("Cercle · réglages · desktop", "Réglages", "Réglages", body);
  }

  function circleSettingsMobile() {
    const body = `${settingsCard(true)}${dangerZone(true)}`;
    return mobShell("Cercle · réglages · mobile", "Réglages", "Réglages", body);
  }

  // ============================================================
  //  2 · MEMBRES & RÔLES
  // ============================================================
  function rolePill(role) {
    if (role === "admin")
      return `<span class="nl-pill" style="color:var(--nl-neon);border-color:rgba(var(--nl-neon-rgb)/.45);background:rgba(var(--nl-neon-rgb)/.08)">${icon("crown", 13, 1.9)} Admin</span>`;
    return `<span class="nl-pill">${icon("user", 12, 1.8)} Membre</span>`;
  }

  function actionMenu(items) {
    return `<div class="nl-cmd" style="position:absolute;right:8px;top:54px;width:240px;z-index:9;padding:7px 0;box-shadow:0 18px 50px rgba(0,0,0,.6)">
      <div class="nl-cmd__sect" style="padding:8px 16px 5px">Gérer ce membre</div>
      ${items}
    </div>`;
  }
  function menuItem(ic, label, danger, on) {
    return `<div class="nl-cmd__row ${on ? "nl-cmd__row--on" : ""}" style="margin:0 7px">
      <span style="display:flex;color:${danger ? "var(--nl-coral)" : "var(--nl-neon)"}">${icon(ic, 16, 1.9)}</span>
      <span style="font-size:14px;font-weight:600;${danger ? "color:var(--nl-coral)" : ""}">${label}</span>
    </div>`;
  }
  // menu adapts to the target's role
  function menuFor(m) {
    const promote = menuItem("crown", "Promouvoir admin", false, true);
    const demote = menuItem("arrowU", "Rétrograder en membre");
    const remove = `<div style="height:1px;background:var(--nl-line);margin:6px 14px"></div>${menuItem("x", "Retirer du cercle", true)}`;
    return actionMenu((m.role === "admin" ? demote : promote) + remove);
  }

  const M_COLS = "34px 42px minmax(0,1fr) auto auto 40px";
  function memberRow(m, menuOpen) {
    const you = m.isYou;
    const rowStyle = `position:relative;display:grid;grid-template-columns:${M_COLS};align-items:center;gap:14px;padding:11px 12px;border:1px solid var(--nl-line);border-radius:13px;background:var(--nl-surf)`
      + (you ? ";outline:1px dashed rgba(var(--nl-magenta-rgb)/.55);outline-offset:1px;background:linear-gradient(100deg,rgba(var(--nl-magenta-rgb)/.06),var(--nl-surf) 55%)" : "")
      + (menuOpen ? ";border-color:rgba(var(--nl-neon-rgb)/.45);box-shadow:0 0 0 1px rgba(var(--nl-neon-rgb)/.3)" : "");
    const score = m.rank === 1
      ? `<span class="nl-score" style="height:28px;font-size:15px">${N.fmt(m.pts)}</span>`
      : `<span class="nl-score nl-score--flat" style="height:28px;font-size:15px;color:var(--nl-ink)">${N.fmt(m.pts)}</span>`;
    return `<div class="nl-listrow" style="${rowStyle};cursor:default">
      <div style="font-family:var(--nl-display);font-weight:800;font-size:20px;text-align:center;color:${m.rank === 1 ? "var(--nl-neon)" : "var(--nl-ink-3)"};font-variant-numeric:tabular-nums">${String(m.rank).padStart(2, "0")}</div>
      ${avatar(m.p, 42, you ? "nl-av--ring-mag" : "")}
      <div style="min-width:0">
        <div style="display:flex;align-items:center;gap:8px;min-width:0">
          <span class="nl-listrow__t" style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${you ? "Vous" : m.p.name}</span>
          ${you ? `<span class="nl-pill" style="height:20px;padding:0 8px;font-size:10.5px;color:var(--nl-magenta);border-color:rgba(var(--nl-magenta-rgb)/.45);background:rgba(var(--nl-magenta-rgb)/.1)">Vous</span>` : ""}
          ${m.creator ? `<span class="nl-dim" style="font-size:11px;display:flex;align-items:center;gap:4px">${icon("star", 12, 2)} Créateur</span>` : ""}
        </div>
        <div class="nl-listrow__d" style="font-family:var(--nl-mono)">${m.p.handle}</div>
      </div>
      ${rolePill(m.role)}
      ${score}
      <button class="nl-icon-btn" style="width:38px;height:38px;border-radius:10px;${menuOpen ? "color:var(--nl-neon);border-color:rgba(var(--nl-neon-rgb)/.5)" : ""}" title="Actions">${icon("dots", 18, 2.4)}</button>
      ${menuOpen ? menuFor(m) : ""}
    </div>`;
  }

  function membersHeader(compact) {
    return `<div style="display:flex;align-items:center;gap:12px">
      <div>
        <div class="nl-h2" style="font-size:${compact ? 17 : 18}px">Membres · ${CIRCLE.members}</div>
        <div class="nl-dim" style="font-size:12px;margin-top:2px">2 admins · ${CIRCLE.members - 2} membres</div>
      </div>
      <div style="flex:1"></div>
      <span class="nl-chip nl-chip--on">${icon("plus", 14, 2.2)} Inviter</span>
    </div>`;
  }

  function circleMembersDesktop() {
    // open the action menu on a Membre row (Léa, #3) → Promouvoir + Retirer
    const openId = "lea";
    const list = MEMBERS.map((m) => memberRow(m, m.p.id === openId)).join("");
    const body = `<div style="width:100%;max-width:680px;display:flex;flex-direction:column;gap:16px">
      ${membersHeader(false)}
      <div style="display:flex;flex-direction:column;gap:9px">${list}</div>
    </div>`;
    return deskShell("Cercle · membres · desktop", "Membres", "Membres", body);
  }

  // ---- mobile : stacked cards + remove confirmation sheet ----
  function memberCard(m) {
    const you = m.isYou;
    const cardStyle = `position:relative;display:flex;align-items:center;gap:12px;padding:13px;border:1px solid var(--nl-line);border-radius:14px;background:var(--nl-surf)`
      + (you ? ";outline:1px dashed rgba(var(--nl-magenta-rgb)/.55);outline-offset:1px;background:linear-gradient(100deg,rgba(var(--nl-magenta-rgb)/.07),var(--nl-surf) 55%)" : "");
    return `<div style="${cardStyle}">
      ${avatar(m.p, 44, you ? "nl-av--ring-mag" : "")}
      <div style="flex:1;min-width:0">
        <div style="display:flex;align-items:center;gap:7px;min-width:0">
          <span style="font-weight:600;font-size:14.5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${you ? "Vous" : m.p.name}</span>
          ${m.creator ? `<span style="color:var(--nl-magenta);display:flex">${icon("star", 12, 2)}</span>` : ""}
        </div>
        <div style="display:flex;align-items:center;gap:8px;margin-top:5px">
          ${rolePill(m.role)}
          <span class="nl-dim" style="font-size:12px;font-variant-numeric:tabular-nums">#${m.rank} · ${N.fmt(m.pts)} pts</span>
        </div>
      </div>
      <button class="nl-icon-btn" style="width:38px;height:38px;border-radius:10px;flex:0 0 auto" title="Actions">${icon("dots", 18, 2.4)}</button>
    </div>`;
  }

  // bottom-sheet confirmation on « Retirer »
  function removeSheet(m) {
    return `<div class="nl-modal-veil" style="align-items:flex-end;padding:0">
      <div class="nl-card nl-toprule nl-toprule--coral" style="width:100%;border-bottom-left-radius:0;border-bottom-right-radius:0;padding:22px 18px calc(20px + env(safe-area-inset-bottom));display:flex;flex-direction:column;gap:16px">
        <div style="width:38px;height:4px;border-radius:999px;background:var(--nl-line-2);align-self:center"></div>
        <div style="display:flex;align-items:center;gap:13px">
          ${avatar(m.p, 46)}
          <div style="flex:1;min-width:0">
            <div class="nl-display" style="font-size:22px;line-height:1">Retirer ${m.p.name} ?</div>
            <div class="nl-help" style="margin-top:5px">Sa sélection et ses ${N.fmt(m.pts)} pts quittent le classement. Il pourra revenir avec le code.</div>
          </div>
        </div>
        <div style="display:flex;gap:11px">
          <button class="nl-btn nl-btn-ghost" style="flex:1;height:50px">Annuler</button>
          <button class="nl-btn nl-btn-danger" style="flex:1.3;height:50px">${icon("x", 16, 2.4)} Retirer</button>
        </div>
      </div>
    </div>`;
  }

  function circleMembersMobile() {
    const cards = MEMBERS.map((m) => memberCard(m)).join("");
    const body = `${membersHeader(true)}<div style="display:flex;flex-direction:column;gap:10px">${cards}</div>`;
    // confirmation sheet for removing Tonton Gégé (#8)
    const target = MEMBERS.find((m) => m.p.id === "gege");
    return mobShell("Cercle · membres · mobile", "Membres", "Membres", body, removeSheet(target));
  }

  // ============================================================
  //  3 · MODALE — quitter / supprimer le cercle (façon adminDeleteDesktop)
  // ============================================================
  function circleLeaveDeleteModal() {
    // background = the réglages screen, dimmed
    const bg = `<div style="display:flex;height:100%;filter:saturate(.6)">
      ${rail()}
      <div style="flex:1;min-width:0;display:flex;flex-direction:column">
        <div class="nl-topbar">
          <span class="nl-icon-btn">${icon("chevR", 18)}</span>
          <span class="nl-dim" style="font-size:13px">Mes cercles <span style="opacity:.5">/</span> <span style="color:var(--nl-ink-2)">${CIRCLE.name}</span> <span style="opacity:.5">/</span> <span style="color:var(--nl-ink)">Réglages</span></span>
          <div style="flex:1"></div>
          ${roleBadge()}
          <span class="nl-icon-btn">${icon("bell", 18)}</span>
        </div>
        ${circleHeader("Réglages")}
        <div style="flex:1;min-height:0;overflow:hidden;display:flex;justify-content:center;padding:28px 26px">
          <div style="width:100%;max-width:620px">${dangerZone(false)}</div>
        </div>
      </div>
    </div>`;
    const modal = `<div class="nl-modal-veil">
      <div class="nl-card nl-toprule nl-toprule--coral nl-glow-coral" style="width:480px;padding:28px;display:flex;flex-direction:column;gap:18px;text-align:center;align-items:center">
        <div style="width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--nl-coral);background:rgba(var(--nl-coral-rgb)/.12);border:1px solid rgba(var(--nl-coral-rgb)/.4)">${icon("skull", 36, 1.8)}</div>
        <div style="display:flex;flex-direction:column;gap:9px">
          <div class="nl-display" style="font-size:26px;line-height:1.05">Supprimer ce cercle ?</div>
          <p class="nl-muted" style="font-size:14px;margin:0 auto;max-width:36ch">« <b style="color:var(--nl-ink)">${CIRCLE.name}</b> » et tout son classement 2026 seront effacés. Action <b style="color:var(--nl-coral)">irréversible</b>.</p>
        </div>
        <div class="nl-feed" style="width:100%;text-align:left;border-color:rgba(var(--nl-coral-rgb)/.3)">
          <span style="display:flex;color:var(--nl-coral);flex:0 0 auto">${icon("bolt", 18, 2)}</span>
          <div style="flex:1;font-size:13px;font-weight:600">${CIRCLE.members} membres perdront leur sélection et leurs points</div>
        </div>
        <div class="nl-field" style="width:100%;text-align:left;gap:8px">
          <div class="nl-label" style="font-size:12.5px">Tapez <b class="nl-mono" style="color:var(--nl-coral)">SUPPRIMER</b> pour confirmer</div>
          ${input({ icon: "skull", text: "SUPPRIMER", state: "error", caret: true })}
        </div>
        <div style="display:flex;gap:11px;width:100%;margin-top:2px">
          <button class="nl-btn nl-btn-ghost" style="flex:1;height:48px">Annuler</button>
          <button class="nl-btn nl-btn-danger" style="flex:1.4;height:48px">${icon("skull", 16, 2)} Supprimer définitivement</button>
        </div>
      </div>
    </div>`;
    return `<div class="nl" data-screen-label="Cercle · suppression · modale">
      <div style="position:relative;z-index:1;height:100%">${bg}${modal}</div>
    </div>`;
  }

  N.circleSettingsDesktop = circleSettingsDesktop;
  N.circleSettingsMobile = circleSettingsMobile;
  N.circleMembersDesktop = circleMembersDesktop;
  N.circleMembersMobile = circleMembersMobile;
  N.circleLeaveDeleteModal = circleLeaveDeleteModal;
})();
