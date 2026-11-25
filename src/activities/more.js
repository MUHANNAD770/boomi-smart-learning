/* /src/activities/more.js — أنشطة لغوية إضافية (الحرف الأول، الأضداد، الأنماط، المختلف، أيام الأسبوع، الكلمة والصورة) */
(() => {
  'use strict';
  if (!window.AC) return;
  const { MN, q5, opts, back, pk, R, sh, ad } = AC;
  const stripD0 = s => String(s || '').replace(/[\u064B-\u0652\u0670\u0640]/g, '');

  const FIRST_POOL = [
    ['أَسَدٌ', '🦁', 'أ'], ['بَطَّةٌ', '🦆', 'ب'], ['تُفَّاحٌ', '🍎', 'ت'], ['ثَعْلَبٌ', '🦊', 'ث'],
    ['جَمَلٌ', '🐪', 'ج'], ['حِصَانٌ', '🐴', 'ح'], ['خَرُوفٌ', '🐑', 'خ'], ['دُبٌّ', '🐻', 'د'],
    ['ذُرَةٌ', '🌽', 'ذ'], ['رُمَّانٌ', '🍎', 'ر'], ['زَرَافَةٌ', '🦒', 'ز'], ['سَمَكَةٌ', '🐟', 'س'],
    ['شَمْسٌ', '☀️', 'ش'], ['صَقْرٌ', '🦅', 'ص'], ['ضِفْدَعٌ', '🐸', 'ض'], ['طَائِرٌ', '🐦', 'ط'],
    ['عُصْفُورٌ', '🐤', 'ع'], ['غَزَالٌ', '🦌', 'غ'], ['فِيلٌ', '🐘', 'ف'], ['قَمَرٌ', '🌙', 'ق'],
    ['كَلْبٌ', '🐶', 'ك'], ['لَيْمُونٌ', '🍋', 'ل'], ['مَوْزٌ', '🍌', 'م'], ['نَحْلَةٌ', '🐝', 'ن'],
    ['هِلَالٌ', '🌙', 'ه'], ['وَرْدَةٌ', '🌹', 'و'], ['يَمَامَةٌ', '🕊️', 'ي']
  ];
  const AR_ABJ = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي'.split('');

  window.aFirst = () => {
    window.V = 'lesson';
    q5('🔤 بِأَيِّ حَرْفٍ تَبْدَأُ الْكَلِمَةُ؟', () => {
      const it = pk(FIRST_POOL);
      return {
        q: `<div class=ac-big style="font-size:84px;-webkit-text-stroke:0">${it[1]}</div><p class=mut>${it[0]}</p>`,
        o: opts(it[2], AR_ABJ),
        say: it[0],
        sayL: 'ar'
      };
    }, 'aFirst');
  };

  const OPP = [
    ['كَبِيرٌ', 'صَغِيرٌ'], ['طَوِيلٌ', 'قَصِيرٌ'], ['سَعِيدٌ', 'حَزِينٌ'], ['سَرِيعٌ', 'بَطِيءٌ'],
    ['لَيْلٌ', 'نَهَارٌ'], ['بَارِدٌ', 'حَارٌّ'], ['مَفْتُوحٌ', 'مُغْلَقٌ'], ['نَظِيفٌ', 'مُتَّسِخٌ'],
    ['قَرِيبٌ', 'بَعِيدٌ'], ['خَفِيفٌ', 'ثَقِيلٌ'], ['قَوِيٌّ', 'ضَعِيفٌ'], ['جَدِيدٌ', 'قَدِيمٌ']
  ];

  window.aOpp = () => {
    window.V = 'lesson';
    const allWords = OPP.flatMap(x => x);
    q5('↔️ مَا ضِدُّ هَذِهِ الْكَلِمَةِ؟', () => {
      const p = pk(OPP), rev = Math.random() < 0.5;
      const askW = rev ? p[1] : p[0], ansW = rev ? p[0] : p[1];
      return {
        q: `<div class=q>مَا ضِدُّ: <b>${askW}</b>؟</div>`,
        o: opts(ansW, allWords.filter(w => stripD0(w) !== stripD0(askW))),
        say: 'مَا ضِدُّ كَلِمَةِ ' + askW,
        sayL: 'ar'
      };
    }, 'aOpp');
  };

  window.aPat = () => {
    window.V = 'lesson';
    q5('🧩 مَا الرَّمْزُ التَّالِي فِي النَّمَطِ؟', () => {
      const E = sh(['🍎', '⭐', '🐟', '🚗', '🔵', '🌸', '🐱', '⚽']);
      const a = E[0], b = E[1], c = E[2], d = E[3];
      const T = [[a, b, a, b, a, b], [a, a, b, a, a, b], [a, b, b, a, b, b], [a, b, c, a, b, c]];
      const s = pk(T), ans = s[5];
      return {
        q: `<div class=q>${s.slice(0, 5).join(' ')} ❓</div>`,
        o: opts(ans, [a, b, c, d])
      };
    }, 'aPat');
  };

  const GROUPS = [
    ['فواكه', ['🍎 تُفَّاحٌ', '🍌 مَوْزٌ', '🍇 عِنَبٌ', '🍊 بُرْتُقَالٌ']],
    ['حيوانات', ['🦁 أَسَدٌ', '🐘 فِيلٌ', '🐪 جَمَلٌ', '🐱 قِطَّةٌ']],
    ['مواصلات', ['🚗 سَيَّارَةٌ', '🚌 حَافِلَةٌ', '🚆 قِطَارٌ', '✈️ طَائِرَةٌ']],
    ['أدوات مدرسية', ['📖 كِتَابٌ', '✏️ قَلَمٌ', '🎒 حَقِيبَةٌ', '📏 مِسْطَرَةٌ']],
    ['سماء وطبيعة', ['☀️ شَمْسٌ', '🌙 قَمَرٌ', '⭐ نَجْمَةٌ', '☁️ غَيْمَةٌ']]
  ];

  window.aOdd = () => {
    window.V = 'lesson';
    q5('🔍 أَيُّهَا الْمُخْتَلِفُ؟', () => {
      const [g1, g2] = sh(GROUPS).slice(0, 2);
      const same3 = sh(g1[1]).slice(0, 3);
      const odd = pk(g2[1]);
      return {
        q: '<p class=mut>ثَلَاثُ كَلِمَاتٍ مِنْ مَجْمُوعَةٍ وَاحِدَةٍ وَوَاحِدَةٌ مُخْتَلِفَةٌ:</p>',
        o: opts(odd, same3)
      };
    }, 'aOdd');
  };

  const DAYS = [
    ['الأَحَدُ', 'Sunday'], ['الاِثْنَيْنُ', 'Monday'], ['الثُّلَاثَاءُ', 'Tuesday'],
    ['الأَرْبِعَاءُ', 'Wednesday'], ['الْخَمِيسُ', 'Thursday'], ['الْجُمُعَةُ', 'Friday'], ['السَّبْتُ', 'Saturday']
  ];

  window.aDays = () => {
    window.V = 'lesson';
    const isEn = window.P && P.lang === 'en';
    const labels = DAYS.map(d => isEn ? d[1] : d[0]);
    q5('📅 أَيَّامُ الْأُسْبُوعِ', () => {
      const i = R(0, DAYS.length - 1), nx = (i + 1) % DAYS.length;
      return {
        q: `<div class=q dir=auto>${isEn ? `What day comes after <b>${DAYS[i][1]}</b>?` : `مَا الْيَوْمُ الَّذِي يَأْتِي بَعْدَ <b>${DAYS[i][0]}</b>؟`}</div>`,
        o: opts(labels[nx], labels.filter((_, k) => k !== i)),
        say: isEn ? `After ${DAYS[i][1]}` : `بَعْدَ يَوْمِ ${DAYS[i][0]}`,
        sayL: isEn ? 'en' : 'ar'
      };
    }, 'aDays');
  };

  const EN_PICS = [
    ['Apple', '🍎'], ['Banana', '🍌'], ['Cat', '🐱'], ['Dog', '🐶'], ['Elephant', '🐘'],
    ['Fish', '🐟'], ['Sun', '☀️'], ['Moon', '🌙'], ['Book', '📖'], ['Pen', '✏️'],
    ['Car', '🚗'], ['House', '🏠'], ['Tree', '🌳'], ['Flower', '🌸'], ['Star', '⭐'],
    ['Bird', '🐦'], ['Duck', '🦆'], ['Lion', '🦁'], ['Ball', '⚽'], ['Cup', '☕']
  ];

  window.aEnPic = () => {
    window.V = 'lesson';
    q5('🖼️ Picture & English Word', () => {
      const it = pk(EN_PICS);
      return {
        q: `<div class=ac-big style="font-size:86px;-webkit-text-stroke:0">${it[1]}</div>`,
        o: opts(it[0], EN_PICS.map(x => x[0])),
        say: it[0],
        sayL: 'en'
      };
    }, 'aEnPic');
  };

  MN.push(
    ['🔤', 'بأي حرف تبدأ الكلمة؟', 'aFirst'],
    ['↔️', 'لعبة الأضداد بالعربية', 'aOpp'],
    ['🔍', 'استخرج الكلمة المختلفة', 'aOdd'],
    ['🧩', 'أكمل النمط البصري', 'aPat'],
    ['📅', 'أيام الأسبوع (عربي/إنجليزي)', 'aDays'],
    ['🖼️', 'الصورة والكلمة بالإنجليزية', 'aEnPic']
  );
})();
