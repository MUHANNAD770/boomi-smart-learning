/* /src/curriculum/course-text.js — قارئ الدروس النصية التفاعلية للعربية والإنجليزية */
(() => {
  'use strict';
  const D = () => window.COURSE_TEXT || {};
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, x => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[x]));
  const rich = s => esc(s).replace(/\{\{(.+?)\}\}/g, '<span class="ct-en">$1</span>');
  const key = (r, page) => r.kind === 'images' ? 'en:' + page : 'pdf:' + r.id + ':' + (page || 1);
  const get = (r, page) => D()[key(r, page)] || null;
  const sayBtn = (w, l) => `<button type="button" class="ct-say" data-l="${l || 'en'}" data-say="${esc(w)}">🔊 ${esc(w)}</button>`;
  const cell = (c, hd) => {
    const t = hd ? 'th' : 'td';
    const en = /^[\x20-\x7E\u0250-\u02AF\u02C8\u02D0\/]+$/.test(String(c)) ? ' class="en"' : '';
    return `<${t}${en}>${rich(c)}</${t}>`;
  };
  const block = (b, i, id) => {
    switch (b.t) {
      case 'title': return `<h3 class="ct-title">${rich(b.x)}</h3>`;
      case 'sub': return `<p class="ct-sub">${rich(b.x)}</p>`;
      case 'sec': return `<div class="ct-sec"><i>${esc(b.n || '')}</i><span>${rich(b.x)}</span></div>`;
      case 'p': return `<p class="ct-p">${rich(b.x)}</p>`;
      case 'ul': return `<ul class="ct-ul">${b.x.map(v => `<li>${rich(v)}</li>`).join('')}</ul>`;
      case 'table': {
        const rows = b.rows.map(r => {
          r = r.slice();
          while (r.length && String(r[r.length - 1]).trim() === '') r.pop();
          return r;
        }).filter(r => r.length);
        const w = Math.max(...rows.map(r => r.length), (b.head || []).length) > 5;
        return `<div class="ct-tbl${w ? ' ct-wide' : ''}"${b.ltr ? ' dir="ltr"' : ''}><table>${b.head ? `<thead><tr>${b.head.map(c => cell(c, 1)).join('')}</tr></thead>` : ''}<tbody>${rows.map(r => `<tr>${r.map(c => cell(c)).join('')}</tr>`).join('')}</tbody></table></div>`;
      }
      case 'note': return `<div class="ct-note">⭐ ${rich(b.x)}</div>`;
      case 'tip': return `<div class="ct-tip">💡 ${rich(b.x)}</div>`;
      case 'words': return `<div class="ct-words">${b.x.map(w => sayBtn(w, b.l)).join('')}</div>`;
      case 'quiz': return `<div class="ct-quiz" data-a="${+b.a}" data-q="${id}-${i}"><b>❓ ${rich(b.q)}</b><div class="ct-opts">${b.o.map((o, k) => `<button type="button" data-k="${k}">${rich(o)}</button>`).join('')}</div><p class="ct-fb" aria-live="polite"></p></div>`;
      default: return '';
    }
  };
  const render = (r, page, id) => {
    const d = get(r, page);
    if (!d) return '<div class="ct-soon">📝 النسخة النصية لهذه الصفحة قيد التحضير.</div>';
    return `<article class="ct-paper" dir="rtl">${d.map((b, i) => block(b, i, id)).join('')}</article>`;
  };
  document.addEventListener('click', e => {
    const s = e.target.closest && e.target.closest('.ct-say');
    if (s) { try { say(s.dataset.say, s.dataset.l || 'en', null, 'explain'); } catch (_) {} return; }
    const o = e.target.closest && e.target.closest('.ct-opts button');
    if (!o) return;
    const q = o.closest('.ct-quiz');
    if (!q || q.dataset.done) return;
    const right = +q.dataset.a, pick = +o.dataset.k, fb = q.querySelector('.ct-fb');
    if (pick === right) {
      q.dataset.done = 1;
      o.classList.add('ok');
      fb.textContent = 'أحسنت! إجابة صحيحة 🌟';
      try { window.HurufiSound && HurufiSound.play('correct'); window.MC && MC.mood('happy', 1500); } catch (_) {}
      try {
        if (window.P) {
          P.courseQuiz = P.courseQuiz || {};
          if (!P.courseQuiz[q.dataset.q]) { P.courseQuiz[q.dataset.q] = 1; P.star = (P.star || 0) + 1; save(); }
        }
      } catch (_) {}
    } else {
      o.classList.add('no');
      o.disabled = true;
      fb.textContent = 'حاول مرة أخرى 💪';
      try { window.HurufiSound && HurufiSound.play('wrong'); } catch (_) {}
    }
  });
  window.CourseText = { render, has: (r, page) => !!get(r, page), count: () => Object.keys(D()).length };
})();
