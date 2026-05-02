/**
 * signals.js — Derives structured physiological and schedule signals
 * from biometric and calendar data before passing them to the LLM.
 *
 * Rules (from spec Requirement 6.1):
 *   physiological_strain: "high" if sleep < sleep_baseline_hours
 *                         AND hrv_ms < hrv_7d_avg
 *                         AND resting_hr_bpm > resting_hr_7d_avg;
 *                         otherwise "normal".
 *
 *   schedule_load: "high" if event_count >= 5
 *                  OR any event title contains a high-stakes keyword;
 *                  otherwise "normal".
 *
 * Exports:
 *   deriveSignals(biometrics, schedule, baselines)
 *     → { physiological_strain: "high"|"normal", schedule_load: "high"|"normal" }
 */

// Keywords that indicate a high-stakes or important calendar event.
// Matching is case-insensitive and substring-based.
const HIGH_STAKES_KEYWORDS = [
  'exam',
  'interview',
  'meeting',
  'deadline',
  'presentation',
  'midterm',
  'final',
  'review',
];

/**
 * Derives physiological_strain and schedule_load signals.
 *
 * @param {object} biometrics - Today's biometric readings.
 *   @param {number|null} biometrics.sleep_hours      - Today's sleep duration (hours)
 *   @param {number|null} biometrics.hrv_ms           - Today's HRV (ms)
 *   @param {number|null} biometrics.resting_hr_bpm   - Today's resting heart rate (bpm)
 *
 * @param {object} schedule - Today's calendar data.
 *   @param {Array<{title: string, start: string, end: string}>} schedule.events
 *   @param {number} [schedule.event_count] - Pre-computed event count (falls back to events.length)
 *
 * @param {object} baselines - Rolling 7-day averages.
 *   @param {number} baselines.sleep_baseline_hours - 7-day avg sleep (hours)
 *   @param {number} baselines.hrv_7d_avg           - 7-day avg HRV (ms)
 *   @param {number} baselines.resting_hr_7d_avg    - 7-day avg resting HR (bpm)
 *
 * @returns {{ physiological_strain: "high"|"normal", schedule_load: "high"|"normal" }}
 */
function deriveSignals(biometrics, schedule, baselines) {
  const physiological_strain = derivePhysiologicalStrain(biometrics, baselines);
  const schedule_load = deriveScheduleLoad(schedule);

  return { physiological_strain, schedule_load };
}

/**
 * Derives physiological_strain.
 *
 * "high" only when ALL three conditions are simultaneously met:
 *   - sleep_hours < sleep_baseline_hours
 *   - hrv_ms < hrv_7d_avg
 *   - resting_hr_bpm > resting_hr_7d_avg
 *
 * If any required field is null/undefined, that condition is treated as NOT met,
 * so missing data never falsely triggers "high" strain.
 *
 * @param {object} biometrics
 * @param {object} baselines
 * @returns {"high"|"normal"}
 */
function derivePhysiologicalStrain(biometrics, baselines) {
  const { sleep_hours, hrv_ms, resting_hr_bpm } = biometrics ?? {};
  const { sleep_baseline_hours, hrv_7d_avg, resting_hr_7d_avg } = baselines ?? {};

  const sleepBelowBaseline =
    sleep_hours != null && sleep_baseline_hours != null
      ? sleep_hours < sleep_baseline_hours
      : false;

  const hrvBelowAvg =
    hrv_ms != null && hrv_7d_avg != null
      ? hrv_ms < hrv_7d_avg
      : false;

  const hrAboveAvg =
    resting_hr_bpm != null && resting_hr_7d_avg != null
      ? resting_hr_bpm > resting_hr_7d_avg
      : false;

  return sleepBelowBaseline && hrvBelowAvg && hrAboveAvg ? 'high' : 'normal';
}

/**
 * Derives schedule_load.
 *
 * "high" when either:
 *   - event_count >= 5 (dense schedule), OR
 *   - any event title contains a high-stakes keyword (case-insensitive)
 *
 * @param {object} schedule
 * @returns {"high"|"normal"}
 */
function deriveScheduleLoad(schedule) {
  const { events = [] } = schedule ?? {};

  // Use provided event_count if available, otherwise derive from events array.
  const eventCount =
    schedule?.event_count != null ? schedule.event_count : events.length;

  // Dense schedule: 5 or more events today.
  if (eventCount >= 5) {
    return 'high';
  }

  // High-stakes keyword detected in any event title.
  const hasImportantEvent = events.some((event) => {
    const title = (event?.title ?? '').toLowerCase();
    return HIGH_STAKES_KEYWORDS.some((keyword) => title.includes(keyword));
  });

  return hasImportantEvent ? 'high' : 'normal';
}

module.exports = { deriveSignals };
