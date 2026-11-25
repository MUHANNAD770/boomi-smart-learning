/* grader.js — تصحيح مرن ولطيف لإجابات الطلاب (نص مكتوب، نطق، رسم/كتابة بالإصبع).
   Grade.text(إجابة، [الإجابات الصحيحة]) ← {ok, exact, close, tip}
   Ink.check(ضربات، الهدف، الخيارات) ← {ok, close, score, tip, as} */
(() => {
  'use strict';
  const AD = '٠١٢٣٤٥٦٧٨٩', PD = '۰۱۲۳۴۵۶۷۸۹';
  const norm = s => String(s == null ? '' : s).normalize('NFKC').toLowerCase()
    .replace(/[\u064B-\u0652\u0670\u0640\u200B-\u200F\u061C]/g, '')
    .replace(/[أإآٱ]/g, 'ا').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي').replace(/ة/g, 'ه').replace(/ى/g, 'ي')
    .replace(/[٠-٩]/g, d => AD.indexOf(d)).replace(/[۰-۹]/g, d => PD.indexOf(d))
    .replace(/[’'`´]/g, '').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();

  const NUMW = {
    0: ['صفر', 'zero'], 1: ['واحد', 'واحده', 'one'], 2: ['اثنان', 'اثنين', 'اثنتان', 'اثنتين', 'two'],
    3: ['ثلاثه', 'ثلاث', 'three'], 4: ['اربعه', 'اربع', 'four'], 5: ['خمسه', 'خمس', 'five'],
    6: ['سته', 'ست', 'six'], 7: ['سبعه', 'سبع', 'seven'], 8: ['ثمانيه', 'ثمان', 'eight'],
    9: ['تسعه', 'تسع', 'nine'], 10: ['عشره', 'عشر', 'ten']
  };
  const asNum = s => {
    s = norm(s);
    if (/^\d+$/.test(s)) return +s;
    for (const k in NUMW) if (NUMW[k].includes(s)) return +k;
    return null;
  };

  const NEAR = ['ته', 'تط', 'ذز', 'ذد', 'ثس', 'ثت', 'ضظ', 'ضد', 'صس', 'ظز', 'قك', 'حه', 'عا', 'غع', 'خح', 'جغ', 'ck', 'sz', 'iy', 'ei', 'uo', 'ao', 'mn', 'bd', 'pb', 'vf', 'gj', 'qk', 'xs', 'ae'];
  const near2 = (a, b) => NEAR.some(p => (p[0] === a && p[1] === b) || (p[0] === b && p[1] === a));

  function edit(a, b) {
    const n = a.length, m = b.length;
    const D = Array.from({ length: n + 1 }, () => new Float32Array(m + 1));
    for (let i = 0; i <= n; i++) D[i][0] = i;
    for (let j = 0; j <= m; j++) D[0][j] = j;
    for (let i = 1; i <= n; i++) {
      for (let j = 1; j <= m; j++) {
        const x = a[i - 1], y = b[j - 1];
        const sub = x === y ? 0 : near2(x, y) ? 0.5 : 1;
        const del = (i > 1 && a[i - 2] === x) ? 0.5 : 1;
        const ins = (j > 1 && b[j - 2] === y) ? 0.5 : 1;
        let v = Math.min(D[i - 1][j] + del, D[i][j - 1] + ins, D[i - 1][j - 1] + sub);
        if (i > 1 && j > 1 && x === b[j - 2] && a[i - 2] === y) v = Math.min(v, D[i - 2][j - 2] + 0.5);
        D[i][j] = v;
      }
    }
    let i = n, j = m, op = null;
    while (i > 0 || j > 0) {
      const x = a[i - 1], y = b[j - 1], c = D[i][j];
      if (i > 0 && j > 0 && x === y && c === D[i - 1][j - 1]) { i--; j--; continue; }
      if (i > 1 && j > 1 && x === b[j - 2] && a[i - 2] === y && c === D[i - 2][j - 2] + 0.5) { op = { t: 'swap', a: a[i - 2] + x }; i -= 2; j -= 2; continue; }
      if (i > 0 && j > 0 && c === D[i - 1][j - 1] + (near2(x, y) ? 0.5 : 1)) { op = { t: 'sub', a: x, b: y }; i--; j--; continue; }
      if (j > 0 && (i === 0 || c === D[i][j - 1] + ((j > 1 && b[j - 2] === y) ? 0.5 : 1))) { op = { t: 'miss', b: y }; j--; continue; }
      op = { t: 'extra', a: x };
      i--;
    }
    return { d: D[n][m], op };
  }

  const tolFor = L => (L <= 3 ? 0 : L <= 4 ? 0.5 : L <= 7 ? 1 : L <= 11 ? 1.5 : Math.max(2, Math.round(L * 0.16 * 2) / 2));
  const tipOf = op => {
    if (!op) return '';
    const q = c => '«' + c + '»';
    switch (op.t) {
      case 'miss': return `ينقصها حرف ${q(op.b)} 🔤`;
      case 'extra': return `فيها حرف زائد ${q(op.a)}`;
      case 'sub': return `اكتب ${q(op.b)} بدل ${q(op.a)} ✍️`;
      case 'swap': return `انتبه لترتيب الحرفين ${q(op.a)}`;
      default: return '';
    }
  };

  function text(input, answers, o) {
    o = o || {};
    const raw = String(input == null ? '' : input);
    const A = (Array.isArray(answers) ? answers : [answers]).filter(x => x != null);
    const u = norm(raw);
    if (!u) return { ok: false, exact: false, close: false, empty: true, tip: 'لم تكتب شيئًا بعد 🙂 جرّب!' };
    let best = { ok: false, exact: false, close: false, d: 99, tip: '', want: A[0] };
    for (const ans of A) {
      const t = norm(ans);
      if (!t) continue;
      if (u === t) return { ok: true, exact: String(raw).trim() === String(ans).trim() || norm(raw) === norm(ans), close: false, d: 0, tip: '', want: ans };
      const un = asNum(u), tn = asNum(t);
      if (tn != null && un != null && un === tn) return { ok: true, exact: false, close: false, d: 0, tip: '', want: ans };
      const strip = s => s.replace(/(^|\s)ال(?=\S{2,})/g, '$1');
      if (strip(u) === strip(t)) return { ok: true, exact: false, close: false, d: 0, tip: '', want: ans };
      const ut = u.replace(/\s/g, ''), tt = t.replace(/\s/g, ''), L = tt.length;
      const { d, op } = edit(ut, tt);
      const tol = tolFor(L) + (o.speech ? 0.5 : 0);
      const r = { ok: d <= tol, exact: false, close: d > tol && d <= tol + 1.5 && L >= 3, d, tip: tipOf(op), want: ans };
      if (r.ok && (!best.ok || d < best.d)) best = r;
      else if (!best.ok && ((r.close && !best.close) || (r.close === best.close && d < best.d))) best = r;
    }
    return best;
  }
  const fb = (g, want) => (g.ok ? (g.exact ? '' : `إجابتك صحيحة 🌟 والكتابة الدقيقة: «${want || g.want}»`) : g.close ? `قريب جدًا! ${g.tip || ''}`.trim() : g.tip || '');
  window.Grade = { norm, text, edit, feedback: fb, asNum };

  const G = 40;
  const bbox = P => {
    let a = 1e9, b = 1e9, c = -1e9, d = -1e9;
    for (const [x, y] of P) {
      if (x < a) a = x;
      if (y < b) b = y;
      if (x > c) c = x;
      if (y > d) d = y;
    }
    return { x: a, y: b, w: c - a, h: d - b, cx: (a + c) / 2, cy: (b + d) / 2 };
  };
  const plen = s => {
    let L = 0;
    for (let i = 1; i < s.length; i++) L += Math.hypot(s[i][0] - s[i - 1][0], s[i][1] - s[i - 1][1]);
    return L;
  };
  const resample = (s, step) => {
    if (s.length < 2) return s.slice();
    const o = [s[0]];
    let acc = 0;
    for (let i = 1; i < s.length; i++) {
      let [x0, y0] = s[i - 1];
      const [x1, y1] = s[i];
      let d = Math.hypot(x1 - x0, y1 - y0);
      while (acc + d >= step) {
        const t = (step - acc) / d;
        x0 += t * (x1 - x0);
        y0 += t * (y1 - y0);
        o.push([x0, y0]);
        d = Math.hypot(x1 - x0, y1 - y0);
        acc = 0;
      }
      acc += d;
    }
    o.push(s[s.length - 1]);
    return o;
  };
  function normalize(P, shear) {
    if (!P.length) return P;
    const b = bbox(P), S = Math.max(b.w, b.h, 1e-6);
    let Q = P.map(([x, y]) => [(x - b.cx) / S, (y - b.cy) / S]);
    let k = 0;
    if (shear !== false) {
      let sxy = 0, syy = 0;
      for (const [x, y] of Q) { sxy += x * y; syy += y * y; }
      k = syy > 1e-6 ? Math.max(-0.6, Math.min(0.6, sxy / syy)) : 0;
      if (b.h < b.w * 0.35) k = 0;
    }
    Q = Q.map(([x, y]) => [x - k * y, y]);
    const c = bbox(Q), T = Math.max(c.w, c.h, 1e-6);
    return Q.map(([x, y]) => [0.5 + (x - c.cx) / T * 0.9, 0.5 + (y - c.cy) / T * 0.9]);
  }
  function dtOf(P) {
    const D = new Float32Array(G * G).fill(1e6);
    for (const [x, y] of P) {
      const i = Math.max(0, Math.min(G - 1, Math.round(x * (G - 1))));
      const j = Math.max(0, Math.min(G - 1, Math.round(y * (G - 1))));
      D[j * G + i] = 0;
    }
    for (let j = 0; j < G; j++) {
      for (let i = 0; i < G; i++) {
        let v = D[j * G + i];
        if (i > 0) v = Math.min(v, D[j * G + i - 1] + 3);
        if (j > 0) {
          v = Math.min(v, D[(j - 1) * G + i] + 3);
          if (i > 0) v = Math.min(v, D[(j - 1) * G + i - 1] + 4);
          if (i < G - 1) v = Math.min(v, D[(j - 1) * G + i + 1] + 4);
        }
        D[j * G + i] = v;
      }
    }
    for (let j = G - 1; j >= 0; j--) {
      for (let i = G - 1; i >= 0; i--) {
        let v = D[j * G + i];
        if (i < G - 1) v = Math.min(v, D[j * G + i + 1] + 3);
        if (j < G - 1) {
          v = Math.min(v, D[(j + 1) * G + i] + 3);
          if (i < G - 1) v = Math.min(v, D[(j + 1) * G + i + 1] + 4);
          if (i > 0) v = Math.min(v, D[(j + 1) * G + i - 1] + 4);
        }
        D[j * G + i] = v;
      }
    }
    return D;
  }
  const at = (D, x, y) => D[Math.max(0, Math.min(G - 1, Math.round(y * (G - 1)))) * G + Math.max(0, Math.min(G - 1, Math.round(x * (G - 1))))] / 3 / (G - 1);
  const TOL = 0.085;
  function compare(U, T) {
    const Du = dtOf(U), Dt = dtOf(T);
    let cov = 0, pre = 0, du = 0, dt = 0;
    for (const [x, y] of T) { const v = at(Du, x, y); dt += v; if (v <= TOL) cov++; }
    for (const [x, y] of U) { const v = at(Dt, x, y); du += v; if (v <= TOL) pre++; }
    cov /= T.length || 1;
    pre /= U.length || 1;
    dt /= T.length || 1;
    du /= U.length || 1;
    return { s: Math.max(0, 0.55 * cov + 0.45 * pre - Math.max(0, (dt + du) / 2 - 0.05) * 0.8), cov, pre };
  }
  const FONTS = ['Arial,sans-serif', 'Tahoma,sans-serif', '"Baloo Bhaijaan 2",Tahoma,sans-serif', 'Georgia,serif', '"Comic Sans MS","Chalkboard SE",cursive', '"Courier New",monospace'];
  const TC = new Map();
  let cv = null;
  function thin(I, W, H) {
    const g = (x, y) => (x >= 0 && y >= 0 && x < W && y < H ? I[y * W + x] : 0);
    let ch = 1;
    while (ch) {
      ch = 0;
      for (let pass = 0; pass < 2; pass++) {
        const del = [];
        for (let y = 1; y < H - 1; y++) {
          for (let x = 1; x < W - 1; x++) {
            if (!I[y * W + x]) continue;
            const p = [g(x, y - 1), g(x + 1, y - 1), g(x + 1, y), g(x + 1, y + 1), g(x, y + 1), g(x - 1, y + 1), g(x - 1, y), g(x - 1, y - 1)];
            const B = p.reduce((a, b) => a + b, 0);
            if (B < 2 || B > 6) continue;
            let A = 0;
            for (let k = 0; k < 8; k++) if (!p[k] && p[(k + 1) % 8]) A++;
            if (A !== 1) continue;
            if (pass === 0 ? (p[0] * p[2] * p[4] === 0 && p[2] * p[4] * p[6] === 0) : (p[0] * p[2] * p[6] === 0 && p[0] * p[4] * p[6] === 0)) del.push(y * W + x);
          }
        }
        if (del.length) { ch = 1; for (const k of del) I[k] = 0; }
      }
    }
    return I;
  }
  function comps(I, W, H) {
    const lab = new Int32Array(W * H), out = [];
    let n = 0;
    for (let s = 0; s < W * H; s++) {
      if (!I[s] || lab[s]) continue;
      n++;
      const st = [s], px = [];
      lab[s] = n;
      while (st.length) {
        const k = st.pop();
        px.push(k);
        const x = k % W, y = (k / W) | 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const X = x + dx, Y = y + dy;
            if (X < 0 || Y < 0 || X >= W || Y >= H) continue;
            const q = Y * W + X;
            if (I[q] && !lab[q]) { lab[q] = n; st.push(q); }
          }
        }
      }
      out.push(px);
    }
    return out;
  }
  function template(txt, font) {
    const key = txt + '|' + font;
    if (TC.has(key)) return TC.get(key);
    const W = 110, H = 110;
    cv = cv || document.createElement('canvas');
    cv.width = W;
    cv.height = H;
    const c = cv.getContext('2d', { willReadFrequently: true });
    c.clearRect(0, 0, W, H);
    c.fillStyle = '#000';
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    let fs = 74;
    c.font = `700 ${fs}px ${font}`;
    const mw = c.measureText(txt).width;
    if (mw > W * 0.85) { fs = Math.floor(fs * W * 0.85 / mw); c.font = `700 ${fs}px ${font}`; }
    c.fillText(txt, W / 2, H / 2);
    const d = c.getImageData(0, 0, W, H).data, I = new Uint8Array(W * H);
    let ink = 0;
    for (let k = 0; k < W * H; k++) if (d[k * 4 + 3] > 110) { I[k] = 1; ink++; }
    if (ink < 12) { TC.set(key, null); return null; }
    const C = comps(I.slice(), W, H).sort((a, b) => b.length - a.length), big = C[0].length;
    const mainSet = new Set(), marks = [];
    for (const px of C) {
      if (px.length >= big * 0.22) px.forEach(k => mainSet.add(k));
      else if (px.length > 4) {
        let sx = 0, sy = 0;
        px.forEach(k => { sx += k % W; sy += (k / W) | 0; });
        marks.push([sx / px.length, sy / px.length]);
      }
    }
    const M = new Uint8Array(W * H);
    mainSet.forEach(k => (M[k] = 1));
    thin(M, W, H);
    const P = [];
    for (let k = 0; k < W * H; k++) if (M[k]) P.push([k % W, (k / W) | 0]);
    const mb = bbox(P);
    const t = { pts: normalize(P), raw: P, marks: marks.map(([, y]) => ({ above: y < mb.cy })), n: marks.length };
    TC.set(key, t);
    return t;
  }
  const isArTxt = s => /[\u0600-\u06FF]/.test(s);
  const variants = t => {
    const v = [t];
    if (isArTxt(t) && [...t].length === 1 && !/[٠-٩]/.test(t)) {
      if (!/[اأإآدذرزوؤءة]/.test(t)) v.push(t + '\u200D');
      v.push('\u200D' + t);
    }
    if (/^[A-Za-z]$/.test(t)) v.push(t === t.toUpperCase() ? t.toLowerCase() : t.toUpperCase());
    return v;
  };
  function prep(strokes) {
    const S = strokes.filter(s => s && s.length);
    if (!S.length) return null;
    const all = bbox(S.flat()), Z = Math.max(all.w, all.h, 1);
    const main = [], marks = [];
    for (const s of S) {
      const b = bbox(s);
      if (Math.max(b.w, b.h) < Z * 0.16 && plen(s) < Z * 0.42 && S.length > 1) marks.push(b);
      else main.push(s);
    }
    if (!main.length) {
      main.push(...S.filter(s => !marks.includes(bbox(s))));
      if (!main.length) return null;
    }
    const step = Z / 60, P = main.flatMap(s => resample(s, step)), mb = bbox(P);
    return { P, pts: normalize(P), flip: normalize(P.map(([x, y]) => [-x, y])), marks: marks.map(b => ({ above: b.cy < mb.cy })), n: marks.length, size: Z, len: S.reduce((a, s) => a + plen(s), 0) };
  }
  function scoreFor(u, txt) {
    let best = { s: 0 };
    for (const v of variants(txt)) {
      for (const f of FONTS) {
        const t = template(v, f);
        if (!t) continue;
        const r = compare(u.pts, t.pts), rs = compare(normalize(u.P, false), normalize(t.raw, false));
        const x = rs.s > r.s ? rs : r;
        if (x.s > best.s) best = { ...x, t, v };
      }
    }
    return best;
  }
  const marksOk = (u, t, ar) => {
    if (!t || !t.n) return { ok: u.n <= 2, miss: false };
    if (!u.n) return { ok: !ar, miss: true };
    const ta = t.marks.filter(m => m.above).length, ua = u.marks.filter(m => m.above).length;
    const sideOk = (ta > 0) === (ua > 0) || (ta < t.n) === (ua < u.n);
    return { ok: sideOk && Math.abs(u.n - t.n) <= 1, miss: false, side: !sideOk, count: u.n !== t.n };
  };
  function check(strokes, target, o) {
    o = o || {};
    const u = prep(strokes);
    if (!u || (u.len < u.size * 0.6 && strokes.length < 2)) return { ok: false, close: false, score: 0, tip: 'اكتب الحرف كاملًا ثم انتظر قليلًا ✍️', empty: !u };
    const ar = isArTxt(target), me = scoreFor(u, target), mk = marksOk(u, me.t, ar), OK = o.ok || 0.6, NEARV = OK - 0.13;
    let other = null;
    if (o.pool && o.pool.length) {
      for (const c of o.pool) {
        if (c === target) continue;
        const r = scoreFor(u, c);
        if (!other || r.s > other.s) other = { c, s: r.s };
      }
    }
    let s = me.s;
    if (mk.ok) s += 0.03;
    const mir = s < OK && scoreFor({ ...u, pts: u.flip, P: u.P.map(([x, y]) => [-x, y]) }, target);
    const res = { ok: false, close: false, score: +s.toFixed(3), tip: '', as: other && other.s > s ? other.c : null };
    if (other && other.s >= 0.74 && other.s > s + 0.12) {
      res.tip = `هذا يشبه حرف «${other.c}». ونحن نكتب «${target}». انظر إلى الشكل وحاول مرة أخرى 😊`;
      res.close = s >= NEARV;
      return res;
    }
    if (s >= OK) {
      if (mk.miss && ar) { res.close = true; res.tip = 'رائع! لا تنسَ النقاط ✨'; return res; }
      res.ok = true;
      res.tip = mk.miss ? 'أحسنت! وأضف النقطة أيضًا ✨' : !mk.ok && me.t && me.t.n ? (mk.side ? 'أحسنت! انتبه: النقاط في المكان الآخر (فوق/تحت) 👀' : 'أحسنت! انتبه لعدد النقاط 👀') : '';
      return res;
    }
    if (mir && mir.s >= OK && mir.s > s + 0.1) { res.close = true; res.tip = 'الحرف مقلوب مثل المرآة 🪞 اكتبه في الاتجاه الآخر'; return res; }
    res.close = s >= NEARV;
    res.tip = res.close
      ? (me.cov < 0.6 ? 'قريب جدًا! أكمل الجزء الناقص من الشكل 💪' : me.pre < 0.6 ? 'قريب جدًا! حاول أن ترسمه بخط هادئ بلا خطوط زائدة 💪' : 'قريب جدًا! حاول مرة أخرى 💪')
      : (me.cov < 0.45 ? 'ارسم الشكل كاملًا، وانظر إلى النموذج 👀' : 'لنحاول معًا: انظر إلى الشكل ثم اكتبه ببطء 🐢');
    return res;
  }
  const POOLS = {
    ar: [...'ابتثجحخدذرزسشصضطظعغفقكلمنهوي'],
    en: [...'ABCDEFGHIJKLMNOPQRSTUVWXYZ'],
    enl: [...'abcdefghijklmnopqrstuvwxyz']
  };
  const poolFor = t => (/^[A-Z]$/.test(t) ? POOLS.en : /^[a-z]$/.test(t) ? POOLS.enl : /^[\u0621-\u064A]$/.test(t) ? POOLS.ar : null);

  function attach(canvas, o) {
    o = o || {};
    const st = { strokes: [], cur: null, timer: 0, done: false };
    canvas.__ink = st;
    const pt = e => {
      const r = canvas.getBoundingClientRect();
      return [(e.clientX - r.left) * canvas.width / r.width, (e.clientY - r.top) * canvas.height / r.height];
    };
    canvas.addEventListener('pointerdown', e => { clearTimeout(st.timer); st.cur = [pt(e)]; st.strokes.push(st.cur); });
    canvas.addEventListener('pointermove', e => { if (st.cur) st.cur.push(pt(e)); });
    const up = () => {
      if (!st.cur) return;
      st.cur = null;
      if (o.auto !== false && o.target) {
        clearTimeout(st.timer);
        st.timer = setTimeout(() => run(canvas, o), o.wait || 900);
      }
    };
    canvas.addEventListener('pointerup', up);
    canvas.addEventListener('pointercancel', up);
    canvas.addEventListener('pointerleave', up);
    return st;
  }
  function run(canvas, o) {
    const st = canvas.__ink;
    if (!st || !st.strokes.length) return null;
    const t = typeof o.target === 'function' ? o.target() : o.target;
    if (!t) return null;
    const r = check(st.strokes, t, { pool: o.pool !== undefined ? o.pool : poolFor(t) });
    st.last = r;
    o.onResult && o.onResult(r, st);
    return r;
  }
  const clear = canvas => {
    const st = canvas && canvas.__ink;
    if (st) { st.strokes = []; st.cur = null; st.done = false; clearTimeout(st.timer); }
  };
  window.Ink = { check, attach, run, clear, poolFor, _prep: prep, _template: template };
})();
