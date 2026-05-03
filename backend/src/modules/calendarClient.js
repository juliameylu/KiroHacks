/**
 * calendarClient.js — Fetches today's events from the Google Calendar API.
 *
 * Endpoint used:
 *   GET https://www.googleapis.com/calendar/v3/calendars/{calendarId}/events
 *
 * Fetches all events for the current calendar day (timeMin/timeMax = start/end
 * of today in local time), then computes free slots (gaps ≥ 30 minutes between
 * events).
 *
 * Token refresh: on HTTP 401, refreshes the OAuth token via
 *   POST https://oauth2.googleapis.com/token and retries once.
 *
 * Fallback: if mockMode is enabled or any API call fails, returns fixture
 *   data from fixtures/calendar.json with source: "mock".
 *
 * Exports: { fetchToday }
 */

'use strict';

const axios = require('axios');
const config = require('../config');
const { getCalendarFixture } = require('../fixtures/index');

const CALENDAR_BASE_URL = 'https://www.googleapis.com/calendar/v3/calendars';
const TOKEN_URL = 'https://oauth2.googleapis.com/token';
const TIMEOUT_MS = 10_000;
const FREE_SLOT_MIN_MINUTES = 30;

// ── Date helpers ──────────────────────────────────────────────────────────────

function toLocalISOString(date) {
  const offsetMinutes = date.getTimezoneOffset();
  const sign = offsetMinutes <= 0 ? '+' : '-';
  const absOffset = Math.abs(offsetMinutes);
  const hh = String(Math.floor(absOffset / 60)).padStart(2, '0');
  const mm = String(absOffset % 60).padStart(2, '0');
  const pad = (n) => String(n).padStart(2, '0');
  const yyyy = date.getFullYear();
  const mo = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hr = pad(date.getHours());
  const min = pad(date.getMinutes());
  const sec = pad(date.getSeconds());
  return `${yyyy}-${mo}-${dd}T${hr}:${min}:${sec}${sign}${hh}:${mm}`;
}

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return toLocalISOString(d);
}

function endOfToday() {
  const d = new Date();
  d.setHours(23, 59, 59, 999);
  return toLocalISOString(d);
}

// ── Token refresh ─────────────────────────────────────────────────────────────

async function refreshToken() {
  try {
    const body = new URLSearchParams({ grant_type: 'refresh_token', refresh_token: config.google.refreshToken });
    if (config.google.clientId) body.append('client_id', config.google.clientId);
    if (config.google.clientSecret) body.append('client_secret', config.google.clientSecret);

    const response = await axios.post(TOKEN_URL, body.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      timeout: TIMEOUT_MS,
    });

    const { access_token, refresh_token } = response.data;
    config.refreshGoogleToken({ accessToken: access_token, refreshToken: refresh_token });
    console.log('[calendarClient] Token refreshed successfully.');
    return true;
  } catch (err) {
    console.warn('[calendarClient] Token refresh failed:', err.message);
    return false;
  }
}

// ── API fetch ─────────────────────────────────────────────────────────────────

async function fetchCalendarEvents() {
  const calendarId = encodeURIComponent(config.google.calendarId);
  const url = `${CALENDAR_BASE_URL}/${calendarId}/events`;

  const response = await axios.get(url, {
    headers: { Authorization: `Bearer ${config.google.accessToken}` },
    params: { timeMin: startOfToday(), timeMax: endOfToday(), singleEvents: 'true', orderBy: 'startTime' },
    timeout: TIMEOUT_MS,
  });

  return response.data.items ?? [];
}

async function fetchCalendarEventsWithRefresh() {
  try {
    return await fetchCalendarEvents();
  } catch (err) {
    if (err.response?.status === 401) {
      console.warn('[calendarClient] 401 received — attempting token refresh...');
      const refreshed = await refreshToken();
      if (refreshed) return await fetchCalendarEvents();
    }
    throw err;
  }
}

// ── Normalisation ─────────────────────────────────────────────────────────────

function normaliseEvent(item) {
  return {
    title: item.summary ?? '(No title)',
    start: item.start?.dateTime ?? item.start?.date ?? '',
    end: item.end?.dateTime ?? item.end?.date ?? '',
  };
}

// ── Free slot computation ─────────────────────────────────────────────────────

function computeFreeSlots(events) {
  const freeSlots = [];
  const now = new Date();
  const minGapMs = FREE_SLOT_MIN_MINUTES * 60 * 1000;

  if (events.length === 0) return freeSlots;

  const sorted = [...events].sort((a, b) => new Date(a.start) - new Date(b.start));

  // Gap from now to first event
  const firstStart = new Date(sorted[0].start);
  if (firstStart - now >= minGapMs) {
    freeSlots.push({ start: toLocalISOString(now), end: sorted[0].start });
  }

  // Gaps between consecutive events
  for (let i = 0; i < sorted.length - 1; i++) {
    const gapStart = new Date(sorted[i].end);
    const gapEnd = new Date(sorted[i + 1].start);
    if (gapEnd - gapStart >= minGapMs) {
      freeSlots.push({ start: sorted[i].end, end: sorted[i + 1].start });
    }
  }

  return freeSlots;
}

// ── Fixture fallback ──────────────────────────────────────────────────────────

function buildFixtureResult() {
  const fixture = getCalendarFixture();
  const events = fixture.events ?? [];
  const free_slots = fixture.free_slots ?? [];
  return { events, event_count: events.length, free_slots, highlighted_slot: fixture.highlighted_slot ?? free_slots[0] ?? null, source: 'mock' };
}

// ── Main export ───────────────────────────────────────────────────────────────

/**
 * Fetches today's calendar events and returns a normalised schedule object.
 * Falls back to fixture data on any failure.
 *
 * @returns {Promise<{ events, event_count, free_slots, highlighted_slot, source }>}
 */
async function fetchToday() {
  if (config.mockMode) {
    console.log('[calendarClient] mockMode enabled — returning fixture data.');
    return buildFixtureResult();
  }

  try {
    const rawItems = await fetchCalendarEventsWithRefresh();
    const events = rawItems.map(normaliseEvent);
    const free_slots = computeFreeSlots(events);
    return { events, event_count: events.length, free_slots, highlighted_slot: free_slots[0] ?? null, source: 'live' };
  } catch (err) {
    console.warn('[calendarClient] API fetch failed — falling back to fixture data.', err.message);
    return buildFixtureResult();
  }
}

module.exports = { fetchToday };
