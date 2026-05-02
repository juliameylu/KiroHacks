import type { StressLevel } from '../types/assessment'

interface StressHeaderProps {
  stressLevel: StressLevel
  summary: string
  stale: boolean
  lastUpdated: string // ISO 8601
}

/** Maps stress level to a display color */
function stressColor(level: StressLevel): string {
  switch (level) {
    case 'Elevated': return '#ef4444'
    case 'Moderate': return '#f59e0b'
    case 'Calm':     return '#22c55e'
  }
}

/** Maps stress level to a subtle background tint */
function stressBg(level: StressLevel): string {
  switch (level) {
    case 'Elevated': return 'rgba(239, 68, 68, 0.15)'
    case 'Moderate': return 'rgba(245, 158, 11, 0.15)'
    case 'Calm':     return 'rgba(34, 197, 94, 0.15)'
  }
}

/** Formats an ISO 8601 string as a human-readable date/time */
function formatLastUpdated(iso: string): string {
  try {
    const date = new Date(iso)
    if (isNaN(date.getTime())) return iso
    return date.toLocaleString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export default function StressHeader({ stressLevel, summary, stale, lastUpdated }: StressHeaderProps) {
  const color = stressColor(stressLevel)
  const bg = stressBg(stressLevel)

  return (
    <div style={{
      paddingTop: 32,
      paddingBottom: 24,
    }}>
      {/* Label */}
      <p style={{
        fontSize: 12,
        fontWeight: 600,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.45)',
        margin: '0 0 12px',
      }}>
        Today's Stress Forecast
      </p>

      {/* Stress level badge */}
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        background: bg,
        border: `1px solid ${color}40`,
        borderRadius: 12,
        padding: '8px 20px',
        marginBottom: 16,
      }}>
        {/* Colored dot */}
        <span style={{
          width: 10,
          height: 10,
          borderRadius: '50%',
          background: color,
          display: 'inline-block',
          flexShrink: 0,
          boxShadow: `0 0 8px ${color}80`,
        }} />
        <span style={{
          fontSize: 22,
          fontWeight: 700,
          color,
          letterSpacing: '-0.3px',
        }}>
          {stressLevel}
        </span>
      </div>

      {/* Summary text */}
      <p style={{
        fontSize: 15,
        lineHeight: 1.6,
        color: 'rgba(255,255,255,0.75)',
        margin: '0 0 0',
      }}>
        {summary}
      </p>

      {/* Stale indicator */}
      {stale && (
        <p style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.35)',
          margin: '10px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 4,
        }}>
          <span>⏱</span>
          Cached · {formatLastUpdated(lastUpdated)}
        </p>
      )}
    </div>
  )
}
