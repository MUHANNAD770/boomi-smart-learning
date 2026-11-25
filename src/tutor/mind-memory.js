/* /src/tutor/mind-memory.js — الذاكرة التعليمية طويلة المدى (تتبّع المعرفة + التكرار المتباعد) */
window.MindMemory = (() => {
  'use strict';
  const DAY = 864e5, now = () => Date.now();
  const M = () => {
    P.mind = P.mind || {};
    const m = P.mind;
    m.ev = m.ev || [];
    m.err = m.err || {};
    m.vq = m.vq || [];
    m.said = m.said || [];
    return m;
  };

  let S = null, owner = null;
  const sess = () => {
    if (owner !== P || !S) {
      owner = P;
      S = { streak: 0, wrongRow: 0, n: 0, ok: 0, fast: 0, start: now(), lastWrongKey: null, redrill: 0 };
    }
    return S;
  };

  function update(k, ok, ms) {
    const s = P.sk[k] = P.sk[k] || { n: 0, m: 0 };
    const pn = (s.n || 0) - 1, pe = (s.e || 0) - (ok ? 0 : 1);
    let p = s.p == null ? (pn >= 2 ? Math.min(0.85, Math.max(0.15, 1 - Math.max(0, pe) / pn)) : 0.3) : s.p;
    const gain = ms && ms < 4000 ? 0.34 : 0.26;
    p = ok ? p + (1 - p) * gain : p * 0.58;
    s.p = +Math.min(0.99, Math.max(0.02, p)).toFixed(3);
    s.s = ok ? (s.s || 0) + 1 : 0;
    s.due = now() + (ok ? Math.min(30, Math.pow(2, Math.max(0, s.s - 1))) * DAY : 10 * 60000);
    return s;
  }

  function observe(e) {
    const m = M(), s = sess(), sk = update(e.k, e.ok, e.ms);
    s.n++;
    if (e.ok) {
      s.ok++;
      s.streak++;
      s.wrongRow = 0;
      if (e.ms && e.ms < 3500) s.fast++;
    } else {
      s.streak = 0;
      s.wrongRow++;
      s.lastWrongKey = e.k;
    }
    if (e.type && !e.ok) m.err[e.type] = (m.err[e.type] || 0) + 1;
    m.ev.push([e.k.slice(0, 24), +e.ok, Math.round((e.ms || 0) / 100), e.type || '', Math.round(now() / 1000)]);
    if (m.ev.length > 80) m.ev.splice(0, m.ev.length - 80);
    return { sk, sess: s, recovered: e.ok && (sk.e || 0) > 0 && sk.s === 1 };
  }

  const mastery = k => {
    const s = P.sk && P.sk[k];
    return s ? (s.p == null ? (s.n ? 1 - ((s.e || 0) / s.n) : 0) : s.p) : 0;
  };

  function learned(lang) {
    const out = [], seen = new Set();
    const add = u => {
      if (!u || (lang && u.l !== lang)) return;
      for (const it of u.i) {
        if (!seen.has(it[0])) {
          seen.add(it[0]);
          out.push(it);
        }
      }
    };
    for (const id of Object.keys(P.done || {})) {
      try { add(window.find && find(id)); } catch (_) {}
    }
    if (out.length < 6) {
      for (const id of Object.keys(P.sc || {})) {
        try { add(window.find && find(id)); } catch (_) {}
      }
    }
    return out;
  }

  function dueItems(lang, n) {
    const L = learned(lang).map(it => {
      const s = (P.sk && P.sk[it[0]]) || {};
      return [it, (1 - mastery(it[0])) * 2 + ((s.due || 0) < now() ? 1 : 0) + Math.random() * 0.4];
    });
    return L.sort((a, b) => b[1] - a[1]).slice(0, n || 8).map(x => x[0]);
  }

  const ERRN = {
    similar: 'يخلط بين حروف متقاربة في المخرج والنطق',
    dots: 'يخلط بين حروف متشابهة الشكل (النقاط)',
    vowel: 'يخطئ في ضبط الحركات أو الشدّة',
    first: 'يختار كلمة تبدأ بالحرف نفسه دون إكمال القراءة',
    hamza: 'يخلط بين همزة القطع وهمزة الوصل',
    tamarbuta: 'يخلط بين التاء المربوطة والمفتوحة والهاء',
    al: 'يخلط بين اللام الشمسية واللام القمرية',
    alif_layyina: 'يخلط بين الألف اللينة المقصورة والممدودة',
    makharij: 'يحتاج تدريبًا على مخارج الحروف',
    picture: 'يخلط بين صور متقاربة المعنى',
    envowel: 'يخلط بين أصوات الحروف المتحركة بالإنجليزية (vowels)',
    enfirst: 'يختار كلمة إنجليزية تبدأ بالحرف نفسه فقط',
    engrammar: 'يحتاج تثبيت القواعد الإنجليزية',
    enspell: 'يحتاج تدريبًا على التهجئة الإنجليزية',
    voice: 'يحتاج وضوحًا أكثر في النطق الشفهي'
  };

  function summary() {
    const m = M(), E = Object.entries(P.sk || {}), lang = E.filter(([k]) => !k.startsWith('ai:'));
    const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
    const mast = lang.filter(([, s]) => (s.p || 0) >= 0.8).length;
    const weak = lang.filter(([, s]) => s.n >= 2 && (s.p == null ? (s.e || 0) / s.n >= 0.4 : s.p < 0.45))
      .sort((a, b) => (a[1].p || 0) - (b[1].p || 0)).slice(0, 8).map(x => x[0]);
    const errs = Object.entries(m.err).filter(([t]) => ERRN[t])
      .sort((a, b) => b[1] - a[1]).slice(0, 5)
      .map(([t, n]) => ({ t, n, label: ERRN[t] || t }));
    const recent = m.ev.slice(-20);
    const acc = recent.length ? Math.round((recent.filter(e => e[1]).length / recent.length) * 100) : null;
    const speed = recent.length ? avg(recent.map(e => e[2])) / 10 : null;
    return {
      mastered: mast,
      tracked: lang.length,
      weak,
      errs,
      recentAcc: acc,
      avgSec: speed ? +speed.toFixed(1) : null,
      dueCount: lang.filter(([, s]) => (s.due || 0) < now() && s.n).length
    };
  }

  return { M, sess, observe, update, mastery, learned, dueItems, summary, ERRN };
})();
