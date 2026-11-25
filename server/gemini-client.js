'use strict';

/**
 * server/gemini-client.js
 * عميل مشترك وآمن لـ Google Gemini API عبر @google/genai باستخدام GEMINI_API_KEY على الخادم فقط.
 */

const RL = new Map();

function hitRate(ip) {
  const now = Date.now();
  const arr = (RL.get(ip) || []).filter(t => now - t < 3600000);
  arr.push(now);
  RL.set(ip, arr);
  if (RL.size > 5000) RL.clear();
  return { min: arr.filter(t => now - t < 60000).length, hour: arr.length };
}

const DEFAULT_AI_PROVIDER = 'gemini';

function resolveProvider() {
  const pref = String(process.env.AI_PROVIDER || DEFAULT_AI_PROVIDER).toLowerCase().trim();
  if (pref === 'gemini' && String(process.env.GEMINI_API_KEY || '').trim()) return 'gemini';
  if (pref === 'anthropic' && (process.env.ANTHROPIC_API_KEY || process.env.NETLIFY_AI_GATEWAY_KEY)) return 'anthropic';
  if (pref === 'openai' && process.env.OPENAI_API_KEY) return 'openai';
  if (String(process.env.GEMINI_API_KEY || '').trim()) return 'gemini';
  if (process.env.ANTHROPIC_API_KEY || process.env.NETLIFY_AI_GATEWAY_KEY) return 'anthropic';
  if (process.env.OPENAI_API_KEY) return 'openai';
  return null;
}

let geminiMod = null;
const geminiClients = new Map();
let geminiKeySnap = '';
let geminiBaseSnap = '';

async function getGemini(apiVersion = '') {
  const curKey = String(process.env.GEMINI_API_KEY || '').trim().replace(/^["']|["']$/g, '').trim();
  const curBase = String(process.env.GEMINI_BASE_URL || '').trim().replace(/\/$/, '');
  const ver = String(apiVersion || '').trim();
  if (!curKey) {
    const err = new Error('not_configured');
    err.status = 503;
    throw err;
  }
  if (!geminiMod) geminiMod = await import('@google/genai');
  if (geminiKeySnap !== curKey || geminiBaseSnap !== curBase) {
    geminiClients.clear();
    geminiKeySnap = curKey;
    geminiBaseSnap = curBase;
  }
  let client = geminiClients.get(ver);
  if (!client) {
    const { GoogleGenAI } = geminiMod;
    const opts = {
      apiKey: curKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build'
        }
      }
    };
    if (ver) opts.apiVersion = ver;
    if (curBase) opts.httpOptions.baseUrl = curBase;
    client = new GoogleGenAI(opts);
    geminiClients.set(ver, client);
  }
  return { ai: client, ThinkingLevel: geminiMod.ThinkingLevel };
}

function classifyError(err) {
  const status = Number(err?.status || err?.code || 0);
  const msg = String(err?.message || err || '');
  if (msg === 'not_configured') return 'not_configured';
  if (msg === 'upstream_timeout' || /\b(abort|timed?\s*out|timeout)\b/i.test(msg)) return 'timeout';
  if (status === 401 || status === 403 || /API_KEY_INVALID|API key not valid|ACCESS_TOKEN_TYPE_UNSUPPORTED|PERMISSION_DENIED|UNAUTHENTICATED/i.test(msg)) return 'auth';
  if (status === 429 || /RESOURCE_EXHAUSTED|quota\s*exceeded|\brate[_ -]?limit\b/i.test(msg)) return 'quota';
  if (status === 503 || /UNAVAILABLE|high demand/i.test(msg)) return 'busy';
  if (status === 404 || /NOT_FOUND|model_unavailable/i.test(msg)) return 'model_unavailable';
  return 'upstream';
}

function withTimeout(promise, ms) {
  let timer;
  const timeoutPromise = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('upstream_timeout')), ms);
  });
  return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timer));
}

function errorResponse(err, tag = 'gemini') {
  const code = classifyError(err);
  const safeMsg = String(err?.message || err)
    .replace(/AIza[0-9A-Za-z_-]{10,}|AQ\.[0-9A-Za-z._-]{10,}/g, '[REDACTED]')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 360);
  console.error(`[${tag}]`, code, err?.status || '', safeMsg);
  if (code === 'not_configured') return { status: 503, data: { error: 'not_configured', message: 'Gemini API key is not configured on the server' } };
  if (code === 'quota') return { status: 429, data: { error: 'quota' } };
  if (code === 'busy') return { status: 503, data: { error: 'busy' } };
  if (code === 'auth') return { status: 502, data: { error: 'auth', message: 'Invalid GEMINI_API_KEY on the server. Check Settings > Secrets.' } };
  if (code === 'timeout') return { status: 504, data: { error: 'timeout' } };
  return { status: 502, data: { error: code, detail: safeMsg } };
}

module.exports = {
  hitRate,
  resolveProvider,
  getGemini,
  classifyError,
  withTimeout,
  errorResponse
};
