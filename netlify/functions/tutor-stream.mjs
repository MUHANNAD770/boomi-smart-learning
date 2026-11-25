// بومي — بثّ الإجابة تدريجيًا (Streaming) عبر Google Gemini API على الخادم
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const {
  hitRate,
  resolveProvider,
  prepareChatInput,
  streamGemini,
  handleTutor,
  errorResponse
} = require('../../server/ai-provider');

const json = (c, o) => new Response(JSON.stringify(o), { status: c, headers: { 'content-type': 'application/json; charset=utf-8' } });

export default async req => {
  if (req.method !== 'POST') return json(405, { error: 'method' });
  const raw = await req.text();
  if (raw.length > 12000) return json(413, { error: 'big' });
  const ip = req.headers.get('x-nf-client-connection-ip') || String(req.headers.get('x-forwarded-for') || '').split(',')[0] || 'x';
  const u = hitRate(ip);
  if (u.min > 20 || u.hour > 240) return json(429, { error: 'rate' });

  const prov = resolveProvider();
  if (!prov) return json(503, { error: 'not_configured', message: 'Gemini API key is not configured on the server' });

  let b;
  try { b = JSON.parse(raw || '{}'); } catch { return json(400, { error: 'bad' }); }

  if (prov === 'gemini') {
    const prep = prepareChatInput(b);
    if (prep.error) return json(400, { error: prep.error });
    const enc = new TextEncoder();
    const out = new ReadableStream({
      async start(ctl) {
        try {
          await streamGemini(prep.system, prep.messages, chunk => {
            if (chunk) ctl.enqueue(enc.encode(chunk));
          });
        } catch (err) {
          const e = errorResponse(err);
          ctl.enqueue(enc.encode(''));
          console.error('[netlify tutor-stream]', e.data?.error || 'error');
        } finally {
          try { ctl.close(); } catch {}
        }
      }
    });
    return new Response(out, {
      status: 200,
      headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store', 'x-accel-buffering': 'no' }
    });
  }

  const out = await handleTutor(b, ip);
  if (out.status !== 200) return json(out.status, out.data);
  return new Response(out.data.reply || '', {
    status: 200,
    headers: { 'content-type': 'text/plain; charset=utf-8', 'cache-control': 'no-store' }
  });
};
