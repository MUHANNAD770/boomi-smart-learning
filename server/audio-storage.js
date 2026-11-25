'use strict';

/**
 * server/audio-storage.js
 * طبقة التخزين الدائم لملفات الصوت بدون أي مفاتيح API إضافية:
 *  1) Netlify Blobs الأصلي (عبر connectLambda داخل Netlify Functions — بلا مفاتيح إضافية)
 *  2) مجلد تخزين دائم على خادم Node (AUDIO_STORAGE_DIR أو ./storage/tts)
 *  3) حزمة الصوت الساكنة المولّدة مسبقًا داخل المشروع (./audio/tts)
 * يمنع الكتابة الوهمية على القرص المؤقت في البيئات عديمة الحالة (مثل Netlify بدون سياق Blobs).
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..');
const STATIC_TTS_DIR = path.join(ROOT, 'audio', 'tts');
const DEFAULT_DISK_DIR = path.join(ROOT, 'storage', 'tts');
const NETLIFY_AUDIO_STORE = 'boomi-tts-audio';

const SAFE_KEY_RE = /^tts\/(ar|en|mixed)\/([A-Za-z]+)\/([a-f0-9]{16,64})\.wav$/;

let netlifyBlobsActive = false;

function enableNetlifyBlobs() {
  netlifyBlobsActive = true;
}

function disableNetlifyBlobs() {
  netlifyBlobsActive = false;
}

function isServerlessEphemeral() {
  return !!(
    process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.VERCEL
  );
}

function hasNativeNetlifyBlobs() {
  if (netlifyBlobsActive) return true;
  return !!(process.env.NETLIFY_BLOBS_CONTEXT && isServerlessEphemeral());
}

function makeAudioId(cleanText, voiceName, langMode) {
  const norm = String(cleanText || '').normalize('NFC').trim();
  const v = String(voiceName || 'Kore').trim();
  const l = String(langMode || 'ar').trim();
  return crypto
    .createHash('sha256')
    .update(`${v}\0${l}\0${norm}`, 'utf8')
    .digest('hex')
    .slice(0, 32);
}

function makeStorageKey(audioId, voiceName, langMode) {
  const l = langMode === 'en' || langMode === 'mixed' ? langMode : 'ar';
  const v = String(voiceName || 'Kore').replace(/[^A-Za-z]/g, '') || 'Kore';
  const id = String(audioId || '').toLowerCase().replace(/[^a-f0-9]/g, '').slice(0, 64);
  if (!id || id.length < 16) throw new Error('invalid_audio_id');
  return `tts/${l}/${v}/${id}.wav`;
}

function validateStorageKey(key) {
  const k = String(key || '').replace(/^\/+/, '');
  if (!SAFE_KEY_RE.test(k) || k.includes('..')) {
    throw new Error('invalid_storage_key');
  }
  return k;
}

function resolveConfinedPath(baseDir, key) {
  const safeKey = validateStorageKey(key);
  const absBase = path.resolve(baseDir);
  const absTarget = path.resolve(absBase, safeKey);
  if (!absTarget.startsWith(absBase + path.sep)) {
    throw new Error('path_escape_blocked');
  }
  return absTarget;
}

function detectStorageProvider() {
  const pref = String(process.env.AUDIO_STORAGE_PROVIDER || '').toLowerCase().trim();
  if (pref === 'netlify-blobs' && hasNativeNetlifyBlobs()) return 'netlify-blobs';
  if (pref === 'disk' && !isServerlessEphemeral()) return 'disk';

  if (hasNativeNetlifyBlobs()) return 'netlify-blobs';
  if (!isServerlessEphemeral()) return 'disk';
  return 'readonly-static';
}

/* ---------- Native Netlify Blobs (Zero Extra API Keys) ---------- */
function getNetlifyAudioStore() {
  const { getStore } = require('@netlify/blobs');
  return getStore(NETLIFY_AUDIO_STORE);
}

async function netlifyBlobGet(key) {
  const store = getNetlifyAudioStore();
  const ab = await store.get(validateStorageKey(key), { type: 'arrayBuffer' });
  if (!ab) return null;
  const buf = Buffer.from(ab);
  return buf.length > 44 ? buf : null;
}

async function netlifyBlobHead(key) {
  const store = getNetlifyAudioStore();
  const meta = await store.getMetadata(validateStorageKey(key));
  return !!meta;
}

async function netlifyBlobPut(key, buf, mimeType) {
  const store = getNetlifyAudioStore();
  await store.set(validateStorageKey(key), buf, {
    metadata: { contentType: mimeType || 'audio/wav' }
  });
}

/* ---------- Local Persistent Disk + Bundled Static Fallback ---------- */
function getDiskDir() {
  return path.resolve(String(process.env.AUDIO_STORAGE_DIR || DEFAULT_DISK_DIR));
}

function diskRead(baseDir, key) {
  try {
    const file = resolveConfinedPath(baseDir, key);
    if (!fs.existsSync(file)) return null;
    const buf = fs.readFileSync(file);
    return buf.length > 44 ? buf : null;
  } catch {
    return null;
  }
}

function diskExists(baseDir, key) {
  try {
    const file = resolveConfinedPath(baseDir, key);
    return fs.existsSync(file) && fs.statSync(file).size > 44;
  } catch {
    return false;
  }
}

function diskWrite(baseDir, key, buf) {
  const file = resolveConfinedPath(baseDir, key);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const tmp = `${file}.${process.pid}.${Date.now()}.tmp`;
  fs.writeFileSync(tmp, buf);
  fs.renameSync(tmp, file);
}

function resolvePublicUrl(provider, key, audioId) {
  validateStorageKey(key);
  return `/api/tts/clip/${audioId}.wav`;
}

function getStorageInfo() {
  const provider = detectStorageProvider();
  return {
    provider,
    persistentWritable: provider !== 'readonly-static',
    serverlessEphemeral: isServerlessEphemeral(),
    extraApiKeysRequired: false,
    diskDir: provider === 'disk' ? getDiskDir() : null,
    staticFallbackDir: fs.existsSync(STATIC_TTS_DIR) ? STATIC_TTS_DIR : null
  };
}

async function getAudio(key) {
  const safeKey = validateStorageKey(key);
  const provider = detectStorageProvider();

  try {
    if (provider === 'netlify-blobs') {
      const b = await netlifyBlobGet(safeKey);
      if (b) return { audio: b, provider: 'netlify-blobs' };
    } else if (provider === 'disk') {
      const b = diskRead(getDiskDir(), safeKey);
      if (b) return { audio: b, provider: 'disk' };
    }
  } catch (err) {
    console.error('[audio-storage] read failed:', provider, err.message);
  }

  // قراءة تلقائية من الحزمة الساكنة المضمّنة في المشروع audio/tts/ عند وجودها
  const staticHit = diskRead(STATIC_TTS_DIR, safeKey);
  if (staticHit) return { audio: staticHit, provider: 'static' };
  return null;
}

async function hasAudio(key) {
  const safeKey = validateStorageKey(key);
  const provider = detectStorageProvider();
  try {
    if (provider === 'netlify-blobs') {
      if (await netlifyBlobHead(safeKey)) return true;
    } else if (provider === 'disk') {
      if (diskExists(getDiskDir(), safeKey)) return true;
    }
  } catch {}
  return diskExists(STATIC_TTS_DIR, safeKey);
}

async function putAudio(key, buf, mimeType = 'audio/wav', options = {}) {
  const safeKey = validateStorageKey(key);
  if (!Buffer.isBuffer(buf) || buf.length <= 44) {
    throw new Error('invalid_audio_buffer');
  }
  const provider = detectStorageProvider();

  if (options.mirrorStatic) {
    diskWrite(STATIC_TTS_DIR, safeKey, buf);
  }

  if (provider === 'readonly-static') {
    const err = new Error('persistent_storage_not_configured');
    err.code = 'storage_not_configured';
    throw err;
  }

  if (provider === 'netlify-blobs') {
    await netlifyBlobPut(safeKey, buf, mimeType);
  } else {
    diskWrite(getDiskDir(), safeKey, buf);
  }

  const audioId = path.basename(safeKey, '.wav');
  return {
    provider,
    storageKey: safeKey,
    publicUrl: resolvePublicUrl(provider, safeKey, audioId),
    sizeBytes: buf.length
  };
}

module.exports = {
  ROOT,
  STATIC_TTS_DIR,
  DEFAULT_DISK_DIR,
  makeAudioId,
  makeStorageKey,
  validateStorageKey,
  detectStorageProvider,
  getStorageInfo,
  resolvePublicUrl,
  getAudio,
  hasAudio,
  putAudio,
  isServerlessEphemeral,
  enableNetlifyBlobs,
  disableNetlifyBlobs,
  hasNativeNetlifyBlobs
};
