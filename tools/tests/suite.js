/* tools/tests/suite.js — مجموعة الاختبارات الآلية والتحقق من سلامة المشروع */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');
const { execFileSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
let passed = 0;

const pending = [];
function test(name, fn) {
  try {
    const res = fn();
    if (res && typeof res.then === 'function') {
      pending.push(
        res.then(() => {
          passed++;
          console.log('PASS:', name);
        }).catch(err => {
          console.error('FAIL:', name);
          console.error(err && err.stack ? err.stack : err);
          process.exitCode = 1;
        })
      );
      return;
    }
    passed++;
    console.log('PASS:', name);
  } catch (err) {
    console.error('FAIL:', name);
    console.error(err && err.stack ? err.stack : err);
    process.exitCode = 1;
  }
}

function walkJs(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walkJs(p, out);
    else if (ent.name.endsWith('.js')) out.push(p);
  }
  return out;
}

test('Syntax check for server, sw, and all src/**/*.js modules', () => {
  const files = [
    path.join(ROOT, 'server.js'),
    path.join(ROOT, 'server', 'ai-provider.js'),
    path.join(ROOT, 'sw.js'),
    ...walkJs(path.join(ROOT, 'src'))
  ];
  assert(files.length >= 45, 'Expected modular JS files in src/');
  for (const f of files) {
    execFileSync(process.execPath, ['--check', f], { stdio: 'pipe' });
  }
});

test('index.html references existing stylesheets and scripts cleanly', () => {
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const refs = [];
  for (const m of html.matchAll(/<(?:script|link)\b[^>]*(?:src|href)="([^"]+)"/g)) {
    const raw = m[1];
    if (/^https?:\/\//i.test(raw)) continue;
    const rel = raw.split('?')[0];
    refs.push(rel);
    const abs = path.join(ROOT, rel);
    assert(fs.existsSync(abs), `Missing asset referenced by index.html: ${rel}`);
  }
  assert(refs.includes('src/core/nav.js'), 'index.html must load src/core/nav.js');
  assert(refs.includes('src/core/router.js'), 'index.html must load src/core/router.js');
  assert(refs.includes('src/styles/components.css'), 'index.html must load components.css');
});

test('nav.js lazyStub script bundles exist on disk', () => {
  const nav = fs.readFileSync(path.join(ROOT, 'src/core/nav.js'), 'utf8');
  const matches = [...nav.matchAll(/['"](src\/[^'"]+\.js)['"]/g)].map(m => m[1]);
  assert(matches.length >= 10, 'Expected lazy script paths in nav.js');
  for (const rel of matches) {
    assert(fs.existsSync(path.join(ROOT, rel)), `Missing lazy bundle script: ${rel}`);
  }
});

test('Data JSON banks are valid JSON and contain rich Arabic/English/Stories content', () => {
  for (const f of ['data/ar-bank.json', 'data/en-bank.json', 'data/stories-bank.json']) {
    const raw = fs.readFileSync(path.join(ROOT, f), 'utf8');
    const parsed = JSON.parse(raw);
    assert(parsed && typeof parsed === 'object', `Invalid JSON object in ${f}`);
  }
});

test('Forbidden legacy references and unsafe iframe patterns are absent from active code', () => {
  const activeFiles = [
    path.join(ROOT, 'index.html'),
    path.join(ROOT, 'sw.js'),
    ...walkJs(path.join(ROOT, 'src'))
  ];
  for (const f of activeFiles) {
    const txt = fs.readFileSync(f, 'utf8');
    const rel = path.relative(ROOT, f);
    assert(!/academies\/math|acad-math\.webp|math-adv/.test(txt), `Forbidden math ref in ${rel}`);
    assert(!/\bfunction\s+parent\s*\(/.test(txt), `Forbidden window.parent shadow in ${rel}`);
    assert(!/\b(?:window\.)?(?:alert|confirm)\s*\(/.test(txt), `Forbidden dialog call in ${rel}`);
    assert(!/\bwindow\.open\s*\(/.test(txt), `Forbidden window.open call in ${rel}`);
    assert(!/AIza[0-9A-Za-z_-]{20,}|AQ\.Ab[0-9A-Za-z_-]{15,}/.test(txt), `API key leak in ${rel}`);
  }
});

test('Core utils (uniqueOpts, esc, D, shuf) behave accurately', () => {
  const store = new Map();
  const ctx = vm.createContext({
    window: {},
    document: { createElement: () => ({ style: {} }) },
    localStorage: {
      getItem: k => store.get(k) ?? null,
      setItem: (k, v) => store.set(k, String(v))
    },
    location: { search: '' },
    navigator: {},
    console
  });
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/core/utils.js'), 'utf8'), ctx);
  assert.strictEqual(ctx.D(123), '١٢٣');
  assert.strictEqual(ctx.esc('<a&"b">'), '&lt;a&amp;&quot;b&quot;&gt;');
  const opts = ctx.uniqueOpts('بَ', ['بُ', 'بِ', 'بَ', 'بُ', 'تَ', 'ثَ'], 4);
  assert.strictEqual(opts.length, 4);
  assert(opts.includes('بَ'));
  assert.strictEqual(new Set(opts).size, 4);
});

test('Grader phonetic and spelling tolerance works for Arabic and English', () => {
  const ctx = vm.createContext({ window: {}, console });
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/shared/grader.js'), 'utf8'), ctx);
  const g1 = ctx.Grade.text('تفاحه', ['تُفَّاحَةٌ']);
  assert.strictEqual(g1.ok, true);
  const g2 = ctx.Grade.text('aple', ['apple']);
  assert.strictEqual(g2.ok, true);
});

test('ExamEngine tier calculation, unresolvedMistakes filter, and TIERS integrity', () => {
  const P = {
    name: 'ليلى',
    gender: 'female',
    age: '7',
    stage: 1,
    star: 25,
    sc: {},
    done: { '0-0': 1, '0-1': 1 },
    mistakes: {
      'ar:قمر': { k: 'قمر', l: 'ar', n: 2, fixed: 0, at: 100 },
      'ar:شمس': { k: 'شمس', l: 'ar', n: 1, fixed: 1, at: 90 },
      'en:cat': { k: 'cat', l: 'en', n: 1, fixed: 0, at: 120 }
    },
    exams: {
      ar_beginner: { best: 88, pass: true },
      ar_intermediate: { best: 75, pass: true }
    }
  };
  const ctx = vm.createContext({
    window: {},
    P,
    S: [{ n: 'ت', u: [{ id: '0-0', n: 'أ', l: 'ar', i: [{ k: 'أَسَد', sp: ['أَسَد', 'ar'] }] }] }],
    D: n => String(n),
    esc: s => String(s),
    uniqueOpts: (c, p, n = 4) => [c, ...p.filter(x => x !== c)].slice(0, n),
    shuf: a => [...a],
    pick: a => a[0],
    say: Object.assign(() => {}, { stop: () => {}, play: () => {} }),
    BumiFX: null,
    MC: { mood: () => {} },
    HurufiSound: { play: () => {} },
    save: () => {},
    ens: () => {},
    addStar: n => { P.star += n; },
    checkBadges: () => {},
    MindCoach: { learn: () => {} },
    h: () => {},
    home: () => {},
    goBack: () => {},
    sec: () => {},
    V: 'home',
    console
  });
  ctx.window = ctx;
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/assessment/exam-engine.js'), 'utf8'), ctx);
  assert.strictEqual(ctx.ExamEngine.TIERS.length, 4);
  assert.strictEqual(ctx.ExamEngine.calcLevel('ar').id, 'intermediate');
  assert.strictEqual(ctx.ExamEngine.calcLevel('en').id, 'beginner');
  assert.strictEqual(ctx.ExamEngine.unresolvedMistakes().length, 2);
  assert.strictEqual(ctx.ExamEngine.unresolvedMistakes('ar').length, 1);
  assert.strictEqual(ctx.ExamEngine.unresolvedMistakes('en').length, 1);
});

test('Gemini AI backend provider, TTS separation, and streaming routes are properly configured', () => {
  const gemCli = fs.readFileSync(path.join(ROOT, 'server', 'gemini-client.js'), 'utf8');
  const aiProv = fs.readFileSync(path.join(ROOT, 'server', 'ai-provider.js'), 'utf8');
  const ttsProv = fs.readFileSync(path.join(ROOT, 'server', 'tts-provider.js'), 'utf8');
  const srv = fs.readFileSync(path.join(ROOT, 'server.js'), 'utf8');
  assert(/new GoogleGenAI\s*\(/.test(gemCli), 'Must use @google/genai GoogleGenAI');
  assert(/process\.env\.GEMINI_API_KEY/.test(gemCli), 'Must read GEMINI_API_KEY from server env');
  assert(!/\/tmp\/boomi-auth\.log/.test(aiProv), 'No temporary debug file logging in ai-provider.js');
  assert(/ThinkingLevel\.LOW/.test(aiProv), 'Must configure ThinkingLevel.LOW for fast non-empty replies');
  assert(/streamGemini/.test(aiProv), 'Must export streamGemini');
  assert(/gemini-3\.8-flash-lite-tts/.test(ttsProv), 'tts-provider.js must use gemini-3.8-flash-lite-tts');
  assert(/getGemini\(['"]v1beta['"]\)/.test(ttsProv), 'tts-provider.js must request v1beta client for speechMetadata/speechConfig');
  assert(/err\.message\s*===\s*['"]empty['"]/.test(ttsProv), 'ttsErrorResponse must only map local empty text to 400 empty');
  assert(/responseModalities:\s*\['AUDIO'\]/.test(ttsProv), 'tts-provider.js must request AUDIO modality');
  assert(/prebuiltVoiceConfig/.test(ttsProv), 'tts-provider.js must configure prebuiltVoiceConfig');
  assert(/cleanSpeechText/.test(ttsProv), 'tts-provider.js must sanitize code/markdown/HTML before TTS');
  assert(/streamGemini/.test(srv) && /synthesizeSpeech/.test(srv) && /streamSpeech/.test(srv), 'server.js must wire Gemini chat and TTS routes');
  assert(/tts\(\?:-stream\)\?/.test(srv), 'server.js must exclude tts/tts-stream from buffered gzip');
  assert(!/myvoice/.test(srv), 'Obsolete myvoice route must be removed from server.js');

  const { resolveProvider } = require(path.join(ROOT, 'server', 'gemini-client.js'));
  const envEx = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8');
  const gitIg = fs.readFileSync(path.join(ROOT, '.gitignore'), 'utf8');
  assert(/AI_PROVIDER=gemini/.test(envEx) && /GEMINI_API_KEY=/.test(envEx) && /TTS_MODEL=gemini-3\.8-flash-lite-tts/.test(envEx), '.env.example must configure AI_PROVIDER=gemini, GEMINI_API_KEY, and TTS_MODEL');
  assert(/^\.env$/m.test(gitIg), '.gitignore must ignore .env secrets');

  const prevProv = process.env.AI_PROVIDER;
  const prevGem = process.env.GEMINI_API_KEY;
  process.env.AI_PROVIDER = '';
  process.env.GEMINI_API_KEY = 'dummy-test-value';
  assert.strictEqual(resolveProvider(), 'gemini', 'resolveProvider must default to gemini when GEMINI_API_KEY is set without OpenAI/Anthropic');
  if (prevProv === undefined) delete process.env.AI_PROVIDER; else process.env.AI_PROVIDER = prevProv;
  if (prevGem === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = prevGem;

  const { cleanSpeechText, detectLang, resolveVoice } = require(path.join(ROOT, 'server', 'tts-provider.js'));
  assert.strictEqual(cleanSpeechText('<script>alert(1)</script>```js\nconst x=1;\n``` **مَرْحَبًا** 🌟 https://example.com'), 'مَرْحَبًا');
  assert.strictEqual(cleanSpeechText('```python\nprint(1)\n``` <style>.a{}</style>'), '');
  assert.strictEqual(cleanSpeechText('Read [this story](https://x.test) with `apple` and `const a = 1;`!'), 'Read this story with apple and!');
  assert.strictEqual(detectLang('مَرْحَبًا بك', ''), 'ar');
  assert.strictEqual(detectLang('Hello world', ''), 'en');
  assert.strictEqual(detectLang('حرف A جميل', ''), 'mixed');
  assert.strictEqual(resolveVoice('female').voiceName, 'Kore');
  assert.strictEqual(resolveVoice('male').voiceName, 'Puck');
  assert.strictEqual(resolveVoice('zephyr').voiceName, 'Zephyr');
});

test('Client voice engine uses Google Gemini TTS exclusively with centralized settings and Pause/Resume/Replay controls', () => {
  const voice = fs.readFileSync(path.join(ROOT, 'src', 'shared', 'voice.js'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'src', 'styles', 'components.css'), 'utf8');
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
  const pp = fs.readFileSync(path.join(ROOT, 'src', 'parent', 'parent-panel.js'), 'utf8');
  assert(!fs.existsSync(path.join(ROOT, 'src', 'shared', 'voice-cloud.js')), 'Obsolete voice-cloud.js must be removed');
  assert(!fs.existsSync(path.join(ROOT, 'src', 'shared', 'myvoice.js')), 'Obsolete myvoice.js must be removed');
  assert(!/speechSynthesis|SpeechSynthesisUtterance|HurufiClips|MyVoice/.test(voice), 'voice.js must not fall back to browser speechSynthesis or removed providers');
  assert(!/voice-cloud\.js|myvoice\.js/.test(html + sw), 'index.html and sw.js must not reference removed voice scripts');
  assert(/BumiVoiceConfig/.test(voice), 'Centralized BumiVoiceConfig must be defined');
  assert(/say\.pause\s*=/.test(voice) && /say\.resume\s*=/.test(voice) && /say\.replay\s*=/.test(voice) && /say\.stop\s*=/.test(voice), 'voice.js must expose pause/resume/replay/stop controls');
  assert(/cleanSpeechText/.test(voice) && /extractVisibleText/.test(voice), 'voice.js must sanitize and extract visible text only');
  assert(/\.boomi-player\[hidden\]/.test(css), 'CSS must keep hidden #boomi-player collapsed');
  assert(!/yn\('snd'/.test(pp), 'parent-panel.js must not duplicate voice sound toggle outside voiceSet()');
});

test('Boomi chat UI removes covering chips/buttons, uses collapsible drawer, and disables local fake replies', () => {
  const ui = fs.readFileSync(path.join(ROOT, 'src', 'tutor', 'boomi-ui.js'), 'utf8');
  const css = fs.readFileSync(path.join(ROOT, 'src', 'styles', 'components.css'), 'utf8');
  assert(!/localAI\.think/.test(ui), 'boomi-ui.js must not intercept online chat with localAI.think');
  assert(!/Brain\.find/.test(ui), 'boomi-ui.js must not intercept online chat with Brain.find');
  assert(!/لم أفهم<\/button>/.test(ui), 'Permanent "🤔 لم أفهم" chip bar must be removed');
  assert(/id=bsug class=bm-sug hidden/.test(ui), 'Suggestions drawer must start collapsed');
  assert(/window\.btoggleSug/.test(ui), 'Must define collapsible suggestions toggle');
  assert(/showRetryError/.test(ui), 'Must render explicit retryable error messages');
  assert(/attachBubbleAudio/.test(ui), 'Boomi chat bubbles must offer direct listen/replay control');
  assert(/html\.bm-open\s+\.ask/.test(css), 'CSS must hide .ask/.gn/#mc when Boomi chat is open');
  assert(/\.bm-sug\[hidden\]/.test(css), 'CSS must enforce hidden on .bm-sug');
});

test('All fixed routes and interactive controls are wired', () => {
  const ex = fs.readFileSync(path.join(ROOT, 'src', 'assessment', 'exam-engine.js'), 'utf8');
  const rt = fs.readFileSync(path.join(ROOT, 'src', 'core', 'router.js'), 'utf8');
  const cr = fs.readFileSync(path.join(ROOT, 'src', 'curriculum', 'course.js'), 'utf8');
  const pp = fs.readFileSync(path.join(ROOT, 'src', 'parent', 'parent-panel.js'), 'utf8');
  const qz = fs.readFileSync(path.join(ROOT, 'src', 'core', 'quiz.js'), 'utf8');
  assert(/window\.CS\s*=\s*'exams'/.test(ex), 'examHub must set CS = exams');
  assert(/examHub:\s*\{\s*cs:\s*'exams'/.test(rt), 'router CFG must map examHub to exams');
  assert(/coursePractice\(/.test(cr), 'courseViewer must wire coursePractice button');
  assert(/id=parent-tools/.test(pp) && /id=pname/.test(pp) && /sel\('pul'/.test(pp), 'parentPanel must expose tools and profile editor');
  assert(/hasKids\s*\?\s*'<button class=link onclick="goBack\(\)">/.test(qz), 'setup() must offer back button when kids exist');
});

test('Integrated curriculum is cleanly merged into Arabic and English academies with zero content loss or duplicates', async () => {
  const navCode = fs.readFileSync(path.join(ROOT, 'src/core/nav.js'), 'utf8');
  const ppCode = fs.readFileSync(path.join(ROOT, 'src/parent/parent-panel.js'), 'utf8');
  const boomiUi = fs.readFileSync(path.join(ROOT, 'src/tutor/boomi-ui.js'), 'utf8');

  assert(!/h2-card\s+ai|onclick="bank\(\)"|المنهج المتكامل/.test(navCode), 'nav.js must remove standalone المنهج المتكامل card and wording');
  assert(!/['"]BankReport['"]/.test(navCode), 'nav.js must not register helper BankReport in Lazy.lazyStub');
  assert(!/المنهج المتكامل/.test(boomiUi), 'boomi-ui.js must not reference standalone المنهج المتكامل');
  assert(!/المنهج المتكامل/.test(ppCode), 'parent-panel.js must not reference standalone المنهج المتكامل');

  const arBank = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/ar-bank.json'), 'utf8'));
  const enBank = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/en-bank.json'), 'utf8'));

  const P = {
    name: 'سارة',
    gender: 'female',
    age: '7',
    stage: 1,
    lang: 'both',
    star: 10,
    sc: {},
    done: { '0-0': 1 },
    cd: {},
    stories: {},
    act: {},
    courseDone: { 'ar-letters:حروف الهجاء-1': true },
    bank: {
      '0.0': { b: 0.9, n: 1 },
      'en:0.0': { b: 0.85, n: 1 },
      _a: { ar: [5, 5], en: [5, 5] },
      _t: {},
      _m: {}
    }
  };

  let lastHtml = '';
  const stagesDom = { ar: { innerHTML: '', querySelectorAll: () => [] }, en: { innerHTML: '', querySelectorAll: () => [] } };
  const dashDom = { ar: { innerHTML: '' }, en: { innerHTML: '' } };
  const secCalls = [];
  const noopEl = () => ({ style: {}, classList: { toggle: () => {}, add: () => {}, remove: () => {} }, querySelectorAll: () => [], insertBefore: () => {}, appendChild: () => {}, setAttribute: () => {}, innerHTML: '' });

  const ctx = vm.createContext({
    window: {},
    P,
    DB: { kids: [P], cur: 0 },
    BADGES: [],
    D: n => String(n),
    esc: s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])),
    units: st => (ctx.S[st] ? ctx.S[st].u : []),
    dueN: () => 0,
    day: () => '2026-11-25',
    load: () => P,
    ens: () => P,
    save: () => {},
    h: html => { lastHtml = html; },
    home: () => {},
    setup: () => {},
    who: () => {},
    sec: s => { secCalls.push(s); },
    lzList: html => `<div class="lz">${html}</div>`,
    fetch: file => Promise.resolve({
      json: () => Promise.resolve(file.startsWith('data/en-bank.json') ? enBank : arBank)
    }),
    document: {
      body: { firstChild: null, classList: { toggle: () => {} }, insertBefore: () => {}, appendChild: () => {} },
      head: { appendChild: () => {} },
      documentElement: { dataset: {} },
      createElement: noopEl,
      getElementById: id => {
        if (id === 'acad-stages-ar') return stagesDom.ar;
        if (id === 'acad-stages-en') return stagesDom.en;
        if (id === 'acad-dash-ar') return dashDom.ar;
        if (id === 'acad-dash-en') return dashDom.en;
        return null;
      },
      querySelector: () => null,
      querySelectorAll: () => [],
      addEventListener: () => {}
    },
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    matchMedia: () => ({ matches: false, addEventListener: () => {} }),
    console
  });
  ctx.window = ctx;

  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/core/curriculum-core.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/curriculum/course-data.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/curriculum/course-text.js'), 'utf8'), ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/curriculum/course.js'), 'utf8'), ctx);
  vm.runInContext(navCode, ctx);
  vm.runInContext(fs.readFileSync(path.join(ROOT, 'src/curriculum/bank.js'), 'utf8'), ctx);

  // Verify home() renders 2 academy cards and no المنهج المتكامل
  ctx.home();
  assert(!/h2-card\s+ai|onclick="bank\(\)"|المنهج المتكامل/.test(lastHtml), 'home() HTML must not contain المنهج المتكامل card');
  assert(/onclick="sec\('ar'\)"/.test(lastHtml) && /onclick="sec\('en'\)"/.test(lastHtml), 'home() must link directly to Arabic and English academies');

  // Verify legacy bank() and bankSub() redirect cleanly into real sec()
  const realSec = ctx.sec;
  ctx.sec = s => { secCalls.push(s); return realSec(s); };
  ctx.bank();
  ctx.bankSub('en');
  assert.deepStrictEqual(secCalls, ['ar', 'en'], 'Legacy bank()/bankSub() must redirect into Arabic/English academies');
  assert(/id=acad-stages-en/.test(lastHtml), 'sec("en") must render unified academy stages host');

  // Verify real lzList defers collapsed content cleanly, then expand all stages for full content verification
  assert(typeof ctx.lzList === 'function' && /data-lz=/.test(ctx.lzList('<b>x</b>')), 'nav.js lzList must lazily store collapsed stage contents');
  ctx.lzList = (html, cls) => `<div class="${cls || 'list'}">${html}</div>`;

  await ctx.mountAcademy('ar');
  await ctx.mountAcademy('en');

  const arHtml = stagesDom.ar.innerHTML;
  const enHtml = stagesDom.en.innerHTML;

  // Verify all bank lessons exist inside their target academies
  let arBankCount = 0;
  arBank.stages.forEach((st, si) => st.lessons.forEach((_, li) => {
    arBankCount++;
    assert(arHtml.includes(`bankLesson(${si},${li},'ar')`), `Missing Arabic bank lesson ${si}.${li} inside Arabic academy`);
  }));
  assert.strictEqual(arBankCount, 29, 'All 29 Arabic bank lessons must be present');

  let enBankCount = 0;
  enBank.stages.forEach((st, si) => st.lessons.forEach((_, li) => {
    enBankCount++;
    assert(enHtml.includes(`bankLesson(${si},${li},'en')`), `Missing English bank lesson ${si}.${li} inside English academy`);
  }));
  assert.strictEqual(enBankCount, 51, 'All 51 English bank lessons must be present');

  // Verify all core S+G units and all COURSE_MODULES resources exist
  ctx.S.forEach(st => st.u.forEach(u => {
    const target = u.l === 'ar' ? arHtml : enHtml;
    assert(target.includes(`lesson('${u.id}')`), `Missing core lesson ${u.id} in ${u.l} academy`);
  }));
  assert(arHtml.includes(`lesson('${ctx.G.g1.id}')`), 'Missing Arabic shape lesson g1');
  assert(enHtml.includes(`lesson('${ctx.G.g2.id}')`), 'Missing English shape lesson g2');

  ctx.COURSE_MODULES.forEach(m => m.resources.forEach(r => {
    const lang = m.lang === 'both' ? (/[A-Za-z]/.test(r.title || '') ? 'en' : 'ar') : m.lang;
    const target = lang === 'ar' ? arHtml : enHtml;
    assert(target.includes(`courseViewer('${m.id}','${r.id}','${lang}')`), `Missing course resource ${m.id}:${r.id} in ${lang} academy`);
  }));

  // Verify zero duplicate displayed titles within each stage
  const checkNoDuplicates = (html, lang) => {
    const stageChunks = html.split(/<details class="lesson-menu bank-st"[^>]*>/).slice(1);
    assert(stageChunks.length >= 5, `Expected progressive stages in ${lang} academy`);
    stageChunks.forEach((chunk, idx) => {
      const titles = [...chunk.matchAll(/<button class="row[^"]*"[^>]*><span>[^<]*<\/span><b>([\s\S]*?)<\/b>/g)]
        .map(m => m[1].replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim());
      const dupes = titles.filter((t, i) => titles.indexOf(t) !== i);
      assert.strictEqual(dupes.length, 0, `Duplicate lesson labels in ${lang} stage ${idx}: ${dupes.join(', ')}`);
    });
  };
  checkNoDuplicates(arHtml, 'ar');
  checkNoDuplicates(enHtml, 'en');

  // Verify mastery dashboard and badge preservation
  assert(dashDom.ar.innerHTML.includes("bankPractice('ar')"), 'Arabic academy dashboard must wire bankPractice');
  assert(dashDom.en.innerHTML.includes("bankPractice('en')"), 'English academy dashboard must wire bankPractice');
  assert(ctx.BADGES.some(b => b[0] === 'bk1' && b[3]()), 'bk1 badge must recognize preserved P.bank progress');

  // Verify academy sections removed redundant stories() and examHub() shortcuts while keeping teachers
  ctx.sec('ar');
  assert(!/onclick="stories\(\)"|examHub\(/.test(lastHtml), 'sec("ar") must not duplicate stories() or examHub() shortcuts');
  assert(/onclick="arTeach\(\)"/.test(lastHtml), 'sec("ar") must retain arTeach()');
  ctx.sec('en');
  assert(!/examHub\(/.test(lastHtml), 'sec("en") must not duplicate examHub() shortcut');
  assert(/onclick="enTeach\(\)"/.test(lastHtml), 'sec("en") must retain enTeach()');
});

test('Stories routes set CS to stories instead of games and render stories section cleanly', async () => {
  const routerCode = fs.readFileSync(path.join(ROOT, 'src/core/router.js'), 'utf8');
  const storiesCode = fs.readFileSync(path.join(ROOT, 'src/stories/stories.js'), 'utf8');
  const storiesBankCode = fs.readFileSync(path.join(ROOT, 'src/stories/stories-bank.js'), 'utf8');

  for (const fn of ['stories', 'story', 'talk', 'sbStory', 'sbQuiz', 'sbTest', 'listenTest', 'readTest']) {
    assert(new RegExp(`${fn}:\\s*\\{\\s*cs:\\s*'stories'`).test(routerCode), `Router CFG.${fn} must map cs to 'stories'`);
  }

  let rendered = '';
  const sbBody = { innerHTML: '' };
  const storiesBank = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/stories-bank.json'), 'utf8'));
  const ctx = vm.createContext({
    window: {},
    P: { name: 'سارة', gender: 'female', star: 0, stories: {} },
    S: [],
    V: 'home',
    CS: 'home',
    h: html => { rendered = html; },
    goBack: () => {},
    say: Object.assign(() => {}, { stop: () => {}, state: () => 'idle' }),
    fetch: () => Promise.resolve({ json: () => Promise.resolve(storiesBank) }),
    document: {
      getElementById: id => (id === 'sb-body' ? sbBody : null),
      querySelector: sel => (sel === '.sb-lib' ? {} : null),
      querySelectorAll: () => []
    },
    console
  });
  ctx.window = ctx;

  vm.runInContext(storiesCode, ctx);
  vm.runInContext(storiesBankCode, ctx);

  ctx.stories();
  assert.strictEqual(ctx.CS, 'stories', 'stories() must set CS to stories, not games');
  assert(/class="sec stories sb-lib"/.test(rendered), 'stories() must render stories library section');
  assert(/onclick="goBack\(\)"/.test(rendered), 'stories() must provide a back button');
  await new Promise(r => setImmediate(r));
  assert(/sbStory\(/.test(sbBody.innerHTML), 'stories() must populate #sb-body from stories-bank.json');

  ctx.stories('ar');
  assert.strictEqual(ctx.CS, 'stories', 'stories("ar") must set CS to stories, not games');
  assert(/class="sec stories"/.test(rendered), 'stories("ar") must render Arabic stories section');

  ctx.story('a1');
  assert.strictEqual(ctx.CS, 'stories', 'story() must set CS to stories, not games');
  ctx.talk('c1');
  assert.strictEqual(ctx.CS, 'stories', 'talk() must set CS to stories, not games');
});

test('Persistent TTS audio storage, DB metadata lookup-first, generate-once, and missing-only backfill', async () => {
  const os = require('os');
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'boomi-tts-test-'));
  const prevStorageDir = process.env.AUDIO_STORAGE_DIR;
  const prevDbPath = process.env.AUDIO_DB_PATH;
  const prevGemKey = process.env.GEMINI_API_KEY;
  const prevNetlify = process.env.NETLIFY;

  try {
    process.env.AUDIO_STORAGE_DIR = path.join(tmpDir, 'tts');
    process.env.AUDIO_DB_PATH = path.join(tmpDir, 'tts-audio.sqlite');
    delete process.env.NETLIFY;

    // Clear module cache so audio-storage/db/tts-provider use isolated test paths
    for (const m of ['server/audio-storage.js', 'server/audio-db.js', 'server/tts-provider.js', 'server/audio-catalog.js', 'server/gemini-client.js']) {
      delete require.cache[require.resolve(path.join(ROOT, m))];
    }

    const storage = require(path.join(ROOT, 'server/audio-storage.js'));
    const db = require(path.join(ROOT, 'server/audio-db.js'));
    const gemClient = require(path.join(ROOT, 'server/gemini-client.js'));

    // 1. Deterministic IDs & language/voice/tashkeel separation
    const id1 = storage.makeAudioId('أَسَدٌ جَمِيلٌ', 'Kore', 'ar');
    const id2 = storage.makeAudioId('أَسَدٌ جَمِيلٌ', 'Kore', 'ar');
    const idDiffVoice = storage.makeAudioId('أَسَدٌ جَمِيلٌ', 'Puck', 'ar');
    const idDiffTashkeel = storage.makeAudioId('أسد جميل', 'Kore', 'ar');
    const idEn = storage.makeAudioId('Hello world', 'Kore', 'en');
    const idAr = storage.makeAudioId('Hello world', 'Kore', 'ar');
    assert.strictEqual(id1, id2, 'Deterministic ID must be identical for same (text, voice, lang)');
    assert.notStrictEqual(id1, idDiffVoice, 'Different voices must yield different clip IDs');
    assert.notStrictEqual(id1, idDiffTashkeel, 'Arabic Tashkeel differences must remain distinct');
    assert.notStrictEqual(idEn, idAr, 'Different languages must yield different clip IDs');
    assert.throws(() => storage.validateStorageKey('tts/ar/Kore/../../etc/passwd.wav'), /invalid_storage_key/);

    // 2. Ephemeral Netlify guard without external Object Storage
    process.env.NETLIFY = 'true';
    assert.strictEqual(storage.isServerlessEphemeral(), true, 'Must detect Netlify serverless runtime');
    assert.strictEqual(storage.detectStorageProvider(), 'readonly-static', 'Must NOT pretend ephemeral Netlify disk is writable permanent storage');
    delete process.env.NETLIFY;

    // 3. Stub Gemini API to count exact invocations
    let geminiCalls = 0;
    const samplePcm = Buffer.alloc(4800, 1);
    const header = Buffer.alloc(44);
    header.write('RIFF', 0);
    header.writeUInt32LE(36 + samplePcm.length, 4);
    header.write('WAVE', 8);
    header.write('fmt ', 12);
    header.writeUInt32LE(16, 16);
    header.writeUInt16LE(1, 20);
    header.writeUInt16LE(1, 22);
    header.writeUInt32LE(24000, 24);
    header.writeUInt32LE(48000, 28);
    header.writeUInt16LE(2, 32);
    header.writeUInt16LE(16, 34);
    header.write('data', 36);
    header.writeUInt32LE(samplePcm.length, 40);
    const fakeWavB64 = Buffer.concat([header, samplePcm]).toString('base64');

    gemClient.getGemini = async () => ({
      ai: {
        models: {
          generateContent: async () => {
            geminiCalls++;
            await new Promise(r => setTimeout(r, 15));
            return { candidates: [{ content: { parts: [{ inlineData: { data: fakeWavB64 } }] } }] };
          }
        }
      }
    });

    const tts = require(path.join(ROOT, 'server/tts-provider.js'));

    // Concurrent requests for same un-generated text must invoke Gemini ONLY ONCE
    const [rA, rB] = await Promise.all([
      tts.synthesizeSpeech({ text: 'بَيْتٌ جَمِيلٌ', lang: 'ar', voiceId: 'kore', mood: 'happy', sourceType: 'lesson', sourceRef: '0-0' }),
      tts.synthesizeSpeech({ text: 'بَيْتٌ جَمِيلٌ', lang: 'ar', voiceId: 'kore', mood: 'normal', sourceType: 'story', sourceRef: 'a1' })
    ]);
    assert.strictEqual(geminiCalls, 1, 'Concurrent identical requests must call Gemini only once');
    assert.strictEqual(rA.audioId, rB.audioId);
    assert.strictEqual(rA.persisted, true, 'Generated audio must be persisted to permanent storage + DB');

    // Verify DB record exists and file exists on storage
    const dbRow = await db.getById(rA.audioId);
    assert(dbRow && dbRow.storage_key === rA.storageKey, 'DB must record permanent storage_key and metadata');
    assert.strictEqual(await storage.hasAudio(rA.storageKey), true, 'Audio file must exist in permanent storage');

    // Simulate server restart + broken/missing Gemini API key: saved clip MUST still play from DB + Storage!
    delete require.cache[require.resolve(path.join(ROOT, 'server/tts-provider.js'))];
    gemClient.getGemini = async () => { throw new Error('upstream_down'); };
    process.env.GEMINI_API_KEY = '';
    const ttsAfterRestart = require(path.join(ROOT, 'server/tts-provider.js'));
    const catalog = require(path.join(ROOT, 'server/audio-catalog.js'));

    const hitAfterRestart = await ttsAfterRestart.synthesizeSpeech({ text: 'بَيْتٌ جَمِيلٌ', lang: 'ar', voiceId: 'kore', mood: 'soft' });
    assert.strictEqual(hitAfterRestart.cached, true, 'Saved audio must be reused after restart without calling Gemini');
    assert.strictEqual(geminiCalls, 1, 'Gemini must NOT be called again for already-saved audio');
    const clipDirect = await ttsAfterRestart.getSavedClipById(rA.audioId);
    assert(clipDirect && clipDirect.audio.length === header.length + samplePcm.length, 'Direct clip lookup must serve full saved WAV');
    await assert.rejects(
      () => ttsAfterRestart.synthesizeSpeech({ text: 'نَصٌّ غَيْرُ مَحْفُوظٍ', lang: 'ar', voiceId: 'kore' }),
      /upstream_down/,
      'Uncached text fails cleanly when Gemini is unavailable without affecting saved clips'
    );

    // 4. Curriculum catalog & missing-only backfill
    const items = catalog.collectCatalog({ lang: 'all' });
    assert(items.length >= 3000, `Expected full curriculum+stories catalog (>=3000 unique items), got ${items.length}`);

    // Restore stubbed Gemini for missing-only backfill test (pre-seed first catalog item, verify backfill skips it)
    const firstItem = items[0];
    let backfillGenCalls = 0;
    gemClient.getGemini = async () => ({
      ai: {
        models: {
          generateContent: async () => {
            backfillGenCalls++;
            return { candidates: [{ content: { parts: [{ inlineData: { data: fakeWavB64 } }] } }] };
          }
        }
      }
    });
    await ttsAfterRestart.synthesizeSpeech({ text: firstItem.cleanText, lang: firstItem.lang, voiceId: 'kore', sourceType: firstItem.sourceType });
    assert.strictEqual(backfillGenCalls, 1);

    const bf = await catalog.generateMissingAudio({ voiceId: 'kore', lang: 'all', limit: 2, concurrency: 1, delayMs: 0 });
    assert.strictEqual(bf.generated, 2, 'Backfill must generate only the requested missing limit');
    assert(bf.alreadySavedBefore >= 1, 'Audit must count already-saved clips and skip them');
    assert.strictEqual(backfillGenCalls, 3, 'Pre-saved clip must NOT be regenerated by backfill');

    // 5. Client voice.js must check permanent clip endpoint / static audio pack before generating/streaming
    const voiceJs = fs.readFileSync(path.join(ROOT, 'src/shared/voice.js'), 'utf8');
    assert(/computeAudioId/.test(voiceJs) && /\/api\/tts\/clip\//.test(voiceJs) && /\/audio\/tts\//.test(voiceJs), 'voice.js must check deterministic saved clips before Gemini');

    // 6. Zero extra API keys required across .env.example, storage, DB, and Netlify Blobs runtime
    assert.strictEqual(storage.getStorageInfo().extraApiKeysRequired, false);
    assert.strictEqual(db.getDbInfo().extraApiKeysRequired, false);
    const envEx = fs.readFileSync(path.join(ROOT, '.env.example'), 'utf8');
    assert(!/S3_ACCESS_KEY_ID|SUPABASE_SERVICE_ROLE_KEY|TURSO_AUTH_TOKEN|NETLIFY_BLOBS_TOKEN/.test(envEx), '.env.example must not ask for extra storage/DB API keys');
    const netlifyFn = fs.readFileSync(path.join(ROOT, 'netlify/functions/tts.js'), 'utf8');
    assert(/connectLambda/.test(netlifyFn) && /enableNetlifyBlobs/.test(netlifyFn), 'netlify/functions/tts.js must wire native key-free Netlify Blobs');
  } finally {
    for (const m of ['server/audio-storage.js', 'server/audio-db.js', 'server/tts-provider.js', 'server/audio-catalog.js', 'server/gemini-client.js']) {
      delete require.cache[require.resolve(path.join(ROOT, m))];
    }
    if (prevStorageDir === undefined) delete process.env.AUDIO_STORAGE_DIR; else process.env.AUDIO_STORAGE_DIR = prevStorageDir;
    if (prevDbPath === undefined) delete process.env.AUDIO_DB_PATH; else process.env.AUDIO_DB_PATH = prevDbPath;
    if (prevGemKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = prevGemKey;
    if (prevNetlify === undefined) delete process.env.NETLIFY; else process.env.NETLIFY = prevNetlify;
    fs.rmSync(tmpDir, { recursive: true, force: true });
  }
});

Promise.all(pending).then(() => {
  if (!process.exitCode) {
    console.log(`\nALL ${passed} TESTS PASSED`);
  }
});
