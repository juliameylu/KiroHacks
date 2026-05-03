/**
 * pipeline.js — Orchestrates the full Reflect data pipeline.
 *
 * Steps:
 *   1. Fetch Oura biometrics (with fallback to fixture)
 *   2. Fetch Google Calendar events (with fallback to fixture)
 *   3. Compute 7-day baselines from Oura history
 *   4. Derive physiological_strain and schedule_load signals
 *   5. Call LLM for stress assessment (with deterministic fallback)
 *   6. Assemble the full API response object
 *   7. Write to cache
 *   8. Return the result
 *
 * The pipeline never throws. If a fresh run fails entirely, the last
 * successful cached result is preserved.
 *
 * Exports:
 *   runPipeline() → Promise<AssessmentResponse>
 */

'use strict';

const config = require('./config');
const cache = require('./cache');
const ouraClient = require('./modules/ouraClient');
const calendarClient = require('./modules/calendarClient');
const { deriveSignals } = require('./modules/signals');
const { assess } = require('./modules/llmClient');

// ── Baseline computation ──────────────────────────────────────────────────────

// Static defaults used when fewer than 7 days of history are available.
const STATIC_DEFAULTS = {
  sleep_baseline_hours: 7.5,
  hrv_7d_avg: 50,
  resting_hr_7d_avg: 60,
};

/**
 * Computes rolling 7-day averages from Oura history.
 * Falls back to static defaults if history is missing or too short.
 *
 * @param {Array<{ date, sleep_hours, hrv_ms, resting_hr_bpm }>} history
 * @returns {{ sleep_baseline_hours, hrv_7d_avg, resting_hr_7d_avg, approximated }}
 */
function computeBaselines(history) {
  if (!history || history.length < 3) {
    console.warn('[pipeline] Insufficient history — using static baseline defaults.');
    return { ...STATIC_DEFAULTS, approximated: true };
  }

  const validSleep = history.filter((d) => d.sleep_hours != null);
  const validHrv = history.filter((d) => d.hrv_ms != null);
  const validHr = history.filter((d) => d.resting_hr_bpm != null);

  const avg = (arr, key) =>
    arr.length > 0
      ? Math.round((arr.reduce((sum, d) => sum + d[key], 0) / arr.length) * 100) / 100
      : null;

  const sleep_baseline_hours = avg(validSleep, 'sleep_hours') ?? STATIC_DEFAULTS.sleep_baseline_hours;
  const hrv_7d_avg = avg(validHrv, 'hrv_ms') ?? STATIC_DEFAULTS.hrv_7d_avg;
  const resting_hr_7d_avg = avg(validHr, 'resting_hr_bpm') ?? STATIC_DEFAULTS.resting_hr_7d_avg;

  return {
    sleep_baseline_hours,
    hrv_7d_avg,
    resting_hr_7d_avg,
    approximated: history.length < 7,
  };
}

// ── Response assembler ────────────────────────────────────────────────────────

/**
 * Assembles the full API response object from pipeline components.
 *
 * @param {object} biometrics
 * @param {object} schedule
 * @param {object} baselines
 * @param {object} assessment
 * @param {boolean} stale
 * @returns {object} Full assessment response matching the API contract
 */
function assembleResponse(biometrics, schedule, baselines, assessment, stale = false) {
  return {
    stress_level: assessment.stress_level,
    drivers: assessment.drivers,
    action_recommendation: assessment.action_recommendation,
    summary: assessment.summary,
    biometrics: {
      sleep_hours: biometrics.sleep_hours ?? null,
      sleep_baseline_hours: baselines.sleep_baseline_hours,
      hrv_ms: biometrics.hrv_ms ?? null,
      hrv_7d_avg: baselines.hrv_7d_avg,
      resting_hr_bpm: biometrics.resting_hr_bpm ?? null,
      resting_hr_7d_avg: baselines.resting_hr_7d_avg,
      breathing_rate: biometrics.breathing_rate ?? null,
      temperature_deviation_c: biometrics.temperature_deviation_c ?? null,
      readiness_score: biometrics.readiness_score ?? null,
    },
    schedule: {
      events: schedule.events ?? [],
      event_count: schedule.event_count ?? 0,
      free_slots: schedule.free_slots ?? [],
      highlighted_slot: schedule.highlighted_slot ?? null,
    },
    stale,
    last_updated: new Date().toISOString(),
  };
}

// ── Main pipeline ─────────────────────────────────────────────────────────────

/**
 * Runs the full Reflect data pipeline.
 *
 * Graceful degradation:
 *   - Oura failure → uses fixture biometrics, continues
 *   - Calendar failure → uses fixture schedule, continues
 *   - LLM failure → uses deterministic fallback, continues
 *   - Total failure → returns last cached result with stale: true
 *
 * Never throws.
 *
 * @returns {Promise<object>} Full assessment response
 */
async function runPipeline() {
  console.log('[pipeline] Starting pipeline run…');

  try {
    // ── Step 1: Fetch Oura biometrics ────────────────────────────────────────
    console.log('[pipeline] Step 1: Fetching Oura biometrics…');
    const biometrics = await ouraClient.fetchToday();
    console.log(`[pipeline] Oura data source: ${biometrics.source}`);

    // ── Step 2: Fetch calendar events ────────────────────────────────────────
    console.log('[pipeline] Step 2: Fetching calendar events…');
    const schedule = await calendarClient.fetchToday();
    console.log(`[pipeline] Calendar data source: ${schedule.source}, events: ${schedule.event_count}`);

    // ── Step 3: Compute baselines ─────────────────────────────────────────────
    console.log('[pipeline] Step 3: Computing baselines…');
    // In mock mode, use the baseline fixture directly so demo numbers are exact.
    const baselines = config.mockMode
      ? (() => { const b = require('./fixtures').getBaselineFixture(); console.log('[pipeline] Mock mode — using baseline fixture.'); return b; })()
      : computeBaselines(biometrics.history);
    console.log(`[pipeline] Baselines — sleep: ${baselines.sleep_baseline_hours}h, HRV: ${baselines.hrv_7d_avg}ms, HR: ${baselines.resting_hr_7d_avg}bpm`);

    // ── Step 4: Derive signals ────────────────────────────────────────────────
    console.log('[pipeline] Step 4: Deriving signals…');
    const signals = deriveSignals(biometrics, schedule, baselines);
    console.log(`[pipeline] Signals — physiological_strain: ${signals.physiological_strain}, schedule_load: ${signals.schedule_load}`);

    // ── Step 5: LLM assessment ────────────────────────────────────────────────
    console.log('[pipeline] Step 5: Running LLM assessment…');
    const assessment = await assess({
      name: config.userName,
      biometrics,
      baselines,
      signals,
      schedule,
    });
    console.log(`[pipeline] Assessment — stress_level: ${assessment.stress_level}, llm_source: ${assessment.llm_source}`);

    // ── Step 6: Assemble response ─────────────────────────────────────────────
    const stale = biometrics.source !== 'live' && schedule.source !== 'live';
    const result = assembleResponse(biometrics, schedule, baselines, assessment, stale);

    // ── Step 7: Cache result ──────────────────────────────────────────────────
    cache.set(result);
    console.log('[pipeline] Result cached successfully.');

    console.log('[pipeline] Pipeline run complete.');
    return result;

  } catch (err) {
    console.error('[pipeline] Unexpected pipeline error:', err.message);

    // Return last cached result if available, marked as stale
    const cached = cache.get();
    if (cached) {
      console.warn('[pipeline] Returning last cached result with stale: true');
      return { ...cached, stale: true };
    }

    // No cache — throw so the route handler can return a proper 503
    throw new Error(`Pipeline failed and no cached data available: ${err.message}`);
  }
}

module.exports = { runPipeline };
