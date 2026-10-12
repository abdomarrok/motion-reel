/**
 * Template Compiler — Generates standalone index.html from template ID + config.
 * This is the server-side counterpart of the template modules.
 */
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Compile a template + config into a standalone HTML string.
 * Dynamically imports the template module from the app source.
 */
export function compileTemplate(templateId, config) {
  // We dynamically import the template from the app source.
  // Since these are ES modules with string output, we can import them directly.
  // However, for the server we need to handle this carefully.

  // For now, use a map of template compilers that mirror the client-side templates.
  const compiler = COMPILERS[templateId];
  if (!compiler) {
    throw new Error(`Unknown template: "${templateId}". Available: ${Object.keys(COMPILERS).join(', ')}`);
  }
  return compiler(config);
}

// ─── Core Utilities (shared by all templates) ────────────────────────

const CORE_UTILS = `
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
`;

function wrapHTML(config, scenesCode) {
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

// ─── Template Compilers ──────────────────────────────────────────────

const COMPILERS = {
  'kinetic-text': compileKineticText,
  'product-showcase': compileProductShowcase,
  'brand-intro': compileBrandIntro
};

function compileKineticText(config) {
  const b = config.brand;
  const scenes = config.scenes;

  const scenesCode = `
const SCENES = [
  { from: ${scenes[0].from}, to: ${scenes[0].to}, draw(t) {
    const s = spring(t - 0.1, ${scenes[0].springK}, ${scenes[0].springD});
    g.save(); g.direction = '${b.direction}'; g.globalAlpha = clamp(t * 5);
    g.fillStyle = '${b.textColor}'; g.font = '800 180px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center'; g.translate(W/2, H*0.28); g.scale(0.95+0.05*s, 0.95+0.05*s);
    g.fillText(${JSON.stringify(scenes[0].text)}, 0, 0); g.restore();
    g.save(); g.fillStyle = '${b.accentColor}'; const bar = spring(t, 200, 22);
    g.fillRect(W/2-320*bar, H*0.32, 640*bar, 14); g.restore();
  }},
  { from: ${scenes[1].from}, to: ${scenes[1].to}, draw(t) {
    const s = spring(t-0.15, ${scenes[1].springK}, ${scenes[1].springD});
    g.save(); g.direction='${b.direction}'; g.globalAlpha=clamp((t-0.15)*5);
    g.fillStyle='${b.textColor}'; g.font='700 100px "${b.font}",Arial,sans-serif';
    g.textAlign='center'; g.translate(W/2,H*0.26); g.scale(1+0.02*s,1+0.02*s);
    g.fillText(${JSON.stringify(scenes[1].text)},0,0); g.restore();
    g.save(); g.fillStyle='${b.accentColor}'; const card=spring(t,180,24);
    g.fillRect(80,H*0.36,(W-160)*card,8); g.restore();
  }},
  { from: ${scenes[2].from}, to: ${scenes[2].to}, draw(t) {
    g.save(); g.direction='${b.direction}';
    const items = ${JSON.stringify(scenes[2].text)}.split('|');
    items.forEach((txt,i)=>{ const st=t-i*0.15; const s=spring(st,${scenes[2].springK},${scenes[2].springD});
      g.save(); g.globalAlpha=clamp(st*4); g.translate(W/2,H*0.24+i*170);
      g.scale(0.9+0.1*s,0.9+0.1*s); g.fillStyle='${b.textColor}';
      g.font='700 110px "${b.font}",Arial,sans-serif'; g.textAlign='center';
      g.fillText(txt.trim(),0,0); g.fillStyle='${b.accentColor}';
      g.fillRect(-200*s,60,400*s,8); g.restore(); });
    g.restore();
  }},
  { from: ${scenes[3].from}, to: ${scenes[3].to}, draw(t) {
    const s=spring(t-0.1,${scenes[3].springK},${scenes[3].springD});
    g.save(); g.globalAlpha=clamp((t-0.1)*5); g.fillStyle='${b.textColor}';
    g.font='800 220px "${b.font}",Arial,sans-serif'; g.textAlign='center';
    g.translate(W/2,H*0.28); g.scale(0.98+0.02*s,0.98+0.02*s);
    g.fillText(${JSON.stringify(b.name)},0,0); g.fillStyle='${b.accentColor}';
    g.fillRect(-280*s,90,560*s,12); g.restore();
  }},
  { from: ${scenes[4].from}, to: ${scenes[4].to}, draw(t) {
    const s=spring(t-0.1,${scenes[4].springK},${scenes[4].springD});
    g.save(); g.direction='ltr'; g.globalAlpha=clamp((t-0.1)*5);
    g.fillStyle='${b.textColor}'; g.font='800 130px "${b.font}",Arial,sans-serif';
    g.textAlign='center'; g.translate(W/2,H*0.26); g.scale(1+0.02*s,1+0.02*s);
    g.fillText(${JSON.stringify(scenes[4].text)},0,0); g.restore();
    g.save(); g.fillStyle='${b.accentColor}'; const bar=spring(t-0.2,180,22);
    g.fillRect(W/2-360*bar,H*0.32,720*bar,8); g.restore();
  }},
  { from: ${scenes[5].from}, to: ${scenes[5].to}, draw(t) {
    const s1=spring(t-0.1,${scenes[5].springK},${scenes[5].springD});
    g.save(); g.direction='${b.direction}'; g.globalAlpha=clamp((t-0.1)*5);
    g.fillStyle='${b.textColor}'; g.font='700 100px "${b.font}",Arial,sans-serif';
    g.textAlign='center'; g.translate(W/2,H*0.24);
    g.fillText(${JSON.stringify(scenes[5].text)},0,0); g.restore();
    g.save(); g.globalAlpha=clamp((t-0.4)*4); g.fillStyle='${b.accentColor}';
    g.font='600 50px "${b.font}",Arial,sans-serif'; g.textAlign='center';
    g.fillText(${JSON.stringify(b.name)},W/2,H*0.32); g.restore();
    g.save(); g.fillStyle='${b.accentColor}'; const bar=spring(t-0.2,200,22);
    g.fillRect(W/2-420*bar,H*0.38,840*bar,6); g.restore();
  }}
];`;

  return wrapHTML(config, scenesCode);
}

function compileProductShowcase(config) {
  const b = config.brand;
  const scenes = config.scenes;

  const scenesCode = `
const SCENES = [
  { from: ${scenes[0].from}, to: ${scenes[0].to}, draw(t) {
    const s = spring(t-0.05, ${scenes[0].springK}, ${scenes[0].springD});
    g.save(); g.globalAlpha=clamp(t*6); g.fillStyle='${b.textColor}';
    g.font='800 140px "${b.font}",Arial,sans-serif'; g.textAlign='center';
    g.translate(W/2,H*0.3); g.scale(0.92+0.08*s,0.92+0.08*s);
    g.fillText(${JSON.stringify(scenes[0].text)},0,0); g.restore();
    g.save(); g.globalAlpha=clamp((t-0.3)*4)*0.15; g.fillStyle='${b.accentColor}';
    g.font='900 600px "${b.font}",Arial,sans-serif'; g.textAlign='center';
    const qs=spring(t-0.2,120,26); g.translate(W/2,H*0.55);
    g.scale(0.8+0.2*qs,0.8+0.2*qs); g.fillText('?',0,0); g.restore();
  }},
  { from: ${scenes[1].from}, to: ${scenes[1].to}, draw(t) {
    const cardS=spring(t-0.1,${scenes[1].springK},${scenes[1].springD});
    const cardW=800, cardH=1000, cx=(W-cardW)/2, cy=H*0.22;
    g.save(); g.globalAlpha=clamp(t*4); g.fillStyle='rgba(255,255,255,0.04)';
    g.beginPath(); g.roundRect(cx,cy+200*(1-cardS),cardW,cardH*cardS,24); g.fill();
    g.strokeStyle='${b.accentColor}'; g.lineWidth=2; g.globalAlpha=clamp(t*4)*0.3;
    g.stroke(); g.restore();
    const r=rng(11);
    for(let i=0;i<5;i++){const elS=spring(t-0.3-i*0.12,220,20);const elY=cy+280+i*140;
    g.save();g.globalAlpha=clamp((t-0.3-i*0.12)*4);
    g.fillStyle=i===0?'${b.accentColor}':'rgba(255,255,255,0.06)';
    const elW=i===0?600:300+r()*300;g.fillRect(cx+80,elY*cardS+200*(1-cardS),elW*elS,i===0?12:20);g.restore();}
    g.save();g.globalAlpha=clamp((t-0.5)*3);g.fillStyle='${b.textColor}';
    g.font='600 48px "${b.font}",Arial,sans-serif';g.textAlign='center';
    g.fillText(${JSON.stringify(scenes[1].text)},W/2,H*0.18);g.restore();
  }},
  { from: ${scenes[2].from}, to: ${scenes[2].to}, draw(t) {
    const items=${JSON.stringify(scenes[2].text)}.split('|');
    items.forEach((txt,i)=>{const st=t-i*0.3;const s=spring(st,${scenes[2].springK},${scenes[2].springD});
    const y=H*0.2+i*260;g.save();g.globalAlpha=clamp(st*3);g.fillStyle='rgba(255,255,255,0.03)';
    const cw=800*s;g.beginPath();g.roundRect((W-cw)/2,y,cw,200,16);g.fill();
    g.fillStyle='${b.accentColor}';g.fillRect((W-cw)/2,y,6,200*s);
    g.fillStyle='${b.textColor}';g.font='700 72px "${b.font}",Arial,sans-serif';
    g.textAlign='left';g.fillText(txt.trim(),(W-cw)/2+40,y+120);g.restore();});
  }},
  { from: ${scenes[3].from}, to: ${scenes[3].to}, draw(t) {
    const s=spring(t-0.08,${scenes[3].springK},${scenes[3].springD});
    g.save();g.globalAlpha=clamp(t*5);g.fillStyle='${b.accentColor}';
    g.font='900 280px "${b.font}",Arial,sans-serif';g.textAlign='center';
    g.translate(W/2,H*0.35);g.scale(0.9+0.1*s,0.9+0.1*s);
    g.fillText(${JSON.stringify(scenes[3].text)},0,0);g.restore();
    g.save();g.fillStyle='${b.textColor}';g.globalAlpha=0.15;
    const bar=spring(t-0.15,180,22);g.fillRect(W*0.15,H*0.42,W*0.7*bar,4);g.restore();
  }},
  { from: ${scenes[4].from}, to: ${scenes[4].to}, draw(t) {
    const s1=spring(t-0.1,${scenes[4].springK},${scenes[4].springD});
    g.save();g.globalAlpha=clamp((t-0.1)*5);g.fillStyle='${b.textColor}';
    g.font='800 160px "${b.font}",Arial,sans-serif';g.textAlign='center';
    g.translate(W/2,H*0.28);g.scale(0.99+0.01*s1,0.99+0.01*s1);
    g.fillText(${JSON.stringify(b.name)},0,0);g.restore();
    const s2=spring(t-0.35,200,22);g.save();g.globalAlpha=clamp((t-0.35)*4);
    g.fillStyle='${b.accentColor}';g.font='600 64px "${b.font}",Arial,sans-serif';
    g.textAlign='center';g.fillText(${JSON.stringify(scenes[4].text)},W/2,H*0.38);g.restore();
    g.save();g.fillStyle='${b.accentColor}';const bar=spring(t-0.2,200,22);
    g.fillRect(W/2-300*bar,H*0.44,600*bar,6);g.restore();
  }}
];`;

  return wrapHTML(config, scenesCode);
}

function compileBrandIntro(config) {
  const b = config.brand;
  const scenes = config.scenes;

  const scenesCode = `
const SCENES = [
  { from: ${scenes[0].from}, to: ${scenes[0].to}, draw(t) {
    const r=rng(99);const cols=6,rows=8;const cellW=W/cols,cellH=(H*0.7)/rows;
    for(let i=0;i<cols*rows;i++){const col=i%cols,row=Math.floor(i/cols);
    const delay=(col+row)*0.04+r()*0.08;const s=spring(t-delay,${scenes[0].springK},${scenes[0].springD});
    if(s<=0)continue;const cx=col*cellW+cellW/2,cy=H*0.15+row*cellH+cellH/2;
    const sz=Math.min(cellW,cellH)*0.65*s;g.save();
    if((col+row)%5===0){g.fillStyle='${b.accentColor}';g.globalAlpha=clamp((t-delay)*4);}
    else{g.fillStyle='${b.textColor}';g.globalAlpha=0.06*clamp((t-delay)*4);}
    if(r()>0.4){g.fillRect(cx-sz/2,cy-sz/2,sz,sz);}
    else{g.beginPath();g.arc(cx,cy,sz/2,0,Math.PI*2);g.fill();}g.restore();}
  }},
  { from: ${scenes[1].from}, to: ${scenes[1].to}, draw(t) {
    const r=rng(99);const cols=6,rows=8;const cellW=W/cols,cellH=(H*0.7)/rows;
    for(let i=0;i<cols*rows;i++){const col=i%cols,row=Math.floor(i/cols);
    const sz=Math.min(cellW,cellH)*0.65;const cx=col*cellW+cellW/2,cy=H*0.15+row*cellH+cellH/2;
    const scatter=spring(t,140,28);const dx=(cx-W/2)*scatter*0.8,dy=(cy-H/2)*scatter*0.5;
    g.save();g.globalAlpha=Math.max(0,0.06*(1-t*0.5));
    g.fillStyle=(col+row)%5===0?'${b.accentColor}':'${b.textColor}';
    if(g.fillStyle==='${b.textColor}')g.globalAlpha*=0.3;
    if(r()>0.4){g.fillRect(cx+dx-sz/2,cy+dy-sz/2,sz,sz);}
    else{g.beginPath();g.arc(cx+dx,cy+dy,sz/2,0,Math.PI*2);g.fill();}g.restore();}
    const ls=spring(t-0.3,${scenes[1].springK},${scenes[1].springD});
    g.save();g.globalAlpha=clamp((t-0.2)*3);g.fillStyle='${b.textColor}';
    g.font='800 200px "${b.font}",Arial,sans-serif';g.textAlign='center';
    g.translate(W/2,H*0.42);g.scale(0.96+0.04*ls,0.96+0.04*ls);
    g.fillText(${JSON.stringify(b.name)},0,0);g.restore();
    const dotS=spring(t-0.6,300,18);g.save();g.globalAlpha=clamp((t-0.5)*4);
    g.fillStyle='${b.accentColor}';g.beginPath();g.arc(W/2+180,H*0.42-60,12*dotS,0,Math.PI*2);
    g.fill();g.restore();
  }},
  { from: ${scenes[2].from}, to: ${scenes[2].to}, draw(t) {
    g.save();g.globalAlpha=0.3;g.fillStyle='${b.textColor}';
    g.font='800 100px "${b.font}",Arial,sans-serif';g.textAlign='center';
    g.fillText(${JSON.stringify(b.name)},W/2,H*0.2);g.restore();
    const bar=spring(t,140,24);g.save();g.fillStyle='${b.accentColor}';
    g.fillRect(0,H*0.42,W*bar,8);g.restore();
    const ts=spring(t-0.25,${scenes[2].springK},${scenes[2].springD});
    g.save();g.globalAlpha=clamp((t-0.25)*5);g.fillStyle='${b.textColor}';
    g.font='700 110px "${b.font}",Arial,sans-serif';g.textAlign='center';
    g.translate(W/2,H*0.38);g.translate(0,120*(1-ts));
    g.fillText(${JSON.stringify(scenes[2].text)},0,0);g.restore();
  }},
  { from: ${scenes[3].from}, to: ${scenes[3].to}, draw(t) {
    const s=spring(t-0.1,${scenes[3].springK},${scenes[3].springD});
    g.save();g.globalAlpha=clamp((t-0.1)*4);g.fillStyle='${b.textColor}';
    g.font='800 140px "${b.font}",Arial,sans-serif';g.textAlign='center';
    g.translate(W/2,H*0.38);g.scale(0.99+0.01*s,0.99+0.01*s);
    g.fillText(${JSON.stringify(b.name)},0,0);g.restore();
    const bar=spring(t-0.25,160,22);g.save();g.fillStyle='${b.accentColor}';
    g.globalAlpha=0.6*clamp((t-0.2)*4);g.fillRect(W/2-200*bar,H*0.43,400*bar,4);g.restore();
    const dotS=spring(t-0.4,280,18);g.save();g.globalAlpha=clamp((t-0.35)*4);
    g.fillStyle='${b.accentColor}';g.beginPath();g.arc(W/2,H*0.47,8*dotS,0,Math.PI*2);
    g.fill();g.restore();
  }}
];`;

  return wrapHTML(config, scenesCode);
}
