import { useState } from 'react'
import { CheckSquare, Plus, Flame, Trash2 } from 'lucide-react'
import clsx from 'clsx'
import { useHabits, useCreateHabit, useCheckHabit, useUncheckHabit, useDeleteHabit, useHabitStreak } from './useHabits'
import { useGoals } from '../goals/useGoals'
import type { Habit } from '../../types'

function StreakBadge({ habitId }: { habitId: string }) {
  const { data: streak } = useHabitStreak(habitId)
  if (!streak || streak.currentStreak === 0) return null
  return (
    <span className="flex items-center gap-1 text-xs text-orange-400 font-medium">
      <Flame className="w-3.5 h-3.5" />
      {streak.currentStreak}d streak
    </span>
  )
}

function HabitCard({ habit }: { habit: Habit }) {
  const checkHabit = useCheckHabit()
  const uncheckHabit = useUncheckHabit()
  const deleteHabit = useDeleteHabit()

  const toggle = () => {
    if (habit.completedToday) {
      uncheckHabit.mutate({ id: habit.id })
    } else {
      checkHabit.mutate({ id: habit.id })
    }
  }

  return (
    <div className={clsx(
      'flex items-center gap-4 p-4 rounded-xl border transition-all',
      habit.completedToday
        ? 'bg-green-900/10 border-green-800/40'
        : 'bg-gray-800/40 border-gray-700/50 hover:bg-gray-800/60',
    )}>
      <button
        onClick={toggle}
        disabled={checkHabit.isPending || uncheckHabit.isPending}
        className={clsx(
          'w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 transition-all',
          habit.completedToday
            ? 'bg-green-500 border-green-500 text-white'
            : 'border-gray-600 hover:border-green-500',
        )}
      >
        {habit.completedToday && (
          <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none">
            <path d="M3 8l4 4 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      <div className="flex-1 min-w-0">
        <p className={clsx(
          'font-medium text-sm',
          habit.completedToday ? 'text-gray-400 line-through' : 'text-gray-100',
        )}>
          {habit.title}
        </p>
        {habit.description && (
          <p className="text-xs text-gray-500 mt-0.5 truncate">{habit.description}</p>
        )}
        <StreakBadge habitId={habit.id} />
      </div>

      <button
        onClick={() => deleteHabit.mutate(habit.id)}
        className="p-1.5 rounded text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
        title="Remove habit"
      >
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  )
}

function HabitForm({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [goalId, setGoalId] = useState('')
  const createHabit = useCreateHabit()
  const { data: goals = [] } = useGoals()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return
    await createHabit.mutateAsync({
      title: title.trim(),
      description: description || undefined,
      goalId: goalId || undefined,
    })
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-xl border border-gray-700 p-4 mb-4">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="Daily habit name (e.g. Morning walk)"
        className="w-full bg-transparent text-gray-100 placeholder-gray-500 outline-none text-sm"
        autoFocus
      />
      <div className="mt-2 flex gap-2">
        <input
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Description (optional)"
          className="flex-1 bg-gray-900/50 rounded-lg border border-gray-700 px-2 py-1.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
        />
        {goals.length > 0 && (
          <select
            value={goalId}
            onChange={e => setGoalId(e.target.value)}
            className="text-xs bg-gray-900 border border-gray-700 rounded-lg px-2 py-1.5 text-gray-300 outline-none"
          >
            <option value="">No goal</option>
            {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
          </select>
        )}
      </div>
      <div className="mt-3 flex justify-end gap-2">
        <button type="button" onClick={onClose} className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1.5">
          Cancel
        </button>
        <button
          type="submit"
          disabled={!title.trim() || createHabit.isPending}
          className="text-xs font-medium bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg transition-colors"
        >
          {createHabit.isPending ? 'Saving…' : 'Add Habit'}
        </button>
      </div>
    </form>
  )
}

export default function HabitsPage() {
  const [showForm, setShowForm] = useState(false)
  const { data: habits = [], isLoading } = useHabits()
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const completedCount = habits.filter(h => h.completedToday).length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-brand-400" />
            Habits
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">{today}</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Habit
        </button>
      </div>

      {habits.length > 0 && (
        <div className="mb-4 flex items-center gap-3">
          <div className="flex-1 bg-gray-800 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${habits.length ? (completedCount / habits.length) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm text-gray-400 shrink-0">{completedCount}/{habits.length} done</span>
        </div>
      )}

      {showForm && <HabitForm onClose={() => setShowForm(false)} />}

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 bg-gray-800/40 rounded-xl animate-pulse" />)}
        </div>
      ) : habits.length === 0 ? (
        <div className="text-center py-16 text-gray-600 group">
          <CheckSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium text-gray-500">No habits yet.</p>
          <p className="text-sm mt-1">Add daily habits you want to build.</p>
        </div>
      ) : (
        <div className="space-y-2 group">
          {habits.map(habit => <HabitCard key={habit.id} habit={habit} />)}
        </div>
      )}
    </div>
  )
}
