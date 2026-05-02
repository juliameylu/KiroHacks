import type { Biometrics } from '../../types/assessment'
import ExpandableCard from '../ExpandableCard'

interface HRVCardProps {
  biometrics: Biometrics
  isOpen: boolean
  onToggle: () => void
}

/**
 * Builds the collapsed summary comparing today's HRV to the 7-day average.
 * e.g. "22ms — below your 7-day avg (42ms)"
 */
function buildSummary(hrv: number | null | undefined, avg: number | null | undefined): string {
  if (hrv == null || avg == null) return 'Data unavailable'

  if (hrv < avg) {
    return `${hrv}ms — below your 7-day avg (${avg}ms)`
  } else if (hrv > avg) {
    return `${hrv}ms — above your 7-day avg (${avg}ms)`
  } else {
    return `${hrv}ms — at your 7-day avg`
  }
}

/**
 * Returns a one-sentence interpretation based on HRV deviation from the 7-day average.
 * Thresholds: >10ms below = significant strain, 5–10ms below = mild, within 5ms = balanced, above = good.
 */
function buildInterpretation(hrv: number, avg: number): string {
  const diff = avg - hrv // positive = below average

  if (diff > 10) {
    return `HRV is ${diff}ms below your norm — a clear signal your nervous system is under load and recovery is incomplete.`
  } else if (diff >= 5) {
    return `HRV is ${diff}ms below average. Mild physiological stress — worth protecting your energy today.`
  } else if (diff > -5) {
    return 'HRV is tracking close to your average. Autonomic balance looks stable.'
  } else {
    return `HRV is ${Math.abs(diff)}ms above your norm — strong recovery signal heading into the day.`
  }
}

export default function HRVCard({ biometrics, isOpen, onToggle }: HRVCardProps) {
  const { hrv_ms, hrv_7d_avg } = biometrics ?? {}

  const summary = buildSummary(hrv_ms, hrv_7d_avg)

  const expandedContent = (
    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
      {hrv_ms == null || hrv_7d_avg == null ? (
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
            Today: {hrv_ms}ms &nbsp;|&nbsp; 7-day avg: {hrv_7d_avg}ms
          </p>
          {/* Interpretation */}
          <p style={{ margin: 0 }}>
            {buildInterpretation(hrv_ms, hrv_7d_avg)}
          </p>
        </>
      )}
    </div>
  )

  return (
    <ExpandableCard
      title="Heart Rate Variability"
      icon="💓"
      summary={summary}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {expandedContent}
    </ExpandableCard>
  )
}
