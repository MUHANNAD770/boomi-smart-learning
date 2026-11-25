/* sync.js — حفظ تقدّم الطالب ونقله بين الأجهزة (بدون أي بيانات للرياضيات أو المغامرات) */
(() => {
  'use strict';
  const EP = '/.netlify/functions/sync';
  let off = false, offWhy = '', busy = false, timer = 0, last = 0, dirty = false;
  const now = () => Date.now();
  const fmt = c => (c ? c.slice(0, 4) + '-' + c.slice(4) : '');
  const KEEP = ['name', 'gender', 'age', 'lang', 'stage', 'voiceId', 'autoSpeak', 'teacher', 'mic', 'snd', 'vol', 'rate', 'star', 'done', 'sc', 'fd', 'cd', 'act', 'courseDone', 'badges', 'unlockAll', 'stories', 'wk', 'speed', 'vq', 'days', 'g2', 'courseQuiz', 'coursePractice', 'sk', 'mind', 'bank', 'en', 'arw', 'tm', 'exams', 'mistakes'];
  const payload = k => {
    const o = {};
    for (const x of KEEP) if (k[x] !== undefined) o[x] = k[x];
    return o;
  };
  const sig = k => {
    const s = JSON.stringify(payload(k));
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
    return h + ':' + s.length;
  };

  async function api(b, keep) {
    if (off) throw new Error('off');
    if (navigator.onLine === false) throw new Error('offline');
    const r = await fetch(EP, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(b), keepalive: !!keep });
    const json = /json/.test(r.headers.get('content-type') || '');
    if (!json) {
      off = true;
      offWhy = [404, 405, 501].includes(r.status) ? 'nofn' : 'err';
      render();
      throw new Error('http ' + r.status);
    }
    const d = await r.json();
    d.status = r.status;
    return d;
  }

  const maxBy = (a, b, f) => (f(b) > f(a) ? b : a);
  function merge(L, R) {
    if (!R) return L;
    const o = { ...R, ...L };
    delete o.ml;
    o.star = Math.max(+L.star || 0, +R.star || 0);
    o.stage = Math.max(+L.stage || 0, +R.stage || 0);
    ['cd', 'act', 'courseDone', 'courseQuiz', 'badges'].forEach(k => { o[k] = { ...(R[k] || {}), ...(L[k] || {}) }; });
    o.done = { ...(R.done || {}) };
    for (const [k, v] of Object.entries(L.done || {})) o.done[k] = o.done[k] ? maxBy(o.done[k], v, x => +x.s || 0) : v;
    o.sc = { ...(R.sc || {}) };
    for (const [k, v] of Object.entries(L.sc || {})) o.sc[k] = Math.max(+v || 0, +(o.sc[k] || 0));
    o.fd = { ...(L.fd || {}) };
    for (const [k, v] of Object.entries(R.fd || {})) if (!o.fd[k] || v < o.fd[k]) o.fd[k] = v;
    o.sk = { ...(R.sk || {}) };
    for (const [k, v] of Object.entries(L.sk || {})) o.sk[k] = !o.sk[k] || (+v.t || 0) >= (+o.sk[k].t || 0) ? v : o.sk[k];
    const pairMax = k => {
      o[k] = { ...(R[k] || {}) };
      for (const [x, v] of Object.entries(L[k] || {})) {
        const r = o[k][x];
        o[k][x] = Array.isArray(v) && Array.isArray(r) ? v.map((n, i) => Math.max(+n || 0, +r[i] || 0)) : v;
      }
    };
    pairMax('pr');
    pairMax('stat');
    if (o.stat) delete o.stat.m;
    o.wl = { ...(R.wl || {}) };
    for (const [k, v] of Object.entries(L.wl || {})) o.wl[k] = Math.max(+v || 0, +(o.wl[k] || 0));
    o.coursePractice = { ...(R.coursePractice || {}) };
    for (const [k, v] of Object.entries(L.coursePractice || {})) {
      const r = o.coursePractice[k];
      o.coursePractice[k] = r ? { best: Math.max(+v.best || 0, +r.best || 0), attempts: Math.max(+v.attempts || 0, +r.attempts || 0) } : v;
    }
    o.g2 = { ...(R.g2 || {}) };
    for (const [k, v] of Object.entries(L.g2 || {})) {
      const r = o.g2[k];
      if (!r || typeof r !== 'object') { o.g2[k] = v; continue; }
      const s = { ...(r.s || {}) };
      for (const [lv, st] of Object.entries(v.s || {})) s[lv] = Math.max(+st || 0, +s[lv] || 0);
      o.g2[k] = { ...r, ...v, s, u: Math.max(+v.u || 1, +r.u || 1), n: Math.max(+v.n || 0, +r.n || 0), last: Math.max(+v.last || 0, +r.last || 0), b: { ...(r.b || {}), ...(v.b || {}) } };
    }
    o.bank = { ...(R.bank || {}) };
    for (const [k, v] of Object.entries(L.bank || {})) {
      const r = o.bank[k];
      o.bank[k] = r ? { b: Math.max(+v.b || 0, +r.b || 0), n: Math.max(+v.n || 0, +r.n || 0), t: Math.max(+v.t || 0, +r.t || 0) } : v;
    }
    o.exams = { ...(R.exams || {}) };
    for (const [k, v] of Object.entries(L.exams || {})) {
      const r = o.exams[k];
      o.exams[k] = r ? { best: Math.max(+v.best || 0, +r.best || 0), last: (+v.at || 0) >= (+r.at || 0) ? v.last : r.last, attempts: Math.max(+v.attempts || 0, +r.attempts || 0), at: Math.max(+v.at || 0, +r.at || 0), total: v.total || r.total, pass: !!(v.pass || r.pass) } : v;
    }
    o.mistakes = { ...(R.mistakes || {}) };
    for (const [k, v] of Object.entries(L.mistakes || {})) {
      const r = o.mistakes[k];
      o.mistakes[k] = r ? { ...r, ...v, n: Math.max(+v.n || 1, +r.n || 1), fixed: Math.max(+v.fixed || 0, +r.fixed || 0), at: Math.max(+v.at || 0, +r.at || 0) } : v;
    }
    const A = L.mind || {}, B = R.mind || {};
    if (L.mind || R.mind) {
      const m = { ...B, ...A };
      m.sk = { ...(B.sk || {}) };
      for (const [k, v] of Object.entries(A.sk || {})) m.sk[k] = !m.sk[k] || (+v.t || 0) >= (+m.sk[k].t || 0) ? v : m.sk[k];
      m.src = { ...(B.src || {}) };
      for (const [k, v] of Object.entries(A.src || {})) m.src[k] = !m.src[k] || (+v.n || 0) >= (+m.src[k].n || 0) ? v : m.src[k];
      m.err = { ...(B.err || {}) };
      for (const [k, v] of Object.entries(A.err || {})) m.err[k] = Math.max(+v || 0, +(m.err[k] || 0));
      const tail = (a, b, n, key) => {
        const seen = new Set(), out = [];
        for (const x of [...(b || []), ...(a || [])]) {
          const k = key(x);
          if (seen.has(k)) continue;
          seen.add(k);
          out.push(x);
        }
        return out.slice(-n);
      };
      m.seen = tail(A.seen, B.seen, 120, x => x);
      m.ev = tail(A.ev, B.ev, 80, x => JSON.stringify(x)).sort((x, y) => (+x[4] || 0) - (+y[4] || 0));
      o.mind = m;
    }
    return o;
  }

  const apply = (k, m) => {
    const c = k.cloud, chat = k.chat;
    for (const x of Object.keys(k)) delete k[x];
    Object.assign(k, m);
    k.cloud = c;
    if (chat) k.chat = chat;
  };
  const persist = () => { try { origSave(); } catch (e) {} };

  async function ensure(k) {
    if (!k || k.cloud || off) return;
    const d = await api({ action: 'create', data: payload(k) });
    if (d.code) {
      k.cloud = { code: d.code, token: d.token, rev: d.rev, at: now(), sig: sig(k) };
      persist();
      render();
    }
  }
  async function push(k, keep, force) {
    if (!k || off) return;
    if (!k.cloud) return ensure(k);
    if (!force && k.cloud.sig === sig(k)) { dirty = false; return true; }
    for (let i = 0; i < 3; i++) {
      const c = k.cloud;
      const d = await api({ action: 'push', code: c.code, token: c.token, rev: c.rev, data: payload(k) }, keep);
      if (d.status === 200) {
        c.rev = d.rev; c.at = now(); c.sig = sig(k); dirty = false;
        persist(); render(); return true;
      }
      if (d.status === 409 && d.data) { apply(k, merge(k, d.data)); c.rev = d.rev; continue; }
      if (d.status === 404 || d.status === 403) { delete k.cloud; persist(); return ensure(k); }
      return false;
    }
    return false;
  }
  async function pull(k) {
    if (!k || !k.cloud || off) return;
    const c = k.cloud;
    const d = await api({ action: 'pull', code: c.code, token: c.token });
    if (d.status === 200 && d.rev > c.rev) {
      apply(k, merge(k, d.data));
      c.rev = d.rev; c.at = now(); persist(); dirty = true;
    } else if (d.status === 404 || d.status === 403) { delete k.cloud; persist(); }
  }
  async function link(code) {
    const d = await api({ action: 'link', code });
    if (d.status !== 200) throw new Error(d.error || 'link');
    const ex = DB.kids.findIndex(k => k.cloud && k.cloud.code === d.code);
    if (ex >= 0) {
      const k = DB.kids[ex];
      apply(k, merge(k, d.data));
      k.cloud = { code: d.code, token: d.token, rev: d.rev, at: now() };
      DB.cur = ex;
    } else {
      const k = { ...d.data, cloud: { code: d.code, token: d.token, rev: d.rev, at: now() } };
      DB.kids.push(k);
      DB.cur = DB.kids.length - 1;
    }
    window.P = load();
    try { ens(); } catch (e) {}
    persist();
    return window.P;
  }
  async function remove(k) { try { if (k && k.cloud) await api({ action: 'remove', code: k.cloud.code, token: k.cloud.token }); } catch (e) {} }
  const run = f => { if (busy) return; busy = true; f().catch(() => {}).finally(() => { busy = false; }); };

  const origSave = window.save;
  window.save = function () {
    const r = origSave.apply(this, arguments);
    if (window.P && P.cloud && sig(P) !== P.cloud.sig) { dirty = true; schedule(600000); }
    return r;
  };
  function schedule(ms) {
    if (off || timer) return;
    timer = setTimeout(() => { timer = 0; if (dirty && window.P) run(() => push(P)); }, Math.max(5000, ms - (now() - last)));
  }
  const soon = () => {
    if (!window.P || off || !dirty) return;
    if (now() - last < 600000) return schedule(600000);
    last = now();
    clearTimeout(timer);
    timer = 0;
    run(() => push(P));
  };
  ['fin'].forEach(f => {
    const o = window[f];
    if (typeof o === 'function') window[f] = function () { const r = o.apply(this, arguments); setTimeout(soon, 2500); return r; };
  });
  addEventListener('pagehide', () => { if (dirty && !document.hidden && window.P && P.cloud && !off) push(P, true).catch(() => {}); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'hidden' && dirty && window.P && P.cloud && !off) push(P, true).catch(() => {}); });
  addEventListener('online', () => { if (window.P && !off) run(async () => { await pull(P); if (dirty) await push(P); }); });
  const idle = window.requestIdleCallback || (f => setTimeout(f, 2500));
  idle(() => {
    if (window.P) {
      run(async () => {
        if (P.cloud) {
          if (now() - (P.cloud.pulled || 0) > 216e5) { P.cloud.pulled = now(); await pull(P); }
          if (dirty) await push(P);
          if (window.V === 'home' && dirty) try { home(); } catch (e) {}
        } else await ensure(P);
      });
    }
  }, { timeout: 5000 });

  const ago = t => {
    if (!t) return '—';
    const m = Math.round((now() - t) / 60000);
    return m < 1 ? 'الآن' : m < 60 ? `قبل ${m} دقيقة` : m < 1440 ? `قبل ${Math.round(m / 60)} ساعة` : `قبل ${Math.round(m / 1440)} يوم`;
  };
  function box() {
    if (!window.P) return '';
    const c = P.cloud;
    if (off) return `<div class="cloudbox"><h3>☁️ الحفظ على الإنترنت</h3><p class="mut">التقدّم محفوظ محليًا على هذا الجهاز.</p></div>`;
    return `<div class="cloudbox"><h3>☁️ الحفظ على الإنترنت</h3>${c
      ? `<p>✅ تقدّم ${esc(P.name)} محفوظ تلقائيًا · آخر حفظ: <b id="cl-at">${ago(c.at)}</b></p>
         <p class="mut">لنقل التقدّم إلى جهاز آخر، اكتب هذا الرمز فيه:</p><div class="cloud-code" dir="ltr">${fmt(c.code)}</div>
         <div class="row"><button class="alt" onclick="HurufiSync.copy(this)">📋 نسخ الرمز</button><button class="alt" onclick="HurufiSync.now(this)">☁️ احفظ الآن</button></div>`
      : `<p class="mut">${navigator.onLine === false ? '📴 لا يوجد إنترنت الآن، وسيُحفظ تلقائيًا عند الاتصال.' : '⏳ جارٍ تجهيز رمز الطالب…'}</p>`}
      <details><summary>🔗 لديّ رمز طالب من جهاز آخر</summary><input id="cl-in" dir="ltr" maxlength="9" placeholder="ABCD-1234" autocomplete="off" autocapitalize="characters"><button class="big" onclick="HurufiSync.linkUI()">ربط ونقل التقدّم</button><p id="cl-msg" class="mut" aria-live="polite"></p></details></div>`;
  }
  function render() { const b = document.querySelector('#app .cloudbox'); if (b) b.outerHTML = box(); }
  const oParent = window.parentPanel;
  if (typeof oParent === 'function') {
    window.parentPanel = function () {
      const r = oParent.apply(this, arguments);
      try {
        if (!document.getElementById('pn') && !document.querySelector('#app .cloudbox')) {
          const a = document.querySelector('#app .pdash') || document.querySelector('#app h2');
          a && a.insertAdjacentHTML('afterend', box());
        }
      } catch (e) {}
      return r;
    };
  }
  const linkBox = () => `<details class="cloudbox"><summary>🔗 لدى الطالب رمز من جهاز آخر؟</summary><input id="cl-in" dir="ltr" maxlength="9" placeholder="ABCD-1234" autocomplete="off" autocapitalize="characters"><button class="big" onclick="HurufiSync.linkUI()">نقل تقدّم الطالب إلى هذا الجهاز</button><p id="cl-msg" class="mut" aria-live="polite"></p></details>`;
  const addLink = () => { try { const a = document.getElementById('app'); if (a && !a.querySelector('details.cloudbox')) a.insertAdjacentHTML('beforeend', linkBox()); } catch (e) {} };
  const oSetup = window.setup;
  if (typeof oSetup === 'function') {
    window.setup = function () { const r = oSetup.apply(this, arguments); addLink(); return r; };
  }
  if (window.V === 'setup') addLink();

  const TK = 'hurufi-teacher';
  const tget = () => { try { return JSON.parse(localStorage.getItem(TK)) || []; } catch (e) { return []; } };
  const tset = v => { try { localStorage.setItem(TK, JSON.stringify(v)); } catch (e) {} };
  const lvl = a => (a <= 1 ? 'مبتدئ' : a <= 3 ? 'متوسط' : 'متقدم');
  const dn = (d, l) => Object.keys(d.done || {}).filter(id => { try { return !l || find(id).l === l; } catch (e) { return false; } }).length;
  window.teacher = function () {
    window.V = 'sec';
    window.CS = 'set';
    const L = tget();
    const row = x => {
      const d = x.data || {};
      return `<tr><td><b>${esc(d.name || '—')}</b><small dir="ltr">${fmt(x.code)}</small></td><td>${d.stage != null ? (d.stage + 1) + ' · ' + lvl(d.stage) : '—'}</td><td>⭐ ${d.star || 0}</td><td>🔤 ${dn(d, 'ar')} · 🔠 ${dn(d, 'en')}</td><td>🏅 ${Object.keys(d.badges || {}).length}</td><td>📚 ${Object.keys(d.stories || {}).length}</td><td><small>${ago(x.at)}</small></td><td><button class="link" onclick="HurufiSync.tdel('${x.code}')" aria-label="حذف">✕</button></td></tr>`;
    };
    h(`<section class="sec teacher"><button class="link" onclick="goBack()">← رجوع</button><h2>👩‍🏫 لوحة المعلّم</h2><p class="mut">أضف رمز كل طالب لتتابع تقدّم الصف كله في العربية والإنجليزية.</p>
      <div class="t-add"><input id="t-in" dir="ltr" maxlength="9" placeholder="ABCD-1234" autocomplete="off" autocapitalize="characters"><button class="big" onclick="HurufiSync.tadd()">➕ إضافة طالب</button></div><p id="t-msg" class="mut" aria-live="polite"></p>
      ${L.length ? `<div class="ct-tbl"><table class="t-tbl"><thead><tr><th>الطالب</th><th>المرحلة</th><th>النجوم</th><th>الدروس</th><th>الشارات</th><th>القصص</th><th>آخر تحديث</th><th></th></tr></thead><tbody>${L.map(row).join('')}</tbody></table></div>
      <button class="alt" onclick="HurufiSync.trefresh(this)">🔄 تحديث بيانات الطلاب</button>` : '<p>لم تُضِف طلابًا بعد.</p>'}</section>`);
  };
  async function tadd() {
    const i = document.getElementById('t-in'), m = document.getElementById('t-msg');
    const code = String((i && i.value) || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
    if (code.length !== 8) { m.textContent = 'الرمز ٨ أحرف وأرقام، مثل ABCD-1234'; return; }
    const L = tget();
    if (L.some(x => x.code === code)) { m.textContent = 'هذا الطالب مضاف مسبقًا.'; return; }
    m.textContent = '⏳ جارٍ الإضافة…';
    try {
      const d = await api({ action: 'link', code });
      if (d.status !== 200) throw new Error(d.error);
      L.push({ code: d.code, token: d.token, data: d.data, at: now() });
      tset(L);
      teacher();
    } catch (e) {
      m.textContent = /notfound/.test(e.message) ? 'لم نجد هذا الرمز.' : /rate/.test(e.message) ? 'محاولات كثيرة، انتظر قليلًا.' : 'تعذّرت الإضافة الآن.';
    }
  }
  async function trefresh(b) {
    if (b) { b.disabled = true; b.textContent = '⏳ جارٍ التحديث…'; }
    const L = tget();
    for (const x of L) {
      try {
        const d = await api({ action: 'pull', code: x.code, token: x.token });
        if (d.status === 200) { x.data = d.data; x.at = now(); }
      } catch (e) {}
    }
    tset(L);
    teacher();
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  window.HurufiSync = {
    tadd, trefresh,
    tdel: code => { tset(tget().filter(x => x.code !== code)); teacher(); },
    push: () => window.P && push(P),
    pull: () => window.P && pull(P),
    link, remove, merge, box,
    state: () => ({ off, offWhy, cloud: window.P && P.cloud ? { code: P.cloud.code, rev: P.cloud.rev, at: P.cloud.at } : null, dirty }),
    copy(b) {
      const t = fmt(P.cloud && P.cloud.code);
      try { navigator.clipboard.writeText(t).then(() => { b.textContent = 'تم النسخ ✓'; }, () => { b.textContent = t; }); } catch (e) { b.textContent = t; }
    },
    async now(b) {
      b.disabled = true; b.textContent = '⏳ جارٍ الحفظ…';
      let ok = false;
      try { ok = await push(P, false, true); } catch (e) {}
      b.disabled = false;
      b.textContent = ok ? '✅ تم الحفظ' : '⚠️ تعذّر الحفظ، حاول لاحقًا';
    },
    async linkUI() {
      const i = document.getElementById('cl-in'), m = document.getElementById('cl-msg');
      const code = String((i && i.value) || '').toUpperCase().replace(/[^A-Z0-9]/g, '');
      if (code.length !== 8) { m.textContent = 'الرمز ٨ أحرف وأرقام، مثل ABCD-1234'; return; }
      m.textContent = '⏳ جارٍ النقل…';
      try {
        const k = await link(code);
        m.textContent = `✅ تم! مرحبًا ${k.name}`;
        setTimeout(() => home(), 700);
      } catch (e) {
        m.textContent = /notfound/.test(e.message) ? 'لم نجد هذا الرمز.' : /rate/.test(e.message) ? 'محاولات كثيرة، انتظر قليلًا.' : navigator.onLine === false ? 'يحتاج اتصالًا بالإنترنت.' : 'تعذّر النقل الآن.';
      }
    }
  };
})();
