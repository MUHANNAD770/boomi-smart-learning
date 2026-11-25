/* /src/games/mini-games.js — ألعاب سريعة تفاعلية (الذاكرة، تركيب الكلمات، الأنماط البصرية، ترتيب الجمل) */
(() => {
  'use strict';

  const sh = window.shuf || (a => [...a].sort(() => Math.random() - 0.5));
  const pk = window.pk || (a => a[Math.floor(Math.random() * a.length)]);
  const esc = window.esc || (s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
  const D = window.D || (n => String(n));
  const stripD0 = window.stripD || (s => String(s || '').replace(/[\u064B-\u0652\u0670\u0640]/g, '').trim());
  const OKS_FB = { ar: ['أَحْسَنْتَ!', 'رَائِعٌ!', 'مُمْتَازٌ!'], en: ['Great!', 'Awesome!', 'Well done!'] };

  const em = x => /\p{Extended_Pictographic}/u.test(x[1]) && x[1].length <= 5;
  const all = l => (window.S || []).flatMap(s => s.u).filter(u => u.l === l).flatMap(u => u.i);
  const pool = l => all(l).filter(em);
  const LG = () => (window.P && P.lang === 'en') ? 'en' : (window.P && P.lang === 'ar') ? 'ar' : pk(['ar', 'en']);

  let g = window.__gameState || {}, lk = 0;
  window.__snapshotGame = () => JSON.parse(JSON.stringify(g));
  window.__restoreGame = s => { Object.keys(g).forEach(k => delete g[k]); Object.assign(g, s || {}); };

  const good = l => {
    try { window.HurufiSound && HurufiSound.play('correct'); } catch (_) {}
    try { window.MC && MC.mood('happy', 1200); } catch (_) {}
    try {
      if (!(window.muted && muted())) {
        const list = (window.OKS && OKS[l]) || OKS_FB[l] || OKS_FB.ar;
        say(pk(list), l);
      }
    } catch (_) {}
  };
  const bad = () => {
    try { window.HurufiSound && HurufiSound.play('wrong'); } catch (_) {}
    try { window.MC && MC.mood('oops', 1200); } catch (_) {}
  };

  const fin2 = (n, fn) => {
    if (window.P) { P.star = (+P.star || 0) + (g.s || 0); save(); }
    try { window.HurufiSound && HurufiSound.play(g.s >= n * 0.6 ? 'finish' : 'wrong'); } catch (_) {}
    try { window.MC && MC.mood(g.s >= n * 0.6 ? 'happy' : 'oops', 2000); } catch (_) {}
    h(`<section class=sec><h1>${g.s >= n * 0.6 ? '🌟' : '💪'}</h1><h2>${D(g.s)} مِنْ ${D(n)}</h2><p>+${D(g.s)} ⭐ · مَجْمُوعُ نُجُومِكَ ${D((window.P && P.star) || 0)}</p><button class=big onclick="${fn}()">جَوْلَةٌ جَدِيدَةٌ</button><button class=alt onclick="games2d()">← رُجُوعٌ لِلْأَلْعَابِ</button></section>`);
  };

  const top = (t, i, n) => `<button class=link onclick="try{say.stop()}catch(_){};goBack()">← رُجُوعٌ</button><h2>${t}</h2><p class=mut>${i ? `${D(i)} مِنْ ${D(n)} · ` : ''}⭐ ${D(g.s || 0)}</p>`;
  const ok0 = () => { window.V = 'lesson'; lk = 0; return 1; };

  /* ١) لعبة الذاكرة */
  window.gMem = () => {
    if (!ok0()) return;
    window.__gameKind = 'gMem';
    const l = LG(), seen = new Set(), p = sh(pool(l)).filter(x => !seen.has(x[1]) && seen.add(x[1])).slice(0, 6);
    g = window.__gameState = { a: null, d: 0, m: 0, s: 0 };
    h(`<section class=sec>${top('🃏 لُعْبَةُ الذَّاكِرَةِ')}<p class=mut>اِقْلِبْ بِطَاقَتَيْنِ مُتَشَابِهَتَيْنِ</p><div class=grid>${sh([...p, ...p]).map((x, i) => `<button class=card id=mc${i} data-e="${esc(x[1])}" data-w="${esc(x[0])}" data-l="${esc(x[2] || l)}" onclick="mflip(${i})"><span>❓</span></button>`).join('')}</div></section>`);
  };

  window.mflip = i => {
    const b = document.getElementById('mc' + i);
    if (!b || lk || b.dataset.on) return;
    b.dataset.on = 1;
    b.firstChild.textContent = b.dataset.e;
    try { say(b.dataset.w, b.dataset.l); } catch (_) {}
    if (g.a == null) { g.a = i; return; }
    const a = document.getElementById('mc' + g.a);
    g.a = null;
    if (a && a.dataset.e === b.dataset.e) {
      g.d++;
      a.disabled = b.disabled = true;
      a.classList.add('ok');
      b.classList.add('ok');
      if (g.d === 6) {
        g.s = Math.max(1, 6 - Math.max(0, g.m - 3));
        setTimeout(() => fin2(6, 'gMem'), 650);
      }
    } else {
      g.m++;
      lk = 1;
      bad();
      setTimeout(() => {
        [a, b].forEach(x => { if (x) { delete x.dataset.on; x.firstChild.textContent = '❓'; } });
        lk = 0;
      }, 650);
    }
  };

  /* ٢) تركيب الكلمات */
  window.gBuild = () => {
    if (!ok0()) return;
    window.__gameKind = 'gBuild';
    g = window.__gameState = { s: 0, r: 0 };
    bn();
  };
  const bn = () => {
    if (g.r >= 5) return fin2(5, 'gBuild');
    const l = LG();
    const cands = pool(l).filter(x => { const w = stripD0(x[0]); return w.length >= 3 && w.length <= 6 && !/\s/.test(w); });
    if (!cands.length) return fin2(5, 'gBuild');
    const it = pk(cands), w = stripD0(it[0]);
    g.w = it; g.t = ''; g.l = l; g.c = w.toLowerCase();
    h(`<section class=sec>${top('🔤 رَكِّبِ الْكَلِمَةَ', g.r + 1, 5)}<div class=q>${it[1]}</div><div id=bs class=q dir=${l === 'ar' ? 'rtl' : 'ltr'}>&nbsp;</div><div class=grid dir=${l === 'ar' ? 'rtl' : 'ltr'}>${sh([...w]).map((c, i) => `<button class=opt id=bl${i} onclick="bpick(${i},'${esc(c)}')">${esc(c)}</button>`).join('')}</div><button class=link onclick="bn2()">مَسْحٌ</button></section>`);
    try { say(it[0], l); } catch (_) {}
  };
  window.bn2 = () => {
    g.t = '';
    const bs = document.getElementById('bs');
    if (bs) bs.innerHTML = '&nbsp;';
    document.querySelectorAll('.opt').forEach(b => { b.disabled = false; });
  };
  window.bpick = (i, c) => {
    if (lk) return;
    const btn = document.getElementById('bl' + i);
    if (btn) btn.disabled = true;
    g.t += c;
    const bs = document.getElementById('bs');
    if (bs) bs.textContent = g.t;
    if (g.t.length < g.c.length) return;
    lk = 1;
    const ok = g.t.toLowerCase() === g.c;
    if (bs) bs.textContent = g.w[0];
    if (ok) { g.s++; good(g.l); } else { bad(); try { say(g.w[0], g.l); } catch (_) {} }
    g.r++;
    setTimeout(() => { lk = 0; bn(); }, 950);
  };

  /* ٣) أكمل النمط البصري */
  window.gPat = () => {
    if (!ok0()) return;
    window.__gameKind = 'gPat';
    g = window.__gameState = { s: 0, r: 0 };
    pn();
  };
  const pn = () => {
    if (g.r >= 5) return fin2(5, 'gPat');
    const E = sh(['🍎', '⭐', '🐟', '🚗', '🔵', '🌸', '🐱', '⚽']), [a, b, c] = E;
    const T = [[a, b, a, b, a, b], [a, a, b, a, a, b], [a, b, b, a, b, b], [a, b, c, a, b, c]], s = pk(T), ans = s[5];
    h(`<section class=sec>${top('🧩 أَكْمِلِ النَّمَطَ', g.r + 1, 5)}<div class=q>${s.slice(0, 5).join(' ')} ❓</div><div class=grid>${sh([a, b, c]).map(x => `<button class=opt data-ok=${+(x === ans)} onclick="pans(this)">${x}</button>`).join('')}</div></section>`);
  };
  window.pans = b => {
    const ok = b.dataset.ok === '1';
    document.querySelectorAll('.opt').forEach(o => { o.disabled = true; if (o.dataset.ok === '1') o.classList.add('ok'); });
    if (!ok) b.classList.add('no');
    if (ok) { g.s++; good('ar'); } else bad();
    g.r++;
    setTimeout(pn, 800);
  };

  /* ٤) رتّب الجملة الإنجليزية */
  window.gOrd = () => {
    if (!ok0()) return;
    window.__gameKind = 'gOrd';
    g = window.__gameState = { s: 0, r: 0 };
    on();
  };
  const on = () => {
    if (g.r >= 5) return fin2(5, 'gOrd');
    const sents = all('en').filter(x => { const len = x[0].split(' ').length; return len >= 3 && len <= 6; });
    if (!sents.length) return fin2(5, 'gOrd');
    const it = pk(sents);
    g.w = it[0].replace(/[?.!]$/, '').split(' ');
    g.t = [];
    h(`<section class=sec>${top('📝 رَتِّبِ الْجُمْلَةَ', g.r + 1, 5)}<p class=mut dir=auto>${esc(it[1])}</p><div id=os class=q dir=ltr>&nbsp;</div><div class=grid>${sh(g.w.map((w, i) => [w, i])).map(([w, i]) => `<button class=opt dir=ltr id=ow${i} onclick="opick(${i})">${esc(w)}</button>`).join('')}</div><button class=link onclick="gOrd2()">مَسْحٌ</button></section>`);
    try { say(it[0], 'en'); } catch (_) {}
  };
  window.gOrd2 = () => {
    g.t = [];
    const os = document.getElementById('os');
    if (os) os.innerHTML = '&nbsp;';
    document.querySelectorAll('.opt').forEach(b => { b.disabled = false; });
  };
  window.opick = i => {
    if (lk) return;
    const btn = document.getElementById('ow' + i);
    if (btn) btn.disabled = true;
    g.t.push(g.w[i]);
    const os = document.getElementById('os');
    if (os) os.textContent = g.t.join(' ');
    if (g.t.length < g.w.length) return;
    lk = 1;
    const ok = g.t.join(' ') === g.w.join(' ');
    if (ok) { g.s++; good('en'); } else { bad(); try { say(g.w.join(' '), 'en'); } catch (_) {} }
    if (os) os.textContent = g.w.join(' ');
    g.r++;
    setTimeout(() => { lk = 0; on(); }, 950);
  };
})();
