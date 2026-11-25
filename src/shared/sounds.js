/* sounds.js — Audio feedback player using bundled /audio/*.wav assets */
(() => {
  'use strict';
  const FILES = {
    correct: 'audio/correct.wav',
    wrong: 'audio/wrong.wav',
    finish: 'audio/finish.wav',
    select: 'audio/select.wav',
    tap: 'audio/tap.wav'
  };
  const cache = {};
  function play(name) {
    try {
      if (window.P && (P.sfx === 0 || P.muted || P.snd === 0)) return;
      const src = FILES[name];
      if (!src) return;
      let a = cache[name];
      if (!a) {
        a = new Audio(src);
        cache[name] = a;
      }
      a.volume = Math.max(0, Math.min(1, (window.P && P.vol != null) ? +P.vol : 0.7));
      a.currentTime = 0;
      const p = a.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }
  window.HurufiSound = { play };
})();
