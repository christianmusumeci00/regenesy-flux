// Stato globale salvato nel browser: combinazione attiva (stile × settore × modalità × regolazioni),
// combinazioni salvate, preferiti e controlli del "live".
const KEY = 'regenesy-flux-v1';

export const DEFAULT_OPTS = { radius: 1, glow: null, blur: true, density: 'standard', motion: true, accent: null };

const DEFAULTS = {
  utility: 'water',
  style: 'cupertino',
  mode: 'light',
  opts: { ...DEFAULT_OPTS },
  presets: [],
  favorites: [],
  speed: 1,
  playing: true,
};

let state = load();
const subs = new Set();

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { ...DEFAULTS, ...s, opts: { ...DEFAULT_OPTS, ...(s.opts || {}) } };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* storage non disponibile: si lavora in memoria */
  }
}

export const getState = () => state;

export function setState(patch) {
  const prev = state;
  state = { ...state, ...(typeof patch === 'function' ? patch(state) : patch) };
  save();
  subs.forEach((fn) => fn(state, prev));
}

export const setOpts = (patch) => setState((s) => ({ opts: { ...s.opts, ...patch } }));

export function subscribe(fn) {
  subs.add(fn);
  return () => subs.delete(fn);
}

export const comboOf = (s = state) => ({ style: s.style, utility: s.utility, mode: s.mode, opts: { ...s.opts } });

export function toggleFavorite(id) {
  setState((s) => ({ favorites: s.favorites.includes(id) ? s.favorites.filter((x) => x !== id) : [...s.favorites, id] }));
}
