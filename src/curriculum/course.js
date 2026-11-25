/* /src/curriculum/course.js — مكتبة الدروس النصية للعربية والإنجليزية (بدون رياضيات) */
(() => {
  'use strict';
  const pdf = (id, title, file, pages = 1) => ({ id, title, kind: 'pdf', pages });
  const imgs = (id, title, start, end) => ({ id, title, kind: 'images', start, end, pages: end - start + 1 });
  const arabicFiles = (folder, names) => names.map((x, i) => pdf(`${folder}-${i + 1}`, x[0], `${folder}/${x[1]}`, x[2] || 1));

  const alpha = [
    ['حرف الألف', 'alif_2.pdf'], ['حرف الباء', '02_ba.pdf', 4], ['حرف التاء', '03_ta.pdf', 4], ['حرف الثاء', '04_tha.pdf', 4],
    ['حرف الجيم', '05_gim.pdf', 4], ['حرف الحاء', '06_ha.pdf', 4], ['حرف الخاء', '07_kha.pdf', 4], ['حرف الدال', '08_thal.pdf', 4],
    ['حرف الذال', '09_dhal.pdf', 4], ['حرف الراء', '10_ra.pdf', 4], ['حرف الزاي', '11_zay.pdf', 4], ['حرف السين', '12_sin.pdf', 4],
    ['حرف الشين', '13_shin.pdf', 4], ['حرف الصاد', '14_ssaad.pdf', 4], ['حرف الضاد', '15_ddaad.pdf', 4], ['حرف الطاء', '16_ttaa.pdf', 4],
    ['حرف الظاء', '17_thaa.pdf', 4], ['حرف العين', '18_ayne.pdf', 4], ['حرف الغين', '19_ghyne.pdf', 4], ['حرف الفاء', '20_faa.pdf', 4],
    ['حرف القاف', '21_kkaaf.pdf', 4], ['حرف الكاف', '22_kaf.pdf', 4], ['حرف اللام', '23_lam.pdf', 4], ['حرف الميم', '24_meem.pdf', 4],
    ['حرف النون', '25_non.pdf', 4], ['حرف الهاء', '26_haa.pdf', 4], ['حرف الواو', '27_waw.pdf', 4], ['حرف الياء', '28_yaa.pdf', 4]
  ];
  const shortVowels = [['الفتحة', 'fatha.pdf', 5], ['الكسرة', 'kassra.pdf', 5], ['الضمة', 'damma.pdf', 5], ['السكون', 'l2_u3_soukon.pdf', 3]];
  const longVowels = [
    ['المد أو الحركة ١', 'madd-or-haraka-1.pdf'], ['المد أو الحركة ٢', 'madd-or-haraka-2.pdf'],
    ['المدود في الكلمات ١', 'madd-letters-in-words-1.pdf'], ['المدود في الكلمات ٢', 'madd-letters-in-words-2.pdf'],
    ['المدود في الجمل ١', 'madd-letters-in-sentences-1.pdf'], ['المدود في الجمل ٢', 'madd-letters-in-sentences-2.pdf'],
    ['ابحث عن المد في الفقرة ١', 'madd-letters-find-in-paragraph-1.pdf'], ['ابحث عن المد في الفقرة ٢', 'madd-letters-find-in-paragraph-2.pdf']
  ];
  const similar = [
    ['التاء والطاء', 'ta-taaa.pdf'], ['التاء والطاء والضاد والدال', 'ta-taaa-dad-dall.pdf'],
    ['الذال والزاي والثاء والشين', 'thal-zay-thaa-shin.pdf'], ['السين والصاد', 'sin-saad.pdf'],
    ['القاف والكاف', 'qaaf-kaf.pdf'], ['القاف والكاف والخاء والغين', 'qaf-kaf-kha-ghayn.pdf'],
    ['الخاء والغين', 'khaa-ghyn.pdf'], ['الحاء والهاء', 'ha-haaa.pdf'],
    ['الحاء والخاء والعين والألف', 'ha-haaa-ayn-alif.pdf'], ['الألف والعين', 'alif-ayne.pdf']
  ];

  const MODULES = [
    { id: 'ar-letters', lang: 'ar', level: 1, icon: '🔤', title: 'الحروف الهجائية', detail: 'الحروف العربية بالترتيب مع أوراق تدريب الحركات.', resources: arabicFiles('حروف الهجاء', alpha) },
    {
      id: 'ar-worksheets', lang: 'ar', level: 1, icon: '✍️', title: 'تأسيس الحروف العربية', detail: 'أوراق تأسيس عربية إضافية للحروف بالحركات.',
      resources: [
        pdf('ar-letter-book', 'كتاب الحروف العربية', 'مجلد جديد/حروف/تعلم-أحرف-اللغة-العربية-أوراق-عمل-PDF-A4.pdf', 64),
        ...arabicFiles('مجلد جديد/حروف', [
          ['حرف الألف بالحركات', 'حرف-الألف-بالحركات-PDF.pdf', 23], ['حرف الباء بالحركات', 'حرف-الباء-بالحركات-PDF.pdf', 23],
          ['حرف التاء بالحركات', 'حرف-التاء-بالحركات-PDF.pdf', 23], ['حرف الثاء بالحركات', 'حرف-الثاء-بالحركات-PDF.pdf', 23],
          ['حرف الجيم بالحركات', 'حرف-الجيم-بالحركات-PDF.pdf', 23], ['حرف الحاء بالحركات', 'حرف-الحاء-بالحركات-PDF.pdf', 23],
          ['حرف الخاء بالحركات', 'حرف-الخاء-بالحركات-PDF.pdf', 23], ['حرف الدال بالحركات', 'حرف-الدال-بالحركات-PDF.pdf', 23],
          ['حرف الكاف بالحركات', 'حرف-الكاف-بالحركات-PDF.pdf', 23], ['حرف اللام بالحركات', 'حرف-اللام-بالحركات-PDF.pdf', 23]
        ])
      ]
    },
    { id: 'ar-sounds', lang: 'ar', level: 2, icon: '🔊', title: 'الحركات والمدود', detail: 'القصيرة ثم الطويلة، من الصوت إلى الكلمة والجملة.', resources: [...arabicFiles('المدود القصيرة', shortVowels), ...arabicFiles('المدود الطويلة', longVowels)] },
    { id: 'ar-reading', lang: 'ar', level: 2, icon: '📖', title: 'التمييز والقراءة', detail: 'حروف متشابهة في النطق وتحليل الكلمات.', resources: [...arabicFiles('الحروف المتشابهة في النطق', similar), ...arabicFiles('تحليل الكلمات', [['تحليل الكلمات ١', 'words-analysis-1.pdf'], ['تحليل الكلمات ٢', 'words-analysis-2.pdf'], ['تحليل الكلمات ٣', 'words-analysis-3.pdf'], ['تحليل الكلمات ٤', 'words-analysis-4.pdf']])] },
    {
      id: 'ar-grammar', lang: 'ar', level: 3, icon: '🧩', title: 'القواعد العربية', detail: 'التنوين، أنواع الأسماء، المثنى والجمع، والأفعال.',
      resources: [
        ...arabicFiles('التنوين', [['تنوين الضم', 'l3_u1_tanwin_dam.pdf'], ['تنوين الفتح', 'l3_u1_tanwin_fateh.pdf', 3], ['تنوين الكسر', 'l3_u1_tanwin_kaseer.pdf', 2]]),
        ...arabicFiles('أنواع الأسماء', [['أنواع الأسماء ١', 'types-nouns-1.pdf'], ['أنواع الأسماء ٢', 'types-nouns-2.pdf'], ['أنواع الأسماء ٣', 'types-nouns-3.pdf']]),
        ...arabicFiles('المثنى', [['المفرد والمثنى ١', 'l4_u2_mofrad_mothanaa_1.pdf', 4], ['المفرد والمثنى ٢', 'l4_u2_mofrad_mothanaa_2.pdf', 4]]),
        ...arabicFiles('الجمع', [['المفرد والمثنى والجمع', 'l4_u2_mofrad_mothanaa_jamea.pdf', 3], ['المثنى والجمع', 'l5_u4_mouthanah_wa_jamaa.pdf', 2]]),
        ...arabicFiles('الأفعال', [['الأفعال ١', 'l4_u1_afaal_1.pdf', 3], ['الأفعال ٢', 'l4_u1_afaal_2.pdf', 3]])
      ]
    },
    {
      id: 'ar-practice', lang: 'ar', level: 4, icon: '💬', title: 'المحادثة والتطبيق', detail: 'بطاقات محادثة وتمارين متنوعة للتطبيق بعد الأساسيات.',
      resources: [...arabicFiles('محادثة', [['محادثة ١', '1.pdf'], ['محادثة ٢', '2.pdf'], ['محادثة ٣', '3.pdf'], ['محادثة ٤', '4.pdf']]), pdf('ar-mixed', 'تمارين عربية متنوعة', 'مجلد جديد/متنوع.pdf', 56)]
    },
    {
      id: 'bi-colors-shapes', lang: 'both', level: 1, icon: '🌈', title: 'الألوان بالعربية والإنجليزية', detail: 'مواد عربية وإنجليزية متقابلة للألوان.',
      resources: [pdf('ar-colors', 'الألوان بالعربية', 'مجلد جديد/الوان إنجليزي وعربي/تعلم-الألوان-بالعربي-للأطفال-PDF.pdf', 32), pdf('en-colors', 'English colors', 'مجلد جديد/الوان إنجليزي وعربي/Learn-English-Colors-for-Kids-PDF.pdf', 33)]
    },
    { id: 'en-print', lang: 'en', level: 1, icon: '🔠', title: 'English Letters', detail: 'أوراق تأسيس الحروف الإنجليزية.', resources: [pdf('en-letters', 'English Letters for Kids', 'مجلد جديد/English-Letters-for-Kids-PDF-A4.pdf', 28)] },
    { id: 'en-visual-1', lang: 'en', level: 1, icon: '🌱', title: 'English visual course - Level 1', detail: 'أساسيات الإنجليزية والصوتيات.', resources: [imgs('en-pages-001-136', 'دروس مصورة: الصفحات ١–١٣٦', 1, 136)] },
    { id: 'en-visual-2', lang: 'en', level: 2, icon: '🗣️', title: 'English visual course - Level 2', detail: 'مفردات وجمل أساسية.', resources: [imgs('en-pages-137-272', 'دروس مصورة: الصفحات ١٣٧–٢٧٢', 137, 272)] },
    { id: 'en-visual-3', lang: 'en', level: 3, icon: '🧠', title: 'English visual course - Level 3', detail: 'قواعد وقراءة وتطبيق.', resources: [imgs('en-pages-273-408', 'دروس مصورة: الصفحات ٢٧٣–٤٠٨', 273, 408)] },
    { id: 'en-visual-4', lang: 'en', level: 4, icon: '🚀', title: 'English visual course - Level 4', detail: 'التوسع في المفردات والطلاقة.', resources: [imgs('en-pages-409-545', 'دروس مصورة: الصفحات ٤٠٩–٥٤٥', 409, 545)] }
  ];

  window.COURSE_MODULES = MODULES;
  const getModule = id => MODULES.find(x => x.id === id);
  const getResource = (m, id) => m && m.resources.find(x => x.id === id);
  const done = () => (window.P && P.courseDone) || {};
  const saveDone = (key, value) => {
    if (!window.P) return;
    P.courseDone = P.courseDone || {};
    if (value) P.courseDone[key] = true;
    else delete P.courseDone[key];
    save();
  };
  const moduleDone = m => m.resources.filter(r => done()[`${m.id}:${r.id}`]).length;
  const resourceGroups = m => {
    const cuts = {
      'ar-letters': [['الحروف: أ إلى خ', 0, 7], ['الحروف: د إلى ص', 7, 14], ['الحروف: ض إلى ي', 14]],
      'ar-worksheets': [['كتاب التأسيس', 0, 1], ['الحروف بالحركات', 1]],
      'ar-sounds': [['الحركات القصيرة', 0, 4], ['المدود الطويلة', 4]],
      'ar-reading': [['الحروف المتشابهة في النطق', 0, 10], ['تحليل الكلمات', 10]],
      'ar-grammar': [['التنوين وأنواع الأسماء', 0, 6], ['المثنى والجمع والأفعال', 6]],
      'ar-practice': [['بطاقات المحادثة', 0, 4], ['تدريبات إضافية', 4]],
      'bi-colors-shapes': [['الألوان', 0]]
    }[m.id] || [['الدروس', 0]];
    return cuts.map(([title, start, end]) => ({ title, resources: m.resources.slice(start, end) })).filter(g => g.resources.length);
  };

  (() => {
    const T = window.COURSE_TEXT || {};
    MODULES.forEach(m => {
      m.resources = m.resources.filter(r => {
        if (r.kind === 'pdf') {
          let n = 0;
          while (T['pdf:' + r.id + ':' + (n + 1)]) n++;
          r.start = 1; r.end = n; r.pages = n;
          return n > 0;
        }
        let e = r.start - 1;
        r.avail = [];
        for (let k = r.start; k <= r.end; k++) if (T['en:' + k]) { e = k; r.avail.push(k); }
        if (e < r.start) return false;
        r.start = r.avail[0]; r.end = e; r.pages = r.avail.length;
        return true;
      });
    });
    for (let i = MODULES.length - 1; i >= 0; i--) if (!MODULES[i].resources.length) MODULES.splice(i, 1);
  })();

  const langName = l => l === 'ar' ? 'العربية' : l === 'en' ? 'English' : 'عربي + English';
  const levelName = l => `المستوى ${l}`;
  const esc = s => String(s).replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));

  function courseModule(moduleId, filter = 'all') {
    const m = getModule(moduleId);
    if (!m) return window.courseLibrary(filter);
    window.V = 'course-module';
    window.CS = (filter === 'en' || m.lang === 'en') ? 'en' : (filter === 'ar' || m.lang === 'ar') ? 'ar' : 'les';
    const n = moduleDone(m);
    h(`<section class="sec course"><button class="link" onclick="goBack()">← رجوع</button>
      <div class="course-module-title"><span>${m.icon}</span><div><span class="course-level">${levelName(m.level)}</span><h2>${esc(m.title)}</h2></div></div>
      <p class="mut">${esc(m.detail)}</p><p class="mut">أُنجز ${n} من ${m.resources.length} مادة.</p>
      ${resourceGroups(m).map(g => `<details class="course-menu" open><summary><span><b>📚 ${esc(g.title)}</b><small>${g.resources.length} درس${g.resources.length > 1 ? 'ًا' : ''}</small></span><i>⌄</i></summary><div class="course-stack">${g.resources.map(r => {
        const d = done()[`${m.id}:${r.id}`];
        return `<button class="course-resource" onclick="courseViewer('${m.id}','${r.id}','${filter}')"><span>📖</span><span><b>${esc(r.title)}</b><small>${r.pages === 1 ? 'صفحة واحدة' : `${r.pages} صفحات`}</small></span><span class="${d ? 'complete' : ''}">${d ? '✅ أُنجز' : 'فتح ←'}</span></button>`;
      }).join('')}</div></details>`).join('')}</section>`);
  }

  let imageState = null;
  function courseViewer(moduleId, resourceId, filter = 'all', page) {
    const m = getModule(moduleId), r = getResource(m, resourceId);
    if (!r) return window.courseModule(moduleId, filter);
    window.V = 'course-viewer';
    window.CS = (filter === 'en' || m.lang === 'en') ? 'en' : (filter === 'ar' || m.lang === 'ar') ? 'ar' : 'les';
    const key = `${m.id}:${r.id}`, isDone = !!done()[key], CT = window.CourseText;
    const av = r.avail || null;
    let cur = Math.max(r.start, Math.min(r.end, +page || r.start));
    if (av && av.indexOf(cur) < 0) cur = av.find(x => x >= cur) || av[av.length - 1];
    const ix = av ? av.indexOf(cur) : cur - r.start, last = av ? av.length - 1 : r.end - r.start;
    imageState = { moduleId, resourceId, filter, current: cur };
    const pager = r.pages > 1 ? `<div class="course-pager"><button onclick="courseImageStep(-1)" ${ix === 0 ? 'disabled' : ''}>→ السابق</button><b id="course-page-label">${ix + 1} / ${r.pages}</b><button onclick="courseImageStep(1)" ${ix === last ? 'disabled' : ''}>التالي ←</button></div>` : '';
    const viewer = `${CT.render(r, cur, key + ':' + cur)}${pager}`;
    h(`<section class="sec course"><button class="link" onclick="goBack()">← رجوع</button>
      <p class="course-lang">${levelName(m.level)} · ${langName(m.lang)}</p>
      <h2 class="course-view-title">📖 ${esc(r.title)}</h2>
      <p class="course-view-meta">${r.pages === 1 ? 'صفحة واحدة' : `${r.pages} صفحات`}</p>
      ${viewer}
      <div class="course-actions"><button class="big" onclick="coursePractice('${m.id}','${r.id}','${filter}')">✍️ حل تدريب الدرس</button><button class="${isDone ? 'course-done' : 'alt'}" onclick="courseToggleDone('${m.id}','${r.id}','${filter}',${cur})">${isDone ? '✓ تم الإنجاز - تراجع' : '✓ علّم كمُنجز'}</button></div></section>`);
  }

  function courseImageStep(step) {
    if (!imageState) return;
    const m = getModule(imageState.moduleId), r = getResource(m, imageState.resourceId);
    let next;
    if (r.avail) {
      const j = r.avail.indexOf(imageState.current) + step;
      next = r.avail[Math.max(0, Math.min(r.avail.length - 1, j))];
    } else next = Math.max(r.start, Math.min(r.end, imageState.current + step));
    if (next !== imageState.current) courseViewer(imageState.moduleId, imageState.resourceId, imageState.filter, next);
  }

  function courseToggleDone(moduleId, resourceId, filter, page) {
    const key = `${moduleId}:${resourceId}`;
    saveDone(key, !done()[key]);
    courseViewer(moduleId, resourceId, filter, page);
  }

  window.courseModule = courseModule;
  window.courseViewer = courseViewer;
  window.courseImageStep = courseImageStep;
  window.courseToggleDone = courseToggleDone;

  const groupsFor = key => MODULES.map(m => ({ m, rs: m.resources.filter(r => (m.lang === 'both' ? (/[A-Za-z]/.test(r.title || '') ? 'en' : 'ar') : m.lang) === key) })).filter(g => g.rs.length);
  const courseBlock = key => {
    const G = groupsFor(key);
    if (!G.length) return '';
    return `<p class="mut course-books">📚 ${key === 'en' ? 'English: كتب ودروس مصوّرة' : 'كتب ودروس العربية'}</p>` + G.map(({ m, rs }) => {
      const n = rs.filter(r => done()[`${m.id}:${r.id}`]).length;
      return `<details class="lesson-menu course-menu-sec"><summary><span><b>${m.icon} ${esc(m.title)}</b><small>${levelName(m.level)} · ${rs.length} درس · أُنجز ${n}</small></span><i>⌄</i></summary>${lzList(`${rs.map(r => {
        const d = done()[`${m.id}:${r.id}`];
        return `<button class="row" onclick="courseViewer('${m.id}','${r.id}','${key}')"><span>${d ? '✅' : '📖'}</span><b>${esc(r.title)}</b><small>${r.pages === 1 ? 'صفحة' : r.pages + ' صفحات'}</small></button>`;
      }).join('')}`)}</details>`;
    }).join('');
  };

  window.courseLibrary = function (langFilter) {
    window.V = 'sec'; window.CS = langFilter === 'en' ? 'en' : langFilter === 'ar' ? 'ar' : 'les';
    const blocks = langFilter === 'en' ? courseBlock('en') : langFilter === 'ar' ? courseBlock('ar') : courseBlock('ar') + courseBlock('en');
    h(`<section class="sec course"><button class="link" onclick="goBack()">← رجوع</button><h2>📘 الكتب والدروس النصية</h2>${blocks || '<p class=mut>لا توجد دروس نصية متاحة حاليًا.</p>'}</section>`);
  };
})();
