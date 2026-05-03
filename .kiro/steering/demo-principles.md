# Demo Principles & Development Guidelines

This is a **hackathon demo**, not a production system. Every decision should optimize for a compelling, reliable, and clear demo experience.

---

## 1. Product Clarity Over Technical Completeness

- Optimize every output for demo clarity and user understanding
- Prefer simple, high-impact solutions over technically complex ones
- Always tie implementation decisions back to the user experience
- If a simpler approach communicates the same value, choose it
- Avoid over-engineering — working and clear beats elegant and broken

---

## 2. Demo Reliability Is the Top Priority

- **Always include fallbacks** if an API or dependency fails — the demo must never show a blank screen or unhandled error
- Prefer deterministic outputs over dynamic or unstable ones
- Avoid solutions that could break during a live demo (e.g., flaky network calls, unvalidated external data, race conditions)
- Every user-facing flow must return a usable result, even in degraded mode
- Use fixture/mock data as fallbacks when live data is unavailable
- Test the happy path thoroughly; the demo should always hit the happy path

---

## 3. LLM Behavior: Structured, Concise, Actionable

- Generate **structured outputs** — use consistent formats (e.g., short bullet points, labeled sections)
- Avoid generic or vague responses — every LLM output should be specific to the user's situation
- Prioritize **actionable insights** over explanations — tell the user what to do, not just what's happening
- Keep responses short and demo-friendly — aim for 2–4 sentences or 3–5 bullet points max
- Reduce unpredictability: use low temperature settings, constrained prompts, and output validation where possible
- If the LLM response is malformed or too long, truncate or fall back to a safe default rather than surfacing raw output

---

## 4. Contextual Reasoning — Ground Everything in the User's Data

- Always connect outputs to the user's actual data: biometrics (HRV, heart rate, sleep, temperature) and schedule
- Avoid abstract or generalized reasoning — "you seem stressed" is weak; "your HRV dropped 18% and you have 3 meetings before noon" is strong
- Generate insights that feel **personalized and relevant** to what the data actually shows
- Reference specific values, trends, or events from the user's context when generating any insight or recommendation
- Contextual reasoning > generic outputs, always

---

## 5. Constraint-Driven Engineering — No Overengineering

- Reject unnecessary abstractions — if it doesn't show up in the demo, don't build it
- Do not build for scale; this system serves one demo session at a time
- Focus only on features that are **visible and meaningful in the demo flow**
- Prefer clarity and speed of implementation over extensibility
- No premature optimization, no generic utility layers, no "just in case" code
- The test: "Would removing this make the demo fail?" If no — don't add it

---

## 6. UX Quality — Reduce Cognitive Load

- Prioritize clarity, readability, and visual hierarchy in every UI decision
- Avoid cluttered or overly dense layouts — whitespace is intentional
- Every UI element must serve a clear, visible purpose; remove anything that doesn't aid understanding
- Use progressive disclosure: show the most important information first, details on demand
- The user must understand their stress level within 3 seconds of the dashboard loading
- Design for a viewer watching a demo, not a power user exploring settings

---

## 7. Data Consistency — Believable Demo Scenarios

- All generated or fixture data must be **internally consistent**: sleep quality, HRV, stress level, and schedule must tell a coherent story
- Avoid contradictions between inputs and outputs (e.g., high HRV + good sleep should not produce a "critical stress" label without a calendar explanation)
- Reasons in the output must map directly to at least one signal in the input data
- Maintain believable, realistic demo scenarios — numbers should feel human, not random
- Define a small set of coherent scenarios and use them consistently throughout the app

---

## Summary Checklist

Before shipping any feature or output, ask:
1. Will this work reliably during a live demo?
2. Does this make sense to a non-technical observer in under 5 seconds?
3. Is there a fallback if something goes wrong?
4. Is the LLM output short, specific, and actionable?
5. Is the insight grounded in the user's actual data?
6. Would removing this feature break the demo? If not, cut it.
7. Are all data signals internally consistent and contradiction-free?
