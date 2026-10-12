/**
 * Preview Component — Live canvas preview with playback controls.
 * Uses an iframe to run the template's window.seek(t) function.
 */

export class Preview {
  constructor(container) {
    this.container = container;
    this.iframe = null;
    this.blobUrl = null;
    this.playing = true;
    this.time = 0;
    this.speed = 1;
    this.duration = 20;
    this.animId = null;
    this.lastTs = 0;
    this.onTimeUpdate = null;

    this._buildDOM();
  }

  _buildDOM() {
    this.container.innerHTML = `
      <div class="preview-wrapper" id="preview-frame">
        <iframe id="preview-iframe" sandbox="allow-scripts allow-same-origin" style="width:100%;height:100%;border:none;background:#000;"></iframe>
      </div>
      <div class="preview-controls" id="preview-controls">
        <button class="preview-btn" id="preview-play" title="Play / Pause">▶</button>
        <input type="range" class="preview-scrubber" id="preview-scrubber" min="0" max="1000" value="0">
        <span class="preview-time" id="preview-time">0.00 / 0.00</span>
        <button class="preview-btn" id="preview-speed" title="Playback speed">1×</button>
      </div>
    `;

    this.iframeEl = this.container.querySelector('#preview-iframe');
    this.playBtn = this.container.querySelector('#preview-play');
    this.scrubber = this.container.querySelector('#preview-scrubber');
    this.timeDisplay = this.container.querySelector('#preview-time');
    this.speedBtn = this.container.querySelector('#preview-speed');

    // Play / Pause
    this.playBtn.addEventListener('click', () => this.togglePlay());

    // Scrubber
    this.scrubber.addEventListener('input', () => {
      this.time = (this.scrubber.value / 1000) * this.duration;
      this._seekFrame();
    });

    // Speed toggle
    const speeds = [0.5, 1, 2];
    let speedIdx = 1;
    this.speedBtn.addEventListener('click', () => {
      speedIdx = (speedIdx + 1) % speeds.length;
      this.speed = speeds[speedIdx];
      this.speedBtn.textContent = `${this.speed}×`;
    });
  }

  /**
   * Load a template's HTML into the preview iframe.
   * @param {string} html — Complete standalone HTML from template.toHTML()
   * @param {number} duration — Total animation duration in seconds
   */
  load(html, duration) {
    this.duration = duration;
    this.time = 0;
    this.playing = true;
    this.playBtn.textContent = '⏸';

    // Cleanup old blob
    if (this.blobUrl) URL.revokeObjectURL(this.blobUrl);

    const blob = new Blob([html], { type: 'text/html' });
    this.blobUrl = URL.createObjectURL(blob);
    this.iframeEl.src = this.blobUrl;

    this.iframeEl.onload = () => {
      this.lastTs = performance.now();
      this._startLoop();
    };
  }

  /**
   * Reload with new HTML (debounced externally)
   */
  reload(html, duration) {
    this._stopLoop();
    const savedTime = this.time;
    this.load(html, duration);
    const origOnload = this.iframeEl.onload;
    this.iframeEl.onload = () => {
      this.time = savedTime;
      origOnload?.();
    };
  }

  togglePlay() {
    this.playing = !this.playing;
    this.playBtn.textContent = this.playing ? '⏸' : '▶';
    if (this.playing) {
      this.lastTs = performance.now();
      this._startLoop();
    }
  }

  seekTo(t) {
    this.time = Math.max(0, Math.min(t, this.duration));
    this._seekFrame();
  }

  _startLoop() {
    this._stopLoop();
    const loop = (ts) => {
      if (!this.playing) return;
      const dt = (ts - this.lastTs) / 1000;
      this.lastTs = ts;
      this.time += dt * this.speed;
      if (this.time >= this.duration) this.time = 0;

      this._seekFrame();
      this._updateUI();
      this.animId = requestAnimationFrame(loop);
    };
    this.animId = requestAnimationFrame(loop);
  }

  _stopLoop() {
    if (this.animId) {
      cancelAnimationFrame(this.animId);
      this.animId = null;
    }
  }

  _seekFrame() {
    try {
      this.iframeEl.contentWindow?.seek?.(this.time);
    } catch (e) {
      // iframe not ready yet
    }
    this._updateUI();
    this.onTimeUpdate?.(this.time);
  }

  _updateUI() {
    this.scrubber.value = Math.round((this.time / this.duration) * 1000);
    this.timeDisplay.textContent = `${this.time.toFixed(2)} / ${this.duration.toFixed(1)}s`;
  }

  destroy() {
    this._stopLoop();
    if (this.blobUrl) URL.revokeObjectURL(this.blobUrl);
    this.container.innerHTML = '';
  }
}
