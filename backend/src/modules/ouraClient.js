/**
 * ouraClient.js — Fetches today's biometric data from the Oura Ring v2 REST API.
 *
 * Authentication: Personal Access Token (PAT) via OURA_PAT env var.
 * PATs are long-lived and never expire unless revoked — no OAuth refresh needed.
 *
 * Endpoints used:
 *   - GET /v2/usercollection/daily_sleep      (today + 7-day history)
 *   - GET /v2/usercollection/daily_readiness  (today)
 *   - GET /v2/usercollection/heartrate        (today + 7-day history)
 *   - GET /v2/usercollection/daily_hrv        (today + 7-day history)
 *
 * Fallback: if mockMode is enabled or any API call fails, returns fixture
 *   data from fixtures/oura.json with source: "mock".
 *
 * Exports: { fetchToday }
 */

'use strict';

const axios = require('axios');
const config = require('../config');
const { getOuraFixture } = require('../fixtures/index');

const BASE_URL = 'https://api.ouraring.com/v2/usercollection';
const TIMEOUT_MS = 10_000;

// ── Date helpers ──────────────────────────────────────────────────────────────

/**
 * Returns today's date as "YYYY-MM-DD".
 */
function today() {
  return new Date().toISOString().slice(0, 10);
}

/**
 * Returns the date N days before today as "YYYY-MM-DD".
 * @param {number} n
 */
function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
}

// ── HTTP helper ───────────────────────────────────────────────────────────────

/**
 * Makes a GET request to an Oura API endpoint using the PAT.
 *
 * @param {string} url
 * @param {Record<string, string>} params
 * @returns {Promise<any>} parsed response data
 */
async function ouraGet(url, params) {
  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${config.oura.pat}` },
    params,
    timeout: TIMEOUT_MS,
  });
  return response.data;
}

// ── Individual endpoint fetchers ──────────────────────────────────────────────

/**
 * Fetches daily sleep data for a date range.
 *
 * @param {string} startDate "YYYY-MM-DD"
 * @param {string} endDate   "YYYY-MM-DD"
 * @returns {Promise<Array>}
 */
async function fetchSleep(startDate, endDate) {
  const data = await ouraGet(`${BASE_URL}/daily_sleep`, {
    start_date: startDate,
    end_date: endDate,
  });
  return data.data ?? [];
}

/**
 * Fetches daily readiness data for a date range.
 *
 * @param {string} startDate "YYYY-MM-DD"
 * @param {string} endDate   "YYYY-MM-DD"
 * @returns {Promise<Array>}
 */
async function fetchReadiness(startDate, endDate) {
  const data = await ouraGet(`${BASE_URL}/daily_readiness`, {
    start_date: startDate,
    end_date: endDate,
  });
  return data.data ?? [];
}

/**
 * Fetches heart rate data for a full day (minute-level).
 *
 * @param {string} startDate "YYYY-MM-DD"
 * @param {string} endDate   "YYYY-MM-DD"
 * @returns {Promise<Array>}
 */
async function fetchHeartRate(startDate, endDate) {
  const data = await ouraGet(`${BASE_URL}/heartrate`, {
    start_datetime: `${startDate}T00:00:00`,
    end_datetime: `${endDate}T23:59:59`,
  });
  return data.data ?? [];
}

/**
 * Fetches daily HRV data for a date range.
 *
 * @param {string} startDate "YYYY-MM-DD"
 * @param {string} endDate   "YYYY-MM-DD"
 * @returns {Promise<Array>}
 */
async function fetchHrv(startDate, endDate) {
  const data = await ouraGet(`${BASE_URL}/daily_hrv`, {
    start_date: startDate,
    end_date: endDate,
  });
  return data.data ?? [];
}

// ── Resting HR extraction ─────────────────────────────────────────────────────

/**
 * Derives resting heart rate from a list of heart rate samples.
 * Prefers samples with source === "resting"; falls back to the minimum bpm.
 *
 * @param {Array<{ bpm: number, source: string }>} samples
 * @returns {number|null}
 */
function extractRestingHr(samples) {
  if (!samples || samples.length === 0) return null;

  const restingSamples = samples.filter((s) => s.source === 'resting');
  if (restingSamples.length > 0) {
    const avg = restingSamples.reduce((sum, s) => sum + s.bpm, 0) / restingSamples.length;
    return Math.round(avg);
  }

  return Math.min(...samples.map((s) => s.bpm));
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Fetches today's biometric data from the Oura Ring API and normalises it
 * into the shape expected by the pipeline.
 *
 * Falls back to fixture data if:
 *   - config.mockMode is true
 *   - Any API call fails (network error, timeout, 4xx/5xx)
 *
 * @returns {Promise<{
 *   sleep_hours: number,
 *   hrv_ms: number,
 *   resting_hr_bpm: number,
 *   breathing_rate: number|null,
 *   temperature_deviation_c: number|null,
 *   readiness_score: number|null,
 *   history: Array<{ date: string, sleep_hours: number, hrv_ms: number, resting_hr_bpm: number }>,
 *   source: "live"|"mock"
 * }>}
 */
async function fetchToday() {
  // ── Mock mode: skip API entirely ──────────────────────────────────────────
  if (config.mockMode) {
    console.log('[ouraClient] mockMode enabled — returning fixture data.');
    const fixture = getOuraFixture();
    return { ...fixture.today, history: fixture.history, source: 'mock' };
  }

  const todayDate = today();
  const weekAgoDate = daysAgo(6); // 7-day window: 6 days ago → today (inclusive)

  try {
    // ── Fetch all endpoints in parallel ────────────────────────────────────
    const [sleepHistory, readinessToday, hrHistory, hrvHistory] = await Promise.all([
      fetchSleep(weekAgoDate, todayDate),
      fetchReadiness(todayDate, todayDate),
      fetchHeartRate(weekAgoDate, todayDate),
      fetchHrv(weekAgoDate, todayDate),
    ]);

    // ── Today's sleep ───────────────────────────────────────────────────────
    const todaySleepRecord = sleepHistory.find((r) => r.day === todayDate);
    const sleep_hours = todaySleepRecord
      ? Math.round((todaySleepRecord.total_sleep_duration / 3600) * 100) / 100
      : null;

    // ── Today's readiness ───────────────────────────────────────────────────
    const todayReadiness = readinessToday[0] ?? null;
    const readiness_score = todayReadiness?.score ?? null;
    const temperature_deviation_c = todayReadiness?.temperature_deviation ?? null;
    const breathing_rate = todayReadiness?.breathing_rate ?? null;

    // ── Today's HRV ─────────────────────────────────────────────────────────
    const todayHrvRecord = hrvHistory.find((r) => r.day === todayDate);
    const hrv_ms = todayHrvRecord?.average_hrv ?? null;

    // ── Today's resting HR ──────────────────────────────────────────────────
    const todayHrSamples = hrHistory.filter((s) =>
      s.timestamp && s.timestamp.startsWith(todayDate)
    );
    const resting_hr_bpm = extractRestingHr(todayHrSamples);

    // ── 7-day history ───────────────────────────────────────────────────────
    const history = sleepHistory.map((sleepRecord) => {
      const date = sleepRecord.day;

      const hrvRecord = hrvHistory.find((r) => r.day === date);
      const hrv_ms_day = hrvRecord?.average_hrv ?? null;

      const daySamples = hrHistory.filter((s) =>
        s.timestamp && s.timestamp.startsWith(date)
      );
      const resting_hr_day = extractRestingHr(daySamples);

      return {
        date,
        sleep_hours: Math.round((sleepRecord.total_sleep_duration / 3600) * 100) / 100,
        hrv_ms: hrv_ms_day,
        resting_hr_bpm: resting_hr_day,
      };
    });

    return {
      sleep_hours,
      hrv_ms,
      resting_hr_bpm,
      breathing_rate,
      temperature_deviation_c,
      readiness_score,
      history,
      source: 'live',
    };
  } catch (err) {
    console.warn('[ouraClient] API fetch failed — falling back to fixture data.', err.message);
    const fixture = getOuraFixture();
    return { ...fixture.today, history: fixture.history, source: 'mock' };
  }
}

module.exports = { fetchToday };
