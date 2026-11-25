/* /src/tutor/brain.js — ذاكرة بومي الداخلية: تتعلّم من إجابات الذكاء الاصطناعي وتحفظها محليًا */
(() => {
  'use strict';
  const KB = 'hrw-kb', EX = 'hrw-kbx', MAXQ = 400, MAXX = 40;
  const STOP = new Set('ما ماذا هو هي هل في من على الى إلى عن يا لي لنا لك اشرح اشرحي اخبرني اخبريني قل قولي لو سمحت ممكن هذا هذه ذلك تلك كيف لماذا اين متى انا انت و ف ب ل ك أن ان إن'.split(' ').map(nz));

  function nz(s) {
    return String(s || '').toLowerCase()
      .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
      .replace(/[أإآٱ]/g, 'ا')
      .replace(/ى/g, 'ي')
      .replace(/ة/g, 'ه')
      .replace(/[^\p{L}\p{N}\s]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  const stem = w => {
    let x = w;
    if (x.length > 4 && x.startsWith('ال')) x = x.slice(2);
    else if (x.length > 4 && /^[وفبلك]/.test(x) && x.slice(1, 3) === 'ال') x = x.slice(3);
    return x;
  };

  const tok = s => [...new Set(nz(s).split(' ').map(stem).filter(w => w && !STOP.has(w) && (w.length > 1 || /\p{N}/u.test(w))))];
  const rd = k => { try { return JSON.parse(localStorage.getItem(k) || '[]') || []; } catch (_) { return []; } };
  const wr = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (_) { return false; } };

  let Q = rd(KB), X = rd(EX);
  const save = () => {
    if (!wr(KB, Q)) {
      Q = Q.slice(-Math.floor(Q.length / 2));
      wr(KB, Q);
    }
  };

  function sim(a, b) {
    if (!a.length || !b.length) return 0;
    let m = 0;
    const used = new Set();
    for (const x of a) {
      let hit = 0;
      for (let j = 0; j < b.length; j++) {
        if (used.has(j)) continue;
        const y = b[j];
        if (x === y || (x.length >= 4 && y.length >= 4 && x.slice(0, 4) === y.slice(0, 4) && Math.abs(x.length - y.length) <= 2)) {
          used.add(j);
          hit = 1;
          break;
        }
      }
      m += hit;
    }
    return (2 * m) / (a.length + b.length);
  }

  const priv = (q, name) => {
    const n = nz(name);
    return /\d{6,}|@|https?:/i.test(q) || (n && n.length > 1 && nz(q).split(' ').includes(n));
  };

  const subst = (a, b) => {
    const match = x => y => x === y || (x.length >= 4 && y.length >= 4 && x.slice(0, 4) === y.slice(0, 4));
    const ua = a.filter(x => !b.some(match(x)));
    const ub = b.filter(y => !a.some(z => match(z)(y)));
    return ua.some(x => x.length <= 4 && ub.some(y => y.length <= 4));
  };

  const hitsOK = (a, b) => {
    if (subst(a, b)) return false;
    let m = 0;
    for (const x of a) if (b.some(y => x === y || (x.length >= 4 && y.length >= 4 && x.slice(0, 4) === y.slice(0, 4)))) m++;
    return m >= 2 || a.length < 2;
  };

  function find(q, ctx, min) {
    const t = tok(q);
    if (!t.length) return null;
    const c = nz(ctx).slice(0, 40);
    let best = null, bs = 0;
    for (const e of Q) {
      if (t.length < 3 && e.t.length < 3 && (e.c || '') !== c && (e.c || c)) continue;
      const s = sim(t, e.t);
      if (s > bs && (t.length >= 2 ? s >= min && hitsOK(t, e.t) : s >= 0.99)) {
        bs = s;
        best = e;
      }
    }
    if (!best) return null;
    best.h = (best.h || 0) + 1;
    best.u = Date.now();
    save();
    return { a: best.a, score: bs };
  }

  function learn(q, a, ctx, name) {
    q = String(q || '').trim();
    a = String(a || '').trim();
    if (!q || !a || q.length > 140 || a.length > 800 || priv(q, name)) return false;
    const t = tok(q);
    if (!t.length) return false;
    const c = nz(ctx).slice(0, 40);
    for (const e of Q) {
      if (sim(t, e.t) >= 0.92 && (e.c || '') === c) {
        e.a = a;
        e.u = Date.now();
        save();
        return true;
      }
    }
    Q.push({ q: q.slice(0, 140), t, a, c, h: 0, u: Date.now(), d: Date.now() });
    if (Q.length > MAXQ) {
      Q.sort((x, y) => ((x.h || 0) * 5 + (x.u || 0) / 864e5) - ((y.h || 0) * 5 + (y.u || 0) / 864e5));
      Q = Q.slice(Q.length - MAXQ);
    }
    save();
    return true;
  }

  const recent = n => Q.slice().sort((a, b) => (b.d || 0) - (a.d || 0)).slice(0, n || 8).map(e => e.q);

  function exLearn(topic, items) {
    const k = nz(topic).slice(0, 40) || 'عام';
    if (!Array.isArray(items) || !items.length) return;
    let e = X.find(x => x.k === k);
    if (!e) {
      e = { k, s: [] };
      X.push(e);
      if (X.length > MAXX) X.shift();
    }
    const sig = JSON.stringify(items).slice(0, 200);
    if (!e.s.some(s => JSON.stringify(s).slice(0, 200) === sig)) {
      e.s.push(items);
      if (e.s.length > 4) e.s.shift();
    }
    wr(EX, X);
  }

  function exFind(topic) {
    const k = nz(topic).slice(0, 40) || 'عام';
    let e = X.find(x => x.k === k);
    if (!e) {
      const t = tok(k);
      let bs = 0;
      for (const x of X) {
        const s = sim(t, tok(x.k));
        if (s > bs && s >= 0.5) { bs = s; e = x; }
      }
    }
    if (!e && X.length && !topic) e = X[X.length - 1];
    if (!e || !e.s.length) return null;
    e.i = ((e.i || 0) + 1) % e.s.length;
    return e.s[e.i];
  }

  window.Brain = {
    find,
    learn,
    recent,
    exLearn,
    exFind,
    count: () => Q.length,
    exCount: () => X.reduce((n, x) => n + x.s.length, 0),
    clear: () => { Q = []; X = []; wr(KB, Q); wr(EX, X); },
    _tok: tok,
    _sim: sim
  };
})();
