// Indicatori: arco con lancetta a molla, anelli, serbatoio vivo, matrice a punti.
import { FluxElement, define, ms, esc, metric, uid, polar, arcPath } from './base.js';
import { fmt, walker, clamp } from '../live.js';

// ---------- Arco con lancetta a molla ----------
class ArcGauge extends FluxElement {
  setup() {
    this.m = metric(this.u, this.attr('metric', 'pressure'));
  }
  angle(v) {
    return -135 + ((clamp(v, this.m.min, this.m.max) - this.m.min) / (this.m.max - this.m.min)) * 270;
  }
  render() {
    const m = this.m, id = uid();
    const zones = (this.attr('metric', 'pressure') === 'pressure' ? this.u.pressure.zones : [[m.min, m.max, 'ok']])
      .map(([a, b, k]) => `<path d="${arcPath(120, 120, 98, this.angle(a) + 0.6, this.angle(b) - 0.6)}" class="ag__zone ag__zone--${k}"></path>`).join('');
    const ticks = Array.from({ length: 41 }, (_, k) => {
      const a = -135 + k * 6.75, major = k % 5 === 0;
      const [x0, y0] = polar(120, 120, major ? 76 : 80, a), [x1, y1] = polar(120, 120, 86, a);
      const label = major ? (() => { const [tx, ty] = polar(120, 120, 64, a); return `<text x="${tx.toFixed(1)}" y="${(ty + 3).toFixed(1)}" class="ag__tl">${fmt(m.min + ((m.max - m.min) * k) / 40, m.max - m.min < 10 ? 0 : 0)}</text>`; })() : '';
      return `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" class="ag__tick ${major ? 'is-major' : ''}"></line>${label}`;
    }).join('');
    this.innerHTML = `<div class="ag">
      <svg viewBox="0 0 240 210" class="ag__svg" role="img" aria-label="${esc(m.label)}">
        <defs><linearGradient id="${id}" x1="0" x2="1"><stop offset="0" style="stop-color:var(--acc2)"></stop><stop offset="1" style="stop-color:var(--acc)"></stop></linearGradient></defs>
        ${zones}
        <path d="${arcPath(120, 120, 90, -135, 135)}" class="ag__track"></path>
        <path d="${arcPath(120, 120, 90, -135, 135)}" class="ag__value" pathLength="100" stroke="url(#${id})"></path>
        ${ticks}
        <g class="ag__needle"><path d="M120 128 L116.5 120 L120 44 L123.5 120 Z"></path><circle cx="120" cy="120" r="9" class="ag__hub"></circle><circle cx="120" cy="120" r="3.5" class="ag__hub-dot"></circle></g>
        <text x="120" y="168" class="ag__num fx-num"></text>
        <text x="120" y="188" class="ag__unit">${esc(m.unit)} · ${esc(this.attr('label', m.label))}</text>
      </svg>
    </div>`;
    this.draw();
  }
  tick() {
    this.m.walk.next();
    this.draw();
  }
  onEvent(e) {
    if (e.kind !== 'info') this.m.walk.kick((this.m.max - this.m.min) * (Math.random() > 0.5 ? 0.22 : -0.22));
    this.draw();
  }
  draw() {
    const v = this.m.walk.value;
    this.querySelector('.ag__needle').style.transform = `rotate(${this.angle(v)}deg)`;
    this.querySelector('.ag__value').style.strokeDasharray = `${((v - this.m.min) / (this.m.max - this.m.min)) * 100} 100`;
    this.querySelector('.ag__num').textContent = fmt(v, this.m.dec);
    const zone = (this.attr('metric', 'pressure') === 'pressure' ? this.u.pressure.zones : []).find(([a, b]) => v >= a && v < b)?.[2] || 'ok';
    this.querySelector('.ag').dataset.zone = zone;
  }
}
define('rg-arc-gauge', ArcGauge);

// ---------- Anelli attività (stile Apple Watch) ----------
class Rings extends FluxElement {
  setup() {
    this.vals = this.u.rings.map(([, v]) => walker(v, Math.max(5, v - 12), Math.min(100, v + 8), 0.05));
  }
  render() {
    const cls = ['acc', 'acc2', 'ok'];
    this.innerHTML = `<div class="rings">
      <svg viewBox="0 0 180 180" class="rings__svg" role="img" aria-label="Anelli degli obiettivi">
        ${this.u.rings.map((_, k) => { const r = 76 - k * 22; return `<circle cx="90" cy="90" r="${r}" class="rings__bg rings--${cls[k]}"></circle><circle cx="90" cy="90" r="${r}" pathLength="100" class="rings__fg rings--${cls[k]}" data-k="${k}"></circle>`; }).join('')}
      </svg>
      <ul class="rings__legend">${this.u.rings.map(([label], k) => `<li><i class="rings--${cls[k]}"></i><span>${esc(label)}</span><b class="fx-num" data-v="${k}"></b></li>`).join('')}</ul>
    </div>`;
    requestAnimationFrame(() => this.draw());
  }
  tick(t) {
    if (t % 2) return;
    this.vals.forEach((w) => w.next());
    this.draw();
  }
  draw() {
    this.vals.forEach((w, k) => {
      const el = this.querySelector(`[data-k="${k}"]`);
      if (!el) return;
      el.style.strokeDasharray = `${w.value} 100`;
      this.querySelector(`[data-v="${k}"]`).textContent = `${fmt(w.value, 0)}%`;
    });
  }
}
define('rg-rings', Rings);

// ---------- Serbatoio vivo: onde per l'acqua, nebbia per il gas, celle per la batteria ----------
class Tank extends FluxElement {
  setup() {
    this.m = metric(this.u, 'level');
    this.dir = 1;
  }
  render() {
    const u = this.u, id = uid();
    let body;
    if (u.id === 'power') {
      body = `<div class="tank tank--battery">
        <div class="batt"><div class="batt__cells">${Array.from({ length: 10 }, (_, k) => `<span data-c="${k}"></span>`).join('')}</div><div class="batt__shine"></div><div class="batt__cap"></div></div>
        <div class="tank__readout"><span class="tank__pct fx-num"></span><span class="tank__state"></span></div>
      </div>`;
    } else {
      const shape = u.id === 'gas' ? `<circle cx="100" cy="110" r="92"></circle>` : `<rect x="16" y="14" width="168" height="196" rx="26"></rect>`;
      const inner = u.id === 'gas'
        ? `<g class="tank__fog">${Array.from({ length: 7 }, (_, k) => `<circle class="tank__blob" cx="${30 + k * 24}" cy="${120 + (k % 3) * 22}" r="${26 + (k % 3) * 10}" style="animation-delay:${-k * 1.3}s"></circle>`).join('')}</g>`
        : `<path class="tank__wave tank__wave--back" d="${wave(420, 10, 0)}"></path><path class="tank__wave" d="${wave(420, 8, 30)}"></path>
           ${Array.from({ length: 8 }, (_, k) => `<circle class="tank__bubble" cx="${30 + k * 20}" cy="230" r="${2 + (k % 3)}" style="animation-delay:${-k * 0.7}s;animation-duration:${3 + (k % 4)}s"></circle>`).join('')}`;
      body = `<div class="tank">
        <svg viewBox="0 0 200 224" class="tank__svg" role="img" aria-label="${esc(u.level.label)}">
          <defs><clipPath id="${id}">${shape}</clipPath>
            <linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--acc2)"></stop><stop offset="1" style="stop-color:var(--acc)"></stop></linearGradient></defs>
          <g clip-path="url(#${id})"><rect width="200" height="224" class="tank__empty"></rect><g class="tank__liquid" fill="url(#${id}g)"><rect x="-20" y="${u.id === 'gas' ? 4 : 12}" width="240" height="260" fill="url(#${id}g)"></rect>${inner}</g></g>
          <g class="tank__shell">${shape}</g>
          ${[25, 50, 75].map((p) => `<line x1="${u.id === 'gas' ? 182 : 170}" x2="${u.id === 'gas' ? 192 : 184}" y1="${210 - p * 1.96}" y2="${210 - p * 1.96}" class="tank__tick"></line>`).join('')}
        </svg>
        <div class="tank__readout"><span class="tank__pct fx-num"></span><span class="tank__state"></span></div>
      </div>`;
    }
    this.innerHTML = `<div class="tank-wrap"><div class="tank-head"><span class="fx-label">${esc(this.attr('label', u.level.label))}</span><span class="fx-chip">${esc(u.level.capacity)}</span></div>${body}</div>`;
    this.draw();
  }
  tick() {
    const before = this.m.walk.value;
    this.m.walk.next();
    this.dir = this.m.walk.value >= before ? 1 : -1;
    this.draw();
  }
  draw() {
    const v = this.m.walk.value, u = this.u;
    this.querySelector('.tank__pct').textContent = `${fmt(v, 0)}%`;
    const st = this.querySelector('.tank__state');
    if (u.id === 'power') {
      this.querySelectorAll('[data-c]').forEach((c, k) => c.style.setProperty('--f', clamp((v - k * 10) / 10, 0, 1)));
      this.querySelector('.tank--battery').classList.toggle('is-charging', this.dir > 0);
      st.innerHTML = this.dir > 0 ? `${ms('bolt')} In carica` : `${ms('south')} In scarica`;
    } else {
      const liq = this.querySelector('.tank__liquid');
      liq.style.transform = `translateY(${(1 - v / 100) * 196}px)`;
      st.innerHTML = this.dir > 0 ? `${ms('north')} In riempimento` : `${ms('south')} In svuotamento`;
    }
  }
}
function wave(w, amp, phase) {
  let d = `M0 ${12 + Math.sin(phase) * amp}`;
  for (let x = 0; x <= w; x += 10) d += ` L${x} ${(12 + Math.sin(((x + phase) / 100) * Math.PI * 2) * amp).toFixed(1)}`;
  return `${d} L${w} 40 L0 40 Z`;
}
define('rg-tank', Tank);

// ---------- Matrice a punti: 100 punti, uno per ogni percento ----------
class Waffle extends FluxElement {
  setup() {
    const s = this.u.share;
    this.w = walker(s.value, s.value - 6, s.value + 6, 0.08);
  }
  render() {
    this.innerHTML = `<div class="waffle">
      <div class="waffle__grid" role="img" aria-label="${esc(this.u.share.label)}">${Array.from({ length: 100 }, (_, k) => `<i style="transition-delay:${(k % 10) * 18 + Math.floor(k / 10) * 12}ms"></i>`).join('')}</div>
      <div class="waffle__side"><span class="waffle__num fx-num"></span><span class="fx-label">${esc(this.attr('label', this.u.share.label))}</span><span class="waffle__note">Ogni punto è l'1%</span></div>
    </div>`;
    requestAnimationFrame(() => this.draw());
  }
  tick(t) {
    if (t % 3) return;
    this.w.next();
    this.draw();
  }
  draw() {
    const n = Math.round(this.w.value);
    this.querySelectorAll('.waffle__grid i').forEach((d, k) => d.classList.toggle('is-on', k < n));
    this.querySelector('.waffle__num').textContent = `${n}%`;
  }
}
define('rg-waffle', Waffle);
