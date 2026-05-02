/**
 * llmClient.js — Constructs a structured prompt from biometric + calendar +
 * signal data, calls the Claude API (Anthropic), parses the JSON response,
 * and returns a normalised assessment object.
 *
 * Falls back to deterministic rule-based output if Claude fails, times out,
 * or returns a malformed response after one retry.
 *
 * Exports:
 *   assess(payload) → Promise<AssessmentResult>
 *
 * AssessmentResult shape:
 *   {
 *     stress_level: "High" | "Elevated" | "Calm",
 *     drivers: string[],
 *     action_recommendation: string,
 *     summary: string,
 *     llm_source: "live" | "fallback"
 *   }
 */

const axios = require('axios');
const config = require('../config');
const { getLlmResponseFixture } = require('../fixtures');

// ── Constants ─────────────────────────────────────────────────────────────────

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';
const CLAUDE_MODEL = 'claude-3-5-haiku-20241022';
const MAX_TOKENS = 512;
const TIMEOUT_MS = 15_000;

const VALID_STRESS_LEVELS = new Set(['Elevated', 'High', 'Calm']);

// ── System prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `You are a wellness assistant that helps users understand their predicted stress load for the day based on recovery signals and schedule. You do NOT diagnose stress medically. Use language like "predicted stress load" and "based on your recovery signals".

You will receive a natural-language description of the user's biometrics and schedule. Based on that, return a JSON assessment.

Rules:
- summary MUST be under 60 words, written in plain language, personalised to the user's name
- action_recommendation MUST reference a specific free slot time if one is available
- drivers should be 2–4 short phrases naming the key contributing factors
- stress_level must be exactly one of: "Elevated", "High", or "Calm"

You MUST respond with valid JSON only — no markdown, no explanation, no extra text. The JSON must match this exact schema:
{
  "stress_level": "Elevated" | "High" | "Calm",
  "drivers": [<array of 2-4 short strings naming contributing factors>],
  "action_recommendation": "<one specific, actionable suggestion — if a free slot exists, reference it by time>",
  "summary": "<under 60 words, plain language, personalised to the user's name>"
}`;

// ── Time formatting helpers ───────────────────────────────────────────────────

/**
 * Formats an ISO datetime string as "h:MM AM/PM" (e.g. "9:00 AM", "3:30 PM").
 * Returns "N/A" if the input is null/undefined/invalid.
 *
 * @param {string|null|undefined} isoString
 * @returns {string}
 */
function formatTime(isoString) {
  if (!isoString) return 'N/A';
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return 'N/A';
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const h = hours % 12 || 12;
    const mm = String(minutes).padStart(2, '0');
    return `${h}:${mm} ${ampm}`;
  } catch {
    return 'N/A';
  }
}

/**
 * Formats a free slot object as "HH:MM–HH:MM" using 12-hour time.
 *
 * @param {{ start: string, end: string }} slot
 * @returns {string}
 */
function formatSlotTime(isoString) {
  return formatTime(isoString);
}

/**
 * Formats a value for display in the prompt, substituting "N/A" for null/undefined.
 *
 * @param {*} value
 * @returns {string}
 */
function fmt(value) {
  return value != null ? String(value) : 'N/A';
}

// ── Prompt builder ────────────────────────────────────────────────────────────

/**
 * Builds the user prompt string from the pipeline payload.
 *
 * @param {object} payload
 * @param {string} payload.name
 * @param {object} payload.biometrics
 * @param {object} payload.baselines
 * @param {object} payload.signals
 * @param {object} payload.schedule
 * @returns {string}
 */
function buildPrompt(payload) {
  const { name, biometrics = {}, baselines = {}, signals = {}, schedule = {} } = payload;

  const {
    sleep_hours,
    hrv_ms,
    resting_hr_bpm,
    breathing_rate,
    temperature_deviation_c,
    readiness_score,
  } = biometrics;

  const { sleep_baseline_hours, hrv_7d_avg, resting_hr_7d_avg } = baselines;
  const { physiological_strain, schedule_load } = signals;
  const { events = [], event_count, free_slots = [] } = schedule;

  const today = new Date().toISOString().split('T')[0];

  // Format events list
  const eventsText =
    events.length > 0
      ? events
          .map((e) => `- ${formatTime(e.start)}–${formatTime(e.end)}: ${e.title ?? 'Untitled'}`)
          .join('\n')
      : '- No events scheduled';

  // Format free slots list
  const freeSlotsText =
    free_slots.length > 0
      ? free_slots.map((s) => `- ${formatTime(s.start)}–${formatTime(s.end)}`).join('\n')
      : '- No free slots available';

  const resolvedEventCount = event_count != null ? event_count : events.length;

  return `User: ${fmt(name)}
Date: ${today}

BIOMETRIC SIGNALS (today vs baseline):
- Sleep: ${fmt(sleep_hours)}h (baseline: ${fmt(sleep_baseline_hours)}h)
- HRV: ${fmt(hrv_ms)}ms (7-day avg: ${fmt(hrv_7d_avg)}ms)
- Resting HR: ${fmt(resting_hr_bpm)}bpm (7-day avg: ${fmt(resting_hr_7d_avg)}bpm)
- Breathing rate: ${fmt(breathing_rate)} breaths/min
- Temperature deviation: ${fmt(temperature_deviation_c)}°C
- Readiness score: ${fmt(readiness_score)}/100

DERIVED SIGNALS:
- Physiological strain: ${fmt(physiological_strain)} (high = sleep below baseline AND HRV below avg AND HR above avg)
- Schedule load: ${fmt(schedule_load)} (high = ≥5 events OR important keywords detected)

TODAY'S SCHEDULE (${resolvedEventCount} events):
${eventsText}

FREE SLOTS (≥30 min):
${freeSlotsText}

Based on these signals, assess ${fmt(name)}'s predicted stress load for today. If a free slot exists, the action_recommendation MUST reference a specific time from the free slots list.`;
}

// ── Response parser / validator ───────────────────────────────────────────────

/**
 * Parses and validates the raw text from Claude's response.
 * Returns the parsed object if valid, or null on any failure.
 *
 * @param {string} text
 * @returns {{ stress_level: string, drivers: string[], action_recommendation: string, summary: string } | null}
 */
function parseResponse(text) {
  if (!text || typeof text !== 'string') return null;

  try {
    const parsed = JSON.parse(text.trim());

    // Validate required fields
    if (!VALID_STRESS_LEVELS.has(parsed.stress_level)) return null;
    if (!Array.isArray(parsed.drivers) || parsed.drivers.length === 0) return null;
    if (typeof parsed.action_recommendation !== 'string' || !parsed.action_recommendation.trim()) return null;
    if (typeof parsed.summary !== 'string' || !parsed.summary.trim()) return null;

    return {
      stress_level: parsed.stress_level,
      drivers: parsed.drivers,
      action_recommendation: parsed.action_recommendation,
      summary: parsed.summary,
    };
  } catch {
    return null;
  }
}

// ── Deterministic fallback ────────────────────────────────────────────────────

/**
 * Generates a deterministic stress assessment from derived signals.
 * Used when Claude is unavailable or returns an unparseable response.
 *
 * @param {{ physiological_strain: string, schedule_load: string }} signals
 * @param {{ free_slots?: Array<{ start: string, end: string }> }} schedule
 * @param {string} name
 * @returns {{ stress_level: string, drivers: string[], action_recommendation: string, summary: string }}
 */
function deterministicAssessment(signals, schedule, name) {
  const { physiological_strain, schedule_load } = signals;
  const bothHigh = physiological_strain === 'high' && schedule_load === 'high';
  const oneHigh = physiological_strain === 'high' || schedule_load === 'high';

  // Calm / Elevated / High — no "Moderate"
  const stress_level = bothHigh ? 'High' : oneHigh ? 'Elevated' : 'Calm';

  const drivers = [];
  if (physiological_strain === 'high') {
    drivers.push('Sleep below baseline');
    drivers.push('HRV below 7-day average');
  }
  if (schedule_load === 'high') drivers.push('High-stakes event on schedule');
  if (drivers.length === 0) drivers.push('Recovery signals within normal range');

  const firstSlot = schedule.free_slots?.[0];
  const slotTime = firstSlot ? `${formatSlotTime(firstSlot.start)}–${formatSlotTime(firstSlot.end)}` : null;

  const action_recommendation = slotTime
    ? `Use your ${slotTime} gap for a 20-minute walk — it's your best window to lower cortisol before the evening.`
    : 'Take a short break when you can to help your nervous system recover.';

  const summary = stress_level === 'Elevated'
    ? `Your recovery signals are below baseline and your schedule is demanding — your nervous system is already under load. Protect your free time today, ${name}.`
    : `Your recovery signals look stable today, ${name}. Stay consistent and you should handle the day well.`;

  return { stress_level, drivers, action_recommendation, summary };
}

// ── Claude API call ───────────────────────────────────────────────────────────

/**
 * Makes a single call to the Claude API with the given prompt.
 * Returns the parsed assessment on success, or null on any failure.
 *
 * @param {string} userPrompt
 * @returns {Promise<object|null>}
 */
async function callClaude(userPrompt) {
  try {
    const response = await axios.post(
      CLAUDE_API_URL,
      {
        model: CLAUDE_MODEL,
        max_tokens: MAX_TOKENS,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }],
      },
      {
        headers: {
          'x-api-key': config.anthropic.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        timeout: TIMEOUT_MS,
      }
    );

    const text = response.data?.content?.[0]?.text;
    if (!text) {
      console.warn('[llmClient] Claude returned an empty content array.');
      return null;
    }

    return parseResponse(text);
  } catch (err) {
    const status = err.response?.status;
    const message = err.message ?? 'Unknown error';
    console.warn(`[llmClient] Claude API call failed — status: ${status ?? 'N/A'}, message: ${message}`);
    return null;
  }
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Assesses the user's predicted stress load for the day.
 *
 * Flow:
 *   1. If mockMode is enabled, return the fixture immediately.
 *   2. Build the prompt from the payload.
 *   3. Call Claude. If the response is valid JSON → return it with llm_source: "live".
 *   4. If parse fails → retry once with the same prompt.
 *   5. If retry also fails, or Claude errors/times out → use deterministic fallback.
 *
 * Never throws — always returns a complete assessment object.
 *
 * @param {object} payload
 * @param {string} payload.name
 * @param {object} payload.biometrics
 * @param {object} payload.baselines
 * @param {object} payload.signals
 * @param {object} payload.schedule
 * @returns {Promise<{ stress_level: string, drivers: string[], action_recommendation: string, summary: string, llm_source: "live"|"fallback" }>}
 */
async function assess(payload) {
  const { name, signals = {}, schedule = {} } = payload;

  // ── Mock mode: return fixture immediately ──────────────────────────────────
  if (config.mockMode) {
    console.log('[llmClient] Mock mode enabled — returning fixture response.');
    return { ...getLlmResponseFixture(), llm_source: 'fallback' };
  }

  // ── Build prompt ───────────────────────────────────────────────────────────
  let userPrompt;
  try {
    userPrompt = buildPrompt(payload);
  } catch (err) {
    console.error('[llmClient] Failed to build prompt:', err.message);
    return { ...deterministicAssessment(signals, schedule, name), llm_source: 'fallback' };
  }

  console.log('[llmClient] Calling Claude API…');

  // ── First attempt ──────────────────────────────────────────────────────────
  const firstResult = await callClaude(userPrompt);
  if (firstResult) {
    console.log(`[llmClient] Claude responded successfully — stress_level: ${firstResult.stress_level}`);
    return { ...firstResult, llm_source: 'live' };
  }

  // ── Retry once ─────────────────────────────────────────────────────────────
  console.warn('[llmClient] First attempt failed or returned invalid JSON — retrying once…');
  const retryResult = await callClaude(userPrompt);
  if (retryResult) {
    console.log(`[llmClient] Retry succeeded — stress_level: ${retryResult.stress_level}`);
    return { ...retryResult, llm_source: 'live' };
  }

  // ── Deterministic fallback ─────────────────────────────────────────────────
  console.warn('[llmClient] Both attempts failed — using deterministic fallback.');
  const fallback = deterministicAssessment(signals, schedule, name);
  console.log(`[llmClient] Fallback assessment — stress_level: ${fallback.stress_level}`);
  return { ...fallback, llm_source: 'fallback' };
}

module.exports = { assess };
