/**
 * Kinetic Text Template
 * Bold typography that springs in with staggered timing.
 * Best for: announcements, quotes, CTAs, brand awareness.
 * Based on the MARROK video pattern.
 */
import { wrapHTML, DEFAULT_BRAND, generateCues } from './base.js';

export const meta = {
  id: 'kinetic-text',
  name: 'Kinetic Text',
  description: 'Bold typography with spring-physics timing. Words slam in, accent bars sweep, staggered reveals.',
  category: 'Typography',
  tags: ['text', 'kinetic', 'bold', 'minimal']
};

export function defaultConfig(brand = DEFAULT_BRAND) {
  return {
    brand: { ...DEFAULT_BRAND, ...brand },
    duration: 20,
    scenes: [
      {
        id: 'hook',
        label: 'Hook',
        text: 'عندك موقع؟',
        from: 0,
        to: 3,
        springK: 240,
        springD: 20
      },
      {
        id: 'reveal',
        label: 'Reveal',
        text: 'نصممو مواقع تحسها كيما تطبيق',
        from: 3,
        to: 6,
        springK: 220,
        springD: 22
      },
      {
        id: 'features',
        label: 'Features',
        text: 'حركة سلسة|سريعة|بسيطة',
        from: 6,
        to: 9,
        springK: 260,
        springD: 18
      },
      {
        id: 'brand',
        label: 'Brand Focus',
        text: '',
        from: 9,
        to: 13,
        springK: 240,
        springD: 18
      },
      {
        id: 'tagline',
        label: 'Tagline',
        text: 'Smooth. Fast. Minimal.',
        from: 13,
        to: 16,
        springK: 220,
        springD: 20
      },
      {
        id: 'cta',
        label: 'CTA',
        text: 'DM for your website',
        from: 16,
        to: 20,
        springK: 200,
        springD: 22
      }
    ]
  };
}

export function toHTML(config) {
  const c = config;
  const b = c.brand;
  const scenes = c.scenes;

  const scenesCode = `
const SCENES = [
  // Scene 0: Hook — big text springs in
  { from: ${scenes[0].from}, to: ${scenes[0].to}, draw(t) {
    const s = spring(t - 0.1, ${scenes[0].springK}, ${scenes[0].springD});
    g.save(); g.direction = '${b.direction}'; g.globalAlpha = clamp(t * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '800 180px "${b.font}", "Noto Sans Arabic", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.28);
    g.scale(0.95 + 0.05 * s, 0.95 + 0.05 * s);
    g.fillText(${JSON.stringify(scenes[0].text)}, 0, 0);
    g.restore();
    // accent bar
    g.save();
    g.fillStyle = '${b.accentColor}';
    const bar = spring(t, 200, 22);
    g.fillRect(W / 2 - 320 * bar, H * 0.32, 640 * bar, 14);
    g.restore();
  }},

  // Scene 1: Reveal — description with card line
  { from: ${scenes[1].from}, to: ${scenes[1].to}, draw(t) {
    const s = spring(t - 0.15, ${scenes[1].springK}, ${scenes[1].springD});
    g.save(); g.direction = '${b.direction}'; g.globalAlpha = clamp((t - 0.15) * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '700 100px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.26);
    g.scale(1 + 0.02 * s, 1 + 0.02 * s);
    g.fillText(${JSON.stringify(scenes[1].text)}, 0, 0);
    g.restore();
    // divider line
    g.save();
    g.fillStyle = '${b.accentColor}';
    const card = spring(t, 180, 24);
    g.fillRect(80, H * 0.36, (W - 160) * card, 8);
    g.restore();
  }},

  // Scene 2: Features — staggered text blocks
  { from: ${scenes[2].from}, to: ${scenes[2].to}, draw(t) {
    g.save(); g.direction = '${b.direction}';
    const items = ${JSON.stringify(scenes[2].text)}.split('|');
    items.forEach((txt, i) => {
      const st = t - i * 0.15;
      const s = spring(st, ${scenes[2].springK}, ${scenes[2].springD});
      g.save();
      g.globalAlpha = clamp(st * 4);
      g.translate(W / 2, H * 0.24 + i * 170);
      g.scale(0.9 + 0.1 * s, 0.9 + 0.1 * s);
      g.fillStyle = '${b.textColor}';
      g.font = '700 110px "${b.font}", Arial, sans-serif';
      g.textAlign = 'center';
      g.fillText(txt.trim(), 0, 0);
      g.fillStyle = '${b.accentColor}';
      g.fillRect(-200 * s, 60, 400 * s, 8);
      g.restore();
    });
    g.restore();
  }},

  // Scene 3: Brand name focus
  { from: ${scenes[3].from}, to: ${scenes[3].to}, draw(t) {
    const s = spring(t - 0.1, ${scenes[3].springK}, ${scenes[3].springD});
    g.save(); g.direction = '${b.direction}'; g.globalAlpha = clamp((t - 0.1) * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '800 220px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.28);
    g.scale(0.98 + 0.02 * s, 0.98 + 0.02 * s);
    g.fillText(${JSON.stringify(b.name)}, 0, 0);
    g.fillStyle = '${b.accentColor}';
    g.fillRect(-280 * s, 90, 560 * s, 12);
    g.restore();
    // geometric accent shapes
    const r = rng(42);
    for (let i = 0; i < 6; i++) {
      const rx = r() * W, ry = H * 0.5 + r() * H * 0.3;
      const sz = 20 + r() * 60;
      const ss = spring(t - 0.3 - i * 0.08, 180, 22);
      g.save();
      g.globalAlpha = 0.08 * clamp((t - 0.3) * 3);
      g.fillStyle = '${b.accentColor}';
      g.fillRect(rx - sz * ss / 2, ry - sz * ss / 2, sz * ss, sz * ss);
      g.restore();
    }
  }},

  // Scene 4: Tagline (English / secondary)
  { from: ${scenes[4].from}, to: ${scenes[4].to}, draw(t) {
    const s = spring(t - 0.1, ${scenes[4].springK}, ${scenes[4].springD});
    g.save(); g.direction = 'ltr'; g.globalAlpha = clamp((t - 0.1) * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '800 130px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.26);
    g.scale(1 + 0.02 * s, 1 + 0.02 * s);
    g.fillText(${JSON.stringify(scenes[4].text)}, 0, 0);
    g.restore();
    g.save();
    g.fillStyle = '${b.accentColor}';
    const bar = spring(t - 0.2, 180, 22);
    g.fillRect(W / 2 - 360 * bar, H * 0.32, 720 * bar, 8);
    g.restore();
  }},

  // Scene 5: CTA — call to action
  { from: ${scenes[5].from}, to: ${scenes[5].to}, draw(t) {
    const s1 = spring(t - 0.1, ${scenes[5].springK}, ${scenes[5].springD});
    const s2 = spring(t - 0.3, 180, 22);
    g.save(); g.direction = '${b.direction}'; g.globalAlpha = clamp((t - 0.1) * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '700 100px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.24);
    g.scale(1 + 0.01 * s1, 1 + 0.01 * s1);
    g.fillText(${JSON.stringify(scenes[5].text)}, 0, 0);
    g.restore();
    // brand name small
    g.save(); g.globalAlpha = clamp((t - 0.4) * 4);
    g.fillStyle = '${b.accentColor}';
    g.font = '600 50px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.fillText(${JSON.stringify(b.name)}, W / 2, H * 0.32);
    g.restore();
    // bottom bar
    g.save();
    g.fillStyle = '${b.accentColor}';
    const bar = spring(t - 0.2, 200, 22);
    g.fillRect(W / 2 - 420 * bar, H * 0.38, 840 * bar, 6);
    g.restore();
  }}
];`;

  return wrapHTML(config, scenesCode);
}
