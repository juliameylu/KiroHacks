/**
 * assessment.js — GET /api/assessment
 *
 * Returns the latest cached stress assessment.
 * Does not trigger the pipeline — use POST /api/refresh for that.
 *
 * 200: cached assessment object
 * 503: no data available yet
 */

'use strict';

const express = require('express');
const cache = require('../cache');

const router = express.Router();

router.get('/assessment', (req, res) => {
  if (!cache.isWarm()) {
    return res.status(503).json({
      error: 'No assessment data available. Run POST /api/refresh to generate one.',
    });
  }

  return res.status(200).json(cache.get());
});

module.exports = router;
