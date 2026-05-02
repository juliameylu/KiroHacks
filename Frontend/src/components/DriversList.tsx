interface DriversListProps {
  drivers: string[]
}

export default function DriversList({ drivers }: DriversListProps) {
  if (!drivers || drivers.length === 0) return null

  return (
    <div style={{ marginBottom: 24 }}>
      {/* Section label */}
      <p style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: 'rgba(255,255,255,0.4)',
        margin: '0 0 10px',
      }}>
        Key Stress Signals
      </p>

      {/* Pills row — wraps if needed */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: 8,
      }}>
        {drivers.map((driver, i) => (
          <span
            key={i}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: 999,
              padding: '5px 12px',
              fontSize: 13,
              fontWeight: 500,
              color: 'rgba(252, 165, 165, 0.9)',
              lineHeight: 1,
            }}
          >
            {/* Small warning dot */}
            <span style={{
              width: 5,
              height: 5,
              borderRadius: '50%',
              background: '#f87171',
              display: 'inline-block',
              flexShrink: 0,
            }} />
            {driver}
          </span>
        ))}
      </div>
    </div>
  )
}
