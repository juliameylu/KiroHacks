/**
 * config.js — Loads and validates all environment variables at startup.
 *
 * Required vars (hard fail if missing, unless MOCK_MODE=true):
 *   OURA_PAT, GOOGLE_ACCESS_TOKEN, GOOGLE_REFRESH_TOKEN, ANTHROPIC_API_KEY
 *
 * Optional vars (warn but don't fail):
 *   TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER, USER_PHONE
 *
 * Defaults:
 *   USER_NAME=Alex, PORT=3001,
 *   FRONTEND_ORIGIN=http://localhost:5173,
 *   APP_TIMEZONE=America/Los_Angeles,
 *   GOOGLE_CALENDAR_ID=primary
 */

require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });

// ── Required variables ────────────────────────────────────────────────────────

const REQUIRED_VARS = [
  'OURA_PAT',
  'GOOGLE_ACCESS_TOKEN',
  'GOOGLE_REFRESH_TOKEN',
  'ANTHROPIC_API_KEY',
];

const isMockMode = process.env.MOCK_MODE === 'true';
const missing = REQUIRED_VARS.filter((v) => !process.env[v]);
if (missing.length > 0 && !isMockMode) {
  throw new Error(
    `[config] Missing required environment variables: ${missing.join(', ')}\n` +
      'Copy .env.example to .env and fill in the required values.'
  );
} else if (missing.length > 0 && isMockMode) {
  console.warn(`[config] Mock mode — skipping missing vars: ${missing.join(', ')}`);
}

// ── Optional variables (warn if absent) ──────────────────────────────────────

const OPTIONAL_VARS = [
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_FROM_NUMBER',
  'USER_PHONE',
];

const missingOptional = OPTIONAL_VARS.filter((v) => !process.env[v]);
if (missingOptional.length > 0) {
  console.warn(
    `[config] Optional environment variables not set: ${missingOptional.join(', ')}`
  );
}

// ── In-memory Google token store (updated on OAuth refresh) ──────────────────

let googleTokens = {
  accessToken: process.env.GOOGLE_ACCESS_TOKEN,
  refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
};

// ── Google token refresh helper ───────────────────────────────────────────────

/**
 * Updates the in-memory Google tokens after a successful OAuth refresh.
 * Called by calendarClient.js when a 401 triggers a token refresh.
 *
 * @param {{ accessToken: string, refreshToken?: string }} tokens
 */
function refreshGoogleToken({ accessToken, refreshToken }) {
  googleTokens.accessToken = accessToken;
  if (refreshToken) googleTokens.refreshToken = refreshToken;
  console.log('[config] Google tokens updated in memory.');
}

// ── Twilio availability flag ──────────────────────────────────────────────────

const twilioEnabled = Boolean(
  process.env.TWILIO_ACCOUNT_SID &&
    process.env.TWILIO_AUTH_TOKEN &&
    process.env.TWILIO_FROM_NUMBER
);

if (!twilioEnabled) {
  console.warn('[config] Twilio credentials incomplete — SMS sending disabled.');
}

// ── Exported config object ────────────────────────────────────────────────────

const config = {
  port: parseInt(process.env.PORT ?? '3001', 10),
  userName: process.env.USER_NAME ?? 'Alex',
  userPhone: process.env.USER_PHONE ?? null,

  // Oura: Personal Access Token only — no OAuth, no refresh needed
  oura: {
    pat: process.env.OURA_PAT ?? null,
  },

  google: {
    get accessToken() {
      return googleTokens.accessToken;
    },
    get refreshToken() {
      return googleTokens.refreshToken;
    },
    clientId: process.env.GOOGLE_CLIENT_ID ?? null,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? null,
    calendarId: process.env.GOOGLE_CALENDAR_ID ?? 'primary',
  },

  anthropic: {
    apiKey: process.env.ANTHROPIC_API_KEY,
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID ?? null,
    authToken: process.env.TWILIO_AUTH_TOKEN ?? null,
    fromNumber: process.env.TWILIO_FROM_NUMBER ?? null,
    enabled: twilioEnabled,
  },

  app: {
    timezone: process.env.APP_TIMEZONE ?? 'America/Los_Angeles',
    frontendOrigin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:5173',
  },

  mockMode: process.env.MOCK_MODE === 'true',
};

module.exports = { ...config, refreshGoogleToken };
