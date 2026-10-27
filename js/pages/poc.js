// POC: tre prodotti finiti da mostrare — AquaSense (acqua), GasLink (gas), VoltGrid (elettrico).
// Lo stile e la modalità seguono il tema scelto; i colori sono sempre quelli del settore del prodotto.
import { getState, comboOf } from '../store.js';
import { applyTheme, themeAttrs } from '../theme.js';
import { UTIL, UTIL_IDS, SLUG, FROM_SLUG, fireEvent } from '../live.js';
import { esc, ms } from '../components/base.js';

const card = (title, inner, span, extra = '') => `<section class="app-card fx-card span-${span}" ${extra}>${title ? `<header class="app-card__head"><h3>${title}</h3></header>` : ''}${inner}</section>`;
const kpis = (list) => list.map((m) => `<section class="app-card fx-card span-3 app-kpi"><rg-live-number metric="${m}"></rg-live-number></section>`).join('');

const PRODUCTS = {
  water: {
    nav: [['space_dashboard', 'Panoramica'], ['hub', 'Rete'], ['speed', 'Contatori'], ['science', 'Qualità'], ['notifications', 'Allarmi', 3], ['description', 'Report']],
    greet: 'Rete idrica · 5 distretti · 48.213 contatori',
    body: () => `${kpis(['rate', 'pressure', 'loss', 'quality'])}
      ${card('Rete in tempo reale', '<rg-network></rg-network>', 8)}
      ${card('', '<rg-tank></rg-tank>', 4)}
      ${card('Portata · ultimi 40 secondi', '<rg-stream></rg-stream>', 7)}
      ${card('Anomalie intorno a te', '<rg-radar></rg-radar>', 5)}
      ${card('Bilancio idrico di ottobre', '<rg-sankey></rg-sankey>', 7)}
      ${card('Distretti per portata', '<rg-race></rg-race>', 5)}
      ${card('Mappa dei consumi', '<rg-iso-map></rg-iso-map>', 5)}
      ${card('La giornata in un cerchio', '<rg-clock></rg-clock>', 4)}
      ${card('Contatore WM-23A0417', '<rg-dial-meter></rg-dial-meter>', 3)}
      ${card('', '<rg-odometer></rg-odometer>', 6)}
      ${card('Rivivi la giornata', '<rg-scrubber></rg-scrubber>', 6)}`,
  },
  gas: {
    nav: [['space_dashboard', 'Panoramica'], ['factory', 'Cabine REMI'], ['conversion_path', 'Rete'], ['policy', 'Ispezioni'], ['notifications', 'Allarmi', 2], ['description', 'Report']],
    greet: 'Rete gas · 2 cabine REMI · 31.540 punti di riconsegna',
    body: () => `${kpis(['rate', 'pressure', 'quality', 'loss'])}
      ${card('Cabina REMI Nord', '<rg-arc-gauge label="REMI Nord"></rg-arc-gauge>', 4)}
      ${card('Cabina REMI Sud', '<rg-arc-gauge label="REMI Sud"></rg-arc-gauge>', 4)}
      ${card('', '<rg-tank></rg-tank>', 4)}
      ${card('Schema di distribuzione', '<rg-network></rg-network>', 7)}
      ${card('Stabilità della pressione', '<rg-pulse></rg-pulse>', 5)}
      ${card('Domanda prevista · dipende dalla temperatura', '<rg-forecast></rg-forecast>', 7)}
      ${card('Fughe di metano', '<rg-radar></rg-radar>', 5)}
      ${card('Settimana di riscaldamento', '<rg-heatmap></rg-heatmap>', 7)}
      ${card('Contatore GM-G4-77120', '<rg-dial-meter></rg-dial-meter>', 5)}
      ${card('', '<rg-odometer></rg-odometer>', 6)}
      ${card('Zone per portata', '<rg-race></rg-race>', 6)}`,
  },
  power: {
    nav: [['space_dashboard', 'Panoramica'], ['electric_meter', 'Flussi'], ['electrical_services', 'Cabine'], ['solar_power', 'Fotovoltaico'], ['notifications', 'Allarmi', 4], ['description', 'Report']],
    greet: 'Rete di quartiere · 3 cabine · 12,4 MW di fotovoltaico',
    body: () => `${kpis(['rate', 'pressure', 'quality', 'loss'])}
      ${card('Flussi di energia', '<rg-network></rg-network>', 7)}
      ${card('Fasori trifase · Cabina Porto', '<rg-phasor></rg-phasor>', 5)}
      ${card('Carico di rete · in diretta', '<rg-stream></rg-stream>', 8)}
      ${card('', '<rg-tank></rg-tank>', 4)}
      ${card('Fotovoltaico previsto', '<rg-forecast series="solar"></rg-forecast>', 6)}
      ${card('Da dove arriva l\'energia', '<rg-sankey></rg-sankey>', 6)}
      ${card('Obiettivi del mese', '<rg-rings></rg-rings>', 4)}
      ${card('', '<rg-waffle></rg-waffle>', 4)}
      ${card('Contatore EM-2G-334912', '<rg-dial-meter></rg-dial-meter>', 4)}
      ${card('Settimana di consumi', '<rg-heatmap></rg-heatmap>', 7)}
      ${card('Consumo per ora', '<rg-clock></rg-clock>', 5)}`,
  },
};

export function render(main, { parts }) {
  const id = FROM_SLUG[parts[1]] || getState().utility;
  const u = UTIL[id], p = PRODUCTS[id];
  const now = new Date();
  const day = now.toLocaleDateString('it-IT', { weekday: 'long', day: 'numeric', month: 'long' });
  const hello = now.getHours() < 13 ? 'Buongiorno' : now.getHours() < 18 ? 'Buon pomeriggio' : 'Buonasera';

  main.innerHTML = `<div class="page page--wide page--poc">
    <header class="poc-bar">
      <div class="poc-tabs" role="tablist" aria-label="Prodotti">${UTIL_IDS.map((x) => `<a role="tab" href="#/poc/${SLUG[x]}" aria-selected="${x === id}" class="poc-tab poc-tab--${x}">${ms(UTIL[x].icon)}<span><b>${UTIL[x].product}</b><small>${UTIL[x].name}</small></span></a>`).join('')}</div>
      <div class="poc-bar__acts"><button class="fx-btn fx-btn--tint" data-poc="event">${ms('bolt')}Simula un evento</button><button class="fx-btn fx-btn--ghost" data-poc="full">${ms('fullscreen')}Schermo intero</button></div>
    </header>
    <div class="poc-frame fx-scope" id="poc-frame" ${themeAttrs({ ...comboOf(getState()), utility: id })}>
      <aside class="app-side fx-card">
        <div class="app-brand"><img src="assets/pittogramma_colori.svg" alt=""><div><b>${u.product}</b><small>by Regenesy</small></div></div>
        <nav class="app-nav" aria-label="Menu ${esc(u.product)}">${p.nav.map(([ic, label, badge], k) => `<a href="#" ${k === 0 ? 'aria-current="page"' : ''}>${ms(ic)}<span>${label}</span>${badge ? `<i>${badge}</i>` : ''}</a>`).join('')}</nav>
        <div class="app-side__foot"><rg-holo-card></rg-holo-card></div>
      </aside>
      <div class="app-main">
        <header class="app-top">
          <div class="app-hello"><small>${day.charAt(0).toUpperCase() + day.slice(1)}</small><h1>${hello}, Giulia</h1><p>${p.greet}</p></div>
          <div class="app-top__island"><rg-island></rg-island></div>
          <div class="app-top__right"><button class="fx-btn fx-btn--ghost app-search" data-poc="search">${ms('search')}<span>Cerca</span><kbd>⌘K</kbd></button><span class="app-avatar">GM</span></div>
        </header>
        <div class="app-grid">${p.body()}</div>
      </div>
    </div>
  </div>`;

  const frame = main.querySelector('#poc-frame');
  const theme = () => applyTheme({ ...comboOf(getState()), utility: id }, frame);

  main.addEventListener('click', (e) => {
    const a = e.target.closest('[data-poc]')?.dataset.poc;
    if (a === 'event') fireEvent(id);
    if (a === 'full') (document.fullscreenElement ? document.exitFullscreen() : frame.requestFullscreen?.());
    if (a === 'search') document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
    const nav = e.target.closest('.app-nav a');
    if (nav) {
      e.preventDefault();
      frame.querySelectorAll('.app-nav a').forEach((x) => x.removeAttribute('aria-current'));
      nav.setAttribute('aria-current', 'page');
    }
  });

  return {
    onState(s, prev) {
      if (s.style !== prev.style || s.mode !== prev.mode || s.opts !== prev.opts) theme();
    },
  };
}
