// Digital twin: rete viva, mappa isometrica 3D, radar delle anomalie, battito della rete.
import { FluxElement, define, ms, esc, uid, tween } from './base.js';
import { fmt, walker, rand, clamp, live } from '../live.js';

// ---------- Rete viva: nodi e condotte con il flusso che scorre ----------
class Network extends FluxElement {
  setup() {
    const r = this.u.rate;
    this.flows = this.u.net.edges.map(() => walker(rand(0.4, 1), 0.15, 1, 0.12));
    this.nodeVals = this.u.net.nodes.map(() => walker(r.base / 3, r.base / 8, r.base / 1.5, 0.06));
    this.alerts = new Map();
  }
  edgePath([a, b]) {
    const n = this.u.net.nodes, [x0, y0] = [n[a][2] + 62, n[a][3]], [x1, y1] = [n[b][2] - 62, n[b][3]];
    const xm = (x0 + x1) / 2;
    return `M${x0} ${y0} C${xm} ${y0} ${xm} ${y1} ${x1} ${y1}`;
  }
  render() {
    const u = this.u, id = uid();
    const edges = u.net.edges.map((e, k) => {
      const d = this.edgePath(e);
      return `<path d="${d}" class="net__pipe"></path><path d="${d}" class="net__flow" data-e="${k}"></path>
        ${[0, 1].map((p) => `<circle r="3.2" class="net__particle"><animateMotion dur="${2.6 + k * 0.3}s" begin="${-p * 1.3 - k * 0.4}s" repeatCount="indefinite" path="${d}"></animateMotion></circle>`).join('')}`;
    }).join('');
    const nodes = u.net.nodes.map(([name, icon, x, y], k) => `<g class="net__node" data-n="${k}" transform="translate(${x - 62} ${y - 25})">
        <circle class="net__ring" cx="62" cy="25" r="34"></circle>
        <rect width="124" height="50" rx="14" class="net__box"></rect>
        <circle cx="25" cy="25" r="15" class="net__icon-bg"></circle><text x="25" y="33" class="net__icon ms">${icon}</text>
        <text x="47" y="21" class="net__name">${esc(name)}</text><text x="47" y="38" class="net__val fx-num" data-v="${k}"></text></g>`).join('');
    this.innerHTML = `<div class="net"><svg viewBox="0 0 540 320" class="net__svg" role="img" aria-label="Schema della rete ${esc(u.word)}">
      <defs><filter id="${id}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.5"></feGaussianBlur></filter></defs>
      ${edges}${nodes}</svg>
      <div class="net__legend"><span><i class="ok"></i>Regolare</span><span><i class="warn"></i>Attenzione</span><span><i class="bad"></i>Allarme</span><span class="net__total"></span></div></div>`;
    this.draw();
  }
  tick() {
    this.flows.forEach((f) => f.next());
    this.nodeVals.forEach((v) => v.next());
    for (const [k, until] of this.alerts) if (live.tick > until) this.alerts.delete(k);
    this.draw();
  }
  onEvent(e) {
    const k = e.node ?? 1;
    this.alerts.set(k, live.tick + 10);
    const node = this.querySelector(`[data-n="${k}"]`);
    if (node) node.dataset.kind = e.kind;
    this.draw();
  }
  draw() {
    this.querySelectorAll('.net__flow').forEach((p) => {
      const f = this.flows[p.dataset.e].value;
      p.style.setProperty('--dur', `${(2.4 - f * 1.8).toFixed(2)}s`);
      p.style.strokeWidth = (2 + f * 4).toFixed(1);
    });
    this.querySelectorAll('.net__node').forEach((g) => {
      const k = +g.dataset.n;
      g.classList.toggle('is-alert', this.alerts.has(k));
      g.querySelector('.net__val').textContent = `${fmt(this.nodeVals[k].value, this.u.rate.dec)} ${this.u.rate.unit}`;
    });
    const tot = this.nodeVals.slice(3).reduce((a, b) => a + b.value, 0);
    this.querySelector('.net__total').textContent = `Erogato ora ${fmt(tot, this.u.rate.dec)} ${this.u.rate.unit}`;
  }
}
define('rg-network', Network);

// ---------- Mappa isometrica 3D: ogni blocco è una zona, l'altezza è il consumo ----------
class IsoMap extends FluxElement {
  setup() {
    this.N = 5;
    this.cells = Array.from({ length: this.N * this.N }, (_, k) => ({ k, w: walker(rand(0.15, 0.95), 0.08, 1, 0.12), h: 0 }));
    this.cells.forEach((c) => (c.h = c.w.value));
    this.pin = null;
  }
  render() {
    this.innerHTML = `<div class="iso"><svg viewBox="-200 -40 400 300" class="iso__svg" role="img" aria-label="Mappa 3D dei consumi per zona"></svg>
      <div class="iso__tip">Passa sopra un blocco</div></div>`;
    this.svg = this.querySelector('svg');
    this.svg.addEventListener('pointerover', (e) => {
      const g = e.target.closest('[data-k]');
      if (!g) return;
      const c = this.cells[g.dataset.k];
      const names = this.u.districts;
      this.querySelector('.iso__tip').innerHTML = `<b>Zona ${String.fromCharCode(65 + (c.k % this.N))}${Math.floor(c.k / this.N) + 1}${c.k < names.length ? ' · ' + esc(names[c.k]) : ''}</b> · ${fmt(this.u.rate.min / 6 + c.w.value * this.u.rate.max / 5, this.u.rate.dec)} ${this.u.rate.unit}`;
    });
    this.draw();
  }
  tick(t) {
    if (t % 2) return;
    const from = this.cells.map((c) => c.h);
    this.cells.forEach((c) => c.w.next());
    tween(0, 1, 700, (k) => {
      this.cells.forEach((c, n) => (c.h = from[n] + (c.w.value - from[n]) * k));
      this.draw();
    });
  }
  onEvent(e) {
    this.pin = { k: Math.floor(rand(0, this.cells.length)), kind: e.kind, until: live.tick + 10 };
    this.draw();
  }
  draw() {
    const s = 28, N = this.N, iso = (x, y, z) => [((x - y) * s * 0.866).toFixed(1), ((x + y) * s * 0.5 - z).toFixed(1)];
    const order = [...this.cells].sort((a, b) => (a.k % N) + Math.floor(a.k / N) - ((b.k % N) + Math.floor(b.k / N)));
    if (this.pin && live.tick > this.pin.until) this.pin = null;
    let out = `<polygon points="${[iso(0, 0, 0), iso(N, 0, 0), iso(N, N, 0), iso(0, N, 0)].map((p) => p.join(',')).join(' ')}" class="iso__ground"></polygon>`;
    order.forEach((c) => {
      const x = c.k % N, y = Math.floor(c.k / N), z = 6 + c.h * 90, g = 0.12;
      const pct = Math.round(25 + c.h * 75);
      const P = (a, b, h) => iso(x + a, y + b, h).join(',');
      const top = [P(g, g, z), P(1 - g, g, z), P(1 - g, 1 - g, z), P(g, 1 - g, z)];
      const left = [P(g, 1 - g, z), P(1 - g, 1 - g, z), P(1 - g, 1 - g, 0), P(g, 1 - g, 0)];
      const right = [P(1 - g, g, z), P(1 - g, 1 - g, z), P(1 - g, 1 - g, 0), P(1 - g, g, 0)];
      const isPin = this.pin?.k === c.k;
      out += `<g data-k="${c.k}" class="iso__blk ${isPin ? 'is-alert is-' + this.pin.kind : ''}" style="--p:${pct}%">
        <polygon points="${left.join(' ')}" class="iso__l"></polygon><polygon points="${right.join(' ')}" class="iso__r"></polygon><polygon points="${top.join(' ')}" class="iso__t"></polygon></g>`;
      if (isPin) {
        const [px, py] = iso(x + 0.5, y + 0.5, z + 8);
        out += `<g transform="translate(${px} ${py})"><g class="iso__pin is-${this.pin.kind}"><path d="M0 0 C-10 -14 -12 -20 -12 -26 A12 12 0 1 1 12 -26 C12 -20 10 -14 0 0 Z"></path><text y="-21" class="ms iso__pin-ic">priority_high</text></g></g>`;
      }
    });
    this.svg.innerHTML = out;
  }
}
define('rg-iso-map', IsoMap);

// ---------- Radar delle anomalie: il fascio gira, i punti si accendono al passaggio ----------
class Radar extends FluxElement {
  setup() {
    const u = this.u;
    this.angle = 0;
    this.blips = u.events.slice(0, 3).map((e, k) => ({ ...e, a: 40 + k * 110, d: rand(0.3, 0.85), id: k }));
  }
  render() {
    this.innerHTML = `<div class="radar">
      <div class="radar__scope" role="img" aria-label="Radar delle anomalie">
        <div class="radar__grid"></div><div class="radar__sweep"></div><div class="radar__blips"></div><span class="radar__center"></span>
      </div>
      <ul class="radar__list"></ul>
    </div>`;
    this.sweep = this.querySelector('.radar__sweep');
    this.drawBlips();
  }
  onEvent(e) {
    this.blips.unshift({ ...e, a: rand(0, 360), d: rand(0.25, 0.9), id: e.id, fresh: true });
    this.blips = this.blips.slice(0, 6);
    this.drawBlips();
  }
  drawBlips() {
    this.querySelector('.radar__blips').innerHTML = this.blips.map((b) => {
      const r = (b.a - 90) * (Math.PI / 180);
      return `<span class="radar__blip is-${b.kind} ${b.fresh ? 'is-fresh' : ''}" data-id="${b.id}" style="left:${50 + Math.cos(r) * b.d * 46}%;top:${50 + Math.sin(r) * b.d * 46}%"></span>`;
    }).join('');
    this.querySelector('.radar__list').innerHTML = this.blips.slice(0, 4).map((b) => `<li class="is-${b.kind}"><i></i><div><b>${esc(b.title)}</b><span>${esc(b.text)}</span></div><span class="fx-num">${fmt(b.d * 4.2, 1)} km</span></li>`).join('');
    this.blipEls = [...this.querySelectorAll('.radar__blip')];
  }
  frame(dt) {
    this.angle = (this.angle + dt * 90) % 360;
    this.sweep.style.transform = `rotate(${this.angle}deg)`;
    this.blipEls?.forEach((el, k) => {
      const b = this.blips[k];
      const diff = (this.angle - b.a + 360) % 360;
      el.style.opacity = (0.15 + 0.85 * Math.max(0, 1 - diff / 200)).toFixed(2);
    });
  }
}
define('rg-radar', Radar);

// ---------- Battito della rete: un monitor che disegna i transitori ----------
class Pulse extends FluxElement {
  setup() {
    this.N = 140;
    this.buf = new Array(this.N).fill(0);
    this.head = 0;
    this.acc = 0;
    this.phase = 0;
    this.spike = 0;
    this.beats = 0;
    this.bpm = { water: 'Transitori di pressione', gas: 'Oscillazioni di pressione', power: 'Disturbi di tensione' }[this.u.id];
  }
  render() {
    this.innerHTML = `<div class="pulse">
      <div class="pulse__head"><span class="fx-label">${esc(this.attr('label', this.bpm))}</span><span class="pulse__rate"><span class="ms">monitor_heart</span><b class="fx-num">0</b>/min</span></div>
      <div class="pulse__plot"><svg viewBox="0 0 ${this.N} 60" preserveAspectRatio="none" class="pulse__svg" role="img" aria-label="${esc(this.bpm)}">
        <polyline class="pulse__line pulse__a"></polyline><polyline class="pulse__line pulse__b"></polyline>
      </svg><span class="pulse__head-dot"></span></div>
      <div class="pulse__foot"><span>Ultimo evento <b class="pulse__last">—</b></span><span class="pulse__state">Stabile</span></div>
    </div>`;
  }
  onEvent(e) {
    this.spike = 1;
    this.querySelector('.pulse__last').textContent = e.title;
    const st = this.querySelector('.pulse__state');
    st.textContent = 'Anomalia';
    st.className = 'pulse__state is-bad';
    this.querySelector('.pulse').classList.add('is-alarm');
    setTimeout(() => {
      st.textContent = 'Stabile';
      st.className = 'pulse__state';
      this.querySelector('.pulse')?.classList.remove('is-alarm');
    }, 4000);
  }
  frame(dt) {
    if (!dt) return;
    this.acc += dt;
    let changed = false;
    while (this.acc > 0.04) {
      this.acc -= 0.04;
      this.phase = (this.phase + 1) % 22;
      const shape = [0, 0.08, -0.12, 0.9, -0.45, 0.18, 0.06][this.phase] ?? 0;
      if (this.phase === 3) this.beats++;
      const big = this.spike > 0 ? Math.sin(this.spike * 9) * this.spike * 1.6 : 0;
      this.spike = Math.max(0, this.spike - 0.03);
      this.buf[this.head] = shape + big + (Math.random() - 0.5) * 0.06;
      this.head = (this.head + 1) % this.N;
      changed = true;
    }
    if (!changed) return;
    const y = (v) => (32 - clamp(v, -1.2, 1.6) * 22).toFixed(1);
    const a = [], b = [];
    for (let i = 0; i < this.N; i++) {
      if (i < this.head) a.push(`${i},${y(this.buf[i])}`);
      else if (i > this.head + 6) b.push(`${i},${y(this.buf[i])}`);
    }
    this.querySelector('.pulse__a').setAttribute('points', a.join(' '));
    this.querySelector('.pulse__b').setAttribute('points', b.join(' '));
    const dot = this.querySelector('.pulse__head-dot');
    dot.style.left = `${(this.head / this.N) * 100}%`;
    dot.style.top = `${(y(this.buf[(this.head - 1 + this.N) % this.N]) / 60) * 100}%`;
    this._sec = (this._sec || 0) + dt;
    if (this._sec > 3) {
      this.querySelector('.pulse__rate b').textContent = Math.round((this.beats / this._sec) * 60 * 0.2);
      this._sec = 0;
      this.beats = 0;
    }
  }
}
define('rg-pulse', Pulse);
