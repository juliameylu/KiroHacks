interface ErrorStateProps {
  message?: string
  onRetry: () => void
}

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '60vh',
      padding: '24px',
      textAlign: 'center',
    }}>
      {/* Error icon */}
      <span style={{ fontSize: 48, marginBottom: 16, lineHeight: 1 }}>⚠️</span>

      {/* Heading */}
      <h2 style={{
        fontSize: 20,
        fontWeight: 600,
        color: 'rgba(255,255,255,0.9)',
        margin: '0 0 10px',
        letterSpacing: '-0.2px',
      }}>
        Something went wrong
      </h2>

      {/* Error message */}
      <p style={{
        fontSize: 14,
        color: 'rgba(255,255,255,0.5)',
        margin: '0 0 28px',
        lineHeight: 1.6,
        maxWidth: 300,
      }}>
        {message ?? 'Unable to load your stress assessment. Please try again.'}
      </p>

      {/* Retry button */}
      <button
        onClick={onRetry}
        style={{
          background: 'linear-gradient(135deg, #a855f7, #7c3aed)',
          border: 'none',
          borderRadius: 10,
          padding: '12px 28px',
          fontSize: 15,
          fontWeight: 600,
          color: '#fff',
          cursor: 'pointer',
          letterSpacing: '-0.1px',
          boxShadow: '0 4px 16px rgba(168, 85, 247, 0.35)',
          transition: 'opacity 0.15s ease',
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
        onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
      >
        Retry
      </button>
    </div>
  )
}
