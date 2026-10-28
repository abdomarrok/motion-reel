import React, { useEffect, useState, useRef } from 'react';
import { TemplateConfig } from '../types';

interface ExportModalProps {
  templateId: string;
  config: TemplateConfig;
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ templateId, config, onClose }) => {
  const [jobId, setJobId] = useState<string | null>(null);
  const [stage, setStage] = useState('Preparing render pipeline...');
  const [percent, setPercent] = useState(5);
  const [status, setStatus] = useState<'running' | 'done' | 'cancelled' | 'error'>('running');
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const activeJobIdRef = useRef<string | null>(null);
  const evtSourceRef = useRef<EventSource | null>(null);
  const pollTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    let unmounted = false;

    const cleanup = () => {
      if (evtSourceRef.current) {
        try {
          evtSourceRef.current.close();
        } catch {
          // ignore
        }
        evtSourceRef.current = null;
      }
      if (pollTimerRef.current) {
        clearTimeout(pollTimerRef.current);
        pollTimerRef.current = null;
      }
    };

    const startPoll = (id: string) => {
      const poll = async () => {
        if (unmounted) return;
        try {
          const res = await fetch(`/api/render/${id}/status`);
          if (!res.ok) throw new Error('Lost connection to render server');
          const data = await res.json();

          if (data.status === 'done') {
            cleanup();
            setStatus('done');
            setPercent(100);
            setStage('Complete!');
            setDownloadUrl(data.downloadUrl || `/api/render/${id}/download`);
            return;
          }
          if (data.status === 'cancelled') {
            cleanup();
            setStatus('cancelled');
            setStage('Render cancelled');
            return;
          }
          if (data.status === 'error') {
            cleanup();
            setStatus('error');
            setErrorMessage(data.error || 'Render failed');
            return;
          }

          if (data.stage) setStage(data.stage);
          if (data.percent) setPercent(Math.min(100, Math.max(0, Math.round(data.percent))));
          pollTimerRef.current = setTimeout(poll, 1500);
        } catch (err: unknown) {
          cleanup();
          setStatus('error');
          setErrorMessage(err instanceof Error ? err.message : 'Render failed');
        }
      };
      poll();
    };

    const triggerRender = async () => {
      try {
        setStage('Sending to render server...');
        setPercent(5);

        const res = await fetch('/api/render', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ templateId, config })
        });

        if (!res.ok) {
          const err = await res.text();
          throw new Error(`Server error: ${err}`);
        }

        const data = await res.json();
        const id = data.jobId;
        if (unmounted) return;

        setJobId(id);
        activeJobIdRef.current = id;
        setStage('Render started...');
        setPercent(10);

        // Connect SSE
        const evtSource = new EventSource(`/api/render/${id}/progress`);
        evtSourceRef.current = evtSource;

        evtSource.addEventListener('progress', (e) => {
          try {
            const parsed = JSON.parse(e.data);
            if (parsed.stage) setStage(parsed.stage);
            if (typeof parsed.percent === 'number') {
              setPercent(Math.min(100, Math.max(0, Math.round(parsed.percent))));
            }
          } catch {
            // ignore JSON parse error
          }
        });

        evtSource.addEventListener('done', (e) => {
          cleanup();
          let dl = `/api/render/${id}/download`;
          try {
            const parsed = JSON.parse(e.data);
            if (parsed.downloadUrl) dl = parsed.downloadUrl;
          } catch {
            // ignore
          }
          setStatus('done');
          setPercent(100);
          setStage('Complete!');
          setDownloadUrl(dl);
        });

        evtSource.addEventListener('cancelled', () => {
          cleanup();
          setStatus('cancelled');
          setStage('Render cancelled');
        });

        evtSource.addEventListener('error', (e) => {
          if ((e as MessageEvent).data) {
            try {
              const parsed = JSON.parse((e as MessageEvent).data);
              cleanup();
              setStatus('error');
              setErrorMessage(parsed.error || 'Render failed');
              return;
            } catch {
              // ignore
            }
          }
          if (evtSource.readyState === EventSource.CLOSED) {
            cleanup();
            startPoll(id);
          }
        });

        evtSource.onerror = () => {
          if (evtSourceRef.current) {
            evtSourceRef.current.close();
            evtSourceRef.current = null;
            startPoll(id);
          }
        };
      } catch (err: unknown) {
        if (!unmounted) {
          setStatus('error');
          setErrorMessage(err instanceof Error ? err.message : 'Render failed');
        }
      }
    };

    triggerRender();

    return () => {
      unmounted = true;
      cleanup();
    };
  }, [templateId, config]);

  const handleCancel = async () => {
    if (activeJobIdRef.current) {
      try {
        await fetch(`/api/render/${activeJobIdRef.current}/cancel`, { method: 'POST' });
      } catch {
        // ignore
      }
    }
    if (evtSourceRef.current) {
      evtSourceRef.current.close();
      evtSourceRef.current = null;
    }
    if (pollTimerRef.current) {
      clearTimeout(pollTimerRef.current);
      pollTimerRef.current = null;
    }
    onClose();
  };

  return (
    <div className="modal-overlay" id="export-overlay" onClick={handleCancel}>
      <div className="modal-panel" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>🎬 Export Video</h2>
          <button className="modal-close" id="export-close" title="Close" onClick={handleCancel}>
            ✕
          </button>
        </div>

        <div id="export-content">
          {status === 'running' && (
            <>
              <div className="export-status" id="export-status">
                <div className="export-spinner" id="export-spinner" />
                <span id="export-status-text">{stage}</span>
              </div>
              <div className="progress-label">
                <span id="progress-stage">{stage}</span>
                <span className="progress-percentage" id="progress-pct">
                  {percent}%
                </span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" id="progress-fill" style={{ width: `${percent}%` }} />
              </div>
              <p
                id="export-hint"
                style={{
                  fontSize: '0.78rem',
                  color: 'var(--text-muted)',
                  marginTop: '12px',
                  lineHeight: 1.4
                }}
              >
                Renders 1080×1920 30fps frames via Playwright + ffmpeg audio mix (~20–40 seconds).
              </p>
              <div id="export-actions" style={{ marginTop: '16px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  id="export-cancel-btn"
                  style={{ width: '100%' }}
                  onClick={handleCancel}
                >
                  Cancel Export
                </button>
              </div>
            </>
          )}

          {status === 'done' && (
            <>
              <div className="export-status success" id="export-status">
                <span style={{ color: 'var(--success)', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  ✓
                </span>{' '}
                <span style={{ color: 'var(--success)', fontWeight: 600 }}>Render complete!</span>
              </div>
              <div className="progress-bar">
                <div className="progress-fill" id="progress-fill" style={{ width: '100%' }} />
              </div>
              <div id="export-actions" style={{ marginTop: '8px', textAlign: 'center' }}>
                <a
                  href={downloadUrl || '#'}
                  download="motion-reel.mp4"
                  className="btn btn-primary btn-lg btn-block"
                  id="download-btn"
                  style={{ textDecoration: 'none' }}
                >
                  ⬇ Download MP4 Video
                </a>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '10px' }}>
                  1080×1920 • 30fps H.264 • Ready for TikTok & Reels
                </p>
              </div>
            </>
          )}

          {status === 'cancelled' && (
            <>
              <div className="export-status" id="export-status">
                <span style={{ color: 'var(--text-muted)' }}>⏹</span>{' '}
                <span>Render cancelled</span>
              </div>
              <div id="export-actions" style={{ marginTop: '16px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  id="export-dismiss-btn"
                  style={{ width: '100%' }}
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="export-status error" id="export-status">
                <span style={{ color: 'var(--error)', fontWeight: 'bold' }}>✕</span>{' '}
                <span>Export failed</span>
              </div>
              <div
                style={{
                  padding: '12px 14px',
                  background: 'rgba(248,113,113,0.08)',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid rgba(248,113,113,0.2)',
                  marginBottom: '12px'
                }}
              >
                <p style={{ fontSize: '0.82rem', color: 'var(--error)', margin: 0 }}>
                  {errorMessage || 'Unknown error occurred during video rendering.'}
                </p>
              </div>
              <div id="export-actions" style={{ marginTop: '16px' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  id="export-error-close-btn"
                  style={{ width: '100%' }}
                  onClick={onClose}
                >
                  Close
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
