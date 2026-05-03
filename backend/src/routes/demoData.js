/**
 * demoData.js — GET /api/demo-data
 *
 * Returns the full two-week James demo dataset used by mock mode:
 * Google Calendar-style events, Oura API v2-style metrics, and baselines.
 * This is intentionally separate from /api/assessment, which returns only
 * the current summarized assessment contract.
 */

'use strict';

const express = require('express');
const { getDemoDataFixture } = require('../fixtures');

const router = express.Router();

router.get('/demo-data', (req, res) => {
  return res.status(200).json(getDemoDataFixture());
});

module.exports = router;
