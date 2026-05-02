import '../index.css'

interface ReflectLandingProps {
  onStart: () => void
}

export default function ReflectLanding({ onStart }: ReflectLandingProps) {
  return (
    <div className="landing-root">
      <div className="landing-glow landing-glow--purple" aria-hidden="true" />
      <div className="landing-glow landing-glow--blue" aria-hidden="true" />

      <div className="landing-content">
        <div className="landing-logo" aria-label="Reflect">Reflect</div>

        <p className="landing-tagline">
          Your daily stress signal, powered by body data and calendar context.
        </p>

        <button
          className="landing-start-btn"
          type="button"
          onClick={onStart}
        >
          Check my signals
        </button>
      </div>
    </div>
  )
}
