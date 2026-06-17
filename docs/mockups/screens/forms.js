/* Créer / Rejoindre un cercle — form screens, desktop + mobile, with input states */
(function () {
  const N = window.NECRO;
  const { icon, pixel, avatar, logo } = N;

  // ---------- field primitives ----------
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
    // opts: { state, icon, text, placeholder, caret, suffix }
    const st = opts.state || "default";
    const cls = "nl-input" + (st === "focus" ? " nl-input--focus" : st === "error" ? " nl-input--error" : st === "ok" ? " nl-input--ok" : "");
    const isPh = !opts.text;
    const txt = opts.text || opts.placeholder || "";
    return `<div class="${cls}">
      ${opts.icon ? `<span class="nl-input__ic">${icon(opts.icon, 18, 1.8)}</span>` : ""}
      <span class="nl-input__text ${isPh ? "is-placeholder" : ""}">${txt}${opts.caret ? '<span class="nl-caret"></span>' : ""}</span>
      ${opts.suffix ? `<span class="nl-input__suffix">${opts.suffix}</span>` : ""}
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

  function otp(code, active, error, left) {
    const chars = code.split("");
    const cell = (ch, i) => {
      let c = "nl-otp__cell";
      if (i === active && !error) c += " nl-otp__cell--active";
      else if (ch) c += " nl-otp__cell--filled";
      else c += " nl-otp__cell--empty";
      return `<div class="${c}">${i === active && !error ? "" : (ch || "")}</div>`;
    };
    const left3 = [0, 1, 2].map((i) => cell(chars[i] || "", i)).join("");
    const right3 = [3, 4, 5].map((i) => cell(chars[i] || "", i)).join("");
    return `<div class="nl-otp ${left ? "nl-otp--left" : ""} ${error ? "nl-otp--error" : ""}">
      ${left3}<span class="nl-otp__sep">–</span>${right3}
    </div>`;
  }

  // ---------- shells ----------
  function rail(active) {
    const items = [["home", 0], ["circles", 1], ["trophy", 0], ["cards", 0]];
    return `<aside class="nl-side">
      <div style="color:var(--nl-neon);margin-bottom:18px;filter:drop-shadow(0 0 calc(var(--nl-glow)*10px) rgba(var(--nl-neon-rgb)/.7))">${pixel("invader", "currentColor", 4)}</div>
      ${items.map(([ic, on]) => `<div class="nl-navitem ${on ? "nl-navitem--on" : ""}">${icon(ic, 22)}</div>`).join("")}
      <div style="flex:1"></div>
      ${avatar(N.players.you, 42, "nl-av--ring")}
    </aside>`;
  }

  function deskShell(label, eyebrow, title, sub, bodyHtml, maxw) {
    return `<div class="nl" data-screen-label="${label}">
      <div style="display:flex;height:100%;position:relative;z-index:1">
        ${rail()}
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          <div class="nl-topbar">
            <span class="nl-icon-btn">${icon("chevR", 18)}</span>
            <span class="nl-dim" style="font-size:13px">Mes cercles <span style="opacity:.5">/</span> <span style="color:var(--nl-ink)">${eyebrow}</span></span>
            <div style="flex:1"></div>
            ${logo(0.8)}
          </div>
          <div style="flex:1;min-height:0;overflow:hidden;display:flex;align-items:flex-start;justify-content:center;padding:36px 26px">
            <div style="width:100%;max-width:${maxw || 540}px;display:flex;flex-direction:column;gap:22px">
              <div style="text-align:center"><div class="nl-eyebrow">${eyebrow}</div><h1 class="nl-display" style="font-size:42px;margin:8px 0 0">${title}</h1>${sub ? `<p class="nl-muted" style="font-size:14.5px;margin:8px auto 0;max-width:42ch">${sub}</p>` : ""}</div>
              ${bodyHtml}
            </div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function mobShell(label, title, bodyHtml, footHtml) {
    return `<div class="nl" data-screen-label="${label}">
      <div class="nl-scroll" style="display:flex;flex-direction:column">
        <div class="nl-mtop" style="position:relative;z-index:1;gap:10px">
          <span class="nl-icon-btn" style="width:38px;height:38px">${icon("chevR", 18)}</span>
          <div class="nl-h1" style="font-size:20px">${title}</div>
        </div>
        <div style="position:relative;z-index:1;flex:1;overflow:hidden;padding:8px 18px 16px;display:flex;flex-direction:column;gap:18px">
          ${bodyHtml}
        </div>
        ${footHtml ? `<div style="position:relative;z-index:1;padding:12px 18px calc(16px + env(safe-area-inset-bottom));border-top:1px solid var(--nl-line);background:rgba(11,11,15,.6);backdrop-filter:blur(10px)">${footHtml}</div>` : ""}
      </div>
    </div>`;
  }

  // ============================================================
  //  CRÉER — form body (name focused, choice, settings)
  // ============================================================
  function createBody(compact) {
    return `
      ${field(`Nom du cercle`, `16 / 30`,
        input({ state: "focus", icon: "circles", text: "Les Croque-Morts", caret: true }),
        `<div class="nl-help">Visible par tous les membres. Changez-le quand vous voulez.</div>`)}

      ${field(`Visibilité`, "", choice("prive"))}

      <div class="nl-field">
        <div class="nl-label">Réglages de la saison <small>2026</small></div>
        <div style="display:flex;flex-direction:column;gap:10px">
          ${switchRow("ticket", "Autoriser de nouveaux paris", "Les membres peuvent rejoindre en cours d'année", true)}
          ${switchRow("cards", "Liste modifiable", "Modifier sa sélection jusqu'au 31 déc.", true)}
          ${switchRow("eye", "Mises visibles", "Chacun voit sur qui les autres ont parié", false)}
        </div>
      </div>`;
  }

  function createDesktop() {
    const body = `<div class="nl-card nl-toprule" style="padding:26px;display:flex;flex-direction:column;gap:22px">
      ${createBody()}
      <button class="nl-btn nl-btn-primary" style="height:52px;font-size:15px;margin-top:2px">${icon("bolt", 17)} Créer le cercle</button>
    </div>`;
    return deskShell("Créer un cercle · desktop", "Créer un cercle", "Montez votre cercle", "Donnez-lui un nom, choisissez qui peut entrer, et lancez la saison.", body, 560);
  }

  function createMobile() {
    return mobShell("Créer un cercle · mobile", "Créer un cercle",
      createBody(true),
      `<button class="nl-btn nl-btn-primary" style="width:100%;height:52px;font-size:15px">${icon("bolt", 17)} Créer le cercle</button>`);
  }

  // ============================================================
  //  CRÉER — success (invite code generated)
  // ============================================================
  function createSuccessMobile() {
    const body = `<div style="flex:1;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:18px;text-align:center">
      <div class="nl-success">${icon("check", 38, 2.6)}</div>
      <div>
        <div class="nl-display" style="font-size:30px">Cercle créé !</div>
        <p class="nl-muted" style="font-size:14.5px;margin:8px auto 0;max-width:30ch">« Les Croque-Morts » est prêt. Partagez le code pour inviter vos potes.</p>
      </div>
      <div style="width:100%;display:flex;flex-direction:column;gap:9px">
        <div class="nl-label" style="justify-content:center">Code d'invitation</div>
        <div class="nl-codebox">
          <span style="color:var(--nl-neon);display:flex">${icon("hash", 22)}</span>
          <span class="nl-codebox__code" style="flex:1;text-align:left">NEC–7F3</span>
          <button class="nl-icon-btn" style="width:40px;height:40px;color:var(--nl-neon)" title="Copier">${icon("cards", 18)}</button>
        </div>
        <div class="nl-help" style="text-align:center">Valable toute la saison · révocable à tout moment</div>
      </div>
    </div>`;
    return mobShell("Créer · code généré", "Cercle créé", body,
      `<div style="display:flex;flex-direction:column;gap:10px">
        <button class="nl-btn nl-btn-primary" style="width:100%;height:50px">${icon("bolt", 16)} Partager l'invitation</button>
        <button class="nl-btn nl-btn-ghost" style="width:100%;height:48px">Aller au cercle ${icon("chevR", 15)}</button>
      </div>`);
  }

  // ============================================================
  //  REJOINDRE — OTP form (active focus)
  // ============================================================
  function joinBody(state) {
    // state: 'focus' (typing) | 'error'
    const error = state === "error";
    const code = error ? "NECX9Z" : "NEC";
    const active = error ? -1 : 3;
    return `<div style="display:flex;flex-direction:column;gap:18px;align-items:center;text-align:center">
      <div class="nl-empty-art" style="width:88px;height:88px"><span>${icon("ticket", 38)}</span></div>
      <div>
        <div class="nl-h1" style="font-size:24px">Entrez le code</div>
        <p class="nl-muted" style="font-size:14px;margin:7px auto 0;max-width:32ch">6 caractères fournis par l'hôte du cercle. Collez-le ou tapez-le.</p>
      </div>
      ${otp(code, active, error)}
      ${error
        ? msg("error", "Code invalide ou expiré — vérifiez auprès de l'hôte")
        : `<div class="nl-help">ex. NEC–7F3</div>`}
    </div>`;
  }

  function joinDesktop() {
    const body = `<div class="nl-card nl-toprule" style="padding:32px 26px;display:flex;flex-direction:column;gap:24px">
      ${joinBody("focus")}
      <button class="nl-btn nl-btn-primary" style="height:52px;font-size:15px">Rejoindre le cercle ${icon("chevR", 16)}</button>
      <div style="text-align:center"><span class="nl-dim" style="font-size:13px">Pas de code ? </span><span style="color:var(--nl-neon);font-size:13px;font-weight:600">Parcourir les cercles publics</span></div>
    </div>`;
    return deskShell("Rejoindre un cercle · desktop", "Rejoindre un cercle", "Rejoignez vos potes", "Un ami vous a donné un code ? Entrez-le pour rejoindre son cercle.", body, 500);
  }

  function joinMobile() {
    return mobShell("Rejoindre un cercle · mobile", "Rejoindre un cercle",
      joinBody("focus"),
      `<div style="display:flex;flex-direction:column;gap:10px">
        <button class="nl-btn nl-btn-primary" style="width:100%;height:52px;font-size:15px">Rejoindre ${icon("chevR", 16)}</button>
        <div style="text-align:center"><span class="nl-dim" style="font-size:13px">Pas de code ? </span><span style="color:var(--nl-neon);font-size:13px;font-weight:600">Cercles publics</span></div>
      </div>`);
  }

  function joinErrorMobile() {
    return mobShell("Rejoindre · code invalide", "Rejoindre un cercle",
      joinBody("error"),
      `<button class="nl-btn nl-btn-primary" style="width:100%;height:52px;font-size:15px">${icon("hash", 16)} Réessayer</button>`);
  }

  // ============================================================
  //  INPUT STATES board
  // ============================================================
  function statesBoard() {
    const block = (t, h) => `<div style="display:flex;flex-direction:column;gap:9px"><div class="nl-dim" style="font-size:12px">${t}</div>${h}</div>`;
    return `<div class="nl" data-screen-label="États des champs" style="height:auto;overflow:auto">
      <div style="position:relative;z-index:1;padding:30px 34px 40px;display:flex;flex-direction:column;gap:22px">
        <header style="display:flex;flex-direction:column;gap:6px">
          ${logo(1.05)}
          <div class="nl-h1" style="font-size:26px;margin-top:8px">États des champs</div>
          <div class="nl-muted" style="font-size:14px;max-width:64ch">Focus néon, erreur corail, validation, switch, cartes de choix et saisie de code à segments (OTP).</div>
        </header>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:22px;align-items:start">
          ${block("Défaut", input({ icon: "circles", placeholder: "Nom du cercle" }))}
          ${block("Focus (néon)", input({ icon: "circles", text: "Les Croque-Morts", caret: true, state: "focus" }))}
          ${block("Erreur", `${input({ icon: "circles", text: "X", state: "error" })}${msg("error", "Nom déjà pris dans vos cercles")}`)}
          ${block("Validé", input({ icon: "circles", text: "Caveau de Famille", state: "ok" }))}
          ${block("Switch — on / off", `<div style="display:flex;gap:16px;align-items:center"><div class="nl-switch nl-switch--on"><div class="nl-switch__knob"></div></div><div class="nl-switch"><div class="nl-switch__knob"></div></div></div>`)}
          ${block("Cartes de choix", choice("prive"))}
        </div>

        <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:22px;align-items:start;border-top:1px solid var(--nl-line);padding-top:22px">
          ${block("OTP — saisie active", otp("NEC", 3, false, true))}
          ${block("OTP — complété", otp("NEC7F3", -1, false, true))}
          ${block("OTP — erreur", otp("NECX9Z", -1, true, true))}
        </div>
      </div>
    </div>`;
  }

  N.createDesktop2 = createDesktop;
  N.createMobile2 = createMobile;
  N.createSuccessMobile = createSuccessMobile;
  N.joinDesktop = joinDesktop;
  N.joinMobile = joinMobile;
  N.joinErrorMobile = joinErrorMobile;
  N.statesBoard = statesBoard;
})();
