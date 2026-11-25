/* /src/core/nav.js — شريط التنقل، الصفحة الرئيسية، أقسام العربية والإنجليزية والإنجازات، وتحميل الحزم الكسولة */
(() => {
  'use strict';
  const AD = '٠١٢٣٤٥٦٧٨٩', D = n => String(n).replace(/\d/g, d => AD[d]);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  const CURRICULUM_SCRIPTS = ['src/curriculum/course-data.js', 'src/curriculum/course-text.js', 'src/curriculum/course.js', 'src/curriculum/bank.js', 'src/curriculum/practice.js'];
  /* تسجيل الحزم الكسولة لتحميلها عند الحاجة فقط مع مؤشرات تحميل هيكلية */
  if (window.Lazy && Lazy.lazyStub) {
    Lazy.lazyStub(
      ['bank', 'bankSub', 'bankLesson', 'bankReview', 'bankPractice', 'courseLibrary', 'courseModule', 'courseViewer', 'coursePractice', 'practice'],
      CURRICULUM_SCRIPTS,
      null,
      'lesson'
    );
    Lazy.lazyStub(
      ['stories', 'story', 'talk', 'listenTest', 'readTest', 'sbStory', 'sbQuiz', 'sbTest'],
      ['src/stories/stories.js', 'src/stories/stories2.js', 'src/stories/stories-bank.js'],
      null,
      'stories'
    );
    Lazy.lazyStub(
      ['act', 'aLet', 'aLetP', 'aPath', 'aColAr', 'aColEn', 'aColQAr', 'aColQEn', 'aShpAr', 'aShpEn', 'aShpQAr', 'aShpQEn', 'aHar', 'aHarP', 'aHarQ', 'aAbj', 'aAbjP', 'aFirst', 'aOpp', 'aPat', 'aOdd', 'aDays', 'aEnPic', 'puzzles', 'riddles', 'logic', 'dragBuild', 'matchPics', 'dictation', 'dictationAdv', 'syllables', 'speedGame', 'weekly', 'advanced'],
      ['src/activities/activities.js', 'src/activities/activities2.js', 'src/activities/more.js', 'src/activities/puzzles.js'],
      null,
      'cards'
    );
    Lazy.lazyStub(
      ['gMem', 'gBuild', 'gPat', 'gOrd', 'games2d', 'g2levels', 'g2play'],
      ['src/games/engine.js', 'src/games/mini-games.js', 'src/games/games2d.js', 'src/games/phaser-games.js'],
      null,
      'cards'
    );
  }

  /* الأداء: محتوى القوائم المطوية يُبنى عند فتحها فقط */
  window.lzList = (() => {
    const M = new Map();
    let n = 0;
    document.addEventListener('toggle', e => {
      const d = e.target;
      if (!d || !d.open || !d.querySelector) return;
      const L = d.querySelector(':scope>[data-lz]');
      if (!L) return;
      const k = L.dataset.lz;
      if (M.has(k)) {
        L.innerHTML = M.get(k);
        M.delete(k);
        L.removeAttribute('data-lz');
      }
    }, true);
    return (html, cls) => {
      const k = 'z' + (++n);
      if (M.size > 400) M.clear();
      M.set(k, html);
      return `<div class="${cls || 'list'}" data-lz="${k}"></div>`;
    };
  })();

  const NAV = [
    ['home', '🏠', 'الرئيسية', () => home()],
    ['les', '📖', 'الدروس', () => sec('les')],
    ['exams', '🏆', 'الاختبارات', () => examHub()],
    ['games', '🎮', 'الألعاب', () => sec('games')],
    ['ach', '⭐', 'إنجازاتي', () => sec('ach')],
    ['set', '⚙️', 'ولي الأمر', () => parentPanel()]
  ];
  window.__navGo = i => NAV[i] && NAV[i][3]();

  const nv = document.createElement('header');
  nv.id = 'gn';
  nv.innerHTML = `<div class=logo><img src="img/icon.png" alt=""><b>حروفي</b></div>
    <nav>${NAV.map((n, i) => `<button data-k=${n[0]} onclick="__navGo(${i})"><span>${n[1]}</span>${n[2]}</button>`).join('')}</nav>`;
  document.body.insertBefore(nv, document.body.firstChild);

  const oh = window.h;
  window.h = x => {
    oh(x);
    const show = !!window.P && !['setup', 'who', 'quiz', 'game'].includes(window.V);
    nv.style.display = show ? 'flex' : 'none';
    document.body.classList.toggle('hasnav', show);
    const active = window.V === 'home' ? 'home' : window.V === 'exam' ? 'exams' : window.V === 'parent' ? 'set' : (window.CS || '');
    nv.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.k === active));
  };

  const rid = () => { const c = window.coach && coach(); return c && c.u && c.u.id; };
  const unitLabel = u => u.id === '2-51' ? 'التَّاءُ الْمَرْبُوطَةُ وَالْمَفْتُوحَةُ (تَدْرِيبٌ إِضَافِيٌّ)' : u.n;
  const bt = u => {
    const open = !window.lessonUnlocked || lessonUnlocked(u);
    const ic = P.done[u.id] ? '✅' : !open ? '🔒' : '⭐';
    return `<button class="row${u.id === rid() ? ' rec' : ''}${open ? '' : ' locked'}" onclick="lesson('${u.id}')"><span>${ic}</span><b>${esc(unitLabel(u))}</b><small>${P.sc[u.id] != null ? D(P.sc[u.id]) + '/٥' : (open ? '' : 'مقفل')}</small></button>`;
  };

  const byLang = (l, extra0) => S.map((s, a) => ({ s, a, u: [...s.u.filter(u => u.l === l), ...(a === 0 && extra0 ? [extra0] : [])] }))
    .filter(x => x.u.length)
    .map(x => `<details class="lesson-menu" data-stage-idx="${x.a}"${x.a === +P.stage ? ' open' : ''}><summary><span><b>${esc(x.s.n)}</b><small>${x.s.a} سنوات · ${D(x.u.length)} درسًا</small></span><i>⌄</i></summary>${x.a === +P.stage ? `<div class=list>${x.u.map(bt).join('')}</div>` : lzList(x.u.map(bt).join(''))}</details>`).join('');

  function hydrateAcademy(sub) {
    if (window.mountAcademy) return window.mountAcademy(sub);
    if (window.Lazy && Lazy.loadBundle) {
      return Lazy.loadBundle(CURRICULUM_SCRIPTS).then(() => {
        try { window.Router && Router.wrapAll && Router.wrapAll(); } catch (_) {}
        return window.mountAcademy && window.mountAcademy(sub);
      }).catch(() => {});
    }
  }

  function achBody() {
    const sf = id => { try { return find(id); } catch (_) { return null; } };
    const K = o => Object.keys(o || {});
    const done = K(P.done).map(sf).filter(Boolean);
    const started = K(P.sc).filter(id => !P.done[id]).map(sf).filter(Boolean);
    const st = K(P.stories).length, cd = K(P.courseDone).length, ac = K(P.act).length, ch = K(P.cd).length;
    const any = done.length || started.length || st || cd || ac || ch || (P.star || 0) > 0;
    const nx = window.nextLesson && (nextLesson(P.lang === 'en' ? 'en' : 'ar') || nextLesson('en'));
    const tile = (i, n, t) => `<div>${i}<br><b>${D(n)}</b><small>${t}</small></div>`;
    const row = u => `<button class=row onclick="lesson('${u.id}')"><span>${P.done[u.id] ? '✅' : '📘'}</span><b>${esc(u.n)}</b><small>${P.sc[u.id] != null ? D(P.sc[u.id]) + '/٥' : ''}</small></button>`;

    let out = `<div class="sum ach-sum">${tile('⭐', P.star || 0, 'نجمة')}${tile('✅', done.length, 'درس متقن')}${tile('📘', started.length, 'درس قيد التدريب')}${tile('🎯', ch, 'تحدٍّ يومي')}</div>`;
    out += (P.star || 0) >= 50
      ? '<button class=big onclick="cert()">🏆 شهادة إنجاز</button>'
      : `<p class=mut>اجمع ${D(50 - (P.star || 0))} نجمة للحصول على شهادة الإنجاز 🏆</p>`;

    if (window.badgeGrid) out += badgeGrid();

    if (!any) {
      return out + `<div class=ach-empty><span>🦉</span><h3>${P.gender === 'female' ? 'اِبْدَئِي دَرْسَكِ الْأَوَّلَ!' : 'اِبْدَأْ دَرْسَكَ الْأَوَّلَ!'}</h3>
        <p class=mut>${P.gender === 'female' ? 'عِنْدَمَا تُنْهِينَ الدُّرُوسَ سَتَظْهَرُ إِنْجَازَاتُكِ وَنُجُومُكِ وَشَارَاتُكِ هُنَا.' : 'عِنْدَمَا تُنْهِي الدُّرُوسَ سَتَظْهَرُ إِنْجَازَاتُكَ وَنُجُومُكَ وَشَارَاتُكَ هُنَا.'}</p>
        ${nx ? `<button class=big onclick="lesson('${nx.id}')">▶️ ابدأ: ${esc(nx.n)}</button>` : ''}</div>`;
    }

    out += `<h3>✅ الدروس المتقنة (${D(done.length)})</h3><div class=list>${done.map(row).join('') || '<p class=mut>لم تُتقن درسًا بعد — تحتاج ٤ من ٥ في اختبار الدرس.</p>'}</div>`;
    if (started.length) out += `<h3>📘 دروس بدأتها ولم تُتقنها بعد</h3><div class=list>${started.map(row).join('')}</div>`;
    const more = [
      [st, '📚', 'قصة مقروءة', 'stories()'],
      [cd, '🗂️', 'مادة تدريبية مكتملة', `sec('${P.lang === 'en' ? 'en' : 'ar'}')`],
      [ac, '🎨', 'نشاط منجز', 'act()']
    ].filter(x => x[0]);
    if (more.length) out += `<h3>🌟 إنجازات أخرى</h3><div class=list>${more.map(x => `<button class=row onclick="${x[3]}"><span>${x[1]}</span><b>${D(x[0])} ${x[2]}</b></button>`).join('')}</div>`;
    if (nx) out += `<button class=big onclick="lesson('${nx.id}')">▶️ الدرس التالي: ${esc(nx.n)}</button>`;
    return out;
  }

  const HD = {
    ar: ['ar', 'ض', 'أكاديمية العربية', 'مخارج • حروف • قراءة • قواعد', '📖'],
    en: ['en', 'ABC', 'أكاديمية الإنجليزية', 'Letters • Phonics • Words • Grammar', '🔤']
  };

  function sec(k) {
    if (k === 'math') return home();
    window.V = 'sec';
    window.CS = k;
    ens();
    const dc = dueN();
    const unres = window.ExamEngine ? ExamEngine.unresolvedMistakes() : [];
    const T = {
      les: ['📖 الدروس', `<h3>🔤 أكاديمية العربية</h3><div id=acad-dash-ar></div><div id=acad-stages-ar>${byLang('ar', G.g1)}</div><h3>🔠 أكاديمية الإنجليزية</h3><div id=acad-dash-en></div><div id=acad-stages-en>${byLang('en', G.g2)}</div>`],
      ar: ['🔤 اللغة العربية', `
        <div class=list style="margin-bottom:10px">
          <button class=row onclick="arTeach()"><span>🦉</span><b>مُعَلِّمُ الْقَوَاعِدِ وَالْمَخَارِجِ</b><small>كلمات • نطق • مراجعة ذكية</small></button>
        </div>
        <div id=acad-dash-ar></div>
        <div id=acad-stages-ar>${byLang('ar', G.g1)}</div>`],
      en: ['🔠 English', `
        <div class=list style="margin-bottom:10px">
          <button class=row onclick="enTeach()"><span>🦉</span><b>English Smart Teacher</b><small>Phonics • Reading • Grammar • Mistakes review</small></button>
        </div>
        <div id=acad-dash-en></div>
        <div id=acad-stages-en>${byLang('en', G.g2)}</div>`],
      games: ['🎮 الألعاب والتدريب', `<div class=list>
        <button class=row onclick="daily()"><span>🎯</span><b>${P.cd[day()] ? 'تحدي اليوم (أُنجز) ✓' : 'تحدي اليوم +٣ ⭐'}</b></button>
        <button class=row onclick="examHub()"><span>🏆</span><b>الِاخْتِبَارَاتُ الْمُتَدَرِّجَةُ (عَرَبِي + إِنْجِلِيزِي)</b><small>مبتدئ • متوسط • متقدم • متقن</small></button>
        ${unres.length ? `<button class=row onclick="practiceMistakes()"><span>🩹</span><b>تَدْرِيبُ الْأَخْطَاءِ السَّابِقَةِ</b><small>${D(unres.length)} سؤال</small></button>` : ''}
        <button class=row onclick="games2d()"><span>🎮</span><b>أَلْعَابٌ تَعْلِيمِيَّةٌ ثُنَائِيَّةُ الْأَبْعَادِ</b></button>
        <button class=row onclick="act()"><span>🧩</span><b>أَنْشِطَةٌ تَفَاعُلِيَّةٌ وَإِمْلَاءٌ</b></button>
        <button class=row onclick="puzzles()"><span>🏝️</span><b>جَزِيرَةُ الْأَلْغَازِ وَالتَّفْكِيرِ</b></button>
        <button class=row onclick="speak()"><span>🎤</span><b>تَدْرِيبُ النُّطْقِ بِالْمَيْكْرُوفُونِ</b></button>
        <button class=row onclick="MindVoice.ask(true)"><span>🗣️</span><b>سُؤَالٌ صَوْتِيٌّ مِنْ بُومِي</b></button>
        ${dc ? `<button class=row onclick="review()"><span>🔁</span><b>مُرَاجَعَةٌ ذَكِيَّةٌ</b><small>${D(dc)}</small></button>` : ''}
      </div>`],
      ach: ['🏆 إنجازاتي', achBody()]
    };

    const [t, b] = T[k] || T.les;
    let hd = '';
    if (HD[k]) {
      const [c, ic, title, sub, em] = HD[k];
      hd = `<div class="acad-hd ${c}"><span class="acad-ic"${c === 'en' ? ' dir=ltr' : ''}>${ic}</span><div><b>${title}</b><small${c === 'en' ? ' dir=ltr' : ''}>${sub}</small></div><span class=acad-em>${em}</span></div>`;
    } else if (k === 'ach') {
      const st = +P.star || 0, bd = Object.keys(P.badges || {}).length;
      hd = `<div class=ach-hd><span class=ach-cup>🏆</span><div class=ach-rib>إنجازاتي</div><b>${st ? 'أحسنت يا بطل!' : 'هيا نبدأ رحلة الإنجازات!'}</b><small>${st ? `جمعت ${D(st)} نجمة${bd ? ` و${D(bd)} شارة` : ''} 🌟` : 'كل درس تتقنه يمنحك نجومًا وشارات جديدة'}</small><span class="ach-conf c1">🎉</span><span class="ach-conf c2">✨</span></div>`;
    }

    h(`<section class=sec>${hd}<h2 class="${HD[k] || k === 'ach' ? 'acad-h2' : ''}">${t}</h2>${b}</section>`);
    if (k === 'ar' || k === 'en') hydrateAcademy(k);
    else if (k === 'les' || !T[k]) { hydrateAcademy('ar'); hydrateAcademy('en'); }
  }

  function home() {
    window.V = 'home';
    window.CS = 'home';
    ens();
    const st = P.stage, us = units(st), dn = us.filter(u => P.done[u.id]).length;
    const c = window.coach && coach();
    const IC = {
      games: '<i class="ico ico-pic"><img src="img/3d/1f3ae.webp" alt="🎮"></i>',
      ach: '<i class="ico ico-pic"><img src="img/ui/medal.webp" alt="🏆"></i>'
    };
    const go = c ? `lesson('${c.u.id}')` : "sec('les')";

    let nx = null;
    try { nx = window.Mind && Mind.next(); } catch (_) {}
    if (!nx && c) nx = { icon: '▶️', t: c.u.n, go: `lesson('${c.u.id}')` };
    const nxHTML = nx ? `<button class="nx h2-next" onclick="${nx.go.replace(/"/g, '&quot;')}"><span>${nx.icon}</span><div><small>الخطوة التالية لك${nx.why ? ' · ' + esc(nx.why) : ''}</small><b>${esc(nx.t)}</b></div></button>` : '';

    const tl = [
      ['🏆', 'الاختبارات المتدرّجة', 'مبتدئ ← متقن', 'examHub()'],
      ['📚', 'عالم القصص', 'قراءة واستماع', 'stories()'],
      ['💬', 'المعلم الذكي بومي', 'اسأل وتعلّم معي', 'bomi()'],
      [IC.games, 'الألعاب التفاعلية', 'تعلّم بالمرح', 'games2d()'],
      ['🧩', 'الأنشطة والإملاء', 'حروف، مقاطع، أضداد', 'act()'],
      ['🎯', 'تحدي اليوم', P.cd[day()] ? 'أُنجز اليوم ✓' : '+٣ نجوم ⭐', 'daily()'],
      [IC.ach, 'إنجازاتي', '⭐ ' + D(P.star || 0), "sec('ach')"],
      ['⚙️', 'الإعدادات والملف الشخصي', esc(P.name || 'الطالب'), 'parentPanel()']
    ];

    h(`<section class="h2-hero">
        <div class=h2-cloud></div>
        <img class=h2-castle src="img/3d/1f3f0.webp" alt="">
        <img class=h2-owlbig src="img/ui/owl-book.webp" onerror="this.remove()" alt="">
        <span class="h2-star s1">⭐</span><span class="h2-star s2">✨</span>
        <div class=h2-txt>
          <h1>${P.gender === 'female' ? 'مَرْحَبًا بِكِ فِي' : 'مَرْحَبًا بِكَ فِي'} <b>البومة التعليمية الذكية</b></h1>
          <p>${P.gender === 'female' ? 'تَعَلَّمِي الْعَرَبِيَّةَ وَالْإِنْجِلِيزِيَّةَ بِمُتْعَةٍ.. وَحَقِّقِي إِنْجَازَاتٍ رَائِعَةً!' : 'تَعَلَّمْ الْعَرَبِيَّةَ وَالْإِنْجِلِيزِيَّةَ بِمُتْعَةٍ.. وَحَقِّقْ إِنْجَازَاتٍ رَائِعَةً!'}</p>
          <button class=h2-cta onclick="${go}">▶ ${P.gender === 'female' ? 'اِبْدَئِي رِحْلَتَكِ' : 'اِبْدَأْ رِحْلَتَكَ'} التَّعْلِيمِيَّةَ</button>
        </div>
      </section>
      ${nxHTML}
      <div class=h2-acad>
        <button class="h2-card ar" onclick="sec('ar')"><span class="h2-ic h2-img"><img src="img/ui/acad-ar.webp" alt="ض" onerror="this.parentNode.textContent='ض'"></span><b>أكاديمية العربية</b><small>حروف • مخارج • قراءة • قواعد</small><i class=h2-go>${P.gender === 'female' ? 'اِبْدَئِي' : 'اِبْدَأِ'} الْآنَ ▶</i></button>
        <button class="h2-card en" onclick="sec('en')"><span class="h2-ic h2-img" dir=ltr><img src="img/ui/acad-en.webp" alt="ABC" onerror="this.parentNode.textContent='ABC'"></span><b>أكاديمية الإنجليزية</b><small dir=ltr>Letters • Phonics • Words</small><i class=h2-go>${P.gender === 'female' ? 'اِبْدَئِي' : 'اِبْدَأِ'} الْآنَ ▶</i></button>
      </div>
      <h3 class=h2-h>🎮 تعلّم والعب واختبر مستواك</h3>
      <div class="tl tl-glass">${tl.map(t => `<button class=gt onclick="${t[3]}">${t[0]}<b>${t[1]}</b><small>${t[2]}</small></button>`).join('')}</div>
      <button class="h2-parent h2-parent-end" onclick="parentPanel()"><span class=e>👨‍👩‍👧</span><span><b>لَوْحَةُ وَلِيِّ الْأَمْرِ وَالْإِعْدَادَاتِ</b><small>المِلَفُّ الشَّخْصِيُّ وَالتَّقَدُّمُ وَالنَّتَائِجُ · ${D(dn)}/${D(us.length)} دروس المرحلة</small></span><i>←</i></button>`);
  }

  window.sec = sec;
  window.home = home;

  /* التشغيل الأوّلي بعد تحميل النواة */
  P = load();
  ens();
  if (DB.kids.length > 1) who();
  else if (P) home();
  else setup();
})();
