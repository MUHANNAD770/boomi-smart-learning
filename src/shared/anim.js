/* anim.js — نظام الحركة الموحّد للموقع (GSAP المحلي lib/gsap.min.js) */
(() => {
  'use strict';
  const G = window.gsap;
  try { if (G && ((navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 2)) G.ticker.fps(30); } catch (e) {}
  if (!G) return;
  const RM = matchMedia('(prefers-reduced-motion: reduce)'), calm = () => RM.matches;
  document.documentElement.classList.add('gs');
  G.defaults({ ease: 'power2.out', duration: 0.35, overwrite: 'auto' });
  const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const R = (a, b) => a + Math.random() * (b - a);

  const Owl = (() => {
    const mc = $('#mc');
    if (!mc) return null;
    const sv = $('.ow', mc);
    if (!sv) return null;
    const P = {
      hd: $('.hd', sv), bd: $('.bd', sv), wl: $('.wl', sv), wr: $('.wr', sv),
      ts: $('.ts', sv), tbg: $('.tbg', sv), bl: $('.brow .bl', sv), br: $('.brow .br', sv),
      glow: $('.glow', sv), pl: $('#pl', sv)
    };
    if (!P.hd) return null;
    const O = { hd: '60 80', bd: '60 121', wl: '33 86', wr: '87 86', ts: '23 18', bl: '42 33', br: '78 33' };
    G.set(P.hd, { svgOrigin: O.hd });
    G.set(P.bd, { svgOrigin: O.bd });
    G.set(P.wl, { svgOrigin: O.wl });
    G.set(P.wr, { svgOrigin: O.wr });
    G.set(P.ts, { svgOrigin: O.ts });
    G.set([P.bl], { svgOrigin: O.bl });
    G.set([P.br], { svgOrigin: O.br });
    let idle = [], busy = 0, lookT = 0, talkTl = null;
    function startIdle() {
      stopIdle();
      if (calm()) return;
      idle.push(G.to(P.bd, { scaleY: 1.025, scaleX: 0.992, duration: 1.7, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      idle.push(G.to(P.ts, { rotation: 7, duration: 1.3, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      P.tbg && idle.push(G.to(P.tbg, { opacity: 0.55, duration: 1.1, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      P.glow && idle.push(G.to(P.glow, { opacity: 0.55, scaleX: 1.08, svgOrigin: '60 124', duration: 1.7, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      idle.push(G.to(P.wr, { rotation: -3, duration: 2.2, yoyo: true, repeat: -1, ease: 'sine.inOut' }));
      headLoop();
    }
    function stopIdle() { idle.forEach(t => t.kill()); idle = []; clearTimeout(lookT); }
    let navT = 0;
    document.addEventListener('hurufi-nav', () => {
      if (!idle.length) return;
      idle.forEach(t => t.pause());
      clearTimeout(navT);
      navT = setTimeout(() => idle.forEach(t => t.resume()), 1100);
    });
    function headLoop() {
      clearTimeout(lookT);
      lookT = setTimeout(() => {
        if (!busy && !calm() && document.visibilityState === 'visible') {
          const r = R(-6, 6);
          G.to(P.hd, { rotation: r, y: R(-1.5, 1), duration: R(0.6, 1), ease: 'sine.inOut' });
          if (Date.now() - lastPointer > 4000 && P.pl) {
            const dx = R(-3, 3), dy = R(-2, 1.5);
            G.to(P.pl, { attr: { transform: `translate(${dx.toFixed(1)} ${dy.toFixed(1)})` }, duration: 0.35 });
            setTimeout(() => G.to(P.pl, { attr: { transform: 'translate(0 0)' }, duration: 0.4 }), R(900, 1600));
          }
        }
        headLoop();
      }, R(2600, 5200));
    }
    let lastPointer = 0;
    document.addEventListener('pointerdown', () => { lastPointer = Date.now(); }, { passive: true });
    document.addEventListener('pointerdown', e => {
      if (calm() || busy) return;
      try {
        const r = sv.getBoundingClientRect();
        if (!r.width) return;
        const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 300));
        G.to(P.hd, { rotation: dx * 7, duration: 0.45, ease: 'back.out(2)' });
      } catch (_) {}
    }, { passive: true });
    const browRot = (a, d = 0.3) => { G.to(P.bl, { rotation: a, duration: d }); G.to(P.br, { rotation: -a, duration: d }); };
    const reset = d => {
      G.to([P.hd, P.wl, P.wr], { rotation: 0, y: 0, x: 0, duration: d || 0.45, ease: 'power2.inOut' });
      G.to([P.bl, P.br], { y: 0, rotation: 0, duration: d || 0.45 });
      G.to(P.bd, { scale: 1, duration: 0.4 });
    };
    const MOODS = {
      happy() { const t = G.timeline(); t.to(P.wl, { rotation: -38, duration: 0.16, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0).to(P.wr, { rotation: 30, duration: 0.16, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0).to([P.bl, P.br], { y: -3, duration: 0.2 }, 0).to(P.hd, { rotation: -6, y: -2, duration: 0.18, yoyo: true, repeat: 3 }, 0); return t; },
      cheer() { return MOODS.happy(); },
      proud() { const t = G.timeline(); t.to(P.bd, { scale: 1.06, duration: 0.3, ease: 'back.out(2)' }).to(P.wl, { rotation: -55, duration: 0.3 }, 0).to(P.wr, { rotation: 25, duration: 0.3 }, 0).to([P.bl, P.br], { y: -2, duration: 0.3 }, 0).to(P.hd, { rotation: -4, duration: 0.3 }, 0); return t; },
      oops() { const t = G.timeline(); browRot(14); t.to([P.bl, P.br], { y: 2, duration: 0.25 }, 0).to(P.hd, { rotation: -7, duration: 0.12, yoyo: true, repeat: 5, ease: 'sine.inOut' }, 0).to([P.wl, P.wr], { rotation: i => (i ? -12 : 12), y: 3, duration: 0.35 }, 0); return t; },
      soft() { return MOODS.oops(); },
      think() { const t = G.timeline(); t.to(P.hd, { rotation: 9, duration: 0.5 }).to(P.wl, { rotation: -62, y: -6, duration: 0.5 }, 0).to([P.bl, P.br], { y: -2, duration: 0.4 }, 0); P.pl && G.to(P.pl, { attr: { transform: 'translate(2 -3)' }, duration: 0.4 }); return t; },
      tilt() { const t = G.timeline(); t.to(P.hd, { rotation: -11, duration: 0.35, ease: 'back.out(2)' }); browRot(-8); return t; },
      listen() { const t = G.timeline(); t.to(P.hd, { rotation: -9, y: 1, duration: 0.4 }).to(P.wl, { rotation: -20, duration: 0.4 }, 0); browRot(-6); return t; },
      wow() { const t = G.timeline(); t.to([P.bl, P.br], { y: -5, duration: 0.18, ease: 'back.out(3)' }).to(P.wl, { rotation: -45, duration: 0.2 }, 0).to(P.wr, { rotation: 30, duration: 0.2 }, 0); return t; },
      explain() { const t = G.timeline(); t.to(P.wl, { rotation: -30, duration: 0.25, yoyo: true, repeat: 3, ease: 'sine.inOut' }).to(P.hd, { rotation: 4, duration: 0.4 }, 0); return t; }
    };
    let moodT = 0;
    function mood(m, ms) {
      if (calm()) return;
      const f = MOODS[m];
      if (!f) return;
      busy++;
      try { f(); } catch (_) {}
      clearTimeout(moodT);
      moodT = setTimeout(() => {
        busy = Math.max(0, busy - 1);
        reset();
        if (P.pl) G.to(P.pl, { attr: { transform: 'translate(0 0)' }, duration: 0.4 });
      }, Math.max(700, Math.min(ms || 1800, 5000)));
    }
    function talk(on) {
      if (calm()) return;
      if (on && !talkTl) {
        talkTl = G.timeline({ repeat: -1 });
        talkTl.to(P.hd, { rotation: () => R(-4, 4), y: () => R(-1.2, 0.5), duration: () => R(0.35, 0.6), ease: 'sine.inOut' })
          .to(P.wl, { rotation: () => R(-28, -6), duration: () => R(0.3, 0.5), ease: 'sine.inOut' }, '<')
          .to(P.wr, { rotation: () => R(-6, 4), duration: 0.5 }, '<');
        talkTl.eventCallback('onRepeat', () => talkTl.invalidate());
      } else if (!on && talkTl) {
        talkTl.kill();
        talkTl = null;
        if (!busy) reset(0.5);
      }
    }
    new MutationObserver(() => talk(mc.classList.contains('talk') || mc.classList.contains('lips'))).observe(mc, { attributes: true, attributeFilter: ['class'] });
    sv.addEventListener('pointerdown', () => {
      if (calm()) return;
      G.fromTo(P.bd, { scaleY: 0.92, scaleX: 1.06 }, { scaleY: 1, scaleX: 1, duration: 0.6, ease: 'elastic.out(1,.4)' });
    });
    RM.addEventListener?.('change', () => (calm() ? stopIdle() : startIdle()));
    document.addEventListener('visibilitychange', () => (document.hidden ? stopIdle() : startIdle()));
    startIdle();
    if (window.MC && MC.mood) {
      const om = MC.mood;
      MC.mood = function (m, ms) {
        const r = om.apply(this, arguments);
        try { mood(m, ms); } catch (_) {}
        return r;
      };
    }
    return { mood, talk };
  })();
  window.BumiOwl = Owl;

  let fx = null;
  const layer = () => fx || (fx = Object.assign(document.createElement('div'), { id: 'fx' }), document.body.appendChild(fx), fx);
  const CH = ['⭐', '✨', '🌟', '💫'];
  function burst(x, y, n = 12) {
    if (calm()) return;
    const L = layer();
    for (let i = 0; i < n; i++) {
      const p = document.createElement('span');
      p.className = 'p';
      p.textContent = CH[i % CH.length];
      L.appendChild(p);
      const a = Math.PI * 2 * i / n + R(-0.3, 0.3), d = R(50, 110);
      G.set(p, { x, y, xPercent: -50, yPercent: -50, scale: R(0.5, 0.9), opacity: 1 });
      G.to(p, { x: x + Math.cos(a) * d, y: y + Math.sin(a) * d - 20, rotation: R(-120, 120), duration: R(0.6, 0.9), ease: 'power3.out' });
      G.to(p, { y: `+=${R(30, 60)}`, opacity: 0, scale: 0.3, duration: 0.5, delay: R(0.45, 0.7), ease: 'power1.in', onComplete: () => p.remove() });
    }
  }
  function confetti(n = 70) {
    if (calm()) return;
    const L = layer(), W = innerWidth, H = innerHeight, C = ['#2447c9', '#f7b500', '#ff4d6d', '#20b486', '#9b4dff', '#2f8bff', '#ffcf3f'];
    for (let i = 0; i < n; i++) {
      const c = document.createElement('i');
      c.className = 'c';
      c.style.background = C[i % C.length];
      L.appendChild(c);
      G.set(c, { x: R(0, W), y: R(-80, -10), rotation: R(0, 360) });
      G.to(c, { y: H + 40, x: `+=${R(-120, 120)}`, rotation: `+=${R(360, 900)}`, rotationX: R(0, 720), duration: R(1.8, 3.2), delay: R(0, 0.6), ease: 'power1.in', onComplete: () => c.remove() });
    }
  }
  const center = el => { const r = el.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; };
  let lastEl = null;
  document.addEventListener('pointerdown', e => {
    const b = e.target.closest && e.target.closest('button,.opt,.card,.chip,[onclick]');
    if (b) lastEl = b;
  }, { capture: true, passive: true });
  function good(el) {
    el = el || lastEl;
    if (!el || !document.body.contains(el)) return;
    const [x, y] = center(el);
    burst(x, y, 10);
    if (!calm()) G.fromTo(el, { scale: 1 }, { scale: 1.08, duration: 0.14, yoyo: true, repeat: 1, ease: 'power2.out', clearProps: 'transform' });
  }
  function bad(el) {
    el = el || lastEl;
    if (!el || !document.body.contains(el) || calm()) return;
    G.to(el, { keyframes: { x: [0, -9, 8, -6, 5, -2, 0] }, duration: 0.5, ease: 'none', clearProps: 'transform' });
  }
  function party() {
    confetti();
    try {
      const h1 = $('#app h1');
      if (h1 && !calm()) G.fromTo(h1, { scale: 0.3, rotation: -15 }, { scale: 1, rotation: 0, duration: 0.9, ease: 'elastic.out(1,.45)' });
    } catch (_) {}
  }
  window.BumiFX = { burst, confetti, good, bad, party };

  const ANS = '.opt,.practice-options button,.ct-opts button';
  addEventListener('click', e => {
    const el = e.target.closest && e.target.closest(ANS);
    if (!el || el.closest('.g2-pz,.g2-ov,.g2-match')) return;
    setTimeout(() => {
      if (!document.body.contains(el)) return;
      const c = ' ' + el.className + ' ';
      if (/ (ok|good|right) /.test(c)) window.BumiFX.good(el);
      else if (/ (no|bad|wrong) /.test(c)) window.BumiFX.bad(el);
    }, 40);
  }, true);
  if (window.HurufiSound && HurufiSound.play) {
    const op = HurufiSound.play;
    HurufiSound.play = function (k) {
      const r = op.apply(this, arguments);
      try {
        if (k === 'correct') good();
        else if (k === 'wrong') bad();
        else if (k === 'finish') party();
      } catch (_) {}
      return r;
    };
  }

  const LISTS = '.tl>*,.grid>*,.list>*,.ic>*,.badges>*,.sum>*,.pr-sum>*,.course-stack>*,.chips>*,.enchips>*,.vstack>*,.lesson-menu,.course-menu';
  const io = 'IntersectionObserver' in window
    ? new IntersectionObserver(es => es.forEach(e => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      G.fromTo(e.target, { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.45, clearProps: 'transform,opacity,visibility' });
    }), { rootMargin: '0px 0px -6% 0px' })
    : null;
  function countUp(root) {
    $$('.sum b,.pr-sum b,.om-ch b,.ach-sum b', root).forEach(b => {
      const t = b.textContent.trim(), ar = /[٠-٩]/.test(t);
      const n = +(ar ? t.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d)) : t);
      if (!n || n > 5000 || !/^[\d٠-٩]+$/.test(t)) return;
      const o = { v: 0 };
      G.to(o, {
        v: n,
        duration: Math.min(1.2, 0.4 + n / 80),
        ease: 'power1.out',
        onUpdate: () => {
          const v = String(Math.round(o.v));
          b.textContent = ar ? v.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : v;
        }
      });
    });
  }
  function enter() {
    const app = $('#app');
    if (!app) return;
    try { document.dispatchEvent(new Event('hurufi-nav')); } catch (e) {}
    if (calm()) return;
    const top = [...app.children].filter(e => !e.matches('script,style'));
    G.fromTo(top, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.34, stagger: 0.045, clearProps: 'transform,opacity,visibility' });
    const items = $$(LISTS, app), vh = innerHeight;
    const tops = items.map(el => el.getBoundingClientRect().top), vis = [], below = [];
    items.forEach((el, i) => {
      if (tops[i] < vh * 1.05) { if (vis.length < 16) vis.push(el); }
      else if (below.length < 40) below.push(el);
    });
    if (vis.length) G.fromTo(vis, { autoAlpha: 0, y: 16, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, delay: 0.08, stagger: 0.035, ease: 'back.out(1.6)', clearProps: 'transform,opacity,visibility' });
    if (io) below.forEach(el => io.observe(el));
    $$('.q,.vq-word,.enword,.enpic,.vq-pic,.card>.e,.big-letter,.lt', app).slice(0, 6).forEach((el, i) => {
      G.fromTo(el, { scale: 0.55, rotation: -8, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.6, delay: 0.12 + i * 0.05, ease: 'back.out(2.2)', clearProps: 'transform,opacity,visibility' });
    });
    countUp(app);
    const h1 = app.querySelector(':scope>h1,:scope>.sec>h1');
    if (h1 && /🌟|🎉|🏆/.test(h1.textContent)) setTimeout(party, 150);
  }
  if (typeof window.h === 'function') {
    const oh = window.h;
    window.h = function () {
      const r = oh.apply(this, arguments);
      try { enter(); } catch (_) {}
      return r;
    };
  }

  const PRESS = 'button,.card,.row,.opt,.chip,.gt,.badge';
  let pressed = null;
  document.addEventListener('pointerdown', e => {
    if (calm()) return;
    const b = e.target.closest && e.target.closest(PRESS);
    if (!b || b.disabled || b.closest('#mc')) return;
    pressed = b;
    G.to(b, { scale: 0.95, duration: 0.09, ease: 'power2.out' });
  }, { passive: true });
  const release = () => {
    if (!pressed) return;
    const b = pressed;
    pressed = null;
    G.to(b, { scale: 1, duration: 0.55, ease: 'elastic.out(1,.45)', clearProps: 'transform' });
  };
  ['pointerup', 'pointercancel', 'pointerleave', 'dragstart'].forEach(t => document.addEventListener(t, release, { passive: true, capture: t === 'pointerleave' }));
  document.addEventListener('pointerover', e => {
    if (calm() || e.pointerType === 'touch') return;
    const i = e.target.closest && e.target.closest('.gt .ico,#gn nav button span');
    if (i && !G.isTweening(i)) G.to(i, { keyframes: { rotation: [0, -10, 8, -4, 0] }, duration: 0.6, ease: 'none', clearProps: 'transform' });
  }, { passive: true });
  document.addEventListener('click', e => {
    if (calm()) return;
    const s = e.target.closest && e.target.closest('#gn nav button');
    if (s) {
      const i = s.querySelector('span');
      i && G.to(i, { keyframes: { y: [0, -8, 0, -3, 0] }, duration: 0.5, ease: 'none', clearProps: 'transform' });
    }
  }, { passive: true });

  new MutationObserver(rows => {
    if (calm()) return;
    for (const r of rows) {
      for (const n of r.addedNodes) {
        if (n.nodeType !== 1) continue;
        if (n.id === 'bm') G.fromTo(n, { autoAlpha: 0, y: 40, scale: 0.97 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.4)', clearProps: 'transform,opacity,visibility' });
        else if (n.matches('.bb')) G.fromTo(n, { autoAlpha: 0, y: 10, scale: 0.96 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.3, clearProps: 'transform,opacity,visibility' });
        else if (n.matches('.badge-toast')) G.fromTo(n, { y: -40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)' });
        else {
          const c = n.matches('.vq-card') ? n : n.querySelector && n.querySelector('.vq-card');
          if (c) G.fromTo(c, { scale: 0.8, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(1.8)', clearProps: 'transform,opacity,visibility' });
        }
      }
    }
  }).observe(document.body, { childList: true, subtree: false });
  const blObs = new MutationObserver(rows => {
    if (calm()) return;
    for (const r of rows) for (const n of r.addedNodes) if (n.nodeType === 1 && n.matches('.bb,.chips')) G.fromTo(n, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.3, clearProps: 'transform,opacity,visibility' });
  });
  new MutationObserver(() => {
    const bl = $('#bl');
    if (bl && !bl.__fx) { bl.__fx = 1; blObs.observe(bl, { childList: true }); }
  }).observe(document.body, { childList: true });
  document.addEventListener('toggle', e => {
    const d = e.target;
    if (calm() || !d.open || !d.matches || !d.matches('details')) return;
    const kids = [...d.children].filter(x => x.tagName !== 'SUMMARY');
    G.fromTo(kids, { autoAlpha: 0, y: -8 }, { autoAlpha: 1, y: 0, duration: 0.3, stagger: 0.03, clearProps: 'transform,opacity,visibility' });
  }, true);

  try { enter(); } catch (_) {}
})();
