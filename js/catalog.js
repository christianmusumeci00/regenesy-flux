// Catalogo dei componenti: nome, categoria, misura nella galleria, perché è speciale, come si usa.
import './components/numbers.js';
import './components/gauges.js';
import './components/charts.js';
import './components/twin.js';
import './components/experience.js';

export const CATEGORIES = [
  ['numeriche', 'Numeriche', 'pin'],
  ['indicatori', 'Indicatori', 'speed'],
  ['grafici', 'Grafici', 'monitoring'],
  ['twin', 'Digital twin', 'hub'],
  ['esperienze', 'Esperienze', 'auto_awesome'],
  ['base', 'UI di base', 'widgets'],
];

const el = (tag, attrs = '') => `<${tag} ${attrs}></${tag}>`;

export const COMPONENTS = [
  { id: 'rg-odometer', name: 'Totalizzatore meccanico', cat: 'numeriche', size: 'm', wow: 'Tamburi che rotolano come in un contatore vero: le cifre decimali in rosso scorrono di continuo, quelle intere scattano al riporto.', attrs: [['label', 'Etichetta sopra il numero'], ['value', 'Valore di partenza'], ['rate', 'Unità al secondo'], ['decimals', 'Cifre decimali (rosse)']] },
  { id: 'rg-live-number', name: 'Numero vivo', cat: 'numeriche', size: 's', wow: 'Il numero conta fino al dato nuovo, si illumina quando cambia, mostra variazione, minimo, massimo e la scia degli ultimi valori.', attrs: [['metric', 'rate · pressure · level · loss · quality'], ['label', 'Etichetta']], demo: (u) => el('rg-live-number', 'metric="rate"') },
  { id: 'rg-dial-meter', name: 'Quadrante del contatore', cat: 'numeriche', size: 's', wow: 'Il gemello digitale del contatore fisico: rulli, lancette rosse e stella per l\'acqua, quadrante di prova per il gas, disco Ferraris e LED per l\'elettrico.', attrs: [['value', 'Lettura iniziale']] },
  { id: 'rg-arc-gauge', name: 'Arco con lancetta a molla', cat: 'indicatori', size: 's', wow: 'La lancetta ha una molla: supera il valore e torna indietro. Le zone colorate dicono subito se la pressione è nella norma.', attrs: [['metric', 'pressure · rate · level · quality'], ['label', 'Etichetta']] },
  { id: 'rg-rings', name: 'Anelli degli obiettivi', cat: 'indicatori', size: 's', wow: 'Tre obiettivi concentrici, come gli anelli attività di Apple Watch: si capisce a colpo d\'occhio cosa manca.', attrs: [] },
  { id: 'rg-tank', name: 'Serbatoio vivo', cat: 'indicatori', size: 's', wow: 'Cambia natura col settore: onde e bolle per l\'acqua, nebbia che si muove per il gas, celle che si caricano per la batteria.', attrs: [['label', 'Nome del serbatoio']] },
  { id: 'rg-waffle', name: 'Matrice a punti', cat: 'indicatori', size: 's', wow: 'Cento punti, uno per ogni percento. Più concreto di una torta: si contano.', attrs: [['label', 'Etichetta']] },
  { id: 'rg-stream', name: 'Flusso in tempo reale', cat: 'grafici', size: 'l', wow: 'Il grafico scorre davvero: ogni secondo entra un punto a destra, con scia luminosa e punto pulsante.', attrs: [['metric', 'rate · pressure · level · quality'], ['label', 'Etichetta']] },
  { id: 'rg-clock', name: 'Orologio dei consumi', cat: 'grafici', size: 'm', wow: 'Le 24 ore in cerchio, con la lancetta sull\'ora attuale: il picco serale salta all\'occhio.', attrs: [] },
  { id: 'rg-heatmap', name: 'Mappa di calore settimanale', cat: 'grafici', size: 'm', wow: 'Sette giorni per ventiquattro ore in una griglia: si vedono le abitudini. La cella di adesso pulsa.', attrs: [] },
  { id: 'rg-sankey', name: 'Bilancio a flussi', cat: 'grafici', size: 'l', wow: 'Da dove arriva e dove finisce ogni unità, con il flusso che scorre nei nastri. Le perdite in rosso.', attrs: [] },
  { id: 'rg-race', name: 'Classifica in corsa', cat: 'grafici', size: 'm', wow: 'Le zone si superano in tempo reale: le righe scivolano al loro nuovo posto.', attrs: [] },
  { id: 'rg-forecast', name: 'Previsione con incertezza', cat: 'grafici', size: 'm', wow: 'Passato misurato, futuro previsto e una banda che si allarga man mano che la previsione si allontana.', attrs: [['series', 'solar = produzione fotovoltaica (solo elettrico)']] },
  { id: 'rg-network', name: 'Rete viva', cat: 'twin', size: 'l', wow: 'Lo schema della rete con il flusso che scorre nelle condotte: la velocità segue la portata, il nodo in allarme pulsa.', attrs: [] },
  { id: 'rg-iso-map', name: 'Mappa isometrica 3D', cat: 'twin', size: 'm', wow: 'Ogni zona è un blocco 3D alto quanto consuma. I blocchi crescono e calano dal vivo; un segnaposto indica l\'allarme.', attrs: [] },
  { id: 'rg-radar', name: 'Radar delle anomalie', cat: 'twin', size: 'm', wow: 'Il fascio gira e accende le anomalie quando le incontra. Ogni evento nuovo compare come un punto che pulsa.', attrs: [] },
  { id: 'rg-pulse', name: 'Battito della rete', cat: 'twin', size: 'm', wow: 'Un monitor tipo elettrocardiogramma per i transitori di pressione o i disturbi di tensione. All\'allarme diventa rosso.', attrs: [['label', 'Etichetta']] },
  { id: 'rg-island', name: 'Dynamic Island', cat: 'esperienze', size: 'm', wow: 'Come su iPhone: una pillola nera con il dato live che si espande con una molla quando succede qualcosa.', attrs: [['demo', 'Mostra il pulsante per simulare un evento']], demo: () => el('rg-island', 'demo') },
  { id: 'rg-holo-card', name: 'Carta olografica del contatore', cat: 'esperienze', size: 'm', wow: 'Il "passaporto" digitale del contatore: si inclina seguendo il mouse con riflessi iridescenti.', attrs: [] },
  { id: 'rg-scrubber', name: 'Macchina del tempo', cat: 'esperienze', size: 'l', wow: 'Trascina il cursore e rivivi la giornata: valore, ora e grafico si muovono insieme. Premi play per l\'animazione.', attrs: [] },
  { id: 'rg-controls', name: 'Controlli fluidi', cat: 'esperienze', size: 'm', wow: 'Selettore con il vetro che scivola, interruttori a molla, cursore liquido, contatore che rimbalza.', attrs: [] },
  { id: 'rg-command', name: 'Command palette', cat: 'esperienze', size: 'm', wow: 'Cerca contatori, zone e azioni da tastiera, come Spotlight. Funziona con frecce e Invio.', attrs: [] },
  { id: 'rg-phasor', name: 'Fasori trifase', cat: 'grafici', size: 'm', only: 'power', wow: 'Tensioni e correnti delle tre fasi che ruotano, con fattore di potenza e squilibrio. Specifico per l\'elettrico.', attrs: [] },
  {
    id: 'ui-buttons', name: 'Pulsanti', cat: 'base', size: 'm', static: true, wow: 'Principale con gradiente del settore, vetro, tinta, pericolo, icona, caricamento. Il pulsante "magnetico" segue il mouse.',
    demo: () => `<div class="demo-col"><div class="demo-row"><button class="fx-btn fx-btn--primary fx-btn--magnetic"><span class="ms">add</span>Nuovo intervento</button><button class="fx-btn fx-btn--ghost"><span class="ms">download</span>Esporta</button><button class="fx-btn fx-btn--tint">Assegna</button></div>
      <div class="demo-row"><button class="fx-btn fx-btn--danger"><span class="ms">power_settings_new</span>Chiudi valvola</button><button class="fx-btn fx-btn--ghost fx-btn--icon" aria-label="Aggiorna"><span class="ms">refresh</span></button><button class="fx-btn fx-btn--primary is-loading" disabled><span class="ms">progress_activity</span>Sincronizzo…</button><button class="fx-btn fx-btn--ghost fx-btn--sm">Piccolo</button></div></div>`,
    code: `<button class="fx-btn fx-btn--primary"><span class="ms">add</span>Nuovo intervento</button>\n<button class="fx-btn fx-btn--ghost">Esporta</button>\n<button class="fx-btn fx-btn--tint">Assegna</button>\n<button class="fx-btn fx-btn--danger">Chiudi valvola</button>`,
  },
  {
    id: 'ui-fields', name: 'Campi e ricerca', cat: 'base', size: 'm', static: true, wow: 'Etichette che salgono quando scrivi, ricerca con scorciatoia ⌘K, bordo che si illumina col colore del settore.',
    demo: () => `<div class="demo-col"><label class="fx-field fx-field--search"><span class="ms">search</span><input class="fx-input" placeholder="Cerca matricola o indirizzo" aria-label="Cerca"><kbd>⌘K</kbd></label>
      <div class="demo-grid2"><label class="fx-field"><input class="fx-input" placeholder=" " value="WM-23A0417"><span>Matricola</span></label><label class="fx-field"><input class="fx-input" placeholder=" "><span>Soglia di allarme</span></label></div></div>`,
    code: `<label class="fx-field">\n  <input class="fx-input" placeholder=" ">\n  <span>Matricola</span>\n</label>`,
  },
  {
    id: 'ui-badges', name: 'Stati e badge', cat: 'base', size: 's', static: true, wow: 'Stato sempre con colore e testo; il punto pulsa quando il dato è in diretta.',
    demo: () => `<div class="demo-row"><span class="fx-badge fx-badge--ok is-live">Attivo</span><span class="fx-badge fx-badge--bad">Perdita</span><span class="fx-badge fx-badge--warn">Batteria bassa</span><span class="fx-badge">In lettura</span><span class="fx-badge fx-badge--bad is-live">Allarme</span><span class="fx-chip"><span class="ms">bolt</span>Live</span></div>`,
    code: `<span class="fx-badge fx-badge--ok is-live">Attivo</span>\n<span class="fx-badge fx-badge--bad">Perdita</span>`,
  },
  {
    id: 'ui-toasts', name: 'Notifiche', cat: 'base', size: 's', static: true, wow: 'Notifiche di vetro con icona colorata, impilate come su macOS.',
    demo: () => `<div class="demo-col"><div class="fx-toast fx-toast--ok"><span class="fx-toast__ic"><span class="ms">check_circle</span></span><div><b>Lettura completata</b><small>48.213 contatori in 4 minuti</small></div></div><div class="fx-toast fx-toast--bad"><span class="fx-toast__ic"><span class="ms">warning</span></span><div><b>Perdita rilevata</b><small>Distretto Ovest · adesso</small></div></div></div>`,
    code: `<div class="fx-toast fx-toast--ok">\n  <span class="fx-toast__ic"><span class="ms">check_circle</span></span>\n  <div><b>Lettura completata</b><small>48.213 contatori</small></div>\n</div>`,
  },
];

export const findComponent = (id) => COMPONENTS.find((c) => c.id === id);

export function demoHTML(c) {
  if (c.demo) return c.demo();
  return el(c.id, c.only ? `utility="${c.only}"` : '');
}

export function codeOf(c) {
  if (c.code) return c.code;
  const attrs = c.attrs.length ? ' ' + c.attrs.slice(0, 2).map(([a]) => `${a}="…"`).join(' ') : '';
  return `<!-- HTML puro o qualsiasi framework -->
<script type="module" src="@regenesy/flux/${c.id.replace('rg-', '')}.js"></script>
<${c.id} utility="water"${attrs}></${c.id}>

<!-- Angular 22: nel componente standalone -->
@Component({ schemas: [CUSTOM_ELEMENTS_SCHEMA], template: \`<${c.id} [attr.utility]="settore()"></${c.id}>\` })`;
}
