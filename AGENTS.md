# Motion reel (code-generated video)

This repo makes motion reels by rendering frames from an HTML Canvas program (`window.seek(t)`) with Playwright + ffmpeg, and synthesizing sound. Videos are pure functions of time.

## Core contract (must follow)
- `index.html` must expose `window.seek(t)` and paint the exact frame for time t (no timers, CSS transitions, requestAnimationFrame during render).
- Pure function of time: no state between frames. Never use `Math.random`; use seeded noise (e.g. `mulberry32` pattern). See `templates/index.html`.
- Windows environment (render machine is Windows). Use PowerShell-friendly commands; prefer `certutil -hashfile` over `md5`.
- Render contract details in `references/rules.md`.

## Setup
- Node 20+, ffmpeg on PATH, Python 3 (only for `scripts/beats.py`).
- `npm init -y && npm pkg set type=module && npm i -D playwright && npx playwright install chromium`
- For music track analysis: `pip install numpy librosa soundfile` (only if providing a music file)
- Copy `scripts/*` and `templates/*` into your project folder. Create `out/`, `assets/`, `docs/` as needed.

## Exact commands
- Render frames -> silent MP4: `node scripts/render.mjs --fps 60 --dur 15 --sub 4` (defaults in script: fps=60, dur=9, sub=4)
- Synthesize SFX from `cues.json`: `node scripts/sfx.mjs cues.json out/sfx.wav`
- Beat analysis from track: `python scripts/beats.py track.wav beats.json`
- Mix final: `ffmpeg -i out/silent.mp4 -i out/sfx.wav -filter_complex "[1:a]loudnorm=I=-14:TP=-1.5[a]" -map 0:v -map "[a]" -c:v copy -c:a aac -shortest out/final.mp4`
- Contact sheet (critique): `ffmpeg -i out/final.mp4 -vf "fps=2,scale=270:-1,tile=6x5" -frames:v 1 out/contact.png`

Encoding: H.264 yuv420p, CRF 16 (as in rules). Always write outputs to `out/`.

## Pipeline (required order and gates)
1. Gather assets from product URL with Playwright into `./assets`. Never invent product UI.
2. If reference exists, extract frames with ffmpeg and write `docs/style_guide.md` from it.
3. Measure track with `scripts/beats.py` -> `beats.json`, or plan synthesized music on 120 BPM grid.
4. Write `docs/shotlist.md` on beat grid (shot, seconds, on-screen text, motion, SFX). Show and wait for OK.
5. Build `index.html` with `window.seek(t)` using `scripts/motion.js` springs. Follow `references/rules.md`.
6. Critique loop (min 3 rounds): render contact sheet, run `references/critique-pass.txt`, fix 3 worst problems, re-render. Score 1-10 per the rubric.
7. Render silent, write `cues.json`, generate SFX, mix to `out/final.mp4`.
8. Deliver `out/final.mp4`, `out/contact.png`, `out/poster.png`. State what to improve next.

Gate: Only do full render after every score is >= 8 (see `references/rules.md#loop-before-you-show-me-anything`).

## Repo layout
- `SKILL.md`: detailed usage and rules
- `scripts/`: `render.mjs`, `sfx.mjs`, `beats.py`, `motion.js`
- `templates/`: `index.html`, `cues.json` (starter)
- `references/`: `rules.md` (contract/look/sound/loop), `critique-pass.txt` (harsh critique rubric), `brand-reel.txt` (brief template)

## Design/look constraints (must not violate)
Banned defaults: centered title on gradient, everything fading in, corner labels and frame borders, glow on UI chrome, generic particle bursts.
- One display face, one UI face. One accent color unless brief says otherwise.
- Something new on screen every 2 to 4 seconds. Hook in first 2 seconds.
- Arabic text: set `direction='rtl'` on canvas context and use a font with Arabic glyphs.
- Loudness -14 LUFS; keep music very low under voiceover.
- API keys only via `.env`, never in prompts.

## Working tips
- Template already includes seeded RNG (`rng(seed)`) and spring helpers; extend scenes as array of `{from,to,draw}`.
- `render.mjs` uses subframe averaging (`tmix`) to reduce temporal aliasing (see `--sub`).
- Assets from web scraping must be placed in `./assets`; do not fabricate product UI.
- When editing, respect pure function of time; don't add timers/transitions.