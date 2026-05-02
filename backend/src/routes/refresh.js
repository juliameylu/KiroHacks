/**
 * refresh.js — POST /api/refresh
 *
 * Manually triggers the full pipeline and returns the new assessment.
 * Used for demo control and initial data load.
 *
 * 200: new assessment object
 * 503: pipeline failed and no cached data available
 */

'use strict';

const express = require('express');
const { runPipeline } = require('../pipeline');

const router = express.Router();

router.post('/refresh', async (req, res) => {
  try {
    const result = await runPipeline();
    return res.status(200).json(result);
  } catch (err) {
    console.error('[route /refresh] Pipeline error:', err.message);
    return res.status(503).json({
      error: `Pipeline failed: ${err.message}`,
    });
  }
});

module.exports = router;
