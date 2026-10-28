import { wrapHTML, DEFAULT_BRAND } from './base';
import { BrandConfig, TemplateConfig, TemplateMeta, TemplateDefinition } from '../types';

export const meta: TemplateMeta = {
  id: 'brand-intro',
  name: 'Brand Intro',
  description: 'Geometric shapes stagger-build into a pattern, the logo reveals from behind. Minimal, refined, brand-first.',
  category: 'Brand',
  tags: ['brand', 'logo', 'intro', 'geometric']
};

export function defaultConfig(brand: Partial<BrandConfig> = DEFAULT_BRAND): TemplateConfig {
  return {
    brand: { ...DEFAULT_BRAND, ...brand },
    duration: 16,
    scenes: [
      {
        id: 'build',
        label: 'Geometric Build',
        text: '',
        from: 0,
        to: 4,
        springK: 160,
        springD: 24
      },
      {
        id: 'reveal',
        label: 'Logo Reveal',
        text: '',
        from: 4,
        to: 9,
        springK: 200,
        springD: 22
      },
      {
        id: 'tagline',
        label: 'Tagline',
        text: 'Design that moves',
        from: 9,
        to: 13,
        springK: 240,
        springD: 20
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

export function toHTML(config: TemplateConfig): string {
  const c = config || {};
  const b = c.brand || DEFAULT_BRAND;
  const defaults = defaultConfig(b).scenes;
  const scenes = (c.scenes && c.scenes.length > 0) ? c.scenes : defaults;

  const sceneBlocks: string[] = [];

  scenes.forEach((sc, i) => {
    const from = sc.from ?? (i * 3);
    const to = sc.to ?? (from + 3);
    const k = sc.springK || 180;
    const d = sc.springD || 22;
    const text = sc.text || '';

    if (i === 0) {
      sceneBlocks.push(`  // Geometric build — staggered grid of shapes with depth layers
  { from: ${from}, to: ${to}, draw(t) {
    const r = rng(99);
    const cols = 6, rows = 8;
    const cellW = W / cols, cellH = (H * 0.7) / rows;

    for (let j = 0; j < 8; j++) {
      const r2 = rng(200 + j);
      const lx = r2() * W, ly = H * 0.1 + r2() * H * 0.8;
      const lsz = 80 + r2() * 160;
      const ls = spring(t - 0.3 - j * 0.08, 120, 28);
      g.save();
      g.globalAlpha = 0.02 * clamp((t - 0.3) * 2);
      g.fillStyle = '${b.textColor}';
      g.fillRect(lx - lsz * ls / 2, ly - lsz * ls / 2, lsz * ls, lsz * ls);
      g.restore();
    }

    for (let idx = 0; idx < cols * rows; idx++) {
      const col = idx % cols, row = Math.floor(idx / cols);
      const delay = (col + row) * 0.04 + r() * 0.08;
      const s = spring(t - delay, ${k}, ${d});
      if (s <= 0) continue;
      const cx = col * cellW + cellW / 2;
      const cy = H * 0.15 + row * cellH + cellH / 2;
      const sz = Math.min(cellW, cellH) * 0.6 * s;
      g.save();
      if ((col + row) % 5 === 0) {
        g.fillStyle = '${b.accentColor}';
        g.globalAlpha = clamp((t - delay) * 4);
      } else if ((col * row) % 7 === 0) {
        g.fillStyle = '${b.accentColor}';
        g.globalAlpha = 0.15 * clamp((t - delay) * 4);
      } else {
        g.fillStyle = '${b.textColor}';
        g.globalAlpha = 0.05 * clamp((t - delay) * 4);
      }
      const shape = r();
      if (shape > 0.6) {
        g.fillRect(cx - sz / 2, cy - sz / 2, sz, sz);
      } else if (shape > 0.3) {
        g.beginPath();
        g.arc(cx, cy, sz / 2, 0, Math.PI * 2);
        g.fill();
      } else {
        g.translate(cx, cy);
        g.rotate(Math.PI / 4);
        g.fillRect(-sz / 2.8, -sz / 2.8, sz / 1.4, sz / 1.4);
      }
      g.restore();
    }

    const streakS = spring(t - 0.8, 160, 22);
    g.save();
    g.fillStyle = '${b.accentColor}';
    g.globalAlpha = 0.15 * clamp((t - 0.8) * 3);
    g.fillRect(0, H * 0.5, W * streakS, 3);
    g.restore();
  }}`);
    } else if (i === 1) {
      sceneBlocks.push(`  // Logo reveal — brand name springs from behind geometry
  { from: ${from}, to: ${to}, draw(t) {
    const r = rng(99);
    const cols = 6, rows = 8;
    const cellW = W / cols, cellH = (H * 0.7) / rows;
    for (let idx = 0; idx < cols * rows; idx++) {
      const col = idx % cols, row = Math.floor(idx / cols);
      const sz = Math.min(cellW, cellH) * 0.6;
      const cx = col * cellW + cellW / 2;
      const cy = H * 0.15 + row * cellH + cellH / 2;
      const scatter = spring(t, 140, 28);
      const dx = (cx - W / 2) * scatter * 1.0;
      const dy = (cy - H / 2) * scatter * 0.6;
      g.save();
      g.globalAlpha = Math.max(0, 0.04 * (1 - t * 0.4));
      g.fillStyle = (col + row) % 5 === 0 ? '${b.accentColor}' : '${b.textColor}';
      if (g.fillStyle !== '${b.accentColor}') g.globalAlpha *= 0.3;
      const shape = r();
      if (shape > 0.6) {
        g.fillRect(cx + dx - sz / 2, cy + dy - sz / 2, sz, sz);
      } else if (shape > 0.3) {
        g.beginPath();
        g.arc(cx + dx, cy + dy, sz / 2, 0, Math.PI * 2);
        g.fill();
      } else {
        g.translate(cx + dx, cy + dy);
        g.rotate(Math.PI / 4);
        g.fillRect(-sz / 2.8, -sz / 2.8, sz / 1.4, sz / 1.4);
      }
      g.restore();
    }

    const ls = spring(t - 0.3, ${k}, ${d});
    g.save();
    g.globalAlpha = clamp((t - 0.2) * 3);
    g.fillStyle = '${b.textColor}';
    g.font = '800 200px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.42);
    g.scale(0.96 + 0.04 * ls, 0.96 + 0.04 * ls);
    g.fillText(${JSON.stringify(text || b.name)}, 0, 0);
    g.restore();

    const dotS = spring(t - 0.6, 300, 18);
    g.save();
    g.globalAlpha = clamp((t - 0.5) * 4);
    g.fillStyle = '${b.accentColor}';
    g.beginPath();
    g.arc(W / 2 + 180, H * 0.42 - 60, 12 * dotS, 0, Math.PI * 2);
    g.fill();
    g.restore();

    const hrS = spring(t - 0.7, 160, 24);
    g.save();
    g.fillStyle = '${b.accentColor}';
    g.globalAlpha = 0.3 * clamp((t - 0.7) * 3);
    g.fillRect(W / 2 - 200 * hrS, H * 0.49, 400 * hrS, 3);
    g.restore();
  }}`);
    } else if (i === 2) {
      sceneBlocks.push(`  // Tagline — accent bar sweeps, text lands with held brand name
  { from: ${from}, to: ${to}, draw(t) {
    g.save();
    g.globalAlpha = 0.2;
    g.fillStyle = '${b.textColor}';
    g.font = '800 90px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.fillText(${JSON.stringify(b.name)}, W / 2, H * 0.2);
    g.restore();

    g.save();
    g.globalAlpha = 0.2;
    g.fillStyle = '${b.accentColor}';
    g.beginPath();
    g.arc(W / 2 + 90, H * 0.2 - 28, 6, 0, Math.PI * 2);
    g.fill();
    g.restore();

    const bar = spring(t, 140, 24);
    g.save();
    g.fillStyle = '${b.accentColor}';
    g.fillRect(0, H * 0.42, W * bar, 8);
    g.restore();

    const ts = spring(t - 0.25, ${k}, ${d});
    g.save();
    g.globalAlpha = clamp((t - 0.25) * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '700 110px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.38);
    const slide = 120 * (1 - ts);
    g.translate(0, slide);
    g.fillText(${JSON.stringify(text)}, 0, 0);
    g.restore();

    const r = rng(44);
    for (let j = 0; j < 5; j++) {
      const bx = r() * W, by = H * 0.55 + r() * H * 0.2;
      const bsz = 20 + r() * 50;
      const bs = spring(t - 0.6 - j * 0.1, 180, 24);
      g.save();
      g.globalAlpha = 0.03 * clamp((t - 0.6) * 2);
      g.fillStyle = r() > 0.5 ? '${b.accentColor}' : '${b.textColor}';
      g.fillRect(bx, by, bsz * bs, bsz * bs * 0.2);
      g.restore();
    }
  }}`);
    } else if (i === 3) {
      sceneBlocks.push(`  // End card — minimal lockup with refined accent elements
  { from: ${from}, to: ${to}, draw(t) {
    const s = spring(t - 0.1, ${k}, ${d});
    g.save();
    g.globalAlpha = clamp((t - 0.1) * 4);
    g.fillStyle = '${b.textColor}';
    g.font = '800 140px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.38);
    g.scale(0.99 + 0.01 * s, 0.99 + 0.01 * s);
    g.fillText(${JSON.stringify(text || b.name)}, 0, 0);
    g.restore();

    const bar = spring(t - 0.25, 160, 22);
    g.save();
    g.fillStyle = '${b.accentColor}';
    g.globalAlpha = 0.6 * clamp((t - 0.2) * 4);
    g.fillRect(W / 2 - 200 * bar, H * 0.43, 400 * bar, 4);
    g.restore();

    const dotS = spring(t - 0.4, 280, 18);
    g.save();
    g.globalAlpha = clamp((t - 0.35) * 4);
    g.fillStyle = '${b.accentColor}';
    g.beginPath();
    g.arc(W / 2 - 220 * bar, H * 0.43 + 2, 5 * dotS, 0, Math.PI * 2);
    g.fill();
    g.beginPath();
    g.arc(W / 2 + 220 * bar, H * 0.43 + 2, 5 * dotS, 0, Math.PI * 2);
    g.fill();
    g.restore();

    const r = rng(77);
    for (let j = 0; j < 6; j++) {
      const gx = r() * W, gy = H * 0.15 + r() * H * 0.7;
      const gsz = 30 + r() * 60;
      const gs = spring(t - 0.5 - j * 0.08, 140, 26);
      g.save();
      g.globalAlpha = 0.02 * clamp((t - 0.5) * 2);
      g.fillStyle = r() > 0.5 ? '${b.accentColor}' : '${b.textColor}';
      g.fillRect(gx - gsz * gs / 2, gy - gsz * gs / 2, gsz * gs, gsz * gs);
      g.restore();
    }
  }}`);
    } else {
      sceneBlocks.push(`  // Dynamic Scene ${i + 1}
  { from: ${from}, to: ${to}, draw(t) {
    const s = spring(t - 0.1, ${k}, ${d});
    g.save(); g.direction = '${b.direction}'; g.globalAlpha = clamp(t * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '700 120px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.35);
    g.scale(0.95 + 0.05 * s, 0.95 + 0.05 * s);
    g.fillText(${JSON.stringify(text)}, 0, 0);
    g.fillStyle = '${b.accentColor}';
    g.fillRect(-220 * s, 70, 440 * s, 10);
    g.restore();
  }}`);
    }
  });

  const scenesCode = `const SCENES = [\n${sceneBlocks.join(',\n')}\n];`;
  return wrapHTML(config, scenesCode);
}

export const brandIntroTemplate: TemplateDefinition = {
  meta,
  defaultConfig,
  toHTML
};
