interface ActionBannerProps {
  recommendation: string
}

export default function ActionBanner({ recommendation }: ActionBannerProps) {
  return (
    <div style={{
      background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.25) 0%, rgba(139, 92, 246, 0.15) 100%)',
      border: '1px solid rgba(168, 85, 247, 0.4)',
      borderRadius: 16,
      padding: '20px 20px',
      marginBottom: 20,
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle glow accent in top-right */}
      <div style={{
        position: 'absolute',
        top: -20,
        right: -20,
        width: 80,
        height: 80,
        borderRadius: '50%',
        background: 'rgba(168, 85, 247, 0.2)',
        filter: 'blur(20px)',
        pointerEvents: 'none',
      }} />

      {/* Label row */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        marginBottom: 10,
      }}>
        <span style={{ fontSize: 18 }}>⚡</span>
        <span style={{
          fontSize: 11,
          fontWeight: 700,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          color: '#c084fc',
        }}>
          Today's Reset Plan
        </span>
      </div>

      {/* Recommendation text */}
      <p style={{
        fontSize: 16,
        fontWeight: 500,
        lineHeight: 1.55,
        color: 'rgba(255,255,255,0.92)',
        margin: 0,
      }}>
        {recommendation}
      </p>
    </div>
  )
}
