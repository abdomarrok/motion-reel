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
    const html = compileTemplate(templateId, config);
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
    updateJob(jobId, { stage: 'Synthesizing sound effects...', percent: 80 });
    const sfxPath = resolve(jobDir, 'sfx.wav');
    await runSfx(cuesPath, sfxPath);

    // 5. Mix final video
    updateJob(jobId, { stage: 'Mixing final video...', percent: 90 });
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
      error: err.message,
      percent: 0
    });
    throw err;
  }
}

/**
 * Render frames using Playwright + ffmpeg (mirrors scripts/render.mjs)
 */
async function renderFrames(jobId, jobDir, htmlPath, config) {
  const { chromium } = await import('playwright');

  const fps = 60;
  const dur = config.duration || 20;
  const sub = 2; // lower subframes for speed in web app mode

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage({
      viewport: { width: 1080, height: 1920 },
      deviceScaleFactor: 1
    });

    const { pathToFileURL } = await import('node:url');
    await page.goto(pathToFileURL(htmlPath).href);
    await page.evaluate(() => document.fonts.ready);

    // ffmpeg process
    const vf = sub > 1
      ? `tmix=frames=${sub},select=eq(mod(n\\,${sub})\\,${sub - 1}),setpts=N/${fps}/TB`
      : 'null';

    const silentPath = resolve(jobDir, 'silent.mp4');
    const ffArgs = [
      '-y', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(fps * sub), '-i', '-',
      '-vf', vf, '-r', String(fps),
      '-c:v', 'libx264', '-crf', '18', '-pix_fmt', 'yuv420p',
      silentPath
    ];

    const ff = spawn(FFMPEG_BIN, ffArgs, { stdio: ['pipe', 'inherit', 'inherit'] });
    let ffError = null;
    ff.on('error', (err) => { ffError = err; });

    const total = Math.round(dur * fps * sub);
    for (let i = 0; i < total; i++) {
      if (ffError) throw ffError;
      await page.evaluate((t) => window.seek(t), i / (fps * sub));
      const png = await page.locator('#c').screenshot({ type: 'jpeg', quality: 90 });
      if (!ff.stdin.write(png)) {
        await new Promise((r) => ff.stdin.once('drain', r));
      }

      // Update progress
      if (i % (fps * sub) === 0) {
        const sec = i / (fps * sub);
        const pct = 15 + (sec / dur) * 60; // 15% → 75%
        updateJob(jobId, {
          stage: `Rendering ${sec.toFixed(0)}s / ${dur}s...`,
          percent: Math.round(pct)
        });
      }
    }

    ff.stdin.end();
    await new Promise((resolve, reject) => {
      ff.on('close', (code) => code === 0 ? resolve() : reject(new Error(`ffmpeg exited with code ${code}`)));
      ff.on('error', reject);
    });
  } finally {
    await browser.close();
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
