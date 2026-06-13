/* Mon pari / catalogue — desktop draft grid + mobile command palette */
(function () {
  const N = window.NECRO;
  const { icon, pixel, avatar, portrait, statusPill } = N;

  const SELECTED = new Set(["gloria", "strog", "cons", "babet", "yola", "glen", "vane"]);
  const CATS = ["Tous", "Cinéma", "Musique", "Royauté & politique", "Sport", "Affaires"];

  function celebCard(c) {
    const sel = SELECTED.has(c.id);
    const dead = c.status === "deceased";
    return `<div class="nl-celeb ${sel ? "nl-celeb--sel" : ""}">
      <div class="nl-celeb__check">${icon("check", 16, 2.6)}</div>
      <div class="nl-celeb__pic">${portrait(c, { letter: 56 })}</div>
      <div>
        <div class="nl-celeb__name">${c.name}</div>
        <div class="nl-celeb__sub">${c.age} ans · °${c.born} · ${c.role}</div>
      </div>
      <div class="nl-celeb__foot">
        ${dead ? statusPill(c) : `<span class="nl-status nl-status--alive" style="font-size:11px"><span class="nl-dot nl-dot--alive"></span>Vivant·e</span>`}
        <span class="nl-odds">${icon("bolt", 12, 2)} ${c.cote}</span>
      </div>
    </div>`;
  }

  // floating draft tray (desktop)
  function tray() {
    const thumbs = ["gloria", "strog", "yola", "babet", "glen"].map((id) =>
      `<div style="width:34px">${portrait(N.celebById[id], { letter: 14, radius: 8 })}</div>`).join("");
    return `<div class="nl-card nl-glow-green" style="padding:13px 16px;display:flex;align-items:center;gap:18px;border-radius:16px">
      <div style="display:flex;align-items:center;gap:12px">
        <div class="nl-display nl-neon-ink" style="font-size:34px">12<span style="color:var(--nl-ink-3);font-size:.62em"> / 15</span></div>
        <div><div style="font-weight:700;font-size:13px">Brouillon enregistré</div><div class="nl-dim" style="font-size:11px">il reste 3 choix</div></div>
      </div>
      <div style="display:flex;align-items:center;gap:6px">${thumbs}<span class="nl-stack"><span class="nl-more" style="width:34px;height:34px;margin-left:0">+7</span></span></div>
      <div style="flex:1"></div>
      <div style="text-align:right"><div class="nl-eyebrow">Cote cumulée</div><div class="nl-mono" style="font-size:15px;font-weight:700;color:var(--nl-neon)">48.60</div></div>
      <button class="nl-btn nl-btn-primary">${icon("check", 16, 2.4)} Valider mon pari</button>
    </div>`;
  }

  // ---------- DESKTOP ----------
  function draftDesktop() {
    const cards = N.celebs.slice(0, 12).map(celebCard).join("");
    return `<div class="nl" data-screen-label="Mon pari · desktop">
      <div style="display:flex;height:100%;position:relative;z-index:1">
        ${N.navRail("draft")}
        <div style="flex:1;min-width:0;display:flex;flex-direction:column">
          <div class="nl-topbar">
            <div><div class="nl-eyebrow">Draft · saison 2026</div><div class="nl-h1" style="font-size:22px;margin-top:2px">Composez votre liste</div></div>
            <div class="nl-search" style="margin-left:18px">${icon("search", 16)} Rechercher une célébrité… <kbd>⌘K</kbd></div>
            <div style="flex:1"></div>
            <span class="nl-pill" style="height:34px;color:var(--nl-neon);border-color:rgba(var(--nl-neon-rgb)/.4)">${icon("cards", 15, 1.8)} 12 / 15 sélectionnées</span>
            <div class="nl-year">${icon("cal", 16)}<b>2026</b></div>
          </div>

          <!-- filters -->
          <div style="display:flex;align-items:center;gap:9px;padding:14px 22px;border-bottom:1px solid var(--nl-line);overflow:hidden">
            ${CATS.map((c, i) => `<span class="nl-chip ${i === 0 ? "nl-chip--on" : ""}">${c}</span>`).join("")}
            <div style="flex:1"></div>
            <span class="nl-chip">${icon("filter", 14)} Cote ↑</span>
          </div>

          <div style="flex:1;min-height:0;position:relative;overflow:hidden">
            <div style="padding:20px 22px 110px;display:grid;grid-template-columns:repeat(6,1fr);gap:14px;align-content:start">
              ${cards}
            </div>
            <!-- sticky tray -->
            <div style="position:absolute;left:22px;right:22px;bottom:18px;z-index:5">${tray()}</div>
          </div>
        </div>
      </div>
    </div>`;
  }

  // command palette result row
  function cmdRow(c, on) {
    const dead = c.status === "deceased";
    return `<div class="nl-cmd__row ${on ? "nl-cmd__row--on" : ""}">
      <div style="width:38px">${portrait(c, { letter: 15, radius: 8 })}</div>
      <div style="flex:1;min-width:0">
        <div style="font-weight:600;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${c.name}</div>
        <div class="nl-dim" style="font-size:12px">${c.age} ans · ${c.role}</div>
      </div>
      ${dead ? `<span class="nl-pill" style="color:var(--nl-coral);border-color:rgba(var(--nl-coral-rgb)/.35)">${pixel("ghost", "currentColor", 2)} décédé·e</span>`
              : `<span class="nl-odds">${c.cote}</span>`}
      ${on ? `<span class="nl-cmd__hint">⏎ ajouter</span>` : `<span style="color:var(--nl-ink-3)">${icon("plus", 16)}</span>`}
    </div>`;
  }

  // ---------- MOBILE (command palette focused) ----------
  function draftMobile() {
    const results = ["strog", "sven", "cons", "vane"];
    return `<div class="nl" data-screen-label="Mon pari · recherche">
      <div class="nl-scroll" style="display:flex;flex-direction:column">
        <div class="nl-mtop" style="position:relative;z-index:1;gap:10px">
          <div><div class="nl-eyebrow">Draft · 2026</div><div class="nl-h1" style="font-size:19px;margin-top:2px">Ajouter une célébrité</div></div>
          <div style="flex:1"></div>
          <span class="nl-pill" style="color:var(--nl-neon);border-color:rgba(var(--nl-neon-rgb)/.4)">12 / 15</span>
        </div>

        <div style="position:relative;z-index:1;flex:1;overflow:hidden;padding:6px 14px 24px;display:flex;flex-direction:column;gap:12px">
          <div class="nl-cmd">
            <div class="nl-cmd__bar">
              <span style="color:var(--nl-neon)">${icon("search", 20)}</span>
              <div class="nl-cmd__input">strog<span class="nl-caret"></span></div>
              <span class="nl-pill" style="height:24px">${icon("cmd", 12, 1.8)} K</span>
            </div>
            <div style="padding-bottom:10px">
              <div class="nl-cmd__sect">Résultats · base Wikidata</div>
              ${results.map((id, i) => cmdRow(N.celebById[id], i === 0)).join("")}
              <div class="nl-cmd__sect" style="margin-top:6px">Suggestions populaires</div>
              ${cmdRow(N.celebById.buck, false)}
            </div>
            <div style="display:flex;align-items:center;gap:14px;padding:11px 16px;border-top:1px solid var(--nl-line);color:var(--nl-ink-3);font-size:11px">
              <span>↑↓ naviguer</span><span>⏎ ajouter</span><span>esc fermer</span>
              <div style="flex:1"></div><span>${icon("globe", 13, 1.8)} données Wikidata</span>
            </div>
          </div>

          <!-- already drafted preview -->
          <div style="display:flex;align-items:center;justify-content:space-between">
            <div class="nl-h2" style="font-size:16px">Déjà dans votre liste</div>
            <span class="nl-dim" style="font-size:12px">12 célébrités</span>
          </div>
          <div style="display:flex;gap:8px;overflow:hidden">
            ${["gloria", "strog", "cons", "babet", "yola", "glen"].map((id) => `<div style="flex:0 0 auto;position:relative">${portrait(N.celebById[id], { size: 52, letter: 22, radius: 11 })}</div>`).join("")}
            <div style="flex:0 0 auto;width:52px;height:52px;border-radius:11px;border:1px dashed var(--nl-line-2);display:flex;align-items:center;justify-content:center;color:var(--nl-ink-3);font-weight:700;font-size:13px">+6</div>
          </div>
        </div>

        <nav class="nl-mbottom">
          <span class="nl-mtab">${icon("home", 22)} Accueil</span>
          <span class="nl-mtab">${icon("trophy", 22)} Classement</span>
          <span class="nl-mfab">${icon("check", 24, 2.4)}</span>
          <span class="nl-mtab nl-mtab--on">${icon("cards", 22)} Mon pari</span>
          <span class="nl-mtab">${icon("user", 22)} Profil</span>
        </nav>
      </div>
    </div>`;
  }

  N.draftDesktop = draftDesktop;
  N.draftMobile = draftMobile;
})();
