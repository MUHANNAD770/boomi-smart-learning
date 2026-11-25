/* src/core/badges.js — التقدّم المتدرّج في الدروس والشارات التحفيزية (بدون رياضيات أو عالم مغامرات) */
(() => {
  'use strict';

  const stageOf = id => (/^\d+-\d+$/.test(id) ? +id.split('-')[0] : -1);
  const listFor = (a, l) => (S[a] ? S[a].u.filter(u => u.l === l) : []);
  const mastery = (a, l) => {
    const L = listFor(a, l);
    return L.length ? L.filter(u => P.done[u.id]).length / L.length : 1;
  };
  const stageOpen = (a, l) => a <= Math.max(+P.stage || 0, 0) || (a > 0 && mastery(a - 1, l) >= 0.7);

  function unlocked(u) {
    if (!u || !P) return true;
    if (P.unlockAll) return true;
    const a = stageOf(u.id);
    if (a < 0) return true;
    if (P.done[u.id] || P.sc[u.id] != null) return true;
    if (a < (+P.stage || 0)) return true;
    if (!stageOpen(a, u.l)) return false;
    const L = listFor(a, u.l);
    const i = L.indexOf(u);
    return i <= 0 || !!P.done[L[i - 1].id];
  }

  function nextFor(l) {
    const s0 = Math.min(S.length - 1, Math.max(0, +P.stage || 0));
    for (let a = s0; a < S.length; a++) {
      for (const u of listFor(a, l)) {
        if (!P.done[u.id] && unlocked(u)) return u;
      }
    }
    for (let a = 0; a < s0; a++) {
      for (const u of listFor(a, l)) {
        if (!P.done[u.id]) return u;
      }
    }
    return null;
  }

  const doneN = l => Object.keys(P?.done || {}).filter(id => {
    const u = find(id);
    return u && (!l || u.l === l);
  }).length;

  const BADGES = [
    ['first', '🌟', 'أَوَّلُ دَرْسٍ', () => doneN() >= 1],
    ['l5', '📗', '٥ دُرُوسٍ', () => doneN() >= 5],
    ['l20', '📚', '٢٠ دَرْسًا', () => doneN() >= 20],
    ['l50', '🎓', '٥٠ دَرْسًا', () => doneN() >= 50],
    ['s25', '⭐', '٢٥ نَجْمَةً', () => (P.star || 0) >= 25],
    ['s100', '💫', '١٠٠ نَجْمَةٍ', () => (P.star || 0) >= 100],
    ['s300', '🌠', '٣٠٠ نَجْمَةٍ', () => (P.star || 0) >= 300],
    ['d3', '🎯', '٣ تَحَدِّيَاتٍ يَوْمِيَّةً', () => Object.keys(P.cd || {}).length >= 3],
    ['d7', '🔥', '٧ تَحَدِّيَاتٍ يَوْمِيَّةً', () => Object.keys(P.cd || {}).length >= 7],
    ['talk', '🎤', '١٠ نُطْقٍ صَحِيحٍ', () => ((P.stat || {}).p || [0, 0])[1] >= 10],
    ['act', '🎨', '١٠ أَنْشِطَةٍ', () => Object.keys(P.act || {}).length >= 10],
    ['ar', '🔤', 'بَطَلُ الْعَرَبِيَّةِ', () => doneN('ar') >= 15],
    ['en', '🔠', 'English Star', () => doneN('en') >= 15],
    ['st5', '📖', 'قَارِئُ الْقِصَصِ', () => Object.keys(P.stories || {}).length >= 5],
    ['ex1', '🏅', 'اجْتِيَازُ اخْتِبَارٍ', () => Object.values(P.exams || {}).some(e => e && e.best >= 70)]
  ];

  const earned = () => BADGES.filter(b => {
    try { return b[3](); } catch { return false; }
  });

  const badgeGrid = () => `<div class=badges>${BADGES.map(b => {
    let e = false;
    try { e = b[3](); } catch {}
    return `<div class="badge ${e ? 'got' : ''}" title="${esc(b[2])}"><span>${b[1]}</span><small>${esc(b[2])}${e ? ' ✓' : ''}</small></div>`;
  }).join('')}</div>`;

  function checkBadges() {
    if (!P) return;
    P.badges = P.badges || {};
    const fresh = earned().filter(b => !P.badges[b[0]]);
    if (!fresh.length) return;
    fresh.forEach(b => { P.badges[b[0]] = Date.now(); });
    save();
    const b = fresh[0];
    const t = document.createElement('div');
    t.className = 'badge-toast';
    t.innerHTML = `<span>${b[1]}</span><div><small>شَارَةٌ جَدِيدَةٌ!</small><b>${esc(b[2])}</b></div>`;
    document.body.appendChild(t);
    setTimeout(() => t.classList.add('out'), 3600);
    setTimeout(() => t.remove(), 4200);
    try {
      window.HurufiSound && HurufiSound.play('finish');
      window.MC && MC.mood('proud', 2400);
      say('رَائِعٌ! حَصَلْتَ عَلَى شَارَةٍ جَدِيدَةٍ: ' + b[2], 'ar', null, 'cheer');
    } catch {}
  }

  document.addEventListener('click', e => {
    if (e.target.closest && e.target.closest('.opt,.ct-opts button,.practice-options button')) {
      setTimeout(checkBadges, 1400);
    }
  }, true);

  window.lessonUnlocked = unlocked;
  window.nextLesson = nextFor;
  window.BADGES = BADGES;
  window.earnedBadges = earned;
  window.badgeGrid = badgeGrid;
  window.checkBadges = checkBadges;
  window.stageOpen = stageOpen;
})();
