import type { Biometrics } from '../../types/assessment'
import ExpandableCard from '../ExpandableCard'

interface HeartRateCardProps {
  biometrics: Biometrics
  isOpen: boolean
  onToggle: () => void
}

/**
 * Builds the collapsed summary comparing today's resting HR to the 7-day average.
 * e.g. "72bpm — above your 7-day avg (59bpm)"
 */
function buildSummary(hr: number | null | undefined, avg: number | null | undefined): string {
  if (hr == null || avg == null) return 'Data unavailable'

  if (hr > avg) {
    return `${hr}bpm — above your 7-day avg (${avg}bpm)`
  } else if (hr < avg) {
    return `${hr}bpm — below your 7-day avg (${avg}bpm)`
  } else {
    return `${hr}bpm — at your 7-day avg`
  }
}

/**
 * Returns a one-sentence interpretation based on resting HR deviation from the 7-day average.
 * Thresholds: >5bpm above = elevated stress signal, 2–5bpm above = slight elevation,
 * within 2bpm = normal, below = good cardiovascular recovery.
 */
function buildInterpretation(hr: number, avg: number): string {
  const diff = hr - avg // positive = above average (elevated)

  if (diff > 5) {
    return `Resting HR is ${diff}bpm above your norm — your heart is working harder at rest, a reliable marker of stress or incomplete recovery.`
  } else if (diff >= 2) {
    return `Resting HR is ${diff}bpm above average. Mild elevation — keep an eye on it through the day.`
  } else if (diff > -2) {
    return 'Resting HR is right on your average. Cardiovascular load looks normal.'
  } else {
    return `Resting HR is ${Math.abs(diff)}bpm below your norm — a strong recovery signal.`
  }
}

export default function HeartRateCard({ biometrics, isOpen, onToggle }: HeartRateCardProps) {
  const { resting_hr_bpm, resting_hr_7d_avg } = biometrics ?? {}

  const summary = buildSummary(resting_hr_bpm, resting_hr_7d_avg)

  const expandedContent = (
    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
      {resting_hr_bpm == null || resting_hr_7d_avg == null ? (
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)' }}>Data unavailable</p>
      ) : (
        <>
          {/* Comparison row */}
          <p style={{
            margin: '0 0 10px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            fontSize: 15,
          }}>
            Today: {resting_hr_bpm}bpm &nbsp;|&nbsp; 7-day avg: {resting_hr_7d_avg}bpm
          </p>
          {/* Interpretation */}
          <p style={{ margin: 0 }}>
            {buildInterpretation(resting_hr_bpm, resting_hr_7d_avg)}
          </p>
        </>
      )}
    </div>
  )

  return (
    <ExpandableCard
      title="Resting Heart Rate"
      icon="❤️"
      summary={summary}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {expandedContent}
    </ExpandableCard>
  )
}
