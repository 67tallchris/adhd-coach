import { useState } from 'react'
import { Target, Plus, CheckCircle, Archive } from 'lucide-react'
import clsx from 'clsx'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { useGoals, useCreateGoal, useUpdateGoal } from './useGoals'
import type { Goal, GoalStatus } from '../../types'

const STATUS_TABS: { status: GoalStatus; label: string }[] = [
  { status: 'active', label: 'Active' },
  { status: 'completed', label: 'Completed' },
  { status: 'archived', label: 'Archived' },
]

function GoalCard({ goal }: { goal: Goal }) {
  const updateGoal = useUpdateGoal()

  return (
    <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-3 sm:p-4">
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-gray-100 text-sm sm:text-base">{goal.title}</h3>
          {goal.description && (
            <p className="text-sm text-gray-400 mt-1">{goal.description}</p>
          )}
          <div className="flex items-center gap-2 sm:gap-3 mt-2 flex-wrap">
            {goal.targetDate && (
              <span className="text-xs text-gray-500">
                Target: {new Date(goal.targetDate).toLocaleDateString()}
              </span>
            )}
            <span className="text-xs text-gray-600">
              Created {formatDistanceToNow(parseISO(goal.createdAt), { addSuffix: true })}
            </span>
          </div>
        </div>
        {goal.status === 'active' && (
          <div className="flex gap-1 shrink-0">
            <button
              onClick={() => updateGoal.mutate({ id: goal.id, status: 'completed' })}
              title="Mark complete"
              className="p-1.5 rounded-lg text-gray-500 hover:text-green-400 hover:bg-green-900/20 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => updateGoal.mutate({ id: goal.id, status: 'archived' })}
              title="Archive"
              className="p-1.5 rounded-lg text-gray-500 hover:text-gray-300 hover:bg-gray-700 transition-colors"
            >
              <Archive className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

function GoalForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [targetDate, setTargetDate] = useState('')
  const createGoal = useCreateGoal()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await createGoal.mutateAsync({
      title: title.trim(),
      description: description || undefined,
      targetDate: targetDate || undefined,
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-xl border border-gray-700 p-3 sm:p-4 mb-3 sm:mb-4">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="What's your big goal?"
        className="w-full bg-transparent text-gray-100 placeholder-gray-500 outline-none text-sm font-medium"
        autoFocus
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        placeholder="Why does this matter to you? (optional)"
        rows={2}
        className="w-full mt-2 bg-gray-900/50 rounded-lg border border-gray-700 p-2 text-sm text-gray-200 placeholder-gray-600 outline-none resize-none"
      />
      <div className="mt-2 flex items-center gap-2 flex-wrap">
        <label className="text-xs text-gray-500">Target date:</label>
        <input
          type="date"
          value={targetDate}
          onChange={e => setTargetDate(e.target.value)}
          className="text-xs bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-gray-300 outline-none"
        />
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1.5">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim() || createGoal.isPending}
          className="text-xs font-medium bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg transition-colors"
        >
          {createGoal.isPending ? 'Saving…' : 'Add Goal'}
        </button>
      </div>
    </form>
  )
}

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState<GoalStatus>('active')
  const [showForm, setShowForm] = useState(false)
  const { data: goals = [], isLoading } = useGoals(activeTab)

  return (
    <div>
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="min-w-0">
          <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Target className="w-4 h-4 sm:w-5 sm:h-5 text-brand-400" />
            <span className="truncate">Goals</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">Your big picture intentions</p>
        </div>
        {activeTab === 'active' && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg transition-colors shrink-0"
          >
            <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">New Goal</span>
            <span className="sm:hidden">New</span>
          </button>
        )}
      </div>

      {showForm && <GoalForm onClose={() => setShowForm(false)} />}

      <div className="flex gap-1 mb-4 bg-gray-800/50 rounded-xl p-1">
        {STATUS_TABS.map(({ status, label }) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={clsx(
              'flex-1 py-1.5 sm:py-2 px-2 sm:px-3 rounded-lg text-xs sm:text-sm font-medium transition-colors',
              activeTab === status ? 'bg-gray-700 text-white' : 'text-gray-500 hover:text-gray-300',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <div key={i} className="h-20 sm:h-24 bg-gray-800/40 rounded-xl animate-pulse" />)}
        </div>
      ) : goals.length === 0 ? (
        <div className="text-center py-12 sm:py-16 text-gray-600">
          <Target className="w-10 h-10 sm:w-12 sm:h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500 text-sm sm:text-base">
            {activeTab === 'active' ? 'No goals yet. What do you want to achieve?' : `No ${activeTab} goals.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {goals.map(goal => <GoalCard key={goal.id} goal={goal} />)}
        </div>
      )}
    </div>
  )
}
