import type { Schedule, FreeSlot } from '../../types/assessment'
import ExpandableCard from '../ExpandableCard'

interface ScheduleCardProps {
  schedule: Schedule
  isOpen: boolean
  onToggle: () => void
}

/**
 * Formats an ISO 8601 datetime string as "h:MM AM/PM".
 * e.g. "2026-05-02T15:30:00-07:00" → "3:30 PM"
 */
function formatTime(iso: string | null | undefined): string {
  if (!iso) return 'N/A'
  try {
    const date = new Date(iso)
    if (isNaN(date.getTime())) return 'N/A'
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? 'PM' : 'AM'
    const h = hours % 12 || 12
    const mm = String(minutes).padStart(2, '0')
    return `${h}:${mm} ${ampm}`
  } catch {
    return 'N/A'
  }
}

/**
 * Builds the collapsed summary line.
 * e.g. "5 events today · Free at 3:30 PM"
 */
function buildSummary(schedule: Schedule | null | undefined): string {
  if (!schedule) return 'Data unavailable'
  const count = schedule.event_count ?? schedule.events?.length ?? 0
  const eventText = `${count} event${count !== 1 ? 's' : ''} today`
  if (schedule.highlighted_slot) {
    return `${eventText} · Free at ${formatTime(schedule.highlighted_slot.start)}`
  }
  return eventText
}

/** Checks whether a given slot is the highlighted slot */
function isHighlighted(slot: FreeSlot, highlighted: FreeSlot | null): boolean {
  if (!highlighted) return false
  return slot.start === highlighted.start && slot.end === highlighted.end
}

export default function ScheduleCard({ schedule, isOpen, onToggle }: ScheduleCardProps) {
  if (!schedule) {
    return (
      <ExpandableCard
        title="Schedule"
        icon="📅"
        summary="Data unavailable"
        isOpen={isOpen}
        onToggle={onToggle}
      >
        <p style={{ margin: 0, fontSize: 14, color: 'rgba(255,255,255,0.4)' }}>Data unavailable</p>
      </ExpandableCard>
    )
  }

  const summary = buildSummary(schedule)
  const events = schedule.events ?? []
  const freeSlots = schedule.free_slots ?? []

  const expandedContent = (
    <div style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)', lineHeight: 1.6 }}>

      {/* Events section */}
      <p style={{
        margin: '0 0 8px',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.35)',
      }}>
        Events
      </p>

      {events.length === 0 ? (
        <p style={{ margin: '0 0 16px', color: 'rgba(255,255,255,0.4)' }}>
          No events scheduled today
        </p>
      ) : (
        <ul style={{ margin: '0 0 16px', padding: 0, listStyle: 'none' }}>
          {events.map((event, i) => (
            <li key={i} style={{
              padding: '6px 0',
              borderBottom: i < events.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              color: 'rgba(255,255,255,0.75)',
            }}>
              <span style={{ color: 'rgba(255,255,255,0.45)', marginRight: 6 }}>
                {formatTime(event.start)} – {formatTime(event.end)}:
              </span>
              {event.title}
            </li>
          ))}
        </ul>
      )}

      {/* Free slots section */}
      <p style={{
        margin: '0 0 8px',
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.35)',
      }}>
        Free Slots
      </p>

      {freeSlots.length === 0 ? (
        <p style={{ margin: 0, color: 'rgba(255,255,255,0.4)' }}>
          No free slots available
        </p>
      ) : (
        <ul style={{ margin: 0, padding: 0, listStyle: 'none' }}>
          {freeSlots.map((slot, i) => {
            const highlighted = isHighlighted(slot, schedule.highlighted_slot)
            return (
              <li key={i} style={{
                padding: '7px 10px',
                marginBottom: 6,
                borderRadius: 8,
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                // Highlighted slot gets accent styling
                background: highlighted
                  ? 'rgba(168, 85, 247, 0.15)'
                  : 'rgba(255,255,255,0.04)',
                border: highlighted
                  ? '1px solid rgba(168, 85, 247, 0.4)'
                  : '1px solid rgba(255,255,255,0.07)',
              }}>
                {highlighted && (
                  <span style={{ fontSize: 13, flexShrink: 0 }}>⭐</span>
                )}
                <span style={{
                  color: highlighted ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.6)',
                  fontWeight: highlighted ? 600 : 400,
                }}>
                  {formatTime(slot.start)} – {formatTime(slot.end)}
                </span>
                {highlighted && (
                  <span style={{
                    fontSize: 11,
                    color: '#c084fc',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    marginLeft: 'auto',
                  }}>
                    Recommended reset
                  </span>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )

  return (
    <ExpandableCard
      title="Schedule"
      icon="📅"
      summary={summary}
      isOpen={isOpen}
      onToggle={onToggle}
    >
      {expandedContent}
    </ExpandableCard>
  )
}
