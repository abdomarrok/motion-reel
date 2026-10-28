import { wrapHTML, DEFAULT_BRAND } from './base';
import { BrandConfig, TemplateConfig, TemplateMeta, TemplateDefinition } from '../types';

export const meta: TemplateMeta = {
  id: 'kinetic-text',
  name: 'Kinetic Text',
  description: 'Bold typography with spring-physics timing. Words slam in, accent bars sweep, staggered reveals with geometric accents.',
  category: 'Typography',
  tags: ['text', 'kinetic', 'bold', 'minimal']
};

export function defaultConfig(brand: Partial<BrandConfig> = DEFAULT_BRAND): TemplateConfig {
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

export function toHTML(config: TemplateConfig): string {
  const c = config || {};
  const b = c.brand || DEFAULT_BRAND;
  const defaults = defaultConfig(b).scenes;
  const scenes = (c.scenes && c.scenes.length > 0) ? c.scenes : defaults;

  const sceneBlocks: string[] = [];

  scenes.forEach((sc, i) => {
    const from = sc.from ?? (i * 3);
    const to = sc.to ?? (from + 3);
    const k = sc.springK || 220;
    const d = sc.springD || 22;
    const text = sc.text || '';

    if (i === 0) {
      sceneBlocks.push(`  // Scene 0: Hook — big text springs in with parallax blocks
  { from: ${from}, to: ${to}, draw(t) {
    const r = rng(77);
    for (let i = 0; i < 8; i++) {
      const bx = r() * W, by = H * 0.1 + r() * H * 0.8;
      const bw = 40 + r() * 120, bh = 4 + r() * 8;
      const bs = spring(t - 0.05 - i * 0.04, 180, 24);
      g.save();
      g.globalAlpha = 0.04 * clamp((t - i * 0.04) * 4);
      g.fillStyle = '${b.accentColor}';
      g.fillRect(bx - bw * bs / 2, by, bw * bs, bh);
      g.restore();
    }
    const s = spring(t - 0.1, ${k}, ${d});
    g.save(); g.direction = '${b.direction}'; g.globalAlpha = clamp(t * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '800 180px "${b.font}", "Noto Sans Arabic", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.28);
    g.scale(0.95 + 0.05 * s, 0.95 + 0.05 * s);
    g.fillText(${JSON.stringify(text)}, 0, 0);
    g.restore();
    g.save();
    g.fillStyle = '${b.accentColor}';
    const bar = spring(t, 200, 22);
    g.fillRect(W / 2 - 320 * bar, H * 0.32, 640 * bar, 14);
    g.restore();
    const dotS = spring(t - 0.4, 300, 18);
    g.save();
    g.globalAlpha = clamp((t - 0.3) * 4);
    g.fillStyle = '${b.accentColor}';
    g.beginPath();
    g.arc(W / 2, H * 0.35, 6 * dotS, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }}`);
    } else if (i === 1) {
      sceneBlocks.push(`  // Scene 1: Reveal — description with animated UI card frame
  { from: ${from}, to: ${to}, draw(t) {
    const cardS = spring(t - 0.05, 160, 24);
    const cw = 800, ch = 340;
    const cx = (W - cw) / 2, cy = H * 0.18;
    g.save();
    g.globalAlpha = clamp(t * 3) * 0.08;
    g.strokeStyle = '${b.accentColor}';
    g.lineWidth = 2;
    g.beginPath();
    g.roundRect(cx, cy + 80 * (1 - cardS), cw * cardS, ch, 16);
    g.stroke();
    g.restore();

    const s = spring(t - 0.15, ${k}, ${d});
    g.save(); g.direction = '${b.direction}'; g.globalAlpha = clamp((t - 0.15) * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '700 100px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.26);
    g.scale(1 + 0.02 * s, 1 + 0.02 * s);
    g.fillText(${JSON.stringify(text)}, 0, 0);
    g.restore();

    g.save();
    g.fillStyle = '${b.accentColor}';
    const card = spring(t, 180, 24);
    g.fillRect(80, H * 0.36, (W - 160) * card, 8);
    g.restore();

    const r = rng(33);
    for (let j = 0; j < 4; j++) {
      const bx = 60 + r() * (W - 120);
      const by = H * 0.45 + r() * H * 0.15;
      const sz = 20 + r() * 40;
      const bs = spring(t - 0.4 - j * 0.1, 200, 22);
      g.save();
      g.globalAlpha = 0.05 * clamp((t - 0.4) * 3);
      g.fillStyle = '${b.textColor}';
      g.fillRect(bx, by, sz * bs, 4);
      g.restore();
    }
  }}`);
    } else if (i === 2) {
      sceneBlocks.push(`  // Scene 2: Features — staggered text blocks with side bars
  { from: ${from}, to: ${to}, draw(t) {
    g.save(); g.direction = '${b.direction}';
    const items = ${JSON.stringify(text)}.split('|');
    items.forEach((txt, idx) => {
      const st = t - idx * 0.15;
      const s = spring(st, ${k}, ${d});
      g.save();
      g.globalAlpha = clamp(st * 4);
      g.translate(W / 2, H * 0.22 + idx * 190);
      g.scale(0.9 + 0.1 * s, 0.9 + 0.1 * s);
      g.fillStyle = '${b.textColor}';
      g.globalAlpha = clamp(st * 4) * 0.03;
      g.beginPath();
      g.roundRect(-380, -60, 760, 140, 12);
      g.fill();
      g.globalAlpha = clamp(st * 4);
      g.fillStyle = '${b.textColor}';
      g.font = '700 110px "${b.font}", Arial, sans-serif';
      g.textAlign = 'center';
      g.fillText(txt.trim(), 0, 0);
      g.fillStyle = '${b.accentColor}';
      g.fillRect(-200 * s, 50, 400 * s, 8);
      g.fillStyle = '${b.accentColor}';
      g.globalAlpha = clamp(st * 4) * 0.5;
      g.fillRect(-380, -50, 6, 120 * s);
      g.restore();
    });
    g.restore();
  }}`);
    } else if (i === 3) {
      sceneBlocks.push(`  // Scene 3: Brand name focus with geometric background
  { from: ${from}, to: ${to}, draw(t) {
    const r = rng(42);
    for (let j = 0; j < 12; j++) {
      const rx = r() * W, ry = H * 0.15 + r() * H * 0.7;
      const sz = 15 + r() * 50;
      const ss = spring(t - 0.15 - j * 0.06, 160, 24);
      g.save();
      g.globalAlpha = 0.04 * clamp((t - 0.15) * 3);
      g.fillStyle = j % 3 === 0 ? '${b.accentColor}' : '${b.textColor}';
      if (r() > 0.5) {
        g.fillRect(rx - sz * ss / 2, ry - sz * ss / 2, sz * ss, sz * ss);
      } else {
        g.beginPath();
        g.arc(rx, ry, sz * ss / 2, 0, Math.PI * 2);
        g.fill();
      }
      g.restore();
    }
    const s = spring(t - 0.1, ${k}, ${d});
    g.save(); g.direction = '${b.direction}'; g.globalAlpha = clamp((t - 0.1) * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '800 220px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.32);
    g.scale(0.98 + 0.02 * s, 0.98 + 0.02 * s);
    g.fillText(${JSON.stringify(text || b.name)}, 0, 0);
    g.fillStyle = '${b.accentColor}';
    g.fillRect(-280 * s, 90, 560 * s, 12);
    g.restore();
    const dotS = spring(t - 0.5, 280, 18);
    g.save();
    g.globalAlpha = clamp((t - 0.4) * 4);
    g.fillStyle = '${b.accentColor}';
    g.beginPath();
    g.arc(W / 2 + 200, H * 0.32 - 70, 10 * dotS, 0, Math.PI * 2);
    g.fill();
    g.restore();
  }}`);
    } else if (i === 4) {
      sceneBlocks.push(`  // Scene 4: Tagline with sweeping bar
  { from: ${from}, to: ${to}, draw(t) {
    const sweep = spring(t, 140, 26);
    g.save();
    g.fillStyle = '${b.accentColor}';
    g.globalAlpha = 0.1;
    g.fillRect(0, H * 0.32, W * sweep, 3);
    g.restore();

    const s = spring(t - 0.1, ${k}, ${d});
    g.save(); g.direction = 'ltr'; g.globalAlpha = clamp((t - 0.1) * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '800 130px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.26);
    g.scale(1 + 0.02 * s, 1 + 0.02 * s);
    g.fillText(${JSON.stringify(text)}, 0, 0);
    g.restore();

    g.save();
    g.fillStyle = '${b.accentColor}';
    const bar = spring(t - 0.2, 180, 22);
    g.fillRect(W / 2 - 360 * bar, H * 0.34, 720 * bar, 8);
    g.restore();

    g.save();
    g.globalAlpha = clamp((t - 0.5) * 3) * 0.25;
    g.fillStyle = '${b.textColor}';
    g.font = '700 48px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.fillText(${JSON.stringify(b.name)}, W / 2, H * 0.42);
    g.restore();
  }}`);
    } else if (i === 5) {
      sceneBlocks.push(`  // Scene 5: CTA — call to action with button-like element
  { from: ${from}, to: ${to}, draw(t) {
    const s1 = spring(t - 0.1, ${k}, ${d});
    g.save(); g.direction = '${b.direction}'; g.globalAlpha = clamp((t - 0.1) * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '700 100px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.24);
    g.scale(1 + 0.01 * s1, 1 + 0.01 * s1);
    g.fillText(${JSON.stringify(text)}, 0, 0);
    g.restore();

    g.save(); g.globalAlpha = clamp((t - 0.4) * 4);
    g.fillStyle = '${b.accentColor}';
    g.font = '600 50px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.fillText(${JSON.stringify(b.name)}, W / 2, H * 0.32);
    g.restore();

    const btnS = spring(t - 0.5, 200, 22);
    g.save();
    g.globalAlpha = clamp((t - 0.5) * 3);
    g.fillStyle = '${b.accentColor}';
    const bw = 500 * btnS, bh = 70;
    g.beginPath();
    g.roundRect(W / 2 - bw / 2, H * 0.38, bw, bh, 12);
    g.fill();
    g.fillStyle = '${b.bgColor}';
    g.font = '700 36px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.globalAlpha = clamp((t - 0.7) * 4);
    g.fillText('→', W / 2, H * 0.38 + 48);
    g.restore();

    g.save();
    g.fillStyle = '${b.accentColor}';
    const bar = spring(t - 0.2, 200, 22);
    g.fillRect(W / 2 - 420 * bar, H * 0.48, 840 * bar, 4);
    g.restore();
  }}`);
    } else {
      sceneBlocks.push(`  // Dynamic Scene ${i + 1}
  { from: ${from}, to: ${to}, draw(t) {
    const s = spring(t - 0.1, ${k}, ${d});
    g.save(); g.direction = '${b.direction}'; g.globalAlpha = clamp(t * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '700 120px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.32);
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

export const kineticTextTemplate: TemplateDefinition = {
  meta,
  defaultConfig,
  toHTML
};
