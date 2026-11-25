/* phase9.js — تجربة التطبيق، المخاطبة المخصّصة حسب الجنس، وتشكيل العرض */
(() => {
  'use strict';
  const isGirl = () => !!(window.P && P.gender === 'female');
  window.studentWord = (male, female) => (isGirl() ? female : male);
  window.studentCall = () => (isGirl() ? 'يَا بَطَلَة' : 'يَا بَطَل');
  window.studentPronoun = () => (isGirl() ? 'أَنْتِ' : 'أَنْتَ');

  const FEM = {
    'بطل': 'بَطَلَة', 'صديقي': 'صَدِيقَتِي', 'أحسنت': 'أَحْسَنْتِ', 'احسنت': 'أَحْسَنْتِ', 'ممتاز': 'مُمْتَازَة', 'جاهز': 'جَاهِزَة', 'مستعد': 'مُسْتَعِدَّة', 'شاطر': 'شَاطِرَة', 'ذكي': 'ذَكِيَّة', 'مبدع': 'مُبْدِعَة', 'نجم': 'نَجْمَة', 'أنت': 'أَنْتِ', 'انت': 'أَنْتِ',
    'حاول': 'حَاوِلِي', 'اختر': 'اِخْتَارِي', 'اكتب': 'اُكْتُبِي', 'اضغط': 'اِضْغَطِي', 'استمع': 'اِسْتَمِعِي', 'اسمع': 'اِسْمَعِي', 'انطق': 'اِنْطِقِي', 'انطقها': 'اِنْطِقِيهَا', 'ابدأ': 'اِبْدَئِي', 'انظر': 'اُنْظُرِي', 'ارسم': 'اُرْسُمِي', 'لون': null, 'تتبع': null,
    'رتب': 'رَتِّبِي', 'ركب': 'رَكِّبِي', 'جرب': 'جَرِّبِي', 'تدرب': 'تَدَرَّبِي', 'تذكر': 'تَذَكَّرِي', 'انتبه': 'اِنْتَبِهِي', 'أكمل': 'أَكْمِلِي', 'اكمل': 'أَكْمِلِي', 'اقرأ': 'اِقْرَئِي', 'قل': 'قُولِي', 'قلها': 'قُولِيهَا', 'قله': 'قُولِيهِ', 'تعال': 'تَعَالَيْ', 'اسأل': 'اِسْأَلِي', 'اسألني': 'اِسْأَلِينِي', 'خذ': 'خُذِي', 'ضع': 'ضَعِي', 'عد': null, 'اختره': 'اِخْتَارِيهِ', 'اخترها': 'اِخْتَارِيهَا', 'اكتبها': 'اُكْتُبِيهَا', 'اكتبه': 'اُكْتُبِيهِ', 'رددها': 'رَدِّدِيهَا', 'ردد': 'رَدِّدِي', 'العب': 'اِلْعَبِي', 'استمتع': 'اِسْتَمْتِعِي', 'فكر': 'فَكِّرِي',
    'أجبت': 'أَجَبْتِ', 'أتقنت': 'أَتْقَنْتِ', 'كتبت': 'كَتَبْتِ', 'نسيت': 'نَسِيتِ', 'أنجزت': 'أَنْجَزْتِ', 'تعلمت': 'تَعَلَّمْتِ', 'فزت': 'فُزْتِ', 'جمعت': 'جَمَعْتِ', 'وصلت': 'وَصَلْتِ', 'أخطأت': 'أَخْطَأْتِ', 'اخترت': 'اِخْتَرْتِ',
    'تستطيع': 'تَسْتَطِيعِين', 'تحتاج': 'تَحْتَاجِين', 'تتعلم': 'تَتَعَلَّمِين', 'تحب': 'تُحِبِّين', 'تريد': 'تُرِيدِين', 'تعرف': 'تَعْرِفِين',
    'لديك': 'لَدَيْكِ', 'اسحب': 'اِسْحَبِي', 'افتح': 'اِفْتَحِي', 'اجمع': 'اِجْمَعِي', 'اذهب': 'اِذْهَبِي', 'بإصبعك': 'بِإِصْبَعِكِ', 'بإنجازاتك': 'بِإِنْجَازَاتِكِ', 'رحلتك': 'رِحْلَتِكِ', 'يمنحك': 'يَمْنَحُكِ', 'فهمك': 'فَهْمِكِ', 'لك': 'لَكِ', 'معك': 'مَعَكِ', 'منك': 'مِنْكِ', 'عليك': 'عَلَيْكِ', 'إليك': 'إِلَيْكِ', 'صوتك': 'صَوْتَكِ', 'اسمك': 'اِسْمُكِ', 'نجومك': 'نُجُومُكِ', 'إنجازاتك': 'إِنْجَازَاتُكِ', 'مستواك': 'مُسْتَوَاكِ', 'نطقك': 'نُطْقُكِ', 'إجابتك': 'إِجَابَتُكِ', 'دورك': 'دَوْرُكِ', 'معلمك': 'مُعَلِّمُكِ', 'عمرك': 'عُمْرَكِ', 'بصوتك': 'بِصَوْتِكِ', 'سمعت': 'سَمِعْتِ', 'كرر': 'كَرِّرِي', 'كررها': 'كَرِّرِيهَا'
  };
  const strip = w => w.replace(/[ً-ْٰـ]/g, '');
  const PRE = [['و', 'وَ'], ['ف', 'فَ']];
  const FEMV = { 'تعلم': 'تَعَلَّمِي', 'تابع': 'تَابِعِي' };
  const NASB = new Set(['ان', 'أن', 'لن', 'لم', 'كي', 'لكي', 'حتى']);
  const feminine = t => {
    if (!isGirl() || !t) return t;
    let prev = '';
    return String(t).replace(/[\u0621-\u064A\u064B-\u0652\u0670]+/g, w => {
      const b = strip(w), pv = prev;
      prev = b;
      if (/\u0643\u0650$/.test(w)) return w;
      if (b in FEM) {
        const f = FEM[b] || w;
        return NASB.has(pv) && /ين$/.test(strip(f)) ? f.replace(/ن[\u064B-\u0652]*$/, '') : f;
      }
      for (const [p, pv2] of PRE) {
        if (b.length > 2 && b[0] === p && (b.slice(1) in FEM) && FEM[b.slice(1)]) {
          return pv2 + FEM[b.slice(1)].replace(/^ا[\u064E\u064F\u0650]/, 'ا');
        }
      }
      for (const [p, pv2] of PRE) {
        if (b.length > 2 && b[0] === p && (b.slice(1) in FEMV)) return pv2 + FEMV[b.slice(1)];
      }
      return w;
    });
  };
  window.studentGenderText = feminine;

  const VC = new Map();
  const vocalize = root => {
    if (!window.Tashkeel || !root) return;
    const walk = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: n => {
        const p = n.parentElement;
        return !p || p.closest('script,style,textarea,input,code') ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT;
      }
    });
    const nodes = [];
    let n;
    while ((n = walk.nextNode())) nodes.push(n);
    const sel = window.getSelection && getSelection();
    const busy = sel && !sel.isCollapsed && sel.rangeCount ? sel.getRangeAt(0) : null;
    nodes.forEach(x => {
      const v = x.nodeValue;
      if (!/[\u0621-\u064A]/.test(v)) return;
      if (busy && busy.intersectsNode(x)) return;
      const nx = x.nextSibling;
      const endFinal = !nx || (nx.nodeType === 1 && /^(BR|DIV|P|LI|UL|OL|BUTTON|H[1-6]|SECTION|TD|TH|TR|TABLE|DETAILS|SUMMARY|INPUT|SELECT|TEXTAREA|CANVAS|SVG|IMG)$/i.test(nx.tagName));
      const narr = x.parentElement && x.parentElement.closest('.story,.stories,.talk,.ct-paper,.course-frame,.card,.opt,.q,.grid,[data-nogender]');
      const pf = (narr ? 'n' : 'g') + (endFinal ? 1 : 0) + (isGirl() ? 'f' : 'm') + (x.parentElement && x.parentElement.textContent.trim() === v.trim() ? 's' : '-') + '|';
      const mk = pf + v;
      let t = VC.get(mk);
      if (t === undefined) {
        t = window.Tashkeel.apply(narr ? v : feminine(v));
        if (window.Tashkeel.nunWord && /^\s*[\u0621-\u064A][\u0621-\u064A\u064B-\u0652\u0670]*\s*$/.test(t) && x.parentElement && x.parentElement.textContent.trim() === v.trim()) {
          const w = t.trim(), nw = Tashkeel.nunWord(w);
          if (nw !== w) t = t.replace(w, nw);
        }
        if (window.Pron) t = Pron.display(t, endFinal);
        if (VC.size > 6000) VC.clear();
        VC.set(mk, t);
        VC.set(pf + t, t);
      }
      if (t !== v) x.nodeValue = t;
    });
  };
  new MutationObserver(rows => rows.forEach(row => row.addedNodes.forEach(node => {
    if (node.nodeType === 1) vocalize(node);
    else if (node.nodeType === 3 && node.parentElement) vocalize(node.parentElement);
  }))).observe(document.body, { childList: true, subtree: true });
  const nvh = document.getElementById('gn');
  if (nvh) vocalize(nvh);

  const afterRender = () => {
    const A = window.app || document.getElementById('app');
    if (!A) return;
    vocalize(A);
    A.classList.remove('screen-in');
    void A.offsetWidth;
    A.classList.add('screen-in');
    A.querySelectorAll('button,.card,.row,.tl button').forEach(b => b.classList.add('motion-ready'));
    if (window.FocusLesson && window.V === 'lesson') {
      try { FocusLesson.decorate(); } catch (e) {}
    }
  };
  if (typeof window.h === 'function') {
    const oldH = window.h;
    window.h = function (markup) {
      const value = oldH(markup);
      afterRender();
      return value;
    };
  }

  const burst = (target, ok) => {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const r = target.getBoundingClientRect();
    for (let i = 0; i < (ok ? 7 : 4); i++) {
      const x = document.createElement('i');
      x.className = 'joy ' + (ok ? 'yes' : 'no');
      x.textContent = ok ? ['⭐', '✨', '🎉'][i % 3] : '💫';
      x.style.left = (r.left + r.width / 2) + 'px';
      x.style.top = (r.top + r.height / 2) + 'px';
      x.style.setProperty('--x', ((Math.random() - 0.5) * 150) + 'px');
      x.style.setProperty('--y', (-35 - Math.random() * 110) + 'px');
      document.body.appendChild(x);
      setTimeout(() => x.remove(), 900);
    }
  };
  document.addEventListener('click', e => {
    const b = e.target.closest('.opt');
    if (b && b.dataset.ok != null) setTimeout(() => burst(b, b.dataset.ok === '1'), 10);
  }, true);

  let installPrompt;
  addEventListener('beforeinstallprompt', e => { e.preventDefault(); installPrompt = e; document.documentElement.classList.add('can-install'); });
  window.installHurufi = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    try { await installPrompt.userChoice; } catch (_) {}
    installPrompt = null;
  };
  window.Phase9 = { vocalize, afterRender };
  afterRender();
})();
