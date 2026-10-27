// Motore dei dati simulati: i tre settori, il battito ("tick") e gli eventi.
// Ogni componente si iscrive al tick e agli eventi; nessun dato esce dal browser.

// Andamento tipico nelle 24 ore (0 = minimo, 1 = picco)
const P = {
  water: [.25, .2, .18, .17, .2, .35, .7, .95, .85, .65, .58, .6, .72, .68, .55, .5, .55, .7, .9, 1, .85, .65, .45, .32],
  gas: [.45, .4, .38, .38, .45, .7, .95, 1, .8, .6, .5, .45, .48, .45, .42, .45, .55, .75, .9, .95, .85, .7, .58, .5],
  power: [.38, .32, .3, .29, .3, .36, .52, .72, .8, .78, .76, .8, .84, .8, .76, .74, .78, .88, .98, 1, .92, .78, .6, .46],
  solar: [0, 0, 0, 0, 0, 0, .03, .14, .34, .56, .76, .9, .98, 1, .93, .78, .58, .34, .12, .02, 0, 0, 0, 0],
};

export const UTIL = {
  water: {
    id: 'water', name: 'Acqua', icon: 'water_drop', product: 'AquaSense', word: 'idrica', profile: P.water,
    rate: { label: 'Portata in rete', unit: 'L/s', base: 420, min: 180, max: 720, dec: 0 },
    pressure: { label: 'Pressione', unit: 'bar', min: 0, max: 8, value: 4.3, dec: 1, zones: [[0, 2, 'bad'], [2, 3, 'warn'], [3, 6, 'ok'], [6, 7, 'warn'], [7, 8, 'bad']] },
    level: { label: 'Serbatoio Monte Alto', unit: '%', value: 72, capacity: '12.000 m³' },
    total: { label: 'Volume erogato', unit: 'm³', start: 1284637.255, perSec: 0.42, dec: 3 },
    loss: { label: 'Perdite di rete', unit: '%', value: 24, goal: 18 },
    quality: { label: 'Cloro residuo', unit: 'mg/L', value: 0.22, min: 0.1, max: 0.4, dec: 2 },
    share: { label: 'Acqua contabilizzata', value: 76 },
    districts: ['Nord', 'Sud', 'Est', 'Ovest', 'Centro', 'Porto'],
    meter: { id: 'WM-23A0417', model: 'Atlantica UW-15 · DN15', where: 'Via Roma 14, Bari' },
    rings: [['Consumo vs obiettivo', 82], ['Letture riuscite', 98], ['Rete senza perdite', 76]],
    net: {
      nodes: [['Sorgente', 'landscape', 70, 160], ['Potabilizzatore', 'science', 220, 80], ['Serbatoio', 'propane_tank', 220, 240], ['Distretto Nord', 'apartment', 460, 60], ['Distretto Sud', 'apartment', 460, 160], ['Ospedale', 'local_hospital', 460, 260]],
      edges: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5]],
    },
    sankey: { src: [['Immesso in rete', 100]], dst: [['Fatturato', 72], ['Usi autorizzati', 4], ['Perdite reali', 18], ['Perdite apparenti', 6]], bad: [2, 3] },
    events: [
      { kind: 'bad', icon: 'water_drop', title: 'Perdita rilevata', text: 'Distretto Ovest · 38 L/h di notte', node: 4 },
      { kind: 'warn', icon: 'compress', title: 'Pressione alta', text: 'Distretto Nord · 6,8 bar', node: 3 },
      { kind: 'bad', icon: 'shield', title: 'Manomissione', text: 'Contatore WM-23A0988 · Lecce', node: 5 },
      { kind: 'info', icon: 'science', title: 'Cloro sotto soglia', text: 'Potabilizzatore · 0,12 mg/L', node: 1 },
    ],
  },
  gas: {
    id: 'gas', name: 'Gas', icon: 'local_fire_department', product: 'GasLink', word: 'gas', profile: P.gas,
    rate: { label: 'Portata distribuita', unit: 'Sm³/h', base: 1850, min: 700, max: 3200, dec: 0 },
    pressure: { label: 'Pressione di rete', unit: 'mbar', min: 0, max: 40, value: 23, dec: 1, zones: [[0, 17, 'bad'], [17, 20, 'warn'], [20, 28, 'ok'], [28, 32, 'warn'], [32, 40, 'bad']] },
    level: { label: 'Stoccaggio locale', unit: '%', value: 64, capacity: '40.000 Sm³' },
    total: { label: 'Gas distribuito', unit: 'Sm³', start: 8427113.42, perSec: 0.51, dec: 2 },
    loss: { label: 'Gas non contabilizzato', unit: '%', value: 1.8, goal: 1.2 },
    quality: { label: 'Odorizzante (THT)', unit: 'mg/Sm³', value: 32, min: 25, max: 40, dec: 0 },
    share: { label: 'Rete ispezionata quest\'anno', value: 61 },
    districts: ['REMI Nord', 'REMI Sud', 'Zona industriale', 'Centro storico', 'Lungomare', 'Collina'],
    meter: { id: 'GM-G4-77120', model: 'Smart meter G4 · NB-IoT', where: 'Corso Italia 3, Lecce' },
    rings: [['Consumo vs obiettivo', 74], ['Letture riuscite', 99], ['Rete ispezionata', 61]],
    net: {
      nodes: [['Metanodotto', 'conversion_path', 70, 160], ['Cabina REMI', 'factory', 220, 80], ['Stoccaggio', 'gas_meter', 220, 240], ['Utenze civili', 'home', 460, 60], ['Industria', 'precision_manufacturing', 460, 160], ['Ospedale', 'local_hospital', 460, 260]],
      edges: [[0, 1], [0, 2], [1, 3], [1, 4], [2, 4], [2, 5]],
    },
    sankey: { src: [['Immesso da REMI', 100]], dst: [['Domestico', 46], ['Industriale', 38], ['Terziario', 14], ['Non contabilizzato', 2]], bad: [3] },
    events: [
      { kind: 'bad', icon: 'gas_meter', title: 'Fuga di metano', text: 'Via Garibaldi · 1.200 ppm', node: 3 },
      { kind: 'warn', icon: 'compress', title: 'Pressione bassa', text: 'Cabina REMI Sud · 17,4 mbar', node: 1 },
      { kind: 'info', icon: 'air', title: 'Odorizzante basso', text: 'THT 24 mg/Sm³ · rabbocco', node: 1 },
      { kind: 'bad', icon: 'valve', title: 'Valvola chiusa a distanza', text: 'Contatore GM-G4-77120', node: 5 },
    ],
  },
  power: {
    id: 'power', name: 'Elettrico', icon: 'bolt', product: 'VoltGrid', word: 'elettrica', profile: P.power,
    rate: { label: 'Carico di rete', unit: 'MW', base: 42, min: 14, max: 68, dec: 1 },
    pressure: { label: 'Tensione', unit: 'V', min: 200, max: 260, value: 231, dec: 0, zones: [[200, 207, 'bad'], [207, 216, 'warn'], [216, 244, 'ok'], [244, 253, 'warn'], [253, 260, 'bad']] },
    level: { label: 'Batteria di quartiere', unit: '%', value: 58, capacity: '2,4 MWh' },
    total: { label: 'Energia distribuita', unit: 'kWh', start: 52119874.6, perSec: 11.7, dec: 1 },
    loss: { label: 'Perdite tecniche', unit: '%', value: 6.2, goal: 5 },
    quality: { label: 'Frequenza', unit: 'Hz', value: 50, min: 49.8, max: 50.2, dec: 2 },
    share: { label: 'Quota rinnovabile', value: 47 },
    districts: ['Cabina Nord', 'Cabina Sud', 'Porto', 'Fiera', 'Università', 'Stazione'],
    meter: { id: 'EM-2G-334912', model: 'Contatore 2G trifase', where: 'Via Mazzini 8, Brindisi' },
    rings: [['Autoconsumo', 68], ['Letture riuscite', 99], ['Quota rinnovabile', 47]],
    net: {
      nodes: [['Rete AT', 'electric_bolt', 70, 160], ['Cabina primaria', 'electrical_services', 220, 80], ['Fotovoltaico', 'solar_power', 220, 240], ['Quartiere', 'home', 460, 60], ['Batteria', 'battery_charging_full', 460, 160], ['Ricarica EV', 'ev_station', 460, 260]],
      edges: [[0, 1], [2, 1], [1, 3], [1, 4], [2, 4], [1, 5]],
    },
    sankey: { src: [['Rete', 52], ['Fotovoltaico', 38], ['Batteria', 10]], dst: [['Abitazioni', 48], ['Ricarica EV', 18], ['Accumulo', 22], ['Perdite', 6], ['Immissione', 6]], bad: [3] },
    events: [
      { kind: 'warn', icon: 'trending_up', title: 'Picco di potenza', text: 'Cabina Porto · 96% del limite', node: 1 },
      { kind: 'bad', icon: 'flash_off', title: 'Buco di tensione', text: 'Linea MT 12 · 180 ms', node: 3 },
      { kind: 'info', icon: 'solar_power', title: 'Fotovoltaico al massimo', text: 'Produzione 14,2 MW', node: 2 },
      { kind: 'bad', icon: 'power_off', title: 'Interruzione', text: 'Via Mazzini · 42 utenze', node: 5 },
    ],
  },
};
export const UTIL_IDS = ['water', 'gas', 'power'];
export const SLUG = { water: 'acqua', gas: 'gas', power: 'elettrico' };
export const FROM_SLUG = { acqua: 'water', gas: 'gas', elettrico: 'power' };
export const SOLAR = P.solar;

// ---- Battito ----
const ticks = new Set();
const events = new Set();
export const live = { tick: 0, speed: 1, playing: true };
let timer;
function start() {
  clearInterval(timer);
  timer = setInterval(() => {
    if (!live.playing || document.hidden) return;
    live.tick++;
    ticks.forEach((fn) => fn(live.tick));
    // ogni tanto un evento spontaneo
    if (Math.random() < 0.035) fireEvent(UTIL_IDS[Math.floor(Math.random() * 3)]);
  }, 1000 / live.speed);
}
start();
export const onTick = (fn) => (ticks.add(fn), () => ticks.delete(fn));
export const onEvent = (fn) => (events.add(fn), () => events.delete(fn));
export function setLive({ speed, playing }) {
  if (speed) live.speed = speed;
  if (playing !== undefined) live.playing = playing;
  start();
}
export function fireEvent(utility, index) {
  const list = UTIL[utility].events;
  const e = { ...list[index ?? Math.floor(Math.random() * list.length)], utility, at: new Date(), id: Math.random().toString(36).slice(2) };
  events.forEach((fn) => fn(e));
  return e;
}

// ---- Aiuti numerici ----
export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const rand = (a, b) => a + Math.random() * (b - a);
export const fmt = (v, dec = 0) => Number(v).toLocaleString('it-IT', { minimumFractionDigits: dec, maximumFractionDigits: dec });
export const hourNow = () => { const d = new Date(); return d.getHours() + d.getMinutes() / 60; };
export const profileAt = (u, h) => {
  const p = u.profile, i = Math.floor(h) % 24, f = h - Math.floor(h);
  return p[i] * (1 - f) + p[(i + 1) % 24] * f;
};
// Valore "realistico" di portata all'ora h, con un po' di rumore.
export const rateAt = (u, h, noise = 0.04) => {
  const r = u.rate;
  return clamp(r.min + (r.max - r.min) * profileAt(u, h) * rand(1 - noise, 1 + noise), r.min, r.max);
};
// Passeggiata casuale che resta tra min e max e torna verso il centro.
export function walker(value, min, max, vol = 0.02) {
  let v = value;
  const mid = (min + max) / 2;
  return {
    get value() { return v; },
    next() {
      v += (Math.random() - 0.5) * (max - min) * vol + (mid - v) * 0.02;
      v = clamp(v, min, max);
      return v;
    },
    kick(amount) { v = clamp(v + amount, min, max); return v; },
  };
}
