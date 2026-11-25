/* lfocus.js — شاشة الدرس الموحّدة: بطاقة واحدة واضحة في كل مرة + شبكة كل البطاقات تحت «عرض كل البطاقات» */
(() => {
  'use strict';
  const AD = '٠١٢٣٤٥٦٧٨٩', D0 = n => String(n).replace(/\d/g, d => AD[d]);
  const esc0 = t => String(t == null ? '' : t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const F = { i: 0, id: null, rec: null };
  const items = () => (window.cur && Array.isArray(cur.i) ? cur.i : []).filter(x => Array.isArray(x) && x[0]);
  const girl = () => window.P && P.gender === 'female';
  const isPic = v => v && !/[\p{L}\p{N}]/u.test(String(v));
  const SCN = { has: k => !!(window.SCENES && window.SCENES.includes(k)) };
  const scKey = e => [...String(e).trim()].map(c => c.codePointAt(0)).filter(c => c !== 0xFE0F).map(c => c.toString(16)).join('-');
  const lang = x => x[2] || (/[\u0600-\u06FF]/.test(x[0]) ? 'ar' : 'en');
  const letterOf = x => {
    if (!(window.cur && cur.k)) return '';
    const m = String(x[0]).trim().match(/^[ء-ي][ً-ْٰ]*|^[A-Za-z]/);
    return m ? m[0] : '';
  };
  const CUTS = new Set(['1f400', '1f402', '1f403', '1f407', '1f410', '1f411', '1f412', '1f413', '1f418', '1f422', '1f42a', '1f42f', '1f430', '1f434', '1f436', '1f437', '1f43a', '1f43b', '1f54a', '1f981', '1f985', '1f986', '1f988', '1f98a', '1f98c', '1f993', '1f99b', '1f9a6']);
  const objImg = (e, alt) => {
    const k = scKey(e);
    if (CUTS.has(k)) return `<img src="img/cut/${k}.webp" alt="${esc0(alt)}">`;
    let n = null;
    try { n = window.Emoji3D && Emoji3D.name(String(e).trim()); } catch (x) {}
    return n ? `<img class="lf-3d" src="img/3d/${n}.webp" alt="${esc0(alt)}">` : `<span class="lf-emo">${esc0(e)}</span>`;
  };
  function card() {
    const L = items(), n = L.length;
    if (!n) return '';
    const k = Math.max(0, Math.min(F.i, n - 1)), x = L[k], pic = isPic(x[1]), lt = letterOf(x);
    const mic = window.P && P.mic && (window.SpeechRecognition || window.webkitSpeechRecognition);
    return `<div class="lf-top"><button class="lf-home" onclick="home()" aria-label="الرئيسية">🏠</button><b class="lf-title">${esc0(cur.n)}</b>
      <div class="lf-prog"><i style="width:${Math.round((k + 1) / n * 100)}%"></i></div><span class="lf-cnt">${D0(k + 1)}/${D0(n)} ⭐</span></div>
      <div class="lf-body">
        <div class="lf-card${lt ? ' lf-k' : ''}" onclick="lfSay()">
          ${lt ? `<div class="lf-letter${/[A-Za-z]/.test(lt) ? ' lf-latin' : ''}">${esc0(lt)}</div>` : ''}
          ${lt && pic ? `<div class="lf-obj">${objImg(x[1], x[0])}</div>` : pic && SCN.has(scKey(x[1])) ? `<div class="lf-scene"><img src="img/scenes/${scKey(x[1])}.webp" alt="${esc0(x[0])}"></div>` : `<div class="lf-pic${lt ? '' : ' lf-pic-big'}">${pic ? esc0(x[1]) : '📖'}</div>`}
          <div class="lf-word" dir="auto">${esc0(x[0])}</div>${!pic && x[1] ? `<div class="lf-mean" dir="auto">${esc0(x[1])}</div>` : ''}
        </div>
        <div class="lf-side">
          <button class="lf-listen" onclick="lfSay()"><span>🔊</span><b>${girl() ? 'اِسْتَمِعِي' : 'اِسْتَمِعْ'} إِلَى الصَّوْتِ</b></button>
          ${mic ? `<button class="lf-mic" id="lf-mic" onclick="lfMic()" aria-label="اقرأ الكلمة">🎤</button><small class="lf-mic-t" id="lf-mic-t">${girl() ? 'اِضْغَطِي وَاقْرَئِي الْكَلِمَةَ' : 'اِضْغَطْ وَاقْرَأِ الْكَلِمَةَ'}</small>` : ''}
          <div class="lf-nav"><button class="lf-prev" onclick="lfGo(-1)" ${k === 0 ? 'disabled' : ''}>‹ السَّابِقُ</button>
            ${k < n - 1 ? `<button class="lf-next" onclick="lfGo(1)">التَّالِي ›</button>` : `<button class="lf-next lf-done" onclick="lfQuiz()">${girl() ? 'اِبْدَئِي' : 'اِبْدَأِ'} الِاخْتِبَارَ ✨</button>`}</div>
        </div>
      </div>`;
  }
  const fit = () => {
    try {
      const e = document.querySelector('.lf-card.lf-k .lf-letter');
      if (!e) return;
      const t = e.textContent, box = e.getBoundingClientRect();
      if (!box.width) return;
      const cs = getComputedStyle(e), c = document.createElement('canvas').getContext('2d'), T = 100;
      c.font = `${cs.fontWeight} ${T}px ${cs.fontFamily}`;
      const m = c.measureText(t), ih = m.actualBoundingBoxAscent + m.actualBoundingBoxDescent, iw = m.actualBoundingBoxLeft + m.actualBoundingBoxRight;
      if (!ih) return;
      const k = Math.min(box.height * 0.72 / ih, box.width * 0.72 / iw), fs = T * k;
      const asc = m.actualBoundingBoxAscent * k, dsc = m.actualBoundingBoxDescent * k;
      const fa = (m.fontBoundingBoxAscent || T * 0.9) * k, fd = (m.fontBoundingBoxDescent || T * 0.3) * k;
      const lh = box.height, base = (lh - (fa + fd)) / 2 + fa, inkMid = base - (asc - dsc) / 2, shift = lh / 2 - inkMid;
      e.style.setProperty('font-size', fs + 'px', 'important');
      e.style.setProperty('line-height', lh + 'px', 'important');
      e.style.setProperty('padding', '0', 'important');
      e.style.display = 'block';
      e.style.textAlign = 'center';
      e.innerHTML = `<span style="display:inline-block;transform:translateY(${shift.toFixed(1)}px)">${t.replace(/[&<]/g, '')}</span>`;
    } catch (x) {}
  };
  let fitT = 0;
  const onResize = () => { clearTimeout(fitT); fitT = setTimeout(fit, 60); };
  addEventListener('resize', onResize);

  const draw = () => { const e = document.getElementById('lf'); if (e) { e.innerHTML = card(); requestAnimationFrame(fit); } };
  window.lfSay = () => { const x = items()[F.i]; if (x && window.say) try { say(x[0], lang(x)); } catch (e) {} };
  window.lfGo = d => { const n = items().length; F.i = Math.max(0, Math.min(n - 1, F.i + d)); draw(); setTimeout(lfSay, 120); };
  window.lfQuiz = () => {
    const b = [...document.querySelectorAll('#app button.big')].find(e => /quiz\(\)/.test(e.getAttribute('onclick') || ''));
    if (b) b.click();
    else if (typeof quiz === 'function') quiz();
  };
  window.lfAll = () => { const g = document.getElementById('lf-all'); if (!g) return; g.open = !g.open; if (g.open) g.scrollIntoView({ behavior: 'smooth', block: 'start' }); };
  window.lfMic = () => {
    const R = window.SpeechRecognition || window.webkitSpeechRecognition, x = items()[F.i], b = document.getElementById('lf-mic'), t = document.getElementById('lf-mic-t');
    if (!R || !x) return;
    if (F.rec) { try { F.rec.stop(); } catch (e) {} return; }
    try { window.say && say.stop(); } catch (e) {}
    const r = new R();
    F.rec = r;
    r.lang = lang(x) === 'en' ? 'en-US' : 'ar-SA';
    r.maxAlternatives = 4;
    r.interimResults = false;
    b && b.classList.add('on');
    t && (t.textContent = '🎧 …');
    r.onresult = e => {
      const alts = [...e.results[0]].map(a => a.transcript);
      let j = { ok: 0 };
      try { j = window.judge ? judge(alts, x[0]) : { ok: alts.some(a => a.trim()) }; } catch (er) {}
      const m = j.ok ? (girl() ? 'أَحْسَنْتِ! 🌟' : 'أَحْسَنْتَ! 🌟') + (j.tip ? ' ' + j.tip : '') : (j.msg || 'حَاوِلْ مَرَّةً أُخْرَى 💪');
      if (t) t.textContent = m;
      try { window.say && say(m.replace(/[🌟💪🎧]/g, ''), 'ar'); } catch (er) {}
      if (j.ok && window.MC) MC.mood('happy', 1200);
    };
    r.onerror = () => { t && (t.textContent = 'لَمْ أَسْمَعْ جَيِّدًا، حَاوِلْ مَرَّةً أُخْرَى'); };
    r.onend = () => { F.rec = null; b && b.classList.remove('on'); };
    try { r.start(); } catch (e) { F.rec = null; }
  };

  const stopMic = () => {
    if (F.rec) { try { F.rec.stop(); } catch (e) {} F.rec = null; }
  };
  const decorate = () => {
    try {
      if (window.V !== 'lesson' || !window.cur || items().length < 2) return;
      if (window.Lazy) Lazy.onLeave(stopMic);
      const appEl = document.getElementById('app'), g = appEl && appEl.querySelector('.grid');
      if (!g || document.getElementById('lf')) return;
      if (F.id !== cur.id) { F.id = cur.id; F.i = 0; }
      const box = document.createElement('section');
      box.id = 'lf'; box.className = 'lf'; box.innerHTML = card();
      setTimeout(fit, 30);
      (document.fonts && document.fonts.ready || Promise.resolve()).then(() => setTimeout(fit, 30));
      const h2 = appEl.querySelector('h2');
      (h2 || g).insertAdjacentElement(h2 ? 'afterend' : 'beforebegin', box);
      if (h2) h2.classList.add('lf-h2');
      const det = document.createElement('details');
      det.id = 'lf-all'; det.className = 'lf-all';
      det.innerHTML = `<summary>🗂️ عَرْضُ كُلِّ الْبِطَاقَاتِ (${D0(items().length)})</summary>`;
      g.insertAdjacentElement('beforebegin', det);
      det.appendChild(g);
    } catch (e) {}
  };
  window.FocusLesson = { decorate, draw, fit };
})();
