/* src/core/lazy.js — تحميل الوحدات الثقيلة عند الطلب + تنظيف المؤقتات والمستمعين عند مغادرة الشاشة */
(() => {
  'use strict';

  const loaded = new Map();
  const cleanups = new Set();

  function loadScript(src) {
    if (loaded.has(src)) return loaded.get(src);
    const p = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = src.includes('?') ? src : src + '?v=204';
      s.async = false;
      s.onload = () => resolve(true);
      s.onerror = () => {
        loaded.delete(src);
        reject(new Error('Failed to load ' + src));
      };
      document.head.appendChild(s);
    });
    loaded.set(src, p);
    return p;
  }

  async function loadBundle(scripts) {
    for (const src of scripts) {
      await loadScript(src);
    }
  }

  function onLeave(fn) {
    if (typeof fn === 'function') cleanups.add(fn);
    return () => cleanups.delete(fn);
  }

  function cleanup() {
    for (const fn of [...cleanups]) {
      try { fn(); } catch {}
    }
    cleanups.clear();
  }

  const Skeleton = {
    lesson: () => `<section class="sec skel-wrap" aria-busy="true" aria-label="جارٍ تحميل المحتوى">
      <div class=skel-hero><div class="skel-bar skel-w40"></div><div class="skel-bar skel-w80"></div></div>
      <div class=skel-row><div class="skel-bar skel-w60"></div></div>
      <div class=skel-row><div class="skel-bar skel-w80"></div></div>
      <div class=skel-row><div class="skel-bar skel-w40"></div></div>
    </section>`,
    stories: () => `<div class=skel-wrap aria-busy="true" aria-label="جارٍ تحميل المكتبة">
      <div class=skel-grid>${Array.from({ length: 6 }, () => '<div class=skel-card><div class="skel-bar skel-w40"></div><div class="skel-bar skel-w80"></div><div class="skel-bar skel-w60"></div></div>').join('')}</div>
    </div>`,
    exam: () => `<section class="sec skel-wrap" aria-busy="true" aria-label="جارٍ تجهيز الأسئلة">
      <div class=skel-hero><div class="skel-bar skel-w60"></div><div class="skel-bar skel-w80"></div></div>
      <div class=skel-grid>${Array.from({ length: 4 }, () => '<div class=skel-card style="min-height:76px"><div class="skel-bar skel-w60"></div></div>').join('')}</div>
    </section>`,
    cards: () => `<section class="sec skel-wrap" aria-busy="true" aria-label="جارٍ التحميل">
      <div class=skel-row><div class="skel-bar skel-w60"></div></div>
      <div class=skel-grid>${Array.from({ length: 6 }, () => '<div class=skel-card><div class="skel-bar skel-w60"></div><div class="skel-bar skel-w40"></div></div>').join('')}</div>
    </section>`
  };

  // Lazy wrappers: register minimal entry stubs that show a Skeleton Screen and fetch feature modules on first tap
  function lazyStub(globalNames, scripts, fnName, skelKind) {
    const list = Array.isArray(globalNames) ? globalNames : [globalNames];
    const kind = skelKind || 'lesson';
    for (const name of list) {
      if (typeof window[name] === 'function') continue;
      window[name] = function (...args) {
        const self = this;
        try {
          if (typeof window.h === 'function') {
            window.V = 'sec';
            window.h((Skeleton[kind] || Skeleton.lesson)());
          }
        } catch {}
        return loadBundle(scripts).then(() => {
          try { window.Router && Router.wrapAll && Router.wrapAll(); } catch {}
          const wrapped = window[name];
          const fn = (wrapped && wrapped.__orig) ? wrapped.__orig : wrapped;
          if (typeof fn === 'function' && !fn.__lazyStub) {
            return fn.apply(self, args);
          }
          if (fnName && typeof window[fnName] === 'function') {
            return window[fnName].apply(self, args);
          }
        }).catch(() => {
          try {
            if (typeof window.h === 'function') {
              window.h(`<section class=sec><button class=link onclick="goBack()">← رجوع</button><p class=mut>تعذّر تحميل هذا القسم الآن. تأكّد من الاتصال ثم أعد المحاولة.</p><button class=big onclick="${name}()">إعادة المحاولة ↻</button></section>`);
            }
          } catch {}
        });
      };
      window[name].__lazyStub = true;
    }
  }

  window.Skeleton = Skeleton;
  window.Lazy = { loadScript, loadBundle, onLeave, cleanup, lazyStub };
})();

