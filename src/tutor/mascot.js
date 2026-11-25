/* /src/tutor/mascot.js — بومي التفاعلي (SVG): حركة الفم مع الصوت، متابعة العينين، ردود الفعل، وقراءة الأسئلة */
const MC = (() => {
  'use strict';
  const el = document.createElement('div');
  el.id = 'mc';
  el.innerHTML = `<svg class=ow viewBox="0 0 120 130" role=img aria-label="بومي" onclick="MC.repeat()">
<defs>
<radialGradient id=bmH cx=50% cy=38% r=62%><stop offset=0 stop-color=#9a86ff /><stop offset=.75 stop-color=#6c50e8 /><stop offset=1 stop-color=#4a32b5 /></radialGradient>
<radialGradient id=bmF cx=50% cy=42% r=58%><stop offset=0 stop-color=#ffffff /><stop offset=1 stop-color=#e3dcff /></radialGradient>
<radialGradient id=bmI cx=42% cy=38% r=62%><stop offset=0 stop-color=#ffbf52 /><stop offset=.65 stop-color=#c06c18 /><stop offset=1 stop-color=#6e350c /></radialGradient>
<linearGradient id=bmR x1=0 y1=0 x2=0 y2=1><stop offset=0 stop-color=#3d5ad6 /><stop offset=1 stop-color=#1c2c86 /></linearGradient>
<linearGradient id=bmC x1=0 y1=0 x2=0 y2=1><stop offset=0 stop-color=#3c55d0 /><stop offset=1 stop-color=#1a2878 /></linearGradient>
<linearGradient id=bmT x1=0 y1=0 x2=1 y2=1><stop offset=0 stop-color=#24357e /><stop offset=1 stop-color=#0f1846 /></linearGradient>
<radialGradient id=bmG><stop offset=0 stop-color=#9fd0ff stop-opacity=.9 /><stop offset=1 stop-color=#9fd0ff stop-opacity=0 /></radialGradient>
</defs>
<ellipse class=glow cx=60 cy=124 rx=34 ry=5.5 fill=url(#bmG) />
<g class=ft fill=#f6a019 stroke=#c97806 stroke-width=.8><path d="M44 118q-6 4-4 7h12q2-3-3-7z"/><path d="M71 118q-5 4-3 7h12q2-3-4-7z"/></g>
<g class=bd>
<path d="M30 80Q27 112 36 121H84Q93 112 90 80Q60 70 30 80Z" fill=url(#bmR) />
<path d="M50 81L46 120H74L70 81Q60 77 50 81Z" fill=#efeaff />
<g stroke=#d2c8fb stroke-width=1 fill=none stroke-linecap=round><path d="M54 92q3 2 6 0q3 2 6 0"/><path d="M53 100q3.5 2 7 0q3.5 2 7 0"/><path d="M52 108q4 2 8 0q4 2 8 0"/></g>
<path d="M50 81L45.5 120M70 81L74.5 120" stroke=#f7b500 stroke-width=2.6 fill=none />
<path d="M32 79Q60 95 88 79Q60 86 32 79Z" fill=#2a3fae stroke=#f7b500 stroke-width=1.6 />
<circle cx=60 cy=89 r=6.4 fill=#f7b500 stroke=#d48e00 stroke-width=.8 /><circle cx=60 cy=89 r=4.6 fill=#1f2f8c />
<path d="M57 87.6q1.5-.6 3 .4q1.5-1 3-.4v3.4q-1.5-.6-3 .4q-1.5-1-3-.4z" fill=#ffd24a />
</g>
<g class=wl><path d="M33 84Q16 84 7 96Q15 97 22 95Q16 101 14 106Q26 101 34 96Z" fill=#5a3fd0 stroke=#3d2899 stroke-width=.8 /><path d="M30 88Q19 90 13 97" stroke=#9480f7 stroke-width=1.2 fill=none /></g>
<g class=wr><path d="M87 84Q101 90 102 106Q95 106 88 101Z" fill=#5a3fd0 stroke=#3d2899 stroke-width=.8 />
<g class=tb transform="rotate(-10 98 104)"><rect x=86 y=90 width=24 height=30 rx=3.5 fill=url(#bmT) stroke=#5b7cff stroke-width=1.4 /><path class=tbg d="M92 104q3.5-2 6 0q2.5-2 6 0v6q-3.5-2-6 0q-2.5-2-6 0z" fill=#7fe3ff /><circle cx=98 cy=93 r=.8 fill=#5b7cff /></g>
<ellipse cx=88 cy=107 rx=4.6 ry=6.5 fill=#5a3fd0 stroke=#3d2899 stroke-width=.7 transform="rotate(-20 88 107)" /></g>
<g class=hd>
<path d="M28 36L20 16L42 28Z" fill=#7d64f2 /><path d="M92 36L100 16L78 28Z" fill=#7d64f2 />
<path d="M46 22l4-10l4 9l5-11l4 11l5-9l3 10z" fill=#c98440 />
<ellipse cx=60 cy=52 rx=37 ry=32 fill=url(#bmH) /><path d="M24 50l-4 6l5 1l-3 6l6 0M96 50l4 6l-5 1l3 6l-6 0" fill=#6c50e8 />
<path d="M60 30C42 28 26 38 28 56C30 74 46 82 60 82C74 82 90 74 92 56C94 38 78 28 60 30Z" fill=url(#bmF) />
<g class=brow stroke=#6b3816 stroke-width=3 fill=none stroke-linecap=round><path class=bl d="M34 35Q42 30 51 34"/><path class=br d="M69 34Q78 30 86 35"/></g>
<circle cx=44 cy=52 r=12.5 fill=#fff /><circle cx=76 cy=52 r=12.5 fill=#fff />
<g id=pl><circle cx=44 cy=53 r=8 fill=url(#bmI) /><circle cx=76 cy=53 r=8 fill=url(#bmI) /><circle cx=44 cy=53 r=4.2 fill=#1b0e05 /><circle cx=76 cy=53 r=4.2 fill=#1b0e05 /><circle cx=41 cy=49.5 r=2.6 fill=#fff /><circle cx=73 cy=49.5 r=2.6 fill=#fff /><circle cx=46.5 cy=56 r=1.1 fill=#fff /><circle cx=78.5 cy=56 r=1.1 fill=#fff /></g>
<g class=lid><ellipse cx=44 cy=52 rx=13 ry=13 fill=#d8cffd /><ellipse cx=76 cy=52 rx=13 ry=13 fill=#d8cffd /></g>
<g class=gl fill=none><circle cx=44 cy=52 r=14.5 stroke=#2447c9 stroke-width=3.2 /><circle cx=76 cy=52 r=14.5 stroke=#2447c9 stroke-width=3.2 /><circle cx=44 cy=52 r=13 stroke=#7f9bff stroke-width=.8 opacity=.7 /><circle cx=76 cy=52 r=13 stroke=#7f9bff stroke-width=.8 opacity=.7 /><path d="M57.5 50Q60 47 62.5 50" stroke=#2447c9 stroke-width=2.6 /><path d="M29.5 50L24 47M90.5 50L96 47" stroke=#2447c9 stroke-width=2.6 stroke-linecap=round /><path d="M35 45q3-4 7-5" stroke=#fff stroke-width=1.4 opacity=.8 stroke-linecap=round /></g>
<circle cx=31 cy=67 r=4.2 fill=#ff9db8 opacity=.55 /><circle cx=89 cy=67 r=4.2 fill=#ff9db8 opacity=.55 />
<g class=bk><path d="M52.5 65.5Q60 84 67.5 65.5Q60 69 52.5 65.5Z" fill=#9e2318 /><ellipse cx=60 cy=74 rx=4.3 ry=2.8 fill=#ff7182 /><path d="M52.5 65.5Q60 83 67.5 65.5" stroke=#e08a00 stroke-width=2 fill=none stroke-linecap=round /></g>
<path d="M53 61Q60 55 67 61Q64 67 60 71Q56 67 53 61Z" fill=#ffb620 stroke=#df8a00 stroke-width=.9 /><path d="M56 60q4-2 8 0" stroke=#fff2b0 stroke-width=1 fill=none opacity=.8 />
<g class=cap><path d="M38 27Q60 34 82 27L80 17Q60 22 40 17Z" fill=#1d2c84 /><path d="M60 1L105 15L60 29L15 15Z" fill=url(#bmC) stroke=#16236a stroke-width=.8 /><path d="M60 4L98 15L60 26" fill=none stroke=#6f86ff stroke-width=.8 opacity=.6 />
<g class=ts><path d="M60 15L23 18V31" stroke=#f7b500 stroke-width=1.6 fill=none /><path d="M19.5 30h7l1.5 12q-5 2-10 0z" fill=#ffc93c stroke=#d79600 stroke-width=.7 /></g><circle cx=60 cy=15 r=2.4 fill=#ffc93c /></g>
</g>
<g class=sp fill=#ffc93c font-size=16><text x=2 y=20>★</text><text x=100 y=16>★</text><text x=104 y=60>✦</text></g></svg>`;
  document.body.appendChild(el);

  let msg = '', lang = 'ar', act = false, tm;
  const pl = el.querySelector('#pl'), ow = el.querySelector('.ow');
  document.addEventListener('pointerdown', e => {
    act = true;
    try {
      const r = ow.getBoundingClientRect();
      const dx = Math.max(-1, Math.min(1, (e.clientX - (r.left + r.width / 2)) / 150)) * 4;
      const dy = Math.max(-1, Math.min(1, (e.clientY - (r.top + r.height / 2)) / 150)) * 3;
      pl.setAttribute('transform', `translate(${dx} ${dy})`);
    } catch (_) {}
  });

  window.onTalk = b => el.classList.toggle('talk', !!b);

  const GREET = [
    'أَنَا بُومِي، هَيَّا نَتَعَلَّمُ وَنَلْعَبُ مَعًا!',
    'اشْتَقْتُ إِلَيْكَ! هَلْ أَنْتَ مُسْتَعِدٌّ لِدَرْسٍ جَدِيدٍ؟',
    'يَوْمٌ رَائِعٌ لِلتَّعَلُّمِ! اضْغَطِ الْخُطْوَةَ التَّالِيَةَ وَنَبْدَأُ.',
    'كُلَّ يَوْمٍ تَتَعَلَّمُ شَيْئًا جَدِيدًا، هَيَّا نُكْمِلُ!'
  ];
  let gi = Math.floor(Math.random() * 4);

  const greet = () => {
    const hr = new Date().getHours();
    const g = hr >= 4 && hr < 12 ? 'صَبَاحُ الْخَيْرِ!' : hr < 17 ? 'أَهْلًا وَسَهْلًا!' : 'مَسَاءُ الْخَيْرِ!';
    const rest = GREET[gi++ % GREET.length], nm = (window.P && P.name) || '';
    set(g.replace('!', '') + (nm ? ' يَا ' + nm : '') + ' 👋 ' + rest);
    try {
      M.mood('proud', 1800);
      const r = el.getBoundingClientRect();
      window.BumiFX && BumiFX.burst && BumiFX.burst(r.left + r.width / 2, r.top + r.height / 3, 14);
    } catch (_) {}
    if (!(window.muted && muted())) say(g + ' ' + rest, 'ar', null, 'cheer');
  };

  const set = t => {
    msg = t;
    const b = document.querySelector('.owl-dock .owl-say');
    if (b) b.textContent = window.studentGenderText ? studentGenderText(t || '') : (t || '');
  };

  let lvT = 0;
  const bk = el.querySelector('.bk');
  const setM = v => {
    el.classList.add('lips');
    bk && bk.style.setProperty('--m', (1 - 0.55 * Math.min(1, v)).toFixed(3));
    clearTimeout(lvT);
    lvT = setTimeout(() => {
      el.classList.remove('lips');
      bk && bk.style.removeProperty('--m');
    }, 260);
  };

  const M = {
    level: v => setM(v),
    pulse() {
      setM(1);
      let k = 0;
      const f = () => {
        k++;
        setM(Math.max(0, 1 - k * 0.18));
        if (k < 6) requestAnimationFrame(f);
      };
      requestAnimationFrame(f);
    },
    mood(m, ms = 1800) {
      el.classList.remove('happy', 'oops', 'tilt', 'listen', 'explain', 'wow', 'proud', 'think');
      void el.offsetWidth;
      el.classList.add(m);
      clearTimeout(tm);
      tm = setTimeout(() => el.classList.remove(m), ms);
    },
    repeat() {
      M.mood('happy', 900);
      if (window.V === 'home') return greet();
      if (window.V === 'quiz' && window.__L) return sayList(window.__L);
      let r = null;
      try { r = window.BumiRead && BumiRead(); } catch (_) {}
      if (r && r.length) {
        const q = r.find(x => x[0] !== 'الْخِيَارَاتُ');
        if (q) set(q[0]);
        window.sayList ? sayList(r) : say(r[0][0], r[0][1]);
        return;
      }
      if (msg) say(msg, lang);
    },
    park() {
      document.body.appendChild(el);
      el.classList.remove('inl', 'dock');
    },
    tell(t, speak) {
      set(t);
      if (speak && act && !(window.muted && muted())) say(t, lang, null, 'happy');
    },
    view() {
      const nm = (window.P && P.name) || 'صديقي', c = window.CS, k = window.V === 'sec' ? 's-' + c : window.V;
      el.classList.toggle('on', !!window.P && window.V !== 'who');
      const pd = document.getElementById('pad');
      if (pd && window.V !== 'quiz') {
        const sl = document.createElement('div');
        sl.className = 'qo';
        (pd.previousElementSibling || pd).before(sl);
        sl.appendChild(el);
        el.classList.add('inl');
      }
      if (window.V === 'quiz') {
        const sl = document.getElementById('qo');
        if (sl) { sl.appendChild(el); el.classList.add('inl'); }
        set('');
        return;
      }
      const T = {
        setup: 'أَهْلًا! اكْتُبِ اسْمَكَ، وَاخْتَرْ عُمْرَكَ، ثُمَّ اضْغَطِ ابْدَأْ.',
        home: `أَهْلًا ${nm}! اضْغَطْ «الخُطْوَةُ التَّالِيَةُ» لِنَبْدَأَ، أَوِ اخْتَرْ أَكَادِيمِيَّةً.`,
        lesson: 'اضْغَطْ عَلَى كُلِّ بِطَاقَةٍ لِتَسْمَعَ النُّطْقَ الصَّحِيحَ، ثُمَّ ابْدَأِ الِاخْتِبَارَ.',
        's-les': 'اخْتَرْ دَرْسًا مِنْ دُرُوسِ اللُّغَتَيْنِ. الدُّرُوسُ الْمَفْتُوحَةُ تَظْهَرُ بِوُضُوحٍ.',
        's-ar': 'هَذِهِ أَكَادِيمِيَّةُ اللُّغَةِ الْعَرَبِيَّةِ: مَخَارِجُ وَحُرُوفٌ وَقَوَاعِدُ وَقِرَاءَةٌ.',
        's-en': 'Welcome to the English Academy! Letters, Phonics, Reading & Grammar.',
        's-games': 'اخْتَرْ لُعْبَةً تَعْلِيمِيَّةً مُمْتِعَةً لِلْعَرَبِيَّةِ أَوِ الْإِنْجِلِيزِيَّةِ.',
        's-ach': 'هُنَا نُجُومُكَ وَشَارَاتُكَ وَمُسْتَوَى تَقَدُّمِكَ! أَحْسَنْتَ!',
        's-set': 'لَوْحَةُ وَلِيِّ الْأَمْرِ وَمُتَابَعَةِ التَّقَدُّمِ وَالنَّتَائِجِ.',
        exam: 'اخْتَرِ اللُّغَةَ وَالْمُسْتَوَى لِتَبْدَأَ الِاخْتِبَارَ التَّقْيِيمِيَّ.',
        cert: 'مُبَارَكٌ! هَذِهِ شَهَادَةُ إِتْقَانِكَ.',
        fin: ''
      };
      if (!el.classList.contains('inl') && window.P && window.V !== 'who' && window.V !== 'setup') {
        const A = document.getElementById('app');
        if (A) {
          let d = A.querySelector(':scope>.owl-dock');
          if (!d) {
            d = document.createElement('div');
            d.className = 'owl-dock';
            d.innerHTML = '<p class=owl-say aria-live=polite onclick="MC.repeat()" title="اضغط لتسمع"></p>';
            const first = A.firstElementChild, skip = first && first.matches && first.matches('button.link,.qh');
            skip ? first.after(d) : A.prepend(d);
          }
          d.prepend(el);
          el.classList.add('inl', 'dock');
        }
      }
      const ctxT = (() => {
        try {
          const h2 = document.querySelector('#app h2');
          const sameL = h2 && window.cur && cur.n && h2.textContent.replace(/[\u064B-\u0652\u0670]/g, '').includes(String(cur.n).replace(/[\u064B-\u0652\u0670]/g, ''));
          if (k === 'lesson' && window.lessonIntro && sameL) return [lessonIntro(cur), 'lesson:' + cur.id];
          if (window.BumiContext) { const r = BumiContext(); if (r) return r; }
        } catch (_) {}
        return null;
      })();
      const t = ctxT ? ctxT[0] : T[k];
      if (t == null) return;
      set(window.studentGenderText ? studentGenderText(t) : t);
    }
  };
  return M;
})();

const ohm = window.h;
if (typeof ohm === 'function') {
  window.h = x => {
    MC.park();
    ohm(x);
    try { MC.view(); } catch (_) {}
  };
}

const orc = window.rec;
if (typeof orc === 'function') {
  window.rec = function (x, ok, v) {
    orc(x, ok, v);
    MC.mood(ok ? 'happy' : 'oops', 1600);
  };
}

function goNext() {
  if (typeof window.goNextLesson === 'function') return goNextLesson();
  const c = window.coach && coach();
  c ? lesson(c.u.id) : home();
}

try { MC.view(); } catch (_) {}

(() => {
  'use strict';
  const AD = '٠١٢٣٤٥٦٧٨٩', D = n => String(n).replace(/\d/g, d => AD[d]);
  const esc = t => String(t).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const PER = 25;

  function days() {
    const t = new Date().toDateString(), y = new Date(Date.now() - 864e5).toDateString();
    const d = P.days = P.days || { n: 0, last: '' };
    if (d.last !== t) {
      d.n = d.last === y ? d.n + 1 : 1;
      d.last = t;
      try { window.save && save(); } catch (_) {}
    }
    return d.n;
  }

  function card() {
    if (!window.P) return '';
    const st = P.star || 0, lv = Math.floor(st / PER) + 1, pc = Math.round((st % PER) / PER * 100), f = P.gender === 'female';
    let bd = 0;
    try { bd = window.earnedBadges ? earnedBadges().length : Object.keys(P.badges || {}).length; } catch (_) {}
    const dn = Object.keys(P.done || {}).length, dy = days();
    return `<button class="owl-me${window.V === 'home' ? '' : ' mini'}" onclick="sec('ach')" aria-label="إنجازاتي">
      <span class=om-av>${f ? '👧' : '👦'}</span>
      <span class=om-b><b class=om-n>${esc(P.name || 'صديقي')}</b>
        <span class=om-lv><span>المستوى ${D(lv)}</span><i class=om-bar><i style="width:${Math.max(4, pc)}%"></i></i></span>
      </span>
      <span class=om-ch>
        <span>⭐ <b>${D(st)}</b><small>نقطة</small></span>
        <span>🏅 <b>${D(bd)}</b><small>شارة</small></span>
        <span>📚 <b>${D(dn)}</b><small>درس</small></span>
        <span>🔥 <b>${D(dy)}</b><small>${dy > 1 ? 'أيام' : 'يوم'}</small></span>
      </span>
    </button>`;
  }

  function paint() {
    const d = document.querySelector('#app>.owl-dock');
    if (!d || !window.P) return;
    const c = d.querySelector('.owl-me');
    const n = document.createElement('div');
    n.innerHTML = card();
    const x = n.firstElementChild;
    if (!x) return;
    c ? c.replaceWith(x) : d.appendChild(x);
  }

  const ov = MC.view;
  MC.view = function () { const r = ov.apply(this, arguments); try { paint(); } catch (_) {} return r; };
  MC.stats = paint;
  document.addEventListener('mind-answer', () => { try { paint(); } catch (_) {} });
  try { paint(); } catch (_) {}
})();

window.BumiRead = (() => {
  'use strict';
  const AR = /[؀-ۿ]/, LA = /[A-Za-z]/, EMO = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}\u{1F1E6}-\u{1F1FF}]/gu;
  const CNT = /[\d٠-٩]+\s*(?:مِنْ|من|\/|of)\s*[\d٠-٩]+/;
  const OPT = '.opt,[data-ok],.vq-opts button,.practice-options button,.ch button,.choices button,.mcol button';
  const SKIP = 'button,a,select,option,script,style,textarea,.owl-dock,.owl-me,#tb,.link,[aria-hidden="true"],.speed-top,.h-hearts,.practice-count,.lvb,.lv-badge,.qo,#qo,svg,canvas';
  const hidden = e => {
    for (let x = e; x && x.nodeType === 1; x = x.parentElement) {
      if (x.hidden) return true;
      try { if (getComputedStyle(x).display === 'none') return true; } catch (_) {}
    }
    return false;
  };
  const clean = t => String(t || '').replace(EMO, ' ').replace(/[❓❔⭐★☆🔊]/g, ' ').replace(/_{2,}/g, ' … ').replace(/\s+/g, ' ').trim();
  const has = t => /[\p{L}\p{N}]/u.test(t);
  const langOf = t => AR.test(t) ? 'ar' : LA.test(t) ? 'en' : 'ar';
  const blockOf = n => n.parentElement.closest('p,h1,h2,h3,h4,li,label,td,.q,.bub,div,section') || n.parentElement;

  return function () {
    const app = document.getElementById('app');
    if (!app || /^(home|setup|who)$/.test(window.V)) return null;
    const opts = [...app.querySelectorAll(OPT)].filter(b => !b.closest('.owl-dock') && !hidden(b));
    const blocks = [], seen = new Map();
    let counter = false, ask = false;
    const w = document.createTreeWalker(app, NodeFilter.SHOW_TEXT);
    let n;
    while ((n = w.nextNode())) {
      const p = n.parentElement;
      if (!p || p.closest(SKIP) || hidden(p)) continue;
      const raw = n.nodeValue.replace(/\s+/g, ' ');
      if (!raw.trim()) continue;
      const b = blockOf(n);
      if (!seen.has(b)) { seen.set(b, blocks.length); blocks.push({ b, t: '' }); }
      blocks[seen.get(b)].t += raw;
    }
    const out = [];
    for (const x of blocks) {
      let t0 = x.t.replace(/\s+/g, ' ').trim();
      const sg = t0.split(/\s*[·•|]\s*/);
      const kp = sg.filter(g => !(CNT.test(g) && g.length < 40) && !/^[\s⭐★☆✅⏱️\d\u0660-\u0669+]*$/.test(g));
      if (kp.length < sg.length && sg.some(g => CNT.test(g))) counter = true;
      t0 = kp.join('. ');
      if (x.b.matches('.bub') && /❓|[؟?]/.test(x.t)) ask = true;
      const t = clean(t0);
      if (!has(t)) continue;
      if (t.replace(/[\s.،·]/g, '').length <= 2 && !x.b.matches('.q,.bub,h1,h2,h3')) continue;
      out.push(t.slice(0, 260));
    }
    const typ = app.querySelector('#ty,input[type=text]:not([hidden]),.practice-input');
    const ans = opts.some(b => b.hasAttribute('data-ok')) || (opts.length >= 2 && opts.length <= 6);
    if (!(counter || ans || typ || ask)) return null;

    const L = [];
    const push = (t, l) => {
      t = t.replace(/[.،,:;\s]+$/, '');
      if (!t) return;
      const last = L[L.length - 1];
      if (last && last[1] === l && (last[0] + t).length < 240) last[0] += '. ' + t;
      else L.push([t, l]);
    };
    [...new Set(out)].slice(0, 6).forEach(t => push(t, langOf(t)));

    for (const b of app.querySelectorAll('button[onclick*="say("],[data-say]')) {
      if (b.closest('.owl-dock') || hidden(b)) continue;
      const tx = b.textContent || '';
      if (!/🔊|اسمع|Listen/i.test(tx) || /السؤال/.test(tx)) continue;
      const m = (b.getAttribute('onclick') || '').match(/say\(\s*'((?:[^'\\]|\\.)*)'\s*,\s*'(ar|en)'/);
      if (m) { L.push([m[1].replace(/\\'/g, "'"), m[2]]); break; }
      if (b.dataset.say) { L.push([b.dataset.say, b.dataset.l || 'en']); break; }
    }

    const ot = opts.map(b => clean(b.textContent)).filter(has);
    if (ot.length >= 2 && ot.length <= 6 && ot.length === opts.length && ot.every(t => t.length <= 40)) {
      L.push(['الْخِيَارَاتُ', 'ar']);
      ot.forEach(t => L.push([t, langOf(t)]));
    }
    return L.length ? L : null;
  };
})();
