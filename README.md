# 🎬 Motion Reel Studio

> **Transform your brand into viral 9:16 motion graphic videos for TikTok & Reels — powered by Canvas, Playwright, and FFmpeg.**

---

## ✨ Features

- **🎨 Curated Motion Templates**:
  - **Kinetic Text**: High-energy kinetic typography, staggered spring animations, accent bars, and punchy hook pacing.
  - **Product Showcase**: Floating UI mockups assembling piece by piece with physics-based springs and live metric counters.
  - **Brand Intro**: Sleek geometric reveals, accent line sweeps, and brand lockups.
- **⚡ Real-Time Live Preview**:
  - Interactive 9:16 canvas preview powered by closed-form damped spring physics ($f(t)$ pure functions of time).
  - Playback controls: play/pause, scrubbable timeline, and speed toggle ($0.5\times$, $1\times$, $2\times$).
- **💎 Real-Time Brand Kit**:
  - Instant synchronization of brand name, accent & background colors, and typography.
  - Full **RTL & Arabic script** support (Cairo font) alongside international typography (Inter, Outfit, Montserrat).
  - Persistent brand settings saved to `localStorage`.
- **🛠️ Scene & Physics Editor**:
  - Edit captions, customize per-scene durations, and fine-tune spring dynamics (`stiffness` and `damping`).
- **🚀 Production Video Render Engine**:
  - Zero-config static FFmpeg bundled via `ffmpeg-static`.
  - **High-speed 30 FPS render pipeline** tailored for TikTok & Reels standards (4×–5× faster than uncompressed 60fps renders, ~30–45s export time for 1080×1920 vertical video).
  - Streamlined JPEG frame piping with FFmpeg `fast` preset.
  - Real-time Server-Sent Events (SSE) progress streaming with percent and elapsed time updates.
  - Full render cancellation support to terminate browser contexts and encoder processes cleanly without resource leaks.
  - Procedural sound effect synthesis (clicks, pops, whooshes) synced to scene cues.

---

## 🏗️ Architecture

```
                                  ┌────────────────────────┐
                                  │   Browser (Vite UI)    │
                                  │  http://localhost:5173 │
                                  └───────────┬────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
          ┌───────────────────────┐                       ┌───────────────────────┐
          │  Live Canvas Preview  │                       │   Brand Kit & Editor  │
          │  (Closed-form springs)│                       │ (Scenes, Timing, Text)│
          └───────────────────────┘                       └───────────┬───────────┘
                                                                      │ POST /api/render
                                                                      ▼
                                                          ┌───────────────────────┐
                                                          │   Express API Server  │
                                                          │  http://localhost:3001│
                                                          └───────────┬───────────┘
                                                                      │
                      ┌───────────────────────────────────────────────┴────────────────────────────────┐
                      ▼                                                                                ▼
          ┌───────────────────────┐                                                        ┌───────────────────────┐
          │   Playwright Browser  │                                                        │   SFX Synthesizer     │
          │ (1080x1920 @ 30 FPS)  │                                                        │   (16-bit PCM WAV)    │
          └───────────┬───────────┘                                                        └───────────┬───────────┘
                      │ fast JPEG pipe                                                                 │ sfx.wav
                      ▼                                                                                ▼
          ┌────────────────────────────────────────────────────────────────────────────────────────────┴───┐
          │                                      FFmpeg Video Engine                                       │
          │                           (libx264 30fps fast + AAC Audio Normalization)                       │
          └───────────────────────────────────────────────┬────────────────────────────────────────────────┘
                                                          │
                                                          ▼
                                              ┌───────────────────────┐
                                              │ 1080×1920 MP4 Video   │
                                              │ (TikTok Ready)        │
                                              └───────────────────────┘
```

---

## 🚀 Quick Start

### 1. Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm** or **pnpm** / **yarn**

### 2. Installation

Clone the repository and install all dependencies:

```bash
git clone https://github.com/your-username/motion-reel.git
cd motion-reel
npm install
```

Install Playwright Chromium browser:

```bash
npx playwright install chromium
```

### 3. Launch Development Server

Run both the Vite client and the Express render API simultaneously:

```bash
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **API Server**: [http://localhost:3001](http://localhost:3001)

---

## 📁 Project Structure

```
motion-reel/
├── app/                          # Frontend application (Vite)
│   ├── index.html                # App shell
│   ├── vite.config.js            # Vite configuration & API proxy
│   └── src/
│       ├── main.js               # Router & application entry point
│       ├── styles.css            # Dark glassmorphic design system
│       ├── components/
│       │   ├── gallery.js        # Template catalog with animated cards
│       │   ├── editor.js         # Split-view scene & brand editor
│       │   ├── preview.js        # 9:16 Canvas player with scrubber
│       │   ├── brand-kit.js      # Brand customization & persistence
│       │   └── export-modal.js   # SSE render progress & MP4 downloader
│       └── templates/
│           ├── base.js           # Spring math, rng, and template utilities
│           ├── kinetic-text.js   # Kinetic typography template
│           ├── product-showcase.js # Product mockup animation template
│           └── brand-intro.js    # Logo reveal & geometric build template
├── server/                       # Backend video render service (Express)
│   ├── index.mjs                 # REST API endpoints & SSE streaming
│   ├── renderer.mjs              # Headless Playwright + FFmpeg pipeline
│   └── template-compiler.mjs     # Standalone HTML template compiler
├── scripts/                      # CLI standalone tools
│   ├── render.mjs                # CLI video renderer
│   ├── sfx.mjs                   # Procedural audio generator
│   └── beats.py                  # Audio beat-tracking utility
├── package.json
└── README.md
```

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs both Vite client (`:5173`) and Express API (`:3001`) with concurrently |
| `npm run dev:client` | Starts only the Vite frontend dev server |
| `npm run dev:server` | Starts the Express render API with hot reload (`node --watch`) |
| `npm run build` | Builds the production Vite bundle to `dist/` |
| `npm run preview` | Previews the production Vite build locally |
| `npm run render:cli` | Renders a video directly from the command line using Playwright & FFmpeg |

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
