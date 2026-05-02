import { useState, type ReactElement, type ReactNode } from 'react'
import './stressCopilot.css'

type IconProps = { size?: number; className?: string }
type IconComponent = (props: IconProps) => ReactElement
type ViewId = 'today' | 'week' | 'messages' | 'history' | 'settings'
type SourceId = 'oura' | 'calendar' | 'imessage'
type StressState = 'steady' | 'elevated' | 'high'
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
  { id: 'week', icon: Icon.Calendar },
  { id: 'messages', icon: Icon.Message },
  { id: 'history', icon: Icon.Memory },
  { id: 'settings', icon: Icon.Lock },
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
    drivers: Array<{ label: string; detail: string; icon: IconComponent; value: string; meter: number; tone: 'good' | 'watch' | 'high' }>
    action: { title: string; detail: string; cta: string }
  }
> = {
  steady: {
    label: 'Steady',
    headline: 'Steady today',
    summary: 'Your body signal is close to baseline and the calendar has breathing room. Pulse will stay quiet unless something changes.',
    score: 32,
    drivers: [
      { label: 'Sleep', detail: '7h 42m, efficient', icon: Icon.Sleep, value: '+8%', meter: 82, tone: 'good' },
      { label: 'HRV', detail: 'Above 7-day baseline', icon: Icon.Heart, value: '+4%', meter: 76, tone: 'good' },
      { label: 'Calendar', detail: '3 meetings, 2 buffers', icon: Icon.Calendar, value: 'Light', meter: 44, tone: 'good' },
      { label: 'Recovery', detail: 'Two open reset windows', icon: Icon.Spark, value: 'Open', meter: 68, tone: 'good' },
    ],
    action: { title: 'No action needed', detail: 'Pulse will stay quiet and check again after lunch.', cta: 'Keep quiet' },
  },
  elevated: {
    label: 'Elevated',
    headline: 'Elevated load',
    summary: 'Sleep and HRV are lower than usual, and the afternoon is dense. A small calendar hold would protect a real reset window.',
    score: 68,
    drivers: [
      { label: 'Sleep', detail: '5h 48m, 1h below norm', icon: Icon.Sleep, value: '-18%', meter: 34, tone: 'watch' },
      { label: 'HRV', detail: '11% under 7-day baseline', icon: Icon.Heart, value: '-11%', meter: 42, tone: 'watch' },
      { label: 'Calendar', detail: '6 meetings, no buffers', icon: Icon.Calendar, value: 'Dense', meter: 88, tone: 'high' },
      { label: 'Recovery gap', detail: 'No break after 1:30 PM', icon: Icon.Spark, value: 'Tight', meter: 74, tone: 'watch' },
    ],
    action: { title: 'Hold 3:30-4:00 PM', detail: 'No meeting currently needs that slot. This remains a draft until accepted.', cta: 'Hold slot' },
  },
  high: {
    label: 'High load',
    headline: 'High load',
    summary: 'Multiple signals are pointing the same direction. Pulse suggests reducing the afternoon load where possible.',
    score: 84,
    drivers: [
      { label: 'Sleep', detail: '4h 56m, two short nights', icon: Icon.Sleep, value: '-31%', meter: 20, tone: 'watch' },
      { label: 'HRV', detail: '18% under baseline', icon: Icon.Heart, value: '-18%', meter: 26, tone: 'watch' },
      { label: 'Calendar', detail: '8 meetings, back-to-back', icon: Icon.Calendar, value: 'Heavy', meter: 96, tone: 'high' },
      { label: 'Recovery gap', detail: 'No open block until 6 PM', icon: Icon.Spark, value: 'None', meter: 92, tone: 'high' },
    ],
    action: { title: 'Draft a meeting move', detail: 'Move the 4 PM sync to tomorrow morning and open a recovery block.', cta: 'Draft move' },
  },
}

const weekRows = [
  { day: 'Mon', date: 'Apr 28', state: 'Steady', load: 32, sleep: '7h 51m', note: '2 buffers held' },
  { day: 'Tue', date: 'Apr 29', state: 'Steady', load: 28, sleep: '7h 32m', note: 'No nudges' },
  { day: 'Wed', date: 'Apr 30', state: 'Elevated', load: 64, sleep: '6h 14m', note: 'Afternoon stack' },
  { day: 'Thu', date: 'May 01', state: 'High load', load: 82, sleep: '5h 08m', note: 'Roadmap review' },
  { day: 'Fri', date: 'May 02', state: 'Elevated', load: 68, sleep: '5h 48m', note: 'Today', today: true },
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
  { when: 'Fri 9:30 AM', name: 'Design review', effect: '-6 load', detail: 'steady window' },
]

const scripts: Record<MessageScript, { label: string; messages: Array<{ from: 'in' | 'out' | 'tap'; text?: string; taps?: string[] }> }> = {
  morning: {
    label: 'Morning brief',
    messages: [
      { from: 'in', text: 'Morning James, your body is showing elevated load today. The main drivers look like lower sleep, lower HRV, and a packed afternoon.' },
      { from: 'in', text: 'Want me to protect 3:30-4:00 for a reset? Nothing on your calendar needs that slot.' },
      { from: 'out', text: 'Yeah, hold it.' },
      { from: 'in', text: "Done. I'll text you a few minutes before. No pressure to take it." },
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
    preview: 'Elevated load today. Want me to hold 3:30?',
  },
  gentle: {
    label: 'Gentle',
    detail: 'Warm check-ins that avoid urgency unless needed.',
    preview: 'You may have a heavier afternoon. I can make a little room if that helps.',
  },
  direct: {
    label: 'Direct',
    detail: 'More explicit about the signal and recommended action.',
    preview: 'Sleep, HRV, and calendar load are all elevated. Move the 4 PM sync if possible.',
  },
  quiet: {
    label: 'Quiet',
    detail: 'Only sends high-confidence alerts and otherwise stays silent.',
    preview: 'Pulse will only message when a strong pattern needs your attention.',
  },
}

const setupChecklist = [
  ['Google Calendar', 'Meeting load and open recovery windows'],
  ['Oura', 'Sleep, HRV, and body signal baselines'],
  ['Phone number', 'Pulse texts, confirmations, and support mode'],
]

function PulseApp() {
  const [isOnboarded, setIsOnboarded] = useState(false)
  const [onboardingValues, setOnboardingValues] = useState<OnboardingValues>({
    googleLogin: '',
    ouraLogin: '',
    phoneNumber: '',
  })
  const [view, setView] = useState<ViewId>('today')
  const [stressState, setStressState] = useState<StressState>('elevated')
  const [sources, setSources] = useState<Source[]>(initialSources)
  const [messageScript, setMessageScript] = useState<MessageScript>('morning')
  const [responseMode, setResponseMode] = useState<ResponseMode>('gentle')
  const [quietHours, setQuietHours] = useState(true)
  const [calendarHolds, setCalendarHolds] = useState(true)
  const [supportMode, setSupportMode] = useState(false)
  const [activity, setActivity] = useState<Activity[]>([
    { id: 1, title: 'Sent morning brief', detail: 'Flagged lower sleep and dense afternoon.', time: '9:14 AM' },
    { id: 2, title: 'Calendar hold drafted', detail: 'Waiting for confirmation before creating the block.', time: '9:16 AM', tone: 'action' },
    { id: 3, title: 'Quiet hours respected', detail: 'No nudges between 9 PM and 8 AM.', time: 'Last night', tone: 'quiet' },
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
    addActivity('Pulse setup complete', 'Google Calendar, Oura, and phone placeholders are ready for backend connection.')
    setIsOnboarded(true)
    window.setTimeout(() => window.scrollTo({ top: 0, behavior: 'auto' }), 0)
  }

  const currentTitle = viewLabels[view]

  if (!isOnboarded) {
    return <OnboardingFlow values={onboardingValues} onChange={updateOnboarding} onComplete={completeOnboarding} />
  }

  return (
    <main className="product-root">
      <Sidebar activeView={view} onViewChange={selectView} />
      <section className="product-main">
        <TopBar title={currentTitle} onSync={() => addActivity('Manual sync complete', 'Mock data refreshed locally.')} />
        {view === 'today' && (
          <TodayView
            activity={activity}
            state={stressState}
            onStateChange={setStressState}
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

  return (
    <main className="product-root onboarding-root">
      <section className="onboarding-shell">
        <div className="onboarding-copy">
          <div className="brand-block">
            <span className="brand-mark" />
            <div>
              <strong>Pulse</strong>
              <small>Personal signal setup</small>
            </div>
          </div>
          <span className="eyebrow">Account setup</span>
          <h1>Connect the signals Pulse needs.</h1>
          <p>Start with Google Calendar, Oura, and your phone number. These are local placeholders until OAuth and messaging are wired into the backend.</p>
          <div className="setup-preview">
            {setupChecklist.map(([title, detail]) => (
              <div key={title}>
                <Icon.Check size={16} />
                <span>
                  <strong>{title}</strong>
                  <small>{detail}</small>
                </span>
              </div>
            ))}
          </div>
        </div>

        <form
          className="onboarding-card"
          onSubmit={(event) => {
            event.preventDefault()
            if (canContinue) onComplete()
          }}
        >
          <span className="eyebrow">Login details</span>
          <label>
            <span>Google login</span>
            <input
              autoComplete="email"
              name="google-login"
              onChange={(event) => onChange('googleLogin', event.target.value)}
              placeholder="you@gmail.com"
              type="email"
              value={values.googleLogin}
            />
          </label>
          <label>
            <span>Oura login</span>
            <input
              autoComplete="email"
              name="oura-login"
              onChange={(event) => onChange('ouraLogin', event.target.value)}
              placeholder="oura account email"
              type="email"
              value={values.ouraLogin}
            />
          </label>
          <label>
            <span>Phone number</span>
            <input
              autoComplete="tel"
              name="phone-number"
              onChange={(event) => onChange('phoneNumber', event.target.value)}
              placeholder="(555) 013-4040"
              type="tel"
              value={values.phoneNumber}
            />
          </label>
          <button disabled={!canContinue} type="submit">
            Enter Pulse
          </button>
          <p>Mock setup only. The backend can replace these fields with real Google, Oura, and phone verification flows.</p>
        </form>
      </section>
    </main>
  )
}

function Sidebar({ activeView, onViewChange }: { activeView: ViewId; onViewChange: (view: ViewId) => void }) {
  return (
    <aside className="sidebar">
      <div className="brand-block">
        <span className="brand-mark" />
        <div>
          <strong>Pulse</strong>
          <small>Mock product frontend</small>
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
      </nav>

      <div className="sidebar-card">
        <span className="eyebrow">Backend</span>
        <strong>Mock mode</strong>
        <p>Local placeholders are ready for API responses when the backend is connected.</p>
      </div>
    </aside>
  )
}

function TopBar({ title, onSync }: { title: string; onSync: () => void }) {
  return (
    <header className="topbar">
      <div>
        <span className="eyebrow">Friday, May 2</span>
        <h1>{title}</h1>
      </div>
      <div className="topbar-actions">
        <button type="button" onClick={onSync}>Sync mock data</button>
      </div>
    </header>
  )
}

function TodayView({
  activity,
  state,
  onStateChange,
}: {
  activity: Activity[]
  state: StressState
  onStateChange: (state: StressState) => void
}) {
  const copy = stateCopy[state]

  return (
    <div className="view-stack">
      <div className="state-tabs" role="tablist" aria-label="Stress state">
        {(Object.keys(stateCopy) as StressState[]).map((item) => (
          <button key={item} className={state === item ? 'active' : ''} type="button" onClick={() => onStateChange(item)}>
            {stateCopy[item].label}
          </button>
        ))}
      </div>

      <section className="today-layout">
        <div className="signal-card">
          <div>
            <span className="eyebrow">Body signal</span>
            <h2>{copy.headline}</h2>
            <p>{copy.summary}</p>
          </div>
          <SignalOrb state={state} score={copy.score} />
        </div>
      </section>

      <section className="dashboard-grid today-dashboard">
        <Panel title="Top drivers" className="drivers-panel">
          <div className="driver-list">
            {copy.drivers.map((driver) => (
              <DriverRow key={driver.label} driver={driver} />
            ))}
          </div>
        </Panel>

        <Panel title="Upcoming calendar">
          <CalendarList />
        </Panel>

        <Panel title="Agent activity" className="activity-panel">
          <ActivityList activity={activity} />
        </Panel>
      </section>
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
        <InsightCard title="Pattern Pulse is watching" body="Wednesday and Thursday afternoons account for most high-load hours. The shared driver is back-to-back meetings after 2 PM with no recovery buffer." />
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
        <MetricCard label="Steady days" value="19" detail="Last 30 days" />
        <MetricCard label="Elevated days" value="11" detail="Most often Wed/Thu" />
        <MetricCard label="High-load days" value="5" detail="Down 2 from prior month" />
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
        <InsightCard title="What Pulse noticed" body="Weeks that start after a quiet Sunday have fewer high-load days. Mornings before 11 AM stay steady on 26 of 30 days." />
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
        <SettingsRow icon={Icon.Heart} title="Support mode" detail="Sit-with-you check-ins on high-load days. Off by default.">
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

function DriverRow({
  driver,
}: {
  driver: {
    label: string
    detail: string
    icon: IconComponent
    value: string
    meter: number
    tone: 'good' | 'watch' | 'high'
  }
}) {
  const DriverIcon = driver.icon
  return (
    <div className="driver-row">
      <span className="driver-icon">
        <DriverIcon size={16} />
      </span>
      <span>
        <strong>{driver.label}</strong>
        <small>{driver.detail}</small>
      </span>
      <span className="meter" data-tone={driver.tone}>
        <i style={{ width: `${driver.meter}%` }} />
      </span>
      <em>{driver.value}</em>
    </div>
  )
}

function CalendarList() {
  const items = [
    ['11:00 AM', 'Design review', '45 min'],
    ['1:30 PM', 'Product sync', '30 min'],
    ['3:30 PM', 'Open window', 'Suggested hold'],
    ['4:00 PM', 'Engineering sync', 'Can move'],
  ]

  return (
    <div className="calendar-list">
      {items.map(([time, title, meta]) => (
        <div key={`${time}-${title}`}>
          <span>{time}</span>
          <strong>{title}</strong>
          <small>{meta}</small>
        </div>
      ))}
    </div>
  )
}

function ActivityList({ activity }: { activity: Activity[] }) {
  return (
    <div className="activity-list">
      {activity.map((item) => (
        <div key={item.id} className={item.tone ?? ''}>
          <i />
          <span>
            <strong>{item.title}</strong>
            <small>{item.detail}</small>
          </span>
          <em>{item.time}</em>
        </div>
      ))}
    </div>
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
