/**
 * status.js — GET /api/status
 *
 * Returns pipeline health info: last run timestamp, cache status,
 * and per-service availability flags.
 *
 * 200: status object
 */

'use strict';

const express = require('express');
const cache = require('../cache');

const router = express.Router();

// Track service availability — updated by the pipeline on each run.
// Exposed as a simple in-memory object; routes can read it directly.
const serviceStatus = {
  oura: true,
  google: true,
  llm: true,
};

router.get('/status', (req, res) => {
  return res.status(200).json({
    last_run: cache.getLastUpdated(),
    cache_status: cache.isWarm() ? 'warm' : 'empty',
    services: { ...serviceStatus },
  });
});

module.exports = router;
module.exports.serviceStatus = serviceStatus;
