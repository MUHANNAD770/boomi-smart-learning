'use strict';

// Netlify Function: Boomi AI Tutor (shares unified language-only rules with server/ai-provider.js)
const { SYS, EX, cl, list, mkInfo, parseItems, hitRate, handleTutor } = require('../../server/ai-provider');

const J = (c, o) => ({ statusCode: c, headers: { 'content-type': 'application/json; charset=utf-8' }, body: JSON.stringify(o) });

exports.shared = { SYS, EX, J, hit: hitRate, cl, list, mkInfo };

exports.handler = async ev => {
  if (ev.httpMethod !== 'POST') return J(405, { error: 'method' });
  if ((ev.body || '').length > 12000) return J(413, { error: 'big' });
  let b;
  try { b = JSON.parse(ev.body || '{}'); } catch { return J(400, { error: 'bad' }); }
  const ip = (ev.headers && (ev.headers['x-nf-client-connection-ip'] || String(ev.headers['x-forwarded-for'] || '').split(',')[0])) || 'x';
  const out = await handleTutor(b, ip);
  return J(out.status, out.data);
};
