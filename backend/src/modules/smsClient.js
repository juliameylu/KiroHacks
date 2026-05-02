/**
 * smsClient.js — Sends a morning SMS summary to the user via the Twilio API.
 *
 * If Twilio is not configured (missing credentials or no user phone number),
 * logs a message and returns a skip result without throwing. If the Twilio
 * API call fails, the error is logged and a failure result is returned —
 * the pipeline is never interrupted.
 *
 * Exports:
 *   sendMorningSms(assessment) → Promise<{ ok: boolean, to?: string, reason?: string }>
 */

const twilio = require('twilio');
const config = require('../config');

// ── Message builder ───────────────────────────────────────────────────────────

function buildMessage(assessment, name) {
  const { stress_level, action_recommendation } = assessment;
  return (
    `Good morning ${name} 👋 ` +
    `Your predicted stress load today is ${stress_level}. ` +
    `Tip: ${action_recommendation}. ` +
    `Open Reflect for the full picture.`
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Sends a morning SMS summary to the configured user phone number.
 * Never throws — all errors are caught and returned as { ok: false, reason }.
 *
 * @param {{ stress_level: string, action_recommendation: string }} assessment
 * @returns {Promise<{ ok: boolean, to?: string, reason?: string }>}
 */
async function sendMorningSms(assessment) {
  try {
    if (!config.twilio.enabled || !config.userPhone) {
      console.log('[smsClient] Twilio not configured or user phone missing — skipping SMS.');
      return { ok: false, reason: 'Twilio not configured' };
    }

    const messageText = buildMessage(assessment, config.userName);
    console.log(`[smsClient] Sending SMS to ${config.userPhone}…`);

    const client = twilio(config.twilio.accountSid, config.twilio.authToken);
    await client.messages.create({
      body: messageText,
      from: config.twilio.fromNumber,
      to: config.userPhone,
    });

    console.log(`[smsClient] SMS sent successfully to ${config.userPhone}.`);
    return { ok: true, to: config.userPhone };
  } catch (err) {
    console.error('[smsClient] Failed to send SMS:', err.message);
    return { ok: false, reason: err.message };
  }
}

module.exports = { sendMorningSms };
