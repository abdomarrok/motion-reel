# Marrok style guide

Brand: sleek, dark, minimal. Boutique tech agency.

## Colors
- Bg: #080A12, #0C1020 (gradient-like near-black navy)
- Accent (single accent per reel): #6EA0FF
- Text: #FFFFFF
- Subtext/lines: #9AA2C0 (if needed)

## Typography
- Cairo ExtraBold (headlines) - Arabic + Latin, RTL
- Cairo Regular (body) - Arabic + Latin, RTL
- Use Arabic first; short English text secondary

## Visual language
- No characters. Use typography, UI mockups, abstract shapes (sliding bars, parallax blocks, pixel-lean UI cards)
- Smooth spring physics for motion (motion.js)
- Hook in first 2 seconds; something new every 2-4 seconds
- Banned: centered title on gradient, everything fading in, corner labels, frame borders, glow on UI chrome, generic particle bursts
- Right-to-left: set `direction='rtl'` on canvas context; use Cairo font
- Keep on-screen text short. Avoid long sentences.
- Music subtle (-14 LUFS) under VO. Soft whooshes/clicks on transitions/text hits.
- Dark background, minimal, confident but approachable, modern/ambitious.

## Motion notes
- Entry/exit via spring (closed-form) from motion.js
- Avoid linear slides; prefer eased spring with small damping
- Stagger small UI blocks to create rhythm without clutter
- Keep layout readable at phone size (9:16)

## Logo/wordmark
- MARROK in bold with small accent dot (wordmark only; no logo mark file provided, so render typographic wordmark)
- Site: marrok.org
- End goal: DM us for a website or visit marrok.org
