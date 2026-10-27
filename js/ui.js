// Aiuti del sito: notifiche, dialog, salvataggio combinazioni, ricerca ⌘K, file.
import { getState, setState, comboOf } from './store.js';
import { STYLES } from './theme.js';
import { UTIL } from './live.js';
import { esc, ms } from './components/base.js';

export function toast(text, kind = 'ok', icon = 'check_circle') {
  const host = document.getElementById('toasts');
  const el = document.createElement('div');
  el.className = `fx-toast fx-toast--${kind === 'info' ? 'ok' : kind} toast-in`;
  el.innerHTML = `<span class="fx-toast__ic">${ms(icon)}</span><div><b>${esc(text)}</b></div>`;
  host.appendChild(el);
  setTimeout(() => el.classList.add('toast-out'), 3200);
  setTimeout(() => el.remove(), 3700);
}

export function dialog({ title, text = '', ok = 'Conferma', input = null, danger = false }) {
  return new Promise((resolve) => {
    const d = document.createElement('dialog');
    d.className = 'modal';
    d.innerHTML = `<form method="dialog" class="modal__box fx-card">
      <h2>${esc(title)}</h2>${text ? `<p>${esc(text)}</p>` : ''}
      ${input ? `<label class="fx-field"><input class="fx-input" name="v" placeholder=" " value="${esc(input.value || '')}" required><span>${esc(input.label)}</span></label>` : ''}
      <div class="modal__acts"><button class="fx-btn fx-btn--ghost" value="no" formnovalidate>Annulla</button><button class="fx-btn ${danger ? 'fx-btn--danger' : 'fx-btn--primary'}" value="ok">${esc(ok)}</button></div>
    </form>`;
    document.body.appendChild(d);
    d.addEventListener('close', () => {
      const v = d.returnValue === 'ok' ? (input ? d.querySelector('[name=v]').value.trim() : true) : input ? null : false;
      d.remove();
      resolve(v);
    });
    d.showModal();
    d.querySelector(input ? 'input' : '[value=ok]').focus();
  });
}

export async function savePreset() {
  const s = getState();
  const c = comboOf(s);
  const name = await dialog({ title: 'Salva questa combinazione', text: `${STYLES[c.style].name} · ${UTIL[c.utility].name} · ${c.mode === 'dark' ? 'Scuro' : c.mode === 'auto' ? 'Auto' : 'Chiaro'}`, input: { label: 'Nome', value: `${STYLES[c.style].name} ${UTIL[c.utility].name}` }, ok: 'Salva' });
  if (!name) return null;
  const p = { id: 'p' + Math.random().toString(36).slice(2, 8), name, ...c, createdAt: new Date().toISOString() };
  setState((st) => ({ presets: [p, ...st.presets] }));
  toast(`Combinazione "${name}" salvata`, 'ok', 'bookmark_added');
  return p;
}

export function download(name, text, type = 'application/json') {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([text], { type: `${type};charset=utf-8` }));
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

export function pickFile() {
  return new Promise((resolve) => {
    const i = document.createElement('input');
    i.type = 'file';
    i.accept = 'application/json';
    i.onchange = async () => resolve(i.files[0] ? await i.files[0].text() : null);
    i.click();
  });
}

export async function copy(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const t = document.createElement('textarea');
    t.value = text;
    document.body.appendChild(t);
    t.select();
    document.execCommand('copy');
    t.remove();
  }
  toast('Copiato negli appunti', 'ok', 'content_copy');
}

// Ricerca globale ⌘K: pagine, componenti, settori e stili.
export function openPalette(components) {
  if (document.querySelector('.palette-modal')) return;
  const items = [
    { t: 'Home', s: 'Pagina iniziale', ic: 'home', go: '#/' },
    { t: 'Tutti i componenti', s: 'Galleria live', ic: 'grid_view', go: '#/componenti' },
    { t: 'Confronta temi', s: 'Più stili e settori affiancati', ic: 'compare', go: '#/confronta' },
    { t: 'Studio temi', s: 'Crea e salva combinazioni', ic: 'palette', go: '#/studio' },
    { t: 'POC Acqua · AquaSense', s: 'Prodotto dimostrativo', ic: 'water_drop', go: '#/poc/acqua' },
    { t: 'POC Gas · GasLink', s: 'Prodotto dimostrativo', ic: 'local_fire_department', go: '#/poc/gas' },
    { t: 'POC Elettrico · VoltGrid', s: 'Prodotto dimostrativo', ic: 'bolt', go: '#/poc/elettrico' },
    ...components.map((c) => ({ t: c.name, s: 'Componente · ' + c.id, ic: 'widgets', go: `#/componenti?c=${c.id}` })),
    ...Object.entries(STYLES).map(([id, st]) => ({ t: `Stile ${st.name}`, s: st.tagline, ic: 'format_paint', act: () => setState({ style: id }) })),
  ];
  const d = document.createElement('dialog');
  d.className = 'modal palette-modal';
  d.innerHTML = `<div class="cmd palette-box"><label class="cmd__search">${ms('search')}<input placeholder="Cerca pagine, componenti, stili…" aria-label="Cerca"><kbd>esc</kbd></label><ul class="cmd__list" role="listbox"></ul></div>`;
  document.body.appendChild(d);
  let sel = 0, list = items;
  const draw = (q = '') => {
    const s = q.toLowerCase();
    list = items.filter((x) => !s || `${x.t} ${x.s}`.toLowerCase().includes(s)).slice(0, 8);
    sel = Math.min(sel, Math.max(0, list.length - 1));
    d.querySelector('ul').innerHTML = list.map((x, k) => `<li role="option" data-i="${k}" aria-selected="${k === sel}"><span class="cmd__ic">${ms(x.ic)}</span><span class="cmd__t"><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span></li>`).join('') || '<li class="cmd__empty">Nessun risultato</li>';
  };
  const run = (k) => {
    const x = list[k];
    if (!x) return;
    d.close();
    if (x.go) location.hash = x.go;
    x.act?.();
  };
  const input = d.querySelector('input');
  input.addEventListener('input', () => { sel = 0; draw(input.value); });
  input.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowDown') sel = (sel + 1) % list.length;
    else if (e.key === 'ArrowUp') sel = (sel - 1 + list.length) % list.length;
    else if (e.key === 'Enter') return run(sel);
    else return;
    e.preventDefault();
    draw(input.value);
  });
  d.addEventListener('click', (e) => {
    const li = e.target.closest('li[data-i]');
    if (li) run(+li.dataset.i);
    else if (e.target === d) d.close();
  });
  d.addEventListener('close', () => d.remove());
  draw();
  d.showModal();
  input.focus();
}
