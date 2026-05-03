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
