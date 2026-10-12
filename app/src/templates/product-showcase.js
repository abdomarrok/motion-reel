/**
 * Product Showcase Template
 * UI cards assemble piece-by-piece with spring physics.
 * Best for: SaaS products, app launches, feature announcements.
 */
import { wrapHTML, DEFAULT_BRAND, generateCues } from './base.js';

export const meta = {
  id: 'product-showcase',
  name: 'Product Showcase',
  description: 'UI mockup cards assemble with spring timing. Features highlighted one by one. Metric counter for social proof.',
  category: 'Product',
  tags: ['product', 'UI', 'features', 'SaaS']
};

export function defaultConfig(brand = DEFAULT_BRAND) {
  return {
    brand: { ...DEFAULT_BRAND, ...brand },
    duration: 20,
    scenes: [
      {
        id: 'hook',
        label: 'Problem Hook',
        text: 'Your website feels stuck?',
        from: 0,
        to: 3,
        springK: 280,
        springD: 22
      },
      {
        id: 'product',
        label: 'Product Reveal',
        text: 'Meet the solution',
        from: 3,
        to: 7,
        springK: 200,
        springD: 24
      },
      {
        id: 'features',
        label: 'Features',
        text: 'Lightning Fast|Pixel Perfect|Zero Config',
        from: 7,
        to: 12,
        springK: 260,
        springD: 18
      },
      {
        id: 'metric',
        label: 'Social Proof',
        text: '10x Faster',
        from: 12,
        to: 16,
        springK: 300,
        springD: 20
      },
      {
        id: 'cta',
        label: 'End CTA',
        text: 'Try it free →',
        from: 16,
        to: 20,
        springK: 220,
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
  // Hook — problem statement slams in
  { from: ${scenes[0].from}, to: ${scenes[0].to}, draw(t) {
    const s = spring(t - 0.05, ${scenes[0].springK}, ${scenes[0].springD});
    g.save();
    g.globalAlpha = clamp(t * 6);
    g.fillStyle = '${b.textColor}';
    g.font = '800 140px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.3);
    g.scale(0.92 + 0.08 * s, 0.92 + 0.08 * s);
    g.fillText(${JSON.stringify(scenes[0].text)}, 0, 0);
    g.restore();
    // question mark accent
    g.save();
    g.globalAlpha = clamp((t - 0.3) * 4) * 0.15;
    g.fillStyle = '${b.accentColor}';
    g.font = '900 600px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    const qs = spring(t - 0.2, 120, 26);
    g.translate(W / 2, H * 0.55);
    g.scale(0.8 + 0.2 * qs, 0.8 + 0.2 * qs);
    g.fillText('?', 0, 0);
    g.restore();
  }},

  // Product reveal — card assembles
  { from: ${scenes[1].from}, to: ${scenes[1].to}, draw(t) {
    // Card body
    const cardS = spring(t - 0.1, ${scenes[1].springK}, ${scenes[1].springD});
    const cardW = 800, cardH = 1000;
    const cx = (W - cardW) / 2, cy = H * 0.22;
    g.save();
    g.globalAlpha = clamp(t * 4);
    g.fillStyle = 'rgba(255,255,255,0.04)';
    g.beginPath();
    g.roundRect(cx, cy + 200 * (1 - cardS), cardW, cardH * cardS, 24);
    g.fill();
    // Card border
    g.strokeStyle = '${b.accentColor}';
    g.lineWidth = 2;
    g.globalAlpha = clamp(t * 4) * 0.3;
    g.stroke();
    g.restore();
    // Inner elements
    const r = rng(11);
    for (let i = 0; i < 5; i++) {
      const elS = spring(t - 0.3 - i * 0.12, 220, 20);
      const elY = cy + 280 + i * 140;
      g.save();
      g.globalAlpha = clamp((t - 0.3 - i * 0.12) * 4);
      g.fillStyle = i === 0 ? '${b.accentColor}' : 'rgba(255,255,255,0.06)';
      const elW = i === 0 ? 600 : 300 + r() * 300;
      g.fillRect(cx + 80, elY * cardS + 200 * (1 - cardS), elW * elS, i === 0 ? 12 : 20);
      g.restore();
    }
    // Label
    g.save();
    g.globalAlpha = clamp((t - 0.5) * 3);
    g.fillStyle = '${b.textColor}';
    g.font = '600 48px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.fillText(${JSON.stringify(scenes[1].text)}, W / 2, H * 0.18);
    g.restore();
  }},

  // Features — staggered blocks
  { from: ${scenes[2].from}, to: ${scenes[2].to}, draw(t) {
    const items = ${JSON.stringify(scenes[2].text)}.split('|');
    items.forEach((txt, i) => {
      const st = t - i * 0.3;
      const s = spring(st, ${scenes[2].springK}, ${scenes[2].springD});
      const y = H * 0.2 + i * 260;
      // Feature card
      g.save();
      g.globalAlpha = clamp(st * 3);
      g.fillStyle = 'rgba(255,255,255,0.03)';
      const cw = 800 * s;
      g.beginPath();
      g.roundRect((W - cw) / 2, y, cw, 200, 16);
      g.fill();
      // accent bar left
      g.fillStyle = '${b.accentColor}';
      g.fillRect((W - cw) / 2, y, 6, 200 * s);
      // text
      g.fillStyle = '${b.textColor}';
      g.font = '700 72px "${b.font}", Arial, sans-serif';
      g.textAlign = 'left';
      g.fillText(txt.trim(), (W - cw) / 2 + 40, y + 120);
      g.restore();
    });
  }},

  // Metric — big number
  { from: ${scenes[3].from}, to: ${scenes[3].to}, draw(t) {
    const s = spring(t - 0.08, ${scenes[3].springK}, ${scenes[3].springD});
    // Big metric
    g.save();
    g.globalAlpha = clamp(t * 5);
    g.fillStyle = '${b.accentColor}';
    g.font = '900 280px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.35);
    g.scale(0.9 + 0.1 * s, 0.9 + 0.1 * s);
    g.fillText(${JSON.stringify(scenes[3].text)}, 0, 0);
    g.restore();
    // Underline
    g.save();
    g.fillStyle = '${b.textColor}';
    g.globalAlpha = 0.15;
    const bar = spring(t - 0.15, 180, 22);
    g.fillRect(W * 0.15, H * 0.42, W * 0.7 * bar, 4);
    g.restore();
  }},

  // CTA — end card with brand
  { from: ${scenes[4].from}, to: ${scenes[4].to}, draw(t) {
    const s1 = spring(t - 0.1, ${scenes[4].springK}, ${scenes[4].springD});
    // Brand name
    g.save();
    g.globalAlpha = clamp((t - 0.1) * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '800 160px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.28);
    g.scale(0.99 + 0.01 * s1, 0.99 + 0.01 * s1);
    g.fillText(${JSON.stringify(b.name)}, 0, 0);
    g.restore();
    // CTA text
    const s2 = spring(t - 0.35, 200, 22);
    g.save();
    g.globalAlpha = clamp((t - 0.35) * 4);
    g.fillStyle = '${b.accentColor}';
    g.font = '600 64px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.fillText(${JSON.stringify(scenes[4].text)}, W / 2, H * 0.38);
    g.restore();
    // accent bar
    g.save();
    g.fillStyle = '${b.accentColor}';
    const bar = spring(t - 0.2, 200, 22);
    g.fillRect(W / 2 - 300 * bar, H * 0.44, 600 * bar, 6);
    g.restore();
  }}
];`;

  return wrapHTML(config, scenesCode);
}
