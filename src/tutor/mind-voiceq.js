/* /src/tutor/mind-voiceq.js — الأسئلة الصوتية التفاعلية للعربية والإنجليزية (بدون رياضيات) */
window.MindVoice = (() => {
  'use strict';
  const Mem = window.MindMemory, Coach = window.MindCoach;
  const AD = '٠١٢٣٤٥٦٧٨٩', D = n => String(n).replace(/\d/g, d => AD[d]);
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pick = a => a[R(0, a.length - 1)];
  const sh = a => [...a].sort(() => Math.random() - 0.5);
  const pic = x => /\p{Extended_Pictographic}/u.test(x[1]) && x[1].length <= 5 && !/\s/.test(x[0]);
  const fem = t => window.studentGenderText ? window.studentGenderText(t) : t;
  const SR = () => window.SpeechRecognition || window.webkitSpeechRecognition;
  const micMode = () => !!(window.P && P.mic && SR());
  let open = false, bootAt = Date.now(), timer = 0;

  function gens() {
    const age = +(window.P && P.age) || 7;
    const G = [];
    const ar = Mem.dueItems('ar', 12).filter(pic);
    const en = Mem.dueItems('en', 12).filter(pic);

    if (ar.length >= 3) {
      G.push(() => {
        const it = pick(ar.slice(0, 6));
        return {
          key: it[0], type: 'pic-ar', lang: 'ar',
          show: `<div class=vq-pic>${it[1]}</div>`,
          ask: 'مَا اسْمُ هَذَا بِالْعَرَبِيَّةِ؟',
          askLang: 'ar',
          answer: it[0],
          pool: ar.map(x => x[0])
        };
      });
    }

    if (en.length >= 3 && (!window.P || P.lang !== 'ar')) {
      G.push(() => {
        const it = pick(en.slice(0, 6));
        const low = window.EnCoach && EnCoach.level() < 3;
        return {
          key: it[0], type: 'pic-en', lang: 'en',
          show: `<div class=vq-pic>${it[1]}</div>`,
          ask: low ? 'مَا اسْمُ هَذَا بِالْإِنْجِلِيزِيَّةِ؟' : 'What is this?',
          askLang: low ? 'ar' : 'en',
          answer: it[0],
          pool: en.map(x => x[0])
        };
      });
    }

    if (ar.length && en.length && age >= 7) {
      const pairs = [];
      for (const e of en) {
        const a = ar.find(x => x[1] === e[1]);
        if (a) pairs.push([e, a]);
      }
      if (pairs.length) {
        G.push(() => {
          const [e, a] = pick(pairs);
          return {
            key: a[0], type: 'mean', lang: 'ar',
            show: `<div class=vq-word dir=ltr>${e[0]}</div>`,
            ask: `مَا مَعْنَى كَلِمَةِ ${e[0]} بِالْعَرَبِيَّةِ؟`,
            askLang: 'ar',
            answer: a[0],
            pool: ar.map(x => x[0])
          };
        });
        G.push(() => {
          const [e, a] = pick(pairs);
          return {
            key: e[0], type: 'mean-en', lang: 'en',
            show: `<div class=vq-word dir=rtl>${a[0]}</div>`,
            ask: `مَا مَعْنَى «${a[0]}» بِالْإِنْجِلِيزِيَّةِ؟`,
            askLang: 'ar',
            answer: e[0],
            pool: en.map(x => x[0])
          };
        });
      }
    }
    return G;
  }

  function make() {
    const m = Mem.M(), G = gens();
    if (!G.length) return null;
    for (let i = 0; i < 12; i++) {
      const q = pick(G)();
      const id = q.type + ':' + q.answer;
      if (!m.vq.includes(id)) { q.id = id; return q; }
    }
    const q = pick(G)();
    q.id = q.type + ':' + q.answer;
    return q;
  }

  function choices(q) {
    const o = sh([...new Set((q.pool || []).filter(w => w !== q.answer))]).slice(0, 2);
    return sh([q.answer, ...o]).map(w => ({ t: w, ok: w === q.answer }));
  }

  function judge(q, alts) {
    alts = alts.filter(Boolean);
    if (!alts.length) return { ok: false, heard: '' };
    for (const a of alts) {
      if (window.Grade && Grade.text(a, [q.answer], { speech: true }).ok) return { ok: true, heard: a };
      for (const tok of (window.Grade ? Grade.norm(a) : a.toLowerCase()).split(' ')) {
        if (tok.length > 1 && window.Grade && Grade.text(tok, [q.answer], { speech: true }).ok) {
          return { ok: true, heard: a };
        }
      }
    }
    return { ok: false, heard: alts[0] };
  }

  const el = () => document.getElementById('vq');
  function close() {
    open = false;
    clearInterval(timer);
    const e = el();
    if (e) e.remove();
    try { window.say && say.stop(); } catch (_) {}
  }

  function ask(manual, rq) {
    if (open || !window.P) return false;
    const q = rq || make();
    if (!q) return false;
    if (!rq) q.ask = fem(q.ask);
    open = true;
    const m = Mem.M(), T = (+P.age || 7) < 7 ? 15 : 12, mic = micMode();
    const d = document.createElement('div');
    d.id = 'vq';
    d.setAttribute('role', 'dialog');
    d.setAttribute('aria-label', 'سؤال من بومي');
    d.innerHTML = `<div class=vq-card>
      <button class=vq-x aria-label="تخطّي">✕</button>
      <div class=vq-head><span class=vq-owl>🦉</span><b>سُؤَالٌ مِنْ بُومِي!</b></div>
      ${q.show}
      <p class=vq-ask dir=auto>${q.ask}</p>
      <div class=vq-timer hidden><svg viewBox="0 0 80 80"><circle cx=40 cy=40 r=34 class=vq-bg /><circle cx=40 cy=40 r=34 class=vq-fg /></svg><b id=vq-sec>${D(T)}</b></div>
      <p id=vq-st class=vq-st aria-live=polite>🔊 اِسْمَعِ السُّؤَالَ…</p>
      <div id=vq-opts class=vq-opts hidden></div>
    </div>`;
    document.body.appendChild(d);

    let rec = null, alts = [], done = false, left = T;
    function stopRec() { try { rec && rec.stop(); } catch (_) {} rec = null; }
    d.querySelector('.vq-x').onclick = () => { done = true; clearInterval(timer); stopRec(); close(); };
    try { window.HurufiSound && HurufiSound.play('select'); window.MC && MC.mood('wow', 1200); } catch (_) {}

    const st = t => { const e = document.getElementById('vq-st'); if (e) e.textContent = fem(t); };
    function showChoices() {
      const b = document.getElementById('vq-opts');
      if (!b || !b.hidden) return;
      b.hidden = false;
      b.innerHTML = choices(q).map(o => `<button class=opt data-ok=${+o.ok}>${o.t}</button>`).join('');
      b.querySelectorAll('button').forEach(x => x.onclick = () => finish(x.dataset.ok === '1', x.textContent));
    }

    function finish(ok, heard) {
      if (done) return;
      done = true;
      clearInterval(timer);
      stopRec();
      const t = d.querySelector('.vq-timer');
      if (t) t.hidden = true;
      m.vq.push(q.id);
      if (m.vq.length > 30) m.vq.shift();
      m.vqLast = Date.now();
      const dayKey = new Date().toDateString();
      if (m.vqDay !== dayKey) { m.vqDay = dayKey; m.vqN = 0; }
      m.vqN = (m.vqN || 0) + 1;
      const stat = P.stat.v = P.stat.v || [0, 0];
      stat[0]++;
      stat[1] += +ok;
      Mem.observe({ k: q.key, ok, ms: (T - left) * 1000, type: ok ? '' : 'voice' });

      let msg;
      if (ok) {
        P.star = (P.star || 0) + 2;
        msg = Coach.choose(q.lang === 'en' ? 'en' : 'ok') + (P.gender === 'female' ? ' رَبِحْتِ' : ' رَبِحْتَ') + ' نَجْمَتَيْنِ ⭐⭐';
      } else if (!heard) {
        msg = `لَمْ أَسْمَعْ جَوَابًا، لَا بَأْسَ! الْجَوَابُ: ${q.answer}.`;
      } else if (!q.rt) {
        msg = `${Coach.choose('soft')} فَكِّرْ جَيِّدًا وَحَاوِلْ مَرَّةً أُخْرَى!`;
      } else {
        msg = `${Coach.choose('soft')} الْجَوَابُ الصَّحِيحُ: ${q.answer}.`;
      }

      if (window.save) save();
      st((ok ? '✅ ' : '💡 ') + msg);
      d.querySelector('.vq-card').classList.add(ok ? 'good' : 'soft');
      const again = !ok && heard && !q.rt;
      const b = document.getElementById('vq-opts');
      if (b && !b.hidden) {
        b.querySelectorAll('button').forEach(x => {
          x.disabled = true;
          if (x.dataset.ok === '1' && !again) x.classList.add('ok');
        });
      }
      try { window.HurufiSound && HurufiSound.play(ok ? 'correct' : 'wrong'); window.MC && MC.mood(ok ? 'proud' : 'tilt', 1800); } catch (_) {}

      let closed = false;
      const end = () => {
        if (closed) return;
        closed = true;
        setTimeout(() => {
          const alive = document.body.contains(d);
          close();
          if (again && alive) setTimeout(() => ask(true, { ...q, rt: 1 }), 350);
        }, 900);
      };
      if (!(window.muted && muted())) say(fem(msg).replace(/[^\p{L}\p{M}\p{N}\s،.!؟:]/gu, ' '), 'ar', end, ok ? 'cheer' : 'soft');
      setTimeout(end, ok ? 4500 : 7500);
    }

    function listen() {
      if (done) return;
      const t = d.querySelector('.vq-timer');
      t.hidden = false;
      const fg = d.querySelector('.vq-fg'), C = 2 * Math.PI * 34;
      fg.style.strokeDasharray = C;
      const t0 = Date.now();
      timer = setInterval(() => {
        const el2 = (Date.now() - t0) / 1000;
        left = Math.max(0, T - el2);
        fg.style.strokeDashoffset = C * (el2 / T);
        const s = document.getElementById('vq-sec');
        if (s) s.textContent = D(Math.ceil(left));
        if (left <= 0) {
          clearInterval(timer);
          const j = judge(q, alts);
          finish(j.ok, j.heard);
        }
      }, 100);

      if (!mic) {
        st('👆 اِخْتَرِ الْإِجَابَةَ');
        showChoices();
        return;
      }

      const start = () => {
        if (done) return;
        try {
          rec = new (SR())();
          rec.lang = q.lang === 'en' ? 'en-US' : 'ar-SA';
          rec.interimResults = true;
          rec.maxAlternatives = 5;
          rec.continuous = false;
          rec.onresult = e => {
            if (done) return;
            const r = e.results[e.results.length - 1], a = [...r].map(x => x.transcript);
            st('🗣️ ' + a[0]);
            a.forEach(x => { if (!alts.includes(x)) alts.unshift(x); });
            if (r.isFinal) {
              const j = judge(q, alts);
              if (j.ok) finish(true, j.heard);
              else if (left > 4) {
                st('🎧 حَاوِلْ مَرَّةً أُخْرَى، أَوِ اخْتَرِ الْجَوَابَ…');
                showChoices();
                setTimeout(start, 250);
              } else finish(false, j.heard);
            }
          };
          rec.onerror = e => {
            if (['not-allowed', 'service-not-allowed', 'audio-capture'].includes(e.error)) {
              st('👆 اِخْتَرِ الْإِجَابَةَ');
              showChoices();
            }
          };
          rec.onend = () => {
            if (!done && left > 3 && rec) {
              setTimeout(() => { if (!done && document.getElementById('vq-opts')?.hidden) start(); }, 200);
            }
          };
          rec.start();
          st('🎤 أَسْمَعُكَ… تَكَلَّمِ الْآنَ');
          if (!start.fb) start.fb = setTimeout(() => { if (!done) showChoices(); }, Math.min(6000, T * 450));
          try { window.MC && MC.mood('listen', T * 1000); } catch (_) {}
        } catch (_) {
          st('👆 اِخْتَرِ الْإِجَابَةَ');
          showChoices();
        }
      };
      start();
    }

    let started = false;
    const go = () => {
      if (started || done || !document.body.contains(d)) return;
      started = true;
      listen();
    };
    if (window.muted && muted()) setTimeout(go, 900);
    else {
      say(q.ask, q.askLang || 'ar', go, 'ask');
      const wait = () => {
        if (started || done) return;
        if (window.say && say.live) setTimeout(wait, 400);
        else go();
      };
      setTimeout(wait, 6500);
    }
    return true;
  }

  function eligible() {
    if (!window.P || P.vq === 0 || open) return false;
    const m = Mem.M(), gap = (P.vq === 2 ? 3 : 6) * 60000;
    if (Date.now() - bootAt < 90000 || Date.now() - (m.vqLast || 0) < gap) return false;
    if (m.vqDay === new Date().toDateString() && (m.vqN || 0) >= (P.vq === 2 ? 10 : 6)) return false;
    if (!['home', 'sec'].includes(window.V) || document.getElementById('bm') || (window.say && say.live)) return false;
    return Mem.learned().length >= 3;
  }

  const oh = window.h;
  if (typeof oh === 'function') {
    window.h = function () {
      const r = oh.apply(this, arguments);
      const v = window.V;
      setTimeout(() => { if (window.V === v && eligible() && Math.random() < 0.5) ask(); }, 3500);
      return r;
    };
  }

  return { ask, eligible, judge, make, close, micMode, isOpen: () => open, _boot: t => { bootAt = t; } };
})();
