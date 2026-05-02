/**
 * index.js — Reflect backend entry point.
 *
 * Sets up the Express app, registers API routes, starts the server,
 * and schedules the daily morning pipeline run via node-cron.
 */

'use strict';

const express = require('express');
const cors = require('cors');
const cron = require('node-cron');

const config = require('./config');
const { runPipeline } = require('./pipeline');

// ── Route handlers ────────────────────────────────────────────────────────────

const assessmentRoute = require('./routes/assessment');
const refreshRoute = require('./routes/refresh');
const sendSmsRoute = require('./routes/sendSms');
const statusRoute = require('./routes/status');

// ── App setup ─────────────────────────────────────────────────────────────────

const app = express();

// CORS — allow any localhost origin in dev (Vite port can vary)
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (curl, Postman) or any localhost port
    if (!origin || /^http:\/\/localhost(:\d+)?$/.test(origin)) {
      return callback(null, true);
    }
    // Fall back to the configured origin for production
    if (origin === config.app.frontendOrigin) {
      return callback(null, true);
    }
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type'],
}));

app.use(express.json());

// ── Health check ──────────────────────────────────────────────────────────────

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ── API routes ────────────────────────────────────────────────────────────────

app.use('/api', assessmentRoute);
app.use('/api', refreshRoute);
app.use('/api', sendSmsRoute);
app.use('/api', statusRoute);

// ── 404 fallback ──────────────────────────────────────────────────────────────

app.use((req, res) => {
  res.status(404).json({ error: `Route not found: ${req.method} ${req.path}` });
});

// ── Daily scheduler ───────────────────────────────────────────────────────────

// Runs at 07:00 every morning in the configured timezone.
// node-cron does not natively support named timezones, so we use a UTC offset
// approximation. For a hackathon demo, this is sufficient.
// Cron format: second(opt) minute hour day month weekday
try {
  cron.schedule('0 7 * * *', async () => {
    console.log('[scheduler] Morning pipeline triggered by cron.');
    try {
      await runPipeline();
      console.log('[scheduler] Morning pipeline completed.');
    } catch (err) {
      console.error('[scheduler] Morning pipeline failed:', err.message);
    }
  });
  console.log('[scheduler] Daily pipeline scheduled for 07:00.');
} catch (err) {
  console.error('[scheduler] Failed to register cron job (non-fatal):', err.message);
}

// ── Start server ──────────────────────────────────────────────────────────────

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`\n🪞 Reflect backend running on http://localhost:${PORT}`);
  console.log(`   User: ${config.userName}`);
  console.log(`   Mock mode: ${config.mockMode}`);
  console.log(`   Twilio SMS: ${config.twilio.enabled ? 'enabled' : 'disabled'}`);
  console.log(`   Frontend origin: ${config.app.frontendOrigin}`);
  console.log(`   Endpoints:`);
  console.log(`     GET  /api/health`);
  console.log(`     GET  /api/assessment`);
  console.log(`     POST /api/refresh`);
  console.log(`     POST /api/send-sms`);
  console.log(`     GET  /api/status\n`);
});

module.exports = app;
