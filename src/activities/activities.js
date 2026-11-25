/* /src/activities/activities.js — أنشطة تفاعلية للعربية والإنجليزية: تتبّع الحروف بالإصبع، التلوين، ومسارات القلم */
(() => {
  'use strict';

  const R = window.R || ((a, b) => a + Math.floor(Math.random() * (b - a + 1)));
  const sh = window.shuf || (a => [...a].sort(() => Math.random() - 0.5));
  const pk = window.pk || (a => a[R(0, a.length - 1)]);
  const ad = window.D || (n => String(n));

  const LT = [
    ['Apple', '🍎'], ['Banana', '🍌'], ['Car', '🚗'], ['Dog', '🐶'], ['Elephant', '🐘'],
    ['Fish', '🐟'], ['Giraffe', '🦒'], ['Horse', '🐴'], ['Ice cream', '🍦'], ['Jam', '🍓'],
    ['Kite', '🪁'], ['Lemon', '🍋'], ['Mango', '🥭'], ['Nut', '🥜'], ['Octopus', '🐙'],
    ['Panda', '🐼'], ['Quail', '🐦'], ['Rabbit', '🐰'], ['Snail', '🐌'], ['Turtle', '🐢'],
    ['Umbrella', '☂️'], ['Van', '🚐'], ['Window', '🪟'], ['Xylophone', '🎹'], ['Yoyo', '🪀'], ['Zebra', '🦓']
  ];

  const COL = ['#e53935', '#fdd835', '#43a047', '#1e88e5', '#fb8c00', '#8e24aa', '#ec407a'];

  const star = k => {
    try {
      if (!window.P) return;
      P.act = P.act || {};
      if (!P.act[k]) {
        P.act[k] = 1;
        P.star = (+P.star || 0) + 1;
        save();
      }
    } catch (_) {}
  };

  const good = () => {
    try {
      window.HurufiSound && HurufiSound.play('correct');
      window.MC && MC.mood('happy', 1200);
    } catch (_) {}
  };

  const bad = () => {
    try {
      window.HurufiSound && HurufiSound.play('wrong');
      window.MC && MC.mood('oops', 1200);
    } catch (_) {}
  };

  const back = (f = 'act') => `<button class=link onclick="try{say.stop()}catch(_){};${f}()">← رُجُوعٌ</button>`;
  const pal = () => `<div class=ac-pal>${COL.map(c => `<button style="background:${c}" aria-label="لون" onclick="document.getElementById('acb').style.color='${c}'"></button>`).join('')}</div>`;
  const pad = () => `<div class=ac-pad><canvas id=ag width=300 height=300></canvas><canvas id=au width=300 height=300></canvas></div><p id=am class=mut aria-live=polite></p><div class=ink-tools><button class=link onclick="aClr()">🧽 مَسْحٌ</button><button class=link onclick="aFree(this)">✍️ اكْتُبْ بِدُونِ نَمُوذَجٍ</button></div>`;

  const fin = (s, n, me) => {
    try {
      if (window.P) {
        P.star = (+P.star || 0) + s;
        save();
      }
      window.HurufiSound && HurufiSound.play(s >= n * 0.6 ? 'finish' : 'wrong');
    } catch (_) {}
    h(`<section class=sec><h1>${s >= n * 0.6 ? '🌟' : '💪'}</h1><h2>${ad(s)} مِنْ ${ad(n)}</h2><p>+${ad(s)} ⭐</p><button class=big onclick="${me}()">جَوْلَةٌ جَدِيدَةٌ</button><button class=alt onclick="act()">← رُجُوعٌ لِلْأَنْشِطَةِ</button></section>`);
  };

  function tracer(txt, font, ok) {
    const cg = document.getElementById('ag'), cu = document.getElementById('au');
    if (!cg || !cu) return;
    const W = 300, c = cg.getContext('2d'), u = cu.getContext('2d');
    c.font = font;
    c.textAlign = 'center';
    c.textBaseline = 'middle';
    c.fillStyle = '#cfd8ff';
    c.fillText(txt, W / 2, W / 2 + 12);
    const gd = c.getImageData(0, 0, W, W).data;
    let d = 0, last = null, won = false, lastTip = '';
    u.lineWidth = 18;
    u.lineCap = u.lineJoin = 'round';
    u.strokeStyle = '#ff7043';

    const msg = (t, speak, mood) => {
      const m = document.getElementById('am');
      if (!m) return;
      m.textContent = t;
      m.className = 'mut ink-msg ' + (mood || '');
      if (speak && t && t !== lastTip && !(window.muted && muted())) {
        lastTip = t;
        try { say(t.replace(/[^\p{L}\p{M}\p{N}\s،.!؟«»]/gu, ' '), 'ar', null, mood === 'good' ? 'happy' : 'soft'); } catch (_) {}
      }
    };

    const overlap = () => {
      const ud = u.getImageData(0, 0, W, W).data;
      let g = 0, n = 0, hit = 0;
      for (let i = 3; i < ud.length; i += 4) {
        const a = gd[i] > 100, b = ud[i] > 100;
        if (a) g++;
        if (b) n++;
        if (a && b) hit++;
      }
      return g && hit / g > 0.5 && hit / (n || 1) > 0.45;
    };

    const win = t => {
      if (won) { msg(t || 'أَحْسَنْتَ! 🌟', false, 'good'); return; }
      won = true;
      msg(t || 'أَحْسَنْتَ! 🌟', true, 'good');
      ok && ok();
    };

    const pt = e => {
      const r = cu.getBoundingClientRect();
      return [(e.clientX - r.left) * W / r.width, (e.clientY - r.top) * W / r.height];
    };

    cu.onpointerdown = e => {
      e.preventDefault();
      try { cu.setPointerCapture(e.pointerId); } catch (_) {}
      d = 1;
      last = pt(e);
      u.beginPath();
      u.moveTo(last[0], last[1]);
      u.lineTo(last[0] + 0.1, last[1]);
      u.stroke();
    };
    cu.onpointermove = e => {
      if (!d) return;
      const p = pt(e);
      u.beginPath();
      u.moveTo(last[0], last[1]);
      u.lineTo(p[0], p[1]);
      u.stroke();
      last = p;
    };
    cu.onpointerup = cu.onpointercancel = () => { d = 0; };

    if (window.Ink && Ink.attach) {
      Ink.attach(cu, {
        target: txt,
        wait: 850,
        onResult: r => {
          const guided = getComputedStyle(cg).opacity !== '0';
          if (r.ok || (guided && overlap())) return win(r.ok && r.tip ? r.tip : 'أَحْسَنْتَ! 🌟');
          if (r.empty) return;
          msg(r.tip, true, r.close ? 'near' : 'try');
        }
      });
    }

    window.aClr = () => {
      u.clearRect(0, 0, W, W);
      window.Ink && Ink.clear && Ink.clear(cu);
      won = false;
      msg('');
    };
    window.aFree = b => {
      const off = cg.style.opacity === '0';
      cg.style.opacity = off ? '1' : '0';
      b.textContent = off ? '✍️ اكْتُبْ بِدُونِ نَمُوذَجٍ' : '👀 أَظْهِرِ النَّمُوذَجَ';
      window.aClr();
    };
  }

  /* القائمة: خالية تماماً من أي أرقام أو رياضيات أو مغامرات */
  const MN = [
    ['🔠', 'الحروف الإنجليزية A–Z (تتبّع)', 'aLet'],
    ['🐝', 'مسار النحلة (تدريب القلم واليد)', 'aPath']
  ];

  window.act = () => {
    window.V = 'sec';
    window.CS = 'games';
    const sub = window.P && P.gender === 'female'
      ? 'تَتَبَّعِي الْحُرُوفَ، وَلَوِّنِي، وَتَدَرَّبِي عَلَى الْإِمْلَاءِ وَالْقِرَاءَةِ'
      : 'تَتَبَّعِ الْحُرُوفَ، وَلَوِّنْ، وَتَدَرَّبْ عَلَى الْإِمْلَاءِ وَالْقِرَاءَةِ';
    h(`<section class=sec><button class=link onclick="goBack()">← رُجُوعٌ</button><h2>🎨 أَنْشِطَةٌ تَفَاعُلِيَّةٌ</h2><p class=mut>${sub}</p><div class=list>${MN.map(x => `<button class=row onclick="${x[2]}()"><span>${x[0]}</span><b>${x[1]}</b></button>`).join('')}</div></section>`);
  };

  /* الحروف الإنجليزية */
  window.aLet = () => {
    window.V = 'lesson';
    h(`<section class=sec>${back()}<h2>🔠 الْحُرُوفُ الْإِنْجِلِيزِيَّةُ</h2><p class=mut>اِضْغَطْ حَرْفًا لِتَتَعَلَّمَهُ وَتَتَبَّعَهُ</p><div class=grid dir=ltr>${LT.map((x, i) => `<button class=opt onclick="aLetP(${i})">${x[0][0]}${x[0][0].toLowerCase()}</button>`).join('')}</div></section>`);
  };

  window.aLetP = i => {
    window.V = 'lesson';
    const [w, e] = LT[i], L = w[0], n = LT.length;
    h(`<section class=sec>${back('aLet')}<h2 dir=ltr>${L}${L.toLowerCase()}</h2>${pal()}<div class=ac-big dir=ltr id=acb>${L}</div><div class=q dir=ltr>${e} ${w}</div><div class=row style="gap:8px;justify-content:center;flex-wrap:wrap"><button class=alt onclick="say('${L}','en')">🔊 الحرف</button><button class=alt onclick="say('${w}','en')">🔊 الكلمة</button></div><p class=mut>🖍️ لَوِّنِ الْحَرْفَ ثُمَّ تَتَبَّعْهُ بِإِصْبَعِكَ</p>${pad()}<div class=ac-nav><button class=alt onclick="aLetP(${(i + n - 1) % n})">→ السَّابِقُ</button><button class=big onclick="aLetP(${(i + 1) % n})">التَّالِي ←</button></div></section>`);
    tracer(L, '900 230px Arial,sans-serif', () => { good(); star('l' + L); });
    try { say(L + ' for ' + w, 'en'); } catch (_) {}
  };

  /* جولات ٥ أسئلة موحدة */
  function q5(t, mk, me) {
    let r = 0, s = 0;
    const nx = () => {
      if (r >= 5) return fin(s, 5, me);
      const x = mk();
      window.V = 'lesson';
      h(`<section class=sec>${back()}<h2>${t}</h2><p class=mut>${ad(r + 1)} مِنْ ٥ · ⭐ ${ad(s)}</p>${x.q}<div class=grid>${x.o.map(o => `<button class=opt dir=auto data-ok=${+o.ok}>${esc(o.t)}</button>`).join('')}</div></section>`);
      if (x.say) try { say(x.say, x.sayL || 'en'); } catch (_) {}
      document.querySelectorAll('.opt').forEach(b => {
        b.onclick = () => {
          const ok = b.dataset.ok === '1';
          document.querySelectorAll('.opt').forEach(o => {
            o.disabled = true;
            if (o.dataset.ok === '1') o.classList.add('ok');
          });
          if (ok) { s++; good(); } else { b.classList.add('no'); bad(); }
          r++;
          setTimeout(nx, 900);
        };
      });
    };
    nx();
  }

  const opts = (correct, pool, labelFn = x => x) => {
    const arr = window.uniqueOpts ? uniqueOpts(correct, pool, labelFn, 4) : sh([correct, ...sh(pool).slice(0, 3)]);
    return arr.map(x => ({ t: labelFn(x), ok: labelFn(x) === labelFn(correct) }));
  };

  /* مسارات: النحلة إلى البيت / الفراشة إلى الزهرة */
  const dens = p => {
    const o = [];
    for (let i = 1; i < p.length; i++) {
      const a = p[i - 1], b = p[i], n = Math.max(1, Math.ceil(Math.hypot((b[0] - a[0]) * 320, (b[1] - a[1]) * 140) / 4));
      for (let k = 0; k < n; k++) o.push([a[0] + (b[0] - a[0]) * k / n, a[1] + (b[1] - a[1]) * k / n]);
    }
    o.push(p[p.length - 1]);
    return o;
  };
  const zig = (n, a) => Array.from({ length: n + 1 }, (_, i) => [0.06 + 0.88 * i / n, 0.5 + (i % 2 ? a : -a)]);
  const PT = [
    ['مَوْجَةٌ', () => Array.from({ length: 120 }, (_, i) => { const t = i / 119; return [0.06 + 0.88 * t, 0.5 + 0.22 * Math.sin(t * Math.PI * 10)]; })],
    ['مُتَعَرِّجٌ', () => zig(8, 0.3)],
    ['حَلَزُونَاتٌ', () => Array.from({ length: 300 }, (_, i) => { const p = i / 299 * Math.PI * 16; return [0.06 + 0.88 * p / (Math.PI * 16) - 0.04 * Math.sin(p), 0.5 - 0.14 * Math.cos(p)]; })],
    ['مُرَبَّعَاتٌ', () => { const p = [[0.06, 0.8]]; for (let i = 0; i < 6; i++) { const x = 0.06 + 0.88 * i / 6, w = 0.88 / 6; p.push([x, 0.25], [x + w / 2, 0.25], [x + w / 2, 0.8], [x + w, 0.8]); } return p; }],
    ['خَطٌّ مُسْتَقِيمٌ', () => [[0.06, 0.5], [0.94, 0.5]]],
    ['قِمَمٌ صَغِيرَةٌ', () => zig(14, 0.15)]
  ];

  window.aPath = (i = 0, s = 0) => {
    window.V = 'lesson';
    if (i >= PT.length) return fin(s, PT.length, 'aPath');
    const E = i % 2 ? ['🦋', '🌼'] : ['🐝', '🍯'];
    const pts = dens(PT[i][1]()).map(p => [p[0] * 320, p[1] * 140]);
    h(`<section class=sec>${back()}<h2>🐝 سَاعِدْ فِي الْوُصُولِ</h2><p class=mut>${PT[i][0]} · ${ad(i + 1)} مِنْ ${ad(PT.length)} · ⭐ ${ad(s)}</p><div class=ac-path><span>${E[0]}</span><canvas id=pc width=320 height=140></canvas><span>${E[1]}</span></div><button class=link onclick="aPath(${i},${s})">إِعَادَةٌ ↻</button></section>`);
    const cv = document.getElementById('pc'), c = cv.getContext('2d');
    let idx = 0, d = 0, done = 0;
    const draw = () => {
      c.clearRect(0, 0, 320, 140);
      c.lineCap = c.lineJoin = 'round';
      c.setLineDash([8, 8]);
      c.strokeStyle = '#90a4ae';
      c.lineWidth = 4;
      c.beginPath();
      pts.forEach((p, k) => k ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]));
      c.stroke();
      c.setLineDash([]);
      c.strokeStyle = '#ff9800';
      c.lineWidth = 7;
      c.beginPath();
      for (let k = 0; k <= idx; k++) k ? c.lineTo(pts[k][0], pts[k][1]) : c.moveTo(pts[k][0], pts[k][1]);
      c.stroke();
    };
    const mv = e => {
      if (!d || done) return;
      const r = cv.getBoundingClientRect(), x = (e.clientX - r.left) * 320 / r.width, y = (e.clientY - r.top) * 140 / r.height;
      for (let k = Math.min(idx + 14, pts.length - 1); k >= idx; k--) {
        if (Math.hypot(pts[k][0] - x, pts[k][1] - y) < 26) { idx = k; break; }
      }
      draw();
      if (idx >= pts.length - 3) {
        done = 1;
        good();
        setTimeout(() => aPath(i + 1, s + 1), 700);
      }
    };
    cv.onpointerdown = e => { e.preventDefault(); try { cv.setPointerCapture(e.pointerId); } catch (_) {} d = 1; mv(e); };
    cv.onpointermove = mv;
    cv.onpointerup = cv.onpointercancel = () => { d = 0; };
    draw();
  };

  window.AC = { MN, q5, opts, pal, pad, tracer, back, good, bad, star, sh, pk, R, ad, COL };
})();
