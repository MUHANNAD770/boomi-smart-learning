/* src/assessment/exam-engine.js — نظام الاختبارات الشامل والتقييم المتدرّج (العربية والإنجليزية) */
(() => {
  'use strict';

  const TIERS = [
    { id: 'beginner', icon: '🌱', name: 'مُبْتَدِئٌ', enName: 'Beginner', desc: 'الْحُرُوفُ وَالْأَسَاسِيَّاتُ وَالْمُفْرَدَاتُ الْأُولَى', stages: [0, 1], count: 8 },
    { id: 'intermediate', icon: '📘', name: 'مُتَوَسِّطٌ', enName: 'Intermediate', desc: 'الْحَرَكَاتُ وَالتَّرَاكِيبُ وَالْقِرَاءَةُ', stages: [2], count: 10 },
    { id: 'advanced', icon: '🚀', name: 'مُتَقَدِّمٌ', enName: 'Advanced', desc: 'الْقَوَاعِدُ وَالْإِمْلَاءُ وَمَخَارِجُ الْحُرُوفِ', stages: [3], count: 12 },
    { id: 'master', icon: '🏆', name: 'مُتْقِنٌ', enName: 'Master', desc: 'الْفَهْمُ وَالنَّحْوُ وَالْجُمَلُ الْمُتَقَدِّمَةُ', stages: [4], count: 14 }
  ];

  let activeLang = 'ar';
  const qn = t => (typeof window.studentGenderText === 'function' ? window.studentGenderText(t) : t);
  const stripD = s => String(s || '').replace(/[\u064B-\u0652\u0670\u0640]/g, '').trim();

  function unresolvedMistakes(lang) {
    const M = (window.P && P.mistakes) || {};
    return Object.entries(M)
      .filter(([, m]) => m && (!lang || m.l === lang) && (m.n || 0) > (m.fixed || 0))
      .sort((a, b) => (b[1].at || 0) - (a[1].at || 0));
  }

  function calcLevel(lang) {
    const ex = (window.P && P.exams) || {};
    for (let i = TIERS.length - 1; i >= 0; i--) {
      const e = ex[lang + '_' + TIERS[i].id];
      if (e && e.pass) return TIERS[i];
    }
    return TIERS[0];
  }

  function examHub(prefLang) {
    if (!window.P) return window.setup && setup();
    if (prefLang === 'ar' || prefLang === 'en') activeLang = prefLang;
    else if (P.lang === 'en') activeLang = 'en';
    else if (P.lang === 'ar') activeLang = 'ar';

    window.V = 'sec';
    window.CS = 'exams';
    const isEn = activeLang === 'en';
    const ex = P.exams || {};
    const curLv = calcLevel(activeLang);
    const missList = unresolvedMistakes(activeLang);

    const tierCards = TIERS.map(t => {
      const rec = ex[activeLang + '_' + t.id];
      const passed = !!(rec && rec.pass);
      const best = rec ? rec.best + '٪' : 'لَمْ يُخْتَبَرْ';
      const att = rec ? `${D(rec.attempts || 1)} مُحَاوَلَةً` : `${D(t.count)} أَسْئِلَةٍ`;
      return `<button class="exam-tier${passed ? ' done' : ''}" onclick="startExam('${activeLang}','${t.id}')">
        <span>${t.icon}</span>
        <b>${isEn ? `${t.name} · ${t.enName}` : t.name}</b>
        <small>${t.desc}</small>
        <div class=exam-badge>${passed ? '🏅 مُجْتَازٌ · ' : ''}${best}</div>
        <small>${att}</small>
      </button>`;
    }).join('');

    h(`<section class="sec">
      <button class=link onclick="goBack()">← رُجُوعٌ</button>
      <div class="acad-hd ${isEn ? 'en' : 'ar'}">
        <span class="acad-ic e">${isEn ? '🔠' : '📝'}</span>
        <div>
          <b>${isEn ? 'اِخْتِبَارَاتُ الْإِنْجِلِيزِيَّةِ' : 'اِخْتِبَارَاتُ الْعَرَبِيَّةِ'}</b>
          <small>${qn(`الْمُسْتَوَى الْمُحْتَسَبُ حَالِيًّا: ${curLv.name} ${curLv.icon}`)}</small>
        </div>
        <span class=acad-em>🏅</span>
      </div>

      <div class="exam-langs" role="tablist">
        <button class="exam-lang${!isEn ? ' on' : ''}" onclick="examHub('ar')">🔤 الْعَرَبِيَّةُ</button>
        <button class="exam-lang${isEn ? ' on' : ''}" onclick="examHub('en')">🔠 English</button>
      </div>

      ${missList.length ? `<button class="nx" onclick="practiceMistakes('${activeLang}')">
        <span>🎯</span>
        <div>
          <small>${qn('إِعَادَةُ الْأَسْئِلَةِ الَّتِي أَخْطَأْتَ فِيهَا لِتَثْبِيتِهَا')}</small>
          <b>${qn(`تَدْرِيبٌ مُرَكَّزٌ عَلَى الْأَخْطَاءِ (${D(missList.length)})`)}</b>
        </div>
      </button>` : ''}

      <h3>اخْتَرْ مُسْتَوَى الِاخْتِبَارِ:</h3>
      <div class="exam-tiers">${tierCards}</div>
    </section>`);
  }

  function buildTierQuestions(lang, tier) {
    const unitsPool = tier.stages.flatMap(st => (S[st] ? S[st].u.filter(u => u.l === lang && u.i && u.i.length >= 2) : []));
    const out = [];
    const seenShow = new Set();

    for (const u of shuf(unitsPool)) {
      if (out.length >= tier.count) break;
      let batch = [];
      try {
        if (lang === 'ar' && window.ArLessonQuiz && window.ArLessonTypes && ArLessonTypes.isArLesson(u)) {
          batch = ArLessonQuiz(u, 3);
        } else if (lang === 'en' && window.EnLessonQuiz && window.EnLessonTypes && EnLessonTypes.isEnLesson(u)) {
          batch = EnLessonQuiz(u, 3);
        } else if (typeof window.lq === 'function') {
          batch = wsample(u.i, 2).map(it => lq(it, u.i));
        }
      } catch {}

      for (const qItem of batch) {
        if (!qItem) continue;
        const sig = stripD(qItem.show) + '|' + qItem.k;
        if (seenShow.has(sig)) continue;
        seenShow.add(sig);
        qItem.unitName = u.n;
        qItem.unitId = u.id;
        out.push(qItem);
        if (out.length >= tier.count) break;
      }
    }

    // Backfill if stage had fewer unique questions
    if (out.length < tier.count && unitsPool.length) {
      const flat = unitsPool.flatMap(u => u.i);
      for (const it of shuf(flat)) {
        if (out.length >= tier.count) break;
        const qItem = typeof window.lq === 'function' ? lq(it, flat) : null;
        if (!qItem) continue;
        const sig = stripD(qItem.show) + '|' + qItem.k;
        if (seenShow.has(sig)) continue;
        seenShow.add(sig);
        out.push(qItem);
      }
    }
    return out;
  }

  function startExam(lang, tierId) {
    if (!window.P) return window.setup && setup();
    const tier = TIERS.find(t => t.id === tierId) || TIERS[0];
    const begin = () => {
      const items = buildTierQuestions(lang, tier);
      if (!items.length) return examHub(lang);
      runExamSession({
        id: `exam_${lang}_${tier.id}`,
        title: `اِخْتِبَارُ ${lang === 'en' ? 'الْإِنْجِلِيزِيَّةِ' : 'الْعَرَبِيَّةِ'} · ${tier.name}`,
        lang,
        tier,
        items
      });
    };
    if (window.Skeleton && Skeleton.exam) {
      window.V = 'exam';
      h(Skeleton.exam());
      requestAnimationFrame(begin);
    } else {
      begin();
    }
  }

  function practiceMistakes(lang) {
    const miss = unresolvedMistakes(lang).slice(0, 8);
    if (!miss.length) return examHub(lang);

    const begin = () => {
      const allUnits = S.flatMap(s => s.u).filter(u => u.l === lang);
      const allItems = allUnits.flatMap(u => u.i);
      const items = [];

      for (const [mKey, m] of miss) {
        let unit = null;
        try { if (m.unitId && /^\d+-\d+$/.test(m.unitId)) unit = find(m.unitId); } catch {}
        const pool = (unit && unit.i) || allItems;
        const foundItem = pool.find(it => it && it[0] === m.k);
        if (foundItem && typeof window.lq === 'function') {
          const qItem = lq(foundItem, pool);
          qItem.mistakeKey = mKey;
          qItem.unitId = unit ? unit.id : '';
          items.push(qItem);
        } else if (m.expected && allItems.length >= 4) {
          const wrongs = shuf(allItems.filter(it => it[0] !== m.expected && it[1] !== m.expected)).slice(0, 3).map(it => it[0]);
          const opts = uniqueOpts(m.expected, wrongs, x => x, 4);
          items.push({
            k: m.k || m.expected,
            m: 0,
            l: lang,
            mistakeKey: mKey,
            show: `<div class=q dir=auto>${esc(m.q || m.k)}</div><p class=mut>🔁 تَصْحِيحُ خَطَأٍ سَابِقٍ</p>`,
            opts: opts.map(o => ({ h: esc(o), ok: o === m.expected })),
            ex: [`الصَّحِيحُ: ${m.expected}`, `رَاجِعْ هَذِهِ الْكَلِمَةَ جَيِّدًا: ${m.expected}`]
          });
        }
      }

      if (!items.length) return examHub(lang);
      runExamSession({
        id: `mistakes_${lang}`,
        title: `🎯 تَدْرِيبُ الْأَخْطَاءِ (${lang === 'en' ? 'English' : 'الْعَرَبِيَّةُ'})`,
        lang,
        tier: null,
        items
      });
    };

    if (window.Skeleton && Skeleton.exam) {
      window.V = 'exam';
      h(Skeleton.exam());
      requestAnimationFrame(begin);
    } else {
      begin();
    }
  }

  function runExamSession(session) {
    const queue = [...session.items];
    const log = [];
    let idx = 0;
    let firstPassRight = 0;
    const totalInitial = queue.length;
    const retriedKeys = new Set();

    window.V = 'exam';

    function renderQ() {
      const item = queue[idx];
      if (!item) return finishExam();

      window.cur = { id: session.id, n: session.title, l: session.lang };
      window.qs = queue;
      window.qi = idx;
      window.__L = typeof window.qList === 'function' ? qList(item) : [];

      let ansHtml = '';
      if (item.w && window.ArLessonTypes && ArLessonTypes.wHTML) {
        ansHtml = ArLessonTypes.wHTML(item);
      } else if (item.typ) {
        ansHtml = `<input id=ex-ty autocomplete=off autocapitalize=off dir=auto placeholder="${qn('اُكْتُبِ الْإِجَابَةَ هُنَا…')}"><button class=big id=ex-chk>تَحَقَّقْ ✓</button>`;
      } else {
        ansHtml = `<div class=grid>${(item.opts || []).map((o, j) => `<button class="opt ex-opt" dir=auto data-i=${j} data-ok="${o.ok ? 1 : 0}">${o.h}</button>`).join('')}</div>`;
      }

      h(`<div class=qh>
          <button class=x onclick="examHub('${session.lang}')" aria-label="خُرُوجٌ">✕</button>
          <div class=pb><div id=pf style="width:${Math.round(idx / queue.length * 100)}%"></div></div>
          <span class=hp>${D(idx + 1)}/${D(queue.length)}</span>
        </div>
        <div id=qo class=qo></div>
        ${item.isRetry ? '<p class=mind-tag>🔁 إِعَادَةُ السُّؤَالِ الَّذِي أَخْطَأْتَ فِيهِ لِلتَّثْبِيتِ</p>' : ''}
        <p class=mut style="text-align:center">${esc(session.title)}${item.unitName ? ' · ' + esc(item.unitName) : ''}</p>
        <div class=qb>
          ${item.show}
          <div class="w-act" style="gap:8px;flex-wrap:wrap;margin:6px 0 12px">
            <button class=alt onclick="sayList(window.__L)">🔊 اِسْمَعِ السُّؤَالَ</button>
            ${item.sp ? `<button class=alt onclick="say('${esc(item.sp[0]).replace(/'/g, '’')}','${item.sp[1] || session.lang}')">🔊 اِسْمَعِ الْكَلِمَةَ</button>` : ''}
          </div>
          ${ansHtml}
        </div>
        <div id=ex-sh class=sh hidden></div>`);

      if (item.w && window.ArLessonTypes && ArLessonTypes.bindTiles) {
        // Intercept ArLessonTypes rec() call temporarily for this tile question
        const origRec = window.rec;
        window.rec = (qArg, ok) => {
          window.rec = origRec;
          handleAnswer(item, ok, window.__chosen || '');
        };
        ArLessonTypes.bindTiles(item);
      }

      document.querySelectorAll('.ex-opt').forEach(btn => {
        btn.onclick = () => {
          const ok = btn.dataset.ok === '1';
          document.querySelectorAll('.ex-opt').forEach(b => {
            b.disabled = true;
            if (b.dataset.ok === '1') b.classList.add('ok');
          });
          if (!ok) btn.classList.add('no');
          handleAnswer(item, ok, btn.textContent);
        };
      });

      const tyBtn = document.getElementById('ex-chk');
      const tyIn = document.getElementById('ex-ty');
      if (tyBtn && tyIn) {
        const submitTy = () => {
          const v = tyIn.value.trim();
          if (!v) { tyIn.focus(); return; }
          tyIn.disabled = true;
          tyBtn.disabled = true;
          const ok = window.Grade ? Grade.text(v, [item.typ]).ok : stripD(v) === stripD(item.typ);
          handleAnswer(item, ok, v);
        };
        tyBtn.onclick = submitTy;
        tyIn.onkeydown = e => { if (e.key === 'Enter') submitTy(); };
      }
    }

    function handleAnswer(item, ok, given) {
      if (!item.isRetry) {
        if (ok) firstPassRight++;
        log.push({ q: item.show, k: item.k, ok, given, expected: item.typ || (item.opts && item.opts.find(o => o.ok)?.h) || item.k });
      }

      P.mistakes = P.mistakes || {};
      const mKey = item.mistakeKey || `${item.l || session.lang}:${item.k}`;
      if (ok) {
        P.star = (P.star || 0) + 1;
        if (P.mistakes[mKey]) {
          P.mistakes[mKey].fixed = (P.mistakes[mKey].fixed || 0) + 1;
          P.mistakes[mKey].at = Date.now();
        }
      } else {
        const rightOpt = Array.isArray(item.opts) ? item.opts.find(o => o.ok) : null;
        const expected = item.typ || (Array.isArray(item.target) ? item.target.join(item.w === 'build' ? '' : ' ') : (rightOpt ? rightOpt.h.replace(/<[^>]*>/g, '') : item.k));
        const prev = P.mistakes[mKey] || { k: item.k, l: item.l || session.lang, unitId: item.unitId || '', n: 0, fixed: 0 };
        P.mistakes[mKey] = {
          ...prev,
          q: String(item.show || item.k).replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 100),
          expected: String(expected || item.k).slice(0, 80),
          given: String(given || '').slice(0, 80),
          n: prev.n + 1,
          at: Date.now()
        };
        // Re-queue missed item once after 2 questions
        if (!item.isRetry && !retriedKeys.has(mKey)) {
          retriedKeys.add(mKey);
          const clone = { ...item, isRetry: true };
          if (clone.opts) clone.opts = shuf(clone.opts);
          if (clone.tiles) clone.tiles = shuf(clone.tiles);
          queue.splice(Math.min(queue.length, idx + 3), 0, clone);
        }
      }

      try {
        window.Mind && Mind.record({ k: item.k, subject: session.lang, topic: session.title, ok, src: 'exam' });
        window.HurufiSound && HurufiSound.play(ok ? 'correct' : 'wrong');
        window.MC && MC.mood && MC.mood(ok ? 'happy' : 'oops', 1400);
      } catch {}
      save();

      const msg = ok
        ? (item.l === 'en' ? 'Excellent! ⭐' : qn('أَحْسَنْتَ! إِجَابَةٌ صَحِيحَةٌ 🌟'))
        : qn(`لَا بَأْسَ! الصَّحِيحُ: «${(item.ex && item.ex[0]) || item.k}»`);

      if (!(window.muted && muted())) say(msg.replace(/<[^>]*>/g, ''), 'ar');

      const shEl = document.getElementById('ex-sh');
      if (shEl) {
        shEl.className = 'sh ' + (ok ? 'g' : 'r');
        shEl.hidden = false;
        const end = idx + 1 >= queue.length;
        shEl.innerHTML = `<b>${ok ? '✅ ' : '❌ '}${msg}</b><button class=big id=ex-nx>${end ? 'عَرْضُ النَّتِيجَةِ 📊' : 'السُّؤَالُ التَّالِي ◀'}</button>`;
        const nxBtn = document.getElementById('ex-nx');
        if (nxBtn) nxBtn.onclick = () => { idx++; renderQ(); };
      }
    }

    function finishExam() {
      window.V = 'fin';
      const pct = Math.round((firstPassRight / totalInitial) * 100);
      const pass = pct >= 70;
      P.exams = P.exams || {};
      if (session.tier) {
        const key = `${session.lang}_${session.tier.id}`;
        const prev = P.exams[key] || { best: 0, attempts: 0, pass: false };
        P.exams[key] = {
          best: Math.max(prev.best, pct),
          last: pct,
          total: totalInitial,
          correct: firstPassRight,
          attempts: prev.attempts + 1,
          pass: prev.pass || pass,
          at: Date.now()
        };
        if (pass && !prev.pass) P.star = (P.star || 0) + 10;
      }
      save();
      try { window.checkBadges && checkBadges(); } catch {}
      try { window.HurufiSound && HurufiSound.play(pass ? 'finish' : 'wrong'); } catch {}

      const missed = log.filter(r => !r.ok);
      h(`<div class=sum>
          <div>🎯<br>${D(pct)}٪</div>
          <div>✅<br>${D(firstPassRight)}/${D(totalInitial)}</div>
          <div>${pass ? '🏅' : '💪'}<br>${pass ? 'مُجْتَازٌ' : 'تَحْتَاجُ تَدْرِيبًا'}</div>
        </div>
        <h1>${pass ? '🏆' : '💪'}</h1>
        <h2>${pass ? qn(`رَائِعٌ يَا ${esc(P.name)}! اجْتَزْتَ الِاخْتِبَارَ بِامْتِيَازٍ`) : qn(`نَتِيجَةٌ جَيِّدَةٌ! حَاوِلْ مَرَّةً أُخْرَى لِلْوُصُولِ إِلَى ٧٠٪`)}</h2>
        ${missed.length ? `<h3>📌 نِقَاطٌ لِلْمُرَاجَعَةِ (${D(missed.length)}):</h3>
          <div class=list>${missed.map(m => `<div class=row><span>💡</span><div><b>${esc(String(m.expected).replace(/<[^>]*>/g, ''))}</b><small>إِجَابَتُكَ: ${esc(String(m.given || '—').replace(/<[^>]*>/g, ''))}</small></div></div>`).join('')}</div>` : '<p class=mut>🌟 لَمْ تُخْطِئْ فِي أَيِّ سُؤَالٍ!</p>'}
        ${session.tier ? `<button class=big onclick="startExam('${session.lang}','${session.tier.id}')">🔁 أَعِدِ الِاخْتِبَارَ</button>` : ''}
        ${unresolvedMistakes(session.lang).length ? `<button class=alt onclick="practiceMistakes('${session.lang}')">🎯 تَدْرِيبٌ عَلَى الْأَخْطَاءِ</button>` : ''}
        <button class=alt onclick="examHub('${session.lang}')">📋 قَائِمَةُ الِاخْتِبَارَاتِ</button>
        <button class=link onclick="home()">🏠 الرَّئِيسِيَّةُ</button>`);
    }

    renderQ();
  }

  window.ExamEngine = { TIERS, examHub, startExam, practiceMistakes, calcLevel, unresolvedMistakes };
  window.examHub = examHub;
  window.startExam = startExam;
  window.practiceMistakes = practiceMistakes;
})();
