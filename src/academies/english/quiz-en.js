/* src/academies/english/quiz-en.js — أكاديمية اللغة الإنجليزية:
   • إزالة التكرار، استكمال الترجمة العربية، إضافة دروس القواعد والمحادثة المتدرّجة.
   • مولّد تمارين متنوع (الحرف الأول، الحرف الناقص، التهجئة، القافية، القواعد، ترتيب الجملة، المعنى، الاستماع) مع منع تكرار الخيارات. */
(() => {
  'use strict';
  if (typeof S === 'undefined' || !window.ArLessonTypes) return;
  const T = ArLessonTypes, Q = T.Q;
  const EMO = /\p{Extended_Pictographic}/u;
  const strip = s => String(s || '').replace(/[ً-ْٰ]/g, '');
  const isPic = v => EMO.test(String(v)) && String(v).replace(/[\p{Extended_Pictographic}\uFE0F\u200D\s]/gu, '').length === 0;
  const shuf = a => {
    const out = [...a];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const findId = id => {
    const a = +String(id).split('-')[0];
    return (S[a] && S[a].u.find(u => u.id === id)) || null;
  };

  /* 1) إزالة التكرار وضبط الكلمات */
  const swap = (id, from, to) => {
    const u = findId(id);
    if (!u) return;
    const i = u.i.findIndex(x => String(x[0]).toLowerCase() === from.toLowerCase());
    if (i >= 0) u.i[i] = [to[0], to[1], 'en'];
  };
  swap('1-42', 'Ice', ['Lemonade', '🍋']);
  swap('1-42', 'Juice', ['Smoothie', '🥤']);
  swap('1-57', 'Red', ['Pink', '🩷']);
  swap('3-0', 'Thank you', ['See you later', '👋']);
  swap('1-29', 'Cat', ['Van', '🚐']);
  swap('4-18', 'Map', ['Tent', '⛺']);
  swap('1-3', 'Orange', ['Otter', '🦦']);
  swap('1-3', 'Kite', ['Koala', '🐨']);
  swap('2-28', 'Duck', ['Rock', '🪨']);
  swap('2-28', 'Clock', ['Jacket', '🧥']);
  swap('2-27', 'Sheep', ['Shampoo', '🧴']);
  swap('2-27', 'Cheese', ['Chips', '🍟']);
  swap('2-27', 'Shell', ['Brush', '🖌️']);
  swap('1-31', 'Pot', ['Mop', '🧹']);
  swap('2-56', 'Flower', ['Branch', 'غُصْن']);
  swap('1-2', 'Goat', ['Gift', '🎁']);
  swap('1-2', 'Hat', ['Hippo', '🦛']);
  swap('2-29', 'Cake', ['Grape', '🍇']);
  swap('2-29', 'Bike', ['Smile', '😊']);
  swap('2-29', 'Moon', ['Boot', '👢']);
  swap('1-30', 'Pig', ['Bin', '🗑️']);
  swap('1-22', 'Violin', ['Volcano', '🌋']);
  swap('4-28', 'Forest', ['Earth', '🌍']);
  swap('2-27', 'Ship', ['Shop', '🏪']);
  swap('4-19', 'Planet', ['Microscope', '🔬']);
  swap('3-25', 'Hot', ['Warm', '☀️']);
  swap('3-9', 'Cold', ['Empty', 'opposite of full']);
  swap('2-0', 'Bed', ['Web', '🕸️']);
  swap('2-0', 'Sun', ['Jam', '🍯']);

  /* إضافة الترجمة العربية للجمل الإنجليزية */
  const TR = {
    "I see a dog": "أَرَى كَلْبًا", "The sun is hot": "الشَّمْسُ حَارَّةٌ", "I like milk": "أُحِبُّ الْحَلِيبَ",
    "A cat can run": "الْقِطَّةُ تَسْتَطِيعُ الْجَرْيَ", "The bus is big": "الْحَافِلَةُ كَبِيرَةٌ", "I am a boy": "أَنَا وَلَدٌ",
    "She is a girl": "هِيَ بِنْتٌ", "We are happy": "نَحْنُ سُعَدَاءُ", "They are friends": "هُمْ أَصْدِقَاءُ",
    "It is a cat": "إِنَّهَا قِطَّةٌ", "Nice to meet you": "سُرِرْتُ بِلِقَائِكَ", "See you later": "أَرَاكَ لَاحِقًا",
    "I wake up at seven": "أَسْتَيْقِظُ فِي السَّاعَةِ السَّابِعَةِ", "I brush my teeth": "أُنَظِّفُ أَسْنَانِي",
    "I eat breakfast": "آكُلُ الْفُطُورَ", "I go to school": "أَذْهَبُ إِلَى الْمَدْرَسَةِ",
    "I play with my friends": "أَلْعَبُ مَعَ أَصْدِقَائِي", "I take a shower": "أَسْتَحِمُّ",
    "She goes to bed at nine": "تَنَامُ فِي السَّاعَةِ التَّاسِعَةِ", "He plays football after school": "يَلْعَبُ كُرَةَ الْقَدَمِ بَعْدَ الْمَدْرَسَةِ",
    "We have lunch at noon": "نَتَغَدَّى عِنْدَ الظُّهْرِ", "They watch TV at night": "يُشَاهِدُونَ التِّلْفَازَ فِي اللَّيْلِ",
    "I am reading": "أَنَا أَقْرَأُ الْآنَ", "He is running": "هُوَ يَرْكُضُ الْآنَ",
    "She is singing": "هِيَ تُغَنِّي الْآنَ", "They are swimming": "هُمْ يَسْبَحُونَ الْآنَ",
    "We are eating": "نَحْنُ نَأْكُلُ الْآنَ", "How much is this?": "بِكَمْ هَذَا؟",
    "I want to buy a shirt": "أُرِيدُ أَنْ أَشْتَرِيَ قَمِيصًا", "It is too expensive": "إِنَّهُ غَالٍ جِدًّا",
    "Do you have a smaller size?": "هَلْ عِنْدَكَ مَقَاسٌ أَصْغَرُ؟", "I will take it": "سَآخُذُهُ",
    "Turn left": "انْعَطِفْ يَسَارًا", "Turn right": "انْعَطِفْ يَمِينًا", "Go straight": "امْشِ إِلَى الْأَمَامِ",
    "Stop here": "قِفْ هُنَا", "It is on the corner": "إِنَّهُ عِنْدَ الزَّاوِيَةِ",
    "I like reading books": "أُحِبُّ قِرَاءَةَ الْكُتُبِ", "We are going to the park": "نَحْنُ ذَاهِبُونَ إِلَى الْحَدِيقَةِ",
    "It is raining today": "إِنَّهَا تُمْطِرُ الْيَوْمَ", "Please open the window": "افْتَحِ النَّافِذَةَ مِنْ فَضْلِكَ",
    "My favorite color is blue": "لَوْنِي الْمُفَضَّلُ هُوَ الْأَزْرَقُ", "I will study tomorrow": "سَأَدْرُسُ غَدًا",
    "She will travel next week": "سَتُسَافِرُ الْأُسْبُوعَ الْقَادِمَ", "We will visit grandma": "سَنَزُورُ جَدَّتَنَا",
    "It will rain tonight": "سَتُمْطِرُ اللَّيْلَةَ", "They will play tomorrow": "سَيَلْعَبُونَ غَدًا",
    "I would like a pizza": "أُرِيدُ بِيتْزَا مِنْ فَضْلِكَ", "How much is it?": "بِكَمْ هُوَ؟",
    "Can I have some water?": "هَلْ يُمْكِنُنِي الْحُصُولُ عَلَى بَعْضِ الْمَاءِ؟", "The bill please": "الْحِسَابُ مِنْ فَضْلِكَ",
    "Is this seat free?": "هَلْ هَذَا الْمَقْعَدُ فَارِغٌ؟", "I have a headache": "عِنْدِي صُدَاعٌ",
    "I have a fever": "عِنْدِي حُمَّى", "My tooth hurts": "سِنِّي يُؤْلِمُنِي",
    "I need some medicine": "أَحْتَاجُ بَعْضَ الدَّوَاءِ", "Please take a rest": "خُذْ قِسْطًا مِنَ الرَّاحَةِ",
    "Practice makes perfect": "التَّدْرِيبُ يَصْنَعُ الْإِتْقَانَ", "Time is money": "الْوَقْتُ مِنْ ذَهَبٍ",
    "Smile and the world smiles back": "ابْتَسِمْ يَبْتَسِمْ لَكَ الْعَالَمُ",
    "Actions speak louder than words": "الْأَفْعَالُ أَبْلَغُ مِنَ الْأَقْوَالِ",
    "A friend in need is a friend indeed": "الصَّدِيقُ وَقْتَ الضِّيقِ",
    "The early bird catches the worm": "مَنْ جَدَّ وَجَدَ", "Save water": "حَافِظْ عَلَى الْمَاءِ",
    "Exercise every day": "تَمَرَّنْ كُلَّ يَوْمٍ", "Drink more water": "اشْرَبْ مَاءً أَكْثَرَ",
    "Eat vegetables": "كُلِ الْخُضْرَاوَاتِ", "Sleep eight hours": "نَمْ ثَمَانِيَ سَاعَاتٍ",
    "Wash your hands": "اغْسِلْ يَدَيْكَ"
  };
  for (const s of S) {
    for (const u of s.u) {
      for (const it of u.i) {
        if (it[2] === 'en' && TR[it[0]] && !/[\u0600-\u06FF]/.test(it[1])) {
          const em = (String(it[1]).match(/\p{Extended_Pictographic}[\uFE0F\u200D\p{Extended_Pictographic}]*/u) || [''])[0];
          it[1] = em ? `${em} ${TR[it[0]]}` : TR[it[0]];
        }
      }
    }
  }

  /* 2) دروس قواعد ومحادثة متدرجة */
  const NEW = [
    [1, { n: 'a / an — أداة النكرة', kind: 'article', g: 'نَقُولُ «an» قَبْلَ الْكَلِمَةِ الَّتِي تَبْدَأُ بِصَوْتٍ مُتَحَرِّكٍ: a e i o u، وَنَقُولُ «a» قَبْلَ غَيْرِهَا.',
      i: [['a cat', '🐱 قِطَّةٌ'], ['an apple', '🍎 تُفَّاحَةٌ'], ['a ball', '⚽ كُرَةٌ'], ['an egg', '🥚 بَيْضَةٌ'], ['a dog', '🐶 كَلْبٌ'], ['an orange', '🍊 بُرْتُقَالَةٌ'], ['an umbrella', '☂️ مِظَلَّةٌ'], ['a book', '📖 كِتَابٌ']] }],
    [1, { n: 'This is / That is — هذا وذلك', kind: 'grammar', gw: ['This', 'That'], g: '«This» لِلشَّيْءِ الْقَرِيبِ مِنَّا، وَ «That» لِلشَّيْءِ الْبَعِيدِ.',
      i: [['This is a pen', '✏️ هَذَا قَلَمٌ'], ['That is a car', '🚗 تِلْكَ سَيَّارَةٌ'], ['This is my bag', '🎒 هَذِهِ حَقِيبَتِي'], ['That is a tree', '🌳 تِلْكَ شَجَرَةٌ'], ['This is my mom', '👩 هَذِهِ أُمِّي']] }],
    [1, { n: 'One cat, two cats — الجمع بإضافة s', kind: 'grammar', gw: ['cat', 'cats', 'dog', 'dogs', 'ball', 'balls', 'apple', 'apples', 'box', 'boxes'], g: 'لِلْجَمْعِ نُضِيفُ «s» فِي آخِرِ الْكَلِمَةِ: cat ← cats، وَبَعْضُ الْكَلِمَاتِ نُضِيفُ لَهَا «es»: box ← boxes.',
      i: [['one cat', '🐱 قِطَّةٌ وَاحِدَةٌ'], ['two cats', '🐱🐱 قِطَّتَانِ'], ['three dogs', '🐶🐶🐶 ثَلَاثَةُ كِلَابٍ'], ['four balls', '⚽⚽⚽⚽ أَرْبَعُ كُرَاتٍ'], ['five apples', '🍎🍎🍎🍎🍎 خَمْسُ تُفَّاحَاتٍ'], ['two boxes', '📦📦 صُنْدُوقَانِ']] }],
    [1, { n: 'A red apple — اللون قبل الاسم', kind: 'grammar', gw: ['red', 'blue', 'green', 'yellow', 'black'], g: 'فِي الْإِنْجِلِيزِيَّةِ يَأْتِي اللَّوْنُ قَبْلَ الِاسْمِ: a red apple تَعْنِي تُفَّاحَةً حَمْرَاءَ.',
      i: [['a red apple', '🍎 تُفَّاحَةٌ حَمْرَاءُ'], ['a blue car', '🚙 سَيَّارَةٌ زَرْقَاءُ'], ['a green frog', '🐸 ضِفْدَعٌ أَخْضَرُ'], ['a yellow sun', '☀️ شَمْسٌ صَفْرَاءُ'], ['a black cat', '🐈‍⬛ قِطٌّ أَسْوَدُ']] }],
    [1, { n: 'I have / I like — عندي وأحب', kind: 'grammar', gw: ['have', 'like'], g: '«I have» تَعْنِي عِنْدِي، وَ «I like» تَعْنِي أُحِبُّ.',
      i: [['I have a cat', '🐱 عِنْدِي قِطَّةٌ'], ['I like apples', '🍎 أُحِبُّ التُّفَّاحَ'], ['I have two hands', '👐 عِنْدِي يَدَانِ'], ['I like red', '🔴 أُحِبُّ اللَّوْنَ الْأَحْمَرَ'], ['I have a ball', '⚽ عِنْدِي كُرَةٌ']] }],
    [2, { n: 'What is this? It is… — ما هذا؟', kind: 'grammar', gw: ['What', 'It'], g: 'نَسْأَلُ «What is this?» أَيْ: مَا هَذَا؟ وَنُجِيبُ «It is a…» أَيْ: إِنَّهُ…',
      i: [['What is this?', '❓ مَا هَذَا؟'], ['It is a ball', '⚽ إِنَّهَا كُرَةٌ'], ['It is a bird', '🐦 إِنَّهُ طَائِرٌ'], ['It is a clock', '🕰️ إِنَّهَا سَاعَةٌ'], ['It is an apple', '🍎 إِنَّهَا تُفَّاحَةٌ']] }],
    [2, { n: 'Is it…? Yes / No — سؤال وجواب', kind: 'grammar', gw: ['Yes', 'No', 'is', 'not'], g: 'نَسْأَلُ بِـ«Is it…?» وَنُجِيبُ «Yes, it is» إِذَا كَانَ صَحِيحًا، أَوْ «No, it is not» إِذَا كَانَ خَطَأً.',
      i: [['Is it a cat?', '🐱 هَلْ هِيَ قِطَّةٌ؟'], ['Yes, it is', '✅ نَعَمْ، هِيَ كَذَلِكَ'], ['Is it a dog?', '🐶 هَلْ هُوَ كَلْبٌ؟'], ['No, it is not', '❌ لَا، لَيْسَ كَذَلِكَ'], ['Is it big?', '🐘 هَلْ هُوَ كَبِيرٌ؟']] }],
    [2, { n: 'Can / can’t — أستطيع ولا أستطيع', kind: 'grammar', gw: ['can', 'can’t'], g: '«can» تَعْنِي يَسْتَطِيعُ، وَ «can’t» تَعْنِي لَا يَسْتَطِيعُ.',
      i: [['I can swim', '🏊 أَسْتَطِيعُ السِّبَاحَةَ'], ['A bird can fly', '🐦 الطَّائِرُ يَسْتَطِيعُ الطَّيَرَانَ'], ['A fish can’t walk', '🐟 السَّمَكَةُ لَا تَسْتَطِيعُ الْمَشْيَ'], ['I can read', '📖 أَسْتَطِيعُ الْقِرَاءَةَ'], ['A cat can’t fly', '🐱 الْقِطَّةُ لَا تَسْتَطِيعُ الطَّيَرَانَ']] }],
    [2, { n: 'There is / There are — يوجد', kind: 'grammar', gw: ['is', 'are'], g: '«There is» لِشَيْءٍ وَاحِدٍ، وَ «There are» لِأَكْثَرَ مِنْ شَيْءٍ.',
      i: [['There is a cat on the bed', '🐱 تُوجَدُ قِطَّةٌ عَلَى السَّرِيرِ'], ['There are two birds in the tree', '🐦🐦 يُوجَدُ طَائِرَانِ فِي الشَّجَرَةِ'], ['There is a book on the desk', '📖 يُوجَدُ كِتَابٌ عَلَى الْمَكْتَبِ'], ['There are three apples', '🍎🍎🍎 تُوجَدُ ثَلَاثُ تُفَّاحَاتٍ'], ['There is a moon in the sky', '🌙 يُوجَدُ قَمَرٌ فِي السَّمَاءِ']] }],
    [2, { n: 'Have / has — يملك', kind: 'grammar', gw: ['have', 'has'], g: 'نَقُولُ «has» مَعَ he وَ she وَ it، وَ «have» مَعَ I وَ you وَ we وَ they.',
      i: [['I have a book', '📖 عِنْدِي كِتَابٌ'], ['She has a cat', '🐱 عِنْدَهَا قِطَّةٌ'], ['He has a bike', '🚲 عِنْدَهُ دَرَّاجَةٌ'], ['We have a garden', '🏡 عِنْدَنَا حَدِيقَةٌ'], ['It has four legs', '🐕 لَهُ أَرْبَعُ أَرْجُلٍ']] }],
    [2, { n: 'I play / He plays — المضارع البسيط', kind: 'grammar', gw: ['play', 'plays', 'read', 'reads', 'eat', 'eats', 'drink', 'drinks'], g: 'مَعَ he وَ she وَ it نُضِيفُ «s» لِلْفِعْلِ: I play ← he plays.',
      i: [['I play football', '⚽ أَلْعَبُ كُرَةَ الْقَدَمِ'], ['He plays football', '⚽ هُوَ يَلْعَبُ كُرَةَ الْقَدَمِ'], ['She reads a book', '📖 هِيَ تَقْرَأُ كِتَابًا'], ['They eat lunch', '🍽️ هُمْ يَأْكُلُونَ الْغَدَاءَ'], ['The cat drinks milk', '🥛 الْقِطَّةُ تَشْرَبُ الْحَلِيبَ']] }],
    [3, { n: 'Don’t / doesn’t — النفي', kind: 'grammar', gw: ['don’t', 'doesn’t'], g: 'لِلنَّفْيِ نَقُولُ «don’t» مَعَ I وَ you وَ we وَ they، وَ «doesn’t» مَعَ he وَ she وَ it.',
      i: [['I don’t like coffee', '☕ لَا أُحِبُّ الْقَهْوَةَ'], ['He doesn’t eat fish', '🐟 هُوَ لَا يَأْكُلُ السَّمَكَ'], ['We don’t play here', '🚫 نَحْنُ لَا نَلْعَبُ هُنَا'], ['She doesn’t watch TV', '📺 هِيَ لَا تُشَاهِدُ التِّلْفَازَ'], ['They don’t swim', '🏊 هُمْ لَا يَسْبَحُونَ']] }],
    [3, { n: 'Do you…? — أسئلة نعم ولا', kind: 'grammar', gw: ['Do', 'Does', 'do', 'does'], g: 'نَبْدَأُ السُّؤَالَ بِـ«Do» أَوْ «Does»، وَنُجِيبُ: Yes, I do أَوْ No, I don’t.',
      i: [['Do you like milk?', '🥛 هَلْ تُحِبُّ الْحَلِيبَ؟'], ['Yes, I do', '✅ نَعَمْ'], ['Does she play tennis?', '🎾 هَلْ تَلْعَبُ التِّنِسَ؟'], ['No, she doesn’t', '❌ لَا، لَا تَلْعَبُ'], ['Do they live here?', '🏠 هَلْ يَسْكُنُونَ هُنَا؟']] }],
    [3, { n: 'How many? How much? — كم؟', kind: 'grammar', gw: ['many', 'much'], g: '«How many» لِلْأَشْيَاءِ الَّتِي نَعُدُّهَا، وَ «How much» لِلسِّعْرِ وَالْأَشْيَاءِ الَّتِي لَا نَعُدُّهَا مِثْلَ الْمَاءِ.',
      i: [['How many apples?', '🍎 كَمْ تُفَّاحَةً؟'], ['How many books are there?', '📚 كَمْ كِتَابًا هُنَاكَ؟'], ['How much is the bag?', '👜 بِكَمِ الْحَقِيبَةُ؟'], ['How much water?', '💧 كَمْ مِنَ الْمَاءِ؟'], ['How many cats can you see?', '🐱 كَمْ قِطَّةً تَرَى؟']] }],
    [3, { n: 'Ali’s book — الملكية ’s', kind: 'grammar', gw: ['Ali’s', 'Sara’s', 'father’s', 'boy’s', 'Mom’s'], g: 'نُضِيفُ «’s» بَعْدَ اسْمِ الشَّخْصِ لِنَقُولَ إِنَّ الشَّيْءَ لَهُ: Ali’s book = كِتَابُ عَلِيٍّ.',
      i: [['Ali’s book', '📕 كِتَابُ عَلِيٍّ'], ['Sara’s cat', '🐱 قِطَّةُ سَارَةَ'], ['My father’s car', '🚗 سَيَّارَةُ أَبِي'], ['The boy’s ball', '⚽ كُرَةُ الْوَلَدِ'], ['Mom’s bag', '👜 حَقِيبَةُ أُمِّي']] }],
    [3, { n: 'Me, him, her, us, them — ضمائر المفعول', kind: 'grammar', gw: ['me', 'him', 'her', 'us', 'them'], g: 'بَعْدَ الْفِعْلِ نَقُولُ: me (لِي/نِي)، him (هُ)، her (هَا)، us (نَا)، them (هُمْ).',
      i: [['Help me', '🙋 سَاعِدْنِي'], ['Call him', '📞 اتَّصِلْ بِهِ'], ['Ask her', '❓ اسْأَلْهَا'], ['Play with us', '⚽ الْعَبْ مَعَنَا'], ['Look at them', '👀 انْظُرْ إِلَيْهِمْ']] }],
    [3, { n: 'What time is it? — الوقت', kind: 'grammar', gw: ['one', 'three', 'half', 'seven', 'ten'], g: 'نَقُولُ «It is … o’clock» لِلسَّاعَةِ تَمَامًا، وَ «half past» لِلنِّصْفِ.',
      i: [['It is one o’clock', '🕐 السَّاعَةُ الْوَاحِدَةُ'], ['It is three o’clock', '🕒 السَّاعَةُ الثَّالِثَةُ'], ['It is half past four', '🕟 السَّاعَةُ الرَّابِعَةُ وَالنِّصْفُ'], ['It is seven o’clock', '🕖 السَّاعَةُ السَّابِعَةُ'], ['It is ten o’clock', '🕙 السَّاعَةُ الْعَاشِرَةُ']] }],
    [3, { n: 'Did you…? I didn’t — الماضي: سؤال ونفي', kind: 'grammar', gw: ['Did', 'didn’t', 'did'], g: 'فِي الْمَاضِي نَسْأَلُ بِـ«Did» وَنَنْفِي بِـ«didn’t» وَيَعُودُ الْفِعْلُ لِأَصْلِهِ: I didn’t play.',
      i: [['Did you eat breakfast?', '🍳 هَلْ تَنَاوَلْتَ الْفُطُورَ؟'], ['Yes, I did', '✅ نَعَمْ'], ['I didn’t go to the park', '🌳 لَمْ أَذْهَبْ إِلَى الْحَدِيقَةِ'], ['Did she call you?', '📞 هَلِ اتَّصَلَتْ بِكَ؟'], ['He didn’t play yesterday', '⚽ لَمْ يَلْعَبْ أَمْسِ']] }],
    [4, { n: 'Going to — خطط المستقبل', kind: 'grammar', gw: ['am', 'is', 'are'], g: 'نَسْتَعْمِلُ «going to» لِلْخُطَطِ الْقَادِمَةِ: I am going to read = سَأَقْرَأُ.',
      i: [['I am going to read a story', '📖 سَأَقْرَأُ قِصَّةً'], ['She is going to travel', '✈️ سَتُسَافِرُ'], ['We are going to play football', '⚽ سَنَلْعَبُ كُرَةَ الْقَدَمِ'], ['They are going to visit grandma', '👵 سَيَزُورُونَ الْجَدَّةَ'], ['He is going to clean his room', '🧹 سَيُنَظِّفُ غُرْفَتَهُ']] }],
    [4, { n: 'I have finished — المضارع التام', kind: 'grammar', gw: ['have', 'has'], g: '«have/has + الْفِعْلُ التَّامُّ» لِشَيْءٍ حَدَثَ وَانْتَهَى الْآنَ: I have finished = لَقَدْ أَنْهَيْتُ.',
      i: [['I have finished my homework', '📝 أَنْهَيْتُ وَاجِبِي'], ['She has visited the museum', '🏛️ زَارَتِ الْمُتْحَفَ'], ['We have eaten lunch', '🍽️ تَنَاوَلْنَا الْغَدَاءَ'], ['They have arrived', '🚪 وَصَلُوا'], ['He has lost his key', '🔑 أَضَاعَ مِفْتَاحَهُ']] }],
    [4, { n: 'If… — الشرط', kind: 'grammar', gw: ['If', 'will'], g: '«If» تَعْنِي إِذَا: If it rains, I will stay home = إِذَا أَمْطَرَتْ سَأَبْقَى فِي الْبَيْتِ.',
      i: [['If it rains, I will stay home', '🌧️ إِذَا أَمْطَرَتْ سَأَبْقَى فِي الْبَيْتِ'], ['If you study, you will pass', '📚 إِذَا ذَاكَرْتَ سَتَنْجَحُ'], ['If I am hungry, I will eat', '🍎 إِذَا جُعْتُ سَآكُلُ'], ['If it is sunny, we will play outside', '☀️ إِذَا كَانَ الْجَوُّ مُشْمِسًا سَنَلْعَبُ فِي الْخَارِجِ'], ['If you are tired, you will sleep', '😴 إِذَا تَعِبْتَ سَتَنَامُ']] }],
    [4, { n: 'Speaking: About me — أعرّف بنفسي', kind: 'speak', g: 'هَذِهِ جُمَلٌ لِتُعَرِّفَ بِنَفْسِكَ. اسْتَمِعْ وَرَدِّدْ كُلَّ جُمْلَةٍ بِصَوْتٍ عَالٍ.',
      i: [['Hi, my name is Sara', '👋 مَرْحَبًا، اسْمِي سَارَةُ'], ['I am ten years old', '🔟 عُمْرِي عَشْرُ سَنَوَاتٍ'], ['I live in a big city', '🏙️ أَسْكُنُ فِي مَدِينَةٍ كَبِيرَةٍ'], ['My hobby is reading', '📚 هِوَايَتِي الْقِرَاءَةُ'], ['Nice to meet you', '🤝 سُعِدْتُ بِلِقَائِكَ']] }],
    [4, { n: 'Speaking: In class — لغة الصف', kind: 'speak', g: 'جُمَلٌ تَحْتَاجُهَا فِي الصَّفِّ. رَدِّدْهَا لِتَتَحَدَّثَ مَعَ مُعَلِّمِكَ بِالْإِنْجِلِيزِيَّةِ.',
      i: [['May I ask a question?', '🙋 هَلْ يُمْكِنُنِي أَنْ أَسْأَلَ؟'], ['Can you repeat, please?', '🔁 هَلْ تُعِيدُ مِنْ فَضْلِكَ؟'], ['I don’t understand', '🤔 لَمْ أَفْهَمْ'], ['What does this word mean?', '❓ مَا مَعْنَى هَذِهِ الْكَلِمَةِ؟'], ['Can I borrow a pencil?', '✏️ هَلْ أَسْتَعِيرُ قَلَمًا؟']] }],
    [4, { n: 'Speaking: Describe a picture — أصف صورة', kind: 'speak', g: 'لِنَصِفَ صُورَةً نَقُولُ: In the picture I can see… ثُمَّ نَذْكُرُ مَا نَرَاهُ.',
      i: [['In the picture I can see a park', '🏞️ فِي الصُّورَةِ أَرَى حَدِيقَةً'], ['There are children playing', '👧👦 يُوجَدُ أَطْفَالٌ يَلْعَبُونَ'], ['The weather is sunny', '☀️ الْجَوُّ مُشْمِسٌ'], ['A boy is riding a bike', '🚲 وَلَدٌ يَرْكَبُ دَرَّاجَةً'], ['Everyone is happy', '😊 الْجَمِيعُ سُعَدَاءُ']] }]
  ];

  for (const [a, u] of NEW) {
    if (!S[a]) continue;
    const id = a + '-' + S[a].u.length;
    u.id = id;
    u.l = 'en';
    u.i = u.i.map(x => [x[0], x[1], 'en']);
    u.newEn = 1;
    S[a].u.push(u);
  }

  /* 3) أنواع التمارين الإنجليزية */
  const LET = 'abcdefghijklmnopqrstuvwxyz'.split('');
  const VOW = 'aeiou';
  const mk = (it, show, right, wrongs, extra) => {
    const o = typeof window.uniqueOpts === 'function'
      ? uniqueOpts(right, wrongs, x => x, 4)
      : shuf([right, ...wrongs.filter(w => w !== right)].filter((x, i, a) => a.indexOf(x) === i).slice(0, 4));
    if (o.length < 2) return null;
    return Object.assign({ k: it[0], m: 0, l: 'en', show, opts: o.map(h => ({ h, ok: h === right })), ex: [`${it[0]} = ${it[1]}`, `الْكَلِمَةُ: ${it[0]}`] }, extra || {});
  };
  const others = (u, it, f) => shuf(u.i.filter(x => x !== it && (!f || f(x))));
  const arOf = it => {
    const m = String(it[1]);
    if (/[\u0600-\u06FF]/.test(m)) return m.replace(/[\p{Extended_Pictographic}\uFE0F\u200D]/gu, '').trim();
    try { return (window.EnCoach && EnCoach.meaning(it[0])) || ''; } catch { return ''; }
  };
  const emo = it => (String(it[1]).match(/[\p{Extended_Pictographic}\uFE0F\u200D]+/u) || [''])[0];

  const E = {
    firstEn(u, it) {
      const w = String(it[0]);
      if (/\s/.test(w)) return null;
      const f = w[0].toLowerCase();
      return mk(it, `<div class=q>${isPic(it[1]) ? it[1] : esc(w)}</div><p class=mut>What letter does it start with? بِأَيِّ حَرْفٍ تَبْدَأُ؟</p>`, f.toUpperCase(), shuf(LET.filter(x => x !== f)).slice(0, 3).map(x => x.toUpperCase()), { sp: [w, 'en'] });
    },
    missingEn(u, it) {
      const w = String(it[0]).toLowerCase();
      if (/[\s’']/.test(w) || w.length < 3) return null;
      const vi = [...w].map((c, i) => (VOW.includes(c) ? i : -1)).filter(i => i >= 0);
      const i = vi.length && Math.random() < 0.7 ? vi[Math.floor(Math.random() * vi.length)] : Math.floor(Math.random() * w.length);
      const r = w[i];
      const pool = VOW.includes(r) ? VOW.split('') : LET;
      return mk(it, `<div class=q>${isPic(it[1]) ? it[1] : ''}</div><div class=spell dir=ltr>${[...w].map((c, j) => (j === i ? '<i class=gap>?</i>' : `<span>${c}</span>`)).join('')}</div><p class=mut>Missing letter — الْحَرْفُ النَّاقِصُ</p>`, r, shuf(pool.filter(x => x !== r)).slice(0, 3), { sp: [it[0], 'en'] });
    },
    spell(u, it) {
      const w = String(it[0]).toLowerCase();
      if (/[\s’']/.test(w) || w.length < 2 || w.length > 8) return null;
      const t = [...w];
      return {
        k: it[0], m: 4, l: 'en', sp: [it[0], 'en'], w: 'build',
        tiles: shuf([...t, ...(t.length < 5 ? shuf(LET.filter(x => !t.includes(x))).slice(0, 1) : [])]),
        target: t, hint: isPic(it[1]) ? it[1] : emo(it),
        title: 'Spell the word — رَكِّبِ الْكَلِمَةَ',
        ex: [`تُكْتَبُ هَكَذَا: ${w.toUpperCase().split('').join(', ')}`, `تَبْدَأُ بِحَرْفِ ${w[0].toUpperCase()}`]
      };
    },
    meaningAr(u, it) {
      const m = arOf(it);
      if (!m) return null;
      const wr = others(u, it).map(arOf).filter(x => x && x !== m);
      return mk(it, `<div class=q dir=ltr>${esc(it[0])}</div><p class=mut>مَا مَعْنَاهَا بِالْعَرَبِيَّةِ؟</p>`, m, wr, { sp: [it[0], 'en'] });
    },
    fromAr(u, it) {
      const m = arOf(it);
      if (!m) return null;
      return mk(it, `<div class=q style="font-size:1.35rem">${emo(it)} ${esc(m)}</div><p class=mut>How do we say it in English? كَيْفَ نَقُولُهَا بِالْإِنْجِلِيزِيَّةِ؟</p>`, it[0], others(u, it).map(x => x[0]));
    },
    listenEn(u, it) {
      return mk(it, `<div class=q>🔊</div><p class=mut>Listen and choose — اسْتَمِعْ وَاخْتَرْ</p>`, it[0], others(u, it).map(x => x[0]), { sp: [it[0], 'en'], m: 1 });
    },
    orderEn(u, it) {
      const ws = String(it[0]).replace(/[?.!,]/g, '').split(/\s+/).filter(Boolean);
      if (ws.length < 2 || ws.length > 8) return null;
      return {
        k: it[0], m: 5, l: 'en', sp: [it[0], 'en'], w: 'order',
        tiles: shuf(ws), target: ws, hint: emo(it),
        title: 'Put the words in order — رَتِّبِ الْكَلِمَاتِ',
        ex: [`الْجُمْلَةُ الصَّحِيحَةُ: ${it[0]}`, `تَبْدَأُ بِكَلِمَةِ “${ws[0]}”`]
      };
    },
    blank(u, it) {
      const gw = u.gw;
      if (!gw) return null;
      const toks = String(it[0]).split(/(\s+)/);
      const lw = gw.map(x => x.toLowerCase());
      const i = toks.findIndex(t => lw.includes(t.replace(/[?.!,]/g, '').toLowerCase()));
      if (i < 0) return null;
      const right = toks[i].replace(/[?.!,]/g, ''), punc = toks[i].slice(right.length);
      const shown = toks.map((t, j) => (j === i ? '<i class=gap>___</i>' + punc : esc(t))).join('');
      const alts = gw.filter(x => x.toLowerCase() !== right.toLowerCase());
      const pairs = alts.filter(x => /’s$/.test(x) === /’s$/.test(right));
      return mk(it, `<div class=q dir=ltr style="font-size:1.4rem">${emo(it)} ${shown}</div><p class=mut>${esc(arOf(it))}</p><p class=mut>Choose the right word — اخْتَرِ الْكَلِمَةَ الصَّحِيحَةَ</p>`, right, (pairs.length ? pairs : alts).slice(0, 3), {
        ex: [`${it[0]} — ${u.g ? strip(u.g).slice(0, 90) : ''}`, `الْجَوَابُ الصَّحِيحُ: “${right}”`]
      });
    },
    article(u, it) {
      const m = String(it[0]).match(/^(a|an)\s+(.+)$/i);
      if (!m) return null;
      return mk(it, `<div class=q dir=ltr>${emo(it)} ___ ${esc(m[2])}</div><p class=mut>a or an?</p>`, m[1].toLowerCase(), [m[1].toLowerCase() === 'a' ? 'an' : 'a'], {
        sp: [m[2], 'en'],
        ex: [`${it[0]}: «${m[2]}» ${/^[aeiou]/i.test(m[2]) ? 'تَبْدَأُ بِصَوْتٍ مُتَحَرِّكٍ ← an' : 'لَا تَبْدَأُ بِصَوْتٍ مُتَحَرِّكٍ ← a'}`, 'an قَبْلَ a e i o u']
      });
    },
    rhyme(u, it) {
      const w = String(it[0]).toLowerCase();
      if (/\s/.test(w)) return null;
      const end = w.slice(-2);
      const same = others(u, it, x => String(x[0]).toLowerCase().slice(-2) === end);
      if (!same.length) return null;
      const allEn = S.flatMap(s => s.u).filter(x => x.l === 'en' && x !== u).flatMap(x => x.i).map(x => String(x[0])).filter(x => !/\s/.test(x) && x.toLowerCase().slice(-2) !== end && x.length <= 6);
      return mk(it, `<div class=q dir=ltr>${isPic(it[1]) ? it[1] + ' ' : ''}${esc(it[0])}</div><p class=mut>Which word sounds the same at the end? أَيُّ كَلِمَةٍ تُشْبِهُهَا فِي الصَّوْتِ؟</p>`, same[0][0], shuf(allEn).slice(0, 3), {
        sp: [it[0], 'en'],
        ex: [`${it[0]} وَ ${same[0][0]} تَنْتَهِيَانِ بِنَفْسِ الصَّوْتِ «${end}»`, 'Listen to the end of the word']
      });
    }
  };

  const PH = /^Phonics/;
  const typeEn = u => {
    if (u.kind === 'article') return 'article';
    if (u.kind === 'grammar') return 'grammar';
    if (u.kind === 'speak') return 'speak';
    if (PH.test(u.n)) return 'phonics';
    const pics = u.i.filter(x => isPic(x[1])).length;
    const multi = u.i.filter(x => /\s/.test(String(x[0]))).length;
    if (multi >= u.i.length * 0.6) return pics >= u.i.length * 0.5 ? 'sentence' : 'phrase';
    if (pics >= u.i.length * 0.6) return 'vocab';
    return 'desc';
  };
  const PLAN = {
    vocab: ['pic', 'listenPic', 'firstEn', 'spell', 'missingEn', 'meaningAr'],
    phonics: ['listenEn', 'rhyme', 'missingEn', 'spell', 'pic'],
    sentence: ['orderEn', 'listenEn', 'pic', 'meaningAr'],
    phrase: ['orderEn', 'listenEn', 'meaningAr', 'fromAr'],
    desc: ['meaning', 'reverse', 'listenEn', 'meaningAr'],
    grammar: ['blank', 'orderEn', 'meaningAr', 'listenEn', 'blank'],
    article: ['article', 'article', 'listenEn', 'meaningAr'],
    speak: ['listenEn', 'orderEn', 'fromAr', 'meaningAr']
  };

  function build(u, n = 5) {
    const t = typeEn(u), plan = PLAN[t] || PLAN.vocab, items = shuf(u.i.filter(x => x && x[0])), out = [];
    let k = 0, g = 0;
    while (out.length < n && g++ < 65) {
      const name = plan[k % plan.length], it = items[out.length % items.length];
      k++;
      let q0 = null;
      try { q0 = (E[name] || Q[name]) && (E[name] || Q[name])(u, it); } catch { q0 = null; }
      if (q0) {
        q0.l = 'en';
        if (q0.sp && !q0.sp[1]) q0.sp[1] = 'en';
        if (!out.some(x => x.show === q0.show && x.w === q0.w)) out.push(q0);
      }
    }
    while (out.length < n && items.length >= 2) {
      const it = items[out.length % items.length];
      const q0 = E.listenEn(u, it);
      if (!q0) break;
      out.push(q0);
    }
    return out;
  }

  const isEnLesson = c => !!(c && c.id && /^\d+-\d+$/.test(c.id) && c.l === 'en' && c.i && c.i.length >= 2 && !c.qs && !c.mk);
  window.EnLessonQuiz = build;
  window.enLessonType = typeEn;
  window.EnLessonTypes = { isEnLesson, decorateLesson: () => {
    try {
      document.querySelectorAll('#app .grid .card>span').forEach(sp => {
        if (/[\u0600-\u06FFA-Za-z]{2}/.test(sp.textContent)) sp.classList.add('tx');
      });
      const c = window.cur;
      if (c && c.l === 'en' && V === 'lesson' && document.querySelector('#app h2')) {
        const h2 = document.querySelector('#app h2');
        if (c.g && !document.querySelector('.rule-box')) h2.insertAdjacentHTML('afterend', `<div class=rule-box><b>💡 القاعدة</b><p>${esc(c.g)}</p></div>`);
        if ((c.kind === 'speak' || c.kind === 'grammar') && typeof window.speak === 'function' && !document.querySelector('.speak-hint')) {
          document.querySelector('#app .grid')?.insertAdjacentHTML('afterend', '<p class="mut speak-hint">🎤 اضْغَطْ عَلَى كُلِّ جُمْلَةٍ لِتَسْمَعَهَا، ثُمَّ رَدِّدْهَا بِصَوْتٍ عَالٍ. لِلتَّدَرُّبِ عَلَى النُّطْقِ بِالْمَيْكْرُوفُونِ: <button class=link onclick="speak()">تَدْرِيبُ النُّطْقِ</button></p>');
        }
      }
    } catch {}
  } };

  const oI = window.lessonIntro;
  window.lessonIntro = c => {
    c = c || window.cur;
    if (c && c.l === 'en' && c.g) return `دَرْسُ: ${c.n}. ${c.g} اضْغَطْ عَلَى كُلِّ بِطَاقَةٍ لِتَسْمَعَ، ثُمَّ ابْدَأِ الِاخْتِبَارَ.`;
    return oI ? oI(c) : '';
  };
})();
