/**
 * Product Showcase Template
 * UI cards assemble piece-by-piece with spring physics.
 * Best for: SaaS products, app launches, feature announcements.
 * Enhanced with richer UI mockup elements and animated metric counters.
 */
import { wrapHTML, DEFAULT_BRAND, generateCues } from './base.js';

export const meta = {
  id: 'product-showcase',
  name: 'Product Showcase',
  description: 'UI mockup cards assemble with spring timing. Features highlighted one by one. Animated metric counters for social proof.',
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
        text: 'Still doing it manually?',
        from: 0,
        to: 3,
        springK: 240,
        springD: 20
      },
      {
        id: 'reveal',
        label: 'Product Reveal',
        text: 'Meet the solution',
        from: 3,
        to: 7,
        springK: 180,
        springD: 24
      },
      {
        id: 'features',
        label: 'Features',
        text: 'Zero config|Instant sync|Export anywhere',
        from: 7,
        to: 12,
        springK: 260,
        springD: 18
      },
      {
        id: 'metrics',
        label: 'Social Proof',
        text: '10×',
        from: 12,
        to: 16,
        springK: 200,
        springD: 22
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
  const c = config || {};
  const b = c.brand || DEFAULT_BRAND;
  const defaults = defaultConfig(b).scenes;
  const scenes = (c.scenes && c.scenes.length > 0) ? c.scenes : defaults;

  const sceneBlocks = [];

  scenes.forEach((sc, i) => {
    const from = sc.from ?? (i * 3);
    const to = sc.to ?? (from + 3);
    const k = sc.springK || 220;
    const d = sc.springD || 22;
    const text = sc.text || '';

    if (i === 0) {
      sceneBlocks.push(`  // Hook — problem statement slams in with dramatic question
  { from: ${from}, to: ${to}, draw(t) {
    const r = rng(55);
    for (let j = 0; j < 6; j++) {
      const ly = H * 0.15 + j * H * 0.12;
      const ls = spring(t - j * 0.06, 140, 26);
      g.save();
      g.globalAlpha = 0.03 * clamp((t - j * 0.06) * 3);
      g.fillStyle = '${b.textColor}';
      g.fillRect(60, ly, (W - 120) * ls, 1);
      g.restore();
    }
    const s = spring(t - 0.05, ${k}, ${d});
    g.save();
    g.globalAlpha = clamp(t * 6);
    g.fillStyle = '${b.textColor}';
    g.font = '800 140px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.3);
    g.scale(0.92 + 0.08 * s, 0.92 + 0.08 * s);
    g.fillText(${JSON.stringify(text)}, 0, 0);
    g.restore();
    g.save();
    g.globalAlpha = clamp((t - 0.3) * 4) * 0.12;
    g.fillStyle = '${b.accentColor}';
    g.font = '900 600px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    const qs = spring(t - 0.2, 120, 26);
    g.translate(W / 2, H * 0.55);
    g.scale(0.8 + 0.2 * qs, 0.8 + 0.2 * qs);
    g.fillText('?', 0, 0);
    g.restore();
  }}`);
    } else if (i === 1) {
      sceneBlocks.push(`  // Product reveal — card assembles with UI elements inside
  { from: ${from}, to: ${to}, draw(t) {
    const cardS = spring(t - 0.1, ${k}, ${d});
    const cardW = 780, cardH = 960;
    const cx = (W - cardW) / 2, cy = H * 0.2;
    g.save();
    g.globalAlpha = clamp(t * 4);
    g.fillStyle = 'rgba(255,255,255,0.035)';
    g.beginPath();
    g.roundRect(cx, cy + 180 * (1 - cardS), cardW, cardH * cardS, 20);
    g.fill();
    g.strokeStyle = '${b.accentColor}';
    g.lineWidth = 1.5;
    g.globalAlpha = clamp(t * 4) * 0.2;
    g.stroke();
    g.restore();

    const barS = spring(t - 0.2, 200, 22);
    g.save();
    g.globalAlpha = clamp((t - 0.2) * 4) * 0.5;
    for (let j = 0; j < 3; j++) {
      g.fillStyle = j === 0 ? '#f87171' : j === 1 ? '#fbbf24' : '#4ade80';
      g.globalAlpha = clamp((t - 0.25 - j * 0.05) * 4) * 0.4;
      g.beginPath();
      g.arc(cx + 40 + j * 24, cy + 200 * (1 - cardS) + 30, 5 * barS, 0, Math.PI * 2);
      g.fill();
    }
    g.restore();

    const r = rng(11);
    for (let j = 0; j < 6; j++) {
      const elS = spring(t - 0.35 - j * 0.1, 220, 20);
      const elY = cy + 100 + j * 130;
      g.save();
      g.globalAlpha = clamp((t - 0.35 - j * 0.1) * 4);
      if (j === 0) {
        g.fillStyle = '${b.accentColor}';
        g.fillRect(cx + 60, (elY + 80) * cardS + 180 * (1 - cardS), 500 * elS, 10);
      } else if (j === 1) {
        g.fillStyle = 'rgba(255,255,255,0.08)';
        g.beginPath();
        g.arc(cx + 80, (elY + 100) * cardS + 180 * (1 - cardS), 16 * elS, 0, Math.PI * 2);
        g.fill();
        g.fillStyle = 'rgba(255,255,255,0.04)';
        g.fillRect(cx + 110, (elY + 88) * cardS + 180 * (1 - cardS), 300 * elS, 14);
        g.fillRect(cx + 110, (elY + 112) * cardS + 180 * (1 - cardS), 200 * elS, 10);
      } else {
        g.fillStyle = 'rgba(255,255,255,0.04)';
        const elW = 200 + r() * 400;
        g.fillRect(cx + 60, (elY + 80) * cardS + 180 * (1 - cardS), elW * elS, 16);
      }
      g.restore();
    }

    g.save();
    g.globalAlpha = clamp((t - 0.5) * 3);
    g.fillStyle = '${b.textColor}';
    g.font = '600 48px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.fillText(${JSON.stringify(text)}, W / 2, H * 0.17);
    g.restore();
  }}`);
    } else if (i === 2) {
      sceneBlocks.push(`  // Features — staggered blocks with icon-like accents
  { from: ${from}, to: ${to}, draw(t) {
    const items = ${JSON.stringify(text)}.split('|');
    items.forEach((txt, idx) => {
      const st = t - idx * 0.3;
      const s = spring(st, ${k}, ${d});
      const y = H * 0.18 + idx * 280;
      g.save();
      g.globalAlpha = clamp(st * 3);
      g.fillStyle = 'rgba(255,255,255,0.03)';
      const cw = 800 * s;
      g.beginPath();
      g.roundRect((W - cw) / 2, y, cw, 220, 16);
      g.fill();
      g.fillStyle = '${b.accentColor}';
      g.fillRect((W - cw) / 2, y + 20, 6, 180 * s);
      g.globalAlpha = clamp(st * 3) * 0.15;
      g.fillStyle = '${b.accentColor}';
      g.beginPath();
      g.arc((W - cw) / 2 + 50, y + 60, 24 * s, 0, Math.PI * 2);
      g.fill();
      g.globalAlpha = clamp(st * 3);
      g.fillStyle = '${b.textColor}';
      g.font = '700 68px "${b.font}", Arial, sans-serif';
      g.textAlign = 'left';
      g.fillText(txt.trim(), (W - cw) / 2 + 90, y + 80);
      g.fillStyle = 'rgba(255,255,255,0.06)';
      g.fillRect((W - cw) / 2 + 90, y + 120, 400 * s, 12);
      g.fillRect((W - cw) / 2 + 90, y + 150, 280 * s, 10);
      g.restore();
    });
  }}`);
    } else if (i === 3) {
      sceneBlocks.push(`  // Metric — big animated number with counter effect
  { from: ${from}, to: ${to}, draw(t) {
    const s = spring(t - 0.08, ${k}, ${d});
    g.save();
    g.globalAlpha = 0.06 * clamp(t * 3);
    const grad = g.createRadialGradient(W / 2, H * 0.35, 0, W / 2, H * 0.35, 400);
    grad.addColorStop(0, '${b.accentColor}');
    grad.addColorStop(1, 'transparent');
    g.fillStyle = grad;
    g.fillRect(0, 0, W, H);
    g.restore();

    g.save();
    g.globalAlpha = clamp(t * 5);
    g.fillStyle = '${b.accentColor}';
    g.font = '900 280px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.35);
    g.scale(0.9 + 0.1 * s, 0.9 + 0.1 * s);
    g.fillText(${JSON.stringify(text)}, 0, 0);
    g.restore();

    g.save();
    g.fillStyle = '${b.textColor}';
    g.globalAlpha = 0.12;
    const bar = spring(t - 0.15, 180, 22);
    g.fillRect(W * 0.15, H * 0.42, W * 0.7 * bar, 4);
    g.restore();

    const r = rng(88);
    for (let j = 0; j < 3; j++) {
      const ms = spring(t - 0.5 - j * 0.15, 200, 22);
      const mx = W * 0.15 + j * W * 0.25;
      g.save();
      g.globalAlpha = clamp((t - 0.5 - j * 0.15) * 3);
      g.fillStyle = 'rgba(255,255,255,0.04)';
      g.beginPath();
      g.roundRect(mx, H * 0.48, W * 0.2 * ms, 100, 10);
      g.fill();
      g.fillStyle = '${b.textColor}';
      g.font = '700 32px "${b.font}", Arial, sans-serif';
      g.textAlign = 'center';
      g.fillText(['99.9%', '< 50ms', '0 bugs'][j], mx + W * 0.1, H * 0.52 + 10);
      g.fillStyle = '${b.textColor}';
      g.globalAlpha *= 0.4;
      g.font = '500 20px "${b.font}", Arial, sans-serif';
      g.fillText(['Uptime', 'Latency', 'Errors'][j], mx + W * 0.1, H * 0.52 + 44);
      g.restore();
    }
  }}`);
    } else if (i === 4) {
      sceneBlocks.push(`  // CTA — end card with brand and arrow
  { from: ${from}, to: ${to}, draw(t) {
    const s1 = spring(t - 0.1, ${k}, ${d});
    g.save();
    g.globalAlpha = clamp((t - 0.1) * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '800 160px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.28);
    g.scale(0.99 + 0.01 * s1, 0.99 + 0.01 * s1);
    g.fillText(${JSON.stringify(b.name)}, 0, 0);
    g.restore();

    const btnS = spring(t - 0.35, 200, 22);
    g.save();
    g.globalAlpha = clamp((t - 0.35) * 4);
    g.fillStyle = '${b.accentColor}';
    const bw = 560 * btnS, bh = 80;
    g.beginPath();
    g.roundRect(W / 2 - bw / 2, H * 0.36, bw, bh, 14);
    g.fill();
    g.fillStyle = '${b.bgColor}';
    g.font = '700 40px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.globalAlpha = clamp((t - 0.5) * 4);
    g.fillText(${JSON.stringify(text)}, W / 2, H * 0.36 + 52);
    g.restore();

    g.save();
    g.fillStyle = '${b.accentColor}';
    g.globalAlpha = 0.2;
    const bar = spring(t - 0.2, 200, 22);
    g.fillRect(W / 2 - 300 * bar, H * 0.46, 600 * bar, 4);
    g.restore();
  }}`);
    } else {
      // Dynamic additional scene
      sceneBlocks.push(`  // Dynamic Scene ${i + 1}
  { from: ${from}, to: ${to}, draw(t) {
    const s = spring(t - 0.1, ${k}, ${d});
    g.save(); g.direction = '${b.direction}'; g.globalAlpha = clamp(t * 5);
    g.fillStyle = '${b.textColor}';
    g.font = '700 110px "${b.font}", Arial, sans-serif';
    g.textAlign = 'center';
    g.translate(W / 2, H * 0.32);
    g.scale(0.95 + 0.05 * s, 0.95 + 0.05 * s);
    g.fillText(${JSON.stringify(text)}, 0, 0);
    g.fillStyle = '${b.accentColor}';
    g.fillRect(-240 * s, 60, 480 * s, 10);
    g.restore();
  }}`);
    }
  });

  const scenesCode = `const SCENES = [\n${sceneBlocks.join(',\n')}\n];`;
  return wrapHTML(config, scenesCode);
}
