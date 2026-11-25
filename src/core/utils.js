/* src/core/utils.js — أدوات مساعدة مشتركة للتنسيق والعشوائية والتطبيع اللغوي */
(() => {
  'use strict';

  const AR = '٠١٢٣٤٥٦٧٨٩';
  const R = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const pk = a => a[R(0, a.length - 1)];

  function shuf(a) {
    const out = [...a];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  }

  function mix(seq) {
    let a;
    let tries = 0;
    do {
      a = shuf(seq);
      tries++;
    } while (seq.length > 1 && a.join('|') === seq.join('|') && tries < 8);
    return a;
  }

  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[c]));

  const D = n => String(n).replace(/\d/g, d => AR[d]);
  const ad = D;

  const stripD = s => String(s == null ? '' : s)
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .toLowerCase()
    .trim();

  const normAr = s => String(s == null ? '' : s)
    .replace(/[\u064B-\u0652\u0670\u0640]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .trim();

  const isAr = s => /[\u0600-\u06FF]/.test(String(s || ''));
  const day = () => new Date().toLocaleDateString('en-CA');

  // Ensure every multiple-choice option list has unique visible labels
  function uniqueOpts(correctItem, pool, labelFn, maxTotal = 4) {
    if (typeof labelFn === 'number') {
      maxTotal = labelFn;
      labelFn = x => x;
    } else if (typeof labelFn !== 'function') {
      labelFn = x => x;
    }
    const seen = new Set();
    const out = [];
    const pushIfNew = it => {
      if (it == null) return false;
      const lbl = String(labelFn(it) ?? '').trim();
      if (!lbl || seen.has(lbl)) return false;
      seen.add(lbl);
      out.push(it);
      return true;
    };
    pushIfNew(correctItem);
    for (const candidate of shuf(pool || [])) {
      if (out.length >= maxTotal) break;
      pushIfNew(candidate);
    }
    return shuf(out);
  }

  window.AR = AR;
  window.R = R;
  window.pk = pk;
  window.shuf = shuf;
  window.mix = mix;
  window.esc = esc;
  window.D = D;
  window.ad = ad;
  window.stripD = stripD;
  window.normAr = normAr;
  window.isAr = isAr;
  window.day = day;
  window.uniqueOpts = uniqueOpts;
})();
