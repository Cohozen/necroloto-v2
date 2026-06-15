/* ============================================================
   AUTH — la coque custom qui enrobe Clerk (<SignIn>/<SignUp>).
   On ne refait PAS le moteur Clerk : on maquette le thème néon
   que recevra `appearance`, + la coque marketing autour.
   Cible dev : mapper ces valeurs sur les variables Clerk.
   Exposes: N.authSplitDesktop, N.signInMobile, N.signUpMobile,
            N.verifyOtp, N.authLoading, N.clerkThemeBoard
   ============================================================ */
(function () {
  const N = window.NECRO;
  const { icon, pixel, logo } = N;

  /* ---------- brand glyphs (Google / Apple) ---------- */
  const gIcon = `<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.56c2.08-1.92 3.28-4.74 3.28-8.09Z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.56-2.76c-.98.66-2.23 1.06-3.72 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"/>
    <path fill="#FBBC05" d="M5.84 14.1a6.62 6.62 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38Z"/>
  </svg>`;
  const appleIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="#F3F4F8" aria-hidden="true">
    <path d="M16.36 12.78c.03 3.13 2.75 4.17 2.78 4.18-.02.07-.43 1.49-1.43 2.95-.86 1.27-1.76 2.53-3.18 2.55-1.39.03-1.84-.82-3.43-.82s-2.09.8-3.41.85c-1.37.05-2.41-1.37-3.28-2.63-1.78-2.58-3.14-7.29-1.31-10.47.9-1.58 2.52-2.58 4.27-2.6 1.34-.03 2.61.9 3.43.9.82 0 2.36-1.11 3.98-.95.68.03 2.58.27 3.8 2.07-.1.06-2.27 1.33-2.25 3.97M13.77 4.2c.72-.88 1.21-2.1 1.08-3.32-1.04.05-2.3.69-3.05 1.57-.67.78-1.26 2.02-1.1 3.21 1.16.09 2.34-.59 3.07-1.46"/>
  </svg>`;

  /* ---------- field primitives (mirror de forms.js) ---------- */
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

  function otp(code, active, error) {
    const chars = code.split("");
    const cell = (ch, i) => {
      let c = "nl-otp__cell";
      if (i === active && !error) c += " nl-otp__cell--active";
      else if (ch) c += " nl-otp__cell--filled";
      else c += " nl-otp__cell--empty";
      return `<div class="${c}">${i === active && !error ? "" : (ch || "")}</div>`;
    };
    const l3 = [0, 1, 2].map((i) => cell(chars[i] || "", i)).join("");
    const r3 = [3, 4, 5].map((i) => cell(chars[i] || "", i)).join("");
    return `<div class="nl-otp ${error ? "nl-otp--error" : ""}">${l3}<span class="nl-otp__sep">–</span>${r3}</div>`;
  }

  /* ---------- shared auth atoms ---------- */
  function socialRow() {
    const btn = (glyph, label) => `<button class="nl-btn" style="width:100%;height:50px;justify-content:center;gap:11px;background:var(--nl-surf-3);border-color:var(--nl-line-2)">${glyph}<span style="font-weight:600">${label}</span></button>`;
    return `<div style="display:flex;flex-direction:column;gap:10px">
      ${btn(gIcon, "Continuer avec Google")}
      ${btn(appleIcon, "Continuer avec Apple")}
    </div>`;
  }

  function orDivider() {
    return `<div style="display:flex;align-items:center;gap:14px">
      <span style="flex:1;height:1px;background:var(--nl-line)"></span>
      <span class="nl-dim" style="font-size:11px;font-weight:700;letter-spacing:.16em;text-transform:uppercase">ou</span>
      <span style="flex:1;height:1px;background:var(--nl-line)"></span>
    </div>`;
  }

  function primaryBtn(label, opts) {
    opts = opts || {};
    const inner = opts.loading
      ? `<span class="nl-spin"></span> ${opts.loadingLabel || "Un instant…"}`
      : `${icon("bolt", 17)} ${label}`;
    return `<button class="nl-btn nl-btn-primary" style="height:52px;font-size:15px;width:100%">${inner}</button>`;
  }

  function footerLink(question, link) {
    return `<div style="text-align:center"><span class="nl-dim" style="font-size:13.5px">${question} </span><span style="color:var(--nl-neon);font-size:13.5px;font-weight:700">${link}</span></div>`;
  }

  function titleBlock(title, sub, align) {
    return `<div style="display:flex;flex-direction:column;gap:7px;text-align:${align || "left"}">
      <h1 class="nl-display" style="font-size:40px">${title}</h1>
      <p class="nl-muted" style="font-size:14.5px;margin:0">${sub}</p>
    </div>`;
  }

  /* ---------- mobile shell (pré-app : pas de bottom tab) ---------- */
  function authMob(label, body, foot) {
    return `<div class="nl" data-screen-label="${label}">
      <div class="nl-scroll" style="display:flex;flex-direction:column">
        <div style="position:relative;z-index:1;display:flex;justify-content:center;padding:34px 22px 6px">${logo(1.1)}</div>
        <div style="position:relative;z-index:1;flex:1;display:flex;flex-direction:column;justify-content:center;gap:18px;padding:10px 24px 16px">${body}</div>
        ${foot ? `<div style="position:relative;z-index:1;padding:15px 24px calc(18px + env(safe-area-inset-bottom));border-top:1px solid var(--nl-line);background:rgba(11,11,15,.5);backdrop-filter:blur(10px)">${foot}</div>` : ""}
      </div>
    </div>`;
  }

  /* ============================================================
     1 · AUTH SPLIT — desktop (marketing + carte Clerk themée)
     ============================================================ */
  function authSplitDesktop() {
    const pill = (ic, t) => `<span class="nl-pill" style="height:30px;font-size:12.5px">${icon(ic, 14, 1.8)} ${t}</span>`;

    const left = `<div style="flex:1.04;position:relative;overflow:hidden;display:flex;flex-direction:column;justify-content:space-between;padding:54px 56px">
      <div style="position:absolute;right:-40px;bottom:-30px;color:var(--nl-neon);opacity:.16;filter:drop-shadow(0 0 calc(var(--nl-glow)*40px) rgba(var(--nl-neon-rgb)/.6));pointer-events:none">${pixel("invader", "currentColor", 30)}</div>
      <div style="position:absolute;left:38%;top:18%;color:var(--nl-coral);opacity:.10;pointer-events:none">${icon("skull", 120, 1.2)}</div>

      <div style="position:relative;z-index:1">${logo(1.5)}</div>

      <div style="position:relative;z-index:1;display:flex;flex-direction:column;gap:22px;max-width:520px">
        <div class="nl-eyebrow">Le lotomacabre entre potes · Saison 2026</div>
        <h1 class="nl-display nl-neon-ink" style="font-size:84px;line-height:.9;letter-spacing:.01em">Défiez<br>le destin</h1>
        <p class="nl-muted" style="font-size:17px;line-height:1.5;max-width:44ch">Pariez sur les célébrités que vous pensez voir partir cette année. Marquez des points quand le destin vous donne raison. Le plus macabre des jeux entre amis.</p>
        <div style="display:flex;gap:10px;flex-wrap:wrap">
          ${pill("bolt", "100% gratuit")}
          ${pill("user", "Entre potes")}
          ${pill("cal", "Saison 2026")}
        </div>
      </div>

      <div style="position:relative;z-index:1;display:flex;align-items:center;gap:10px" class="nl-dim">
        <span style="display:flex;color:var(--nl-neon)">${pixel("coin", "currentColor", 2)}</span>
        <span style="font-size:12.5px">Jeu parodique · personnages fictifs · majeurs uniquement</span>
      </div>
    </div>`;

    const card = `<div class="nl-card nl-toprule" style="width:100%;max-width:420px;padding:36px 34px;display:flex;flex-direction:column;gap:22px">
      ${titleBlock("Connexion", "Reprenez là où le destin vous attend.")}
      ${socialRow()}
      ${orDivider()}
      ${field("Adresse e-mail", "", input({ icon: "mail", placeholder: "vous@exemple.com" }))}
      ${primaryBtn("Continuer")}
      ${footerLink("Pas encore de compte ?", "S'inscrire")}
    </div>`;

    return `<div class="nl" data-screen-label="Auth — split desktop" style="height:100%">
      <div style="display:flex;height:100%;position:relative;z-index:1">
        ${left}
        <div style="flex:1;display:flex;align-items:center;justify-content:center;padding:48px;border-left:1px solid var(--nl-line);background:rgba(11,11,15,.35)">
          ${card}
        </div>
      </div>
    </div>`;
  }

  /* ============================================================
     2 · CONNEXION — mobile (champ e-mail en focus)
     ============================================================ */
  function signInMobile() {
    const body = `
      ${titleBlock("Connexion", "Entrez dans l'arène.", "center")}
      ${socialRow()}
      ${orDivider()}
      ${field("Adresse e-mail", "",
        input({ icon: "mail", text: "croque.mort@", caret: true, state: "focus" }))}
      ${primaryBtn("Continuer")}`;
    return authMob("Connexion · mobile", body, footerLink("Pas encore de compte ?", "S'inscrire"));
  }

  /* ============================================================
     3 · INSCRIPTION — mobile (e-mail + pseudo → User API)
     ============================================================ */
  function signUpMobile() {
    const body = `
      ${titleBlock("Créer un compte", "Choisissez un pseudo, et que le meilleur gagne.", "center")}
      ${socialRow()}
      ${orDivider()}
      ${field("Adresse e-mail", "",
        input({ icon: "mail", text: "croque.mort@proton.me", state: "ok" }))}
      ${field("Pseudo", "12 / 20",
        input({ icon: "user", text: "Le Croque-Mort", caret: true, state: "focus" }),
        `<div class="nl-help" style="display:flex;align-items:center;gap:7px">
          <span class="nl-pill" style="height:20px;padding:0 7px;font-size:10px;color:var(--nl-neon);border-color:rgba(var(--nl-neon-rgb)/.4)">API · User</span>
          Crée votre profil joueur — visible dans les classements.
        </div>`)}
      ${primaryBtn("Créer mon compte")}
      <p class="nl-help" style="text-align:center;margin:0">En continuant, vous acceptez les <span style="color:var(--nl-ink-2);text-decoration:underline">CGU</span> et la <span style="color:var(--nl-ink-2);text-decoration:underline">Politique de confidentialité</span>.</p>`;
    return authMob("Inscription · mobile", body, footerLink("Déjà un compte ?", "Se connecter"));
  }

  /* ============================================================
     4 · VÉRIFICATION E-MAIL (OTP) — mobile
     ============================================================ */
  function verifyOtp() {
    const body = `<div style="display:flex;flex-direction:column;align-items:center;text-align:center;gap:22px">
      <div class="nl-empty-art" style="width:96px;height:96px"><span>${icon("mail", 40)}</span></div>
      <div>
        <div class="nl-h1" style="font-size:24px">Entrez le code</div>
        <p class="nl-muted" style="font-size:14px;margin:8px auto 0;max-width:30ch">Code à 6 chiffres envoyé à <b style="color:var(--nl-ink)">v…@…proton.me</b></p>
      </div>
      ${otp("834", 3, false)}
      <div class="nl-dim" style="font-size:13px">Rien reçu ? <span style="color:var(--nl-neon);font-weight:700">Renvoyer le code</span></div>
    </div>`;
    const foot = `${primaryBtn("Vérifier")}
      <div style="margin-top:10px">${footerLink("Mauvaise adresse ?", "La modifier")}</div>`;
    return authMob("Vérification e-mail · OTP", body, foot);
  }

  /* ============================================================
     5 · ÉTATS — chargement, erreur, redirect/app-gate
     ============================================================ */
  function authLoading() {
    const block = (t, h) => `<div style="display:flex;flex-direction:column;gap:10px"><div class="nl-dim" style="font-size:12px">${t}</div>${h}</div>`;

    // redirect / app gate skeleton (_app.tsx gate)
    const skel = `<div style="position:relative;width:300px;height:520px;border-radius:30px;border:1px solid var(--nl-line-2);overflow:hidden;background:var(--nl-bg)">
      <div class="nl" style="height:100%">
        <div style="position:relative;z-index:1;height:100%;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:22px;padding:30px">
          <div class="nl-empty-art" style="width:118px;height:118px"><span>${pixel("invader", "currentColor", 6)}</span></div>
          <div style="text-align:center">
            <div class="nl-display" style="font-size:26px">On prépare votre cockpit…</div>
            <div class="nl-dim" style="font-size:12.5px;margin-top:6px">Synchronisation de vos cercles &amp; paris</div>
          </div>
          <div style="width:100%;display:flex;flex-direction:column;gap:11px;margin-top:6px">
            <div class="nl-skel" style="height:54px;border-radius:13px"></div>
            <div class="nl-skel" style="height:54px;border-radius:13px"></div>
            <div class="nl-skel" style="height:14px;width:60%;border-radius:7px"></div>
          </div>
        </div>
      </div>
    </div>`;

    const states = `<div style="display:flex;flex-direction:column;gap:22px">
      ${block("Bouton primaire — chargement (spinner néon)",
        primaryBtn("", { loading: true, loadingLabel: "Connexion en cours…" }))}
      ${block("Identifiants incorrects — input + message",
        `${input({ icon: "mail", text: "croque.mort@proton.me", state: "error" })}${msg("error", "E-mail ou code incorrect")}`)}
      ${block("Code OTP — erreur",
        `<div style="transform:scale(.86);transform-origin:left">${otp("834219", -1, true)}</div>${msg("error", "Code expiré — renvoyez-en un nouveau")}`)}
    </div>`;

    return `<div class="nl" data-screen-label="Auth — états & redirect" style="height:auto;overflow:auto">
      <div style="position:relative;z-index:1;padding:30px 34px 40px;display:flex;flex-direction:column;gap:24px">
        <header style="display:flex;flex-direction:column;gap:7px">
          ${logo(1.05)}
          <div class="nl-h1" style="font-size:26px;margin-top:6px">États & redirect</div>
          <div class="nl-muted" style="font-size:14px;max-width:70ch">Chargement, erreur d'identifiants, et l'app-gate de <span class="nl-mono" style="font-size:13px">_app.tsx</span> : skeleton néon affiché le temps que Clerk résolve la session.</div>
        </header>
        <div style="display:grid;grid-template-columns:minmax(0,1fr) auto;gap:40px;align-items:start">
          ${states}
          <div style="display:flex;flex-direction:column;gap:10px;align-items:flex-start">
            <div class="nl-dim" style="font-size:12px">Redirect / app-gate — pendant la résolution de session</div>
            ${skel}
          </div>
        </div>
      </div>
    </div>`;
  }

  /* ============================================================
     6 · BOARD « thème Clerk » — mapping zone Clerk → token Necroloto
     ============================================================ */
  function clerkThemeBoard() {
    // a single mapping row: clerk variable/zone → token + hex swatch + note
    function row(clerk, token, hex, note, swatch) {
      const chip = swatch || `<span style="width:26px;height:26px;border-radius:7px;flex:0 0 auto;background:${hex};box-shadow:inset 0 0 0 1px rgba(255,255,255,.12)"></span>`;
      return `<div style="display:grid;grid-template-columns:200px 28px 1fr;align-items:center;gap:14px;padding:13px 16px;border-radius:12px;background:var(--nl-surf);border:1px solid var(--nl-line)">
        <code class="nl-mono" style="font-size:13px;color:var(--nl-ink)">${clerk}</code>
        <span class="nl-dim" style="text-align:center">${icon("chevR", 15)}</span>
        <div style="display:flex;align-items:center;gap:12px;min-width:0">
          ${chip}
          <div style="min-width:0">
            <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <code class="nl-mono" style="font-size:13px;color:var(--nl-neon)">${token}</code>
              ${hex ? `<span class="nl-dim nl-mono" style="font-size:11.5px">${hex}</span>` : ""}
            </div>
            <div class="nl-dim" style="font-size:12px;margin-top:2px">${note}</div>
          </div>
        </div>
      </div>`;
    }

    function panel(label, rows) {
      return `<section class="nl-card-flat nl-toprule" style="padding:20px;display:flex;flex-direction:column;gap:12px">
        <div class="nl-eyebrow">${label}</div>
        <div style="display:flex;flex-direction:column;gap:8px">${rows}</div>
      </section>`;
    }

    const colors = [
      row("colorPrimary", "--nl-neon", "#39FF6A", "Boutons primaires, liens, focus, anneaux actifs."),
      row("colorBackground", "--nl-bg", "#0B0B0F", "Fond de page derrière la carte d'auth."),
      row("colorInputBackground", "--nl-surf", "#14141C", "Remplissage des champs e-mail / code."),
      row("colorText", "--nl-ink", "#F3F4F8", "Titres et libellés principaux."),
      row("colorTextSecondary", "--nl-ink-2", "#9B9CAC", "Sous-titres, aides, placeholders."),
      row("colorDanger", "--nl-coral", "#FF5A3C", "Erreurs de champ, code invalide."),
      row("colorSuccess", "--nl-neon", "#39FF6A", "Validation e-mail, états « ok »."),
    ].join("");

    const compsSwatch = {
      card: `<span style="width:26px;height:26px;border-radius:7px;flex:0 0 auto;background:linear-gradient(180deg,var(--nl-surf-2),var(--nl-surf));box-shadow:inset 0 0 0 1px var(--nl-line);position:relative;overflow:hidden"><span style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,rgba(var(--nl-neon-rgb)/.9),transparent)"></span></span>`,
      input: `<span style="width:26px;height:26px;border-radius:7px;flex:0 0 auto;background:var(--nl-surf);box-shadow:0 0 0 2px rgba(var(--nl-neon-rgb)/.7)"></span>`,
      btn: `<span style="width:26px;height:26px;border-radius:7px;flex:0 0 auto;background:var(--nl-neon);box-shadow:0 0 14px rgba(var(--nl-neon-rgb)/.6)"></span>`,
      divider: `<span style="width:26px;height:26px;border-radius:7px;flex:0 0 auto;background:var(--nl-surf-3);position:relative"><span style="position:absolute;top:50%;left:4px;right:4px;height:1px;background:var(--nl-line-2)"></span></span>`,
    };

    const comps = [
      row("card", "--nl-surf · .nl-toprule", "r16", "Dégradé charbon + hairline néon en tête de carte.", compsSwatch.card),
      row("inputs", "--nl-surf-2 · ring néon", "r13", "Focus = anneau 3px rgba(neon/.16) + glow.", compsSwatch.input),
      row("formButtonPrimary", "--nl-neon · glow", "r11", "Fond néon plein, texte --nl-neon-ink sombre.", compsSwatch.btn),
      row("dividerLine", "--nl-line", "rgba ·07", "Trait « ou » et séparateurs internes.", compsSwatch.divider),
      row("socialButtons", "--nl-surf-3", "r11", "Surface neutre, logo de marque conservé.", null),
      row("footerActionLink", "--nl-neon", "#39FF6A", "« S'inscrire » / « Se connecter ».", null),
    ].join("");

    const radii = [
      row("borderRadius", "card 16 · input 13 · btn 11", "px", "Échelle de rayons par composant.", `<span style="width:26px;height:26px;border-radius:9px;flex:0 0 auto;background:var(--nl-surf-3);box-shadow:inset 0 0 0 1px var(--nl-line-2)"></span>`),
      row("fontFamily", "Space Grotesk", "UI", "Texte d'interface, libellés, boutons.", `<span class="nl-display" style="width:26px;height:26px;border-radius:7px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:15px;background:var(--nl-surf-3)">Aa</span>`),
      row("headingFont", "Saira Condensed", "display", "Titres de carte « Connexion », gros chiffres.", `<span class="nl-display" style="width:26px;height:26px;border-radius:7px;flex:0 0 auto;display:flex;align-items:center;justify-content:center;font-size:16px;background:var(--nl-surf-3);color:var(--nl-neon)">12</span>`),
    ].join("");

    return `<div class="nl" data-screen-label="Board — thème Clerk" style="height:auto;overflow:auto">
      <div style="position:relative;z-index:1;padding:32px 36px 42px;display:flex;flex-direction:column;gap:24px">
        <header style="display:flex;align-items:flex-start;gap:16px">
          <div>
            <div class="nl-eyebrow" style="margin-bottom:6px">Référence dev · appearance Clerk</div>
            <div class="nl-h1" style="font-size:28px">Thème Clerk → tokens Necroloto</div>
            <div class="nl-muted" style="font-size:14px;margin-top:5px;max-width:72ch">À brancher sur <span class="nl-mono" style="font-size:13px">appearance.variables</span> et <span class="nl-mono" style="font-size:13px">appearance.elements</span> des composants <span class="nl-mono" style="font-size:13px">&lt;SignIn/&gt;</span> / <span class="nl-mono" style="font-size:13px">&lt;SignUp/&gt;</span>. Le moteur Clerk reste inchangé — seul l'habillage est mappé ici.</div>
          </div>
          <div style="margin-left:auto;align-self:flex-start">${logo(0.95)}</div>
        </header>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:18px;align-items:start">
          ${panel("appearance.variables — couleurs", colors)}
          <div style="display:flex;flex-direction:column;gap:18px">
            ${panel("appearance.elements — composants", comps)}
            ${panel("Rayons & typographie", radii)}
          </div>
        </div>
      </div>
    </div>`;
  }

  N.authSplitDesktop = authSplitDesktop;
  N.signInMobile     = signInMobile;
  N.signUpMobile     = signUpMobile;
  N.verifyOtp        = verifyOtp;
  N.authLoading      = authLoading;
  N.clerkThemeBoard  = clerkThemeBoard;
})();
