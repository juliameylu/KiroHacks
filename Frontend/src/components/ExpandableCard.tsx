import type { ReactNode } from 'react'

interface ExpandableCardProps {
  title: string
  icon?: string       // emoji icon shown in header
  summary: string     // shown when collapsed
  isOpen: boolean
  onToggle: () => void
  children: ReactNode // shown when expanded
}

export default function ExpandableCard({
  title,
  icon,
  summary,
  isOpen,
  onToggle,
  children,
}: ExpandableCardProps) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.05)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      padding: 16,
      marginBottom: 12,
      transition: 'border-color 0.2s ease',
      ...(isOpen ? { borderColor: 'rgba(168, 85, 247, 0.35)' } : {}),
    }}>
      {/* Clickable header row */}
      <button
        onClick={onToggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          background: 'none',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          textAlign: 'left',
          gap: 10,
        }}
        aria-expanded={isOpen}
      >
        {/* Icon */}
        {icon && (
          <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>
            {icon}
          </span>
        )}

        {/* Title */}
        <span style={{
          flex: 1,
          fontSize: 15,
          fontWeight: 600,
          color: 'rgba(255,255,255,0.9)',
          letterSpacing: '-0.1px',
        }}>
          {title}
        </span>

        {/* Chevron — rotates when open */}
        <span style={{
          fontSize: 12,
          color: 'rgba(255,255,255,0.4)',
          transition: 'transform 0.2s ease',
          transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
          display: 'inline-block',
          flexShrink: 0,
        }}>
          ▼
        </span>
      </button>

      {/* Collapsed summary — hidden when open */}
      {!isOpen && (
        <p style={{
          margin: '8px 0 0',
          fontSize: 13,
          color: 'rgba(255,255,255,0.5)',
          lineHeight: 1.5,
          paddingLeft: icon ? 28 : 0,
        }}>
          {summary}
        </p>
      )}

      {/* Expanded content */}
      {isOpen && (
        <div style={{
          marginTop: 14,
          paddingTop: 14,
          borderTop: '1px solid rgba(255,255,255,0.08)',
        }}>
          {children}
        </div>
      )}
    </div>
  )
}
