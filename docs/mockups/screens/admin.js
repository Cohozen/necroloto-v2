/* Admin — catalogue célébrités (mutations réservées au rôle global "admin").
   Table catalogue · éditer / créer une fiche · états du champ Wikidata ·
   confirmation de suppression · version mobile. Desktop shell = rail + topbar. */
(function () {
  const N = window.NECRO;
  const { icon, pixel, avatar, portrait, statusPill, fmt } = N;

  const ADMIN_COLS = "52px minmax(0,1fr) 96px 150px 96px 78px 92px";

  // ---------- form primitives (mirrors forms.js, self-contained) ----------
  function field(label, sub, inputHtml, footHtml) {
    return `<div class="nl-field">
      <div style="display:flex;align-items:center;justify-content:space-between;gap:10px">
        <div class="nl-label" style="white-space:nowrap">${label}</div>
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
      ${opts.tail || ""}
      ${st === "ok" && !opts.tail ? `<span class="nl-input__ic" style="color:var(--nl-neon)">${icon("check", 18, 2.4)}</span>` : ""}
    </div>`;
  }

  function msg(kind, text) {
    const ic = kind === "error" ? "skull" : "check";
    return `<div class="nl-msg nl-msg--${kind}">${icon(ic, 15, 2)} ${text}</div>`;
  }

  function deadSwitch(on) {
    return `<div class="nl-setrow" style="${on ? "border-color:rgba(var(--nl-coral-rgb)/.35);background:linear-gradient(100deg,rgba(var(--nl-coral-rgb)/.06),var(--nl-surf) 60%)" : ""}">
      <div class="nl-setrow__ic" style="${on ? "color:var(--nl-coral);background:rgba(var(--nl-coral-rgb)/.12);border-color:rgba(var(--nl-coral-rgb)/.3)" : ""}">${icon("skull", 19)}</div>
      <div style="flex:1;min-width:0">
        <div class="nl-setrow__t">Décédé·e</div>
        <div class="nl-setrow__d">Bascule la fiche et déclenche le recalcul des points</div>
      </div>
      <div class="nl-switch ${on ? "nl-switch--on" : ""}" style="${on ? "background:rgba(var(--nl-coral-rgb)/.22);border-color:rgba(var(--nl-coral-rgb)/.6);box-shadow:0 0 calc(var(--nl-glow)*14px) rgba(var(--nl-coral-rgb)/calc(var(--nl-glow)*.3)) inset" : ""}">
        <div class="nl-switch__knob" style="${on ? "transform:translateX(20px);background:var(--nl-coral);box-shadow:0 0 calc(var(--nl-glow)*12px) rgba(var(--nl-coral-rgb)/.8)" : ""}"></div>
      </div>
    </div>`;
  }

  // ---------- shells ----------
  function rail() {
    const items = [["home", "home"], ["trophy", "leaderboard"], ["cards", "draft"], ["user", "profile"]];
    return `<aside class="nl-side">
      <div style="color:var(--nl-neon);margin-bottom:18px;filter:drop-shadow(0 0 calc(var(--nl-glow)*10px) rgba(var(--nl-neon-rgb)/.7))">${pixel("invader", "currentColor", 4)}</div>
      ${items.map(([ic]) => `<div class="nl-navitem">${icon(ic, 22)}</div>`).join("")}
      <div style="flex:1"></div>
      <div class="nl-navitem nl-navitem--admin nl-navitem--on" title="Admin catalogue">${icon("shield", 22)}</div>
      ${avatar(N.players.you, 42, "nl-av--ring")}
    </aside>`;
  }

  function topbar(crumb, rightHtml) {
    return `<div class="nl-topbar">
      <span class="nl-icon-btn">${icon("chevR", 18)}</span>
      <span class="nl-dim" style="font-size:13px">Catalogue <span style="opacity:.5">/</span> <span style="color:var(--nl-ink)">${crumb}</span></span>
      <div style="flex:1"></div>
      <span class="nl-rolebadge">${icon("shield", 13, 2)} Admin</span>
      ${rightHtml || ""}
      <span class="nl-icon-btn">${icon("bell", 18)}</span>
    </div>`;
  }

  // ============================================================
  //  1 · CATALOGUE TABLE (desktop)
  // ============================================================
  function thead() {
    return `<div class="nl-thead" style="grid-template-columns:${ADMIN_COLS}">
      <div></div><div>Nom</div><div>Naissance</div><div>Statut</div><div>Points</div><div>Paris</div>
      <div style="text-align:right">Actions</div>
    </div>`;
  }

  function trow(c, hover) {
    const dead = c.status === "deceased";
    return `<div class="nl-trow ${dead ? "nl-trow--dead" : ""} ${hover ? "nl-trow--hover" : ""}" style="grid-template-columns:${ADMIN_COLS}">
      <div style="width:44px;height:44px">${portrait(c, { size: 44, letter: 18, radius: 11 })}</div>
      <div style="min-width:0"><div class="nl-trow__name">${c.name}</div><div class="nl-trow__role">${c.role}</div></div>
      <div class="nl-mono" style="font-size:13px;color:var(--nl-ink-2)">°${c.born}</div>
      <div>${statusPill(c)}</div>
      <div>${dead
        ? `<span class="nl-score nl-score--gain" style="height:28px;font-size:15px">+${c.pts}</span>`
        : `<span class="nl-score nl-score--flat" style="height:28px;font-size:15px;color:var(--nl-ink);background:var(--nl-surf-3)">${c.pts}</span>`}</div>
      <div style="display:flex;align-items:center;gap:6px;font-size:14px;font-weight:700;color:var(--nl-ink-2)"><span style="color:var(--nl-ink-3);display:flex">${icon("user", 14, 1.8)}</span>${c.bettors.length}</div>
      <div style="display:flex;align-items:center;justify-content:flex-end;gap:7px">
        <button class="nl-icon-btn" style="width:36px;height:36px;border-radius:10px" title="Éditer">${icon("pencil", 16)}</button>
        <button class="nl-icon-btn" style="width:36px;height:36px;border-radius:10px;${dead ? "color:var(--nl-neon);border-color:rgba(var(--nl-neon-rgb)/.4)" : ""}" title="Recalculer les points">${icon("refresh", 16)}</button>
      </div>
    </div>`;
  }

  function catalogBody() {
    const rows = N.celebs.slice(0, 9);
    const deaths = N.celebs.filter((c) => c.status === "deceased").length;
    return `<div style="flex:1;min-height:0;display:flex;flex-direction:column;overflow:hidden">
      <!-- toolbar -->
      <div style="display:flex;align-items:center;gap:12px;padding:16px 26px;border-bottom:1px solid var(--nl-line)">
        <div class="nl-search" style="max-width:340px">${icon("search", 16)} Rechercher un nom, un QID Wikidata… <kbd>⌘K</kbd></div>
        <div class="nl-seg">
          <span class="nl-seg__i nl-seg__i--on">Tous</span>
          <span class="nl-seg__i">Vivant·e</span>
          <span class="nl-seg__i">Décédé·e</span>
        </div>
        <div style="flex:1"></div>
        <span class="nl-dim" style="font-size:12.5px">${N.celebs.length} célébrités · <span style="color:var(--nl-coral)">${deaths} décès 2026</span></span>
        <button class="nl-btn nl-btn-primary nl-btn-sm" style="height:38px">${icon("plus", 15, 2.2)} Nouvelle célébrité</button>
      </div>
      <!-- table -->
      <div style="flex:1;min-height:0;overflow:hidden;padding:16px 26px 26px">
        ${thead()}
        <div class="nl-table">
          ${rows.map((c, i) => trow(c, i === 1)).join("")}
        </div>
      </div>
    </div>`;
  }

  function adminCatalogDesktop() {
    return `<div class="nl" data-screen-label="Admin · catalogue">
      <div style="display:flex;height:100%;position:relative;z-index:1">
        ${rail()}
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          ${topbar("Admin", "")}
          ${catalogBody()}
        </div>
      </div>
    </div>`;
  }

  // ============================================================
  //  2 · ÉDITER / CRÉER (desktop form)
  // ============================================================
  function miniKpi(label, value, color) {
    return `<div class="nl-ba"><span class="nl-ba__l">${label}</span><span class="nl-ba__v" style="${color ? "color:" + color : ""}">${value}</span></div>`;
  }

  // scoring inset — recalculatePoints explainer + before/after
  function scoringInset(c, dead) {
    if (dead) {
      const n = c.bettors.length;
      return `<div class="nl-card-flat nl-glow-coral" style="padding:18px;display:flex;flex-direction:column;gap:15px">
        <div style="display:flex;align-items:flex-start;gap:13px">
          <span style="display:flex;color:var(--nl-coral);flex:0 0 auto;margin-top:1px;filter:drop-shadow(0 0 calc(var(--nl-glow)*9px) rgba(var(--nl-coral-rgb)/.6))">${pixel("ghost", "currentColor", 4)}</span>
          <div>
            <div class="nl-eyebrow" style="color:var(--nl-coral)">Recalcul automatique · recalculatePoints</div>
            <div class="nl-help" style="margin-top:4px;max-width:58ch">Renseigner une date de décès <b style="color:var(--nl-ink-2)">en 2026</b> crédite les listes ayant parié sur cette saison. Les listes des saisons passées ne marquent <b style="color:var(--nl-ink-2)">pas</b> de points.</div>
          </div>
        </div>
        <div style="display:flex;align-items:center;gap:20px;border-top:1px solid var(--nl-line);padding-top:15px">
          ${miniKpi("Avant", "0 pt", "var(--nl-ink-3)")}
          <span style="color:var(--nl-ink-3);display:flex">${icon("chevR", 22, 2)}</span>
          ${miniKpi("Après", "+" + c.pts, "var(--nl-coral)")}
          <div style="width:1px;align-self:stretch;background:var(--nl-line)"></div>
          ${miniKpi("Listes 2026 créditées", n, "var(--nl-ink)")}
        </div>
      </div>`;
    }
    return `<div class="nl-card-flat" style="padding:18px;display:flex;align-items:center;gap:13px">
      <span style="display:flex;color:var(--nl-ink-3);flex:0 0 auto">${pixel("ghost", "currentColor", 4)}</span>
      <div>
        <div class="nl-eyebrow">Recalcul des points · en veille</div>
        <div class="nl-help" style="margin-top:4px;max-width:60ch">Aucun décès renseigné. Les points ne seront distribués qu'au décès de la célébrité — et seulement aux listes pariées sur l'année du décès.</div>
      </div>
    </div>`;
  }

  // unified form body. mode: "edit" (pré-rempli, décédé·e) | "create" (vide)
  function formBody(mode) {
    const create = mode === "create";
    const c = N.celebById.gloria; // edit subject
    const dead = !create; // edit subject is being marked deceased

    // header portrait
    const portraitHtml = create
      ? `<div class="nl-ghostcard" style="width:128px;height:128px;flex-direction:column;gap:8px;border-radius:18px">${icon("camera", 26, 1.6)}<span style="font-size:11px;text-align:center;line-height:1.3">Glisser<br>une image</span></div>`
      : `<div style="width:128px;height:128px">${portrait(c, { size: 128, letter: 58, radius: 18 })}</div>`;

    // Wikidata field
    const wikiField = create
      ? field(`Wikidata QID`, "",
          input({ icon: "globe", placeholder: "Q… — rechercher sur Wikidata" }),
          `<div class="nl-help">${icon("globe", 12, 1.8)} Naissance, photo et catégorie seront auto-renseignées depuis Wikidata.</div>`)
      : field(`Wikidata QID`, "",
          input({ icon: "globe", text: "Q462359", state: "ok" }),
          `<div class="nl-msg nl-msg--ok" style="font-size:12.5px">${icon("check", 14, 2.2)} Synchronisé depuis Wikidata · il y a 3 j</div>`);

    return `<div class="nl-card nl-toprule" style="padding:28px;display:flex;flex-direction:column;gap:24px">
      <!-- header -->
      <div style="display:flex;gap:24px;align-items:flex-start">
        <div style="display:flex;flex-direction:column;gap:10px;align-items:stretch;flex:0 0 auto;width:128px">
          ${portraitHtml}
          <button class="nl-btn nl-btn-ghost nl-btn-sm">${icon("upload", 15, 2)} Changer la photo</button>
        </div>
        <div style="flex:1;min-width:0;padding-top:2px;display:flex;flex-direction:column;align-items:flex-start;gap:11px">
          <div class="nl-eyebrow">${create ? "Nouvelle célébrité" : "Éditer la fiche"}</div>
          <h1 class="nl-display" style="font-size:40px;margin:0;line-height:.96;${create ? "color:var(--nl-ink-3)" : ""}">${create ? "Sans nom" : c.name}</h1>
          ${create
            ? `<span class="nl-pill">${icon("plus", 13, 2)} Brouillon non enregistré</span>`
            : statusPill(c, { date: true })}
          <div class="nl-help" style="margin:0">${icon("upload", 12, 1.8)} Photo stockée sur Supabase Storage · 512×512 recommandé · JPG/PNG/WebP</div>
        </div>
      </div>

      <hr class="nl-divider">

      <!-- identity fields -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px">
        ${field(`Nom complet`, create ? "0 / 60" : "23 / 60",
          create
            ? input({ icon: "user", placeholder: "Nom de la célébrité", state: "focus", caret: true })
            : input({ icon: "user", text: c.name }))}
        ${field(`Date de naissance`, "",
          create
            ? input({ icon: "cal", placeholder: "JJ / MM / AAAA" })
            : input({ icon: "cal", text: "12 février 1929", suffix: "°1929" }))}
      </div>

      ${wikiField}

      <!-- status block -->
      <div class="nl-field">
        <div class="nl-label">Statut</div>
        <div style="display:flex;flex-direction:column;gap:12px">
          ${deadSwitch(dead)}
          ${dead
            ? `<div class="nl-reveal">${field(`Date de décès`, "",
                input({ icon: "cal", text: "14 mars 2026", state: "focus" }),
                `<div class="nl-help">L'année saisie détermine quelles listes sont créditées. Ici : <b style="color:var(--nl-coral)">2026</b>.</div>`)}</div>`
            : ""}
        </div>
      </div>

      <!-- scoring explainer -->
      ${scoringInset(c, dead)}

      <!-- actions -->
      <div style="display:flex;align-items:center;gap:12px;justify-content:flex-end;border-top:1px solid var(--nl-line);padding-top:20px">
        ${create ? "" : `<button class="nl-btn" style="margin-right:auto;color:var(--nl-coral);border-color:rgba(var(--nl-coral-rgb)/.35)">${icon("skull", 15, 2)} Supprimer</button>`}
        <button class="nl-btn nl-btn-ghost">Annuler</button>
        <button class="nl-btn nl-btn-primary" style="min-width:150px">${icon("check", 16, 2.4)} Enregistrer</button>
      </div>
    </div>`;
  }

  function formShell(label, crumb, bodyHtml) {
    return `<div class="nl" data-screen-label="${label}">
      <div style="display:flex;height:100%;position:relative;z-index:1">
        ${rail()}
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          ${topbar(crumb, "")}
          <div style="flex:1;min-height:0;overflow:hidden;display:flex;justify-content:center;padding:26px">
            <div style="width:100%;max-width:760px">${bodyHtml}</div>
          </div>
        </div>
      </div>
    </div>`;
  }

  function adminEditDesktop() {
    return formShell("Admin · éditer", "Admin <span style='opacity:.5'>/</span> Éditer", formBody("edit"));
  }
  function adminCreateDesktop() {
    return formShell("Admin · créer", "Admin <span style='opacity:.5'>/</span> Nouvelle", formBody("create"));
  }

  // ============================================================
  //  3 · ÉTATS — Wikidata field lifecycle
  // ============================================================
  function adminStatesBoard() {
    const block = (t, h, note) => `<div style="display:flex;flex-direction:column;gap:10px">
      <div class="nl-dim" style="font-size:12px;font-weight:600">${t}</div>${h}${note || ""}</div>`;

    const spinnerTail = `<span style="margin-left:auto;display:flex;align-items:center;gap:9px;flex:0 0 auto"><span class="nl-spin nl-spin--neon"></span><span class="nl-dim" style="font-size:12.5px">Récupération…</span></span>`;

    return `<div class="nl" data-screen-label="Admin · états Wikidata" style="height:auto;overflow:auto">
      <div style="position:relative;z-index:1;padding:30px 34px 40px;display:flex;flex-direction:column;gap:24px">
        <header style="display:flex;flex-direction:column;gap:6px">
          <span class="nl-rolebadge" style="align-self:flex-start">${icon("shield", 13, 2)} Admin · catalogue</span>
          <div class="nl-h1" style="font-size:26px;margin-top:10px">Champ Wikidata — cycle d'import</div>
          <div class="nl-muted" style="font-size:14px;max-width:70ch">Coller un QID lance une récupération sur Wikidata : nom, naissance, photo et catégorie. Trois issues : succès, conflit (doublon), ou erreur réseau.</div>
        </header>

        <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:24px;align-items:start">
          ${block("Chargement",
            input({ icon: "globe", text: "Q462359", tail: spinnerTail }),
            `<div class="nl-help">Interrogation de l'API Wikidata…</div>`)}
          ${block("Succès · importé",
            input({ icon: "globe", text: "Q462359", state: "ok" }),
            msg("ok", "Dame Gloria Ravensworth · °1929 · importé"))}
          ${block("Conflit · doublon",
            input({ icon: "globe", text: "Q462359", state: "error" }),
            msg("error", "QID déjà dans le catalogue (Dame Gloria Ravensworth)"))}
        </div>

        <div style="border-top:1px solid var(--nl-line);padding-top:22px;display:grid;grid-template-columns:1fr 1fr;gap:24px;align-items:start">
          ${block("Switch « Décédé·e » — replié (vivant·e)", deadSwitch(false))}
          ${block("Switch « Décédé·e » — déplié (date révélée)",
            `<div style="display:flex;flex-direction:column;gap:12px">${deadSwitch(true)}<div class="nl-reveal">${input({ icon: "cal", text: "14 mars 2026", state: "focus" })}</div></div>`)}
        </div>
      </div>
    </div>`;
  }

  // ============================================================
  //  3b · CONFIRMATION SUPPRESSION (modale)
  // ============================================================
  function adminDeleteDesktop() {
    const c = N.celebById.gloria;
    const bg = `<div style="display:flex;height:100%;filter:saturate(.6)">
      ${rail()}
      <div style="flex:1;min-width:0;display:flex;flex-direction:column">
        ${topbar("Admin", "")}
        ${catalogBody()}
      </div>
    </div>`;
    const modal = `<div class="nl-modal-veil">
      <div class="nl-card nl-toprule nl-toprule--coral nl-glow-coral" style="width:460px;padding:28px;display:flex;flex-direction:column;gap:18px;text-align:center;align-items:center">
        <div style="width:72px;height:72px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:var(--nl-coral);background:rgba(var(--nl-coral-rgb)/.12);border:1px solid rgba(var(--nl-coral-rgb)/.4)">${icon("skull", 36, 1.8)}</div>
        <div style="display:flex;flex-direction:column;gap:9px">
          <div class="nl-display" style="font-size:26px;line-height:1.05">Supprimer cette fiche ?</div>
          <p class="nl-muted" style="font-size:14px;margin:0 auto;max-width:34ch">« <b style="color:var(--nl-ink)">${c.name}</b> » sera retirée du catalogue. Action <b style="color:var(--nl-coral)">irréversible</b>.</p>
        </div>
        <div class="nl-feed" style="width:100%;text-align:left;border-color:rgba(var(--nl-coral-rgb)/.3)">
          <span style="display:flex;color:var(--nl-coral)">${icon("bolt", 18, 2)}</span>
          <div style="flex:1;font-size:13px;font-weight:600">${c.bettors.length} listes perdront <span style="color:var(--nl-coral)">${c.pts} pts</span></div>
        </div>
        <div style="display:flex;gap:11px;width:100%;margin-top:2px">
          <button class="nl-btn nl-btn-ghost" style="flex:1;height:48px">Annuler</button>
          <button class="nl-btn nl-btn-danger" style="flex:1.4;height:48px">${icon("skull", 16, 2)} Supprimer définitivement</button>
        </div>
      </div>
    </div>`;
    return `<div class="nl" data-screen-label="Admin · suppression">
      <div style="position:relative;z-index:1;height:100%">${bg}${modal}</div>
    </div>`;
  }

  // ============================================================
  //  4 · MOBILE — fiche d'édition compacte, footer collant
  // ============================================================
  function adminEditMobile() {
    const c = N.celebById.gloria;
    const body = `
      <span class="nl-rolebadge" style="align-self:flex-start">${icon("shield", 12, 2)} Admin · catalogue</span>

      <div style="display:flex;gap:14px;align-items:center">
        <div style="width:84px;height:84px;flex:0 0 auto">${portrait(c, { size: 84, letter: 38, radius: 15 })}</div>
        <div style="flex:1;min-width:0">
          <div class="nl-display" style="font-size:26px;line-height:1">${c.name}</div>
          <button class="nl-btn nl-btn-ghost nl-btn-sm" style="margin-top:9px">${icon("upload", 14, 2)} Changer la photo</button>
        </div>
      </div>

      ${field(`Nom complet`, "", input({ icon: "user", text: c.name }))}
      ${field(`Date de naissance`, "", input({ icon: "cal", text: "12 février 1929" }))}
      ${field(`Wikidata QID`, "",
        input({ icon: "globe", text: "Q462359", state: "ok" }),
        `<div class="nl-msg nl-msg--ok" style="font-size:12px">${icon("check", 13, 2.2)} Synchronisé · il y a 3 j</div>`)}

      <div class="nl-field">
        <div class="nl-label">Statut</div>
        <div style="display:flex;flex-direction:column;gap:11px">
          ${deadSwitch(true)}
          <div class="nl-reveal">${field(`Date de décès`, "", input({ icon: "cal", text: "14 mars 2026", state: "focus" }))}</div>
        </div>
      </div>

      ${scoringInset(c, true)}`;

    const foot = `<div style="display:flex;gap:11px">
      <button class="nl-btn nl-btn-ghost" style="flex:0 0 auto;width:96px;height:50px">Annuler</button>
      <button class="nl-btn nl-btn-primary" style="flex:1;height:50px;font-size:15px">${icon("check", 16, 2.4)} Enregistrer</button>
    </div>`;

    return `<div class="nl" data-screen-label="Admin · éditer mobile">
      <div class="nl-scroll" style="display:flex;flex-direction:column">
        <div class="nl-mtop" style="position:relative;z-index:1;gap:10px">
          <span class="nl-icon-btn" style="width:38px;height:38px">${icon("chevR", 18)}</span>
          <div class="nl-h1" style="font-size:19px">Éditer la fiche</div>
        </div>
        <div style="position:relative;z-index:1;flex:1;overflow:hidden;padding:8px 18px 16px;display:flex;flex-direction:column;gap:16px">
          ${body}
        </div>
        <div style="position:relative;z-index:1;padding:12px 18px calc(16px + env(safe-area-inset-bottom));border-top:1px solid var(--nl-line);background:rgba(11,11,15,.7);backdrop-filter:blur(10px)">${foot}</div>
      </div>
    </div>`;
  }

  N.adminCatalogDesktop = adminCatalogDesktop;
  N.adminEditDesktop = adminEditDesktop;
  N.adminCreateDesktop = adminCreateDesktop;
  N.adminStatesBoard = adminStatesBoard;
  N.adminDeleteDesktop = adminDeleteDesktop;
  N.adminEditMobile = adminEditMobile;
})();
