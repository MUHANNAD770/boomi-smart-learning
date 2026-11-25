/* /src/activities/puzzles.js — جزيرة الألغاز، الإملاء البصري والمتقدم، تقطيع الكلمات لمقاطع، وتحدّيات اللغة */
(() => {
  'use strict';

  const esc = window.esc || (s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
  const sh = window.shuf || (a => [...a].sort(() => Math.random() - 0.5));
  const pk = window.pk || (a => a[Math.floor(Math.random() * a.length)]);
  const D = window.D || (n => String(n));
  const stripD0 = s => String(s || '').replace(/[\u064B-\u0652\u0670\u0640]/g, '').trim();
  const say1 = (t, l) => { try { if (!(window.muted && muted())) say(t, l || 'ar'); } catch (_) {} };
  const sfx = k => { try { window.HurufiSound && HurufiSound.play(k); } catch (_) {} };
  const mood = (m, ms) => { try { window.MC && MC.mood && MC.mood(m, ms || 1200); } catch (_) {} };
  const grs = w => String(w || '').match(/[\u0621-\u064A\u0671][\u064B-\u0652\u0670]*/g) || [];

  const getWordPool = lang => {
    const out = [], seen = new Set();
    try {
      for (const st of (window.S || [])) {
        for (const u of (st.u || [])) {
          if (u.l !== lang) continue;
          for (const it of (u.i || [])) {
            const w = String(it[0] || '').trim();
            const pic = String(it[1] || '').trim();
            if (!w || /\s/.test(w) || seen.has(w)) continue;
            if (!/\p{Extended_Pictographic}/u.test(pic)) continue;
            const len = lang === 'ar' ? stripD0(w).length : w.length;
            if (len < 2 || len > 7) continue;
            seen.add(w);
            out.push({ w, pic, l: lang });
          }
        }
      }
    } catch (_) {}
    if (out.length < 8) {
      const fb = lang === 'en'
        ? [['Cat', '🐱'], ['Dog', '🐶'], ['Apple', '🍎'], ['Sun', '☀️'], ['Moon', '🌙'], ['Book', '📖'], ['Fish', '🐟'], ['Bird', '🐦']]
        : [['أَسَدٌ', '🦁'], ['بَيْتٌ', '🏠'], ['تُفَّاحٌ', '🍎'], ['جَمَلٌ', '🐪'], ['شَمْسٌ', '☀️'], ['قَمَرٌ', '🌙'], ['كِتَابٌ', '📖'], ['سَمَكَةٌ', '🐟']];
      fb.forEach(([w, pic]) => { if (!seen.has(w)) out.push({ w, pic, l: lang }); });
    }
    return out;
  };

  /* ── ١) الألغاز اللغوية ── */
  const RIDDLES = [
    { q: 'أَنَا أُضِيءُ النَّهَارَ وَأَمْنَحُ الْأَرْضَ الدِّفْءَ، مَنْ أَنَا؟', a: 'الشَّمْسُ ☀️', o: ['الْقَمَرُ 🌙', 'الْمَطَرُ 🌧️', 'السَّحَابُ ☁️'], ex: 'الشَّمْسُ تَطْلُعُ نَهَارًا وَتُضِيءُ السَّمَاءَ.' },
    { q: 'لِي أَوْرَاقٌ كَثِيرَةٌ وَلَسْتُ شَجَرَةً، وَتَتَعَلَّمُ مِنِّي الْكَلِمَاتِ، مَنْ أَنَا؟', a: 'الْكِتَابُ 📖', o: ['الْقَلَمُ ✏️', 'الْكُرَةُ ⚽', 'السَّاعَةُ ⏰'], ex: 'الْكِتَابُ مَلِيءٌ بِالْأَوْرَاقِ وَالْمَعْلُومَاتِ!' },
    { q: 'أَطِيرُ بَيْنَ الْأَزْهَارِ وَأَصْنَعُ الْعَسَلَ اللَّذِيذَ، مَنْ أَنَا؟', a: 'النَّحْلَةُ 🐝', o: ['الْفَرَاشَةُ 🦋', 'النَّمْلَةُ 🐜', 'السُّلَحْفَاةُ 🐢'], ex: 'النَّحْلَةُ تَصْنَعُ الْعَسَلَ مِنَ الرَّحِيقِ.' },
    { q: 'أَعِيشُ فِي الْمَاءِ وَلَا أَسْتَطِيعُ الْعَيْشَ خَارِجَهُ، مَنْ أَنَا؟', a: 'السَّمَكَةُ 🐟', o: ['الْأَرْنَبُ 🐰', 'الْعُصْفُورُ 🐦', 'الْجَمَلُ 🐪'], ex: 'السَّمَكَةُ تَتَنَفَّسُ فِي الْمَاءِ بِالْخَيَاشِيمِ.' },
    { q: 'أَنَا حَيَوَانٌ صَبُورٌ أَعِيشُ فِي الصَّحْرَاءِ وَأُدْعَى سَفِينَةَ الصَّحْرَاءِ، مَنْ أَنَا؟', a: 'الْجَمَلُ 🐪', o: ['الْفِيلُ 🐘', 'الدُّبُّ 🐻', 'الْبَطَّةُ 🦆'], ex: 'الْجَمَلُ يَتَحَمَّلُ الْعَطَشَ وَحَرَّ الصَّحْرَاءِ.' },
    { q: 'أَسْقُطُ مِنَ السُّحُبِ لِأَرْوِيَ الزَّرْعَ وَالْأَرْضَ، مَنْ أَنَا؟', a: 'الْمَطَرُ 🌧️', o: ['الرِّيحُ 💨', 'النَّارُ 🔥', 'الرَّمْلُ 🏜️'], ex: 'الْمَطَرُ يَنْزِلُ مِنَ السَّمَاءِ فَيَسْقِي النَّبَاتَ.' },
    { q: 'أُحَلِّقُ عَالِيًا فِي السَّمَاءِ وَأَحْمِلُ الْمُسَافِرِينَ بَيْنَ الْبُلْدَانِ، مَنْ أَنَا؟', a: 'الطَّائِرَةُ ✈️', o: ['الدَّرَّاجَةُ 🚲', 'الْقِطَارُ 🚆', 'السَّفِينَةُ 🚢'], ex: 'الطَّائِرَةُ تَطِيرُ بِأَجْنِحَتِهَا فِي الْجَوِّ.' },
    { q: 'كَلِمَةٌ تَبْدَأُ بِـ «الْـ» وَنَنْطِقُ فِيهَا اللَّامَ وَاضِحَةً، مَا هِيَ؟', a: 'الْقَمَرُ 🌙', o: ['الشَّمْسُ ☀️', 'النَّجْمُ ⭐', 'الدَّرْسُ 📖'], ex: 'فِي «الْقَمَرُ» تُنْطَقُ اللَّامُ لِأَنَّهَا لَامٌ قَمَرِيَّةٌ.' }
  ];

  function quizRunner(title, rounds, buildQ, fnName) {
    let i = 0, score = 0;
    const next = () => {
      window.V = 'lesson';
      if (i >= rounds) {
        const gain = score * 2;
        if (window.P) { P.star = (+P.star || 0) + gain; save(); }
        sfx(score >= Math.ceil(rounds * 0.6) ? 'finish' : 'wrong');
        return h(`<section class=sec><h1>${score >= Math.ceil(rounds * 0.6) ? '🏆' : '💪'}</h1><h2>${esc(title)}</h2><p class=mut>${D(score)} مِنْ ${D(rounds)} · +${D(gain)} ⭐</p><button class=big onclick="${fnName}()">جَوْلَةٌ جَدِيدَةٌ</button><button class=alt onclick="puzzles()">← جَزِيرَةُ الْأَلْغَازِ</button></section>`);
      }
      const item = buildQ(i);
      const opts = window.uniqueOpts ? uniqueOpts(item.a, item.o, x => x, 4) : sh([item.a, ...item.o.slice(0, 3)]);
      h(`<section class=sec><button class=link onclick="puzzles()">← رُجُوعٌ</button><h2>${esc(title)}</h2><p class=mut>السُّؤَالُ ${D(i + 1)} مِنْ ${D(rounds)} · ⭐ ${D(score)}</p>
        <div class=qb><div class=q dir=auto>${item.q}</div><button class=alt onclick="try{say('${esc(item.say || item.q).replace(/'/g, '’')}','${item.l || 'ar'}')}catch(_){}">🔊 اسْمَعْ</button></div>
        <div class=grid>${opts.map(o => `<button class=opt dir=auto data-ok="${o === item.a ? 1 : 0}">${esc(o)}</button>`).join('')}</div>
        <div id=pz-fb class=sh hidden></div></section>`);
      if (item.autoSay) say1(item.say || item.q, item.l || 'ar');
      document.querySelectorAll('.opt').forEach(b => {
        b.onclick = () => {
          const ok = b.dataset.ok === '1';
          document.querySelectorAll('.opt').forEach(x => { x.disabled = true; if (x.dataset.ok === '1') x.classList.add('ok'); });
          if (ok) { score++; sfx('correct'); mood('happy'); } else { b.classList.add('no'); sfx('wrong'); mood('oops'); }
          const fb = document.getElementById('pz-fb');
          if (fb) {
            fb.className = 'sh ' + (ok ? 'g' : 'r');
            fb.hidden = false;
            fb.innerHTML = `<b>${ok ? '✅ أَحْسَنْتَ!' : '💡 تَعَلَّمْ:'} ${esc(item.ex || item.a)}</b><button class=big id=pz-nx>التَّالِي ◀</button>`;
            document.getElementById('pz-nx').onclick = () => { i++; next(); };
          }
          say1(ok ? 'أَحْسَنْتَ!' : (item.ex || item.a), 'ar');
        };
      });
    };
    next();
  }

  window.riddles = () => {
    const list = sh(RIDDLES);
    quizRunner('❓ أَلْغَازُ الْبُومَةِ الذَّكِيَّةِ', Math.min(5, list.length), idx => ({ ...list[idx], autoSay: 1 }), 'riddles');
  };

  /* ── ٢) التّفكير والتصنيف اللغوي (بدون رياضيات) ── */
  const LOGIC_Q = [
    { q: 'تُفَّاحٌ — مَوْزٌ — بُرْتُقَالٌ — (...) أَيُّ كَلِمَةٍ تُنَاسِبُ الْمَجْمُوعَةَ؟', a: 'عِنَبٌ 🍇', o: ['كُرْسِيٌّ 🪑', 'سَيَّارَةٌ 🚗', 'قَلَمٌ ✏️'], ex: 'كُلُّهَا فَوَاكِهُ لَذِيذَةٌ!' },
    { q: 'أَخْضَرُ — أَزْرَقُ — أَحْمَرُ — (...) مَا الْكَلِمَةُ الْمُنَاسِبَةُ؟', a: 'أَصْفَرُ 💛', o: ['مَدْرَسَةٌ 🏫', 'حِصَانٌ 🐴', 'بَحْرٌ 🌊'], ex: 'كُلُّهَا أَلْوَانٌ.' },
    { q: 'الصَّبَاحُ : الشَّمْسُ ☀️ :: اللَّيْلُ : (...)؟', a: 'الْقَمَرُ 🌙', o: ['الْبَابُ 🚪', 'الْمِلْعَقَةُ 🥄', 'الدَّرَّاجَةُ 🚲'], ex: 'فِي النَّهَارِ نَرَى الشَّمْسَ، وَفِي اللَّيْلِ نَرَى الْقَمَرَ.' },
    { q: 'الطَّيْرُ : الْجَنَاحُ :: السَّمَكَةُ : (...)؟', a: 'الزَّعَانِفُ 🐟', o: ['الْعَجَلَاتُ 🛞', 'الْأَوْرَاقُ 📄', 'الْمِفْتَاحُ 🔑'], ex: 'الطَّيْرُ يَسْتَعْمِلُ الْجَنَاحَ وَالسَّمَكَةُ تَسْتَعْمِلُ الزَّعَانِفَ.' },
    { q: 'أَيُّ كَلِمَةٍ تَنْتَهِي بِتَاءٍ مَفْتُوحَةٍ؟', a: 'بَيْتٌ', o: ['شَجَرَةٌ', 'مَدْرَسَةٌ', 'وَرْدَةٌ'], ex: '«بَيْتٌ» تَنْتَهِي بِتَاءٍ مَفْتُوحَةٍ تَبْقَى تَاءً عِنْدَ الْوَقْفِ.' },
    { q: 'مَا جَمْعُ كَلِمَةِ «كِتَابٌ»؟', a: 'كُتُبٌ 📚', o: ['مَكَاتِبُ 🪑', 'كُتَّابٌ ✍️', 'كَاتِبٌ 👤'], ex: 'جَمْعُ «كِتَابٌ» هُوَ «كُتُبٌ».' },
    { q: 'What is the opposite of "Big"?', a: 'Small', o: ['Tall', 'Fast', 'Happy'], l: 'en', ex: 'عَكْسُ Big (كَبِيرٌ) هُوَ Small (صَغِيرٌ).' }
  ];

  window.logic = () => {
    const list = sh(LOGIC_Q);
    quizRunner('🧠 التَّفْكِيرُ وَالتَّصْنِيفُ اللُّغَوِيُّ', Math.min(5, list.length), idx => list[idx], 'logic');
  };

  /* ── ٣) تركيب الكلمات بالضغط ── */
  window.dragBuild = (langPref) => {
    const lang = langPref || (window.P && P.lang === 'en' ? 'en' : 'ar');
    const pool = getWordPool(lang);
    let round = 0, score = 0;
    const render = () => {
      window.V = 'lesson';
      if (round >= 5) {
        if (window.P) { P.star = (+P.star || 0) + score; save(); }
        sfx(score >= 3 ? 'finish' : 'wrong');
        return h(`<section class=sec><h1>${score >= 3 ? '🌟' : '💪'}</h1><h2>تَرْكِيبُ الْكَلِمَاتِ</h2><p class=mut>${D(score)} مِنْ ٥ · +${D(score)} ⭐</p><button class=big onclick="dragBuild('${lang}')">جَوْلَةٌ جَدِيدَةٌ</button><button class=alt onclick="puzzles()">← جَزِيرَةُ الْأَلْغَازِ</button></section>`);
      }
      const it = pk(pool);
      const target = lang === 'ar' ? grs(it.w) : it.w.toLowerCase().split('');
      const tiles = sh(target.map((ch, idx) => ({ ch, idx })));
      let built = [], lock = false;

      h(`<section class=sec><button class=link onclick="puzzles()">← رُجُوعٌ</button><h2>🧱 رَكِّبِ الْكَلِمَةَ</h2><p class=mut>${D(round + 1)} مِنْ ٥ · ⭐ ${D(score)}</p>
        <div class=ac-big style="font-size:80px;-webkit-text-stroke:0">${it.pic}</div>
        <button class=alt onclick="try{say('${esc(it.w).replace(/'/g, '’')}','${lang}')}catch(_){}">🔊 اسْمَعِ الْكَلِمَةَ</button>
        <div id=db-out class=q dir=${lang === 'ar' ? 'rtl' : 'ltr'} style="min-height:46px">&nbsp;</div>
        <div class=grid dir=${lang === 'ar' ? 'rtl' : 'ltr'}>${tiles.map((t, k) => `<button class=opt id=dbt${k} data-ch="${esc(t.ch)}">${esc(t.ch)}</button>`).join('')}</div>
        <button class=link id=db-clr>🧽 مَسْحٌ</button></section>`);
      say1(it.w, lang);

      const outEl = document.getElementById('db-out');
      document.getElementById('db-clr').onclick = () => {
        if (lock) return;
        built = [];
        outEl.innerHTML = '&nbsp;';
        document.querySelectorAll('[id^=dbt]').forEach(b => { b.disabled = false; });
      };
      document.querySelectorAll('[id^=dbt]').forEach(b => {
        b.onclick = () => {
          if (lock) return;
          b.disabled = true;
          built.push(b.dataset.ch);
          outEl.textContent = lang === 'ar' ? built.join('') : built.join('');
          if (built.length < target.length) return;
          lock = true;
          const got = stripD0(built.join('')).toLowerCase();
          const want = stripD0(target.join('')).toLowerCase();
          const ok = got === want;
          outEl.textContent = it.w;
          if (ok) { score++; sfx('correct'); mood('happy'); say1('أَحْسَنْتَ!', 'ar'); }
          else { sfx('wrong'); mood('oops'); say1(it.w, lang); }
          round++;
          setTimeout(render, 1000);
        };
      });
    };
    render();
  };

  /* ── ٤) مطابقة الصور بالكلمات ── */
  window.matchPics = (langPref) => {
    const lang = langPref || (window.P && P.lang === 'en' ? 'en' : 'ar');
    const pool = sh(getWordPool(lang)).slice(0, 4);
    let sel = null, done = 0;
    window.V = 'lesson';
    h(`<section class=sec><button class=link onclick="puzzles()">← رُجُوعٌ</button><h2>🔗 طَابِقِ الصُّورَةَ بِالْكَلِمَةِ</h2><p class=mut>اخْتَرْ صُورَةً ثُمَّ اخْتَرْ كَلِمَتَهَا</p>
      <div class=bq-match>
        <div>${sh(pool).map(x => `<button class=bq-m data-s=p data-k="${esc(x.w)}" style="font-size:2rem">${x.pic}</button>`).join('')}</div>
        <div>${sh(pool).map(x => `<button class=bq-m data-s=w data-k="${esc(x.w)}" dir=auto>${esc(x.w)}</button>`).join('')}</div>
      </div></section>`);

    document.querySelectorAll('.bq-m').forEach(b => {
      b.onclick = () => {
        if (b.classList.contains('ok')) return;
        if (b.dataset.s === 'w') say1(b.dataset.k, lang);
        if (!sel || sel.dataset.s === b.dataset.s) {
          if (sel) sel.classList.remove('sel');
          sel = b;
          b.classList.add('sel');
          return;
        }
        sel.classList.remove('sel');
        if (sel.dataset.k === b.dataset.k) {
          sel.classList.add('ok');
          b.classList.add('ok');
          sfx('correct');
          done++;
          sel = null;
          if (done >= pool.length) {
            if (window.P) { P.star = (+P.star || 0) + 3; save(); }
            sfx('finish');
            setTimeout(() => h(`<section class=sec><h1>🌟</h1><h2>طَابَقْتَ كُلَّ الصُّوَرِ!</h2><p>+٣ ⭐</p><button class=big onclick="matchPics('${lang}')">جَوْلَةٌ جَدِيدَةٌ</button><button class=alt onclick="puzzles()">← رُجُوعٌ</button></section>`), 650);
          }
        } else {
          sfx('wrong');
          const a = sel;
          a.classList.add('no');
          b.classList.add('no');
          setTimeout(() => { a.classList.remove('no'); b.classList.remove('no'); }, 450);
          sel = null;
        }
      };
    });
  };

  /* ── ٥) الإملاء والكتابة (بسيط + متقدم) ── */
  const DICT_BASE = [
    { w: 'مَدْرَسَةٌ', h: 'تَاءٌ مَرْبُوطَةٌ فِي آخِرِهَا' },
    { w: 'بَيْتٌ', h: 'تَاءٌ مَفْتُوحَةٌ فِي آخِرِهَا' },
    { w: 'أَرْنَبٌ', h: 'هَمْزَةُ قَطْعٍ مَفْتُوحَةٌ فِي الْأَوَّلِ' },
    { w: 'شَجَرَةٌ', h: 'تَاءٌ مَرْبُوطَةٌ فِي الْآخِرِ' },
    { w: 'كِتَابٌ', h: 'مَدٌّ بِالْأَلِفِ بَعْدَ التَّاءِ' },
    { w: 'صَغِيرٌ', h: 'مَدٌّ بِالْيَاءِ بَعْدَ الْغَيْنِ' },
    { w: 'عُصْفُورٌ', h: 'مَدٌّ بِالْوَاوِ بَعْدَ الْفَاءِ' },
    { w: 'إِبْرِيقٌ', h: 'هَمْزَةٌ مَكْسُورَةٌ تَحْتَ الْأَلِفِ' }
  ];

  const DICT_ADV = [
    { bad: 'المدرسه كبيره', a: 'الْمَدْرَسَةُ كَبِيرَةٌ', ex: 'التَّاءُ الْمَرْبُوطَةُ تُكْتَبُ بِنُقْطَتَيْنِ (ـة).' },
    { bad: 'اكل الولد التفاح', a: 'أَكَلَ الْوَلَدُ التُّفَّاحَ', ex: '«أَكَلَ» تَبْدَأُ بِهَمْزَةِ قَطْعٍ عَلَى الْأَلِفِ (أَ).' },
    { bad: 'سما زرقاء', a: 'سَمَاءٌ زَرْقَاءُ', ex: 'تُكْتَبُ الْهَمْزَةُ الْمُتَطَرِّفَةُ بَعْدَ الْمَدِّ عَلَى السَّطْرِ.' },
    { bad: 'ذهب الى البيت', a: 'ذَهَبَ إِلَى الْبَيْتِ', ex: '«إِلَى» تَبْدَأُ بِهَمْزَةٍ مَكْسُورَةٍ وَتَنْتَهِي بِأَلِفٍ مَقْصُورَةٍ (ى).' },
    { bad: 'صوت البنت جميل', a: 'صَوْتُ الْبِنْتِ جَمِيلٌ', ex: '«صَوْتُ» وَ«الْبِنْتِ» تَنْتَهِيَانِ بِتَاءٍ مَفْتُوحَةٍ.' }
  ];

  window.dictation = () => {
    const items = sh(DICT_BASE).slice(0, 5);
    let i = 0, score = 0;
    const render = () => {
      window.V = 'lesson';
      if (i >= items.length) {
        if (window.P) { P.star = (+P.star || 0) + score * 2; save(); }
        sfx(score >= 3 ? 'finish' : 'wrong');
        return h(`<section class=sec><h1>${score >= 3 ? '✍️' : '💪'}</h1><h2>الإِمْلَاءُ الصَّوْتِيُّ</h2><p class=mut>${D(score)} مِنْ ${D(items.length)} · +${D(score * 2)} ⭐</p><button class=big onclick="dictation()">جَوْلَةٌ جَدِيدَةٌ</button><button class=alt onclick="puzzles()">← جَزِيرَةُ الْأَلْغَازِ</button></section>`);
      }
      const curItem = items[i];
      h(`<section class=sec><button class=link onclick="puzzles()">← رُجُوعٌ</button><h2>✍️ الإِمْلَاءُ الصَّوْتِيُّ</h2><p class=mut>${D(i + 1)} مِنْ ${D(items.length)} · 💡 ${curItem.h}</p>
        <div class=qb><button class=big onclick="try{say('${curItem.w}','ar')}catch(_){}">🔊 اسْمَعِ الْكَلِمَةَ</button></div>
        <div class=bq-type><input id=dc-in class=bq-in dir=rtl autocomplete=off placeholder="اكْتُبِ الْكَلِمَةَ هُنَا…"><button class=big id=dc-ok>تَحَقَّقْ ✓</button></div>
        <div id=dc-fb class=sh hidden></div></section>`);
      say1(curItem.w, 'ar');
      const inp = document.getElementById('dc-in'), btn = document.getElementById('dc-ok'), fb = document.getElementById('dc-fb');
      const check = () => {
        const v = inp.value.trim();
        if (!v) return inp.focus();
        inp.disabled = true; btn.disabled = true;
        const ok = window.Grade ? Grade.text(v, [curItem.w]).ok : stripD0(v) === stripD0(curItem.w);
        if (ok) { score++; sfx('correct'); mood('happy'); } else { sfx('wrong'); mood('oops'); }
        fb.hidden = false;
        fb.className = 'sh ' + (ok ? 'g' : 'r');
        fb.innerHTML = `<b>${ok ? '✅ إِمْلَاءٌ صَحِيحٌ!' : '💡 الصَّحِيحُ:'} ${esc(curItem.w)}</b><button class=big id=dc-nx>التَّالِي ◀</button>`;
        document.getElementById('dc-nx').onclick = () => { i++; render(); };
        say1(ok ? 'أَحْسَنْتَ!' : curItem.w, 'ar');
      };
      btn.onclick = check;
      inp.onkeydown = e => { if (e.key === 'Enter') check(); };
    };
    render();
  };

  window.dictationAdv = () => {
    const items = sh(DICT_ADV);
    let i = 0, score = 0;
    const render = () => {
      window.V = 'lesson';
      if (i >= items.length) {
        if (window.P) { P.star = (+P.star || 0) + score * 2; save(); }
        sfx(score >= 3 ? 'finish' : 'wrong');
        return h(`<section class=sec><h1>🏆</h1><h2>تَصْوِيبُ الإِمْلَاءِ الْمُتَقَدِّمُ</h2><p class=mut>${D(score)} مِنْ ${D(items.length)} · +${D(score * 2)} ⭐</p><button class=big onclick="dictationAdv()">جَوْلَةٌ جَدِيدَةٌ</button><button class=alt onclick="puzzles()">← رُجُوعٌ</button></section>`);
      }
      const curItem = items[i];
      h(`<section class=sec><button class=link onclick="puzzles()">← رُجُوعٌ</button><h2>🛠️ صَحِّحِ الْجُمْلَةَ إِمْلَائِيًّا</h2><p class=mut>${D(i + 1)} مِنْ ${D(items.length)}</p>
        <div class=bq-bad dir=rtl>❌ ${esc(curItem.bad)}</div>
        <div class=bq-type><input id=da-in class=bq-in dir=rtl value="${esc(curItem.bad)}"><button class=big id=da-ok>تَحَقَّقْ ✓</button></div>
        <div id=da-fb class=sh hidden></div></section>`);
      const inp = document.getElementById('da-in'), btn = document.getElementById('da-ok'), fb = document.getElementById('da-fb');
      const check = () => {
        const v = inp.value.trim();
        if (!v || stripD0(v) === stripD0(curItem.bad)) return inp.focus();
        inp.disabled = true; btn.disabled = true;
        const ok = stripD0(v).replace(/ى/g, 'ي') === stripD0(curItem.a).replace(/ى/g, 'ي') && (!curItem.a.includes('ة') || v.includes('ة')) && (!curItem.a.includes('أ') || v.includes('أ'));
        if (ok) { score++; sfx('correct'); mood('happy'); } else { sfx('wrong'); mood('oops'); }
        fb.hidden = false;
        fb.className = 'sh ' + (ok ? 'g' : 'r');
        fb.innerHTML = `<b>${ok ? '✅ أَحْسَنْتَ!' : '💡 الصَّحِيحُ:'} ${esc(curItem.a)}</b><p class=mut>${esc(curItem.ex)}</p><button class=big id=da-nx>التَّالِي ◀</button>`;
        document.getElementById('da-nx').onclick = () => { i++; render(); };
      };
      btn.onclick = check;
    };
    render();
  };

  /* ── ٦) تقطيع الكلمات لمقاطع صوتية ── */
  const SYLLS = [
    { w: 'مَدْرَسَةٌ', seg: 'مَدْ / رَ / سَ / ةٌ', wr: ['مَ / دْرَ / سَةٌ', 'مَدْرَ / سَةٌ', 'مَ / دْ / رَسَ / ةٌ'] },
    { w: 'كِتَابٌ', seg: 'كِ / تَا / بٌ', wr: ['كِتْ / ا / بٌ', 'كِ / تَ / ابٌ', 'كِتَا / بٌ'] },
    { w: 'قَلَمٌ', seg: 'قَ / لَ / مٌ', wr: ['قَلْ / مٌ', 'قَ / لَمٌ', 'قَلَ / مٌ'] },
    { w: 'الْقَمَرُ', seg: 'الْ / قَ / مَ / رُ', wr: ['ا / لْقَ / مَ / رُ', 'الْقَ / مَرُ', 'ا / لْقَمَ / رُ'] },
    { w: 'شَمْسٌ', seg: 'شَمْ / سٌ', wr: ['شَ / مْ / سٌ', 'شَ / مْسٌ', 'شَمْسُ / نْ'] }
  ];

  window.syllables = () => {
    const list = sh(SYLLS);
    quizRunner('✂️ تَقْطِيعُ الْكَلِمَاتِ إِلَى مَقَاطِعَ', list.length, idx => ({
      q: `كَيْفَ نُقَطِّعُ كَلِمَةَ <b>«${list[idx].w}»</b> صَوْتِيًّا؟`,
      a: list[idx].seg,
      o: list[idx].wr,
      say: list[idx].w,
      ex: `السَّاكِنُ مَعَ مَا قَبْلَهُ وَالْمَدُّ مَعَ الْمَمْدُودِ: ${list[idx].seg}`
    }), 'syllables');
  };

  /* ── ٧) تحدّي السرعة (٦٠ ثانية — لغة فقط) ── */
  window.speedGame = () => {
    const arPool = getWordPool('ar');
    const enPool = getWordPool('en');
    const both = [...arPool, ...enPool];
    let left = 60, score = 0, alive = true;
    window.V = 'lesson';
    const nextQ = () => {
      if (!alive) return;
      const it = pk(both);
      const sameLang = it.l === 'ar' ? arPool : enPool;
      const opts = window.uniqueOpts ? uniqueOpts(it.w, sameLang.map(x => x.w), x => x, 4) : sh([it.w, ...sameLang.slice(0, 3).map(x => x.w)]);
      const host = document.getElementById('sp-body');
      if (!host) return;
      host.innerHTML = `<div class=ac-big style="font-size:80px;-webkit-text-stroke:0">${it.pic}</div><div class=grid>${opts.map(o => `<button class=opt dir=auto data-ok="${o === it.w ? 1 : 0}">${esc(o)}</button>`).join('')}</div>`;
      host.querySelectorAll('.opt').forEach(b => {
        b.onclick = () => {
          if (!alive) return;
          if (b.dataset.ok === '1') { score++; sfx('correct'); } else sfx('wrong');
          const scEl = document.getElementById('sp-sc');
          if (scEl) scEl.textContent = D(score);
          nextQ();
        };
      });
    };

    h(`<section class=sec><button class=link onclick="puzzles()">← رُجُوعٌ</button><h2>⚡ تَحَدِّي السُّرْعَةِ</h2><p class=mut>⏱️ <b id=sp-tm>${D(left)}</b> ث · ⭐ <b id=sp-sc>٠</b></p><div id=sp-body></div></section>`);
    nextQ();
    const timer = setInterval(() => {
      if (!document.getElementById('sp-body')) { alive = false; clearInterval(timer); return; }
      left--;
      const tEl = document.getElementById('sp-tm');
      if (tEl) tEl.textContent = D(Math.max(0, left));
      if (left <= 0) {
        clearInterval(timer);
        alive = false;
        const gain = Math.min(8, Math.max(1, Math.floor(score / 2)));
        if (window.P) { P.star = (+P.star || 0) + gain; save(); }
        sfx('finish');
        h(`<section class=sec><h1>⚡</h1><h2>أَجَبْتَ عَنْ ${D(score)} كَلِمَةٍ!</h2><p>+${D(gain)} ⭐</p><button class=big onclick="speedGame()">جَوْلَةٌ جَدِيدَةٌ</button><button class=alt onclick="puzzles()">← جَزِيرَةُ الْأَلْغَازِ</button></section>`);
      }
    }, 1000);
    window.Lazy && Lazy.onLeave && Lazy.onLeave(() => { alive = false; clearInterval(timer); });
  };

  window.weekly = () => quizRunner('🏅 تَحَدِّي الْأُسْبُوعِ', 5, idx => pk([...RIDDLES, ...LOGIC_Q]), 'weekly');
  window.advanced = () => quizRunner('🎓 أَنْشِطَةٌ مُتَقَدِّمَةٌ', 5, idx => pk(LOGIC_Q), 'advanced');

  /* ── ٨) بوابة جزيرة الألغاز والأنشطة المتقدمة ── */
  window.puzzles = () => {
    window.V = 'sec';
    window.CS = 'games';
    const items = [
      ['❓', 'أَلْغَازُ الْبُومَةِ الذَّكِيَّةِ', 'riddles()'],
      ['🧠', 'التَّفْكِيرُ وَالتَّصْنِيفُ اللُّغَوِيُّ', 'logic()'],
      ['🧱', 'تَرْكِيبُ الْكَلِمَاتِ (عَرَبِي / إِنْجِلِيزِي)', 'dragBuild()'],
      ['🔗', 'مُطَابَقَةُ الصُّوَرِ بِالْكَلِمَاتِ', 'matchPics()'],
      ['✍️', 'الإِمْلَاءُ الصَّوْتِيُّ', 'dictation()'],
      ['🛠️', 'تَصْوِيبُ الإِمْلَاءِ الْمُتَقَدِّمُ', 'dictationAdv()'],
      ['✂️', 'تَقْطِيعُ الْكَلِمَاتِ إِلَى مَقَاطِعَ', 'syllables()'],
      ['⚡', 'تَحَدِّي السُّرْعَةِ (٦٠ ثَانِيَةً)', 'speedGame()'],
      ['🏅', 'تَحَدِّي الْأُسْبُوعِ', 'weekly()'],
      ['🎓', 'أَنْشِطَةٌ لُغَوِيَّةٌ مُتَقَدِّمَةٌ', 'advanced()']
    ];
    h(`<section class=sec><button class=link onclick="goBack()">← رُجُوعٌ</button><h2>🏝️ جَزِيرَةُ الْأَلْغَازِ وَالتَّفْكِيرِ</h2><p class=mut>أَلْغَازٌ وَتَدْرِيبَاتٌ مُمْتِعَةٌ فِي الْعَرَبِيَّةِ وَالْإِنْجِلِيزِيَّةِ</p><div class=list>${items.map(x => `<button class=row onclick="${x[2]}"><span>${x[0]}</span><b>${x[1]}</b></button>`).join('')}</div></section>`);
  };

  if (window.AC && Array.isArray(AC.MN)) {
    AC.MN.push(
      ['🏝️', 'جزيرة الألغاز والتفكير', 'puzzles'],
      ['✍️', 'الإملاء الصوتي والمتقدّم', 'dictation'],
      ['✂️', 'تقطيع الكلمات إلى مقاطع', 'syllables']
    );
  }

  try { window.Router && Router.wrapAll && Router.wrapAll(); } catch (_) {}
})();
