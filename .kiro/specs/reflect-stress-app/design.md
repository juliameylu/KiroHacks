# Design Document

## Overview

Reflect is a single-user demo app. The Backend runs a data pipeline once each morning (and on demand), caches the result, and serves it to the Frontend via a small REST API. The Frontend is a single-page React app that loads the cached result and renders a stress dashboard. There is no login, no session management, and no client-side token storage.

---

## 1. Backend Architecture

### Module Responsibilities

```
backend/
├── index.js              # Express app entry point, route registration, scheduler
├── config.js             # Loads and validates all env vars at startup
├── pipeline.js           # Orchestrates the full pipeline: Oura → Calendar → Signals → LLM → Cache
├── modules/
│   ├── ouraClient.js     # Oura Ring REST API calls + token refresh
│   ├── calendarClient.js # Google Calendar API calls + token refresh
│   ├── llmClient.js      # Claude API prompt construction + response parsing
│   ├── smsClient.js      # Twilio SMS sending
│   └── signals.js        # Derives physiological_strain and schedule_load
├── cache.js              # In-memory + file-backed cache (cache.json)
└── routes/
    ├── assessment.js     # GET /api/assessment
    ├── refresh.js        # POST /api/refresh
    ├── sendSms.js        # POST /api/send-sms
    └── status.js         # GET /api/status
```

**config.js** — reads from `process.env` at startup. Required vars: `OURA_ACCESS_TOKEN`, `OURA_REFRESH_TOKEN`, `GOOGLE_ACCESS_TOKEN`, `GOOGLE_REFRESH_TOKEN`, `USER_NAME` (default "Alex"), `USER_PHONE`, `ANTHROPIC_API_KEY`, `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER`. Throws on missing required vars so the server fails fast.

**cache.js** — exports `get()`, `set(data)`, `isWarm()`. On `set`, writes to `cache.json` synchronously. On startup, reads `cache.json` if it exists to pre-warm the in-memory cache.

**pipeline.js** — the core orchestration function `runPipeline()`:
1. Fetch Oura biometrics (with fallback to cache)
2. Fetch Google Calendar events (with fallback to cache)
3. Compute baselines (7-day rolling averages)
4. Derive `physiological_strain` and `schedule_load` signals
5. Call LLM (with deterministic fallback)
6. Assemble the full response object
7. Write to cache
8. Return the result

---

## 2. API Route Definitions

### GET /api/assessment

Returns the cached assessment. Does not trigger the pipeline.

**Response 200:**
```typescript
{
  stress_level: "High load" | "Steady load" | "Low load";
  drivers: string[];
  action_recommendation: string;
  summary: string;
  biometrics: {
    sleep_hours: number;
    sleep_baseline_hours: number;
    hrv_ms: number;
    hrv_7d_avg: number;
    resting_hr_bpm: number;
    resting_hr_7d_avg: number;
    breathing_rate: number;
    temperature_deviation_c: number;
    readiness_score: number;
  };
  schedule: {
    events: { start: string; end: string; title: string }[];
    event_count: number;
    free_slots: { start: string; end: string }[];
    highlighted_slot: { start: string; end: string } | null;
  };
  stale: boolean;
  last_updated: string; // ISO 8601
}
```

**Response 503:**
```json
{ "error": "No assessment data available. Run /api/refresh to generate one." }
```

---

### POST /api/refresh

Re-runs the full pipeline and updates the cache.

**Response 200:** Same shape as `GET /api/assessment`.

**Response 503:**
```json
{ "error": "Pipeline failed: <reason>", "partial": { ... } }
```

---

### POST /api/send-sms

Sends an SMS immediately using the latest cached result.

**Response 200:**
```json
{ "ok": true, "to": "+1234567890" }
```

**Response 503:**
```json
{ "error": "No cached data to send." }
```

**Response 502:**
```json
{ "error": "Twilio error: <message>" }
```

---

### GET /api/status

Returns pipeline and service health info.

**Response 200:**
```json
{
  "last_run": "2024-01-15T07:30:00Z",
  "cache_status": "warm",
  "services": {
    "oura": true,
    "google": true,
    "llm": true,
    "sms": true
  }
}
```

`last_run` is `null` if the pipeline has never run. `cache_status` is `"warm"` or `"empty"`. Service flags reflect the last known reachability of each service.

---

## 3. LLM Prompt Template

The prompt is constructed in `llmClient.js` using the assembled data. The system prompt constrains output format strictly.

### System Prompt

```
You are a wellness assistant that helps users understand their predicted stress load for the day based on recovery signals and schedule. You do NOT diagnose stress medically. You use language like "predicted stress load" and "based on recovery signals and schedule".

You MUST respond with valid JSON only — no markdown, no explanation, no extra text. The JSON must match this exact schema:
{
  "stress_level": "High load" | "Steady load" | "Low load",
  "drivers": [<array of 2-4 short strings naming contributing factors>],
  "action_recommendation": "<one specific, actionable suggestion — if a free slot exists, reference it by time>",
  "summary": "<1-2 sentences in plain language, personalised to the user's name, describing their predicted stress load>"
}
```

### User Prompt Template

```
User: {{name}}
Date: {{date}}

BIOMETRIC SIGNALS (today vs baseline):
- Sleep: {{sleep_hours}}h (baseline: {{sleep_baseline_hours}}h)
- HRV: {{hrv_ms}}ms (7-day avg: {{hrv_7d_avg}}ms)
- Resting HR: {{resting_hr_bpm}}bpm (7-day avg: {{resting_hr_7d_avg}}bpm)
- Breathing rate: {{breathing_rate}} breaths/min
- Temperature deviation: {{temperature_deviation_c}}°C
- Readiness score: {{readiness_score}}/100

DERIVED SIGNALS:
- Physiological strain: {{physiological_strain}} (high = sleep below baseline AND HRV below avg AND HR above avg)
- Schedule load: {{schedule_load}} (high = ≥5 events OR important keywords detected)

TODAY'S SCHEDULE ({{event_count}} events):
{{#each events}}
- {{start}}–{{end}}: {{title}}
{{/each}}

FREE SLOTS (≥30 min):
{{#each free_slots}}
- {{start}}–{{end}}
{{/each}}

Based on these signals, assess {{name}}'s predicted stress load for today. If a free slot exists, the action_recommendation MUST reference a specific time from the free slots list.
```

---

## 4. Data Pipeline Flow

```
runPipeline()
│
├─ 1. ouraClient.fetchToday()
│     ├─ GET /v2/usercollection/daily_sleep
│     ├─ GET /v2/usercollection/daily_readiness
│     ├─ GET /v2/usercollection/daily_hrv (7-day window for baselines)
│     ├─ On 401: refresh token → retry once
│     └─ On error/timeout: return cache.get().biometrics (or null)
│
├─ 2. calendarClient.fetchToday()
│     ├─ GET /calendar/v3/calendars/primary/events (today, timeMin/timeMax)
│     ├─ Compute free_slots (gaps ≥30 min between events)
│     ├─ On 401: refresh token → retry once
│     └─ On error/timeout: return cache.get().schedule (or empty)
│
├─ 3. computeBaselines(ouraHistory)
│     ├─ sleep_baseline_hours = avg(last 7 days sleep_hours)
│     ├─ hrv_7d_avg = avg(last 7 days hrv_ms)
│     ├─ resting_hr_7d_avg = avg(last 7 days resting_hr_bpm)
│     └─ Fallback to static defaults if <7 days available
│
├─ 4. signals.derive(biometrics, schedule)
│     ├─ physiological_strain: "high" | "normal"
│     └─ schedule_load: "high" | "normal"
│
├─ 5. llmClient.assess(payload)
│     ├─ Build system + user prompt
│     ├─ POST to Claude API (model: claude-3-5-haiku, max_tokens: 512)
│     ├─ Parse JSON response
│     ├─ On parse failure: retry once
│     └─ On error/timeout/retry failure: deterministic fallback
│
├─ 6. Assemble response object (full schema)
│     └─ Set stale: false, last_updated: now
│
└─ 7. cache.set(result) → writes cache.json
```

### Deterministic Fallback Logic

```javascript
function deterministicAssessment(signals, schedule) {
  const { physiological_strain, schedule_load } = signals;
  const bothHigh = physiological_strain === 'high' && schedule_load === 'high';
  const oneHigh = physiological_strain === 'high' || schedule_load === 'high';

  const stress_level = bothHigh ? 'High load' : oneHigh ? 'Steady load' : 'Low load';

  const drivers = [];
  if (physiological_strain === 'high') drivers.push('Below-baseline recovery signals');
  if (schedule_load === 'high') drivers.push('Dense or high-stakes schedule');

  const firstSlot = schedule.free_slots?.[0];
  const action_recommendation = firstSlot
    ? `Use your ${formatTime(firstSlot.start)} gap for a short reset`
    : 'Take a short break when you can';

  const summary = `Based on your recovery signals and schedule, your predicted stress load today is ${stress_level.toLowerCase()}.`;

  return { stress_level, drivers, action_recommendation, summary };
}
```

---

## 5. Frontend Page / Component Structure

```
src/
├── main.tsx
├── App.tsx                  # Router: loading → dashboard
├── pages/
│   ├── LoadingScreen.tsx    # Animated message sequence
│   └── Dashboard.tsx        # Main stress dashboard
├── components/
│   ├── StressHeader.tsx     # stress_level badge + summary
│   ├── ActionBanner.tsx     # action_recommendation highlight block
│   ├── DriversList.tsx      # drivers array
│   ├── ExpandableCard.tsx   # Reusable collapsible card
│   ├── cards/
│   │   ├── SleepCard.tsx
│   │   ├── HRVCard.tsx
│   │   ├── HeartRateCard.tsx
│   │   ├── TemperatureCard.tsx
│   │   └── ScheduleCard.tsx
│   └── ErrorState.tsx       # Error + Retry button
├── hooks/
│   └── useAssessment.ts     # Fetches GET /api/assessment, manages loading/error state
├── types/
│   └── assessment.ts        # TypeScript types matching the API contract
└── styles/
    └── (component CSS modules or global CSS)
```

### Page Flow

```
App loads
  │
  └─ LoadingScreen
        ├─ Starts message sequence (min 2s)
        ├─ Calls GET /api/assessment in background
        │     ├─ If 503 (no cache): calls POST /api/refresh, then GET /api/assessment
        │     └─ If still error: shows error state with Retry
        └─ On success + min 2s elapsed → navigate to Dashboard
```

### Component Details

**LoadingScreen** — cycles through 4 messages with a 500ms interval. Tracks elapsed time; only navigates away once both the API call resolves AND 2 seconds have passed.

**StressHeader** — renders a coloured badge for stress_level (red = High load, amber = Steady load, green = Low load). Shows `summary` below.

**ActionBanner** — visually emphasised block (distinct background colour) showing `action_recommendation`. This is the primary CTA.

**DriversList** — renders `drivers` as a simple pill/tag list.

**ExpandableCard** — accepts `title`, `summary` (collapsed view), `children` (expanded view), and `isOpen`/`onToggle` props. Multiple cards can be open simultaneously (each manages its own state via `useState`).

**Card field mapping:**

| Card | Collapsed | Expanded |
|------|-----------|----------|
| Sleep | sleep_hours vs sleep_baseline_hours | Comparison + interpretation |
| HRV | hrv_ms vs hrv_7d_avg | Comparison + interpretation |
| Heart Rate | resting_hr_bpm vs resting_hr_7d_avg | Comparison + interpretation |
| Temperature | temperature_deviation_c | Deviation + interpretation |
| Schedule | event_count + highlighted_slot time | events list + free_slots + highlighted_slot |

If any field is `null` or `undefined`, the card renders "Data unavailable" for that field.

**useAssessment hook:**
```typescript
function useAssessment(): {
  data: AssessmentResponse | null;
  loading: boolean;
  error: string | null;
  refetch: () => void;
}
```
Fetches `GET /api/assessment` on mount. If 503, automatically calls `POST /api/refresh` then retries. Exposes `refetch` for the Retry button.

---

## 6. Demo Mode Behaviour Summary

| Concern | Behaviour |
|---------|-----------|
| Auth | None required. All tokens loaded from env vars on Backend at startup. |
| Mock mode | `MOCK_MODE=true` skips all external API calls. Fixture data represents a High load scenario: 5h sleep vs 7.5h baseline, HRV below baseline, HR above baseline, midterm at 11 AM, free slot at 3:30 PM. No real credentials needed. |
| App entry | Loading screen → Dashboard. No login gate. |
| Token refresh | Backend handles silently before any API call that returns 401. |
| Client-side tokens | Never sent to Frontend. Not in any API response. |
| Pipeline trigger | Runs automatically at 07:00 via `node-cron`. Also triggered by `POST /api/refresh`. |
| Cache | In-memory + `cache.json`. Survives server restarts. |
| Oura failure | Falls back to cached biometrics. Pipeline continues. |
| Calendar failure | Falls back to cached schedule. Pipeline continues. |
| LLM failure | Deterministic fallback. Full response object still returned. |
| SMS failure | Logged. Does not affect app display. |
| Empty cache | `GET /api/assessment` returns 503. Frontend auto-triggers `POST /api/refresh`. |
| Stale data | `stale: true` flag in response. Frontend shows "Last updated: [date]". |
| Demo controls | `POST /api/refresh`, `POST /api/send-sms`, `GET /api/status` all available. |

### Environment Variables Reference

```bash
# User
USER_NAME=Alex
USER_PHONE=+1234567890

# Oura
OURA_ACCESS_TOKEN=...
OURA_REFRESH_TOKEN=...

# Google
GOOGLE_ACCESS_TOKEN=...
GOOGLE_REFRESH_TOKEN=...

# LLM
ANTHROPIC_API_KEY=...

# Twilio
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1987654321

# Set to true to use fixture data instead of live APIs (no credentials needed)
MOCK_MODE=true

# Server
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
```

---

## 7. Key Implementation Notes

**Speed over perfection.** For the hackathon, use `node-fetch` or `axios` for HTTP calls, `node-cron` for scheduling, and a plain JSON file for persistence. No database needed.

**Token refresh pattern.** Each client module wraps its API call in a helper that catches 401, calls the OAuth refresh endpoint, updates the in-memory token (and env var or config object), then retries the original request once.

**LLM model choice.** Use `claude-3-5-haiku-20241022` for speed and cost. Set `max_tokens: 512`. The system prompt enforces JSON-only output; parse with `JSON.parse` and catch errors for the retry/fallback path.

**CORS.** Set `Access-Control-Allow-Origin` to `FRONTEND_ORIGIN` env var. Allow `GET, POST` methods and `Content-Type` header.

**No TypeScript on Backend.** Plain JavaScript is faster to write under hackathon conditions. The Frontend uses TypeScript with types defined in `src/types/assessment.ts` matching the API contract exactly.
