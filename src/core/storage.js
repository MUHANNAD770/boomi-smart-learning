/* src/core/storage.js — إدارة ملفات الطلاب والتقدّم مع توافق كامل مع hrw و hrw2 */
(() => {
  'use strict';

  const app = document.getElementById('app');
  const mem = {};

  let DB = (() => {
    try { return JSON.parse(localStorage.getItem('hrw2')); } catch { return null; }
  })() || { kids: [], cur: 0 };

  if (!DB.kids.length) {
    try {
      const legacy = JSON.parse(localStorage.getItem('hrw'));
      if (legacy) DB.kids.push(legacy);
    } catch {}
  }

  let P = DB.kids[DB.cur] || null;
  let V = '';
  let cur = null;
  let qs = null;
  let qi = 0;
  let sc = 0;
  let tries = 0;
  let rs = 0;

  function load() {
    return DB.kids[DB.cur] || null;
  }

  function save() {
    if (P) DB.kids[DB.cur] = P;
    mem.p = P;
    try { localStorage.setItem('hrw2', JSON.stringify(DB)); } catch {}
    try { if (P) localStorage.setItem('hrw', JSON.stringify(P)); } catch {}
  }

  function ens() {
    if (!P) return;
    P.name = String(P.name || '').replace(/[<>&"'`]/g, '').trim() || 'صديقي';
    P.gender = P.gender === 'female' ? 'female' : 'male';
    delete P.t;
    delete P.lim;
    // Remove legacy math and deprecated voice provider fields if present
    delete P.ml;
    delete P.myv;
    delete P.vmode;
    delete P.voice;
    delete P.voiceCloud;
    if (!P.voiceId) P.voiceId = P.teacher === 'male' ? 'puck' : 'kore';
    if (P.autoSpeak === undefined) P.autoSpeak = 1;
    ['done', 'sc', 'sk', 'fd', 'wl', 'cd', 'pr', 'stat', 'exams', 'mistakes'].forEach(k => {
      if (!P[k] || typeof P[k] !== 'object' || Array.isArray(P[k])) {
        P[k] = {};
      }
    });
    if (P.stat && P.stat.m) delete P.stat.m;
    P.star = +P.star || 0;
    const maxStage = (window.S && S.length) ? S.length - 1 : 4;
    if (P.stage == null || isNaN(+P.stage)) P.stage = 0;
    P.stage = Math.max(0, Math.min(maxStage, +P.stage));
  }

  let h = x => {
    if (!app) return;
    app.innerHTML = x;
    try { window.scrollTo(0, 0); } catch {}
  };

  window.app = app;
  window.mem = mem;
  window.DB = DB;
  window.load = load;
  window.save = save;
  window.ens = ens;
  window.h = h;

  const def = (k, g, s) => {
    try { Object.defineProperty(window, k, { get: g, set: s, configurable: true }); } catch {}
  };
  def('P', () => P, v => { P = v; });
  def('V', () => V, v => { V = v; });
  def('cur', () => cur, v => { cur = v; });
  def('qs', () => qs, v => { qs = v; });
  def('qi', () => qi, v => { qi = v; });
  def('sc', () => sc, v => { sc = v; });
  def('tries', () => tries, v => { tries = v; });
  def('rs', () => rs, v => { rs = v; });
  def('h', () => h, v => { h = v; });
})();
