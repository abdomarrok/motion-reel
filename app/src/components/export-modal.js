/**
 * Export Modal Component — Shows render progress, cancellation, and download link.
 */

let activeJobId = null;
let activeEvtSource = null;
let activePollTimeout = null;

/**
 * Show the export modal and start the render process.
 * @param {string} templateId - Template ID
 * @param {object} config - Full template config (brand + scenes)
 */
export function showExportModal(templateId, config) {
  const root = document.getElementById('modal-root');

  // Clean up any stale job listeners
  cleanupActiveJob();

  root.innerHTML = `
    <div class="modal-overlay" id="export-overlay">
      <div class="modal-panel">
        <div class="modal-header">
          <h2>🎬 Export Video</h2>
          <button class="modal-close" id="export-close" title="Close">✕</button>
        </div>

        <div id="export-content">
          <div class="export-status" id="export-status">
            <div class="export-spinner" id="export-spinner"></div>
            <span id="export-status-text">Preparing render pipeline...</span>
          </div>
          <div class="progress-label">
            <span id="progress-stage">Initializing</span>
            <span class="progress-percentage" id="progress-pct">0%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill" id="progress-fill" style="width: 0%"></div>
          </div>
          <p id="export-hint" style="font-size:0.78rem; color:var(--text-muted); margin-top:12px; line-height:1.4;">
            Renders 1080×1920 30fps frames via Playwright + ffmpeg audio mix (~20–40 seconds).
          </p>
          <div id="export-actions" style="margin-top:16px;">
            <button class="btn btn-secondary btn-sm" id="export-cancel-btn" style="width:100%;">
              Cancel Export
            </button>
          </div>
        </div>
      </div>
    </div>
  `;

  // Close & Cancel handlers
  const handleCancelAndClose = async () => {
    if (activeJobId) {
      try {
        await fetch(`/api/render/${activeJobId}/cancel`, { method: 'POST' });
      } catch (_) {}
    }
    cleanupActiveJob();
    root.innerHTML = '';
  };

  root.querySelector('#export-close').addEventListener('click', handleCancelAndClose);
  root.querySelector('#export-cancel-btn').addEventListener('click', handleCancelAndClose);
  root.querySelector('#export-overlay').addEventListener('click', (e) => {
    if (e.target.id === 'export-overlay') handleCancelAndClose();
  });

  // Start render
  startRender(templateId, config, root);
}

function cleanupActiveJob() {
  if (activeEvtSource) {
    try { activeEvtSource.close(); } catch (_) {}
    activeEvtSource = null;
  }
  if (activePollTimeout) {
    clearTimeout(activePollTimeout);
    activePollTimeout = null;
  }
  activeJobId = null;
}

async function startRender(templateId, config, root) {
  const statusEl = root.querySelector('#export-status');
  const statusText = root.querySelector('#export-status-text');
  const stageEl = root.querySelector('#progress-stage');
  const pctEl = root.querySelector('#progress-pct');
  const fillEl = root.querySelector('#progress-fill');
  const contentEl = root.querySelector('#export-content');
  const actionsEl = root.querySelector('#export-actions');

  try {
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
    activeJobId = jobId;
    updateProgress(stageEl, pctEl, fillEl, 'Render started...', 10);

    // Stream progress via SSE
    const evtSource = new EventSource(`/api/render/${jobId}/progress`);
    activeEvtSource = evtSource;

    evtSource.addEventListener('progress', (e) => {
      try {
        const data = JSON.parse(e.data);
        if (data.stage) statusText.textContent = data.stage;
        updateProgress(stageEl, pctEl, fillEl, data.stage, data.percent);
      } catch (_) {}
    });

    evtSource.addEventListener('done', (e) => {
      cleanupActiveJob();
      let downloadUrl = `/api/render/${jobId}/download`;
      try {
        const data = JSON.parse(e.data);
        if (data.downloadUrl) downloadUrl = data.downloadUrl;
      } catch (_) {}
      showDownload(contentEl, statusEl, actionsEl, downloadUrl);
    });

    evtSource.addEventListener('cancelled', () => {
      cleanupActiveJob();
      showCancelled(statusEl, contentEl, actionsEl);
    });

    evtSource.addEventListener('error', (e) => {
      if (e.data) {
        try {
          const data = JSON.parse(e.data);
          cleanupActiveJob();
          showError(statusEl, contentEl, actionsEl, data.error || 'Render failed');
          return;
        } catch (_) {}
      }
      // If connection closed or broken, fall back to polling
      if (evtSource.readyState === EventSource.CLOSED) {
        cleanupActiveJob();
        pollProgress(jobId, stageEl, pctEl, fillEl, contentEl, statusEl, actionsEl);
      }
    });

    evtSource.onerror = () => {
      if (activeEvtSource) {
        activeEvtSource.close();
        activeEvtSource = null;
        pollProgress(jobId, stageEl, pctEl, fillEl, contentEl, statusEl, actionsEl);
      }
    };

  } catch (err) {
    showError(statusEl, contentEl, actionsEl, err.message);
  }
}

/** Fallback: poll /api/render/:id/status */
async function pollProgress(jobId, stageEl, pctEl, fillEl, contentEl, statusEl, actionsEl) {
  const poll = async () => {
    try {
      const res = await fetch(`/api/render/${jobId}/status`);
      if (!res.ok) throw new Error('Lost connection to render server');
      const data = await res.json();

      if (data.status === 'done') {
        cleanupActiveJob();
        showDownload(contentEl, statusEl, actionsEl, data.downloadUrl || `/api/render/${jobId}/download`);
        return;
      }
      if (data.status === 'cancelled') {
        cleanupActiveJob();
        showCancelled(statusEl, contentEl, actionsEl);
        return;
      }
      if (data.status === 'error') {
        cleanupActiveJob();
        showError(statusEl, contentEl, actionsEl, data.error || 'Render failed');
        return;
      }

      updateProgress(stageEl, pctEl, fillEl, data.stage || 'Rendering...', data.percent || 50);
      activePollTimeout = setTimeout(poll, 1500);
    } catch (err) {
      cleanupActiveJob();
      showError(statusEl, contentEl, actionsEl, err.message);
    }
  };
  poll();
}

function updateProgress(stageEl, pctEl, fillEl, stage, percent) {
  if (stageEl) stageEl.textContent = stage;
  const pct = Math.min(100, Math.max(0, Math.round(percent)));
  if (pctEl) pctEl.textContent = `${pct}%`;
  if (fillEl) fillEl.style.width = `${pct}%`;
}

function showDownload(contentEl, statusEl, actionsEl, downloadUrl) {
  statusEl.innerHTML = `<span style="color:var(--success); font-size:1.1rem; font-weight:bold;">✓</span> <span style="color:var(--success); font-weight:600;">Render complete!</span>`;
  statusEl.className = 'export-status success';

  const hintEl = contentEl.querySelector('#export-hint');
  if (hintEl) hintEl.style.display = 'none';

  if (actionsEl) {
    actionsEl.innerHTML = `
      <div style="margin-top: 8px; text-align: center;">
        <a href="${downloadUrl}" download="motion-reel.mp4" class="btn btn-primary btn-lg btn-block" id="download-btn" style="text-decoration:none;">
          ⬇ Download MP4 Video
        </a>
        <p style="font-size:0.75rem; color:var(--text-muted); margin-top:10px;">
          1080×1920 • 30fps H.264 • Ready for TikTok & Reels
        </p>
      </div>
    `;
  }
}

function showCancelled(statusEl, contentEl, actionsEl) {
  statusEl.innerHTML = `<span style="color:var(--text-muted);">⏹</span> <span>Render cancelled</span>`;
  statusEl.className = 'export-status';

  if (actionsEl) {
    actionsEl.innerHTML = `
      <button class="btn btn-secondary btn-sm" id="export-dismiss-btn" style="width:100%;">
        Close
      </button>
    `;
    actionsEl.querySelector('#export-dismiss-btn')?.addEventListener('click', () => {
      const root = document.getElementById('modal-root');
      if (root) root.innerHTML = '';
    });
  }
}

function showError(statusEl, contentEl, actionsEl, message) {
  statusEl.innerHTML = `<span style="color:var(--error); font-weight:bold;">✕</span> <span>Export failed</span>`;
  statusEl.className = 'export-status error';

  if (actionsEl) {
    actionsEl.innerHTML = `
      <div style="padding:12px 14px; background:rgba(248,113,113,0.08); border-radius:var(--radius-sm); border:1px solid rgba(248,113,113,0.2); margin-bottom:12px;">
        <p style="font-size:0.82rem; color:var(--error); margin:0;">${escapeHTML(message)}</p>
      </div>
      <button class="btn btn-secondary btn-sm" id="export-error-close-btn" style="width:100%;">
        Close
      </button>
    `;
    actionsEl.querySelector('#export-error-close-btn')?.addEventListener('click', () => {
      const root = document.getElementById('modal-root');
      if (root) root.innerHTML = '';
    });
  }
}

function escapeHTML(str) {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}
