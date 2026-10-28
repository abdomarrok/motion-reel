# 🎬 Motion Reel Studio (React)

> **Transform your brand into viral 9:16 motion graphic videos for TikTok & Reels — powered by React, HTML5 Canvas, Spring Physics, Playwright, and FFmpeg.**

---

## ✨ Features

- **⚛️ Modern React Architecture**:
  - Full React 19 + TypeScript component architecture with hooks, memoized canvas rendering, and responsive state synchronization.
  - Zero-lag reactive updates when modifying copy, typography, color palettes, or spring parameters.
- **🎨 Curated Motion Templates**:
  - **Kinetic Text**: High-energy kinetic typography, staggered spring animations, accent bars, and punchy hook pacing.
  - **Product Showcase**: Floating UI mockups assembling piece by piece with physics-based springs and live metric counters.
  - **Brand Intro**: Sleek geometric reveals, accent line sweeps, and brand lockups.
- **⚡ Real-Time Live Preview**:
  - Interactive 9:16 canvas preview powered by closed-form damped spring physics ($f(t)$ pure functions of time).
  - Playback controls: play/pause, scrubbable timeline, and speed toggle ($0.5\times$, $1\times$, $2\times$).
- **💎 Real-Time Brand Kit**:
  - Instant synchronization of brand name, accent & background colors, and typography.
  - Full **RTL & Arabic script** support (Cairo, Noto Sans Arabic, IBM Plex Sans Arabic) alongside international typography (Inter, Outfit, Montserrat, Roboto, Poppins, Playfair Display, Source Serif 4).
  - Persistent brand settings saved to `localStorage`.
- **🛠️ Scene & Physics Editor**:
  - Edit captions, customize per-scene durations, and fine-tune spring dynamics (`stiffness` and `damping`).
  - Add and delete scenes dynamically with automatic timeline recalibration.
- **🚀 Production Video Render Engine**:
  - Express API server integrated with Vite middleware listening on unified port `3000`.
  - Zero-config static FFmpeg bundled via `ffmpeg-static`.
  - **High-speed 30 FPS render pipeline** tailored for TikTok & Reels standards (~30–45s export time for 1080×1920 vertical video).
  - Real-time Server-Sent Events (SSE) progress streaming with percent and elapsed time updates.
  - Full render cancellation support and procedural sound effect synthesis.

---

## 🏗️ Architecture

```
                                  ┌────────────────────────┐
                                  │  React SPA + Vite Dev  │
                                  │  http://localhost:3000 │
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
                                                          │  Integrated Express   │
                                                          │  Full-Stack (Port 3000│
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
- **npm**

### 2. Installation

```bash
git clone https://github.com/your-username/motion-reel.git
cd motion-reel
npm install
```

### 3. Launch Development Server

```bash
npm run dev
```

The unified app (React frontend + Express API) will start on [http://localhost:3000](http://localhost:3000).

---

## 📁 Project Structure

```
motion-reel/
├── index.html                    # Root HTML entry point
├── vite.config.ts                # Vite React configuration
├── tsconfig.json                 # TypeScript configuration
├── server.ts                     # Full-stack server (Express API + Vite middleware)
├── src/
│   ├── main.tsx                  # React DOM root mounting
│   ├── App.tsx                   # Main app & hash router
│   ├── styles.css                # Premium dark glassmorphic design system
│   ├── types/                    # TypeScript interfaces for brand, scenes, templates
│   ├── templates/
│   │   ├── base.ts               # Core spring physics, RNG, cues & HTML compiler
│   │   ├── kinetic-text.ts       # Kinetic typography template definition
│   │   ├── product-showcase.ts   # Product mockup animation template definition
│   │   ├── brand-intro.ts        # Logo reveal & geometric build template definition
│   │   └── index.ts              # Template registry
│   └── components/
│       ├── Navbar.tsx            # Header navigation & logo
│       ├── Gallery.tsx           # Template gallery view
│       ├── TemplateCard.tsx      # Animated live canvas thumbnail card
│       ├── Editor.tsx            # Split-view scene & brand editor
│       ├── Preview.tsx           # 9:16 Canvas player with scrubber & controls
│       ├── BrandKit.tsx          # Brand palette & font customization
│       ├── ScenesList.tsx        # Scene timing & spring parameters
│       └── ExportModal.tsx       # SSE render progress & MP4 downloader
├── server/
│   ├── index.mjs                 # Express route handlers
│   ├── renderer.mjs              # Playwright + FFmpeg frame rendering
│   └── template-compiler.mjs     # Standalone template compiler
├── scripts/                      # CLI standalone tools
└── package.json
```

---

## 🛠️ Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Starts full-stack React app and render API on port 3000 |
| `npm run build` | Builds TypeScript and Vite production bundle |
| `npm run start` | Runs the production server |
| `npm run preview` | Previews the production Vite build locally |
| `npm run render:cli` | Renders a video directly from command line using Playwright & FFmpeg |

---

## 📝 License

Distributed under the MIT License. See `LICENSE` for more information.
