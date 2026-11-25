/* /src/tutor/boomi-ui.js — واجهة المعلم الذكي «بومي» المرتبطة مباشرة بـ Google Gemini API */
(() => {
  'use strict';
  let ch = [];
  let chOwner = null;
  let busy = 0;
  let vvCleanup = null;

  const strip = s => String(s || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 300);
  const AI_MAX = 60;
  const aiUse = () => { P.ai = P.ai && P.ai.d === day() ? P.ai : { d: day(), n: 0 }; return P.ai; };
  const aiLeft = () => AI_MAX - aiUse().n;
  const LIM_MSG = 'وصلنا إلى الحدّ اليومي للمحادثة مع بومي 🦉 يمكنك المتابعة في الدروس والاختبارات، ونكمل المحادثة غدًا!';

  function profile() {
    const E = Object.entries(P.sk || {});
    const weak = E.filter(([, s]) => s.m > 0 || (s.n >= 2 && (s.e || 0) / s.n >= 0.4))
      .sort((a, b) => (b[1].m || 0) - (a[1].m || 0)).slice(0, 6).map(x => x[0].replace(/^ai:/, ''));
    const strong = E.filter(([, s]) => s.n >= 3 && (s.e || 0) / s.n < 0.2).slice(0, 6).map(x => x[0]);
    const letters = Object.entries(P.wl || {}).sort((a, b) => b[1] - a[1]).slice(0, 4).map(x => x[0]);
    const recentMistakes = Object.values(P.mistakes || {}).filter(x => x && (x.n || 0) > (x.fixed || 0))
      .sort((a, b) => (b.at || 0) - (a.at || 0)).slice(0, 5).map(x => x.k);
    let notes = [];
    try {
      const s = MindMemory.summary();
      notes = s.errs.map(e => e.label);
      if (s.recentAcc != null) notes.push('دقة آخر الإجابات ' + s.recentAcc + '٪');
    } catch (_) {}
    let en = null;
    try { en = window.EnCoach ? EnCoach.profile() : null; } catch (_) {}
    return {
      stage: P.stage || 0,
      lang: P.lang || 'both',
      gender: P.gender === 'female' ? 'female' : 'male',
      done: Object.keys(P.done || {}).length,
      weak,
      strong,
      letters,
      mistakes: recentMistakes,
      notes,
      en
    };
  }

  const AGAIN = /لم\s*أفهم|ما\s*فهمت|مو\s*فاهم|مش\s*فاهم|لا\s*أفهم|وضّ?ح|اشرح.*(مرة|مره|ثاني|اخر|أخر)|بطريقة\s*(أخرى|اخرى|ثانية)/;

  const PAGES = {
    bankLesson: 'تدريب في الأكاديمية',
    bankReview: 'مراجعة الأخطاء', bankPractice: 'تدريب لمستوى الطالب',
    home: 'الصفحة الرئيسية', sec: 'الأكاديمية والدروس', lesson: 'درس', quiz: 'اختبار',
    review: 'مراجعة', daily: 'تحدي اليوم',
    courseLibrary: 'الكتب والدروس النصية', courseModule: 'وحدة تعليمية', courseViewer: 'صفحة درس', coursePractice: 'تدريب الدرس',
    stories: 'عالم القصص', story: 'قصة', talk: 'محادثة إنجليزية',
    listenTest: 'اختبار استماع', readTest: 'اختبار قراءة',
    games2d: 'عالم الألعاب', g2levels: 'مراحل لعبة', g2play: 'لعبة',
    puzzles: 'جزيرة الألغاز', riddles: 'ألغاز', logic: 'تفكير منطقي',
    dictation: 'إملاء', dictationAdv: 'إملاء متقدم', syllables: 'المقاطع', enTeach: 'معلّم الإنجليزية',
    arTeach: 'معلّم العربية', examHub: 'الاختبارات المتدرجة',
    parentPanel: 'لوحة ولي الأمر', speak: 'تدريب النطق', act: 'الأنشطة'
  };

  const clean = s => String(s || '').replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D\u20E3]/gu, '').replace(/\s+/g, ' ').trim();
  const SUBJ = { ar: 'اللغة العربية', en: 'اللغة الإنجليزية' };
  const HINT = /تلميح|ساعدني|hint|لا اعرف|لا أعرف|صعب/i;
  const hints = {};

  function pageCtx(lite) {
    let fn = '', args = [];
    try {
      const e = window.Router && Router.entry();
      if (e) { fn = e.fn; args = e.args || []; }
    } catch (_) {}
    if (window.V === 'game') fn = 'g2play';
    const page = PAGES[fn] || (window.V === 'quiz' ? 'اختبار' : window.V === 'lesson' ? 'درس' : 'نشاط تعليمي');
    const A = document.getElementById('app'), q = s => A && A.querySelector(s), qa = s => A ? [...A.querySelectorAll(s)] : [];
    const head = clean((q('h2') || q('h1'))?.textContent).slice(0, 80), I = { page };
    let topic = head;
    const vis = el => el && el.offsetParent !== null;
    const nd = x => clean(x).replace(/[\u064B-\u0652\u0670]/g, '');

    try {
      const st = S[+P.stage || 0];
      if (st) I.stage = `${(+P.stage || 0) + 1} من ${S.length}: ${st.n} (${st.a} سنوات)`;
    } catch (_) {}

    try {
      if (/^course/.test(fn) && window.COURSE_MODULES) {
        const m = COURSE_MODULES.find(x => x.id === args[0]);
        if (m) {
          I.subject = SUBJ[m.lang] || 'مواد مشتركة';
          I.course = m.title + (m.level != null ? ' — المستوى ' + m.level : '');
          const r = (m.resources || []).find(x => x.id === args[1]);
          if (r) I.lesson = r.title;
        }
      } else if (fn === 'g2play' && cur && cur.game) {
        const g = (window.G2GAMES || []).find(x => x.id === cur.game.id) || cur.game;
        I.subject = SUBJ[g.cat] || 'ألعاب تعليمية';
        I.lesson = 'لعبة: ' + (g.name || '');
      } else if (cur && cur.n && ((window.V === 'quiz' && qs && qs[qi]) || ((window.V === 'lesson' || /^(lesson|review|daily)$/.test(fn)) && nd(head).includes(nd(cur.n))))) {
        I.subject = SUBJ[cur.l] || (cur.i && cur.i[0] && /[a-z]/i.test(cur.i[0][0]) ? SUBJ.en : SUBJ.ar);
        I.lesson = cur.n;
        topic = cur.n;
        if (cur.i && !/^(pl|rv|ex_)/.test(cur.id)) {
          I.words = cur.i.slice(0, 8).map(x => {
            const m = clean(x[1]);
            return m && m !== x[0] ? x[0] + ' (' + m + ')' : x[0];
          }).join('، ');
        }
      }
    } catch (_) {}

    if (fn === 'home' || window.V === 'home') topic = '';
    if (!I.lesson && head && !(fn === 'home' || window.V === 'home')) I.lesson = head;

    const Q = q('.q') || q('.ct-quiz b') || q('.practice-prompt,.practice-q') || null;
    if (window.V === 'quiz' && qs && qs[qi]) {
      I.question = strip(qs[qi].show) + (qs[qi].sp ? ' — يُسمع: ' + (Array.isArray(qs[qi].sp) ? qs[qi].sp[0] : qs[qi].sp) : '');
    } else if (vis(Q)) {
      I.question = clean(Q.innerText || Q.textContent).slice(0, 200);
    }

    const ins = qa('p.mut,.ac-tip,.practice-head p').filter(vis).map(x => clean(x.innerText)).filter(x => x && !/^سؤال \S+ من/.test(x));
    if (ins.length) I.instructions = ins.slice(0, 2).join(' / ').slice(0, 160);

    let opts = qa('.opt').filter(vis).map(b => ({ t: clean(b.innerText || b.textContent), ok: b.dataset.ok === '1', no: b.classList.contains('no'), dis: b.disabled }));
    if (!opts.length) {
      const pq = window.CoursePracticeNow && CoursePracticeNow();
      opts = qa('.practice-options button').filter(vis).map(b => ({ t: clean(b.innerText), ok: !!pq && clean(b.dataset.answer) === clean(pq.answer), no: b.classList.contains('bad') || b.classList.contains('no'), dis: b.disabled }));
    }
    if (!opts.length) {
      const cq = qa('.ct-quiz').filter(vis)[0];
      if (cq) {
        I.question = I.question || clean(cq.querySelector('b')?.innerText);
        opts = [...cq.querySelectorAll('.ct-opts button')].map(b => ({ t: clean(b.innerText), ok: +b.dataset.k === +cq.dataset.a, no: b.classList.contains('no'), dis: b.disabled || !!cq.dataset.done }));
      }
    }
    opts = opts.filter(o => o.t).slice(0, 6);
    if (opts.length) {
      I.choices = opts.map(o => o.t);
      const answered = opts.some(o => o.dis || o.no);
      const wrong = opts.find(o => o.no);
      I.answered = answered;
      if (wrong) I.studentAnswer = wrong.t + ' (خطأ)';
      else if (answered) I.studentAnswer = 'أجاب إجابة صحيحة';
      const c = opts.find(o => o.ok);
      if (c) I._correct = c.t;
    }

    const pr = qa('p.mut,.practice-count').map(x => clean(x.innerText)).find(x => /^(السؤال|سؤال) \S+ من \S+/.test(x));
    if (pr) I.progress = pr + (window.V === 'quiz' && typeof sc === 'number' ? ' · صحيح حتى الآن: ' + sc : '');

    const el = q('.ct-paper') || q('.story,.st-text,.story-text');
    if (vis(el)) I.text = clean(el.innerText || el.textContent).slice(0, 320);

    try {
      const b = window.BumiContext && BumiContext();
      if (b && b[0] && !/^(g2hub|g2lv)$/.test(b[1])) {
        const t = clean(b[0]).slice(0, 160);
        if (!I.instructions || !t.includes(I.instructions.slice(0, 20))) I.instructions = (I.instructions ? I.instructions + ' / ' : '') + t;
      }
    } catch (_) {}

    try {
      const bq = window.BankNow && BankNow();
      if (bq) { Object.assign(I, bq); topic = bq.lesson; }
    } catch (_) {}

    const qk = I.question || I.lesson || page;
    const L = [
      ['الصفحة', page], ['المادة', I.subject], ['الكورس', I.course], ['مرحلة الطالب', I.stage],
      ['الدرس/الوحدة', I.lesson], ['كلمات الدرس', I.words], ['السؤال الحالي', I.question],
      ['التعليمات', I.instructions],
      ['الاختيارات', I.choices && I.choices.map((x, k) => 'أبجد'[k] ? ('أبجده'[k] + ') ' + x) : x).join('، ')],
      ['إجابة الطالب', I.studentAnswer || (I.choices ? 'لم يُجب بعد' : '')],
      ['تقدم الطالب', I.progress], ['نص الصفحة', I.text],
      ['ملف الطالب عند بومي', lite ? '' : (window.Mind && Mind.brief())]
    ];
    const ctx = lite ? '' : L.filter(x => x[1]).map(x => x[0] + ': ' + x[1]).join(' | ').slice(0, 1400);
    return { fn, page, topic: String(topic || '').slice(0, 60), ctx, qk, info: I };
  }

  window.BomiCtx = () => pageCtx(true);

  function suggestionsFor(pc) {
    const c = [];
    if (pc.fn === 'quiz' || window.V === 'quiz') c.push('أعطني تلميحًا لهذا السؤال', 'اشرح لي هذا السؤال');
    else if (/^bank(Lesson|Review|Practice)$/.test(pc.fn)) c.push('اشرح القاعدة بمثال جديد', 'أعطني تلميحًا');
    else if (/^(lesson|review|daily|courseViewer|coursePractice|enTeach|arTeach)$/.test(pc.fn)) c.push('اشرح هذا الدرس ببساطة', 'أعطني مثالًا إضافيًا');
    else if (/^(story|talk|listenTest|readTest)$/.test(pc.fn)) c.push('اشرح فكرة هذه القصة');
    const topics = window.localAI && localAI.topics ? localAI.topics() : [];
    return [...new Set(c.concat(topics))].slice(0, 6);
  }

  function scrollEnd() {
    const l = document.getElementById('bl');
    if (l) l.scrollTop = l.scrollHeight;
  }

  function bindViewport(d) {
    if (vvCleanup) { vvCleanup(); vvCleanup = null; }
    const vv = window.visualViewport;
    const sync = () => {
      const bm = document.getElementById('bm');
      if (!bm) return;
      if (vv && window.innerWidth <= 760) {
        bm.style.height = Math.max(260, Math.round(vv.height)) + 'px';
        bm.style.top = Math.round(vv.offsetTop) + 'px';
      } else {
        bm.style.height = '';
        bm.style.top = '';
      }
      requestAnimationFrame(scrollEnd);
    };
    sync();
    if (vv) {
      vv.addEventListener('resize', sync);
      vv.addEventListener('scroll', sync);
    }
    window.addEventListener('resize', sync);
    vvCleanup = () => {
      if (vv) {
        vv.removeEventListener('resize', sync);
        vv.removeEventListener('scroll', sync);
      }
      window.removeEventListener('resize', sync);
    };
  }

  function setBusy(v) {
    busy = v ? 1 : 0;
    const btn = document.getElementById('bsendBtn');
    const sug = document.getElementById('bsugBtn');
    if (btn) {
      btn.disabled = !!v;
      btn.textContent = v ? '…' : 'إرسال';
    }
    if (sug) sug.disabled = !!v;
  }

  window.btoggleSug = function (force) {
    const box = document.getElementById('bsug');
    const btn = document.getElementById('bsugBtn');
    if (!box) return;
    const open = typeof force === 'boolean' ? force : box.hidden;
    box.hidden = !open;
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
  };

  function bomi() {
    if (chOwner !== P) {
      ch = (P.chat || []).slice(-60);
      chOwner = P;
    }
    window.bmicStop && bmicStop(1);
    document.getElementById('bm')?.remove();
    const pc = pageCtx(), ctx = pc.ctx;
    const sugs = suggestionsFor(pc);
    const d = document.createElement('div');
    d.id = 'bm';
    d.className = 'bm';
    d.innerHTML = `<div class=bmh>
        <b>🦉 المعلم الذكي بومي</b>
        <small id=bnet class=bnet></small>
        <button type=button id=bsugBtn class=bsug-btn onclick="btoggleSug()" aria-expanded="false" aria-label="اقتراحات مواضيع" title="اقتراحات">💡</button>
        <button type=button id=bclrBtn class=bclr onclick="bclear(this)" aria-label="مسح الدردشة" title="مسح الدردشة">🗑️</button>
        <button type=button onclick="window.__closeBm()" aria-label="إغلاق">✕</button>
      </div>
      <div id=bsug class=bm-sug hidden>
        <div class=bm-sug-hd><b>💡 اقتراحات سريعة</b><button type=button onclick="btoggleSug(false)" aria-label="إغلاق الاقتراحات">✕</button></div>
        <div class=bm-sug-list>
          <button type=button class=bm-sug-ex onclick="btoggleSug(false);bex()">🎲 أنشئ لي تمرينًا تفاعليًا</button>
          ${sugs.map(x => `<button type=button onclick="btoggleSug(false);bsend(this.textContent)">${x}</button>`).join('')}
        </div>
      </div>
      <div id=bl class=bl></div>
      <p id=bst class="bmic-state" aria-live="polite"></p>
      <div class=bmi>
        <input id=bi dir=auto autocomplete=off placeholder="اكتب أي سؤال بالعربية أو الإنجليزية…" onkeydown="if(event.key==='Enter'){event.preventDefault();bsend()}">
        <button type=button id=bsendBtn onclick="bsend()">إرسال</button>
        ${P.mic && (window.SpeechRecognition || window.webkitSpeechRecognition) ? '<button type=button id=bmb onclick="bmic()" aria-label="تحدث">🎤</button>' : ''}
      </div>`;
    d.dataset.ctx = ctx;
    d.dataset.topic = pc.topic;
    d.dataset.page = pc.page;
    document.body.appendChild(d);
    bindViewport(d);
    netBadge();

    const inp = document.getElementById('bi');
    if (inp) {
      inp.addEventListener('focus', () => setTimeout(scrollEnd, 180));
    }

    if (!ch.length) {
      const helloName = (window.studentCall && studentCall().replace(/^يَا /, '')) || (P.name || 'بَطَل');
      bpush('a', shape(`مَرْحَبًا يَا ${helloName}! 🦉 أَنَا بُومِي، اسْأَلْنِي أَيَّ سُؤَالٍ فِي الْعَرَبِيَّةِ أَوِ الْإِنْجِلِيزِيَّةِ وَسَأَشْرَحُ لَكَ خُطْوَةً بِخُطْوَةٍ!`));
      acts(pc);
    } else {
      ch.forEach(m => bpush(m.role === 'user' ? 'u' : 'a', shapeSmart(m.content)));
      if (pc.topic && pc.fn !== 'home') {
        bpush('a', shape(`نَحْنُ الْآنَ فِي ${pc.page}: «${pc.topic}». اسْأَلْنِي أَيَّ شَيْءٍ عَنْهُ 🦉`));
      }
    }
    requestAnimationFrame(scrollEnd);
  }

  let clrTimer = 0;
  window.bclear = function (btn) {
    const b = btn || document.getElementById('bclrBtn');
    if (b && b.dataset.armed !== '1') {
      b.dataset.armed = '1';
      b.textContent = 'تأكيد؟';
      clearTimeout(clrTimer);
      clrTimer = setTimeout(() => {
        if (b) { delete b.dataset.armed; b.textContent = '🗑️'; }
      }, 3000);
      return;
    }
    if (b) { delete b.dataset.armed; b.textContent = '🗑️'; }
    clearTimeout(clrTimer);
    try { aiStream.c && aiStream.c.abort(); } catch (_) {}
    try { activeSpeech && activeSpeech.abort && activeSpeech.abort(); } catch (_) {}
    try { window.say && say.stop(); } catch (_) {}
    window.bmicStop && bmicStop(1);
    setBusy(0);
    ch = [];
    chOwner = P;
    if (window.P) { P.chat = []; save(); }
    const l = document.getElementById('bl');
    if (l) l.innerHTML = '';
    const pc = pageCtx();
    bpush('a', shape('تَمَّ مَسْحُ الدَّرْدَشَةِ 🧹 اسْأَلْنِي أَيَّ سُؤَالٍ جَدِيدٍ!'));
    acts(pc);
  };

  function acts(pc) {
    const l = document.getElementById('bl');
    if (!l) return;
    const box = document.createElement('div');
    box.className = 'bm-acts';
    const A = [
      ['📖', pc && pc.topic && pc.fn !== 'home' ? 'اشرح هذا الدرس ببساطة' : 'تصفّح دروس اللغتين', () => pc && pc.topic && pc.fn !== 'home' ? bsend('اشرح لي هذا الدرس ببساطة مع مثال') : (closeBm(), sec('les'))],
      ['🎲', 'أنشئ لي تمرينًا تفاعليًا', () => bex()],
      ['🏆', 'الاختبارات المتدرّجة', () => { closeBm(); window.examHub ? examHub() : sec('les'); }]
    ];
    A.forEach(([e, t, f]) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = `<span>${e}</span><b>${t}</b>`;
      b.onclick = f;
      box.appendChild(b);
    });
    l.appendChild(box);
  }

  let activeSpeech = null;
  function closeBm() {
    try {
      if (vvCleanup) { vvCleanup(); vvCleanup = null; }
      aiStream.c && aiStream.c.abort();
      activeSpeech && activeSpeech.abort && activeSpeech.abort();
      window.say && say.stop();
      window.bmicStop && bmicStop(1);
      setBusy(0);
      document.getElementById('bm')?.remove();
    } catch (_) {}
  }
  window.__closeBm = closeBm;

  function offer(list) {
    const l = document.getElementById('bl');
    if (!l || !list || !list.length) return;
    const box = document.createElement('div');
    box.className = 'chips bm-offer';
    list.slice(0, 4).forEach(o => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = o;
      b.dir = 'auto';
      b.onclick = () => {
        box.querySelectorAll('button').forEach(x => { x.disabled = true; });
        b.classList.add('ok');
        bsend(o);
      };
      box.appendChild(b);
    });
    l.appendChild(box);
    scrollEnd();
  }

  function attachBubbleAudio(e, text) {
    if (!e || !text || !window.say) return;
    let old = e.querySelector('.bb-say');
    if (old) old.remove();
    const clean = say.clean ? say.clean(text) : text;
    if (!clean) return;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bb-say';
    btn.setAttribute('aria-label', 'استمع للرد');
    btn.textContent = '🔊 استمع';
    btn.onclick = () => {
      const spLang = isMostlyEn(clean) ? 'en' : 'ar';
      say(clean, spLang);
    };
    e.appendChild(btn);
  }

  function bpush(w, t) {
    const l = document.getElementById('bl');
    if (!l) return null;
    const e = document.createElement('div');
    e.className = 'bb ' + w;
    e.dir = 'auto';
    if (w === 'a') {
      const span = document.createElement('span');
      span.className = 'bb-txt';
      span.textContent = t;
      e.appendChild(span);
      if (t && !/^\s*$/.test(t)) attachBubbleAudio(e, t);
    } else {
      e.textContent = t;
    }
    l.appendChild(e);
    scrollEnd();
    return e;
  }

  async function aiCall(body) {
    const c = new AbortController(), tm = setTimeout(() => c.abort(), 24000);
    try {
      const r = await fetch('/api/tutor', {
        method: 'POST',
        signal: c.signal,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: P.name, age: P.age, gender: P.gender, profile: profile(), ...body })
      });
      const data = await r.json().catch(() => ({}));
      if (r.status === 429) return { err: data.error || 'busy' };
      if (!r.ok) return { err: data.error || 'fail' };
      return data;
    } catch (e) {
      return { err: e && e.name === 'AbortError' ? 'timeout' : 'net' };
    } finally {
      clearTimeout(tm);
    }
  }

  const think = () => { window.MC && MC.mood('think', 15000); };
  const unthink = ok => { window.MC && MC.mood(ok ? 'happy' : 'oops', ok ? 900 : 1200); };
  const onl = () => navigator.onLine !== false;
  const shape = t => {
    const x = window.Tashkeel ? Tashkeel.apply(t) : t;
    return window.studentGenderText ? window.studentGenderText(x) : x;
  };
  const isMostlyEn = t => {
    const ar = (String(t || '').match(/[\u0600-\u06FF]/g) || []).length;
    const en = (String(t || '').match(/[A-Za-z]/g) || []).length;
    return en > ar * 1.5;
  };
  const cleanMd = t => String(t || '').replace(/\*\*([^*\n]+)\*\*/g, '$1').replace(/^#{1,4}\s+/gm, '');
  const shapeSmart = t => {
    const s = cleanMd(t);
    return isMostlyEn(s) ? s : shape(s);
  };

  function netBadge() {
    const e = document.getElementById('bnet');
    if (e) {
      e.textContent = onl() ? 'متصل' : 'بلا إنترنت';
      e.classList.toggle('off', !onl());
    }
  }
  addEventListener('online', netBadge);
  addEventListener('offline', netBadge);

  const keep = () => { if (window.P) { P.chat = ch.slice(-60); save(); } };

  async function aiStream(body, onText) {
    aiStream.c && aiStream.c.abort();
    const c = aiStream.c = new AbortController();
    let tm = setTimeout(() => c.abort(), 24000), all = '';
    try {
      const r = await fetch('/api/tutor-stream', {
        method: 'POST',
        signal: c.signal,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ name: P.name, age: P.age, gender: P.gender, profile: profile(), ...body })
      });
      if (!r.ok || !r.body) {
        const data = await r.json().catch(() => ({}));
        if (r.status === 429) return { err: data.error || 'busy' };
        return { err: data.error || 'nostream' };
      }
      const rd = r.body.getReader(), dc = new TextDecoder();
      for (;;) {
        const { done, value } = await rd.read();
        if (done) break;
        const x = dc.decode(value, { stream: true });
        if (x) {
          clearTimeout(tm);
          tm = setTimeout(() => c.abort(), 16000);
          all += x;
          onText(x, all);
        }
      }
      return all.trim() ? { reply: all.trim() } : { err: 'nostream' };
    } catch (e) {
      if (all.trim()) return { reply: all.trim() };
      return { err: e && e.name === 'AbortError' ? 'timeout' : 'nostream' };
    } finally {
      clearTimeout(tm);
    }
  }

  function errMessage(code) {
    switch (code) {
      case 'offline':
      case 'net':
        return '📴 انقطع الاتصال بالإنترنت. تأكّد من الشبكة ثم اضغط «إعادة المحاولة».';
      case 'busy':
      case 'rate':
      case 'quota':
        return '⏳ بومي مشغول قليلًا الآن أو انتهت الحصة المؤقتة للطلبات. انتظر لحظة ثم أعد المحاولة.';
      case 'timeout':
        return '⏱️ استغرق الرد وقتًا أطول من المعتاد. اضغط «إعادة المحاولة».';
      case 'not_configured':
      case 'auth':
        return '🔑 خدمة المعلم الذكي غير مفعّلة حاليًا بالمفتاح المطلوب. تحقّق من إعدادات الخادم.';
      default:
        return '⚠️ تعذّر الحصول على ردّ من بومي الآن. اضغط «إعادة المحاولة».';
    }
  }

  function showRetryError(w, msg, retryFn) {
    w.classList.remove('think');
    w.classList.add('bb-err');
    w.innerHTML = '';
    const p = document.createElement('span');
    p.textContent = msg;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'bm-retry';
    btn.textContent = '🔄 إعادة المحاولة';
    btn.onclick = () => { w.remove(); retryFn(); };
    w.appendChild(p);
    w.appendChild(btn);
    scrollEnd();
  }

  async function bsend(t, isRetry) {
    window.bmicStop && bmicStop(1);
    const i = document.getElementById('bi');
    const m = (typeof t === 'string' ? t : (i && i.value) || '').trim();
    if (!m || busy) return;
    if (i && !isRetry) i.value = '';

    document.querySelectorAll('#bl .bm-acts').forEach(el => el.remove());
    btoggleSug(false);

    if (!isRetry) bpush('u', m);

    const pc = pageCtx(), bmE = document.getElementById('bm');
    if (bmE) {
      bmE.dataset.ctx = pc.ctx;
      bmE.dataset.topic = pc.topic;
      bmE.dataset.page = pc.page;
    }

    if (!onl()) {
      const w = bpush('a', '');
      showRetryError(w, errMessage('offline'), () => bsend(m, true));
      netBadge();
      return;
    }

    if (aiLeft() <= 0) {
      bpush('a', LIM_MSG);
      return;
    }

    const wantHint = HINT.test(m);
    if (wantHint && !isRetry) hints[pc.qk] = (hints[pc.qk] || 0) + 1;
    const hintN = hints[pc.qk] || 0;
    const again = AGAIN.test(m);
    const ctx = pc.ctx;

    setBusy(1);
    aiUse().n++;
    save();
    think();

    const w = bpush('a', '');
    w.classList.add('think');
    w.innerHTML = '<span class=dots><i></i><i></i><i></i></span> بومي يُفَكِّرُ وَيَكْتُبُ…';
    scrollEnd();

    const body = {
      message: m,
      history: ch.slice(-14),
      again,
      context: ctx,
      page: pc.page,
      hint: wantHint ? hintN : 0,
      answered: !!pc.info.answered,
      correct: (pc.info.answered || hintN >= 2) && pc.info._correct || '',
      recall: window.Brain ? Brain.recent(8) : []
    };

    const autoSpeak = !(window.muted && muted()) && (!window.P || P.autoSpeak !== 0);
    const speechStream = autoSpeak && window.say && say.stream ? say.stream('ar') : null;
    activeSpeech = speechStream;
    let streamFeedLen = 0;

    try {
      let shown = false;
      let d = await aiStream(body, (_x, all) => {
        if (!shown) { shown = true; w.classList.remove('think'); w.innerHTML = '<span class=bb-txt></span>'; }
        const span = w.querySelector('.bb-txt') || w;
        span.textContent = all;
        if (speechStream) {
          const cleanProgress = cleanMd(all);
          const delta = cleanProgress.slice(streamFeedLen);
          if (delta) {
            streamFeedLen = cleanProgress.length;
            speechStream.push(delta);
          }
        }
        scrollEnd();
      });

      if ((d.err === 'nostream' || d.err === 'empty_reply') && !shown) {
        if (speechStream) speechStream.abort();
        d = await aiCall(body);
      }
      w.classList.remove('think');

      if (d.reply) {
        const tx = shapeSmart(d.reply);
        ch.push({ role: 'user', content: m }, { role: 'assistant', content: tx });
        ch = ch.slice(-60);
        keep();

        const BL = /^\s*[•▪◦\-–]\s+/, lines = tx.split('\n');
        const ops = lines.filter(x => BL.test(x)).map(x => x.replace(BL, '').trim()).filter(Boolean);
        const visibleText = ops.length ? lines.filter(x => !BL.test(x)).join('\n').trim() : tx;
        let span = w.querySelector('.bb-txt');
        if (!span) {
          w.innerHTML = '<span class=bb-txt></span>';
          span = w.querySelector('.bb-txt');
        }
        span.textContent = visibleText;
        attachBubbleAudio(w, visibleText);
        scrollEnd();
        if (ops.length) offer(ops);

        if (autoSpeak) {
          const speakLang = isMostlyEn(visibleText) ? 'en' : 'ar';
          if (shown && speechStream) {
            speechStream.end(visibleText);
          } else {
            say(visibleText, speakLang);
          }
        }
        if (window.Tashkeel && !isMostlyEn(d.reply)) Tashkeel.learn(d.reply);
        unthink(1);
      } else {
        if (speechStream) speechStream.abort();
        aiUse().n = Math.max(0, aiUse().n - 1);
        save();
        unthink(0);
        showRetryError(w, errMessage(d.err), () => bsend(m, true));
      }
    } catch (_) {
      if (speechStream) speechStream.abort();
      aiUse().n = Math.max(0, aiUse().n - 1);
      save();
      unthink(0);
      showRetryError(w, errMessage('net'), () => bsend(m, true));
    } finally {
      if (activeSpeech === speechStream) activeSpeech = null;
      setBusy(0);
      netBadge();
    }
  }

  async function bex() {
    if (busy) return;
    const i = document.getElementById('bi'), bm = document.getElementById('bm');
    const topic = (i && i.value.trim()) || bm?.dataset.topic || profile().weak[0] || '';
    if (i) i.value = '';
    document.querySelectorAll('#bl .bm-acts').forEach(el => el.remove());

    if (!onl()) {
      const w = bpush('a', '');
      showRetryError(w, errMessage('offline'), () => bex());
      return;
    }
    if (aiLeft() <= 0) {
      bpush('a', LIM_MSG);
      return;
    }

    setBusy(1);
    aiUse().n++;
    save();
    think();
    const w = bpush('a', '');
    w.classList.add('think');
    w.innerHTML = '<span class=dots><i></i><i></i><i></i></span> أُجَهِّزُ لَكَ تَمَارِينَ جَدِيدَةً…';
    scrollEnd();

    try {
      const d = await aiCall({ mode: 'exercise', topic: topic || bm?.dataset.ctx || '' });
      w.classList.remove('think');
      if (d.items && d.items.length) {
        unthink(1);
        const lab = (bm && bm.dataset.topic) || topic || '';
        w.textContent = 'هَيَّا نَتَدَرَّبُ' + (lab && lab.length < 40 ? ' عَلَى: ' + lab : '') + ' 💪';
        runEx(d.items, 0, 0, topic);
      } else {
        aiUse().n = Math.max(0, aiUse().n - 1);
        save();
        unthink(0);
        showRetryError(w, errMessage(d.err), () => bex());
      }
    } catch (_) {
      aiUse().n = Math.max(0, aiUse().n - 1);
      save();
      unthink(0);
      showRetryError(w, errMessage('net'), () => bex());
    } finally {
      setBusy(0);
      netBadge();
    }
  }

  function runEx(L, i, s, topic) {
    if (!document.getElementById('bl')) return;
    if (i >= L.length) {
      P.star = (P.star || 0) + s;
      save();
      const m = s === L.length
        ? 'مُمْتَازٌ! أَجَبْتَ عَنِ الْكُلِّ بِشَكْلٍ صَحِيحٍ 🌟'
        : s === 0
          ? 'لَا بَأْسَ! سَنَتَدَرَّبُ عَلَيْهَا مَعًا خُطْوَةً خُطْوَةً 💪'
          : `أَحْسَنْتَ! أَجَبْتَ صَحِيحًا عَنْ ${s} مِنْ ${L.length} 💪`;
      bpush('a', shapeSmart(m));
      window.MC && MC.mood(s >= 2 ? 'happy' : 'oops', 1800);
      if (!(window.muted && muted())) say(m.replace(/[🌟💪]/g, ''), 'ar', null, 'cheer');
      return;
    }

    const q = L[i];
    q.q = shapeSmart(q.q);
    q.o = q.o.map(shapeSmart);
    q.w = shapeSmart(q.w || '');
    bpush('a', `(${i + 1}/${L.length}) ${q.q}`);
    if (!(window.muted && muted()) && i === 0) say(q.q, isMostlyEn(q.q) ? 'en' : 'ar');

    const pics = q.o.every(o => !/[\p{L}\p{N}]/u.test(o));
    const box = document.createElement('div');
    box.className = pics ? 'chips bm-pics' : 'chips';
    q.o.forEach((o, j) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.textContent = o;
      b.dir = 'auto';
      b.onclick = () => {
        box.querySelectorAll('button').forEach(x => { x.disabled = true; });
        const ok = j === q.a;
        b.classList.add(ok ? 'ok' : 'no');
        const k = 'ai:' + String(topic || q.q).slice(0, 24);
        const sk = P.sk[k] = P.sk[k] || { n: 0, m: 0 };
        sk.n++;
        sk.t = Date.now();
        if (ok) sk.m = Math.max(0, sk.m - 1);
        else { sk.m++; sk.e = (sk.e || 0) + 1; }
        save();
        const m = ok ? pk(OKS.ar) : 'لَا بَأْسَ 🌱 ' + (q.w || '');
        bpush('a', shapeSmart(m));
        window.MC && MC.mood(ok ? 'happy' : 'oops', 1200);
        if (!(window.muted && muted())) say(m.replace(/[🌱]/g, ''), 'ar', null, ok ? 'happy' : 'soft');
        setTimeout(() => runEx(L, i + 1, s + ok, topic), ok ? 700 : 1250);
      };
      box.appendChild(b);
    });

    const l = document.getElementById('bl');
    l.appendChild(box);
    scrollEnd();
  }

  let BMIC = null;
  const bmicText = t => { const e = document.getElementById('bst'); if (e) e.textContent = t || ''; };
  window.bmicStop = function (quiet) {
    const s = BMIC;
    if (!s) return;
    BMIC = null;
    try { s.rec.stop(); } catch (_) {}
    const b = document.getElementById('bmb');
    if (b) { b.textContent = '🎤'; b.classList.remove('bmic-listen'); }
    bmicText('');
    window.MC && MC.mood('tilt', quiet ? 300 : 700);
  };

  window.bmic = function () {
    if (BMIC) return bmicStop();
    if (!P || !P.mic) return bpush('a', 'يحتاج تشغيل الميكروفون من لوحة ولي الأمر أولًا.');
    const R = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!R) return bpush('a', 'هذا المتصفح لا يدعم التحدث المباشر. جرّب Chrome أو Edge.');
    window.say && say.stop();
    const rec = new R(), lang = P.lang === 'en' ? 'en-US' : 'ar-OM';
    let final = '';
    BMIC = { rec };
    rec.lang = lang;
    rec.interimResults = true;
    rec.continuous = false;
    rec.maxAlternatives = 3;

    const b = document.getElementById('bmb');
    if (b) { b.textContent = '⏹'; b.classList.add('bmic-listen'); }
    bmicText('🎧 بومي يستمع… تكلّم الآن');
    window.MC && MC.mood('listen', 9000);

    rec.onresult = e => {
      const row = e.results[e.results.length - 1], heard = [...row].map(x => x.transcript).filter(Boolean);
      if (heard[0]) {
        final = heard[0];
        const i = document.getElementById('bi');
        if (i) i.value = final;
        bmicText('🗣️ ' + final);
      }
      if (row.isFinal) { bmicStop(1); bsend(final); }
    };
    rec.onerror = e => {
      const msg = (e.error === 'not-allowed' || e.error === 'service-not-allowed')
        ? 'لم يُسمح للمتصفح بالميكروفون. اسمح به ثم حاول مرة أخرى.'
        : e.error === 'no-speech' ? 'لم أسمع كلامًا، حاول مرة أخرى.' : 'تعذّر الاستماع الآن، حاول مرة أخرى.';
      bmicStop(1);
      bpush('a', msg);
    };
    rec.onend = () => {
      if (BMIC && BMIC.rec === rec) {
        BMIC = null;
        if (!final) bmicText('انتهى الاستماع. اضغط الميكروفون للمحاولة مرة أخرى.');
        const x = document.getElementById('bmb');
        if (x) { x.textContent = '🎤'; x.classList.remove('bmic-listen'); }
      }
    };
    try { rec.start(); } catch (_) { bmicStop(1); bpush('a', 'تعذّر تشغيل الميكروفون الآن.'); }
  };

  window.Lazy && Lazy.onLeave(() => window.bmicStop && bmicStop(1));

  const NOASK = /^(setup|who|g2play|speedGame)$/;
  const oh = window.h;
  if (typeof oh === 'function') {
    window.h = x => {
      oh(x);
      let fn = '';
      try { const e = window.Router && Router.entry(); fn = e ? e.fn : ''; } catch (_) {}
      if (window.P && window.V !== 'setup' && window.V !== 'who' && window.V !== 'game' && !NOASK.test(fn) && !app.querySelector('.ask')) {
        app.insertAdjacentHTML('beforeend', '<button class=ask onclick="bomi()">🦉 اسأل بومي</button>');
      }
    };
  }

  (() => {
    let locked = false, sy = 0;
    const B = document.body, H = document.documentElement;
    const lock = () => { if (locked) return; locked = true; sy = window.scrollY || H.scrollTop || 0; H.classList.add('bm-open'); B.style.top = (-sy) + 'px'; };
    const unlock = () => { if (!locked) return; locked = false; H.classList.remove('bm-open'); B.style.top = ''; window.scrollTo(0, sy); };
    new MutationObserver(() => { document.getElementById('bm') ? lock() : unlock(); }).observe(B, { childList: true });
    document.addEventListener('touchmove', e => {
      if (!locked) return;
      const bm = document.getElementById('bm');
      if (!bm || !bm.contains(e.target)) { e.preventDefault(); return; }
      let n = e.target;
      while (n && n !== bm) {
        const cs = getComputedStyle(n);
        if (/(auto|scroll)/.test(cs.overflowY + cs.overflowX) && (n.scrollHeight > n.clientHeight + 1 || n.scrollWidth > n.clientWidth + 1)) return;
        n = n.parentElement;
      }
      e.preventDefault();
    }, { passive: false });
  })();

  window.bomi = bomi;
  window.bsend = bsend;
  window.bex = bex;
})();
