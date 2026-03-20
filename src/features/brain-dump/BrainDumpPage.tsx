import { useState } from 'react'
import { Brain, Plus, Inbox, Clock, CheckCircle, Target } from 'lucide-react'
import clsx from 'clsx'
import type { TaskStatus } from '../../types'
import { useTasks } from './useTasks'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'
import { StreakCard } from '../../components/StreakCard'
import { useQuery } from '@tanstack/react-query'
import { streaksApi } from '../../api/streaks'

const TABS: { status: TaskStatus; label: string; icon: typeof Inbox }[] = [
  { status: 'inbox', label: 'Inbox', icon: Inbox },
  { status: 'snoozed', label: 'Snoozed', icon: Clock },
  { status: 'done', label: 'Done', icon: CheckCircle },
]

export default function BrainDumpPage() {
  const [activeTab, setActiveTab] = useState<TaskStatus>('inbox')
  const [showForm, setShowForm] = useState(false)

  const { data: tasks = [], isLoading } = useTasks({ status: activeTab })
  const { data: streakStats } = useQuery({
    queryKey: ['streaks', 'tasks'],
    queryFn: streaksApi.getTasksStreak,
    refetchInterval: 30000,
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400" />
            <span className="truncate">Brain Dump</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Get it out of your head</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors shrink-0"
        >
          <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          <span className="hidden sm:inline">Add Task</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Streak Card - Only show on Done tab */}
      {streakStats && activeTab === 'done' && (
        <div className="mb-6">
          <StreakCard
            stats={streakStats}
            title="Task Completion Streak"
            subtitle="Tasks completed this week"
            icon={<Target className="w-5 h-5" />}
          />
        </div>
      )}

      {showForm && (
        <div className="mb-4">
          <TaskForm onClose={() => setShowForm(false)} />
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-800/50 rounded-xl p-1">
        {TABS.map(({ status, label, icon: Icon }) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={clsx(
              'flex-1 flex items-center justify-center gap-1 sm:gap-1.5 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors',
              activeTab === status
                ? 'bg-gray-700 text-white'
                : 'text-gray-500 hover:text-gray-300',
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{label}</span>
            <span className="sm:hidden">{label === 'Inbox' ? 'Inbox' : label === 'Snoozed' ? 'Snooze' : 'Done'}</span>
          </button>
        ))}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-14 sm:h-16 bg-gray-800/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-12 sm:py-16 text-gray-600">
          {activeTab === 'inbox' ? (
            <>
              <Brain className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-gray-500 text-sm sm:text-base">Inbox is clear!</p>
              <p className="text-xs sm:text-sm mt-1">Press <kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">N</kbd> to capture a thought.</p>
            </>
          ) : activeTab === 'snoozed' ? (
            <p className="text-sm sm:text-base">No snoozed tasks.</p>
          ) : (
            <p className="text-sm sm:text-base">Nothing completed yet — go get something done!</p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}
