/* mic.js — تدريب النطق الاحترافي (موجات صوتية حيّة + مقارنة مع النطق الصحيح) */
(() => {
  'use strict';
  let S0 = null, url = null, sp1 = null;
  const norm = s => (window.Grade ? Grade.norm(s) : String(s || '').toLowerCase().replace(/[\u064B-\u0652\u0670]/g, '').trim());
  const lev = (a, b) => (window.Grade ? Grade.edit(a, b).d : (a === b ? 0 : Math.max(a.length, b.length)));
  const near = (a, t) => norm(a) === norm(t);
  const OKS = { ar: ['أَحْسَنْتَ! 🌟', 'مُمْتَاز! 👏', 'نُطْقٌ رَائِعٌ! 🗣️'], en: ['Great! 🌟', 'Awesome! 👏', 'Well said! 🗣️'] };
  const stopAll = () => {
    if (S0) S0.end(1);
    if (url) { URL.revokeObjectURL(url); url = null; }
  };

  window.judge = (alts, target) => {
    const t = norm(target);
    if (alts.some(a => near(a, t))) return { ok: 1 };
    if (window.Grade) {
      let best = null;
      for (const a of alts) {
        const g = Grade.text(a, [target], { speech: true });
        if (g.ok) return { ok: 1, tip: g.d > 0 ? 'وحاول أن تنطقها بوضوح أكثر 🎧' : '' };
        if (g.close && (!best || g.d < best.d)) best = g;
      }
      if (best) return { ok: 1, tip: 'نطقك قريب جدًا! ' + (best.tip ? best.tip.replace('اكتب', 'انطق') : 'كرّرها مرة أخرى بوضوح') + ' 🎧' };
    }
    const hs = alts.map(norm).filter(Boolean);
    if (!hs.length) return { ok: 0, msg: 'لم أسمع شيئًا. اقترب من الميكروفون وحاول مرة أخرى 🎧' };
    const h0 = hs.sort((a, b) => lev(a, t) - lev(b, t))[0];
    let i = 0;
    while (i < t.length && t[i] === h0[i]) i++;
    const ch = t[Math.min(i, Math.max(0, t.length - 1))] || '';
    return {
      ok: 0,
      wl: ch,
      heard: h0,
      msg: h0.length < t.length - 1
        ? `سمعتُ «${h0}». يبدو أنك نسيت صوتًا. ركّز على حرف «${ch}»`
        : h0.length > t.length + 1
          ? `سمعتُ «${h0}». هناك صوت زائد، انطق الكلمة بهدوء`
          : `سمعتُ «${h0}». ركّز على حرف «${ch}» وأعد المحاولة`
    };
  };

  const draw = (an, c) => {
    const x = c.getContext('2d'), b = new Uint8Array(an.fftSize);
    return () => {
      an.getByteTimeDomainData(b);
      x.clearRect(0, 0, c.width, c.height);
      x.lineWidth = 3;
      x.strokeStyle = '#3b7bf0';
      x.beginPath();
      let r = 0;
      b.forEach((v, i) => {
        const y = v / 255 * c.height;
        r = Math.max(r, Math.abs(v - 128));
        i ? x.lineTo(i / b.length * c.width, y) : x.moveTo(0, y);
      });
      x.stroke();
      const l = document.getElementById('lv');
      if (l) l.style.width = Math.min(100, r / 64 * 100) + '%';
    };
  };

  const speakMsg = (m, l, s) => {
    const tb = document.getElementById('tb');
    if (tb) tb.textContent = m;
    if (window.say) say(s || m.replace(/[\p{Extended_Pictographic}\uFE0F]/gu, ''), l || 'ar');
  };

  window.speak = function () {
    window.V = 'lesson';
    stopAll();
    if (window.Lazy) Lazy.onLeave(stopAll);
    if (!P.mic) {
      return h(`<section class="sec"><button class="link" onclick="goBack()">← رجوع</button><h2>🎤 تدريب النطق</h2><p>لاستخدام الميكروفون نحتاج موافقة ولي الأمر من لوحة ولي الأمر.</p><button class="big" onclick="parentPanel()">فتح لوحة ولي الأمر</button></section>`);
    }
    const pool = units(P.stage).flatMap(u => u.i).filter(x => stripD(x[0]).length > 1 && !/\s/.test(x[0]));
    sp1 = (window.wsample ? wsample(pool, 1)[0] : pk(pool)) || ['أَسَدٌ', '🦁', 'ar'];
    window.sp1 = sp1;
    h(`<section class="sec"><button class="link" onclick="goBack()">← رجوع</button><h2>🎤 تدريب النطق</h2>
      <div class="q">${esc(sp1[1])}</div><h2 dir="auto" style="text-align:center">${esc(sp1[0])}</h2>
      <div id="tb" class="bub">🦉 استمع إليّ أولًا، ثم اضغط «انطقها»</div>
      <canvas id="wv" width="300" height="60" style="width:100%;height:60px;background:#f4f8ff;border-radius:12px"></canvas>
      <div class="bar"><div id="lv" style="width:0"></div></div>
      <p id="tr" class="mut" dir="auto" aria-live="polite">—</p>
      <div class="row">
        <button class="alt" onclick="say(window.sp1[0],window.sp1[2])">🔊 استمع</button>
        <button id="mb" class="big" onclick="mic()">🎤 انطقها</button>
        <button id="pb" class="alt" hidden onclick="playMine()">▶️ صوتك</button>
        <button class="alt" onclick="speak()">كلمة أخرى</button>
      </div></section>`);
    setTimeout(() => { if (document.getElementById('tb') && window.say) say(sp1[0], sp1[2]); }, 300);
  };

  window.playMine = () => { if (url) { window.say && say.stop(); new Audio(url).play().catch(() => {}); } };

  window.mic = async function () {
    const mb = document.getElementById('mb');
    if (S0) return S0.end();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    window.say && say.stop();
    window.MC && MC.mood('listen', 6500);
    let st;
    try {
      st = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true } });
    } catch (e) {
      return speakMsg(e && e.name === 'NotAllowedError'
        ? 'لم يُسمح بالميكروفون. اسمح به من إعدادات المتصفح وأعد المحاولة 🔒'
        : 'لا أجد ميكروفونًا في جهازك. تأكد من توصيله', 'ar');
    }
    if (url) { URL.revokeObjectURL(url); url = null; }
    const pb = document.getElementById('pb');
    if (pb) pb.hidden = true;
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const an = ac.createAnalyser();
    an.fftSize = 512;
    ac.createMediaStreamSource(st).connect(an);
    const c = document.getElementById('wv');
    const f = c ? draw(an, c) : () => {};
    let raf = 0, ch = [], mr = null, alts = [], done = 0, r = null, q = 0;
    const loop = () => { f(); raf = requestAnimationFrame(loop); };
    loop();
    if (window.MediaRecorder) {
      try {
        mr = new MediaRecorder(st);
        mr.ondataavailable = e => e.data.size && ch.push(e.data);
        mr.start();
      } catch (e) { mr = null; }
    }
    const fin = () => {
      if (done++) return;
      cancelAnimationFrame(raf);
      try { r && r.stop(); } catch (e) {}
      st.getTracks().forEach(t => t.stop());
      try { ac.close(); } catch (e) {}
      S0 = null;
      if (mb) mb.textContent = '🎤 انطقها';
      if (q) return;
      const after = () => {
        if (ch.length) {
          url = URL.createObjectURL(new Blob(ch, { type: (mr && mr.mimeType) || 'audio/webm' }));
          const p = document.getElementById('pb');
          if (p) p.hidden = false;
        }
        if (!SR) {
          speakMsg('تم التسجيل! قارن صوتك بصوتي بالضغط على 🔊 و▶️', 'ar');
          return;
        }
        const t = sp1[0];
        const w = P.pr[t] = P.pr[t] || [0, 0];
        const cc = P.stat.p = P.stat.p || [0, 0];
        const j = window.judge(alts, t);
        if (!alts.length) { speakMsg(j.msg, 'ar'); return; }
        w[0]++; cc[0]++;
        if (j.ok) {
          w[1]++; cc[1]++;
          P.star++;
          window.MC && MC.mood('happy', 1500);
          speakMsg(pk(OKS[sp1[2]] || OKS.ar) + (j.tip ? ' ' + j.tip : ''), sp1[2]);
        } else {
          window.MC && MC.mood('oops', 1200);
          if (j.wl) P.wl[j.wl] = (P.wl[j.wl] || 0) + 1;
          speakMsg(j.msg + ' 💪', 'ar', j.msg.replace(/«[^»]*»/g, ''));
        }
        save();
      };
      if (mr && mr.state !== 'inactive') {
        mr.onstop = after;
        try { mr.stop(); } catch (e) { after(); }
      } else after();
    };
    S0 = { end: quiet => { if (quiet) q = 1; fin(); } };
    if (mb) mb.textContent = '⏹️ توقف';
    speakMsg('أنا أسمعك... 🎧', 'ar', '');
    if (SR) {
      r = new SR();
      r.lang = sp1[2] === 'ar' ? 'ar-SA' : 'en-US';
      r.maxAlternatives = 5;
      r.interimResults = true;
      r.onresult = e => {
        const R0 = e.results[e.results.length - 1];
        const tr = document.getElementById('tr');
        if (tr) tr.textContent = '🗣️ ' + R0[0].transcript;
        if (R0.isFinal) {
          alts = [...R0].map(x => x.transcript);
          setTimeout(fin, 200);
        }
      };
      r.onerror = ev => {
        if (ev.error === 'not-allowed' || ev.error === 'service-not-allowed') {
          speakMsg('خدمة التعرف على الكلام غير مسموحة في هذا المتصفح', 'ar');
        }
        setTimeout(fin, 100);
      };
      r.onend = () => setTimeout(fin, 200);
      try { r.start(); } catch (e) {}
    }
    setTimeout(fin, 7000);
  };
})();
