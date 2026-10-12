/**
 * Base template utilities — shared code for all motion templates.
 * These string snippets get embedded in the generated HTML for server-side rendering.
 */

/** The core utility functions as a string, injected into every generated HTML */
export const CORE_UTILS = `
const W = 1080, H = 1920;
const g = document.getElementById('c').getContext('2d');
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

function spring(t, k = 170, d = 26) {
  if (t <= 0) return 0;
  const w0 = Math.sqrt(k), z = d / (2 * w0);
  if (z < 1) {
    const wd = w0 * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-z * w0 * t) * (Math.cos(wd * t) + (z * w0 / wd) * Math.sin(wd * t));
  }
  return 1 - Math.exp(-w0 * t) * (1 + w0 * t);
}

function rng(seed) {
  return () => {
    seed |= 0; seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function easeOutCubic(t) { return 1 - Math.pow(1 - clamp(t), 3); }
function easeInOutCubic(t) { t = clamp(t); return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3) / 2; }
`;

/** Wrap template scenes + config into a complete standalone HTML page */
export function wrapHTML(config, scenesCode, extraSetup = '') {
  const font = config.brand?.font || 'Cairo';
  const bg = config.brand?.bgColor || '#080A12';
  const dir = config.brand?.direction || 'rtl';

  return `<!doctype html>
<meta charset="utf-8">
<style>
  @import url('https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;600;700;800&display=swap');
  html,body{margin:0;background:${bg}}canvas{display:block;max-height:100vh}
</style>
<canvas id="c" width="1080" height="1920"></canvas>
<script>
${CORE_UTILS}
const DUR = ${config.duration || 24};
g.direction = '${dir}';
g.textBaseline = 'alphabetic';

const CONFIG = ${JSON.stringify(config)};
${extraSetup}
${scenesCode}

function draw(t) {
  g.fillStyle = '${bg}';
  g.fillRect(0, 0, W, H);
  for (const s of SCENES) if (t >= s.from && t < s.to) s.draw(t - s.from);
}
window.seek = (t) => { draw(t); return true; };

if (!navigator.webdriver) {
  const t0 = performance.now();
  (function loop() { draw(((performance.now() - t0) / 1000) % DUR); requestAnimationFrame(loop); })();
}
</script>`;
}

/** Default brand config */
export const DEFAULT_BRAND = {
  name: 'MARROK',
  accentColor: '#6EA0FF',
  bgColor: '#080A12',
  textColor: '#FFFFFF',
  font: 'Cairo',
  direction: 'rtl'
};

/** Generate cues from scene transitions */
export function generateCues(scenes) {
  const cues = [];
  for (const scene of scenes) {
    // Click at scene start
    cues.push({ t: scene.from + 0.1, type: 'click', amp: 0.14 });
    // Whoosh for scenes longer than 2s
    if ((scene.to - scene.from) >= 2.5) {
      cues.push({ t: scene.from + 0.5, type: 'whoosh', amp: 0.12 });
    }
  }
  return cues;
}
