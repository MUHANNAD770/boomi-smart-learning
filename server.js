'use strict';

if (!process.env.AI_PROVIDER) process.env.AI_PROVIDER = 'gemini';
if (!process.env.TTS_MODEL) process.env.TTS_MODEL = 'gemini-3.8-flash-lite-tts';

const express = require('express');
const path = require('path');
const zlib = require('zlib');
const { handleTutor, cl, mkInfo, SYS, hitRate, resolveProvider, prepareChatInput, streamGemini, errorResponse } = require('./server/ai-provider');
const {
  synthesizeSpeech,
  streamSpeech,
  getSavedSpeech,
  getSavedClipById,
  ttsErrorResponse,
  isTtsConfigured,
  VOICES
} = require('./server/tts-provider');
const audioStorage = require('./server/audio-storage');
const audioDb = require('./server/audio-db');
const audioCatalog = require('./server/audio-catalog');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const ROOT = __dirname;

app.disable('x-powered-by');
app.use(express.json({ limit: '64kb' }));

// Lightweight gzip compression for JSON/JS/CSS/HTML/SVG/JSON-like assets (never buffer streaming or audio routes)
const COMPRESSIBLE = /\.(?:html?|css|js|mjs|json|svg|webmanifest|txt)$/i;
app.use((req, res, next) => {
  const accept = String(req.headers['accept-encoding'] || '');
  if (!accept.includes('gzip') || req.method === 'HEAD' || /(?:tutor-stream|tts(?:-stream)?)$|\/api\/tts\/clip\//.test(req.path)) return next();
  const shouldCompress = () => {
    const ct = String(res.getHeader('content-type') || '');
    return COMPRESSIBLE.test(req.path) || /^(?:text\/|application\/(?:json|javascript|manifest\+json))/i.test(ct);
  };
  const origWrite = res.write.bind(res);
  const origEnd = res.end.bind(res);
  const chunks = [];
  let decided = false;
  let passthrough = false;

  res.write = function (chunk, encoding, cb) {
    if (!decided) {
      decided = true;
      if (!shouldCompress() || res.getHeader('content-encoding')) {
        passthrough = true;
        return origWrite(chunk, encoding, cb);
      }
      res.removeHeader('content-length');
      res.setHeader('Content-Encoding', 'gzip');
      res.setHeader('Vary', 'Accept-Encoding');
    }
    if (passthrough) return origWrite(chunk, encoding, cb);
    if (chunk) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    if (typeof cb === 'function') cb();
    return true;
  };

  res.end = function (chunk, encoding, cb) {
    if (!decided) {
      decided = true;
      if (!shouldCompress() || res.getHeader('content-encoding')) {
        passthrough = true;
        return origEnd(chunk, encoding, cb);
      }
    }
    if (passthrough) return origEnd(chunk, encoding, cb);
    if (chunk && typeof chunk !== 'function') {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk, encoding));
    }
    const raw = Buffer.concat(chunks);
    if (raw.length < 512) {
      res.removeHeader('Content-Encoding');
      return origEnd(raw, undefined, typeof chunk === 'function' ? chunk : cb);
    }
    res.removeHeader('content-length');
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Vary', 'Accept-Encoding');
    zlib.gzip(raw, (err, gz) => {
      if (err) {
        res.removeHeader('Content-Encoding');
        return origEnd(raw);
      }
      origEnd(gz, undefined, typeof chunk === 'function' ? chunk : cb);
    });
  };
  next();
});

// Static assets with clean caching headers
app.use(express.static(ROOT, {
  index: 'index.html',
  extensions: ['html'],
  etag: true,
  setHeaders(res, filePath) {
    if (/\.(?:html?|js|css|webmanifest)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'no-cache');
    } else if (/\.(?:webp|png|jpg|jpeg|svg|wav|mp3|bin|woff2?)$/i.test(filePath)) {
      res.setHeader('Cache-Control', 'public, max-age=604800');
    } else {
      res.setHeader('Cache-Control', 'public, max-age=3600');
    }
  }
}));

app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    aiConfigured: !!resolveProvider(),
    aiProvider: resolveProvider() || 'gemini',
    ttsConfigured: isTtsConfigured(),
    ttsProvider: 'gemini',
    ttsModel: process.env.TTS_MODEL || 'gemini-3.8-flash-lite-tts',
    voices: Object.keys(VOICES),
    audioStorage: audioStorage.getStorageInfo().provider,
    audioDb: audioDb.getDbInfo().provider
  });
});

// Unified Tutor Endpoint + Netlify function alias
async function tutorRoute(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'local';
  const out = await handleTutor(req.body, ip);
  return res.status(out.status).json(out.data);
}
app.post('/api/tutor', tutorRoute);
app.post('/.netlify/functions/tutor', tutorRoute);

// Streaming chat endpoint
async function streamRoute(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'local';
  const u = hitRate(ip);
  if (u.min > 20 || u.hour > 240) return res.status(429).json({ error: 'rate' });
  const prov = resolveProvider();
  if (!prov) return res.status(503).json({ error: 'not_configured', message: 'Gemini API key is not configured on the server' });

  if (prov === 'gemini') {
    const prep = prepareChatInput(req.body);
    if (prep.error) return res.status(400).json({ error: prep.error });
    let headersSent = false;
    try {
      await streamGemini(prep.system, prep.messages, chunk => {
        if (!headersSent) {
          headersSent = true;
          res.setHeader('Content-Type', 'text/plain; charset=utf-8');
          res.setHeader('Cache-Control', 'no-store');
          if (typeof res.flushHeaders === 'function') res.flushHeaders();
        }
        res.write(chunk);
      });
      if (!headersSent) {
        return res.status(502).json({ error: 'empty_reply' });
      }
      return res.end();
    } catch (err) {
      if (!headersSent) {
        const out = errorResponse(err);
        return res.status(out.status).json(out.data);
      }
      return res.end();
    }
  }

  if (prov === 'anthropic' && (process.env.ANTHROPIC_API_KEY || process.env.NETLIFY_AI_GATEWAY_KEY)) {
    const b = req.body && typeof req.body === 'object' ? req.body : {};
    const p = b.profile && typeof b.profile === 'object' ? b.profile : {};
    const msg = cl(b.message, 1000);
    if (!msg) return res.status(400).json({ error: 'empty' });
    const hist = (Array.isArray(b.history) ? b.history : [])
      .slice(-14)
      .filter(m => m && (m.role === 'user' || m.role === 'assistant'))
      .map(m => ({ role: m.role, content: cl(m.content, 1000) || '...' }));
    while (hist.length && hist[0].role !== 'user') hist.shift();
    const again = b.again ? '\n[ملاحظة: الطالب لم يفهم الشرح السابق. استخدم أسلوبًا مختلفًا وأبسط.]' : '';
    const key = process.env.ANTHROPIC_API_KEY || process.env.NETLIFY_AI_GATEWAY_KEY;
    const base = (process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com').replace(/\/$/, '');
    const models = [process.env.TUTOR_MODEL, 'claude-haiku-5-5', 'claude-haiku-4-5', 'claude-sonnet-5-5'].filter(Boolean);
    for (const m of models) {
      try {
        const up = await fetch(`${base}/v1/messages`, {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
          body: JSON.stringify({ model: m, max_tokens: 700, stream: true, system: SYS + '\n' + mkInfo(b, p) + again, messages: [...hist, { role: 'user', content: msg }] })
        });
        if (up.status === 400 || up.status === 404) continue;
        if (!up.ok || !up.body) return res.status(502).json({ error: 'upstream' });
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.setHeader('Cache-Control', 'no-store');
        const rd = up.body.getReader();
        const dec = new TextDecoder();
        let buf = '';
        for (;;) {
          const { done, value } = await rd.read();
          if (done) break;
          buf += dec.decode(value, { stream: true });
          let k;
          while ((k = buf.indexOf('\n')) >= 0) {
            const line = buf.slice(0, k).trim();
            buf = buf.slice(k + 1);
            if (!line.startsWith('data:')) continue;
            const d = line.slice(5).trim();
            if (!d || d === '[DONE]') continue;
            try {
              const ev = JSON.parse(d);
              if (ev.type === 'content_block_delta' && ev.delta?.type === 'text_delta' && ev.delta.text) {
                res.write(ev.delta.text);
              }
            } catch {}
          }
        }
        return res.end();
      } catch {}
    }
  }

  const out = await handleTutor(req.body, ip);
  if (out.status !== 200) return res.status(out.status).json(out.data);
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(out.data.reply || '');
}
app.post('/api/tutor-stream', streamRoute);
app.post('/.netlify/functions/tutor-stream', streamRoute);

// Dedicated Google Gemini Text-to-Speech endpoints (persistent DB + Object Storage lookup-first, generate-once)
function requireTtsAdmin(req, res, next) {
  const configured = String(process.env.TTS_ADMIN_TOKEN || '').trim();
  if (configured) {
    const auth = String(req.headers.authorization || '');
    const token = auth.startsWith('Bearer ') ? auth.slice(7).trim() : '';
    if (!token || token !== configured) {
      return res.status(401).json({ error: 'unauthorized' });
    }
  }
  return next();
}

app.get('/api/tts/clip/:id', async (req, res) => {
  const rawId = String(req.params.id || '').replace(/\.wav$/i, '');
  if (!/^[a-f0-9]{16,64}$/i.test(rawId)) {
    return res.status(400).json({ error: 'invalid_clip_id' });
  }
  const etag = `"tts-${rawId.toLowerCase()}"`;
  if (req.headers['if-none-match'] === etag) {
    return res.status(304).end();
  }
  try {
    const hit = await getSavedClipById(rawId);
    if (!hit) return res.status(404).json({ error: 'not_found' });
    res.setHeader('Content-Type', hit.mimeType || 'audio/wav');
    res.setHeader('Content-Length', String(hit.audio.length));
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-TTS-Cached', '1');
    res.setHeader('X-TTS-Persisted', '1');
    res.setHeader('X-TTS-Source', hit.source || 'persistent');
    res.setHeader('X-TTS-Clip-Id', hit.audioId);
    return res.end(hit.audio);
  } catch (err) {
    return res.status(500).json({ error: 'storage_error' });
  }
});

app.post('/api/tts/resolve', async (req, res) => {
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  try {
    const hit = await getSavedSpeech({
      text: b.text,
      lang: b.lang,
      voiceId: b.voiceId || b.teacher
    });
    if (!hit) return res.json({ exists: false });
    return res.json({
      exists: true,
      audioId: hit.audioId,
      url: hit.publicUrl,
      source: hit.source
    });
  } catch {
    return res.json({ exists: false });
  }
});

app.get('/api/tts/stats', requireTtsAdmin, async (req, res) => {
  try {
    const voiceId = String(req.query.voiceId || 'kore');
    const lang = String(req.query.lang || 'all');
    const [savedStats, audit] = await Promise.all([
      audioDb.stats(),
      audioCatalog.auditMissingAudio({ voiceId, lang })
    ]);
    res.json({
      storage: audioStorage.getStorageInfo(),
      db: audioDb.getDbInfo(),
      saved: savedStats,
      catalog: {
        voiceId: audit.voiceId,
        totalCatalog: audit.totalCatalog,
        savedCount: audit.savedCount,
        missingCount: audit.missingCount
      }
    });
  } catch (err) {
    res.status(500).json({ error: 'stats_failed' });
  }
});

app.get('/api/tts/clips', requireTtsAdmin, async (req, res) => {
  try {
    const out = await audioDb.list({
      q: String(req.query.q || ''),
      lang: String(req.query.lang || ''),
      voiceId: String(req.query.voiceId || ''),
      sourceType: String(req.query.sourceType || ''),
      limit: Number(req.query.limit || 50),
      offset: Number(req.query.offset || 0)
    });
    res.json(out);
  } catch {
    res.status(500).json({ error: 'list_failed' });
  }
});

app.post('/api/tts/backfill', requireTtsAdmin, async (req, res) => {
  if (!isTtsConfigured()) {
    return res.status(503).json({ error: 'not_configured', message: 'Gemini API key is not configured on the server' });
  }
  const b = req.body && typeof req.body === 'object' ? req.body : {};
  try {
    const result = await audioCatalog.generateMissingAudio({
      voiceId: b.voiceId || 'kore',
      lang: b.lang || 'all',
      sourceType: b.sourceType || 'all',
      limit: Math.max(1, Math.min(200, Number(b.limit) || 25)),
      concurrency: Math.max(1, Math.min(3, Number(b.concurrency) || 2)),
      mirrorStatic: !!b.mirrorStatic
    });
    return res.json(result);
  } catch (err) {
    const out = ttsErrorResponse(err);
    return res.status(out.status).json(out.data);
  }
});

app.post('/api/tts/manifest', requireTtsAdmin, async (req, res) => {
  try {
    const manifest = await audioDb.exportManifest();
    res.json({ ok: true, count: manifest.count, generatedAt: manifest.generatedAt });
  } catch {
    res.status(500).json({ error: 'manifest_failed' });
  }
});

async function ttsUnaryRoute(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'local';
  const u = hitRate(ip);
  if (u.min > 90 || u.hour > 1200) return res.status(429).json({ error: 'rate' });
  const src = req.method === 'GET' ? req.query : req.body;
  try {
    // ملاحظة: synthesizeSpeech يفحص قاعدة البيانات والتخزين الدائم أولًا قبل التحقق من Gemini
    const out = await synthesizeSpeech({
      text: src?.text,
      lang: src?.lang,
      voiceId: src?.voiceId || src?.teacher,
      mood: src?.mood,
      rate: src?.rate,
      sourceType: src?.sourceType,
      sourceRef: src?.sourceRef
    });
    res.setHeader('Content-Type', out.mimeType || 'audio/wav');
    res.setHeader('Content-Length', String(out.audio.length));
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('X-TTS-Cached', out.cached ? '1' : '0');
    res.setHeader('X-TTS-Persisted', out.persisted ? '1' : '0');
    res.setHeader('X-TTS-Source', out.source || 'persistent');
    res.setHeader('X-TTS-Clip-Id', out.audioId || '');
    res.setHeader('X-TTS-Clip-Url', out.publicUrl || '');
    res.setHeader('X-TTS-Voice', out.voice);
    return res.end(out.audio);
  } catch (err) {
    const out = ttsErrorResponse(err);
    return res.status(out.status).json(out.data);
  }
}
app.post('/api/tts', ttsUnaryRoute);
app.get('/api/tts', ttsUnaryRoute);
app.post('/.netlify/functions/tts', ttsUnaryRoute);
app.get('/.netlify/functions/tts', ttsUnaryRoute);

async function ttsStreamRoute(req, res) {
  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || 'local';
  const u = hitRate(ip);
  if (u.min > 90 || u.hour > 1200) return res.status(429).json({ error: 'rate' });
  const src = req.body && typeof req.body === 'object' ? req.body : {};
  let headersSent = false;
  try {
    // ملاحظة: streamSpeech يفحص قاعدة البيانات والتخزين الدائم أولًا، وإن وُجد الملف يعيده مباشرةً بدون Gemini
    const out = await streamSpeech({
      text: src.text,
      lang: src.lang,
      voiceId: src.voiceId || src.teacher,
      mood: src.mood,
      rate: src.rate,
      sourceType: src.sourceType,
      sourceRef: src.sourceRef,
      onChunk(buf) {
        if (!headersSent) {
          headersSent = true;
          res.setHeader('Content-Type', 'audio/l16;rate=24000;channels=1');
          res.setHeader('X-Audio-Format', 'pcm-s16le-24000-mono');
          res.setHeader('Cache-Control', 'no-store');
          if (typeof res.flushHeaders === 'function') res.flushHeaders();
        }
        res.write(buf);
      }
    });
    if (out.cachedAudio) {
      res.setHeader('Content-Type', 'audio/wav');
      res.setHeader('X-Audio-Format', 'wav');
      res.setHeader('Content-Length', String(out.cachedAudio.length));
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.setHeader('X-TTS-Cached', '1');
      res.setHeader('X-TTS-Persisted', '1');
      res.setHeader('X-TTS-Source', out.source || 'persistent');
      res.setHeader('X-TTS-Clip-Id', out.audioId || '');
      res.setHeader('X-TTS-Clip-Url', out.publicUrl || '');
      return res.end(out.cachedAudio);
    }
    if (!headersSent) return res.status(502).json({ error: 'empty_audio' });
    return res.end();
  } catch (err) {
    if (!headersSent) {
      const out = ttsErrorResponse(err);
      return res.status(out.status).json(out.data);
    }
    return res.end();
  }
}
app.post('/api/tts-stream', ttsStreamRoute);

app.post('/.netlify/functions/sync', (req, res) => res.status(503).json({ error: 'offline', message: 'Local storage active' }));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api/') || req.path.startsWith('/.netlify/')) return res.status(404).json({ error: 'not_found' });
  if (path.extname(req.path)) return res.status(404).end();
  res.sendFile(path.join(ROOT, 'index.html'));
});

if (require.main === module) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`BOOMI Academy server listening on http://0.0.0.0:${PORT}`);
  });
}

module.exports = app;
