// Confronta: lo stesso componente in più stili × settori × modalità (o combinazioni salvate), affiancati.
import { getState, DEFAULT_OPTS } from '../store.js';
import { STYLES, themeAttrs } from '../theme.js';
import { UTIL, UTIL_IDS } from '../live.js';
import { COMPONENTS, demoHTML, findComponent } from '../catalog.js';
import { esc, ms } from '../components/base.js';

const MAX = 12;
let sel = null;

export function render(main, { q }) {
  const s0 = getState();
  if (!sel) sel = { comp: 'rg-arc-gauge', styles: ['cupertino', 'aurora', 'neon'], utils: [s0.utility], modes: ['light', 'dark'], presets: [] };
  if (q.get('c') && findComponent(q.get('c'))) sel.comp = q.get('c');
  if (q.get('p')) sel = { ...sel, presets: q.get('p').split(','), styles: [], utils: [], modes: [] };

  const combos = () => {
    const s = getState();
    const out = [];
    sel.styles.forEach((st) => sel.utils.forEach((u) => sel.modes.forEach((m) => out.push({ label: `${STYLES[st].name} · ${UTIL[u].name} · ${m === 'dark' ? 'Scuro' : 'Chiaro'}`, combo: { style: st, utility: u, mode: m, opts: { ...DEFAULT_OPTS } } }))));
    s.presets.filter((p) => sel.presets.includes(p.id)).forEach((p) => out.unshift({ label: p.name, saved: true, combo: { style: p.style, utility: p.utility, mode: p.mode === 'auto' ? 'light' : p.mode, opts: p.opts } }));
    return out;
  };

  const chips = (key, items) => `<div class="chips">${items.map(([v, l, ic]) => `<button class="chip" aria-pressed="${sel[key].includes(v)}" data-k="${key}" data-v="${v}">${ic ? ms(ic) : ''}${esc(l)}</button>`).join('')}</div>`;

  function drawGrid() {
    const list = combos();
    const c = findComponent(sel.comp);
    main.querySelector('#cmp-count').innerHTML = `<b>${Math.min(list.length, MAX)}</b> combinazioni${list.length > MAX ? ` <span class="warn">(ne mostro ${MAX} su ${list.length})</span>` : ''}`;
    main.querySelector('#cmp-grid').innerHTML = list.length
      ? list.slice(0, MAX).map((x) => `<figure class="cmp">
          <div class="fx-scope cmp__scope" ${themeAttrs(x.combo)}><div class="fx-card cmp__card">${demoHTML(c)}</div></div>
          <figcaption>${x.saved ? ms('bookmark', 'ms-fill') : ''}${esc(x.label)}</figcaption></figure>`).join('')
      : `<div class="empty fx-card">${ms('compare')}<h3>Scegli almeno uno stile, un settore e una modalità</h3><p>Oppure una combinazione salvata.</p></div>`;
  }

  function draw() {
    const s = getState();
    main.innerHTML = `<div class="page page--wide">
      <header class="page-head"><span class="eyebrow">${ms('compare')}Confronta</span><h1>Più temi, un colpo d'occhio.</h1>
        <p>Scegli un componente e accendi più stili, settori e modalità: ogni combinazione è un'anteprima viva, con i suoi dati.</p></header>
      <section class="fx-card cmp-controls">
        <label class="cmp-field"><span class="fx-label">Componente</span><select class="fx-input fx-select" id="cmp-comp">${COMPONENTS.map((c) => `<option value="${c.id}" ${c.id === sel.comp ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>
        <div class="cmp-field"><span class="fx-label">Stili</span>${chips('styles', Object.entries(STYLES).map(([id, st]) => [id, st.name]))}</div>
        <div class="cmp-field"><span class="fx-label">Settori</span>${chips('utils', UTIL_IDS.map((id) => [id, UTIL[id].name, UTIL[id].icon]))}</div>
        <div class="cmp-field"><span class="fx-label">Modalità</span>${chips('modes', [['light', 'Chiaro', 'light_mode'], ['dark', 'Scuro', 'dark_mode']])}</div>
        ${s.presets.length ? `<div class="cmp-field"><span class="fx-label">Combinazioni salvate</span>${chips('presets', s.presets.map((p) => [p.id, p.name, 'bookmark']))}</div>` : `<p class="cmp-hint">${ms('bookmark_add')}Salva le tue combinazioni dallo <a href="#/studio">Studio temi</a> o dal Centro di controllo per confrontarle qui.</p>`}
        <div class="cmp-count" id="cmp-count"></div>
      </section>
      <div class="cmp-grid" id="cmp-grid"></div>
    </div>`;
    drawGrid();
  }

  main.addEventListener('click', (e) => {
    const b = e.target.closest('[data-k]');
    if (!b) return;
    const k = b.dataset.k, v = b.dataset.v;
    sel[k] = sel[k].includes(v) ? sel[k].filter((x) => x !== v) : [...sel[k], v];
    b.setAttribute('aria-pressed', sel[k].includes(v));
    drawGrid();
  });
  main.addEventListener('change', (e) => {
    if (e.target.id === 'cmp-comp') {
      sel.comp = e.target.value;
      drawGrid();
    }
  });

  draw();
  return { onState: (s, prev) => s.presets !== prev.presets && draw() };
}
