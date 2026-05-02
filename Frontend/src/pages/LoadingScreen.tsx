import { useEffect, useRef, useState } from 'react'
import type { AssessmentResponse } from '../types/assessment'
import './LoadingScreen.css'

const API_BASE = '' // Vite proxy forwards /api/* to localhost:3001
const MIN_DISPLAY_MS = 3000
const MESSAGE_INTERVAL_MS = 750

const STEPS: Array<{ message: string; label: string }> = [
  { message: 'Analyzing sleep debt...', label: 'Oura sleep + recovery' },
  { message: 'Checking HRV and heart rate trends...', label: 'Body signals' },
  { message: 'Reading today\'s calendar load...', label: 'Calendar events' },
  { message: 'Finding your best recovery window...', label: 'Daily recommendation' },
]

interface LoadingScreenProps {
  onSuccess: (data: AssessmentResponse) => void
  onError: (error: string) => void
}

export default function LoadingScreen({ onSuccess, onError }: LoadingScreenProps) {
  const [stepIndex, setStepIndex] = useState(0)
  const [messageKey, setMessageKey] = useState(0)
  const resolvedRef = useRef<{ data: AssessmentResponse | null; error: string | null }>({
    data: null,
    error: null,
  })
  const startTimeRef = useRef(Date.now())
  const doneRef = useRef(false)

  // Advance through steps on a fixed interval
  useEffect(() => {
    const interval = setInterval(() => {
      setStepIndex(i => {
        const next = Math.min(i + 1, STEPS.length - 1)
        setMessageKey(k => k + 1)
        return next
      })
    }, MESSAGE_INTERVAL_MS)
    return () => clearInterval(interval)
  }, [])

  // Fetch assessment data, respecting the 3s minimum display time
  useEffect(() => {
    let cancelled = false

    async function fetchData() {
      try {
        let response = await fetch(`${API_BASE}/api/assessment`)

        if (response.status === 503) {
          const refreshRes = await fetch(`${API_BASE}/api/refresh`, { method: 'POST' })
          if (!refreshRes.ok) {
            const body = await refreshRes.json().catch(() => ({}))
            throw new Error(body.error ?? `Refresh failed with status ${refreshRes.status}`)
          }
          response = await fetch(`${API_BASE}/api/assessment`)
        }

        if (!response.ok) {
          const body = await response.json().catch(() => ({}))
          throw new Error(body.error ?? `Unexpected status ${response.status}`)
        }

        const data: AssessmentResponse = await response.json()
        resolvedRef.current = { data, error: null }
      } catch (err) {
        resolvedRef.current = {
          data: null,
          error: err instanceof Error ? err.message : 'An unknown error occurred',
        }
      }

      if (cancelled) return

      // Enforce minimum 3s display time
      const elapsed = Date.now() - startTimeRef.current
      const remaining = MIN_DISPLAY_MS - elapsed

      const finish = () => {
        if (cancelled || doneRef.current) return
        doneRef.current = true
        const { data, error } = resolvedRef.current
        if (data) {
          onSuccess(data)
        } else {
          onError(error ?? 'An unknown error occurred')
        }
      }

      if (remaining > 0) {
        setTimeout(finish, remaining)
      } else {
        finish()
      }
    }

    fetchData()
    return () => { cancelled = true }
  }, [onSuccess, onError])

  const progress = Math.min(((stepIndex + 1) / STEPS.length) * 100, 100)
  const currentStep = STEPS[stepIndex]

  return (
    <div className="loading-screen">
      <div className="loading-glow loading-glow--purple" aria-hidden="true" />
      <div className="loading-glow loading-glow--blue" aria-hidden="true" />

      <div className="loading-logo" aria-label="Reflect">Reflect</div>

      <div className="loading-spinner-wrap" role="status" aria-label="Loading">
        <div className="loading-spinner" />
        <div className="loading-spinner-inner" />
        <div className="loading-spinner-core" />
      </div>

      <div className="loading-message-wrap" aria-live="polite" aria-atomic="true">
        <p key={messageKey} className="loading-message">
          {currentStep.message}
        </p>
      </div>

      <ol className="loading-steps" aria-label="Analysis steps">
        {STEPS.map((step, i) => (
          <li
            key={step.label}
            className={
              i < stepIndex
                ? 'loading-step loading-step--done'
                : i === stepIndex
                  ? 'loading-step loading-step--active'
                  : 'loading-step'
            }
          >
            <span className="loading-step-dot" aria-hidden="true" />
            {step.label}
          </li>
        ))}
      </ol>

      <div
        className="loading-progress-bar"
        role="progressbar"
        aria-valuenow={Math.round(progress)}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div className="loading-progress-fill" style={{ width: `${progress}%` }} />
      </div>
    </div>
  )
}
