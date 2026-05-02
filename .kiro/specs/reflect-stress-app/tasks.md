# Implementation Tasks

## Task List

- [x] 1. Backend foundation — env/config layer and static demo fixtures
  - [x] 1.1 Initialize backend package.json with required dependencies
  - [x] 1.2 Create config module (src/config.js) with env loading, validation, and provider flags
  - [x] 1.3 Create .env.example with all required and optional variables
  - [x] 1.4 Create fixture JSON files (oura, calendar, baseline, llm-response, sms-preview)
  - [x] 1.5 Create fixture loader/helper (src/fixtures/index.js)

- [ ] 2. Cache module
  - [ ] 2.1 Create src/cache.js with in-memory store, file persistence (cache.json), get/set/isWarm exports

- [ ] 3. Data pipeline modules
  - [ ] 3.1 Create src/modules/signals.js — derive physiological_strain and schedule_load
  - [ ] 3.2 Create src/modules/ouraClient.js — fetch biometrics + token refresh + fixture fallback
  - [ ] 3.3 Create src/modules/calendarClient.js — fetch events + free slot computation + fixture fallback
  - [ ] 3.4 Create src/modules/llmClient.js — build prompt, call Claude API, parse response, deterministic fallback
  - [ ] 3.5 Create src/modules/smsClient.js — send Twilio SMS
  - [ ] 3.6 Create src/pipeline.js — orchestrate full pipeline with graceful degradation

- [ ] 4. Express server and API routes
  - [ ] 4.1 Create src/index.js — Express app, CORS, route registration, node-cron scheduler
  - [ ] 4.2 Create src/routes/assessment.js — GET /api/assessment
  - [ ] 4.3 Create src/routes/refresh.js — POST /api/refresh
  - [ ] 4.4 Create src/routes/sendSms.js — POST /api/send-sms
  - [ ] 4.5 Create src/routes/status.js — GET /api/status

- [ ] 5. Frontend — types and data hook
  - [ ] 5.1 Create Frontend/src/types/assessment.ts — TypeScript types matching API contract
  - [ ] 5.2 Create Frontend/src/hooks/useAssessment.ts — fetch assessment, auto-refresh on 503, expose refetch

- [ ] 6. Frontend — loading screen and dashboard pages
  - [ ] 6.1 Create Frontend/src/pages/LoadingScreen.tsx — 4-message sequence, min 2s display, navigate on success
  - [ ] 6.2 Create Frontend/src/pages/Dashboard.tsx — assemble all dashboard sections
  - [ ] 6.3 Update Frontend/src/App.tsx — route loading screen → dashboard

- [ ] 7. Frontend — dashboard components
  - [ ] 7.1 Create Frontend/src/components/StressHeader.tsx — stress_level badge + summary
  - [ ] 7.2 Create Frontend/src/components/ActionBanner.tsx — action_recommendation highlight block
  - [ ] 7.3 Create Frontend/src/components/DriversList.tsx — drivers pill list
  - [ ] 7.4 Create Frontend/src/components/ExpandableCard.tsx — reusable collapsible card
  - [ ] 7.5 Create Frontend/src/components/ErrorState.tsx — error message + Retry button
  - [ ] 7.6 Create Frontend/src/components/cards/SleepCard.tsx
  - [ ] 7.7 Create Frontend/src/components/cards/HRVCard.tsx
  - [ ] 7.8 Create Frontend/src/components/cards/HeartRateCard.tsx
  - [ ] 7.9 Create Frontend/src/components/cards/TemperatureCard.tsx
  - [ ] 7.10 Create Frontend/src/components/cards/ScheduleCard.tsx
