// Studio temi: combina stile × settore × modalità × regolazioni, guarda tutto cambiare dal vivo,
// salva, confronta, esporta e importa le combinazioni.
import { getState, setState, setOpts, comboOf, DEFAULT_OPTS } from '../store.js';
import { STYLES, themeAttrs, comboCSS, UTILITY_COLORS } from '../theme.js';
import { UTIL, UTIL_IDS } from '../live.js';
import { COMPONENTS, findComponent } from '../catalog.js';
import { esc, ms } from '../components/base.js';
import { savePreset, download, pickFile, toast, dialog } from '../ui.js';

export function render(main) {
  const picked = new Set();

  function draw() {
    const s = getState(), o = s.opts;
    const seg = (name, items, val) => `<div class="seg-mini" data-sseg="${name}">${items.map(([v, l, ic]) => `<button aria-pressed="${String(val) === String(v)}" data-v="${v}">${ic ? ms(ic) : ''}${l}</button>`).join('')}</div>`;
    main.innerHTML = `<div class="page page--wide">
      <header class="page-head"><span class="eyebrow">${ms('palette')}Studio temi</span><h1>La tua combinazione, dal vivo.</h1>
        <p>Ogni scelta cambia subito tutto il sito. Quando ti piace, salvala: potrai riaprirla, confrontarla con altre ed esportarla.</p></header>
      <div class="studio">
        <section class="studio__panel fx-card">
          <h2 class="studio__h">${ms('format_paint')}Stile</h2>
          <div class="style-cards">${Object.entries(STYLES).map(([id, st]) => `<button class="style-card ${s.style === id ? 'is-on' : ''}" data-st="${id}" aria-pressed="${s.style === id}">
              <div class="style-card__prev fx-scope" ${themeAttrs({ ...comboOf(s), style: id, opts: { ...DEFAULT_OPTS } })}><span class="sc-dot"></span><span class="sc-card fx-card"><i></i><i></i></span><span class="sc-num fx-num">48,2</span></div>
              <b>${st.name}</b><small>${st.tagline}</small></button>`).join('')}</div>
          <h2 class="studio__h">${ms('category')}Settore</h2>
          <div class="util-cards">${UTIL_IDS.map((id) => `<button class="util-card" data-u="${id}" aria-pressed="${s.utility === id}" style="--a:${UTILITY_COLORS[id].light[0]};--b:${UTILITY_COLORS[id].light[1]}">${ms(UTIL[id].icon)}<b>${UTIL[id].name}</b><small>${UTIL[id].product}</small></button>`).join('')}</div>
          <h2 class="studio__h">${ms('contrast')}Modalità</h2>
          ${seg('mode', [['light', 'Chiaro', 'light_mode'], ['dark', 'Scuro', 'dark_mode'], ['auto', 'Come il sistema', 'contrast']], s.mode)}
          <h2 class="studio__h">${ms('tune')}Regolazioni</h2>
          <label class="cc-range"><span>Angoli</span><input type="range" min="0.2" max="1.6" step="0.05" value="${o.radius}" data-o="radius"><output>${Math.round(o.radius * 100)}%</output></label>
          <label class="cc-range"><span>Bagliore</span><input type="range" min="0" max="1" step="0.05" value="${o.glow ?? STYLES[s.style].glow}" data-o="glow"><output>${Math.round((o.glow ?? STYLES[s.style].glow) * 100)}%</output></label>
          <div class="cc-row"><span>Densità</span>${seg('density', [['compatta', 'Compatta'], ['standard', 'Standard'], ['ariosa', 'Ariosa']], o.density)}</div>
          <div class="cc-row"><label class="sw"><input type="checkbox" data-ob="blur" ${o.blur ? 'checked' : ''}><span class="sw__track"><span class="sw__thumb"></span></span><span>Vetro sfocato</span></label><label class="sw"><input type="checkbox" data-ob="motion" ${o.motion ? 'checked' : ''}><span class="sw__track"><span class="sw__thumb"></span></span><span>Animazioni</span></label></div>
          <div class="cc-row"><span>Accento personale</span><input type="color" value="${o.accent || UTILITY_COLORS[s.utility].light[0]}" data-accent aria-label="Colore d'accento"><button class="fx-btn fx-btn--ghost fx-btn--sm" data-a="accent-reset" ${o.accent ? '' : 'disabled'}>Ripristina</button></div>
          <div class="studio__save"><button class="fx-btn fx-btn--primary" data-a="save">${ms('bookmark_add')}Salva combinazione</button><button class="fx-btn fx-btn--ghost" data-a="reset">${ms('restart_alt')}Valori iniziali</button></div>
        </section>

        <section class="studio__preview">
          <div class="preview-grid">
            <div class="fx-card pv pv--a"><rg-live-number metric="rate"></rg-live-number></div>
            <div class="fx-card pv pv--b"><rg-arc-gauge></rg-arc-gauge></div>
            <div class="fx-card pv pv--c"><rg-stream></rg-stream></div>
            <div class="fx-card pv pv--d"><rg-rings></rg-rings></div>
            <div class="fx-card pv pv--e">${findComponent('ui-buttons').demo()}<div style="height:14px"></div>${findComponent('ui-badges').demo()}</div>
            <div class="fx-card pv pv--f"><rg-controls></rg-controls></div>
          </div>
        </section>
      </div>

      <section class="saved">
        <div class="saved__head"><h2>${ms('bookmarks')}Combinazioni salvate <small>${s.presets.length}</small></h2>
          <div class="saved__acts"><button class="fx-btn fx-btn--ghost fx-btn--sm" data-a="import">${ms('upload')}Importa</button>${s.presets.length ? `<button class="fx-btn fx-btn--ghost fx-btn--sm" data-a="export-all">${ms('download')}Esporta tutte</button>` : ''}<button class="fx-btn fx-btn--tint fx-btn--sm" data-a="compare" ${picked.size ? '' : 'disabled'}>${ms('compare')}Confronta selezionate (${picked.size})</button></div></div>
        ${s.presets.length ? `<div class="saved__grid">${s.presets.map((p) => `<article class="saved-card fx-card ${picked.has(p.id) ? 'is-picked' : ''}">
            <label class="saved-card__pick"><input type="checkbox" data-pick="${p.id}" ${picked.has(p.id) ? 'checked' : ''}><span>${esc(p.name)}</span></label>
            <div class="saved-card__prev fx-scope" ${themeAttrs({ ...p, mode: p.mode })}><rg-live-number metric="pressure"></rg-live-number></div>
            <p class="saved-card__meta">${STYLES[p.style]?.name} · ${UTIL[p.utility]?.name} · ${p.mode === 'dark' ? 'Scuro' : p.mode === 'auto' ? 'Auto' : 'Chiaro'}</p>
            <div class="saved-card__acts"><button class="fx-btn fx-btn--primary fx-btn--sm" data-apply="${p.id}">Applica</button>
              <button class="fx-btn fx-btn--ghost fx-btn--sm" data-css="${p.id}">CSS</button><button class="fx-btn fx-btn--ghost fx-btn--sm" data-json="${p.id}">JSON</button>
              <button class="icon-btn" data-rename="${p.id}" aria-label="Rinomina">${ms('edit')}</button><button class="icon-btn" data-del="${p.id}" aria-label="Elimina">${ms('delete')}</button></div>
          </article>`).join('')}</div>` : `<div class="empty fx-card">${ms('bookmark_add')}<h3>Nessuna combinazione salvata</h3><p>Scegli stile, settore e modalità qui sopra, poi premi "Salva combinazione".</p></div>`}
      </section>
    </div>`;
  }

  main.addEventListener('click', async (e) => {
    const t = e.target.closest('button, input');
    if (!t) return;
    const d = t.dataset, s = getState();
    const find = (id) => s.presets.find((p) => p.id === id);
    if (d.st) setState({ style: d.st, opts: { ...s.opts, glow: null } });
    if (d.u) setState({ utility: d.u });
    if (t.closest('[data-sseg]') && d.v) {
      const name = t.closest('[data-sseg]').dataset.sseg;
      if (name === 'mode') setState({ mode: d.v });
      if (name === 'density') setOpts({ density: d.v });
    }
    if (d.a === 'accent-reset') setOpts({ accent: null });
    if (d.a === 'save') savePreset();
    if (d.a === 'reset') setState({ opts: { ...DEFAULT_OPTS } });
    if (d.pick) {
      t.checked ? picked.add(d.pick) : picked.delete(d.pick);
      draw();
    }
    if (d.a === 'compare') location.hash = `#/confronta?p=${[...picked].join(',')}`;
    if (d.apply) {
      const p = find(d.apply);
      setState({ style: p.style, utility: p.utility, mode: p.mode, opts: { ...DEFAULT_OPTS, ...p.opts } });
      toast(`"${p.name}" applicata a tutto il sito`, 'ok', 'check_circle');
    }
    if (d.css) {
      const p = find(d.css);
      download(`${p.name.replace(/\W+/g, '-').toLowerCase()}.css`, comboCSS(p, p.name), 'text/css');
    }
    if (d.json) {
      const p = find(d.json);
      download(`${p.name.replace(/\W+/g, '-').toLowerCase()}.json`, JSON.stringify({ format: 'regenesy-flux-combos', combos: [p] }, null, 2));
    }
    if (d.a === 'export-all') download('combinazioni-flux.json', JSON.stringify({ format: 'regenesy-flux-combos', combos: s.presets }, null, 2));
    if (d.rename) {
      const p = find(d.rename);
      const name = await dialog({ title: 'Rinomina combinazione', input: { label: 'Nome', value: p.name }, ok: 'Rinomina' });
      if (name) setState({ presets: s.presets.map((x) => (x.id === p.id ? { ...x, name } : x)) });
    }
    if (d.del) {
      const p = find(d.del);
      if (await dialog({ title: `Eliminare "${p.name}"?`, ok: 'Elimina', danger: true })) {
        picked.delete(p.id);
        setState({ presets: s.presets.filter((x) => x.id !== p.id) });
      }
    }
    if (d.a === 'import') {
      const text = await pickFile();
      if (!text) return;
      try {
        const data = JSON.parse(text);
        const list = (data.combos || []).filter((c) => STYLES[c.style] && UTIL[c.utility]);
        if (!list.length) throw new Error('Nessuna combinazione valida nel file.');
        const ids = new Set(s.presets.map((p) => p.id));
        setState({ presets: [...list.map((c) => (ids.has(c.id) ? { ...c, id: 'p' + Math.random().toString(36).slice(2, 8) } : c)), ...s.presets] });
        toast(`${list.length} combinazioni importate`, 'ok', 'upload');
      } catch (err) {
        toast(err.message || 'File non valido', 'bad', 'error');
      }
    }
  });
  main.addEventListener('input', (e) => {
    const k = e.target.dataset.o;
    if (k) {
      e.target.nextElementSibling.textContent = `${Math.round(e.target.value * 100)}%`;
      setOpts({ [k]: Number(e.target.value) });
    }
    if (e.target.dataset.accent !== undefined) setOpts({ accent: e.target.value });
  });
  main.addEventListener('change', (e) => {
    const k = e.target.dataset.ob;
    if (k) setOpts({ [k]: e.target.checked });
  });

  draw();
  return {
    onState(s, prev) {
      // Mentre si trascina un cursore il pannello non si ridisegna (lo farebbe "saltare").
      const busy = main.contains(document.activeElement) && /range|color/.test(document.activeElement.type);
      if (busy) return;
      if (s.style !== prev.style || s.utility !== prev.utility || s.mode !== prev.mode || s.presets !== prev.presets || s.opts !== prev.opts) draw();
    },
  };
}
