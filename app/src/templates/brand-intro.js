/**
 * Brand Intro Template
 * Geometric shapes build into a pattern, then the logo reveals.
 * Best for: brand awareness clips, intro sequences, logo reveals.
 */
import { wrapHTML, DEFAULT_BRAND, generateCues } from './base.js';

export const meta = {
  id: 'brand-intro',
  name: 'Brand Intro',
  description: 'Geometric shapes stagger-build into a pattern, the logo reveals from behind. Minimal, refined, brand-first.',
  category: 'Brand',
  tags: ['brand', 'logo', 'intro', 'geometric']
};

export function defaultConfig(brand = DEFAULT_BRAND) {
  return {
    brand: { ...DEFAULT_BRAND, ...brand },
    duration: 16,
    scenes: [
      {
        id: 'geometry',
        label: 'Geometric Build',
        text: '',
        from: 0,
        to: 4,
        springK: 260,
        springD: 20
      },
      {
        id: 'logo-reveal',
        label: 'Logo Reveal',
        text: '',
        from: 4,
        to: 9,
        springK: 200,
        springD: 24
      },
      {
        id: 'tagline',
        label: 'Tagline',
        text: 'Design that moves',
        from: 9,
        to: 13,
        springK: 220,
        springD: 22
      },
      {
        id: 'endcard',
        label: 'End Card',
        text: '',
        from: 13,
        to: 16,
        springK: 180,
        springD: 24
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
  // Geometric build — staggered grid of shapes
  { from: ${scenes[0].from}, to: ${scenes[0].to}, draw(t) {
    const r = rng(99);
    const cols = 6, rows = 8;
    const cellW = W / cols, cellH = (H * 0.7) / rows;
    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const delay = (col + row) * 0.04 + r() * 0.08;
      const s = spring(t - delay, ${scenes[0].springK}, ${scenes[0].springD});
      if (s <= 0) continue;
      const cx = col * cellW + cellW / 2;
      const cy = H * 0.15 + row * cellH + cellH / 2;
      const sz = Math.min(cellW, cellH) * 0.65 * s;
      g.save();
      g.globalAlpha = 0.7 * clamp((t - delay) * 4);
      // Alternate between accent and muted
      if ((col + row) % 5 === 0) {
        g.fillStyle = '${b.accentColor}';
        g.globalAlpha = clamp((t - delay) * 4);
      } else {
        g.fillStyle = '${b.textColor}';
        g.globalAlpha = 0.06 * clamp((t - delay) * 4);
      }
      // Mix of squares and circles
      if (r() > 0.4) {
        g.fillRect(cx - sz / 2, cy - sz / 2, sz, sz);
      } else {
        g.beginPath();
        g.arc(cx, cy, sz / 2, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }
  }},

  // Logo reveal — brand name springs from behind geometry
  { from: ${scenes[1].from}, to: ${scenes[1].to}, draw(t) {
    // Fading geometric remnants
    const r = rng(99);
    const cols = 6, rows = 8;
    const cellW = W / cols, cellH = (H * 0.7) / rows;
    for (let i = 0; i < cols * rows; i++) {
      const col = i % cols, row = Math.floor(i / cols);
      const sz = Math.min(cellW, cellH) * 0.65;
      const cx = col * cellW + cellW / 2;
      const cy = H * 0.15 + row * cellH + cellH / 2;
      // Scatter outward
      const scatter = spring(t, 140, 28);
      const dx = (cx - W / 2) * scatter * 0.8;
      const dy = (cy - H / 2) * scatter * 0.5;
      g.save();
      g.globalAlpha = Math.max(0, 0.06 * (1 - t * 0.5));
      g.fillStyle = (col + row) % 5 === 0 ? '${b.accentColor}' : '${b.textColor}';
      if (g.fillStyle === '${b.textColor}') g.globalAlpha *= 0.3;
      if (r() > 0.4) {
        g.fillRect(cx + dx - sz / 2, cy + dy - sz / 2, sz, sz);
      } else {
        g.beginPath();
        g.arc(cx + dx, cy + dy, sz / 2, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }
    // Brand name
    const ls = spring(t - 0.3, ${scenes[1].springK}, ${scenes[1].springD});
    g.save();
    g.globalAlpha = clamp((t - 0.2) * 3);
    g.fillStyle = '${b.textColor}';
    g.font = '800 200px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.42);
    g.scale(0.96 + 0.04 * ls, 0.96 + 0.04 * ls);
    g.fillText(${JSON.stringify(b.name)}, 0, 0);
    g.restore();
    // Accent dot
    const dotS = spring(t - 0.6, 300, 18);
    g.save();
    g.globalAlpha = clamp((t - 0.5) * 4);
    g.fillStyle = '${b.accentColor}';
    g.beginPath();
    g.arc(W / 2 + 180, H * 0.42 - 60, 12 * dotS, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }},

  // Tagline — accent bar sweeps, text lands
  { from: ${scenes[2].from}, to: ${scenes[2].to}, draw(t) {
    // Brand name (held)
    g.save();
    g.globalAlpha = 0.3;
    g.fillStyle = '${b.textColor}';
    g.font = '800 100px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.fillText(${JSON.stringify(b.name)}, W / 2, H * 0.2);
    g.restore();
    // Sweeping bar
    const bar = spring(t, 140, 24);
    g.save();
    g.fillStyle = '${b.accentColor}';
    g.fillRect(0, H * 0.42, W * bar, 8);
    g.restore();
    // Tagline text
    const ts = spring(t - 0.25, ${scenes[2].springK}, ${scenes[2].springD});
    g.save();
    g.globalAlpha = clamp((t - 0.25) * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '700 110px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.38);
    const slide = 120 * (1 - ts);
    g.translate(0, slide);
    g.fillText(${JSON.stringify(scenes[2].text)}, 0, 0);
    g.restore();
  }},

  // End card — minimal lockup
  { from: ${scenes[3].from}, to: ${scenes[3].to}, draw(t) {
    const s = spring(t - 0.1, ${scenes[3].springK}, ${scenes[3].springD});
    // Brand name centered
    g.save();
    g.globalAlpha = clamp((t - 0.1) * 4);
    g.fillStyle = '${b.textColor}';
    g.font = '800 140px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.38);
    g.scale(0.99 + 0.01 * s, 0.99 + 0.01 * s);
    g.fillText(${JSON.stringify(b.name)}, 0, 0);
    g.restore();
    // Thin accent line below
    const bar = spring(t - 0.25, 160, 22);
    g.save();
    g.fillStyle = '${b.accentColor}';
    g.globalAlpha = 0.6 * clamp((t - 0.2) * 4);
    g.fillRect(W / 2 - 200 * bar, H * 0.43, 400 * bar, 4);
    g.restore();
    // Dot accent
    const dotS = spring(t - 0.4, 280, 18);
    g.save();
    g.globalAlpha = clamp((t - 0.35) * 4);
    g.fillStyle = '${b.accentColor}';
    g.beginPath();
    g.arc(W / 2, H * 0.47, 8 * dotS, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }}
];`;

  return wrapHTML(config, scenesCode);
}
