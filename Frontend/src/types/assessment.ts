/**
 * TypeScript types for the Reflect stress assessment API contract.
 * Matches the shape returned by GET /api/assessment and POST /api/refresh.
 */

/** The predicted stress load category for the day. */
export type StressLevel = "Elevated" | "Moderate" | "Calm";

/** A single calendar event with ISO 8601 start/end times. */
export interface CalendarEvent {
  /** ISO 8601 start time of the event. */
  start: string;
  /** ISO 8601 end time of the event. */
  end: string;
  /** Display title of the event. */
  title: string;
}

/** A free time slot of at least 30 minutes between calendar events. */
export interface FreeSlot {
  /** ISO 8601 start time of the free slot. */
  start: string;
  /** ISO 8601 end time of the free slot. */
  end: string;
}

/**
 * Biometric indicators fetched from the Oura Ring API,
 * including today's values and rolling 7-day baselines.
 */
export interface Biometrics {
  /** Today's sleep duration in hours. */
  sleep_hours: number;
  /** Rolling 7-day average sleep duration in hours. */
  sleep_baseline_hours: number;
  /** Today's heart rate variability in milliseconds. */
  hrv_ms: number;
  /** Rolling 7-day average HRV in milliseconds. */
  hrv_7d_avg: number;
  /** Today's resting heart rate in beats per minute. */
  resting_hr_bpm: number;
  /** Rolling 7-day average resting heart rate in beats per minute. */
  resting_hr_7d_avg: number;
  /** Today's breathing rate in breaths per minute. */
  breathing_rate: number;
  /** Skin temperature deviation from baseline in degrees Celsius. */
  temperature_deviation_c: number;
  /** Oura readiness score from 0 to 100. */
  readiness_score: number;
}

/**
 * Today's calendar schedule data, including events, free slots,
 * and the recommended slot for a recovery break.
 */
export interface Schedule {
  /** List of calendar events for today. */
  events: CalendarEvent[];
  /** Total number of events today. */
  event_count: number;
  /** Free time slots of at least 30 minutes between events. */
  free_slots: FreeSlot[];
  /**
   * The recommended free slot for a recovery break, as suggested by the
   * action recommendation. Null if no free slots are available.
   */
  highlighted_slot: FreeSlot | null;
}

/**
 * The full assessment response returned by GET /api/assessment
 * and POST /api/refresh.
 */
export interface AssessmentResponse {
  /** The predicted stress load category for the day. */
  stress_level: StressLevel;
  /**
   * Short strings naming the contributing factors to the stress level
   * (typically 2–4 items).
   */
  drivers: string[];
  /**
   * One specific, actionable suggestion for the day. When a free calendar
   * slot exists, this references that slot by time.
   */
  action_recommendation: string;
  /**
   * 1–2 sentence plain-language summary of the predicted stress load,
   * personalised to the user's name.
   */
  summary: string;
  /** Biometric indicators from the Oura Ring, with 7-day baselines. */
  biometrics: Biometrics;
  /** Today's calendar schedule, free slots, and highlighted recovery slot. */
  schedule: Schedule;
  /**
   * True if the data was served from a stale cache because one or more
   * upstream services were unavailable during the last pipeline run.
   */
  stale: boolean;
  /** ISO 8601 timestamp of when the assessment was last generated. */
  last_updated: string;
}
