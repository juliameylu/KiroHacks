import type { Biometrics } from '../../types/assessment'
import ExpandableCard from '../ExpandableCard'

interface TemperatureCardProps {
  biometrics: Biometrics
  isOpen: boolean
  onToggle: () => void
}

/**
 * Builds the collapsed summary showing the skin temperature deviation.
 * e.g. "+0.3°C skin temperature deviation"
 */
function buildSummary(deviation: number | null | undefined): string {
  if (deviation == null) return 'Data unavailable'
  const sign = deviation > 0 ? '+' : ''
  return `${sign}${deviation}°C skin temperature deviation`
}

/**
 * Returns a one-sentence interpretation based on skin temperature deviation from baseline.
 * Thresholds: >0.5°C = strong above-baseline signal, 0.2–0.5°C = slight elevation,
 * -0.2 to 0.2°C = normal range, <-0.2°C = slightly lower (good recovery).
 */
function buildInterpretation(deviation: number): string {
  if (deviation > 0.5) {
    return `Skin temp is +${deviation}°C above baseline — your body may be fighting stress or early illness.`
  } else if (deviation >= 0.2) {
    return `Slight elevation of +${deviation}°C. Could reflect mild physiological stress or disrupted sleep.`
  } else if (deviation >= -0.2) {
    return 'Skin temperature is within your normal range.'
  } else {
    return `Skin temp is ${deviation}°C below baseline — typically a sign of good overnight recovery.`
  }
}

export default function TemperatureCard({ biometrics, isOpen, onToggle }: TemperatureCardProps) {
  const { temperature_deviation_c } = biometrics ?? {}

  const summary = buildSummary(temperature_deviation_c)

  const expandedContent = (
    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>
      {temperature_deviation_c == null ? (
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)' }}>Data unavailable</p>
      ) : (
        <>
          {/* Deviation row */}
          <p style={{
            margin: '0 0 10px',
            fontWeight: 600,
            color: 'rgba(255,255,255,0.85)',
            fontSize: 15,
          }}>
            Deviation: {temperature_deviation_c > 0 ? '+' : ''}{temperature_deviation_c}°C from baseline
          </p>
          {/* Interpretation */}
          <p style={{ margin: 0 }}>
            {buildInterpretation(temperature_deviation_c)}
          </p>
        </>
      )}
    </div>
  )

  return (
    <ExpandableCard
      title="Skin Temperature"
      icon="🌡️"
      summary={summary}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {expandedContent}
    </ExpandableCard>
  )
}
