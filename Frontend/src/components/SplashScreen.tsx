import { useEffect } from 'react'
import './SplashScreen.css'

interface Props {
  onComplete: () => void
}

export default function SplashScreen({ onComplete }: Props) {
  useEffect(() => {
    const t = setTimeout(onComplete, 2200)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <div className="splash-root">
      <div className="splash-orb" />
      <span className="splash-wordmark">Pulse</span>
      <div className="splash-bar-track">
        <div className="splash-bar-fill" />
      </div>
    </div>
  )
}
