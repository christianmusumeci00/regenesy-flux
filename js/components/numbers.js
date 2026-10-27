// Numeriche: totalizzatore meccanico, numero vivo, quadrante del contatore (digital twin).
import { FluxElement, define, ms, esc, metric, smoothPath, tween, uid, polar } from './base.js';
import { fmt, live } from '../live.js';

// ---------- Totalizzatore meccanico: tamburi che rotolano come in un contatore vero ----------
class Odometer extends FluxElement {
  setup() {
    const t = this.u.total;
    this.value = this.num('value', t.start);
    this.dec = this.num('decimals', t.dec);
    this.rate = this.num('rate', t.perSec);
    this.added = 0;
  }
  render() {
    const t = this.u.total;
    const ints = this.num('digits', 8);
    const drums = Array.from({ length: ints + this.dec }, (_, n) =>
      `<span class="odo__drum ${n >= ints ? 'is-dec' : ''}"><span class="odo__strip">${[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map((d) => `<span>${d}</span>`).join('')}</span></span>${n === ints - 1 && this.dec ? '<span class="odo__sep">,</span>' : ''}`
    ).join('');
    this.innerHTML = `<div class="odo">
      <div class="odo__head"><span class="fx-label">${esc(this.attr('label', t.label))}</span><span class="fx-live"><i></i>Live</span></div>
      <div class="odo__window" role="img" aria-label="${esc(t.label)}">${drums}<span class="odo__unit">${t.unit}</span></div>
      <div class="odo__foot"><span>${ms('speed')} ${fmt(this.rate * 3600, 0)} ${t.unit}/h</span><span>+<b class="odo__added">0</b> ${t.unit} da quando guardi</span></div>
    </div>`;
    this.strips = [...this.querySelectorAll('.odo__strip')];
    this.addedEl = this.querySelector('.odo__added');
    this.draw();
  }
  frame(dt) {
    if (!dt) return;
    const d = this.rate * dt;
    this.value += d;
    this.added += d;
    this.draw();
  }
  draw() {
    const n = this.strips.length;
    const scaled = this.value * 10 ** this.dec;
    for (let i = 0; i < n; i++) {
      const p = n - 1 - i;
      const raw = scaled / 10 ** p;
      let pos;
      if (p === 0) pos = raw % 10;
      else {
        const lower = (scaled / 10 ** (p - 1)) % 10;
        pos = (Math.floor(raw) % 10) + (lower > 9 ? lower - 9 : 0);
      }
      this.strips[i].style.transform = `translateY(${(-pos * 100) / 11}%)`;
    }
    if (this.addedEl) this.addedEl.textContent = fmt(this.added, this.dec);
  }
}
define('rg-odometer', Odometer);

// ---------- Numero vivo: il valore "conta" fino al dato nuovo, con variazione e scia ----------
class LiveNumber extends FluxElement {
  setup() {
    this.m = metric(this.u, this.attr('metric', 'rate'));
    this.hist = Array.from({ length: 36 }, () => this.m.walk.next());
    this.shown = this.m.walk.value;
  }
  render() {
    const m = this.m;
    this.innerHTML = `<div class="ln">
      <div class="ln__head"><span class="ln__icon">${ms(m.icon)}</span><span class="fx-label">${esc(this.attr('label', m.label))}</span><span class="ln__delta"></span></div>
      <div class="ln__value"><span class="ln__num fx-num">${fmt(this.shown, m.dec)}</span><span class="ln__unit">${m.unit}</span></div>
      <svg class="ln__spark" viewBox="0 0 200 44" preserveAspectRatio="none" aria-hidden="true"><path class="ln__area"></path><path class="ln__line"></path><circle class="ln__dot" r="3"></circle></svg>
      <div class="ln__foot"><span>min <b class="ln__min"></b></span><span>max <b class="ln__max"></b></span><span class="ln__trend"></span></div>
    </div>`;
    this.$ = (s) => this.querySelector(s);
    this.draw(true);
  }
  tick() {
    const prev = this.m.walk.value;
    const v = this.m.walk.next();
    this.hist.push(v);
    this.hist.shift();
    tween(this.shown, v, 700, (x) => {
      this.shown = x;
      const el = this.$('.ln__num');
      if (el) el.textContent = fmt(x, this.m.dec);
    });
    this.querySelector('.ln')?.classList.remove('is-flash');
    void this.offsetWidth;
    this.querySelector('.ln')?.classList.add('is-flash');
    this.draw(false, v - prev);
  }
  onEvent() {
    this.m.walk.kick((this.m.max - this.m.min) * 0.12 * (this.m.lowIsGood ? 1 : -1));
  }
  draw(first, diff = 0) {
    const h = this.hist, min = Math.min(...h), max = Math.max(...h), span = max - min || 1;
    const pts = h.map((v, n) => [(n / (h.length - 1)) * 200, 40 - ((v - min) / span) * 34]);
    const line = smoothPath(pts);
    this.$('.ln__line').setAttribute('d', line);
    this.$('.ln__area').setAttribute('d', `${line} L200 44 L0 44 Z`);
    const last = pts[pts.length - 1];
    this.$('.ln__dot').setAttribute('cx', last[0]);
    this.$('.ln__dot').setAttribute('cy', last[1]);
    this.$('.ln__min').textContent = fmt(min, this.m.dec);
    this.$('.ln__max').textContent = fmt(max, this.m.dec);
    if (!first) {
      const pct = (diff / (this.m.walk.value || 1)) * 100;
      const good = this.m.lowIsGood ? diff <= 0 : diff >= 0;
      const d = this.$('.ln__delta');
      d.className = `ln__delta ${good ? 'is-good' : 'is-bad'}`;
      d.innerHTML = `${ms(diff >= 0 ? 'arrow_upward' : 'arrow_downward')}${fmt(Math.abs(pct), 1)}%`;
    }
    const avg = h.reduce((a, b) => a + b, 0) / h.length;
    this.$('.ln__trend').textContent = h[h.length - 1] > avg ? 'sopra la media' : 'sotto la media';
  }
}
define('rg-live-number', LiveNumber);

// ---------- Quadrante del contatore: il gemello digitale del contatore fisico ----------
class DialMeter extends FluxElement {
  setup() {
    const t = this.u.total;
    this.value = this.num('value', this.u.id === 'power' ? 18342.7 : this.u.id === 'gas' ? 4821.337 : 1284.6371);
    this.rate = this.u.id === 'power' ? 0.0011 : this.u.id === 'gas' ? 0.00042 : 0.00035;
    this.flow = 1;
    this.blink = 0;
    this.unit = t.unit === 'Sm³' ? 'm³' : t.unit;
  }
  render() {
    const u = this.u, id = uid();
    const kind = u.id;
    const sub = (cx, cy, mult, n) => `<g class="dm__sub" transform="translate(${cx} ${cy})">
      <circle r="17" class="dm__subface"></circle>
      ${Array.from({ length: 10 }, (_, k) => { const [x, y] = polar(0, 0, 12.5, k * 36); return `<text x="${x.toFixed(1)}" y="${(y + 2.4).toFixed(1)}" class="dm__subnum">${k}</text>`; }).join('')}
      <path class="dm__needle-red" data-sub="${n}" d="M0 3 L-1.6 0 L0 -14 L1.6 0 Z"></path><circle r="2" class="dm__hub"></circle>
      <text y="27" class="dm__mult">×${mult}</text></g>`;
    const movement =
      kind === 'water'
        ? `${sub(98, 196, '0,0001', 0)}${sub(140, 214, '0,001', 1)}${sub(182, 196, '0,01', 2)}
           <g class="dm__star" transform="translate(140 158)"><circle r="11" class="dm__subface"></circle>${Array.from({ length: 6 }, (_, k) => `<path d="M0 0 L3 -9 L-3 -9 Z" transform="rotate(${k * 60})" class="dm__star-arm"></path>`).join('')}</g>`
        : kind === 'gas'
          ? `${sub(140, 196, '0,002 m³/giro', 0)}<text x="140" y="160" class="dm__brand2">G4 · Qmax 6 m³/h</text>`
          : `<g transform="translate(140 182)"><rect x="-70" y="-14" width="140" height="28" rx="6" class="dm__window"></rect>
               <g clip-path="url(#${id}c)"><rect x="-70" y="-10" width="140" height="20" fill="url(#${id}d)"></rect><rect class="dm__mark" x="80" y="-10" width="10" height="20"></rect></g>
               <clipPath id="${id}c"><rect x="-66" y="-10" width="132" height="20" rx="4"></rect></clipPath></g>
             <g transform="translate(140 226)"><circle r="5" class="dm__led"></circle><text x="10" y="4" class="dm__mult" text-anchor="start">1000 imp/kWh</text></g>`;
    this.innerHTML = `<div class="dm">
      <svg viewBox="0 0 280 280" class="dm__svg" role="img" aria-label="Quadrante del contatore ${esc(u.meter.id)}">
        <defs>
          <radialGradient id="${id}f" cx="50%" cy="35%" r="70%"><stop offset="0" style="stop-color:var(--solid)"></stop><stop offset="1" style="stop-color:color-mix(in srgb, var(--solid) 86%, var(--text))"></stop></radialGradient>
          <linearGradient id="${id}b" x1="0" y1="0" x2="1" y2="1"><stop offset="0" style="stop-color:color-mix(in srgb, var(--acc) 70%, #fff)"></stop><stop offset="1" style="stop-color:var(--acc2)"></stop></linearGradient>
          <linearGradient id="${id}d" x1="0" x2="1"><stop offset="0" stop-color="#9aa3ad"></stop><stop offset=".5" stop-color="#e9edf1"></stop><stop offset="1" stop-color="#9aa3ad"></stop></linearGradient>
        </defs>
        <circle cx="140" cy="140" r="134" fill="url(#${id}b)" class="dm__bezel"></circle>
        <circle cx="140" cy="140" r="122" fill="url(#${id}f)"></circle>
        <circle cx="140" cy="140" r="122" class="dm__glass"></circle>
        <text x="140" y="56" class="dm__brand">REGENESY · ${esc(u.meter.id)}</text>
        <g transform="translate(140 92)"><rect x="-92" y="-20" width="184" height="40" rx="8" class="dm__digits-bg"></rect>
          <text class="dm__digits" y="9"></text></g>
        <text x="140" y="128" class="dm__unit">${this.unit}</text>
        ${movement}
      </svg>
      <div class="dm__caption"><span>${esc(u.meter.model)}</span><span class="fx-live"><i></i>Gemello digitale</span></div>
    </div>`;
    this.digits = this.querySelector('.dm__digits');
    this.needles = [...this.querySelectorAll('[data-sub]')];
    this.star = this.querySelector('.dm__star');
    this.disc = this.querySelector('.dm__mark');
    this.led = this.querySelector('.dm__led');
    this.discX = 0;
    this.draw();
  }
  tick() {
    this.flow = 0.6 + Math.random() * 0.9;
  }
  frame(dt) {
    if (!dt) return;
    this.value += this.rate * this.flow * dt * 60;
    this.draw(dt);
  }
  draw(dt = 0) {
    const v = this.value;
    const [i, f] = v.toFixed(4).split('.');
    const decs = this.u.id === 'power' ? f.slice(0, 1) : f.slice(0, 3);
    this.digits.innerHTML = `<tspan class="dm__int">${i.padStart(5, '0')}</tspan><tspan class="dm__dec">,${decs}</tspan>`;
    this.needles.forEach((n, k) => {
      const mult = this.u.id === 'gas' ? 500 : [10000, 1000, 100][k];
      n.setAttribute('transform', `rotate(${((v * mult) % 10) * 36})`);
    });
    if (this.star) this.star.setAttribute('transform', `translate(140 158) rotate(${(v * 400000) % 360})`);
    if (this.disc) {
      this.discX = (this.discX + dt * 60 * this.flow) % 220;
      // Il segno nero del disco Ferraris attraversa la finestrella; si ripresenta fuori vista.
      this.disc.setAttribute('x', (80 - this.discX).toFixed(1));
      this.blink = (this.blink + dt * this.flow * 3) % 1;
      this.led.classList.toggle('is-on', this.blink < 0.15);
    }
  }
}
define('rg-dial-meter', DialMeter);
