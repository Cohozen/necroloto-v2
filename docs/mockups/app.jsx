/* Necroloto — canvas app + tweaks bridge */
const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#39FF6A",
  "glow": 65,
  "density": "regular",
  "display": "condense"
}/*EDITMODE-END*/;

const DISPLAY_FONTS = {
  condense: '"Saira Condensed", "Space Grotesk", sans-serif',
  arcade:   '"Pixelify Sans", "Saira Condensed", sans-serif',
  mono:     '"Space Mono", ui-monospace, monospace',
};

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const x = h.length === 3 ? h.replace(/./g, (c) => c + c) : h;
  const n = parseInt(x, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
}
function accentVars(v) {
  if (Array.isArray(v)) return { hex: "#34FFC0", rgb: "52 255 192" }; // mix → mint teal
  return { hex: v, rgb: hexToRgb(v) };
}

function applyTweaks(t) {
  const root = document.documentElement;
  const a = accentVars(t.accent);
  root.style.setProperty("--nl-neon", a.hex);
  root.style.setProperty("--nl-neon-rgb", a.rgb);
  root.style.setProperty("--nl-glow", String((t.glow ?? 65) / 100));
  root.style.setProperty("--nl-display", DISPLAY_FONTS[t.display] || DISPLAY_FONTS.condense);
  root.dataset.display = t.display;
  root.dataset.density = t.density;
}

function Screen({ html }) {
  return <div style={{ width: "100%", height: "100%" }} dangerouslySetInnerHTML={{ __html: html }} />;
}

const DARK = { background: "#0B0B0F" };

function App() {
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);
  useEffect(() => { applyTweaks(t); }, [t]);

  const N = window.NECRO;

  return (
    <>
      <DesignCanvas>
        <DCSection id="systeme" title="Système" subtitle="5 pages : couleurs · typo · contrôles · badges · états clés">
          <DCArtboard id="sys-couleurs" label="01 · Couleurs" width={760} height={760} style={DARK}>
            <Screen html={N.foundationsColors()} />
          </DCArtboard>
          <DCArtboard id="sys-typo" label="02 · Typographie" width={620} height={590} style={DARK}>
            <Screen html={N.foundationsType()} />
          </DCArtboard>
          <DCArtboard id="sys-controles" label="03 · Boutons & contrôles" width={720} height={486} style={DARK}>
            <Screen html={N.foundationsButtons()} />
          </DCArtboard>
          <DCArtboard id="sys-badges" label="04 · Badges & avatars" width={820} height={752} style={DARK}>
            <Screen html={N.foundationsBadges()} />
          </DCArtboard>
          <DCArtboard id="sys-etats" label="05 · États clés" width={900} height={606} style={DARK}>
            <Screen html={N.foundationsStates()} />
          </DCArtboard>
        </DCSection>

        <DCSection id="dashboard" title="Dashboard — cockpit du joueur" subtitle="Score global, cercles, décès récents, pari en cours">
          <DCArtboard id="dash-d" label="Desktop · 1320" width={1320} height={842} style={DARK}>
            <Screen html={N.dashboardDesktop()} />
          </DCArtboard>
          <DCArtboard id="dash-m" label="Mobile · 390" width={390} height={844} style={DARK}>
            <Screen html={N.dashboardMobile()} />
          </DCArtboard>
        </DCSection>

        <DCSection id="classement" title="Classement d'un cercle — le cœur du jeu" subtitle="Podium néon, leaderboard, mises de chacun, filtre par année">
          <DCArtboard id="lb-d" label="Desktop · 1320" width={1320} height={892} style={DARK}>
            <Screen html={N.leaderboardDesktop()} />
          </DCArtboard>
          <DCArtboard id="lb-m" label="Mobile · 390" width={390} height={844} style={DARK}>
            <Screen html={N.leaderboardMobile()} />
          </DCArtboard>
        </DCSection>

        <DCSection id="pari" title="Mon pari / catalogue — le draft" subtitle="Command palette, cartes célébrités, compteur de sélection">
          <DCArtboard id="draft-d" label="Desktop · 1320" width={1320} height={1000} style={DARK}>
            <Screen html={N.draftDesktop()} />
          </DCArtboard>
          <DCArtboard id="draft-m" label="Mobile · 390 · recherche" width={390} height={844} style={DARK}>
            <Screen html={N.draftMobile()} />
          </DCArtboard>
        </DCSection>

        <DCSection id="fiche" title="Fiche célébrité" subtitle="Statut vivant·e / décédé·e + joueurs ayant parié dessus">
          <DCArtboard id="fiche-alive" label="Desktop · vivant·e" width={1320} height={724} style={DARK}>
            <Screen html={N.celebrityDesktop("buck")} />
          </DCArtboard>
          <DCArtboard id="fiche-dead" label="Desktop · décédé·e" width={1320} height={724} style={DARK}>
            <Screen html={N.celebrityDesktop("gloria")} />
          </DCArtboard>
          <DCArtboard id="fiche-m" label="Mobile · 390" width={390} height={844} style={DARK}>
            <Screen html={N.celebrityMobile("gloria")} />
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Accent primaire" />
        <TweakColor label="Néon" value={t.accent}
          options={["#39FF6A", "#22E6FF", ["#39FF6A", "#22E6FF"]]}
          onChange={(v) => setTweak("accent", v)} />
        <TweakSection label="Ambiance" />
        <TweakSlider label="Glow / grain" value={t.glow} min={0} max={100} step={5} unit="%"
          onChange={(v) => setTweak("glow", v)} />
        <TweakRadio label="Densité" value={t.density}
          options={[{ value: "compact", label: "Compact" }, { value: "regular", label: "Normal" }, { value: "aere", label: "Aéré" }]}
          onChange={(v) => setTweak("density", v)} />
        <TweakSection label="Police display" />
        <TweakRadio label="Chiffres" value={t.display}
          options={[{ value: "condense", label: "Condensé" }, { value: "arcade", label: "Arcade" }, { value: "mono", label: "Mono" }]}
          onChange={(v) => setTweak("display", v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
