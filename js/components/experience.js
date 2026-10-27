// Esperienze: Dynamic Island, carta olografica, macchina del tempo, controlli fluidi,
// command palette, fasori trifase.
import { FluxElement, define, ms, esc, metric, smoothPath, uid, polar } from './base.js';
import { UTIL, fmt, fireEvent, rateAt, hourNow, walker, rand, live } from '../live.js';

// ---------- Dynamic Island: si espande quando succede qualcosa ----------
class Island extends FluxElement {
  setup() {
    this.m = metric(this.u, 'rate');
  }
  render() {
    const u = this.u;
    this.innerHTML = `<div class="island" data-state="compact" aria-live="polite">
      <div class="island__compact"><span class="island__pulse"></span><span class="ms island__ic">${u.icon}</span><span class="island__txt"><b>${esc(u.product)}</b> <span class="island__live"></span></span></div>
      <div class="island__exp"><span class="island__big ms"></span><div class="island__body"><b class="island__title"></b><span class="island__text"></span></div><div class="island__acts"><button class="island__btn" data-island="close">Ignora</button><button class="island__btn is-primary" data-island="close">Apri</button></div></div>
    </div>
    ${this.hasAttribute('demo') ? `<button class="fx-btn fx-btn--ghost island__try" data-island="try">${ms('bolt')}Simula un evento</button>` : ''}`;
    this.querySelector('.island__live').textContent = `${fmt(this.m.walk.value, this.m.dec)} ${this.m.unit}`;
    this.onclick = (e) => {
      const a = e.target.closest('[data-island]')?.dataset.island;
      if (a === 'try') fireEvent(this.u.id);
      if (a === 'close') this.collapse();
    };
  }
  tick() {
    const el = this.querySelector('.island__live');
    if (el) el.textContent = `${fmt(this.m.walk.next(), this.m.dec)} ${this.m.unit}`;
  }
  onEvent(e) {
    const isl = this.querySelector('.island');
    isl.dataset.state = 'expanded';
    isl.dataset.kind = e.kind;
    this.querySelector('.island__big').textContent = e.icon;
    this.querySelector('.island__title').textContent = e.title;
    this.querySelector('.island__text').textContent = e.text;
    clearTimeout(this._t);
    this._t = setTimeout(() => this.collapse(), 5200);
  }
  collapse() {
    const isl = this.querySelector('.island');
    if (isl) isl.dataset.state = 'compact';
  }
  teardown() {
    clearTimeout(this._t);
  }
}
define('rg-island', Island);

// ---------- Carta olografica del contatore: si inclina col mouse, riflessi iridescenti ----------
class HoloCard extends FluxElement {
  setup() {
    this.m = metric(this.u, 'rate');
    this.hist = Array.from({ length: 24 }, (_, h) => rateAt(this.u, h));
    this.reading = this.u.id === 'power' ? 18342.7 : this.u.id === 'gas' ? 4821.33 : 1284.637;
  }
  render() {
    const u = this.u;
    const max = Math.max(...this.hist);
    const spark = smoothPath(this.hist.map((v, k) => [(k / 23) * 160, 38 - (v / max) * 32]));
    this.innerHTML = `<div class="holo" tabindex="0" aria-label="Carta digitale del contatore ${esc(u.meter.id)}">
      <div class="holo__card">
        <div class="holo__top"><img src="assets/pittogramma_colori.svg" alt="" class="holo__logo"><span class="holo__brand">Digital Twin</span><span class="holo__chip">${ms(u.icon)}${esc(u.name)}</span></div>
        <div class="holo__id fx-num">${esc(u.meter.id)}</div>
        <div class="holo__model">${esc(u.meter.model)}</div>
        <div class="holo__mid"><div><span class="holo__k">Lettura</span><span class="holo__reading fx-num"></span></div>
          <svg viewBox="0 0 160 40" class="holo__spark" aria-hidden="true"><path d="${spark}"></path></svg></div>
        <div class="holo__bottom"><span class="holo__status">${ms('verified')}In regola</span><span>${ms('location_on')}${esc(u.meter.where)}</span><span class="ms holo__nfc">contactless</span></div>
        <div class="holo__sheen"></div><div class="holo__glare"></div>
      </div>
    </div>`;
    const card = this.querySelector('.holo');
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.setProperty('--rx', `${(0.5 - y) * 18}deg`);
      card.style.setProperty('--ry', `${(x - 0.5) * 22}deg`);
      card.style.setProperty('--mx', `${x * 100}%`);
      card.style.setProperty('--my', `${y * 100}%`);
      card.classList.add('is-active');
    });
    card.addEventListener('pointerleave', () => {
      card.style.setProperty('--rx', '0deg');
      card.style.setProperty('--ry', '0deg');
      card.classList.remove('is-active');
    });
    this.draw();
  }
  tick() {
    this.reading += this.u.id === 'power' ? 0.05 : 0.0012;
    this.draw();
  }
  onEvent(e) {
    const s = this.querySelector('.holo__status');
    s.innerHTML = `${ms(e.icon)}${esc(e.title)}`;
    s.className = `holo__status is-${e.kind}`;
    setTimeout(() => {
      if (!this.isConnected) return;
      s.innerHTML = `${ms('verified')}In regola`;
      s.className = 'holo__status';
    }, 6000);
  }
  draw() {
    const unit = this.u.total.unit === 'Sm³' ? 'm³' : this.u.total.unit;
    this.querySelector('.holo__reading').innerHTML = `${fmt(this.reading, this.u.id === 'power' ? 1 : 3)} <small>${unit}</small>`;
  }
}
define('rg-holo-card', HoloCard);

// ---------- Macchina del tempo: scorri la giornata e guarda come cambia la rete ----------
class Scrubber extends FluxElement {
  setup() {
    this.vals = Array.from({ length: 96 }, (_, k) => rateAt(this.u, k / 4, 0.05));
    this.pos = Math.floor(hourNow() * 4);
    this.playing = false;
  }
  render() {
    const u = this.u, id = uid(), W = 640, H = 150, max = u.rate.max;
    this.x = (k) => (k / 95) * W;
    this.y = (v) => H - 8 - (v / max) * (H - 20);
    const line = smoothPath(this.vals.map((v, k) => [this.x(k), this.y(v)]));
    this.innerHTML = `<div class="scrub">
      <div class="scrub__head"><div><span class="fx-label">${esc(u.rate.label)} alle</span><div class="scrub__time fx-num"></div></div>
        <div class="scrub__value"><span class="fx-num scrub__num"></span><span class="scrub__unit">${u.rate.unit}</span></div>
        <button class="fx-btn fx-btn--icon scrub__play" aria-label="Riproduci la giornata">${ms('play_arrow')}</button></div>
      <div class="scrub__chart"><svg viewBox="0 0 ${W} ${H}" preserveAspectRatio="none" aria-hidden="true">
        <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--acc);stop-opacity:.3"></stop><stop offset="1" style="stop-color:var(--acc);stop-opacity:0"></stop></linearGradient>
        <clipPath id="${id}c"><rect class="scrub__clip" width="0" height="${H}"></rect></clipPath></defs>
        <path d="${line} L${W} ${H} L0 ${H} Z" class="scrub__ghost"></path>
        <g clip-path="url(#${id}c)"><path d="${line} L${W} ${H} L0 ${H} Z" fill="url(#${id})"></path><path d="${line}" class="scrub__line"></path></g>
      </svg><span class="scrub__cursor"><i></i></span></div>
      <input type="range" min="0" max="95" class="scrub__range" aria-label="Ora del giorno">
      <div class="scrub__hours"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>24:00</span></div>
    </div>`;
    const range = this.querySelector('.scrub__range');
    range.value = this.pos;
    range.addEventListener('input', () => {
      this.pos = +range.value;
      this.draw();
    });
    this.querySelector('.scrub__play').addEventListener('click', () => {
      this.playing = !this.playing;
      if (this.playing && this.pos >= 95) this.pos = 0;
      this.querySelector('.scrub__play').innerHTML = ms(this.playing ? 'pause' : 'play_arrow');
    });
    this.draw();
  }
  frame(dt) {
    if (!this.playing) return;
    this.pos = Math.min(95, this.pos + dt * 12);
    if (this.pos >= 95) {
      this.playing = false;
      this.querySelector('.scrub__play').innerHTML = ms('replay');
    }
    this.draw();
  }
  draw() {
    const k = Math.round(this.pos), H = 150;
    const pct = (this.pos / 95) * 100;
    this.querySelector('.scrub__clip').setAttribute('width', (this.pos / 95) * 640);
    this.querySelector('.scrub__cursor').style.left = `${pct}%`;
    this.querySelector('.scrub__cursor i').style.top = `${(this.y(this.vals[k]) / H) * 100}%`;
    this.querySelector('.scrub__range').value = k;
    this.querySelector('.scrub__time').textContent = `${String(Math.floor(k / 4)).padStart(2, '0')}:${String((k % 4) * 15).padStart(2, '0')}`;
    this.querySelector('.scrub__num').textContent = fmt(this.vals[k], this.u.rate.dec);
  }
}
define('rg-scrubber', Scrubber);

// ---------- Controlli fluidi: segmentato con vetro che scivola, interruttore a molla, cursore liquido ----------
class Controls extends FluxElement {
  render() {
    const opts = ['Giorno', 'Settimana', 'Mese', 'Anno'];
    this.innerHTML = `<div class="ctl">
      <div class="seg" style="--n:${opts.length};--i:1" role="radiogroup" aria-label="Periodo">${opts.map((o, k) => `<button role="radio" aria-checked="${k === 1}" data-i="${k}">${o}</button>`).join('')}<span class="seg__thumb"></span></div>
      <div class="ctl__row">
        <label class="sw"><input type="checkbox" role="switch" checked><span class="sw__track"><span class="sw__thumb"></span></span><span>Allarmi in tempo reale</span></label>
        <label class="sw"><input type="checkbox" role="switch"><span class="sw__track"><span class="sw__thumb"></span></span><span>Chiusura valvola automatica</span></label>
      </div>
      <label class="lq"><span class="lq__top"><span>Soglia di allarme</span><b class="fx-num lq__out">65%</b></span><span class="lq__wrap" style="--v:65"><input type="range" min="0" max="100" value="65" aria-label="Soglia di allarme"><span class="lq__fill"></span><span class="lq__bubble"></span></span></label>
      <div class="stepper" aria-label="Intervallo di lettura"><button aria-label="Diminuisci" data-s="-1">${ms('remove')}</button><span><b class="fx-num stepper__v">15</b> min</span><button aria-label="Aumenta" data-s="1">${ms('add')}</button></div>
    </div>`;
    this.addEventListener('click', (e) => {
      const b = e.target.closest('.seg button');
      if (b) {
        const seg = b.parentElement;
        seg.style.setProperty('--i', b.dataset.i);
        seg.querySelectorAll('button').forEach((x) => x.setAttribute('aria-checked', x === b));
      }
      const s = e.target.closest('[data-s]');
      if (s) {
        const v = this.querySelector('.stepper__v');
        const steps = [1, 5, 15, 30, 60, 240, 1440];
        const i = Math.max(0, Math.min(steps.length - 1, steps.indexOf(+v.textContent) + +s.dataset.s));
        v.textContent = steps[i];
        v.classList.remove('is-bump');
        void v.offsetWidth;
        v.classList.add('is-bump');
      }
    });
    this.addEventListener('input', (e) => {
      if (e.target.type !== 'range') return;
      e.target.parentElement.style.setProperty('--v', e.target.value);
      this.querySelector('.lq__out').textContent = `${e.target.value}%`;
    });
  }
}
define('rg-controls', Controls);

// ---------- Command palette (⌘K): cerca contatori, zone e azioni ----------
class Command extends FluxElement {
  items() {
    const u = this.u;
    return [
      ...u.districts.map((d) => ({ icon: 'location_on', t: d, s: `Zona · ${u.name}`, k: 'Vai' })),
      { icon: u.icon, t: u.meter.id, s: u.meter.where, k: 'Apri' },
      { icon: 'bolt', t: 'Simula un evento', s: `Prova la reazione dei componenti ${u.word === 'gas' ? 'del gas' : u.word === 'idrica' ? 'della rete idrica' : 'della rete elettrica'}`, k: '↵', act: 'event' },
      { icon: 'download', t: 'Esporta report del giorno', s: 'PDF · CSV', k: '⌘E' },
      { icon: 'contrast', t: 'Cambia tema', s: 'Apri lo studio dei temi', k: '⌘T' },
      ...u.events.map((e) => ({ icon: e.icon, t: e.title, s: e.text, k: 'Allarme' })),
    ];
  }
  render() {
    this.sel = 0;
    this.innerHTML = `<div class="cmd">
      <label class="cmd__search">${ms('search')}<input placeholder="Cerca contatori, zone, azioni…" aria-label="Cerca"><kbd>⌘K</kbd></label>
      <ul class="cmd__list" role="listbox"></ul>
      <div class="cmd__foot"><span><kbd>↑</kbd><kbd>↓</kbd> per scegliere</span><span><kbd>↵</kbd> per aprire</span></div>
    </div>`;
    const input = this.querySelector('input');
    input.addEventListener('input', () => {
      this.sel = 0;
      this.draw(input.value);
    });
    input.addEventListener('keydown', (e) => {
      const n = this.querySelectorAll('.cmd__list li').length;
      if (e.key === 'ArrowDown') this.sel = (this.sel + 1) % n;
      else if (e.key === 'ArrowUp') this.sel = (this.sel - 1 + n) % n;
      else if (e.key === 'Enter') return this.run();
      else return;
      e.preventDefault();
      this.draw(input.value);
    });
    this.addEventListener('click', (e) => {
      const li = e.target.closest('li[data-i]');
      if (li) {
        this.sel = +li.dataset.i;
        this.run();
      }
    });
    this.draw('');
  }
  run() {
    const li = this.querySelectorAll('.cmd__list li')[this.sel];
    if (!li) return;
    if (li.dataset.act === 'event') fireEvent(this.u.id);
    li.classList.remove('is-run');
    void li.offsetWidth;
    li.classList.add('is-run');
  }
  draw(q) {
    const s = q.trim().toLowerCase();
    const list = this.items().filter((x) => !s || `${x.t} ${x.s}`.toLowerCase().includes(s)).slice(0, 6);
    this.querySelector('.cmd__list').innerHTML = list.length
      ? list.map((x, k) => `<li role="option" aria-selected="${k === this.sel}" data-i="${k}" ${x.act ? `data-act="${x.act}"` : ''}><span class="cmd__ic">${ms(x.icon)}</span><span class="cmd__t"><b>${esc(x.t)}</b><small>${esc(x.s)}</small></span><kbd>${esc(x.k)}</kbd></li>`).join('')
      : `<li class="cmd__empty">Nessun risultato per "${esc(q)}"</li>`;
  }
}
define('rg-command', Command);

// ---------- Fasori trifase (elettrico): tensioni e correnti che ruotano ----------
class Phasor extends FluxElement {
  get u() {
    return UTIL.power;
  }
  setup() {
    this.rot = 0;
    this.ph = [0, 1, 2].map(() => ({ v: walker(231, 222, 240, 0.08), i: walker(rand(80, 120), 50, 150, 0.08), phi: walker(18, 8, 32, 0.08) }));
  }
  render() {
    const vecs = [0, 1, 2].map((k) => `<g class="ph__v ph--${k}" data-p="${k}"><line x1="110" y1="110" x2="110" y2="30" class="ph__volt"></line><circle cx="110" cy="30" r="4"></circle><line x1="110" y1="110" x2="110" y2="60" class="ph__amp"></line></g>`).join('');
    this.innerHTML = `<div class="ph">
      <svg viewBox="0 0 220 220" class="ph__svg" role="img" aria-label="Diagramma dei fasori trifase">
        <circle cx="110" cy="110" r="80" class="ph__ring"></circle><circle cx="110" cy="110" r="50" class="ph__ring ph__ring--in"></circle>
        ${[0, 30, 60, 90, 120, 150].map((a) => { const [x0, y0] = polar(110, 110, 84, a), [x1, y1] = polar(110, 110, 84, a + 180); return `<line x1="${x0}" y1="${y0}" x2="${x1}" y2="${y1}" class="ph__axis"></line>`; }).join('')}
        <g class="ph__rot">${vecs}</g><circle cx="110" cy="110" r="5" class="ph__hub"></circle>
      </svg>
      <table class="ph__table"><thead><tr><th>Fase</th><th>V</th><th>A</th><th>cos φ</th></tr></thead><tbody>${['L1', 'L2', 'L3'].map((l, k) => `<tr class="ph--${k}"><td><i></i>${l}</td><td class="fx-num" data-vv="${k}"></td><td class="fx-num" data-ii="${k}"></td><td class="fx-num" data-pf="${k}"></td></tr>`).join('')}</tbody></table>
      <div class="ph__unb">Squilibrio <b class="fx-num"></b></div>
    </div>`;
    this.draw();
  }
  tick() {
    this.ph.forEach((p) => {
      p.v.next();
      p.i.next();
      p.phi.next();
    });
    this.draw();
  }
  frame(dt) {
    this.rot = (this.rot + dt * 24) % 360;
    const g = this.querySelector('.ph__rot');
    if (g) g.style.transform = `rotate(${this.rot}deg)`;
  }
  draw() {
    const imax = 150;
    this.ph.forEach((p, k) => {
      const g = this.querySelector(`[data-p="${k}"]`);
      const vl = 80 * (p.v.value / 240), il = 72 * (p.i.value / imax);
      g.style.transform = `rotate(${k * 120}deg)`;
      g.querySelector('.ph__volt').setAttribute('y2', 110 - vl);
      g.querySelector('circle').setAttribute('cy', 110 - vl);
      const amp = g.querySelector('.ph__amp');
      amp.setAttribute('y2', 110 - il);
      amp.style.transform = `rotate(${p.phi.value}deg)`;
      this.querySelector(`[data-vv="${k}"]`).textContent = fmt(p.v.value, 0);
      this.querySelector(`[data-ii="${k}"]`).textContent = fmt(p.i.value, 0);
      this.querySelector(`[data-pf="${k}"]`).textContent = fmt(Math.cos((p.phi.value * Math.PI) / 180), 2);
    });
    const is = this.ph.map((p) => p.i.value), avg = is.reduce((a, b) => a + b, 0) / 3;
    const unb = (Math.max(...is.map((x) => Math.abs(x - avg))) / avg) * 100;
    const el = this.querySelector('.ph__unb b');
    el.textContent = `${fmt(unb, 1)}%`;
    el.className = `fx-num ${unb > 20 ? 'is-bad' : unb > 10 ? 'is-warn' : 'is-ok'}`;
  }
}
define('rg-phasor', Phasor);
