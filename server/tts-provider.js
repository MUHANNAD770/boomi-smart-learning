'use strict';

/**
 * server/tts-provider.js
 * محرّك الصوت الدائم للمعلم بومي عبر Google Gemini Text-to-Speech:
 *  • معرّف ثابت حتمي لكل (النص المنظّف، الصوت، اللغة) لمنع التكرار وإعادة الاستخدام عبر جميع الدروس.
 *  • يتحقّق من قاعدة البيانات والتخزين الدائم قبل الاتصال بـ Gemini؛ إذا وُجد الملف يُشغَّل مباشرة بلا استهلاك API.
 *  • إذا لم يوجد الملف، يُولَّد مرة واحدة عبر Gemini TTS ويُحفظ دائمًا في التخزين + قاعدة البيانات ثم يُعاد.
 *  • عند تعذّر توليد صوت جديد، تستمر جميع الأصوات المحفوظة بالعمل بشكل طبيعي دون تعطيل الموقع.
 */

const geminiClient = require('./gemini-client');

const audioStorage = require('./audio-storage');
const audioDb = require('./audio-db');

const TTS_MODELS = () => {
  const list = [
    process.env.TTS_MODEL,
    'gemini-3.8-flash-lite-tts',
    'gemini-3.8-flash-tts'
  ].filter(Boolean);
  return [...new Set(list)];
};

const VOICES = {
  kore: { id: 'kore', voiceName: 'Kore', gender: 'female', style: 'warm, clear, gentle, friendly' },
  zephyr: { id: 'zephyr', voiceName: 'Zephyr', gender: 'female', style: 'calm, soft, melodic, comforting' },
  puck: { id: 'puck', voiceName: 'Puck', gender: 'male', style: 'cheerful, clear, encouraging, lively' },
  charon: { id: 'charon', voiceName: 'Charon', gender: 'male', style: 'calm, clear, articulate, patient' },
  fenrir: { id: 'fenrir', voiceName: 'Fenrir', gender: 'male', style: 'bright, clear, energetic, encouraging' }
};

function resolveVoice(voiceId) {
  const key = String(voiceId || '').toLowerCase().trim();
  if (key === 'female') return VOICES.kore;
  if (key === 'male') return VOICES.puck;
  return VOICES[key] || VOICES.kore;
}

/**
 * تنظيف النص مع الحفاظ الكامل على التشكيل العربي (الحركات) وحروف اللغتين.
 */
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
  return t.normalize('NFC').slice(0, 1500);
}

function detectLang(text, hint) {
  const ar = (text.match(/[\u0600-\u06FF]/g) || []).length;
  const en = (text.match(/[A-Za-z]/g) || []).length;
  if (ar > 0 && en > 0) return 'mixed';
  if (hint === 'en' && en > 0) return 'en';
  if (hint === 'ar' && ar > 0) return 'ar';
  return en > ar ? 'en' : 'ar';
}

function buildSpeechStyle(langMode, voice, mood, rate) {
  const baseTone = voice.style || 'warm, clear, friendly';
  const moodHint = mood === 'cheer' || mood === 'happy'
    ? 'encouraging and joyful'
    : mood === 'soft'
      ? 'gentle, reassuring, and patient'
      : mood === 'ask'
        ? 'curious and inviting'
        : 'kind and natural';
  const r = Number(rate) || 0.95;
  const paceHint = r <= 0.85 ? 'slow and deliberate pacing' : r >= 1.1 ? 'slightly brisk, lively pacing' : 'natural, clear elementary pacing';

  if (langMode === 'en') {
    return `${baseTone}, ${moodHint} elementary school teacher speaking standard American English to children, crisp enunciation, ${paceHint}.`;
  }
  if (langMode === 'mixed') {
    return `${baseTone}, ${moodHint} bilingual elementary teacher speaking clear Modern Standard Arabic with accurate diacritics and crisp American English seamlessly to children, ${paceHint}.`;
  }
  return `${baseTone}, ${moodHint} elementary school teacher speaking clear Modern Standard Arabic with accurate pronunciation and full tashkeel harakat for children, ${paceHint}.`;
}

// ذاكرة ساخنة في RAM (LRU) فوق التخزين الدائم لتسريع الطلبات المتكررة داخل نفس الجلسة
const CACHE = new Map();
let cacheBytes = 0;
const MAX_CACHE_ITEMS = 220;
const MAX_CACHE_BYTES = 24 * 1024 * 1024;
const IN_FLIGHT = new Map();

function getCache(key) {
  const hit = CACHE.get(key);
  if (!hit) return null;
  CACHE.delete(key);
  CACHE.set(key, hit);
  return hit;
}

function setCache(key, buf) {
  if (!buf || !buf.length || buf.length > 2 * 1024 * 1024) return;
  if (CACHE.has(key)) {
    cacheBytes -= CACHE.get(key).length;
    CACHE.delete(key);
  }
  while (CACHE.size >= MAX_CACHE_ITEMS || cacheBytes + buf.length > MAX_CACHE_BYTES) {
    const oldestKey = CACHE.keys().next().value;
    if (oldestKey === undefined) break;
    cacheBytes -= CACHE.get(oldestKey).length;
    CACHE.delete(oldestKey);
  }
  CACHE.set(key, buf);
  cacheBytes += buf.length;
}

function resolveClipDescriptor({ text, lang, voiceId }) {
  const clean = cleanSpeechText(text);
  if (!clean) return null;
  const voice = resolveVoice(voiceId);
  const langMode = detectLang(clean, lang);
  const audioId = audioStorage.makeAudioId(clean, voice.voiceName, langMode);
  const storageKey = audioStorage.makeStorageKey(audioId, voice.voiceName, langMode);
  return { clean, voice, langMode, audioId, storageKey };
}

function extractAudioBase64(obj) {
  const parts = obj?.candidates?.[0]?.content?.parts;
  if (!Array.isArray(parts)) return '';
  for (const part of parts) {
    if (part?.inlineData?.data) return part.inlineData.data;
  }
  return '';
}

function isTtsConfigured() {
  return !!String(process.env.GEMINI_API_KEY || '').trim();
}

function ensureWavBuffer(buf) {
  if (!Buffer.isBuffer(buf) || !buf.length) return null;
  if (buf.length > 44 && buf.subarray(0, 4).toString('ascii') === 'RIFF' && buf.subarray(8, 12).toString('ascii') === 'WAVE') {
    return buf;
  }
  return encodeWav24kMono16(buf);
}

async function persistClip(desc, wavBuf, { model, sourceType, sourceRef, mirrorStatic = false } = {}) {
  try {
    const stored = await audioStorage.putAudio(desc.storageKey, wavBuf, 'audio/wav', { mirrorStatic });
    const rec = await audioDb.upsert({
      id: desc.audioId,
      clean_text: desc.clean,
      text_preview: desc.clean.slice(0, 120),
      lang: desc.langMode,
      voice_id: desc.voice.id,
      voice_name: desc.voice.voiceName,
      model: model || TTS_MODELS()[0] || 'gemini-3.8-flash-lite-tts',
      source_type: sourceType || 'runtime',
      source_ref: sourceRef || '',
      storage_provider: stored.provider,
      storage_key: stored.storageKey,
      public_url: stored.publicUrl,
      mime_type: 'audio/wav',
      size_bytes: wavBuf.length
    });
    return { persisted: true, provider: stored.provider, publicUrl: rec.public_url };
  } catch (err) {
    console.warn('[tts-provider] persist skipped:', err.message);
    return { persisted: false, provider: audioStorage.detectStorageProvider(), publicUrl: `/api/tts/clip/${desc.audioId}.wav` };
  }
}

async function getSavedSpeech({ text, lang, voiceId }) {
  const desc = resolveClipDescriptor({ text, lang, voiceId });
  if (!desc) return null;

  // 1. الذاكرة الساخنة
  const mem = getCache(desc.audioId);
  if (mem) {
    const dbRec = await audioDb.getById(desc.audioId);
    audioDb.touchHit(desc.audioId).catch(() => {});
    return {
      audio: mem,
      audioId: desc.audioId,
      storageKey: desc.storageKey,
      publicUrl: dbRec?.public_url || audioStorage.resolvePublicUrl(audioStorage.detectStorageProvider(), desc.storageKey, desc.audioId),
      mimeType: 'audio/wav',
      cached: true,
      persisted: true,
      source: 'memory',
      voice: desc.voice.id,
      lang: desc.langMode
    };
  }

  // 2. البحث في قاعدة البيانات ثم قراءة الملف من التخزين الدائم
  const dbRec = await audioDb.getById(desc.audioId);
  if (dbRec && dbRec.storage_key) {
    const hit = await audioStorage.getAudio(dbRec.storage_key);
    if (hit && hit.audio) {
      setCache(desc.audioId, hit.audio);
      audioDb.touchHit(desc.audioId).catch(() => {});
      return {
        audio: hit.audio,
        audioId: desc.audioId,
        storageKey: dbRec.storage_key,
        publicUrl: dbRec.public_url || `/api/tts/clip/${desc.audioId}.wav`,
        mimeType: dbRec.mime_type || 'audio/wav',
        cached: true,
        persisted: true,
        source: hit.provider,
        voice: desc.voice.id,
        lang: desc.langMode
      };
    }
  }

  // 3. فحص التخزين مباشرةً بالمعرّف الثابت (إصلاح ذاتي إذا وُجد الملف دون سجل DB)
  const direct = await audioStorage.getAudio(desc.storageKey);
  if (direct && direct.audio) {
    setCache(desc.audioId, direct.audio);
    let publicUrl = audioStorage.resolvePublicUrl(direct.provider, desc.storageKey, desc.audioId);
    try {
      const healed = await audioDb.upsert({
        id: desc.audioId,
        clean_text: desc.clean,
        text_preview: desc.clean.slice(0, 120),
        lang: desc.langMode,
        voice_id: desc.voice.id,
        voice_name: desc.voice.voiceName,
        model: TTS_MODELS()[0] || 'gemini-3.8-flash-lite-tts',
        source_type: 'healed',
        storage_provider: direct.provider,
        storage_key: desc.storageKey,
        public_url: publicUrl,
        mime_type: 'audio/wav',
        size_bytes: direct.audio.length
      });
      publicUrl = healed.public_url;
    } catch {}
    return {
      audio: direct.audio,
      audioId: desc.audioId,
      storageKey: desc.storageKey,
      publicUrl,
      mimeType: 'audio/wav',
      cached: true,
      persisted: true,
      source: direct.provider,
      voice: desc.voice.id,
      lang: desc.langMode
    };
  }

  return null;
}

async function getSavedClipById(audioId) {
  const id = String(audioId || '').toLowerCase().replace(/\.wav$/i, '').replace(/[^a-f0-9]/g, '');
  if (!id || id.length < 16) return null;

  const mem = getCache(id);
  const rec = await audioDb.getById(id);
  if (mem) {
    audioDb.touchHit(id).catch(() => {});
    return {
      audio: mem,
      audioId: id,
      publicUrl: rec?.public_url || `/api/tts/clip/${id}.wav`,
      mimeType: rec?.mime_type || 'audio/wav',
      source: 'memory'
    };
  }

  if (rec && rec.storage_key) {
    const hit = await audioStorage.getAudio(rec.storage_key);
    if (hit && hit.audio) {
      setCache(id, hit.audio);
      audioDb.touchHit(id).catch(() => {});
      return {
        audio: hit.audio,
        audioId: id,
        publicUrl: rec.public_url || `/api/tts/clip/${id}.wav`,
        mimeType: rec.mime_type || 'audio/wav',
        source: hit.provider
      };
    }
  }

  // فحص المسارات المحتملة في static/disk إذا لم يوجد سجل DB
  for (const langMode of ['ar', 'en', 'mixed']) {
    for (const v of Object.values(VOICES)) {
      const key = `tts/${langMode}/${v.voiceName}/${id}.wav`;
      const hit = await audioStorage.getAudio(key);
      if (hit && hit.audio) {
        setCache(id, hit.audio);
        return { audio: hit.audio, audioId: id, publicUrl: `/api/tts/clip/${id}.wav`, mimeType: 'audio/wav', source: hit.provider };
      }
    }
  }
  return null;
}

async function synthesizeViaGenerateContent(ai, model, clean, style, voice) {
  const res = await geminiClient.withTimeout(
    ai.models.generateContent({
      model,
      contents: [
        {
          role: 'user',
          parts: [{ text: clean, speechMetadata: { style } }]
        }
      ],
      config: {
        responseModalities: ['AUDIO'],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice.voiceName }
          }
        }
      }
    }),
    22000
  );
  return extractAudioBase64(res);
}

async function synthesizeViaInteractions(ai, model, clean, style, voice, langMode) {
  const speechEntry = { voice: voice.voiceName };
  if (langMode === 'en') speechEntry.language = 'en-US';
  else if (langMode === 'ar') speechEntry.language = 'ar-XA';
  const interaction = await geminiClient.withTimeout(
    ai.interactions.create({
      model,
      input: [
        {
          type: 'text',
          text: clean,
          annotations: [{ type: 'speech_metadata', style }]
        }
      ],
      response_format: { type: 'audio' },
      generation_config: {
        speech_config: [speechEntry]
      }
    }),
    22000
  );
  return interaction?.output_audio?.data || '';
}

async function synthesizeSpeech({ text, lang, voiceId, mood, rate, sourceType, sourceRef, mirrorStatic }) {
  const desc = resolveClipDescriptor({ text, lang, voiceId });
  if (!desc) {
    const err = new Error('empty');
    err.status = 400;
    throw err;
  }

  // 1. إذا كان الملف محفوظًا مسبقًا، أعده فورًا بدون أي اتصال بـ Gemini (حتى لو تعذّر الاتصال بـ Gemini)
  const existing = await getSavedSpeech({ text: desc.clean, lang: desc.langMode, voiceId: desc.voice.id });
  if (existing) return existing;

  // 2. توحيد الطلبات المتزامنة للنص نفسه لتوليده مرة واحدة فقط
  if (IN_FLIGHT.has(desc.audioId)) {
    return await IN_FLIGHT.get(desc.audioId);
  }

  const job = (async () => {
    const { ai } = await geminiClient.getGemini('v1beta');
    const style = buildSpeechStyle(desc.langMode, desc.voice, mood, rate);
    const models = TTS_MODELS();
    let lastErr = null;

    for (const model of models) {
      try {
        let b64 = '';
        try {
          b64 = await synthesizeViaGenerateContent(ai, model, desc.clean, style, desc.voice);
        } catch (innerErr) {
          if (Number(innerErr?.status) === 400 && ai.interactions?.create) {
            b64 = await synthesizeViaInteractions(ai, model, desc.clean, style, desc.voice, desc.langMode);
          } else {
            throw innerErr;
          }
        }
        if (b64) {
          const raw = Buffer.from(b64, 'base64');
          const audio = ensureWavBuffer(raw);
          if (audio && audio.length > 44) {
            setCache(desc.audioId, audio);
            const saved = await persistClip(desc, audio, {
              model,
              sourceType: sourceType || 'runtime',
              sourceRef: sourceRef || '',
              mirrorStatic: !!mirrorStatic
            });
            return {
              audio,
              audioId: desc.audioId,
              storageKey: desc.storageKey,
              publicUrl: saved.publicUrl,
              mimeType: 'audio/wav',
              cached: false,
              persisted: saved.persisted,
              source: saved.persisted ? saved.provider : 'gemini-ephemeral',
              voice: desc.voice.id,
              lang: desc.langMode,
              model
            };
          }
        }
        lastErr = new Error('empty_audio');
      } catch (err) {
        lastErr = err;
        const kind = geminiClient.classifyError(err);
        if (kind === 'auth' || kind === 'quota' || kind === 'not_configured') throw err;
      }
    }
    throw lastErr || new Error('upstream');
  })().finally(() => {
    IN_FLIGHT.delete(desc.audioId);
  });

  IN_FLIGHT.set(desc.audioId, job);
  return await job;
}

async function streamSpeech({ text, lang, voiceId, mood, rate, sourceType, sourceRef, onChunk }) {
  const desc = resolveClipDescriptor({ text, lang, voiceId });
  if (!desc) {
    const err = new Error('empty');
    err.status = 400;
    throw err;
  }

  // 1. التحقق أولًا من وجود الصوت في التخزين الدائم أو قاعدة البيانات
  const existing = await getSavedSpeech({ text: desc.clean, lang: desc.langMode, voiceId: desc.voice.id });
  if (existing) {
    return {
      cachedAudio: existing.audio,
      audioId: existing.audioId,
      storageKey: existing.storageKey,
      publicUrl: existing.publicUrl,
      mimeType: 'audio/wav',
      voice: existing.voice,
      persisted: true,
      source: existing.source
    };
  }

  // 2. إذا لم يكن محفوظًا، نبثّ الصوت من Gemini ونحفظ الملف النهائي دائمًا بعد انتهاء البث
  const { ai } = await geminiClient.getGemini('v1beta');
  const style = buildSpeechStyle(desc.langMode, desc.voice, mood, rate);
  const models = TTS_MODELS();
  let lastErr = null;

  for (const model of models) {
    try {
      let totalBytes = 0;
      const pcmParts = [];

      try {
        const stream = await geminiClient.withTimeout(
          ai.models.generateContentStream({
            model,
            contents: [
              {
                role: 'user',
                parts: [{ text: desc.clean, speechMetadata: { style } }]
              }
            ],
            config: {
              responseModalities: ['AUDIO'],
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: desc.voice.voiceName }
                }
              }
            }
          }),
          22000
        );
        for await (const chunk of stream) {
          const b64 = extractAudioBase64(chunk);
          if (!b64) continue;
          const buf = Buffer.from(b64, 'base64');
          if (!buf.length) continue;
          totalBytes += buf.length;
          pcmParts.push(buf);
          if (typeof onChunk === 'function') onChunk(buf);
        }
      } catch (innerErr) {
        if (totalBytes === 0 && Number(innerErr?.status) === 400 && ai.interactions?.create) {
          const speechEntry = { voice: desc.voice.voiceName };
          if (desc.langMode === 'en') speechEntry.language = 'en-US';
          else if (desc.langMode === 'ar') speechEntry.language = 'ar-XA';
          const iStream = await geminiClient.withTimeout(
            ai.interactions.create({
              model,
              input: [
                {
                  type: 'text',
                  text: desc.clean,
                  annotations: [{ type: 'speech_metadata', style }]
                }
              ],
              response_format: { type: 'audio' },
              generation_config: { speech_config: [speechEntry] },
              stream: true
            }),
            22000
          );
          for await (const event of iStream) {
            if (event?.event_type === 'step.delta' && event?.delta?.type === 'audio' && event?.delta?.data) {
              const buf = Buffer.from(event.delta.data, 'base64');
              if (!buf.length) continue;
              totalBytes += buf.length;
              pcmParts.push(buf);
              if (typeof onChunk === 'function') onChunk(buf);
            }
          }
        } else {
          throw innerErr;
        }
      }

      if (totalBytes > 0) {
        const pcm = Buffer.concat(pcmParts);
        const wav = encodeWav24kMono16(pcm);
        setCache(desc.audioId, wav);
        const saved = await persistClip(desc, wav, {
          model,
          sourceType: sourceType || 'runtime',
          sourceRef: sourceRef || ''
        });
        return {
          streamedBytes: totalBytes,
          audioId: desc.audioId,
          storageKey: desc.storageKey,
          publicUrl: saved.publicUrl,
          persisted: saved.persisted,
          mimeType: 'audio/l16',
          voice: desc.voice.id
        };
      }
      lastErr = new Error('empty_stream');
    } catch (err) {
      lastErr = err;
      const kind = geminiClient.classifyError(err);
      if (kind === 'auth' || kind === 'quota' || kind === 'not_configured') throw err;
    }
  }
  throw lastErr || new Error('upstream');
}

function encodeWav24kMono16(pcm) {
  const header = Buffer.alloc(44);
  const dataSize = pcm.length;
  header.write('RIFF', 0);
  header.writeUInt32LE(36 + dataSize, 4);
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
  header.writeUInt32LE(dataSize, 40);
  return Buffer.concat([header, pcm]);
}

function ttsErrorResponse(err) {
  if (err && err.message === 'empty') return { status: 400, data: { error: 'empty' } };
  return geminiClient.errorResponse(err, 'tts-provider');
}

module.exports = {
  VOICES,
  TTS_MODELS,
  cleanSpeechText,
  resolveVoice,
  detectLang,
  resolveClipDescriptor,
  getSavedSpeech,
  getSavedClipById,
  isTtsConfigured,
  synthesizeSpeech,
  streamSpeech,
  ttsErrorResponse
};
