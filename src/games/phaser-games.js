/* /src/games/phaser-games.js — ألعاب Phaser التفاعلية للعربية والإنجليزية (بدون رياضيات، مع شاشة تحميل هيكلية) */
(() => {
  'use strict';
  const A = window.G2API, GAMES = window.G2GAMES;
  if (!A || !GAMES || !window.G2) return;

  const { done, setEng, talk, mood, words, AR_NAMES, AR_L, EN_L, D, shuf, pick, R, strip, stage } = A;
  const FONT = '"Baloo Bhaijaan 2",Tahoma,Arial,sans-serif', SFX = G2.SFX;
  const sfx = k => { try { SFX[k] && SFX[k](); } catch (_) {} };
  const calm = () => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (_) { return false; } };

  /* ── تحميل Phaser عند الحاجة فقط ── */
  let pl = null;
  const PX = window.PXGames = { scene: null };
  const loadPhaser = () => window.Phaser ? Promise.resolve() : pl || (pl = new Promise((ok, no) => {
    const s = document.createElement('script');
    s.src = 'lib/phaser/phaser.min.js?v=421';
    s.async = true;
    s.onload = () => window.Phaser ? ok() : no(new Error('phaser'));
    s.onerror = () => { pl = null; s.remove(); no(new Error('phaser')); };
    document.head.appendChild(s);
  }));

  /* ── مولّدات الأسئلة (العربية والإنجليزية فقط) ── */
  const FALLBACK_AR = [['قِطَّة', '🐱'], ['بَطَّة', '🦆'], ['تُفَّاح', '🍎'], ['سَمَكَة', '🐟'], ['شَمْس', '☀️'], ['قَمَر', '🌙'], ['بَيْت', '🏠'], ['زَرَافَة', '🦒'], ['فِيل', '🐘'], ['وَرْدَة', '🌹'], ['كُرَة', '⚽'], ['نَحْلَة', '🐝']];
  const FALLBACK_EN = [['Cat', '🐱'], ['Dog', '🐶'], ['Apple', '🍎'], ['Fish', '🐟'], ['Sun', '☀️'], ['Moon', '🌙'], ['Ball', '⚽'], ['Bee', '🐝'], ['Car', '🚗'], ['Tree', '🌳'], ['Star', '⭐'], ['Cake', '🎂']];
  const wl = (l, max) => {
    let W = [];
    try { W = words(l, max) || []; } catch (_) {}
    if (W.length < 6) W = W.concat((l === 'ar' ? FALLBACK_AR : FALLBACK_EN).map(([w, pic]) => ({ w, pic, l })));
    return W;
  };
  const others = (ans, pool, n) => shuf(pool.filter(x => x !== ans)).slice(0, n - 1);
  const first = w => { const c = strip(w).replace(/^ال(?=..)/, '')[0]; return c === 'أ' || c === 'إ' || c === 'آ' ? 'ا' : c; };

  const Q = {
    arLetter(lv, n) {
      const pool = AR_L.slice(0, Math.min(28, 8 + lv * 4 + stage() * 2)), a = pick(pool);
      return { show: '🔊', sub: 'اسْمَعْ وَاخْتَرِ الْحَرْفَ', say: [AR_NAMES[a], 'ar'], ans: a, opts: shuf([a, ...others(a, pool, n)]), l: 'ar', name: AR_NAMES[a] };
    },
    arFirst(lv, n) {
      const W = wl('ar', 6).filter(x => AR_L.includes(first(x.w))), x = pick(W), a = first(x.w);
      return { show: x.pic, sub: 'بِأَيِّ حَرْفٍ تَبْدَأُ الْكَلِمَةُ؟', say: [x.w, 'ar'], ans: a, opts: shuf([a, ...others(a, AR_L, n)]), l: 'ar', name: x.w };
    },
    arWord(lv, n) {
      const W = wl('ar', 7), x = pick(W), pool = [...new Set(W.map(y => y.w))];
      return { show: x.pic, sub: 'مَا اسْمُ هَذِهِ الصُّورَةِ؟', say: null, ans: x.w, opts: shuf([x.w, ...others(x.w, pool, n)]), l: 'ar', name: x.w };
    },
    enWord(lv, n) {
      const W = wl('en', 7), x = pick(W), pool = [...new Set(W.map(y => y.w))];
      return { show: x.pic, sub: 'What is this?', say: null, ans: x.w, opts: shuf([x.w, ...others(x.w, pool, n)]), l: 'en', name: x.w };
    },
    enLetter(lv, n) {
      const pool = EN_L.slice(0, Math.min(26, 8 + lv * 3)), a = pick(pool);
      return { show: '🔊', sub: 'Listen and choose', say: [a, 'en'], ans: a, opts: shuf([a, ...others(a, pool, n)]), l: 'en', name: a };
    }
  };
  const sayQ = q => { if (q.say) talk(q.say[0], q.say[1]); else talk(q.sub, q.l); };
  const sayName = q => { try { talk(q.name, q.l); } catch (_) {} };

  function hostSize(host) {
    const top = host.getBoundingClientRect().top + window.scrollY, avail = window.innerHeight - Math.max(70, top - window.scrollY) - 14;
    const w = host.clientWidth || 360, h = Math.round(Math.max(360, Math.min(avail, w * 1.5, 760)));
    host.style.height = h + 'px'; host.style.position = 'relative'; host.style.touchAction = 'none';
    return w > h * 1.05 ? { W: 960, H: 540 } : { W: 540, H: Math.round(540 * h / w) };
  }

  function textures(sc) {
    const g = sc.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffffff, 1); g.fillCircle(8, 8, 8); g.generateTexture('px-dot', 16, 16); g.clear();
    g.fillStyle(0xffd23f, 1); g.beginPath();
    for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, r = i % 2 ? 7 : 16; g.lineTo(16 + Math.cos(a) * r, 16 + Math.sin(a) * r); }
    g.closePath(); g.fillPath(); g.generateTexture('px-star', 32, 32); g.clear();
    g.fillStyle(0xffffff, 1); g.fillRoundedRect(0, 0, 8, 26, 4); g.generateTexture('px-laser', 8, 26); g.clear();
    g.destroy();
    ['base', 'happy', 'sad', 'flap', 'blink'].forEach(v => {
      const k = 'px-owl-' + v;
      if (sc.textures.exists(k)) return;
      try { const im = G2.Owl.get(v); if (im && im.width) sc.textures.addImage(k, im); } catch (_) {}
    });
    if (!sc.textures.exists('px-owl-base')) {
      const cv = document.createElement('canvas'); cv.width = cv.height = 120;
      const x = cv.getContext('2d'); x.font = '96px sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('🦉', 60, 66);
      sc.textures.addCanvas('px-owl-base', cv);
    }
  }
  const owlKey = (sc, v) => sc.textures.exists('px-owl-' + v) ? 'px-owl-' + v : 'px-owl-base';
  function sky(sc, W, H, top, bottom) { const g = sc.add.graphics(); g.fillGradientStyle(top, top, bottom, bottom, 1); g.fillRect(0, 0, W, H); return g; }
  function burst(sc, x, y, tint, n) {
    if (calm()) n = Math.min(n, 8);
    const e = sc.add.particles(x, y, 'px-star', { speed: { min: 120, max: 420 }, angle: { min: 0, max: 360 }, scale: { start: 0.9, end: 0 }, lifespan: { min: 500, max: 900 }, gravityY: 300, rotate: { min: 0, max: 360 }, emitting: false, tint: tint || [0xffd23f, 0xffffff, 0xff8fb1, 0x8fe3ff] });
    e.explode(n || 24); sc.time.delayedCall(1200, () => e.destroy());
    const d = sc.add.particles(x, y, 'px-dot', { speed: { min: 60, max: 260 }, scale: { start: 0.6, end: 0 }, lifespan: 600, blendMode: 'ADD', emitting: false, tint: tint || 0xffe9a8 });
    d.explode(Math.round((n || 24) * 0.8)); sc.time.delayedCall(900, () => d.destroy());
  }
  function label(sc, x, y, txt, size, color, stroke) {
    const ar = /[\u0621-\u064A]/.test(txt);
    try { if (ar && window.Tashkeel && Tashkeel.nunWord && /^[\u0621-\u064A\u064B-\u0652\u0670]+$/.test(txt)) txt = Tashkeel.nunWord(txt); } catch (_) {}
    return sc.add.text(x, y, txt, { fontFamily: FONT, fontSize: size + 'px', fontStyle: '900', color: color || '#1c2c86', stroke: stroke || '#ffffff', strokeThickness: stroke === null ? 0 : Math.round(size / 7), rtl: ar, align: 'center', padding: { x: 6, y: Math.round(size * 0.25) } }).setOrigin(0.5);
  }
  function qPanel(sc, W) {
    const PW = Math.min(W * 0.7, 420), c = sc.add.container(W / 2, 40).setDepth(50), bg = sc.add.graphics();
    bg.fillStyle(0xffffff, 0.86); bg.fillRoundedRect(-PW / 2, -30, PW, 60, 22); bg.lineStyle(3, 0x3c55d0, 0.22); bg.strokeRoundedRect(-PW / 2, -30, PW, 60, 22);
    const big = label(sc, -PW * 0.12, -2, '', 34, '#1c2c86', null), sub = label(sc, PW * 0.2, -1, '', 17, '#5a5f7a', null);
    sub.setWordWrapWidth(PW * 0.42);
    const sp = label(sc, -PW / 2 + 30, 0, '🔊', 28, '#000', null).setInteractive({ useHandCursor: true });
    c.add([bg, big, sub, sp]);
    c.set = q => {
      const only = /^\s*🔊\s*$/.test(q.show);
      big.setVisible(!only);
      big.style.rtl = /[\u0621-\u064A]/.test(q.show);
      big.setText(only ? '' : q.show);
      big.setFontSize(q.show.length > 8 ? 24 : 34);
      sub.style.rtl = q.l === 'ar';
      sub.setText(q.sub);
      sc.tweens.add({ targets: c, scale: { from: 0.85, to: 1 }, duration: 320, ease: 'Back.Out' });
    };
    sp.on('pointerdown', (p, lx, ly, ev) => { ev && ev.stopPropagation(); sc.events.emit('replay'); });
    return c;
  }
  function hud(sc, W, H, need) {
    const t = sc.add.text(W - 16, H - 16, '', { fontFamily: FONT, fontSize: '26px', fontStyle: '900', color: '#ffffff', stroke: '#1c2c86', strokeThickness: 6 }).setOrigin(1, 1).setDepth(60);
    return { set: (hearts, score) => t.setText(`${'❤️'.repeat(Math.max(0, hearts))}  ⭐ ${D(score)}/${D(need)}`) };
  }

  function launch(host, lv, c, make) {
    host.innerHTML = window.Skeleton && Skeleton.cards ? Skeleton.cards() : '<p class="mut" style="text-align:center;padding:40px 0">⏳ نُجَهِّزُ اللُّعْبَةَ…</p>';
    loadPhaser().then(() => {
      if (!document.body.contains(host)) return;
      host.innerHTML = '';
      const { W, H } = hostSize(host), S = make(lv, c, W, H);
      const game = new Phaser.Game({
        type: Phaser.AUTO, parent: host, width: W, height: H, transparent: false, backgroundColor: '#9fd8ff',
        scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
        render: { antialias: true, roundPixels: false },
        physics: S.physics || undefined, input: { activePointers: 2 }, audio: { noAudio: true }, banner: false, scene: S.scene
      });
      let gone = false;
      setEng({ destroy() { if (gone) return; gone = true; try { game.destroy(true); } catch (_) {} } });
    }).catch(() => {
      host.innerHTML = `<p class="mut" style="text-align:center;padding:30px 0">تعذّر تحميل اللعبة. تأكّد من الاتصال ثم أعد المحاولة.</p><p style="text-align:center"><button class=big onclick="g2play('${c.game.id}',${lv})">🔄 إِعَادَةُ الْمُحَاوَلَةِ</button></p>`;
    });
  }
  const finish = (sc, c, win) => {
    if (sc.__end) return;
    sc.__end = 1;
    const acc = c.ok + c.mist ? c.ok / (c.ok + c.mist) : 1;
    sc.time.delayedCall(win ? 900 : 600, () => { try { done(win, { acc }); } catch (_) {} });
  };

  function rocket(gen) {
    return (lv, c, W, H) => ({
      scene: class extends Phaser.Scene {
        create() {
          const sc = this; PX.scene = sc; textures(sc);
          this.need = 4 + lv; this.hearts = lv <= 2 ? 5 : 3; this.score = 0; this.speed = 48 + lv * 9;
          sky(sc, W, H, 0x0b1040, 0x3a1f6e);
          this.stars = [0, 1, 2].map(i => sc.add.particles(0, 0, 'px-dot', { x: { min: 0, max: W }, y: -10, lifespan: (9000 - i * 2500), speedY: { min: 20 + i * 30, max: 40 + i * 45 }, scale: { min: 0.08 + i * 0.06, max: 0.16 + i * 0.08 }, alpha: { min: 0.4, max: 1 }, frequency: 260 - i * 60, blendMode: 'ADD' }));
          this.stars.forEach(e => e.fastForward(8000));
          const pg = sc.add.graphics(); pg.fillStyle(0x6f4bd8, 1); pg.fillCircle(W * 0.85, H * 0.32, 70); pg.fillStyle(0x8f6cf0, 1); pg.fillCircle(W * 0.83, H * 0.3, 52); pg.lineStyle(10, 0xffc24b, 0.7); pg.strokeEllipse(W * 0.85, H * 0.32, 220, 46);
          sc.tweens.add({ targets: pg, y: 12, duration: 4000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
          const rg = sc.make.graphics({}, false); rg.fillStyle(0xf2f4ff, 1); rg.fillRoundedRect(14, 10, 36, 70, 18); rg.fillStyle(0xff4d6d, 1); rg.fillTriangle(32, -2, 14, 28, 50, 28);
          rg.fillTriangle(14, 56, 0, 86, 14, 80); rg.fillTriangle(50, 56, 64, 86, 50, 80); rg.fillStyle(0x3c55d0, 1); rg.fillCircle(32, 44, 11); rg.fillStyle(0x9fe3ff, 1); rg.fillCircle(32, 44, 7); rg.generateTexture('px-rocket', 64, 90); rg.destroy();
          this.ship = sc.add.container(W / 2, H - 110);
          const body = sc.add.image(0, 0, 'px-rocket'), ow = sc.add.image(0, -56, owlKey(sc, 'happy')).setDisplaySize(56, 60);
          this.flame = sc.add.particles(0, 46, 'px-dot', { speedY: { min: 160, max: 260 }, speedX: { min: -30, max: 30 }, scale: { start: 0.7, end: 0 }, lifespan: 380, tint: [0xffd23f, 0xff8a1f, 0xff4d6d], blendMode: 'ADD', frequency: 18 });
          this.ship.add([this.flame, body, ow]); this.owl = ow;
          sc.tweens.add({ targets: this.ship, angle: { from: -3, to: 3 }, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
          this.tx = W / 2; sc.input.on('pointermove', p => { this.tx = p.x; }); sc.input.on('pointerdown', p => { this.tx = p.x; });
          this.lasers = []; this.rocks = []; this.fireT = 0;
          this.panel = qPanel(sc, W); this.hud = hud(sc, W, H, this.need); this.hud.set(this.hearts, this.score);
          this.events.on('replay', () => sayQ(this.q));
          this.next();
        }
        next() {
          const sc = this; this.rocks.forEach(r => r.destroy()); this.rocks = [];
          this.q = gen(lv, 4); this.panel.set(this.q); sayQ(this.q); this.wrongNow = 0;
          const n = this.q.opts.length, lane = (W - 80) / n;
          shuf(this.q.opts.map((o, i) => i)).forEach((li, k) => {
            const o = this.q.opts[k], x = 40 + lane * (li + 0.5), y = -60 - R(0, 160), rc = sc.add.container(x, y), g = sc.add.graphics(), col = pick([0x8a6a5a, 0x6f7d99, 0x7a5c9b, 0x9b6b4a]);
            g.fillStyle(col, 1); g.fillCircle(0, 0, 44); g.fillStyle(0xffffff, 0.12); g.fillCircle(-12, -14, 18); g.fillStyle(0x000000, 0.15); g.fillCircle(14, 12, 10); g.fillCircle(-16, 18, 6);
            const t = label(sc, 0, 2, o, o.length > 4 ? 24 : 38, '#ffffff', '#1c2c86');
            rc.add([g, t]); rc.ans = o; rc.r = 44; rc.vy = this.speed * (0.85 + Math.random() * 0.3);
            sc.tweens.add({ targets: g, angle: 360 * (Math.random() < 0.5 ? 1 : -1), duration: R(6000, 9000), repeat: -1 });
            this.rocks.push(rc);
          });
        }
        hit(rc) {
          const sc = this; if (rc.dead) return;
          if (rc.ans === this.q.ans) {
            rc.dead = 1; c.ok++; this.score++; this.hud.set(this.hearts, this.score); sfx('star'); burst(sc, rc.x, rc.y, null, 30); sc.cameras.main.flash(120, 255, 240, 200);
            this.owl.setTexture(owlKey(sc, 'happy')); mood('happy'); sayName(this.q);
            sc.tweens.add({ targets: rc, scale: 1.6, alpha: 0, duration: 220, onComplete: () => rc.destroy() });
            this.rocks = this.rocks.filter(r => r !== rc);
            if (this.score >= this.need) { this.win(); return; }
            sc.time.delayedCall(900, () => this.next());
          } else {
            if (rc.bad) return;
            rc.bad = 1; c.mist++; sfx('bad'); sc.cameras.main.shake(180, 0.006); sc.tweens.add({ targets: rc, x: rc.x + 10, duration: 50, yoyo: true, repeat: 3 });
            rc.list[0].setAlpha(0.55); this.owl.setTexture(owlKey(sc, 'sad')); sc.time.delayedCall(700, () => this.owl.setTexture(owlKey(sc, 'happy')));
            if (!this.wrongNow && lv >= 3) { this.wrongNow = 1; this.loseHeart(); }
          }
        }
        loseHeart() { this.hearts--; this.hud.set(this.hearts, this.score); mood('oops'); if (this.hearts <= 0) this.lose(); }
        win() {
          const sc = this; this.over = 1; sfx('win'); this.ship.list[2].setTexture(owlKey(sc, 'happy'));
          sc.tweens.add({ targets: this.ship, y: -200, duration: 1400, ease: 'Cubic.In' });
          for (let i = 0; i < 4; i++) sc.time.delayedCall(i * 180, () => burst(sc, R(60, W - 60), R(120, H / 2), null, 26));
          finish(sc, c, true);
        }
        lose() { this.over = 1; finish(this, c, false); }
        update(t, dt) {
          if (this.over) return;
          const s = dt / 1000;
          this.ship.x += (Phaser.Math.Clamp(this.tx, 40, W - 40) - this.ship.x) * Math.min(1, s * 9);
          this.fireT -= s;
          if (this.fireT <= 0) { this.fireT = 0.42; this.lasers.push(this.add.image(this.ship.x, this.ship.y - 70, 'px-laser').setTint(0x8ff7ff).setBlendMode('ADD')); }
          this.lasers.forEach(l => { l.y -= 760 * s; });
          for (const l of this.lasers) { if (l.dead) continue; for (const r of this.rocks) { if (!r.dead && Math.hypot(l.x - r.x, l.y - r.y) < r.r) { l.dead = 1; this.hit(r); break; } } }
          this.lasers = this.lasers.filter(l => { if (l.dead || l.y < -30) { l.destroy(); return false; } return true; });
          let lost = false;
          for (const r of this.rocks) { r.y += r.vy * s; r.x += Math.sin(t / 700 + r.vy) * 0.3; if (r.y > H + 60 && r.ans === this.q.ans && !r.dead) lost = true; }
          if (lost) { sfx('bad'); this.loseHeart(); if (this.hearts > 0) this.next(); }
        }
      }
    });
  }

  function islands(gen) {
    return (lv, c, W, H) => ({
      scene: class extends Phaser.Scene {
        create() {
          const sc = this; PX.scene = sc; textures(sc);
          this.need = 3 + lv; this.hearts = lv <= 2 ? 5 : 3; this.score = 0;
          sky(sc, W, H, 0x6ec6ff, 0xd8f3ff);
          const sun = sc.add.circle(W * 0.86, H * 0.2, 46, 0xffe066);
          sc.tweens.add({ targets: sun, scale: 1.08, duration: 1800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
          this.clouds = [];
          for (let i = 0; i < 5; i++) {
            const cl = sc.add.container(R(0, W), R(H * 0.15, H * 0.45));
            [[0, 0, 34], [30, -12, 28], [58, 2, 30], [28, 10, 26]].forEach(([x, y, r]) => cl.add(sc.add.circle(x, y, r, 0xffffff, 0.9)));
            cl.sp = 10 + Math.random() * 25; cl.setScale(0.6 + Math.random() * 0.7); this.clouds.push(cl);
          }
          this.sea = sc.add.graphics().setDepth(5); this.waterY = H - 90;
          this.panel = qPanel(sc, W); this.hud = hud(sc, W, H, this.need); this.hud.set(this.hearts, this.score);
          this.events.on('replay', () => sayQ(this.q));
          this.home = this.island(W * 0.16, H * 0.68, null, 0x7bd389);
          this.owl = sc.add.image(this.home.x, this.home.y - 58, owlKey(sc, 'base')).setDisplaySize(84, 92).setDepth(20);
          sc.tweens.add({ targets: this.owl, scaleY: this.owl.scaleY * 1.04, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
          this.isl = []; this.next();
        }
        island(x, y, txt, col) {
          const sc = this, cont = sc.add.container(x, y).setDepth(10), g = sc.add.graphics();
          g.fillStyle(0x8b5a2b, 1); g.fillTriangle(-70, 6, 70, 6, 0, 70); g.fillStyle(0x6b4220, 1); g.fillTriangle(0, 6, 70, 6, 0, 70);
          g.fillStyle(col || 0x7bd389, 1); g.fillEllipse(0, 0, 160, 40); g.fillStyle(0xffffff, 0.25); g.fillEllipse(-20, -6, 80, 14);
          cont.add(g);
          if (txt != null) { const n = strip(txt).length, t = label(sc, 0, -46, txt, n > 6 ? 30 : n > 3 ? 40 : 54, '#1c2c86', '#ffffff'); cont.add(t); cont.t = t; }
          cont.base = y; sc.tweens.add({ targets: cont, y: y - 8, duration: 1200 + R(0, 600), yoyo: true, repeat: -1, ease: 'Sine.InOut' });
          return cont;
        }
        next() {
          const sc = this; this.busy = 0; this.q = gen(lv, 3); this.panel.set(this.q); sayQ(this.q);
          this.isl.forEach(i => i.destroy());
          const n = this.q.opts.length, x0 = W * 0.4, span = W * 0.5;
          this.isl = this.q.opts.map((o, i) => {
            const x = x0 + span * (i + 0.5) / n, y = H * (0.5 + 0.12 * ((i + 1) % 2)), it = this.island(x, y + H, o, [0xffd166, 0x9be7b0, 0xa0c4ff][i % 3]);
            sc.tweens.add({ targets: it, y, duration: 600, delay: i * 120, ease: 'Back.Out', onComplete: () => { it.base = y; sc.tweens.add({ targets: it, y: y - 8, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.InOut' }); } });
            const z = sc.add.zone(0, -20, 170, 140).setInteractive({ useHandCursor: true }); it.add(z); z.on('pointerdown', () => this.jump(it)); it.ans = o;
            return it;
          });
        }
        jump(it) {
          const sc = this; if (this.busy || this.over) return; this.busy = 1; sfx('jump'); this.owl.setTexture(owlKey(sc, 'flap'));
          const sx = this.owl.x, sy = this.owl.y, ex = it.x, ey = it.y - 58, peak = Math.min(sy, ey) - H * 0.22, o = { p: 0 };
          sc.tweens.add({
            targets: o, p: 1, duration: 720, ease: 'Sine.InOut',
            onUpdate: () => { const p = o.p; this.owl.x = sx + (ex - sx) * p; this.owl.y = (1 - p) * (1 - p) * sy + 2 * (1 - p) * p * peak + p * p * ey; this.owl.angle = (ex > sx ? 1 : -1) * Math.sin(p * Math.PI) * 14; },
            onComplete: () => { this.owl.angle = 0; if (it.ans === this.q.ans) this.good(it); else this.bad(it); }
          });
        }
        good(it) {
          const sc = this; c.ok++; this.score++; this.hud.set(this.hearts, this.score); sfx('star'); mood('happy'); sayName(this.q); this.owl.setTexture(owlKey(sc, 'happy'));
          sc.tweens.add({ targets: this.owl, scaleX: this.owl.scaleX * 1.15, scaleY: this.owl.scaleY * 0.85, duration: 110, yoyo: true });
          burst(sc, it.x, it.y - 40, null, 28);
          if (this.score >= this.need) { this.over = 1; sfx('win'); for (let i = 0; i < 4; i++) sc.time.delayedCall(i * 200, () => burst(sc, R(80, W - 80), R(140, H * 0.5), null, 24)); finish(sc, c, true); return; }
          sc.time.delayedCall(900, () => {
            const dx = this.home.x - it.x;
            sc.tweens.add({ targets: [it, this.owl], x: `+=${dx}`, duration: 650, ease: 'Cubic.InOut' });
            sc.tweens.add({ targets: this.home, x: this.home.x - W * 0.5, alpha: 0, duration: 650, onComplete: (tw, t) => { t[0].destroy(); } });
            this.isl.filter(x => x !== it).forEach(x => sc.tweens.add({ targets: x, y: H + 200, alpha: 0, duration: 500 }));
            this.home = it; it.t && it.t.destroy(); this.isl = this.isl.filter(x => x !== it);
            sc.time.delayedCall(700, () => { this.owl.setTexture(owlKey(sc, 'base')); this.next(); });
          });
        }
        bad(it) {
          const sc = this; c.mist++; sfx('bad'); mood('oops'); this.owl.setTexture(owlKey(sc, 'sad')); sc.cameras.main.shake(200, 0.008);
          sc.tweens.killTweensOf(it); sc.tweens.add({ targets: [it], y: H + 160, angle: R(-25, 25), duration: 900, ease: 'Quad.In' });
          sc.tweens.add({
            targets: this.owl, y: this.waterY + 20, duration: 520, delay: 150, ease: 'Quad.In',
            onComplete: () => {
              const sp = sc.add.particles(this.owl.x, this.waterY, 'px-dot', { speed: { min: 100, max: 300 }, angle: { min: 220, max: 320 }, gravityY: 600, scale: { start: 0.5, end: 0 }, lifespan: 700, tint: 0x9fe3ff, emitting: false }).setDepth(30);
              sp.explode(26); sc.time.delayedCall(900, () => sp.destroy());
              this.hearts--; this.hud.set(this.hearts, this.score);
              if (this.hearts <= 0) { this.over = 1; finish(sc, c, false); return; }
              this.isl = this.isl.filter(x => x !== it); sc.time.delayedCall(450, () => it.destroy());
              this.owl.setPosition(this.home.x, this.waterY);
              sc.tweens.add({ targets: this.owl, y: this.home.y - 58, duration: 700, ease: 'Back.Out', onComplete: () => { this.owl.setTexture(owlKey(sc, 'base')); this.busy = 0; if (this.isl.filter(x => x.ans === this.q.ans).length === 0) this.next(); else sayQ(this.q); } });
            }
          });
        }
        update(t, dt) {
          const s = dt / 1000;
          this.clouds.forEach(cl => { cl.x += cl.sp * s; if (cl.x > W + 80) cl.x = -120; });
          const g = this.sea; g.clear(); const y0 = this.waterY;
          [[0x4aa3df, 0, 1], [0x2f7fc4, 14, 0.9]].forEach(([col, off, a]) => {
            g.fillStyle(col, a); g.beginPath(); g.moveTo(0, H);
            for (let x = 0; x <= W; x += 16) g.lineTo(x, y0 + off + Math.sin(x / 60 + t / 500 + off) * 7);
            g.lineTo(W, H); g.closePath(); g.fillPath();
          });
        }
      }
    });
  }

  function sling(gen) {
    return (lv, c, W, H) => ({
      physics: { default: 'matter', matter: { gravity: { y: 1.1 }, debug: false } },
      scene: class extends Phaser.Scene {
        create() {
          const sc = this; PX.scene = sc; textures(sc);
          this.need = 2 + lv; this.hearts = lv <= 2 ? 5 : 3; this.score = 0;
          sky(sc, W, H, 0xffc68a, 0xffeed6);
          const hills = sc.add.graphics(); hills.fillStyle(0x9be27a, 1); hills.fillEllipse(W * 0.25, H - 40, W * 0.9, 220); hills.fillStyle(0x7fcf5f, 1); hills.fillEllipse(W * 0.8, H - 30, W * 0.9, 180);
          this.gy = H - 60; sc.add.rectangle(W / 2, H - 30, W, 60, 0x6bbf4e); sc.add.rectangle(W / 2, H - 58, W, 6, 0x4f9a36);
          sc.matter.world.setBounds(-400, -1200, W + 800, H + 1200 - 60, 64, true, true, false, true);
          this.ax = Math.max(150, W * 0.24); this.ay = this.gy - 150;
          const post = sc.add.graphics(); post.fillStyle(0x8b5a2b, 1); post.fillRoundedRect(this.ax - 8, this.ay, 16, 150, 6); post.fillRoundedRect(this.ax - 30, this.ay - 36, 12, 46, 6); post.fillRoundedRect(this.ax + 18, this.ay - 36, 12, 46, 6);
          this.band = sc.add.graphics().setDepth(15); this.dots = sc.add.graphics().setDepth(14);
          const bx = sc.make.graphics({}, false); bx.fillStyle(0xd99a4e, 1); bx.fillRoundedRect(0, 0, 64, 64, 8); bx.lineStyle(5, 0xa96a26, 1); bx.strokeRoundedRect(3, 3, 58, 58, 7); bx.lineBetween(8, 8, 56, 56); bx.lineBetween(56, 8, 8, 56); bx.generateTexture('px-crate', 64, 64);
          bx.clear(); bx.fillStyle(0xffffff, 1); bx.fillRoundedRect(0, 0, 110, 70, 14); bx.generateTexture('px-sign', 110, 70); bx.destroy();
          this.panel = qPanel(sc, W); this.hud = hud(sc, W, H, this.need); this.hud.set(this.hearts, this.score);
          this.events.on('replay', () => sayQ(this.q));
          this.ball = null; this.items = [];
          sc.input.on('pointerdown', p => { if (!this.ball || this.flying || this.over) return; if (Math.hypot(p.x - this.ball.x, p.y - this.ball.y) < 110 || p.x < this.ax + 60) this.drag = 1; });
          sc.input.on('pointermove', p => { if (!this.drag) return; const v = new Phaser.Math.Vector2(p.x - this.ax, p.y - this.ay).limit(120); this.ball.setPosition(this.ax + v.x, this.ay + v.y); this.aim(v); });
          const rel = () => { if (!this.drag) return; this.drag = 0; this.fire(); };
          sc.input.on('pointerup', rel); sc.input.on('pointerupoutside', rel);
          const wup = () => rel();
          window.addEventListener('pointerup', wup); window.addEventListener('touchend', wup);
          this.events.once('shutdown', () => { window.removeEventListener('pointerup', wup); window.removeEventListener('touchend', wup); });
          this.events.once('destroy', () => { window.removeEventListener('pointerup', wup); window.removeEventListener('touchend', wup); });
          sc.matter.world.on('collisionstart', ev => {
            for (const pr of ev.pairs) {
              const a = pr.bodyA.gameObject, b = pr.bodyB.gameObject;
              [a, b].forEach(o => { if (o && o.ans != null && this.flying && !o.hitDone) { const other = o === a ? b : a; if (other === this.ball || (other && other.moved)) this.hitBox(o); } });
            }
          });
          this.next();
        }
        newBall() {
          const sc = this; if (this.ball) this.ball.destroy();
          const b = sc.matter.add.image(this.ax, this.ay, owlKey(sc, 'happy'), null, { shape: { type: 'circle', radius: 30 }, restitution: 0.35, friction: 0.4, density: 0.004 });
          b.setDisplaySize(68, 74); b.setStatic(true); b.setDepth(16);
          this.ball = b; this.flying = 0; this.shotT = 0; b.setScale(b.scaleX * 0.2, b.scaleY * 0.2);
          sc.tweens.add({ targets: b, scaleX: b.scaleX * 5, scaleY: b.scaleY * 5, duration: 300, ease: 'Back.Out' });
        }
        next() {
          const sc = this; this.items.forEach(o => { o.sign && o.sign.destroy(); o.txt && o.txt.destroy(); o.destroy(); });
          this.items = []; this.shots = 3;
          this.q = gen(lv, 3); this.panel.set(this.q); sayQ(this.q);
          const n = this.q.opts.length, x0 = W * 0.5, span = W * 0.46;
          this.q.opts.forEach((o, i) => {
            const x = x0 + span * (i + 0.5) / n, floors = 1 + ((i + lv) % 3);
            for (let f = 0; f < floors; f++) { const cr = sc.matter.add.image(x, this.gy - 32 - f * 64, 'px-crate', null, { friction: 0.6, density: 0.002 }); cr.setDepth(10); this.items.push(cr); }
            const top = this.gy - 32 - floors * 64, t = sc.matter.add.image(x, top, 'px-sign', null, { friction: 0.7, density: 0.0015, chamfer: { radius: 12 } });
            t.setTint([0xfff1b8, 0xd7f7ff, 0xffe0ec][i % 3]); t.ans = o;
            t.txt = label(sc, x, top, o, strip(o).length > 5 ? 24 : 34, '#1c2c86', null).setDepth(12);
            t.setDepth(11); this.items.push(t);
          });
          sc.time.delayedCall(250, () => this.newBall());
        }
        aim(v) {
          const g = this.band; g.clear(); g.lineStyle(7, 0x5a2d12, 1); g.lineBetween(this.ax - 24, this.ay - 30, this.ball.x, this.ball.y); g.lineBetween(this.ax + 24, this.ay - 30, this.ball.x, this.ball.y);
          const d = this.dots; d.clear();
          const vx = -v.x * 0.16, vy = -v.y * 0.16; let x = this.ball.x, y = this.ball.y, ux = vx, uy = vy;
          d.fillStyle(0xffffff, 0.9);
          for (let i = 0; i < 26; i++) { for (let k = 0; k < 3; k++) { x += ux; y += uy; uy += 1.1 * 0.27; } if (i % 2 === 0) d.fillCircle(x, y, 4 - i * 0.1); }
        }
        fire() {
          const sc = this, b = this.ball, v = new Phaser.Math.Vector2(b.x - this.ax, b.y - this.ay);
          this.band.clear(); this.dots.clear();
          if (v.length() < 20) { b.setPosition(this.ax, this.ay); return; }
          sfx('jump'); b.setStatic(false); b.setVelocity(-v.x * 0.16, -v.y * 0.16); b.setAngularVelocity(0.15);
          this.flying = 1; this.shotT = 0; this.hitGood = 0; this.shots--;
          b.setTexture(owlKey(sc, 'flap'));
          this.trail = sc.add.particles(0, 0, 'px-dot', { follow: b, scale: { start: 0.45, end: 0 }, lifespan: 400, frequency: 30, tint: 0xffffff, alpha: { start: 0.7, end: 0 } });
        }
        hitBox(o) {
          const sc = this; o.hitDone = 1;
          if (o.ans === this.q.ans) {
            this.hitGood = 1; c.ok++; this.score++; this.hud.set(this.hearts, this.score); sfx('star'); mood('happy'); sayName(this.q); burst(sc, o.x, o.y, null, 34); sc.cameras.main.flash(120, 255, 240, 200);
            sc.time.delayedCall(60, () => { o.txt && o.txt.destroy(); o.txt = null; o.destroy(); this.items = this.items.filter(x => x !== o); });
            if (this.score >= this.need) { this.over = 1; sfx('win'); for (let i = 0; i < 4; i++) sc.time.delayedCall(i * 200, () => burst(sc, R(80, W - 80), R(140, H * 0.5), null, 24)); finish(sc, c, true); }
          } else {
            c.mist++; sfx('bad'); mood('oops'); o.setTint(0xff7a8a); sc.cameras.main.shake(160, 0.006);
          }
        }
        endShot() {
          const sc = this; this.flying = 0; this.trail && this.trail.destroy();
          if (this.over) return;
          if (this.hitGood) { sc.time.delayedCall(500, () => this.next()); return; }
          if (this.shots <= 0) {
            this.hearts--; this.hud.set(this.hearts, this.score); mood('oops');
            if (this.hearts <= 0) { this.over = 1; finish(sc, c, false); return; }
            sayQ(this.q); sc.time.delayedCall(400, () => this.next()); return;
          }
          this.newBall();
        }
        update(t, dt) {
          if (this.items) this.items.forEach(o => { if (o.txt && o.active) { o.txt.setPosition(o.x, o.y); o.txt.setRotation(o.rotation); } if (o.body && o.body.speed > 1.5) o.moved = 1; });
          if (this.flying && this.ball) {
            this.shotT += dt; const b = this.ball;
            if (this.shotT > 4500 || b.x > W + 80 || b.x < -80 || (this.shotT > 900 && b.body.speed < 0.25)) {
              this.ball.destroy(); this.ball = null; this.endShot();
            }
          }
        }
      }
    });
  }

  /* ── الألعاب المسجلة (عربي + إنجليزي فقط، بلا رياضيات أو عالم مغامرات) ── */
  const LIST = [
    { id: 'px-rocket-ar', cat: 'ar', icon: '🚀', name: 'صاروخ الحروف ✨', desc: 'حرّك صاروخ بومي وأطلق على نيزك الحرف الذي تسمعه.', levels: 6, diff: 'سهل', cover: { k: 'emoji', th: 'space', e: '🚀 ب' }, make: rocket(Q.arLetter), intro: 'هَيَّا نَطِيرُ فِي الْفَضَاءِ! حَرِّكِ الصَّارُوخَ بِإِصْبَعِكَ، وَأَصِبِ النَّيْزَكَ الَّذِي يَحْمِلُ الْحَرْفَ الَّذِي تَسْمَعُهُ.' },
    { id: 'px-jump-ar', cat: 'ar', icon: '🏝️', name: 'قفزة الجزر ✨', desc: 'بأي حرف تبدأ الصورة؟ اضغط جزيرة الجواب ليقفز بومي إليها.', levels: 6, diff: 'سهل', cover: { k: 'emoji', th: 'sea', e: '🏝️ ق' }, make: islands(Q.arFirst), intro: 'انْظُرْ إِلَى الصُّورَةِ، ثُمَّ اضْغَطِ الْجَزِيرَةَ الَّتِي عَلَيْهَا أَوَّلُ حَرْفٍ فِي الْكَلِمَةِ.' },
    { id: 'px-rocket-en', cat: 'en', icon: '🚀', name: 'Letter Rocket ✨', desc: 'Listen to the letter and shoot its meteor.', levels: 6, diff: 'سهل', cover: { k: 'emoji', th: 'space', e: '🚀 B' }, make: rocket(Q.enLetter), intro: 'اسْمَعِ الْحَرْفَ الْإِنْجِلِيزِيَّ، ثُمَّ حَرِّكِ الصَّارُوخَ وَأَصِبْ نَيْزَكَهُ.' },
    { id: 'px-jump-en', cat: 'en', icon: '🏝️', name: 'Island Jump ✨', desc: 'اختر الكلمة الإنجليزية للصورة ليقفز بومي إليها.', levels: 6, diff: 'سهل', cover: { k: 'emoji', th: 'sea', e: '🏝️ 🍎' }, make: islands(Q.enWord), intro: 'انْظُرْ إِلَى الصُّورَةِ، وَاضْغَطِ الْجَزِيرَةَ الَّتِي عَلَيْهَا اسْمُهَا بِالْإِنْجِلِيزِيَّةِ.' },
    { id: 'px-sling', cat: 'iq', icon: '🎯', name: 'منجنيق بومي ✨', desc: 'اسحب بومي للخلف وأطلقه نحو صندوق الكلمة الصحيحة!', levels: 6, diff: 'متوسط', cover: { k: 'emoji', th: 'desert', e: '🎯 🦉' }, make: sling(Q.arWord), intro: 'اِسْحَبْ بُومِي إِلَى الْخَلْفِ ثُمَّ اتْرُكْهُ لِيَنْطَلِقَ نَحْوَ اسْمِ الصُّورَةِ الصَّحِيحِ.' }
  ];

  LIST.forEach(x => {
    if (GAMES.some(g => g.id === x.id)) return;
    const make = x.make; delete x.make;
    x.run = (host, lv, c) => launch(host, lv, c, make);
    x.px = 1;
    const i = GAMES.findIndex(g => g.cat === x.cat);
    if (i < 0) GAMES.push(x); else GAMES.splice(i, 0, x);
  });

  PX.Q = Q; PX.loadPhaser = loadPhaser; PX.list = LIST.map(x => x.id);

  try { window.Router && Router.wrapAll && Router.wrapAll(); } catch (_) {}
})();
