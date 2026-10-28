import express from 'express';
import cors from 'cors';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { createServer as createViteServer } from 'vite';
// @ts-expect-error - JS module import without declaration
import { renderVideo, getJobStatus, cancelJob } from './server/renderer.mjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '4mb' }));

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Start render job
app.post('/api/render', async (req, res) => {
  try {
    const { templateId, config } = req.body;
    if (!templateId || !config) {
      return res.status(400).json({ error: 'Missing templateId or config' });
    }

    const jobId = `job-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    console.log(`[render] Starting job ${jobId} for template "${templateId}"`);

    renderVideo(jobId, templateId, config).catch((err: any) => {
      console.error(`[render] Job ${jobId} failed:`, err?.message || err);
    });

    res.json({ jobId });
  } catch (err: any) {
    console.error('[render] Error:', err);
    res.status(500).json({ error: err?.message || 'Server error' });
  }
});

// Cancel render job
app.post('/api/render/:jobId/cancel', (req, res) => {
  const { jobId } = req.params;
  const cancelled = cancelJob(jobId);
  res.json({ success: cancelled });
});

// Stream render progress (SSE)
app.get('/api/render/:jobId/progress', (req, res) => {
  const { jobId } = req.params;

  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    Connection: 'keep-alive'
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

    if (status.status === 'cancelled') {
      res.write(`event: cancelled\ndata: ${JSON.stringify({ message: 'Render cancelled' })}\n\n`);
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

    res.write(
      `event: progress\ndata: ${JSON.stringify({ stage: status.stage, percent: status.percent })}\n\n`
    );
  }, 500);

  req.on('close', () => clearInterval(interval));
});

// Polling status endpoint
app.get('/api/render/:jobId/status', (req, res) => {
  const status = getJobStatus(req.params.jobId);
  if (!status) return res.status(404).json({ error: 'Job not found' });
  res.json(status);
});

// Download finished MP4
app.get('/api/render/:jobId/download', (req, res) => {
  const status = getJobStatus(req.params.jobId);
  if (!status || status.status !== 'done' || !status.outputPath || !existsSync(status.outputPath)) {
    return res.status(404).json({ error: 'Video not ready or file not found' });
  }
  res.download(status.outputPath, 'motion-reel.mp4');
});

// Vite middleware in dev or static files in production
async function startServer() {
  if (process.env.NODE_ENV === 'production' && existsSync(resolve(__dirname, 'dist'))) {
    app.use(express.static(resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0'
      },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎬 Motion Reel Studio running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
