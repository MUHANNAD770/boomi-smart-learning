#!/usr/bin/env node
'use strict';

/**
 * tools/generate-missing-audio.js
 * أداة سطر أوامر لتدقيق وتوليد الملفات الصوتية الناقصة فقط للمنهج العربي والإنجليزي والقصص.
 * لا يُعيد توليد أي صوت محفوظ مسبقًا.
 *
 * أمثلة الاستخدام:
 *   node tools/generate-missing-audio.js --audit
 *   node tools/generate-missing-audio.js --voice=kore --limit=50
 *   node tools/generate-missing-audio.js --voice=kore --lang=ar --source=story
 *   node tools/generate-missing-audio.js --all-voices --to-static --export-manifest
 */

const audioCatalog = require('../server/audio-catalog');
const audioDb = require('../server/audio-db');
const audioStorage = require('../server/audio-storage');
const tts = require('../server/tts-provider');

function parseArgs(argv) {
  const out = {
    audit: false,
    allVoices: false,
    voice: 'kore',
    lang: 'all',
    source: 'all',
    limit: 0,
    concurrency: 2,
    delayMs: 120,
    toStatic: false,
    exportManifest: false
  };
  for (const arg of argv.slice(2)) {
    if (arg === '--audit' || arg === '--dry-run') out.audit = true;
    else if (arg === '--all-voices') out.allVoices = true;
    else if (arg === '--to-static') out.toStatic = true;
    else if (arg === '--export-manifest') out.exportManifest = true;
    else if (arg.startsWith('--voice=')) out.voice = arg.split('=')[1];
    else if (arg.startsWith('--lang=')) out.lang = arg.split('=')[1];
    else if (arg.startsWith('--source=')) out.source = arg.split('=')[1];
    else if (arg.startsWith('--limit=')) out.limit = Number(arg.split('=')[1]) || 0;
    else if (arg.startsWith('--concurrency=')) out.concurrency = Number(arg.split('=')[1]) || 2;
    else if (arg.startsWith('--delay=')) out.delayMs = Number(arg.split('=')[1]) || 120;
  }
  return out;
}

async function main() {
  const opts = parseArgs(process.argv);
  const voices = opts.allVoices ? Object.keys(tts.VOICES) : [opts.voice];

  console.log('Storage Info:', audioStorage.getStorageInfo());
  console.log('Database Info:', audioDb.getDbInfo());

  for (const voiceId of voices) {
    if (opts.audit) {
      const report = await audioCatalog.auditMissingAudio({
        voiceId,
        lang: opts.lang,
        sourceType: opts.source
      });
      console.log(`[Audit:${report.voiceId}] Total=${report.totalCatalog}, Saved=${report.savedCount}, Missing=${report.missingCount}`);
      continue;
    }

    if (!tts.isTtsConfigured()) {
      console.error('Error: GEMINI_API_KEY is required to synthesize missing clips (existing clips remain intact).');
      process.exitCode = 1;
      break;
    }

    console.log(`[Backfill:${voiceId}] Starting missing-only generation (lang=${opts.lang}, source=${opts.source}, limit=${opts.limit || 'all'})...`);
    const result = await audioCatalog.generateMissingAudio({
      voiceId,
      lang: opts.lang,
      sourceType: opts.source,
      limit: opts.limit,
      concurrency: opts.concurrency,
      delayMs: opts.delayMs,
      mirrorStatic: opts.toStatic,
      onProgress(p) {
        if (p.done % 20 === 0 || p.done === p.total) {
          console.log(`  Progress [${voiceId}]: ${p.done}/${p.total} (generated=${p.generated}, failed=${p.failed})`);
        }
      }
    });
    console.log(`[Backfill:${voiceId}] Complete:`, JSON.stringify({ ...result, errors: result.errors.slice(0, 5) }));
  }

  if (opts.exportManifest) {
    const m = await audioDb.exportManifest();
    console.log(`[Manifest] Exported ${m.count} clips to ${audioDb.STATIC_MANIFEST_PATH}`);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
