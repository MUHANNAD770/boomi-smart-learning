/* /src/parent/parent-panel.js — لوحة ولي الأمر الشاملة: التقدم، الدروس المكتملة وغير المكتملة، الاختبارات، الأخطاء، والتحكم */
(() => {
  'use strict';
  let ok1 = 0, rs = 0;
  const AD = '٠١٢٣٤٥٦٧٨٩', D = n => String(n).replace(/\d/g, d => AD[d]);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const tmTxt = t => {
    t = +t || 0;
    const h = Math.floor(t / 3600), m = Math.round((t % 3600) / 60);
    return h ? `${D(h)}:${String(m).padStart(2, '0').replace(/\d/g, d => AD[d])} س` : `${D(m)} د`;
  };

  /* مؤقّت وقت التعلّم النشط */
  let lastAct = Date.now();
  ['pointerdown', 'keydown', 'touchstart'].forEach(e => {
    document.addEventListener(e, () => { lastAct = Date.now(); }, { passive: true, capture: true });
  });
  setInterval(() => {
    try {
      if (window.P && document.visibilityState === 'visible' && Date.now() - lastAct < 60000 && window.V !== 'setup' && window.V !== 'who') {
        P.tm = (+P.tm || 0) + 15;
        if ((P.tm / 15) % 4 === 0) save();
      }
    } catch (_) {}
  }, 15000);

  /* المظهر (حسب الهاتف / فاتح / داكن) */
  const TH = [['auto', '📱', 'حسب الهاتف'], ['light', '☀️', 'فاتح'], ['dark', '🌙', 'داكن']];
  const curTheme = () => {
    try {
      const t = localStorage.getItem('ui-theme');
      return t === 'light' || t === 'dark' ? t : 'auto';
    } catch (_) { return 'auto'; }
  };
  function themeCard() {
    const c = curTheme();
    return `<div class=th-card><b>🎨 المظهر</b><div class=th-opts role=radiogroup>${TH.map(([k, i, t]) => `<button class="th-o${k === c ? ' on' : ''}" role=radio aria-checked=${k === c} onclick="setTheme('${k}')"><span>${i}</span>${t}</button>`).join('')}</div></div>`;
  }
  const syncMeta = () => {
    const m = document.querySelector('meta[name=theme-color]');
    const d = document.documentElement.dataset.theme === 'dark' || (!document.documentElement.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    if (m) m.content = d ? '#15163a' : '#6a4cf0';
  };
  window.setTheme = function (k) {
    try { k === 'auto' ? localStorage.removeItem('ui-theme') : localStorage.setItem('ui-theme', k); } catch (_) {}
    const de = document.documentElement;
    if (k === 'auto') delete de.dataset.theme;
    else de.dataset.theme = k;
    syncMeta();
    document.querySelectorAll('.th-o').forEach((b, i) => {
      const on = TH[i][0] === k;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', on);
    });
  };
  syncMeta();
  try { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', syncMeta); } catch (_) {}

  function academyProgressHTML() {
    const P0 = window.P || {};
    const done = P0.done || {}, sc = P0.sc || {};
    const byLang = lang => {
      const all = S.flatMap((st, si) => st.u.filter(u => u.l === lang).map(u => ({ ...u, stN: st.n, si })));
      const comp = all.filter(u => done[u.id]);
      const inc = all.filter(u => !done[u.id]);
      const pct = all.length ? Math.round((comp.length / all.length) * 100) : 0;
      const stageBars = S.map((st, si) => {
        const su = st.u.filter(u => u.l === lang);
        const sd = su.filter(u => done[u.id]).length;
        const sp = su.length ? Math.round((sd / su.length) * 100) : 0;
        return `<div class=pr-stbar><span>م${D(si + 1)}: ${esc(st.n)}</span><i><b style="width:${sp}%"></b></i><em>${D(sd)}/${D(su.length)}</em></div>`;
      }).join('');
      return { all, comp, inc, pct, stageBars };
    };
    const ar = byLang('ar'), en = byLang('en');
    const rowU = u => `<button class=row onclick="lesson('${u.id}')"><span>${done[u.id] ? '✅' : sc[u.id] != null ? '🔸' : '⚪'}</span><b>${esc(u.n)}</b><small>${sc[u.id] != null ? D(sc[u.id]) + '/٥' : esc(u.stN)}</small></button>`;

    return `<div class=pdash id=acad-progress>
      <h3>📚 التقدّم في الأكاديميتين (المراحل ١–٥)</h3>
      <div class=pr-acads>
        <div class="pr-ac ar"><b>🔤 اللغة العربية (${ar.pct}٪)</b><small>${D(ar.comp.length)} من ${D(ar.all.length)} درسًا مكتملًا</small>${ar.stageBars}</div>
        <div class="pr-ac en"><b>🔠 اللغة الإنجليزية (${en.pct}٪)</b><small>${D(en.comp.length)} من ${D(en.all.length)} درسًا مكتملًا</small>${en.stageBars}</div>
      </div>
      <details style="margin-top:10px">
        <summary>✅ الدروس المكتملة (${D(ar.comp.length + en.comp.length)})</summary>
        <div class=list>${[...ar.comp, ...en.comp].map(rowU).join('') || '<p class=mut>لم يكتمل درس بعد.</p>'}</div>
      </details>
      <details style="margin-top:8px">
        <summary>📌 الدروس غير المكتملة (${D(ar.inc.length + en.inc.length)})</summary>
        <div class=list>${[...ar.inc, ...en.inc].slice(0, 30).map(rowU).join('') || '<p class=mut>أكمل الطالب جميع الدروس المتاحة! 🏆</p>'}</div>
      </details>
    </div>`;
  }

  function examsAndMistakesHTML() {
    const P0 = window.P || {};
    const exams = P0.exams || {};
    const tiers = (window.ExamEngine && ExamEngine.TIERS) || [
      { id: 'beginner', name: 'مُبْتَدِئٌ', icon: '🌱', count: 8 },
      { id: 'intermediate', name: 'مُتَوَسِّطٌ', icon: '📘', count: 10 },
      { id: 'advanced', name: 'مُتَقَدِّمٌ', icon: '🚀', count: 12 },
      { id: 'master', name: 'مُتْقِنٌ', icon: '🏆', count: 14 }
    ];
    const calcLabel = l => {
      if (!window.ExamEngine || !ExamEngine.calcLevel) return '—';
      const lv = ExamEngine.calcLevel(l);
      return lv && typeof lv === 'object' ? `${lv.icon || ''} ${lv.name || lv.enName || '—'}`.trim() : String(lv || '—');
    };
    const tierRow = (lang, label) => `<div style="margin:8px 0"><b>${label} · المستوى المحسوب: <span class=exam-badge>${esc(calcLabel(lang))}</span></b>
      <div class=exam-tiers style="margin-top:6px">${tiers.map(t => {
        const e = exams[lang + '_' + t.id];
        return `<div class="exam-tier${e && e.pass ? ' done' : ''}" style="cursor:default"><span>${t.icon || t.ic || '📝'}</span><b>${t.name || t.n}</b><small>${e ? `أفضل: ${D(e.best)}٪ (${D(e.correct ?? 0)}/${D(e.total ?? t.count ?? 0)})` : 'لم يُختبر بعد'}</small></div>`;
      }).join('')}</div></div>`;

    const allM = Object.values(P0.mistakes || {});
    const unres = allM.filter(m => m && (m.n || 0) > (m.fixed || 0)).sort((a, b) => (b.n || 1) - (a.n || 1));
    const arUnres = unres.filter(m => m.l === 'ar'), enUnres = unres.filter(m => m.l === 'en');

    return `<div class=pdash id=exam-report>
      <h3>📝 نتائج الاختبارات المتدرجة ومستوى الإتقان</h3>
      ${tierRow('ar', '🔤 العربية')}
      ${tierRow('en', '🔠 الإنجليزية')}
      <button class=alt onclick="examHub()">فتح بوابة الاختبارات 🎯</button>
    </div>
    <div class=pdash id=mistakes-report>
      <h3>🩹 الأخطاء المسجّلة ونقاط التحسين</h3>
      ${unres.length ? `
        <p class=mut>يوجد ${D(unres.length)} نقطة تحتاج إلى تثبيت (${D(arUnres.length)} عربي · ${D(enUnres.length)} إنجليزي):</p>
        <ul class=plan>${unres.slice(0, 10).map(m => `<li><b>${esc(m.expected || m.k)}</b> <small>(${m.l === 'en' ? 'إنجليزي' : 'عربي'} · أخطأ ${D(m.n || 1)} مرة${m.given ? ' — كتب/اختار: ' + esc(m.given) : ''})</small></li>`).join('')}</ul>
        <div class=row style="gap:8px;flex-wrap:wrap;margin-top:8px">
          ${arUnres.length ? `<button class=big onclick="practiceMistakes('ar')">🩹 تدرّب على أخطاء العربية (${D(arUnres.length)})</button>` : ''}
          ${enUnres.length ? `<button class=big onclick="practiceMistakes('en')">🩹 تدرّب على أخطاء الإنجليزية (${D(enUnres.length)})</button>` : ''}
        </div>
      ` : '<p class=mut>لا توجد أخطاء متبقية تحتاج لمراجعة حاليًا 🌟 أحسنت!</p>'}
    </div>`;
  }

  function mindCard() {
    const M = window.Mind;
    if (!M) return '';
    const bs = M.bySubject(), w = M.weak(4), g = M.strong(3), nx = M.next();
    let errs = [];
    try { errs = (window.MindMemory && MindMemory.summary().errs) || []; } catch (_) {}
    const bars = Object.values(bs).map(x => `<li><span>${esc(x.name)}</span><i><b style="width:${M.pct(x.p)}%"></b></i><em>${M.pct(x.p)}٪</em></li>`).join('');
    const go = c => String(c || '').replace(/"/g, '&quot;');
    const body = !bars && !w.length
      ? '<p class=mc-empty>سيبدأ بومي تحليل مستوى الطالب بعد بضع إجابات في الدروس والألعاب والاختبارات.</p>'
      : `${bars ? `<ul class=mc-bars>${bars}</ul>` : ''}
         ${w.length ? `<h4>🎯 يحتاج تدريبًا</h4><div class=mc-weak>${w.map(s => `<button onclick="${go(s.go)}"${s.go ? '' : ' disabled'}><b>${esc(s.name)}</b><small>${M.pct(s.p)}٪ · ${esc(M.NAME[s.sub] || '')}</small></button>`).join('')}</div>` : ''}
         ${g.length ? `<h4>🌟 متقن</h4><p class=mc-tags>${g.map(s => `<span>${esc(s.name)}</span>`).join('')}</p>` : ''}
         ${errs.length ? `<h4>🔍 أخطاء متكررة</h4><p class=mc-tags>${errs.slice(0, 4).map(e => `<span>${esc(e.label)} ×${e.n}</span>`).join('')}</p>` : ''}`;
    return `<div class=mind-card><b class=mc-h>🎯 خطة بومي لطفلك</b>${body}${nx ? `<button class=mc-next onclick="${go(nx.go)}"><span>${nx.icon}</span><div><small>الخطوة المقترحة · ${esc(nx.why || '')}</small><b>${esc(nx.t)}</b></div></button>` : ''}</div>`;
  }

  function rtxt() {
    const E = Object.entries(P.sk || {}).filter(([k]) => !k.startsWith('ai:'));
    const st = P.stat || {};
    const pc = k => st[k] && st[k][0] ? Math.round((st[k][1] / st[k][0]) * 100) + '%' : '—';
    const strong = E.filter(([, s]) => s.n >= 3 && (s.e || 0) / s.n < 0.2).map(x => x[0]).slice(0, 8);
    const weak = E.filter(([, s]) => s.n >= 2 && (s.e || 0) / s.n >= 0.4).map(x => x[0]).slice(0, 8);
    const wl = Object.entries(P.wl || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(x => x[0]).join(' ');
    const pw = Object.entries(P.pr || {}).filter(([, v]) => v[0] >= 2 && v[1] / v[0] < 0.5).map(x => x[0]).join('، ');
    const dn = Object.keys(P.done || {}).map(k => {
      try {
        const u = find(k);
        return u.n + (P.fd && P.fd[k] ? ` (${Math.max(1, Math.round((new Date(P.done[k].d) - new Date(P.fd[k])) / 864e5) + 1)} يوم)` : '');
      } catch (_) { return k; }
    });
    const exLines = Object.entries(P.exams || {}).map(([k, v]) => `${k}: أفضل ${v.best}%`);
    const unres = Object.values(P.mistakes || {}).filter(m => m && (m.n || 0) > (m.fixed || 0)).slice(0, 8).map(m => `${m.expected || m.k} (×${m.n})`);
    return `تقرير ${P.name}
المرحلة: ${S[P.stage].n} | النجوم: ${P.star} | وقت التعلّم: ${tmTxt(P.tm)}
القراءة والاستماع: ${pc('r')} | الكتابة: ${pc('w')} | النطق: ${pc('p')}
دروس متقنة (${dn.length}): ${dn.join('، ') || '—'}
نتائج الاختبارات: ${exLines.join('، ') || '—'}
نقاط القوة: ${strong.join('، ') || '—'}
تحتاج مراجعة: ${weak.join('، ') || '—'}
أخطاء قيد التدريب: ${unres.join('، ') || 'لا توجد'}
حروف يجد صعوبة فيها: ${wl || '—'}
نطق يحتاج تدريبًا: ${pw || '—'}`;
  }

  const yn = (f, v) => `<select onchange="P.${f}=+this.value;save()"><option value=1 ${v !== 0 && v ? 'selected' : ''}>مسموح</option><option value=0 ${v === 0 || (!v && f === 'mic') ? 'selected' : ''}>غير مسموح</option></select>`;

  function parentPanel() {
    window.V = 'parent';
    window.CS = 'set';
    rs = 0;
    if (DB.pin && !ok1) {
      return h(`<button class=link onclick="home()">رجوع ←</button><h2>لوحة ولي الأمر</h2>
        <label for=pn>الرقم السري</label><input id=pn type=password inputmode=numeric onkeydown="if(event.key==='Enter'){event.preventDefault();if(this.value==DB.pin){window.__parentUnlock();parentPanel()}else{var b=document.getElementById('pn-btn');if(b)b.textContent='الرقم غير صحيح، حاول مرة أخرى';}}">
        <button id=pn-btn class=big onclick="if(document.getElementById('pn').value==DB.pin){window.__parentUnlock();parentPanel()}else this.textContent='الرقم غير صحيح، حاول مرة أخرى'">دخول</button>`);
    }

    const P0 = window.P || {};
    const scArr = Object.values(P0.sc || {}).map(Number).filter(x => x >= 0);
    const pct = scArr.length ? Math.round((scArr.reduce((a, b) => a + b, 0) / scArr.length / 5) * 100) : 0;
    const done = Object.keys(P0.done || {}).length;
    const bd = Object.keys(P0.badges || {}).length;
    const st = +P0.star || 0, R = 44, C = 2 * Math.PI * R;

    const sel = (id, arr, curVal, fn) => `<select id=${id} onchange="${fn}">${arr.map(x => `<option value="${x[0]}" ${x[0] == curVal ? 'selected' : ''}>${x[1]}</option>`).join('')}</select>`;

    h(`<button class=link onclick="goBack()">← رجوع</button><h2>⚙️ لوحة ولي الأمر</h2>
      <div class=pm-card>
        <div class=pm-ring>
          <svg viewBox="0 0 110 110" aria-hidden=true><circle cx=55 cy=55 r=${R} class=pm-bg /><circle cx=55 cy=55 r=${R} class=pm-fg stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pct / 100)}" /></svg>
          <b>${pct}٪</b><small>مستوى الإتقان</small>
        </div>
        <div class=pm-who><span class=pm-av>${P0.gender === 'female' ? '👧' : '👦'}</span><div><b>${esc(P0.name)}</b><small>${P0.age ? esc(P0.age) + ' سنوات' : ''}</small></div></div>
        <ul class=pm-st>
          <li><span>🏆</span>الإنجازات<b>${D(bd)}</b></li>
          <li><span>⭐</span>النجوم<b>${D(st)}</b></li>
          <li><span>📚</span>الدروس المكتملة<b>${D(done)}</b></li>
          <li><span>⏱️</span>وَقْتُ التَّعَلُّمِ<b dir=ltr>${tmTxt(P0.tm)}</b></li>
        </ul>
      </div>
      ${mindCard()}
      ${academyProgressHTML()}
      ${examsAndMistakesHTML()}
      ${(window.MindCoach && MindCoach.report()) || ''}
      <div id=bank-report-host>${(window.BankReport && !window.BankReport.__lazyStub && BankReport()) || ''}</div>
      ${(window.G2summary && G2summary()) || ''}
      ${themeCard()}
      <div class=pdash id=vq-set>
        <h3>🎤 أسئلة بومي الصوتية المفاجئة</h3>
        <p class=mut>بومي يسأل الطالب سؤالًا واحدًا مما تعلّمه بين التمارين لا أثناءها. ${P0.mic && (window.SpeechRecognition || window.webkitSpeechRecognition) ? 'يجيب الطالب بصوته.' : 'الميكروفون غير مفعّل، فيجيب بالضغط على الخيار.'}</p>
        <select onchange="P.vq=+this.value;save()">
          <option value=1 ${P0.vq !== 0 && P0.vq !== 2 ? 'selected' : ''}>مفعّلة</option>
          <option value=2 ${P0.vq === 2 ? 'selected' : ''}>مفعّلة (أسئلة أكثر)</option>
          <option value=0 ${P0.vq === 0 ? 'selected' : ''}>متوقفة</option>
        </select>
      </div>
      ${(window.HurufiSync && HurufiSync.box()) || ''}
      <div class=pdash id=parent-tools>
        <h3>🛠️ أدوات سريعة وإعدادات الصوت</h3>
        <div class=row style="gap:8px;flex-wrap:wrap">
          <button class=big onclick="voiceSet()">🔊 إعدادات صوت بومي</button>
          <button class=alt onclick="teacher()">👩‍🏫 لوحة المعلّم</button>
          <button class=alt onclick="examHub()">🏆 بوابة الاختبارات</button>
          <button class=alt onclick="sec('les')">📘 جميع دروس الأكاديميتين</button>
          <button class=alt onclick="sec('ach')">⭐ إنجازاتي</button>
          <button class=alt onclick="bomi()">🦉 التحدّث مع بومي</button>
        </div>
      </div>
      <div class=pdash id=parent-settings>
        <h3>👤 الملف الشخصي وإعدادات الطالب</h3>
        <label for=pk>تبديل الطالب</label>${sel('pk', DB.kids.map((k, i) => [i, esc(k.name)]), DB.cur, 'DB.cur=+this.value;P=load();ens();parentPanel()')}
        <button class=link onclick="setup()">+ إضافة طالب جديد</button>
        <label for=pname>اسم الطالب</label><input id=pname autocomplete=off value="${esc(P0.name || '')}" onchange="P.name=this.value.replace(/[<>&\\x22\\x27\\x60]/g,'').trim()||P.name||'صديقي';save();parentPanel()">
        <label for=page>عمر الطالب</label>${sel('page', [3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(n => [n, `${D(n)} سنوات`]), +(P0.age || 6), 'P.age=+this.value;save();parentPanel()')}
        <label for=ps>المرحلة الحالية</label>${sel('ps', S.map((s, i) => [i, `${i + 1}. ${s.n} (${s.a})`]), P0.stage, 'P.stage=+this.value;save()')}
        <label for=pl>مسار اللغة</label>${sel('pl', [['both', 'العربية والإنجليزية'], ['ar', 'العربية'], ['en', 'الإنجليزية']], P0.lang, 'P.lang=this.value;save()')}
        <label for=pg>جنس الطالب</label>${sel('pg', [['male', 'ذَكَر'], ['female', 'أُنْثَى']], P0.gender, 'P.gender=this.value;save();parentPanel()')}
        <label for=pul>فتح جميع الدروس مباشرة</label>${sel('pul', [[0, 'مُغلق — التقدّم بالترتيب (مستحسن)'], [1, 'مفتوح — إتاحة جميع الدروس']], P0.unlockAll ? 1 : 0, 'P.unlockAll=+this.value?1:0;save()')}
        <label>السماح باستخدام الميكروفون</label>${yn('mic', P0.mic)}
        <label for=pp>رقم سري للوحة (اتركه فارغًا لإلغائه)</label><input id=pp inputmode=numeric maxlength=4 value="${esc(DB.pin || '')}" onchange="DB.pin=this.value.trim();save()">
      </div>
      <div class=pdash>
        <h3>📄 تقرير ${esc(P0.name)}</h3>
        <pre>${esc(rtxt())}</pre>
        <label for=em>بريد ولي الأمر</label><input id=em type=email value="${esc(P0.em || '')}" onchange="P.em=this.value.trim();save();parentPanel()">
        <div class=row style="gap:8px;flex-wrap:wrap">
          <a class="big" href="mailto:${esc(P0.em || '')}?subject=${encodeURIComponent('تقرير تقدّم ' + P0.name)}&body=${encodeURIComponent(rtxt())}">إرسال التقرير بالبريد</a>
          <button class=alt onclick="copyReport(this)">📋 نسخ التقرير</button>
          <button class=alt onclick="window.print()">🖨️ طباعة التقرير</button>
        </div>
        <p class=mut style="margin-top:10px">🔒 بيانات الطالب محفوظة على هذا الجهاز أو عبر رمز المزامنة الخاص بك فقط. لا إعلانات ولا تواصل خارجي.</p>
        <button class=alt onclick="window.__deleteCurrentKid(this)">حذف ملف هذا الطالب</button>
      </div>`);
    if ((!window.BankReport || window.BankReport.__lazyStub) && window.Lazy && Lazy.loadBundle) {
      Lazy.loadBundle(['src/curriculum/course-data.js', 'src/curriculum/course-text.js', 'src/curriculum/course.js', 'src/curriculum/bank.js', 'src/curriculum/practice.js']).then(() => {
        const host = document.getElementById('bank-report-host');
        if (host && window.BankReport && !window.BankReport.__lazyStub) host.innerHTML = BankReport();
      }).catch(() => {});
    }
  }

  window.__parentUnlock = () => { ok1 = 1; };
  window.__deleteCurrentKid = btn => {
    if (rs++) {
      window.HurufiSync && HurufiSync.remove(DB.kids[DB.cur]);
      DB.kids.splice(DB.cur, 1);
      DB.cur = 0;
      P = load();
      ens();
      save();
      rs = 0;
      P ? home() : setup();
    } else {
      btn.textContent = `اضغط مرة أخرى لحذف ملف ${P.name} نهائيًا`;
    }
  };

  window.copyReport = function (b) {
    const t = rtxt();
    const ok = () => { b.textContent = 'تم النسخ ✓'; };
    const no = () => { b.textContent = 'تعذّر النسخ — حدّد النص يدويًا'; };
    const old = () => {
      try {
        const a = document.createElement('textarea');
        a.value = t;
        a.setAttribute('readonly', '');
        a.style.cssText = 'position:fixed;opacity:0;top:0';
        document.body.appendChild(a);
        a.select();
        const r = document.execCommand('copy');
        a.remove();
        r ? ok() : no();
      } catch (_) { no(); }
    };
    try {
      navigator.clipboard && navigator.clipboard.writeText
        ? navigator.clipboard.writeText(t).then(ok, old)
        : old();
    } catch (_) { old(); }
  };

  window.parentPanel = parentPanel;
  window.rtxt = rtxt;
})();
