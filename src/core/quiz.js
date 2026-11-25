/* src/core/quiz.js — محرّك الدروس والاختبارات والتعلّم التكيّفي (العربية والإنجليزية فقط، بلا رياضيات) */
(() => {
  'use strict';

  const OKS = {
    ar: ['مُمْتَازٌ!', 'رَائِعٌ!', 'يَا سَلَامُ! أَحْسَنْتَ!', 'إِجَابَةٌ صَحِيحَةٌ!', 'عَظِيمٌ جِدًّا!', 'أَنْتَ نَجْمٌ!'],
    en: ['Great job!', 'Excellent!', 'Well done!', 'Perfect!', 'Awesome!', 'You did it!', 'Fantastic!']
  };
  const ENC = ['لَا بَأْسَ!', 'قَرِيبٌ!', 'حَاوِلْ مَرَّةً أُخْرَى!'];

  let t0 = 0;
  let hr = 3;
  let sp1 = null;
  let activeMic = null;

  const stopSpeakMic = () => {
    if (activeMic) {
      try { activeMic.stop(); } catch {}
      activeMic = null;
    }
  };

  function qn(text) {
    return typeof window.studentGenderText === 'function' ? window.studentGenderText(text) : text;
  }

  function catOf(x) {
    return x && x.typ ? 'w' : 'r';
  }

  function nextAfterCur() {
    try {
      const id = window.cur && cur.id;
      if (!id || !/^\d+-\d+$/.test(id)) return null;
      const u = find(id);
      if (!u) return null;
      const all = S.flatMap(st => st.u).filter(x => x.l === u.l);
      const i = all.indexOf(u);
      if (i < 0) return null;
      const n = all[i + 1];
      const open = x => !window.lessonUnlocked || lessonUnlocked(x);
      if (n && open(n)) return n;
      const a = +id.split('-')[0];
      const here = S[a] ? S[a].u.filter(x => x.l === u.l && x !== u && !(P.done || {})[x.id] && open(x)) : [];
      return here[0] || null;
    } catch {
      return null;
    }
  }

  function nextLabel() {
    const n = nextAfterCur();
    if (n) return '▶️ الدَّرْسُ التَّالِي: ' + n.n;
    let l = '';
    try { l = find(cur.id).l; } catch {}
    return '📚 ' + (l === 'en' ? 'دُرُوسُ English' : 'دُرُوسُ الْعَرَبِيَّةِ');
  }

  function goNextLesson() {
    const n = nextAfterCur();
    if (n) return lesson(n.id);
    let l = '';
    try { l = find(cur.id).l; } catch {}
    sec(l === 'en' ? 'en' : l === 'ar' ? 'ar' : 'les');
  }

  /* ---------- أسئلة المفردات العامة (احتياطي عند الحاجة) ---------- */
  function lq(it, pool) {
    const s = (P.sk && P.sk[it[0]]) || {};
    const m = ((s.lm ?? 2) + 1) % 3;
    const typ = s.n >= 3 && !s.m && stripD(it[0]).length < 12 && !/\s/.test(it[0]) && Math.random() < 0.45;
    const rawPool = (pool || []).filter(x => x && x[0] && x[1] && x[1] !== it[1] && x[0] !== it[0]);
    const pickKey = m ? (x => x[1]) : (x => x[0]);
    const o = uniqueOpts(it, rawPool, pickKey, 4);
    const ex = [`الصَّحِيحُ: ${it[0]} ${it[1]}`, `اِسْتَمِعْ 🔊 ثُمَّ انْظُرْ: ${it[0]} ⟵ ${it[1]}`];
    if (typ) {
      return {
        k: it[0],
        m: 3,
        l: it[2] || 'ar',
        typ: it[0],
        show: `<div class=q>${esc(it[1])}</div><p class=mut>اُكْتُبِ الْكَلِمَةَ</p>`,
        sp: [it[0], it[2] || 'ar'],
        ex,
        opts: []
      };
    }
    return {
      k: it[0],
      m,
      l: it[2] || 'ar',
      sp: m ? [it[0], it[2] || 'ar'] : null,
      show: `<div class=q dir=auto>${m === 0 ? esc(it[1]) : m === 1 ? '🔊' : esc(it[0])}</div>`,
      opts: o.map(x => ({ h: esc(m ? x[1] : x[0]), ok: x === it })),
      ex
    };
  }

  function wsample(pool, n) {
    const list = (pool || []).filter(x => x && x[0]);
    return list
      .map(x => {
        const s = (P && P.sk && P.sk[x[0]]) || {};
        const weight = 1 + 2 * (s.m || 0) + (s.n ? 0 : 1) + Math.min(3, (Date.now() - (s.t || 0)) / 864e5);
        return [x, -Math.log(Math.random() || 0.01) / weight];
      })
      .sort((a, b) => a[1] - b[1])
      .slice(0, n)
      .map(x => x[0]);
  }

  /* ---------- استخراج مقاطع النطق للسؤال ---------- */
  const EMJ = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B00}-\u{2BFF}\u{FE0F}]/gu;
  const tx = s => String(s || '').replace(/<[^>]*>/g, ' ').replace(EMJ, ' ').replace(/\s+/g, ' ').trim();

  function qSegs(s) {
    let t = tx(s)
      .replace(/\(\s*[\u0621-\u064A][\u064B-\u0652]*\s*\)/g, ' ')
      .replace(/[«»“”"⟵⟶←→⬅➡()]/g, ' ')
      .replace(/\s[—–-]\s/g, ' ، ');
    const AL = '[ء-ي][ً-ْ]*';
    const FR = new RegExp('(?:^|\\s)(?:(?:' + AL + '|[A-Za-z]|[؟?])\\s+)+(?:' + AL + '|[A-Za-z]|[؟?])(?=\\s|$)', 'g');
    t = t.replace(FR, m => (/[؟?]/.test(m) && m.trim().split(/\s+/).length >= 2 ? ' ' : m))
      .replace(/_{2,}/g, ' … ')
      .replace(/\s+([؟?!.،,])/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    const out = [];
    for (const m of t.matchAll(/[A-Za-z][A-Za-z0-9’'.,!?…\s]*|[^A-Za-z]+/g)) {
      const y = m[0].replace(/^[\s,،.…]+|[\s,،…]+$/g, '').trim();
      if (!y || !/[\p{L}]/u.test(y)) continue;
      out.push([y, /[A-Za-z]/.test(y) ? 'en' : 'ar']);
    }
    return out;
  }

  function qList(x) {
    const L = [];
    const add = (t, l) => { if (t) L.push([t, l]); };
    if (!x) return L;
    if (x.typ) add('اُكْتُبِ الْكَلِمَةَ الَّتِي تَسْمَعُهَا', 'ar');
    else if (x.w) add(x.w === 'build' ? 'رَتِّبِ الْحُرُوفَ لِتُكَوِّنَ الْكَلِمَةَ' : 'رَتِّبِ الْكَلِمَاتِ لِتُكَوِّنَ الْجُمْلَةَ', 'ar');
    else if (x.m === 1) add('اِسْتَمِعْ جَيِّدًا، ثُمَّ اخْتَرِ الْإِجَابَةَ الْمُنَاسِبَةَ', 'ar');
    else {
      const sg = qSegs(x.show);
      if (!sg.length || !sg.some(z => /[؟?]|اخْتَر|اِخْتَر|Choose/.test(z[0]))) {
        add('اِخْتَرِ الْإِجَابَةَ الْمُنَاسِبَةَ', 'ar');
      }
      sg.forEach(z => L.push(z));
    }
    if (x.sp && !L.some(z => z[0] === x.sp[0] && z[1] === x.sp[1])) {
      L.push([x.sp[0], x.sp[1]]);
    }
    if (!x.typ && !x.w && Array.isArray(x.opts)) {
      const os = x.opts.map(o => tx(o.h)).filter(t => t && t.length <= 48 && /[\p{L}\p{N}]/u.test(t));
      if (os.length >= 2) {
        L.push(['الْخِيَارَاتُ', 'ar']);
        os.forEach(t => {
          const sg = qSegs(t);
          if (sg.length) sg.forEach(z => L.push(z));
        });
      }
    }
    return L;
  }

  function sayList(L, doneOrStart = 0) {
    if (!L || (window.muted && muted())) {
      if (typeof doneOrStart === 'function') setTimeout(doneOrStart, 20);
      return;
    }
    if (window.HurufiVoice && typeof HurufiVoice.sayList === 'function') {
      return HurufiVoice.sayList(L, doneOrStart);
    }
    const i = typeof doneOrStart === 'number' ? doneOrStart : 0;
    const done = typeof doneOrStart === 'function' ? doneOrStart : null;
    if (i >= L.length) { done && done(); return; }
    if (typeof window.say === 'function') {
      const ep = window.BumiAudio ? BumiAudio.epoch() : 0;
      say(L[i][0], L[i][1] || 'ar', () => {
        const m = say.tk;
        setTimeout(() => {
          if (say.tk === m && (!window.BumiAudio || BumiAudio.within(ep))) {
            sayList(L, done ? i + 1 : i + 1);
          }
        }, 200);
      });
    }
  }

  /* ---------- الإعداد وتحديد المستوى والشخصيات ---------- */
  function setup() {
    V = 'setup';
    const c = ['#ffc93c', '#7fd8be', '#ff9db8', '#9cc2ff', '#ffc93c', '#7fd8be'];
    const tiles = [['أ', 'ar', 'ألف'], ['A', 'en', 'A'], ['ب', 'ar', 'باء'], ['B', 'en', 'B'], ['ت', 'ar', 'تاء'], ['C', 'en', 'C']];
    const hasKids = window.DB && DB.kids && DB.kids.length > 0;
    h(`${hasKids ? '<button class=link onclick="goBack()">← رُجُوعٌ</button>' : ''}<h1>حُرُوفِي</h1>
      <p class=mut>تَعَلَّمِ الْعَرَبِيَّةَ وَالْإِنْجِلِيزِيَّةَ خُطْوَةً بِخُطْوَةٍ مَعَ بُومِي 🦉 اِضْغَطْ عَلَى الْحُرُوفِ لِتَسْمَعَهَا!</p>
      <div class=tiles>${tiles.map((t, i) => `<button class=tile style="background:${c[i]}" onclick="this.classList.remove('b');void this.offsetWidth;this.classList.add('b');say('${t[2]}','${t[1]}')">${t[0]}</button>`).join('')}</div>
      <label for=nm>اِسْمُ الطَّالِبِ</label><input id=nm autocomplete=off placeholder="اكْتُبِ اسْمَكَ هُنَا">
      <fieldset class=gender><legend>جِنْسُ الطَّالِبِ</legend>
        <label><input type=radio name=gender value=male checked> ذَكَرٌ</label>
        <label><input type=radio name=gender value=female> أُنْثَى</label>
      </fieldset>
      <label for=ag>عُمْرُ الطَّالِبِ</label>
      <select id=ag>${[3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => `<option value=${n} ${n === 6 ? 'selected' : ''}>${D(n)} سَنَوَاتٍ</option>`).join('')}</select>
      <label for=lg>مَسَارُ التَّعَلُّمِ</label>
      <select id=lg>
        <option value=both>الْعَرَبِيَّةُ وَالْإِنْجِلِيزِيَّةُ مَعًا</option>
        <option value=ar>الْعَرَبِيَّةُ فَقَطْ</option>
        <option value=en>الْإِنْجِلِيزِيَّةُ فَقَطْ</option>
      </select>
      <button class=big onclick="start()">اِبْدَأِ اخْتِبَارَ تَحْدِيدِ الْمُسْتَوَى 🚀</button>`);
  }

  function start() {
    const nmEl = document.getElementById('nm');
    const agEl = document.getElementById('ag');
    const lgEl = document.getElementById('lg');
    const n = (nmEl ? nmEl.value : '').replace(/[<>&"'`]/g, '').trim() || 'صديقي';
    const a = +(agEl ? agEl.value : 6);
    const gender = document.querySelector('input[name=gender]:checked')?.value || 'male';
    const lang = (lgEl ? lgEl.value : 'both') || 'both';
    const stage = Math.max(0, Math.min(4, Math.floor((a - 3) / 2)));

    P = {
      name: n,
      gender,
      age: a,
      lang,
      stage,
      done: {},
      sc: {},
      mic: 0,
      exams: {},
      mistakes: {}
    };
    DB.kids.push(P);
    DB.cur = DB.kids.length - 1;
    ens();
    save();
    place();
  }

  function place() {
    const us = units(P.stage).filter(u => u.i && u.i.length >= 4);
    const pool = us.flatMap(u => u.i);
    cur = { id: 'pl', n: 'اِخْتِبَارُ تَحْدِيدِ الْمُسْتَوَى', i: pool };
    tries = 0;
    try {
      if (us.length) {
        const pickUnits = shuf(us);
        cur.qs = [0, 1, 2, 3, 4].map(k => {
          const u = pickUnits[k % pickUnits.length];
          const it = u.i[Math.floor(Math.random() * u.i.length)];
          return lq(it, u.i);
        });
      }
    } catch {}
    quiz();
  }

  function who() {
    V = 'who';
    h(`<h1>مَنْ سَيَتَعَلَّمُ الْيَوْمَ؟ 🦉</h1>
      <div class=list>${DB.kids.map((k, i) => `<button class=row onclick="DB.cur=${i};P=load();ens();home()"><span>${k.gender === 'female' ? '👧' : '👦'}</span><b>${esc(k.name)}</b><small>⭐ ${D(k.star || 0)}</small></button>`).join('')}</div>
      <button class=alt onclick="setup()">+ إِضَافَةُ طَالِبٍ جَدِيدٍ</button>`);
  }

  function cert() {
    V = 'cert';
    h(`<div class=cert>
        <h1>🏆</h1>
        <h2>شَهَادَةُ إِنْجَازٍ</h2>
        <p>تُمْنَحُ هَذِهِ الشَّهَادَةُ إِلَى</p>
        <h1>${esc(P.name)}</h1>
        <p>${qn(`لِجَمْعِكَ ${D(P.star || 0)} نَجْمَةً فِي التَّعَلُّمِ وَالإِتْقَانِ. نَحْنُ فَخُورُونَ بِكَ!`)}</p>
        <p>${day()}</p>
      </div>
      <button class=big onclick="window.print()">🖨️ طِبَاعَةُ الشَّهَادَةِ</button>
      <button class=link onclick="goBack()">← رُجُوعٌ</button>`);
  }

  /* ---------- الدروس والكتابة ---------- */
  function pad(clr, target) {
    const c = document.getElementById('pad');
    if (!c) return;
    const x = c.getContext('2d');
    if (clr) {
      x.clearRect(0, 0, c.width, c.height);
      window.Ink && Ink.clear(c);
      return;
    }
    c.width = c.offsetWidth || 300;
    c.height = target ? 220 : 160;
    if (window.Ink) {
      Ink.attach(c, { target: target || null, wait: 900, onResult: r => window.wcheck && wcheck(r) });
    }
    x.lineWidth = 8;
    x.lineCap = 'round';
    x.strokeStyle = '#3b7bf0';
    let d = 0;
    const pt = e => {
      const r = c.getBoundingClientRect();
      return [(e.clientX - r.left) * c.width / (r.width || 1), (e.clientY - r.top) * c.height / (r.height || 1)];
    };
    c.onpointerdown = e => { d = 1; x.beginPath(); x.moveTo(...pt(e)); };
    c.onpointermove = e => { if (d) { x.lineTo(...pt(e)); x.stroke(); } };
    c.onpointerup = c.onpointerleave = c.onpointercancel = () => { d = 0; };
    const cb = document.querySelector('.link[onclick="pad(1)"]');
    if (cb) {
      cb.onclick = () => {
        x.clearRect(0, 0, c.width, c.height);
        window.Ink && Ink.clear(c);
        const m = document.getElementById('wm');
        if (m) { m.textContent = ''; m.className = 'mut ink-msg'; }
      };
    }
  }

  function lesson(id) {
    const u = find(id);
    if (!u) return home();
    if (window.lessonUnlocked && !lessonUnlocked(u)) {
      const n = window.nextLesson && nextLesson(u.l);
      V = 'lesson';
      return h(`<button class=link onclick="goBack()">← رُجُوعٌ</button>
        <div class="lock-screen"><div class=lock-big>🔒</div><h2>${esc(u.n)}</h2>
        <p class=mut>${qn('أَتْمِمِ الدَّرْسَ السَّابِقَ أَوَّلًا لِيُفْتَحَ لَكَ هَذَا الدَّرْسُ بِسُهُولَةٍ.')}</p>
        ${n ? `<button class=big onclick="lesson('${n.id}')">▶️ الدَّرْسُ الْمُقْتَرَحُ: ${esc(n.n)}</button>` : ''}
        <button class=alt onclick="home()">🏠 الرَّئِيسِيَّةُ</button></div>`);
    }
    cur = u;
    V = 'lesson';
    tries = 0;
    h(`<button class=link onclick="goBack()">← رُجُوعٌ</button>
      <h2>${esc(cur.n)}</h2>
      <p class=mut>${qn('اِضْغَطْ عَلَى كُلِّ بِطَاقَةٍ لِتَسْمَعَ النُّطْقَ الصَّحِيحَ')}</p>
      <div class=grid>${cur.i.map((x, j) => `<button class=card onclick="say(cur.i[${j}][0],cur.i[${j}][2]||'${cur.l}')">${cur.k ? `<i>${esc(x[0][0])}</i>` : ''}<span>${esc(x[1])}</span><b dir=auto>${esc(x[0])}</b></button>`).join('')}</div>
      ${P.stage <= 2 ? `<p class=mut>${qn('جَرِّبِ الْكِتَابَةَ بِإِصْبَعِكَ:')}</p><canvas id=pad></canvas><button class=link onclick="pad(1)">🧽 مَسْحٌ</button>` : ''}
      <button class=big onclick="quiz()">اِبْدَأِ الِاخْتِبَارَ ✨</button>`);
    pad();
    try { window.EnLessonTypes && EnLessonTypes.decorateLesson && EnLessonTypes.decorateLesson(); } catch {}
    try { window.FocusLesson && FocusLesson.decorate && FocusLesson.decorate(); } catch {}
  }

  /* ---------- المراجعة وتحدي اليوم ---------- */
  const dueN = () => Object.keys(P.done || {}).flatMap(k => {
    try { const u = find(k); return (u && u.i) || []; } catch { return []; }
  }).filter(x => {
    const s = (P.sk && P.sk[x[0]]) || {};
    return s.m > 0 || Date.now() - (s.t || 0) > 2 * 864e5;
  }).length;

  function review() {
    const it = Object.keys(P.done || {}).filter(k => {
      try { return !!find(k); } catch { return false; }
    }).flatMap(k => find(k).i);
    if (!it.length) {
      V = 'lesson';
      return h(`<button class=link onclick="goBack()">← رُجُوعٌ</button><h1>🔁</h1>
        <h2>لَا تُوجَدُ مُرَاجَعَةٌ بَعْدُ</h2>
        <p class=mut>${qn('أَتْقِنْ دَرْسًا وَاحِدًا عَلَى الْأَقَلِّ، ثُمَّ تَظْهَرُ هُنَا كَلِمَاتُ الْمُرَاجَعَةِ.')}</p>
        <button class=big onclick="sec('les')">اِذْهَبْ إِلَى الدُّرُوسِ</button>`);
    }
    cur = { id: 'rv', n: 'مُرَاجَعَةٌ ذَكِيَّةٌ', i: it };
    quiz();
  }

  function daily() {
    const arU = S[P.stage] ? S[P.stage].u.filter(u => u.l === 'ar' && u.i && u.i.length >= 2) : [];
    const enU = S[P.stage] ? S[P.stage].u.filter(u => u.l === 'en' && u.i && u.i.length >= 2) : [];
    const picked = [];
    if (P.lang !== 'en' && arU.length) {
      const u = pk(arU);
      const qz = window.ArLessonQuiz && ArLessonTypes && ArLessonTypes.isArLesson(u) ? ArLessonQuiz(u, 3) : wsample(u.i, 3).map(x => lq(x, u.i));
      picked.push(...qz.slice(0, 3));
    }
    if (P.lang !== 'ar' && enU.length) {
      const u = pk(enU);
      const qz = window.EnLessonQuiz && EnLessonTypes && EnLessonTypes.isEnLesson(u) ? EnLessonQuiz(u, 3) : wsample(u.i, 3).map(x => lq(x, u.i));
      picked.push(...qz.slice(0, 3));
    }
    if (!picked.length) {
      const L = units(P.stage).flatMap(u => u.i);
      picked.push(...wsample(L, 5).map(x => lq(x, L)));
    }
    cur = { id: 'dy', n: 'تَحَدِّي الْيَوْمِ 🎯', qs: shuf(picked).slice(0, 5) };
    quiz();
  }

  /* ---------- محرّك الاختبار والتصحيح ---------- */
  function quiz() {
    V = 'quiz';
    const c = cur;
    if (!c || !(c.qs || (c.i && c.i.length))) return home();
    if (c.qs) {
      qs = c.qs;
    } else if (window.ArLessonTypes && ArLessonTypes.isArLesson(c) && typeof window.ArLessonQuiz === 'function') {
      qs = ArLessonQuiz(c, 5);
    } else if (window.EnLessonTypes && EnLessonTypes.isEnLesson(c) && typeof window.EnLessonQuiz === 'function') {
      qs = EnLessonQuiz(c, 5);
    } else {
      qs = wsample(c.i, 5).map(x => lq(x, c.i));
    }
    if (!qs || !qs.length) return home();
    qi = 0;
    sc = 0;
    hr = 3;
    window.__streak = 0;
    try { window.MindCoach && MindCoach.newQuiz(); } catch {}
    q();
  }

  function q() {
    const x = qs[qi];
    if (!x) return fin();
    try {
      if (window.MindCoach && !(cur && cur.id === 'pl')) MindCoach.shape(x);
    } catch {}
    V = 'quiz';
    t0 = Date.now();
    const L = qList(x);
    window.__L = L;

    let bodyHTML = '';
    if (x.w && window.ArLessonTypes && ArLessonTypes.wHTML) {
      bodyHTML = ArLessonTypes.wHTML(x);
    } else if (x.typ) {
      bodyHTML = `<input id=ty autocomplete=off autocapitalize=off dir=auto placeholder="${qn('اُكْتُبِ الْإِجَابَةَ هُنَا…')}" onkeydown="if(event.key==='Enter')ty()"><button class=big onclick="ty()">تَحَقَّقْ ✓</button>`;
    } else {
      bodyHTML = `<div class=grid>${(x.opts || []).map(o => `<button class=opt dir=auto data-ok="${o.ok ? 1 : 0}" onclick="ans(this)">${o.h}</button>`).join('')}</div>`;
    }

    h(`<div class=qh><button class=x onclick="goBack()" aria-label="خُرُوجٌ">✕</button><div class=pb><div id=pf style="width:${Math.round(qi / qs.length * 100)}%"></div></div><span class=hp id=hp>❤️ ${D(hr)}</span></div>
      <div id=qo class=qo></div>
      ${x.rd ? '<p class=mind-tag>🔁 فُرْصَةٌ ثَانِيَةٌ لِهَذَا السُّؤَالِ</p>' : x.eased ? '<p class=mind-tag>🪶 سُؤَالٌ أَسْهَلُ قَلِيلًا</p>' : ''}
      <p class=mut style="text-align:center">سُؤَالٌ ${D(qi + 1)} مِنْ ${D(qs.length)} · ⭐ ${D(P.star || 0)}</p>
      <div class=qb>
        ${x.show}
        <div class="w-act" style="gap:8px;flex-wrap:wrap;margin:6px 0 12px">
          <button class=alt onclick="sayList(window.__L)">🔊 اِسْمَعِ السُّؤَالَ</button>
          ${x.sp ? `<button class=alt onclick="say(qs[qi].sp[0],qs[qi].sp[1])">🔊 اِسْمَعِ الْكَلِمَةَ</button>` : ''}
        </div>
        ${bodyHTML}
      </div>
      <div id=sh class=sh hidden></div>`);

    if (x.w && window.ArLessonTypes && ArLessonTypes.bindTiles) {
      ArLessonTypes.bindTiles(x);
    }
    window.MC && MC.mood && MC.mood('tilt', 900);
  }

  function ans(b) {
    const ok = b.dataset.ok === '1';
    document.querySelectorAll('.opt').forEach(o => {
      o.disabled = true;
      if (o.dataset.ok === '1') o.classList.add('ok');
    });
    if (!ok) b.classList.add('no');
    window.__chosen = b.textContent;
    rec(qs[qi], ok);
  }

  function ty() {
    const e = document.getElementById('ty');
    const x = qs[qi];
    if (!e || !x) return;
    const v = e.value.trim();
    if (!v) {
      e.focus();
      if (!(window.muted && muted())) say(qn('اُكْتُبِ الْكَلِمَةَ أَوَّلًا'), 'ar');
      return;
    }
    e.disabled = true;
    const g = window.Grade ? Grade.text(v, [x.typ]) : { ok: stripD(v) === stripD(x.typ), exact: true };
    window.__g = g;
    rec(x, g.ok, v);
  }

  function logMistake(x, ok, given) {
    if (!P || !x || !x.k) return;
    P.mistakes = P.mistakes || {};
    const mKey = `${x.l || 'ar'}:${x.k}`;
    if (ok) {
      if (P.mistakes[mKey]) {
        P.mistakes[mKey].fixed = (P.mistakes[mKey].fixed || 0) + 1;
        P.mistakes[mKey].at = Date.now();
      }
      return;
    }
    const rightOpt = Array.isArray(x.opts) ? x.opts.find(o => o.ok) : null;
    const expected = x.typ || (Array.isArray(x.target) ? x.target.join(x.w === 'build' ? '' : ' ') : (rightOpt ? tx(rightOpt.h) : x.k));
    const prev = P.mistakes[mKey] || { k: x.k, l: x.l || 'ar', unitId: (cur && cur.id) || '', n: 0, fixed: 0 };
    P.mistakes[mKey] = {
      ...prev,
      q: tx(x.show) || x.k,
      expected: String(expected || x.k).slice(0, 80),
      given: String(given || window.__chosen || '').slice(0, 80),
      n: prev.n + 1,
      at: Date.now()
    };
  }

  function rec(x, ok, v) {
    const s = (P.sk[x.k] = P.sk[x.k] || { n: 0, m: 0 });
    const c = (P.stat[catOf(x)] = P.stat[catOf(x)] || [0, 0]);
    c[0]++;
    c[1] += +!!ok;
    s.n++;
    s.t = Date.now();
    s.lm = x.m;
    const ms = Date.now() - t0;
    s.tt = (s.tt || 0) + ms;

    if (ok) {
      if (!x.rd) sc++;
      P.star = (P.star || 0) + 1;
      s.m = Math.max(0, s.m - 1);
    } else {
      if (!x.rd) hr--;
      s.m++;
      s.e = (s.e || 0) + 1;
      P.wl[x.k[0].toLowerCase()] = (P.wl[x.k[0].toLowerCase()] || 0) + 1;
    }

    logMistake(x, ok, v);
    save();

    const g = v != null && window.__g ? window.__g : null;
    window.__g = null;
    let d = null;
    try {
      if (window.MindCoach) {
        d = MindCoach.onAnswer({ x, ok, ms, chosen: v != null ? v : window.__chosen });
      }
    } catch { d = null; }

    // Re-queue missed item later inside this quiz session (at most twice)
    try {
      if (!ok && hr > 0 && !(cur && cur.id === 'pl') && (x.rd || 0) < 2) {
        const nq = { ...x, rd: (x.rd || 0) + 1 };
        if (x.opts && x.opts.length) nq.opts = shuf(x.opts);
        if (x.tiles) nq.tiles = shuf(x.tiles);
        qs.splice(Math.min(qs.length, qi + 3), 0, nq);
      }
    } catch {}
    window.__chosen = null;

    const m = ok
      ? (d ? d.msg : pk(OKS[x.l] || OKS.ar)) + (g && !g.exact ? ` إِجَابَتُكَ صَحِيحَةٌ، وَالْكِتَابَةُ الدَّقِيقَةُ «${x.typ}» ✍️` : '')
      : (v != null
          ? (g && g.close ? `قَرِيبٌ جِدًّا! ${g.tip} الصَّحِيحُ «${x.typ}» 💪` : `كَتَبْتَ «${v}» وَالصَّحِيحُ «${x.typ}». ${g && g.tip ? g.tip + ' ' : ''}لَا بَأْسَ، سَنُحَاوِلُ مَعًا!`)
          : (d && d.msg ? d.msg : pk(ENC) + ' ' + ((x.ex && x.ex[s.m > 1 ? 1 : 0]) || '')));

    const end = hr <= 0 || qi + 1 >= qs.length;
    const hpEl = document.getElementById('hp');
    const pfEl = document.getElementById('pf');
    if (hpEl) hpEl.textContent = '❤️ ' + D(Math.max(0, hr));
    if (pfEl) pfEl.style.width = ((qi + 1) / qs.length * 100) + '%';

    const shEl = document.getElementById('sh');
    if (shEl) {
      shEl.className = 'sh ' + (ok ? 'g' : 'r');
      shEl.hidden = false;
      shEl.innerHTML = `<b>${ok ? '✅ ' : '❌ '}${esc(qn(m))}${hr <= 0 ? ' 💔 انْتَهَتِ الْقُلُوبُ' : ''}</b><button class=big onclick="nx()">${end ? 'إِنْهَاءٌ' : 'مُتَابَعَةٌ'}</button>`;
    }

    window.__streak = ok ? (window.__streak || 0) + 1 : 0;
    try {
      window.HurufiSound && HurufiSound.play(ok ? 'correct' : 'wrong');
      if (window.MC) {
        if (d && d.mood && ok) setTimeout(() => MC.mood(d.mood, 1400), 300);
        else if (window.__streak >= 3) setTimeout(() => MC.mood('wow', 1400), 300);
        else MC.mood(ok ? 'happy' : 'oops', 1400);
      }
    } catch {}
    if (!(window.muted && muted())) say(qn(m), ok ? (x.l || 'ar') : 'ar', null, ok ? 'happy' : 'soft');
  }

  function nx() {
    window.say && say.stop && say.stop();
    if (hr <= 0 || ++qi >= qs.length) fin();
    else q();
  }

  function fin() {
    const c = cur || {};
    qs = (qs || []).filter(z => !z.rd);
    const total = Math.max(1, qs.length);
    const pass = sc >= Math.min(4, total);
    try { window.HurufiSound && HurufiSound.play(pass ? 'finish' : 'wrong'); } catch {}
    V = 'fin';

    if (typeof c.onFinish === 'function') {
      return c.onFinish(sc, total, hr);
    }

    const sumHTML = `<div class=sum><div>⭐<br>${D(sc)}/${D(total)}</div><div>🎯<br>${D(Math.round(sc / total * 100))}٪</div><div>❤️<br>${D(Math.max(hr, 0))}</div></div>`;

    if (c.id === 'pl') {
      P.stage = Math.max(0, P.stage - (sc >= 4 ? 0 : sc >= 2 ? 1 : 2));
      save();
      h(`${sumHTML}<h1>🎉</h1><h2>${qn(`أَحْسَنْتَ يَا ${esc(P.name)}!`)}</h2>
        <p>${qn(`نَتِيجَتُكَ ${D(sc)} مِنْ ${D(total)}، وَسَنَبْدَأُ مِنَ الْمَرْحَلَةِ ${D(P.stage + 1)}: ${S[P.stage].n}. يُمْكِنُ لِوَلِيِّ الْأَمْرِ تَغْيِيرُ الْمَرْحَلَةِ فِي أَيِّ وَقْتٍ.`)}</p>
        <button class=big onclick="home()">هَيَّا نَتَعَلَّمْ 🚀</button>`);
      return;
    }

    if (c.id === 'dy') {
      let msg = qn('أَحْسَنْتَ!');
      if (pass && !P.cd[day()]) {
        P.cd[day()] = 1;
        P.star = (P.star || 0) + 3;
        msg = qn('أَنْجَزْتَ تَحَدِّيَ الْيَوْمِ! +٣ نُجُومٍ ⭐');
      }
      save();
      h(`${sumHTML}<h1>🎯</h1><h2>${D(sc)} مِنْ ${D(total)}</h2><p>${msg}</p><button class=big onclick="home()">رُجُوعٌ</button>`);
      return;
    }

    if (c.id === 'rv') {
      save();
      h(`${sumHTML}<h1>🔁</h1><h2>${D(sc)} مِنْ ${D(total)}</h2><p>${qn('مُرَاجَعَةٌ رَائِعَةٌ! الْكَلِمَاتُ الَّتِي أَخْطَأْتَ فِيهَا سَتَظْهَرُ لَكَ أَكْثَرَ لِتَتْقِنَهَا.')}</p><button class=big onclick="home()">رُجُوعٌ</button>`);
      return;
    }

    P.sc[c.id] = Math.max(P.sc[c.id] || 0, sc);
    P.fd[c.id] = P.fd[c.id] || day();
    if (pass && !P.done[c.id]) P.star = (P.star || 0) + 5;
    if (pass) P.done[c.id] = { s: sc, d: day() };
    save();

    h(`${sumHTML}${pass
      ? `<h1>🌟</h1><h2>${qn(`أَتْقَنْتَ الدَّرْسَ! ${D(sc)} مِنْ ${D(total)}`)}</h2><button class=big onclick="goNextLesson()">${nextLabel()}</button><button class=alt onclick="home()">🏠 الرَّئِيسِيَّةُ</button>`
      : `<h1>💪</h1><h2>${D(sc)} مِنْ ${D(total)} – ${sc >= 3 ? 'قَرِيبٌ جِدًّا!' : sc >= 2 ? 'بِدَايَةٌ جَيِّدَةٌ!' : 'لَا بَأْسَ، سَنَتَعَلَّمُ مَعًا!'}</h2>
         <p>${qn('نَحْتَاجُ ٤ عَلَى الْأَقَلِّ لِلْإِتْقَانِ. سَنُعِيدُ التَّدْرِيبَ بِطَرِيقَةٍ مُخْتَلِفَةٍ.')}</p>
         <button class=big onclick="tries++;lesson('${c.id}')">أَعِدِ التَّدْرِيبَ 🔁</button><button class=alt onclick="home()">🏠 الرَّئِيسِيَّةُ</button>`}`);

    if (pass && window.BumiFX && BumiFX.party) {
      try { BumiFX.party(); } catch {}
    }
    try { window.MC && MC.mood && MC.mood(pass ? 'proud' : 'oops', 2200); } catch {}
  }

  /* ---------- تدريب النطق بالميكروفون ---------- */
  const normSpeech = s => String(s || '').toLowerCase()
    .replace(/[\u064B-\u0652ـ.,!?؟،']/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim();

  const lev = (a, b) => {
    const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
    for (let j = 1; j <= b.length; j++) d[0][j] = j;
    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
    }
    return d[a.length][b.length];
  };

  const nearSpeech = (a, b) => {
    a = normSpeech(a);
    b = normSpeech(b);
    return a === b || a.includes(b) || lev(a, b) <= Math.floor(b.length / 4);
  };

  const setBub = (txt, l) => {
    const b = document.getElementById('tb');
    const gm = qn(txt);
    if (b) b.textContent = '🦉 ' + gm;
    if (gm && P.snd !== 0 && !(window.muted && muted())) say(gm, l || 'ar');
  };

  function speak() {
    V = 'lesson';
    if (!P.mic) {
      return h(`<button class=link onclick="goBack()">← رُجُوعٌ</button>
        <h2>🎤 تَدْرِيبُ النُّطْقِ</h2>
        <p>${qn('لِاسْتِخْدَامِ الْمَيْكْرُوفُونِ نَحْتَاجُ مُوَافَقَةَ وَلِيِّ الْأَمْرِ مِنْ لَوْحَةِ وَلِيِّ الْأَمْرِ.')}</p>
        <button class=big onclick="parentPanel()">فَتْحُ لَوْحَةِ وَلِيِّ الْأَمْرِ ⚙️</button>`);
    }
    const L = units(P.stage).flatMap(u => u.i).filter(x => stripD(x[0]).length > 1);
    sp1 = wsample(L, 1)[0];
    if (!sp1) return home();
    window.Lazy && Lazy.onLeave(stopSpeakMic);
    h(`<button class=link onclick="goBack()">← رُجُوعٌ</button>
      <h2>🎤 تَدْرِيبُ النُّطْقِ</h2>
      <div class=q>${esc(sp1[1])}</div>
      <h2 dir=auto style="text-align:center">${esc(sp1[0])}</h2>
      <div id=tb class=bub>🦉 ${qn('اِسْتَمِعْ ثُمَّ انْطِقِ الْكَلِمَةَ بِوُضُوحٍ')}</div>
      <button class=alt onclick="say(window.__sp1[0],window.__sp1[2])">🔊 اِسْتَمِعْ</button>
      <button class=big onclick="mic()">🎤 اِنْطِقْهَا</button>
      <button class=alt onclick="speak()">كَلِمَةٌ أُخْرَى 🔄</button>`);
    window.__sp1 = sp1;
  }

  function mic() {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return setBub('هَذَا الْمُتَصَفِّحُ لَا يَدْعَمُ الِاسْتِمَاعَ. جَرِّبْ Chrome أَوْ Edge.', 'ar');
    if (!sp1) return;
    stopSpeakMic();
    const r = new SR();
    activeMic = r;
    const t = normSpeech(sp1[0]);
    const w = (P.pr[sp1[0]] = P.pr[sp1[0]] || [0, 0]);
    const c = (P.stat.p = P.stat.p || [0, 0]);
    r.lang = sp1[2] === 'ar' ? 'ar-SA' : 'en-US';
    r.maxAlternatives = 5;
    setBub('أَنَا أَسْمَعُكَ... 🎧', 'ar');
    r.onresult = e => {
      activeMic = null;
      const a = [...e.results[0]].map(x => x.transcript);
      const ok = a.some(x => nearSpeech(x, t));
      w[0]++;
      c[0]++;
      if (ok) {
        w[1]++;
        c[1]++;
        P.star = (P.star || 0) + 1;
        setBub(pk(OKS[sp1[2]] || OKS.ar), sp1[2]);
      } else {
        const h0 = normSpeech(a[0] || '');
        const idx = [...t].findIndex((ch, j) => ch !== h0[j]);
        if (idx >= 0) P.wl[t[idx]] = (P.wl[t[idx]] || 0) + 1;
        setBub(idx >= 0 ? `رَكِّزْ عَلَى حَرْفِ «${t[idx]}» فِي الْكَلِمَةِ، وَحَاوِلْ مَرَّةً أُخْرَى` : 'حَاوِلْ مَرَّةً أُخْرَى بِصَوْتٍ أَوْضَحَ', 'ar');
      }
      save();
    };
    r.onerror = () => { activeMic = null; setBub('لَمْ أَسْمَعْكَ جَيِّدًا، حَاوِلْ مَرَّةً أُخْرَى', 'ar'); };
    r.onend = () => { activeMic = null; };
    try { r.start(); } catch { activeMic = null; }
  }

  /* ---------- تصحيح الكتابة بالإصبع ---------- */
  window.wcheck = function (r) {
    const c = document.getElementById('pad');
    if (!c || !window.Ink) return;
    r = r || Ink.run(c, { target: window.__wn });
    const m = document.getElementById('wm');
    if (!r || !m) return;
    if (r.empty) { m.textContent = qn('اُكْتُبْ بِإِصْبَعِكَ أَوَّلًا ✍️'); return; }
    m.className = 'mut ink-msg ' + (r.ok ? 'good' : r.close ? 'near' : 'try');
    m.textContent = r.ok ? (r.tip || pk(OKS.ar) + ' 🌟') : r.tip;
    if (r.ok && c.__ink && !c.__ink.done) {
      c.__ink.done = true;
      P.star = (P.star || 0) + 1;
      save();
      try { window.HurufiSound && HurufiSound.play('correct'); window.MC && MC.mood('happy', 1400); } catch {}
    } else if (!r.ok) {
      try { window.MC && MC.mood('tilt', 900); } catch {}
    }
    if (!(window.muted && muted())) say(m.textContent.replace(/[^\p{L}\p{M}\p{N}\s،.!؟«»]/gu, ' '), 'ar', null, r.ok ? 'happy' : 'soft');
  };

  window.nextAfterCur = nextAfterCur;
  window.nextLabel = nextLabel;
  window.goNextLesson = goNextLesson;
  window.setup = setup;
  window.start = start;
  window.place = place;
  window.who = who;
  window.cert = cert;
  window.pad = pad;
  window.lesson = lesson;
  window.review = review;
  window.daily = daily;
  window.dueN = dueN;
  window.quiz = quiz;
  window.q = q;
  window.ans = ans;
  window.ty = ty;
  window.rec = rec;
  window.nx = nx;
  window.fin = fin;
  window.speak = speak;
  window.mic = mic;
  window.lq = lq;
  window.wsample = wsample;
  window.sayList = sayList;
  window.qList = qList;
  window.qSegs = qSegs;
  window.OKS = OKS;
  window.ENC = ENC;
})();
