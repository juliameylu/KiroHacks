import { useState } from 'react'
import type { AssessmentResponse } from '../types/assessment'
import StressHeader from '../components/StressHeader'
import ActionBanner from '../components/ActionBanner'
import DriversList from '../components/DriversList'
import SleepCard from '../components/cards/SleepCard'
import HRVCard from '../components/cards/HRVCard'
import HeartRateCard from '../components/cards/HeartRateCard'
import TemperatureCard from '../components/cards/TemperatureCard'
import ScheduleCard from '../components/cards/ScheduleCard'
import './Dashboard.css'

interface DashboardProps {
  data: AssessmentResponse
}

export default function Dashboard({ data }: DashboardProps) {
  const [sleepOpen, setSleepOpen] = useState(false)
  const [hrvOpen, setHrvOpen] = useState(false)
  const [heartRateOpen, setHeartRateOpen] = useState(false)
  const [temperatureOpen, setTemperatureOpen] = useState(false)
  const [scheduleOpen, setScheduleOpen] = useState(false)

  return (
    <div className="dashboard">
      <div className="dashboard-inner">
        <StressHeader
          stressLevel={data.stress_level}
          summary={data.summary}
          stale={data.stale}
          lastUpdated={data.last_updated}
        />

        <ActionBanner recommendation={data.action_recommendation} />

        <DriversList drivers={data.drivers} />

        <SleepCard
          biometrics={data.biometrics}
          isOpen={sleepOpen}
          onToggle={() => setSleepOpen(o => !o)}
        />

        <HRVCard
          biometrics={data.biometrics}
          isOpen={hrvOpen}
          onToggle={() => setHrvOpen(o => !o)}
        />

        <HeartRateCard
          biometrics={data.biometrics}
          isOpen={heartRateOpen}
          onToggle={() => setHeartRateOpen(o => !o)}
        />

        <TemperatureCard
          biometrics={data.biometrics}
          isOpen={temperatureOpen}
          onToggle={() => setTemperatureOpen(o => !o)}
        />

        <ScheduleCard
          schedule={data.schedule}
          isOpen={scheduleOpen}
          onToggle={() => setScheduleOpen(o => !o)}
        />
      </div>
    </div>
  )
}
