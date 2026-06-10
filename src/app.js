const express = require('express');
const store = require('./store');
const faultId = require('./faultId');
const app = express();

app.use(express.json());

// ── Health check ──────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'NBN Fault Reporting API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// ── Routes will be added here during the workshop ─────────────────
// Participants will use Claude Code to implement:
//   POST /report-fault
//   GET  /fault-status/:fault_id

app.get('/fault-status/:fault_id', (req, res) => {
  const id = req.params.fault_id;

  if (!faultId.isValid(id)) {
    return res.status(400).json({
      error: 'INVALID_FAULT_ID',
      message: `Fault ID "${id}" is not in the expected format NBN-YYYY-XXXXXX.`,
      timestamp: new Date().toISOString()
    });
  }

  const report = store.findById(id);
  if (!report) {
    return res.status(404).json({
      error: 'NOT_FOUND',
      message: `No fault report found for ${id}.`,
      timestamp: new Date().toISOString()
    });
  }

  res.status(200).json(report);
});

// ── 404 handler ───────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

// ── Global error handler ──────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'INTERNAL_SERVER_ERROR',
    message: 'An unexpected error occurred',
    timestamp: new Date().toISOString()
  });
});

module.exports = app;
