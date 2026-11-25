/* /src/tutor/mind-hub.js — العقل الموحّد لبومي للعربية والإنجليزية (بدون رياضيات أو مغامرات) */
window.Mind = (() => {
  'use strict';
  const DAY = 864e5, now = () => Date.now();
  const SUBJ = { 'اللغة العربية': 'ar', 'العربية': 'ar', 'اللغة الإنجليزية': 'en', 'الإنجليزية': 'en', 'ألعاب الذكاء': 'iq' };
  const NAME = { ar: 'العربية', en: 'الإنجليزية', iq: 'الذكاء والمنطق', gen: 'عام' };

  const M = () => {
    if (!window.P) return null;
    P.mind = P.mind || {};
    const m = P.mind;
    m.sk = m.sk || {};
    m.src = m.src || {};
    m.seen = m.seen || [];
    return m;
  };

  const ctx = () => {
    try {
      const r = window.BomiCtx && BomiCtx();
      return r ? { ...(r.info || {}), page: r.page } : {};
    } catch (_) {
      return {};
    }
  };

  const entry = () => {
    try {
      const c = window.cur;
      if (c && c.id && typeof window.find === 'function' && /^\d+-\d+$/.test(c.id) && find(c.id)) {
        return `lesson('${c.id}')`;
      }
    } catch (_) {}
    try {
      const e = window.Router && Router.entry();
      if (e && /^(quiz|g2play)$/.test(e.fn)) return '';
      if (e && e.fn && typeof window[e.fn] === 'function') {
        return e.fn + '(' + (e.args || []).map(a => JSON.stringify(a)).join(',') + ')';
      }
    } catch (_) {}
    return '';
  };

  const code = s => {
    if (!s) return 'gen';
    for (const k in SUBJ) if (String(s).includes(k)) return SUBJ[k];
    return /english|إنجليز/i.test(s) ? 'en' : /عرب/.test(s) ? 'ar' : 'gen';
  };

  let saveT = 0;
  const persist = () => {
    clearTimeout(saveT);
    saveT = setTimeout(() => { try { window.save && save(); } catch (_) {} }, 800);
  };

  function upd(s, ok, ms) {
    const p0 = s.p == null ? 0.3 : s.p;
    const gain = ms && ms < 4000 ? 0.3 : 0.22;
    const p = ok ? p0 + (1 - p0) * gain : p0 * 0.62;
    s.p = +Math.min(0.99, Math.max(0.02, p)).toFixed(3);
    s.n = (s.n || 0) + 1;
    s.ok = (s.ok || 0) + (ok ? 1 : 0);
    s.s = ok ? (s.s || 0) + 1 : 0;
    s.due = now() + (ok ? Math.min(30, Math.pow(2, Math.max(0, s.s - 1))) * DAY : 20 * 60000);
    s.t = Math.round(now() / 1000);
    return s;
  }

  let last = { t: 0, sig: '' };
  function record(o) {
    const m = M();
    if (!m || !o) return null;
    const c = o.subject ? null : ctx();
    const subj = o.subject || code(c && c.subject);
    const topic = String(o.topic || (c && (c.lesson || c.course)) || '').replace(/\s+/g, ' ').trim().slice(0, 48) || (NAME[subj] || NAME.gen);
    const sig = subj + '|' + topic + '|' + (o.ok ? 1 : 0);
    if (now() - last.t < 350 && last.sig === sig) return null;
    last = { t: now(), sig };

    const key = subj + ':' + topic;
    const s = m.sk[key] = m.sk[key] || {};
    upd(s, !!o.ok, o.ms);
    s.sub = subj;
    s.name = topic;
    const go = o.go || entry();
    if (go) s.go = go;

    const src = o.src || (c && c.page) || 'نشاط';
    const st = m.src[src] = m.src[src] || { n: 0, ok: 0 };
    st.n++;
    st.ok += o.ok ? 1 : 0;
    st.t = Math.round(now() / 1000);

    if (o.k && window.MindMemory && o.src !== 'quiz') {
      try { MindMemory.observe({ k: o.k, ok: !!o.ok, ms: o.ms, type: o.type }); } catch (_) {}
    }
    persist();
    try { document.dispatchEvent(new CustomEvent('mind-answer', { detail: { key, ok: !!o.ok, p: s.p } })); } catch (_) {}
    return s;
  }

  const pct = p => Math.round((p || 0) * 100);
  function skills(sub) {
    const m = M();
    if (!m) return [];
    return Object.entries(m.sk)
      .filter(([, s]) => s && s.sub !== 'math' && s.sub !== 'adv' && (!sub || s.sub === sub))
      .map(([k, s]) => ({ k, ...s }));
  }

  const weak = n => skills().filter(s => (s.n || 0) >= 3 && s.p < 0.6).sort((a, b) => a.p - b.p).slice(0, n || 5);
  const strong = n => skills().filter(s => (s.n || 0) >= 3 && s.p >= 0.85).sort((a, b) => b.p - a.p).slice(0, n || 5);

  function bySubject() {
    const o = {};
    for (const s of skills()) {
      if (!(s.n >= 2)) continue;
      const sub = NAME[s.sub] ? s.sub : 'gen';
      const x = o[sub] = o[sub] || { n: 0, sum: 0, name: NAME[sub] };
      x.n++;
      x.sum += s.p;
    }
    for (const k in o) o[k].p = o[k].sum / o[k].n;
    return o;
  }

  function nextLessonItem() {
    try {
      const W = window.nextLesson;
      if (W) {
        const L = P.lang === 'en' ? ['en', 'ar'] : ['ar', 'en'];
        for (const l of L) {
          const u = W(l);
          if (u) return u;
        }
        return null;
      }
      const st = S[+P.stage || 0];
      if (st && st.u) {
        for (const u of st.u) if (!(P.done || {})[u.id]) return u;
      }
    } catch (_) {}
    return null;
  }

  function next() {
    if (!window.P) return null;
    try {
      const mList = Object.values(P.mistakes || {}).filter(x => x && !x.resolved);
      if (mList.length >= 3) {
        const lang = mList.filter(x => x.l === 'ar').length >= mList.filter(x => x.l === 'en').length ? 'ar' : 'en';
        return {
          icon: '🩹',
          t: `تَدْرِيبُ الأَخْطَاءِ (${lang === 'en' ? 'الإنجليزية' : 'العربية'})`,
          why: `لَدَيْكَ ${mList.length} أَخْطَاءٍ سَابِقَةٍ — لِنُتْقِنْهَا مَعًا`,
          go: `practiceMistakes('${lang}')`
        };
      }
    } catch (_) {}

    try {
      const due = window.MindMemory
        ? MindMemory.dueItems(null, 30).filter(it => { const s = P.sk[it[0]]; return s && (s.due || 0) < now(); }).length
        : 0;
      if (due >= 4) {
        return { icon: '🔁', t: 'مُرَاجَعَةٌ ذَكِيَّةٌ', why: `حَانَ وَقْتُ مُرَاجَعَةِ ${due} كَلِمَاتٍ تَعَلَّمْتَهَا`, go: 'review()' };
      }
    } catch (_) {}

    const w = weak(3).filter(s => s.go && !/mstart|wnum|measure|wordProblems|advMath|world/.test(s.go));
    if (w.length) {
      const s = w[0];
      return { icon: '🎯', t: 'تَدَرَّبْ: ' + s.name, why: `إِتْقَانُكَ هُنَا ${pct(s.p)}٪ — تَدْرِيبٌ قَصِيرٌ يَرْفَعُهُ`, go: s.go };
    }

    const u = nextLessonItem();
    if (u) return { icon: '▶️', t: u.n, why: 'الدَّرْسُ التَّالِي فِي مَسَارِكَ', go: `lesson('${u.id}')` };
    return { icon: '🏆', t: 'الِاخْتِبَارَاتُ الْمُتَدَرِّجَةُ', why: 'أَتْقَنْتَ دُرُوسَ مَرْحَلَتِكَ! جَرِّبْ تَحَدِّيَ الْمُسْتَوَى', go: 'examHub()' };
  }

  function brief() {
    const m = M();
    if (!m) return '';
    const w = weak(4).map(s => `${s.name} (${NAME[s.sub] || ''} ${pct(s.p)}٪)`);
    const g = strong(3).map(s => s.name);
    const out = [];
    if (w.length) out.push('يحتاج تدريبًا في: ' + w.join('، '));
    if (g.length) out.push('متقن: ' + g.join('، '));
    try {
      const sm = window.MindMemory && MindMemory.summary && MindMemory.summary();
      if (sm && sm.errs && sm.errs.length) out.push('أخطاؤه المتكررة: ' + sm.errs.slice(0, 3).map(e => e.label || e.t).join('، '));
    } catch (_) {}
    const nx = next();
    if (nx) out.push('الخطوة المقترحة: ' + nx.t);
    return out.join(' | ');
  }

  const norm = s => String(s || '').replace(/<[^>]*>/g, ' ').replace(/[ً-ْٰ\s]+/g, '').slice(0, 60);
  function seen(sig) { const m = M(); return !!m && m.seen.includes(norm(sig)); }
  function mark(sig) {
    const m = M();
    if (!m) return;
    const k = norm(sig);
    if (!k) return;
    const i = m.seen.indexOf(k);
    if (i >= 0) m.seen.splice(i, 1);
    m.seen.push(k);
    if (m.seen.length > 120) m.seen.splice(0, m.seen.length - 120);
  }
  function fresh(make, sigOf) {
    let q = null;
    for (let i = 0; i < 5; i++) {
      q = make();
      if (!q || !seen(sigOf(q))) break;
    }
    if (q) mark(sigOf(q));
    return q;
  }

  const ANS = '.opt,.practice-options button,.ct-opts button';
  let t0 = now();
  document.addEventListener('click', e => {
    const el = e.target.closest && e.target.closest(ANS);
    if (!el || el.closest('.g2-pz,.g2-ov,.g2-match')) return;
    const ms = now() - t0;
    const st = () => {
      const c = ' ' + el.className + ' ';
      return / (ok|good|right) /.test(c) ? 1 : / (no|bad|wrong) /.test(c) ? 0 : -1;
    };
    let c0 = null;
    try {
      const x = ctx();
      c0 = { subject: code(x.subject), topic: x.lesson || x.course, src: x.page };
    } catch (_) {}
    const go = entry();
    const fire = v => {
      if (now() - last.t < 120) return;
      record({ ok: !!v, ms, ...(c0 || {}), go });
    };
    const v = st();
    if (v >= 0) fire(v);
    else setTimeout(() => { const v2 = st(); if (v2 >= 0) fire(v2); }, 60);
  }, false);

  new MutationObserver(() => { t0 = now(); }).observe(document.getElementById('app') || document.body, { childList: true });

  if (window.HurufiSound && HurufiSound.play) {
    const op = HurufiSound.play;
    HurufiSound.play = function (k) {
      const r = op.apply(this, arguments);
      if ((k === 'correct' || k === 'wrong') && now() - last.t > 350) {
        try { record({ ok: k === 'correct', ms: now() - t0 }); } catch (_) {}
      }
      return r;
    };
  }

  return { record, weak, strong, skills, bySubject, next, brief, seen, mark, fresh, NAME, pct };
})();
