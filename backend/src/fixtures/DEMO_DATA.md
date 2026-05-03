# James Demo Data

This folder contains a two-week hackathon demo dataset for Pulse.

## Demo Persona

- Name: James
- Timezone: America/Los_Angeles
- Profile: college student balancing classes, work blocks, club meetings, interviews, workouts, and social plans
- Demo day: 2025-02-13

## API Surfaces

- `POST /api/refresh` uses the top-level fixture contract and returns the current assessment for the demo day.
- `GET /api/assessment` returns the cached assessment after refresh.
- `GET /api/demo-data` returns the full two-week calendar and Oura dataset for copilot demos.

## Calendar Fixture

`calendar.json` keeps two shapes:

- `events`, `free_slots`, `highlighted_slot`: the existing backend contract for the demo day.
- `google_calendar_api.items`: Google Calendar API-style events for 2025-02-09 through 2025-02-22.

Important Google Calendar fields included:

- `id`: stable event id.
- `summary`: event title.
- `description`: human-readable event note.
- `start.dateTime`, `end.dateTime`: ISO timestamps with timezone offset.
- `start.timeZone`, `end.timeZone`: IANA timezone.
- `status`: usually `confirmed`.
- `creator`, `organizer`: calendar owner metadata.
- `colorId`: Google Calendar color bucket used to mimic the screenshot.
- `reminders`: default reminder behavior.
- `extendedProperties.private.demo_type`: normalized category such as class, work, meeting, interview, exercise, social, appointment, or personal.

## Oura Fixture

`oura.json` keeps two shapes:

- `today`, `history`: the existing backend contract for the assessment pipeline.
- `oura_api_v2`: Oura API v2-style endpoint payloads for a richer copilot demo.

Important Oura metric groups included:

- `personal_info`: age, height, weight, biological sex, and account id.
- `ring_configuration`: hardware generation, firmware, color, size, and setup date.
- `daily_sleep`: daily sleep score and contributor scores.
- `daily_readiness`: recovery score, temperature deviation, and recovery contributors.
- `daily_activity`: activity score, calories, steps, intensity time, MET timeline, and movement contributors.
- `daily_spo2`: overnight oxygen saturation and breathing disturbance index.
- `daily_stress`: daytime high-stress seconds, recovery seconds, and day summary.
- `daily_resilience`: longer-term stress handling level and contributors.
- `daily_cardiovascular_age`: vascular age and pulse wave velocity.
- `sleep`: detailed sleep sessions with duration, phases, heart rate, HRV, breathing, movement, and readiness snapshot.
- `workout`: confirmed workout sessions.
- `heartrate`: representative all-day heart-rate samples with source labels.
- Empty endpoint examples: `rest_mode_period`, `session`, `tag`, and `vO2_max`.

## Demo Story

The calendar load is intentionally high on Thursday, 2025-02-13:

- overlapping interviews at 9:15 AM
- professor meeting at 10 AM
- work block from 11 AM to 2 PM
- social hangout from 2 PM to 5:15 PM
- PT from 6 PM to 7 PM
- IME 403 from 7 PM to 9 PM

The Oura metrics deteriorate around that same period:

- sleep falls from about 7-8 hours to 5.25 hours
- HRV drops from the 80s to 55 ms
- resting heart rate rises into the low 60s
- readiness drops to 62
- temperature deviation rises to +0.28 C
- daytime high-stress minutes increase to 128

This gives the copilot a clear demo explanation: James is not only busy; his recovery signals are also weaker, so Pulse should protect the 5:15-6:00 PM gap and keep messages short.
