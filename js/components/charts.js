// Grafici vivi: flusso in tempo reale, orologio dei consumi, mappa di calore,
// bilancio a flussi (Sankey), classifica in corsa, previsione con banda.
import { FluxElement, define, ms, esc, metric, smoothPath, uid, polar } from './base.js';
import { fmt, live, walker, rateAt, hourNow, profileAt, clamp, rand, SOLAR } from '../live.js';

// ---------- Flusso in tempo reale: il grafico scorre, il punto attuale pulsa ----------
class Stream extends FluxElement {
  setup() {
    this.m = metric(this.u, this.attr('metric', 'rate'));
    this.N = 40;
    this.data = Array.from({ length: this.N + 1 }, () => this.m.walk.next());
  }
  render() {
    const m = this.m, id = uid();
    this.W = 640;
    this.H = 200;
    this.innerHTML = `<div class="stream">
      <div class="stream__head"><div><span class="fx-label">${esc(this.attr('label', m.label))}</span><div class="stream__now"><span class="fx-num stream__val"></span> <span class="stream__unit">${m.unit}</span></div></div>
        <div class="stream__stats"><span>media <b class="stream__avg"></b></span><span>picco <b class="stream__max"></b></span></div></div>
      <div class="stream__plot"><svg viewBox="0 0 ${this.W} ${this.H}" class="stream__svg" preserveAspectRatio="none" role="img" aria-label="${esc(m.label)} in tempo reale">
        <defs>
          <linearGradient id="${id}a" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--acc);stop-opacity:.35"></stop><stop offset="1" style="stop-color:var(--acc);stop-opacity:0"></stop></linearGradient>
          <linearGradient id="${id}l" x1="0" x2="1"><stop offset="0" style="stop-color:var(--acc2)"></stop><stop offset="1" style="stop-color:var(--acc)"></stop></linearGradient>
          <clipPath id="${id}c"><rect width="${this.W}" height="${this.H}"></rect></clipPath>
        </defs>
        ${[0.25, 0.5, 0.75].map((k) => `<line x1="0" x2="${this.W}" y1="${this.H * k}" y2="${this.H * k}" class="fx-gridline"></line>`).join('')}
        <g clip-path="url(#${id}c)"><g class="stream__scroll"><path class="stream__area" fill="url(#${id}a)"></path><path class="stream__line" stroke="url(#${id}l)"></path></g></g>
      </svg><span class="stream__dot"></span></div>
    </div>`;
    this.scroll = this.querySelector('.stream__scroll');
    this.draw(false);
  }
  // Scala che segue i dati (con un'ampiezza minima), così le variazioni si vedono.
  y(v) {
    const lo = Math.min(...this.data), hi = Math.max(...this.data);
    const span = Math.max(hi - lo, (this.m.max - this.m.min) * 0.12);
    const mid = (hi + lo) / 2;
    return this.H - ((v - (mid - span * 0.65)) / (span * 1.3)) * this.H;
  }
  tick() {
    this.data.push(this.m.walk.next());
    this.data.shift();
    this.draw(true);
  }
  onEvent() {
    this.m.walk.kick((this.m.max - this.m.min) * 0.3 * (Math.random() > 0.5 ? 1 : -1));
  }
  draw(animate) {
    const step = this.W / (this.N - 1);
    const pts = this.data.map((v, k) => [k * step, this.y(v)]);
    const line = smoothPath(pts);
    this.querySelector('.stream__line').setAttribute('d', line);
    this.querySelector('.stream__area').setAttribute('d', `${line} L${pts[pts.length - 1][0]} ${this.H} L0 ${this.H} Z`);
    const s = this.scroll;
    s.style.transition = 'none';
    s.style.transform = 'translateX(0)';
    if (animate && this.moving) {
      void s.getBoundingClientRect();
      s.style.transition = `transform ${1000 / live.speed}ms linear`;
      s.style.transform = `translateX(${-step}px)`;
    }
    const v = this.data[this.N];
    this.querySelector('.stream__val').textContent = fmt(v, this.m.dec);
    const avg = this.data.reduce((a, b) => a + b, 0) / this.data.length;
    this.querySelector('.stream__avg').textContent = fmt(avg, this.m.dec);
    this.querySelector('.stream__max').textContent = fmt(Math.max(...this.data), this.m.dec);
    const dot = this.querySelector('.stream__dot');
    dot.style.transitionDuration = `${1000 / live.speed}ms`;
    dot.style.top = `${(this.y(v) / this.H) * 100}%`;
  }
}
define('rg-stream', Stream);

// ---------- Orologio dei consumi: 24 barre in cerchio, la lancetta è l'ora attuale ----------
class ConsumptionClock extends FluxElement {
  setup() {
    this.vals = Array.from({ length: 24 }, (_, h) => rateAt(this.u, h + 0.5, 0.08));
  }
  render() {
    const u = this.u, max = u.rate.max;
    const bars = this.vals.map((v, h) => {
      const a = h * 15 + 7.5, len = 14 + (v / max) * 46;
      const [x0, y0] = polar(110, 110, 50, a), [x1, y1] = polar(110, 110, 50 + len, a);
      return `<line x1="${x0.toFixed(1)}" y1="${y0.toFixed(1)}" x2="${x1.toFixed(1)}" y2="${y1.toFixed(1)}" class="clk__bar" data-h="${h}" style="--k:${(v / max).toFixed(2)}"></line>`;
    }).join('');
    const labels = [0, 6, 12, 18].map((h) => { const [x, y] = polar(110, 110, 38, h * 15); return `<text x="${x.toFixed(1)}" y="${(y + 3.5).toFixed(1)}" class="clk__h">${h}</text>`; }).join('');
    const peak = this.vals.indexOf(Math.max(...this.vals));
    this.innerHTML = `<div class="clk">
      <svg viewBox="0 0 220 220" class="clk__svg" role="img" aria-label="Consumi nelle 24 ore, picco alle ${peak}">
        <circle cx="110" cy="110" r="48" class="clk__face"></circle>${bars}${labels}
        <g class="clk__hand"><line x1="110" y1="110" x2="110" y2="20"></line><circle cx="110" cy="20" r="4"></circle></g>
        <circle cx="110" cy="110" r="5" class="clk__hub"></circle>
      </svg>
      <div class="clk__info"><span class="fx-label">Adesso</span><span class="fx-num clk__val"></span><span class="clk__unit">${u.rate.unit}</span>
        <span class="clk__peak">${ms('north_east')} Picco alle ${peak}:00 · ${fmt(this.vals[peak], u.rate.dec)} ${u.rate.unit}</span></div>
    </div>`;
    this.draw();
  }
  tick() {
    const h = Math.floor(hourNow());
    this.vals[h] = clamp(this.vals[h] * rand(0.97, 1.03), this.u.rate.min, this.u.rate.max);
    this.draw();
  }
  draw() {
    const now = hourNow(), h = Math.floor(now);
    this.querySelector('.clk__hand').style.transform = `rotate(${now * 15}deg)`;
    this.querySelectorAll('.clk__bar').forEach((b) => {
      const k = +b.dataset.h;
      b.classList.toggle('is-now', k === h);
      b.classList.toggle('is-future', k > h);
    });
    this.querySelector('.clk__val').textContent = fmt(this.vals[h], this.u.rate.dec);
  }
}
define('rg-clock', ConsumptionClock);

// ---------- Mappa di calore settimanale (7 giorni × 24 ore) ----------
class Heatmap extends FluxElement {
  setup() {
    const dayK = [1.02, 0.98, 1, 1.04, 1.06, 0.9, 0.82];
    this.grid = dayK.map((k) => Array.from({ length: 24 }, (_, h) => clamp(profileAt(this.u, h) * k * rand(0.85, 1.12), 0.05, 1)));
  }
  render() {
    const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    const today = (new Date().getDay() + 6) % 7;
    this.innerHTML = `<div class="heat">
      <div class="heat__grid" role="img" aria-label="Consumi della settimana per ora">
        ${this.grid.map((row, d) => `<span class="heat__day">${days[d]}</span>${row.map((v, h) => `<i data-d="${d}" data-h="${h}" class="${d === today ? 'is-today' : ''}" style="--k:${v.toFixed(2)}"></i>`).join('')}`).join('')}
        <span></span>${Array.from({ length: 24 }, (_, h) => `<span class="heat__hour">${h % 6 === 0 ? h : ''}</span>`).join('')}
      </div>
      <div class="heat__foot"><span class="heat__tip">Passa sopra una cella</span><span class="heat__scale"><span>meno</span><i></i><span>più</span></span></div>
    </div>`;
    this.today = today;
    this.addEventListener('pointerover', (e) => {
      const c = e.target.closest('.heat__grid i');
      if (!c) return;
      const v = this.grid[c.dataset.d][c.dataset.h];
      this.querySelector('.heat__tip').innerHTML = `<b>${days[c.dataset.d]} ore ${c.dataset.h}:00</b> · ${fmt(this.u.rate.min + v * (this.u.rate.max - this.u.rate.min), this.u.rate.dec)} ${this.u.rate.unit}`;
    });
    this.draw();
  }
  tick() {
    const h = Math.floor(hourNow());
    this.grid[this.today][h] = clamp(this.grid[this.today][h] * rand(0.94, 1.06), 0.05, 1);
    this.draw();
  }
  draw() {
    const h = Math.floor(hourNow());
    this.querySelectorAll('.heat__grid i.is-now').forEach((c) => c.classList.remove('is-now'));
    const c = this.querySelector(`[data-d="${this.today}"][data-h="${h}"]`);
    if (c) {
      c.classList.add('is-now');
      c.style.setProperty('--k', this.grid[this.today][h].toFixed(2));
    }
  }
}
define('rg-heatmap', Heatmap);

// ---------- Bilancio a flussi (Sankey) con il flusso che scorre ----------
class Sankey extends FluxElement {
  setup() {
    const s = this.u.sankey;
    this.src = s.src.map(([n, v]) => ({ n, w: walker(v, v * 0.85, v * 1.15, 0.05) }));
    this.dst = s.dst.map(([n, v], k) => ({ n, bad: s.bad.includes(k), w: walker(v, v * 0.8, v * 1.2, 0.05) }));
  }
  render() {
    this.innerHTML = `<div class="sankey"><svg viewBox="0 0 640 260" class="sankey__svg" role="img" aria-label="Bilancio ${esc(this.u.word)}"></svg></div>`;
    this.draw();
  }
  tick(t) {
    if (t % 3) return;
    [...this.src, ...this.dst].forEach((x) => x.w.next());
    this.draw();
  }
  draw() {
    const W = 640, H = 260, gap = 12, nodeW = 14, x0 = 150, x1 = W - 170;
    const st = this.src.reduce((a, b) => a + b.w.value, 0), dt = this.dst.reduce((a, b) => a + b.w.value, 0);
    const layout = (list, total) => {
      const avail = H - gap * (list.length - 1);
      let y = 0;
      return list.map((x) => { const h = (x.w.value / total) * avail; const r = { ...x, y, h, v: (x.w.value / total) * 100 }; y += h + gap; return r; });
    };
    const S = layout(this.src, st), D = layout(this.dst, dt);
    const sOff = S.map((s) => s.y), dOff = D.map((d) => d.y);
    let links = '', flows = '';
    S.forEach((s, i) => D.forEach((d, j) => {
      const share = (s.h * d.h) / ((H - gap * (D.length - 1)) || 1);
      const hS = share, hD = (d.h * s.h) / ((H - gap * (S.length - 1)) || 1);
      const ya = sOff[i], yb = dOff[j];
      sOff[i] += hS;
      dOff[j] += hD;
      const xm = (x0 + nodeW + x1) / 2;
      links += `<path class="sankey__link ${d.bad ? 'is-bad' : ''}" d="M${x0 + nodeW} ${ya} C${xm} ${ya} ${xm} ${yb} ${x1} ${yb} L${x1} ${yb + hD} C${xm} ${yb + hD} ${xm} ${ya + hS} ${x0 + nodeW} ${ya + hS} Z"></path>`;
      flows += `<path class="sankey__flow ${d.bad ? 'is-bad' : ''}" style="stroke-width:${Math.max(1.2, Math.min(3.2, Math.min(hS, hD) * 0.2)).toFixed(1)}px" d="M${x0 + nodeW} ${ya + hS / 2} C${xm} ${ya + hS / 2} ${xm} ${yb + hD / 2} ${x1} ${yb + hD / 2}"></path>`;
    }));
    // Le etichette dei nodi piccoli si spingono in basso per non sovrapporsi.
    const spread = (list) => {
      let prev = -Infinity;
      return list.map((n) => (prev = Math.max(n.y + n.h / 2, prev + 34)));
    };
    const sy = spread(S), dy = spread(D);
    const svg = this.querySelector('svg');
    svg.setAttribute('viewBox', `0 0 640 ${Math.max(H, ...dy.map((y) => y + 22), ...sy.map((y) => y + 22))}`);
    svg.innerHTML = `${links}${flows}
      ${S.map((s, k) => `<rect x="${x0}" y="${s.y}" width="${nodeW}" height="${Math.max(2, s.h)}" rx="4" class="sankey__node"></rect><text x="${x0 - 10}" y="${sy[k] - 4}" class="sankey__label" text-anchor="end">${esc(s.n)}</text><text x="${x0 - 10}" y="${sy[k] + 12}" class="sankey__val fx-num" text-anchor="end">${fmt(s.v, 0)}%</text>`).join('')}
      ${D.map((d, k) => `<rect x="${x1}" y="${d.y}" width="${nodeW}" height="${Math.max(2, d.h)}" rx="4" class="sankey__node ${d.bad ? 'is-bad' : ''}"></rect><text x="${x1 + nodeW + 10}" y="${dy[k] - 3}" class="sankey__label">${esc(d.n)}</text><text x="${x1 + nodeW + 10}" y="${dy[k] + 13}" class="sankey__val fx-num ${d.bad ? 'is-bad' : ''}">${fmt(d.v, 1)}%</text>`).join('')}`;
  }
}
define('rg-sankey', Sankey);

// ---------- Classifica in corsa: le righe si scambiano di posto in tempo reale ----------
class Race extends FluxElement {
  setup() {
    const r = this.u.rate;
    this.rows = this.u.districts.map((n, k) => ({ n, k, w: walker(r.base / 6 * rand(0.6, 1.4), r.base / 12, r.base / 3, 0.09) }));
  }
  render() {
    this.innerHTML = `<div class="race" style="height:${this.rows.length * 44}px">${this.rows.map((r) => `<div class="race__row" data-k="${r.k}"><span class="race__rank fx-num"></span><span class="race__name">${esc(r.n)}</span><span class="race__bar"><i></i></span><span class="race__val fx-num"></span></div>`).join('')}</div>`;
    this.draw();
  }
  tick() {
    this.rows.forEach((r) => r.w.next());
    this.draw();
  }
  onEvent() {
    const r = this.rows[Math.floor(Math.random() * this.rows.length)];
    r.w.kick(this.u.rate.base / 8);
    this.draw();
  }
  draw() {
    const sorted = [...this.rows].sort((a, b) => b.w.value - a.w.value);
    const max = sorted[0].w.value;
    sorted.forEach((r, pos) => {
      const el = this.querySelector(`[data-k="${r.k}"]`);
      el.style.transform = `translateY(${pos * 44}px)`;
      el.classList.toggle('is-first', pos === 0);
      el.querySelector('.race__rank').textContent = pos + 1;
      el.querySelector('.race__bar i').style.width = `${(r.w.value / max) * 100}%`;
      el.querySelector('.race__val').textContent = `${fmt(r.w.value, this.u.rate.dec)} ${this.u.rate.unit}`;
    });
  }
}
define('rg-race', Race);

// ---------- Previsione: passato, futuro e banda di incertezza ----------
class Forecast extends FluxElement {
  setup() {
    const now = hourNow();
    this.now = now;
    const solar = this.u.id === 'power' && this.attr('series') === 'solar';
    this.solar = solar;
    this.pts = Array.from({ length: 25 }, (_, k) => {
      const h = (now - 12 + k + 24) % 24;
      const v = solar ? SOLAR[Math.floor(h)] : profileAt(this.u, h);
      return { h, v: clamp(v * (k <= 12 ? rand(0.92, 1.08) : 1), 0, 1.1), future: k > 12, k };
    });
  }
  render() {
    const W = 640, H = 210, id = uid();
    const x = (k) => (k / 24) * W, y = (v) => H - 24 - v * (H - 50);
    const past = this.pts.filter((p) => !p.future), fut = this.pts.filter((p) => p.k >= 12);
    const band = (s) => fut.map((p) => [x(p.k), y(clamp(p.v * (1 + s * (0.04 + (p.k - 12) * 0.012)), 0, 1.2))]);
    const up = band(1), dn = band(-1).reverse();
    const scale = this.solar ? 'MW di fotovoltaico' : this.u.rate.unit;
    this.innerHTML = `<div class="fc">
      <svg viewBox="0 0 ${W} ${H}" class="fc__svg" role="img" aria-label="Previsione delle prossime 12 ore">
        <defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" style="stop-color:var(--acc);stop-opacity:.28"></stop><stop offset="1" style="stop-color:var(--acc);stop-opacity:0"></stop></linearGradient></defs>
        ${[0.25, 0.5, 0.75].map((k) => `<line x1="0" x2="${W}" y1="${H * k}" y2="${H * k}" class="fx-gridline"></line>`).join('')}
        <path d="${smoothPath(up)} L${dn.map((p) => p.join(' ')).join(' L')} Z" class="fc__band"></path>
        <path d="${smoothPath(past.map((p) => [x(p.k), y(p.v)]))} L${x(12)} ${H - 24} L0 ${H - 24} Z" fill="url(#${id})"></path>
        <path d="${smoothPath(past.map((p) => [x(p.k), y(p.v)]))}" class="fc__past"></path>
        <path d="${smoothPath(fut.map((p) => [x(p.k), y(p.v)]))}" class="fc__future"></path>
        <line x1="${x(12)}" x2="${x(12)}" y1="8" y2="${H - 24}" class="fc__now"></line>
        <circle cx="${x(12)}" cy="${y(this.pts[12].v)}" r="5" class="fc__dot"></circle>
        <text x="${x(12)}" y="18" class="fc__nowlabel" text-anchor="middle">adesso</text>
        ${[0, 6, 12, 18, 24].map((k) => `<text x="${Math.min(W - 16, Math.max(16, x(k)))}" y="${H - 6}" class="fc__h" text-anchor="middle">${String(Math.floor(this.pts[k].h)).padStart(2, '0')}:00</text>`).join('')}
      </svg>
      <div class="fc__legend"><span><i class="fc__l-past"></i>Misurato</span><span><i class="fc__l-fut"></i>Previsto</span><span><i class="fc__l-band"></i>Incertezza</span><span class="fc__scale">${esc(scale)}</span></div>
    </div>`;
  }
}
define('rg-forecast', Forecast);
