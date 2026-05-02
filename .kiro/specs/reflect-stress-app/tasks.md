# Implementation Tasks

## Task List

- [x] 1. Backend foundation — env/config layer and static demo fixtures
  - [x] 1.1 Initialize backend package.json with required dependencies
  - [x] 1.2 Create config module (src/config.js) with env loading, validation, and provider flags
  - [x] 1.3 Create .env.example with all required and optional variables
  - [x] 1.4 Create fixture JSON files (oura, calendar, baseline, llm-response, sms-preview)
  - [x] 1.5 Create fixture loader/helper (src/fixtures/index.js)

- [x] 2. Cache module
  - [x] 2.1 Create src/cache.js with in-memory store, file persistence (cache.json), get/set/isWarm exports

- [x] 3. Data pipeline modules
  - [x] 3.1 Create src/modules/signals.js — derive physiological_strain and schedule_load
  - [x] 3.2 Create src/modules/ouraClient.js — fetch biometrics + token refresh + fixture fallback
  - [x] 3.3 Create src/modules/calendarClient.js — fetch events + free slot computation + fixture fallback
  - [x] 3.4 Create src/modules/llmClient.js — build prompt, call Claude API, parse response, deterministic fallback
  - [x] 3.5 Create src/modules/smsClient.js — send Twilio SMS
  - [x] 3.6 Create src/pipeline.js — orchestrate full pipeline with graceful degradation

- [x] 4. Express server and API routes
  - [x] 4.1 Create src/index.js — Express app, CORS, route registration, node-cron scheduler
  - [x] 4.2 Create src/routes/assessment.js — GET /api/assessment
  - [x] 4.3 Create src/routes/refresh.js — POST /api/refresh
  - [x] 4.4 Create src/routes/sendSms.js — POST /api/send-sms
  - [x] 4.5 Create src/routes/status.js — GET /api/status

- [x] 5. Frontend — types and data hook
  - [x] 5.1 Create Frontend/src/types/assessment.ts — TypeScript types matching API contract
  - [x] 5.2 Create Frontend/src/hooks/useAssessment.ts — fetch assessment, auto-refresh on 503, expose refetch

- [x] 6. Frontend — loading screen and dashboard pages
  - [x] 6.1 Create Frontend/src/pages/LoadingScreen.tsx — 4-message sequence, min 2s display, navigate on success
  - [x] 6.2 Create Frontend/src/pages/Dashboard.tsx — assemble all dashboard sections
  - [x] 6.3 Update Frontend/src/App.tsx — route loading screen → dashboard

- [x] 7. Frontend — dashboard components
  - [x] 7.1 Create Frontend/src/components/StressHeader.tsx — stress_level badge + summary
  - [x] 7.2 Create Frontend/src/components/ActionBanner.tsx — action_recommendation highlight block
  - [x] 7.3 Create Frontend/src/components/DriversList.tsx — drivers pill list
  - [x] 7.4 Create Frontend/src/components/ExpandableCard.tsx — reusable collapsible card
  - [x] 7.5 Create Frontend/src/components/ErrorState.tsx — error message + Retry button
  - [x] 7.6 Create Frontend/src/components/cards/SleepCard.tsx
  - [x] 7.7 Create Frontend/src/components/cards/HRVCard.tsx
  - [x] 7.8 Create Frontend/src/components/cards/HeartRateCard.tsx
  - [x] 7.9 Create Frontend/src/components/cards/TemperatureCard.tsx
  - [x] 7.10 Create Frontend/src/components/cards/ScheduleCard.tsx
