/**
 * Export Modal Component — Shows render progress and download link.
 */

/**
 * Show the export modal and start the render process.
 * @param {object} config - Full template config (brand + scenes)
 * @param {string} templateId - Template ID
 * @returns {Promise<void>}
 */
export function showExportModal(templateId, config) {
  const root = document.getElementById('modal-root');

  root.innerHTML = `
    <div class="modal-overlay" id="export-overlay">
      <div class="modal-panel">
        <div class="modal-header">
          <h2>🎬 Export Video</h2>
          <button class="modal-close" id="export-close">✕</button>
        </div>

        <div id="export-content">
          <div class="export-status" id="export-status">
            <div class="export-spinner"></div>
            <span>Preparing render...</span>
          </div>
          <div class="progress-label">
            <span id="progress-stage">Initializing</span>
            <span class="progress-percentage" id="progress-pct">0%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
          </div>
          <p style="font-size:0.78rem; color:var(--text-muted); margin-top:12px;">
            This renders frames via Playwright + ffmpeg on your machine. It may take a few minutes.
          </p>
        </div>
      </div>
    </div>
  `;

  // Close handler
  const close = () => { root.innerHTML = ''; };
  root.querySelector('#export-close').addEventListener('click', close);
  root.querySelector('#export-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'export-overlay') close();
  });

  // Start render
  startRender(templateId, config, root);
}

async function startRender(templateId, config, root) {
  const statusEl = root.querySelector('#export-status');
  const stageEl = root.querySelector('#progress-stage');
  const pctEl = root.querySelector('#progress-pct');
  const fillEl = root.querySelector('#progress-fill');
  const contentEl = root.querySelector('#export-content');

  try {
    // 1. Send render request
    updateProgress(stageEl, pctEl, fillEl, 'Sending to render server...', 5);

    const res = await fetch('/api/render', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ templateId, config })
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`Server error: ${err}`);
    }

    const { jobId } = await res.json();
    updateProgress(stageEl, pctEl, fillEl, 'Render started...', 10);

    // 2. Poll for progress via SSE
    const evtSource = new EventSource(`/api/render/${jobId}/progress`);

    evtSource.addEventListener('progress', (e) => {
      const data = JSON.parse(e.data);
      updateProgress(stageEl, pctEl, fillEl, data.stage, data.percent);
    });

    evtSource.addEventListener('done', (e) => {
      evtSource.close();
      const data = JSON.parse(e.data);
      showDownload(contentEl, statusEl, data.downloadUrl || `/api/render/${jobId}/download`);
    });

    evtSource.addEventListener('error', (e) => {
      // Check if it's a real error or just SSE reconnecting
      if (evtSource.readyState === EventSource.CLOSED) return;
      // EventSource auto-reconnects, only show error after final close
    });

    evtSource.onerror = () => {
      // If connection lost completely, fall back to polling
      evtSource.close();
      pollProgress(jobId, stageEl, pctEl, fillEl, contentEl, statusEl);
    };

  } catch (err) {
    showError(statusEl, contentEl, err.message);
  }
}

/** Fallback: poll /api/render/:id/status */
async function pollProgress(jobId, stageEl, pctEl, fillEl, contentEl, statusEl) {
  const poll = async () => {
    try {
      const res = await fetch(`/api/render/${jobId}/status`);
      if (!res.ok) throw new Error('Lost connection to server');
      const data = await res.json();

      if (data.status === 'done') {
        showDownload(contentEl, statusEl, data.downloadUrl || `/api/render/${jobId}/download`);
        return;
      }
      if (data.status === 'error') {
        showError(statusEl, contentEl, data.error || 'Render failed');
        return;
      }
      updateProgress(stageEl, pctEl, fillEl, data.stage || 'Rendering...', data.percent || 50);
      setTimeout(poll, 2000);
    } catch (err) {
      showError(statusEl, contentEl, err.message);
    }
  };
  poll();
}

function updateProgress(stageEl, pctEl, fillEl, stage, percent) {
  stageEl.textContent = stage;
  pctEl.textContent = `${Math.round(percent)}%`;
  fillEl.style.width = `${percent}%`;
}

function showDownload(contentEl, statusEl, downloadUrl) {
  statusEl.innerHTML = `<span style="color:var(--success);">✓</span> <span>Render complete!</span>`;
  statusEl.className = 'export-status success';

  contentEl.insertAdjacentHTML('beforeend', `
    <div style="margin-top: 20px; text-align: center;">
      <a href="${downloadUrl}" download="motion-reel.mp4" class="btn btn-primary btn-lg btn-block" id="download-btn">
        ⬇ Download MP4
      </a>
      <p style="font-size:0.75rem; color:var(--text-muted); margin-top:12px;">
        1080×1920 • H.264 • Ready for TikTok
      </p>
    </div>
  `);
}

function showError(statusEl, contentEl, message) {
  statusEl.innerHTML = `<span style="color:var(--error);">✕</span> <span>Export failed</span>`;
  statusEl.className = 'export-status error';

  contentEl.insertAdjacentHTML('beforeend', `
    <div style="margin-top:16px; padding:12px 16px; background:rgba(248,113,113,0.08); border-radius:var(--radius-sm); border:1px solid rgba(248,113,113,0.2);">
      <p style="font-size:0.82rem; color:var(--error);">${escapeHTML(message)}</p>
      <p style="font-size:0.75rem; color:var(--text-muted); margin-top:8px;">
        Make sure the server is running (<code>npm run dev:server</code>) and ffmpeg is installed.
      </p>
    </div>
  `);
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
