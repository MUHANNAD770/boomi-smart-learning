/* home.js — المعلّم الموجّه للدرس الأنسب على الصفحة الرئيسية (عربي + إنجليزي فقط) */
(() => {
  'use strict';
  const oldH = window.h;
  if (typeof oldH === 'function') {
    window.h = function (x) {
      document.body.classList.toggle('hm', window.V === 'home' || window.V === 'sec');
      return oldH(x);
    };
  }
  window.goTo = id => {
    const e = document.getElementById(id);
    e && e.scrollIntoView({ behavior: 'smooth' });
  };
  window.coach = function () {
    if (!window.P) return null;
    const us = units(P.stage);
    const pend = us.filter(u => !P.done[u.id] && (!window.lessonUnlocked || lessonUnlocked(u.id)));
    const sc = us.filter(u => P.sc[u.id] != null).sort((a, b) => P.sc[a.id] - P.sc[b.id]);
    const u = (sc.length && P.sc[sc[0].id] < 4) ? sc[0] : (pend[0] || us[0]);
    if (!u) return null;
    const girl = P.gender === 'female';
    return {
      u,
      t: (sc.length && P.sc[u.id] < 4)
        ? (girl ? `لَاحَظْتُ أَنَّكِ تَحْتَاجِينَ مُرَاجَعَةَ "${u.n}". هَيَّا نَتَدَرَّبُ عَلَيْهَا!` : `لَاحَظْتُ أَنَّكَ تَحْتَاجُ مُرَاجَعَةَ "${u.n}". هَيَّا نَتَدَرَّبُ عَلَيْهَا!`)
        : (girl ? `جَاهِزَةٌ لِدَرْسٍ جَدِيدٍ؟ لِنَبْدَأْ "${u.n}"` : `جَاهِزٌ لِدَرْسٍ جَدِيدٍ؟ لِنَبْدَأْ "${u.n}"`)
    };
  };
})();
