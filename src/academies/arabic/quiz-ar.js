/* src/academies/arabic/quiz-ar.js — مراجعة وتمارين أكاديمية اللغة العربية (المراحل ٠ إلى ٤):
   • تصنيف كل درس حسب مهارته وتوليد أسئلة متنوعة (صور، استماع، الحرف الأول، الناقص، تركيب، ترتيب، تصنيف، إعراب مبسط، مخارج الحروف، الألف اللينة).
   • ضمان عدم تكرار الخيارات أبدًا (uniqueOpts)، وصحة التشكيل، والتسجيل الدقيق في عقل بومي. */
(() => {
  'use strict';
  if (typeof S === 'undefined') return;

  const M = /[ً-ْٰـ]/g;
  const strip = s => String(s || '').replace(M, '');
  const EMO = /\p{Extended_Pictographic}/u;
  const shuf = a => {
    const out = [...a];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const find0 = id => {
    const [a] = String(id).split('-');
    return (S[+a] && S[+a].u.find(u => u.id === id)) || null;
  };
  const isPic = v => EMO.test(String(v)) && strip(String(v)).replace(/[\p{Extended_Pictographic}\uFE0F\u200D\s]/gu, '').length === 0;

  /* 1) إزالة التكرار وضبط التشكيل للمواد المكررة */
  const SUN = '☀️ لَامٌ شَمْسِيَّةٌ: تُكْتَبُ وَلَا تُنْطَقُ';
  const MOON = '🌙 لَامٌ قَمَرِيَّةٌ: تُكْتَبُ وَتُنْطَقُ';
  const TM = 'ة مَرْبُوطَةٌ: نَقِفُ عَلَيْهَا هَاءً';
  const TF = 'ت مَفْتُوحَةٌ: تَبْقَى تَاءً عِنْدَ الْوَقْفِ';
  const TH = 'ه هَاءٌ أَصْلِيَّةٌ: تُنْطَقُ هَاءً دَائِمًا';

  const FIX = {
    '2-52': [['الطَّاوِلَةُ', SUN], ['الصَّقْرُ', SUN], ['الزَّيْتُونُ', SUN], ['النَّافِذَةُ', SUN], ['الْبَحْرُ', MOON], ['الْغَيْمَةُ', MOON], ['الْعُصْفُورُ', MOON], ['الْمِفْتَاحُ', MOON]],
    '2-51': [['حَقِيبَةٌ', TM], ['سَاعَةٌ', TM], ['فَاكِهَةٌ', TM], ['صَوْتٌ', TF], ['زَيْتٌ', TF], ['تُوتٌ', TF], ['وَجْهٌ', TH], ['مِيَاهٌ', TH]],
    '3-6': [['أَرْنَبٌ', 'هَمْزَةُ قَطْعٍ'], ['اِجْلِسْ', 'هَمْزَةُ وَصْلٍ'], ['إِصْبَعٌ', 'هَمْزَةُ قَطْعٍ'], ['اِسْتَمِعْ', 'هَمْزَةُ وَصْلٍ'], ['أَمِيرٌ', 'هَمْزَةُ قَطْعٍ'], ['اِنْطَلَقَ', 'هَمْزَةُ وَصْلٍ']],
    '3-3': [['سُكَّرٌ', 'شَدَّةٌ'], ['مُعَلِّمٌ', 'شَدَّةٌ'], ['دُبٌّ', 'شَدَّةٌ'], ['صَارُوخٌ', 'مَدٌّ بِالْأَلِفِ وَالْوَاوِ'], ['قِنْدِيلٌ', 'مَدٌّ بِالْيَاءِ'], ['مِيزَانٌ', 'مَدٌّ بِالْيَاءِ وَالْأَلِفِ']],
    '1-53': [['بُرْكَانٌ', '🌋 ب: نُقْطَةٌ وَاحِدَةٌ مِنْ تَحْت'], ['تِمْسَاحٌ', '🐊 ت: نُقْطَتَانِ مِنْ فَوْق'], ['ثَوْمٌ', '🧄 ث: ثَلَاثُ نِقَاطٍ مِنْ فَوْق'], ['نَجْمَةٌ', '⭐ ن: نُقْطَةٌ وَاحِدَةٌ مِنْ فَوْق'], ['يَقْطِينٌ', '🎃 ي: نُقْطَتَانِ مِنْ تَحْت'], ['خَيْمَةٌ', '⛺ خ: نُقْطَةٌ مِنْ فَوْق'], ['جَزِيرَةٌ', '🏝️ ج: نُقْطَةٌ فِي الْوَسَط'], ['حَلَزُونٌ', '🐌 ح: بِلَا نُقَط']],
    '3-7': [['قَلَمَانِ', 'مُثَنًّى'], ['أَقْلَامٌ', 'جَمْعٌ'], ['قَلَمٌ', 'مُفْرَدٌ'], ['بِنْتَانِ', 'مُثَنًّى'], ['بَنَاتٌ', 'جَمْعٌ'], ['بِنْتٌ', 'مُفْرَدٌ']],
    '2-1': [['نَارٌ', '🔥'], ['جَرَسٌ', '🔔'], ['عَلَمٌ', '🚩'], ['تَاجٌ', '👑'], ['رِيشٌ', '🪶'], ['سُورٌ', '🧱']]
  };
  for (const [id, items] of Object.entries(FIX)) {
    const u = find0(id);
    if (u) u.i = items.map(x => [x[0], x[1], 'ar']);
  }
  const rename = (id, title) => { const u = find0(id); if (u) u.n = title; };
  rename('2-1', 'أَقْرَأُ وَأُرَكِّبُ كَلِمَاتٍ قَصِيرَةً');
  rename('3-6', 'هَمْزَةُ الْقَطْعِ وَالْوَصْلِ (تَطْبِيقٌ)');
  rename('3-3', 'الشَّدَّةُ أَمِ الْمَدُّ؟');
  rename('2-51', 'ة أَمْ ت أَمْ ه؟ تَدْرِيبُ الْوَقْفِ');
  rename('2-3', 'اللَّامُ الشَّمْسِيَّةُ وَالْقَمَرِيَّةُ');

  const rep = (id, from, to) => {
    const u = find0(id);
    if (!u) return;
    const k = u.i.findIndex(x => strip(x[0]) === strip(from));
    if (k >= 0) u.i[k] = [to[0], to[1], 'ar'];
  };
  rep('2-38', 'الرَّجُلُ', ['الضِّفْدَعُ', '🐸']);
  rep('4-24', 'سَقَى الفَلَّاحُ الزَّرْعَ', ['قَطَفَ الْوَلَدُ التُّفَّاحَةَ', 'التُّفَّاحَةَ مَفْعُولٌ بِهِ']);

  /* 2) تصنيف الدروس */
  const TYPE = {
    '0-0': 'letters', '1-0': 'letters', '1-11': 'letters', '1-12': 'letters', '1-13': 'letters', '1-14': 'letters',
    '1-1': 'haraka', '1-58': 'syll', '1-59': 'segment', '1-5': 'madd', '1-48': 'shadda', '1-53': 'similar',
    '1-44': 'build', '1-45': 'build', '1-46': 'build', '1-47': 'build', '2-1': 'build', '1-4': 'build',
    '0-10': 'count', '1-15': 'numbers', '2-21': 'numbers',
    '2-6': 'sequence', '3-21': 'sequence', '3-33': 'sequence', '2-53': 'sequence',
    '2-8': 'sentence', '4-11': 'sentence', '4-23': 'sentence', '4-33': 'sentence', '2-44': 'sentence',
    '3-5': 'verbsubj', '4-24': 'object',
    '2-3': 'classify', '2-52': 'classify', '3-13': 'classify', '2-4': 'classify', '2-51': 'classify', '2-50': 'classify', '3-6': 'classify',
    '3-7': 'classify', '3-8': 'classify', '3-16': 'classify', '3-17': 'classify', '3-31': 'classify', '3-36': 'classify', '1-6': 'classify',
    '3-14': 'classify', '3-3': 'classify', '3-48': 'classify', '3-49': 'classify', '3-50': 'classify', '3-54': 'classify', '3-55': 'classify',
    '2-38': 'alpic', '2-39': 'alpic'
  };
  const typeOf = u => {
    if (!u || u.l !== 'ar' || !u.i) return null;
    if (TYPE[u.id]) return TYPE[u.id];
    const pics = u.i.filter(x => isPic(x[1])).length;
    return pics >= u.i.length * 0.7 ? 'vocab' : 'desc';
  };
  window.lessonType = u => typeOf(u || window.cur);

  const KW = [
    [/شمس/, 'شَمْسِيَّةٌ ☀️'],
    [/قمر/, 'قَمَرِيَّةٌ 🌙'],
    [/مربوط/, 'تَاءٌ مَرْبُوطَةٌ (ة)'],
    [/مفتوح/, 'تَاءٌ مَفْتُوحَةٌ (ت)'],
    [/^ه |هاء اصليه|هاء أصلية/, 'هَاءٌ أَصْلِيَّةٌ (ه)'],
    [/قطع/, 'هَمْزَةُ قَطْعٍ (أ إ)'],
    [/وصل/, 'هَمْزَةُ وَصْلٍ (ا)'],
    [/مثنى/, 'مُثَنًّى'],
    [/^جمع|جمع$/, 'جَمْعٌ'],
    [/مفرد/, 'مُفْرَدٌ'],
    [/فعليه|فعلية/, 'جُمْلَةٌ فِعْلِيَّةٌ'],
    [/اسميه|اسمية/, 'جُمْلَةٌ اسْمِيَّةٌ'],
    [/^فعل$/, 'فِعْلٌ'],
    [/^اسم$/, 'اسْمٌ'],
    [/مذكر/, 'مُذَكَّرٌ'],
    [/مونث|مؤنث/, 'مُؤَنَّثٌ'],
    [/ماض/, 'مَاضٍ'],
    [/مضارع/, 'مُضَارِعٌ'],
    [/^أمر$|^امر$/, 'أَمْرٌ'],
    [/بالظاء/, 'بِالظَّاءِ (ظ)'],
    [/بالضاد/, 'بِالضَّادِ (ض)'],
    [/ضمتان|تنوين ضم/, 'تَنْوِينُ ضَمٍّ (ـٌ)'],
    [/فتحتان|تنوين فتح/, 'تَنْوِينُ فَتْحٍ (ـً)'],
    [/كسرتان|تنوين كسر/, 'تَنْوِينُ كَسْرٍ (ـٍ)'],
    [/شدة|شده/, 'شَدَّةٌ (ـّ)'],
    [/مد بالا|مد بالو|مد بالي|مد/, 'مَدٌّ (ا و ي)'],
    [/أقصى اللسان|اقصى اللسان/, 'أَقْصَى اللِّسَانِ'],
    [/وسط اللسان/, 'وَسَطُ اللِّسَانِ'],
    [/حافة اللسان/, 'حَافَةُ اللِّسَانِ'],
    [/طرف اللسان/, 'طَرَفُ اللِّسَانِ'],
    [/أقصى الحلق|اقصى الحلق/, 'أَقْصَى الْحَلْقِ'],
    [/وسط الحلق/, 'وَسَطُ الْحَلْقِ'],
    [/أدنى الحلق|ادنى الحلق/, 'أَدْنَى الْحَلْقِ'],
    [/الجوف/, 'الْجَوْفُ (حُرُوفُ الْمَدِّ)'],
    [/الخيشوم/, 'الْخَيْشُومُ (الْغُنَّةُ)'],
    [/الشفتان تنطبقان/, 'الشَّفَتَانِ تَنْطَبِقَانِ'],
    [/الشفتان تنضمان/, 'الشَّفَتَانِ تَنْضَمَّانِ'],
    [/باطن الشفة/, 'بَاطِنُ الشَّفَةِ مَعَ الْأَسْنَانِ'],
    [/ا ممدودة/, 'أَلِفٌ مَمْدُودَةٌ (ا)'],
    [/ى مقصورة/, 'أَلِفٌ مَقْصُورَةٌ (ى)']
  ];
  const label = it => {
    const t = strip(it[1]).replace(/[\p{Extended_Pictographic}\uFE0F]/gu, '').trim();
    for (const [r, l] of KW) if (r.test(t)) return l;
    return null;
  };

  /* 3) أدوات الحروف */
  const GR = /[ء-يٱ](?:[ً-ْٰ])*/g;
  const graphemes = w => String(w).match(GR) || [];
  const AB = 'ا ب ت ث ج ح خ د ذ ر ز س ش ص ض ط ظ ع غ ف ق ك ل م ن ه و ي'.split(' ');
  const SIM = { ب: 'تثني', ت: 'بثن', ث: 'بتن', ن: 'بتي', ي: 'بنت', ج: 'حخ', ح: 'جخ', خ: 'جح', د: 'ذر', ذ: 'دز', ر: 'زد', ز: 'رذ', س: 'شص', ش: 'سص', ص: 'ضس', ض: 'صظ', ط: 'ظت', ظ: 'طض', ع: 'غه', غ: 'عق', ف: 'قث', ق: 'فك', ك: 'قل', ل: 'كن', م: 'نب', ه: 'ةع', و: 'رز', ا: 'لو' };
  const base = g => strip(g).replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه');
  const distract = (g, n = 3) => {
    const b = base(g);
    const sim = (SIM[b] || '').split('').filter(x => x !== b);
    const rest = shuf(AB.filter(x => x !== b && !sim.includes(x)));
    const marks = (g.match(/[ً-ْٰ]/g) || []).join('');
    return [...sim, ...rest].slice(0, n).map(x => x + marks);
  };
  const firstG = w => {
    const g = graphemes(w);
    if (g.length > 2 && base(g[0]) === 'ا' && base(g[1]) === 'ل') return { g: g[2], i: 2, all: g };
    return { g: g[0], i: 0, all: g };
  };

  /* 4) مولّدات الأسئلة */
  const pool = u => u.i.filter(x => x && x[0]);
  const SPK = it => [it[0], it[2] || 'ar'];
  const WAQF = w => /[\u064B-\u0650\u0652]$/.test(w) || /[^\u0621-\u064A\u064B-\u0652\u0670]/.test(w) ? w : w + '\u0652';
  const SPKW = it => (it[2] || 'ar') === 'ar' ? [WAQF(it[0]), 'ar'] : SPK(it);
  const exOf = it => [`الصَّحِيحُ: ${it[0]} ${isPic(it[1]) ? it[1] : '— ' + it[1]}`, `اِسْتَمِعْ 🔊 ثُمَّ انْظُرْ: ${it[0]} ⟵ ${it[1]}`];
  const others = (u, it, f) => shuf(pool(u).filter(x => x !== it && (f ? f(x) : true)));
  const mkQ = (k, show, opts, okIdx, extra) => Object.assign({ k, m: 0, l: 'ar', show, opts: opts.map((h, i) => ({ h, ok: i === okIdx })), ex: ['', ''] }, extra || {});

  function mcq(it, show, right, wrongs, extra) {
    const uniq = typeof window.uniqueOpts === 'function'
      ? uniqueOpts(right, wrongs, x => x, 4)
      : shuf([right, ...wrongs.filter(w => w !== right)].filter((x, i, a) => a.indexOf(x) === i).slice(0, 4));
    if (uniq.length < 2) return null;
    return mkQ(it[0], show, uniq, uniq.indexOf(right), Object.assign({ ex: exOf(it) }, extra));
  }

  const Q = {
    pic(u, it) {
      if (!isPic(it[1])) return null;
      const prompt = /sound|يفعل|أصوات|اصوات/i.test(strip(u && u.n || ''))
        ? (u.l === 'en' ? 'What sound does it make? — مَاذَا يَقُولُ هَذَا الْحَيَوَانُ؟' : 'مَاذَا يَفْعَلُ هَذَا الْحَيَوَانُ؟')
        : /\s/.test(String(it[0]).trim()) ? 'أَيُّ جُمْلَةٍ تُنَاسِبُ الصُّورَةَ؟' : 'مَا اسْمُ هَذِهِ الصُّورَةِ؟';
      return mcq(it, `<div class=q>${it[1]}</div><p class=mut>${prompt}</p>`, it[0], others(u, it, x => x[0] !== it[0]).map(x => x[0]));
    },
    listenPic(u, it) {
      if (!isPic(it[1])) return null;
      return mcq(it, `<div class=q>🔊</div><p class=mut>اِسْتَمِعْ ثُمَّ اخْتَرِ الصُّورَةَ</p>`, it[1], others(u, it, x => x[1] !== it[1] && isPic(x[1])).map(x => x[1]), { sp: SPK(it), m: 1 });
    },
    meaning(u, it) {
      return mcq(it, `<div class=q>${esc(it[0])}</div><p class=mut>${isPic(it[1]) ? 'أَيْنَ صُورَتُهَا؟' : 'مَا مَعْنَاهَا؟'}</p>`, it[1], others(u, it, x => strip(x[1]) !== strip(it[1])).map(x => x[1]), { sp: SPK(it), m: 2 });
    },
    reverse(u, it) {
      if (isPic(it[1])) return null;
      return mcq(it, `<div class=q style="font-size:1.35rem">${esc(it[1])}</div><p class=mut>اخْتَرِ الْكَلِمَةَ الْمُنَاسِبَةَ</p>`, it[0], others(u, it, x => strip(x[1]) !== strip(it[1])).map(x => x[0]));
    },
    listenWord(u, it) {
      return mcq(it, `<div class=q>🔊</div><p class=mut>اِسْتَمِعْ، ثُمَّ اخْتَرِ الْكَلِمَةَ الَّتِي سَمِعْتَهَا</p>`, it[0], others(u, it, x => x[0] !== it[0]).map(x => x[0]), { sp: SPK(it), m: 1 });
    },
    first(u, it) {
      const w = it[0];
      if (/\s/.test(w)) return null;
      const f = firstG(w);
      if (!f.g) return null;
      const right = base(f.g);
      return mcq(it, `<div class=q>${isPic(it[1]) ? it[1] : esc(w)}</div><p class=mut>بِأَيِّ حَرْفٍ تَبْدَأُ كَلِمَةُ «${esc(w)}»${f.i ? ' بَعْدَ «ال»' : ''}؟</p>`, right, distract(right).map(base), {
        sp: SPK(it),
        ex: [`«${w}» تَبْدَأُ بِحَرْفِ ${right}`, `انْظُرْ إِلَى أَوَّلِ الْكَلِمَةِ${f.i ? ' بَعْدَ ال' : ''}: ${right}`]
      });
    },
    missing(u, it) {
      const w = it[0];
      if (/\s/.test(w)) return null;
      const g = graphemes(w);
      if (g.length < 3) return null;
      const i = 1 + Math.floor(Math.random() * (g.length - 1));
      const right = g[i];
      const shown = g.map((x, j) => (j === i ? '<i class=gap>؟</i>' : `<span>${x}</span>`)).join('');
      return mcq(it, `<div class=q>${isPic(it[1]) ? it[1] : ''}</div><div class=spell dir=rtl>${shown}</div><p class=mut>مَا الْحَرْفُ النَّاقِصُ؟</p>`, right, distract(right), {
        sp: SPKW(it),
        ex: [`الْكَلِمَةُ كَامِلَةً: ${w} — الْحَرْفُ النَّاقِصُ: ${right}`, `اسْتَمِعْ جَيِّدًا: ${w}`]
      });
    },
    build(u, it) {
      const w = it[0];
      if (/\s/.test(w)) return null;
      const g = graphemes(w);
      if (g.length < 2 || g.length > 8) return null;
      return {
        k: w, m: 4, l: 'ar', sp: SPKW(it), w: 'build',
        tiles: shuf([...g, ...(g.length < 5 ? distract(g[1], 1) : [])]),
        target: g, hint: isPic(it[1]) ? it[1] : '',
        ex: [`الْكَلِمَةُ: ${w}`, `ابْدَأْ بِالْحَرْفِ ${g[0]} ثُمَّ ${g[1]}`]
      };
    },
    shadda(u, it) {
      const g = graphemes(it[0]);
      const i = g.findIndex(x => x.includes('ّ'));
      if (i < 0) return null;
      return mcq(it, `<div class=q>${isPic(it[1]) ? it[1] : ''}</div><div class=q>${esc(it[0])}</div><p class=mut>أَيُّ حَرْفٍ عَلَيْهِ شَدَّةٌ؟</p>`, base(g[i]), g.filter((_, j) => j !== i).map(base), {
        sp: SPK(it),
        ex: [`الشَّدَّةُ عَلَى حَرْفِ ${base(g[i])} فِي «${it[0]}»`, `الشَّدَّةُ تَعْنِي الْحَرْفَ مُكَرَّرًا: ${base(g[i])}${base(g[i])}`]
      });
    },
    madd(u, it) {
      const g = graphemes(it[0]);
      const i = g.findIndex((x, j) => j > 0 && /^[اوي]$/.test(x));
      if (i < 0) return null;
      return mcq(it, `<div class=q>${isPic(it[1]) ? it[1] : ''} ${esc(it[0])}</div><p class=mut>مَا حَرْفُ الْمَدِّ فِي الْكَلِمَةِ؟</p>`, g[i], ['ا', 'و', 'ي'].filter(x => x !== g[i]).concat(['ب']), {
        sp: SPK(it),
        ex: [`حَرْفُ الْمَدِّ فِي «${it[0]}» هُوَ ${g[i]}`, `الْمَدُّ يُطِيلُ الصَّوْتَ: ${it[0]}`]
      });
    },
    classify(u, it) {
      const L = [...new Set(pool(u).map(label).filter(Boolean))];
      const r = label(it);
      if (!r || L.length < 2) return null;
      const o = L.length > 4 ? shuf([r, ...shuf(L.filter(x => x !== r)).slice(0, 3)]) : shuf(L);
      return mkQ(it[0], `<div class=q>${esc(it[0])}</div><p class=mut>اخْتَرِ التَّصْنِيفَ الصَّحِيحَ</p>`, o, o.indexOf(r), {
        sp: SPK(it),
        ex: [`«${it[0]}»: ${it[1]}`, `اسْتَمِعْ جَيِّدًا: ${it[0]} — ${r}`]
      });
    },
    pickClass(u, it) {
      const r = label(it);
      if (!r) return null;
      const wr = others(u, it, x => label(x) && label(x) !== r).map(x => x[0]).slice(0, 3);
      if (wr.length < 2) return null;
      return mcq(it, `<div class=q style="font-size:1.35rem">أَيُّ كَلِمَةٍ: ${r}؟</div>`, it[0], wr, {
        ex: [`«${it[0]}»: ${r}`, `انْظُرْ جَيِّدًا إِلَى «${it[0]}»`]
      });
    },
    afterAl(u, it) {
      const f = firstG(it[0]);
      if (!f.i) return null;
      const right = base(f.g);
      return mcq(it, `<div class=q>${isPic(it[1]) ? it[1] : ''} ${esc(it[0])}</div><p class=mut>مَا الْحَرْفُ الَّذِي يَأْتِي بَعْدَ «ال»؟</p>`, right, distract(right).map(base), {
        sp: SPK(it),
        ex: [`بَعْدَ «ال» حَرْفُ ${right}`, `اسْتَمِعْ: ${it[0]}`]
      });
    },
    haraka(u, it) {
      const all = pool(u).map(x => x[0]);
      return mcq(it, `<div class=q>🔊</div><p class=mut>اِسْتَمِعْ، ثُمَّ اخْتَرْ مَا سَمِعْتَ</p>`, it[0], shuf(all.filter(x => x !== it[0])), {
        sp: SPK(it), m: 1,
        ex: [`سَمِعْتَ ${it[0]}: ${it[1]}`, `اِسْتَمِعْ مَرَّةً أُخْرَى: ${it[0]}`]
      });
    },
    count(u, it) {
      if (!/🍎|⭐|🍏/.test(it[1])) return null;
      return mcq(it, `<div class="q vq-obs">${it[1]}</div><p class=mut>كَمْ عَدَدُهَا؟</p>`, it[0], others(u, it).map(x => x[0]), { sp: null });
    },
    num2word(u, it) {
      return mcq(it, `<div class=q>${esc(it[1])}</div><p class=mut>اخْتَرِ اسْمَ الْعَدَدِ</p>`, it[0], others(u, it).map(x => x[0]));
    },
    order(u) {
      const P0 = pool(u);
      if (P0.length < 4) return null;
      const s = Math.floor(Math.random() * (P0.length - 3));
      const seq = P0.slice(s, s + 4).map(x => x[0]);
      return {
        k: 'ord:' + u.id, m: 5, l: 'ar', w: 'order',
        tiles: shuf(seq), target: seq,
        title: 'رَتِّبْ بِالتَّرْتِيبِ الصَّحِيحِ',
        ex: [`التَّرْتِيبُ: ${seq.join('، ')}`, `ابْدَأْ بـ «${seq[0]}»`]
      };
    },
    next(u, it) {
      const P0 = pool(u), i = P0.indexOf(it);
      if (i < 0 || i >= P0.length - 1) return null;
      const r = P0[i + 1][0];
      return mcq(it, `<div class=q>${esc(it[0])}</div><p class=mut>مَا الَّذِي يَأْتِي بَعْدَهُ؟</p>`, r, P0.filter(x => x[0] !== r && x !== it).map(x => x[0]), {
        sp: SPK(it),
        ex: [`بَعْدَ «${it[0]}» يَأْتِي «${r}»`, `التَّرْتِيبُ: ${P0.map(x => x[0]).join('، ')}`]
      });
    },
    sentence(u, it) {
      const ws = it[0].split(/\s+/).filter(Boolean);
      if (ws.length < 2 || ws.length > 7) return null;
      return {
        k: it[0], m: 5, l: 'ar', sp: SPK(it), w: 'order',
        tiles: shuf(ws), target: ws, hint: isPic(it[1]) ? it[1] : '',
        title: 'رَتِّبِ الْكَلِمَاتِ لِتُكَوِّنَ جُمْلَةً',
        ex: [`الْجُمْلَةُ: ${it[0]}`, `تَبْدَأُ الْجُمْلَةُ بـ «${ws[0]}»`]
      };
    },
    missWord(u, it) {
      const ws = it[0].split(/\s+/);
      if (ws.length < 3) return null;
      const i = 1 + Math.floor(Math.random() * (ws.length - 1));
      const r = ws[i];
      const wr = shuf(pool(u).flatMap(x => x[0].split(/\s+/)).filter(w => strip(w) !== strip(r)));
      return mcq(it, `<div class=q style="font-size:1.35rem">${isPic(it[1]) ? it[1] + '<br>' : ''}${ws.map((w, j) => (j === i ? '<i class=gap>…</i>' : esc(w))).join(' ')}</div><p class=mut>أَكْمِلِ الْجُمْلَةَ</p>`, r, wr, {
        ex: [`الْجُمْلَةُ: ${it[0]}`, `اسْتَمِعْ: ${it[0]}`],
        sp: null
      });
    },
    verb(u, it) {
      const ws = it[0].split(/\s+/);
      return mcq(it, `<div class=q style="font-size:1.35rem">${esc(it[0])}</div><p class=mut>مَا الْفِعْلُ فِي الْجُمْلَةِ؟</p>`, ws[0], ws.slice(1), {
        sp: SPK(it),
        ex: [`الْفِعْلُ: ${ws[0]} (يَدُلُّ عَلَى حَدَثٍ)`, `الْفِعْلُ فِي أَوَّلِ الْجُمْلَةِ الْفِعْلِيَّةِ: ${ws[0]}`]
      });
    },
    subject(u, it) {
      const ws = it[0].split(/\s+/);
      if (ws.length < 2) return null;
      return mcq(it, `<div class=q style="font-size:1.35rem">${esc(it[0])}</div><p class=mut>مَنِ الَّذِي قَامَ بِالْفِعْلِ (الْفَاعِلُ)؟</p>`, ws[1], [ws[0], ...ws.slice(2)], {
        sp: SPK(it),
        ex: [`الْفَاعِلُ: ${ws[1]} — هُوَ الَّذِي ${ws[0]}`, `اسْأَلْ: مَنْ ${ws[0]}؟`]
      });
    },
    object(u, it) {
      const r = String(it[1]).split(/\s+/)[0];
      const ws = it[0].split(/\s+/);
      const exact = ws.find(w => strip(w) === strip(r));
      if (!exact) return null;
      return mcq(it, `<div class=q style="font-size:1.35rem">${esc(it[0])}</div><p class=mut>مَا الْمَفْعُولُ بِهِ؟</p>`, exact, ws.filter(w => strip(w) !== strip(r)), {
        sp: SPK(it),
        ex: [`الْمَفْعُولُ بِهِ: ${r} — وَقَعَ عَلَيْهِ الْفِعْلُ`, `اسْأَلْ: مَاذَا ${ws[0]}؟`]
      });
    },
    segment(u, it) {
      return mcq(it, `<div class=q>${esc(it[0])}</div><p class=mut>كَيْفَ نُقَطِّعُ هَذِهِ الْكَلِمَةَ؟</p>`, it[1], others(u, it).map(x => x[1]), { sp: SPK(it) });
    }
  };

  const PLAN = {
    vocab: ['pic', 'listenPic', 'first', 'missing', 'build'],
    letters: ['first', 'listenPic', 'missing', 'pic'],
    build: ['build', 'missing', 'listenPic', 'first'],
    haraka: ['haraka', 'meaning', 'reverse'],
    syll: ['haraka', 'meaning', 'reverse'],
    segment: ['segment', 'build', 'listenWord'],
    madd: ['madd', 'build', 'listenPic', 'missing'],
    shadda: ['shadda', 'build', 'listenPic', 'pic'],
    similar: ['first', 'meaning', 'listenWord'],
    count: ['count', 'reverse', 'listenWord'],
    numbers: ['num2word', 'reverse', 'listenWord', 'order'],
    sequence: ['order', 'next', 'meaning'],
    sentence: ['sentence', 'missWord', 'meaning'],
    verbsubj: ['verb', 'subject', 'sentence'],
    object: ['object', 'sentence', 'missWord'],
    classify: ['classify', 'pickClass', 'listenWord', 'classify'],
    alpic: ['listenPic', 'afterAl', 'pic', 'build'],
    desc: ['meaning', 'reverse', 'listenWord']
  };

  function build(u, n = 5) {
    const t = typeOf(u);
    const plan = PLAN[t] || PLAN.vocab;
    const items = shuf(pool(u));
    const out = [];
    let k = 0, guard = 0;
    while (out.length < n && guard++ < 65) {
      const g = Q[plan[k % plan.length]];
      const it = items[out.length % items.length];
      k++;
      let q0 = null;
      try { q0 = g && g(u, it); } catch { q0 = null; }
      if (q0 && !out.some(x => x.w === 'order' && q0.w === 'order' && x.k === q0.k)) out.push(q0);
    }
    while (out.length < n && items.length >= 2) {
      const it = items[out.length % items.length];
      const m0 = Q.meaning(u, it) || Q.listenWord(u, it);
      if (!m0) break;
      out.push(m0);
    }
    return out;
  }

  window.ArLessonQuiz = build;

  /* 5) ربط التمارين بالاختبار الموحد */
  const isArLesson = c => !!(c && c.id && /^\d+-\d+$/.test(c.id) && c.l === 'ar' && c.i && c.i.length >= 2 && !c.qs && !c.mk);
  const wHTML = x => {
    const title = x.w === 'build' ? 'رَكِّبِ الْكَلِمَةَ: اضْغَطِ الْحُرُوفَ بِالتَّرْتِيبِ' : x.title;
    return `<p class="mut w-title">${title}</p>${x.hint ? `<div class=q>${x.hint}</div>` : ''}<div class="ans-row ${x.w}" id=ansr dir=rtl></div><div class="tiles ${x.w}" id=tls dir=rtl>${x.tiles.map((t, i) => `<button class=tile data-i=${i}>${esc(t)}</button>`).join('')}</div><div class=w-act><button class=alt id=wclr>↩︎ تراجع</button></div>`;
  };
  function bindTiles(x) {
    const ans = [], A = document.getElementById('ansr'), T = document.getElementById('tls'), U = document.getElementById('wclr');
    if (!A || !T) return;
    const draw = () => {
      A.innerHTML = ans.map(i => `<button class="tile on" data-a=${i}>${esc(x.tiles[i])}</button>`).join('') || '<span class=mut>…</span>';
      T.querySelectorAll('.tile').forEach(b => { b.disabled = ans.includes(+b.dataset.i); });
    };
    let done = false;
    const check = () => {
      if (done) return;
      done = true;
      const got = ans.map(i => x.tiles[i]);
      const ok = got.length === x.target.length && got.every((g, i) => strip(g) === strip(x.target[i]));
      A.classList.add(ok ? 'ok' : 'no');
      T.querySelectorAll('.tile').forEach(b => { b.disabled = true; });
      if (U) U.disabled = true;
      if (!ok) A.insertAdjacentHTML('afterend', `<div class="ans-row ok sol" dir=rtl>${x.target.map(t => `<span class="tile on">${esc(t)}</span>`).join('')}</div>`);
      window.__chosen = got.join(x.w === 'build' ? '' : ' ');
      window.rec && rec(x, ok);
    };
    T.onclick = e => {
      const b = e.target.closest('.tile');
      if (!b || b.disabled || done) return;
      ans.push(+b.dataset.i);
      draw();
      if (ans.length === x.target.length) setTimeout(check, 240);
    };
    A.onclick = e => {
      const b = e.target.closest('.tile');
      if (!b || done) return;
      const i = ans.indexOf(+b.dataset.a);
      if (i >= 0) { ans.splice(i, 1); draw(); }
    };
    if (U) U.onclick = () => { if (!done) { ans.pop(); draw(); } };
    draw();
  }

  /* 6) مقدمة الدرس */
  const GOAL = {
    vocab: 'سَنَتَعَلَّمُ كَلِمَاتٍ جَدِيدَةً بِالصُّوَرِ، ثُمَّ نَتَدَرَّبُ عَلَى قِرَاءَتِهَا وَتَرْكِيبِهَا.',
    letters: 'سَنَتَعَرَّفُ عَلَى حُرُوفٍ جَدِيدَةٍ، وَنَسْمَعُ كَلِمَاتٍ تَبْدَأُ بِهَا.',
    build: 'سَنَقْرَأُ كَلِمَاتٍ قَصِيرَةً، ثُمَّ نُرَكِّبُهَا حَرْفًا حَرْفًا.',
    haraka: 'سَنَسْمَعُ الْحَرَكَاتِ، وَنُفَرِّقُ بَيْنَ الْفَتْحَةِ وَالضَّمَّةِ وَالْكَسْرَةِ وَالسُّكُونِ وَالشَّدَّةِ.',
    syll: 'سَنَتَعَرَّفُ عَلَى الْمَقَاطِعِ الْقَصِيرَةِ وَالطَّوِيلَةِ.',
    segment: 'سَنُقَطِّعُ الْكَلِمَاتِ إِلَى مَقَاطِعَ، ثُمَّ نُرَكِّبُهَا.',
    madd: 'سَنَتَعَلَّمُ حُرُوفَ الْمَدِّ: الْأَلِفَ وَالْوَاوَ وَالْيَاءَ.',
    shadda: 'سَنَتَعَلَّمُ الشَّدَّةَ، وَنَعْرِفُ عَلَى أَيِّ حَرْفٍ تَكُونُ.',
    similar: 'سَنُفَرِّقُ بَيْنَ الْحُرُوفِ الْمُتَشَابِهَةِ بِعَدَدِ النِّقَاطِ وَمَكَانِهَا.',
    count: 'سَنَعُدُّ مَعًا مِنْ وَاحِدٍ إِلَى خَمْسَةٍ.',
    numbers: 'سَنَتَعَلَّمُ أَسْمَاءَ الْأَعْدَادِ وَتَرْتِيبَهَا.',
    sequence: 'سَنَتَعَلَّمُ الْأَسْمَاءَ وَتَرْتِيبَهَا الصَّحِيحَ.',
    sentence: 'سَنَقْرَأُ جُمَلًا مُفِيدَةً، ثُمَّ نُرَتِّبُ كَلِمَاتِهَا.',
    verbsubj: 'سَنَعْرِفُ الْفِعْلَ وَالْفَاعِلَ فِي الْجُمْلَةِ.',
    object: 'سَنَعْرِفُ الْمَفْعُولَ بِهِ فِي الْجُمْلَةِ.',
    classify: 'سَنَتَعَلَّمُ الْقَاعِدَةَ، ثُمَّ نُصَنِّفُ الْكَلِمَاتِ بِحَسَبِهَا.',
    alpic: 'سَنَسْمَعُ كَيْفَ تُنْطَقُ «ال» قَبْلَ الْكَلِمَاتِ.',
    desc: 'سَنَتَعَلَّمُ الْكَلِمَاتِ وَمَعَانِيَهَا.'
  };
  window.lessonIntro = c => {
    c = c || window.cur;
    if (!c || !c.n) return '';
    const t = typeOf(c);
    const g = GOAL[t] || 'سَنَتَعَلَّمُ شَيْئًا جَدِيدًا.';
    return c.l === 'ar'
      ? `دَرْسُ: ${c.n}. ${g} اضْغَطْ عَلَى كُلِّ بِطَاقَةٍ لِتَسْمَعَ، ثُمَّ ابْدَأِ الِاخْتِبَارَ.`
      : `دَرْسُ: ${c.n}. سَنَتَعَلَّمُ كَلِمَاتٍ إِنْجِلِيزِيَّةً جَدِيدَةً. اضْغَطْ عَلَى كُلِّ بِطَاقَةٍ لِتَسْمَعَ، ثُمَّ ابْدَأِ الِاخْتِبَارَ.`;
  };

  window.ArLessonTypes = { TYPE, PLAN, Q, label, graphemes, typeOf, isArLesson, wHTML, bindTiles };
})();
