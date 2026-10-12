# Shotlist (approval required before building/index.html/render)

Format: 9:16. Target: ~22-24s. Music: synth (subtle). SFX: soft whoosh/click on transitions/text hits. No characters.

## Beat grid (120 BPM base, adjust to VO timing when provided)
Plan on beats aligned to key phrases; VO timing may shift slightly.

## Shots

| Shot | Start (s) | End (s) | Duration (s) | On-screen text (RTL+EN) | Visual | Motion (springs) | SFX | New every |
|---|---|---|---|---|---|---|---|---|
| 1 Hook | 0.00 | 2.00 | 2.00 | "عندك موقع؟" (small EN optional: "Want a site that feels like an app?") | Dark bg (#080A12). Abstract bar slides in from right, accent #6EA0FF bar enters. MARROK wordmark subtle in bg or appears. | Spring: right->left bar + alpha; scale on accent. | Soft click/whoosh at 0.9-1.2 | 0-2 (fresh) |
| 2 Reveal concept | 2.00 | 5.00 | 3.00 | "نصممو مواقع تحسها كيما تطبيق" | UI card mockup slides in (minimal frame). Accent streak animates. | Staggered spring entries. | Soft whoosh on card. | new (2-4) |
| 3 Proof | 5.00 | 8.00 | 3.00 | "حركة سلسة • سريعة • بسيطة" | Three tiny blocks appear with stagger (spring). Bars compress/expand. | Stagger 3 items, each with own spring. | Click on each block. | new |
| 4 Brand focus | 8.00 | 12.00 | 4.00 | "MARROK" (EN head), keep minimal Arabic. | Typographic focus: MARROK bold (Cairo ExtraBold), accent dot animates. Abstract geometry slides behind. | Scale/spring in. | Soft whoosh. | new (2-4) |
| 5 Claims | 12.00 | 16.00 | 4.00 | "Smooth. Fast. Minimal." (short EN) | UI blocks reorder/slip with springs. Dark bg, no glow. | Swap/translate with springs. | Soft click. | new |
| 6 CTA | 16.00 | 20.00 | 4.00 | "دير DM للويب سايت ديالك" + "DM for your website" | CTA card: subtle, left-aligned/right context per RTL. Show url context: marrok.org. | Spring in button-like bar. | Soft whoosh. | new |
| 7 End | 20.00 | 24.00 | 4.00 | "MARROK · marrok.org" + "دير DM أو زورو marrok.org" | Minimal lockup. Accent underline/bar springs in. Hold briefly. | Gentle spring, hold. | Soft click (end). | new |

Notes:
- Something new every 2-4s. Hook 0-2s.
- RTL on canvas (`direction='rtl'`). Cairo fonts. Short text.
- Music synth, low under VO. No gradient-centered titles, no corner labels/borders/glow, no generic particle bursts.
- Avoid fade-ins on everything; use springs. No timers in render.
- Pure function of time in index.html (`window.seek(t)`).
- End pushes DM or visit marrok.org.
- Keep original; don't copy reference.

Approval required before building index.html and rendering.
