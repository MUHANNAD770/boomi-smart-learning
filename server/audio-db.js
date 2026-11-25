'use strict';

/**
 * server/audio-db.js
 * قاعدة بيانات مسارات الملفات الصوتية وبياناتها الوصفية بدون أي مفاتيح API إضافية:
 *  1) Netlify Blobs الأصلي (boomi-tts-meta عبر connectLambda داخل Netlify Functions)
 *  2) SQLite الدائمة المدمجة في Node 22+ (./storage/tts-audio.sqlite أو AUDIO_DB_PATH)
 *  3) فهرس القراءة الساكن (./data/tts-manifest.json) المضمّن مع المشروع عند النشر
 */

const fs = require('fs');
const path = require('path');
const { isServerlessEphemeral, hasNativeNetlifyBlobs } = require('./audio-storage');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_SQLITE_PATH = path.join(ROOT, 'storage', 'tts-audio.sqlite');
const STATIC_MANIFEST_PATH = path.join(ROOT, 'data', 'tts-manifest.json');
const NETLIFY_META_STORE = 'boomi-tts-meta';

function detectDbProvider() {
  const pref = String(process.env.AUDIO_DB_PROVIDER || '').toLowerCase().trim();
  if (pref === 'netlify-blobs' && hasNativeNetlifyBlobs()) return 'netlify-blobs';
  if (pref === 'sqlite' && !isServerlessEphemeral()) return 'sqlite';

  if (hasNativeNetlifyBlobs()) return 'netlify-blobs';
  if (!isServerlessEphemeral()) return 'sqlite';
  return 'manifest';
}

/* ---------- SQLite (node:sqlite built-in on Node 22+) ---------- */
let sqliteDb = null;
let sqliteDbPath = '';

function getSqliteDb() {
  const targetPath = path.resolve(String(process.env.AUDIO_DB_PATH || DEFAULT_SQLITE_PATH));
  if (sqliteDb && sqliteDbPath === targetPath) return sqliteDb;
  const { DatabaseSync } = require('node:sqlite');
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  const db = new DatabaseSync(targetPath);
  db.exec(`
    PRAGMA journal_mode = WAL;
    PRAGMA synchronous = NORMAL;
    CREATE TABLE IF NOT EXISTS tts_audio_clips (
      id TEXT PRIMARY KEY,
      clean_text TEXT NOT NULL,
      text_preview TEXT NOT NULL,
      lang TEXT NOT NULL,
      voice_id TEXT NOT NULL,
      voice_name TEXT NOT NULL,
      model TEXT NOT NULL,
      source_type TEXT NOT NULL DEFAULT 'runtime',
      source_ref TEXT DEFAULT '',
      storage_provider TEXT NOT NULL,
      storage_key TEXT NOT NULL,
      public_url TEXT NOT NULL,
      mime_type TEXT NOT NULL DEFAULT 'audio/wav',
      size_bytes INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      last_accessed_at TEXT NOT NULL,
      hit_count INTEGER NOT NULL DEFAULT 0
    );
    CREATE INDEX IF NOT EXISTS idx_tts_audio_lang_voice ON tts_audio_clips (lang, voice_id);
    CREATE INDEX IF NOT EXISTS idx_tts_audio_source ON tts_audio_clips (source_type);
    CREATE INDEX IF NOT EXISTS idx_tts_audio_created ON tts_audio_clips (created_at);
  `);
  sqliteDb = db;
  sqliteDbPath = targetPath;
  return db;
}

/* ---------- Native Netlify Blobs Metadata Store (Zero Extra API Keys) ---------- */
function getNetlifyMetaStore() {
  const { getStore } = require('@netlify/blobs');
  return getStore(NETLIFY_META_STORE);
}

function metaBlobKey(cleanId) {
  return `clips/${cleanId}.json`;
}

async function listNetlifyMetaAll() {
  const store = getNetlifyMetaStore();
  const out = [];
  let cursor;
  do {
    const page = await store.list({ prefix: 'clips/', cursor });
    const blobs = page?.blobs || [];
    const batch = await Promise.all(
      blobs.map(b => store.get(b.key, { type: 'json' }).catch(() => null))
    );
    for (const r of batch) if (r && r.id) out.push(r);
    cursor = page?.cursor;
  } while (cursor);
  return out;
}

/* ---------- Static Read-Only Manifest Cache ---------- */
let manifestCache = null;
let manifestMtime = 0;

function readStaticManifest() {
  try {
    if (!fs.existsSync(STATIC_MANIFEST_PATH)) return {};
    const st = fs.statSync(STATIC_MANIFEST_PATH);
    if (manifestCache && manifestMtime === st.mtimeMs) return manifestCache;
    const parsed = JSON.parse(fs.readFileSync(STATIC_MANIFEST_PATH, 'utf8'));
    manifestCache = (parsed && parsed.clips && typeof parsed.clips === 'object') ? parsed.clips : {};
    manifestMtime = st.mtimeMs;
    return manifestCache;
  } catch {
    return {};
  }
}

/* ---------- Normalized Record Builder ---------- */
function normalizeRecord(input) {
  const now = new Date().toISOString();
  return {
    id: String(input.id),
    clean_text: String(input.clean_text || ''),
    text_preview: String(input.text_preview || String(input.clean_text || '').slice(0, 120)),
    lang: String(input.lang || 'ar'),
    voice_id: String(input.voice_id || 'kore'),
    voice_name: String(input.voice_name || 'Kore'),
    model: String(input.model || process.env.TTS_MODEL || 'gemini-3.8-flash-lite-tts'),
    source_type: String(input.source_type || 'runtime').slice(0, 40),
    source_ref: String(input.source_ref || '').slice(0, 160),
    storage_provider: String(input.storage_provider || 'disk'),
    storage_key: String(input.storage_key || ''),
    public_url: String(input.public_url || `/api/tts/clip/${input.id}.wav`),
    mime_type: String(input.mime_type || 'audio/wav'),
    size_bytes: Math.max(0, Number(input.size_bytes) || 0),
    created_at: String(input.created_at || now),
    last_accessed_at: String(input.last_accessed_at || now),
    hit_count: Math.max(0, Number(input.hit_count) || 0)
  };
}

/* ---------- Public DB Operations ---------- */
async function getById(id) {
  const cleanId = String(id || '').toLowerCase().replace(/[^a-f0-9]/g, '');
  if (!cleanId || cleanId.length < 16) return null;
  const provider = detectDbProvider();

  try {
    if (provider === 'sqlite') {
      const row = getSqliteDb().prepare('SELECT * FROM tts_audio_clips WHERE id = ? LIMIT 1').get(cleanId);
      if (row) return row;
    } else if (provider === 'netlify-blobs') {
      const row = await getNetlifyMetaStore().get(metaBlobKey(cleanId), { type: 'json' });
      if (row && row.id) return row;
    }
  } catch (err) {
    console.error('[audio-db] getById failed:', provider, err.message);
  }

  const m = readStaticManifest();
  return m[cleanId] || null;
}

async function upsert(input) {
  const rec = normalizeRecord(input);
  const provider = detectDbProvider();

  if (provider === 'manifest') {
    const err = new Error('database_not_configured');
    err.code = 'db_not_configured';
    throw err;
  }

  if (provider === 'sqlite') {
    getSqliteDb().prepare(`
      INSERT INTO tts_audio_clips (
        id, clean_text, text_preview, lang, voice_id, voice_name, model,
        source_type, source_ref, storage_provider, storage_key, public_url,
        mime_type, size_bytes, created_at, last_accessed_at, hit_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        storage_provider = excluded.storage_provider,
        storage_key = excluded.storage_key,
        public_url = excluded.public_url,
        mime_type = excluded.mime_type,
        size_bytes = excluded.size_bytes,
        last_accessed_at = excluded.last_accessed_at
    `).run(
      rec.id, rec.clean_text, rec.text_preview, rec.lang, rec.voice_id, rec.voice_name, rec.model,
      rec.source_type, rec.source_ref, rec.storage_provider, rec.storage_key, rec.public_url,
      rec.mime_type, rec.size_bytes, rec.created_at, rec.last_accessed_at, rec.hit_count
    );
    return rec;
  }

  if (provider === 'netlify-blobs') {
    await getNetlifyMetaStore().setJSON(metaBlobKey(rec.id), rec);
    return rec;
  }

  return rec;
}

async function touchHit(id) {
  const cleanId = String(id || '').toLowerCase().replace(/[^a-f0-9]/g, '');
  if (!cleanId) return;
  const now = new Date().toISOString();
  const provider = detectDbProvider();
  try {
    if (provider === 'sqlite') {
      getSqliteDb().prepare('UPDATE tts_audio_clips SET hit_count = hit_count + 1, last_accessed_at = ? WHERE id = ?').run(now, cleanId);
    } else if (provider === 'netlify-blobs') {
      const store = getNetlifyMetaStore();
      const row = await store.get(metaBlobKey(cleanId), { type: 'json' });
      if (row) {
        row.hit_count = (Number(row.hit_count) || 0) + 1;
        row.last_accessed_at = now;
        await store.setJSON(metaBlobKey(cleanId), row);
      }
    }
  } catch {}
}

async function hasIds(ids) {
  const clean = [...new Set((ids || []).map(x => String(x || '').toLowerCase().replace(/[^a-f0-9]/g, '')).filter(Boolean))];
  const found = new Set();
  if (!clean.length) return found;
  const provider = detectDbProvider();

  try {
    if (provider === 'sqlite') {
      const db = getSqliteDb();
      const chunkSize = 400;
      for (let i = 0; i < clean.length; i += chunkSize) {
        const part = clean.slice(i, i + chunkSize);
        const placeholders = part.map(() => '?').join(',');
        const rows = db.prepare(`SELECT id FROM tts_audio_clips WHERE id IN (${placeholders})`).all(...part);
        rows.forEach(r => found.add(r.id));
      }
    } else if (provider === 'netlify-blobs') {
      const store = getNetlifyMetaStore();
      let cursor;
      const existing = new Set();
      do {
        const page = await store.list({ prefix: 'clips/', cursor });
        for (const b of (page?.blobs || [])) {
          const m = String(b.key || '').match(/^clips\/([a-f0-9]+)\.json$/i);
          if (m) existing.add(m[1].toLowerCase());
        }
        cursor = page?.cursor;
      } while (cursor);
      for (const id of clean) if (existing.has(id)) found.add(id);
    }
  } catch (err) {
    console.error('[audio-db] hasIds failed:', err.message);
  }

  const m = readStaticManifest();
  for (const id of clean) if (m[id]) found.add(id);
  return found;
}

async function list({ q = '', lang = '', voiceId = '', sourceType = '', limit = 50, offset = 0, includeText = false } = {}) {
  const lim = Math.max(1, Math.min(200, Number(limit) || 50));
  const off = Math.max(0, Number(offset) || 0);
  const provider = detectDbProvider();
  const cols = includeText
    ? '*'
    : 'id, text_preview, lang, voice_id, voice_name, model, source_type, source_ref, storage_provider, storage_key, public_url, mime_type, size_bytes, created_at, last_accessed_at, hit_count';

  if (provider === 'sqlite') {
    const db = getSqliteDb();
    const where = [];
    const args = [];
    if (lang) { where.push('lang = ?'); args.push(lang); }
    if (voiceId) { where.push('voice_id = ?'); args.push(voiceId); }
    if (sourceType) { where.push('source_type = ?'); args.push(sourceType); }
    if (q) { where.push('clean_text LIKE ?'); args.push(`%${q}%`); }
    const clause = where.length ? `WHERE ${where.join(' AND ')}` : '';
    const total = db.prepare(`SELECT COUNT(*) AS n FROM tts_audio_clips ${clause}`).get(...args)?.n || 0;
    const items = db.prepare(`SELECT ${cols} FROM tts_audio_clips ${clause} ORDER BY created_at DESC LIMIT ? OFFSET ?`).all(...args, lim, off);
    return { total, items, limit: lim, offset: off, provider };
  }

  const sourceRows = provider === 'netlify-blobs'
    ? await listNetlifyMetaAll()
    : Object.values(readStaticManifest());

  const filtered = sourceRows.filter(r =>
    (!lang || r.lang === lang) &&
    (!voiceId || r.voice_id === voiceId) &&
    (!sourceType || r.source_type === sourceType) &&
    (!q || String(r.clean_text || '').includes(q))
  );
  filtered.sort((a, b) => String(b.created_at || '').localeCompare(String(a.created_at || '')));
  return { total: filtered.length, items: filtered.slice(off, off + lim), limit: lim, offset: off, provider };
}

function aggregateRows(provider, rows) {
  let totalBytes = 0;
  let totalHits = 0;
  const langMap = new Map();
  const voiceMap = new Map();
  const sourceMap = new Map();
  for (const r of rows) {
    const sz = Number(r.size_bytes) || 0;
    const h = Number(r.hit_count) || 0;
    totalBytes += sz;
    totalHits += h;
    const lg = langMap.get(r.lang) || { lang: r.lang, count: 0, bytes: 0 };
    lg.count++; lg.bytes += sz; langMap.set(r.lang, lg);
    const vc = voiceMap.get(r.voice_id) || { voiceId: r.voice_id, count: 0 };
    vc.count++; voiceMap.set(r.voice_id, vc);
    const sr = sourceMap.get(r.source_type) || { sourceType: r.source_type, count: 0 };
    sr.count++; sourceMap.set(r.source_type, sr);
  }
  return {
    provider,
    totalClips: rows.length,
    totalBytes,
    totalHits,
    byLang: [...langMap.values()],
    byVoice: [...voiceMap.values()],
    bySource: [...sourceMap.values()]
  };
}

async function stats() {
  const provider = detectDbProvider();
  if (provider === 'sqlite') {
    const db = getSqliteDb();
    const summary = db.prepare('SELECT COUNT(*) AS totalClips, COALESCE(SUM(size_bytes), 0) AS totalBytes, COALESCE(SUM(hit_count), 0) AS totalHits FROM tts_audio_clips').get();
    const byLang = db.prepare('SELECT lang, COUNT(*) AS count, COALESCE(SUM(size_bytes), 0) AS bytes FROM tts_audio_clips GROUP BY lang').all();
    const byVoice = db.prepare('SELECT voice_id AS voiceId, COUNT(*) AS count FROM tts_audio_clips GROUP BY voice_id').all();
    const bySource = db.prepare('SELECT source_type AS sourceType, COUNT(*) AS count FROM tts_audio_clips GROUP BY source_type').all();
    return { provider, dbPath: sqliteDbPath, ...summary, byLang, byVoice, bySource };
  }
  if (provider === 'netlify-blobs') {
    return aggregateRows(provider, await listNetlifyMetaAll());
  }
  return aggregateRows(provider, Object.values(readStaticManifest()));
}

async function exportManifest(targetPath = STATIC_MANIFEST_PATH) {
  const provider = detectDbProvider();
  const clips = {};
  if (provider === 'sqlite') {
    const rows = getSqliteDb().prepare('SELECT * FROM tts_audio_clips ORDER BY created_at ASC').all();
    for (const r of rows) clips[r.id] = r;
  } else if (provider === 'netlify-blobs') {
    const rows = await listNetlifyMetaAll();
    for (const r of rows) clips[r.id] = r;
  } else {
    Object.assign(clips, readStaticManifest());
  }
  const payload = { version: 1, generatedAt: new Date().toISOString(), count: Object.keys(clips).length, clips };
  fs.mkdirSync(path.dirname(targetPath), { recursive: true });
  fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2));
  return payload;
}

function getDbInfo() {
  const provider = detectDbProvider();
  return {
    provider,
    writable: provider !== 'manifest',
    extraApiKeysRequired: false,
    sqlitePath: provider === 'sqlite' ? path.resolve(String(process.env.AUDIO_DB_PATH || DEFAULT_SQLITE_PATH)) : null
  };
}

module.exports = {
  STATIC_MANIFEST_PATH,
  detectDbProvider,
  getDbInfo,
  getById,
  upsert,
  touchHit,
  hasIds,
  list,
  stats,
  exportManifest
};
