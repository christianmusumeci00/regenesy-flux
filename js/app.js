// Avvio: barra di navigazione fluttuante, Centro di controllo, router, tema e live.
import { getState, setState, setOpts, subscribe, comboOf } from './store.js';
import { STYLES, applyTheme } from './theme.js';
import { UTIL, UTIL_IDS, SLUG, setLive, fireEvent } from './live.js';
import { COMPONENTS } from './catalog.js';
import { esc, ms } from './components/base.js';
import { toast, savePreset } from './ui.js';
import * as home from './pages/home.js';
import * as gallery from './pages/gallery.js';
import * as compare from './pages/compare.js';
import * as studio from './pages/studio.js';
import * as poc from './pages/poc.js';

const nav = document.getElementById('topnav');
const cc = document.getElementById('cc');
let current = null;

const ROUTES = [
  ['', 'Home', 'home'],
  ['componenti', 'Componenti', 'grid_view'],
  ['confronta', 'Confronta', 'compare'],
  ['poc', 'POC', 'rocket_launch'],
  ['studio', 'Studio temi', 'palette'],
];

const route = () => {
  const [path, query] = location.hash.replace(/^#\/?/, '').split('?');
  return { parts: path.replace(/\/$/, '').split('/'), q: new URLSearchParams(query || '') };
};

function render() {
  const { parts, q } = route();
  const mods = { '': home, componenti: gallery, confronta: compare, studio, poc };
  const mod = mods[parts[0]] || home;
  current?.view?.destroy?.();
  const old = document.getElementById('main');
  const main = document.createElement('main');
  main.id = 'main';
  main.tabIndex = -1;
  old.replaceWith(main);
  document.body.dataset.page = parts[0] || 'home';
  current = { key: parts[0] || '', view: mod.render(main, { parts, q }) || {} };
  closeCC();
  drawNav();
  window.scrollTo(0, 0);
}

function drawNav() {
  const s = getState();
  const key = current?.key ?? '';
  nav.innerHTML = `
    <a class="brand" href="#/" aria-label="Regenesy Flux, home"><img src="assets/pittogramma_colori.svg" alt=""><b>Flux</b></a>
    <nav class="tabs" aria-label="Sezioni">${ROUTES.map(([r, label, ic]) => `<a href="#/${r === 'poc' ? 'poc/' + SLUG[s.utility] : r}" ${key === r ? 'aria-current="page"' : ''}>${ms(ic)}<span>${label}</span></a>`).join('')}</nav>
    <div class="util" role="radiogroup" aria-label="Settore">${UTIL_IDS.map((id) => `<button role="radio" aria-checked="${s.utility === id}" data-util="${id}" title="${UTIL[id].name}">${ms(UTIL[id].icon)}<span>${UTIL[id].name}</span></button>`).join('')}<i class="util__thumb" style="--i:${UTIL_IDS.indexOf(s.utility)}"></i></div>
    <button class="nav-btn" data-cc aria-expanded="${!cc.hidden}" aria-label="Centro di controllo: tema, modalità, live">${ms('tune')}</button>`;
}

function drawCC() {
  const s = getState(), o = s.opts;
  const seg = (name, items, val) => `<div class="cc-seg" data-seg="${name}">${items.map(([v, l, ic]) => `<button aria-pressed="${String(val) === String(v)}" data-v="${v}">${ic ? ms(ic) : ''}${l}</button>`).join('')}</div>`;
  cc.innerHTML = `
    <div class="cc__grid">
      <section class="cc-tile cc-tile--wide"><h3>Settore</h3><div class="cc-utils">${UTIL_IDS.map((id) => `<button data-util="${id}" aria-pressed="${s.utility === id}" class="cc-util cc-util--${id}">${ms(UTIL[id].icon)}<b>${UTIL[id].name}</b><small>${UTIL[id].product}</small></button>`).join('')}</div></section>
      <section class="cc-tile cc-tile--wide"><h3>Stile</h3><div class="cc-styles">${Object.entries(STYLES).map(([id, st]) => `<button data-style-pick="${id}" aria-pressed="${s.style === id}" class="cc-style cc-style--${id}"><span class="cc-style__sw"></span><b>${st.name}</b><small>${st.tagline}</small></button>`).join('')}</div></section>
      <section class="cc-tile"><h3>Modalità</h3>${seg('mode', [['light', 'Chiaro', 'light_mode'], ['dark', 'Scuro', 'dark_mode'], ['auto', 'Auto', 'contrast']], s.mode)}</section>
      <section class="cc-tile"><h3>Live</h3><div class="cc-live"><button class="cc-play" data-play aria-label="${s.playing ? 'Metti in pausa' : 'Riprendi'}">${ms(s.playing ? 'pause' : 'play_arrow')}</button>${seg('speed', [[1, '1×'], [2, '2×'], [4, '4×']], s.speed)}</div></section>
      <section class="cc-tile cc-tile--wide"><h3>Regolazioni</h3>
        <label class="cc-range"><span>Angoli</span><input type="range" min="0.2" max="1.6" step="0.05" value="${o.radius}" data-opt="radius"><output>${Math.round(o.radius * 100)}%</output></label>
        <label class="cc-range"><span>Bagliore</span><input type="range" min="0" max="1" step="0.05" value="${o.glow ?? STYLES[s.style].glow}" data-opt="glow"><output>${Math.round((o.glow ?? STYLES[s.style].glow) * 100)}%</output></label>
        <div class="cc-row"><span>Densità</span>${seg('density', [['compatta', 'Compatta'], ['standard', 'Standard'], ['ariosa', 'Ariosa']], o.density)}</div>
        <div class="cc-row"><label class="sw"><input type="checkbox" data-opt-bool="blur" ${o.blur ? 'checked' : ''}><span class="sw__track"><span class="sw__thumb"></span></span><span>Vetro sfocato</span></label><label class="sw"><input type="checkbox" data-opt-bool="motion" ${o.motion ? 'checked' : ''}><span class="sw__track"><span class="sw__thumb"></span></span><span>Animazioni</span></label></div>
        <div class="cc-row"><span>Accento</span><input type="color" value="${o.accent || '#0a84ff'}" data-accent aria-label="Colore d'accento personale"><button class="fx-btn fx-btn--ghost fx-btn--sm" data-accent-reset ${o.accent ? '' : 'disabled'}>Usa quello del settore</button></div>
      </section>
    </div>
    <div class="cc__foot"><button class="fx-btn fx-btn--tint" data-fire>${ms('bolt')}Simula un evento</button><span class="spacer"></span><button class="fx-btn fx-btn--ghost" data-save>${ms('bookmark_add')}Salva combinazione</button><a class="fx-btn fx-btn--primary" href="#/studio">${ms('palette')}Studio temi</a></div>`;
}

function openCC() {
  drawCC();
  cc.hidden = false;
  requestAnimationFrame(() => cc.classList.add('is-open'));
  nav.querySelector('[data-cc]')?.setAttribute('aria-expanded', 'true');
}
function closeCC() {
  cc.classList.remove('is-open');
  cc.hidden = true;
  nav.querySelector('[data-cc]')?.setAttribute('aria-expanded', 'false');
}

document.addEventListener('click', async (e) => {
  const t = e.target;
  if (t.closest('a[href="#"]')) e.preventDefault();
  const util = t.closest('[data-util]');
  if (util && (nav.contains(util) || cc.contains(util))) {
    setState({ utility: util.dataset.util });
    if (current?.key === 'poc') location.hash = `#/poc/${SLUG[util.dataset.util]}`;
    return;
  }
  if (t.closest('[data-cc]')) return cc.hidden ? openCC() : closeCC();
  if (!cc.hidden && !cc.contains(t)) return closeCC();
  if (!cc.contains(t)) return;
  const st = t.closest('[data-style-pick]');
  if (st) setState({ style: st.dataset.stylePick, opts: { ...getState().opts, glow: null } });
  const sg = t.closest('[data-seg] button');
  if (sg) {
    const name = sg.parentElement.dataset.seg, v = sg.dataset.v;
    if (name === 'mode') setState({ mode: v });
    if (name === 'speed') setState({ speed: Number(v) });
    if (name === 'density') setOpts({ density: v });
  }
  if (t.closest('[data-play]')) setState({ playing: !getState().playing });
  if (t.closest('[data-accent-reset]')) setOpts({ accent: null });
  if (t.closest('[data-fire]')) {
    const ev = fireEvent(getState().utility);
    toast(`${ev.title} · ${ev.text}`, ev.kind, ev.icon);
  }
  if (t.closest('[data-save]')) savePreset();
});

cc.addEventListener('input', (e) => {
  const k = e.target.dataset.opt;
  if (k) {
    const v = Number(e.target.value);
    e.target.nextElementSibling.textContent = `${Math.round(v * 100)}%`;
    setOpts({ [k]: v });
  }
  if (e.target.dataset.accent !== undefined) setOpts({ accent: e.target.value });
});
cc.addEventListener('change', (e) => {
  const k = e.target.dataset.optBool;
  if (k) setOpts({ [k]: e.target.checked });
});

// Il riflesso dei pulsanti "magnetici" segue il puntatore.
document.addEventListener('pointermove', (e) => {
  const b = e.target.closest?.('.fx-btn--magnetic');
  if (!b) return;
  const r = b.getBoundingClientRect();
  b.style.setProperty('--mx', `${e.clientX - r.left}px`);
  b.style.setProperty('--my', `${e.clientY - r.top}px`);
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !cc.hidden) closeCC();
  if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault();
    import('./ui.js').then((m) => m.openPalette(COMPONENTS));
  }
});

let lastCombo = '';
subscribe((s, prev) => {
  const key = JSON.stringify(comboOf(s));
  if (key !== lastCombo) {
    lastCombo = key;
    applyTheme(comboOf(s));
  }
  if (s.speed !== prev.speed || s.playing !== prev.playing) setLive({ speed: s.speed, playing: s.playing });
  drawNav();
  // Non ridisegnare il pannello mentre si trascina un cursore o si sceglie un colore.
  const busy = cc.contains(document.activeElement) && /range|color/.test(document.activeElement.type);
  if (!cc.hidden && !busy) drawCC();
  current?.view?.onState?.(s, prev);
});
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => getState().mode === 'auto' && applyTheme(comboOf(getState())));

applyTheme(comboOf(getState()));
lastCombo = JSON.stringify(comboOf(getState()));
setLive({ speed: getState().speed, playing: getState().playing });
window.addEventListener('hashchange', render);
render();
