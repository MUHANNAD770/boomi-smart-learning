-- جدول قاعدة بيانات مسارات وبيانات الملفات الصوتية لبومي (متوافق مع PostgreSQL / Supabase / SQLite)
CREATE TABLE IF NOT EXISTS tts_audio_clips (
  id TEXT PRIMARY KEY,
  clean_text TEXT NOT NULL,
  text_preview TEXT NOT NULL,
  lang TEXT NOT NULL CHECK (lang IN ('ar', 'en', 'mixed')),
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
