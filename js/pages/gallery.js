// Galleria: tutti i componenti accesi, filtri, preferiti, codice e vista ingrandita.
import { getState, toggleFavorite } from '../store.js';
import { UTIL } from '../live.js';
import { COMPONENTS, CATEGORIES, demoHTML, codeOf, findComponent } from '../catalog.js';
import { esc, ms } from '../components/base.js';
import { download, copy, toast } from '../ui.js';

let filter = 'all';
let query = '';
let favOnly = false;

export function render(main, { q }) {
  const openCode = new Set();
  const catName = (id) => CATEGORIES.find((c) => c[0] === id)?.[1] || id;

  const visible = () => {
    const s = getState(), t = query.trim().toLowerCase();
    return COMPONENTS.filter((c) => (filter === 'all' || c.cat === filter) && (!favOnly || s.favorites.includes(c.id)) && (!t || `${c.name} ${c.wow} ${c.id}`.toLowerCase().includes(t)));
  };

  const tile = (c) => {
    const fav = getState().favorites.includes(c.id);
    return `<article class="tile fx-card tile--${c.size}" id="c-${c.id}" aria-labelledby="t-${c.id}">
      <header class="tile__head">
        <div class="tile__title"><h2 id="t-${c.id}">${esc(c.name)}</h2><span class="tile__cat">${esc(catName(c.cat))}</span>${c.only ? `<span class="fx-chip">${ms(UTIL[c.only].icon)}Solo ${UTIL[c.only].name}</span>` : ''}</div>
        <div class="tile__acts">
          <button class="icon-btn ${fav ? 'is-on' : ''}" data-fav="${c.id}" aria-pressed="${fav}" aria-label="${fav ? 'Togli dai preferiti' : 'Aggiungi ai preferiti'}">${ms(fav ? 'star' : 'star_outline', fav ? 'ms-fill' : '')}</button>
          <button class="icon-btn" data-code="${c.id}" aria-expanded="${openCode.has(c.id)}" aria-label="Mostra il codice">${ms('code')}</button>
          <a class="icon-btn" href="#/confronta?c=${c.id}" aria-label="Confronta in più temi">${ms('compare')}</a>
          <button class="icon-btn" data-expand="${c.id}" aria-label="Ingrandisci">${ms('open_in_full')}</button>
        </div>
      </header>
      <div class="tile__stage">${demoHTML(c)}</div>
      <p class="tile__wow">${esc(c.wow)}</p>
      ${openCode.has(c.id) ? `<div class="code"><button class="code__copy" data-copy="${c.id}">${ms('content_copy')}Copia</button><pre><code>${esc(codeOf(c))}</code></pre></div>` : ''}
    </article>`;
  };

  function draw() {
    const s = getState(), list = visible();
    main.innerHTML = `<div class="page">
      <header class="page-head">
        <span class="eyebrow">${ms('grid_view')}Galleria live · ${UTIL[s.utility].name}</span>
        <h1>Tutti i componenti, accesi.</h1>
        <p>${COMPONENTS.length} componenti fatti a mano con SVG, CSS e un po' di JavaScript, senza librerie UI. Cambia settore dalla barra in alto: dati, unità e colori si adattano subito.</p>
      </header>
      <div class="toolbar fx-card">
        <div class="chips" role="tablist" aria-label="Categorie">
          <button class="chip" role="tab" aria-selected="${filter === 'all'}" data-filter="all">Tutti <small>${COMPONENTS.length}</small></button>
          ${CATEGORIES.map(([id, name, ic]) => `<button class="chip" role="tab" aria-selected="${filter === id}" data-filter="${id}">${ms(ic)}${name} <small>${COMPONENTS.filter((c) => c.cat === id).length}</small></button>`).join('')}
        </div>
        <label class="fx-field fx-field--search toolbar__search">${ms('search')}<input class="fx-input" id="g-search" placeholder="Cerca un componente" value="${esc(query)}" aria-label="Cerca un componente"></label>
        <button class="chip chip--fav" data-favonly aria-pressed="${favOnly}">${ms('star', favOnly ? 'ms-fill' : '')}Preferiti <small>${s.favorites.length}</small></button>
      </div>
      ${favOnly && s.favorites.length ? `<div class="fav-bar fx-card">${ms('star', 'ms-fill')}<span><b>${s.favorites.length} preferiti</b> · scarica la lista da mandare al team</span><button class="fx-btn fx-btn--ghost fx-btn--sm" data-export="md">${ms('description')}Markdown</button><button class="fx-btn fx-btn--ghost fx-btn--sm" data-export="json">${ms('data_object')}JSON</button></div>` : ''}
      <div class="bento" id="bento">${list.map(tile).join('') || `<div class="empty fx-card">${ms('search_off')}<h3>Nessun componente</h3><p>${favOnly ? 'Non hai ancora preferiti: premi la stella su un componente.' : 'Prova a cambiare categoria o ricerca.'}</p></div>`}</div>
    </div>`;
  }

  function redrawTile(id) {
    const c = findComponent(id), el = main.querySelector(`#c-${CSS.escape(id)}`);
    if (c && el) el.outerHTML = tile(c);
  }

  function expand(c) {
    const d = document.createElement('dialog');
    d.className = 'modal modal--wide';
    d.innerHTML = `<div class="modal__box fx-card expand">
      <header class="expand__head"><div><span class="eyebrow">${esc(catName(c.cat))}</span><h2>${esc(c.name)}</h2></div><button class="icon-btn" data-close aria-label="Chiudi">${ms('close')}</button></header>
      <div class="expand__body"><div class="expand__stage">${demoHTML(c)}</div>
        <aside class="expand__info"><p>${esc(c.wow)}</p>
          ${c.attrs?.length ? `<h3>Attributi</h3><dl>${c.attrs.map(([a, t]) => `<dt><code>${a}</code></dt><dd>${esc(t)}</dd>`).join('')}<dt><code>utility</code></dt><dd>water · gas · power (altrimenti segue la pagina)</dd></dl>` : ''}
          <h3>Codice</h3><div class="code"><button class="code__copy" data-copy="${c.id}">${ms('content_copy')}Copia</button><pre><code>${esc(codeOf(c))}</code></pre></div></aside></div>
    </div>`;
    document.body.appendChild(d);
    d.addEventListener('click', (e) => {
      if (e.target === d || e.target.closest('[data-close]')) d.close();
      if (e.target.closest('[data-copy]')) copy(codeOf(c));
    });
    d.addEventListener('close', () => d.remove());
    d.showModal();
  }

  main.addEventListener('click', (e) => {
    const t = e.target.closest('[data-filter],[data-favonly],[data-fav],[data-code],[data-expand],[data-copy],[data-export]');
    if (!t) return;
    const d = t.dataset;
    if (d.filter) { filter = d.filter; draw(); }
    if (d.favonly !== undefined) { favOnly = !favOnly; draw(); }
    if (d.fav) {
      toggleFavorite(d.fav);
      if (favOnly) draw(); else redrawTile(d.fav);
    }
    if (d.code) { openCode.has(d.code) ? openCode.delete(d.code) : openCode.add(d.code); redrawTile(d.code); }
    if (d.expand) expand(findComponent(d.expand));
    if (d.copy) copy(codeOf(findComponent(d.copy)));
    if (d.export) {
      const favs = getState().favorites.map(findComponent).filter(Boolean);
      const day = new Date().toISOString().slice(0, 10);
      if (d.export === 'json') download(`preferiti-flux-${day}.json`, JSON.stringify({ format: 'regenesy-flux-favorites', date: new Date().toISOString(), components: favs.map((c) => ({ id: c.id, name: c.name, category: c.cat })) }, null, 2));
      else download(`preferiti-flux-${day}.md`, `# Preferiti Regenesy Flux\n\n${favs.map((c) => `- **${c.name}** (\`${c.id}\`) — ${c.wow}`).join('\n')}\n`, 'text/markdown');
      toast('Lista dei preferiti scaricata', 'ok', 'download');
    }
  });
  main.addEventListener('input', (e) => {
    if (e.target.id !== 'g-search') return;
    query = e.target.value;
    const bento = main.querySelector('#bento');
    const list = visible();
    bento.innerHTML = list.map(tile).join('') || `<div class="empty fx-card">${ms('search_off')}<h3>Nessun componente</h3><p>Prova un'altra parola.</p></div>`;
  });

  draw();
  const focus = q.get('c');
  if (focus) {
    filter = 'all';
    favOnly = false;
    draw();
    requestAnimationFrame(() => {
      const el = main.querySelector(`#c-${CSS.escape(focus)}`);
      el?.scrollIntoView({ block: 'center', behavior: 'smooth' });
      el?.classList.add('is-spot');
    });
  }
  return {
    onState(s, prev) {
      if (s.favorites !== prev.favorites || s.utility !== prev.utility) {
        const head = main.querySelector('.page-head .eyebrow');
        if (head) head.innerHTML = `${ms('grid_view')}Galleria live · ${UTIL[s.utility].name}`;
        const fc = main.querySelector('[data-favonly] small');
        if (fc) fc.textContent = s.favorites.length;
      }
    },
  };
}
