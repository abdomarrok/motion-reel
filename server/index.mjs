/**
 * Motion Reel Studio — Express API Server
 * Handles video render requests, progress streaming, and downloads.
 */
import express from 'express';
import cors from 'cors';
import { existsSync } from 'node:fs';
import { renderVideo, getJobStatus } from './renderer.mjs';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '2mb' }));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

/**
 * POST /api/render
 * Start a new render job.
 * Body: { templateId: string, config: object }
 * Returns: { jobId: string }
 */
app.post('/api/render', async (req, res) => {
  try {
    const { templateId, config } = req.body;

    if (!templateId || !config) {
      return res.status(400).json({ error: 'Missing templateId or config' });
    }

    const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[render] Starting job ${jobId} for template "${templateId}"`);

    // Start render in background (don't await)
    renderVideo(jobId, templateId, config).catch(err => {
      console.error(`[render] Job ${jobId} failed:`, err.message);
    });

    res.json({ jobId });
  } catch (err) {
    console.error('[render] Error:', err);
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET /api/render/:jobId/progress
 * Server-Sent Events stream for render progress.
 */
app.get('/api/render/:jobId/progress', (req, res) => {
  const { jobId } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive'
  });

  const interval = setInterval(() => {
    const status = getJobStatus(jobId);
    if (!status) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: 'Job not found' })}\n\n`);
      clearInterval(interval);
      res.end();
      return;
    }

    if (status.status === 'done') {
      res.write(`event: progress\ndata: ${JSON.stringify({ stage: 'Complete!', percent: 100 })}\n\n`);
      res.write(`event: done\ndata: ${JSON.stringify({ downloadUrl: `/api/render/${jobId}/download` })}\n\n`);
      clearInterval(interval);
      res.end();
      return;
    }

    if (status.status === 'error') {
      res.write(`event: error\ndata: ${JSON.stringify({ error: status.error })}\n\n`);
      clearInterval(interval);
      res.end();
      return;
    }

    res.write(`event: progress\ndata: ${JSON.stringify({ stage: status.stage, percent: status.percent })}\n\n`);
  }, 1000);

  req.on('close', () => clearInterval(interval));
});

/**
 * GET /api/render/:jobId/status
 * Polling fallback for progress.
 */
app.get('/api/render/:jobId/status', (req, res) => {
  const status = getJobStatus(req.params.jobId);
  if (!status) return res.status(404).json({ error: 'Job not found' });
  res.json(status);
});

/**
 * GET /api/render/:jobId/download
 * Download the finished MP4.
 */
app.get('/api/render/:jobId/download', (req, res) => {
  const status = getJobStatus(req.params.jobId);
  if (!status || status.status !== 'done' || !status.outputPath || !existsSync(status.outputPath)) {
    return res.status(404).json({ error: 'Video not ready or file not found' });
  }
  res.download(status.outputPath, 'motion-reel.mp4');
});

app.listen(PORT, () => {
  console.log(`\n  🎬 Motion Reel Studio API`);
  console.log(`  → http://localhost:${PORT}`);
  console.log(`  → Health: http://localhost:${PORT}/api/health\n`);
});
