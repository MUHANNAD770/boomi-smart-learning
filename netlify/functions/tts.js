'use strict';

/**
 * netlify/functions/tts.js
 * دالة Netlify لتقديم الأصوات المحفوظة من Netlify Blobs الأصلي أو الحزمة الساكنة،
 * وتوليد الأصوات الناقصة مرة واحدة فقط عبر Google Gemini TTS — بدون أي مفاتيح API إضافية.
 */

const { connectLambda } = require('@netlify/blobs');
const { hitRate } = require('../../server/gemini-client');
const { enableNetlifyBlobs, disableNetlifyBlobs } = require('../../server/audio-storage');
const {
  synthesizeSpeech,
  getSavedClipById,
  getSavedSpeech,
  ttsErrorResponse
} = require('../../server/tts-provider');

const json = (statusCode, obj) => ({
  statusCode,
  headers: { 'content-type': 'application/json; charset=utf-8' },
  body: JSON.stringify(obj)
});

exports.handler = async ev => {
  // ربط Netlify Blobs الأصلي بسياق الدالة تلقائيًا بدون أي مفاتيح API إضافية
  try {
    if (ev && (ev.blobs || process.env.NETLIFY_BLOBS_CONTEXT)) {
      connectLambda(ev);
      enableNetlifyBlobs();
    } else {
      disableNetlifyBlobs();
    }
  } catch {
    disableNetlifyBlobs();
  }

  const ip = (ev.headers && (ev.headers['x-nf-client-connection-ip'] || String(ev.headers['x-forwarded-for'] || '').split(',')[0])) || 'x';
  const u = hitRate(ip);
  if (u.min > 90 || u.hour > 1200) return json(429, { error: 'rate' });

  const q = ev.queryStringParameters || {};
  if (ev.httpMethod === 'GET' && q.id) {
    const hit = await getSavedClipById(q.id);
    if (!hit) return json(404, { error: 'not_found' });
    return {
      statusCode: 200,
      headers: {
        'content-type': hit.mimeType || 'audio/wav',
        'cache-control': 'public, max-age=31536000, immutable',
        'x-tts-source': hit.source || 'persistent',
        'x-tts-clip-id': hit.audioId
      },
      body: hit.audio.toString('base64'),
      isBase64Encoded: true
    };
  }

  let body = {};
  if (ev.httpMethod === 'POST') {
    if ((ev.body || '').length > 16000) return json(413, { error: 'big' });
    try { body = JSON.parse(ev.body || '{}'); } catch { return json(400, { error: 'bad' }); }
  } else if (ev.httpMethod === 'GET') {
    body = q;
  } else {
    return json(405, { error: 'method' });
  }

  if (q.resolve === '1' || body.resolveOnly) {
    const hit = await getSavedSpeech({
      text: body.text,
      lang: body.lang,
      voiceId: body.voiceId || body.teacher
    });
    if (!hit) return json(200, { exists: false });
    return json(200, {
      exists: true,
      audioId: hit.audioId,
      url: hit.publicUrl,
      source: hit.source
    });
  }

  try {
    const out = await synthesizeSpeech({
      text: body.text,
      lang: body.lang,
      voiceId: body.voiceId || body.teacher,
      mood: body.mood,
      rate: body.rate,
      sourceType: body.sourceType,
      sourceRef: body.sourceRef
    });
    return {
      statusCode: 200,
      headers: {
        'content-type': out.mimeType || 'audio/wav',
        'cache-control': 'public, max-age=31536000, immutable',
        'x-tts-cached': out.cached ? '1' : '0',
        'x-tts-persisted': out.persisted ? '1' : '0',
        'x-tts-source': out.source || 'persistent',
        'x-tts-clip-id': out.audioId || '',
        'x-tts-clip-url': out.publicUrl || '',
        'x-tts-voice': out.voice || 'kore'
      },
      body: out.audio.toString('base64'),
      isBase64Encoded: true
    };
  } catch (err) {
    const out = ttsErrorResponse(err);
    return json(out.status, out.data);
  }
};
