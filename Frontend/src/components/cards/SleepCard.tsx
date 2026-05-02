import type { Biometrics } from '../../types/assessment'
import ExpandableCard from '../ExpandableCard'

interface SleepCardProps {
  biometrics: Biometrics
  isOpen: boolean
  onToggle: () => void
}

/**
 * Builds the collapsed summary line comparing today's sleep to baseline.
 * e.g. "5h — 2.5h below your baseline"
 */
function buildSummary(sleepHours: number | null | undefined, baseline: number | null | undefined): string {
  if (sleepHours == null || baseline == null) return 'Data unavailable'

  const diff = Math.round(Math.abs(baseline - sleepHours) * 10) / 10

  if (baseline - sleepHours > 0.05) {
    return `${sleepHours}h — ${diff}h below your baseline`
  } else if (sleepHours - baseline > 0.05) {
    return `${sleepHours}h — ${diff}h above your baseline`
  } else {
    return `${sleepHours}h — at your baseline`
  }
}

/**
 * Returns a one-sentence interpretation based on how far sleep deviates from baseline.
 * Thresholds: >1h below = significant, 0.5–1h below = mild, within 0.5h = normal, above = good.
 */
function buildInterpretation(sleepHours: number, baseline: number): string {
  const diff = baseline - sleepHours // positive = below baseline

  if (diff > 1) {
    return `${diff.toFixed(1)}h of lost sleep raises cortisol and blunts focus — your body is starting the day in deficit.`
  } else if (diff >= 0.5) {
    return 'Slightly short of your norm. Expect a dip in afternoon energy — plan your hardest work for the morning.'
  } else if (diff > -0.5) {
    return 'Sleep was on par with your baseline — solid foundation heading into the day.'
  } else {
    return 'Extra sleep logged. Your nervous system had more time to repair — a good sign for resilience today.'
  }
}

export default function SleepCard({ biometrics, isOpen, onToggle }: SleepCardProps) {
  const { sleep_hours, sleep_baseline_hours } = biometrics ?? {}

  const summary = buildSummary(sleep_hours, sleep_baseline_hours)

  const expandedContent = (
    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
      {sleep_hours == null || sleep_baseline_hours == null ? (
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
            Tonight: {sleep_hours}h &nbsp;|&nbsp; Baseline: {sleep_baseline_hours}h
          </p>
          {/* Interpretation */}
          <p style={{ margin: 0 }}>
            {buildInterpretation(sleep_hours, sleep_baseline_hours)}
          </p>
        </>
      )}
    </div>
  )

  return (
    <ExpandableCard
      title="Sleep"
      icon="🌙"
      summary={summary}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {expandedContent}
    </ExpandableCard>
  )
}
