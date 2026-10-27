// Home: un palco vivo, i tre settori affiancati, le sezioni e gli stili da provare al volo.
import { getState, setState, comboOf } from '../store.js';
import { STYLES, themeAttrs } from '../theme.js';
import { UTIL, UTIL_IDS, SLUG } from '../live.js';
import { COMPONENTS } from '../catalog.js';
import { ms } from '../components/base.js';

export function render(main) {
  function draw() {
    const s = getState();
    main.innerHTML = `<div class="page page--home">
      <section class="hero">
        <div class="hero__text">
          <span class="eyebrow">${ms('auto_awesome')}Regenesy Flux · design system vivo</span>
          <h1>Componenti che <span class="grad">respirano</span> insieme alla rete.</h1>
          <p>Acqua, gas ed elettrico in un solo linguaggio: numeri che rotolano, condotte in cui scorre il flusso, mappe 3D, radar e allarmi che si espandono. Tutto in tempo reale, tutto con il tema che scegli.</p>
          <div class="hero__cta"><a class="fx-btn fx-btn--primary" href="#/componenti">${ms('grid_view')}Esplora i ${COMPONENTS.length} componenti</a><a class="fx-btn fx-btn--ghost" href="#/poc/${SLUG[s.utility]}">${ms('rocket_launch')}Apri la POC ${UTIL[s.utility].name}</a></div>
        </div>
        <div class="hero__stage">
          <div class="stage__island"><rg-island></rg-island></div>
          <div class="fx-card stage__net"><rg-network></rg-network></div>
          <div class="fx-card stage__odo"><rg-odometer></rg-odometer></div>
          <div class="fx-card stage__gauge"><rg-arc-gauge></rg-arc-gauge></div>
        </div>
      </section>

      <section class="trio" aria-label="I tre settori">
        ${UTIL_IDS.map((id) => `<a class="trio__item" href="#/poc/${SLUG[id]}" ${themeAttrs({ ...comboOf(s), utility: id })}>
          <div class="fx-card trio__card">
            <div class="trio__head"><span class="trio__ic">${ms(UTIL[id].icon)}</span><div><b>${UTIL[id].name}</b><small>${UTIL[id].product}</small></div>${ms('arrow_outward', 'trio__go')}</div>
            <rg-live-number metric="rate"></rg-live-number>
          </div></a>`).join('')}
      </section>

      <section class="sections">
        <a class="fx-card sec" href="#/componenti">${ms('grid_view')}<h3>Galleria live</h3><p>Ogni componente acceso, con codice, preferiti e vista ingrandita.</p></a>
        <a class="fx-card sec" href="#/confronta">${ms('compare')}<h3>Confronta</h3><p>Lo stesso componente in più stili, settori e modalità, affiancati.</p></a>
        <a class="fx-card sec" href="#/studio">${ms('palette')}<h3>Studio temi</h3><p>Combina stile, settore, modalità e regolazioni. Salva ed esporta.</p></a>
        <a class="fx-card sec" href="#/poc/${SLUG[s.utility]}">${ms('rocket_launch')}<h3>POC di prodotto</h3><p>AquaSense, GasLink e VoltGrid: tre prodotti finiti da mostrare.</p></a>
      </section>

      <section class="styles-strip">
        <div><span class="eyebrow">${ms('format_paint')}Prova uno stile</span><h2>Cinque stili, combinabili con ogni settore e modalità.</h2></div>
        <div class="styles-strip__list">${Object.entries(STYLES).map(([id, st]) => `<button class="style-pill ${s.style === id ? 'is-on' : ''}" data-home-style="${id}"><span class="cc-style__sw cc-style--${id}"></span><b>${st.name}</b><small>${st.tagline}</small></button>`).join('')}</div>
      </section>
    </div>`;
  }
  main.addEventListener('click', (e) => {
    const b = e.target.closest('[data-home-style]');
    if (b) setState({ style: b.dataset.homeStyle, opts: { ...getState().opts, glow: null } });
  });
  draw();
  return {
    onState(s, prev) {
      if (s.style !== prev.style || s.mode !== prev.mode || s.opts !== prev.opts || s.utility !== prev.utility) draw();
    },
  };
}
