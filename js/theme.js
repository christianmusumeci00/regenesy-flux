// Temi combinabili: uno STILE (aspetto) × un SETTORE (colori d'accento) × una MODALITÀ × regolazioni.
// Tutto diventa variabili CSS: i componenti leggono solo quelle, quindi cambiano da soli.

export const STYLES = {
  cupertino: {
    name: 'Cupertino', tagline: 'Pulito, funzionale, vicino ad Apple',
    desc: 'Grigi caldi, card bianche che fluttuano, angoli molto morbidi e un velo di vetro. Il tema più sobrio.',
    radius: 22, blur: 24, glow: 0.25, fx: 'soft',
    font: "-apple-system, BlinkMacSystemFont, 'Inter', 'Helvetica Neue', sans-serif",
    display: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
    num: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif",
    light: { bg: '#f5f5f7', bg2: '#eaeef6', surface: 'rgba(255,255,255,.82)', solid: '#ffffff', text: '#1d1d1f', muted: '#6e6e73', border: 'rgba(0,0,0,.07)', shadow: '0 1px 2px rgba(0,0,0,.04), 0 10px 30px rgba(0,0,0,.07)' },
    dark: { bg: '#000000', bg2: '#101014', surface: 'rgba(28,28,30,.82)', solid: '#1c1c1e', text: '#f5f5f7', muted: '#98989d', border: 'rgba(255,255,255,.08)', shadow: '0 1px 2px rgba(0,0,0,.4), 0 14px 34px rgba(0,0,0,.5)' },
  },
  aurora: {
    name: 'Aurora Glass', tagline: 'Vetro, luce e colore in movimento',
    desc: 'Sfondo con aurora animata nei colori del settore, superfici di vetro sfocato e bagliori.',
    radius: 20, blur: 30, glow: 0.9, fx: 'aurora',
    font: "'Inter', sans-serif", display: "'Space Grotesk', 'Inter', sans-serif", num: "'Space Grotesk', 'Inter', sans-serif",
    light: { bg: '#eef1fb', bg2: '#f7f2ff', surface: 'rgba(255,255,255,.5)', solid: '#ffffff', text: '#0f1222', muted: '#5a5f78', border: 'rgba(255,255,255,.7)', shadow: '0 8px 32px rgba(40,50,110,.14), inset 0 1px 0 rgba(255,255,255,.8)' },
    dark: { bg: '#070912', bg2: '#0e1022', surface: 'rgba(255,255,255,.06)', solid: '#141729', text: '#eef0ff', muted: '#9aa0bf', border: 'rgba(255,255,255,.12)', shadow: '0 10px 40px rgba(0,0,0,.45), inset 0 1px 0 rgba(255,255,255,.08)' },
  },
  neon: {
    name: 'Neon Control', tagline: 'Sala controllo, numeri al neon',
    desc: 'Nero profondo, griglia tecnica, numeri monospazio e linee che brillano. Pensato per i monitor h24.',
    radius: 10, blur: 0, glow: 1, fx: 'grid',
    font: "'Inter', sans-serif", display: "'Sora', 'Inter', sans-serif", num: "'JetBrains Mono', ui-monospace, monospace",
    light: { bg: '#eef3f8', bg2: '#e4ecf5', surface: 'rgba(255,255,255,.92)', solid: '#ffffff', text: '#0b1320', muted: '#55657a', border: 'rgba(11,19,32,.12)', shadow: '0 0 0 1px rgba(11,19,32,.04)' },
    dark: { bg: '#03060c', bg2: '#060c16', surface: 'rgba(9,15,26,.9)', solid: '#09101b', text: '#e3f0ff', muted: '#7d8ea6', border: 'color-mix(in srgb, var(--acc) 28%, transparent)', shadow: '0 0 0 1px rgba(0,0,0,.4)' },
  },
  paper: {
    name: 'Carta', tagline: 'Editoriale, essenziale, senza ombre',
    desc: 'Colori di carta, filetti sottili, titoli con grazie. Ideale per report e presentazioni.',
    radius: 6, blur: 0, glow: 0, fx: 'none',
    font: "'Inter', sans-serif", display: "'Fraunces', Georgia, serif", num: "'Fraunces', Georgia, serif",
    light: { bg: '#f6f3ec', bg2: '#efe9de', surface: '#fffdf8', solid: '#fffdf8', text: '#1b1a17', muted: '#6b665c', border: '#e2dacb', shadow: 'none' },
    dark: { bg: '#161411', bg2: '#1b1915', surface: '#1f1c18', solid: '#1f1c18', text: '#f1ece2', muted: '#a49d8f', border: '#38332b', shadow: 'none' },
  },
  soft: {
    name: 'Soft UI', tagline: 'Rilievi morbidi, tattile',
    desc: 'Superfici in rilievo dello stesso colore dello sfondo, ombre doppie. Sembra di poterle toccare.',
    radius: 26, blur: 0, glow: 0.2, fx: 'none',
    font: "'Manrope', 'Inter', sans-serif", display: "'Manrope', 'Inter', sans-serif", num: "'Manrope', 'Inter', sans-serif",
    light: { bg: '#e8edf4', bg2: '#e8edf4', surface: '#e8edf4', solid: '#e8edf4', text: '#2a3140', muted: '#6b7488', border: 'transparent', shadow: '8px 8px 18px #c9d1dd, -8px -8px 18px #ffffff' },
    dark: { bg: '#1f2431', bg2: '#1f2431', surface: '#1f2431', solid: '#1f2431', text: '#e6ebf5', muted: '#8f99ad', border: 'transparent', shadow: '8px 8px 18px #151925, -8px -8px 18px #29303f' },
  },
};

export const UTILITY_COLORS = {
  water: { light: ['#0a7cff', '#32c5ff'], dark: ['#0a84ff', '#64d2ff'] },
  gas: { light: ['#f26a00', '#ff2d55'], dark: ['#ff8a1f', '#ff375f'] },
  power: { light: ['#7c4dff', '#f5b800'], dark: ['#9d7bff', '#ffd60a'] },
};

const SEMANTIC = {
  light: { ok: '#1f9d55', warn: '#c26b00', bad: '#d70015' },
  dark: { ok: '#30d158', warn: '#ff9f0a', bad: '#ff453a' },
};

const DENSITY = { compatta: 0.82, standard: 1, ariosa: 1.2 };

export const resolveMode = (mode) =>
  mode === 'auto' ? (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : mode;

export function themeVars({ style, utility, mode, opts = {} }) {
  const st = STYLES[style] || STYLES.cupertino;
  const m = resolveMode(mode);
  const t = st[m];
  const [acc, acc2] = UTILITY_COLORS[utility]?.[m] || UTILITY_COLORS.water[m];
  const a = opts.accent || acc;
  const r = st.radius * (opts.radius ?? 1);
  return {
    '--bg': t.bg, '--bg2': t.bg2, '--surface': t.surface, '--solid': t.solid,
    '--text': t.text, '--muted': t.muted, '--border': t.border, '--shadow': t.shadow,
    '--acc': a, '--acc2': acc2,
    '--ok': SEMANTIC[m].ok, '--warn': SEMANTIC[m].warn, '--bad': SEMANTIC[m].bad,
    '--r': `${r}px`, '--blur': `${opts.blur === false ? 0 : st.blur}px`,
    '--glow': opts.glow ?? st.glow, '--d': DENSITY[opts.density] ?? 1,
    '--font': st.font, '--font-display': st.display, '--font-num': st.num,
  };
}

export const themeStyle = (combo) =>
  Object.entries(themeVars(combo)).map(([k, v]) => `${k}:${v}`).join(';').replace(/"/g, "'");

export function themeAttrs(combo) {
  const st = STYLES[combo.style] || STYLES.cupertino;
  return `data-style="${combo.style}" data-mode="${resolveMode(combo.mode)}" data-utility="${combo.utility}" data-fx="${st.fx}" data-motion="${combo.opts?.motion === false ? 'off' : 'on'}" style="${themeStyle(combo)}"`;
}

export function applyTheme(combo, el = document.documentElement) {
  Object.entries(themeVars(combo)).forEach(([k, v]) => el.style.setProperty(k, v));
  const st = STYLES[combo.style] || STYLES.cupertino;
  Object.assign(el.dataset, {
    style: combo.style, mode: resolveMode(combo.mode), utility: combo.utility, fx: st.fx,
    motion: combo.opts?.motion === false ? 'off' : 'on',
  });
}

export const comboLabel = (c, UTIL) => `${STYLES[c.style]?.name} · ${UTIL[c.utility]?.name} · ${resolveMode(c.mode) === 'dark' ? 'Scuro' : 'Chiaro'}`;

export function comboCSS(c, name = 'Combinazione') {
  const vars = Object.entries(themeVars(c)).map(([k, v]) => `  ${k}: ${v};`).join('\n');
  return `/* ${name} — Regenesy Flux */\n:root {\n  color-scheme: ${resolveMode(c.mode)};\n${vars}\n}\n`;
}
