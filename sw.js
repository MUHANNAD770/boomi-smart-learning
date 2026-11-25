/* sw.js — ذاكرة العمل دون اتصال (Offline Cache) لمنصة حروفي */
'use strict';

const CACHE = 'hurufi-app-v206';

const PRECACHE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './img/fav.png',
  './img/icon.png',
  './img/icon-192c.png',
  './img/icon-512.png',
  './img/icon-512c.png',
  './img/ui/acad-ar.webp',
  './img/ui/acad-en.webp',
  './img/ui/owl-book.webp',
  './img/ui/medal.webp',
  './src/styles/tokens.css',
  './src/styles/base.css',
  './src/styles/features.css',
  './src/styles/components.css',
  './src/core/utils.js',
  './src/core/storage.js',
  './src/core/lazy.js',
  './src/shared/sounds.js',
  './src/shared/voice.js',
  './src/shared/grader.js',
  './src/shared/mic.js',
  './src/core/curriculum-core.js',
  './src/core/badges.js',
  './src/academies/arabic/quiz-ar.js',
  './src/academies/arabic/teacher-ar.js',
  './src/academies/english/pron-en.js',
  './src/academies/english/quiz-en.js',
  './src/academies/english/teacher-en.js',
  './src/shared/home.js',
  './src/core/quiz.js',
  './src/assessment/exam-engine.js',
  './src/tutor/brain.js',
  './src/tutor/local-ai.js',
  './src/tutor/mind-memory.js',
  './src/tutor/mind-analyzer.js',
  './src/tutor/mind-coach.js',
  './src/tutor/mind-hub.js',
  './src/shared/emoji3d.js',
  './src/shared/lfocus.js',
  './src/shared/phase9.js',
  './src/shared/pull-refresh.js',
  './src/shared/sync.js',
  './src/parent/parent-panel.js',
  './src/tutor/mascot.js',
  './src/tutor/boomi-ui.js',
  './src/tutor/mind-voiceq.js',
  './src/core/nav.js',
  './src/core/router.js',
  './lib/gsap.min.js',
  './src/shared/anim.js'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled(PRECACHE.map(url => cache.add(new Request(url, { cache: 'reload' }))));
    self.skipWaiting();
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // لا تخزّن نقاط النهاية الديناميكية لـ API أو Netlify Functions
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/.netlify/')) return;

  // الصفحة الرئيسية وملفات الكود والبيانات: الشبكة أولًا مع تحديث الذاكرة والتراجع إليها عند انقطاع الاتصال
  if (req.mode === 'navigate' || url.pathname.startsWith('/data/') || /\.(?:html?|js|css|json|webmanifest)$/i.test(url.pathname)) {
    event.respondWith((async () => {
      try {
        const net = await fetch(req, { cache: 'no-cache' });
        if (net && net.ok) {
          const cache = await caches.open(CACHE);
          cache.put(req.mode === 'navigate' ? req : url.pathname, net.clone());
        }
        return net;
      } catch {
        const cache = await caches.open(CACHE);
        const hit = await cache.match(req, { ignoreSearch: true });
        return hit || (req.mode === 'navigate' ? cache.match('./index.html') : undefined);
      }
    })());
    return;
  }

  // الصور والملفات الصوتية والخطوط: الذاكرة أولًا مع تحديث خلفي
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(req, { ignoreSearch: true });
    const updating = fetch(req).then(net => {
      if (net && net.ok) cache.put(url.pathname, net.clone());
      return net;
    }).catch(() => cached);
    return cached || updating;
  })());
});
