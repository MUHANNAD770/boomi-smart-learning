/* /src/games/engine.js — محرك ألعاب 2D خفيف خاص بالمنصة (Canvas، بلا مكتبات خارجية، يعمل على الجوال والكمبيوتر) */
(() => {
  'use strict';
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const calm = () => {
    try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; }
  };

  /* ── الأصوات (مولّدة بالمتصفح) ── */
  const SFX = (() => {
    let ac = null;
    const ctx = () => {
      if (!ac) {
        try { ac = new (window.AudioContext || window.webkitAudioContext)(); } catch (_) {}
      }
      if (ac && ac.state !== 'running') try { ac.resume(); } catch (_) {}
      return ac;
    };
    const on = () => !(window.P && P.sfx === 0);
    const vol = () => 0.22 * (window.P && P.vol != null ? +P.vol : 1);
    function tone(f0, f1, d, type = 'sine', g0 = 1, delay = 0) {
      const c = ctx();
      if (!c || !on()) return;
      const t = c.currentTime + delay, o = c.createOscillator(), g = c.createGain();
      o.type = type;
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(Math.max(30, f1), t + d);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol() * g0, t + 0.015);
      g.gain.exponentialRampToValueAtTime(0.0001, t + d);
      o.connect(g);
      g.connect(c.destination);
      o.start(t);
      o.stop(t + d + 0.02);
    }
    return {
      jump: () => tone(320, 720, 0.16, 'triangle', 0.8),
      coin: () => { tone(988, 988, 0.08, 'square', 0.35); tone(1319, 1319, 0.16, 'square', 0.35, 0.07); },
      star: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, f, 0.12, 'triangle', 0.6, i * 0.06)),
      win: () => [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, f * 1.01, 0.22, 'triangle', 0.7, i * 0.11)),
      bad: () => tone(220, 140, 0.25, 'sawtooth', 0.35),
      pop: () => tone(600, 300, 0.08, 'sine', 0.6),
      door: () => { tone(200, 400, 0.3, 'triangle', 0.5); tone(400, 800, 0.3, 'triangle', 0.4, 0.15); },
      flap: () => tone(180, 120, 0.07, 'sine', 0.25),
      unlock: ctx
    };
  })();

  /* ── بومي كصورة ── */
  const Owl = (() => {
    const cache = {};
    let ready = null;
    function variant(name) {
      const src = document.querySelector('#mc .ow');
      if (!src) return Promise.resolve(null);
      const d = new DOMParser().parseFromString(src.outerHTML.replace(/onclick="[^"]*"/, ''), 'image/svg+xml');
      const sv = d.documentElement;
      sv.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
      sv.setAttribute('width', '240');
      sv.setAttribute('height', '260');
      sv.removeAttribute('class');
      ['.sp', '.glow', '.ft'].forEach(s => sv.querySelectorAll(s).forEach(e => e.remove()));
      const lid = sv.querySelector('.lid'), wl = sv.querySelector('.wl'), wr = sv.querySelector('.wr');
      const pl = sv.querySelector('#pl'), bl = sv.querySelector('.brow .bl'), br = sv.querySelector('.brow .br');
      if (lid) lid.setAttribute('style', name === 'blink' ? '' : 'display:none');
      if (name === 'flap') { wl && wl.setAttribute('transform', 'rotate(-55 33 86)'); wr && wr.setAttribute('transform', 'rotate(25 87 86)'); }
      if (name === 'happy') { wl && wl.setAttribute('transform', 'rotate(-40 33 86)'); bl && bl.setAttribute('transform', 'translate(0 -3)'); br && br.setAttribute('transform', 'translate(0 -3)'); }
      if (name === 'sad') { bl && bl.setAttribute('transform', 'rotate(14 42 33) translate(0 2)'); br && br.setAttribute('transform', 'rotate(-14 78 33) translate(0 2)'); pl && pl.setAttribute('transform', 'translate(0 2)'); }
      if (name === 'look') { pl && pl.setAttribute('transform', 'translate(3 0)'); }
      return new Promise(ok => {
        const im = new Image();
        im.onload = () => ok(im);
        im.onerror = () => ok(null);
        im.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(sv));
      });
    }
    function load() {
      if (ready) return ready;
      ready = Promise.all(['base', 'blink', 'flap', 'happy', 'sad', 'look'].map(n => variant(n).then(im => { cache[n] = im; }))).then(() => cache);
      return ready;
    }
    return { load, get: n => cache[n] || cache.base };
  })();

  /* ── الخلفيات (Parallax) ── */
  const THEMES = {
    forest: { sky: ['#8fd3ff', '#d9f1ff'], sun: '#ffe27a', far: '#9fd39a', mid: '#6fbf73', near: '#3f9a52', ground: ['#7ccf5a', '#8a5a33'], deco: 'tree' },
    desert: { sky: ['#ffc58a', '#ffeec9'], sun: '#fff3a0', far: '#f3c98a', mid: '#e6ad63', near: '#cf8f45', ground: ['#f2c46b', '#b97a3c'], deco: 'cactus' },
    snow: { sky: ['#a8d8ff', '#eef8ff'], sun: '#fffbe0', far: '#dfeefa', mid: '#c3dcf2', near: '#9ec3e6', ground: ['#ffffff', '#8fb3d9'], deco: 'pine' },
    night: { sky: ['#1b2266', '#4b3a8f'], sun: '#fff6c8', far: '#2d3584', mid: '#273077', near: '#1d2563', ground: ['#4b6fd6', '#2a2f6a'], deco: 'tree', stars: 1 },
    sea: { sky: ['#7fd0ff', '#d8f4ff'], sun: '#ffe27a', far: '#7ec8e3', mid: '#4fb0d6', near: '#2a8fc0', ground: ['#ffe1a1', '#d39a52'], deco: 'palm' },
    space: { sky: ['#0d1240', '#3a1f72'], sun: '#ffd6f5', far: '#28307a', mid: '#232a6b', near: '#1b2159', ground: ['#8a7cff', '#40338f'], deco: 'crystal', stars: 1 }
  };

  function hills(g, w, h, base, amp, color, off, seed) {
    g.fillStyle = color;
    g.beginPath();
    g.moveTo(0, h);
    for (let x = 0; x <= w + 40; x += 40) {
      const X = x - ((off % 40) + 40) % 40, k = (x + Math.floor(off / 40) * 40) / 40 + seed;
      g.lineTo(X, base - amp * (0.55 + 0.45 * Math.sin(k * 0.9) + 0.25 * Math.sin(k * 2.3)));
    }
    g.lineTo(w, h);
    g.closePath();
    g.fill();
  }

  function deco(g, kind, x, y, s, th) {
    g.save();
    g.translate(x, y);
    g.scale(s, s);
    if (kind === 'tree') {
      g.fillStyle = '#7a4a24'; g.fillRect(-5, -40, 10, 40);
      g.fillStyle = th.near; g.beginPath(); g.arc(0, -50, 22, 0, TAU); g.arc(-16, -38, 15, 0, TAU); g.arc(16, -38, 15, 0, TAU); g.fill();
    } else if (kind === 'pine') {
      g.fillStyle = '#6b4a2a'; g.fillRect(-4, -14, 8, 14);
      g.fillStyle = '#5f9ec7';
      for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(0, -62 + i * 16); g.lineTo(-20 + i * -3, -20 + i * 6); g.lineTo(20 + i * 3, -20 + i * 6); g.fill(); }
      g.fillStyle = '#fff'; g.beginPath(); g.moveTo(0, -62); g.lineTo(-8, -46); g.lineTo(8, -46); g.fill();
    } else if (kind === 'cactus') {
      g.fillStyle = '#4fa05a'; g.fillRect(-6, -46, 12, 46); g.fillRect(-20, -30, 8, 16); g.fillRect(12, -36, 8, 18); g.fillRect(-20, -18, 20, 6); g.fillRect(6, -22, 14, 6);
    } else if (kind === 'palm') {
      g.strokeStyle = '#8a5a33'; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(8, -30, 2, -60); g.stroke();
      g.fillStyle = '#39a36a';
      for (let i = 0; i < 5; i++) { g.save(); g.translate(2, -60); g.rotate(-1.4 + i * 0.7); g.beginPath(); g.ellipse(18, 0, 20, 6, 0, 0, TAU); g.fill(); g.restore(); }
    } else if (kind === 'crystal') {
      g.fillStyle = '#b9a6ff'; g.beginPath(); g.moveTo(0, -50); g.lineTo(12, -16); g.lineTo(0, 0); g.lineTo(-12, -16); g.fill();
      g.fillStyle = 'rgba(255,255,255,.5)'; g.beginPath(); g.moveTo(0, -50); g.lineTo(4, -16); g.lineTo(0, 0); g.fill();
    }
    g.restore();
  }

  function background(g, W, H, cam, th, t) {
    const sk = g.createLinearGradient(0, 0, 0, H);
    sk.addColorStop(0, th.sky[0]); sk.addColorStop(1, th.sky[1]);
    g.fillStyle = sk; g.fillRect(0, 0, W, H);
    if (th.stars) {
      g.fillStyle = 'rgba(255,255,255,.85)';
      for (let i = 0; i < 40; i++) {
        const x = (i * 97.3 - cam * 0.05) % W, y = (i * 53.7) % (H * 0.55);
        g.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(t * 1.5 + i));
        g.fillRect((x + W) % W, y, 2, 2);
      }
      g.globalAlpha = 1;
    }
    g.fillStyle = th.sun; g.beginPath(); g.arc(W * 0.82 - cam * 0.02, H * 0.18, 28, 0, TAU); g.fill();
    g.globalAlpha = 0.25; g.beginPath(); g.arc(W * 0.82 - cam * 0.02, H * 0.18, 42, 0, TAU); g.fill(); g.globalAlpha = 1;
    if (!th.stars) {
      g.fillStyle = 'rgba(255,255,255,.9)';
      for (let i = 0; i < 4; i++) {
        const x = ((i * 260 - cam * 0.15 - t * 8) % (W + 200) + W + 200) % (W + 200) - 100, y = 40 + (i * 22) % 70;
        g.beginPath(); g.arc(x, y, 18, 0, TAU); g.arc(x + 20, y - 8, 22, 0, TAU); g.arc(x + 42, y, 16, 0, TAU); g.fill();
      }
    }
    hills(g, W, H, H * 0.62, 60, th.far, cam * 0.2, 1);
    hills(g, W, H, H * 0.72, 45, th.mid, cam * 0.4, 7);
    for (let i = -1; i < 8; i++) {
      const sp = 180, x = i * sp - ((cam * 0.6) % sp);
      deco(g, th.deco, x + ((i * 37) % 60), H * 0.8, 0.9, th);
    }
    hills(g, W, H, H * 0.86, 22, th.near, cam * 0.75, 13);
  }

  /* ── الجسيمات ── */
  class Particles {
    constructor() { this.a = []; }
    burst(x, y, n, kind, color) {
      if (calm()) n = Math.min(n, 4);
      for (let i = 0; i < n; i++) {
        const an = rnd(0, TAU), sp = rnd(60, 220);
        this.a.push({ x, y, vx: Math.cos(an) * sp, vy: Math.sin(an) * sp - 80, life: rnd(0.5, 0.9), t: 0, kind, color: color || ['#ffd24a', '#fff', '#ffb300', '#7fe3ff'][i % 4], s: rnd(3, 7), r: rnd(0, TAU) });
      }
    }
    dust(x, y) {
      for (let i = 0; i < 5; i++) this.a.push({ x: x + rnd(-8, 8), y, vx: rnd(-40, 40), vy: rnd(-60, -20), life: 0.4, t: 0, kind: 'dust', color: 'rgba(255,255,255,.8)', s: rnd(3, 6), r: 0 });
    }
    step(dt) {
      for (const p of this.a) { p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; p.r += dt * 6; }
      this.a = this.a.filter(p => p.t < p.life);
    }
    draw(g) {
      for (const p of this.a) {
        const k = 1 - p.t / p.life;
        g.globalAlpha = k; g.fillStyle = p.color;
        if (p.kind === 'star') { g.save(); g.translate(p.x, p.y); g.rotate(p.r); starPath(g, 0, 0, p.s * 1.4, p.s * 0.6); g.fill(); g.restore(); }
        else { g.beginPath(); g.arc(p.x, p.y, p.s * (p.kind === 'dust' ? 1 + (1 - k) : k), 0, TAU); g.fill(); }
      }
      g.globalAlpha = 1;
    }
  }

  function starPath(g, x, y, R, r) {
    g.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = -Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r : R;
      g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    g.closePath();
  }

  function rr(g, x, y, w, h, r) {
    g.beginPath();
    g.moveTo(x + r, y);
    g.arcTo(x + w, y, x + w, y + h, r);
    g.arcTo(x + w, y + h, x, y + h, r);
    g.arcTo(x, y + h, x, y, r);
    g.arcTo(x, y, x + w, y, r);
    g.closePath();
  }

  function shade(hex, k) {
    const n = parseInt(hex.slice(1), 16);
    const r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const f = v => clamp(Math.round(k < 0 ? v * (1 + k) : v + (255 - v) * k), 0, 255);
    return '#' + [f(r), f(g), f(b)].map(v => v.toString(16).padStart(2, '0')).join('');
  }

  const Art = {
    coin(g, x, y, t) {
      const w = Math.abs(Math.cos(t * 3)) * 10 + 2;
      const gr = g.createLinearGradient(x - 10, y - 10, x + 10, y + 10);
      gr.addColorStop(0, '#fff3a0'); gr.addColorStop(1, '#f0a800');
      g.fillStyle = gr; g.strokeStyle = '#c77d00'; g.lineWidth = 2;
      g.beginPath(); g.ellipse(x, y, w, 12, 0, 0, TAU); g.fill(); g.stroke();
    },
    star(g, x, y, t, s = 16) {
      g.save();
      g.translate(x, y + Math.sin(t * 3) * 3);
      g.rotate(Math.sin(t * 2) * 0.15);
      const gr = g.createRadialGradient(0, -4, 2, 0, 0, s);
      gr.addColorStop(0, '#fff7b0'); gr.addColorStop(1, '#ffb300');
      g.fillStyle = gr; starPath(g, 0, 0, s, s * 0.48); g.fill();
      g.strokeStyle = '#e08a00'; g.lineWidth = 2; g.stroke();
      g.fillStyle = '#5a3600'; g.beginPath(); g.arc(-4, -2, 1.6, 0, TAU); g.arc(4, -2, 1.6, 0, TAU); g.fill();
      g.restore();
    },
    bubble(g, x, y, r, txt, col, t, font) {
      g.save();
      g.translate(x, y + Math.sin(t * 2 + x * 0.01) * 2);
      const gr = g.createRadialGradient(-r * 0.3, -r * 0.3, r * 0.1, 0, 0, r);
      gr.addColorStop(0, '#fff'); gr.addColorStop(0.35, col || '#cfe3ff'); gr.addColorStop(1, col ? shade(col, -0.25) : '#7aa5ff');
      g.fillStyle = gr; g.beginPath(); g.arc(0, 0, r, 0, TAU); g.fill();
      g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 2.5; g.stroke();
      g.fillStyle = 'rgba(255,255,255,.75)'; g.beginPath(); g.ellipse(-r * 0.38, -r * 0.42, r * 0.22, r * 0.12, -0.6, 0, TAU); g.fill();
      g.fillStyle = '#1c2c86';
      g.font = font || `900 ${Math.round(r * 1.05)}px "Baloo Bhaijaan 2",Tahoma,sans-serif`;
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(txt, 0, r * 0.06);
      g.restore();
    },
    platform(g, x, y, w, h, th) {
      const gr = g.createLinearGradient(0, y, 0, y + h);
      gr.addColorStop(0, th.ground[1]); gr.addColorStop(1, shade(th.ground[1], -0.3));
      g.fillStyle = gr; rr(g, x, y, w, h, 10); g.fill();
      g.fillStyle = th.ground[0]; rr(g, x - 2, y - 4, w + 4, 14, 8); g.fill();
      g.fillStyle = 'rgba(255,255,255,.25)'; rr(g, x + 6, y - 2, w - 12, 4, 2); g.fill();
      g.fillStyle = 'rgba(0,0,0,.08)';
      for (let i = x + 14; i < x + w - 10; i += 28) { g.beginPath(); g.arc(i, y + h * 0.6, 3, 0, TAU); g.fill(); }
    },
    door(g, x, y, open, t) {
      g.save(); g.translate(x, y);
      g.fillStyle = '#6b3f1d'; rr(g, -26, -78, 52, 78, 22); g.fill();
      g.fillStyle = open ? '#ffe9a8' : '#a0662e'; rr(g, -20, -72, 40, 72, 18); g.fill();
      if (!open) { g.fillStyle = '#f7b500'; g.beginPath(); g.arc(10, -34, 4, 0, TAU); g.fill(); g.font = '900 22px Tahoma'; g.textAlign = 'center'; g.fillText('🔒', 0, -46); }
      else { g.globalAlpha = 0.5 + 0.3 * Math.sin(t * 4); g.fillStyle = '#fff'; rr(g, -16, -68, 32, 64, 14); g.fill(); g.globalAlpha = 1; }
      g.restore();
    },
    flag(g, x, y, t) {
      g.fillStyle = '#ddd'; g.fillRect(x - 2, y - 90, 4, 90);
      g.fillStyle = '#f7b500'; g.beginPath(); g.moveTo(x + 2, y - 88);
      for (let i = 0; i <= 10; i++) g.lineTo(x + 2 + i * 4, y - 88 + Math.sin(t * 6 + i * 0.6) * 3 + (i === 10 ? 16 : 0));
      g.lineTo(x + 2, y - 60); g.fill();
      g.font = '900 14px Tahoma'; g.fillStyle = '#1c2c86'; g.fillText('★', x + 14, y - 72);
    },
    spike(g, x, y, w) {
      g.fillStyle = '#9aa3b5';
      for (let i = 0; i < w; i += 14) { g.beginPath(); g.moveTo(x + i, y); g.lineTo(x + i + 7, y - 16); g.lineTo(x + i + 14, y); g.fill(); }
    },
    snail(g, x, y, dir, t) {
      g.save(); g.translate(x, y); g.scale(dir, 1);
      g.fillStyle = '#9ad35b'; g.beginPath(); g.ellipse(0, -6, 18, 7, 0, 0, TAU); g.fill();
      g.fillStyle = '#e56b9b'; g.beginPath(); g.arc(-2, -16, 12, 0, TAU); g.fill();
      g.strokeStyle = '#b84677'; g.lineWidth = 2; g.beginPath(); g.arc(-2, -16, 6, 0, TAU * 0.8); g.stroke();
      g.strokeStyle = '#6aa83a'; g.beginPath(); g.moveTo(14, -10); g.lineTo(18 + Math.sin(t * 5) * 2, -22); g.moveTo(10, -10); g.lineTo(12, -22); g.stroke();
      g.fillStyle = '#222'; g.beginPath(); g.arc(18 + Math.sin(t * 5) * 2, -23, 2, 0, TAU); g.fill();
      g.restore();
    },
    heart(g, x, y, s, full) {
      g.save(); g.translate(x, y); g.scale(s, s);
      g.fillStyle = full ? '#ff4d6d' : 'rgba(255,255,255,.4)';
      g.beginPath(); g.moveTo(0, 4); g.bezierCurveTo(-10, -4, -6, -12, 0, -6); g.bezierCurveTo(6, -12, 10, -4, 0, 4); g.fill();
      g.restore();
    }
  };

  function drawOwl(g, o, t) {
    const blink = (t % 3.6) > 3.45;
    let v = 'base';
    if (o.mood === 'happy') v = 'happy';
    else if (o.mood === 'sad') v = 'sad';
    else if (!o.ground && (o.vy < 0 || o.glide)) v = 'flap';
    else if (blink) v = 'blink';
    const im = Owl.get(v), W = o.w * 1.55, Hh = W * 1.083;
    g.save();
    g.translate(o.x, o.y);
    const run = o.ground && Math.abs(o.vx) > 20, ph = t * (Math.abs(o.vx) > 260 ? 18 : 12);
    if (o.ground) {
      const a = run ? Math.sin(ph) * 6 : 0;
      g.fillStyle = '#f6a019'; g.strokeStyle = '#c97806'; g.lineWidth = 1.2;
      [[-8, a], [8, -a]].forEach(([fx, fy]) => {
        g.beginPath(); g.ellipse(fx + fy * 0.4, -2 + (run ? -Math.abs(fy) * 0.3 : 0), 7, 3.5, 0, 0, TAU); g.fill(); g.stroke();
      });
    }
    const sq = o.squash || 0, bob = run ? Math.abs(Math.sin(ph)) * -3 : Math.sin(t * 2) * 1.2;
    const tilt = clamp(o.vx / 900, -0.15, 0.15) + (o.glide ? Math.sin(t * 14) * 0.04 : 0);
    g.translate(0, -4 + bob); g.rotate(tilt * o.dir);
    if (o.spin > 0) { g.translate(0, -Hh / 2); g.rotate((1 - o.spin) * TAU * o.dir); g.translate(0, Hh / 2); }
    g.scale(o.dir * (1 + sq * 0.12), 1 - sq * 0.12);
    if (im) g.drawImage(im, -W / 2, -Hh, W, Hh);
    else { g.fillStyle = '#a4622d'; g.beginPath(); g.arc(0, -W / 2, W / 2, 0, TAU); g.fill(); }
    g.restore();
  }

  class Platformer {
    constructor(host, opt) {
      this.opt = opt; this.host = host; this.th = THEMES[opt.theme] || THEMES.forest;
      this.parts = new Particles(); this.t = 0; this.keys = {};
      this.dead = false; this.won = false; this.hearts = 3; this.coins = 0; this.stars = 0; this.shake = 0; this.paused = false;
      host.innerHTML = '<div class=g2-stage><canvas></canvas><div class=g2-hud></div><div class=g2-ctl><button class="g2-b l" aria-label="يسار">◀</button><button class="g2-b r" aria-label="يمين">▶</button><button class="g2-b j" aria-label="قفز">⤴</button></div></div>';
      this.cv = host.querySelector('canvas'); this.g = this.cv.getContext('2d'); this.hud = host.querySelector('.g2-hud');
      this.build(); this.bind(); this.resize();
      this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(host);
      this.last = performance.now(); this.loop = this.loop.bind(this); this.raf = requestAnimationFrame(this.loop);
      Owl.load();
    }
    resize() {
      const r = this.host.getBoundingClientRect(), dpr = Math.min(2, devicePixelRatio || 1), w = Math.max(260, r.width);
      const h = Math.round(Math.max(240, Math.min(w * (w < 600 ? 0.82 : 0.56), innerHeight * 0.62, 560)));
      this.cv.style.width = '100%'; this.cv.style.height = h + 'px';
      this.cv.width = Math.round(w * dpr); this.cv.height = Math.round(h * dpr);
      this.H = 360; this.W = w / (h / 360); this.scale = dpr * h / 360;
    }
    build() {
      const o = this.opt, L = this.lv = o.level || 1;
      let s = (o.seed || 1) * 9301 + L * 49297;
      const R = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
      const G = 320, P = [], C = [], E = [], SP = [], ST = [], LT = [];
      let x = 0; P.push({ x: -200, y: G, w: 520, h: 80 }); x = 320;
      const len = 1800 + L * 450;
      while (x < len) {
        const gap = R() < 0.35 + L * 0.03 ? rnd(70, 90 + L * 6) : 0;
        x += gap;
        const w = rnd(220, 420);
        P.push({ x, y: G, w, h: 80 });
        if (R() < 0.55) {
          const px = x + rnd(30, w - 150), py = G - rnd(80, 120) - (R() < 0.35 ? 50 : 0);
          P.push({ x: px, y: py, w: rnd(110, 170), h: 22, f: 1 });
          for (let i = 0; i < 3; i++) C.push({ x: px + 30 + i * 30, y: py - 30, t: 'coin' });
        } else {
          for (let i = 0; i < 4; i++) C.push({ x: x + 40 + i * 34, y: G - 34 - Math.sin(i / 3 * Math.PI) * 40, t: 'coin' });
        }
        if (L > 1 && R() < 0.4 + L * 0.04 && w > 260) {
          if (R() < 0.5) E.push({ x: x + w * 0.6, y: G, dir: -1, min: x + 30, max: x + w - 30, sp: 40 + L * 8 });
          else SP.push({ x: x + w * 0.5, y: G, w: 28 });
        }
        x += w;
      }
      const end = x; P.push({ x: end, y: G, w: 600, h: 80 });
      for (let i = 1; i <= 3; i++) {
        const tx = end * i / 4;
        const p = P.filter(q => q.f && Math.abs(q.x - tx) < 500)[0];
        ST.push(p ? { x: p.x + p.w / 2, y: p.y - 60 } : { x: tx, y: G - 130 });
      }
      this.P = P; this.C = C; this.E = E; this.SP = SP; this.ST = ST; this.LT = LT; this.end = end;
      this.door = { x: end + 120, open: !(o.gate || o.letters) };
      this.flagX = end + 380;
      if (o.letters) {
        const word = o.letters, step = (end - 500) / (word.length + 1);
        word.forEach((ch, i) => {
          const lx = 500 + step * (i + 1) + rnd(-60, 60), p = P.find(q => q.x <= lx && q.x + q.w >= lx && !q.f) || P[1];
          LT.push({ x: lx, y: (p ? p.y : G) - 70 - (R() < 0.4 ? 50 : 0), ch, need: i, got: false });
        });
        (o.decoys || []).forEach(ch => {
          const lx = 420 + rnd(0, end - 600);
          LT.push({ x: lx, y: G - 70 - rnd(0, 60), ch, need: -1, got: false });
        });
      }
      this.pl = { x: 60, y: G, vx: 0, vy: 0, w: 48, h: 56, dir: 1, ground: true, coy: 0, jb: 0, dj: 0, inv: 0, glide: false, mood: '', squash: 0 };
      this.cam = 0;
    }
    bind() {
      const k = this.keys, set = (c, v) => { k[c] = v; };
      this.kd = e => {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', ' ', 'a', 'd', 'w'].includes(e.key)) {
          e.preventDefault();
          set(e.key, true);
          if (['ArrowUp', ' ', 'w'].includes(e.key) && !e.repeat) this.pl.jb = 0.15;
        }
      };
      this.ku = e => set(e.key, false);
      addEventListener('keydown', this.kd);
      addEventListener('keyup', this.ku);
      const hold = (sel, c) => {
        const b = this.host.querySelector(sel);
        const dn = e => { e.preventDefault(); set(c, true); if (c === 'J') this.pl.jb = 0.15; SFX.unlock(); b.classList.add('on'); };
        const up = () => { set(c, false); b.classList.remove('on'); };
        b.addEventListener('pointerdown', dn); b.addEventListener('pointerup', up); b.addEventListener('pointercancel', up); b.addEventListener('pointerleave', up);
      };
      hold('.g2-b.l', 'L'); hold('.g2-b.r', 'R'); hold('.g2-b.j', 'J');
    }
    destroy() {
      cancelAnimationFrame(this.raf);
      removeEventListener('keydown', this.kd);
      removeEventListener('keyup', this.ku);
      try { this.ro.disconnect(); } catch (_) {}
      this.dead = true;
    }
    loop(now) {
      if (this.dead) return;
      const dt = Math.min(0.033, (now - this.last) / 1000);
      this.last = now;
      if (!this.paused) this.update(dt);
      this.draw();
      this.raf = requestAnimationFrame(this.loop);
    }
    update(dt) {
      const p = this.pl, k = this.keys; this.t += dt;
      const L = k.ArrowLeft || k.a || k.L, Rt = k.ArrowRight || k.d || k.R, J = k.ArrowUp || k[' '] || k.w || k.J;
      if (L || Rt) {
        this.held = (this.held || 0) + dt;
        const max = this.held > 0.8 ? 360 : 220;
        p.vx = lerp(p.vx, (Rt ? 1 : -1) * max, 0.18);
        p.dir = Rt ? 1 : -1;
      } else {
        this.held = 0; p.vx = lerp(p.vx, 0, 0.25);
      }
      p.coy -= dt; p.jb -= dt;
      if (p.ground) { p.coy = 0.1; p.dj = 0; }
      if (p.jb > 0 && p.coy > 0) { p.vy = -640; p.ground = false; p.coy = 0; p.jb = 0; p.squash = -1; SFX.jump(); this.parts.dust(p.x, p.y); }
      else if (p.jb > 0 && !p.ground && p.coy <= 0 && !p.dj) { p.vy = -720; p.dj = 1; p.jb = 0; p.squash = -1; p.spin = 1; SFX.jump(); SFX.flap(); this.parts.burst(p.x, p.y - p.h / 2, 10, 'star'); }
      p.glide = !p.ground && J && p.vy > 0;
      const grav = p.glide ? 650 : 1700;
      p.vy = Math.min(p.glide ? 120 : 900, p.vy + grav * dt);
      if (p.glide && Math.random() < 0.08) SFX.flap();
      if (!J && p.vy < -200 && !p.dj) p.vy += 2200 * dt;
      p.x += p.vx * dt;
      const py0 = p.y; p.y += p.vy * dt;
      if (p.y < p.h + 30) { p.y = p.h + 30; if (p.vy < 0) p.vy = 0; }
      const was = p.ground; p.ground = false;
      for (const q of this.P) {
        if (p.x + p.w / 2 > q.x + 4 && p.x - p.w / 2 < q.x + q.w - 4) {
          if (py0 <= q.y + 2 && p.y >= q.y && p.vy >= 0) { p.y = q.y; p.vy = 0; p.ground = true; }
          else if (!q.f && p.y > q.y + 4 && p.y - p.h < q.y + q.h) {
            if (p.vx > 0 && p.x < q.x + 20) p.x = q.x - p.w / 2;
            else if (p.vx < 0 && p.x > q.x + q.w - 20) p.x = q.x + q.w + p.w / 2;
          }
        }
      }
      if (p.ground && !was) { p.squash = 1; this.parts.dust(p.x, p.y); }
      p.squash *= 0.82; if (p.spin > 0) p.spin = Math.max(0, p.spin - dt / 0.45); if (p.ground) p.spin = 0;
      p.x = Math.max(20, p.x);

      if (!this.door.open && p.x > this.door.x - 60) {
        p.x = this.door.x - 60; p.vx = 0;
        if (!this.opt.gate) {
          if (!this.nag || this.t - this.nag > 3) { this.nag = this.t; this.opt.onLocked && this.opt.onLocked(); }
        } else if (!this.asking) {
          this.asking = true; this.paused = true;
          this.opt.gate(ok => {
            this.asking = false; this.paused = false; this.last = performance.now();
            if (ok) { this.door.open = true; SFX.door(); this.parts.burst(this.door.x, this.P[0].y - 60, 24, 'star'); this.mood('happy'); }
            else { p.x -= 80; this.mood('sad'); }
          });
        }
      }
      if (p.y > 460) this.hurt(true);
      for (const c of this.C) if (!c.got && Math.abs(c.x - p.x) < 26 && Math.abs(c.y - (p.y - 28)) < 36) { c.got = true; this.coins++; SFX.coin(); this.parts.burst(c.x, c.y, 8, 'dot', '#ffd24a'); }
      for (const s of this.ST) if (!s.got && Math.abs(s.x - p.x) < 30 && Math.abs(s.y - (p.y - 28)) < 40) { s.got = true; this.stars++; SFX.star(); this.parts.burst(s.x, s.y, 18, 'star'); this.mood('happy'); this.opt.onStar && this.opt.onStar(this.stars); }
      for (const l of this.LT) if (!l.got && Math.abs(l.x - p.x) < 30 && Math.abs(l.y - (p.y - 28)) < 40) {
        const need = this.LT.filter(z => z.need >= 0 && !z.got).sort((a, b) => a.need - b.need)[0];
        if (need && (l === need || l.ch === need.ch)) {
          need.got = true; l.got = true; SFX.coin(); this.parts.burst(l.x, l.y, 14, 'star');
          this.opt.onLetter && this.opt.onLetter(need.ch, true);
          if (!this.LT.some(z => z.need >= 0 && !z.got)) { this.door.open = true; SFX.door(); this.mood('happy'); this.opt.onWord && this.opt.onWord(); }
        } else if (!l.bounce || this.t - l.bounce > 1.2) {
          l.bounce = this.t; SFX.bad(); this.shake = 0.25; p.vx = -p.dir * 260; p.vy = -300;
          this.opt.onLetter && this.opt.onLetter(l.ch, false, need && need.ch);
          this.mood('sad');
        }
      }
      for (const e of this.E) {
        e.x += e.dir * e.sp * dt;
        if (e.x < e.min || e.x > e.max) e.dir *= -1;
        if (p.inv <= 0 && Math.abs(e.x - p.x) < 28 && p.y > e.y - 30 && p.y - p.h < e.y) {
          if (p.vy > 0 && py0 < e.y - 22) { e.dead = true; p.vy = -480; SFX.pop(); this.parts.burst(e.x, e.y - 12, 12, 'dot', '#9ad35b'); }
          else this.hurt();
        }
      }
      this.E = this.E.filter(e => !e.dead);
      for (const s of this.SP) if (p.inv <= 0 && Math.abs(s.x + s.w / 2 - p.x) < s.w / 2 + 10 && p.y > s.y - 16 && p.y <= s.y + 2) this.hurt();
      p.inv -= dt;

      if (!this.won && this.door.open && p.x > this.flagX - 20) {
        this.won = true; SFX.win(); this.mood('happy'); this.parts.burst(p.x, p.y - 60, 40, 'star');
        setTimeout(() => this.opt.onWin && this.opt.onWin({ coins: this.coins, stars: this.stars, hearts: this.hearts, time: this.t, coinsMax: this.C.length }), 900);
      }
      this.cam = lerp(this.cam, clamp(p.x - this.W * 0.35, 0, this.flagX + 200 - this.W), 0.12);
      this.parts.step(dt); this.shake = Math.max(0, this.shake - dt);
      if (this.moodT && this.t > this.moodT) { p.mood = ''; this.moodT = 0; }
      this.drawHud();
    }
    mood(m) { this.pl.mood = m; this.moodT = this.t + 1.1; try { this.opt.onMood && this.opt.onMood(m); } catch (_) {} }
    hurt(fell) {
      const p = this.pl; if (p.inv > 0 && !fell) return;
      this.hearts--; SFX.bad(); this.shake = 0.35; this.mood('sad'); p.inv = 1.5;
      if (fell) {
        const back = this.P.filter(q => !q.f && q.x < p.x).pop() || this.P[0];
        p.x = back.x + 40; p.y = back.y - 10; p.vy = 0; p.vx = 0;
      } else { p.vy = -380; p.vx = -p.dir * 240; }
      if (this.hearts <= 0 && !this.won) { this.paused = true; setTimeout(() => this.opt.onLose && this.opt.onLose(), 600); }
    }
    drawHud() {
      const need = this.LT.filter(z => z.need >= 0);
      const s = `<span class=h-hearts>${'❤️'.repeat(Math.max(0, this.hearts))}${'🤍'.repeat(Math.max(0, 3 - this.hearts))}</span><span>🪙 ${this.coins}</span><span>${'⭐'.repeat(this.stars)}${'☆'.repeat(3 - this.stars)}</span>${need.length ? `<span class=h-word dir=auto>${need.map(z => `<b class="${z.got ? 'on' : ''}">${z.ch}</b>`).join('')}</span>` : ''}`;
      if (s !== this._h) { this._h = s; this.hud.innerHTML = s; }
    }
    draw() {
      const g = this.g, sc = this.scale, W = this.W, H = 360;
      g.setTransform(sc, 0, 0, sc, 0, 0);
      const sh = this.shake > 0 ? rnd(-4, 4) * this.shake * 3 : 0;
      background(g, W, H, this.cam, this.th, this.t);
      g.save(); g.translate(-this.cam + sh, 0);
      for (const q of this.P) if (q.x + q.w > this.cam - 50 && q.x < this.cam + W + 50) Art.platform(g, q.x, q.y, q.w, q.h, this.th);
      for (const s of this.SP) Art.spike(g, s.x, s.y, s.w);
      for (const c of this.C) if (!c.got) Art.coin(g, c.x, c.y, this.t);
      for (const s of this.ST) if (!s.got) Art.star(g, s.x, s.y, this.t, 18);
      for (const l of this.LT) if (!l.got) { const b = l.bounce && this.t - l.bounce < 0.5 ? Math.sin((this.t - l.bounce) * 40) * 4 : 0; Art.bubble(g, l.x + b, l.y, 24, l.ch, l.need >= 0 ? '#ffd89e' : '#cfe3ff', this.t); }
      for (const e of this.E) Art.snail(g, e.x, e.y, e.dir, this.t);
      if (this.opt.gate || this.LT.length) Art.door(g, this.door.x, this.P[this.P.length - 1].y, this.door.open, this.t);
      Art.flag(g, this.flagX, this.P[this.P.length - 1].y, this.t);
      const p = this.pl;
      if (!(p.inv > 0 && Math.floor(this.t * 12) % 2)) drawOwl(g, p, this.t);
      this.parts.draw(g);
      g.restore();
    }
  }

  /* ── لعبة الصيد (حروف / كلمات تتساقط) ── */
  class Catcher {
    constructor(host, opt) {
      this.opt = opt; this.host = host; this.th = THEMES[opt.theme] || THEMES.sea;
      this.parts = new Particles(); this.t = 0; this.items = []; this.hearts = 3; this.score = 0;
      this.need = opt.need || 8; this.miss = 0; this.streak = 0; this.speed = opt.speed || 70;
      this.spawnT = 0; this.dead = false; this.paused = false; this.shake = 0;
      host.innerHTML = '<div class=g2-stage><canvas></canvas><div class=g2-hud></div><div class=g2-target></div><div class=g2-ctl><button class="g2-b l" aria-label="يسار">◀</button><button class="g2-b r" aria-label="يمين">▶</button><button class="g2-b s" aria-label="اسمع">🔊</button></div></div>';
      this.cv = host.querySelector('canvas'); this.g = this.cv.getContext('2d');
      this.hud = host.querySelector('.g2-hud'); this.tg = host.querySelector('.g2-target');
      this.pl = { x: 240, y: 330, w: 56, h: 60, dir: 1, ground: true, vx: 0, vy: 0, mood: '', squash: 0 };
      this.keys = {}; this.bind(); this.resize();
      this.ro = new ResizeObserver(() => this.resize()); this.ro.observe(host);
      this.round(); this.last = performance.now(); this.loop = this.loop.bind(this); this.raf = requestAnimationFrame(this.loop);
      Owl.load();
    }
    resize() { Platformer.prototype.resize.call(this); this.pl.x = clamp(this.pl.x, 30, this.W - 30); }
    bind() {
      const k = this.keys;
      this.kd = e => { if (['ArrowLeft', 'ArrowRight', 'a', 'd'].includes(e.key)) { e.preventDefault(); k[e.key] = true; } };
      this.ku = e => { k[e.key] = false; };
      addEventListener('keydown', this.kd); addEventListener('keyup', this.ku);
      const hold = (sel, c) => {
        const b = this.host.querySelector(sel);
        b.addEventListener('pointerdown', e => { e.preventDefault(); k[c] = true; SFX.unlock(); });
        ['pointerup', 'pointercancel', 'pointerleave'].forEach(t => b.addEventListener(t, () => { k[c] = false; }));
      };
      hold('.g2-b.l', 'L'); hold('.g2-b.r', 'R');
      this.host.querySelector('.g2-b.s').onclick = () => this.opt.speak && this.opt.speak(this.cur);
      const mv = e => { const r = this.cv.getBoundingClientRect(); this.dragX = (e.clientX - r.left) / r.width * this.W; };
      this.cv.addEventListener('pointerdown', e => { SFX.unlock(); mv(e); try { this.cv.setPointerCapture(e.pointerId); } catch (_) {} });
      this.cv.addEventListener('pointermove', e => { if (e.buttons) mv(e); });
      this.cv.addEventListener('pointerup', () => { this.dragX = null; });
    }
    destroy() { Platformer.prototype.destroy.call(this); }
    round() { this.cur = this.opt.next(); this.tg.innerHTML = `<span>${this.cur.label}</span>`; this.opt.speak && this.opt.speak(this.cur); this.items = this.items.filter(i => i.y < 200); }
    loop(now) { Platformer.prototype.loop.call(this, now); }
    update(dt) {
      this.t += dt; const p = this.pl, k = this.keys;
      const dir = (k.ArrowRight || k.d || k.R ? 1 : 0) - (k.ArrowLeft || k.a || k.L ? 1 : 0);
      if (this.dragX != null) p.vx = clamp((this.dragX - p.x) * 8, -520, 520);
      else p.vx = lerp(p.vx, dir * 380, 0.25);
      if (Math.abs(p.vx) > 10) p.dir = p.vx > 0 ? 1 : -1;
      p.x = clamp(p.x + p.vx * dt, 28, this.W - 28);
      this.spawnT -= dt;
      if (this.spawnT <= 0) {
        this.spawnT = Math.max(0.55, 1.5 - this.speed / 200);
        const c = this.cur, right = Math.random() < 0.42 || !this.items.some(i => i.ok), v = right ? c.answer : this.opt.decoy(c);
        this.items.push({ x: rnd(40, this.W - 40), y: -30, v, ok: v === c.answer, r: 26, vy: this.speed * rnd(0.85, 1.15), sw: rnd(0, TAU), col: ['#cfe3ff', '#ffd6e7', '#d9f7c9', '#ffe9b0', '#e7d9ff'][Math.floor(rnd(0, 5))] });
      }
      for (const it of this.items) {
        it.y += it.vy * dt; it.x += Math.sin(this.t * 2 + it.sw) * 20 * dt;
        if (!it.done && it.y > p.y - p.h - 10 && it.y < p.y && Math.abs(it.x - p.x) < 38) {
          it.done = true;
          if (it.ok) {
            this.score++; this.streak++; SFX.coin(); this.parts.burst(it.x, it.y, 16, 'star');
            p.mood = 'happy'; this.moodT = this.t + 0.7; this.opt.onGood && this.opt.onGood(this.score);
            if (this.score >= this.need) { this.win(); return; }
            this.round();
          } else {
            this.hearts--; this.streak = 0; this.miss++; SFX.bad(); this.shake = 0.3;
            p.mood = 'sad'; this.moodT = this.t + 0.8; this.opt.onBad && this.opt.onBad(it.v, this.cur);
            if (this.miss >= 2) this.speed = Math.max(45, this.speed * 0.85);
            if (this.hearts <= 0) { this.paused = true; setTimeout(() => this.opt.onLose && this.opt.onLose(), 500); return; }
          }
        }
        if (!it.done && it.y > 380) { it.done = true; if (it.ok) this.streak = 0; }
      }
      this.items = this.items.filter(i => !i.done && i.y < 400);
      if (this.streak >= 4) { this.speed = Math.min(170, this.speed * 1.06); this.streak = 0; }
      if (this.moodT && this.t > this.moodT) { p.mood = ''; this.moodT = 0; }
      this.parts.step(dt); this.shake = Math.max(0, this.shake - dt);
      const s = `<span class=h-hearts>${'❤️'.repeat(Math.max(0, this.hearts))}</span><span>🎯 ${this.score}/${this.need}</span>`;
      if (s !== this._h) { this._h = s; this.hud.innerHTML = s; }
    }
    win() {
      if (this.won) return;
      this.won = true; this.paused = true; SFX.win(); this.parts.burst(this.pl.x, 200, 40, 'star');
      setTimeout(() => this.opt.onWin && this.opt.onWin({ hearts: this.hearts, score: this.score, time: this.t }), 700);
    }
    draw() {
      const g = this.g, sc = this.scale, W = this.W, H = 360;
      g.setTransform(sc, 0, 0, sc, 0, 0);
      background(g, W, H, this.t * 20, this.th, this.t);
      g.fillStyle = this.th.ground[0]; g.fillRect(0, 330, W, 30);
      g.fillStyle = shade(this.th.ground[0], -0.12); for (let x = 0; x < W; x += 24) g.fillRect(x, 334, 12, 4);
      const sh = this.shake > 0 ? rnd(-4, 4) : 0;
      g.save(); g.translate(sh, 0);
      for (const it of this.items) Art.bubble(g, it.x, it.y, it.r, String(it.v), it.col, this.t, String(it.v).length > 2 ? `900 ${it.r * 0.75}px Tahoma` : null);
      const p = this.pl;
      g.strokeStyle = '#8a5a33'; g.lineWidth = 3; g.beginPath(); g.moveTo(p.x + p.dir * 20, p.y - 44); g.lineTo(p.x + p.dir * 30, p.y - 74); g.stroke();
      g.strokeStyle = 'rgba(255,255,255,.9)'; g.fillStyle = 'rgba(255,255,255,.25)'; g.lineWidth = 2;
      g.beginPath(); g.ellipse(p.x + p.dir * 30, p.y - 84, 22, 10, 0, 0, TAU); g.fill(); g.stroke();
      drawOwl(g, p, this.t);
      this.parts.draw(g);
      g.restore();
    }
  }

  window.G2 = { Platformer, Catcher, SFX, Owl, THEMES, background, Art, drawOwl, Particles, starPath, rr };
})();
