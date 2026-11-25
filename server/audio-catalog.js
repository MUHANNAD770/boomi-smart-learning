'use strict';

/**
 * server/audio-catalog.js
 * مستخرج فهرس المحتوى الصوتي الموحّد للأكاديمية العربية والإنجليزية والقصص والاختبارات:
 *  • يجمع جميع الكلمات والجمل والأسئلة والشروحات والقصص والمحادثات بدون تكرار.
 *  • يحسب المعرّف الثابت لكل (نص منظّف بالتشكيل، صوت، لغة).
 *  • يدعم فحص الأصوات الناقصة وتوليد الناقص فقط دون إعادة توليد الملفات المحفوظة.
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');
const tts = require('./tts-provider');
const audioDb = require('./audio-db');
const audioStorage = require('./audio-storage');

const ROOT = path.resolve(__dirname, '..');

function loadCurriculumVm() {
  const ctx = vm.createContext({
    window: {},
    console,
    localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
    document: { addEventListener: () => {}, querySelector: () => null, querySelectorAll: () => [] },
    navigator: {},
    matchMedia: () => ({ matches: false, addEventListener: () => {} })
  });
  ctx.window = ctx;

  for (const rel of [
    'src/core/curriculum-core.js',
    'src/stories/stories.js',
    'src/stories/stories2.js',
    'src/curriculum/course-data.js'
  ]) {
    const abs = path.join(ROOT, rel);
    if (fs.existsSync(abs)) {
      vm.runInContext(fs.readFileSync(abs, 'utf8'), ctx);
    }
  }
  return ctx;
}

function collectCatalog({ lang = 'all', sourceType = 'all' } = {}) {
  const ctx = loadCurriculumVm();
  const byKey = new Map();

  const pushItem = (rawText, hintLang, srcType, srcRef) => {
    const clean = tts.cleanSpeechText(rawText);
    if (!clean) return;
    const langMode = tts.detectLang(clean, hintLang);
    if (lang && lang !== 'all' && langMode !== lang) return;
    if (sourceType && sourceType !== 'all' && srcType !== sourceType) return;

    const dedupeKey = `${langMode}\0${clean}`;
    if (!byKey.has(dedupeKey)) {
      byKey.set(dedupeKey, {
        cleanText: clean,
        lang: langMode,
        sourceType: srcType,
        sourceRef: String(srcRef || '')
      });
    }
  };

  // 1. المنهج الموحّد الأساسي (S و G): الحروف والكلمات والجمل في الأكاديميتين
  for (const st of (ctx.S || [])) {
    for (const u of (st.u || [])) {
      for (const it of (u.i || [])) {
        if (it && it[0]) pushItem(it[0], it[2] || u.l || 'ar', 'lesson', u.id || u.n);
      }
    }
  }
  if (ctx.G) {
    for (const u of Object.values(ctx.G)) {
      for (const it of (u.i || [])) {
        if (it && it[0]) pushItem(it[0], it[2] || u.l || 'ar', 'lesson', u.id || u.n);
      }
    }
  }

  // 2. بنوك الأسئلة والتدريبات العربية والإنجليزية (ar-bank.json & en-bank.json)
  for (const [fileRel, bankTag] of [['data/ar-bank.json', 'ar-bank'], ['data/en-bank.json', 'en-bank']]) {
    const abs = path.join(ROOT, fileRel);
    if (!fs.existsSync(abs)) continue;
    const bank = JSON.parse(fs.readFileSync(abs, 'utf8'));
    for (const st of (bank.stages || [])) {
      for (const l of (st.lessons || [])) {
        for (const q of (l.q || [])) {
          if (q.t) pushItem(q.t, 'ar', 'question', `${bankTag}:${q.id || l.name}`);
          if (q.t_en) pushItem(q.t_en, 'en', 'question', `${bankTag}:${q.id || l.name}:en`);
          if (q.e) pushItem(q.e, 'ar', 'sentence', `${bankTag}:${q.id || l.name}:exp`);
        }
      }
    }
  }

  // 3. القصص والمحادثات المدمجة (stories.js & stories2.js)
  for (const s of (ctx.STORIES?.AR || [])) {
    pushItem(s.t, 'ar', 'story', `story:${s.id}`);
    (s.s || []).forEach((line, idx) => pushItem(line, 'ar', 'story', `story:${s.id}:s${idx + 1}`));
    (s.q || []).forEach((q, idx) => pushItem(q[0], 'ar', 'question', `story:${s.id}:q${idx + 1}`));
  }
  for (const s of (ctx.STORIES?.EN || [])) {
    pushItem(s.t, 'en', 'story', `story:${s.id}`);
    (s.s || []).forEach((line, idx) => pushItem(line, 'en', 'story', `story:${s.id}:s${idx + 1}`));
    (s.q || []).forEach((q, idx) => pushItem(q[0], 'en', 'question', `story:${s.id}:q${idx + 1}`));
  }
  for (const s of (ctx.STORIES?.TALK || [])) {
    (s.d || []).forEach((line, idx) => pushItem(line[1], 'en', 'sentence', `talk:${s.id}:d${idx + 1}`));
    (s.q || []).forEach((q, idx) => pushItem(q[0], 'en', 'question', `talk:${s.id}:q${idx + 1}`));
  }

  // 4. مكتبة القصص المتدرجة (data/stories-bank.json)
  const stBankAbs = path.join(ROOT, 'data', 'stories-bank.json');
  if (fs.existsSync(stBankAbs)) {
    const stBank = JSON.parse(fs.readFileSync(stBankAbs, 'utf8'));
    for (const st of (stBank.stages || [])) {
      for (const s of (st.stories || [])) {
        const sl = s.l === 'en' ? 'en' : 'ar';
        (s.s || []).forEach((line, idx) => pushItem(line, sl, 'story', `sb:${s.id}:s${idx + 1}`));
        (s.tr || []).forEach((line, idx) => pushItem(line, 'en', 'story', `sb:${s.id}:tr${idx + 1}`));
        (s.v || []).forEach((w, idx) => {
          if (w && w[0]) pushItem(w[0], sl, 'word', `sb:${s.id}:v${idx + 1}`);
          if (w && w[1]) pushItem(w[1], /[\u0600-\u06FF]/.test(w[1]) ? 'ar' : 'en', 'word', `sb:${s.id}:vm${idx + 1}`);
        });
        (s.x || []).forEach((q, idx) => {
          if (q.q) pushItem(q.q, sl, 'question', `sb:${s.id}:x${idx + 1}`);
          if (q.qar) pushItem(q.qar, 'ar', 'question', `sb:${s.id}:xar${idx + 1}`);
        });
        (s.T || []).forEach((q, idx) => {
          if (q.q) pushItem(q.q, sl, 'question', `sb:${s.id}:T${idx + 1}`);
          if (q.qar) pushItem(q.qar, 'ar', 'question', `sb:${s.id}:Tar${idx + 1}`);
        });
      }
    }
  }

  // 5. مفردات الدروس التفاعلية (course-data.js)
  for (const [pageKey, blocks] of Object.entries(ctx.COURSE_TEXT || {})) {
    if (!Array.isArray(blocks)) continue;
    for (const b of blocks) {
      if (b && b.t === 'words' && Array.isArray(b.x)) {
        for (const w of b.x) pushItem(w, b.l || 'en', 'word', pageKey);
      }
    }
  }

  return [...byKey.values()];
}

async function auditMissingAudio({ voiceId = 'kore', lang = 'all', sourceType = 'all' } = {}) {
  const voice = tts.resolveVoice(voiceId);
  const items = collectCatalog({ lang, sourceType });
  const enriched = items.map(item => {
    const audioId = audioStorage.makeAudioId(item.cleanText, voice.voiceName, item.lang);
    const storageKey = audioStorage.makeStorageKey(audioId, voice.voiceName, item.lang);
    return { ...item, audioId, storageKey, voiceId: voice.id, voiceName: voice.voiceName };
  });

  const dbHits = await audioDb.hasIds(enriched.map(x => x.audioId));
  const missing = [];
  let savedCount = 0;

  for (const item of enriched) {
    let exists = dbHits.has(item.audioId);
    if (!exists) {
      exists = await audioStorage.hasAudio(item.storageKey);
    }
    if (exists) savedCount++;
    else missing.push(item);
  }

  return {
    voiceId: voice.id,
    voiceName: voice.voiceName,
    totalCatalog: enriched.length,
    savedCount,
    missingCount: missing.length,
    missing
  };
}

async function generateMissingAudio({
  voiceId = 'kore',
  lang = 'all',
  sourceType = 'all',
  limit = 0,
  concurrency = 2,
  delayMs = 120,
  mirrorStatic = false,
  onProgress
} = {}) {
  const audit = await auditMissingAudio({ voiceId, lang, sourceType });
  const queue = limit > 0 ? audit.missing.slice(0, Number(limit)) : audit.missing.slice();
  const totalToProcess = queue.length;
  const workers = Math.max(1, Math.min(4, Number(concurrency) || 2));

  let generated = 0;
  let skippedExisting = audit.savedCount;
  let failed = 0;
  const errors = [];
  let idx = 0;

  async function worker() {
    for (;;) {
      const i = idx++;
      if (i >= queue.length) break;
      const item = queue[i];
      try {
        const res = await tts.synthesizeSpeech({
          text: item.cleanText,
          lang: item.lang,
          voiceId: item.voiceId,
          sourceType: item.sourceType,
          sourceRef: item.sourceRef,
          mirrorStatic
        });
        if (res.cached) skippedExisting++;
        else generated++;
      } catch (err) {
        failed++;
        if (errors.length < 25) {
          errors.push({
            audioId: item.audioId,
            text: item.cleanText.slice(0, 60),
            error: String(err?.message || err).slice(0, 140)
          });
        }
      }
      if (typeof onProgress === 'function') {
        try {
          onProgress({ done: generated + failed, total: totalToProcess, generated, failed, skippedExisting });
        } catch {}
      }
      if (delayMs > 0) await new Promise(r => setTimeout(r, delayMs));
    }
  }

  await Promise.all(Array.from({ length: Math.min(workers, Math.max(1, queue.length)) }, () => worker()));

  return {
    voiceId: audit.voiceId,
    totalCatalog: audit.totalCatalog,
    alreadySavedBefore: audit.savedCount,
    attempted: totalToProcess,
    generated,
    skippedExisting,
    failed,
    remainingMissing: Math.max(0, audit.missingCount - generated),
    errors
  };
}

module.exports = {
  collectCatalog,
  auditMissingAudio,
  generateMissingAudio
};
