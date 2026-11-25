/* /src/curriculum/bank.js — الدروس والتدريبات المتدرّجة المدمجة في أكاديميتي العربية والإنجليزية */
(() => {
  'use strict';
  const SUBJ = {
    ar: { file: 'data/ar-bank.json?v=2', name: 'أكاديمية العربية', sub: 'حروف • نحو • إملاء • بلاغة', ic: 'ض', cls: 'ar', l: 'ar' },
    en: { file: 'data/en-bank.json?v=4', name: 'أكاديمية الإنجليزية', sub: 'Letters • Phonics • Words • Grammar', ic: 'ABC', cls: 'en', l: 'en' }
  };
  const DATA = {}, LOAD = {}, IDX = {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const AD = '٠١٢٣٤٥٦٧٨٩', D = n => String(n).replace(/\d/g, d => AD[d]);
  const load = s => DATA[s] ? Promise.resolve(DATA[s]) : (LOAD[s] || (LOAD[s] = fetch(SUBJ[s].file).then(r => r.json()).then(j => { DATA[s] = j; index(s, j); return j; }).catch(e => { LOAD[s] = null; throw e; })));
  const shuf = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  const B = () => { P.bank = P.bank || {}; return P.bank; };
  const key = (sub, si, li) => (sub === 'ar' ? '' : sub + ':') + si + '.' + li;
  const ICON = ['🔤', '✏️', '📖', '🧩', '📚', '🎓', '🏆'];
  const stars = s => s >= 0.9 ? '⭐⭐⭐' : s >= 0.7 ? '⭐⭐' : s > 0 ? '⭐' : '';
  const subOf = s => SUBJ[s] ? s : 'ar';
  const say1 = (t, l) => { try { if (!window.muted || !muted()) say(t, l || 'ar'); } catch (_) {} };
  const goAcademy = sub => { sub = subOf(sub); return window.sec ? sec(sub) : (window.home && home()); };

  function index(s, d) {
    const m = IDX[s] = {};
    d.stages.forEach((st, si) => st.lessons.forEach((l, li) => l.q.forEach(q => { m[q.id] = { si, li, q, topic: q.topic || l.name }; })));
  }

  const ST = () => { const b = B(); b._t = b._t || {}; b._m = b._m || {}; b._a = b._a || {}; return b; };
  function stat(sub, q, topic, ok) {
    const b = ST(), k = sub + '|' + topic, t = b._t[k] = b._t[k] || [0, 0];
    t[1]++; if (ok) t[0]++;
    const a = b._a[sub] = b._a[sub] || [0, 0];
    a[1]++; if (ok) a[0]++;
    const m = b._m[sub] = b._m[sub] || [];
    const i = m.indexOf(q.id);
    if (ok) { if (i >= 0) m.splice(i, 1); } else if (i < 0) { m.push(q.id); if (m.length > 80) m.shift(); }
  }
  const pct = x => x && x[1] ? Math.round((x[0] / x[1]) * 100) : 0;
  function topics(sub) {
    const b = ST(), o = [];
    for (const k in b._t) if (k.startsWith(sub + '|')) { const v = b._t[k]; o.push({ t: k.slice(sub.length + 1), ok: v[0], n: v[1], p: v[0] / v[1] }); }
    return o;
  }
  function mastery(sub, d) {
    const bk = B();
    let done = 0, all = 0;
    d.stages.forEach((s, si) => s.lessons.forEach((_, li) => { all++; if ((bk[key(sub, si, li)] || {}).b >= 0.7) done++; }));
    return { done, all };
  }

  /* تحويل أي نداءات قديمة إلى الأكاديميتين مباشرة بدون واجهة مستقلة للمنهج المتكامل */
  window.bank = () => goAcademy(window.P && P.lang === 'en' ? 'en' : 'ar');
  window.bankSub = sub => goAcademy(sub);

  const rid = () => { try { const c = window.coach && coach(); return c && c.u && c.u.id; } catch (_) { return null; } };
  const coreDisplayName = u => u.id === '2-51' ? 'التَّاءُ الْمَرْبُوطَةُ وَالْمَفْتُوحَةُ (تَدْرِيبٌ إِضَافِيٌّ)' : u.n;
  function coreBtn(u) {
    const open = !window.lessonUnlocked || lessonUnlocked(u);
    const ic = P.done[u.id] ? '✅' : !open ? '🔒' : '⭐';
    return `<button class="row${u.id === rid() ? ' rec' : ''}${open ? '' : ' locked'}" onclick="lesson('${u.id}')"><span>${ic}</span><b>${esc(coreDisplayName(u))}</b><small>${P.sc[u.id] != null ? D(P.sc[u.id]) + '/٥' : (open ? '' : 'مقفل')}</small></button>`;
  }

  const BANK_LABEL = {
    'ar:1.4': ['المعاني وعلامات الترقيم (الأساسية)', ''],
    'ar:2.1': ['الجملة الاسمية والفعلية — تدريبات واختبار', ''],
    'ar:2.2': ['الهمزة المتوسطة — تدريبات واختبار', ''],
    'ar:2.3': ['المفرد والمثنى والجمع — تدريبات واختبار', ''],
    'ar:2.4': ['المعاني وعلامات الترقيم (المتقدمة)', ''],
    'ar:3.3': ['علامات الإعراب (الأساسية)', ''],
    'ar:4.3': ['علامات الإعراب (المتقدمة)', ''],
    'en:0.5': ['المحادثة الأساسية', 'Basic Conversation']
  };
  function bankBtn(sub, si, li, l, bk) {
    const r = bk[key(sub, si, li)] || {};
    const ov = BANK_LABEL[sub + ':' + si + '.' + li];
    const name = ov ? ov[0] : l.name;
    const en = ov ? ov[1] : (l.en || '');
    return `<button class="row" onclick="bankLesson(${si},${li},'${sub}')"><span>${r.b >= 0.7 ? '✅' : (l.ic || '📝')}</span><b>${esc(name)}${en ? ` <small dir=ltr>${esc(en)}</small>` : ''}</b><small>${D(l.q.length)} سؤالًا${r.b != null ? ' · ' + stars(r.b) : ''}</small></button>`;
  }

  function courseResBtn(m, r, sub) {
    const cd = (window.P && P.courseDone) || {};
    const d = !!cd[`${m.id}:${r.id}`];
    const label = m.id === 'bi-colors-shapes' ? (sub === 'en' ? 'Book: English colors' : 'كتاب: الألوان بالعربية') : r.title;
    return `<button class="row" onclick="courseViewer('${m.id}','${r.id}','${sub}')"><span>${d ? '✅' : '📖'}</span><b>${esc(label)}</b><small>${r.pages === 1 ? 'صفحة واحدة' : D(r.pages) + ' صفحات'}</small></button>`;
  }

  function courseGroupBlock(m, rs, sub) {
    const cd = (window.P && P.courseDone) || {};
    const n = rs.filter(r => cd[`${m.id}:${r.id}`]).length;
    const inner = rs.map(r => courseResBtn(m, r, sub)).join('');
    return `<details class="lesson-menu course-sub"><summary><span><b>${m.icon} ${esc(m.title)}</b><small>${D(rs.length)} درسًا · أُنجز ${D(n)}</small></span><i>⌄</i></summary>${typeof window.lzList === 'function' ? lzList(inner) : `<div class=list>${inner}</div>`}</details>`;
  }

  function courseResourcesFor(sub, id) {
    const m = (window.COURSE_MODULES || []).find(x => x.id === id);
    if (!m) return null;
    const rs = m.lang === 'both'
      ? m.resources.filter(r => (/[A-Za-z]/.test(r.title || '') ? 'en' : 'ar') === sub)
      : (m.lang === sub ? m.resources : []);
    return rs.length ? { m, rs } : null;
  }

  function buildUnifiedStages(sub, d) {
    const bk = B(), cd = (window.P && P.courseDone) || {}, STAGES = window.S || [];
    const coreOf = (si, extra) => [
      ...((STAGES[si] && STAGES[si].u ? STAGES[si].u.filter(u => u.l === sub) : [])),
      ...(extra || [])
    ];
    const bankSlice = (si, from, to) => {
      const L = (d && d.stages && d.stages[si] && d.stages[si].lessons) || [];
      return L.map((l, li) => ({ si, li, l })).slice(from, to);
    };
    const courseEntries = ids => {
      const list = [];
      for (const id of ids) {
        const g = courseResourcesFor(sub, id);
        if (g) list.push(g);
      }
      return list;
    };

    const specs = sub === 'ar'
      ? [
          { idx: 0, title: (STAGES[0] && STAGES[0].n) || 'التأسيس المبكر', meta: '٣–٤ سنوات · مبتدئ', core: coreOf(0, window.G && G.g1 ? [G.g1] : []), bank: bankSlice(0, 0), courses: courseEntries(['bi-colors-shapes']) },
          { idx: 1, title: (STAGES[1] && STAGES[1].n) || 'تعلم الحروف', meta: '٥–٦ سنوات · الصف الأول والثاني', core: coreOf(1), bank: bankSlice(1, 0), courses: courseEntries(['ar-letters', 'ar-worksheets']) },
          { idx: 2, title: (STAGES[2] && STAGES[2].n) || 'بداية القراءة والكتابة', meta: '٧–٨ سنوات · الصف الثالث والرابع', core: coreOf(2), bank: bankSlice(2, 0), courses: courseEntries(['ar-sounds', 'ar-reading']) },
          { idx: 3, title: (STAGES[3] && STAGES[3].n) || 'تطوير المهارات', meta: '٩–١٠ سنوات · الصف الخامس والسادس', core: coreOf(3), bank: bankSlice(3, 0), courses: courseEntries(['ar-grammar']) },
          { idx: 4, title: (STAGES[4] && STAGES[4].n) || 'الإتقان والتطوير', meta: '١١–١٢ سنة', core: coreOf(4), bank: [], courses: courseEntries(['ar-practice']) },
          { idx: 5, title: 'المرحلة المتوسطة', meta: '١٣–١٥ سنة · الصف السابع إلى التاسع', core: [], bank: bankSlice(4, 0), courses: [] },
          { idx: 6, title: 'المرحلة الثانوية والبلاغة', meta: '١٦–١٨ سنة · الصف العاشر إلى الثاني عشر', core: [], bank: bankSlice(5, 0), courses: [] }
        ]
      : [
          { idx: 0, title: 'التأسيس المبكر · Early Foundation', meta: '٣–٤ سنوات · مبتدئ', core: coreOf(0, window.G && G.g2 ? [G.g2] : []), bank: bankSlice(0, 0, 6), courses: courseEntries(['en-print', 'bi-colors-shapes', 'en-visual-1']) },
          { idx: 1, title: 'تعلّم الحروف والصوتيات · Letters & Phonics', meta: '٥–٦ سنوات', core: coreOf(1), bank: bankSlice(0, 6), courses: [] },
          { idx: 2, title: 'بداية القراءة والكتابة · Elementary', meta: '٧–٨ سنوات · مبتدئ إلى ابتدائي', core: coreOf(2), bank: bankSlice(1, 0, 9), courses: [] },
          { idx: 3, title: 'تطوير المهارات · Building Skills', meta: '٩–١٠ سنوات', core: coreOf(3), bank: bankSlice(1, 9), courses: courseEntries(['en-visual-3']) },
          { idx: 4, title: 'الإتقان والتطوير · Advanced Mastery', meta: '١١–١٢ سنة · ابتدائي متقدم', core: coreOf(4), bank: bankSlice(2, 0), courses: courseEntries(['en-visual-4']) }
        ];

    return specs.map(sp => {
      const courseResCount = sp.courses.reduce((n, g) => n + g.rs.length, 0);
      const total = sp.core.length + sp.bank.length + courseResCount;
      const done = sp.core.filter(u => P.done && P.done[u.id]).length
        + sp.bank.filter(b => (bk[key(sub, b.si, b.li)] || {}).b >= 0.7).length
        + sp.courses.reduce((n, g) => n + g.rs.filter(r => cd[`${g.m.id}:${r.id}`]).length, 0);
      const pctDone = total ? Math.round((done / total) * 100) : 0;

      const items = [
        ...sp.core.map(coreBtn),
        ...sp.bank.map(b => bankBtn(sub, b.si, b.li, b.l, bk))
      ];
      const inlineCourses = [];
      const groupCourses = [];
      sp.courses.forEach(g => {
        if (g.rs.length <= 4) g.rs.forEach(r => inlineCourses.push(courseResBtn(g.m, r, sub)));
        else groupCourses.push(courseGroupBlock(g.m, g.rs, sub));
      });
      const bodyHtml = `<div class=list>${items.join('')}${inlineCourses.join('')}</div>${groupCourses.join('')}`;
      return { ...sp, total, done, pctDone, bodyHtml };
    }).filter(sp => sp.total > 0);
  }

  function renderAcademyDash(sub, d) {
    const dashEl = document.getElementById(`acad-dash-${sub}`);
    if (!dashEl) return;
    if (!d) { dashEl.innerHTML = ''; return; }
    const { done, all } = mastery(sub, d);
    const a = ST()._a[sub] || [0, 0];
    const miss = (ST()._m[sub] || []).filter(id => IDX[sub] && IDX[sub][id]);
    const tp = topics(sub).filter(t => t.n >= 2);
    const weak = tp.filter(t => t.p < 0.6).sort((x, y) => x.p - y.p).slice(0, 3);
    const strong = tp.filter(t => t.p >= 0.85).sort((x, y) => y.n - x.n).slice(0, 3);
    const R = 34, C = 2 * Math.PI * R, mp = all ? done / all : 0;

    dashEl.innerHTML = `<div class=bk-dash><div class=bk-ring><svg viewBox="0 0 80 80" aria-hidden=true><circle cx=40 cy=40 r=${R} class=bk-rbg /><circle cx=40 cy=40 r=${R} class=bk-rfg stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - mp)}" /></svg><b>${D(Math.round(mp * 100))}٪</b></div>
      <ul><li>📝 التدريبات المتقنة <b>${D(done)} / ${D(all)}</b></li><li>✅ الإجابات الصحيحة <b>${D(a[0])} / ${D(a[1])}</b></li><li>🎯 الدقّة <b>${a[1] ? D(pct(a)) + '٪' : '—'}</b></li></ul></div>
      ${strong.length || weak.length ? `<div class=bk-sw>${strong.length ? `<p>💪 <b>نقاط القوة:</b> ${strong.map(t => esc(t.t)).join('، ')}</p>` : ''}${weak.length ? `<p>🌱 <b>يحتاج تدريبًا:</b> ${weak.map(t => esc(t.t)).join('، ')}</p>` : ''}</div>` : ''}
      <div class=bk-acts><button class=big onclick="bankPractice('${sub}')">🎯 تدريب لمستواك</button>${miss.length ? `<button class=alt onclick="bankReview('${sub}')">🔁 مراجعة أخطائي (${D(miss.length)})</button>` : ''}</div>`;
  }

  window.mountAcademy = function (sub) {
    sub = subOf(sub);
    const host = document.getElementById(`acad-stages-${sub}`);
    if (!host) return Promise.resolve();
    const renderWithData = d => {
      const h2 = document.getElementById(`acad-stages-${sub}`);
      if (!h2) return;
      const opened = new Set([...h2.querySelectorAll('details[data-stage-idx][open]')].map(el => +el.dataset.stageIdx));
      if (!opened.size) opened.add(+((window.P && P.stage) || 0));
      renderAcademyDash(sub, d);
      const stages = buildUnifiedStages(sub, d);
      h2.innerHTML = stages.map(sp => {
        const isOpen = opened.has(sp.idx);
        const content = isOpen
          ? sp.bodyHtml
          : (typeof window.lzList === 'function' ? lzList(sp.bodyHtml, 'acad-lz-wrap') : sp.bodyHtml);
        return `<details class="lesson-menu bank-st" data-stage-idx="${sp.idx}"${isOpen ? ' open' : ''}><summary><span><b>${ICON[sp.idx] || '📘'} ${esc(sp.title)}</b><small>${esc(sp.meta)} · ${D(sp.total)} درسًا وتدريبًا${sp.done ? ` · أُتقن ${D(sp.done)}` : ''}</small><i class=bank-pbar><b style="width:${sp.pctDone}%"></b></i></span><i>⌄</i></summary>${content}</details>`;
      }).join('');
    };
    if (DATA[sub]) { renderWithData(DATA[sub]); return Promise.resolve(); }
    return load(sub).then(renderWithData).catch(() => { renderWithData(null); });
  };

  let S = null;
  const mix = seq => { let a; do a = shuf(seq); while (seq.length > 1 && a.join() === seq.join()); return a; };
  const prep = q => q.m === 'order' ? { ...q, o0: q.o, o: mix(q.seq) } : { ...q, m: q.m || 'mc', o: q.o && shuf(q.o) };
  function start(sub, o) { S = { sub, L: SUBJ[sub].l, i: 0, ok: 0, streak: 0, best: 0, hints: 0, t0: Date.now(), wrong: [], tops: {}, ...o, qs: o.qs.map(prep) }; show(); }

  const showExamSkel = sub => {
    if (!DATA[sub] && window.Skeleton && Skeleton.exam) {
      window.V = 'quiz';
      h(Skeleton.exam());
    }
  };

  window.bankLesson = function (si, li, sub) {
    sub = subOf(sub);
    showExamSkel(sub);
    load(sub).then(d => {
      const st = d.stages[si], l = st && st.lessons[li];
      if (!l) return goAcademy(sub);
      start(sub, { si, li, l, st, name: l.name, qs: l.q });
    }).catch(() => goAcademy(sub));
  };

  window.bankReview = function (sub) {
    sub = subOf(sub);
    showExamSkel(sub);
    load(sub).then(() => {
      const ids = (ST()._m[sub] || []).filter(id => IDX[sub][id]).slice(-12);
      if (!ids.length) return goAcademy(sub);
      start(sub, { kind: 'review', name: '🔁 مراجعة أخطائي', qs: ids.map(id => IDX[sub][id].q) });
    }).catch(() => goAcademy(sub));
  };

  window.bankPractice = function (sub, topic) {
    sub = subOf(sub);
    showExamSkel(sub);
    load(sub).then(d => {
      const all = Object.values(IDX[sub]), bk = B(), tp = {};
      topics(sub).forEach(t => { tp[t.t] = t; });
      const miss = new Set(ST()._m[sub] || []);
      let pool;
      if (topic) pool = all.filter(x => x.topic === topic);
      else {
        let cs = d.stages.findIndex((s, si) => s.lessons.some((l, li) => !((bk[key(sub, si, li)] || {}).b >= 0.7)));
        if (cs < 0) cs = d.stages.length - 1;
        const score = x => {
          const t = tp[x.topic];
          return (miss.has(x.q.id) ? 0 : 1) + (t ? t.p : 0.75) + (x.si === cs ? 0 : 0.6) + Math.random() * 0.3;
        };
        pool = all.filter(x => x.si <= cs).sort((a, b) => score(a) - score(b));
      }
      const qs = shuf(pool.slice(0, topic ? 10 : 16)).slice(0, 10).map(x => x.q);
      if (!qs.length) return goAcademy(sub);
      start(sub, { kind: 'practice', name: topic ? '✏️ تدريب: ' + topic : '🎯 تدريب لمستواك', qs });
    }).catch(() => goAcademy(sub));
  };

  const NAMES = { type: '✍️ اكتب الإجابة', fix: '🛠️ صحّح الجملة', order: '🧩 رتّب البطاقات', match: '🔗 صِل كل كلمة بما يناسبها', write: '📝 اكتب بنفسك' };
  function body(q, dir) {
    const X = S.L === 'en' ? ' dir=ltr' : '';
    switch (q.m) {
      case 'type': return `<div class=bq-type><input id=bq-in class=bq-in${X} autocomplete=off autocapitalize=off spellcheck=false placeholder="…" onkeydown="if(event.key==='Enter')bankCheck()"><button class=big onclick="bankCheck()">تحقّق ✓</button></div>`;
      case 'fix': return `<div class=bq-bad${X}>❌ ${esc(q.bad)}</div><div class=bq-type><textarea id=bq-in class=bq-in${X} rows=2 autocomplete=off spellcheck=false>${esc(q.bad)}</textarea><button class=big onclick="bankCheck()">تحقّق ✓</button></div>`;
      case 'order': return `<div id=bq-line class="bq-line"${X}><small>اضغط البطاقات بالترتيب الصحيح</small></div><div id=bq-pool class=bq-pool${X}>${q.o.map(k => `<button class=bq-tile data-k="${k}" onclick="bankTile(this)">${esc(q.o0[k])}</button>`).join('')}</div><div class=bq-type><button class=big id=bq-chk disabled onclick="bankCheck()">تحقّق ✓</button><button class="link bq-undo" onclick="bankUndo()">↩️ تراجع عن آخر بطاقة</button></div>`;
      case 'match': {
        const R = shuf(q.pr.map((_, k) => k));
        return `<div class=bq-match${X}><div>${q.pr.map((p, k) => `<button class=bq-m data-s=l data-k="${k}" onclick="bankPick(this)">${esc(p[0])}</button>`).join('')}</div><div>${R.map(k => `<button class=bq-m data-s=r data-k="${k}" dir=auto onclick="bankPick(this)">${esc(q.pr[k][1])}</button>`).join('')}</div></div>`;
      }
      case 'write': return `<div class=bq-type><textarea id=bq-in class=bq-in${X} rows=5 placeholder="Write here…" spellcheck=false></textarea><small class=bq-need>✍️ المطلوب: ${D(q.min || 1)} ${q.unit === 'items' ? 'أشياء على الأقل' : q.min > 2 ? 'جمل على الأقل' : q.min === 2 ? 'جملتان على الأقل' : 'جملة على الأقل'}</small><button class=big onclick="bankCheck()">انتهيت ✓</button></div>`;
      default: return `<div class="grid bq-opts${q.o.some(o => o.length > 18) ? ' wide' : ''}">${q.o.map(o => `<button class=opt dir=${dir} data-ok="${o === q.a ? 1 : 0}" data-v="${esc(o)}" onclick="bankAns(this)">${esc(o)}</button>`).join('')}</div>`;
    }
  }

  const isAr = t => /[\u0600-\u06FF]/.test(t || '');
  function qText(q, dir) {
    if (!isAr(q.t) || S.L !== 'en') return `<div class="q bq-text" dir=${dir}>${esc(q.t)}</div>`;
    const m = q.t.match(/^([^A-Za-z]*?[:：])\s*([A-Za-z].*)$/);
    return m ? `<div class="q bq-text" dir=rtl>${esc(m[1])}<span class=bq-en dir=ltr>${esc(m[2])}</span></div>` : `<div class="q bq-text" dir=rtl>${esc(q.t)}</div>`;
  }

  function show() {
    const { i, qs, L } = S;
    if (i >= qs.length) return finish();
    const q = qs[i];
    S.answered = false; S.miss = 0; S.pick = null; S.hn = 0; S.rub = null;
    const dir = L === 'en' ? 'ltr' : 'rtl';
    window.V = 'quiz';
    window.CS = S.sub;
    h(`<section class="sec bank-q"><button class=link onclick="sec('${S.sub}')">→ ${SUBJ[S.sub].name}</button>
      <div class=bq-top><b>${esc(S.name)}</b><small>سؤال ${D(i + 1)} من ${D(qs.length)}${S.streak >= 2 ? ` · <span class=bq-streak>🔥 ${D(S.streak)}</span>` : ''}</small></div>
      <div class=bq-dots>${qs.map((x, k) => `<i class="${k < i ? (x._ok ? 'ok' : 'no') : k === i ? 'cur' : ''}"></i>`).join('')}</div>
      <div class=bq-card>
        ${q._rt ? '<p class=bq-retry>🔁 فُرْصَةٌ ثَانِيَةٌ لِهَذَا السُّؤَالِ</p>' : ''}
        ${q.p ? `<div class=bq-pass dir=${dir}><small>📖 اقرأ النص:</small>${esc(q.p)}</div>` : ''}
        ${NAMES[q.m] ? `<div class=bq-kind>${NAMES[q.m]}</div>` : ''}
        ${q.img ? `<div class="bq-img">${q.img}</div>` : ''}${qText(q, dir)}
        <div class=bq-tools><button class=alt onclick="bankSay()">🔊 اسمع ${q.p ? 'النص والسؤال' : 'السؤال'}</button><button class=alt onclick="bankHint()">💡 تلميح</button><button class="alt bq-ask" onclick="bankBomi()">🦉 اسأل بومي</button></div>
        <p id=bq-hint class=bq-hint hidden></p>
        ${body(q, dir)}
        <div id=bq-fb class=bq-fb hidden></div>
      </div></section>`);
  }

  window.bankSay = () => {
    const q = S && S.qs[S.i];
    if (!q) return;
    const L = [...(q.p ? [[q.p, S.L]] : []), [q.t, isAr(q.t) ? 'ar' : S.L]];
    if (q.m === 'mc') L.push(['الخِيَارَات', 'ar'], ...q.o.map(o => [o, S.L]));
    if (q.m === 'fix') L.push([q.bad, S.L]);
    if (q.m === 'order') L.push(...q.o.map(k => [q.o0[k], S.L]));
    (window.sayList || (lst => say(lst.map(x => x[0]).join('، '), 'ar')))(L);
  };

  function tip(m) {
    const e = document.getElementById('bq-hint');
    if (!e) return;
    e.hidden = false;
    e.textContent = '💡 ' + m;
    e.classList.remove('pop');
    void e.offsetWidth;
    e.classList.add('pop');
    say1(m, 'ar');
  }

  window.bankHint = () => {
    const q = S && S.qs[S.i];
    if (!q || S.answered) return;
    S.hn++; S.hints++;
    const n = S.hn;
    if (n === 1 && q.h) return tip(q.h);
    if (q.m === 'mc') {
      const w = [...document.querySelectorAll('.bq-opts .opt[data-ok="0"]:not(.gone)')];
      if (w.length > 1) {
        const b = w[Math.floor(Math.random() * w.length)];
        b.classList.add('gone');
        b.disabled = true;
        return tip('حَذَفْتُ لَكَ خِيَارًا خَاطِئًا. فَكِّرْ فِي الْبَاقِي 🤔');
      }
      return tip('اقْرَأِ السُّؤَالَ مَرَّةً أُخْرَى، ثُمَّ قَارِنْ بَيْنَ الْخِيَارَيْنِ الْبَاقِيَيْنِ.');
    }
    if (q.m === 'type') {
      const a = (q.acc || [q.a])[0], k = n <= 2 ? n : Math.ceil(a.length / 2);
      return tip(`الإجابة تبدأ بـ «${a.slice(0, k)}» وعدد حروفها ${D(a.replace(/\s/g, '').length)}.`);
    }
    if (q.m === 'fix') {
      const bw = q.bad.split(/\s+/), aw = q.a.split(/\s+/), k = bw.findIndex((w, j) => w !== aw[j]);
      return tip(k >= 0 ? `انظر إلى الكلمة «${bw[k]}» في الجملة: هل هي صحيحة؟` : 'انْتَبِهْ إِلَى الْحُرُوفِ الْكَبِيرَةِ وَعَلَامَاتِ التَّرْقِيمِ.');
    }
    if (q.m === 'order') {
      const line = () => [...document.querySelectorAll('#bq-line .bq-tile')].map(b => +b.dataset.k);
      if (line().some((k, j) => q.o0[k].toLowerCase() !== q.o0[q.seq[j]].toLowerCase())) {
        [...document.querySelectorAll('#bq-line .bq-tile')].reverse().forEach(t => bankBack(t));
      }
      const nx = q.seq[line().length], t = document.querySelector(`#bq-pool .bq-tile[data-k="${nx}"]`);
      if (t) { bankTile(t); return tip('وَضَعْتُ لَكَ الْبِطَاقَةَ التَّالِيَةَ فِي مَكَانِهَا الصَّحِيحِ 👍'); }
      return tip('رَتِّبِ الْبَاقِيَ بِنَفْسِكَ!');
    }
    if (q.m === 'match') {
      const l = document.querySelector('.bq-m[data-s=l]:not(.ok)');
      if (l) {
        const r = document.querySelector(`.bq-m[data-s=r][data-k="${l.dataset.k}"]`);
        S.pick = null; S.helped = 1;
        document.querySelectorAll('.bq-m.sel').forEach(x => x.classList.remove('sel'));
        pair(l, r);
        return tip(`«${l.textContent}» تناسب «${r.textContent}». أكمل الباقي!`);
      }
    }
    if (q.m === 'write') {
      const inp = document.getElementById('bq-in');
      if (inp && !inp.value.trim() && q.sm && q.sm[0]) {
        inp.value = q.sm[0].split(' ').slice(0, 3).join(' ') + ' ';
        inp.focus();
        return tip('كَتَبْتُ لَكَ بِدَايَةَ جُمْلَةٍ، أَكْمِلْهَا بِكَلِمَاتِكَ ✍️');
      }
      return tip(q.cr && q.cr.length ? 'تأكد من: ' + q.cr.slice(0, 2).join(' • ') : 'اكْتُبْ جُمَلًا قَصِيرَةً تَبْدَأُ بِحَرْفٍ كَبِيرٍ وَتَنْتَهِي بِنُقْطَةٍ.');
    }
    tip(q.h || 'اقْرَأِ السُّؤَالَ مَرَّةً أُخْرَى بِهُدُوءٍ 🦉');
  };

  window.bankBomi = m => { try { window.bomi && bomi(); if (m) setTimeout(() => { try { window.bsend && bsend(m); } catch (_) {} }, 60); } catch (_) {} };

  const canon = (s, cs) => {
    s = String(s || '').normalize('NFC').replace(/[’‘`´]/g, "'").replace(/[“”]/g, '"').replace(/\s+/g, ' ').trim().replace(/\s+([.,?!])/g, '$1').replace(/[.!?]+$/, '');
    s = s.replace(/\bcan't\b/gi, 'cannot').replace(/\bcan not\b/gi, 'cannot').replace(/\bwon't\b/gi, 'will not').replace(/\b(\w+)n't\b/gi, '$1 not').replace(/\bI'm\b/g, 'I am').replace(/\b(\w+)'re\b/gi, '$1 are').replace(/\b(it|he|she|that|what|there)'s\b/gi, '$1 is').replace(/(\w)-(\w)/g, '$1 $2');
    return cs ? s : s.toLowerCase();
  };

  window.bankTile = b => {
    if (!S || S.answered) return;
    const ln = document.getElementById('bq-line'), s = ln.querySelector('small');
    if (s) s.remove();
    ln.appendChild(b);
    b.onclick = () => bankBack(b);
    b.classList.add('pop');
    document.getElementById('bq-chk').disabled = !!document.querySelector('#bq-pool .bq-tile');
    try { const q = S.qs[S.i]; say1(q.o0[+b.dataset.k], S.L); } catch (_) {}
  };
  window.bankBack = b => {
    if (!S || S.answered) return;
    document.getElementById('bq-pool').appendChild(b);
    b.onclick = () => bankTile(b);
    document.getElementById('bq-chk').disabled = true;
  };
  window.bankUndo = () => { const t = [...document.querySelectorAll('#bq-line .bq-tile')].pop(); if (t) bankBack(t); };

  function pair(p, b) {
    p.classList.add('ok'); b.classList.add('ok');
    try { window.HurufiSound && HurufiSound.play('select'); } catch (_) {}
    if (!document.querySelector('.bq-m:not(.ok)')) result(S.miss === 0 && !S.helped, '');
  }
  window.bankPick = b => {
    if (!S || S.answered || b.classList.contains('ok')) return;
    const p = S.pick;
    if (!p || p.dataset.s === b.dataset.s) {
      if (p) p.classList.remove('sel');
      S.pick = b;
      b.classList.add('sel');
      if (b.dataset.s === 'l' && S.L === 'en') say1(b.textContent, 'en');
      return;
    }
    p.classList.remove('sel');
    S.pick = null;
    if (p.dataset.k === b.dataset.k) pair(p, b);
    else {
      S.miss++;
      [p, b].forEach(x => { x.classList.add('no'); setTimeout(() => x.classList.remove('no'), 500); });
      try { window.HurufiSound && HurufiSound.play('tap'); } catch (_) {}
    }
  };

  function rubric(q, txt) {
    const t = txt.trim(), low = t.toLowerCase(), need = q.min || 1, C = [];
    const sents = t.split(/(?<=[.!?])\s+|\n+/).map(s => s.trim()).filter(s => /[A-Za-z]{2}/.test(s)), words = t.match(/[A-Za-z']+/g) || [];
    if (q.unit === 'items') {
      const it = t.split(/[,\n،;]|\band\b/i).map(s => s.trim()).filter(s => /[A-Za-z]{2}/.test(s));
      C.push([it.length >= need, `كتبتَ ${D(it.length)} من ${D(need)} أشياء`]);
    } else {
      C.push([sents.length >= need, `عدد الجمل: ${D(sents.length)} من ${D(need)}`]);
      C.push([sents.length > 0 && sents.every(s => /^["']?[A-Z0-9]/.test(s)), 'كل جملة تبدأ بحرف كبير']);
      C.push([sents.length > 0 && sents.every(s => /[.!?]["']?$/.test(s)), 'كل جملة تنتهي بنقطة أو علامة استفهام أو تعجب']);
    }
    C.push([!/[؀-ۿ]/.test(t), 'الكتابة كلها بالإنجليزية']);
    if (/(^|[\s.,])i(\s|')/.test(t)) C.push([false, 'الضمير I يُكتب حرفًا كبيرًا دائمًا']);
    const kw = q.kw || [], hit = kw.filter(k => low.includes(k.slice(0, Math.max(4, k.length - 2))));
    if (kw.length) C.push([hit.length >= 1, 'الكتابة عن موضوع السؤال']);
    C.push([words.length >= Math.max(3, need * (q.unit === 'items' ? 1 : 4)), 'كلمات كافية وجمل كاملة']);
    const p = C.filter(c => c[0]).length / C.length;
    return { C, p, ok: p >= 0.6 };
  }

  window.bankCheck = () => {
    if (!S || S.answered) return;
    const q = S.qs[S.i], inp = document.getElementById('bq-in');
    if (q.m === 'type') {
      const v = canon(inp.value);
      if (!v) return inp.focus();
      inp.disabled = true;
      const ok = [...(q.acc || [q.a]), ...(q.alt || [])].some(a => canon(a) === v);
      inp.classList.add(ok ? 'ok' : 'no');
      return result(ok, '', 0, inp.value.trim());
    }
    if (q.m === 'fix') {
      const v = canon(inp.value, 1);
      if (!v) return inp.focus();
      if (v === canon(q.bad, 1)) {
        inp.classList.add('no');
        setTimeout(() => inp.classList.remove('no'), 500);
        return tip('غَيِّرِ الْخَطَأَ فِي الْجُمْلَةِ أَوَّلًا ✍️');
      }
      inp.disabled = true;
      const ok = [q.a, ...(q.alt || [])].some(a => canon(a, 1) === v);
      inp.classList.add(ok ? 'ok' : 'no');
      return result(ok, '', 0, inp.value.trim());
    }
    if (q.m === 'order') {
      const got = [...document.querySelectorAll('#bq-line .bq-tile')].map(b => q.o0[+b.dataset.k].toLowerCase()), want = q.seq.map(k => q.o0[k].toLowerCase());
      const ok = got.join('|') === want.join('|');
      document.getElementById('bq-line').classList.add(ok ? 'ok' : 'no');
      document.querySelectorAll('.bq-tile,#bq-chk').forEach(x => { x.disabled = true; });
      return result(ok, '', 0, got.join(' '));
    }
    if (q.m === 'write') {
      const w = (inp.value.match(/[A-Za-z']+/g) || []).length;
      if (w < 3) { inp.focus(); return tip('اكْتُبْ جُمْلَةً كَامِلَةً بِالْإِنْجِلِيزِيَّةِ أَوَّلًا ✍️'); }
      inp.disabled = true;
      S.rub = rubric(q, inp.value);
      return result(S.rub.ok, '', 1, inp.value.trim());
    }
  };

  window.bankAns = function (b) {
    if (!S || S.answered) return;
    const q = S.qs[S.i], ok = b.dataset.ok === '1';
    document.querySelectorAll('.bq-opts .opt').forEach(x => { x.disabled = true; if (x.dataset.ok === '1') x.classList.add('ok'); });
    if (!ok) b.classList.add('no');
    result(ok, !ok ? ((q.wa && q.wa[b.dataset.v]) || '') : '', 0, b.dataset.v);
  };

  function result(ok, why, wrote, given) {
    S.answered = true;
    const q = S.qs[S.i], L = S.L;
    q._ok = ok; S.given = given; S.helped = 0;
    if (ok) { if (!q._rt) S.ok++; S.streak++; S.best = Math.max(S.best, S.streak); }
    else {
      S.streak = 0;
      if (!q._rt) S.wrong.push({ q, given });
      if ((q._rt || 0) < 2) S.qs.splice(Math.min(S.qs.length, S.i + 3), 0, { ...q, _ok: undefined, _rt: (q._rt || 0) + 1, o: q.m === 'order' ? mix(q.seq) : q.o && shuf(q.o) });
    }
    const topic = q.topic || (S.l && S.l.name) || S.name;
    stat(S.sub, q, topic, ok);
    const tp = S.tops[topic] = S.tops[topic] || [0, 0];
    tp[1]++; if (ok) tp[0]++;
    try { window.Mind && Mind.record({ ok, subject: S.sub, topic, src: SUBJ[S.sub].name, go: S.si != null ? `bankLesson(${S.si},${S.li},'${S.sub}')` : `bankPractice('${S.sub}')` }); } catch (_) {}
    try { window.HurufiSound && HurufiSound.play(ok ? 'correct' : 'wrong'); } catch (_) {}

    const fb = document.getElementById('bq-fb');
    fb.hidden = false; fb.className = 'bq-fb ' + (ok ? 'good' : 'soft');
    const X = L === 'en' ? ' dir=ltr' : '', r = wrote && S.rub;
    const lead = wrote
      ? (ok ? 'أَحْسَنْتَ! كِتَابَتُكَ جَيِّدَةٌ.' : 'كِتَابَةٌ جَيِّدَةٌ! حَسِّنْهَا بِهَذِهِ النِّقَاطِ:')
      : q.m === 'match'
        ? (ok ? 'أَحْسَنْتَ! وَصَّلْتَ الْكَلِمَاتِ كُلَّهَا صَحِيحَةً.' : 'أَحْسَنْتَ، أَكْمَلْتَ التَّوْصِيلَ! انْتَبِهْ لِلْأَخْطَاءِ فِي الْمَرَّةِ الْقَادِمَةِ.')
        : ok ? 'أحسنت! إجابتك صحيحة.' : 'محاولة جيدة! الإجابة الصحيحة:';
    const showA = !wrote && ((!ok && q.m !== 'match') || (ok && q.m === 'order' && q.list));
    const gave = !ok && !wrote && q.m !== 'match' && given ? `<p class=bq-gave>إجابتك: <b${X}>${esc(given)}</b> ✗</p>` : '';
    const rub = r ? `<ul class=bq-rub>${r.C.map(c => `<li class=${c[0] ? 'y' : 'n'}>${c[0] ? '✅' : '⬜'} ${esc(c[1])}</li>`).join('')}</ul>${(q.sm || []).length ? `<p class=mut>مثال لإجابة جيدة:</p><ul class=bq-sm${X}>${q.sm.map(x => `<li>${esc(x)}</li>`).join('')}</ul>` : ''}${(q.cr || []).length ? `<details class=bq-crd><summary>معايير التقييم</summary><ul class=bq-cr dir=ltr>${q.cr.map(x => `<li>${esc(x)}</li>`).join('')}</ul></details>` : ''}${q.note ? `<p class=mut>${esc(q.note)}</p>` : ''}` : '';
    const ans = showA ? `<p class=bq-ans${X}>${esc(q.a)}</p>` : '';
    const ask = wrote ? 'قَيِّمْ كِتَابَتِي وَصَحِّحْ أَخْطَائِي' : ok ? 'أَعْطِنِي مِثَالًا آخَرَ عَلَى هَذِهِ الْقَاعِدَةِ' : 'لِمَاذَا إِجَابَتِي خَطَأٌ؟ اشْرَحْ لِي الْقَاعِدَةَ';
    fb.innerHTML = `<b class=bq-lead>${ok ? '✅' : '💡'} ${esc(lead)}</b>${gave}${ans}${rub}${why ? `<p class=bq-why>❌ ${esc(why)}</p>` : ''}${q.tr ? `<p class=bq-tr>المعنى: <b>${esc(q.tr)}</b></p>` : ''}${q.e ? `<p class=bq-e>📘 ${esc(q.e)}</p>` : ''}
      <div class=bq-next><button class=big onclick="bankNext()">${S.i + 1 < S.qs.length ? 'التالي ←' : 'النتيجة 🏁'}</button><button class="alt bq-ask" onclick="bankBomi('${ask}')">🦉 ${wrote ? 'بومي يقيّم كتابتي' : ok ? 'مثال آخر من بومي' : 'اشرح لي يا بومي'}</button></div>`;

    try {
      if (!window.muted || !muted()) {
        const spoken = wrote ? (ok ? '' : (q.sm || []).join(' ')) : showA && q.m !== 'match' ? q.a : '';
        if (L === 'en') (window.sayList || (() => {}))([[lead, 'ar'], ...(spoken ? [[spoken, 'en']] : []), ...(why ? [[why, 'ar']] : []), ...(q.e ? [[q.e, 'ar']] : [])]);
        else say(lead + (spoken ? ' ' + spoken : '') + (why ? ' ' + why : '') + (q.e ? ' ' + q.e : ''), 'ar');
      }
    } catch (_) {}
    try { window.MC && MC.mood(ok ? 'happy' : 'tilt', 900); } catch (_) {}
    const d = document.querySelector('.bq-dots i.cur');
    if (d) d.className = ok ? 'ok' : 'no';
    fb.scrollIntoView && fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }

  window.bankNext = () => { if (!S) return; S.i++; try { window.say && say.stop(); } catch (_) {} show(); };
  window.BankNow = function () {
    if (!S || !document.querySelector('.bank-q')) return null;
    const q = S.qs[S.i];
    if (!q) return null;
    const I = {
      subject: SUBJ[S.sub].name,
      lesson: S.name + (q.topic ? ' (موضوع: ' + q.topic + ')' : ''),
      question: (q.t_en ? '(' + q.t_en + ') ' : '') + (q.m === 'fix' ? q.t + ' — الجملة الخاطئة: ' + q.bad : q.m === 'order' ? q.t + ' — البطاقات: ' + q.o0.join(' / ') : q.m === 'match' ? q.t + ' — الأزواج: ' + q.pr.map(p => p[0]).join('، ') : q.t),
      instructions: NAMES[q.m] || 'اختر الإجابة الصحيحة'
    };
    if (q.p) I.text = 'نص القراءة: ' + q.p;
    if (S.answered) {
      I.answered = true;
      I._correct = q.a || (q.sm || []).join(' ') || 'إجابة مفتوحة';
      I.studentAnswer = (S.given || '') + (q._ok ? ' (صحيح)' : ' (خطأ)');
      if (q.e) I.instructions += ' | الشرح: ' + q.e;
    }
    return I;
  };

  function finish() {
    const { sub, si, li, ok } = S, qs = S.qs.filter(q => !q._rt), sc = qs.length ? ok / qs.length : 0, secs = Math.round((Date.now() - S.t0) / 1000);
    let nx = null;
    const d = DATA[sub];
    if (S.si != null) {
      const k = key(sub, si, li), bk = B(), r = bk[k] = bk[k] || {};
      r.b = Math.max(r.b || 0, +sc.toFixed(2));
      r.n = (r.n || 0) + 1;
      r.t = Math.round(Date.now() / 1000);
      r.l = +sc.toFixed(2);
      nx = d.stages[si].lessons[li + 1] ? [si, li + 1] : d.stages[si + 1] ? [si + 1, 0] : null;
    }
    const gain = Math.round(sc * 5) + (S.best >= 5 ? 1 : 0);
    P.star = (+P.star || 0) + gain;
    try { save(); } catch (_) {}
    const tp = Object.entries(S.tops).map(([t, v]) => ({ t, p: v[0] / v[1] })), good = tp.filter(x => x.p >= 0.8), bad = tp.filter(x => x.p < 0.6), X = S.L === 'en' ? ' dir=ltr' : '';
    window.V = 'fin';
    h(`<section class="sec bank-end"><div class=be-hero><h1>${sc >= 0.9 ? '🏆' : sc >= 0.7 ? '🌟' : '💪'}</h1><h2>${D(ok)} من ${D(qs.length)} ${stars(sc)}</h2>
      <p>${sc >= 0.9 ? 'ممتاز! أتقنت هذا الدرس تمامًا.' : sc >= 0.7 ? 'أحسنت! أتقنت هذا الدرس.' : 'تدرّب مرة أخرى، وستتقنه!'} +${D(gain)} ⭐</p>
      <ul class=be-st><li>🎯<b>${D(Math.round(sc * 100))}٪</b><small>الإتقان</small></li><li>🔥<b>${D(S.best)}</b><small>أطول سلسلة</small></li><li>⏱️<b dir=ltr>${D(Math.floor(secs / 60))}:${D(String(secs % 60).padStart(2, '0'))}</b><small>الوقت</small></li><li>💡<b>${D(S.hints)}</b><small>تلميحات</small></li></ul></div>
      ${good.length ? `<p class=be-sw>💪 <b>أتقنت:</b> ${good.map(x => esc(x.t)).join('، ')}</p>` : ''}
      ${bad.length ? `<div class=be-sw>🌱 <b>تحتاج تدريبًا (اضغط للتدريب):</b><div class=be-chips>${bad.map(x => `<button class=be-chip onclick="bankPractice('${sub}',this.dataset.t)" data-t="${esc(x.t)}" dir=auto>✏️ ${esc(x.t)}</button>`).join('')}</div></div>` : ''}
      ${S.wrong.length ? `<details class=be-wrong><summary>📝 راجع أخطاءك (${D(S.wrong.length)})</summary>${S.wrong.map(w => `<div class=be-w><p${X}>${esc(w.q.t)}</p>${w.given && w.q.m !== 'write' && w.q.m !== 'match' ? `<p class=be-no${X}>✗ ${esc(w.given)}</p>` : ''}<p class=be-ok${X}>✓ ${esc(w.q.a)}</p>${w.q.e ? `<small>${esc(w.q.e)}</small>` : ''}</div>`).join('')}</details>` : ''}
      <div class=be-acts>${nx ? `<button class=big onclick="bankLesson(${nx[0]},${nx[1]},'${sub}')">▶️ الدرس التالي: ${esc(d.stages[nx[0]].lessons[nx[1]].name)}</button>` : ''}
        ${S.wrong.length ? `<button class=alt onclick="bankReview('${sub}')">🔁 أعد أخطائي</button>` : ''}
        ${S.si != null ? `<button class=alt onclick="bankLesson(${si},${li},'${sub}')">🔁 أعد الدرس</button>` : `<button class=alt onclick="bankPractice('${sub}')">🎯 تدريب آخر</button>`}
        <button class=alt onclick="bankBomi('اقْتَرِحْ عَلَيَّ خُطَّةَ تَدْرِيبٍ لِمَا أَخْطَأْتُ فِيهِ')">🦉 خطة تدريب من بومي</button>
        <button class=alt onclick="sec('${sub}')">📚 ${SUBJ[sub].name}</button></div></section>`);
    try { window.HurufiSound && HurufiSound.play(sc >= 0.7 ? 'finish' : 'wrong'); } catch (_) {}
    say1(sc >= 0.7 ? 'أَحْسَنْتَ! أَتْقَنْتَ هَذَا الدَّرْسَ.' : 'تَدَرَّبْ مَرَّةً أُخْرَى، وَسَتُتْقِنُهُ!', 'ar');
    try { window.checkBadges && setTimeout(checkBadges, 900); } catch (_) {}
  }

  window.BankReport = function () {
    const b = (window.P && P.bank) || {};
    if (!b._a || !Object.keys(b._a).length) return '';
    return `<div class=bk-rep><h4>📚 التقدّم في التدريبات المتدرّجة</h4>${Object.keys(SUBJ).filter(s => b._a[s]).map(s => {
      const a = b._a[s], tp = topics(s).filter(t => t.n >= 2);
      const dn = Object.entries(b).filter(([k, v]) => v && v.b >= 0.7 && (s === 'ar' ? /^\d+\.\d+$/.test(k) : k.startsWith(s + ':'))).length;
      const weak = tp.filter(t => t.p < 0.6).sort((x, y) => x.p - y.p).slice(0, 4);
      const strong = tp.filter(t => t.p >= 0.85).sort((x, y) => y.n - x.n).slice(0, 4);
      return `<div class=bk-rs><b>${SUBJ[s].name}</b><ul><li>التدريبات المتقنة<em>${D(dn)}</em></li><li>الإجابات<em>${D(a[1])}</em></li><li>الدقّة<em>${D(pct(a))}٪</em></li><li>أخطاء للمراجعة<em>${D(((b._m && b._m[s]) || []).length)}</em></li></ul>
        ${strong.length ? `<p>💪 القوة: ${strong.map(t => esc(t.t) + ' (' + D(Math.round(t.p * 100)) + '٪)').join('، ')}</p>` : ''}
        ${weak.length ? `<p>🌱 يحتاج تدريبًا: ${weak.map(t => `<button class=link onclick="bankPractice('${s}',this.dataset.t)" data-t="${esc(t.t)}">${esc(t.t)} (${D(Math.round(t.p * 100))}٪)</button>`).join('، ')}</p>` : ''}</div>`;
    }).join('')}</div>`;
  };

  try {
    const doneN = f => Object.entries((window.P && P.bank) || {}).filter(([k, v]) => v && v.b >= 0.7 && f(k)).length;
    const ans = s => ((((window.P && P.bank) || {})._a || {})[s] || [0, 0]);
    const BG = window.BADGES;
    if (BG && !BG.some(b => b[0] === 'bk1')) {
      BG.push(
        ['bk1', '🎓', 'أول تدريب متدرّج', () => doneN(() => true) >= 1],
        ['bk10', '📘', '١٠ تدريبات متقنة', () => doneN(() => true) >= 10],
        ['bkar', '🌙', 'نجم أكاديمية العربية', () => doneN(k => /^\d+\.\d+$/.test(k)) >= 5],
        ['bken', '🔠', 'English academy star', () => doneN(k => k.startsWith('en:')) >= 5],
        ['bk100', '💯', '١٠٠ إجابة متدرّجة صحيحة', () => ans('ar')[0] + ans('en')[0] >= 100]
      );
    }
  } catch (_) {}
})();
