# Pulse — Proactive Stress Copilot

## Overview

Pulse is a proactive stress intelligence system designed to shift users from reactive tracking to real-time, personalized guidance. Instead of simply displaying health data, Pulse interprets biometric signals and contextual data to classify daily stress load and deliver actionable, gentle interventions.

This project was built during KiroHacks Cal Poly, a one-day hackathon focused on innovative AI-powered applications.

---

## Problem

Students and high-performing individuals often experience stress without realizing its severity until it impacts performance, health, or wellbeing. Existing tools (like Oura or Apple Health) provide data, but:

* They are passive and require user interpretation
* They lack contextual awareness (schedule, workload, etc.)
* They do not provide timely, actionable interventions

---

## Solution

Pulse acts as a **stress copilot** by:

1. Aggregating biometric signals (sleep, HRV, heart rate, etc.)
2. Incorporating contextual data (calendar, daily schedule)
3. Using an LLM to classify daily stress load
4. Delivering proactive, personalized SMS nudges

### Stress Levels

* **Low** — Stable baseline
* **Steady** — Mild strain detected
* **High** — Significant stress indicators present

---

## Key Features

* **Biometric Integration (Simulated Oura Data)**

  * Sleep duration (e.g., “slept 5h below baseline”)
  * Heart rate trends
  * HRV changes
  * Breathing rate
  * Temperature variation
  * Micromovements (tension signals)

* **Context Awareness**

  * Calendar-based workload analysis
  * Identification of high-stress windows (e.g., exams, long class blocks)

* **LLM Reasoning Layer**

  * Interprets combined signals
  * Classifies stress level
  * Generates human-centered, actionable recommendations

* **Proactive Messaging**

  * Daily SMS updates
  * Gentle, non-intrusive nudges
  * No need to open the app

* **Calm, Interactive UI**

  * Animated interface
  * Minimal navigation (tap-to-expand, no heavy page switching)

---

## Demo Flow

1. User onboarding
2. System simulates pulling biometric data
3. Calendar context is analyzed
4. LLM processes inputs and determines stress level
5. User receives message:

   * Example: “Your body is showing signs of strain today.”
   * Action: “Take a 10-minute reset before your 11am midterm.”

---

## Technical Approach

### Architecture

* Frontend: Interactive UI with animated components
* Backend: Node.js API handling data processing
* Messaging: SMS integration (Twilio initially, later simulated)
* AI Layer: LLM-driven reasoning for stress classification and recommendations

### AI Strategy

We used a hybrid approach:

* **Spec-driven development** for structured system behavior
* **Vibe coding** for rapid iteration and prototyping

The LLM is responsible for:

* Synthesizing biometric + contextual data
* Producing natural language insights
* Generating actionable recommendations

---

## Kiro Usage

### Vibe Coding

Kiro was used to rapidly build and iterate on both frontend and backend systems. It enabled fast prototyping and helped generate large portions of functional code, including API routes and UI components.

### Spec-Driven Development

We experimented with structured specifications to guide Kiro’s outputs. This helped enforce consistency but required a learning curve to balance with faster iteration methods.

### Agent Hooks

We explored automating workflows through Kiro hooks to streamline development processes and reduce repetitive tasks.

### Key Contribution

Kiro effectively:

* Built significant portions of the backend
* Helped integrate the SMS messaging system
* Accelerated development from idea to working prototype

---

## Challenges

* Kiro occasionally misinterpreted prompts and reverted to undesired implementations
* Difficulty choosing between spec-driven vs vibe-based approaches
* Needed strict boundaries to prevent overwriting UI components
* Integration issues with SMS services (Twilio configuration errors)

---

## Accomplishments

* Developed a full-stack prototype within a hackathon timeframe
* Created a polished, animated, and engaging UI
* Implemented a working login and user data flow
* Integrated AI-driven analysis of user stress
* Designed a system that proactively supports user wellbeing

---

## Learnings

* Importance of constraining AI systems with clear boundaries
* How to build a full-stack application from scratch
* Tradeoffs between structured specs and rapid iteration
* Designing human-centered AI interactions

---

## Future Work

* Improve model accuracy and personalization
* Replace simulated data with real wearable integrations
* Enhance recommendation quality through better prompting/model tuning
* Expand intervention types beyond SMS
* Conduct user testing and validation

---

## Inspiration

Pulse was inspired by the gap between data and action in existing health tools. While devices like Oura provide rich biometric insights, users are left to interpret what it means and how to respond. We wanted to create a system that not only understands stress but actively helps users manage it in real time.

---

## Team

Built at KiroHacks Cal Poly by a team focused on human-centered AI and proactive health technology.

---

## TL;DR

Pulse turns passive health tracking into an intelligent, proactive system that understands your day and helps you navigate stress before it escalates.

---

## Running Locally

### Prerequisites
- Node.js 18+
- Anthropic API key (for Claude stress assessment)
- Oura PAT and Google Calendar credentials (optional — fixture/mock mode works without them)

### Setup

```bash
# 1. Install all dependencies (root, backend, and frontend)
npm install
npm install --prefix backend
npm install --prefix Frontend

# 2. Set up backend environment variables
cp backend/.env.example backend/.env
# Fill in the values (see backend/.env.example for all keys)
# Required for live API mode: ANTHROPIC_API_KEY, OURA_PAT, GOOGLE_CLIENT_ID,
#   GOOGLE_CLIENT_SECRET, GOOGLE_REFRESH_TOKEN
# Set MOCK_MODE=true to run entirely on fixture data (no live APIs needed)

# 3. Start both backend and frontend
npm run dev
# Backend runs on http://localhost:3001 (default)
# Frontend runs on http://localhost:5173 (default)
```

Or start individually:
```bash
npm run dev:backend    # backend only
npm run dev:frontend   # frontend only
```

### Key Environment Variables

See `backend/.env.example` for the full list. To run in demo/mock mode without live APIs:
```
MOCK_MODE=true
PORT=3001
FRONTEND_ORIGIN=http://localhost:5173
```

---

## Current Project State

This project was built as a **one-day hackathon prototype** at KiroHacks Cal Poly.

| Component | Status |
|-----------|--------|
| Backend pipeline (pipeline.js) | Working — biometric signal derivation + Claude assessment |
| LLM fallbacks (JSON validation, retry, rule-based) | Working |
| Fixture/mock mode (no live APIs needed) | Working |
| Google Calendar token refresh | Working (401 retry) |
| Frontend demo shell (StressCopilotAllViews.tsx) | Working — polished animated UI |
| API-bound Dashboard (Dashboard.tsx + useAssessment.ts) | Exists in repo but not mounted in current App.tsx |
| SMS/Twilio notifications | Not implemented on current `main` |
| Oura live integration | Fixture fallback mode; live PAT required for real data |

The active frontend renders a polished demo experience. The full API-wired version (Dashboard + useAssessment hook) is in the repo but requires re-mounting in `App.tsx`.

---

## Technical Architecture

```
Frontend (React/TypeScript/Vite)
        |
    Express backend (backend/src/server.js)
        |
  ┌────────────────────────────────────────────┐
  │  GET /api/assessment                       │
  │    → ouraClient.js  (biometric signals)    │
  │    → calendarClient.js (schedule context) │
  │    → signals.js (deterministic scoring)   │
  │    → llmClient.js (Claude JSON output)    │
  │    → cache.js (file-backed persistence)   │
  └────────────────────────────────────────────┘
```

**Pre-LLM signal derivation:** `signals.js` computes deterministic `physiological_strain` and `schedule_load` scores before calling Claude. The LLM receives structured inputs and must return strict JSON (`stress_level`, drivers, recommendation, summary). Malformed responses retry once then fall back to a rule-based assessment.

**Kiro specs/hooks** (`.kiro/` directory): The repo includes Kiro specs, task decomposition, steering principles, and hooks that encode LLM output guardrails, mock-data consistency, demo reliability rules, and anti-overengineering constraints — demonstrating AI-assisted development discipline alongside the app itself.
