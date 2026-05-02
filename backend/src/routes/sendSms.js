/**
 * sendSms.js — POST /api/send-sms
 *
 * Immediately sends an SMS using the latest cached assessment result.
 * Used for demo control — can be triggered at any time of day.
 *
 * 200: { ok: true, to: phoneNumber }
 * 503: no cached data available
 * 502: Twilio error
 */

'use strict';

const express = require('express');
const cache = require('../cache');
const { sendMorningSms } = require('../modules/smsClient');

const router = express.Router();

router.post('/send-sms', async (req, res) => {
  if (!cache.isWarm()) {
    return res.status(503).json({
      error: 'No cached data to send. Run POST /api/refresh first.',
    });
  }

  const result = await sendMorningSms(cache.get());

  if (result.ok) {
    return res.status(200).json({ ok: true, to: result.to });
  }

  // Twilio not configured — treat as a soft skip, not a server error
  if (result.reason === 'Twilio not configured') {
    return res.status(200).json({ ok: false, reason: result.reason });
  }

  return res.status(502).json({ error: `Twilio error: ${result.reason}` });
});

module.exports = router;
