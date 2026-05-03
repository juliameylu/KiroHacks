import { useEffect, useState } from 'react'
import './AppLoadingScreen.css'

const MESSAGES = [
  'Syncing your body signals…',
  'Reading calendar load…',
  'Calculating your baseline…',
  'Preparing your daily brief…',
]

const INTERVAL_MS = 1275
const COMPLETE_MS = MESSAGES.length * INTERVAL_MS + 400

interface Props {
  onComplete: () => void
}

export default function AppLoadingScreen({ onComplete }: Props) {
  const [step, setStep] = useState(0)

  useEffect(() => {
    const iv = setInterval(() => setStep(s => Math.min(s + 1, MESSAGES.length - 1)), INTERVAL_MS)
    return () => clearInterval(iv)
  }, [])

  useEffect(() => {
    const t = setTimeout(onComplete, COMPLETE_MS)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <div className="als-root">
      <div className="als-brand">
        <span className="als-name">Pulse</span>
      </div>

      <div className="als-orb-wrap">
        <div className="als-ring als-ring-3" />
        <div className="als-ring als-ring-2" />
        <div className="als-ring als-ring-1" />
        <div className="als-orb" />
      </div>

      <div className="als-message-block">
        <span className="als-label">Analyzing</span>
        <span key={step} className="als-text">{MESSAGES[step]}</span>
      </div>

      <div className="als-steps">
        {MESSAGES.map((_, i) => (
          <span
            key={i}
            className={i < step ? 'als-dot done' : i === step ? 'als-dot active' : 'als-dot'}
          />
        ))}
      </div>
    </div>
  )
}
