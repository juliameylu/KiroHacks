import { useCallback, useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'
import AppLoadingScreen from '../components/AppLoadingScreen'
import SplashScreen from '../components/SplashScreen'
import './stressCopilot.css'

type IconProps = { size?: number; className?: string }
type IconComponent = (props: IconProps) => ReactElement
type ViewId = 'today' | 'week' | 'messages' | 'history' | 'settings'
type SourceId = 'oura' | 'calendar' | 'imessage'
type StressState = 'high'
type MessageScript = 'morning' | 'midday' | 'support'
type ResponseMode = 'brief' | 'gentle' | 'direct' | 'quiet'

type OnboardingValues = {
  googleLogin: string
  ouraLogin: string
  phoneNumber: string
}

type Source = {
  id: SourceId
  label: string
  description: string
  detail: string
  connected: boolean
  lastSync: string
}

type Activity = {
  id: number
  title: string
  detail: string
  time: string
  tone?: 'quiet' | 'action'
}

const Icon = {
  Oura: ({ size = 20, className }: IconProps) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" opacity=".35" />
    </svg>
  ),
  Calendar: ({ size = 20, className }: IconProps) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden="true">
      <rect x="4" y="5" width="16" height="15" rx="2.5" />
      <path d="M4 9.5h16M8.5 3v4M15.5 3v4" />
    </svg>
  ),
  Message: ({ size = 20, className }: IconProps) => (
    <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 6.5C5 5.12 6.12 4 7.5 4h9C17.88 4 19 5.12 19 6.5v7c0 1.38-1.12 2.5-2.5 2.5h-7L5.5 19v-3a2 2 0 0 1-.5-1.32V6.5z" />
    </svg>
  ),
  Sleep: ({ size = 18, className }: IconProps) => (
    <svg className={className} width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14 10.7A5.7 5.7 0 0 1 7.3 4a5.7 5.7 0 1 0 6.7 6.7z" />
    </svg>
  ),
  Heart: ({ size = 18, className }: IconProps) => (
    <svg className={className} width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 15s-5.8-3.4-5.8-8A3.4 3.4 0 0 1 9 4.5 3.4 3.4 0 0 1 14.8 7c0 4.6-5.8 8-5.8 8z" />
    </svg>
  ),
  Bell: ({ size = 18, className }: IconProps) => (
    <svg className={className} width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 13h9l-1.1-1.7V8a3.4 3.4 0 0 0-6.8 0v3.3L4.5 13zM7.6 14.5a1.4 1.4 0 0 0 2.8 0" />
    </svg>
  ),
  Lock: ({ size = 18, className }: IconProps) => (
    <svg className={className} width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3.5" y="8" width="11" height="7" rx="1.4" />
      <path d="M5.6 8V5.8a3.4 3.4 0 0 1 6.8 0V8" />
    </svg>
  ),
  Memory: ({ size = 18, className }: IconProps) => (
    <svg className={className} width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 3c-2.2 0-3.7 1.3-3.7 3.1 0 .7.2 1.3.6 1.8-.4.5-.6 1.1-.6 1.8 0 1.8 1.5 3.1 3.7 3.1s3.7-1.3 3.7-3.1c0-.7-.2-1.3-.6-1.8.4-.5.6-1.1.6-1.8C12.7 4.3 11.2 3 9 3z" />
      <path d="M9 3v12M6.8 6.2h.01M11.2 10.6h.01" />
    </svg>
  ),
  Door: ({ size = 18, className }: IconProps) => (
    <svg className={className} width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.35" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4.5 15V3h7v12M4.5 15h9M11.5 9h.01" />
    </svg>
  ),
  Check: ({ size = 18, className }: IconProps) => (
    <svg className={className} width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3.4 9.2 7.2 12.8 14.7 5.4" />
    </svg>
  ),
  Spark: ({ size = 18, className }: IconProps) => (
    <svg className={className} width={size} height={size} viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.45" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M9 2.5 10.6 7.1 15.2 9 10.6 10.9 9 15.5 7.4 10.9 2.8 9 7.4 7.1 9 2.5z" />
    </svg>
  ),
  Wifi: ({ size = 13, className }: IconProps) => (
    <svg className={className} width={size} height={size} viewBox="0 0 16 12" fill="currentColor" aria-hidden="true">
      <path d="M8 2C5.5 2 3.3 2.9 1.6 4.4l1.4 1.5C4.3 4.7 6.1 4 8 4s3.7.7 5 1.9l1.4-1.5C12.7 2.9 10.5 2 8 2zm0 3.4c-1.6 0-3 .6-4.1 1.6l1.4 1.5C6.1 7.8 7 7.4 8 7.4s1.9.4 2.7 1.1l1.4-1.5c-1.1-1-2.5-1.6-4.1-1.6zM8 8.8a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
    </svg>
  ),
  Battery: ({ size = 13, className }: IconProps) => (
    <svg className={className} width={size * 1.8} height={size} viewBox="0 0 24 12" fill="none" aria-hidden="true">
      <rect x=".5" y=".5" width="20" height="11" rx="2.5" stroke="currentColor" />
      <rect x="2" y="2" width="17" height="8" rx="1.5" fill="currentColor" />
      <rect x="21" y="4" width="2" height="4" rx="1" fill="currentColor" />
    </svg>
  ),
}

const viewLabels: Record<ViewId, string> = {
  today: 'Today',
  week: 'Week',
  messages: 'Messages',
  history: 'History',
  settings: 'Settings',
}

const navItems: Array<{ id: ViewId; icon: IconComponent }> = [
  { id: 'today', icon: Icon.Spark },
]

const fakeNavItems: Array<{ label: string; icon: IconComponent }> = [
  { label: 'Week', icon: Icon.Calendar },
  { label: 'Messages', icon: Icon.Message },
  { label: 'Patterns', icon: Icon.Memory },
]

const sourceIcons: Record<SourceId, IconComponent> = {
  oura: Icon.Oura,
  calendar: Icon.Calendar,
  imessage: Icon.Message,
}

const initialSources: Source[] = [
  {
    id: 'oura',
    label: 'Oura',
    description: 'Sleep, HRV, resting heart rate, and temperature trends.',
    detail: 'Required for body signals',
    connected: true,
    lastSync: '6 min ago',
  },
  {
    id: 'calendar',
    label: 'Google Calendar',
    description: 'Meeting density, open windows, and protected blocks.',
    detail: 'Placeholder OAuth flow',
    connected: true,
    lastSync: '2 min ago',
  },
  {
    id: 'imessage',
    label: 'iMessage',
    description: 'Delivery channel for quiet nudges and support mode.',
    detail: 'Phone number required',
    connected: false,
    lastSync: 'Not connected',
  },
]

const stateCopy: Record<
  StressState,
  {
    label: string
    headline: string
    summary: string
    score: number
    drivers: Array<{ label: string; detail: string; explanation: string; icon: IconComponent; value: string; meter: number; tone: 'good' | 'watch' | 'high' }>
    action: { title: string; detail: string; cta: string }
  }
> = {
  high: {
    label: 'High load',
    headline: 'High load',
    summary: 'Today will ask more from you — we\'ll help you pace it.',
    score: 72,
    drivers: [
      {
        label: 'Sleep',
        detail: '5h sleep, 2.5h below baseline',
        explanation: 'Shorter sleep can make focus, emotion regulation, and physical recovery less reliable. Pulse is using this as a readiness signal, not a diagnosis.',
        icon: Icon.Sleep,
        value: '-2.5h',
        meter: 26,
        tone: 'watch',
      },
      {
        label: 'HRV',
        detail: '22 ms vs 48 ms baseline',
        explanation: 'Lower HRV can show that the body has less recovery capacity this morning, especially when it appears alongside short sleep.',
        icon: Icon.Heart,
        value: '-26 ms',
        meter: 30,
        tone: 'watch',
      },
      {
        label: 'Resting signals',
        detail: 'Heart rate and breathing rate are above usual',
        explanation: 'Higher resting heart rate, slightly faster breathing, micromovements, and a small temperature shift can all add context when the body is under strain.',
        icon: Icon.Heart,
        value: '+12 bpm',
        meter: 64,
        tone: 'watch',
      },
      {
        label: 'Calendar',
        detail: 'Class block plus 11 AM midterm',
        explanation: 'A long class block from 9 AM-2 PM and a midterm at 11 AM leave less room to recover before the evening study group.',
        icon: Icon.Calendar,
        value: 'Dense',
        meter: 88,
        tone: 'high',
      },
      {
        label: 'Recovery gap',
        detail: '3:30 PM is the cleanest reset window',
        explanation: 'The 3:30-4:00 PM gap is early enough to help before the evening, and short enough that it should not disrupt the rest of the schedule.',
        icon: Icon.Spark,
        value: '3:30',
        meter: 70,
        tone: 'good',
      },
    ],
    action: { title: 'Use 3:30-4:00 PM for a short reset', detail: 'Take a nap, quiet walk, or no-screen break before study group. Pulse can hold the slot and remind Alex a few minutes before.', cta: 'Hold reset' },
  },
}

const weekRows = [
  { day: 'Mon', date: 'Apr 28', state: 'Low load', load: 32, sleep: '7h 51m', note: '2 buffers held' },
  { day: 'Tue', date: 'Apr 29', state: 'Low load', load: 28, sleep: '7h 32m', note: 'No nudges' },
  { day: 'Wed', date: 'Apr 30', state: 'Steady load', load: 64, sleep: '6h 14m', note: 'Afternoon stack' },
  { day: 'Thu', date: 'May 01', state: 'High load', load: 82, sleep: '5h 08m', note: 'Roadmap review' },
  { day: 'Fri', date: 'May 02', state: 'High load', load: 68, sleep: '5h 48m', note: 'Today', today: true },
]

const heatRows = [
  [0, 0, 0, 0, 0, 0, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 2, 2, 1, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 1, 2, 3, 3, 2, 2, 2, 3, 3, 3, 2, 2, 1, 1, 1, 0, 0],
  [0, 0, 0, 0, 0, 0, 1, 2, 2, 3, 3, 2, 3, 3, 4, 4, 5, 4, 3, 2, 2, 1, 1, 0],
  [0, 0, 0, 0, 0, 0, 1, 2, 3, 3, 3, 3, 4, 4, 4, 5, 5, 5, 4, 3, 2, 2, 1, 0],
  [0, 0, 0, 0, 0, 0, 1, 2, 3, 2, 2, 2, 2, 3, 3, 2, 2, 2, 1, 1, 1, 1, 0, 0],
]

const historyEvents = [
  { when: 'Wed 4:00 PM', name: 'Eng leadership sync', effect: '+24 load', detail: '4 of 4 weeks' },
  { when: 'Thu 3:00 PM', name: 'Roadmap review', effect: '+19 load', detail: '3 of 4 weeks' },
  { when: 'Tue 9:00 AM', name: '1:1 with Priya', effect: '+8 load', detail: 'mild watch' },
  { when: 'Fri 9:30 AM', name: 'Design review', effect: '-6 load', detail: 'low load window' },
]

const scripts: Record<MessageScript, { label: string; messages: Array<{ from: 'in' | 'out' | 'tap'; text?: string; taps?: string[] }> }> = {
  morning: {
    label: 'Morning brief',
    messages: [
      { from: 'in', text: 'Morning Alex. High load today: 5h sleep, lower HRV, and class from 9-2 with an 11 AM midterm.' },
      { from: 'in', text: 'Use your 3:30 PM gap for a short reset or nap. Open Pulse for the details.' },
      { from: 'out', text: 'Hold 3:30.' },
      { from: 'in', text: "Done. I'll remind you a few minutes before." },
      { from: 'tap', taps: ['Move earlier', 'Snooze'] },
    ],
  },
  midday: {
    label: 'Midday check-in',
    messages: [
      { from: 'in', text: 'Noticing strain building. Nothing urgent, but this may be a good moment to slow things down.' },
      { from: 'in', text: "Want a 60-second reset? I'll keep it brief." },
      { from: 'out', text: 'Sure.' },
      { from: 'in', text: "Three slow breaths in through the nose, out through the mouth. I'll check back in an hour." },
    ],
  },
  support: {
    label: 'Support mode',
    messages: [
      { from: 'in', text: "Your signals jumped a bit just now. No assumptions about what's going on." },
      { from: 'in', text: 'I can stay quiet for the rest of the day, or sit with you for a few minutes.' },
      { from: 'tap', taps: ['Stay quiet', 'Sit with me', "I'm okay"] },
      { from: 'out', text: 'Sit with me.' },
      { from: 'in', text: "Here. No advice unless you ask. Tell me what's around you right now." },
    ],
  },
}

const responseModes: Record<ResponseMode, { label: string; detail: string; preview: string }> = {
  brief: {
    label: 'Brief',
    detail: 'Short nudges with one clear next step.',
    preview: 'High load today. Want me to hold 3:30?',
  },
  gentle: {
    label: 'Gentle',
    detail: 'Warm check-ins that avoid urgency unless needed.',
    preview: 'You may have a heavier afternoon. I can make a little room if that helps.',
  },
  direct: {
    label: 'Direct',
    detail: 'More explicit about the signal and recommended action.',
    preview: 'Sleep, HRV, and schedule load are high. Use 3:30 PM for a reset if possible.',
  },
  quiet: {
    label: 'Quiet',
    detail: 'Only sends high-confidence alerts and otherwise stays silent.',
    preview: 'Pulse will only message when a strong pattern needs your attention.',
  },
}

const setupChecklist = [
  ['Google Calendar', 'See today\'s schedule and recovery windows'],
  ['Oura', 'Sleep quality, heart rate, and recovery'],
  ['Phone number', 'Where we send your updates'],
]

function PulseApp() {
  const [showSplash, setShowSplash] = useState(true)
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [onboardingValues, setOnboardingValues] = useState<OnboardingValues>({
    googleLogin: '',
    ouraLogin: '',
    phoneNumber: '',
  })
  const [view, setView] = useState<ViewId>('today')
  const [sources, setSources] = useState<Source[]>(initialSources)
  const [messageScript, setMessageScript] = useState<MessageScript>('morning')
  const [responseMode, setResponseMode] = useState<ResponseMode>('gentle')
  const [quietHours, setQuietHours] = useState(true)
  const [calendarHolds, setCalendarHolds] = useState(true)
  const [supportMode, setSupportMode] = useState(false)
  const [activity, setActivity] = useState<Activity[]>([
    { id: 1, title: 'Sent morning brief', detail: 'Flagged lower sleep and dense afternoon.', time: '9:14 AM' },
    { id: 2, title: 'Found reset window', detail: '3:30-4:00 PM is open before study group.', time: '9:15 AM', tone: 'action' },
    { id: 3, title: 'Read body signals', detail: 'Sleep, HRV, heart rate, breathing, and temperature.', time: 'Just now', tone: 'quiet' },
  ])

  const addActivity = (title: string, detail: string) => {
    setActivity((items) => [{ id: Date.now(), title, detail, time: 'Now', tone: 'action' }, ...items])
  }

  const toggleSource = (id: SourceId) => {
    setSources((items) =>
      items.map((source) =>
        source.id === id
          ? { ...source, connected: !source.connected, lastSync: source.connected ? 'Not connected' : 'Just now' }
          : source,
      ),
    )
  }

  const selectView = (nextView: ViewId) => {
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }

  const updateOnboarding = (field: keyof OnboardingValues, value: string) => {
    setOnboardingValues((current) => ({ ...current, [field]: value }))
  }

  const completeOnboarding = () => {
    setSources((items) => items.map((source) => ({ ...source, connected: true, lastSync: 'Just now' })))
    addActivity('Daily brief prepared', 'Pulse learned from Alex\'s Oura signals and today\'s calendar.')
    setIsLoading(true)
  }

  const handleLoadingComplete = useCallback(() => {
    setIsLoading(false)
    setIsOnboarded(true)
    window.scrollTo({ top: 0, behavior: 'auto' })
  }, [])

  if (showSplash) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />
  }

  if (!isOnboarded && !isLoading) {
    return <OnboardingFlow values={onboardingValues} onChange={updateOnboarding} onComplete={completeOnboarding} />
  }

  if (isLoading) {
    return <AppLoadingScreen onComplete={handleLoadingComplete} />
  }

  return (
    <main className="product-root">
      <Sidebar activeView={view} onViewChange={selectView} />
      <section className="product-main">
        {view === 'today' && (
          <TodayView
            activity={activity}
          />
        )}
        {view === 'week' && <WeekView />}
        {view === 'messages' && (
          <MessagesView
            activeScript={messageScript}
            responseMode={responseMode}
            onResponseModeChange={setResponseMode}
            onScriptChange={setMessageScript}
          />
        )}
        {view === 'history' && <HistoryView />}
        {view === 'settings' && (
          <SettingsView
            calendarHolds={calendarHolds}
            quietHours={quietHours}
            sources={sources}
            supportMode={supportMode}
            onCalendarHoldsChange={setCalendarHolds}
            onQuietHoursChange={setQuietHours}
            onSupportModeChange={setSupportMode}
            onToggleSource={toggleSource}
          />
        )}
      </section>
    </main>
  )
}

function OnboardingFlow({
  onChange,
  onComplete,
  values,
}: {
  onChange: (field: keyof OnboardingValues, value: string) => void
  onComplete: () => void
  values: OnboardingValues
}) {
  const canContinue = Boolean(values.googleLogin.trim() && values.ouraLogin.trim() && values.phoneNumber.trim())
  const [googleBlurred, setGoogleBlurred] = useState(false)
  const [googleFocused, setGoogleFocused] = useState(false)
  const googleDone = googleBlurred && !googleFocused && Boolean(values.googleLogin.trim())

  const [ouraBlurred, setOuraBlurred] = useState(false)
  const [ouraFocused, setOuraFocused] = useState(false)
  const ouraDone = ouraBlurred && !ouraFocused && Boolean(values.ouraLogin.trim())

  const [phoneBlurred, setPhoneBlurred] = useState(false)
  const [phoneFocused, setPhoneFocused] = useState(false)
  const phoneDone = phoneBlurred && !phoneFocused && Boolean(values.phoneNumber.trim())

  const heroTopRef = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = heroTopRef.current
    if (!el) return
    const onScroll = () => {
      const fadeStart = window.innerHeight * 0.25
      const fadeEnd = window.innerHeight * 0.65
      const opacity = Math.max(0, 1 - Math.max(0, window.scrollY - fadeStart) / (fadeEnd - fadeStart))
      el.style.opacity = String(opacity)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const markVisible = (entries: IntersectionObserverEntry[]) =>
      entries.forEach(e => { if (e.isIntersecting) (e.target as HTMLElement).classList.add('is-visible') })

    const heroObserver = new IntersectionObserver(markVisible, { threshold: 0 })
    const bodyObserver = new IntersectionObserver(markVisible, {
      threshold: 0,
      rootMargin: '0px 0px -22% 0px',
    })

    document.querySelectorAll('.ob-hero .ob-reveal').forEach(el => heroObserver.observe(el))
    document.querySelectorAll('.ob-body .ob-reveal').forEach(el => bodyObserver.observe(el))

    return () => { heroObserver.disconnect(); bodyObserver.disconnect() }
  }, [])

  return (
    <div className="ob-page">
      <nav className="ob-nav">
        <div className="ob-nav-brand">
          <span className="ob-nav-mark" />
          <div>
            <strong className="ob-nav-name">Pulse</strong>
          </div>
        </div>
        <span className="ob-nav-eyebrow">Account setup</span>
      </nav>

      <section className="ob-hero" ref={heroTopRef}>
        <div className="ob-orb-wrap ob-reveal">
          <div className="ob-ring ob-ring-3" />
          <div className="ob-ring ob-ring-2" />
          <div className="ob-ring ob-ring-1" />
          <div className="ob-orb-sphere" />
        </div>

        <h1 className="ob-headline">
          <span className="ob-reveal" style={{ transitionDelay: '0.5s' }}>Bring your signals</span>
          <span className="ob-reveal" style={{ transitionDelay: '0.8s' }}>together.</span>
        </h1>

        <div className="ob-subtitle-lines">
          <p className="ob-subtitle ob-reveal" style={{ transitionDelay: '1.4s' }}>Link your sleep, schedule, and number</p>
          <p className="ob-subtitle ob-reveal" style={{ transitionDelay: '1.7s' }}>— powered by Oura and Calendar —</p>
          <p className="ob-subtitle ob-reveal" style={{ transitionDelay: '2.0s' }}>to get your daily recommendation.</p>
        </div>
      </section>

      <section className="ob-body">
        <div className="ob-sources">
          <span className="ob-eyebrow ob-reveal" style={{ transitionDelay: '0.1s' }}>Your signals</span>
          {setupChecklist.map(([title, detail], i) => (
            <div
              key={title}
              className="ob-source-card ob-reveal"
              style={{ transitionDelay: `${0.1 + i * 0.2}s` }}
            >
              <span className={`ob-source-icon${(i === 0 && googleDone) || (i === 1 && ouraDone) || (i === 2 && phoneDone) ? ' ob-source-icon--done' : ''}`}>
                <Icon.Check size={14} />
              </span>
              <span>
                <strong>{title}</strong>
                <small>{detail}</small>
              </span>
            </div>
          ))}
        </div>

        <form
          className="ob-form ob-reveal"
          style={{ transitionDelay: '0.1s' }}
          onSubmit={(event) => {
            event.preventDefault()
            if (canContinue) onComplete()
          }}
        >
          <span className="ob-eyebrow">Connect your accounts</span>
          <label>
            <span>Google Calendar</span>
            <input
              autoComplete="email"
              name="google-login"
              onFocus={() => setGoogleFocused(true)}
              onBlur={() => { setGoogleBlurred(true); setGoogleFocused(false) }}
              onChange={(event) => onChange('googleLogin', event.target.value)}
              placeholder="you@gmail.com"
              type="email"
              value={values.googleLogin}
            />
          </label>
          <label>
            <span>Oura</span>
            <input
              autoComplete="email"
              name="oura-login"
              onFocus={() => setOuraFocused(true)}
              onBlur={() => { setOuraBlurred(true); setOuraFocused(false) }}
              onChange={(event) => onChange('ouraLogin', event.target.value)}
              placeholder="you@email.com"
              type="email"
              value={values.ouraLogin}
            />
          </label>
          <label>
            <span>Phone number</span>
            <input
              autoComplete="tel"
              name="phone-number"
              onFocus={() => setPhoneFocused(true)}
              onBlur={() => { setPhoneBlurred(true); setPhoneFocused(false) }}
              onChange={(event) => onChange('phoneNumber', event.target.value)}
              placeholder="(123) 456-789"
              type="tel"
              value={values.phoneNumber}
            />
          </label>
          <button disabled={!canContinue} type="submit">
            See my day
          </button>
        </form>
      </section>

      <footer className="ob-footer">
        <div className="ob-footer-links">
          <span>Terms &amp; Conditions</span>
          <span>Privacy Policy</span>
          <span>Accessibility</span>
          <span>Security Center</span>
        </div>
      </footer>
    </div>
  )
}

function Sidebar({ activeView, onViewChange }: { activeView: ViewId; onViewChange: (view: ViewId) => void }) {
  return (
    <header className="sidebar">
      <div className="brand-block">
        <span className="brand-mark" />
        <div>
          <strong>Pulse</strong>
        </div>
      </div>

      <nav className="side-nav" aria-label="Product navigation">
        {navItems.map((item) => {
          const NavIcon = item.icon
          return (
            <button key={item.id} className={activeView === item.id ? 'active' : ''} type="button" onClick={() => onViewChange(item.id)}>
              <NavIcon size={18} />
              {viewLabels[item.id]}
            </button>
          )
        })}
        {fakeNavItems.map((item) => {
          const FakeIcon = item.icon
          return (
            <button key={item.label} className="fake-tab" type="button" aria-disabled="true" tabIndex={-1}>
              <FakeIcon size={18} />
              {item.label}
            </button>
          )
        })}
      </nav>
    </header>
  )
}

const driverDisplayLabel: Record<string, string> = {
  'HRV': 'Lower HRV',
  'Resting signals': 'Body activation',
  'Recovery gap': 'Recovery time',
  'Recovery': 'Recovery space',
}

function TodayView({
  activity,
}: {
  activity: Activity[]
}) {
  const state: StressState = 'high'
  const copy = stateCopy.high
  const rootRef = useRef<HTMLDivElement>(null)
  const [expandedDriver, setExpandedDriver] = useState<string | null>(null)
  const [resetScheduled, setResetScheduled] = useState(false)

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const revealItems = Array.from(root.querySelectorAll<HTMLElement>('.td-scroll-reveal'))
    if (revealItems.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        })
      },
      {
        rootMargin: '0px 0px -12% 0px',
        threshold: 0.12,
      },
    )

    revealItems.forEach((item) => observer.observe(item))
    return () => observer.disconnect()
  }, [])

  return (
    <div className="td-root" key={state} ref={rootRef}>
      <section className="td-hero-card td-reveal">
        <div className="date-line td-hero-kicker">
          <time dateTime="2026-05-02">
            <strong className="td-hero-date-today">Today</strong>
            <span className="td-hero-date-suffix"> · May 2</span>
          </time>
        </div>
        <div className="td-hero-orb">
          <SignalOrb score={copy.score} state={state} />
        </div>
        <div className="td-hero-copy">
          <h2 className="td-headline">{copy.headline}</h2>
          <p className="td-summary">{copy.summary}</p>
        </div>
        <div
          className="td-hero-status"
          role={resetScheduled ? 'status' : undefined}
          aria-live={resetScheduled ? 'polite' : undefined}
        >
          {!resetScheduled ? (
            <button
              type="button"
              className="td-hero-reset-add"
              onClick={() => setResetScheduled(true)}
            >
              Add 3:00 PM reset
            </button>
          ) : (
            <div className="td-hero-status-card td-hero-status-card--scheduled">
              <p className="td-hero-status-headline">
                <span>Reset scheduled</span>
                <Icon.Check size={16} className="td-hero-status-headline-check" aria-hidden="true" />
              </p>
              <p className="td-hero-status-detail">Dexter Lawn · 3:00–3:30 PM</p>
              <p className="td-hero-status-line">This time is now protected.</p>
            </div>
          )}
        </div>
      </section>

      <div className="td-reset-card td-scroll-reveal">
        <span className="td-reset-eyebrow">Suggested reset</span>
        <h3 className="td-reset-title">{copy.action.title}</h3>
        <p className="td-reset-sub">{copy.action.detail}</p>
        <button type="button" className="td-reset-btn">{copy.action.cta}</button>
      </div>

      <div className="td-body">
        <div className="td-why td-scroll-reveal">
          <span className="td-section-label">Why this matters</span>
          {copy.drivers.map((driver, index) => (
            <TdWhyRow
              key={driver.label}
              label={driverDisplayLabel[driver.label] ?? driver.label}
              detail={driver.detail}
              explanation={driver.explanation}
              revealDelay={`${0.08 + index * 0.08}s`}
              tone={driver.tone}
              isExpanded={expandedDriver === driver.label}
              onToggle={() => setExpandedDriver(expandedDriver === driver.label ? null : driver.label)}
            />
          ))}
        </div>
        <div className="td-day-section td-scroll-reveal" style={{ transitionDelay: '0.08s' }}>
          <span className="td-section-label">Your day</span>
          <TdCalendarList />
        </div>
      </div>

      <div className="td-handled td-scroll-reveal">
        <span className="td-section-label">What Pulse handled</span>
        <TdHandledList activity={activity} />
      </div>
    </div>
  )
}

function TdWhyRow({
  label,
  detail,
  explanation,
  revealDelay,
  tone,
  isExpanded,
  onToggle,
}: {
  label: string
  detail: string
  explanation: string
  revealDelay: string
  tone: 'good' | 'watch' | 'high'
  isExpanded: boolean
  onToggle: () => void
}) {
  return (
    <button
      className={`td-why-row td-scroll-reveal${isExpanded ? ' td-why-row--open' : ''}`}
      data-tone={tone}
      type="button"
      style={{ transitionDelay: revealDelay }}
      onClick={onToggle}
    >
      <span className="td-why-dot" />
      <div>
        <span className="td-why-main">{label}</span>
        <span className="td-why-detail">{detail}</span>
      </div>
      <span className="td-why-chevron">+</span>
      {isExpanded && (
        <div className="td-why-expand-wrap">
          <span>{explanation}</span>
        </div>
      )}
    </button>
  )
}

function TdCalendarList() {
  const items: Array<[string, string, string, boolean]> = [
    ['9:00 AM', 'Class block', 'Runs until 2:00 PM', false],
    ['11:00 AM', 'Midterm exam', 'High-focus event', false],
    ['3:30 PM', 'Open window', 'Best time to reset', true],
    ['5:00 PM', 'Study group', '90 min', false],
  ]
  return (
    <div className="td-cal-list">
      {items.map(([time, title, meta, hl], index) => (
        <div
          key={time}
          className={`td-cal-item td-scroll-reveal${hl ? ' td-cal-item--highlight' : ''}`}
          style={{ transitionDelay: `${0.08 + index * 0.08}s` }}
        >
          <span className="td-cal-time">{time}</span>
          <span className="td-cal-event">
            <strong>{title}</strong>
            <small>{meta}</small>
          </span>
        </div>
      ))}
    </div>
  )
}

function TdHandledList({ activity }: { activity: Activity[] }) {
  return (
    <div className="td-handled-list">
      {activity.slice(0, 3).map((item, index) => (
        <div
          key={item.title}
          className="td-handled-card td-scroll-reveal"
          style={{ transitionDelay: `${0.08 + index * 0.08}s` }}
        >
          <strong>{item.title}</strong>
          <small>{item.detail}</small>
          <em>{item.time}</em>
        </div>
      ))}
    </div>
  )
}

function WeekView() {
  return (
    <div className="view-stack">
      <section className="metric-grid">
        <MetricCard label="Average load" value="55" detail="6 higher than last week" />
        <MetricCard label="Protected blocks" value="4" detail="2 accepted, 2 skipped" />
        <MetricCard label="Sleep median" value="6h 41m" detail="12 min below baseline" />
        <MetricCard label="Nudges sent" value="9" detail="7 accepted" />
      </section>

      <Panel title="Week map">
        <HourHeatmap />
      </Panel>

      <Panel title="Day-by-day load">
        <div className="week-list">
          {weekRows.map((row) => (
            <div key={row.day} className={row.today ? 'today' : ''}>
              <span>
                <strong>{row.day}</strong>
                <small>{row.date}</small>
              </span>
              <div className="bar-track">
                <i style={{ width: `${row.load}%` }} />
                <em>{row.state}</em>
              </div>
              <span className="week-note">
                {row.sleep}
                <small>{row.note}</small>
              </span>
            </div>
          ))}
        </div>
      </Panel>

      <section className="two-column">
        <InsightCard title="Pattern Pulse is watching" body="Wednesday and Thursday afternoons account for most high load hours. The shared driver is back-to-back meetings after 2 PM with no recovery buffer." />
        <InsightCard title="Backend placeholder" body="Connect this view to hourly load, calendar event density, and accepted nudge telemetry when APIs are available." quiet />
      </section>
    </div>
  )
}

function MessagesView({
  activeScript,
  responseMode,
  onResponseModeChange,
  onScriptChange,
}: {
  activeScript: MessageScript
  responseMode: ResponseMode
  onResponseModeChange: (mode: ResponseMode) => void
  onScriptChange: (script: MessageScript) => void
}) {
  const selectedMode = responseModes[responseMode]

  return (
    <div className="messages-layout">
      <div className="message-control">
        <span className="eyebrow">Message behavior</span>
        <h2>Choose how Pulse responds.</h2>
        <p>Pick the tone and level of intervention. These choices are frontend placeholders for the future message policy API.</p>

        <div className="response-options" aria-label="Response options">
          {(Object.keys(responseModes) as ResponseMode[]).map((mode) => (
            <button key={mode} className={responseMode === mode ? 'active' : ''} type="button" onClick={() => onResponseModeChange(mode)}>
              <strong>{responseModes[mode].label}</strong>
              <small>{responseModes[mode].detail}</small>
            </button>
          ))}
        </div>

        <div className="selected-response">
          <span className="eyebrow">Selected response</span>
          <h3>{selectedMode.label}</h3>
          <p>{selectedMode.preview}</p>
        </div>

        <div className="script-tabs" aria-label="Message previews">
          {(Object.keys(scripts) as MessageScript[]).map((script) => (
            <button key={script} className={activeScript === script ? 'active' : ''} type="button" onClick={() => onScriptChange(script)}>
              {scripts[script].label}
            </button>
          ))}
        </div>
      </div>
      <Phone script={activeScript} />
    </div>
  )
}

function HistoryView() {
  return (
    <div className="view-stack">
      <section className="metric-grid">
        <MetricCard label="Low load days" value="19" detail="Last 30 days" />
        <MetricCard label="Steady load days" value="11" detail="Most often Wed/Thu" />
        <MetricCard label="High load days" value="5" detail="Down 2 from prior month" />
        <MetricCard label="Accepted nudges" value="28" detail="Out of 41 sent" />
      </section>

      <section className="two-column wide-left">
        <Panel title="Recurring calendar drivers">
          <div className="event-list">
            {historyEvents.map((event) => (
              <div key={event.name}>
                <span>
                  <strong>{event.when}</strong>
                  <small>{event.detail}</small>
                </span>
                <span>
                  <strong>{event.name}</strong>
                  <small>{event.effect}</small>
                </span>
              </div>
            ))}
          </div>
        </Panel>
        <InsightCard title="What Pulse noticed" body="Weeks that start after a quiet Sunday have fewer high load days. Mornings before 11 AM stay low load on 26 of 30 days." />
      </section>
    </div>
  )
}

function SettingsView({
  calendarHolds,
  quietHours,
  sources,
  supportMode,
  onCalendarHoldsChange,
  onQuietHoursChange,
  onSupportModeChange,
  onToggleSource,
}: {
  calendarHolds: boolean
  quietHours: boolean
  sources: Source[]
  supportMode: boolean
  onCalendarHoldsChange: (value: boolean) => void
  onQuietHoursChange: (value: boolean) => void
  onSupportModeChange: (value: boolean) => void
  onToggleSource: (id: SourceId) => void
}) {
  return (
    <div className="view-stack">
      <SettingsGroup title="Connected sources">
        {sources.map((source) => {
          const SourceIcon = sourceIcons[source.id]
          return (
            <SettingsRow key={source.id} icon={SourceIcon} title={source.label} detail={source.description}>
              <button className={source.connected ? 'connected mini-button' : 'mini-button'} type="button" onClick={() => onToggleSource(source.id)}>
                {source.connected ? 'Connected' : 'Connect'}
              </button>
            </SettingsRow>
          )
        })}
      </SettingsGroup>

      <SettingsGroup title="How Pulse reaches you">
        <SettingsRow icon={Icon.Bell} title="Quiet hours" detail="9 PM to 8 AM. No nudges, including support mode.">
          <Toggle enabled={quietHours} onChange={onQuietHoursChange} />
        </SettingsRow>
        <SettingsRow icon={Icon.Calendar} title="Calendar holds" detail="Allow Pulse to draft recovery blocks. Always asks first.">
          <Toggle enabled={calendarHolds} onChange={onCalendarHoldsChange} />
        </SettingsRow>
        <SettingsRow icon={Icon.Heart} title="Support mode" detail="Sit-with-you check-ins on high load days. Off by default.">
          <Toggle enabled={supportMode} onChange={onSupportModeChange} />
        </SettingsRow>
      </SettingsGroup>

      <SettingsGroup title="Memory and privacy">
        <SettingsRow icon={Icon.Memory} title="What Pulse remembers" detail="34 patterns, 9 preferences, 1 ongoing thread. Placeholder editor." action="Review" />
        <SettingsRow icon={Icon.Lock} title="Export my data" detail="Download a copy of stored mock data." action="Download" />
        <SettingsRow icon={Icon.Door} title="Erase everything" detail="Disconnect all sources and clear local placeholder memory." action="Erase" warn />
      </SettingsGroup>
    </div>
  )
}

function SignalOrb({ score, state }: { score: number; state: StressState }) {
  return (
    <div className="signal-orb" data-state={state}>
      <i />
      <span>{score}</span>
    </div>
  )
}

function Panel({ title, children, className = '' }: { title: string; children: ReactNode; className?: string }) {
  return (
    <section className={className ? `panel ${className}` : 'panel'}>
      <div className="panel-head">
        <h3>{title}</h3>
      </div>
      {children}
    </section>
  )
}

function MetricCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <article className="metric-card">
      <span className="eyebrow">{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </article>
  )
}

function HourHeatmap() {
  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
  return (
    <div className="heatmap">
      <div className="hour-axis">
        {Array.from({ length: 24 }, (_, hour) => (
          <span key={hour}>{hour % 6 === 0 ? (hour === 0 ? '12a' : hour === 12 ? '12p' : hour < 12 ? `${hour}a` : `${hour - 12}p`) : ''}</span>
        ))}
      </div>
      {heatRows.map((row, rowIndex) => (
        <div className="heat-row" key={dayLabels[rowIndex]}>
          <span>{dayLabels[rowIndex]}</span>
          <div>
            {row.map((value, hour) => (
              <i key={`${dayLabels[rowIndex]}-${hour}`} className={value === 0 ? 'sleep' : `l${value}`} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function InsightCard({ body, title, quiet = false }: { body: string; title: string; quiet?: boolean }) {
  return (
    <article className={quiet ? 'insight-card quiet' : 'insight-card'}>
      <span className="eyebrow">{quiet ? 'Implementation' : 'Insight'}</span>
      <h3>{title}</h3>
      <p>{body}</p>
    </article>
  )
}

function Phone({ script }: { script: MessageScript }) {
  return (
    <div className="phone">
      <div className="phone-screen">
        <div className="phone-notch" />
        <div className="phone-status">
          <span>9:14</span>
          <span>
            <Icon.Wifi size={12} />
            <Icon.Battery size={10} />
          </span>
        </div>
        <div className="imsg-header">
          <span className="brand-mark" />
          <strong>Pulse</strong>
        </div>
        <div className="thread">
          <div className="thread-time">Friday 9:14 AM</div>
          {scripts[script].messages.map((message, index) => {
            if (message.from === 'tap') {
              return (
                <div className="tap-row" key={`${script}-${index}`}>
                  {message.taps?.map((tap) => (
                    <button key={tap} type="button">{tap}</button>
                  ))}
                </div>
              )
            }
            return (
              <div className={`bubble ${message.from}`} key={`${script}-${index}`}>
                <span>{message.text}</span>
              </div>
            )
          })}
        </div>
        <div className="imsg-input">
          <span>+</span>
          <div>iMessage</div>
        </div>
      </div>
    </div>
  )
}

function SettingsGroup({ children, title }: { children: ReactNode; title: string }) {
  return (
    <section className="settings-group">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  )
}

function SettingsRow({
  action,
  children,
  detail,
  icon: RowIcon,
  title,
  warn = false,
}: {
  action?: string
  children?: ReactNode
  detail: string
  icon: IconComponent
  title: string
  warn?: boolean
}) {
  return (
    <div className="settings-row">
      <span className="settings-icon">
        <RowIcon size={18} />
      </span>
      <span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
      {children ?? <button className={warn ? 'warn mini-button' : 'mini-button'} type="button">{action}</button>}
    </div>
  )
}

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (enabled: boolean) => void }) {
  return (
    <button className="toggle" type="button" data-on={enabled ? 'true' : 'false'} aria-pressed={enabled} onClick={() => onChange(!enabled)}>
      <i />
    </button>
  )
}

export default PulseApp
