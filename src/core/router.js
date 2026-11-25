/* src/core/router.js — تنقّل حقيقي موثوق (زر الرجوع، تنظيف الذاكرة عند الانتقال، ودعم الكسول Lazy Loading) */
(() => {
  'use strict';

  const H = window.history;
  try { H.scrollRestoration = 'manual'; } catch {}
  const uid = () => Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
  const safe = v => { try { return JSON.parse(JSON.stringify(v === undefined ? null : v)); } catch { return null; } };
  const ARC = 'games';

  const CFG = {
    home: { cs: 'home' },
    who: { root: 1, cs: '' },
    setup: { root: 1, cs: '' },
    sec: { cs: a => (a && a[0]) || 'les' },
    parentPanel: { cs: 'set' },
    voiceSet: { cs: 'set' },
    cert: { cs: 'ach' },
    lesson: { cs: 'les' },
    quiz: { vol: 1 },
    bank: { cs: () => (window.P && P.lang === 'en' ? 'en' : 'ar') },
    bankSub: { cs: a => (a && a[0] === 'en' ? 'en' : 'ar') },
    bankLesson: { cs: a => (a && a[2] === 'en' ? 'en' : 'ar') },
    bankReview: { cs: a => (a && a[0] === 'en' ? 'en' : 'ar') },
    bankPractice: { cs: a => (a && a[0] === 'en' ? 'en' : 'ar') },
    arTeach: { cs: 'ar' },
    enTeach: { cs: 'en' },
    teacher: { cs: 'set' },
    examHub: { cs: 'exams', iter: 1 },
    startExam: { vol: 1, cs: 'exams' },
    daily: { cs: ARC },
    review: { cs: ARC },
    speak: { cs: ARC },
    courseLibrary: { cs: a => (a && a[0] === 'en' ? 'en' : a && a[0] === 'ar' ? 'ar' : 'les'), iter: 1 },
    courseModule: { cs: a => (a && (a[1] === 'en' || /^en-/.test(a[0])) ? 'en' : a && (a[1] === 'ar' || /^ar-/.test(a[0])) ? 'ar' : 'les') },
    courseViewer: { cs: a => (a && (a[2] === 'en' || /^en-/.test(a[0])) ? 'en' : a && (a[2] === 'ar' || /^ar-/.test(a[0])) ? 'ar' : 'les'), iter: (a, b) => a && b && a[0] == b[0] && a[1] == b[1] },
    coursePractice: { cs: a => (a && (a[2] === 'en' || /^en-/.test(a[0])) ? 'en' : a && (a[2] === 'ar' || /^ar-/.test(a[0])) ? 'ar' : 'les') },
    act: { cs: ARC },
    aLet: { cs: ARC },
    aLetP: { cs: ARC, iter: 1 },
    aPath: { cs: ARC, iter: 1 },
    aColAr: { cs: ARC },
    aColEn: { cs: ARC },
    aColQAr: { cs: ARC },
    aColQEn: { cs: ARC },
    aShpAr: { cs: ARC },
    aShpEn: { cs: ARC },
    aShpQAr: { cs: ARC },
    aShpQEn: { cs: ARC },
    aHar: { cs: ARC },
    aHarP: { cs: ARC, iter: 1 },
    aHarQ: { cs: ARC },
    aAbj: { cs: ARC },
    aAbjP: { cs: ARC, iter: 1 },
    aFirst: { cs: ARC },
    aOpp: { cs: ARC },
    aPat: { cs: ARC },
    aOdd: { cs: ARC },
    aDays: { cs: ARC },
    aEnPic: { cs: ARC },
    gMem: { cs: ARC },
    gBuild: { cs: ARC },
    gPat: { cs: ARC },
    gOrd: { cs: ARC },
    games2d: { cs: ARC },
    g2levels: { cs: ARC, iter: (a, b) => a && b && a[0] == b[0] },
    g2play: { cs: ARC, iter: (a, b) => a && b && a[0] == b[0] },
    stories: { cs: 'stories', iter: 1 },
    story: { cs: 'stories' },
    talk: { cs: 'stories' },
    sbStory: { cs: 'stories' },
    sbQuiz: { cs: 'stories' },
    sbTest: { cs: 'stories' },
    listenTest: { cs: 'stories' },
    readTest: { cs: 'stories' },
    riddles: { cs: ARC },
    logic: { cs: ARC },
    puzzles: { cs: ARC },
    speedGame: { cs: ARC },
    practiceMistakes: { cs: 'exams', vol: 1 },
    dragBuild: { cs: ARC, iter: 1 },
    matchPics: { cs: ARC, iter: 1 },
    dictation: { cs: ARC, iter: 1 },
    dictationAdv: { cs: ARC },
    syllables: { cs: ARC },
    weekly: { cs: ARC },
    advanced: { cs: ARC }
  };

  let depth = 0, restoring = false, shown = null, shownRoute = null, curN = 0, ov = null;
  const entry = () => { const s = H.state; return s && s.hurufi ? s.hurufi : null; };
  const put = (m, e) => { try { H[m]({ hurufi: e }, ''); } catch {} };
  const same = (a, b) => !!(a && b && a.fn === b.fn && JSON.stringify(a.args || []) === JSON.stringify(b.args || []));

  const SK = 'hurufi-stack';
  const stack = () => { try { return JSON.parse(sessionStorage.getItem(SK) || '[]') || []; } catch { return []; } };
  const setStack = (n, fn) => { try { const s = stack().slice(0, n); s[n] = fn; sessionStorage.setItem(SK, JSON.stringify(s)); } catch {} };
  const setCS = (fn, args) => {
    const c = CFG[fn] && CFG[fn].cs;
    if (c === undefined) return;
    try { window.CS = typeof c === 'function' ? c(args) : c; } catch {}
  };
  const syncNav = () => {
    try {
      const nv = document.getElementById('gn');
      if (!nv) return;
      const k = window.V === 'home' ? 'home' : window.CS || '';
      nv.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.k === k));
    } catch {}
  };

  function leaveCurrent() {
    try { window.Lazy && Lazy.cleanup(); } catch {}
    try { window.bmicStop && bmicStop(1); } catch {}
  }

  function commit(name, args) {
    const cfg = CFG[name] || {}, curE = entry();
    const e = { id: uid(), n: 0, fn: name, args: safe(args) || [], vol: !!cfg.vol, root: !!cfg.root, up: null, y: 0 };
    if (!curE) {
      put('replaceState', e);
      shown = e.id;
      curN = 0;
      shownRoute = { fn: name, args: e.args };
      setStack(0, name);
      return;
    }
    const sameFn = curE.fn === name;
    const sameArgs = JSON.stringify(curE.args || []) === JSON.stringify(e.args);
    const replaceIt = curE.root || (sameFn && (sameArgs || cfg.iter === 1 || (typeof cfg.iter === 'function' && cfg.iter(curE.args, e.args))));
    if (replaceIt) {
      e.n = curE.n;
      e.up = cfg.vol ? (curE.vol ? curE.up : null) : curE.up;
      put('replaceState', e);
    } else {
      put('replaceState', { ...curE, y: Math.round(window.scrollY || 0) });
      e.n = curE.n + 1;
      e.up = cfg.vol ? (curE.vol ? curE.up : { fn: curE.fn, args: curE.args }) : null;
      put('pushState', e);
    }
    shown = e.id;
    curN = e.n;
    shownRoute = { fn: name, args: e.args };
    setStack(e.n, name);
  }

  function wrap(name) {
    const orig = window[name];
    if (typeof orig !== 'function' || orig.__rt) return;
    const f = function (...a) {
      if (restoring || depth > 0) return orig.apply(this, a);
      const BA = window.BumiAudio;
      if (BA && BA.stale()) return;
      depth++;
      try {
        leaveCurrent();
        commit(name, a);
        setCS(name, a);
        BA && BA.navigate();
        const self = this;
        const r = BA ? BA.within(() => orig.apply(self, a)) : orig.apply(this, a);
        syncNav();
        return r;
      } finally {
        depth--;
      }
    };
    f.__rt = 1;
    f.__orig = orig;
    window[name] = f;
  }

  function render(e) {
    restoring = true;
    try {
      leaveCurrent();
      shown = e.id;
      curN = e.n;
      let fn = e.fn, args = e.args || [];
      if (e.vol) {
        const u = e.up;
        fn = (u && u.fn) || 'home';
        args = (u && u.args) || [];
      }
      if (!window.P) fn = 'setup';
      else if (typeof window[fn] !== 'function') fn = 'home';
      shownRoute = { fn, args };
      setCS(fn, args);
      const BA = window.BumiAudio;
      BA && BA.navigate();
      const run = fnToRun => (BA ? BA.within(fnToRun) : fnToRun());
      try {
        const res = run(() => window[fn].apply(null, args));
        if (res && typeof res.catch === 'function') res.catch(() => {});
      } catch {
        try { run(() => window.home()); } catch {}
      }
      syncNav();
      const y = e.y || 0;
      requestAnimationFrame(() => { try { window.scrollTo(0, y); } catch {} });
    } finally {
      restoring = false;
    }
  }

  addEventListener('popstate', ev => {
    const e = ev.state && ev.state.hurufi;
    if (!e) {
      const h0 = { id: uid(), n: 0, fn: 'home', args: [], vol: false, root: false, up: null, y: 0 };
      put('replaceState', h0);
      render(h0);
      return;
    }
    const back = e.n < curN;
    if (ov && !e.ov) {
      const o = ov;
      ov = null;
      try { o.close(); } catch {}
    }
    if (e.ov) {
      put('replaceState', { ...e, ov: null });
      curN = e.n;
      return;
    }
    if (e.id === shown) {
      curN = e.n;
      return;
    }
    if (back && e.vol && e.n > 0) {
      H.back();
      return;
    }
    if (back && e.n > 0 && !e.vol && same(e, shownRoute)) {
      H.back();
      return;
    }
    if (e.vol && !back) {
      const u = e.up || { fn: 'home', args: [] };
      const r = { ...e, fn: u.fn, args: u.args || [], vol: false, up: null };
      put('replaceState', r);
      render(r);
      return;
    }
    render(e);
  });

  function goBack() {
    const e = entry();
    if (e && e.n > 0) H.back();
    else if (typeof window.home === 'function') window.home();
  }
  window.goBack = goBack;

  function goHome() {
    const e = entry(), s = stack();
    if (e) {
      for (let k = e.n - 1; k >= 0; k--) {
        if (s[k] === 'home') {
          H.go(k - e.n);
          return true;
        }
      }
    }
    return false;
  }

  document.addEventListener('click', ev => {
    const b = ev.target.closest && ev.target.closest('button,a[role=button]');
    if (!b || b.disabled) return;
    const t = (b.textContent || '').replace(/[\u064B-\u0652\u0670\u0640]/g, '').replace(/\s+/g, ' ').trim();
    const e = entry();
    if (b.dataset && b.dataset.back != null) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      goBack();
      return;
    }
    if (!e || e.n < 1) return;
    if (/^(←\s*)?رُ?جُ?وع(\s*←)?$/.test(t) || /^←\s*العودة/.test(t) || /^العودة/.test(t)) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      goBack();
      return;
    }
    if (/رجوع للرئيسية/.test(t)) {
      if (goHome()) {
        ev.preventDefault();
        ev.stopImmediatePropagation();
      }
      return;
    }
    if (/^(←\s*)?رجوع\s/.test(t) || /^←\s/.test(t)) {
      ev.preventDefault();
      ev.stopImmediatePropagation();
      goBack();
    }
  }, true);

  function wrapOverlay() {
    const orig = window.bomi;
    if (typeof orig !== 'function' || orig.__rt) return;
    const f = function () {
      orig.apply(this, arguments);
      const el = document.getElementById('bm'), curE = entry();
      if (!el || !curE || ov) return;
      ov = {
        close: () => {
          try { window.BumiAudio ? BumiAudio.navigate() : window.say && say.stop && say.stop(); window.bmicStop && bmicStop(1); } catch {}
          const x = document.getElementById('bm');
          x && x.remove();
        }
      };
      put('pushState', { ...curE, n: curE.n + 1, ov: 'bm' });
      curN = curE.n + 1;
      const mo = new MutationObserver(() => {
        if (document.getElementById('bm')) return;
        mo.disconnect();
        if (ov) {
          ov = null;
          const c = entry();
          if (c && c.ov) H.back();
        }
      });
      mo.observe(document.body, { childList: true });
    };
    f.__rt = 1;
    window.bomi = f;
  }

  function wrapAll() {
    Object.keys(CFG).forEach(wrap);
    wrapOverlay();
  }

  function initRouter() {
    wrapAll();
    const e = entry();
    if (e && window.P) {
      const r = e.ov ? { ...e, ov: null } : e;
      if (e.ov) put('replaceState', r);
      render(r);
    } else if (e && !window.P) {
      const h0 = { id: uid(), n: 0, fn: 'setup', args: [], root: true, vol: false, up: null, y: 0 };
      put('replaceState', h0);
      shown = h0.id;
      shownRoute = { fn: 'setup', args: [] };
    } else {
      const fn = window.V === 'setup' ? 'setup' : window.V === 'who' ? 'who' : 'home';
      put('replaceState', { id: uid(), n: 0, fn, args: [], vol: false, root: fn !== 'home', up: null, y: 0 });
      shown = entry() && entry().id;
      shownRoute = { fn, args: [] };
      setStack(0, fn);
    }
  }

  window.Router = { back: goBack, home: goHome, entry, stack, CFG, wrap, wrapAll, init: initRouter };

  document.addEventListener('pointerdown', e => {
    try {
      const s = getSelection();
      if (s && !s.isCollapsed && e.target.closest && e.target.closest('button,.opt,.card,.row,a,[onclick],input,select,canvas')) {
        s.removeAllRanges();
      }
    } catch {}
  }, true);
})();
