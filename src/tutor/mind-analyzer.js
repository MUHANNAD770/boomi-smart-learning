/* /src/tutor/mind-analyzer.js — تحليل أخطاء الطالب في العربية والإنجليزية واستنتاج السبب الدقيق */
window.MindAnalyzer = (() => {
  'use strict';
  const strip = s => String(s || '').replace(/[ً-ْٰـ]/g, '').replace(/<[^>]*>/g, ' ').trim();
  const SOUND = ['تط', 'دض', 'ذز', 'ذظ', 'ثس', 'سص', 'قك', 'حه', 'عء', 'غخ', 'ضظ', 'زظ'];
  const SHAPE = ['بتثني', 'جحخ', 'دذ', 'رز', 'سش', 'صض', 'طظ', 'عغ', 'فق'];
  const near = (a, b, L) => L.some(g => g.includes(a) && g.includes(b));
  const HAR = { 'َ': 'الْفَتْحَةِ', 'ُ': 'الضَّمَّةِ', 'ِ': 'الْكَسْرَةِ', 'ْ': 'السُّكُونِ', 'ّ': 'الشَّدَّةِ', 'ً': 'تَنْوِينِ الْفَتْحِ', 'ٌ': 'تَنْوِينِ الضَّمِّ', 'ٍ': 'تَنْوِينِ الْكَسْرِ' };

  function lang(x, chosen) {
    const right = String(x.k || ''), r = strip(right), c = strip(chosen), ar = /[؀-ۿ]/.test(r);
    const qtxt = strip(x.show || '');

    if (/شمسية|قمرية/.test(qtxt)) {
      return {
        type: 'al',
        why: `الإِجَابَةُ الصَّحِيحَةُ: «${right}».`,
        fix: 'اُنْظُرْ لِلْحَرْفِ بَعْدَ (ال): إِنْ كَانَ مُشَدَّدًا فَاللَّامُ شَمْسِيَّةٌ، وَإِلَّا فَهِيَ قَمَرِيَّةٌ.'
      };
    }

    if (/[ةته]$/.test(r) && /[ةته]$/.test(c) && r.slice(0, -1) === c.slice(0, -1)) {
      return {
        type: 'tamarbuta',
        why: 'الْفَرْقُ فِي الْحَرْفِ الْأَخِيرِ (ة / ت / هـ).',
        fix: `قِفْ عَلَى الْكَلِمَةِ وَصِلْهَا: الصَّحِيحُ «${right}».`
      };
    }

    if (/^[أإآا]/.test(r) && /^[أإآا]/.test(c) && r.slice(1) === c.slice(1)) {
      return {
        type: 'hamza',
        why: 'انْتَبِهْ لِشَكْلِ الْهَمْزَةِ فِي بِدَايَةِ الْكَلِمَةِ.',
        fix: `ضَعْ «وَ» قَبْلَهَا لِتَعْرِفَ نُطْقَ الْهَمْزَةِ: «${right}».`
      };
    }

    if (/[ىا]$/.test(r) && /[ىا]$/.test(c) && r.slice(0, -1) === c.slice(0, -1)) {
      return {
        type: 'alif_layyina',
        why: 'انْتَبِهْ لِلْأَلِفِ اللَّيِّنَةِ فِي آخِرِ الْكَلِمَةِ (ى / ا).',
        fix: `الصَّحِيحُ كِتَابَتُهَا هَكَذَا: «${right}».`
      };
    }

    if (!c || c === r || !/\p{L}/u.test(c)) {
      if (ar && c === r) {
        const m = [...String(chosen)].find(ch => HAR[ch] && !right.includes(ch));
        if (m) {
          return {
            type: 'vowel',
            why: 'الْحُرُوفُ صَحِيحَةٌ، لَكِنَّ الْحَرَكَةَ مُخْتَلِفَةٌ.',
            fix: `اِنْتَبِهْ إِلَى ${HAR[m]}: الصَّحِيحُ «${right}».`
          };
        }
      }
      return {
        type: 'picture',
        why: `الْإِجَابَةُ الصَّحِيحَةُ: «${right}».`,
        fix: ar ? 'اُنْظُرْ إِلَى الصُّورَةِ جَيِّدًا، ثُمَّ اسْمَعِ الْكَلِمَةَ مَرَّةً أُخْرَى.' : 'Look closely at the picture, then listen again.'
      };
    }

    if (ar && /[؀-ۿ]/.test(c)) {
      const a = c[0], b = r[0];
      if (a !== b && near(a, b, SOUND)) {
        return {
          type: 'similar',
          why: `الْحَرْفَانِ «${b}» وَ«${a}» مُتَقَارِبَانِ فِي الْمَخْرَجِ وَالنُّطْقِ.`,
          fix: `اِسْمَعْ مَخْرَجَ الْحَرْفِ جَيِّدًا: الْكَلِمَةُ تَبْدَأُ بِـ«${b}»: «${right}».`
        };
      }
      if (a !== b && near(a, b, SHAPE)) {
        return {
          type: 'dots',
          why: `الْحَرْفَانِ «${b}» وَ«${a}» مُتَشَابِهَانِ فِي الشَّكْلِ.`,
          fix: `اُنْظُرْ إِلَى النُّقَطِ جَيِّدًا: الصَّحِيحُ «${right}».`
        };
      }
      if (c === r) {
        const m = [...String(chosen)].find(ch => HAR[ch] && !right.includes(ch));
        return {
          type: 'vowel',
          why: 'الْحُرُوفُ صَحِيحَةٌ، لَكِنَّ الْحَرَكَةَ مُخْتَلِفَةٌ.',
          fix: `اِنْتَبِهْ إِلَى ${m ? HAR[m] : 'الْحَرَكَاتِ'}: الصَّحِيحُ «${right}».`
        };
      }
      if (a === b) {
        return {
          type: 'first',
          why: `الْكَلِمَتَانِ تَبْدَآنِ بِالْحَرْفِ «${b}» نَفْسِهِ.`,
          fix: `اِقْرَأِ الْكَلِمَةَ إِلَى آخِرِهَا: «${right}».`
        };
      }
      return {
        type: 'other',
        why: `الصَّحِيحُ «${right}».`,
        fix: 'اِقْرَأِ الْكَلِمَةَ مَقْطَعًا مَقْطَعًا، ثُمَّ اخْتَرْ.'
      };
    }

    if (!ar && /[a-z]/i.test(c)) {
      if (/\b(a|an|the|is|are|am|he|she|it|they)\b/i.test(r)) {
        return {
          type: 'engrammar',
          why: `The correct choice is "${right}".`,
          fix: 'Check the rule (a/an, singular/plural, or pronoun) and try again.'
        };
      }
      const a = c[0].toLowerCase(), b = r[0].toLowerCase();
      if (a === b && Math.abs(c.length - r.length) <= 2) {
        return {
          type: 'enspell',
          why: `The spelling is very close to "${right}".`,
          fix: `Read every letter carefully: "${right}".`
        };
      }
      if (a === b) {
        return {
          type: 'enfirst',
          why: `Both words start with "${b.toUpperCase()}".`,
          fix: `Read to the end of the word: "${right}".`
        };
      }
      if ('aeiou'.includes(a) && 'aeiou'.includes(b)) {
        return {
          type: 'envowel',
          why: `"${a}" and "${b}" are both vowels, but they sound different.`,
          fix: `Listen again carefully: "${right}".`
        };
      }
      return {
        type: 'other',
        why: `The correct answer is "${right}".`,
        fix: 'Listen once more, then choose.'
      };
    }

    return { type: 'other', why: `الصَّحِيحُ «${right}».`, fix: '' };
  }

  const analyze = (x, chosen) => {
    try {
      const r = lang(x, chosen);
      if (window.studentGenderText && r.fix) r.fix = window.studentGenderText(r.fix);
      if (window.studentGenderText && r.why) r.why = window.studentGenderText(r.why);
      return r;
    } catch (_) {
      return { type: 'other', why: '', fix: '' };
    }
  };

  return { analyze, strip };
})();
