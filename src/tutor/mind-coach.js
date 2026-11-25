/* /src/tutor/mind-coach.js — المدرّب الذكي (تشجيع متكيّف + تحليل الأداء + توصيات عربية وإنجليزية) */
window.MindCoach = (() => {
  'use strict';
  const Mem = window.MindMemory, An = window.MindAnalyzer;
  const girl = () => !!(window.P && P.gender === 'female');
  const g = (m, f) => girl() ? f : m;
  const nm = () => (window.P && P.name) || '';
  const pick = a => a[Math.floor(Math.random() * a.length)];

  const B = {
    ok: [
      ['أَحْسَنْتَ!', 'أَحْسَنْتِ!'], 'إِجَابَةٌ صَحِيحَةٌ!', 'مُمْتَازٌ!', 'رَائِعٌ جِدًّا!', 'صَحِيحٌ تَمَامًا!',
      'يَا سَلَامُ!', 'هَذَا هُوَ الْجَوَابُ!',
      ['أَنْتَ تَتَقَدَّمُ بِسُرْعَةٍ!', 'أَنْتِ تَتَقَدَّمِينَ بِسُرْعَةٍ!'],
      'عَمَلٌ جَمِيلٌ!', 'إِجَابَةٌ دَقِيقَةٌ!',
      ['بَارَكَ اللَّهُ فِيكَ!', 'بَارَكَ اللَّهُ فِيكِ!'],
      'مَا شَاءَ اللَّهُ!', 'تَفْكِيرٌ سَلِيمٌ!',
      ['أَصَبْتَ الْهَدَفَ!', 'أَصَبْتِ الْهَدَفَ!'],
      'نَفْخَرُ بِهَذَا الْجَوَابِ!', 'هَكَذَا يَكُونُ التَّرْكِيزُ!'
    ],
    named: [
      ['أَحْسَنْتَ يَا {n}!', 'أَحْسَنْتِ يَا {n}!'],
      'رَائِعٌ يَا {n}!',
      ['بَطَلٌ يَا {n}!', 'بَطَلَةٌ يَا {n}!'],
      ['مُمْتَازٌ يَا {n}، اِسْتَمِرَّ!', 'مُمْتَازٌ يَا {n}، اِسْتَمِرِّي!']
    ],
    streak3: [
      'ثَلَاثُ إِجَابَاتٍ صَحِيحَةٍ مُتَتَالِيَةٍ! 🔥',
      ['أَنْتَ فِي أَفْضَلِ حَالَاتِكَ! ثَلَاثَةٌ مُتَتَالِيَةٌ!', 'أَنْتِ فِي أَفْضَلِ حَالَاتِكِ! ثَلَاثَةٌ مُتَتَالِيَةٌ!'],
      'سِلْسِلَةٌ جَمِيلَةٌ مِنَ الْإِجَابَاتِ الصَّحِيحَةِ!'
    ],
    streak5: [
      'خَمْسُ إِجَابَاتٍ صَحِيحَةٍ دُونَ خَطَأٍ! 🌟',
      ['لَا شَيْءَ يُوقِفُكَ الْيَوْمَ يَا {n}!', 'لَا شَيْءَ يُوقِفُكِ الْيَوْمَ يَا {n}!'],
      'خَمْسَةٌ مِنْ خَمْسَةٍ! تَرْكِيزٌ مُدْهِشٌ!'
    ],
    streak8: [
      'ثَمَانِي إِجَابَاتٍ مُتَتَالِيَةٍ! هَذَا مُسْتَوَى الْأَبْطَالِ! 🏆',
      ['أَنْتَ نَجْمُ الْيَوْمِ يَا {n}!', 'أَنْتِ نَجْمَةُ الْيَوْمِ يَا {n}!']
    ],
    fast: [
      'سَرِيعٌ وَصَحِيحٌ! ⚡', 'أَسْرَعُ مِنَ الْبَرْقِ!', 'جَوَابٌ سَرِيعٌ وَوَاثِقٌ!',
      ['عَرَفْتَهَا فَوْرًا!', 'عَرَفْتِهَا فَوْرًا!']
    ],
    recovered: [
      ['كُنْتَ تُخْطِئُ فِيهَا، وَالْآنَ أَتْقَنْتَهَا! 💪', 'كُنْتِ تُخْطِئِينَ فِيهَا، وَالْآنَ أَتْقَنْتِهَا! 💪'],
      ['تَعَلَّمْتَ مِنْ خَطَئِكَ، هَذَا هُوَ النَّجَاحُ!', 'تَعَلَّمْتِ مِنْ خَطَئِكِ، هَذَا هُوَ النَّجَاحُ!'],
      'هَذِهِ كَانَتْ صَعْبَةً، وَقَدْ صَارَتْ سَهْلَةً!'
    ],
    comeback: [
      ['عُدْتَ بِقُوَّةٍ! 👏', 'عُدْتِ بِقُوَّةٍ! 👏'],
      'هَكَذَا! الْمُحَاوَلَةُ تَصْنَعُ الْفَرْقَ.',
      ['لَمْ تَسْتَسْلِمْ، وَهَذَا أَهَمُّ شَيْءٍ!', 'لَمْ تَسْتَسْلِمِي، وَهَذَا أَهَمُّ شَيْءٍ!']
    ],
    en: ['Great job!', 'Excellent!', 'Well done!', 'Perfect!', 'Awesome!', 'You got it!', 'Fantastic!', 'Super!', 'Brilliant!', 'Nice work!'],
    enStreak: ['Three in a row! 🔥', 'You are on fire!', 'Amazing streak!'],
    soft: [
      'لَا بَأْسَ.', 'قَرِيبٌ!', 'مُحَاوَلَةٌ جَيِّدَةٌ.', 'الْخَطَأُ طَرِيقُ التَّعَلُّمِ.',
      'لَا مُشْكِلَةَ، سَنَتَعَلَّمُهَا مَعًا.',
      ['لَا تَقْلَقْ.', 'لَا تَقْلَقِي.'],
      'كُلُّنَا نُخْطِئُ ثُمَّ نَتَعَلَّمُ.'
    ],
    soft2: [
      ['هَذِهِ تَحْتَاجُ تَرْكِيزًا أَكْثَرَ، وَأَنَا مَعَكَ.', 'هَذِهِ تَحْتَاجُ تَرْكِيزًا أَكْثَرَ، وَأَنَا مَعَكِ.'],
      ['خُذْ نَفَسًا، وَسَنُجَرِّبُ بِطَرِيقَةٍ أَسْهَلَ.', 'خُذِي نَفَسًا، وَسَنُجَرِّبُ بِطَرِيقَةٍ أَسْهَلَ.'],
      'سَأُسَهِّلُ السُّؤَالَ التَّالِيَ قَلِيلًا.'
    ]
  };

  const txt = e => (Array.isArray(e) ? g(e[0], e[1]) : e).replace('{n}', nm());

  function choose(cat) {
    const m = Mem.M(), L = B[cat] || B.ok;
    const fresh = L.map((_, i) => cat + i).filter(k => !m.said.includes(k));
    const k = pick(fresh.length ? fresh : L.map((_, i) => cat + i));
    m.said.push(k);
    if (m.said.length > 14) m.said.shift();
    return txt(L[+k.slice(cat.length)]);
  }

  function onAnswer(o) {
    const x = o.x, en = x.l === 'en', chosen = o.chosen || '';
    let type = '';
    const a = o.ok ? null : An.analyze(x, chosen);
    if (a) type = a.type;
    const r = Mem.observe({ k: x.k, ok: o.ok, ms: o.ms, type }), s = r.sess;
    const out = { mood: o.ok ? 'happy' : 'oops', redrill: false, type };
    if (o.ok) {
      let cat = 'ok';
      if (s.streak === 8) cat = 'streak8';
      else if (s.streak === 5) cat = 'streak5';
      else if (s.streak === 3) cat = en ? 'enStreak' : 'streak3';
      else if (r.recovered) cat = 'recovered';
      else if (s.streak === 1 && s.n > 1) cat = 'comeback';
      else if (o.ms && o.ms < 2500 && s.n > 2) cat = 'fast';
      else if (en) cat = 'en';
      else if (Math.random() < 0.22 && nm() && nm() !== 'صديقي') cat = 'named';
      out.msg = choose(cat);
      if (s.streak >= 5) out.mood = 'wow';
      if (cat === 'recovered' || cat === 'streak8') out.mood = 'proud';
    } else {
      const open = choose(s.wrongRow >= 2 ? 'soft2' : 'soft');
      out.msg = [open, a && a.why, a && a.fix].filter(Boolean).join(' ');
      if (!x.rd) {
        s.redrill++;
        out.redrill = true;
      }
    }
    return out;
  }

  function shape(x) {
    const s = Mem.sess();
    if (!x || x.eased || x.typ || !x.opts || x.opts.length <= 2) return x;
    if (s.wrongRow >= 2) {
      const ok = x.opts.find(o => o.ok), bad = x.opts.filter(o => !o.ok);
      if (ok && bad.length) {
        x.opts = [ok, bad[Math.floor(Math.random() * bad.length)]].sort(() => Math.random() - 0.5);
        x.eased = 1;
      }
    }
    return x;
  }

  const newQuiz = () => {
    const s = Mem.sess();
    s.redrill = 0;
    s.wrongRow = 0;
  };

  const REC = {
    similar: ['🎤 تدريب النطق ومخارج الحروف', 'speak()'],
    makharij: ['🗣️ قواعد النطق والمخارج', "arTeach('makharij')"],
    dots: ['✍️ تتبّع الحروف العربية', 'aAbj()'],
    vowel: ['فَ الحركات والتنوين والشدة', 'aHar()'],
    first: ['✍️ الإملاء وقراءة الكلمات', 'dictation()'],
    picture: ['🔗 صِل الكلمة بالصورة', 'matchPics()'],
    hamza: ['📘 همزة القطع والوصل', "arTeach('hamza')"],
    tamarbuta: ['📘 التاء المربوطة والمفتوحة والهاء', "arTeach('tamarbuta')"],
    al: ['☀️ اللام الشمسية والقمرية', "arTeach('shamsiya')"],
    alif_layyina: ['📘 الألف اللينة المقصورة والممدودة', "arTeach('alif')"],
    envowel: ['🔤 معلّم الأصوات الإنجليزية', "enTeach('phonics')"],
    enfirst: ['🔤 قراءة الكلمات الإنجليزية', "enTeach('review')"],
    engrammar: ['📘 قواعد اللغة الإنجليزية', "enTeach('grammar')"],
    enspell: ['✍️ إملاء الكلمات الإنجليزية', "practiceMistakes('en')"],
    voice: ['🗣️ تدريب النطق الواضح', 'speak()']
  };

  function report() {
    const s = Mem.summary();
    const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
    const recs = s.errs.map(e => REC[e.t]).filter(Boolean).slice(0, 4);
    const unresolved = Object.values((window.P && P.mistakes) || {}).filter(m => m && !m.resolved).length;
    return `<div class=pdash id=mind-report><h3>🧠 تحليل بومي الذكي</h3>
      <div class=pr-sum>
        <div>✅<b>${s.mastered}</b><small>كلمة متقنة</small></div>
        <div>📈<b>${s.recentAcc != null ? s.recentAcc + '٪' : '—'}</b><small>دقة آخر ٢٠ إجابة</small></div>
        <div>⏱️<b>${s.avgSec != null ? s.avgSec : '—'}</b><small>ثوانٍ للإجابة</small></div>
        <div>🔁<b>${s.dueCount}</b><small>للمراجعة المتباعدة</small></div>
      </div>
      ${unresolved ? `<p class=mut style="margin-top:8px">📌 يوجد <b>${unresolved}</b> خطأً مسجّلًا يحتاج إلى تدريب من الاختبارات والدروس.</p>` : ''}
      ${s.errs.length ? `<h3>🔍 أنماط الأخطاء</h3><ul class=plan>${s.errs.map(e => `<li>${esc(e.label)} <small>(${e.n} مرة)</small></li>`).join('')}</ul>` : '<p class=mut>لا توجد أنماط أخطاء واضحة بعد. تظهر هنا بعد حل بعض التمارين.</p>'}
      ${s.weak.length ? `<h3>📌 كلمات تحتاج تقوية</h3><p>${s.weak.map(esc).join('، ')}</p>` : ''}
      ${recs.length ? `<h3>💡 تمارين مقترحة حسب أخطاء الطالب</h3><div class=list>${recs.map(r => `<button class=row onclick="${r[1]}"><span>🎯</span><b>${r[0]}</b></button>`).join('')}</div>` : ''}
    </div>`;
  }

  return { onAnswer, shape, newQuiz, choose, report, praise: cat => choose(cat || 'ok') };
})();
