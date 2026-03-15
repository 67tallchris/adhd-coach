import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import LandingPage from './features/landing/LandingPage'
import BrainDumpPage from './features/brain-dump/BrainDumpPage'
import HabitsPage from './features/habits/HabitsPage'
import PomodoroPage from './features/pomodoro/PomodoroPage'
import GoalsPage from './features/goals/GoalsPage'
import NudgesPage from './features/nudges/NudgesPage'
import LadderPage from './features/ladders/LadderPage'
import StreaksPage from './features/streaks/StreaksPage'
import FocusPage from './features/focus/FocusPage'
import { LevelDashboard } from './features/level/LevelDashboard'
import { ModeSelector } from './features/level/ModeSelector'
import { LevelUpModal } from './features/level/LevelUpModal'
import { useLevelProgress } from './hooks/useLevelProgress'

export default function App() {
  const { needsOnboarding } = useLevelProgress()

  return (
    <BrowserRouter>
      <ModeSelectorWrapper show={needsOnboarding} />
      <LevelUpModal />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/app" element={<Layout />}>
          <Route index element={<BrainDumpPage />} />
          <Route path="brain-dump" element={<BrainDumpPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="pomodoro" element={<PomodoroPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="ladders" element={<LadderPage />} />
          <Route path="streaks" element={<StreaksPage />} />
          <Route path="nudges" element={<NudgesPage />} />
          <Route path="focus" element={<FocusPage />} />
          <Route path="progress" element={<LevelDashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

function ModeSelectorWrapper({ show }: { show: boolean | undefined }) {
  if (!show) return null
  return <ModeSelector />
}
