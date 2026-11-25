/* src/shared/voice.js — محرّك الصوت الموحّد لبومي عبر Google Gemini Text-to-Speech:
   • يعتمد حصريًا على خدمة Google Gemini TTS على الخادم (/api/tts و /api/tts-stream) بلا أي اعتماد على صوت المتصفح الافتراضي.
   • إعدادات صوت مركزية موحّدة (BumiVoiceConfig) مع تخزين مؤقت ذكي في الذاكرة و CacheStorage لتقليل التأخير والموارد.
   • ينظّف النصوص من الوسوم البرمجية وعلامات التنسيق والنصوص المخفية والرموز التعبيرية لينطق النص المعروض بدقة.
   • يدعم الإيقاف المؤقت (Pause)، والاستكمال (Resume)، والإعادة (Replay)، والإيقاف (Stop) مع شريط تحكّم مرئي أنيق. */
(() => {
  'use strict';

  const CACHE_NAME = 'hurufi-gemini-tts-v1';
  const TTS_ENDPOINT = '/api/tts';
  const TTS_STREAM_ENDPOINT = '/api/tts-stream';

  // تنظيف آثار مزوّدي الصوت السابقين من الكاش والتخزين المحلي
  try {
    localStorage.removeItem('hurufi-tts');
    if (window.caches) {
      caches.keys().then(ks => {
        ks.filter(k => /^hurufi-(clips|model-tts|tts-v|myvoice)/i.test(k)).forEach(k => caches.delete(k));
      }).catch(() => {});
    }
  } catch (_) {}

  const VOICES = [
    { id: 'kore', geminiVoice: 'Kore', gender: 'female', label: 'المعلّمة نُور', badge: '👩 معلمة', desc: 'صوت دافئ، واضح، وودود للأطفال بالعربية والإنجليزية' },
    { id: 'zephyr', geminiVoice: 'Zephyr', gender: 'female', label: 'المعلّمة رِيم', badge: '👩 معلمة', desc: 'صوت هادئ ولطيف للقصص والشرح' },
    { id: 'puck', geminiVoice: 'Puck', gender: 'male', label: 'المعلّم زَيد', badge: '👨 معلم', desc: 'صوت مرح، واضح، ومشجّع للأطفال' },
    { id: 'charon', geminiVoice: 'Charon', gender: 'male', label: 'المعلّم طَارق', badge: '👨 معلم', desc: 'صوت رصين وواضح للشرح والقواعد' },
    { id: 'fenrir', geminiVoice: 'Fenrir', gender: 'male', label: 'المعلّم كَريم', badge: '👨 معلم', desc: 'صوت حيوي ومناسب للتحديات والاختبارات' }
  ];

  const VOICE_MAP = Object.fromEntries(VOICES.map(v => [v.id, v]));

  function resolveVoiceId(raw) {
    const id = String(raw || '').toLowerCase().trim();
    if (id === 'female') return 'kore';
    if (id === 'male') return 'puck';
    return VOICE_MAP[id] ? id : 'kore';
  }

  function migrateProfileVoice() {
    const p = window.P;
    if (!p) return 'kore';
    let dirty = false;
    ['myv', 'vmode', 'voice', 'voiceCloud'].forEach(k => {
      if (k in p) { delete p[k]; dirty = true; }
    });
    const resolved = resolveVoiceId(p.voiceId || p.teacher || 'kore');
    if (p.voiceId !== resolved) { p.voiceId = resolved; dirty = true; }
    const g = VOICE_MAP[resolved].gender;
    if (p.teacher !== g) { p.teacher = g; dirty = true; }
    if (p.autoSpeak === undefined) { p.autoSpeak = 1; dirty = true; }
    if (dirty && typeof window.save === 'function') {
      try { window.save(); } catch (_) {}
    }
    return resolved;
  }

  const BumiVoiceConfig = {
    provider: 'gemini-tts',
    endpoint: TTS_ENDPOINT,
    streamEndpoint: TTS_STREAM_ENDPOINT,
    voices: VOICES,
    getVoice(id) {
      const resolved = resolveVoiceId(id || (window.P && (P.voiceId || P.teacher)) || 'kore');
      return VOICE_MAP[resolved];
    },
    getSettings() {
      const p = window.P || {};
      const voiceId = resolveVoiceId(p.voiceId || p.teacher || 'kore');
      const rate = Math.max(0.75, Math.min(1.25, Number(p.rate) || 0.95));
      const vol = p.vol == null ? 1 : Math.max(0.1, Math.min(1, Number(p.vol)));
      const autoSpeak = p.autoSpeak !== 0;
      const enabled = !(p.muted || p.snd === 0);
      return { provider: 'gemini-tts', voiceId, voice: VOICE_MAP[voiceId], rate, vol, autoSpeak, enabled };
    },
    updateSettings(patch = {}) {
      if (!window.P) return this.getSettings();
      if (patch.voiceId !== undefined) {
        const vid = resolveVoiceId(patch.voiceId);
        P.voiceId = vid;
        P.teacher = VOICE_MAP[vid].gender;
      }
      if (patch.rate !== undefined) P.rate = Math.max(0.75, Math.min(1.25, Number(patch.rate) || 0.95));
      if (patch.vol !== undefined) P.vol = Math.max(0.1, Math.min(1, Number(patch.vol)));
      if (patch.autoSpeak !== undefined) P.autoSpeak = patch.autoSpeak ? 1 : 0;
      if (patch.enabled !== undefined) {
        P.snd = patch.enabled ? 1 : 0;
        P.muted = !patch.enabled;
      }
      try { window.save && window.save(); } catch (_) {}
      if (masterGain && audioCtx) {
        try { masterGain.gain.setValueAtTime(this.getSettings().vol, audioCtx.currentTime); } catch (_) {}
      }
      if (activeHtmlAudio) {
        try { activeHtmlAudio.volume = this.getSettings().vol; } catch (_) {}
      }
      return this.getSettings();
    }
  };
  window.BumiVoiceConfig = BumiVoiceConfig;

  window.muted = () => !!(window.P && (P.muted || P.snd === 0));

  let navEpoch = 0;
  window.BumiAudio = {
    epoch: () => navEpoch,
    navigate: () => { navEpoch++; try { say.stop(); } catch (_) {} return navEpoch; },
    within: arg => (typeof arg === 'function' ? arg() : arg === navEpoch),
    stale: ep => (ep === undefined ? false : ep !== navEpoch)
  };

  /* ---------- تنظيف النص المعروض ومنع نطق الرموز البرمجية أو التنسيقية أو المخفية ---------- */
  function cleanSpeechText(raw) {
    let t = String(raw == null ? '' : raw);
    t = t
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' ')
      .replace(/```[\s\S]*?```/g, ' ')
      .replace(/`([^`]+)`/g, (_, inner) => (/[{}();=<>/\\$]/.test(inner) ? ' ' : ` ${inner} `))
      .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
      .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
      .replace(/https?:\/\/\S+/gi, ' ')
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/[*_~|<>^$\\]/g, ' ')
      .replace(/[«»""''„‟`´]/g, ' ')
      .replace(/[←→⟵⟶⬅➡⬆⬇▶▶️⏸️⏹️🔁🔊🎧🎤💡🗑️✕✓✔❌⭐🌟🏆📘📖🦉👦👧]/g, ' ')
      .replace(/[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\uFE0F\u200D\u20E3]/gu, ' ')
      .replace(/_{2,}/g, ' ')
      .replace(/\s+([،؛؟!.?,:])/g, '$1')
      .replace(/\s+/g, ' ')
      .trim();
    if (!/[\p{L}\p{N}]/u.test(t)) return '';
    return (t.normalize ? t.normalize('NFC') : t).slice(0, 1500);
  }

  function detectLang(text, hint) {
    const ar = (text.match(/[\u0600-\u06FF]/g) || []).length;
    const en = (text.match(/[A-Za-z]/g) || []).length;
    if (ar > 0 && en > 0) return 'mixed';
    if (hint === 'en' && en > 0) return 'en';
    if (hint === 'ar' && ar > 0) return 'ar';
    return en > ar ? 'en' : 'ar';
  }

  async function computeAudioId(cleanText, voiceName, langMode) {
    if (!window.crypto || !crypto.subtle) return '';
    try {
      const norm = (cleanText.normalize ? cleanText.normalize('NFC') : cleanText).trim();
      const bytes = new TextEncoder().encode(`${voiceName}\0${langMode}\0${norm}`);
      const digest = await crypto.subtle.digest('SHA-256', bytes);
      return Array.from(new Uint8Array(digest))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
        .slice(0, 32);
    } catch (_) {
      return '';
    }
  }

  function extractVisibleText(nodeOrSelector) {
    const el = typeof nodeOrSelector === 'string' ? document.querySelector(nodeOrSelector) : nodeOrSelector;
    if (!el) return '';
    const skip = 'script,style,code,pre,textarea,svg,canvas,[hidden],[aria-hidden="true"]';
    const parts = [];
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentElement;
        if (!p || p.closest(skip)) return NodeFilter.FILTER_REJECT;
        for (let cur = p; cur && cur !== el; cur = cur.parentElement) {
          if (cur.hidden) return NodeFilter.FILTER_REJECT;
          try { if (getComputedStyle(cur).display === 'none' || getComputedStyle(cur).visibility === 'hidden') return NodeFilter.FILTER_REJECT; } catch (_) {}
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n;
    while ((n = walker.nextNode())) {
      if (n.nodeValue && n.nodeValue.trim()) parts.push(n.nodeValue);
    }
    return cleanSpeechText(parts.join(' '));
  }

  function prepSpeechText(text, lang) {
    let t = cleanSpeechText(text);
    if (!t || lang === 'en') return t;
    try {
      if (window.Tashkeel && Tashkeel.apply && !/[ً-ْ]/.test(t)) {
        t = Tashkeel.apply(t);
      }
    } catch (_) {}
    return cleanSpeechText(t);
  }

  function splitSentences(text, maxLen = 420) {
    const t = cleanSpeechText(text);
    if (!t) return [];
    if (t.length <= maxLen) return [t];
    const rough = t.split(/(?<=[.!؟?\n])\s+/);
    const out = [];
    let buf = '';
    for (const part of rough) {
      const p = part.trim();
      if (!p) continue;
      if (buf && (buf.length + 1 + p.length) > maxLen) {
        out.push(buf);
        buf = p;
      } else {
        buf = buf ? `${buf} ${p}` : p;
      }
    }
    if (buf) out.push(buf);
    return out.length ? out : [t];
  }

  function splitParts(text, defLang) {
    const clean = cleanSpeechText(text);
    if (!clean) return [];
    const tokens = clean.match(/[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FFً-ْٰ\s،؛؟!.,:()\-]+|[A-Za-z0-9][A-Za-z0-9\s'.,!?:\-/]*/g) || [clean];
    const parts = [];
    for (const raw of tokens) {
      const s = raw.trim();
      if (!s) continue;
      const hasAr = /[\u0600-\u06FF]/.test(s);
      const hasEn = /[A-Za-z]/.test(s);
      if (!hasAr && !hasEn && !/[0-9]/.test(s)) continue;
      const l = hasAr && !hasEn ? 'ar' : hasEn && !hasAr ? 'en' : (defLang || 'ar');
      if (parts.length && parts[parts.length - 1][1] === l && (parts[parts.length - 1][0].length + s.length) < 420) {
        parts[parts.length - 1][0] += ' ' + s;
      } else {
        parts.push([s, l]);
      }
    }
    return parts.length ? parts : [[clean, defLang || (/[\u0600-\u06FF]/.test(clean) ? 'ar' : 'en')]];
  }

  /* ---------- محرّك Web Audio + التخزين المؤقت + التحكّم بالتشغيل ---------- */
  let audioCtx = null;
  let masterGain = null;
  let analyser = null;
  let activeSources = new Set();
  let activeHtmlAudio = null;
  let activeCtrl = null;
  let rafLevel = 0;
  let pulseTimer = null;

  let playState = 'idle'; // 'idle' | 'loading' | 'playing' | 'paused' | 'error'
  let lastErrorMsg = '';
  let lastJob = null; // { kind: 'single'|'list', text, lang, mood, list }
  let currentJob = null;
  let pauseGate = null; // { promise, resolve }
  let playerHideTimer = 0;
  const listeners = new Set();

  // ذاكرة مؤقتة داخلية (LRU) لمقاطع AudioBuffer / WAV لتشغيل فوري وتقليل الطلبات
  const MEM_CACHE = new Map();
  const MAX_MEM = 120;

  function cachePut(k, val) {
    if (MEM_CACHE.has(k)) MEM_CACHE.delete(k);
    while (MEM_CACHE.size >= MAX_MEM) {
      const oldest = MEM_CACHE.keys().next().value;
      if (oldest === undefined) break;
      MEM_CACHE.delete(oldest);
    }
    MEM_CACHE.set(k, val);
  }

  function makeKey(text, lang, voiceId) {
    const langMode = detectLang(text, lang);
    return `${voiceId}|${langMode}|${text}`;
  }

  function ensureAudioCtx() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx || audioCtx.state === 'closed') {
      audioCtx = new AC();
      masterGain = audioCtx.createGain();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;
      masterGain.gain.value = BumiVoiceConfig.getSettings().vol;
      masterGain.connect(analyser);
      analyser.connect(audioCtx.destination);
    }
    if (audioCtx.state === 'suspended' && playState !== 'paused') {
      audioCtx.resume().catch(() => {});
    }
    if (masterGain) {
      try { masterGain.gain.setValueAtTime(BumiVoiceConfig.getSettings().vol, audioCtx.currentTime); } catch (_) {}
    }
    return audioCtx;
  }

  function startLipSync(mood) {
    try { window.onTalk && window.onTalk(true); } catch (_) {}
    if (mood && window.MC && MC.mood) {
      try { MC.mood(mood, 2500); } catch (_) {}
    }
    cancelAnimationFrame(rafLevel);
    clearInterval(pulseTimer);

    if (analyser && window.MC && MC.level) {
      const bins = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (playState !== 'playing') return;
        analyser.getByteTimeDomainData(bins);
        let peak = 0;
        for (let i = 0; i < bins.length; i++) {
          const d = Math.abs(bins[i] - 128) / 128;
          if (d > peak) peak = d;
        }
        try { MC.level(Math.min(1, peak * 3.2)); } catch (_) {}
        rafLevel = requestAnimationFrame(tick);
      };
      rafLevel = requestAnimationFrame(tick);
    } else {
      pulseTimer = setInterval(() => {
        if (playState === 'playing') {
          try { window.MC && MC.pulse && MC.pulse(); } catch (_) {}
        }
      }, 170);
    }
  }

  function stopLipSync() {
    cancelAnimationFrame(rafLevel);
    clearInterval(pulseTimer);
    try { window.onTalk && window.onTalk(false); } catch (_) {}
  }

  function setState(next, errMsg = '') {
    playState = next;
    lastErrorMsg = errMsg;
    say.live = next === 'playing' || next === 'loading';
    if (next === 'playing') startLipSync(currentJob && currentJob.mood);
    else stopLipSync();
    renderPlayer();
    for (const fn of listeners) {
      try { fn(next, { error: errMsg, last: lastJob }); } catch (_) {}
    }
  }

  function clearActiveSources() {
    for (const s of [...activeSources]) {
      try { s.onended = null; s.stop(); } catch (_) {}
      try { s.disconnect(); } catch (_) {}
      activeSources.delete(s);
    }
    if (activeHtmlAudio) {
      try {
        activeHtmlAudio.pause();
        activeHtmlAudio.src = '';
      } catch (_) {}
      activeHtmlAudio = null;
    }
  }

  function waitIfPaused(token, ep) {
    if (playState !== 'paused') return Promise.resolve(token === say.tk && ep === navEpoch);
    if (!pauseGate) {
      let resolve;
      const promise = new Promise(r => { resolve = r; });
      pauseGate = { promise, resolve };
    }
    return pauseGate.promise.then(() => token === say.tk && ep === navEpoch);
  }

  function releasePauseGate() {
    if (pauseGate) {
      const g = pauseGate;
      pauseGate = null;
      try { g.resolve(); } catch (_) {}
    }
  }

  async function readCacheStorage(key) {
    if (!window.caches) return null;
    try {
      const c = await caches.open(CACHE_NAME);
      const res = await c.match('/__tts_cache__/' + encodeURIComponent(key));
      if (!res) return null;
      return await res.arrayBuffer();
    } catch (_) {
      return null;
    }
  }

  async function writeCacheStorage(key, arrayBuffer) {
    if (!window.caches || !arrayBuffer || arrayBuffer.byteLength > 2 * 1024 * 1024) return;
    try {
      const c = await caches.open(CACHE_NAME);
      const resp = new Response(arrayBuffer.slice(0), {
        headers: { 'Content-Type': 'audio/wav' }
      });
      await c.put('/__tts_cache__/' + encodeURIComponent(key), resp);
    } catch (_) {}
  }

  function pcm16ToAudioBuffer(ctx, uint8Chunk) {
    const evenBytes = uint8Chunk.byteLength - (uint8Chunk.byteLength % 2);
    if (evenBytes <= 0) return null;
    const view = new DataView(uint8Chunk.buffer, uint8Chunk.byteOffset, evenBytes);
    const samples = evenBytes / 2;
    const audioBuf = ctx.createBuffer(1, samples, 24000);
    const ch = audioBuf.getChannelData(0);
    for (let i = 0; i < samples; i++) {
      ch[i] = view.getInt16(i * 2, true) / 32768;
    }
    return audioBuf;
  }

  function concatUint8(chunks) {
    const total = chunks.reduce((n, c) => n + c.byteLength, 0);
    const out = new Uint8Array(total);
    let off = 0;
    for (const c of chunks) {
      out.set(c, off);
      off += c.byteLength;
    }
    return out;
  }

  function humanTtsError(status, code) {
    if (navigator.onLine === false) return 'انقطع الاتصال بالإنترنت، تعذّر تشغيل صوت بومي.';
    if (code === 'auth' || code === 'not_configured') return 'خدمة صوت Google Gemini غير مفعّلة بالمفتاح الصحيح على الخادم.';
    if (code === 'quota' || code === 'rate' || status === 429) return 'تم تجاوز حد طلبات الصوت مؤقتًا، انتظر قليلًا.';
    if (code === 'busy' || status === 503) return 'خدمة الصوت مشغولة قليلًا الآن، حاول مرة أخرى.';
    if (code === 'timeout' || status === 504) return 'استغرق تحميل الصوت وقتًا أطول من المعتاد.';
    return 'تعذّر توليد الصوت من Google Gemini الآن.';
  }

  function playDecodedBuffer(ctx, audioBuf, rate, token, ep) {
    return new Promise(resolve => {
      if (token !== say.tk || ep !== navEpoch) return resolve(false);
      const src = ctx.createBufferSource();
      src.buffer = audioBuf;
      src.playbackRate.value = Math.max(0.75, Math.min(1.25, rate || 0.95));
      src.connect(masterGain);
      activeSources.add(src);
      let settled = false;
      const done = ok => {
        if (settled) return;
        settled = true;
        activeSources.delete(src);
        resolve(ok);
      };
      src.onended = () => done(token === say.tk && ep === navEpoch);
      try {
        if (playState !== 'paused') setState('playing');
        src.start(0);
      } catch (_) {
        done(false);
      }
    });
  }

  function playWavViaAudioElement(arrayBuffer, rate, vol, token, ep) {
    return new Promise(resolve => {
      if (token !== say.tk || ep !== navEpoch) return resolve(false);
      const blob = new Blob([arrayBuffer], { type: 'audio/wav' });
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audio.volume = vol;
      audio.playbackRate = Math.max(0.75, Math.min(1.25, rate || 0.95));
      activeHtmlAudio = audio;
      let settled = false;
      const finish = ok => {
        if (settled) return;
        settled = true;
        if (activeHtmlAudio === audio) activeHtmlAudio = null;
        try { URL.revokeObjectURL(url); } catch (_) {}
        resolve(ok);
      };
      audio.onplaying = () => {
        if (token === say.tk && ep === navEpoch && playState !== 'paused') setState('playing');
      };
      audio.onended = () => finish(token === say.tk && ep === navEpoch);
      audio.onerror = () => finish(false);
      audio.play().catch(() => finish(false));
    });
  }

  async function fetchSavedClipById(audioId, langMode, voiceName, signal) {
    if (!audioId) return null;
    try {
      const res = await fetch(`/api/tts/clip/${audioId}.wav`, { method: 'GET', signal });
      if (res.ok && /audio|octet-stream/i.test(res.headers.get('content-type') || 'audio/wav')) {
        return await res.arrayBuffer();
      }
    } catch (_) {}
    if (langMode && voiceName) {
      try {
        const resStatic = await fetch(`/audio/tts/${langMode}/${voiceName}/${audioId}.wav`, { method: 'GET', signal });
        if (resStatic.ok && /audio|octet-stream/i.test(resStatic.headers.get('content-type') || 'audio/wav')) {
          return await resStatic.arrayBuffer();
        }
      } catch (_) {}
    }
    return null;
  }

  async function fetchWavFromGemini(text, lang, voiceId, mood, rate, signal) {
    const res = await fetch(TTS_ENDPOINT, {
      method: 'POST',
      signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, lang, voiceId, mood, rate })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      const e = new Error(humanTtsError(res.status, data.error));
      e.code = data.error || 'upstream';
      e.status = res.status;
      throw e;
    }
    return await res.arrayBuffer();
  }

  async function playWavBuffer(ctx, wavBuf, key, cfg, token, ep) {
    if (ctx) {
      try {
        const decoded = await ctx.decodeAudioData(wavBuf.slice(0));
        cachePut(key, decoded);
        return await playDecodedBuffer(ctx, decoded, cfg.rate, token, ep);
      } catch (_) {}
    }
    cachePut(key, wavBuf);
    return await playWavViaAudioElement(wavBuf, cfg.rate, cfg.vol, token, ep);
  }

  async function playSegment(rawText, lang, token, ep, mood) {
    const valid = () => token === say.tk && ep === navEpoch && !muted();
    if (!valid()) return false;
    if (!(await waitIfPaused(token, ep))) return false;
    if (!valid()) return false;

    const spoken = prepSpeechText(rawText, lang);
    if (!spoken) return true;

    const cfg = BumiVoiceConfig.getSettings();
    const langMode = detectLang(spoken, lang);
    const key = makeKey(spoken, langMode, cfg.voiceId);
    const ctx = ensureAudioCtx();

    // 1. التحقق من الذاكرة المؤقتة الفورية أو CacheStorage
    const memHit = MEM_CACHE.get(key);
    if (memHit) {
      if (ctx && memHit instanceof AudioBuffer) {
        return await playDecodedBuffer(ctx, memHit, cfg.rate, token, ep);
      }
      if (memHit instanceof ArrayBuffer) {
        return await playWavBuffer(ctx, memHit, key, cfg, token, ep);
      }
    }

    const diskHit = await readCacheStorage(key);
    if (!valid()) return false;
    if (diskHit) {
      return await playWavBuffer(ctx, diskHit, key, cfg, token, ep);
    }

    if (navigator.onLine === false) {
      throw new Error(humanTtsError(0, 'offline'));
    }

    const ctrl = new AbortController();
    activeCtrl = ctrl;
    const timeoutId = setTimeout(() => ctrl.abort(), 24000);

    try {
      // 2. التحقق أولًا من الملف الصوتي المحفوظ دائمًا في الخادم/التخزين قبل الاتصال بـ Gemini
      const audioId = await computeAudioId(spoken, cfg.voice.geminiVoice, langMode);
      if (audioId) {
        const savedBuf = await fetchSavedClipById(audioId, langMode, cfg.voice.geminiVoice, ctrl.signal);
        if (!valid()) return false;
        if (savedBuf && savedBuf.byteLength > 44) {
          writeCacheStorage(key, savedBuf);
          return await playWavBuffer(ctx, savedBuf, key, cfg, token, ep);
        }
      }

      // 3. عند عدم وجود الملف المحفوظ: التوليد مرة واحدة عبر Gemini TTS مع الحفظ الدائم في الخادم
      const useStream = ctx && spoken.length >= 70;
      if (useStream) {
        const res = await fetch(TTS_STREAM_ENDPOINT, {
          method: 'POST',
          signal: ctrl.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: spoken, lang: langMode, voiceId: cfg.voiceId, mood, rate: cfg.rate })
        });
        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          const e = new Error(humanTtsError(res.status, data.error));
          e.code = data.error || 'upstream';
          e.status = res.status;
          throw e;
        }
        if (!valid()) return false;

        const fmt = res.headers.get('X-Audio-Format') || '';
        if (fmt === 'wav' || /audio\/wav/i.test(res.headers.get('Content-Type') || '')) {
          const buf = await res.arrayBuffer();
          if (!valid()) return false;
          writeCacheStorage(key, buf);
          const decoded = await ctx.decodeAudioData(buf.slice(0));
          cachePut(key, decoded);
          return await playDecodedBuffer(ctx, decoded, cfg.rate, token, ep);
        }

        // بثّ PCM خام 24kHz mono 16-bit LE وتجدول المقاطع فور وصولها لتقليل التأخير
        const reader = res.body.getReader();
        let nextTime = ctx.currentTime + 0.04;
        let carry = new Uint8Array(0);
        const pcmAll = [];
        let lastSrcPromise = Promise.resolve();
        const rate = Math.max(0.75, Math.min(1.25, cfg.rate || 0.95));

        for (;;) {
          if (!valid()) {
            try { await reader.cancel(); } catch (_) {}
            return false;
          }
          if (playState === 'paused') {
            await waitIfPaused(token, ep);
            if (!valid()) return false;
            nextTime = Math.max(nextTime, ctx.currentTime + 0.04);
          }

          const { done, value } = await reader.read();
          if (done) break;
          if (!value || !value.byteLength) continue;

          const combined = new Uint8Array(carry.byteLength + value.byteLength);
          combined.set(carry, 0);
          combined.set(value, carry.byteLength);

          const evenLen = combined.byteLength - (combined.byteLength % 2);
          carry = evenLen < combined.byteLength ? combined.slice(evenLen) : new Uint8Array(0);
          const pcmBytes = evenLen === combined.byteLength ? combined : combined.subarray(0, evenLen);
          if (!pcmBytes.byteLength) continue;

          pcmAll.push(pcmBytes.slice(0));
          const audioBuf = pcm16ToAudioBuffer(ctx, pcmBytes);
          if (!audioBuf) continue;

          if (playState !== 'paused') setState('playing');
          if (ctx.state === 'suspended' && playState !== 'paused') {
            await ctx.resume().catch(() => {});
          }
          const src = ctx.createBufferSource();
          src.buffer = audioBuf;
          src.playbackRate.value = rate;
          src.connect(masterGain);
          activeSources.add(src);

          const startAt = Math.max(ctx.currentTime + 0.02, nextTime);
          nextTime = startAt + audioBuf.duration / rate;
          lastSrcPromise = new Promise(resDone => {
            src.onended = () => {
              activeSources.delete(src);
              resDone();
            };
          });
          src.start(startAt);
        }

        if (pcmAll.length && valid()) {
          const fullAudio = pcm16ToAudioBuffer(ctx, concatUint8(pcmAll));
          if (fullAudio) cachePut(key, fullAudio);
        }

        await lastSrcPromise;
        return valid();
      }

      // مسار WAV السريع للنصوص القصيرة والمفردات
      const wavBuf = await fetchWavFromGemini(spoken, lang, cfg.voiceId, mood, cfg.rate, ctrl.signal);
      if (!valid()) return false;
      writeCacheStorage(key, wavBuf);
      if (ctx) {
        try {
          const decoded = await ctx.decodeAudioData(wavBuf.slice(0));
          cachePut(key, decoded);
          return await playDecodedBuffer(ctx, decoded, cfg.rate, token, ep);
        } catch (_) {}
      }
      cachePut(key, wavBuf);
      return await playWavViaAudioElement(wavBuf, cfg.rate, cfg.vol, token, ep);
    } finally {
      clearTimeout(timeoutId);
      if (activeCtrl === ctrl) activeCtrl = null;
    }
  }

  /* ---------- التحكم العام: تشغيل / إيقاف مؤقت / استكمال / إعادة / إيقاف ---------- */
  function stop(preserveLast = true) {
    say.tk = (say.tk || 0) + 1;
    clearTimeout(playerHideTimer);
    if (activeCtrl) {
      try { activeCtrl.abort(); } catch (_) {}
      activeCtrl = null;
    }
    releasePauseGate();
    clearActiveSources();
    if (!preserveLast) lastJob = null;
    currentJob = null;
    setState('idle', '');
  }

  async function pause() {
    if (playState !== 'playing' && playState !== 'loading') return false;
    setState('paused');
    if (audioCtx && audioCtx.state === 'running') {
      try { await audioCtx.suspend(); } catch (_) {}
    }
    if (activeHtmlAudio && !activeHtmlAudio.paused) {
      try { activeHtmlAudio.pause(); } catch (_) {}
    }
    return true;
  }

  async function resume() {
    if (playState !== 'paused') return false;
    if (audioCtx && audioCtx.state === 'suspended') {
      try { await audioCtx.resume(); } catch (_) {}
    }
    if (activeHtmlAudio && activeHtmlAudio.paused) {
      try { await activeHtmlAudio.play(); } catch (_) {}
    }
    setState('playing');
    releasePauseGate();
    return true;
  }

  function togglePause() {
    if (playState === 'paused') return resume();
    if (playState === 'playing' || playState === 'loading') return pause();
    if (lastJob) return replay();
    return false;
  }

  function replay() {
    if (!lastJob) return 0;
    if (lastJob.kind === 'list') {
      return sayList(lastJob.list);
    }
    return say(lastJob.text, lastJob.lang, null, lastJob.mood);
  }

  function say(text, lang = 'ar', onEnd, mood) {
    stop(true);
    clearTimeout(playerHideTimer);
    const token = ++say.tk;
    const ep = navEpoch;
    const clean = cleanSpeechText(text);
    if (!clean || muted()) {
      if (typeof onEnd === 'function') setTimeout(() => { if (token === say.tk && ep === navEpoch) onEnd(); }, 20);
      return token;
    }

    const defLang = lang === 'en' ? 'en' : 'ar';
    lastJob = { kind: 'single', text: clean, lang: defLang, mood };
    currentJob = { lang: defLang, mood, preview: clean.slice(0, 48) };
    setState('loading', '');

    (async () => {
      let hadError = false;
      try {
        const sentences = splitSentences(clean, 450);
        for (const s of sentences) {
          if (token !== say.tk || ep !== navEpoch || muted()) break;
          const parts = splitParts(s, defLang);
          if (parts.length <= 1) {
            await playSegment(s, parts[0] ? parts[0][1] : defLang, token, ep, mood);
          } else {
            // إذا كان النص مختلطًا عربيًا وإنجليزيًا في جملة واحدة مترابطة، يمكن لـ Gemini نطقه بسلاسة أو تقسيمه عند الطول
            if (s.length <= 220) {
              await playSegment(s, 'mixed', token, ep, mood);
            } else {
              for (const [segText, segLang] of parts) {
                if (token !== say.tk || ep !== navEpoch || muted()) break;
                await playSegment(segText, segLang, token, ep, mood);
              }
            }
          }
        }
      } catch (err) {
        if (err && err.name !== 'AbortError' && token === say.tk) {
          hadError = true;
          setState('error', err.message || 'تعذّر توليد الصوت من Google Gemini');
        }
      } finally {
        if (token === say.tk) {
          if (!hadError) setState('idle', '');
          if (ep === navEpoch && typeof onEnd === 'function') {
            try { onEnd(); } catch (_) {}
          }
        }
      }
    })();

    return token;
  }

  function sayList(list, doneOrStart) {
    const done = typeof doneOrStart === 'function' ? doneOrStart : null;
    const startIdx = typeof doneOrStart === 'number' ? Math.max(0, doneOrStart) : 0;
    if (!Array.isArray(list) || startIdx >= list.length || muted()) {
      done && setTimeout(() => done(), 20);
      return 0;
    }

    stop(true);
    clearTimeout(playerHideTimer);
    const token = ++say.tk;
    const ep = navEpoch;
    const items = list.slice(startIdx).map(item => {
      const t = Array.isArray(item) ? item[0] : item;
      const clean = cleanSpeechText(t);
      const l = Array.isArray(item) ? (item[1] || 'ar') : (/[\u0600-\u06FF]/.test(clean) ? 'ar' : 'en');
      return [clean, l];
    }).filter(x => x[0]);

    if (!items.length) {
      done && setTimeout(() => done(), 20);
      return token;
    }

    lastJob = { kind: 'list', list: items };
    currentJob = { lang: items[0][1], mood: 'normal', preview: items[0][0].slice(0, 48) };
    setState('loading', '');

    (async () => {
      let hadError = false;
      try {
        for (let i = 0; i < items.length; i++) {
          if (token !== say.tk || ep !== navEpoch || muted()) break;
          if (!(await waitIfPaused(token, ep))) break;
          const [txt, lng] = items[i];
          await playSegment(txt, lng, token, ep, 'normal');
          if (i + 1 < items.length && token === say.tk && ep === navEpoch) {
            await new Promise(r => setTimeout(r, 140));
          }
        }
      } catch (err) {
        if (err && err.name !== 'AbortError' && token === say.tk) {
          hadError = true;
          setState('error', err.message || 'تعذّر توليد الصوت من Google Gemini');
        }
      } finally {
        if (token === say.tk) {
          if (!hadError) setState('idle', '');
          if (ep === navEpoch && typeof done === 'function') {
            try { done(); } catch (_) {}
          }
        }
      }
    })();

    return token;
  }

  /* ---------- بثّ الجمل أثناء توليد رد Gemini لتقليل التأخير ---------- */
  function createSpeechStream(defLang = 'ar') {
    let buffer = '';
    let spokenLen = 0;
    let queue = [];
    let running = false;
    let ended = false;
    let streamToken = 0;
    const ep = navEpoch;

    async function drain() {
      if (running) return;
      running = true;
      if (!streamToken) {
        stop(true);
        streamToken = ++say.tk;
        currentJob = { lang: defLang, mood: 'normal', preview: '' };
        setState('loading', '');
      }
      const tk = streamToken;
      let hadError = false;
      try {
        while (queue.length || !ended) {
          if (tk !== say.tk || ep !== navEpoch || muted()) break;
          if (!queue.length) {
            await new Promise(r => setTimeout(r, 60));
            continue;
          }
          if (!(await waitIfPaused(tk, ep))) break;
          const sentence = queue.shift();
          const segLang = /[\u0600-\u06FF]/.test(sentence) && /[A-Za-z]/.test(sentence)
            ? 'mixed'
            : (/[A-Za-z]/.test(sentence) && !/[\u0600-\u06FF]/.test(sentence) ? 'en' : defLang);
          await playSegment(sentence, segLang, tk, ep, 'normal');
        }
      } catch (err) {
        if (err && err.name !== 'AbortError' && tk === say.tk) {
          hadError = true;
          queue = [];
          ended = true;
          setState('error', err.message || 'تعذّر توليد الصوت من Google Gemini');
        }
      } finally {
        running = false;
        if (tk === say.tk && !hadError) {
          const fullClean = cleanSpeechText(buffer);
          if (fullClean) lastJob = { kind: 'single', text: fullClean, lang: defLang, mood: 'normal' };
          setState('idle', '');
        }
      }
    }

    return {
      push(chunk) {
        if (muted()) return;
        buffer += String(chunk || '');
        const slice = buffer.slice(spokenLen);
        const match = slice.match(/^([\s\S]*?[.!؟?\n])(?:\s+|$)/);
        if (match && cleanSpeechText(match[1]).length >= 16) {
          const clean = cleanSpeechText(match[1]);
          spokenLen += match[0].length;
          if (clean) {
            queue.push(clean);
            drain();
          }
        }
      },
      end(finalFullText) {
        if (finalFullText) buffer = String(finalFullText);
        if (muted()) return;
        const rest = cleanSpeechText(buffer.slice(spokenLen));
        if (rest) {
          spokenLen = buffer.length;
          for (const s of splitSentences(rest, 420)) queue.push(s);
        }
        ended = true;
        if (queue.length || running) drain();
      },
      abort() {
        ended = true;
        queue = [];
        if (streamToken && streamToken === say.tk) stop(true);
      }
    };
  }

  say.tk = 0;
  say.live = false;
  say.stop = () => stop(true);
  say.pause = pause;
  say.resume = resume;
  say.togglePause = togglePause;
  say.replay = replay;
  say.state = () => playState;
  say.last = () => lastJob;
  say.onState = fn => { if (typeof fn === 'function') listeners.add(fn); return () => listeners.delete(fn); };
  say.clean = cleanSpeechText;
  say.visibleText = extractVisibleText;
  say.parts = splitParts;
  say.stream = createSpeechStream;
  say.warm = warmText;

  window.say = say;
  window.sayList = sayList;
  window.HurufiVoice = { say, sayList, config: BumiVoiceConfig, cleanSpeechText, extractVisibleText, clearCache };

  /* ---------- تسخين استباقي لطيف لأصوات البطاقات المعروضة (يجلب المحفوظ أولًا دون هدر) ---------- */
  const WARMED = new Set();
  async function warmText(text, lang = 'ar') {
    if (muted() || navigator.onLine === false) return;
    try {
      const c = navigator.connection;
      if (c && (c.saveData || /(^|-)2g|3g/.test(c.effectiveType || ''))) return;
    } catch (_) {}
    const clean = prepSpeechText(text, lang);
    if (!clean || clean.length > 60) return;
    const cfg = BumiVoiceConfig.getSettings();
    const langMode = detectLang(clean, lang);
    const key = makeKey(clean, langMode, cfg.voiceId);
    if (WARMED.has(key) || MEM_CACHE.has(key)) return;
    WARMED.add(key);
    try {
      const disk = await readCacheStorage(key);
      if (disk) { cachePut(key, disk); return; }
      const audioId = await computeAudioId(clean, cfg.voice.geminiVoice, langMode);
      const saved = audioId ? await fetchSavedClipById(audioId, langMode, cfg.voice.geminiVoice) : null;
      if (saved && saved.byteLength > 44) {
        cachePut(key, saved);
        await writeCacheStorage(key, saved);
        return;
      }
      const buf = await fetchWavFromGemini(clean, langMode, cfg.voiceId, 'normal', cfg.rate);
      cachePut(key, buf);
      await writeCacheStorage(key, buf);
    } catch (_) {}
  }

  function warmVisibleLesson() {
    try {
      if (window.V !== 'lesson' || !window.cur || !Array.isArray(cur.i)) return;
      cur.i.slice(0, 6).forEach((it, idx) => {
        if (it && it[0]) {
          setTimeout(() => warmText(it[0], it[2] || (cur.l === 'en' ? 'en' : 'ar')), 300 + idx * 350);
        }
      });
    } catch (_) {}
  }

  if (typeof window.h === 'function') {
    const prevH = window.h;
    window.h = function () {
      const r = prevH.apply(this, arguments);
      setTimeout(warmVisibleLesson, 400);
      return r;
    };
  }

  /* ---------- شريط التحكّم المرئي بالصوت (#boomi-player) ---------- */
  function renderPlayer() {
    let bar = document.getElementById('boomi-player');
    const shouldShow = playState !== 'idle' || !!lastErrorMsg;

    if (!shouldShow) {
      if (bar) {
        clearTimeout(playerHideTimer);
        if (lastJob) {
          bar.dataset.state = 'ready';
          const lbl = bar.querySelector('.bp-lbl');
          const tog = bar.querySelector('.bp-tog');
          const stp = bar.querySelector('.bp-stop');
          if (lbl) lbl.textContent = '🦉 انتهى الصوت';
          if (tog) { tog.textContent = '🔁 إعادة'; tog.setAttribute('aria-label', 'إعادة تشغيل الصوت'); tog.onclick = () => say.replay(); }
          if (stp) stp.hidden = true;
          playerHideTimer = setTimeout(() => {
            const b = document.getElementById('boomi-player');
            if (b && playState === 'idle') b.remove();
          }, 4200);
        } else {
          bar.remove();
        }
      }
      return;
    }

    clearTimeout(playerHideTimer);
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'boomi-player';
      bar.className = 'boomi-player';
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', 'التحكّم في صوت بومي');
      bar.innerHTML = `<span class="bp-lbl"></span>
        <div class="bp-btns">
          <button type="button" class="bp-tog"></button>
          <button type="button" class="bp-rep" aria-label="إعادة تشغيل">🔁</button>
          <button type="button" class="bp-stop" aria-label="إيقاف الصوت">⏹️</button>
        </div>`;
      bar.querySelector('.bp-rep').onclick = () => say.replay();
      bar.querySelector('.bp-stop').onclick = () => { lastJob = null; stop(false); };
    }

    // وضع الشريط داخل نافذة الدردشة إن كانت مفتوحة لمنع التغطية، وإلا أعلى شريط التنقل
    const bm = document.getElementById('bm');
    const targetHost = bm ? bm : document.body;
    if (bar.parentElement !== targetHost) {
      if (bm) {
        const bl = bm.querySelector('#bl');
        if (bl) bm.insertBefore(bar, bl);
        else bm.appendChild(bar);
      } else {
        document.body.appendChild(bar);
      }
    }
    bar.classList.toggle('in-bm', !!bm);
    bar.dataset.state = playState;

    const lbl = bar.querySelector('.bp-lbl');
    const tog = bar.querySelector('.bp-tog');
    const rep = bar.querySelector('.bp-rep');
    const stp = bar.querySelector('.bp-stop');

    if (playState === 'loading') {
      lbl.textContent = '⏳ جارٍ تجهيز صوت بومي…';
      tog.textContent = '⏸️ إيقاف مؤقت';
      tog.onclick = () => say.pause();
      rep.hidden = !lastJob;
      stp.hidden = false;
    } else if (playState === 'playing') {
      lbl.textContent = '🔊 بومي يتحدّث الآن';
      tog.textContent = '⏸️ إيقاف مؤقت';
      tog.onclick = () => say.pause();
      rep.hidden = false;
      stp.hidden = false;
    } else if (playState === 'paused') {
      lbl.textContent = '⏸️ الصوت متوقّف مؤقتًا';
      tog.textContent = '▶️ استكمال';
      tog.onclick = () => say.resume();
      rep.hidden = false;
      stp.hidden = false;
    } else if (playState === 'error') {
      lbl.textContent = '⚠️ ' + (lastErrorMsg || 'تعذّر تشغيل الصوت');
      tog.textContent = '🔄 إعادة المحاولة';
      tog.onclick = () => say.replay();
      rep.hidden = true;
      stp.hidden = false;
    }
  }

  /* ---------- شاشة إعدادات الصوت المركزية الموحّدة ---------- */
  async function clearCache() {
    MEM_CACHE.clear();
    WARMED.clear();
    if (window.caches) {
      try { await caches.delete(CACHE_NAME); } catch (_) {}
    }
  }

  window.voiceSelect = function (voiceId) {
    BumiVoiceConfig.updateSettings({ voiceId });
    if (window.V === 'sec' && document.getElementById('voice-set-sec')) {
      window.voiceSet();
    }
    setTimeout(() => window.testT && window.testT(), 120);
  };

  window.voiceSet = function () {
    if (!window.P) return;
    migrateProfileVoice();
    window.V = 'sec';
    window.CS = 'set';
    const cfg = BumiVoiceConfig.getSettings();
    const ratePct = Math.round(cfg.rate * 100);
    const volPct = Math.round(cfg.vol * 100);
    const D = window.D || (n => String(n));

    h(`<section class="sec voice-sec" id="voice-set-sec">
      <button class="link" onclick="goBack()">← رجوع</button>
      <h2>🔊 إعدادات صوت بومي (Google Gemini TTS)</h2>
      <p class="mut">صوت طبيعي وواضح باللغتين العربية والإنجليزية عبر Google Gemini Text-to-Speech، مع إعدادات موحّدة لجميع الدروس والقصص والدردشة.</p>

      <div class="voice-plan">
        <h3>🎙️ اختر نبرة صوت المعلم بومي</h3>
        <div class="voice-provider">
          ${VOICES.map(v => `<button type="button" data-voice="${v.id}" class="${cfg.voiceId === v.id ? 'on' : ''}" onclick="voiceSelect('${v.id}')">
            <b>${v.badge} · ${v.label}</b>
            <small>${v.desc}</small>
          </button>`).join('')}
        </div>
        <div class="row" style="gap:8px;flex-wrap:wrap;margin-top:10px">
          <button type="button" class="big" onclick="testT()">🔊 جرّب النطق بالعربية والإنجليزية</button>
          <button type="button" class="alt" onclick="say.togglePause()">⏸️ إيقاف مؤقت / ▶️ استكمال</button>
          <button type="button" class="alt" onclick="say.replay()">🔁 إعادة</button>
        </div>
      </div>

      <div class="voice-plan">
        <h3>🎛️ التشغيل التلقائي والصوت</h3>
        <label for="vs-enabled">صوت المعلم بومي</label>
        <select id="vs-enabled" onchange="BumiVoiceConfig.updateSettings({enabled:this.value==='1'})">
          <option value="1" ${cfg.enabled ? 'selected' : ''}>مفعّل</option>
          <option value="0" ${!cfg.enabled ? 'selected' : ''}>مكتوم</option>
        </select>
        <label for="vs-auto">القراءة التلقائية لإجابات بومي والدروس</label>
        <select id="vs-auto" onchange="BumiVoiceConfig.updateSettings({autoSpeak:this.value==='1'})">
          <option value="1" ${cfg.autoSpeak ? 'selected' : ''}>مفعّلة تلقائيًا</option>
          <option value="0" ${!cfg.autoSpeak ? 'selected' : ''}>عند الضغط على زر الاستماع فقط</option>
        </select>
        <label for="vs-vol">مستوى الصوت (<span id="vs-vol-v">${D(volPct)}٪</span>)</label>
        <input id="vs-vol" type="range" min="0.1" max="1" step="0.05" value="${cfg.vol}" oninput="BumiVoiceConfig.updateSettings({vol:+this.value});document.getElementById('vs-vol-v').textContent=(window.D?D:String)(Math.round(this.value*100))+'٪'">
        <label for="vs-rate">سرعة النطق (<span id="vs-rate-v">${D(ratePct)}٪</span>)</label>
        <input id="vs-rate" type="range" min="0.75" max="1.25" step="0.05" value="${cfg.rate}" onchange="BumiVoiceConfig.updateSettings({rate:+this.value});document.getElementById('vs-rate-v').textContent=(window.D?D:String)(Math.round(this.value*100))+'٪'">
      </div>

      <div class="voice-plan">
        <h3>🧹 الذاكرة المحلية على الجهاز</h3>
        <p class="mut">تُحفظ ملفات صوت الدروس والقصص بشكل دائم على الخادم؛ ويمكنك هنا مسح نسخة المتصفح المؤقتة على هذا الجهاز فقط.</p>
        <button type="button" class="alt" onclick="HurufiVoice.clearCache().then(()=>{this.textContent='✅ تم مسح نسخة المتصفح المحلية'})">🧹 مسح نسخة المتصفح المحلية</button>
      </div>

      <button type="button" class="big" onclick="goBack()">حفظ والعودة ✓</button>
    </section>`);
  };

  window.testT = () => {
    const nm = (window.P && P.name) ? P.name : 'صَدِيقِي';
    const text = window.P && P.gender === 'female'
      ? `أَهْلًا يَا ${nm}! أَنَا بُومِي، وَسَنَتَعَلَّمُ مَعًا بِصَوْتٍ وَاضِحٍ وَجَمِيلٍ. Great job, let us learn English together!`
      : `أَهْلًا يَا ${nm}! أَنَا بُومِي، وَسَنَتَعَلَّمُ مَعًا بِصَوْتٍ وَاضِحٍ وَجَمِيلٍ. Great job, let us learn English together!`;
    say(text, 'ar', null, 'cheer');
  };

  window.Tashkeel = window.Tashkeel || {
    apply: t => t,
    learn: () => {},
    nunWord: w => w
  };

  migrateProfileVoice();
})();
