import { Trophy } from 'lucide-react'
import { WeeklySummary } from '../../components/WeeklySummary'
import { AchievementsPanel } from '../../components/AchievementsPanel'

export default function StreaksPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-brand-400" />
          Progress & Achievements
        </h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Track your weekly progress and celebrate milestones
        </p>
      </div>

      <div className="space-y-8">
        <WeeklySummary />
        <AchievementsPanel />
      </div>
    </div>
  )
}
