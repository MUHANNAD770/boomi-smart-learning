/* src/academies/english/teacher-en.js — معلّم الإنجليزية التكيّفي للطالب العربي (٥ مستويات من الصفر حتى المحادثة):
   • يشرح بالعربية أولًا في المستويات المبكرة، ويُدخل الإنجليزية تدريجيًا حسب الأدلّة الحقيقية.
   • بدون روابط للرياضيات أو عالم المغامرات، ومع ضبط BumiAudio.epoch() و Lazy.onLeave. */
window.EnCoach = (() => {
  'use strict';

  const DAY = 864e5;
  const now = () => Date.now();
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[R(0, a.length - 1)];
  const sh = a => [...a].sort(() => Math.random() - 0.5);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const AR = /[\u0600-\u06FF]/, LAT = /^[A-Za-z][A-Za-z' .,!?-]*$/, PIC = /\p{Extended_Pictographic}/u;
  const key = w => String(w || '').toLowerCase().replace(/[.!?,]/g, '').replace(/\s+/g, ' ').trim();
  const GT = t => (window.studentGenderText ? studentGenderText(t) : t);
  const UNITS = () => (typeof S !== 'undefined' ? S : []);
  const GU = () => (typeof G !== 'undefined' ? G : null);

  /* 1) القاموس المعنوي */
  const BASE = {
    apple: 'تُفَّاحَة', ball: 'كُرَة', cat: 'قِطَّة', dog: 'كَلْب', egg: 'بَيْضَة', fish: 'سَمَكَة', goat: 'مَاعِز', hat: 'قُبَّعَة', ice: 'ثَلْج', juice: 'عَصِير',
    kite: 'طَائِرَةٌ وَرَقِيَّة', lion: 'أَسَد', moon: 'قَمَر', nest: 'عُشّ', orange: 'بُرْتُقَالَة', pen: 'قَلَم', queen: 'مَلِكَة', rabbit: 'أَرْنَب', sun: 'شَمْس',
    tree: 'شَجَرَة', umbrella: 'مِظَلَّة', van: 'شَاحِنَةٌ صَغِيرَة', water: 'مَاء', box: 'صُنْدُوق', yoyo: 'يُويُو', zebra: 'حِمَارٌ وَحْشِيّ',
    red: 'أَحْمَر', blue: 'أَزْرَق', green: 'أَخْضَر', yellow: 'أَصْفَر', black: 'أَسْوَد', white: 'أَبْيَض', pink: 'وَرْدِيّ', purple: 'بَنَفْسَجِيّ', brown: 'بُنِّيّ',
    one: 'وَاحِد', two: 'اثْنَان', three: 'ثَلَاثَة', four: 'أَرْبَعَة', five: 'خَمْسَة', six: 'سِتَّة', seven: 'سَبْعَة', eight: 'ثَمَانِيَة', nine: 'تِسْعَة', ten: 'عَشَرَة',
    square: 'مُرَبَّع', circle: 'دَائِرَة', triangle: 'مُثَلَّث', star: 'نَجْمَة', heart: 'قَلْب',
    bed: 'سَرِير', bus: 'حَافِلَة', cup: 'كُوب', car: 'سَيَّارَة', book: 'كِتَاب', house: 'بَيْت', home: 'بَيْت', door: 'بَاب', chair: 'كُرْسِيّ', table: 'طَاوِلَة', bag: 'حَقِيبَة',
    milk: 'حَلِيب', bread: 'خُبْز', banana: 'مَوْزَة', grapes: 'عِنَب', cake: 'كَعْكَة', rice: 'أَرُزّ',
    mother: 'أُمّ', father: 'أَب', mom: 'أُمّ', dad: 'أَب', brother: 'أَخ', sister: 'أُخْت', baby: 'طِفْلٌ رَضِيع', boy: 'وَلَد', girl: 'بِنْت', friend: 'صَدِيق', teacher: 'مُعَلِّم',
    happy: 'سَعِيد', sad: 'حَزِين', fast: 'سَرِيع', slow: 'بَطِيء', huge: 'ضَخْم', big: 'كَبِير', small: 'صَغِير', hot: 'حَارّ', cold: 'بَارِد', tall: 'طَوِيل', short: 'قَصِير',
    bird: 'طَائِر', cow: 'بَقَرَة', horse: 'حِصَان', duck: 'بَطَّة', elephant: 'فِيل', monkey: 'قِرْد', bear: 'دُبّ', frog: 'ضِفْدَع', owl: 'بُومَة',
    hand: 'يَد', eye: 'عَيْن', nose: 'أَنْف', mouth: 'فَم', ear: 'أُذُن', head: 'رَأْس',
    school: 'مَدْرَسَة', library: 'مَكْتَبَة', journey: 'رِحْلَة', courage: 'شَجَاعَة', knowledge: 'مَعْرِفَة', believe: 'يُصَدِّق',
    yes: 'نَعَم', no: 'لَا', hello: 'مَرْحَبًا', goodbye: 'مَعَ السَّلَامَة', please: 'مِنْ فَضْلِك', 'thank you': 'شُكْرًا لَك', 'good morning': 'صَبَاحُ الْخَيْر', 'good night': 'تُصْبِحُ عَلَى خَيْر',
    'great job': 'عَمَلٌ رَائِع', excellent: 'مُمْتَاز', 'well done': 'أَحْسَنْت', perfect: 'مُمْتَاز', awesome: 'رَائِع', 'you got it': 'أَصَبْت', 'you did it': 'نَجَحْت',
    fantastic: 'مُذْهِل', super: 'رَائِع', brilliant: 'عَبْقَرِيّ', 'nice work': 'عَمَلٌ جَمِيل', 'what is this': 'مَا هَذَا؟', listen: 'اسْتَمِعْ', 'say it': 'قُلْهَا',
    'try again': 'حَاوِلْ مَرَّةً أُخْرَى', 'three in a row': 'ثَلَاثُ إِجَابَاتٍ صَحِيحَةٍ مُتَتَالِيَة', 'you are on fire': 'أَنْتَ رَائِعٌ جِدًّا', 'amazing streak': 'سِلْسِلَةٌ رَائِعَة'
  };
  const PHRASE = new Set(['great job', 'excellent', 'well done', 'perfect', 'awesome', 'you got it', 'you did it', 'fantastic', 'super', 'brilliant', 'nice work', 'what is this', 'listen', 'say it', 'try again', 'three in a row', 'you are on fire', 'amazing streak']);
  const ADJ = new Set(['red', 'blue', 'green', 'yellow', 'black', 'white', 'pink', 'purple', 'brown', 'happy', 'sad', 'fast', 'slow', 'huge', 'big', 'small', 'hot', 'cold', 'tall', 'short']);
  const NUM = new Set(['one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten']);
  let DICT = null, EMO = null;

  function dict() {
    if (DICT) return DICT;
    DICT = Object.assign({}, BASE);
    EMO = {};
    try {
      const units = [];
      UNITS().forEach(s => s.u.forEach(u => units.push(u)));
      if (GU()) Object.values(GU()).forEach(u => units.push(u));
      const arByEmo = {};
      for (const u of units) for (const it of u.i) if (it[2] === 'ar' && PIC.test(it[1])) arByEmo[it[1]] = arByEmo[it[1]] || it[0];
      for (const u of units) {
        for (const it of u.i) {
          if (it[2] !== 'en') continue;
          const k = key(it[0]);
          if (!k) continue;
          if (PIC.test(it[1])) EMO[k] = EMO[k] || it[1];
          if (AR.test(it[1]) && !DICT[k]) DICT[k] = it[1];
          else if (arByEmo[it[1]] && !DICT[k] && k.split(' ').length <= 2) DICT[k] = arByEmo[it[1]];
        }
      }
    } catch {}
    return DICT;
  }
  const meaning = w => dict()[key(w)] || '';
  const emoji = w => { dict(); return EMO[key(w)] || ''; };

  /* 2) نطق الكلمة الإنجليزية بحروف عربية */
  const ROUGH = { a: 'ا', b: 'ب', c: 'ك', d: 'د', e: 'ي', f: 'ف', g: 'غ', h: 'هـ', i: 'ي', j: 'ج', k: 'ك', l: 'ل', m: 'م', n: 'ن', o: 'و', p: 'ب', q: 'ك', r: 'ر', s: 'س', t: 'ت', u: 'ا', v: 'ڤ', w: 'و', x: 'كس', y: 'ي', z: 'ز' };
  const rough = w => String(w).toLowerCase().replace(/sh/g, 'ش').replace(/ch/g, 'تش').replace(/th/g, 'ث').replace(/ee|ea/g, 'ي').replace(/oo/g, 'و').replace(/[a-z]/g, c => ROUGH[c] || '').replace(/(.)\1+/g, '$1');
  function pronAr(w) {
    const k = key(w);
    if (window.EN_PRON && EN_PRON[k]) return Promise.resolve(EN_PRON[k]);
    const parts = k.split(' ');
    if (window.EN_PRON && parts.length > 1 && parts.every(x => EN_PRON[x])) return Promise.resolve(parts.map(x => EN_PRON[x]).join(' '));
    return Promise.resolve(rough(w));
  }

  /* 3) بيانات التعلّم داخل ملف الطالب */
  const D = () => {
    const P0 = window.P;
    if (!P0) return null;
    const e = P0.en = P0.en || {};
    e.v = 1;
    e.lv = e.lv || 1;
    e.w = e.w || {};
    e.s = e.s || {};
    e.q = e.q || [0, 0];
    e.c = e.c || [0, 0];
    e.err = e.err || {};
    e.ev = e.ev || [];
    e.ses = e.ses || 0;
    return e;
  };
  const W = w => {
    const d = D(), k = key(w);
    return d.w[k] = d.w[k] || { m: [0, 0], p: [0, 0] };
  };
  const persist = () => { try { save(); } catch {} };
  function ev(kind, ok) {
    const d = D();
    d.ev.push([kind, +!!ok, d.lv, Math.round(now() / 1000)]);
    if (d.ev.length > 60) d.ev.splice(0, d.ev.length - 60);
  }
  function err(t) { const d = D(); d.err[t] = (d.err[t] || 0) + 1; }
  function recMeaning(w, ok) {
    if (!D() || !w) return;
    const s = W(w);
    s.m[0]++;
    if (ok) s.m[1]++;
    s.t = now();
    s.ms = (s.ms || 0) * (ok ? 1 : 0) + (ok ? 1 : 0);
    s.due = now() + (ok ? Math.min(30, Math.pow(2, Math.max(0, s.ms - 1))) * DAY : 8 * 60000);
    if (!ok) err('meaning');
    ev('m', ok);
    evaluate();
    persist();
  }
  function recPron(w, ok, heard) {
    if (!D() || !w) return;
    const s = W(w);
    s.p[0]++;
    if (ok) s.p[1]++;
    s.tp = now();
    if (!ok) { s.hp = String(heard || '').slice(0, 30); err('pron'); }
    ev('p', ok);
    evaluate();
    persist();
  }
  function recWrite(w, ok) {
    if (!D() || !w) return;
    const s = W(w);
    s.wr = s.wr || [0, 0];
    s.wr[0]++;
    if (ok) s.wr[1]++;
    if (!ok) err('spell');
    persist();
  }
  function recSent(sn, kind, ok) {
    const d = D();
    if (!d) return;
    const k = key(sn), s = d.s[k] = d.s[k] || { u: [0, 0], mk: [0, 0] };
    s[kind][0]++;
    if (ok) s[kind][1]++;
    s.t = now();
    if (!ok) err(kind === 'u' ? 'sentence' : 'order');
    ev(kind === 'u' ? 'su' : 'sm', ok);
    evaluate();
    persist();
  }
  function recQ(ok) {
    const d = D();
    if (!d) return;
    d.q[0]++;
    if (ok) d.q[1]++;
    if (!ok) err('question');
    ev('q', ok);
    evaluate();
    persist();
  }
  function recConv(ok) {
    const d = D();
    if (!d) return;
    d.c[0]++;
    if (ok) d.c[1]++;
    if (!ok) err('conv');
    ev('c', ok);
    evaluate();
    persist();
  }

  const okM = s => s && s.m[1] >= 2 && s.m[1] / s.m[0] >= 0.65;
  const okP = s => s && s.p[1] >= 1 && s.p[1] / s.p[0] >= 0.5;
  const hardP = s => s && s.p[0] >= 2 && s.p[1] / s.p[0] < 0.5;
  function stats() {
    const d = D();
    if (!d) return null;
    const W0 = Object.entries(d.w), S0 = Object.values(d.s);
    const K = W0.filter(([, s]) => okM(s)).length;
    const Pn = W0.filter(([, s]) => okP(s)).length;
    const SU = S0.filter(s => s.u[1] >= 1 && s.u[1] / s.u[0] >= 0.6).length;
    const SM = S0.filter(s => s.mk[1] >= 1).length;
    const QA = d.q[0] ? d.q[1] / d.q[0] : 0;
    return { K, Pn, SU, SM, QA, qn: d.q[0], C: d.c[1] };
  }

  const NEED = [null, null, { K: 6 }, { K: 15, Pn: 6, SU: 2 }, { K: 30, SU: 6, SM: 3, QA: 0.65, qn: 8 }, { K: 50, SM: 10, C: 8, QA: 0.75, qn: 15 }];
  const meets = (st, n) => {
    const r = NEED[n];
    if (!r) return true;
    return st.K >= (r.K || 0) && st.Pn >= (r.Pn || 0) && st.SU >= (r.SU || 0) && st.SM >= (r.SM || 0) && st.C >= (r.C || 0) && (r.qn ? st.qn >= r.qn && st.QA >= r.QA : true);
  };
  let lvMsg = null;
  function evaluate() {
    const d = D();
    if (!d) return;
    if (d.ov) { d.lv = d.ov; return; }
    const st = stats();
    if (d.lv < 5 && meets(st, d.lv + 1)) {
      d.lv++;
      d.lvAt = now();
      lvMsg = 'up';
    } else if (d.lv > 1 && now() - (d.lvAt || 0) > DAY) {
      const rec = d.ev.filter(e => e[2] === d.lv).slice(-14);
      if (rec.length >= 12 && rec.filter(e => e[1]).length / rec.length < 0.4) {
        d.lv--;
        d.lvAt = now();
        lvMsg = 'down';
      }
    }
  }
  const level = () => { const d = D(); return d ? (d.ov || d.lv || 1) : 1; };
  const NAMES = ['', 'مبتدئ تمامًا', 'مبتدئ', 'متوسط مبتدئ', 'متوسط', 'متقدّم'];
  const POLICY = ['',
    'الشرح بالعربية كاملًا. كلمة إنجليزية بسيطة واحدة في كل مرة مع معناها ونطقها بحروف عربية.',
    'الشرح بالعربية. زيادة الكلمات الإنجليزية تدريجيًا مع ربطها بصورة ومثال.',
    'عبارات وأسئلة إنجليزية قصيرة جدًا، ويتبع كل عبارة معناها بالعربية.',
    'جمل ومحادثة إنجليزية بسيطة، وتوضيح المعنى بالعربية عند الحاجة فقط.',
    'المحادثة بالإنجليزية غالبًا بجمل بسيطة، والعربية لتوضيح معنى أو تصحيح خطأ.'
  ];
  const ERRN = { meaning: 'يخلط معاني الكلمات', pron: 'صعوبة في النطق', spell: 'أخطاء في كتابة الكلمات', sentence: 'صعوبة في فهم الجمل', order: 'ترتيب كلمات الجملة', question: 'صعوبة في فهم الأسئلة الإنجليزية', conv: 'صعوبة في الرد في المحادثة' };
  function profile() {
    const d = D();
    if (!d) return null;
    const st = stats(), E = Object.entries(d.w);
    return {
      level: level(), name: NAMES[level()], policy: POLICY[level()],
      known: E.filter(([, s]) => okM(s)).sort((a, b) => (b[1].t || 0) - (a[1].t || 0)).slice(0, 12).map(x => x[0]),
      weakMeaning: E.filter(([, s]) => s.m[0] > s.m[1] && !okM(s)).slice(0, 6).map(x => x[0]),
      hardPron: E.filter(([, s]) => hardP(s)).slice(0, 6).map(x => x[0]),
      errs: Object.entries(d.err).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t]) => ERRN[t] || t),
      stats: st
    };
  }

  /* 4) ربط الاختبار والنطق والتفسير */
  const TEACH = new Set(['lesson', 'courseViewer', 'courseModule', 'aLet', 'aLetP', 'aColEn', 'aShpEn', 'story', 'stories', 'act', 'enTeach', 'speak']);
  const routeFn = () => { try { const e = window.Router && Router.entry(); return e ? e.fn : ''; } catch { return ''; } };
  function gloss(t) {
    if (level() > 2) return '';
    const k = key(t);
    if (!k || k.split(' ').length > 4) return '';
    const m = meaning(k);
    if (!m || window.V === 'quiz' || window.__enNoGloss) return '';
    if (PHRASE.has(k)) return m;
    if (!TEACH.has(routeFn())) return '';
    return m;
  }

  function hookQuiz() {
    const C = window.MindCoach;
    if (!C || C.__en || typeof C.onAnswer !== 'function') return;
    const o = C.onAnswer;
    C.onAnswer = function (a) {
      try {
        const x = a && a.x;
        if (x && x.l === 'en' && x.k && LAT.test(x.k)) {
          if (x.m === 3 || x.typ) recWrite(x.k, a.ok);
          else {
            recMeaning(x.k, a.ok);
            if (x.m === 1 && !a.ok) err('listen');
          }
        }
      } catch {}
      return o.apply(this, arguments);
    };
    C.__en = 1;
  }

  function hookJudge() {
    const j = window.judge;
    if (typeof j !== 'function' || j.__en) return;
    const f = function (alts, target) {
      const r = j.apply(this, arguments);
      try { if (LAT.test(target) && alts && alts.length && !window.__enOwnJudge) recPron(target, !!r.ok, r.heard || alts[0]); } catch {}
      return r;
    };
    f.__en = 1;
    window.judge = f;
  }

  /* 5) شاشة «معلّم الإنجليزية» */
  let T = null, REC = null;
  const stopMic = () => { if (REC) { try { REC.stop(); } catch {} REC = null; } };
  const SR = () => window.SpeechRecognition || window.webkitSpeechRecognition;
  const micOK = () => !!(window.P && P.mic && SR());

  function pool() {
    const out = [], seen = new Set(), st = window.P ? (P.stage || 0) : 0;
    UNITS().forEach((s, a) => {
      if (a > st + 1) return;
      s.u.forEach(u => {
        if (u.l !== 'en') return;
        u.i.forEach(it => {
          const k = key(it[0]);
          if (!k || seen.has(k)) return;
          seen.add(k);
          out.push({ w: it[0], k, e: PIC.test(it[1]) ? it[1] : emoji(k), ar: AR.test(it[1]) ? it[1] : meaning(k), unit: u.id });
        });
      });
    });
    if (GU() && GU().g2) {
      GU().g2.i.forEach(it => {
        const k = key(it[0]);
        if (!seen.has(k)) {
          seen.add(k);
          out.push({ w: it[0], k, e: it[1], ar: meaning(k), unit: 'g2' });
        }
      });
    }
    return out.filter(x => x.ar || x.e);
  }

  function pickWords(mode, unitId) {
    const d = D(), P0 = pool(), n = level() <= 1 ? 3 : level() === 2 ? 4 : 5;
    if (mode === 'unit') {
      const u = (() => { try { return find(unitId); } catch { return null; } })();
      if (u) {
        return u.i.filter(it => it[2] === 'en').map(it => {
          const k = key(it[0]);
          return { w: it[0], k, e: PIC.test(it[1]) ? it[1] : emoji(k), ar: AR.test(it[1]) ? it[1] : meaning(k) };
        }).filter(x => x.ar || x.e);
      }
    }
    if (mode === 'review') {
      return P0.map(x => {
        const s = d.w[x.k];
        if (!s) return null;
        const sc = (okM(s) ? 0 : 2) + (hardP(s) ? 1.5 : 0) + ((s.due || 0) < now() ? 1 : 0) + Math.random() * 0.3;
        return sc > 0.5 ? [x, sc] : null;
      }).filter(Boolean).sort((a, b) => b[1] - a[1]).slice(0, n).map(x => x[0]);
    }
    const fresh = P0.filter(x => !okM(d.w[x.k])).sort((a, b) => (a.k.includes(' ') - b.k.includes(' ')) || (!!b.e - !!a.e));
    const lv = level();
    return fresh.filter(x => lv >= 3 || !x.k.includes(' ') || x.k.split(' ').length <= 2).slice(0, n);
  }

  const article = w => (/^[aeiou]/i.test(w) ? 'an' : 'a');
  function sentenceFor(x) {
    const k = x.k, w = x.w.replace(/[.!?]$/, '');
    if (k.includes(' ')) return { en: /[.!?]$/.test(x.w) ? x.w : x.w + '.', ar: x.ar, parts: k.split(' ').map(t => [t, meaning(t) || '']) };
    if (NUM.has(k)) return { en: `I have ${k} apples.`, ar: `عِنْدِي ${x.ar} تُفَّاحَاتٍ.`, parts: [['I', 'أَنَا'], ['have', 'عِنْدِي'], [k, x.ar], ['apples', 'تُفَّاحَاتٍ']] };
    if (ADJ.has(k)) return { en: `It is ${k}.`, ar: `إِنَّهُ ${x.ar}.`, parts: [['It', 'هُوَ / إِنَّهُ'], ['is', 'يَكُونُ'], [k, x.ar]] };
    const art = article(k);
    return { en: `I see ${art} ${w.toLowerCase()}.`, ar: `أَنَا أَرَى ${x.ar}.`, parts: [['I', 'أَنَا'], ['see', 'أَرَى'], [art, 'أَدَاةُ نَكِرَةٍ'], [w.toLowerCase(), x.ar]] };
  }

  function introText(x, pr) {
    const lv = level(), W0 = x.w, ar = x.ar || '', hint = pr ? ` نَنْطِقُهَا: ${pr}.` : '';
    if (lv <= 1) return GT(`الْيَوْمَ سَنَتَعَلَّمُ كَلِمَةً جَدِيدَةً${ar ? ' مَعْنَاهَا: ' + ar : ''}. بِالْإِنْجِلِيزِيَّةِ نَقُولُ: ${W0}.${hint} قُلْهَا مَعِي: ${W0}.`);
    if (lv === 2) return GT(`كَلِمَةٌ جَدِيدَةٌ: ${W0}${ar ? '، وَمَعْنَاهَا ' + ar : ''}.${hint} ${W0}.`);
    if (lv === 3) return GT(`${W0}! ${W0}${ar ? ' مَعْنَاهَا ' + ar : ''}. Say it with me: ${W0}. يَعْنِي: قُلْهَا مَعِي.`);
    if (lv === 4) return `${x.k.includes(' ') ? W0 : 'This is ' + article(x.k) + ' ' + W0.toLowerCase() + '.'} ${W0}${ar ? '، ' + ar : ''}. Can you say it?`;
    return `${x.k.includes(' ') ? W0 : 'This is ' + article(x.k) + ' ' + W0.toLowerCase() + '.'} Can you say ${W0}?`;
  }

  function speak(t, l, cb) {
    if (window.P && P.snd === 0) { cb && setTimeout(cb, 300); return; }
    window.__enNoGloss = 1;
    try { say(t, l || 'ar', cb); } finally { window.__enNoGloss = 0; }
  }
  const card = (inner, cls) => `<div class="enx ${cls || ''}">${inner}</div>`;
  const lvBadge = () => `<span class=enlv title="مستوى الإنجليزية">🇬🇧 المستوى ${level()}: ${NAMES[level()]}</span>`;
  const prog = () => `<div class=bar><div style="width:${Math.round(T.i / T.L.length * 100)}%"></div></div>`;
  const head = () => `<section class="sec enteach"><button class=link onclick="goBack()">← رجوع</button><h2>👩‍🏫 معلّم الإنجليزية ${T.mode === 'review' ? '— مراجعة' : ''}</h2>${lvBadge()}${prog()}`;
  const btnSay = (t, l, lab) => `<button class=alt onclick="EnCoach._say(${esc(JSON.stringify(t))},'${l}')">${lab || '🔊'}</button>`;

  function enTeach(mode, unitId) {
    window.V = 'lesson';
    const L = pickWords(mode || 'new', unitId);
    const d = D();
    if (!d) return;
    d.ses++;
    T = { L, i: 0, mode: mode || 'new', unitId, streak: 0, miss: 0, hard: false, easy: false, good: 0 };
    if (!L.length) {
      h(`<section class=sec><button class=link onclick="goBack()">← رجوع</button><h2>👩‍🏫 معلّم الإنجليزية</h2>${lvBadge()}${card(`<p>${mode === 'review' ? 'لا توجد كلمات تحتاج مراجعة الآن 🌟' : 'أحسنت! أتقنت كل كلمات مرحلتك الحالية 🌟'}</p>`)}<button class=big onclick="enTeach('review')">🔁 مراجعة ذكية</button><button class=alt onclick="sec('en')">📖 دروس الإنجليزية</button></section>`);
      speak(mode === 'review' ? 'لَا تُوجَدُ كَلِمَاتٌ تَحْتَاجُ مُرَاجَعَةً الْآنَ. أَحْسَنْتَ!' : 'أَحْسَنْتَ! أَتْقَنْتَ كَلِمَاتِ مَرْحَلَتِكَ.', 'ar');
      return;
    }
    step('intro');
  }

  function step(s) {
    stopMic();
    window.Lazy && Lazy.onLeave(stopMic);
    T.s = s;
    const x = T.L[T.i];
    if (!x) return done();
    const lv = level();
    const ep = window.BumiAudio ? BumiAudio.epoch() : 0;

    if (s === 'intro') {
      pronAr(x.w).then(pr => {
        if (!T || T.L[T.i] !== x || T.s !== 'intro' || (window.BumiAudio && !BumiAudio.within(ep))) return;
        x.pr = pr;
        h(head() + card(`<div class=enpic>${x.e || '🔤'}</div><div class=enword dir=ltr>${esc(x.w)}</div>${x.ar ? `<div class=enar>${esc(x.ar)}</div>` : ''}${pr && lv <= 3 ? `<div class=enpr>🗣️ تُنْطَقُ: <b>${esc(pr)}</b></div>` : ''}
          <div class=enrow>${btnSay(x.w, 'en', '🔊 ' + esc(x.w))}${x.ar ? btnSay(x.ar, 'ar', '🔊 المعنى') : ''}${btnSay(introText(x, pr), lv >= 4 ? 'en' : 'ar', '🦉 اشرح مرة أخرى')}</div>`) +
          `<button class=big onclick="EnCoach._next('pron')">${lv <= 2 ? 'التالي: أنطقها ▶' : 'Next ▶'}</button></section>`);
        speak(introText(x, pr), lv >= 4 ? 'en' : 'ar');
      });
      return;
    }
    if (s === 'pron') {
      const can = micOK();
      h(head() + card(`<div class=enpic>${x.e || '🔤'}</div><div class=enword dir=ltr>${esc(x.w)}</div>${x.pr && lv <= 3 ? `<div class=enpr>🗣️ ${esc(x.pr)}</div>` : ''}
        <p id=enfb class=mut aria-live=polite>${can ? GT('اسْتَمِعْ ثُمَّ اضْغَطْ 🎤 وَقُلِ الْكَلِمَةَ.') : GT('اسْتَمِعْ وَكَرِّرِ الْكَلِمَةَ بِصَوْتِكَ.')}</p>
        <div class=enrow>${btnSay(x.w, 'en', '🔊 اسمع')}${can ? `<button id=enmic class=big onclick="EnCoach._mic()">🎤 قلها</button>` : ''}</div>`) +
        `<button class=alt onclick="EnCoach._next('mean')">${can ? 'تخطَّ ▶' : 'كرّرتها ▶'}</button></section>`);
      speak(lv <= 2 ? GT(`قُلْ مَعِي: ${x.w}`) : lv === 3 ? `Say: ${x.w}` : `Say ${x.w}.`, lv <= 2 ? 'ar' : 'en');
      T.pt = 0;
      return;
    }
    if (s === 'mean') {
      const useE0 = !!x.e;
      const others = sh(pool().filter(y => y.k !== x.k && (useE0 ? y.e && y.e !== x.e : y.ar && y.ar !== x.ar))).slice(0, T.easy ? 1 : lv <= 1 ? 2 : 3);
      const opts = sh([x, ...others]);
      const eng = !T.easy && (lv >= 4 || (lv === 3 && (T.hard || Math.random() < 0.6)));
      T.eng = eng;
      T.opts = opts;
      const qEn = x.e ? `Where is the ${x.w.toLowerCase()}?` : `What does "${x.w}" mean?`;
      const qAr = x.e ? GT(`أَيْنَ صُورَةُ ${x.w}؟`) : GT(`مَا مَعْنَى ${x.w}؟`);
      const useE = !!x.e;
      h(head() + card(`<p class=enq dir=auto>${eng ? esc(qEn) : esc(qAr)}</p>${eng && lv <= 4 ? `<p class="mut enhelp">${esc(qAr)}</p>` : eng ? `<button class=link onclick="this.outerHTML='<p class=mut>${esc(qAr)}</p>'">🇸🇦 ما معنى السؤال؟</button>` : ''}
        <div class="grid engrid">${opts.map((o, j) => `<button class=opt data-j=${j} onclick="EnCoach._mean(${j},this)">${useE ? `<span class=enpic2>${o.e}</span>` : esc(o.ar)}</button>`).join('')}</div>`) + `</section>`);
      speak(eng ? qEn : qAr, eng ? 'en' : 'ar');
      T.t0 = now();
      return;
    }
    if (s === 'sent') {
      const sn = sentenceFor(x);
      T.sn = sn;
      h(head() + card(`<p class=mut>${GT(lv <= 2 ? 'نَتَعَلَّمُ جُمْلَةً قَصِيرَةً بِالْكَلِمَةِ:' : 'جملة جديدة:')}</p><div class=ensent dir=ltr>${esc(sn.en)}</div>${lv <= 4 ? `<div class=enar>${esc(sn.ar)}</div>` : ''}
        <div class=enchips dir=ltr>${sn.parts.map(p => `<button class=chip onclick="EnCoach._say(${esc(JSON.stringify(p[0]))},'en')"><b>${esc(p[0])}</b>${p[1] && lv <= 4 ? `<small dir=rtl>${esc(p[1])}</small>` : ''}</button>`).join('')}</div>
        <div class=enrow>${btnSay(sn.en, 'en', '🔊 الجملة')}</div>`) + `<button class=big onclick="EnCoach._next('sentq')">▶</button></section>`);
      const exp = lv <= 2
        ? GT(`هَذِهِ جُمْلَةٌ: ${sn.en} مَعْنَاهَا: ${sn.ar} اسْمَعِ الْكَلِمَاتِ وَاحِدَةً وَاحِدَةً: ${sn.parts.map(p => p[0] + '، ' + (p[1] || '')).join('، ')}. وَالْآنَ الْجُمْلَةُ كَامِلَةً: ${sn.en}`)
        : lv <= 4 ? `${sn.en} ${sn.ar}. ${sn.parts.map(p => p[0]).join(', ')}. ${sn.en}` : `${sn.en} ${sn.en}`;
      speak(exp, lv <= 2 ? 'ar' : 'en');
      return;
    }
    if (s === 'sentq') {
      const sn = T.sn;
      const dis = sh(pool().filter(y => y.k !== x.k && y.ar)).slice(0, 2).map(y => sentenceFor(y).ar);
      const opts = sh([sn.ar, ...dis]);
      T.sopts = opts;
      h(head() + card(`<p class=enq>${GT('مَا مَعْنَى هَذِهِ الْجُمْلَةِ؟')}</p><div class=ensent dir=ltr>${esc(sn.en)} ${btnSay(sn.en, 'en', '🔊')}</div><div class=list>${opts.map((o, j) => `<button class=opt onclick="EnCoach._sq(${j},this)">${esc(o)}</button>`).join('')}</div>`) + `</section>`);
      speak(lv <= 2 ? GT(`مَا مَعْنَى: ${sn.en}`) : `What does it mean? ${sn.en}`, lv <= 2 ? 'ar' : 'en');
      return;
    }
    if (s === 'build') {
      const sn = T.sn, words = sn.en.replace(/[.!?]$/, '').split(' ');
      T.bw = words;
      T.bo = [];
      h(head() + card(`<p class=enq>${GT(lv <= 3 ? 'رَتِّبِ الْكَلِمَاتِ لِتُكَوِّنَ الْجُمْلَةَ:' : 'Build the sentence:')}</p><div class=enar>${esc(sn.ar)}</div><div id=enbuilt class=ensent dir=ltr>…</div>
        <div class=enchips dir=ltr>${sh(words.map((w, i) => [w, i])).map(([w, i]) => `<button class=chip onclick="EnCoach._pickw(${i},this)">${esc(w)}</button>`).join('')}</div>`) + `<button class=alt onclick="EnCoach._step('build')">↺</button></section>`);
      speak(lv <= 3 ? GT('رَتِّبِ الْكَلِمَاتِ لِتُكَوِّنَ جُمْلَةً: ' + sn.ar) : 'Build the sentence.', lv <= 3 ? 'ar' : 'en');
      return;
    }
    if (s === 'conv') {
      const yes = Math.random() < 0.6 || !x.e;
      const show = yes ? x : pick(pool().filter(y => y.e && y.k !== x.k)) || x;
      const q0 = x.k.includes(' ') ? null : `Do you see ${article(x.k)} ${x.w.toLowerCase()}?`;
      if (!q0) return step('next');
      T.cyes = show === x;
      h(head() + card(`<div class=enpic>${show.e || '❓'}</div><p class=enq dir=ltr>${esc(q0)} ${btnSay(q0, 'en', '🔊')}</p>${lv <= 3 ? `<p class=mut>${GT('هَلْ تَرَى ' + (x.ar || x.w) + '؟')}</p>` : ''}
        <div class=list dir=ltr><button class=opt onclick="EnCoach._cv(1,this)">Yes, I do. 👍</button><button class=opt onclick="EnCoach._cv(0,this)">No, I don't. 👎</button></div>`) + `</section>`);
      speak(q0, 'en');
      T.t0 = now();
      return;
    }
    if (s === 'next') {
      T.i++;
      T.eng = false;
      if (T.i >= T.L.length) return done();
      return step('intro');
    }
  }

  function after(ok) {
    if (ok) { T.streak++; T.miss = 0; T.good++; if (T.streak >= 3) { T.hard = true; T.easy = false; } }
    else { T.streak = 0; T.miss++; T.hard = false; if (T.miss >= 2) T.easy = true; }
  }
  function flow(from) {
    const lv = level();
    if (from === 'mean') return step(T.lastOk && lv >= 2 ? 'sent' : 'next');
    if (from === 'sentq') {
      if (lv >= 4 || (lv === 3 && T.streak >= 2)) return step('build');
      if (lv >= 3) return step('conv');
      return step('next');
    }
    if (from === 'build') return step(lv >= 3 ? 'conv' : 'next');
    return step('next');
  }
  function done() {
    stopMic();
    const g = T.good, n = T.L.length, lv = level();
    let m = GT(g >= n ? 'رَائِعٌ! أَنْهَيْتَ الدَّرْسَ وَفَهِمْتَ الْكَلِمَاتِ جَيِّدًا.' : 'أَحْسَنْتَ! سَنُرَاجِعُ الْكَلِمَاتِ الصَّعْبَةَ مَعًا فِي الْمَرَّةِ الْقَادِمَةِ.');
    if (lvMsg === 'up') { m += GT(` وَصَلْتَ إِلَى الْمُسْتَوَى ${lv}: ${NAMES[lv]}. سَأَسْتَخْدِمُ الْإِنْجِلِيزِيَّةَ أَكْثَرَ قَلِيلًا.`); lvMsg = null; }
    else if (lvMsg === 'down') { m += GT(' سَنَعُودُ خُطْوَةً لِلْوَرَاءِ وَنَتَعَلَّمُ بِهُدُوءٍ.'); lvMsg = null; }
    try { P.star = (P.star || 0) + g; save(); } catch {}
    h(`<section class="sec enteach"><h2>🌟</h2>${lvBadge()}${card(`<p>${esc(m)}</p><p class=mut>⭐ +${g}</p>`)}<button class=big onclick="enTeach('new')">👩‍🏫 كلمات جديدة</button><button class=alt onclick="enTeach('review')">🔁 مراجعة ذكية</button><button class=alt onclick="sec('en')">📖 دروس الإنجليزية</button></section>`);
    speak(m, 'ar');
    try { window.MC && MC.mood(g >= n ? 'proud' : 'happy', 1800); } catch {}
  }

  const fb = (t, l) => { const e = document.getElementById('enfb'); if (e) e.textContent = t; speak(t, l || 'ar'); };
  const api = {
    _say: (t, l) => speak(t, l),
    _step: s => step(s),
    _next: s => step(s),
    _mic() {
      const x = T.L[T.i], b = document.getElementById('enmic');
      if (REC) { stopMic(); return; }
      const C = SR();
      if (!C) return;
      try { say.stop(); } catch {}
      const r = new C();
      REC = r;
      r.lang = 'en-US';
      r.maxAlternatives = 5;
      r.interimResults = false;
      if (b) b.textContent = '⏹ أسمعك…';
      try { window.MC && MC.mood('listen', 6000); } catch {}
      const ep = window.BumiAudio ? BumiAudio.epoch() : 0;
      r.onresult = e => {
        const alts = [...e.results[0]].map(a => a.transcript);
        window.__enOwnJudge = 1;
        let j;
        try { j = window.judge ? judge(alts, x.w) : { ok: alts.some(a => key(a) === x.k) }; } finally { window.__enOwnJudge = 0; }
        recPron(x.w, !!j.ok, alts[0]);
        T.pt++;
        if (j.ok) {
          after(true);
          fb(GT(pick(['مُمْتَازٌ! نُطْقُكَ صَحِيحٌ.', 'رَائِعٌ! أَحْسَنْتَ النُّطْقَ.', 'صَحِيحٌ! نُطْقٌ جَمِيلٌ.']) + (j.tip ? ' ' + j.tip : '')));
          setTimeout(() => { if (!window.BumiAudio || BumiAudio.within(ep)) step('mean'); }, 1700);
        } else {
          after(false);
          const h0 = alts[0] || '';
          const tip = T.pt >= 3
            ? GT('لَا بَأْسَ، سَنَتَدَرَّبُ عَلَيْهَا لَاحِقًا. هَيَّا نُكْمِلُ.')
            : GT(`سَمِعْتُ «${h0}». اسْمَعْ جَيِّدًا: ${x.w}${x.pr ? '، تُنْطَقُ: ' + x.pr : ''}. حَاوِلْ مَرَّةً أُخْرَى.`);
          fb(tip);
          if (T.pt >= 3) setTimeout(() => { if (!window.BumiAudio || BumiAudio.within(ep)) step('mean'); }, 2600);
        }
      };
      r.onerror = e => fb(GT(e.error === 'no-speech' ? 'لَمْ أَسْمَعْ صَوْتًا، حَاوِلْ مَرَّةً أُخْرَى.' : 'تَعَذَّرَ الِاسْتِمَاعُ الْآنَ.'));
      r.onend = () => { REC = null; const b2 = document.getElementById('enmic'); if (b2) b2.textContent = '🎤 قلها'; };
      try { r.start(); } catch { REC = null; }
    },
    _mean(j, btn) {
      const x = T.L[T.i], o = T.opts[j], ok = o === x;
      document.querySelectorAll('.engrid .opt').forEach(b => { b.disabled = true; if (T.opts[+b.dataset.j] === x) b.classList.add('ok'); });
      if (!ok) btn.classList.add('no');
      recMeaning(x.w, ok);
      if (T.eng) recQ(ok);
      after(ok);
      T.lastOk = ok;
      try { window.HurufiSound && HurufiSound.play(ok ? 'correct' : 'wrong'); } catch {}
      const ep = window.BumiAudio ? BumiAudio.epoch() : 0;
      if (ok) {
        fb(level() >= 3 ? pick(['Great job!', 'Excellent!', 'Well done!']) : GT(pick(['أَحْسَنْتَ! ', 'صَحِيحٌ! ', 'مُمْتَازٌ! ']) + `${x.w} مَعْنَاهَا ${x.ar || ''}.`), level() >= 3 ? 'en' : 'ar');
        setTimeout(() => { if (!window.BumiAudio || BumiAudio.within(ep)) flow('mean'); }, 1500);
      } else {
        T.redo = (T.redo || 0) + 1;
        const m = GT(`لَا بَأْسَ. انْظُرْ: ${x.e || ''} هَذِهِ ${x.ar || ''}. وَبِالْإِنْجِلِيزِيَّةِ نَقُولُ ${x.w}. ${x.ar || ''} يَعْنِي ${x.w}.`);
        fb(m, 'ar');
        setTimeout(() => {
          if (window.BumiAudio && !BumiAudio.within(ep)) return;
          if (T.redo <= 1) { T.easy = true; step('mean'); }
          else { T.redo = 0; T.L.push(x); step('next'); }
        }, m.length * 55 + 900);
      }
    },
    _sq(j, btn) {
      const ok = T.sopts[j] === T.sn.ar;
      document.querySelectorAll('.enx .opt').forEach(b => { b.disabled = true; });
      btn.classList.add(ok ? 'ok' : 'no');
      recSent(T.sn.en, 'u', ok);
      after(ok);
      try { window.HurufiSound && HurufiSound.play(ok ? 'correct' : 'wrong'); } catch {}
      const ep = window.BumiAudio ? BumiAudio.epoch() : 0;
      fb(ok ? GT('أَحْسَنْتَ! فَهِمْتَ الْجُمْلَةَ.') : GT(`مَعْنَاهَا: ${T.sn.ar}. ${T.sn.parts.map(p => p[0] + ' تَعْنِي ' + (p[1] || '')).join('، ')}.`), 'ar');
      setTimeout(() => { if (!window.BumiAudio || BumiAudio.within(ep)) flow('sentq'); }, ok ? 1300 : 3500);
    },
    _pickw(i, btn) {
      btn.disabled = true;
      T.bo.push(i);
      const el = document.getElementById('enbuilt');
      if (el) el.textContent = T.bo.map(k => T.bw[k]).join(' ');
      speak(T.bw[i], 'en');
      if (T.bo.length === T.bw.length) {
        const ok = T.bo.every((k, n) => T.bw[k] === T.bw[n]);
        recSent(T.sn.en, 'mk', ok);
        after(ok);
        try { window.HurufiSound && HurufiSound.play(ok ? 'correct' : 'wrong'); } catch {}
        if (el) el.classList.add(ok ? 'ok' : 'no');
        const ep = window.BumiAudio ? BumiAudio.epoch() : 0;
        fb(ok ? (level() >= 4 ? 'Great! ' + T.sn.en : GT('رَائِعٌ! كَوَّنْتَ الْجُمْلَةَ: ') + T.sn.en) : GT('قَرِيبٌ! التَّرْتِيبُ الصَّحِيحُ: ') + T.sn.en, ok && level() >= 4 ? 'en' : 'ar');
        setTimeout(() => { if (!window.BumiAudio || BumiAudio.within(ep)) flow('build'); }, 2500);
      }
    },
    _cv(yes, btn) {
      const ok = !!yes === !!T.cyes;
      document.querySelectorAll('.enx .opt').forEach(b => { b.disabled = true; });
      btn.classList.add(ok ? 'ok' : 'no');
      recConv(ok);
      recQ(ok);
      after(ok);
      try { window.HurufiSound && HurufiSound.play(ok ? 'correct' : 'wrong'); } catch {}
      const x = T.L[T.i], ep = window.BumiAudio ? BumiAudio.epoch() : 0;
      fb(ok
        ? (T.cyes ? 'Yes, I do! ' + GT('أَحْسَنْتَ.') : "No, I don't! " + GT('أَحْسَنْتَ.'))
        : GT(T.cyes ? `الصُّورَةُ فِيهَا ${x.ar || x.w}، لِذَلِكَ نَقُولُ: Yes, I do.` : `الصُّورَةُ لَيْسَ فِيهَا ${x.ar || x.w}، لِذَلِكَ نَقُولُ: No, I don't.`), 'ar');
      setTimeout(() => { if (!window.BumiAudio || BumiAudio.within(ep)) step('next'); }, ok ? 1800 : 3400);
    }
  };

  /* 6) دمج في صفحات الأكاديمية (تقرير ولي الأمر مُدمج في parent-panel.js بدون تكرار) */
  function decorate() {
    try {
      if (!window.P) return;
      const appEl = document.getElementById('app');
      if (!appEl) return;
      if (window.V === 'sec' && window.CS === 'en' && !appEl.querySelector('.enhub')) {
        const sec0 = appEl.querySelector('.sec h2');
        if (sec0) {
          const st = stats() || {};
          sec0.insertAdjacentHTML('afterend', `<div class="enhub enx">${lvBadge()}<p class=mut>${GT('مُعَلِّمُ الْإِنْجِلِيزِيَّةِ يَشْرَحُ بِالْعَرَبِيَّةِ أَوَّلًا وَيَزِيدُ الْإِنْجِلِيزِيَّةَ حَسَبَ فَهْمِكَ.')}</p>
            <div class=list><button class=row onclick="enTeach('new')"><span>👩‍🏫</span><b>تعلّم كلمات جديدة مع المعلّم</b><small>${st.K || 0} كلمة فهمتها</small></button><button class=row onclick="enTeach('review')"><span>🔁</span><b>مراجعة ذكية للكلمات</b><small>${st.Pn || 0} كلمة تنطقها</small></button></div></div>`);
        }
      }
      if (window.V === 'lesson' && window.cur && cur.id && cur.i && cur.i.length && cur.i.every(x => x[2] === 'en') && !appEl.querySelector('.enlesson') && routeFn() === 'lesson') {
        const h2 = appEl.querySelector('h2');
        if (h2) h2.insertAdjacentHTML('afterend', `<div class="enlesson enx">${lvBadge()}<button class=big onclick="enTeach('unit','${esc(cur.id)}')">👩‍🏫 علّمني هذا الدرس خطوة بخطوة</button><p class=mut>${level() <= 2 ? 'اضغط على البطاقة لتسمع الكلمة ومعناها بالعربية' : 'Tap a card to listen'}</p></div>`);
      }
    } catch {}
  }

  function hookH() {
    const oh = window.h;
    if (typeof oh !== 'function' || oh.__en) return;
    const f = function () {
      const r = oh.apply(this, arguments);
      decorate();
      return r;
    };
    f.__en = 1;
    Object.keys(oh).forEach(k => { try { f[k] = oh[k]; } catch {} });
    window.h = f;
  }

  function setLevel(n) { const d = D(); if (!d) return; d.ov = n || 0; if (n) d.lv = n; persist(); }
  window.enTeach = enTeach;
  function install() { hookQuiz(); hookJudge(); hookH(); dict(); }
  install();
  addEventListener('load', () => { install(); setTimeout(install, 450); });
  return Object.assign(api, { level, levelName: () => NAMES[level()], setLevel, meaning, dictAll: () => Object.values(dict()), emoji, pronAr, profile, stats, recMeaning, recPron, recSent, recQ, recConv, gloss, enTeach, decorate, NAMES, POLICY });
})();
