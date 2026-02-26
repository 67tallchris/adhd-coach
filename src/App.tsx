import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import BrainDumpPage from './features/brain-dump/BrainDumpPage'
import HabitsPage from './features/habits/HabitsPage'
import PomodoroPage from './features/pomodoro/PomodoroPage'
import GoalsPage from './features/goals/GoalsPage'
import NudgesPage from './features/nudges/NudgesPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/brain-dump" replace />} />
          <Route path="brain-dump" element={<BrainDumpPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="pomodoro" element={<PomodoroPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="nudges" element={<NudgesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
