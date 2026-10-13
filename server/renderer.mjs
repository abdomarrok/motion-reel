/**
 * Renderer — Wraps the existing render pipeline.
 * Compiles template + config → index.html, runs Playwright + ffmpeg.
 */
import { mkdirSync, writeFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import ffmpegPath from 'ffmpeg-static';
import { compileTemplate } from './template-compiler.mjs';

const FFMPEG_BIN = ffmpegPath || 'ffmpeg';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

// In-memory job store
const jobs = new Map();

export function getJobStatus(jobId) {
  return jobs.get(jobId) || null;
}

export function cancelJob(jobId) {
  const job = jobs.get(jobId);
  if (!job) return false;
  if (job.status === 'running') {
    job.cancelled = true;
    if (job.ff) {
      try { job.ff.kill(); } catch (_) {}
    }
    if (job.browser) {
      try { job.browser.close().catch(() => {}); } catch (_) {}
    }
    updateJob(jobId, { status: 'cancelled', stage: 'Render cancelled', percent: 0 });
    return true;
  }
  return false;
}

function updateJob(jobId, updates) {
  const current = jobs.get(jobId) || {};
  jobs.set(jobId, { ...current, ...updates });
}

/**
 * Run the full render pipeline for a job.
 */
export async function renderVideo(jobId, templateId, config) {
  const jobDir = resolve(ROOT, 'out', jobId);
  mkdirSync(jobDir, { recursive: true });

  updateJob(jobId, { status: 'running', stage: 'Compiling template...', percent: 5 });

  try {
    // 1. Compile template to standalone index.html
    const html = await compileTemplate(templateId, config);
    const htmlPath = resolve(jobDir, 'index.html');
    writeFileSync(htmlPath, html, 'utf8');
    updateJob(jobId, { stage: 'Template compiled', percent: 10 });

    // 2. Generate cues.json
    const cues = generateCuesFromConfig(config);
    const cuesPath = resolve(jobDir, 'cues.json');
    writeFileSync(cuesPath, JSON.stringify(cues, null, 2), 'utf8');

    // 3. Render frames → silent.mp4 via Playwright + ffmpeg
    updateJob(jobId, { stage: 'Rendering frames...', percent: 15 });
    await renderFrames(jobId, jobDir, htmlPath, config);

    // 4. Generate SFX
    updateJob(jobId, { stage: 'Synthesizing sound effects...', percent: 85 });
    const sfxPath = resolve(jobDir, 'sfx.wav');
    await runSfx(cuesPath, sfxPath);

    // 5. Mix final video
    updateJob(jobId, { stage: 'Mixing final video...', percent: 92 });
    const silentPath = resolve(jobDir, 'silent.mp4');
    const finalPath = resolve(jobDir, 'final.mp4');
    await mixAudio(silentPath, sfxPath, finalPath);

    updateJob(jobId, {
      status: 'done',
      stage: 'Complete!',
      percent: 100,
      outputPath: finalPath
    });

    console.log(`[render] Job ${jobId} complete → ${finalPath}`);
  } catch (err) {
    console.error(`[render] Job ${jobId} error:`, err);
    updateJob(jobId, {
      status: 'error',
      stage: 'Error: ' + err.message,
      error: err.message,
      percent: 0
    });
    throw err;
  }
}

/**
 * Render frames using Playwright + ffmpeg.
 *
 * Performance tuning:
 * - 30 fps is the TikTok/Reels standard — 60fps gives no benefit for shorts.
 * - No subframe blending (sub=1) — canvas animations don't need temporal AA.
 * - JPEG quality 80 keeps pipe small without visible loss at 1080×1920.
 * - 20s video @ 30fps = 600 frames ≈ 30–60 seconds to render.
 */
async function renderFrames(jobId, jobDir, htmlPath, config) {
  const { chromium } = await import('playwright');

  const fps = 30;
  const dur = config.duration || 20;
  const total = Math.round(dur * fps);

  console.log(`[render] Capturing ${total} frames @ ${fps}fps for ${dur}s video...`);

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1080, height: 1920 },
      deviceScaleFactor: 1
    });

    const { pathToFileURL } = await import('node:url');
    await page.goto(pathToFileURL(htmlPath).href);
    await page.evaluate(() => document.fonts.ready);

    const silentPath = resolve(jobDir, 'silent.mp4');
    const ffArgs = [
      '-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(fps), '-i', '-',
      '-c:v', 'libx264', '-crf', '20', '-preset', 'fast',
      '-pix_fmt', 'yuv420p',
      silentPath
    ];

    const ff = spawn(FFMPEG_BIN, ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });
    let ffError = null;
    ff.on('error', (err) => { ffError = err; });

    updateJob(jobId, { browser, ff });

    const canvasLocator = page.locator('#c');
    const startTime = Date.now();
    const progressInterval = Math.max(5, Math.round(fps / 3)); // every ~1/3 second

    for (let i = 0; i < total; i++) {
      if (jobs.get(jobId)?.cancelled) {
        throw new Error('Render cancelled by user');
      }
      if (ffError) throw ffError;

      await page.evaluate((t) => window.seek(t), i / fps);
      const frame = await canvasLocator.screenshot({ type: 'jpeg', quality: 80 });

      if (!ff.stdin.write(frame)) {
        await new Promise((r) => ff.stdin.once('drain', r));
      }

      // Smooth progress update
      if (i % progressInterval === 0 || i === total - 1) {
        const sec = i / fps;
        const pct = 15 + (sec / dur) * 68; // 15% → 83%
        const elapsed = ((Date.now() - startTime) / 1000).toFixed(0);
        updateJob(jobId, {
          stage: `Rendering ${sec.toFixed(1)}s / ${dur}s  (${elapsed}s elapsed)`,
          percent: Math.min(83, Math.round(pct))
        });
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`[render] Frame capture done in ${elapsed}s`);

    ff.stdin.end();
    await new Promise((resolve, reject) => {
      ff.on('close', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`)));
      ff.on('error', reject);
    });
  } finally {
    updateJob(jobId, { browser: null, ff: null });
    await browser.close().catch(() => {});
  }
}

/**
 * Run sfx.mjs to generate sound effects
 */
async function runSfx(cuesPath, sfxPath) {
  const sfxScript = resolve(ROOT, 'scripts', 'sfx.mjs');

  // Check if scripts/sfx.mjs exists, fall back to root sfx.mjs
  const scriptPath = existsSync(sfxScript) ? sfxScript : resolve(ROOT, 'sfx.mjs');

  return new Promise((resolve, reject) => {
    const proc = spawn('node', [scriptPath, cuesPath, sfxPath], {
      cwd: ROOT,
      stdio: 'inherit'
    });
    proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`sfx.mjs exited with code ${code}`)));
    proc.on('error', reject);
  });
}

/**
 * Mix silent video + SFX into final.mp4
 */
async function mixAudio(silentPath, sfxPath, finalPath) {
  return new Promise((resolve, reject) => {
    const proc = spawn(FFMPEG_BIN, [
      '-y', '-loglevel', 'error',
      '-i', silentPath,
      '-i', sfxPath,
      '-filter_complex', '[1:a]loudnorm=I=-14:TP=-1.5[a]',
      '-map', '0:v',
      '-map', '[a]',
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-shortest',
      finalPath
    ], { stdio: 'inherit' });
    proc.on('close', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg mix exited with code ${code}`)));
    proc.on('error', reject);
  });
}

/**
 * Generate SFX cues from config scenes
 */
function generateCuesFromConfig(config) {
  const cues = [];
  for (const scene of config.scenes) {
    cues.push({ t: scene.from + 0.1, type: 'click', amp: 0.14 });
    if ((scene.to - scene.from) >= 2.5) {
      cues.push({ t: scene.from + 0.5, type: 'whoosh', amp: 0.12 });
    }
  }
  return cues;
}
