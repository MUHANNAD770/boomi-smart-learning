/* /src/stories/stories2.js — القصص الإضافية الموحّدة (عربية وإنجليزية ومحادثات) تُضاف إلى window.STORIES */
(() => {
  'use strict';
  const ST = window.STORIES;
  if (!ST) return;
  const add = (arr, list) => list.forEach(x => { if (!arr.some(y => y.id === x.id)) arr.push(x); });

  add(ST.AR, [
    {
      id: 'a9', ic: '🐢', lv: 1, t: 'السُّلَحْفَاةُ الْمُجْتَهِدَةُ',
      s: ['كَانَتْ سُلَحْفَاةٌ صَغِيرَةٌ تَمْشِي بِبُطْءٍ فِي الْغَابَةِ.', 'ضَحِكَ الْأَرْنَبُ وَقَالَ: أَنْتِ بَطِيئَةٌ جِدًّا!', 'قَالَتِ السُّلَحْفَاةُ: هَيَّا نَتَسَابَقْ إِلَى الشَّجَرَةِ الْكَبِيرَةِ.', 'رَكَضَ الْأَرْنَبُ بِسُرْعَةٍ، ثُمَّ نَامَ تَحْتَ ظِلِّ شَجَرَةٍ.', 'مَشَتِ السُّلَحْفَاةُ بِلَا تَوَقُّفٍ حَتَّى وَصَلَتْ أَوَّلًا.', 'تَعَلَّمَ الْأَرْنَبُ أَنَّ الِاجْتِهَادَ أَهَمُّ مِنَ السُّرْعَةِ.'],
      q: [['مَنْ فَازَ فِي السِّبَاقِ؟', ['السُّلَحْفَاةُ', 'الْأَرْنَبُ', 'الثَّعْلَبُ']], ['مَاذَا فَعَلَ الْأَرْنَبُ فِي الطَّرِيقِ؟', ['نَامَ تَحْتَ شَجَرَةٍ', 'أَكَلَ جَزَرًا', 'سَبَحَ فِي النَّهْرِ']], ['مَاذَا تَعَلَّمَ الْأَرْنَبُ؟', ['الِاجْتِهَادُ أَهَمُّ مِنَ السُّرْعَةِ', 'النَّوْمُ مُفِيدٌ دَائِمًا', 'الْغَابَةُ كَبِيرَةٌ']]]
    },
    {
      id: 'a10', ic: '🧸', lv: 1, t: 'غُرْفَةُ مَرْيَمَ',
      s: ['كَانَتْ غُرْفَةُ مَرْيَمَ مُبَعْثَرَةً، وَالْأَلْعَابُ عَلَى الْأَرْضِ.', 'أَرَادَتْ مَرْيَمُ أَنْ تَلْعَبَ بِدُمْيَتِهَا، فَلَمْ تَجِدْهَا.', 'قَالَتْ أُمُّهَا: هَيَّا نُرَتِّبُ الْغُرْفَةَ مَعًا.', 'وَضَعَتْ مَرْيَمُ الْكُتُبَ عَلَى الرَّفِّ، وَالْأَلْعَابَ فِي الصُّنْدُوقِ.', 'وَجَدَتِ الدُّمْيَةَ تَحْتَ الْوِسَادَةِ، فَفَرِحَتْ كَثِيرًا.'],
      q: [['لِمَاذَا لَمْ تَجِدْ مَرْيَمُ دُمْيَتَهَا؟', ['لِأَنَّ الْغُرْفَةَ مُبَعْثَرَةٌ', 'لِأَنَّهَا نَائِمَةٌ', 'لِأَنَّ الدُّمْيَةَ فِي السُّوقِ']], ['أَيْنَ وَضَعَتِ الْكُتُبَ؟', ['عَلَى الرَّفِّ', 'فِي الصُّنْدُوقِ', 'تَحْتَ السَّرِيرِ']], ['أَيْنَ وَجَدَتِ الدُّمْيَةَ؟', ['تَحْتَ الْوِسَادَةِ', 'فِي الْمَطْبَخِ', 'فِي الْحَدِيقَةِ']]]
    },
    {
      id: 'a11', ic: '🏮', lv: 2, t: 'فَانُوسُ يُوسُفَ',
      s: ['اقْتَرَبَ شَهْرُ رَمَضَانَ، فَفَرِحَ يُوسُفُ كَثِيرًا.', 'صَنَعَ مَعَ أَبِيهِ فَانُوسًا مُلَوَّنًا مِنَ الْوَرَقِ.', 'عَلَّقَا الْفَانُوسَ عَلَى نَافِذَةِ الْبَيْتِ.', 'فِي الْمَسَاءِ، أَضَاءَ الْفَانُوسُ بِأَلْوَانٍ جَمِيلَةٍ.', 'قَالَ يُوسُفُ: سَأَصْنَعُ فَانُوسًا مِثْلَهُ لِجَارِنَا الصَّغِيرِ.'],
      q: [['مَعَ مَنْ صَنَعَ يُوسُفُ الْفَانُوسَ؟', ['مَعَ أَبِيهِ', 'مَعَ جَدِّهِ', 'وَحْدَهُ']], ['مِمَّ صُنِعَ الْفَانُوسُ؟', ['مِنَ الْوَرَقِ', 'مِنَ الْحَدِيدِ', 'مِنَ الزُّجَاجِ']], ['مَاذَا قَرَّرَ يُوسُفُ أَنْ يَفْعَلَ؟', ['أَنْ يَصْنَعَ فَانُوسًا لِجَارِهِ', 'أَنْ يَنَامَ مُبَكِّرًا', 'أَنْ يَشْتَرِيَ حَلْوَى']]]
    },
    {
      id: 'a12', ic: '🐝', lv: 2, t: 'النَّحْلَةُ نُورَةُ',
      s: ['تَسْتَيْقِظُ النَّحْلَةُ نُورَةُ مَعَ شُرُوقِ الشَّمْسِ.', 'تَطِيرُ مِنْ زَهْرَةٍ إِلَى زَهْرَةٍ لِتَجْمَعَ الرَّحِيقَ.', 'تَعُودُ إِلَى الْخَلِيَّةِ وَتُسَاعِدُ أَخَوَاتِهَا فِي صُنْعِ الْعَسَلِ.', 'سَأَلَتْهَا فَرَاشَةٌ: أَلَا تَتْعَبِينَ؟', 'قَالَتْ نُورَةُ: الْعَمَلُ مَعَ الْأَصْدِقَاءِ يَجْعَلُنِي سَعِيدَةً.'],
      q: [['مَاذَا تَجْمَعُ النَّحْلَةُ مِنَ الْأَزْهَارِ؟', ['الرَّحِيقَ', 'الْمَاءَ', 'الرَّمْلَ']], ['مَاذَا يَصْنَعُ النَّحْلُ فِي الْخَلِيَّةِ؟', ['الْعَسَلَ', 'الْحَلِيبَ', 'الْخُبْزَ']], ['مَنْ سَأَلَ نُورَةَ؟', ['فَرَاشَةٌ', 'عُصْفُورٌ', 'قِطَّةٌ']]]
    },
    {
      id: 'a13', ic: '🚦', lv: 2, t: 'سَالِمٌ وَالْإِشَارَةُ',
      s: ['خَرَجَ سَالِمٌ مَعَ جَدِّهِ إِلَى الْمَكْتَبَةِ.', 'وَقَفَا عِنْدَ الْإِشَارَةِ، وَكَانَ لَوْنُهَا أَحْمَرَ.', 'قَالَ الْجَدُّ: الْأَحْمَرُ يَعْنِي قِفْ، وَالْأَخْضَرُ يَعْنِي امْشِ.', 'عِنْدَمَا صَارَ اللَّوْنُ أَخْضَرَ، عَبَرَا الشَّارِعَ مِنْ مَمَرِّ الْمُشَاةِ.', 'قَالَ سَالِمٌ: سَأَنْتَبِهُ دَائِمًا لِلْإِشَارَةِ.'],
      q: [['إِلَى أَيْنَ ذَهَبَ سَالِمٌ؟', ['إِلَى الْمَكْتَبَةِ', 'إِلَى الْبَحْرِ', 'إِلَى السُّوقِ']], ['مَاذَا يَعْنِي اللَّوْنُ الْأَحْمَرُ؟', ['قِفْ', 'امْشِ', 'ارْكُضْ']], ['مِنْ أَيْنَ عَبَرَا الشَّارِعَ؟', ['مِنْ مَمَرِّ الْمُشَاةِ', 'مِنْ بَيْنِ السَّيَّارَاتِ', 'مِنْ فَوْقِ السُّورِ']]]
    },
    {
      id: 'a14', ic: '📚', lv: 3, t: 'الْكِتَابُ الْعَجِيبُ',
      s: ['وَجَدَ آدَمُ فِي مَكْتَبَةِ الْمَدْرَسَةِ كِتَابًا قَدِيمًا عَنِ الْبِحَارِ.', 'قَرَأَ فِيهِ عَنِ الْحِيتَانِ الضَّخْمَةِ وَالْأَسْمَاكِ الْمُلَوَّنَةِ.', 'كُلَّمَا قَلَبَ صَفْحَةً، تَعَلَّمَ شَيْئًا جَدِيدًا.', 'فِي الْيَوْمِ التَّالِي، حَكَى لِأَصْدِقَائِهِ مَا قَرَأَ.', 'قَالَتِ الْمُعَلِّمَةُ: الْقِرَاءَةُ تَأْخُذُنَا فِي رِحْلَاتٍ دُونَ أَنْ نُسَافِرَ.', 'ابْتَسَمَ آدَمُ وَقَرَّرَ أَنْ يَقْرَأَ كِتَابًا كُلَّ أُسْبُوعٍ.'],
      q: [['عَنْ مَاذَا كَانَ الْكِتَابُ؟', ['عَنِ الْبِحَارِ', 'عَنِ الْفَضَاءِ', 'عَنِ الطَّبْخِ']], ['أَيْنَ وَجَدَ آدَمُ الْكِتَابَ؟', ['فِي مَكْتَبَةِ الْمَدْرَسَةِ', 'فِي السُّوقِ', 'فِي الْحَدِيقَةِ']], ['مَاذَا قَرَّرَ آدَمُ؟', ['أَنْ يَقْرَأَ كِتَابًا كُلَّ أُسْبُوعٍ', 'أَنْ يُسَافِرَ إِلَى الْبَحْرِ', 'أَنْ يَتْرُكَ الْقِرَاءَةَ']]]
    },
    {
      id: 'a20', ic: '🐪', lv: 1, t: 'الْجَمَلُ الصَّدِيقُ',
      s: ['فِي الصَّحْرَاءِ جَمَلٌ كَبِيرٌ اسْمُهُ نَجْمٌ.', 'يَحْمِلُ نَجْمٌ الْمَاءَ وَالطَّعَامَ لِلْمُسَافِرِينَ.', 'هَبَّتْ رِيحٌ قَوِيَّةٌ وَضَاعَ الطَّرِيقُ.', 'عَرَفَ نَجْمٌ الطَّرِيقَ إِلَى الْوَاحَةِ.', 'شَرِبَ الْجَمِيعُ وَشَكَرُوا الْجَمَلَ الذَّكِيَّ.'],
      q: [['مَا اسْمُ الْجَمَلِ؟', ['نَجْمٌ', 'سَلْمَى', 'بُومِي']], ['مَاذَا يَحْمِلُ الْجَمَلُ؟', ['الْمَاءَ وَالطَّعَامَ', 'الْكُتُبَ', 'الْأَلْعَابَ']], ['إِلَى أَيْنَ أَوْصَلَهُمُ الْجَمَلُ؟', ['إِلَى الْوَاحَةِ', 'إِلَى الْبَحْرِ', 'إِلَى الْمَدِينَةِ']]]
    },
    {
      id: 'a21', ic: '💧', lv: 2, t: 'قَطْرَةُ الْمَاءِ الْمُسَافِرَةُ',
      s: ['قَطْرَةُ مَاءٍ تَعِيشُ فِي الْبَحْرِ.', 'سَخَّنَتْهَا الشَّمْسُ فَصَعِدَتْ إِلَى السَّمَاءِ بُخَارًا.', 'صَارَتْ جُزْءًا مِنْ غَيْمَةٍ بَيْضَاءَ.', 'بَرَدَتِ الْغَيْمَةُ فَنَزَلَتِ الْقَطْرَةُ مَطَرًا.', 'جَرَتْ فِي النَّهْرِ وَعَادَتْ إِلَى الْبَحْرِ.'],
      q: [['أَيْنَ تَعِيشُ الْقَطْرَةُ فِي الْبِدَايَةِ؟', ['فِي الْبَحْرِ', 'فِي الصَّحْرَاءِ', 'فِي الثَّلَّاجَةِ']], ['لِمَاذَا صَعِدَتْ إِلَى السَّمَاءِ؟', ['لِأَنَّ الشَّمْسَ سَخَّنَتْهَا', 'لِأَنَّهَا طَارَتْ بِجَنَاحَيْنِ', 'لِأَنَّ الرِّيحَ حَمَلَتْهَا']], ['كَيْفَ نَزَلَتْ مِنَ الْغَيْمَةِ؟', ['مَطَرًا', 'ثَلْجًا', 'حَجَرًا']]]
    },
    {
      id: 'a22', ic: '🚌', lv: 2, t: 'رِحْلَةُ الْمَدْرَسَةِ',
      s: ['ذَهَبَ الطُّلَّابُ فِي رِحْلَةٍ إِلَى الْمُتْحَفِ.', 'رَأَوْا عِظَامَ دَيْنَاصُورٍ كَبِيرٍ.', 'سَأَلَ عُمَرُ: كَمْ عُمْرُ هَذَا الدَّيْنَاصُورِ؟', 'قَالَتِ الْمُعَلِّمَةُ: عَاشَ قَبْلَ مَلَايِينِ السِّنِينَ.', 'كَتَبَ الطُّلَّابُ مَا تَعَلَّمُوهُ فِي دَفَاتِرِهِمْ.'],
      q: [['إِلَى أَيْنَ ذَهَبَ الطُّلَّابُ؟', ['إِلَى الْمُتْحَفِ', 'إِلَى الْبَحْرِ', 'إِلَى السُّوقِ']], ['مَاذَا رَأَوْا؟', ['عِظَامَ دَيْنَاصُورٍ', 'طَائِرَةً', 'قِطَّةً']], ['مَاذَا فَعَلَ الطُّلَّابُ فِي النِّهَايَةِ؟', ['كَتَبُوا مَا تَعَلَّمُوهُ', 'نَامُوا', 'لَعِبُوا الْكُرَةَ']]]
    },
    {
      id: 'a23', ic: '🤝', lv: 3, t: 'الصَّدِيقُ الْجَدِيدُ',
      s: ['جَاءَ طَالِبٌ جَدِيدٌ اسْمُهُ يُوسُفُ إِلَى الصَّفِّ.', 'كَانَ خَجُولًا وَجَلَسَ وَحْدَهُ فِي الِاسْتِرَاحَةِ.', 'اقْتَرَبَ مِنْهُ سَعِيدٌ وَقَالَ: هَلْ تَلْعَبُ مَعَنَا؟', 'ابْتَسَمَ يُوسُفُ وَلَعِبَ مَعَ الْأَصْدِقَاءِ.', 'قَالَ يُوسُفُ: الْكَلِمَةُ الطَّيِّبَةُ تَصْنَعُ صَدِيقًا.'],
      q: [['مَا اسْمُ الطَّالِبِ الْجَدِيدِ؟', ['يُوسُفُ', 'سَعِيدٌ', 'عُمَرُ']], ['كَيْفَ كَانَ يُوسُفُ فِي الْبِدَايَةِ؟', ['خَجُولًا', 'غَاضِبًا', 'نَائِمًا']], ['مَاذَا تَصْنَعُ الْكَلِمَةُ الطَّيِّبَةُ؟', ['صَدِيقًا', 'مُشْكِلَةً', 'ضَجِيجًا']]]
    },
    {
      id: 'a24', ic: '🌴', lv: 2, t: 'سَلَّةُ التَّمْرِ',
      s: ['قَطَفَ جَدُّ مَرْوَانَ تَمْرًا كَثِيرًا مِنَ النَّخْلَةِ.', 'وَضَعَ مَرْوَانُ التَّمْرَ فِي سَلَّةٍ كَبِيرَةٍ.', 'قَالَ الْجَدُّ: لِنُعْطِ الْجِيرَانَ مِنْ هَذَا الْخَيْرِ.', 'حَمَلَ مَرْوَانُ السَّلَّةَ إِلَى بُيُوتِ الْجِيرَانِ.', 'فَرِحَ الْجِيرَانُ، وَشَعَرَ مَرْوَانُ بِسَعَادَةٍ كَبِيرَةٍ.'],
      q: [['مِنْ أَيْنَ قَطَفَ الْجَدُّ التَّمْرَ؟', ['مِنَ النَّخْلَةِ', 'مِنَ السُّوقِ', 'مِنَ الثَّلَّاجَةِ']], ['أَيْنَ وَضَعَ مَرْوَانُ التَّمْرَ؟', ['فِي سَلَّةٍ كَبِيرَةٍ', 'فِي حَقِيبَتِهِ', 'فِي الصُّنْدُوقِ']], ['لِمَنْ أَعْطَى مَرْوَانُ التَّمْرَ؟', ['لِلْجِيرَانِ', 'لِلْقِطَّةِ', 'لِلْمُعَلِّمِ']]]
    }
  ]);

  add(ST.EN, [
    { id: 'e9', ic: '🐘', lv: 1, t: 'Ella the Elephant', s: ['Ella is a big gray elephant.', 'She lives near a river.', 'She likes to spray water with her trunk.', 'The little birds play in the water too.', 'Everyone has fun with Ella.'], q: [['What color is Ella?', ['Gray', 'Pink', 'Green']], ['Where does Ella live?', ['Near a river', 'In a city', 'In a tree']], ['What does Ella spray?', ['Water', 'Milk', 'Sand']]] },
    { id: 'e10', ic: '🚲', lv: 1, t: 'My New Bike', s: ['Omar has a new bike.', 'It is blue and fast.', 'At first, he falls down.', 'His dad helps him try again.', 'Now Omar can ride very well!'], q: [['What color is the bike?', ['Blue', 'Red', 'Black']], ['Who helps Omar?', ['His dad', 'His teacher', 'His sister']], ['Can Omar ride now?', ['Yes, very well', 'No, never', 'Only at night']]] },
    { id: 'e11', ic: '🧁', lv: 2, t: 'Baking with Grandma', s: ['On Friday, Sara visits her grandma.', 'They bake cupcakes in the kitchen.', 'Sara mixes the flour, eggs, and milk.', 'Grandma puts the cupcakes in the oven.', 'They share the cupcakes with the neighbors.'], q: [['When does Sara visit her grandma?', ['On Friday', 'On Monday', 'Every night']], ['What do they bake?', ['Cupcakes', 'Bread', 'Pizza']], ['Who do they share the cupcakes with?', ['The neighbors', 'The teacher', 'The cat']]] },
    { id: 'e12', ic: '🌟', lv: 2, t: 'The Shy Star', s: ['There is a small star in the sky.', 'It is shy and hides behind the clouds.', 'One night, a little girl is lost in the desert.', 'The small star shines brightly to show her the way.', 'Now the star is not shy anymore.'], q: [['Where does the star hide?', ['Behind the clouds', 'Under the sea', 'In a box']], ['Who is lost?', ['A little girl', 'A dog', 'A teacher']], ['What does the star do?', ['It shines to show the way', 'It goes to sleep', 'It falls down']]] },
    { id: 'e13', ic: '⚽', lv: 3, t: 'The Team Game', s: ['Our class has a football game today.', 'Khalid wants to score all the goals alone.', 'He does not pass the ball, so the team loses the first half.', 'The coach says, "A team wins together."', 'In the second half, Khalid passes the ball, and his friend scores!', 'The class learns that teamwork is important.'], q: [['What game does the class play?', ['Football', 'Basketball', 'Tennis']], ["What is Khalid's mistake?", ['He does not pass the ball', 'He comes late', 'He forgets his shoes']], ['What does the class learn?', ['Teamwork is important', 'Winning is everything', 'Football is boring']]] },
    { id: 'e14', ic: '🚀', lv: 3, t: 'A Trip to Space', s: ['Noor dreams of going to space.', 'In her dream, she flies in a silver rocket.', 'She sees the Earth, blue and beautiful, from far away.', 'She waves to the Moon and counts the stars.', 'When she wakes up, she decides to study science.', 'Maybe one day, her dream will come true.'], q: [['How does Noor go to space in her dream?', ['In a rocket', 'On a plane', 'On a horse']], ['What color is the Earth?', ['Blue', 'Yellow', 'Purple']], ['What does Noor decide?', ['To study science', 'To stop dreaming', 'To sleep more']]] },
    { id: 'e20', ic: '🐱', lv: 1, t: 'The Hungry Cat', s: ['This is Mimi.', 'Mimi is a little white cat.', 'Mimi is hungry.', 'Mom gives her some milk.', 'Now Mimi is happy and sleeps.'], q: [['What color is Mimi?', ['White', 'Black', 'Red']], ['What does Mom give Mimi?', ['Milk', 'Bread', 'An apple']], ['What does Mimi do at the end?', ['She sleeps', 'She runs', 'She sings']]] },
    { id: 'e21', ic: '🎒', lv: 1, t: 'My School Bag', s: ['I have a school bag.', 'In my bag there is a book.', 'There are two pencils.', 'There is an apple for lunch.', 'I am ready for school!'], q: [['What is in the bag?', ['A book', 'A cat', 'A ball']], ['How many pencils are there?', ['Two', 'Five', 'Ten']], ['What is for lunch?', ['An apple', 'A pizza', 'A cake']]] },
    { id: 'e22', ic: '🦁', lv: 2, t: 'The Lion and the Mouse', s: ['A big lion is sleeping.', 'A little mouse runs on his nose.', 'The lion wakes up and catches the mouse.', 'Please let me go, I will help you one day, says the mouse.', 'Later the mouse helps the lion and they become friends.'], q: [['Who is sleeping?', ['A big lion', 'A little mouse', 'A bird']], ['What does the mouse say?', ['I will help you one day', 'I am hungry', 'Good night']], ['What happens at the end?', ['They become friends', 'The lion eats the mouse', 'The mouse goes home']]] },
    { id: 'e23', ic: '⛄', lv: 2, t: 'The Snowman', s: ['It is a cold winter day.', 'Yusuf and his sister make a snowman.', 'They give him a carrot nose and a red hat.', 'The snowman looks funny and happy.', 'In the afternoon the sun is warm, and the snowman melts.'], q: [['What do they make?', ['A snowman', 'A cake', 'A kite']], ['What is the snowman’s nose?', ['A carrot', 'A banana', 'A stone']], ['Why does the snowman melt?', ['The sun is warm', 'It is raining', 'The wind is strong']]] },
    { id: 'e24', ic: '🦒', lv: 3, t: 'A Day at the Zoo', s: ['On Saturday, our class visits the zoo.', 'First, we see a tall giraffe eating leaves from a tree.', 'Then we watch the monkeys jumping and playing.', 'The zookeeper tells us that elephants drink a lot of water every day.', 'Before we go home, we draw our favorite animal in our notebooks.'], q: [['When does the class visit the zoo?', ['On Saturday', 'On Monday', 'At night']], ['What is the giraffe eating?', ['Leaves', 'Fish', 'Bananas']], ['What do the children do before they go home?', ['They draw their favorite animal', 'They swim', 'They feed the lions']]] }
  ]);

  add(ST.TALK, [
    { id: 'c7', ic: '🛒', t: 'At the market', d: [['A', 'Good morning! I want some apples, please.'], ['B', 'Red or green?'], ['A', 'Red, please. How much are they?'], ['B', 'Two riyals.'], ['A', 'Here you are. Thank you!']], q: [['What does A want?', ['Apples', 'Bananas', 'Milk']], ['How much are the apples?', ['Two riyals', 'Ten riyals', 'They are free']]] },
    { id: 'c8', ic: '📞', t: 'On the phone', d: [['A', 'Hello, this is Sara. Can I speak to Mona?'], ['B', 'Hi Sara! This is Mona.'], ['A', 'Do you want to come to my party?'], ['B', 'Yes, I would love to! When is it?'], ['A', 'On Saturday at five.']], q: [['Who is calling?', ['Sara', 'Mona', 'Dad']], ['When is the party?', ['On Saturday at five', 'On Monday morning', 'Tonight']]] },
    { id: 'c9', ic: '🏫', t: 'First day at school', d: [['A', 'Hi! I am Ali. Are you new here?'], ['B', 'Yes, my name is Adam.'], ['A', 'Welcome! Do you like drawing?'], ['B', 'Yes, I love drawing animals.'], ['A', 'Me too! Let us sit together.']], q: [["What is the new boy's name?", ['Adam', 'Ali', 'Omar']], ['What does Adam love?', ['Drawing animals', 'Swimming', 'Cooking']]] },
    { id: 'c20', ic: '🍽️', t: 'At the restaurant', d: [['A', 'Good evening! Are you ready to order?'], ['B', 'Yes, please. I would like chicken and rice.'], ['A', 'Anything to drink?'], ['B', 'Orange juice, please.'], ['A', 'Here you are. Enjoy your meal!']], q: [['What does B want to eat?', ['Chicken and rice', 'Pizza', 'Fish']], ['What does B want to drink?', ['Orange juice', 'Milk', 'Tea']], ['Is it morning or evening?', ['Evening', 'Morning', 'Noon']]] },
    { id: 'c21', ic: '📚', t: 'At the library', d: [['A', 'Hello! Can I help you?'], ['B', 'Yes, please. I am looking for a book about animals.'], ['A', 'Animal books are on the blue shelf.'], ['B', 'Thank you! Can I take two books?'], ['A', 'Yes, you can. Please bring them back next week.']], q: [['What book does B want?', ['A book about animals', 'A book about cars', 'A cook book']], ['Where are the animal books?', ['On the blue shelf', 'On the table', 'In the box']], ['When must B bring the books back?', ['Next week', 'Tomorrow', 'Next year']]] }
  ]);
})();
