/* /src/stories/stories.js — عالم القصص والقراءة: قصص عربية وإنجليزية ومحادثات + اختبارات استماع وقراءة مستقلة */
(() => {
  'use strict';
  const AR = [
    {
      id: 'a1', ic: '🦉', lv: 1, t: 'بُومِي وَالْقَمَرُ',
      s: ['بُومِي بُومَةٌ صَغِيرَةٌ تُحِبُّ اللَّيْلَ.', 'فِي لَيْلَةٍ جَمِيلَةٍ، نَظَرَتْ إِلَى السَّمَاءِ فَرَأَتِ الْقَمَرَ كَبِيرًا.', 'قَالَتْ: يَا قَمَرُ، لِمَاذَا تُضِيءُ؟', 'قَالَ الْقَمَرُ: أُضِيءُ لِأُسَاعِدَ الْمُسَافِرِينَ فِي اللَّيْلِ.', 'فَرِحَتْ بُومِي وَقَالَتْ: وَأَنَا سَأُسَاعِدُ أَصْدِقَائِي فِي التَّعَلُّمِ.'],
      q: [['مَا اسْمُ الْبُومَةِ؟', ['بُومِي', 'سَارَةُ', 'قَمَرٌ']], ['مَاذَا رَأَتْ بُومِي فِي السَّمَاءِ؟', ['الْقَمَرَ', 'الشَّمْسَ', 'طَائِرَةً']], ['لِمَاذَا يُضِيءُ الْقَمَرُ؟', ['لِيُسَاعِدَ الْمُسَافِرِينَ', 'لِيَنَامَ', 'لِيَلْعَبَ']]]
    },
    {
      id: 'a2', ic: '🌱', lv: 1, t: 'سَلْمَى وَالْبِذْرَةُ',
      s: ['زَرَعَتْ سَلْمَى بِذْرَةً صَغِيرَةً فِي حَدِيقَةِ الْبَيْتِ.', 'كَانَتْ تَسْقِيهَا بِالْمَاءِ كُلَّ يَوْمٍ.', 'بَعْدَ أَيَّامٍ، خَرَجَتْ وَرَقَةٌ خَضْرَاءُ صَغِيرَةٌ.', 'صَبَرَتْ سَلْمَى، فَكَبِرَتِ النَّبْتَةُ وَصَارَتْ شَجَرَةً.', 'قَالَتْ أُمُّهَا: الصَّبْرُ يَجْعَلُ الْأَشْيَاءَ الصَّغِيرَةَ كَبِيرَةً.'],
      q: [['مَاذَا زَرَعَتْ سَلْمَى؟', ['بِذْرَةً', 'وَرْدَةً', 'نَخْلَةً كَبِيرَةً']], ['بِمَاذَا كَانَتْ تَسْقِيهَا؟', ['بِالْمَاءِ', 'بِالْحَلِيبِ', 'بِالْعَصِيرِ']], ['مَاذَا نَتَعَلَّمُ مِنَ الْقِصَّةِ؟', ['الصَّبْرَ', 'الْغَضَبَ', 'الْكَسَلَ']]]
    },
    {
      id: 'a3', ic: '🐱', lv: 1, t: 'نَمْنَمُ وَالْكُرَةُ',
      s: ['عِنْدَ عُمَرَ قِطٌّ صَغِيرٌ اسْمُهُ نَمْنَمُ.', 'يُحِبُّ نَمْنَمُ اللَّعِبَ بِالْكُرَةِ الْحَمْرَاءِ.', 'ذَاتَ يَوْمٍ، تَدَحْرَجَتِ الْكُرَةُ تَحْتَ السَّرِيرِ.', 'حَاوَلَ نَمْنَمُ أَنْ يُخْرِجَهَا فَلَمْ يَسْتَطِعْ.', 'جَاءَ عُمَرُ وَأَخْرَجَ الْكُرَةَ، فَفَرِحَ نَمْنَمُ وَقَالَ: مِيَاوْ!'],
      q: [['مَا اسْمُ الْقِطِّ؟', ['نَمْنَمُ', 'عُمَرُ', 'بُومِي']], ['مَا لَوْنُ الْكُرَةِ؟', ['حَمْرَاءُ', 'زَرْقَاءُ', 'صَفْرَاءُ']], ['أَيْنَ ذَهَبَتِ الْكُرَةُ؟', ['تَحْتَ السَّرِيرِ', 'فَوْقَ الشَّجَرَةِ', 'فِي الْمَاءِ']]]
    },
    {
      id: 'a4', ic: '🐦', lv: 2, t: 'الْعُصْفُورُ وَالْمَطَرُ',
      s: ['نَزَلَ الْمَطَرُ بِقُوَّةٍ، فَابْتَلَّ عُصْفُورٌ صَغِيرٌ.', 'طَارَ يَبْحَثُ عَنْ مَكَانٍ دَافِئٍ.', 'رَأَتْهُ لَيْلَى مِنَ النَّافِذَةِ، فَوَضَعَتْ لَهُ عُلْبَةً فِيهَا قُطْنٌ.', 'دَخَلَ الْعُصْفُورُ وَنَامَ حَتَّى تَوَقَّفَ الْمَطَرُ.', 'فِي الصَّبَاحِ غَرَّدَ لِلَيْلَى كَأَنَّهُ يَقُولُ: شُكْرًا!'],
      q: [['لِمَاذَا ابْتَلَّ الْعُصْفُورُ؟', ['بِسَبَبِ الْمَطَرِ', 'لِأَنَّهُ سَبَحَ فِي النَّهْرِ', 'بِسَبَبِ الْعَصِيرِ']], ['مَنْ سَاعَدَ الْعُصْفُورَ؟', ['لَيْلَى', 'الْقِطُّ', 'الْقَمَرُ']], ['مَاذَا فَعَلَ الْعُصْفُورُ فِي الصَّبَاحِ؟', ['غَرَّدَ', 'بَكَى', 'نَامَ']]]
    },
    {
      id: 'a5', ic: '🐢', lv: 2, t: 'السُّلَحْفَاةُ وَالْأَرْنَبُ',
      s: ['تَسَابَقَ أَرْنَبٌ سَرِيعٌ وَسُلَحْفَاةٌ بَطِيئَةٌ.', 'جَرَى الْأَرْنَبُ بَعِيدًا، ثُمَّ قَالَ: سَأَنَامُ قَلِيلًا، فَالسُّلَحْفَاةُ بَطِيئَةٌ.', 'أَمَّا السُّلَحْفَاةُ فَمَشَتْ بِهُدُوءٍ وَلَمْ تَتَوَقَّفْ.', 'اسْتَيْقَظَ الْأَرْنَبُ، فَوَجَدَ السُّلَحْفَاةَ قَدْ وَصَلَتْ قَبْلَهُ.', 'تَعَلَّمَ الْأَرْنَبُ أَنَّ الِاجْتِهَادَ أَهَمُّ مِنَ السُّرْعَةِ.'],
      q: [['مَنْ فَازَ بِالسِّبَاقِ؟', ['السُّلَحْفَاةُ', 'الْأَرْنَبُ', 'الْقِطُّ']], ['لِمَاذَا خَسِرَ الْأَرْنَبُ؟', ['لِأَنَّهُ نَامَ', 'لِأَنَّهُ بَطِيءٌ', 'لِأَنَّهُ مَرِضَ']], ['مَا الدَّرْسُ الَّذِي تَعَلَّمَهُ الْأَرْنَبُ؟', ['الِاجْتِهَادُ أَهَمُّ مِنَ السُّرْعَةِ', 'النَّوْمُ أَهَمُّ مِنْ كُلِّ شَيْءٍ', 'السُّرْعَةُ تَكْفِي لِلْفَوْزِ']]]
    },
    {
      id: 'a6', ic: '🏫', lv: 2, t: 'يَوْمٌ فِي الْمَدْرَسَةِ',
      s: ['ذَهَبَ يُوسُفُ إِلَى الْمَدْرَسَةِ مُبَكِّرًا.', 'سَلَّمَ عَلَى مُعَلِّمِهِ، وَجَلَسَ فِي مَقْعَدِهِ.', 'فِي دَرْسِ الْقِرَاءَةِ، قَرَأَ يُوسُفُ قِصَّةً جَمِيلَةً.', 'وَفِي الِاسْتِرَاحَةِ، أَعْطَى صَدِيقَهُ نِصْفَ شَطِيرَتِهِ.', 'عَادَ إِلَى الْبَيْتِ سَعِيدًا، وَحَكَى لِأُمِّهِ عَنْ يَوْمِهِ.'],
      q: [['مَتَى ذَهَبَ يُوسُفُ إِلَى الْمَدْرَسَةِ؟', ['مُبَكِّرًا', 'مُتَأَخِّرًا', 'لَيْلًا']], ['مَاذَا قَرَأَ يُوسُفُ فِي الدَّرْسِ؟', ['قِصَّةً جَمِيلَةً', 'رِسَالَةً قَصِيرَةً', 'أُغْنِيَةً']], ['مَاذَا أَعْطَى صَدِيقَهُ؟', ['نِصْفَ شَطِيرَتِهِ', 'كُرَتَهُ', 'حَقِيبَتَهُ']]]
    },
    {
      id: 'a7', ic: '🐝', lv: 3, t: 'النَّحْلَةُ الْمُجْتَهِدَةُ',
      s: ['تَخْرُجُ النَّحْلَةُ نُونَا كُلَّ صَبَاحٍ إِلَى الْحَقْلِ.', 'تَطِيرُ مِنْ زَهْرَةٍ إِلَى زَهْرَةٍ، وَتَجْمَعُ الرَّحِيقَ.', 'ثُمَّ تَعُودُ إِلَى الْخَلِيَّةِ، وَتَصْنَعُ مَعَ أَخَوَاتِهَا الْعَسَلَ.', 'الْعَسَلُ طَعَامٌ لَذِيذٌ وَمُفِيدٌ.', 'شُكْرًا لِلنَّحْلِ الْمُجْتَهِدِ!'],
      q: [['مَاذَا تَجْمَعُ النَّحْلَةُ مِنَ الزُّهُورِ؟', ['الرَّحِيقَ', 'الْحَصَى', 'الْمَاءَ']], ['أَيْنَ يُصْنَعُ الْعَسَلُ؟', ['فِي الْخَلِيَّةِ', 'فِي الْبَحْرِ', 'فِي الْمَدْرَسَةِ']], ['كَيْفَ يَكُونُ الْعَسَلُ؟', ['لَذِيذًا وَمُفِيدًا', 'مُرًّا', 'مَالِحًا']]]
    },
    {
      id: 'a8', ic: '🥛', lv: 3, t: 'سَامِي يَقُولُ الصِّدْقَ',
      s: ['كَانَ سَامِي يَلْعَبُ بِالْكُرَةِ دَاخِلَ الْبَيْتِ، فَكَسَرَ كُوبًا.', 'خَافَ قَلِيلًا، ثُمَّ ذَهَبَ إِلَى أَبِيهِ.', 'قَالَ: يَا أَبِي، أَنَا كَسَرْتُ الْكُوبَ، وَأَنَا آسِفٌ.', 'ابْتَسَمَ الْأَبُ وَقَالَ: شُكْرًا لِأَنَّكَ صَادِقٌ.', 'هَيَّا نُنَظِّفُ الْمَكَانَ مَعًا، ثُمَّ نَلْعَبُ بِالْكُرَةِ فِي الْحَدِيقَةِ.'],
      q: [['مَاذَا كَسَرَ سَامِي؟', ['كُوبًا', 'نَافِذَةً', 'قَلَمًا']], ['مَاذَا فَعَلَ سَامِي بَعْدَ ذَلِكَ؟', ['قَالَ الصِّدْقَ', 'اخْتَبَأَ', 'هَرَبَ']], ['أَيْنَ سَيَلْعَبَانِ بِالْكُرَةِ؟', ['فِي الْحَدِيقَةِ', 'فِي الْمَطْبَخِ', 'فِي السَّيَّارَةِ']]]
    }
  ];

  const EN = [
    { id: 'e1', ic: '🪁', lv: 1, t: 'Sam and the Red Kite', s: ['Sam has a red kite.', 'He runs in the park.', 'The wind is strong.', 'The kite flies up high.', 'Sam is very happy.'], q: [['What color is the kite?', ['Red', 'Blue', 'Green']], ['Where does Sam run?', ['In the park', 'In the kitchen', 'At school']], ['How does Sam feel?', ['Happy', 'Sad', 'Angry']]] },
    { id: 'e2', ic: '🐶', lv: 1, t: 'The Lost Puppy', s: ['A little puppy is lost.', 'It is cold and hungry.', 'Mia finds the puppy near her house.', 'She gives it milk and a warm blanket.', 'Now the puppy is her best friend.'], q: [['Who finds the puppy?', ['Mia', 'Tom', 'A cat']], ['What does Mia give the puppy?', ['Milk', 'Juice', 'Candy']], ['How is the puppy at first?', ['Cold and hungry', 'Big and strong', 'Happy and full']]] },
    { id: 'e3', ic: '🍅', lv: 2, t: "Ali's Garden", s: ['Ali plants three seeds.', 'He waters them every day.', 'After two weeks, he sees small green leaves.', 'Then he sees red tomatoes!', 'Ali makes a salad with his family.'], q: [['How many seeds does Ali plant?', ['Three', 'Five', 'One']], ['What grows in the garden?', ['Tomatoes', 'Apples', 'Bananas']], ['What does Ali make?', ['A salad', 'A cake', 'A sandwich']]] },
    { id: 'e4', ic: '🌈', lv: 2, t: 'A Rainy Day', s: ['It is raining today.', 'Lina cannot play outside.', 'She reads a book about the sea.', 'She draws a big blue whale.', 'When the rain stops, she sees a rainbow.'], q: [['Why can Lina not play outside?', ['It is raining', 'It is night', 'She is sick']], ['What does Lina draw?', ['A whale', 'A car', 'A tree']], ['What does she see at the end?', ['A rainbow', 'The moon', 'A kite']]] },
    { id: 'e5', ic: '🐟', lv: 2, t: 'Finn the Little Fish', s: ['Finn is a little fish in the sea.', 'One day he sees a big shark.', 'Finn swims fast and hides behind a rock.', 'The shark cannot find him and swims away.', 'Finn is small, but he is smart.'], q: [['What does Finn see?', ['A shark', 'A boat', 'A crab']], ['Where does Finn hide?', ['Behind a rock', 'In a shell', 'Under a boat']], ['What is Finn like?', ['Small and smart', 'Big and slow', 'Sad and lazy']]] },
    { id: 'e6', ic: '🎂', lv: 3, t: "Grandma's Birthday", s: ["Today is Grandma's birthday.", 'Omar and his sister make a card.', 'They draw flowers and write: We love you.', 'Grandma reads the card and smiles.', 'Then they eat cake together.'], q: [['Whose birthday is it?', ["Grandma's", "Omar's", "Dad's"]], ['What do the children make?', ['A card', 'A kite', 'A robot']], ['What do they eat together?', ['Cake', 'Soup', 'Rice']]] },
    { id: 'e7', ic: '🌙', lv: 3, t: 'At Night', s: ['At night the sky is dark.', 'The moon is bright and round.', 'Owls wake up and look for food.', 'Children go to bed and sleep.', 'Good night, world!'], q: [['What is the moon like?', ['Bright and round', 'Dark and small', 'Red and square']], ['Which animal wakes up at night?', ['Owls', 'Chickens', 'Cows']], ['What do children do at night?', ['Sleep', 'Swim', 'Go to school']]] },
    { id: 'e8', ic: '🤖', lv: 3, t: 'Bo the Helpful Robot', s: ['Bo is a small robot.', 'He helps Dad wash the dishes.', 'He helps Mom water the plants.', 'He helps the children clean their room.', 'Everyone says: Thank you, Bo!'], q: [['What is Bo?', ['A robot', 'A dog', 'A teacher']], ['Who does Bo help water the plants?', ['Mom', 'Dad', 'Grandma']], ['What does everyone say?', ['Thank you, Bo!', 'Go away, Bo!', 'Good night, Bo!']]] }
  ];

  const TALK = [
    { id: 'c1', ic: '👋', t: 'Hello!', d: [['A', 'Hello! My name is Adam.'], ['B', 'Hi Adam! I am Sara.'], ['A', 'How are you, Sara?'], ['B', 'I am fine, thank you. And you?'], ['A', 'I am great!']], q: [["What is the boy's name?", ['Adam', 'Sara', 'Omar']], ['How is Sara?', ['Fine', 'Sick', 'Angry']]] },
    { id: 'c2', ic: '🛒', t: 'At the shop', d: [['A', 'Good morning! Can I help you?'], ['B', 'Yes, please. I want two apples.'], ['A', 'Here you are. Anything else?'], ['B', 'No, thank you. How much is it?'], ['A', 'It is one dollar.']], q: [['How many apples does B want?', ['Two', 'Five', 'Ten']], ['How much is it?', ['One dollar', 'Two dollars', 'Free']]] },
    { id: 'c3', ic: '🏫', t: 'At school', d: [['A', 'Can I borrow your pencil, please?'], ['B', 'Of course. Here you are.'], ['A', 'Thank you very much!'], ['B', 'You are welcome.']], q: [['What does A want?', ['A pencil', 'A book', 'A ball']], ['What does B say at the end?', ['You are welcome', 'Good night', 'I am sorry']]] },
    { id: 'c4', ic: '🗺️', t: 'Asking the way', d: [['A', 'Excuse me, where is the library?'], ['B', 'Go straight and turn left.'], ['A', 'Is it far?'], ['B', 'No, it is near the park.'], ['A', 'Thank you!']], q: [['Where does A want to go?', ['The library', 'The park', 'The zoo']], ['Is it far?', ['No, it is near', 'Yes, very far', 'It is closed']]] },
    { id: 'c5', ic: '🩺', t: 'At the doctor', d: [['A', 'What is the matter?'], ['B', 'I have a headache.'], ['A', 'Drink water and rest.'], ['B', 'Thank you, doctor.']], q: [['What is wrong with B?', ['A headache', 'A broken arm', 'A cold nose']], ['What should B do?', ['Drink water and rest', 'Play football', 'Eat candy']]] },
    { id: 'c6', ic: '🤝', t: 'A new friend', d: [['A', 'Do you want to play with me?'], ['B', 'Yes! What do you want to play?'], ['A', 'Let us play football.'], ['B', 'Great idea! Let us go.']], q: [['What do they play?', ['Football', 'Chess', 'Hide and seek']], ['How does B feel?', ['Happy', 'Sad', 'Tired']]] }
  ];

  window.STORIES = { AR, EN, TALK };

  const AD = '٠١٢٣٤٥٦٧٨٩', D = n => String(n).replace(/\d/g, d => AD[d]);
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuf = a => [...a].sort(() => Math.random() - 0.5);
  const best = id => (P.stories || {})[id];
  const stars = id => { const b = best(id); return b == null ? '' : '★'.repeat(b) + '☆'.repeat(3 - b); };
  const sfx = (k, m) => {
    try { window.HurufiSound && HurufiSound.play(k); window.MC && MC.mood(m || (k === 'correct' || k === 'finish' ? 'happy' : 'oops'), 1100); } catch (_) {}
  };

  /* مُشغّل 5 جولات مستقل عن activities.js */
  function run5(title, mk, me) {
    let r = 0, s = 0, alive = true;
    if (window.Lazy && Lazy.onLeave) Lazy.onLeave(() => { alive = false; });
    const nx = () => {
      if (!alive) return;
      if (r >= 5) {
        P.star = (+P.star || 0) + s;
        try { save(); } catch (_) {}
        sfx(s >= 3 ? 'finish' : 'wrong');
        return h(`<section class=sec style="text-align:center"><h1>${s >= 3 ? '🌟' : '💪'}</h1><h2>${D(s)} من ${D(5)}</h2><p>+${D(s)} ⭐</p><button class=big onclick="${me}()">جَوْلَةٌ جَدِيدَةٌ</button><button class=alt onclick="stories()">رُجُوعٌ لِلْقِصَصِ</button></section>`);
      }
      const x = mk();
      h(`<section class=sec><button class=link onclick="stories()">← رُجُوعٌ</button><h2>${title}</h2><p class=mut>${D(r + 1)} مِنْ ٥ · ⭐ ${D(s)}</p>${x.q}<div class=grid>${x.o.map(o => `<button class=opt data-ok=${+o.ok}>${o.t}</button>`).join('')}</div></section>`);
      if (x.say) try { say(x.say, x.sayL || 'en'); } catch (_) {}
      document.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const ok = b.dataset.ok === '1';
        document.querySelectorAll('.opt').forEach(o => { o.disabled = true; if (o.dataset.ok === '1') o.classList.add('ok'); });
        if (ok) { s++; sfx('correct'); } else { b.classList.add('no'); sfx('wrong'); }
        r++;
        setTimeout(nx, 900);
      });
    };
    nx();
  }

  window.stories = function (tab) {
    tab = tab || 'ar';
    window.V = 'sec';
    window.CS = 'stories';
    const L = tab === 'en' ? EN : AR;
    const card = x => `<button class="story-card" onclick="story('${x.id}')"><span>${x.ic}</span><b dir=auto>${esc(x.t)}</b><small>${'⭐'.repeat(x.lv)} ${best(x.id) != null ? '· ' + stars(x.id) : ''}</small></button>`;
    h(`<section class="sec stories"><button class=link onclick="goBack()">← رجوع</button><div class=path-h style="background:linear-gradient(135deg,#9be7b0,#25a43a)"><span>📚</span><div><h2>عَالَمُ الْقِصَصِ وَالْقِرَاءَةِ</h2><p>${window.P && P.gender === 'female' ? 'اِقْرَئِي، اِسْتَمِعِي، ثُمَّ أَجِيبِي' : 'اِقْرَأْ، اِسْتَمِعْ، ثُمَّ أَجِبْ'}</p></div></div>
      <div class=course-filters><button class="${tab === 'ar' ? 'on' : ''}" onclick="stories('ar')">📖 قصص عربية</button><button class="${tab === 'en' ? 'on' : ''}" onclick="stories('en')">📘 English stories</button><button class="${tab === 'talk' ? 'on' : ''}" onclick="stories('talk')">💬 Conversations</button></div>
      ${tab === 'talk'
        ? `<div class=story-grid>${TALK.map(x => `<button class="story-card" onclick="talk('${x.id}')"><span>${x.ic}</span><b dir=ltr>${esc(x.t)}</b><small>${best(x.id) != null ? stars(x.id) : '👂 Listen & answer'}</small></button>`).join('')}</div>`
        : `<div class=story-grid>${L.map(card).join('')}</div>`}
      <h3>🎧 اخْتِبَارَاتُ الْقِصَصِ</h3><div class=list><button class=row onclick="listenTest()"><span>🎧</span><b>Listening test — اسمع واختر</b></button><button class=row onclick="readTest()"><span>👀</span><b>Reading test — اقرأ واختر</b></button></div></section>`);
  };

  const findStory = id => AR.concat(EN).find(x => x.id === id);

  window.story = function (id) {
    const x = findStory(id);
    if (!x) return stories();
    window.V = 'lesson';
    window.CS = 'stories';
    const en = EN.includes(x);
    h(`<section class="sec story" ${en ? 'dir=ltr' : ''}><button class=link onclick="goBack()">${en ? '← Back' : 'رجوع ←'}</button><div class=story-top><span>${x.ic}</span><h2 dir=auto>${esc(x.t)}</h2></div>
      <div class=story-text dir=${en ? 'ltr' : 'rtl'}>${x.s.map((t, i) => `<span class=ss data-i=${i} onclick="storySay('${id}',${i})">${esc(t)}</span>`).join(' ')}</div>
      <p class=mut>${en ? 'Tap a sentence to hear it.' : 'اضغط على أي جملة لتسمعها.'}</p>
      <div class=row style="gap:8px;flex-wrap:wrap;margin-top:8px">
        <button class=alt onclick="storyRead('${id}')">🔊 ${en ? 'Listen to the story' : 'اسمع القصة كاملة'}</button>
        <button class=alt onclick="say.togglePause()">⏸️ ${en ? 'Pause / Resume' : 'إيقاف / استكمال'}</button>
        <button class=alt onclick="say.replay()">🔁 ${en ? 'Replay' : 'إعادة'}</button>
      </div>
      <button class=big onclick="storyQuiz('${id}')">❓ ${en ? 'Answer the questions' : 'أجب عن الأسئلة'}</button></section>`);
  };

  const mark = i => document.querySelectorAll('.ss').forEach(e => e.classList.toggle('now', +e.dataset.i === i));
  window.storySay = (id, i) => { const x = findStory(id); if (!x) return; mark(i); say(x.s[i], EN.includes(x) ? 'en' : 'ar', () => { if (say.state && say.state() !== 'paused') mark(-1); }); };
  window.storyRead = id => {
    const x = findStory(id);
    if (!x) return;
    const l = EN.includes(x) ? 'en' : 'ar';
    let i = 0;
    const nx = () => {
      if (i >= x.s.length || !document.querySelector('.story')) { mark(-1); return; }
      const k = i++;
      mark(k);
      say(x.s[k], l, () => {
        const t = say.tk;
        setTimeout(() => {
          if (say.tk === t && (!say.state || say.state() !== 'paused')) nx();
        }, 200);
      });
    };
    nx();
  };

  function quizOf(x, back, isTalk) {
    const en = isTalk || EN.includes(x), l = en ? 'en' : 'ar';
    let i = 0, s = 0;
    const Q = x.q;
    const nx = () => {
      if (i >= Q.length) {
        P.stories = P.stories || {};
        const st = s === Q.length ? 3 : s >= Q.length - 1 ? 2 : s ? 1 : 0;
        P.stories[x.id] = Math.max(st, P.stories[x.id] || 0);
        P.star = (+P.star || 0) + s;
        save();
        sfx(s >= Q.length - 1 ? 'finish' : 'wrong');
        return h(`<section class=sec style="text-align:center"><h1>${s === Q.length ? '🌟' : '💪'}</h1><h2>${s} / ${Q.length}</h2><p>+${s} ⭐</p><button class=big onclick="${back}">${en ? 'Again' : 'أعد القراءة'}</button><button class=alt onclick="stories('${isTalk ? 'talk' : en ? 'en' : 'ar'}')">${en ? 'More stories' : 'قصص أخرى'}</button></section>`);
      }
      const [q, opts] = Q[i], right = opts[0];
      window.V = 'lesson';
      h(`<section class=sec ${en ? 'dir=ltr' : ''}><p class=mut>${i + 1} / ${Q.length} · ⭐ ${s}</p><div class=bub dir=auto>❓ ${esc(q)}</div><div class=grid>${shuf(opts).map(o => `<button class=opt dir=auto data-ok=${+(o === right)}>${esc(o)}</button>`).join('')}</div></section>`);
      try { say(q, l); } catch (_) {}
      document.querySelectorAll('.opt').forEach(b => b.onclick = () => {
        const ok = b.dataset.ok === '1';
        document.querySelectorAll('.opt').forEach(o => { o.disabled = 1; if (o.dataset.ok === '1') o.classList.add('ok'); });
        if (!ok) b.classList.add('no');
        sfx(ok ? 'correct' : 'wrong');
        if (ok) s++; else try { say((en ? 'The answer is: ' : 'الْإِجَابَةُ: ') + right, l, null, 'soft'); } catch (_) {}
        i++;
        setTimeout(nx, ok ? 900 : 2200);
      });
    };
    nx();
  }

  window.storyQuiz = id => quizOf(findStory(id), `story('${id}')`);

  window.talk = function (id) {
    const x = TALK.find(t => t.id === id);
    if (!x) return stories('talk');
    window.V = 'lesson';
    window.CS = 'stories';
    h(`<section class="sec story" dir=ltr><button class=link onclick="goBack()">← Back</button><div class=story-top><span>${x.ic}</span><h2>${esc(x.t)}</h2></div>
      <div class=dialog>${x.d.map((r, i) => `<button class="dl ${r[0] === 'A' ? 'a' : 'b'}" data-i=${i} onclick="talkSay('${id}',${i})"><i>${r[0] === 'A' ? '🧒' : '👧'}</i><span>${esc(r[1])}</span></button>`).join('')}</div>
      <div class=row style="gap:8px;flex-wrap:wrap;margin-top:8px">
        <button class=alt onclick="talkRead('${id}')">🔊 Listen to the conversation</button>
        <button class=alt onclick="say.togglePause()">⏸️ Pause / Resume</button>
        <button class=alt onclick="say.replay()">🔁 Replay</button>
      </div>
      <button class=big onclick="talkQuiz('${id}')">❓ Answer the questions</button></section>`);
  };

  const tmark = i => document.querySelectorAll('.dl').forEach(e => e.classList.toggle('now', +e.dataset.i === i));
  window.talkSay = (id, i) => { const x = TALK.find(t => t.id === id); if (!x) return; tmark(i); say(x.d[i][1], 'en', () => { if (say.state && say.state() !== 'paused') tmark(-1); }); };
  window.talkRead = id => {
    const x = TALK.find(t => t.id === id);
    if (!x) return;
    let i = 0;
    const nx = () => {
      if (i >= x.d.length || !document.querySelector('.dialog')) { tmark(-1); return; }
      const k = i++;
      tmark(k);
      say(x.d[k][1], 'en', () => {
        const t = say.tk;
        setTimeout(() => {
          if (say.tk === t && (!say.state || say.state() !== 'paused')) nx();
        }, 250);
      });
    };
    nx();
  };
  window.talkQuiz = id => quizOf(TALK.find(t => t.id === id), `talk('${id}')`, true);

  const enWords = () => S.flatMap(s => s.u).filter(u => u.l === 'en').flatMap(u => u.i).filter(x => /\p{Extended_Pictographic}/u.test(x[1]) && x[1].length <= 4 && !/\s/.test(x[0]));
  window.listenTest = () => {
    window.V = 'lesson';
    run5('🎧 Listening test', () => {
      const W = enWords(), it = W[Math.floor(Math.random() * W.length)], o = new Map([[it[1], 1]]);
      let g = 0;
      while (o.size < 4 && g++ < 40) {
        const z = W[Math.floor(Math.random() * W.length)];
        if (!o.has(z[1])) o.set(z[1], 0);
      }
      return {
        q: `<div class=q>🔊</div><button class=alt onclick="say('${it[0].replace(/'/g, "\\'")}','en')">🔊 Listen again</button>`,
        o: shuf([...o].map(([t, ok]) => ({ t, ok: !!ok }))),
        say: it[0]
      };
    }, 'listenTest');
  };

  const RT = [
    ['The cat is sleeping.', '😺💤', ['🐶🏃', '🐟🌊']],
    ['I eat a red apple.', '🍎', ['🍌', '🍇']],
    ['The sun is hot.', '☀️🔥', ['🌧️', '❄️']],
    ['A bird can fly.', '🐦✈️', ['🐢', '🐟']],
    ['I read a book.', '📖', ['⚽', '🚗']],
    ['The baby is crying.', '👶😢', ['👶😀', '🧓😴']],
    ['It is snowing.', '❄️⛄', ['☀️🏖️', '🌧️☔']],
    ['The fish swims in the sea.', '🐟🌊', ['🐦🌳', '🐄🌾']],
    ['We play football.', '⚽', ['🎹', '📚']],
    ['The car is fast.', '🚗💨', ['🐌', '🐢']]
  ];
  window.readTest = () => {
    window.V = 'lesson';
    run5('👀 Reading test', () => {
      const r = RT[Math.floor(Math.random() * RT.length)];
      return {
        q: `<div class=q dir=ltr style="font-size:1.6rem">${esc(r[0])}</div>`,
        o: shuf([{ t: r[1], ok: true }, ...r[2].map(t => ({ t, ok: false }))])
      };
    }, 'readTest');
  };
})();
