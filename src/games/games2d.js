/* /src/games/games2d.js — عالم الألعاب التعليمية 2D للعربية والإنجليزية والذكاء اللغوي */
(() => {
  'use strict';
  const G2 = window.G2;
  if (!G2) return;

  const $ = s => document.querySelector(s);
  const esc = window.esc || (s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])));
  const shuf = window.shuf || (a => [...a].sort(() => Math.random() - 0.5));
  const pick = a => a[Math.floor(Math.random() * a.length)];
  const R = window.R || ((a, b) => a + Math.floor(Math.random() * (b - a + 1)));
  const strip = s => String(s || '').replace(/[\u064B-\u0652\u0670\u0640]/g, '');
  const D = window.D || (n => String(n));
  const gsap = window.gsap;
  const calm = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; } };
  const talk = (t, l) => { try { if (!(window.muted && muted())) say(t, l || 'ar'); } catch (_) {} };
  const mood = (m, ms) => { try { window.MC && MC.mood(m, ms || 1400); } catch (_) {} };

  const AR_NAMES = { ا: 'أَلِف', ب: 'بَاء', ت: 'تَاء', ث: 'ثَاء', ج: 'جِيم', ح: 'حَاء', خ: 'خَاء', د: 'دَال', ذ: 'ذَال', ر: 'رَاء', ز: 'زَاي', س: 'سِين', ش: 'شِين', ص: 'صَاد', ض: 'ضَاد', ط: 'طَاء', ظ: 'ظَاء', ع: 'عَيْن', غ: 'غَيْن', ف: 'فَاء', ق: 'قَاف', ك: 'كَاف', ل: 'لَام', م: 'مِيم', ن: 'نُون', ه: 'هَاء', و: 'وَاو', ي: 'يَاء' };
  const AR_L = Object.keys(AR_NAMES);
  const EN_L = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
  const isPic = v => /\p{Extended_Pictographic}/u.test(String(v)) && strip(String(v)).replace(/[\p{Extended_Pictographic}\uFE0F\u200D\s]/gu, '').length === 0;
  const stage = () => Math.max(0, Math.min(4, +((window.P || {}).stage) || 0));

  function words(l, maxLen) {
    const out = [], seen = new Set();
    for (let a = 0; a <= Math.min(4, stage() + 1); a++) {
      for (const u of ((window.S && S[a]) ? S[a].u : [])) {
        if (u.l !== l) continue;
        for (const it of u.i) {
          const w = String(it[0]);
          if (!isPic(it[1]) || /\s/.test(w) || seen.has(w)) continue;
          const n = l === 'ar' ? strip(w).length : w.length;
          if (n < 2 || n > (maxLen || 7)) continue;
          seen.add(w);
          out.push({ w, pic: it[1], l });
        }
      }
    }
    return out;
  }

  const grs = w => String(w).match(/[ء-يٱ](?:[ً-ْٰ])*/g) || [];
  const firstAr = w => {
    const g = grs(w).map(strip);
    return (g[0] === 'ا' || g[0] === 'أ') && g[1] === 'ل' && g.length > 3 ? g[2] : g[0];
  };
  const sentences = () => {
    const L = [];
    for (let a = 0; a <= Math.min(4, stage() + 1); a++) {
      for (const u of ((window.S && S[a]) ? S[a].u : [])) {
        if (u.l === 'ar') {
          for (const it of u.i) {
            const n = String(it[0]).split(/\s+/).length;
            if (n >= 3 && n <= 6) L.push({ s: it[0], pic: isPic(it[1]) ? it[1] : '' });
          }
        }
      }
    }
    return L;
  };

  /* ── الحفظ والنقاط ── */
  const store = () => { P.g2 = P.g2 || {}; return P.g2; };
  const rec = id => { const g = store(); return g[id] = g[id] || { u: 1, s: {}, b: {}, n: 0 }; };
  const totalStars = id => Object.values(rec(id).s).reduce((a, b) => a + b, 0);

  function finishLevel(game, lv, res) {
    const r = rec(game.id), old = r.s[lv] || 0, st = res.stars;
    r.n++; r.last = Date.now();
    if (st > old) { P.star = (+P.star || 0) + (st - old); r.s[lv] = st; }
    r.b[lv] = { t: Math.round(res.time || 0), acc: res.acc != null ? Math.round(res.acc * 100) : undefined };
    if (st > 0 && lv >= r.u && lv < game.levels) r.u = lv + 1;
    try { P.stat.g = P.stat.g || [0, 0]; P.stat.g[0]++; P.stat.g[1] += st > 0 ? 1 : 0; } catch (_) {}
    save();
    try { window.MC && MC.stats && MC.stats(); } catch (_) {}
    return { gained: Math.max(0, st - old), r };
  }

  function startUnlock(game) {
    const r = rec(game.id);
    if (r.init) return;
    r.init = 1;
    const age = +P.age || 7, lv = Math.min(game.levels, 1 + Math.floor(stage() / 2) + (age >= 10 ? 1 : 0));
    if (lv > r.u) r.u = lv;
    save();
  }

  /* ── واجهة اللعبة ── */
  let cur = null, eng = null;
  const stopEng = () => {
    try { eng && eng.destroy && eng.destroy(); } catch (_) {}
    eng = null;
    document.querySelectorAll('.g2-ov').forEach(o => o.remove());
  };
  const shell = (game, lv, body) => `<div class=g2-top><button class=link onclick="games2d()">← الْأَلْعَابُ</button><b>${game.icon} ${esc(game.name)}</b><span class=g2-lvtag>الْمَرْحَلَةُ ${D(lv)}/${D(game.levels)}</span></div>${body}`;

  function play(id, lv) {
    const game = GAMES.find(g => g.id === id);
    if (!game) return games2d();
    startUnlock(game);
    const r = rec(id);
    lv = Math.max(1, Math.min(lv || r.u, game.levels));
    if (lv > r.u) { talk('هَذِهِ الْمَرْحَلَةُ مُقْفَلَةٌ. أَكْمِلِ الْمَرْحَلَةَ الَّتِي قَبْلَهَا.'); return window.g2levels(id); }
    stopEng();
    window.V = 'game';
    window.CS = 'games';
    cur = { game, lv, t0: Date.now(), mist: 0, ok: 0 };
    h(shell(game, lv, '<div id=g2host class=g2-host></div>'));
    window.Lazy && Lazy.onLeave && Lazy.onLeave(stopEng);
    const host = $('#g2host');
    try { game.run(host, lv, cur); }
    catch (_) { host.innerHTML = '<p class=mut>تعذّر تشغيل اللعبة.</p>'; }
  }
  window.g2play = play;

  function done(win, info) {
    const c = cur;
    if (!c) return;
    stopEng();
    const game = c.game, lv = c.lv, time = (Date.now() - c.t0) / 1000;
    const acc = info && info.acc != null ? info.acc : (c.ok + c.mist ? c.ok / (c.ok + c.mist) : 1);
    const stars = !win ? 0 : info && info.stars != null ? info.stars : acc >= 0.95 ? 3 : acc >= 0.75 ? 2 : 1;
    const { gained } = finishLevel(game, lv, { stars, time, acc });
    try { window.HurufiSound && HurufiSound.play(win ? 'finish' : 'wrong'); } catch (_) {}
    mood(win ? 'proud' : 'oops', 2400);
    const next = win && lv < game.levels;
    const msg = win
      ? (stars === 3 ? 'مُمْتَازٌ! ثَلَاثُ نُجُومٍ!' : stars === 2 ? 'رَائِعٌ! حَصَلْتَ عَلَى نَجْمَتَيْنِ.' : 'أَحْسَنْتَ! أَكْمَلْتَ الْمَرْحَلَةَ.')
      : 'لَا بَأْسَ! حَاوِلْ مَرَّةً أُخْرَى، أَنْتَ تَتَعَلَّمُ.';
    h(shell(game, lv, `<div class="g2-res ${win ? 'win' : 'lose'}"><div class=g2-stars>${[1, 2, 3].map(i => `<span class="${i <= stars ? 'on' : ''}">★</span>`).join('')}</div>
      <h2>${win ? '🎉 ' + msg : '💪 ' + msg}</h2><div class=sum><div>⏱️<br><b>${D(Math.round(time))}</b><small>ثَانِيَةً</small></div><div>🎯<br><b>${D(Math.round(acc * 100))}٪</b><small>دِقَّةٌ</small></div><div>⭐<br><b>+${D(gained)}</b><small>نُجُومٌ جَدِيدَةٌ</small></div></div>
      ${next ? `<button class=big onclick="g2play('${game.id}',${lv + 1})">▶ الْمَرْحَلَةُ التَّالِيَةُ</button>` : ''}<button class=alt onclick="g2play('${game.id}',${lv})">🔁 إِعَادَةُ اللَّعِبِ</button><button class=alt onclick="g2levels('${game.id}')">🗺️ الْمَرَاحِلُ</button></div>`));
    talk(msg);
    if (win && !calm()) setTimeout(() => { try { window.BumiFX && BumiFX.confetti(stars * 25); } catch (_) {} }, 200);
    cur = null;
  }

  const mindRec = ok => {
    try {
      if (cur && cur.game && window.Mind) {
        Mind.record({ ok, subject: cur.game.cat, topic: 'لعبة: ' + cur.game.name, src: 'لعبة', go: `g2levels('${cur.game.id}')` });
      }
    } catch (_) {}
  };
  const good = el => { if (cur) cur.ok++; mindRec(true); try { window.HurufiSound && HurufiSound.play('correct'); } catch (_) {} mood('happy', 900); if (el) try { window.BumiFX && BumiFX.good(el); } catch (_) {} };
  const bad = el => { if (cur) cur.mist++; mindRec(false); try { window.HurufiSound && HurufiSound.play('wrong'); } catch (_) {} mood('oops', 1000); if (el) try { window.BumiFX && BumiFX.bad(el); } catch (_) {} };
  const CHEER = ['أَحْسَنْتَ!', 'رَائِعٌ!', 'مُمْتَازٌ!', 'اِسْتَمِرَّ!', 'بَطَلٌ!'];

  /* ── محرك الصيد ── */
  function runCatch(host, lv, c, cfg) {
    const need = 5 + lv * 2;
    eng = new G2.Catcher(host, {
      theme: cfg.theme || ['sea', 'forest', 'snow', 'night', 'space'][(lv - 1) % 5],
      need,
      speed: 55 + lv * 14 + (+P.age >= 9 ? 10 : 0),
      next: cfg.next,
      decoy: cfg.decoy,
      speak: x => x && x.say && talk(x.say[0], x.say[1]),
      onGood: n => { c.ok++; if (n % 3 === 0) talk(pick(CHEER)); },
      onBad: () => { c.mist++; },
      onWin: () => done(true, { acc: c.ok / (c.ok + c.mist || 1) }),
      onLose: () => done(false, { acc: c.ok / (c.ok + c.mist || 1) })
    });
  }

  /* ── ألعاب DOM ── */
  function rounds(host, n, make) {
    host.innerHTML = '<div class=g2-prog><i style="width:0%"></i></div><div class=g2-pz></div>';
    const pz = host.querySelector('.g2-pz'), bar = host.querySelector('.g2-prog i');
    let i = 0;
    const go = () => {
      bar.style.width = (i / n * 100) + '%';
      if (i >= n) return setTimeout(() => done(true), 400);
      const j = i++;
      try { make(j, go, pz); } catch (_) { go(); }
    };
    go();
  }

  function dragBuild(pz, { prompt, pic, sayIt, target, tiles, dir, onDone }) {
    const L = target.length;
    pz.innerHTML = `<div class=g2-q>${pic ? `<div class=g2-pic>${pic}</div>` : ''}<p>${prompt}</p>${sayIt ? '<button class="alt g2-say">🔊 اسْمَعْ</button>' : ''}</div><div class=g2-slots dir=${dir}>${target.map((_, i) => `<span class=slot data-i=${i}></span>`).join('')}</div><div class=g2-tiles dir=${dir}>${tiles.map((t, i) => `<button class=g2-tile data-i=${i}>${esc(t)}</button>`).join('')}</div>`;
    if (sayIt) { pz.querySelector('.g2-say').onclick = () => talk(sayIt[0], sayIt[1]); talk(sayIt[0], sayIt[1]); }
    const slots = [...pz.querySelectorAll('.slot')], fill = new Array(L).fill(null);
    const place = (btn, si) => {
      if (si == null) si = fill.indexOf(null);
      if (si < 0 || fill[si] != null) return;
      fill[si] = +btn.dataset.i;
      slots[si].appendChild(btn);
      btn.classList.add('in');
      try { gsap && gsap.fromTo(btn, { scale: 0.7 }, { scale: 1, duration: 0.35, ease: 'back.out(2.5)' }); } catch (_) {}
      if (fill.every(x => x != null)) check();
    };
    const unplace = btn => {
      const si = fill.indexOf(+btn.dataset.i);
      if (si < 0) return;
      fill[si] = null;
      pz.querySelector('.g2-tiles').appendChild(btn);
      btn.classList.remove('in');
    };
    const check = () => {
      const got = fill.map(i => tiles[i]);
      const ok = got.every((g, i) => strip(g).toLowerCase() === strip(target[i]).toLowerCase());
      if (ok) {
        slots.forEach(s => s.classList.add('ok'));
        good(pz.querySelector('.g2-slots'));
        talk(sayIt ? sayIt[0] : pick(CHEER), sayIt ? sayIt[1] : 'ar');
        setTimeout(onDone, 1100);
      } else {
        bad(pz.querySelector('.g2-slots'));
        slots.forEach((s, i) => {
          if (strip(tiles[fill[i]]).toLowerCase() !== strip(target[i]).toLowerCase()) {
            const b = s.querySelector('.g2-tile');
            b && setTimeout(() => unplace(b), 450);
          }
        });
      }
    };
    pz.querySelectorAll('.g2-tile').forEach(btn => {
      let sx, sy, drag = false;
      btn.addEventListener('pointerdown', e => { sx = e.clientX; sy = e.clientY; drag = false; try { btn.setPointerCapture(e.pointerId); } catch (_) {} });
      btn.addEventListener('pointermove', e => {
        if (sx == null) return;
        if (!drag && Math.hypot(e.clientX - sx, e.clientY - sy) > 8) { drag = true; btn.classList.add('drag'); }
        if (drag) btn.style.transform = `translate(${e.clientX - sx}px,${e.clientY - sy}px) scale(1.08)`;
      });
      btn.addEventListener('pointerup', e => {
        const was = drag; drag = false; sx = null; btn.classList.remove('drag'); btn.style.transform = '';
        if (was) {
          btn.style.visibility = 'hidden';
          const el = document.elementFromPoint(e.clientX, e.clientY);
          btn.style.visibility = '';
          const s = el && el.closest('.slot');
          if (s && !s.querySelector('.g2-tile')) place(btn, +s.dataset.i);
        } else {
          btn.classList.contains('in') ? unplace(btn) : place(btn);
        }
      });
    });
  }

  function sortGame(host, lv, cfg) {
    const n = 4 + lv, items = shuf(cfg.items()).slice(0, n);
    let k = 0;
    host.innerHTML = `<div class=g2-prog><i style="width:0%"></i></div><div class=g2-pz><p class=g2-hint>${cfg.hint}</p><div class=g2-item></div><div class=g2-baskets>${cfg.bins.map((b, i) => `<button class=g2-bin data-i=${i}><b>${b[0]}</b><small>${b[1] || ''}</small><span class=g2-bc></span></button>`).join('')}</div></div>`;
    const box = host.querySelector('.g2-item');
    const show = () => {
      if (k >= items.length) return setTimeout(() => done(true), 500);
      const it = items[k];
      box.innerHTML = `<div class=g2-card2 draggable=false>${esc(it.t)}</div>`;
      talk(it.say || it.t, 'ar');
      try { gsap && gsap.from(box.firstChild, { y: -40, autoAlpha: 0, duration: 0.4, ease: 'back.out(2)' }); } catch (_) {}
      host.querySelector('.g2-prog i').style.width = (k / items.length * 100) + '%';
    };
    const choose = (bi, btn) => {
      const it = items[k];
      if (!it) return;
      if (bi === it.b) {
        good(btn); btn.querySelector('.g2-bc').textContent += '•'; k++;
        setTimeout(show, 500);
      } else {
        bad(btn);
        talk(cfg.why ? cfg.why(it) : 'لَيْسَ هَذَا. فَكِّرْ مَرَّةً أُخْرَى.');
      }
    };
    host.querySelectorAll('.g2-bin').forEach(b => { b.onclick = () => choose(+b.dataset.i, b); });
    box.addEventListener('pointerdown', e => {
      const c = box.firstChild; if (!c) return;
      const sx = e.clientX, sy = e.clientY;
      try { c.setPointerCapture(e.pointerId); } catch (_) {}
      const mv = ev => { c.style.transform = `translate(${ev.clientX - sx}px,${ev.clientY - sy}px)`; };
      const up = ev => {
        c.removeEventListener('pointermove', mv); c.removeEventListener('pointerup', up);
        c.style.visibility = 'hidden';
        const el = document.elementFromPoint(ev.clientX, ev.clientY);
        c.style.visibility = ''; c.style.transform = '';
        const b = el && el.closest('.g2-bin');
        if (b) choose(+b.dataset.i, b);
      };
      c.addEventListener('pointermove', mv); c.addEventListener('pointerup', up);
    });
    show();
  }

  function chooseGame(host, lv, cfg) {
    const n = cfg.n || (5 + lv);
    let k = 0;
    host.innerHTML = '<div class=g2-prog><i style="width:0%"></i></div><div class=g2-pz></div>';
    const pz = host.querySelector('.g2-pz');
    const show = () => {
      if (k >= n) return setTimeout(() => done(true), 400);
      host.querySelector('.g2-prog i').style.width = (k / n * 100) + '%';
      const gid = cur && cur.game ? cur.game.id : '';
      const q = window.Mind && Mind.fresh ? Mind.fresh(() => cfg.make(lv, k), qx => gid + '|' + (qx.ask || '') + qx.show) : cfg.make(lv, k);
      pz.innerHTML = `<div class=g2-q>${q.show}${q.sp ? '<button class="alt g2-say">🔊 اسْمَعْ</button>' : ''}</div><div class="grid g2-opts ${q.wide ? 'wide' : ''}">${q.opts.map((o, i) => `<button class=opt data-i=${i} dir=auto>${o.h}</button>`).join('')}</div>`;
      if (q.sp) { talk(q.sp[0], q.sp[1]); pz.querySelector('.g2-say').onclick = () => talk(q.sp[0], q.sp[1]); }
      else if (q.ask) talk(q.ask);
      pz.querySelectorAll('.opt').forEach(b => {
        b.onclick = () => {
          const ok = q.opts[+b.dataset.i].ok;
          if (ok) { pz.querySelectorAll('.opt').forEach(x => { x.disabled = true; }); b.classList.add('ok'); good(b); k++; setTimeout(show, 800); }
          else { b.classList.add('no'); b.disabled = true; bad(b); if (q.why) talk(q.why); }
        };
      });
    };
    show();
  }

  function matchGame(host, lv, cfg) {
    const n = Math.min(6, 3 + Math.ceil(lv / 2));
    let round = 0;
    const R2 = 2 + Math.ceil(lv / 2);
    host.innerHTML = '<div class=g2-prog><i style="width:0%"></i></div><div class=g2-pz></div>';
    const pz = host.querySelector('.g2-pz');
    const show = () => {
      if (round >= R2) return setTimeout(() => done(true), 400);
      host.querySelector('.g2-prog i').style.width = (round / R2 * 100) + '%';
      const P0 = cfg.pairs(n);
      let sel = null, left = P0.length;
      pz.innerHTML = `<p class=g2-hint>${cfg.hint}</p><div class=g2-match><div class=col>${shuf(P0).map(p => `<button class=g2-m data-k="${esc(p.k)}" data-s=a>${p.a}</button>`).join('')}</div><div class=col>${shuf(P0).map(p => `<button class=g2-m data-k="${esc(p.k)}" data-s=b dir=auto>${p.b}</button>`).join('')}</div></div>`;
      pz.querySelectorAll('.g2-m').forEach(b => {
        b.onclick = () => {
          if (b.classList.contains('ok')) return;
          const p = P0.find(x => x.k === b.dataset.k);
          if (b.dataset.s === 'b' && p && p.say) talk(p.say[0], p.say[1]);
          if (!sel || sel.dataset.s === b.dataset.s) {
            sel && sel.classList.remove('sel'); sel = b; b.classList.add('sel'); return;
          }
          if (sel.dataset.k === b.dataset.k) {
            [sel, b].forEach(x => { x.classList.remove('sel'); x.classList.add('ok'); x.disabled = true; });
            good(b); sel = null;
            if (--left === 0) { round++; setTimeout(show, 700); }
          } else { bad(b); sel.classList.remove('sel'); sel = null; }
        };
      });
    };
    show();
  }

  function memoryGame(host, lv, cfg) {
    const n = Math.min(8, 2 + lv), P0 = cfg.pairs(n);
    const cards = shuf([...P0.map(p => ({ k: p.k, f: p.a, say: p.say })), ...P0.map(p => ({ k: p.k, f: p.b, say: p.say }))]);
    let open = [], left = P0.length, lock = false;
    host.innerHTML = `<p class=g2-hint>اِقْلِبْ بِطَاقَتَيْنِ مُتَطَابِقَتَيْنِ</p><div class="g2-mem n${cards.length}">${cards.map((c, i) => `<button class=g2-cardm data-i=${i}><span class=bk>🦉</span><span class=fr dir=auto>${c.f}</span></button>`).join('')}</div>`;
    host.querySelectorAll('.g2-cardm').forEach(b => {
      b.onclick = () => {
        if (lock || b.classList.contains('up')) return;
        const c = cards[+b.dataset.i];
        b.classList.add('up'); open.push([b, c]);
        if (c.say) talk(c.say[0], c.say[1]);
        if (open.length === 2) {
          lock = true;
          const [[b1, c1], [b2, c2]] = open; open = [];
          if (c1.k === c2.k) {
            setTimeout(() => { b1.classList.add('ok'); b2.classList.add('ok'); good(b2); lock = false; if (--left === 0) setTimeout(() => done(true), 700); }, 400);
          } else {
            setTimeout(() => { b1.classList.remove('up'); b2.classList.remove('up'); if (cur) cur.mist++; lock = false; }, 900);
          }
        }
      };
    });
  }

  /* ── مولّدات المحتوى اللغوي ── */
  const arLetterRound = () => { const pool = AR_L.slice(0, Math.min(28, 8 + stage() * 6)), ch = pick(pool); return { label: `🔊 ${ch}`, answer: ch, say: [AR_NAMES[ch], 'ar'] }; };
  const arLetterDecoy = c => pick(AR_L.filter(x => x !== c.answer));
  const enLetterRound = () => { const ch = pick(EN_L); return { label: `🔊 ${ch}`, answer: ch, say: [ch, 'en'] }; };
  const enDecoy = c => pick(EN_L.filter(x => x !== c.answer));
  const phonRound = () => { const W = words('en', 6), it = pick(W); return { label: `${it.pic} ⟵ ?`, answer: it.w[0].toUpperCase(), say: [it.w, 'en'] }; };
  const picPairs = l => n => shuf(words(l, 7)).filter((x, i, a) => a.findIndex(y => y.pic === x.pic) === i).slice(0, n).map(x => ({ k: x.w, a: x.pic, b: x.w, say: [x.w, l] }));
  const letterPicPairs = n => {
    const W = shuf(words('ar', 6)), out = [], used = new Set();
    for (const x of W) {
      const f = firstAr(x.w);
      if (!f || used.has(f)) continue;
      used.add(f); out.push({ k: f, a: x.pic, b: f, say: [x.w, 'ar'] });
      if (out.length >= n) break;
    }
    return out;
  };

  /* ── قائمة الألعاب (عربية + إنجليزية + ذكاء لغوي فقط) ── */
  const GAMES = [
    /* العربية */
    { id: 'catch-ar', cat: 'ar', icon: '🫧', name: 'صيد الحروف العربية', desc: 'استمع إلى الحرف ثم اصطد فقاعته بشبكة بومي.', levels: 6, diff: 'سهل', cover: { k: 'catch', th: 'sea', t: 'ب' }, run: (h, lv, c) => runCatch(h, lv, c, { next: arLetterRound, decoy: arLetterDecoy }), intro: 'اسْتَمِعْ إِلَى الْحَرْفِ، ثُمَّ حَرِّكْ بُومِي لِيَصْطَادَ فُقَّاعَتَهُ.' },
    { id: 'ar-pic-letter', cat: 'ar', icon: '🖼️', name: 'الحرف والصورة', desc: 'طابق كل صورة بالحرف الذي تبدأ به.', levels: 5, diff: 'سهل', cover: { k: 'emoji', e: '🐱 ق' }, run: (h, lv) => matchGame(h, lv, { hint: 'طَابِقْ كُلَّ صُورَةٍ بِالْحَرْفِ الَّذِي تَبْدَأُ بِهِ', pairs: letterPicPairs }), intro: 'طَابِقْ كُلَّ صُورَةٍ بِالْحَرْفِ الْأَوَّلِ مِنِ اسْمِهَا.' },
    { id: 'harakat', cat: 'ar', icon: 'ـَ', name: 'الحركات الثلاث', desc: 'ضع كل مقطع في سلة حركته: فتحة، ضمة، كسرة.', levels: 5, diff: 'سهل', cover: { k: 'emoji', e: 'بَ بُ بِ' }, run: (h, lv) => sortGame(h, lv, { hint: 'اِسْحَبِ الْمَقْطَعَ إِلَى سَلَّةِ حَرَكَتِهِ (أَوِ اضْغَطِ السَّلَّةَ)', bins: [['فَتْحَةٌ', 'ـَ'], ['ضَمَّةٌ', 'ـُ'], ['كَسْرَةٌ', 'ـِ']], items: () => AR_L.slice(1, 8 + stage() * 5).flatMap(l => [[l + 'َ', 0], [l + 'ُ', 1], [l + 'ِ', 2]].map(([t, b]) => ({ t, b }))), why: it => `اِسْتَمِعْ: ${it.t}` }), intro: 'اسْتَمِعْ إِلَى الْمَقْطَعِ، وَضَعْهُ فِي سَلَّةِ حَرَكَتِهِ.' },
    { id: 'ar-build', cat: 'ar', icon: '🧩', name: 'تكوين الكلمات', desc: 'اسحب الحروف إلى أماكنها لتكوّن الكلمة.', levels: 6, diff: 'متوسط', cover: { k: 'emoji', e: 'ب ـ ي ـ ت' }, run: (h, lv) => rounds(h, 4 + Math.ceil(lv / 2), (i, nx, pz) => { const W = words('ar', 2 + lv), it = pick(W), t = grs(it.w), extra = shuf(AR_L.filter(x => !t.map(strip).includes(x))).slice(0, lv > 2 ? Math.min(3, lv - 2) : 0); dragBuild(pz, { prompt: 'رَكِّبِ الْكَلِمَةَ', pic: it.pic, sayIt: [it.w, 'ar'], target: t, tiles: shuf([...t, ...extra]), dir: 'rtl', onDone: nx }); }), intro: 'اِسْحَبِ الْحُرُوفَ إِلَى أَمَاكِنِهَا لِتُكَوِّنَ الْكَلِمَةَ.' },
    { id: 'taa', cat: 'ar', icon: 'ة', name: 'التاء والهاء', desc: 'تاء مربوطة أم تاء مفتوحة أم هاء؟', levels: 5, diff: 'متوسط', cover: { k: 'emoji', e: 'ة ت ه' }, run: (h, lv) => sortGame(h, lv, { hint: 'أَيْنَ تَضَعُ الْكَلِمَةَ؟', bins: [['ة مَرْبُوطَةٌ', 'شَجَرَةٌ'], ['ت مَفْتُوحَةٌ', 'بَيْتٌ'], ['ه هَاءٌ', 'وَجْهٌ']], items: () => [['شَجَرَةٌ', 0], ['مَدْرَسَةٌ', 0], ['حَقِيبَةٌ', 0], ['سَاعَةٌ', 0], ['فَرَاشَةٌ', 0], ['قِطَّةٌ', 0], ['فَاكِهَةٌ', 0], ['بِنْتٌ', 1], ['بَيْتٌ', 1], ['صَوْتٌ', 1], ['زَيْتٌ', 1], ['تُوتٌ', 1], ['وَقْتٌ', 1], ['وَجْهٌ', 2], ['مِيَاهٌ', 2], ['اِنْتَبِهْ', 2], ['شِفَاهٌ', 2]].map(([t, b]) => ({ t, b })) }), intro: 'هَلْ تَنْتَهِي الْكَلِمَةُ بِتَاءٍ مَرْبُوطَةٍ، أَمْ تَاءٍ مَفْتُوحَةٍ، أَمْ هَاءٍ؟' },
    { id: 'lam', cat: 'ar', icon: '☀️', name: 'الشمسية والقمرية', desc: 'هل تُنطق اللام أم لا؟', levels: 5, diff: 'متوسط', cover: { k: 'emoji', e: '☀️ 🌙' }, run: (h, lv) => sortGame(h, lv, { hint: 'اِسْتَمِعْ: هَلْ نَنْطِقُ اللَّامَ؟', bins: [['☀️ شَمْسِيَّةٌ', 'لَا تُنْطَقُ'], ['🌙 قَمَرِيَّةٌ', 'تُنْطَقُ']], items: () => ['الشَّمْسُ', 'النَّجْمُ', 'الدَّرْسُ', 'الرَّجُلُ', 'السَّمَكُ', 'الطَّائِرُ', 'الزَّيْتُ', 'الثَّوْبُ', 'الصَّقْرُ', 'النَّهْرُ'].map(t => ({ t, b: 0 })).concat(['الْقَمَرُ', 'الْبَابُ', 'الْكِتَابُ', 'الْوَلَدُ', 'الْفِيلُ', 'الْجَمَلُ', 'الْحَدِيقَةُ', 'الْعُصْفُورُ', 'الْمَاءُ', 'الْغَيْمَةُ'].map(t => ({ t, b: 1 }))) }), intro: 'اِسْتَمِعْ إِلَى الْكَلِمَةِ: إِذَا لَمْ نَنْطِقِ اللَّامَ فَهِيَ شَمْسِيَّةٌ، وَإِذَا نَطَقْنَاهَا فَهِيَ قَمَرِيَّةٌ.' },
    { id: 'hamza', cat: 'ar', icon: 'أ', name: 'لعبة الهمزة', desc: 'همزة قطع أم همزة وصل؟', levels: 5, diff: 'صعب', cover: { k: 'emoji', e: 'أ ا' }, run: (h, lv) => sortGame(h, lv, { hint: 'هَمْزَةُ قَطْعٍ أَمْ وَصْلٍ؟', bins: [['هَمْزَةُ قَطْعٍ', 'أَ إِ'], ['هَمْزَةُ وَصْلٍ', 'ا']], items: () => ['أَسَدٌ', 'أُمٌّ', 'إِبْرَةٌ', 'أَكَلَ', 'أَرْنَبٌ', 'إِصْبَعٌ', 'أَمِيرٌ', 'أَخٌ'].map(t => ({ t, b: 0 })).concat(['اِسْمٌ', 'اِبْنٌ', 'اِجْلِسْ', 'اُكْتُبْ', 'اِفْتَحْ', 'اِسْتَمِعْ', 'اِنْطَلَقَ', 'اِبْنَةٌ'].map(t => ({ t, b: 1 }))) }), intro: 'هَمْزَةُ الْقَطْعِ نَكْتُبُهَا وَنَنْطِقُهَا دَائِمًا، وَهَمْزَةُ الْوَصْلِ لَا نَنْطِقُهَا فِي وَسَطِ الْكَلَامِ.' },
    { id: 'ar-sentence', cat: 'ar', icon: '📝', name: 'ترتيب الجمل', desc: 'رتّب الكلمات لتكوّن جملة صحيحة.', levels: 5, diff: 'متوسط', cover: { k: 'emoji', e: '📝' }, run: (h, lv) => rounds(h, 3 + lv, (i, nx, pz) => { const L = sentences(), it = pick(L), t = it.s.split(/\s+/); dragBuild(pz, { prompt: 'رَتِّبِ الْكَلِمَاتِ لِتُكَوِّنَ جُمْلَةً', pic: it.pic, sayIt: [it.s, 'ar'], target: t, tiles: shuf(t), dir: 'rtl', onDone: nx }); }), intro: 'اسْتَمِعْ إِلَى الْجُمْلَةِ، ثُمَّ رَتِّبْ كَلِمَاتِهَا.' },
    { id: 'ar-listen', cat: 'ar', icon: '👂', name: 'اسمع واختر الحرف', desc: 'استمع إلى اسم الحرف واختره.', levels: 5, diff: 'سهل', cover: { k: 'emoji', e: '👂 ح' }, run: (h, lv) => chooseGame(h, lv, { make: () => { const pool = AR_L.slice(0, Math.min(28, 10 + stage() * 5)), ch = pick(pool), sim = { ب: 'تث', ت: 'بث', ث: 'بت', ج: 'حخ', ح: 'جخ', خ: 'جح', د: 'ذ', ذ: 'د', ر: 'ز', ز: 'ر', س: 'شص', ش: 'س', ص: 'ض', ض: 'ص', ط: 'ظ', ظ: 'ط', ع: 'غ', غ: 'ع', ف: 'ق', ق: 'فك' }[ch] || '', wr = shuf([...sim.split(''), ...shuf(AR_L.filter(x => x !== ch))]).filter((x, i, a) => x !== ch && a.indexOf(x) === i).slice(0, 3), o = shuf([ch, ...wr]); return { show: '<div class=q>🔊</div>', sp: [AR_NAMES[ch], 'ar'], opts: o.map(x => ({ h: x, ok: x === ch })), why: 'اسْتَمِعْ جَيِّدًا: ' + AR_NAMES[ch] }; } }), intro: 'اسْتَمِعْ إِلَى اسْمِ الْحَرْفِ، ثُمَّ اخْتَرْهُ.' },

    /* الإنجليزية */
    { id: 'catch-en', cat: 'en', icon: '🎈', name: 'English Letter Hunt', desc: 'Listen to the letter and catch it.', levels: 6, diff: 'سهل', cover: { k: 'catch', th: 'forest', t: 'B' }, run: (h, lv, c) => runCatch(h, lv, c, { next: enLetterRound, decoy: enDecoy, theme: 'forest' }), intro: 'اسْتَمِعْ إِلَى الْحَرْفِ الْإِنْجِلِيزِيِّ، وَاصْطَدْ فُقَّاعَتَهُ.' },
    { id: 'phonics', cat: 'en', icon: '🔉', name: 'Phonics', desc: 'اسمع الكلمة واصطد الحرف الذي تبدأ به.', levels: 6, diff: 'متوسط', cover: { k: 'catch', th: 'snow', t: 'F' }, run: (h, lv, c) => runCatch(h, lv, c, { next: phonRound, decoy: enDecoy, theme: 'snow' }), intro: 'اسْتَمِعْ إِلَى الْكَلِمَةِ الْإِنْجِلِيزِيَّةِ، وَاصْطَدِ الْحَرْفَ الَّذِي تَبْدَأُ بِهِ.' },
    { id: 'en-match', cat: 'en', icon: '🖼️', name: 'Picture & Word', desc: 'طابق الصور بالكلمات الإنجليزية.', levels: 5, diff: 'سهل', cover: { k: 'emoji', e: '🍎 Apple' }, run: (h, lv) => matchGame(h, lv, { hint: 'Match the picture with the word', pairs: picPairs('en') }), intro: 'طَابِقْ كُلَّ صُورَةٍ بِكَلِمَتِهَا الْإِنْجِلِيزِيَّةِ.' },
    { id: 'en-build', cat: 'en', icon: '🧱', name: 'Word Builder', desc: 'Build the word from its letters.', levels: 6, diff: 'متوسط', cover: { k: 'emoji', e: 'C A T' }, run: (h, lv) => rounds(h, 4 + Math.ceil(lv / 2), (i, nx, pz) => { const it = pick(words('en', 2 + lv)), t = it.w.toLowerCase().split(''), ex = shuf('abcdefghijklmnopqrstuvwxyz'.split('').filter(x => !t.includes(x))).slice(0, lv > 2 ? 2 : 0); dragBuild(pz, { prompt: 'Build the word', pic: it.pic, sayIt: [it.w, 'en'], target: t, tiles: shuf([...t, ...ex]), dir: 'ltr', onDone: nx }); }), intro: 'اِسْحَبِ الْحُرُوفَ لِتَبْنِيَ الْكَلِمَةَ الْإِنْجِلِيزِيَّةَ.' },
    { id: 'en-order', cat: 'en', icon: '🔀', name: 'ترتيب الحروف', desc: 'Unscramble: رتّب الحروف المبعثرة (بلا صورة).', levels: 5, diff: 'صعب', cover: { k: 'emoji', e: 'T A C' }, run: (h, lv) => rounds(h, 4 + lv, (i, nx, pz) => { const it = pick(words('en', 3 + lv)), t = it.w.toLowerCase().split(''); dragBuild(pz, { prompt: 'رَتِّبِ الْحُرُوفَ — Listen and spell', pic: '', sayIt: [it.w, 'en'], target: t, tiles: shuf(t), dir: 'ltr', onDone: nx }); }), intro: 'اسْتَمِعْ إِلَى الْكَلِمَةِ، وَرَتِّبْ حُرُوفَهَا.' },
    { id: 'en-missing', cat: 'en', icon: '🔡', name: 'Missing Letter', desc: 'Complete the word.', levels: 5, diff: 'متوسط', cover: { k: 'emoji', e: 'C _ T' }, run: (h, lv) => chooseGame(h, lv, { make: () => { const it = pick(words('en', 3 + lv).filter(x => x.w.length >= 3)), w = it.w.toLowerCase(), i = Math.floor(Math.random() * w.length), r = w[i], wr = shuf('aeioubcdmnst'.split('').filter(x => x !== r)).slice(0, 3); return { show: `<div class=g2-pic>${it.pic}</div><div class=spell dir=ltr>${w.split('').map((x, j) => j === i ? '<i class=gap>?</i>' : `<span>${x}</span>`).join('')}</div>`, sp: [it.w, 'en'], opts: shuf([r, ...wr]).map(x => ({ h: x, ok: x === r })), why: 'The word is ' + it.w }; } }), intro: 'أَكْمِلِ الْكَلِمَةَ الْإِنْجِلِيزِيَّةَ بِالْحَرْفِ النَّاقِصِ.' },
    { id: 'en-listen', cat: 'en', icon: '🎧', name: 'Listen & Choose', desc: 'Listen and choose the right word.', levels: 5, diff: 'سهل', cover: { k: 'emoji', e: '🎧' }, run: (h, lv) => chooseGame(h, lv, { make: () => { const W = words('en', 3 + lv), it = pick(W), o = shuf([it, ...shuf(W.filter(x => x.w !== it.w)).slice(0, 3)]); return { show: '<div class=q>🔊</div>', sp: [it.w, 'en'], opts: o.map(x => ({ h: lv <= 2 ? `${x.pic} ${x.w}` : x.w, ok: x === it })), why: 'Listen: ' + it.w }; } }), intro: 'اسْتَمِعْ إِلَى الْكَلِمَةِ الْإِنْجِلِيزِيَّةِ، ثُمَّ اخْتَرْهَا.' },

    /* الذكاء والألغاز اللغوية */
    { id: 'missing-ar', cat: 'iq', icon: '❓', name: 'الحرف الناقص', desc: 'اكتشف الحرف الناقص في الكلمة.', levels: 5, diff: 'متوسط', cover: { k: 'emoji', e: 'ك ـ ؟ ـ ب' }, run: (h, lv) => chooseGame(h, lv, { make: () => { const W = words('ar', 3 + lv).filter(x => grs(x.w).length >= 3), it = pick(W), g = grs(it.w), i = 1 + Math.floor(Math.random() * (g.length - 1)), r = g[i], wr = shuf(AR_L.filter(x => x !== strip(r))).slice(0, 3).map(x => x + (r.match(/[ً-ْ]/g) || []).join('')); return { show: `<div class=g2-pic>${it.pic}</div><div class=spell dir=rtl>${g.map((x, j) => j === i ? '<i class=gap>؟</i>' : `<span>${x}</span>`).join('')}</div>`, sp: [it.w, 'ar'], opts: shuf([r, ...wr]).map(x => ({ h: x, ok: x === r })), why: 'الْكَلِمَةُ هِيَ: ' + it.w }; } }), intro: 'انْظُرْ إِلَى الصُّورَةِ، وَاسْتَمِعْ إِلَى الْكَلِمَةِ، ثُمَّ اخْتَرِ الْحَرْفَ النَّاقِصَ.' },
    { id: 'memory', cat: 'iq', icon: '🃏', name: 'ذاكرة البطاقات', desc: 'اقلب بطاقتين متطابقتين: صورة وكلمتها.', levels: 6, diff: 'سهل', cover: { k: 'emoji', e: '🃏🃏' }, run: (h, lv) => memoryGame(h, lv, { pairs: picPairs(P.lang === 'en' ? 'en' : 'ar') }), intro: 'اقْلِبْ بِطَاقَتَيْنِ: الصُّورَةَ وَكَلِمَتَهَا. تَذَكَّرْ أَمَاكِنَهَا.' },
    { id: 'match-ar', cat: 'iq', icon: '🔗', name: 'مطابقة الصور بالكلمات', desc: 'طابق كل صورة بكلمتها العربية.', levels: 5, diff: 'سهل', cover: { k: 'emoji', e: '🐘 فيل' }, run: (h, lv) => matchGame(h, lv, { hint: 'طَابِقْ كُلَّ صُورَةٍ بِكَلِمَتِهَا', pairs: picPairs('ar') }), intro: 'طَابِقْ كُلَّ صُورَةٍ بِكَلِمَتِهَا.' },
    { id: 'pattern', cat: 'iq', icon: '🔷', name: 'ما الشكل التالي؟', desc: 'اكتشف النمط وأكمله.', levels: 5, diff: 'متوسط', cover: { k: 'emoji', e: '🔺🔵🔺❓' }, run: (h, lv) => chooseGame(h, lv, { make: () => { const E = shuf(['🔺', '🔵', '⭐', '🟩', '💜', '🍎']).slice(0, lv >= 3 ? 3 : 2), len = lv >= 4 ? 3 : 2, unit = E.slice(0, len), seq = []; for (let i = 0; i < 6; i++) seq.push(unit[i % len]); const r = unit[6 % len], o = shuf([r, ...E.filter(x => x !== r)]).slice(0, 3); if (!o.includes(r)) o[0] = r; return { show: `<div class=q>${seq.join(' ')} ❓</div>`, ask: 'مَا الشَّكْلُ التَّالِي؟', opts: shuf(o).map(x => ({ h: x, ok: x === r })), why: 'انْظُرْ إِلَى التَّكْرَارِ: ' + unit.join(' ') }; } }), intro: 'انْظُرْ إِلَى النَّمَطِ الْمُتَكَرِّرِ، وَاخْتَرِ الشَّكْلَ التَّالِيَ.' }
  ];

  window.G2GAMES = GAMES;
  window.G2eng = () => eng;

  /* ── الأغلفة ── */
  const coverCache = {}, noOwl = new Set();
  function cover(game) {
    if (coverCache[game.id]) return coverCache[game.id];
    const c = document.createElement('canvas'), W = 320, H = 180;
    c.width = W; c.height = H;
    const g = c.getContext('2d');
    g.scale(W / 480, H / 270);
    const th = G2.THEMES[game.cover.th] || G2.THEMES[{ ar: 'desert', en: 'forest', iq: 'space' }[game.cat]] || G2.THEMES.forest;
    G2.background(g, 480, 270, (game.id.length * 37) % 300, th, 1.3);
    g.fillStyle = th.ground[0]; g.fillRect(0, 236, 480, 40);
    if (game.cover.k === 'catch') {
      [[120, 70], [220, 120], [340, 60]].forEach(([x, y], i) => G2.Art.bubble(g, x, y, 26, i === 1 ? game.cover.t : ['?', '★', '✿'][i], ['#cfe3ff', '#ffe9b0', '#ffd6e7'][i], 1));
    } else {
      g.font = '900 64px "Baloo Bhaijaan 2",Tahoma,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillStyle = 'rgba(255,255,255,.85)'; G2.rr(g, 140, 40, 200, 120, 26); g.fill();
      g.fillStyle = '#1c2c86'; g.fillText(game.cover.e, 240, 104);
    }
    const owl = G2.Owl.get('happy');
    if (owl) g.drawImage(owl, 30, 120, 100, 108);
    else noOwl.add(game.id);
    try { return coverCache[game.id] = c.toDataURL('image/webp', 0.82); } catch (_) { return ''; }
  }

  /* ── الاقتراحات حسب مستوى الطالب ── */
  function suggest() {
    const sc = {};
    const add = (id, v) => { sc[id] = (sc[id] || 0) + v; };
    const wl = Object.values((window.P && P.wl) || {}).reduce((a, b) => a + b, 0);
    if (wl > 3) { add('catch-ar', 3); add('ar-listen', 2); add('ar-pic-letter', 2); }
    const st = (window.P && P.stat) || {}, acc = k => { const a = st[k]; return a && a[0] > 4 ? a[1] / a[0] : 1; };
    if (acc('r') < 0.75) { add('ar-build', 2); add('missing-ar', 2); }
    const enL = window.EnCoach ? EnCoach.level() : 1;
    if (!window.P || P.lang !== 'ar') {
      if (enL <= 2) { add('phonics', 2); add('catch-en', 2); add('en-match', 1); }
      else add('en-build', 2);
    }
    if (stage() >= 2) { add('lam', 1.5); add('taa', 1.5); }
    if (stage() >= 3) add('hamza', 1.5);
    for (const gm of GAMES) {
      const r = ((window.P && P.g2) || {})[gm.id];
      if (!r || !r.n) add(gm.id, 0.8);
      else if (Date.now() - (r.last || 0) < 36e5) add(gm.id, -2);
    }
    return GAMES.filter(gm => sc[gm.id] > 0).sort((a, b) => sc[b.id] - sc[a.id]).slice(0, 4);
  }

  const CATS = [
    ['ar', '🔤 أَلْعَابُ اللُّغَةِ الْعَرَبِيَّةِ'],
    ['en', '🔠 أَلْعَابُ اللُّغَةِ الْإِنْجِلِيزِيَّةِ'],
    ['iq', '🧩 أَلْعَابُ الذَّكَاءِ وَالْأَلْغَازِ']
  ];
  const CV0 = 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==';
  let cvQ = 0, cvLoaded = null;
  const CVC = 'hurufi-g2cov-v3', cvU = id => './g2cov/' + id + '.webp';

  const cvLoad = () => cvLoaded || (cvLoaded = (async () => {
    try {
      const c = await caches.open(CVC);
      for (const g of GAMES) {
        if (coverCache[g.id]) continue;
        const r = await c.match(cvU(g.id));
        if (r) coverCache[g.id] = URL.createObjectURL(await r.blob());
      }
    } catch (_) {}
  })());
  const cvSave = (id, u) => {
    try {
      if (u && u.startsWith('data:')) {
        fetch(u).then(r => r.blob()).then(b => caches.open(CVC).then(c => c.put(cvU(id), new Response(b, { headers: { 'content-type': b.type } })))).catch(() => {});
      }
    } catch (_) {}
  };
  const queueCovers = () => {
    if (cvQ) return;
    cvQ = -1;
    cvLoad().then(() => {
      cvQ = 0;
      document.querySelectorAll('img.g2-cv[data-cv]').forEach(im => {
        const u = coverCache[im.dataset.cv];
        if (u && im.src !== u) im.src = u;
      });
      cvQ = requestAnimationFrame(function step() {
        cvQ = 0;
        const L = [...document.querySelectorAll('img.g2-cv[data-cv]')].filter(im => !coverCache[im.dataset.cv] || im.src !== coverCache[im.dataset.cv]);
        if (!L.length) return;
        const t = performance.now();
        for (const im of L) {
          const gm = GAMES.find(x => x.id === im.dataset.cv);
          if (gm) {
            const fresh = !coverCache[gm.id], u = cover(gm);
            if (fresh && !noOwl.has(gm.id)) cvSave(gm.id, u);
            im.src = u || CV0;
            if (!u) im.removeAttribute('data-cv');
          } else im.removeAttribute('data-cv');
          if (performance.now() - t > 12) break;
        }
        cvQ = requestAnimationFrame(step);
      });
    });
  };

  const card = g => {
    const r = ((window.P && P.g2) || {})[g.id] || { s: {}, u: 1 };
    const st = Object.values(r.s).reduce((a, b) => a + b, 0), comp = Object.keys(r.s).length >= g.levels;
    return `<button class="g2-gc ${comp ? 'done' : ''}" onclick="g2levels('${g.id}')"><img alt="" class=g2-cv data-cv="${g.id}" src="${coverCache[g.id] || CV0}">${coverCache[g.id] ? '' : (queueCovers(), '')}<span class=g2-gi>${g.icon}</span><b>${esc(g.name)}</b><small>${esc(g.desc)}</small><span class=g2-meta><i>${g.diff}</i><i>${D(g.levels)} مراحل</i><i>⭐ ${D(st)}/${D(g.levels * 3)}</i></span>${comp ? '<span class=g2-badge>✓ مكتملة</span>' : ''}</button>`;
  };

  window.games2d = function () {
    stopEng();
    window.V = 'sec';
    window.CS = 'games';
    const had = !!G2.Owl.get('happy');
    paintHub();
    if (!had) {
      G2.Owl.load().then(() => {
        for (const k of noOwl) delete coverCache[k];
        noOwl.clear();
        if (document.getElementById('g2hub')) queueCovers();
      });
    }
  };

  function paintHub() {
    const sg = suggest();
    const doneL = GAMES.filter(g => Object.keys(((P.g2 || {})[g.id] || { s: {} }).s).length >= g.levels);
    const tot = GAMES.reduce((a, g) => a + totalStars(g.id), 0);
    const played = GAMES.filter(g => ((P.g2 || {})[g.id] || {}).n).length;
    h(`<section class="sec g2-hubp" id=g2hub><button class=link onclick="goBack()">← رُجُوعٌ</button><div class=g2-hero><div><h2>🎮 عَالَمُ أَلْعَابِ بُومِي</h2><p>تَعَلَّمْ وَأَنْتَ تَلْعَبُ: حُرُوفٌ، كَلِمَاتٌ، إِمْلَاءٌ، وَأَلْغَازٌ.</p></div><div class=g2-tot><b>⭐ ${D(tot)}</b><small>نجوم الألعاب</small><b>🎮 ${D(played)}</b><small>لعبة جرّبتها</small></div></div>
      ${sg.length ? `<h3>✨ مُقْتَرَحَةٌ لَكَ يَا ${esc(P.name)}</h3><div class=g2-grid>${sg.map(card).join('')}</div>` : ''}
      ${CATS.map(([k, t]) => `<h3>${t}</h3><div class=g2-grid>${GAMES.filter(g => g.cat === k).map(card).join('')}</div>`).join('')}
      ${doneL.length ? `<h3>🏆 الْأَلْعَابُ الْمُكْتَمِلَةُ</h3><div class=g2-grid>${doneL.map(card).join('')}</div>` : ''}
      <h3>🎲 أَلْعَابٌ سَرِيعَةٌ أُخْرَى</h3><div class=list>${['gMem', 'gBuild', 'gPat', 'gOrd'].filter(f => typeof window[f] === 'function').map((f, i) => `<button class=row onclick="${f}()"><span>${['🃏', '🔤', '🔷', '📝'][i]}</span><b>${['الذَّاكِرَةُ الْكِلَاسِيكِيَّةُ', 'تَرْكِيبُ كَلِمَاتٍ سَرِيعٌ', 'الْأَنْمَاطُ الْبَصَرِيَّةُ', 'تَرْتِيبُ جُمَلٍ إِنْجِلِيزِيَّةٍ'][i]}</b></button>`).join('')}${typeof window.puzzles === 'function' ? '<button class=row onclick="puzzles()"><span>🧩</span><b>جَزِيرَةُ الْأَلْغَازِ</b></button>' : ''}</div></section>`);
  }

  window.g2levels = function (id) {
    stopEng();
    const game = GAMES.find(g => g.id === id);
    if (!game) return games2d();
    startUnlock(game);
    const r = rec(id);
    window.V = 'sec';
    window.CS = 'games';
    cur = { game, lv: 0 };
    h(`<section class=sec><button class=link onclick="games2d()">← الْأَلْعَابُ</button><div class=g2-lvh><img alt="" src="${cover(game)}"><div><h2>${game.icon} ${esc(game.name)}</h2><p>${esc(game.desc)}</p><span class=g2-meta><i>${game.diff}</i><i>${D(game.levels)} مراحل</i></span></div></div>
      <div class=g2-lvls>${Array.from({ length: game.levels }, (_, i) => {
        const lv = i + 1, s = r.s[lv] || 0, open = lv <= r.u, b = r.b[lv];
        return `<button class="g2-lv ${open ? '' : 'lock'} ${s ? 'got' : ''}" ${open ? `onclick="g2play('${id}',${lv})"` : 'disabled aria-disabled=true'}><b>${open ? D(lv) : '🔒'}</b><span>${[1, 2, 3].map(k => k <= s ? '★' : '☆').join('')}</span>${b && b.t ? `<small>⏱️ ${D(b.t)}ث</small>` : ''}</button>`;
      }).join('')}</div>
      <button class=big onclick="g2play('${id}')">▶ الْعَبِ الْمَرْحَلَةَ ${D(Math.min(r.u, game.levels))}</button></section>`);
    cur = null;
  };

  /* ── سياق بومي للألعاب ── */
  const oCtx = window.BumiContext;
  window.BumiContext = function () {
    try {
      if (window.V === 'game' && cur && cur.game) return [cur.game.intro, 'game:' + cur.game.id];
      if (document.getElementById('g2hub')) return ['هَذَا عَالَمُ الْأَلْعَابِ التَّعْلِيمِيَّةِ. اخْتَرْ لُعْبَةً تُحِبُّهَا.', 'g2hub'];
      if (document.querySelector('.g2-lvls')) return ['اخْتَرِ الْمَرْحَلَةَ. كُلَّمَا أَكْمَلْتَ مَرْحَلَةً تُفْتَحُ الَّتِي بَعْدَهَا.', 'g2lv'];
    } catch (_) {}
    return oCtx ? oCtx() : null;
  };

  const summary = () => {
    const L = GAMES.map(g => ({ g, r: (window.P && P.g2 || {})[g.id] })).filter(x => x.r && x.r.n);
    if (!L.length) return '';
    const tot = L.reduce((a, x) => a + totalStars(x.g.id), 0);
    return `<div class=pdash><h3>🎮 الْأَلْعَابُ التَّعْلِيمِيَّةُ</h3><p>جَرَّبَ ${D(L.length)} لُعْبَةً · ⭐ ${D(tot)} نَجْمَةً مِنَ الْأَلْعَابِ</p><div class=list>${L.sort((a, b) => (b.r.last || 0) - (a.r.last || 0)).slice(0, 6).map(x => `<div class=row><span>${x.g.icon}</span><b>${esc(x.g.name)}</b><small>الْمَرْحَلَةُ ${D(Math.max(...Object.keys(x.r.s).map(Number), 0))}/${D(x.g.levels)} · ⭐ ${D(totalStars(x.g.id))}</small></div>`).join('')}</div></div>`;
  };
  window.G2summary = summary;

  window.G2API = { done: (w, i) => done(w, i), setEng: e => { eng = e; }, cur: () => cur, talk, mood, words, AR_NAMES, AR_L, EN_L, D, shuf, pick, R, strip, stage, isPic };

  if (typeof window.h === 'function') {
    const oh = window.h;
    window.h = function (x) {
      if (eng && !(typeof x === 'string' && x.includes('g2host'))) stopEng();
      document.querySelectorAll('.g2-ov').forEach(o => o.remove());
      return oh.apply(this, arguments);
    };
  }
})();
setTimeout(() => { try { window.G2 && G2.Owl.load(); } catch (_) {} }, 1500);
