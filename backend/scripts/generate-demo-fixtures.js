/**
 * Generates James's two-week hackathon demo fixtures.
 *
 * The top-level `calendar.events` and `oura.today/history` fields preserve the
 * current backend pipeline contract. The richer nested API-style fields give the
 * future copilot enough realistic context to explain its recommendation.
 */

'use strict';

const fs = require('fs');
const path = require('path');

const FIXTURE_DIR = path.join(__dirname, '..', 'src', 'fixtures');
const TZ = 'America/Los_Angeles';
const OFFSET = '-08:00';
const DEMO_TODAY = '2025-02-13';
const PERSONA = {
  name: 'James',
  timezone: TZ,
  age: 21,
  profile: 'college student balancing classes, club work, interviews, exercise, and social plans',
};

const colorByType = {
  class: '11',
  work: '10',
  meeting: '2',
  interview: '10',
  exercise: '7',
  social: '9',
  appointment: '1',
  travel: '8',
  personal: '5',
};

const dayLoad = {
  '2025-02-09': { sleep: 7.35, hrv: 88, rhr: 52, readiness: 87, temp: -0.11, stressMin: 18, recoveryMin: 112, activity: 91 },
  '2025-02-10': { sleep: 6.85, hrv: 79, rhr: 55, readiness: 80, temp: -0.04, stressMin: 41, recoveryMin: 84, activity: 89 },
  '2025-02-11': { sleep: 7.1, hrv: 76, rhr: 56, readiness: 78, temp: 0.02, stressMin: 55, recoveryMin: 76, activity: 88 },
  '2025-02-12': { sleep: 5.9, hrv: 62, rhr: 59, readiness: 70, temp: 0.13, stressMin: 92, recoveryMin: 44, activity: 82 },
  '2025-02-13': { sleep: 5.25, hrv: 55, rhr: 63, readiness: 62, temp: 0.28, stressMin: 128, recoveryMin: 25, activity: 80 },
  '2025-02-14': { sleep: 6.0, hrv: 61, rhr: 60, readiness: 68, temp: 0.12, stressMin: 74, recoveryMin: 52, activity: 76 },
  '2025-02-15': { sleep: 8.2, hrv: 84, rhr: 54, readiness: 86, temp: -0.08, stressMin: 16, recoveryMin: 130, activity: 73 },
  '2025-02-16': { sleep: 7.9, hrv: 86, rhr: 53, readiness: 88, temp: -0.1, stressMin: 14, recoveryMin: 140, activity: 77 },
  '2025-02-17': { sleep: 6.75, hrv: 74, rhr: 56, readiness: 76, temp: 0.02, stressMin: 48, recoveryMin: 72, activity: 84 },
  '2025-02-18': { sleep: 6.25, hrv: 68, rhr: 58, readiness: 72, temp: 0.07, stressMin: 63, recoveryMin: 58, activity: 86 },
  '2025-02-19': { sleep: 5.65, hrv: 59, rhr: 61, readiness: 66, temp: 0.18, stressMin: 105, recoveryMin: 38, activity: 81 },
  '2025-02-20': { sleep: 5.35, hrv: 54, rhr: 64, readiness: 60, temp: 0.24, stressMin: 136, recoveryMin: 22, activity: 79 },
  '2025-02-21': { sleep: 6.2, hrv: 63, rhr: 60, readiness: 69, temp: 0.1, stressMin: 72, recoveryMin: 49, activity: 83 },
  '2025-02-22': { sleep: 8.05, hrv: 82, rhr: 54, readiness: 85, temp: -0.06, stressMin: 20, recoveryMin: 118, activity: 74 },
};

const calendarSeed = [
  ['2025-02-09', 'pickleball', '10:00', '12:00', 'exercise'],
  ['2025-02-09', 'Mex Food w/ Lauren Moro', '13:00', '13:45', 'social'],
  ['2025-02-09', 'MC', '14:00', '15:00', 'meeting'],
  ['2025-02-09', 'PRESENT in iter8 meeting', '15:15', '17:15', 'meeting'],

  ['2025-02-10', 'CSC 307', '08:00', '10:00', 'class'],
  ['2025-02-10', 'Seth <> Yuijun, Vidushi Coffee Chat', '09:00', '10:00', 'meeting'],
  ['2025-02-10', 'gym', '10:00', '11:30', 'exercise'],
  ['2025-02-10', 'Golf', '12:00', '14:00', 'exercise'],
  ['2025-02-10', 'Work', '15:00', '16:30', 'work'],
  ['2025-02-10', 'Hack4Impact Designers', '17:00', '18:00', 'meeting'],
  ['2025-02-10', 'plege meeting - & personal finance', '20:00', '21:00', 'meeting'],

  ['2025-02-11', 'Meeting', '08:00', '09:00', 'meeting'],
  ['2025-02-11', 'James <> Sol', '09:00', '10:00', 'meeting'],
  ['2025-02-11', 'James <> Soha', '09:00', '10:00', 'meeting'],
  ['2025-02-11', 'Work', '10:00', '13:00', 'work'],
  ['2025-02-11', 'jerry', '14:15', '14:45', 'meeting'],
  ['2025-02-11', 'bring baking supplies', '14:35', '15:00', 'personal'],
  ['2025-02-11', 'Date', '15:00', '17:00', 'social'],
  ['2025-02-11', 'crc', '18:00', '19:00', 'exercise'],
  ['2025-02-11', 'IME 403', '19:00', '21:00', 'class'],

  ['2025-02-12', 'CSC 307', '08:00', '10:00', 'class'],
  ['2025-02-12', 'SNP Expert Call', '10:00', '10:45', 'meeting'],
  ['2025-02-12', 'health appointment', '11:00', '12:00', 'appointment'],
  ['2025-02-12', '301', '11:30', '13:00', 'class'],
  ['2025-02-12', 'BUS 490: O3-441', '13:00', '16:00', 'class'],
  ['2025-02-12', 'PurpleTie Client Check-in', '13:45', '14:15', 'meeting'],
  ['2025-02-12', 'Spokes Job Board with Mia', '14:30', '15:00', 'meeting'],
  ['2025-02-12', 'TLs & Devs Meeting', '18:00', '19:00', 'meeting'],
  ['2025-02-12', 'Mock Interview w/ Kalissa', '19:00', '20:00', 'interview'],
  ['2025-02-12', 'MC Engagement Working', '20:00', '21:00', 'meeting'],

  ['2025-02-13', 'Ali interview', '09:15', '10:00', 'interview'],
  ['2025-02-13', 'Ali interview', '09:15', '10:00', 'interview'],
  ['2025-02-13', 'meeting w professor', '10:00', '11:00', 'meeting'],
  ['2025-02-13', 'Work', '11:00', '14:00', 'work'],
  ['2025-02-13', 'mike', '13:30', '14:15', 'meeting'],
  ['2025-02-13', 'Hangout w/ Sofia', '14:00', '17:15', 'social'],
  ['2025-02-13', 'Paula <> Cal Poly Students', '16:00', '16:30', 'meeting'],
  ['2025-02-13', 'PT', '18:00', '19:00', 'exercise'],
  ['2025-02-13', 'IME 403', '19:00', '21:00', 'class'],

  ['2025-02-14', 'CSC 307', '08:00', '10:00', 'class'],
  ['2025-02-14', 'Valentine plans', '18:30', '21:00', 'social'],

  ['2025-02-16', 'Long run', '09:00', '10:00', 'exercise'],
  ['2025-02-16', 'Meal prep', '17:00', '18:00', 'personal'],
  ['2025-02-17', 'CSC 307', '08:00', '10:00', 'class'],
  ['2025-02-17', 'gym', '10:30', '11:30', 'exercise'],
  ['2025-02-17', 'Work', '13:00', '16:30', 'work'],
  ['2025-02-17', 'Hack4Impact Designers', '17:00', '18:00', 'meeting'],
  ['2025-02-18', 'Meeting', '08:00', '09:00', 'meeting'],
  ['2025-02-18', 'Work', '10:00', '13:00', 'work'],
  ['2025-02-18', 'Career fair prep', '14:00', '15:00', 'meeting'],
  ['2025-02-18', 'IME 403', '19:00', '21:00', 'class'],
  ['2025-02-19', 'CSC 307', '08:00', '10:00', 'class'],
  ['2025-02-19', 'SNP Expert Call', '10:00', '10:45', 'meeting'],
  ['2025-02-19', 'BUS 490: O3-441', '13:00', '16:00', 'class'],
  ['2025-02-19', 'Founder interview prep', '16:30', '17:30', 'interview'],
  ['2025-02-19', 'Mock Interview w/ Kalissa', '19:00', '20:00', 'interview'],
  ['2025-02-20', 'Ali interview final round', '09:00', '10:00', 'interview'],
  ['2025-02-20', 'meeting w professor', '10:00', '11:00', 'meeting'],
  ['2025-02-20', 'Work', '11:00', '14:00', 'work'],
  ['2025-02-20', 'Team demo rehearsal', '14:30', '16:00', 'meeting'],
  ['2025-02-20', 'PT', '18:00', '19:00', 'exercise'],
  ['2025-02-20', 'IME 403', '19:00', '21:00', 'class'],
  ['2025-02-21', 'CSC 307', '08:00', '10:00', 'class'],
  ['2025-02-21', 'Hackathon kickoff', '17:00', '19:00', 'meeting'],
  ['2025-02-22', 'Hackathon work block', '10:00', '13:00', 'work'],
  ['2025-02-22', 'Dinner with friends', '18:00', '20:00', 'social'],
];

function localDateTime(day, time) {
  return `${day}T${time}:00${OFFSET}`;
}

function eventToCalendarItem([day, title, start, end, type], index) {
  const startDateTime = localDateTime(day, start);
  const endDateTime = localDateTime(day, end);
  const id = `${day.replaceAll('-', '')}-${start.replace(':', '')}-${index}`;
  return {
    kind: 'calendar#event',
    etag: `"demo-${id}"`,
    id,
    status: 'confirmed',
    htmlLink: `https://calendar.google.com/calendar/event?eid=${id}`,
    created: `${day}T07:00:00${OFFSET}`,
    updated: `${day}T07:00:00${OFFSET}`,
    summary: title,
    description: `Demo ${type} event for James's Pulse stress-load dataset.`,
    colorId: colorByType[type] ?? '1',
    creator: { email: 'james@example.com', self: true },
    organizer: { email: 'james@example.com', self: true },
    start: { dateTime: startDateTime, timeZone: TZ },
    end: { dateTime: endDateTime, timeZone: TZ },
    iCalUID: `${id}@google.com`,
    sequence: 0,
    reminders: { useDefault: true },
    eventType: 'default',
    extendedProperties: {
      private: {
        demo_type: type,
        pulse_persona: PERSONA.name,
      },
    },
  };
}

function normaliseCalendarEvent(item) {
  return {
    title: item.summary,
    start: item.start.dateTime,
    end: item.end.dateTime,
    type: item.extendedProperties.private.demo_type,
    google_event_id: item.id,
  };
}

function minutesBetween(startIso, endIso) {
  return Math.round((new Date(endIso) - new Date(startIso)) / 60000);
}

function computeDailyCalendar(items) {
  const byDate = {};
  for (const item of items) {
    const day = item.start.dateTime.slice(0, 10);
    if (!byDate[day]) byDate[day] = [];
    byDate[day].push(normaliseCalendarEvent(item));
  }

  const days = [];
  const cursor = new Date('2025-02-09T00:00:00Z');
  const end = new Date('2025-02-22T00:00:00Z');
  while (cursor <= end) {
    days.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  return days.map((date) => {
    const sorted = (byDate[date] ?? []).sort((a, b) => new Date(a.start) - new Date(b.start));
    const highStakes = sorted.filter((e) => /(interview|meeting|present|call|review|exam|demo)/i.test(e.title));
    const totalScheduledMinutes = sorted.reduce((sum, e) => sum + minutesBetween(e.start, e.end), 0);
    return {
      date,
      event_count: sorted.length,
      high_stakes_count: highStakes.length,
      total_scheduled_minutes: totalScheduledMinutes,
      events: sorted,
    };
  });
}

function computeFreeSlots(events, day = DEMO_TODAY) {
  const dayStart = localDateTime(day, '07:00');
  const dayEnd = localDateTime(day, '22:00');
  const sorted = events.slice().sort((a, b) => new Date(a.start) - new Date(b.start));
  const slots = [];
  let cursor = dayStart;

  for (const event of sorted) {
    if (new Date(event.start) > new Date(cursor)) {
      const minutes = minutesBetween(cursor, event.start);
      if (minutes >= 30) slots.push({ start: cursor, end: event.start, minutes });
    }
    if (new Date(event.end) > new Date(cursor)) cursor = event.end;
  }

  if (new Date(dayEnd) > new Date(cursor)) {
    const minutes = minutesBetween(cursor, dayEnd);
    if (minutes >= 30) slots.push({ start: cursor, end: dayEnd, minutes });
  }

  return slots;
}

function seconds(hours) {
  return Math.round(hours * 3600);
}

function readinessContributors(day, d) {
  return {
    activity_balance: Math.max(45, Math.min(96, d.activity - 4)),
    body_temperature: d.temp > 0.22 ? 56 : d.temp > 0.1 ? 72 : 90,
    hrv_balance: d.hrv < 60 ? 58 : d.hrv < 70 ? 72 : 88,
    previous_day_activity: Math.max(54, Math.min(95, d.activity)),
    previous_night: Math.round(d.readiness - (d.sleep < 6 ? 8 : 0)),
    recovery_index: d.hrv < 60 ? 39 : d.hrv < 70 ? 58 : 82,
    resting_heart_rate: d.rhr > 62 ? 55 : d.rhr > 58 ? 70 : 88,
    sleep_balance: day < '2025-02-16' ? null : Math.round(d.readiness - 4),
    sleep_regularity: day < '2025-02-16' ? null : Math.round(d.readiness - 7),
  };
}

function sleepContributors(d) {
  return {
    deep_sleep: d.sleep >= 7 ? 91 : d.sleep >= 6 ? 78 : 62,
    efficiency: d.sleep >= 6 ? 91 : 84,
    latency: d.sleep >= 7 ? 84 : 73,
    rem_sleep: d.sleep >= 7 ? 88 : d.sleep >= 6 ? 76 : 65,
    restfulness: d.stressMin < 60 ? 86 : d.stressMin < 100 ? 73 : 62,
    timing: d.sleep >= 7 ? 72 : 48,
    total_sleep: Math.round(Math.min(98, (d.sleep / 8) * 100)),
  };
}

function activityContributors(d) {
  return {
    meet_daily_targets: d.activity,
    move_every_hour: d.activity > 84 ? 92 : 74,
    recovery_time: d.stressMin > 100 ? 48 : d.stressMin > 70 ? 63 : 82,
    stay_active: d.activity > 84 ? 90 : 78,
    training_frequency: 82,
    training_volume: d.activity > 85 ? 88 : 72,
  };
}

function makeClass5Min(activityScore) {
  const blocks = [];
  for (let i = 0; i < 288; i += 1) {
    const hour = Math.floor(i / 12);
    if (hour < 6 || hour >= 23) blocks.push('1');
    else if (hour < 8) blocks.push('2');
    else if (hour >= 18 && hour <= 19 && activityScore > 78) blocks.push('4');
    else if (hour >= 10 && hour <= 16) blocks.push(activityScore > 84 ? '3' : '2');
    else blocks.push('2');
  }
  return blocks.join('');
}

function makeMetItems(activityScore) {
  return Array.from({ length: 96 }, (_, i) => {
    const hour = Math.floor(i / 4);
    if (hour < 6 || hour >= 23) return 0.95;
    if (hour >= 18 && hour <= 19 && activityScore > 78) return 4.2;
    if (hour >= 10 && hour <= 16) return activityScore > 84 ? 2.2 : 1.5;
    return 1.25;
  });
}

function makeOuraData() {
  const dates = Object.keys(dayLoad).sort();
  const daily_sleep = [];
  const daily_readiness = [];
  const daily_activity = [];
  const daily_spo2 = [];
  const daily_stress = [];
  const daily_resilience = [];
  const daily_cardiovascular_age = [];
  const sleep = [];
  const workouts = [];
  const heartrate = [];

  for (const day of dates) {
    const d = dayLoad[day];
    const sleepEnd = `${day}T07:18:00${OFFSET}`;
    const previousDay = new Date(`${day}T00:00:00Z`);
    previousDay.setUTCDate(previousDay.getUTCDate() - 1);
    const bedtimeDay = previousDay.toISOString().slice(0, 10);
    const sleepDuration = seconds(d.sleep);
    const awakeTime = d.sleep < 6 ? 4200 : d.sleep < 7 ? 3100 : 2100;
    const timeInBed = sleepDuration + awakeTime;

    daily_sleep.push({
      id: `daily_sleep_${day}`,
      day,
      score: Math.max(55, Math.round(54 + d.sleep * 5.2)),
      timestamp: sleepEnd,
      contributors: sleepContributors(d),
    });

    daily_readiness.push({
      id: `daily_readiness_${day}`,
      day,
      score: d.readiness,
      temperature_deviation: d.temp,
      temperature_trend_deviation: Math.round((d.temp * 0.62) * 100) / 100,
      contributors: readinessContributors(day, d),
    });

    daily_activity.push({
      id: `daily_activity_${day}`,
      day,
      score: d.activity,
      steps: Math.round(6200 + (d.activity - 70) * 220),
      total_calories: Math.round(2100 + d.activity * 9),
      active_calories: Math.round(280 + d.activity * 5.1),
      target_calories: 550,
      target_meters: 9000,
      meters_to_target: Math.max(0, Math.round(9000 - (6200 + (d.activity - 70) * 220))),
      equivalent_walking_distance: Math.round(6200 + (d.activity - 70) * 220),
      high_activity_time: d.activity > 84 ? 2400 : 900,
      medium_activity_time: d.activity > 78 ? 5200 : 3200,
      low_activity_time: 12600,
      sedentary_activity_time: d.stressMin > 100 ? 32200 : 28600,
      high_activity_met_minutes: d.activity > 84 ? 260 : 90,
      medium_activity_met_minutes: d.activity > 78 ? 310 : 190,
      low_activity_met_minutes: 240,
      sedentary_met_minutes: 480,
      average_met_minutes: Math.round((1.28 + (d.activity - 70) / 100) * 100) / 100,
      resting_time: Math.round(timeInBed + 4200),
      non_wear_time: 0,
      inactivity_alerts: d.stressMin > 100 ? 3 : d.stressMin > 70 ? 2 : 0,
      class_5_min: makeClass5Min(d.activity),
      met: { interval: 900, items: makeMetItems(d.activity) },
      contributors: activityContributors(d),
    });

    daily_spo2.push({
      id: `daily_spo2_${day}`,
      day,
      spo2_percentage: { average: d.temp > 0.2 ? 96.8 : 97.9 },
      breathing_disturbance_index: d.temp > 0.2 ? 1 : 0,
    });

    daily_stress.push({
      id: `daily_stress_${day}`,
      day,
      day_summary: d.stressMin > 110 ? 'pressured' : d.stressMin > 70 ? 'stressful' : d.recoveryMin > 100 ? 'restored' : 'normal',
      stress_high: d.stressMin * 60,
      recovery_high: d.recoveryMin * 60,
    });

    daily_resilience.push({
      id: `daily_resilience_${day}`,
      day,
      level: d.readiness >= 84 ? 'strong' : d.readiness >= 74 ? 'solid' : d.readiness >= 65 ? 'adequate' : 'limited',
      contributors: {
        sleep_recovery: d.sleep >= 7 ? 'strong' : d.sleep >= 6 ? 'adequate' : 'limited',
        daytime_recovery: d.recoveryMin > 100 ? 'strong' : d.recoveryMin > 50 ? 'adequate' : 'limited',
        stress: d.stressMin > 110 ? 'limited' : d.stressMin > 70 ? 'adequate' : 'solid',
      },
    });

    daily_cardiovascular_age.push({
      id: `daily_cardiovascular_age_${day}`,
      day,
      vascular_age: d.rhr > 62 ? 22 : 21,
      pulse_wave_velocity: Math.round((5.55 + (d.rhr - 52) * 0.025) * 100) / 100,
    });

    sleep.push({
      id: `sleep_${day}`,
      type: 'long_sleep',
      period: 0,
      day,
      bedtime_start: `${bedtimeDay}T${d.sleep < 6 ? '01:42' : d.sleep < 7 ? '00:38' : '23:42'}:00${OFFSET}`,
      bedtime_end: sleepEnd,
      time_in_bed: timeInBed,
      total_sleep_duration: sleepDuration,
      awake_time: awakeTime,
      latency: d.sleep < 6 ? 1080 : 720,
      efficiency: Math.round((sleepDuration / timeInBed) * 100),
      deep_sleep_duration: Math.round(sleepDuration * 0.18),
      light_sleep_duration: Math.round(sleepDuration * 0.55),
      rem_sleep_duration: Math.round(sleepDuration * 0.22),
      restless_periods: d.stressMin > 100 ? 268 : d.stressMin > 70 ? 230 : 170,
      average_heart_rate: d.rhr + 7,
      lowest_heart_rate: d.rhr - 4,
      average_hrv: d.hrv,
      average_breath: d.temp > 0.2 ? 15.2 : 14.3,
      low_battery_alert: false,
      heart_rate: { interval: 300, items: [d.rhr + 10, d.rhr + 6, d.rhr + 2, d.rhr - 2, d.rhr - 4, d.rhr] },
      hrv: { interval: 300, items: [d.hrv - 8, d.hrv - 4, d.hrv, d.hrv + 3, d.hrv + 5, d.hrv] },
      sleep_phase_5_min: '222211122233322221111222333222144422221111333222',
      sleep_phase_30_sec: '22222211111122222233333322222211111144442222223333332222',
      app_sleep_phase_5_min: '222111222333222111222333222144222111333222',
      movement_30_sec: d.stressMin > 100 ? '012333210123332101233321' : '001122100011221000112210',
      readiness: daily_readiness[daily_readiness.length - 1],
      readiness_score_delta: d.readiness - 76,
      sleep_score_delta: daily_sleep[daily_sleep.length - 1].score - 80,
      sleep_algorithm_version: 'v2',
      sleep_analysis_reason: 'foreground_sleep_analysis',
      ring_id: 'demo-gen4-james',
    });

    heartrate.push(
      { timestamp: `${day}T08:30:00${OFFSET}`, bpm: d.rhr + 18, source: 'awake', producer_timestamp: null },
      { timestamp: `${day}T10:30:00${OFFSET}`, bpm: d.rhr + (d.stressMin > 90 ? 32 : 22), source: 'awake', producer_timestamp: null },
      { timestamp: `${day}T13:30:00${OFFSET}`, bpm: d.rhr + (d.stressMin > 90 ? 36 : 24), source: 'awake', producer_timestamp: null },
      { timestamp: `${day}T18:30:00${OFFSET}`, bpm: d.activity > 78 ? 132 : d.rhr + 20, source: d.activity > 78 ? 'workout' : 'rest', producer_timestamp: null },
    );

    if (['2025-02-09', '2025-02-10', '2025-02-11', '2025-02-13', '2025-02-16', '2025-02-20'].includes(day)) {
      workouts.push({
        id: `workout_${day}`,
        activity: day === '2025-02-09' ? 'pickleball' : day === '2025-02-10' ? 'golf' : day === '2025-02-16' ? 'running' : 'strengthTraining',
        label: null,
        intensity: dayLoad[day].activity > 85 ? 'moderate' : 'easy',
        source: 'confirmed',
        start_datetime: `${day}T${day === '2025-02-09' ? '10:00' : day === '2025-02-16' ? '09:00' : '18:00'}:00${OFFSET}`,
        end_datetime: `${day}T${day === '2025-02-09' ? '12:00' : day === '2025-02-16' ? '10:00' : '19:00'}:00${OFFSET}`,
        day,
        calories: dayLoad[day].activity > 85 ? 460 : 310,
        distance: day === '2025-02-16' ? 6200 : null,
      });
    }
  }

  const today = dayLoad[DEMO_TODAY];
  return {
    persona: PERSONA,
    demo_today: DEMO_TODAY,
    today: {
      sleep_hours: today.sleep,
      hrv_ms: today.hrv,
      resting_hr_bpm: today.rhr,
      breathing_rate: today.temp > 0.2 ? 15.2 : 14.4,
      temperature_deviation_c: today.temp,
      readiness_score: today.readiness,
    },
    history: dates.map((date) => ({
      date,
      sleep_hours: dayLoad[date].sleep,
      hrv_ms: dayLoad[date].hrv,
      resting_hr_bpm: dayLoad[date].rhr,
      readiness_score: dayLoad[date].readiness,
      stress_high_minutes: dayLoad[date].stressMin,
      recovery_high_minutes: dayLoad[date].recoveryMin,
    })),
    oura_api_v2: {
      personal_info: {
        id: 'demo-james-oura-user',
        age: PERSONA.age,
        weight: 63.5,
        height: 1.7,
        biological_sex: 'male',
        email: 'james@example.com',
      },
      ring_configuration: {
        color: 'silver',
        design: null,
        firmware_version: '2.10.4',
        hardware_type: 'gen4',
        set_up_at: '2025-02-01T12:00:00-08:00',
        size: 9,
      },
      rest_mode_period: { data: [] },
      daily_sleep: { data: daily_sleep },
      daily_readiness: { data: daily_readiness },
      daily_activity: { data: daily_activity },
      daily_spo2: { data: daily_spo2 },
      daily_stress: { data: daily_stress },
      daily_resilience: { data: daily_resilience },
      daily_cardiovascular_age: { data: daily_cardiovascular_age },
      sleep: { data: sleep },
      session: { data: [] },
      tag: { data: [] },
      workout: { data: workouts },
      vO2_max: { data: [] },
      heartrate: { data: heartrate },
    },
    metric_reference: {
      daily_sleep: {
        score: '0-100 composite sleep quality score.',
        contributors: '0-100 subscores for total sleep, efficiency, restfulness, REM, deep sleep, latency, and timing.',
      },
      daily_readiness: {
        score: '0-100 recovery score for the day.',
        temperature_deviation: 'Skin temperature deviation from personal baseline in Celsius.',
        contributors: 'Recovery contributors including HRV balance, resting HR, previous night, recovery index, and body temperature.',
      },
      daily_activity: {
        score: '0-100 daily activity score.',
        steps: 'Raw steps.',
        calories: 'total_calories is total burn; active_calories is movement-only burn.',
        class_5_min: '288-character day timeline, one character per 5-minute block.',
        met: 'Metabolic equivalent timeline; higher values indicate more exertion.',
      },
      daily_spo2: {
        spo2_percentage: 'Average overnight blood oxygen percentage.',
        breathing_disturbance_index: 'Events per hour with breathing disturbance patterns.',
      },
      daily_stress: {
        stress_high: 'Seconds of high physiological stress while awake.',
        recovery_high: 'Seconds in high recovery state while awake.',
        day_summary: 'restored, normal, stressful, or pressured.',
      },
      sleep: {
        total_sleep_duration: 'Actual sleep seconds.',
        average_hrv: 'Nightly HRV in milliseconds; lower than baseline can indicate stress or poor recovery.',
        average_heart_rate: 'Nightly average heart rate in bpm.',
        sleep_phase_5_min: 'Hypnogram string; Oura codes sleep stages by interval.',
      },
      heartrate: {
        bpm: 'Heart rate sample in beats per minute.',
        source: 'Context such as awake, sleep, rest, workout, or live.',
      },
    },
  };
}

function writeJson(name, data) {
  fs.writeFileSync(path.join(FIXTURE_DIR, name), `${JSON.stringify(data, null, 2)}\n`);
}

const googleItems = calendarSeed.map(eventToCalendarItem);
const normalizedDays = computeDailyCalendar(googleItems);
const todayEvents = normalizedDays.find((day) => day.date === DEMO_TODAY).events;
const freeSlots = computeFreeSlots(todayEvents);
const calendar = {
  persona: PERSONA,
  demo_today: DEMO_TODAY,
  time_zone: TZ,
  source_note: 'Two-week mock dataset based on James calendar screenshot for Pulse hackathon demo.',
  events: todayEvents,
  free_slots: freeSlots,
  highlighted_slot: freeSlots.find((slot) => slot.start.includes('17:15:00')) ?? freeSlots[0] ?? null,
  two_week_summary: normalizedDays,
  google_calendar_api: {
    kind: 'calendar#events',
    etag: '"demo-james-two-weeks"',
    summary: 'James - Demo Calendar',
    description: 'Google Calendar API-style mock response for Feb 9-22, 2025.',
    timeZone: TZ,
    accessRole: 'owner',
    defaultReminders: [{ method: 'popup', minutes: 10 }],
    items: googleItems,
  },
};

const oura = makeOuraData();
const baseline = {
  sleep_baseline_hours: 7.0,
  hrv_7d_avg: 70,
  resting_hr_7d_avg: 58,
  readiness_7d_avg: 76,
  stress_high_minutes_7d_avg: 63,
  recovery_high_minutes_7d_avg: 74,
  approximated: false,
};
const llmResponse = {
  stress_level: 'High',
  drivers: [
    'Sleep 1.75h below baseline',
    'HRV 15ms below 7-day average',
    'Nine calendar events with interviews and evening class',
    'Only short recovery gaps before 6 PM',
  ],
  action_recommendation: 'Use the 5:15-6:00 PM gap for food, a walk, and no phone before PT and IME 403. Do not add another meeting there.',
  summary: 'James, your recovery is down and Thursday is stacked with interviews, work, meetings, PT, and class. Pulse should protect the 5:15 PM gap and keep nudges brief.',
};
const smsPreview = {
  to: '+15550134040',
  body: 'Morning James — Pulse sees high load today: low sleep, lower HRV, and a packed calendar. Protect 5:15-6:00 PM before PT and IME 403.',
};

writeJson('calendar.json', calendar);
writeJson('oura.json', oura);
writeJson('baseline.json', baseline);
writeJson('llm-response.json', llmResponse);
writeJson('sms-preview.json', smsPreview);

console.log(`Generated demo fixtures in ${FIXTURE_DIR}`);
