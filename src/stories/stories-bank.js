/* /src/stories/stories-bank.js — المكتبة المتدرّجة في عالم القصص مع شاشة تحميل هيكلية (Skeleton) */
(() => {
  'use strict';
  const FILE = 'data/stories-bank.json?v=8';
  let DATA = null, LOAD = null;
  const load = () => DATA ? Promise.resolve(DATA) : (LOAD || (LOAD = fetch(FILE).then(r => r.json()).then(j => (DATA = j)).catch(e => { LOAD = null; throw e; })));
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const shuf = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
  const all = () => DATA ? DATA.stages.flatMap(g => g.stories) : [];
  const find = id => all().find(s => s.id === id);
  const best = id => ((window.P && P.stories) || {})[id];
  const tb = id => ((window.P && P.stories) || {})['T:' + id];
  const stars = b => b == null ? '' : '⭐'.repeat(b) + '☆'.repeat(3 - b);
  const AD = '٠١٢٣٤٥٦٧٨٩', D = n => String(n).replace(/\d/g, d => AD[d]);
  const NS = n => n === 1 ? 'قِصَّةٌ وَاحِدَةٌ' : n === 2 ? 'قِصَّتَانِ' : n % 100 >= 3 && n % 100 <= 10 ? D(n) + ' قِصَص' : D(n) + ' قِصَّةً';
  const GT = t => window.studentGenderText ? studentGenderText(t) : t;
  const say1 = (t, l, cb) => { try { if (window.muted && muted()) { cb && cb(); return; } say(t, l || 'ar', cb); } catch (_) {} };
  const pic = (s, n) => s.img ? `<img class=sb-photo src="${esc(s.img)}" alt="${esc(s.alt)}">` : `<span class=sb-scene aria-label="${esc(s.alt)}">${s.sc.slice(0, n || 4).map((e, i) => `<i style="--k:${i}">${e}</i>`).join('')}</span>`;

  const skelLibrary = () => window.Skeleton && Skeleton.stories ? Skeleton.stories() : `<div class=skel-wrap><div class=skel-grid>${Array.from({ length: 6 }, () => '<div class=skel-card><div class="skel-bar skel-w60"></div><div class="skel-bar skel-w80"></div></div>').join('')}</div></div>`;

  const LV = [
    { lv: ['Pre-A1', 'A1'], ar: 'الْمُبْتَدِئُ', en: 'Beginner', d: 'كَلِمَاتٌ وَجُمَلٌ بَسِيطَةٌ مَعَ صُوَرٍ مُسَاعِدَةٍ', ic: '🔤' },
    { lv: ['A2'], ar: 'الْمُبْتَدِئُ الْمُتَقَدِّمُ', en: 'High Beginner', d: 'قِصَصٌ أَطْوَلُ بِقَلِيلٍ وَمُفْرَدَاتٌ جَدِيدَةٌ', ic: '📚' },
    { lv: ['B1'], ar: 'الْمُتَوَسِّطُ', en: 'Intermediate', d: 'قِصَصٌ مُتَنَوِّعَةٌ مَعَ فَهْمٍ أَعْمَقَ', ic: '🏆' },
    { lv: ['B2'], ar: 'الْمُتَقَدِّمُ', en: 'Advanced', d: 'قِصَصٌ عَمِيقَةٌ مَعَ تَحْلِيلٍ وَاسْتِنْتَاجٍ', ic: '🏅' },
    { lv: ['C1', 'C2'], ar: 'الْمُتْقِنُ', en: 'Mastery', d: 'قِصَصٌ مُلْهِمَةٌ مَعَ أَفْكَارٍ عَمِيقَةٍ', ic: '👑' }
  ];
  const oStories = window.stories;
  function tabs(cur) {
    return `<div class=course-filters><button class="${cur === 'lib' ? 'on' : ''}" onclick="stories('lib')">📚 المكتبة المتدرّجة</button><button class="${cur === 'ar' ? 'on' : ''}" onclick="stories('ar')">📖 قصص عربية</button><button class="${cur === 'en' ? 'on' : ''}" onclick="stories('en')">📘 English stories</button><button class="${cur === 'talk' ? 'on' : ''}" onclick="stories('talk')">💬 Conversations</button></div>`;
  }

  window.stories = function (tab, lang) {
    if (tab && tab !== 'lib') {
      const r = oStories.apply(this, arguments);
      try {
        const f = document.querySelector('#app .stories .course-filters');
        if (f) f.outerHTML = tabs(tab);
      } catch (_) {}
      return r;
    }
    window.V = 'sec';
    window.CS = 'stories';
    lang = lang || 'all';
    h(`<section class="sec stories sb-lib"><button class=link onclick="goBack()">← رجوع</button><div class=sb-banner><img class=sb-owl src="img/stories/_owl-reading.webp" alt=""><div class=sb-sign><h2>قِصَصُ الْبُومَةِ التَّعْلِيمِيَّةِ الذَّكِيَّةِ</h2><p>رِحْلَةٌ مُمْتِعَةٌ مِنَ الْقِرَاءَةِ إِلَى الْإِتْقَانِ ⭐</p></div><div class=sb-cloud><b>اِقْرَأْ . اِفْهَمْ . تَعَلَّمْ . حَقِّقْ أَهْدَافَكَ</b><small dir=ltr>Read • Understand • Learn • Achieve</small></div></div>${tabs('lib')}<div id=sb-body>${skelLibrary()}</div></section>`);
    load().then(() => {
      const sec = document.querySelector('.sb-lib'), host = document.getElementById('sb-body');
      if (!sec || !host) return;
      const L = s => lang === 'all' || s.l === lang;
      const done = all().filter(s => best(s.id) != null).length, next = all().find(s => L(s) && best(s.id) == null);
      let html = `<div class=sb-langs>${[['all', 'الكل'], ['ar', '📖 عربي'], ['en', '📘 English']].map(([k, t]) => `<button class="${lang === k ? 'on' : ''}" onclick="stories('lib','${k}')">${t}</button>`).join('')}</div>
        <p class=mut>${NS(all().length)} · المقروءة ${D(done)}. ${window.P && P.gender === 'female' ? 'اِبْدَئِي' : 'اِبْدَأْ'} مِنَ الْأَعْلَى، وَالْقِصَّةُ التَّالِيَةُ عَلَيْهَا ▶.</p>`;
      LV.forEach((v, gi) => {
        const S0 = all().filter(s => L(s) && v.lv.includes(s.lv));
        if (!S0.length) return;
        const dn = S0.filter(s => best(s.id) != null).length;
        html += `<details class="lesson-menu sb-stage sb-row sb-r${gi + 1}"${S0.includes(next) ? ' open' : ''}><summary><span class=sb-num>${D(gi + 1)}</span><span class=sb-rt><b>${v.ar}</b><em dir=ltr>${v.en}</em><small>${v.d}</small><small class=sb-st>${'⭐'.repeat(gi + 1)} · ${NS(S0.length)} · المقروءة ${D(dn)}</small></span><span class=sb-ri>${v.ic}</span><i>⌄</i></summary>
          <div class="story-grid sb-grid">${S0.map(s => `<button class="story-card sb-card${s === next ? ' sb-next' : ''}" onclick="sbStory('${s.id}')">${pic(s, 3)}<b dir=auto>${esc(s.l === 'en' && s.ta ? s.ta : s.t)}</b>${(s.l === 'en' ? s.t : s.tt) ? `<span class=sb-ct dir=ltr>${esc(s.l === 'en' ? s.t : s.tt)}</span>` : ''}<small><em class=sb-lang>${s.l === 'en' ? 'English' : 'عربي'}</em> <em class=sb-lv>${esc(s.lv)}</em> ${best(s.id) != null ? stars(best(s.id)) : s === next ? '▶ التالية' : ''}${tb(s.id) != null ? ` <em class=sb-lv>📝 ${D(tb(s.id))}٪</em>` : ''}</small></button>`).join('')}</div></details>`;
      });
      host.innerHTML = html;
    }).catch(() => {
      const m = document.getElementById('sb-body');
      if (m) m.innerHTML = '<p class=mut>تعذّر تحميل المكتبة. تأكد من الاتصال ثم حاول مرة أخرى.</p>';
    });
  };

  window.sbStory = function (id) {
    if (!DATA) h(`<section class="sec sb-story">${skelLibrary()}</section>`);
    load().then(() => {
      const s = find(id);
      if (!s) return stories('lib');
      window.V = 'lesson';
      window.CS = 'stories';
      const en = s.l === 'en', dir = en ? 'ltr' : 'rtl';
      h(`<section class="sec story sb-story"><button class=link onclick="stories('lib')">← المكتبة</button>
        <div class=sb-hero>${pic(s)}<h2 dir=auto>${esc(s.t)}</h2>${s.tt ? `<p class=sb-tt dir=ltr>${esc(s.tt)}</p>` : ''}${s.ta ? `<p class=sb-tt dir=rtl>${esc(s.ta)}</p>` : ''}<small><em class=sb-lang>${en ? 'English' : 'عربي'}</em> <em class=sb-lv>${esc(s.lv)}</em> ${esc(s.stage)}</small></div>
        <div class=story-text dir=${dir}>${s.s.map((t, i) => `<span class=ss data-i=${i} onclick="sbSay('${id}',${i})">${esc(t)}</span>`).join(' ')}</div>
        <p class=mut>${window.P && P.gender === 'female' ? 'اِضْغَطِي عَلَى أَيِّ جُمْلَةٍ لِتَسْمَعِيهَا.' : 'اِضْغَطْ عَلَى أَيِّ جُمْلَةٍ لِتَسْمَعَهَا.'}</p>
        ${s.m ? `<p class=sb-moral dir=auto>🌟 الْعِبْرَةُ: ${esc(s.m)}</p>` : ''}
        ${s.tr && s.tr.length ? `<details class=sb-tr><summary>🇬🇧 الترجمة الإنجليزية</summary><div class=story-text dir=ltr>${s.tr.map((t, i) => `<span class=ss onclick="sbSayTr('${id}',${i})">${esc(t)}</span>`).join(' ')}</div></details>` : ''}
        <div class=row style="gap:8px;flex-wrap:wrap;margin-top:8px">
          <button class=alt onclick="sbRead('${id}')">🔊 اسمع القصة كاملة</button>
          <button class=alt onclick="say.togglePause()">⏸️ إيقاف / استكمال</button>
          <button class=alt onclick="say.replay()">🔁 إعادة</button>
        </div>
        ${s.v.length ? `<h3>📒 كلمات القصة</h3><div class=sb-vocab>${s.v.map((w, i) => `<button class=sb-w onclick="sbWord('${id}',${i})"><b dir=auto>${esc(w[0])}</b><small dir=auto>${esc(w[1])}</small></button>`).join('')}</div>` : ''}
        <button class=big onclick="sbQuiz('${id}')">❓ أجب عن الأسئلة (${D(s.x.length)})</button>${s.T ? `<button class="big sb-testbtn" onclick="sbTest('${id}')">📝 الاختبار الشامل (${D(s.T.length)} سؤالًا)${tb(s.id) != null ? ` · ${D(tb(s.id))}٪` : ''}</button>` : ''}</section>`);
    });
  };

  const mark = i => document.querySelectorAll('.sb-story .ss').forEach(e => e.classList.toggle('now', +e.dataset.i === i));
  window.sbSayTr = (id, i) => { const s = find(id); if (s && s.tr && s.tr[i]) say1(s.tr[i], 'en'); };
  window.sbSay = (id, i) => { const s = find(id); if (!s) return; mark(i); say1(s.s[i], s.l, () => { if (say.state && say.state() !== 'paused') mark(-1); }); };
  window.sbRead = id => {
    const s = find(id);
    if (!s) return;
    let i = 0;
    const nx = () => {
      if (i >= s.s.length || !document.querySelector('.sb-story')) { mark(-1); return; }
      const k = i++;
      mark(k);
      say1(s.s[k], s.l, () => {
        const t = say.tk;
        setTimeout(() => {
          if (say.tk === t && (!say.state || say.state() !== 'paused')) nx();
        }, 200);
      });
    };
    nx();
  };
  window.sbWord = (id, i) => { const s = find(id), w = s && s.v[i]; if (!w) return; (window.sayList || (L => say(L[0][0], L[0][1])))([[w[0], s.l], [w[1], /[؀-ۿ]/.test(w[1]) ? 'ar' : 'en']]); };

  let Q = null;
  const nrm = t => String(t || '').toLowerCase().normalize('NFKC').replace(/[ً-ْٰـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/ى/g, 'ي').replace(/[^\p{L}\p{N}\s]/gu, ' ').replace(/\s+/g, ' ').trim();
  const STOP = new Set('a an the to of in on at is are was it and و في على من الى عن ان ال ثم'.split(' '));
  const toks = t => nrm(t).split(' ').map(w => w.replace(/^ال(?=..)/, '').replace(/^و(?=...)/, '')).filter(w => w && !STOP.has(w));
  function close(given, q) {
    const g = new Set(toks(given)), cands = [q.a, ...(q.acc || [])];
    return cands.some(a => {
      const t = toks(a);
      if (!t.length) return false;
      if (nrm(given) === nrm(a)) return true;
      const hit = t.filter(w => g.has(w) || [...g].some(x => x.length > 3 && (x.startsWith(w.slice(0, 4)) || w.startsWith(x.slice(0, 4))))).length;
      return hit / t.length >= (t.length > 6 ? 0.4 : 0.6);
    });
  }

  const SECIC = { 'فهم': '🧠', 'صح أو خطأ': '✅', 'مفردات': '📒', 'ترتيب': '🔢', 'مفتوح': '✍️' };
  window.sbTest = function (id) { load().then(() => { const s = find(id); if (!s || !s.T) return sbStory(id); Q = { s, i: 0, ok: 0, list: s.T.map(x => ({ ...x })), n: s.T.length, test: true, t0: Date.now() }; show(); }); };
  window.sbQuiz = function (id) { load().then(() => { const s = find(id); if (!s) return stories('lib'); Q = { s, i: 0, ok: 0, list: s.x.map(x => ({ ...x })), n: s.x.length }; show(); }); };

  function show() {
    const { s, i, list } = Q;
    if (i >= list.length) return finish();
    const q = list[i], en = s.l === 'en', dir = en ? 'ltr' : 'rtl';
    window.V = 'lesson';
    Q.done = false;
    const body = q.t === 'multiple_choice' ? `<div class="grid sb-opts">${shuf(q.o).map(o => `<button class=opt dir=${dir} data-ok="${o === q.a ? 1 : 0}" onclick="sbAns(this)">${esc(o)}</button>`).join('')}</div>`
      : q.t === 'true_false' ? `<div class="grid sb-opts sb-tf"><button class=opt data-ok="${q.a ? 1 : 0}" onclick="sbAns(this)">✅ ${en ? 'True — صَحّ' : 'صَحّ'}</button><button class=opt data-ok="${q.a ? 0 : 1}" onclick="sbAns(this)">❌ ${en ? 'False — خَطَأ' : 'خَطَأ'}</button></div>`
      : q.t === 'ordering' ? `<div id=sb-line class=bq-line dir=${dir}><small>اضغط الأحداث بالترتيب الصحيح</small></div><div id=sb-pool class="bq-pool sb-pool" dir=${dir}>${shuf(q.o.map((x, k) => k)).map(k => `<button class="bq-tile sb-tile" data-k="${k}" onclick="sbTile(this)">${esc(q.o[k])}</button>`).join('')}</div><div class=sb-type><button class=big id=sb-chk disabled onclick="sbOrder()">تحقّق ✓</button><button class="link bq-undo" onclick="sbUndo()">↩️ تراجع</button></div>`
      : q.t === 'inference' || q.t === 'open' ? `<div class=sb-type><p class=sb-hintq>${q.t === 'open' ? '✍️ سُؤَالٌ مَفْتُوحٌ: جَوَابٌ قَصِيرٌ مِنَ الْقِصَّةِ.' : '🧠 سُؤَالُ اسْتِنْتَاجٍ: الْجَوَابُ لَيْسَ مَكْتُوبًا فِي الْقِصَّةِ حَرْفِيًّا.'}</p><textarea id=sb-in class=bq-in dir=auto rows=3 autocomplete=off></textarea><button class=big onclick="sbCheck()">تحقّق ✓</button></div>`
      : `<div class=sb-type><input id=sb-in class=bq-in dir=${dir} autocomplete=off placeholder="${en ? 'Write your answer…' : GT('اكْتُبْ إِجَابَتَكَ…')}" onkeydown="if(event.key==='Enter')sbCheck()"><button class=big onclick="sbCheck()">تحقّق ✓</button></div>`;
    h(`<section class="sec sb-quiz"><button class=link onclick="sbStory('${s.id}')">← القصة</button><div class=bq-top><b dir=auto>${esc(s.t)}</b><small>سؤال ${D(Math.min(i + 1, list.length))} من ${D(list.length)}</small></div>
      <div class=bq-dots>${list.map((x, k) => `<i class="${k < i ? (x._ok ? 'ok' : 'no') : k === i ? 'cur' : ''}"></i>`).join('')}</div>
      ${q.sec ? `<span class=sb-sec>${SECIC[q.sec] || ''} ${esc(q.sec)}</span>` : ''}${q._rt ? `<p class=bq-retry>🔁 فُرْصَةٌ ثَانِيَةٌ لِهَذَا السُّؤَالِ</p>` : ''}
      <div class="q bq-text" dir=${dir}>${esc(q.t === 'true_false' && !en ? 'صَحٌّ أَمْ خَطَأٌ: ' + q.q : q.q)}</div>${q.qar ? `<p class=sb-qar>🇸🇦 ${esc(q.qar)}</p>` : ''}
      <div class=bq-tools><button class=alt onclick="sbQSay()">🔊 اسمع السؤال</button><button class=alt onclick="sbStory('${s.id}')">📖 ارجع إلى القصة</button></div>
      ${body}<div id=sb-fb class=bq-fb hidden></div></section>`);
    sbQSay();
  }

  window.sbQSay = () => { const q = Q && Q.list[Q.i]; if (!q) return; const en = Q.s.l === 'en'; (window.sayList || (L => say(L[0][0], L[0][1])))([[q.t === 'true_false' && !en ? 'صَحٌّ أَمْ خَطَأٌ: ' + q.q : q.q, Q.s.l], ...(q.qar ? [[q.qar, 'ar']] : [])]); };
  window.sbAns = b => { if (!Q || Q.done) return; const ok = b.dataset.ok === '1'; document.querySelectorAll('.sb-opts .opt').forEach(x => { x.disabled = true; if (x.dataset.ok === '1') x.classList.add('ok'); }); if (!ok) b.classList.add('no'); result(ok); };
  window.sbTile = b => { if (!Q || Q.done) return; const ln = document.getElementById('sb-line'), s = ln.querySelector('small'); if (s) s.remove(); ln.appendChild(b); b.onclick = () => sbBack(b); document.getElementById('sb-chk').disabled = !!document.querySelector('#sb-pool .sb-tile'); };
  window.sbBack = b => { if (!Q || Q.done) return; document.getElementById('sb-pool').appendChild(b); b.onclick = () => sbTile(b); document.getElementById('sb-chk').disabled = true; };
  window.sbUndo = () => { const t = [...document.querySelectorAll('#sb-line .sb-tile')].pop(); if (t) sbBack(t); };
  window.sbOrder = () => {
    if (!Q || Q.done) return;
    const q = Q.list[Q.i], got = [...document.querySelectorAll('#sb-line .sb-tile')].map(b => q.o[+b.dataset.k]), ok = got.join('|') === q.a.join('|');
    document.getElementById('sb-line').classList.add(ok ? 'ok' : 'no');
    document.querySelectorAll('.sb-tile,#sb-chk').forEach(x => { x.disabled = true; });
    result(ok, false, true);
  };
  window.sbSelf = yes => {
    if (!Q) return;
    const q = Q.list[Q.i], box = document.getElementById('sb-self');
    if (box) box.remove();
    if (yes) {
      q._ok = true;
      if (!q._rt) Q.ok++;
      const k = Q.list.findIndex((x, j) => j > Q.i && x._rt && x.id === q.id);
      if (k >= 0) Q.list.splice(k, 1);
      const fb = document.getElementById('sb-fb');
      fb.className = 'bq-fb good';
      fb.querySelector('b').textContent = '✅ ' + GT('أَحْسَنْتَ!') + ' الْمُهِمُّ فَهْمُ الْمَعْنَى.';
      try { HurufiSound.play('correct'); } catch (_) {}
      const d = document.querySelector('.bq-dots i.cur');
      if (d) d.className = 'ok';
    }
  };
  window.sbCheck = () => { if (!Q || Q.done) return; const q = Q.list[Q.i], inp = document.getElementById('sb-in'); if (!inp.value.trim()) return inp.focus(); inp.disabled = true; const ok = close(inp.value, q); inp.classList.add(ok ? 'ok' : 'no'); result(ok, true); };

  function result(ok, typed, ord) {
    Q.done = true;
    const q = Q.list[Q.i], s = Q.s, en = s.l === 'en';
    q._ok = ok;
    if (ok && !q._rt) Q.ok++;
    if (!ok && (q._rt || 0) < 1) Q.list.splice(Math.min(Q.list.length, Q.i + 3), 0, { ...q, _ok: undefined, _rt: 1 });
    try { window.Mind && Mind.record({ ok, subject: s.l === 'en' ? 'en' : 'ar', topic: 'قصص: ' + s.t, src: 'مكتبة القصص', go: `sbStory('${s.id}')` }); } catch (_) {}
    try { HurufiSound.play(ok ? 'correct' : 'wrong'); MC.mood(ok ? 'happy' : 'oops', 900); } catch (_) {}
    const ans = ord ? q.a.map((x, k) => (k + 1) + '. ' + x).join('  ') : q.t === 'true_false' ? (q.a ? (en ? 'True — صَحّ' : 'صَحّ') : (en ? 'False — خَطَأ' : 'خَطَأ')) : q.a;
    const lead = GT(ok ? (typed ? 'أَحْسَنْتَ! وَهَذِهِ إِجَابَةٌ نَمُوذَجِيَّةٌ:' : 'أَحْسَنْتَ! إِجَابَتُكَ صَحِيحَةٌ.') : 'مُحَاوَلَةٌ جَيِّدَةٌ! الْإِجَابَةُ الصَّحِيحَةُ:');
    const fb = document.getElementById('sb-fb');
    fb.hidden = false;
    fb.className = 'bq-fb ' + (ok ? 'good' : 'soft');
    fb.innerHTML = `<b>${ok ? '✅' : '💡'} ${esc(lead)}</b>${!ok || typed ? `<p class=bq-ans dir=auto>${esc(ans)}</p>` : ''}${!ok && typed ? `<div id=sb-self class=sb-self><p>هَلِ الْمَعْنَى نَفْسُهُ؟</p><button class=alt onclick="sbSelf(1)">✔ نعم، المعنى نفسه</button><button class=alt onclick="sbSelf(0)">✘ لا، سأراجع القصة</button></div>` : ''}${q.e ? `<p class=bq-e dir=auto>📘 ${esc(q.e)}</p>` : ''}<div class=bq-next><button class=big onclick="sbNext()">${Q.i + 1 < Q.list.length ? 'التالي ←' : 'النتيجة 🏁'}</button></div>`;
    try { if (!window.muted || !muted()) (window.sayList || (() => {}))([[lead, 'ar'], ...(!ok || typed ? [[String(ans).replace(/ — .*/, ''), q.t === 'true_false' && !en ? 'ar' : s.l]] : []), ...(q.e ? [[q.e, /[؀-ۿ]/.test(q.e) ? 'ar' : 'en']] : [])]); } catch (_) {}
  }
  window.sbNext = () => { if (!Q) return; try { say.stop(); } catch (_) {} Q.i++; show(); };

  function finish() {
    if (Q.test) return assess();
    const { s, ok, n } = Q, st = ok === n ? 3 : ok >= n - 1 ? 2 : ok ? 1 : 0;
    P.stories = P.stories || {};
    P.stories[s.id] = Math.max(st, P.stories[s.id] || 0);
    P.star = (+P.star || 0) + ok;
    try { save(); } catch (_) {}
    const L = all(), nx = L[L.indexOf(s) + 1];
    try { HurufiSound.play(st >= 2 ? 'finish' : 'wrong'); MC.mood(st >= 2 ? 'proud' : 'happy', 1600); } catch (_) {}
    h(`<section class="sec bank-end"><div class=be-hero><h1>${st === 3 ? '🏆' : st === 2 ? '🌟' : '💪'}</h1><h2>${D(ok)} من ${D(n)} ${stars(st)}</h2><p>+${D(ok)} ⭐</p></div>
      ${nx ? `<button class=big onclick="sbStory('${nx.id}')">▶️ القصة التالية: ${esc(nx.t)}</button>` : ''}<button class=alt onclick="sbStory('${s.id}')">📖 أعد القراءة</button><button class=alt onclick="stories('lib')">📚 المكتبة</button></section>`);
    say1(GT(st >= 2 ? 'أَحْسَنْتَ! فَهِمْتَ الْقِصَّةَ جَيِّدًا.' : 'اقْرَأِ الْقِصَّةَ مَرَّةً أُخْرَى، وَسَتَفْهَمُهَا أَكْثَرَ!'), 'ar');
    try { window.checkBadges && setTimeout(checkBadges, 900); } catch (_) {}
  }

  function assess() {
    const { s } = Q, orig = Q.list.filter(q => !q._rt), n = orig.length, ok = orig.filter(q => q._ok).length, pc = Math.round(ok / n * 100), secs = {};
    orig.forEach(q => { const x = secs[q.sec] = secs[q.sec] || [0, 0]; x[1]++; if (q._ok) x[0]++; });
    P.stories = P.stories || {};
    P.stories['T:' + s.id] = Math.max(pc, P.stories['T:' + s.id] || 0);
    const st = pc >= 90 ? 3 : pc >= 75 ? 2 : pc >= 50 ? 1 : 0;
    P.stories[s.id] = Math.max(st, P.stories[s.id] || 0);
    P.star = (+P.star || 0) + Math.round(ok / 2);
    try { save(); } catch (_) {}
    const weak = Object.entries(secs).filter(([, v]) => v[0] < v[1]).sort((a, b) => a[1][0] / a[1][1] - b[1][0] / b[1][1])[0];
    const lv = s.lv, R = pc >= 90 ? ['🏆', 'مُمْتَازٌ', `مُتَمَكِّنٌ مِنْ قِصَصِ الْمُسْتَوَى ${lv}. الِانْتِقَالُ إِلَى الْقِصَّةِ التَّالِيَةِ.`]
      : pc >= 75 ? ['🌟', 'جَيِّدٌ جِدًّا', `فَهْمٌ جَيِّدٌ لِقِصَّةٍ مِنَ الْمُسْتَوَى ${lv}. مُرَاجَعَةُ الْقِسْمِ الْأَضْعَفِ تَجْعَلُهُ مُمْتَازًا.`]
      : pc >= 50 ? ['👍', 'جَيِّدٌ', `يَحْتَاجُ إِلَى تَدْرِيبٍ: قِرَاءَةُ الْقِصَّةِ مَرَّةً أُخْرَى مَعَ الِاسْتِمَاعِ، ثُمَّ إِعَادَةُ الِاخْتِبَارِ.`]
      : ['💪', 'يَحْتَاجُ إِلَى دَعْمٍ', `الْأَفْضَلُ الِاسْتِمَاعُ إِلَى الْقِصَّةِ جُمْلَةً جُمْلَةً، وَمُرَاجَعَةُ كَلِمَاتِهَا، ثُمَّ إِعَادَةُ الِاخْتِبَارِ.`];
    const L = all(), nx = L[L.indexOf(s) + 1], secs5 = ['فهم', 'صح أو خطأ', 'مفردات', 'ترتيب', 'مفتوح'].filter(k => secs[k]);
    try { HurufiSound.play(pc >= 75 ? 'finish' : 'wrong'); MC.mood(pc >= 75 ? 'proud' : 'happy', 1600); } catch (_) {}
    h(`<section class="sec bank-end sb-assess"><div class=be-hero><h1>${R[0]}</h1><h2>${D(pc)}٪ · ${R[1]}</h2><p>${D(ok)} مِنْ ${D(n)} · ${esc(s.t)} <em class=sb-lv>${esc(lv)}</em></p></div>
      <div class=sb-secs>${secs5.map(k => { const v = secs[k], p = Math.round(v[0] / v[1] * 100); return `<div class=sb-srow><span>${SECIC[k]} ${k}</span><i><b style="width:${p}%"></b></i><em>${D(v[0])} مِنْ ${D(v[1])}</em></div>`; }).join('')}</div>
      <p class=be-sw>📋 <b>التقييم:</b> ${R[2]}${weak && pc < 90 ? ` <br>🌱 <b>يحتاج تدريبًا:</b> ${SECIC[weak[0]]} ${weak[0]}.` : ''}</p>
      <div class=be-acts>${pc >= 75 && nx ? `<button class=big onclick="sbStory('${nx.id}')">▶️ القصة التالية: ${esc(nx.t)}</button>` : ''}
      ${pc < 75 ? `<button class=big onclick="sbStory('${s.id}')">📖 أعد قراءة القصة</button>` : ''}<button class=alt onclick="sbTest('${s.id}')">🔁 أعد الاختبار</button><button class=alt onclick="stories('lib')">📚 المكتبة</button></div></section>`);
    say1(R[1] + '. ' + R[2], 'ar');
    try { window.checkBadges && setTimeout(checkBadges, 900); } catch (_) {}
  }

  window.Router && Router.wrapAll();
})();
