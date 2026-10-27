// Base comune dei componenti Flux: settore corrente, iscrizione a tick/eventi, animazione per frame.
import { UTIL, onTick, onEvent, live, rateAt, hourNow, walker } from '../live.js';
import { getState, subscribe } from '../store.js';

export class FluxElement extends HTMLElement {
  // Il settore viene dall'attributo, poi dal contenitore più vicino, poi dalla scelta globale.
  get utilityId() {
    return this.getAttribute('utility') || this.parentElement?.closest('[data-utility]')?.dataset.utility || getState().utility;
  }
  get u() {
    return UTIL[this.utilityId] || UTIL.water;
  }
  attr(name, def) {
    const v = this.getAttribute(name);
    return v == null || v === '' ? def : v;
  }
  num(name, def) {
    const v = parseFloat(this.getAttribute(name));
    return Number.isNaN(v) ? def : v;
  }
  get moving() {
    return live.playing && this.closest('[data-motion]')?.dataset.motion !== 'off';
  }
  connectedCallback() {
    this.classList.add('fx-el');
    this._uid = this.u.id;
    this.setup?.();
    this.render();
    this._offs = [
      onTick((t) => this.tick?.(t)),
      onEvent((e) => e.utility === this.u.id && this.onEvent?.(e)),
      subscribe(() => {
        if (this.u.id === this._uid) return;
        this._uid = this.u.id;
        this.setup?.();
        this.render();
      }),
    ];
    if (this.frame) {
      const loop = (ts) => {
        const dt = this._ts ? Math.min(0.1, (ts - this._ts) / 1000) : 0;
        this._ts = ts;
        this.frame(dt * (this.moving ? live.speed : 0), ts);
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }
  }
  disconnectedCallback() {
    this._offs?.forEach((off) => off());
    cancelAnimationFrame(this._raf);
    this._ts = 0;
    this.teardown?.();
  }
}

export const define = (tag, cls) => customElements.get(tag) || customElements.define(tag, cls);
export const ms = (name, cls = '') => `<span class="ms ${cls}" aria-hidden="true">${name}</span>`;
export const uid = () => 'f' + Math.random().toString(36).slice(2, 8);
export const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

// Le grandezze "standard" di ogni settore, con un generatore che si muove in modo credibile.
export function metric(u, key) {
  const m = {
    rate: { label: u.rate.label, unit: u.rate.unit, dec: u.rate.dec, value: rateAt(u, hourNow(), 0), min: u.rate.min, max: u.rate.max, icon: 'speed', vol: 0.025 },
    pressure: { label: u.pressure.label, unit: u.pressure.unit, dec: u.pressure.dec, value: u.pressure.value, min: u.pressure.min, max: u.pressure.max, icon: 'compress', vol: 0.012 },
    level: { label: u.level.label, unit: '%', dec: 0, value: u.level.value, min: 5, max: 98, icon: u.id === 'power' ? 'battery_charging_full' : 'propane_tank', vol: 0.01 },
    loss: { label: u.loss.label, unit: '%', dec: 1, value: u.loss.value, min: u.loss.value * 0.75, max: u.loss.value * 1.25, icon: 'trending_down', vol: 0.03, lowIsGood: true },
    quality: { label: u.quality.label, unit: u.quality.unit, dec: u.quality.dec, value: u.quality.value, min: u.quality.min, max: u.quality.max, icon: u.id === 'power' ? 'graphic_eq' : 'science', vol: 0.03 },
  }[key] || null;
  if (!m) return metric(u, 'rate');
  m.walk = walker(m.value, m.min, m.max, m.vol);
  return m;
}

// Percorso morbido (Catmull-Rom → Bézier) per i grafici.
export function smoothPath(pts) {
  if (pts.length < 2) return '';
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2;
    const c1 = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2 = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${c1[0].toFixed(1)} ${c1[1].toFixed(1)} ${c2[0].toFixed(1)} ${c2[1].toFixed(1)} ${p2[0].toFixed(1)} ${p2[1].toFixed(1)}`;
  }
  return d;
}

// Interpolazione animata di un numero (per i valori che "contano" fino al nuovo dato).
export function tween(from, to, ms, onStep) {
  const t0 = performance.now();
  const step = (now) => {
    const k = Math.min(1, (now - t0) / ms);
    const e = 1 - Math.pow(1 - k, 3);
    onStep(from + (to - from) * e);
    if (k < 1) requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}

export const polar = (cx, cy, r, deg) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
};
export function arcPath(cx, cy, r, a0, a1) {
  const [x0, y0] = polar(cx, cy, r, a0);
  const [x1, y1] = polar(cx, cy, r, a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}
