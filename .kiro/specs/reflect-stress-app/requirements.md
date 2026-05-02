# Requirements Document

## Introduction

Reflect is a proactive stress management mobile-web app built for a 12-hour hackathon demo. It pulls biometric data from the Oura Ring API and schedule data from Google Calendar each morning, runs LLM reasoning (Claude API) to assess the user's predicted stress load for the day, and proactively delivers a personalised morning message via SMS and in-app. The user opens the app to a single-page dashboard with expandable cards showing the drivers of their predicted stress load and a concrete, time-specific action recommendation.

The demo targets a single preconfigured user ("Alex") and runs in **demo mode**: all credentials are loaded from environment variables on the Backend. No login or OAuth onboarding is required from the user. The Backend is Node.js/Express; the Frontend is React/TypeScript/Vite. Real Oura and Google Calendar APIs are used; the LLM call is real (Claude via OpenClaw account). SMS delivery uses Twilio. Data is cached after each morning fetch so the demo remains stable if APIs are slow.

---

## Glossary

- **App**: The Reflect React/TypeScript/Vite single-page web application.
- **Backend**: The Node.js/Express server that orchestrates API calls, LLM reasoning, caching, and SMS delivery.
- **Oura_Client**: The Backend module responsible for fetching biometric data from the Oura Ring REST API.
- **Calendar_Client**: The Backend module responsible for fetching today's events from the Google Calendar API via OAuth 2.0.
- **LLM_Client**: The Backend module responsible for constructing prompts and calling the Claude API (OpenClaw) to produce stress assessments.
- **SMS_Client**: The Backend module responsible for sending morning messages via the Twilio API.
- **Cache**: An in-memory and file-backed store on the Backend that holds the most recent pipeline result so the App loads instantly during the demo.
- **Stress_Level**: A categorical label — one of "High", "Elevated", or "Calm" — representing the user's predicted stress load for the day, based on recovery signals and schedule. "High" indicates the top tier, "Elevated" the middle tier, and "Calm" the lowest tier.
- **Morning_Message**: A short, proactive notification (SMS + in-app) sent each morning summarising the Stress_Level and one actionable recommendation.
- **Action_Recommendation**: A time-specific suggestion (e.g., "Use your 3:30 pm gap for a short reset") derived from free calendar slots and biometric signals.
- **Expandable_Card**: A tappable UI element on the App's landing page that shows a summary label and expands to reveal detail text.
- **Biometric_Indicators**: The set of Oura Ring data points used for stress assessment: sleep duration, HRV (heart rate variability), resting heart rate, breathing rate, skin temperature deviation, and readiness score.
- **Demo_Mode**: The single-user operating mode in which all credentials are loaded from Backend environment variables; no user-facing login or OAuth flow is required.
- **Pipeline**: The sequential Backend process of fetching Oura biometrics, fetching Google Calendar events, computing derived signals, calling the LLM, and caching the result.
- **Derived_Signals**: Structured physiological and schedule signals computed by the Backend before calling the LLM (see Requirement 5).

---

## Requirements

### Requirement 1: Demo Mode — Single-User Configuration

**User Story:** As a demo presenter, I want the app to work without any login or OAuth onboarding, so that the demo starts instantly and never gets blocked by an auth screen.

#### Acceptance Criteria

1. THE Backend SHALL load the following values from environment variables or a config file at startup: `USER_NAME` (default "Alex"), `USER_PHONE`, `OURA_ACCESS_TOKEN`, `OURA_REFRESH_TOKEN`, `GOOGLE_ACCESS_TOKEN`, `GOOGLE_REFRESH_TOKEN`.
2. THE Backend SHALL support a `MOCK_MODE` environment variable. WHEN `MOCK_MODE=true`, THE Backend SHALL skip all external API calls and serve responses entirely from fixture data, requiring no real credentials.
3. WHEN `MOCK_MODE=true` and `POST /api/refresh` is called, THE Backend SHALL run the full pipeline using fixture data and return a complete assessment response without contacting Oura, Google Calendar, or the LLM.
4. THE default mock fixture SHALL represent an Elevated stress scenario: 5 hours of sleep vs 7.5-hour baseline, HRV below baseline, resting heart rate above baseline, breathing rate slightly elevated, temperature slightly elevated, classes from 9 AM–2 PM, midterm at 11 AM, and a free slot at 3:30 PM.
5. THE Backend SHALL handle token refresh automatically for both Oura and Google OAuth tokens using the stored refresh tokens, without any user interaction (when not in MOCK_MODE).
6. THE App SHALL NOT display a login screen, OAuth consent screen, or account-linking flow as part of the required user journey.
7. WHEN the App loads, THE App SHALL navigate directly from a loading screen to the dashboard without requiring any user authentication action.
8. WHERE an optional onboarding UI exists in the App, THE App SHALL allow it to be bypassed entirely; it MUST be cosmetic only and MUST NOT gate access to the dashboard.
9. THE Backend SHALL NEVER transmit provider access tokens or refresh tokens to the App or include them in any API response.
10. IF a provider token has expired, THEN THE Backend SHALL refresh it using the stored refresh token before retrying the failed request, without returning an error to the App.

---

### Requirement 2: LLM Loading Screen

**User Story:** As a user who opens the app, I want to see a loading screen that explains what Reflect is doing, so that I understand the app is gathering and analysing my data.

#### Acceptance Criteria

1. WHEN the App navigates to the loading screen, THE App SHALL display an animated progress indicator and the following deterministic message sequence in order:
   1. "Reviewing your overnight recovery signals…"
   2. "Analysing today's schedule…"
   3. "Estimating your stress load…"
   4. "Finding the best time for a reset…"
2. THE App SHALL display the loading screen for a minimum of 2 seconds even if the Backend pipeline completes faster, so that all messages are readable.
3. WHILE the Backend pipeline is running, THE App SHALL continue displaying the loading screen with animated progress.
4. WHEN the Backend pipeline completes successfully, THE App SHALL navigate to the dashboard and display the stress assessment results.
5. IF the Backend pipeline returns an error, THEN THE App SHALL display a descriptive error message on the loading screen and provide a "Retry" button that re-triggers the pipeline.

---

### Requirement 3: Oura Ring Biometric Data Fetch

**User Story:** As the system, I want to fetch today's biometric data from the Oura Ring API each morning, so that the stress assessment is based on the user's actual physiological state.

#### Acceptance Criteria

1. WHEN the morning pipeline is triggered, THE Oura_Client SHALL fetch the following Biometric_Indicators for the current calendar day: sleep duration (hours), HRV (ms), resting heart rate (bpm), breathing rate (breaths/min), skin temperature deviation (°C), and readiness score (0–100).
2. WHEN the Oura_Client receives a successful API response, THE Backend SHALL store the Biometric_Indicators in the Cache with a timestamp.
3. IF the Oura Ring API returns an error or times out after 10 seconds, THEN THE Oura_Client SHALL return the most recent cached Biometric_Indicators and log a warning indicating stale data is in use.
4. IF no cached biometric data exists and the Oura Ring API is unavailable, THEN THE Backend SHALL proceed with the pipeline using null biometric values and set `stale: true` in the response.
5. THE Oura_Client SHALL use the Backend-stored OAuth access token and refresh it automatically using the stored refresh token when the access token has expired.

---

### Requirement 4: Google Calendar Schedule Fetch

**User Story:** As the system, I want to fetch today's calendar events from Google Calendar, so that the stress assessment accounts for schedule density and free time slots.

#### Acceptance Criteria

1. WHEN the morning pipeline is triggered, THE Calendar_Client SHALL fetch all events for the current calendar day from the user's primary Google Calendar.
2. WHEN the Calendar_Client receives a successful API response, THE Backend SHALL identify free time slots of 30 minutes or longer between events and store them alongside the event list in the Cache.
3. IF the Google Calendar API returns an error or times out after 10 seconds, THEN THE Calendar_Client SHALL return the most recent cached schedule and log a warning indicating stale data is in use.
4. IF no cached schedule exists and the Google Calendar API is unavailable, THEN THE Backend SHALL proceed with the pipeline using an empty event list and set `stale: true` in the response.
5. THE Calendar_Client SHALL use the Backend-stored Google OAuth access token and refresh it automatically using the stored refresh token when the access token has expired.

---

### Requirement 5: Baseline Computation

**User Story:** As the system, I want to compute rolling baselines for key biometric indicators, so that the stress assessment can compare today's values against the user's personal norms.

#### Acceptance Criteria

1. THE Backend SHALL compute `sleep_baseline_hours` as the rolling 7-day average of sleep duration from Oura historical data.
2. THE Backend SHALL compute `hrv_7d_avg` as the rolling 7-day average of HRV from Oura historical data.
3. THE Backend SHALL compute `resting_hr_7d_avg` as the rolling 7-day average of resting heart rate from Oura historical data.
4. IF fewer than 7 days of historical data are available, THEN THE Backend SHALL fall back to the Oura readiness baseline if available, or to reasonable static defaults (sleep: 7.5h, HRV: 50ms, resting HR: 60bpm), and mark the values internally as approximated.
5. THE App SHALL NOT display any flag or indicator distinguishing approximated baselines from computed baselines.

---

### Requirement 6: LLM Stress Assessment with Guardrails

**User Story:** As the system, I want to send structured signals and biometric data to the Claude LLM and receive a constrained stress assessment, so that the app gives the user a meaningful, reliable, and non-medical summary.

#### Acceptance Criteria

1. BEFORE calling the LLM_Client, THE Backend SHALL derive the following structured signals:
   - `physiological_strain`: "high" if sleep is below `sleep_baseline_hours` AND HRV is below `hrv_7d_avg` AND resting HR is above `resting_hr_7d_avg`; otherwise "normal".
   - `schedule_load`: "high" if the event count is dense (≥5 events) OR any event title contains keywords indicating importance (e.g., "exam", "interview", "meeting", "deadline", "presentation"); otherwise "normal".
2. WHEN the Oura and Calendar data are available, THE LLM_Client SHALL construct a prompt containing: the user's name, all Biometric_Indicators with their baselines, the day's event list, the identified free time slots, `physiological_strain`, and `schedule_load`.
3. THE LLM_Client prompt MUST constrain the LLM to return `stress_level` as exactly one of "High", "Elevated", or "Calm" and `action_recommendation` as exactly one actionable suggestion.
4. WHEN a free time slot exists in the schedule, THE LLM_Client prompt MUST instruct the LLM to map the `action_recommendation` to a specific free slot time.
5. WHEN the Claude API returns a valid structured response, THE Backend SHALL store the assessment in the Cache alongside the biometric and schedule data.
6. IF the Claude API returns a malformed response that cannot be parsed as the expected JSON structure, THEN THE LLM_Client SHALL retry the request once with the same prompt before falling back to deterministic output.
7. IF the Claude API returns an error, times out after 15 seconds, or fails after one retry, THEN THE Backend SHALL generate deterministic fallback output using these rules:
   - `stress_level`: "High" if both `physiological_strain` and `schedule_load` are "high"; "Elevated" if exactly one is "high"; "Calm" otherwise.
   - `drivers`: a list derived from whichever signals are "high".
   - `action_recommendation`: the first available free slot if one exists, otherwise "Take a short break when you can".
   - `summary`: a plain-language sentence constructed from the derived signals.
8. THE LLM_Client SHALL include the user's name in the prompt so that `action_recommendation` and `summary` are personalised.
9. THE Backend assessment output MUST use language such as "predicted stress load" and "based on recovery signals and schedule" and MUST NOT use language implying direct medical stress detection or diagnosis.

---

### Requirement 7: Backend API Response Contract

**User Story:** As a frontend developer, I want a well-defined REST API from the Backend, so that the App can reliably fetch and display stress assessment data.

#### Acceptance Criteria

1. THE Backend SHALL expose a `GET /api/assessment` endpoint that returns a JSON object with exactly the following shape:
   ```json
   {
     "stress_level": "High | Elevated | Calm",
     "drivers": ["string"],
     "action_recommendation": "string",
     "summary": "string",
     "biometrics": {
       "sleep_hours": "number",
       "sleep_baseline_hours": "number",
       "hrv_ms": "number",
       "hrv_7d_avg": "number",
       "resting_hr_bpm": "number",
       "resting_hr_7d_avg": "number",
       "breathing_rate": "number",
       "temperature_deviation_c": "number",
       "readiness_score": "number"
     },
     "schedule": {
       "events": [{ "start": "string", "end": "string", "title": "string" }],
       "event_count": "number",
       "free_slots": [{ "start": "string", "end": "string" }],
       "highlighted_slot": { "start": "string", "end": "string" }
     },
     "stale": "boolean",
     "last_updated": "string"
   }
   ```
2. THE Backend SHALL respond to `GET /api/assessment` with HTTP 200 and the cached data when a cache entry exists, or HTTP 503 with a descriptive JSON error when no data is available.
3. THE Backend SHALL expose a `POST /api/refresh` endpoint that re-runs the full pipeline (Oura + Calendar + LLM) and updates the Cache, returning the new assessment on success.
4. THE Backend SHALL expose a `POST /api/send-sms` endpoint that immediately sends an SMS using the latest cached assessment result, returning HTTP 200 on success or HTTP 503 if no cached data exists.
5. THE Backend SHALL expose a `GET /api/status` endpoint that returns: `last_run` (ISO timestamp or null), `cache_status` ("warm" or "empty"), and `services` object with boolean availability flags for `oura`, `google`, `llm`, and `sms`.
6. THE `POST /api/refresh`, `POST /api/send-sms`, and `GET /api/status` endpoints MUST return a valid response even if one or more external services are unavailable, degrading gracefully.
7. THE Backend SHALL set CORS headers to allow requests from the App's development origin (`http://localhost:5173`) and any configured production origin.
8. THE Backend SHALL return all error responses as JSON objects with an `error` string field and an appropriate HTTP status code.

---

### Requirement 8: Graceful Degradation and Reliability

**User Story:** As a demo presenter, I want the app to always show something useful even if individual services fail, so that the demo never shows a blank or broken screen.

#### Acceptance Criteria

1. IF the Oura Ring API fails, THEN THE Backend SHALL use the most recently cached biometric data and continue the pipeline.
2. IF the Google Calendar API fails, THEN THE Backend SHALL use the most recently cached schedule data and continue the pipeline.
3. IF both the Oura Ring API and the Google Calendar API fail, THEN THE Backend SHALL return the last full cached assessment result with `stale: true`.
4. IF the LLM fails, THEN THE Backend SHALL use the deterministic fallback defined in Requirement 6 and return a complete response object.
5. THE App MUST NEVER display an empty UI state if any cached assessment data exists.
6. THE Backend SHALL cache the most recent successful pipeline result in memory and persist it to a local JSON file so it survives server restarts.

---

### Requirement 9: Morning Message — SMS Delivery

**User Story:** As a user, I want to receive a proactive SMS each morning with my predicted stress load and a specific action recommendation, so that I know what to do before I even open the app.

#### Acceptance Criteria

1. WHEN the morning pipeline completes successfully, THE SMS_Client SHALL send an SMS to the user's stored phone number containing: the Stress_Level label, the Action_Recommendation, and a short call-to-action to open the app.
2. THE SMS_Client SHALL send the morning SMS between 07:00 and 09:00 in the user's local time zone, as inferred from the Google Calendar event time zone.
3. WHEN `POST /api/send-sms` is called, THE SMS_Client SHALL immediately send an SMS using the latest cached assessment result, regardless of the time of day.
4. IF the Twilio API returns an error when sending the SMS, THEN THE SMS_Client SHALL log the error and the failure SHALL NOT affect the App's ability to display the stress assessment.
5. THE SMS_Client SHALL use the Twilio account credentials stored in Backend environment variables and SHALL NOT expose those credentials to the App or to client-side code.

---

### Requirement 10: Landing Page — Stress Dashboard

**User Story:** As a user who opens the app, I want to see my predicted stress load and its key drivers at a glance, so that I immediately understand my day's stress profile.

#### Acceptance Criteria

1. WHEN the App loads and cached assessment data is available, THE App SHALL display the Stress_Level label prominently at the top of the landing page.
2. THE App SHALL display the list of `drivers` returned by the assessment below the Stress_Level label.
3. THE App SHALL display the `action_recommendation` as a visually emphasised, time-specific call-to-action block on the landing page.
4. THE App SHALL display the `summary` body text below the action recommendation.
5. WHILE the App is fetching assessment data from the Backend, THE App SHALL display a loading skeleton in place of the dashboard content.
6. IF the Backend returns an error when the App requests assessment data, THEN THE App SHALL display an error state with a "Retry" button.

---

### Requirement 11: Expandable Detail Cards

**User Story:** As a user, I want to tap on individual stress driver cards to see more detail about each factor, so that I can understand exactly why my predicted stress load is rated the way it is — without leaving the page.

#### Acceptance Criteria

1. THE App SHALL display the following Expandable_Cards on the landing page: Sleep, HRV, Heart Rate, Temperature, and Schedule.
2. WHEN a user taps a collapsed Expandable_Card, THE App SHALL expand that card inline to reveal its detail content without navigating to a new page.
3. WHEN a user taps an expanded Expandable_Card, THE App SHALL collapse it back to its summary state.
4. THE Sleep card SHALL display `biometrics.sleep_hours` compared against `biometrics.sleep_baseline_hours` (e.g., "5h — 1.5h below your baseline") and a one-sentence interpretation.
5. THE HRV card SHALL display `biometrics.hrv_ms` compared against `biometrics.hrv_7d_avg` and a one-sentence interpretation.
6. THE Heart_Rate card SHALL display `biometrics.resting_hr_bpm` compared against `biometrics.resting_hr_7d_avg` and a one-sentence interpretation.
7. THE Temperature card SHALL display `biometrics.temperature_deviation_c` and a one-sentence interpretation.
8. THE Schedule card SHALL display `schedule.events`, `schedule.free_slots`, and `schedule.highlighted_slot` with the highlighted slot visually distinguished.
9. THE App SHALL allow multiple Expandable_Cards to be open simultaneously.
10. WHEN the assessment data does not include a value for a given field, THE App SHALL display "Data unavailable" in that card rather than an empty or broken state.

---

### Requirement 12: Demo Controls

**User Story:** As a demo presenter, I want dedicated API endpoints to trigger pipeline refresh and SMS sending on demand, so that I can control the demo live without restarting the server.

#### Acceptance Criteria

1. THE Backend SHALL expose `POST /api/refresh` as defined in Requirement 7, re-running the full pipeline and returning the updated assessment.
2. THE Backend SHALL expose `POST /api/send-sms` as defined in Requirement 7, immediately sending an SMS from the latest cached result.
3. THE Backend SHALL expose `GET /api/status` as defined in Requirement 7, returning pipeline run timestamp, cache status, and per-service availability flags.
4. WHEN any of the demo control endpoints are called and a downstream service is unavailable, THE Backend SHALL return a partial success response indicating which services succeeded and which failed, rather than returning a top-level error.
