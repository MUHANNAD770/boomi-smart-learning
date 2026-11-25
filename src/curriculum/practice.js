/* /src/curriculum/practice.js — تدريبات تفاعلية لدروس الكورس العربي والإنجليزي (بدون رياضيات) */
(() => {
  'use strict';
  const M = () => window.COURSE_MODULES || [];
  const getM = id => M().find(x => x.id === id);
  const getR = (m, id) => m && m.resources.find(x => x.id === id);
  const esc = t => String(t).replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
  const choose = a => [...a].sort(() => Math.random() - 0.5);
  const pick = (prompt, cue, answer, choices) => {
    if (Array.isArray(answer) && choices === undefined) { choices = answer; answer = choices[0]; }
    return { type: 'pick', prompt, cue, answer, choices: [...new Set([answer, ...choices])].slice(0, 4) };
  };
  const write = (prompt, cue, answer, answers = []) => ({ type: 'write', prompt, cue, answer, answers: [answer, ...answers] });

  const banks = {
    'ar-letters': () => [
      pick('اختر الحرف الذي تبدأ به كلمة «بَابٌ».', '🚪', 'ب', ['ت', 'ن', 'م']),
      pick('اختر الحرف الذي تبدأ به كلمة «قَلَمٌ».', '✏️', 'ق', ['ك', 'ف', 'ل']),
      pick('ما الحرف الأخير في كلمة «وَلَدٌ»؟', 'وَلَد', 'د', ['ل', 'و', 'ذ']),
      pick('اختر الكلمة التي تبدأ بحرف س.', 'س', ['سَمَكٌ', 'قَمَرٌ', 'بَيْتٌ']),
      write('اكتب حرف الألف.', 'أ', 'أ', ['ا']),
      write('اكتب حرف الياء.', 'ي', 'ي', ['ى'])
    ],
    'ar-worksheets': () => [
      pick('اختر الحرف مع الفتحة.', 'بَ', 'بَ', ['بِ', 'بُ', 'بْ']),
      pick('اختر الحرف مع الكسرة.', 'بِ', 'بِ', ['بَ', 'بُ', 'بْ']),
      pick('اختر الحرف مع الضمة.', 'بُ', 'بُ', ['بَ', 'بِ', 'بْ']),
      pick('أي كلمة تبدأ بحرف م؟', 'م', ['مَوْزٌ', 'وَرْدٌ', 'بَيْتٌ']),
      write('اكتب حرف الباء.', 'ب', 'ب', ['بـ']),
      write('اكتب حرف الجيم.', 'ج', 'ج', ['جـ'])
    ],
    'ar-sounds': () => [
      pick('ما الحركة في «بَ»؟', 'بَ', 'فَتْحَة', ['كَسْرَة', 'ضَمَّة', 'سُكُون']),
      pick('ما الحركة في «بِ»؟', 'بِ', 'كَسْرَة', ['فَتْحَة', 'ضَمَّة', 'سُكُون']),
      pick('ما الحركة في «بُ»؟', 'بُ', 'ضَمَّة', ['فَتْحَة', 'كَسْرَة', 'سُكُون']),
      pick('أي كلمة فيها مد بالألف؟', 'اختر الكلمة', 'بَابٌ', ['فِيلٌ', 'نُورٌ', 'بِنْتٌ']),
      pick('أي كلمة فيها مد بالياء؟', 'اختر الكلمة', 'فِيلٌ', ['بَابٌ', 'نُورٌ', 'وَلَدٌ']),
      pick('ما العلامة فوق الباء في «بْ»؟', 'بْ', 'سُكُون', ['فَتْحَة', 'كَسْرَة', 'ضَمَّة'])
    ],
    'ar-reading': () => [
      pick('اختر الكلمة التي تبدأ بحرف س.', 'س', ['سَمَكٌ', 'صَقْرٌ', 'ثَعْلَبٌ']),
      pick('اختر الكلمة التي تبدأ بحرف ص.', 'ص', ['صَقْرٌ', 'سَمَكٌ', 'زَهْرَةٌ']),
      pick('في كلمة «شَمْسٌ» ما الحرف الأول؟', 'شَمْس', 'ش', ['س', 'ص', 'ث']),
      pick('حلّل كلمة «بَاب» إلى حروفها: الحرف الأوسط هو...', 'بَاب', 'ا', ['ب', 'ي', 'و']),
      pick('أي حرفين متقاربان في النطق؟', 'اختر الزوج', 'س ، ص', ['ب ، م', 'و ، ي', 'ل ، ن']),
      write('اكتب أول حرف من كلمة «قَمَرٌ».', 'قَمَرٌ', 'ق')
    ],
    'ar-grammar': () => [
      pick('اختر الكلمة التي فيها تنوين ضم.', 'كِتَابٌ', 'كِتَابٌ', ['كِتَابًا', 'كِتَابٍ', 'كِتَاب']),
      pick('اختر الكلمة التي فيها تنوين فتح.', 'قَلَمًا', 'قَلَمًا', ['قَلَمٌ', 'قَلَمٍ', 'قَلَم']),
      pick('اختر المثنى.', 'كِتَاب', 'كِتَابَانِ', ['كُتُبٌ', 'كِتَابٌ', 'كَاتِبٌ']),
      pick('اختر الجمع.', 'وَلَد', 'أَوْلَادٌ', ['وَلَدَانِ', 'وَلَدٌ', 'وَالِدٌ']),
      pick('اختر الفعل.', 'اختر الكلمة الصحيحة', 'يَكْتُبُ', ['كِتَابٌ', 'قَلَمٌ', 'مَدْرَسَةٌ']),
      pick('اختر الاسم.', 'اختر الكلمة الصحيحة', 'حَدِيقَةٌ', ['يَلْعَبُ', 'يَكْتُبُ', 'ذَهَبَ'])
    ],
    'ar-practice': () => [
      pick('اختر الرد المناسب على: «السَّلَامُ عَلَيْكُمْ».', '👋', 'وَعَلَيْكُمُ السَّلَامُ', ['شُكْرًا', 'مَعَ السَّلَامَةِ', 'نَعَمْ']),
      pick('اختر سؤال التعارف الصحيح.', '🤝', 'مَا اسْمُكَ؟', ['مَتَى تَنَامُ؟', 'أَيْنَ الْبَيْتُ؟', 'مَا لَوْنُكَ؟']),
      pick('أكمل: «أَنَا ___».', 'أَنَا', 'بِخَيْرٍ', ['مَدْرَسَةٌ', 'قَلَمٌ', 'كَبِيرٌ']),
      pick('اختر كلمة شكر.', '🙏', 'شُكْرًا', ['مِنْ فَضْلِكَ', 'مَرْحَبًا', 'إِلَى اللِّقَاءِ']),
      write('اكتب كلمة «مرحبا».', '👋', 'مرحبا', ['مَرْحَبًا', 'مرحباً'])
    ],
    'bi-colors-shapes': () => [
      pick('What is «أحمر» in English?', '🔴', 'Red', ['Blue', 'Green', 'Yellow']),
      pick('ما لون العشب؟', '🌿', 'أَخْضَرُ', ['أَزْرَقُ', 'أَحْمَرُ', 'أَصْفَرُ']),
      pick('Choose the color of the sky.', '☁️', 'Blue', ['Red', 'Black', 'Brown']),
      pick('What is the opposite of black?', '⬛ ↔ ⬜', 'White', ['Green', 'Orange', 'Pink']),
      pick('Choose the color: Blue.', 'Blue', 'أَزْرَقُ', ['أَخْضَرُ', 'أَصْفَرُ', 'بُرْتُقَالِيٌّ']),
      write('اكتب كلمة Red.', '🔴', 'red', ['Red'])
    ],
    'en-print': () => [
      pick('Which letter comes after A?', 'A → ?', 'B', ['C', 'D', 'Z']),
      pick('Choose the first letter in Apple.', '🍎', 'A', ['P', 'E', 'L']),
      pick('Which letter comes after M?', 'M → ?', 'N', ['L', 'O', 'P']),
      pick('Choose the first letter for a cat.', '🐱', 'C', ['B', 'D', 'G']),
      write('Type the first letter of Dog.', '🐶', 'd', ['D']),
      write('Type the word: sun.', '☀️', 'sun', ['Sun'])
    ],
    'en-visual-1': () => [
      pick('Which one is a vowel?', 'A E I O U', 'A', ['B', 'C', 'T']),
      pick('Choose the word that begins with S.', 'S', ['Sun', 'Moon', 'Apple']),
      pick('What sound starts «ship»?', 'ship', 'sh', ['ch', 'th', 'ck']),
      pick('Choose the short-a word.', 'short a', 'Cat', ['Moon', 'Tree', 'Bike']),
      pick('Which word begins with /b/?', '/b/', 'Ball', ['Fish', 'Sun', 'Tree']),
      write('Type the first letter of umbrella.', '☂️', 'u', ['U'])
    ],
    'en-visual-2': () => [
      pick('Choose the correct sentence.', 'I / She / They', 'She is a girl.', ['She are a girl.', 'She am a girl.', 'She be a girl.']),
      pick('What do we use to write?', '✍️', 'Pencil', ['Chair', 'Milk', 'Fish']),
      pick('Choose a word for a job.', '👩‍🏫', 'Teacher', ['Apple', 'Blue', 'Run']),
      pick('Complete: I ___ happy.', 'I ___ happy.', 'am', ['is', 'are', 'be']),
      pick('Complete: They ___ friends.', 'They ___ friends.', 'are', ['am', 'is', 'be']),
      write('Type the word: book.', '📖', 'book', ['Book'])
    ],
    'en-visual-3': () => [
      pick('Choose the present simple sentence.', 'every day', 'I play football every day.', ['I played yesterday.', 'I will play tomorrow.', 'I playing now.']),
      pick('Complete: He ___ to school every day.', 'He ___ to school', 'goes', ['go', 'going', 'gone']),
      pick('Choose the pronoun for a girl.', '👧', 'She', ['He', 'It', 'They']),
      pick('Which is a plural noun?', 'one or many?', 'Children', ['Child', 'Mouse', 'Foot']),
      pick('Choose an opposite of hot.', 'hot ↔ ?', 'cold', ['fast', 'big', 'new']),
      write('Type the missing word: I ___ a student.', 'I ___ a student', 'am')
    ],
    'en-visual-4': () => [
      pick('Choose the past of go.', 'go → yesterday', 'went', ['goed', 'goes', 'going']),
      pick('Complete: I ___ study tomorrow.', 'tomorrow', 'will', ['am', 'was', 'did']),
      pick('What does «passport» help you do?', '🛂', 'Travel', ['Cook', 'Sleep', 'Draw']),
      pick('Choose a useful restaurant sentence.', '🍽️', 'The bill, please.', ['I am a pencil.', 'It is blue.', 'She has a cat.']),
      pick('Choose a verb.', 'action word', 'Improve', ['Justice', 'Safety', 'Peace']),
      write('Type the opposite of old.', 'old ↔ ?', 'new')
    ]
  };

  let state = null;
  const normalized = s => String(s || '').trim().toLowerCase().replace(/[ًٌٍَُِّْـ]/g, '').replace(/[أإآ]/g, 'ا');
  const questionsFor = (moduleId, resourceId) => {
    const base = (banks[moduleId] || banks['en-visual-1'])();
    const shift = (M().find(m => m.id === moduleId)?.resources.findIndex(r => r.id === resourceId) || 0) % base.length;
    return Array.from({ length: 5 }, (_, i) => base[(shift + i) % base.length]);
  };

  function mountPracticeButtons() {
    app.querySelectorAll('.course-resource').forEach(row => {
      if (row.nextElementSibling?.classList.contains('course-practice-launch')) return;
      const parts = (row.getAttribute('onclick') || '').match(/courseViewer\('([^']+)'\,'([^']+)'\,'([^']+)'\)/);
      if (!parts) return;
      const button = document.createElement('button');
      button.className = 'course-practice-launch';
      button.textContent = '✍️ حل التدريب التفاعلي';
      button.onclick = e => { e.stopPropagation(); coursePractice(parts[1], parts[2], parts[3]); };
      row.insertAdjacentElement('afterend', button);
    });
  }

  function coursePractice(moduleId, resourceId, filter = 'all') {
    const m = getM(moduleId), r = getR(m, resourceId);
    if (!m || !r) return;
    window.V = 'course-practice';
    window.CS = (filter === 'en' || m.lang === 'en') ? 'en' : (filter === 'ar' || m.lang === 'ar') ? 'ar' : 'les';
    state = { moduleId, resourceId, filter, questions: questionsFor(moduleId, resourceId), index: 0, score: 0, locked: false };
    drawPractice();
  }

  function drawPractice() {
    const q = state.questions[state.index], m = getM(state.moduleId), r = getR(m, state.resourceId), number = state.index + 1;
    const body = q.type === 'write'
      ? '<div class="practice-write"><input id="practice-input" autocomplete="off" autocapitalize="off" placeholder="اكتب الإجابة هنا" onkeydown="if(event.key===\'Enter\')courseAnswerText()"><button onclick="courseAnswerText()">تحقق من الإجابة</button></div>'
      : `<div class="practice-options">${choose(q.choices).map(x => `<button data-answer="${esc(x)}" onclick="courseAnswerPick(this)">${esc(x)}</button>`).join('')}</div>`;
    const backAction = (state.filter === 'ar' || state.filter === 'en') ? `sec('${state.filter}')` : `courseModule('${state.moduleId}','${state.filter}')`;
    h(`<section class="sec course"><button class="link" onclick="${backAction}">← العودة إلى الدروس</button>
      <div class="practice-head"><h2>✍️ حل التدريب</h2><p>${esc(m.title)} · ${esc(r.title)}</p></div>
      <p class="practice-count">السؤال ${number} من ${state.questions.length} · الدرجة ${state.score}</p>
      <div class="course-progress"><i style="width:${Math.round((state.index / state.questions.length) * 100)}%"></i></div>
      <div class="practice-prompt"><div class="cue" dir="auto">${esc(q.cue || '✏️')}</div><h3 dir="auto">${esc(q.prompt)}</h3></div>
      ${body}<p id="practice-feedback" class="practice-feedback"></p></section>`);
  }

  function afterAnswer(ok) {
    if (state.locked) return;
    state.locked = true;
    try { window.HurufiSound && HurufiSound.play(ok ? 'correct' : 'wrong'); } catch (_) {}
    const q = state.questions[state.index], f = document.getElementById('practice-feedback');
    f.textContent = ok ? 'أحسنت! إجابة صحيحة 🌟' : `الإجابة الصحيحة: ${q.answer}`;
    f.className = `practice-feedback ${ok ? 'good' : 'bad'}`;
    if (ok) state.score++;
    setTimeout(() => { state.index++; state.locked = false; state.index < state.questions.length ? drawPractice() : finishPractice(); }, ok ? 700 : 1200);
  }

  function courseAnswerPick(button) {
    if (state.locked) return;
    const q = state.questions[state.index], ok = normalized(button.dataset.answer) === normalized(q.answer);
    document.querySelectorAll('.practice-options button').forEach(b => {
      b.disabled = true;
      if (normalized(b.dataset.answer) === normalized(q.answer)) b.classList.add('good');
    });
    if (!ok) button.classList.add('bad');
    afterAnswer(ok);
  }

  function courseAnswerText() {
    if (state.locked) return;
    const q = state.questions[state.index], input = document.getElementById('practice-input');
    if (!input) return;
    if (!input.value.trim()) { input.focus(); return; }
    const g = window.Grade ? Grade.text(input.value, q.answers) : { ok: q.answers.map(normalized).includes(normalized(input.value)), exact: true };
    input.disabled = true;
    afterAnswer(g.ok);
    const f = document.getElementById('practice-feedback');
    if (f) {
      if (g.ok && !g.exact) f.textContent = `أحسنت! إجابتك صحيحة 🌟 والكتابة الدقيقة: «${q.answer}»`;
      else if (!g.ok) f.textContent = `${g.close ? 'قريب جدًا! ' : ''}${g.tip ? g.tip + ' — ' : ''}الإجابة الصحيحة: ${q.answer} 💪`;
    }
  }

  function finishPractice() {
    const m = getM(state.moduleId), r = getR(m, state.resourceId), key = `${state.moduleId}:${state.resourceId}`, pass = state.score >= 4;
    try { window.HurufiSound && HurufiSound.play(pass ? 'finish' : 'wrong'); } catch (_) {}
    if (window.P) {
      P.coursePractice = P.coursePractice || {};
      const old = P.coursePractice[key] || {};
      P.coursePractice[key] = { best: Math.max(old.best || 0, state.score), attempts: (old.attempts || 0) + 1 };
      if (pass) { P.courseDone = P.courseDone || {}; P.courseDone[key] = true; }
      save();
    }
    const backAction = (state.filter === 'ar' || state.filter === 'en') ? `sec('${state.filter}')` : `courseModule('${state.moduleId}','${state.filter}')`;
    const backLabel = state.filter === 'ar' ? 'العودة إلى أكاديمية العربية' : state.filter === 'en' ? 'العودة إلى أكاديمية الإنجليزية' : 'العودة إلى الدروس';
    h(`<section class="sec course"><div class="practice-finish"><div>🎉</div><h2>${pass ? 'أتقنت التدريب!' : 'تدريب جيد، جرّب مرة أخرى'}</h2>
      <div class="practice-score">${state.score}/${state.questions.length}</div>
      <p>${pass ? 'تم تسجيل المادة كمُنجزة في الأكاديمية.' : 'تحتاج ٤ إجابات صحيحة لتسجيل الإنجاز.'}</p>
      <button class="big" onclick="coursePractice('${state.moduleId}','${state.resourceId}','${state.filter}')">${pass ? 'أعد التدريب' : 'حاول مرة أخرى'}</button>
      <button class="alt" onclick="${backAction}">${backLabel}</button></div></section>`);
  }

  const oldModule = window.courseModule;
  if (typeof oldModule === 'function') {
    window.courseModule = function (...args) { oldModule(...args); mountPracticeButtons(); };
  }
  window.coursePractice = coursePractice;
  window.CoursePracticeNow = () => state && state.questions ? state.questions[state.index] : null;
  window.courseAnswerPick = courseAnswerPick;
  window.courseAnswerText = courseAnswerText;
  window.Router && Router.wrapAll();
})();
