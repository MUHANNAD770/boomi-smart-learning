/* /src/activities/activities2.js — الألوان والأشكال (عربي/إنجليزي) + الحركات + حروف العربية */
(() => {
  'use strict';
  if (!window.AC) return;
  const { MN, q5, pal, pad, tracer, back, good, star, sh, R, COL } = AC;
  const FA = '900 230px "Baloo Bhaijaan 2",Tahoma,Arial,sans-serif';

  const CL = [
    ['Red', 'أَحْمَرُ', '#e53935'], ['Blue', 'أَزْرَقُ', '#1e88e5'], ['Yellow', 'أَصْفَرُ', '#fdd835'],
    ['Green', 'أَخْضَرُ', '#43a047'], ['Orange', 'بُرْتُقَالِيٌّ', '#fb8c00'], ['Purple', 'بَنَفْسَجِيٌّ', '#8e24aa'],
    ['Pink', 'وَرْدِيٌّ', '#f48fb1'], ['Brown', 'بُنِّيٌّ', '#795548'], ['Black', 'أَسْوَدُ', '#212121'],
    ['White', 'أَبْيَضُ', '#ffffff'], ['Gray', 'رَمَادِيٌّ', '#9e9e9e']
  ];

  const SP = [
    ['Circle', 'دَائِرَةٌ', '<circle cx="50" cy="50" r="40"/>'],
    ['Square', 'مُرَبَّعٌ', '<rect x="15" y="15" width="70" height="70"/>'],
    ['Rectangle', 'مُسْتَطِيلٌ', '<rect x="8" y="28" width="84" height="44"/>'],
    ['Triangle', 'مُثَلَّثٌ', '<polygon points="50,10 92,88 8,88"/>'],
    ['Oval', 'بَيْضَاوِيٌّ', '<ellipse cx="50" cy="50" rx="42" ry="26"/>'],
    ['Diamond', 'مُعَيَّنٌ', '<polygon points="50,6 94,50 50,94 6,50"/>'],
    ['Star', 'نَجْمَةٌ', '<polygon points="50,6 61,38 95,38 67,58 78,92 50,71 22,92 33,58 5,38 39,38"/>'],
    ['Heart', 'قَلْبٌ', '<path d="M50 88C10 56 6 28 28 20 40 16 48 24 50 32 52 24 60 16 72 20 94 28 90 56 50 88Z"/>'],
    ['Hexagon', 'سُدَاسِيٌّ', '<polygon points="28,12 72,12 96,50 72,88 28,88 4,50"/>']
  ];

  const sv = (i, c, z = 84) => `<svg viewBox="0 0 100 100" width="${z}" height="${z}" fill="${c}" stroke="#263238" stroke-width="4" stroke-linejoin="round">${SP[i][2]}</svg>`;

  const no = (a, i, f) => {
    const arr = window.uniqueOpts ? uniqueOpts(a[i], a, f, 4) : (() => {
      const s = new Set([i]);
      while (s.size < Math.min(4, a.length)) s.add(R(0, a.length - 1));
      return sh([...s]).map(k => a[k]);
    })();
    return arr.map(x => ({ t: f(x), ok: f(x) === f(a[i]) }));
  };

  const nm = (x, lg) => lg === 'ar' ? x[1] : x[0];
  const sf = lg => lg === 'ar' ? 'Ar' : 'En';
  const dr = lg => lg === 'ar' ? '' : ' dir=ltr';

  /* الألوان */
  function aCol(lg) {
    window.V = 'lesson';
    h(`<section class=sec>${back()}<h2>${lg === 'ar' ? '🌈 الْأَلْوَانُ' : '🎨 Colors'}</h2><p class=mut>اِضْغَطْ لَوْنًا لِتَسْمَعَ اسْمَهُ</p><div class=ac-sg${dr(lg)}>${CL.map(c => `<button onclick="say('${nm(c, lg)}','${lg}')"><i class=ac-sw style="background:${c[2]}"></i><b>${nm(c, lg)}</b></button>`).join('')}</div><button class=big onclick="aColQ${sf(lg)}()">🎯 اخْتَبِرْنِي</button></section>`);
  }
  const colQ = lg => q5(lg === 'ar' ? '🌈 مَا هَذَا اللَّوْنُ؟' : '🎨 Which color?', () => {
    const i = R(0, CL.length - 1);
    return { q: `<i class=ac-sw style="background:${CL[i][2]};width:120px;height:120px;display:block;margin:10px auto"></i>`, o: no(CL, i, c => nm(c, lg)) };
  }, 'aColQ' + sf(lg));

  /* الأشكال */
  function aShp(lg) {
    window.V = 'lesson';
    h(`<section class=sec>${back()}<h2>${lg === 'ar' ? '🔷 الْأَشْكَالُ' : '🔷 Shapes'}</h2><p class=mut>اِضْغَطْ شَكْلًا لِتَسْمَعَ اسْمَهُ</p><div class=ac-sg${dr(lg)}>${SP.map((s, i) => `<button onclick="say('${nm(s, lg)}','${lg}')">${sv(i, COL[i % 7])}<b>${nm(s, lg)}</b></button>`).join('')}</div><button class=big onclick="aShpQ${sf(lg)}()">🎯 اخْتَبِرْنِي</button></section>`);
  }
  const shpQ = lg => q5(lg === 'ar' ? '🔷 مَا اسْمُ هَذَا الشَّكْلِ؟' : '🔷 Which shape?', () => {
    const i = R(0, SP.length - 1);
    return { q: `<div class=ac-obs>${sv(i, COL[R(0, 6)], 120)}</div>`, o: no(SP, i, s => nm(s, lg)) };
  }, 'aShpQ' + sf(lg));

  ['En', 'Ar'].forEach(k => {
    const lg = k === 'Ar' ? 'ar' : 'en';
    window['aCol' + k] = () => aCol(lg);
    window['aColQ' + k] = () => colQ(lg);
    window['aShp' + k] = () => aShp(lg);
    window['aShpQ' + k] = () => shpQ(lg);
  });

  /* الحركات الثلاث */
  const HR = 'أ|أَسَدٌ🦁,أُذُنٌ👂,إِبْرِيقٌ🫖;ب|بَطَّةٌ🦆,بُرْتُقَالٌ🍊,بِطِّيخٌ🍉;ت|تَمْرٌ🌴,تُفَّاحٌ🍎,تِمْسَاحٌ🐊;ث|ثَوْرٌ🐂,ثُعْبَانٌ🐍,ثِيَابٌ👕;ج|جَمَلٌ🐪,جُبْنٌ🧀,جِيتَارٌ🎸;ح|حَلَزُونٌ🐌,حُوتٌ🐋,حِصَانٌ🐴;خ|خَرُوفٌ🐑,خُبْزٌ🍞,خِيَارٌ🥒;د|دَجَاجَةٌ🐔,دُبٌّ🐻,دِيكٌ🐓;ك|كَلْبٌ🐶,كُرَةٌ⚽,كِتَابٌ📖;ل|لَيْمُونٌ🍋,لُعْبَةٌ🧸,لِسَانٌ👅'.split(';').map(r => {
    const [l, w] = r.split('|');
    return [l, w.split(',').map(x => {
      const m = x.match(/^(.+?)(\p{Extended_Pictographic}.*)$/u);
      return [m[1], m[2]];
    })];
  });
  const HN = ['فَتْحَةٌ', 'ضَمَّةٌ', 'كَسْرَةٌ'];
  const MK = ['\u064E', '\u064F', '\u0650'];

  window.aHar = () => {
    window.V = 'lesson';
    h(`<section class=sec>${back()}<h2>فَ فُ فِ الْحَرَكَاتُ الثَّلَاثُ</h2><p class=mut>اخْتَرْ حَرْفًا</p><div class=grid>${HR.map((x, i) => `<button class=opt onclick="aHarP(${i})">${x[0]}${MK[0]}</button>`).join('')}</div><button class=big onclick="aHarQ()">🎯 اخْتَبِرْنِي</button></section>`);
  };

  window.aHarP = i => {
    window.V = 'lesson';
    const [L, W] = HR[i], n = HR.length, F = MK.map((m, k) => (L === 'أ' && k === 2 ? 'إِ' : L + m));
    h(`<section class=sec>${back('aHar')}<h2>${L}</h2>${pal()}<div class=ac-big id=acb>${L}</div><div class=ac-hv>${F.map((f, k) => `<button onclick="say('${f}','ar')"><b>${f}</b><small>${HN[k]}</small></button>`).join('')}</div><div class=ac-hv>${W.map(w => `<button onclick="say('${w[0]}','ar')"><span>${w[1]}</span><b>${w[0]}</b></button>`).join('')}</div><p class=mut>✍️ تَتَبَّعِ الْحَرْفَ</p>${pad()}<div class=ac-nav><button class=alt onclick="aHarP(${(i + n - 1) % n})">→ السَّابِقُ</button><button class=big onclick="aHarP(${(i + 1) % n})">التَّالِي ←</button></div></section>`);
    tracer(L, FA, () => { good(); star('h' + L); });
  };

  window.aHarQ = () => {
    window.V = 'lesson';
    const all = HR.flatMap(x => x[1]);
    q5('📖 اقْرَأْ وَأَجِبْ: مَا اسْمُ الصُّورَةِ؟', () => {
      const i = R(0, all.length - 1);
      return { q: `<div class=ac-big style="font-size:90px;-webkit-text-stroke:0">${all[i][1]}</div>`, o: no(all, i, w => w[0]) };
    }, 'aHarQ');
  };

  /* حروف العربية (تتبّع) */
  const AB = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي';
  const AN = 'أَلِف,بَاء,تَاء,ثَاء,جِيم,حَاء,خَاء,دَال,ذَال,رَاء,زَاي,سِين,شِين,صَاد,ضَاد,طَاء,ظَاء,عَيْن,غَيْن,فَاء,قَاف,كَاف,لَام,مِيم,نُون,هَاء,وَاو,يَاء'.split(',');

  window.aAbj = () => {
    window.V = 'lesson';
    h(`<section class=sec>${back()}<h2>🔤 الْحُرُوفُ الْعَرَبِيَّةُ</h2><p class=mut>اِضْغَطْ حَرْفًا لِتَسْمَعَهُ وَتَتَبَّعَهُ</p><div class=grid>${[...AB].map((c, i) => `<button class=opt onclick="aAbjP(${i})">${c}</button>`).join('')}</div></section>`);
  };

  window.aAbjP = i => {
    window.V = 'lesson';
    const c = AB[i], n = AB.length;
    h(`<section class=sec>${back('aAbj')}<h2>${c} · ${AN[i]}</h2>${pal()}<div class=ac-big id=acb>${c}</div><button class=alt onclick="say('${AN[i]}','ar')">🔊 اسْمَعْ</button><p class=mut>✍️ تَتَبَّعِ الْحَرْفَ</p>${pad()}<div class=ac-nav><button class=alt onclick="aAbjP(${(i + n - 1) % n})">→ السَّابِقُ</button><button class=big onclick="aAbjP(${(i + 1) % n})">التَّالِي ←</button></div></section>`);
    tracer(c, FA, () => { good(); star('a' + c); });
    try { say(AN[i], 'ar'); } catch (_) {}
  };

  MN.push(
    ['🌈', 'الألوان بالعربي', 'aColAr'],
    ['🎨', 'Colors بالإنجليزي', 'aColEn'],
    ['🔷', 'الأشكال بالعربي', 'aShpAr'],
    ['🔶', 'Shapes بالإنجليزي', 'aShpEn'],
    ['فَ', 'الحركات: فتحة وضمة وكسرة', 'aHar'],
    ['🔤', 'الحروف العربية (تتبّع)', 'aAbj']
  );
})();
