import { useState, useEffect } from 'react'
import { useCreateTask } from './useTasks'
import { useGoals } from '../goals/useGoals'
import { useLadderStore } from '../../stores/ladderStore'
import type { Priority } from '../../types'
import { parseNaturalDate, formatDueDate } from '../../utils/parseDueDate'
import { Calendar, X, GitGraph } from 'lucide-react'
import clsx from 'clsx'

interface Props {
  onClose?: () => void
}

const PRIORITIES: Priority[] = ['low', 'medium', 'high']
const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
}

export default function TaskForm({ onClose }: Props) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [priority, setPriority] = useState<Priority>('medium')
  const [goalId, setGoalId] = useState('')
  const [tagsInput, setTagsInput] = useState('')
  const [dueDateInput, setDueDateInput] = useState('')
  const [parsedDueDate, setParsedDueDate] = useState<{ date: string; time?: string } | null>(null)
  const [showDetails, setShowDetails] = useState(false)

  const createTask = useCreateTask()
  const { data: goals = [] } = useGoals()
  const { openBuilder } = useLadderStore()

  // Parse due date from input
  useEffect(() => {
    if (!dueDateInput.trim()) {
      setParsedDueDate(null)
      return
    }

    const parsed = parseNaturalDate(dueDateInput.trim())
    setParsedDueDate(parsed)
  }, [dueDateInput])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim()) return

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean)
    await createTask.mutateAsync({
      title: title.trim(),
      notes: notes || undefined,
      priority,
      goalId: goalId || undefined,
      tags,
      dueDate: parsedDueDate?.date || null,
      dueTime: parsedDueDate?.time || null,
    })

    setTitle('')
    setNotes('')
    setTagsInput('')
    setDueDateInput('')
    setParsedDueDate(null)
    setPriority('medium')
    setGoalId('')
    setShowDetails(false)
    onClose?.()
  }

  return (
    <form onSubmit={handleSubmit} className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
      <input
        value={title}
        onChange={e => setTitle(e.target.value)}
        placeholder="What's on your mind? (press Enter to save)"
        className="w-full bg-transparent text-gray-100 placeholder-gray-500 outline-none text-sm"
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) handleSubmit(e)
        }}
        autoFocus
      />

      {(title || showDetails) && (
        <div className="mt-3 space-y-2">
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Add notes (optional)"
            rows={2}
            className="w-full bg-gray-900/50 rounded-lg border border-gray-700 p-2 text-sm text-gray-200 placeholder-gray-600 outline-none resize-none"
          />

          {/* Due Date Input */}
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Calendar className="absolute left-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                value={dueDateInput}
                onChange={e => setDueDateInput(e.target.value)}
                placeholder="Due date (e.g., tomorrow, next monday, dec 25, in 3 days)"
                className="w-full bg-gray-900/50 rounded-lg border border-gray-700 pl-8 pr-8 py-1.5 text-sm text-gray-200 placeholder-gray-600 outline-none"
              />
              {dueDateInput && (
                <button
                  type="button"
                  onClick={() => setDueDateInput('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            {parsedDueDate && (
              <span className="text-xs text-brand-400 whitespace-nowrap">
                {formatDueDate(parsedDueDate.date, parsedDueDate.time)}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1">
              <span className="text-xs text-gray-500">Priority:</span>
              {PRIORITIES.map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPriority(p)}
                  className={clsx(
                    'text-xs px-2 py-0.5 rounded-full border transition-colors',
                    priority === p
                      ? p === 'high' ? 'bg-red-900/50 border-red-700 text-red-300'
                        : p === 'medium' ? 'bg-yellow-900/50 border-yellow-700 text-yellow-300'
                        : 'bg-gray-700 border-gray-600 text-gray-300'
                      : 'border-gray-700 text-gray-500 hover:border-gray-500'
                  )}
                >
                  {PRIORITY_LABELS[p]}
                </button>
              ))}
            </div>

            {goals.length > 0 && (
              <select
                value={goalId}
                onChange={e => setGoalId(e.target.value)}
                className="text-xs bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-gray-300 outline-none"
              >
                <option value="">No goal</option>
                {goals.map(g => (
                  <option key={g.id} value={g.id}>{g.title}</option>
                ))}
              </select>
            )}

            <input
              value={tagsInput}
              onChange={e => setTagsInput(e.target.value)}
              placeholder="Tags (comma-separated)"
              className="text-xs bg-gray-900 border border-gray-700 rounded-lg px-2 py-1 text-gray-300 placeholder-gray-600 outline-none"
            />
          </div>
        </div>
      )}

      <div className="mt-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
          >
            {showDetails ? '− Less options' : '+ More options'}
          </button>
          {title.trim() && (
            <button
              type="button"
              onClick={() => openBuilder({})}
              className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
              title="Break this down into smaller steps"
            >
              <GitGraph className="w-3.5 h-3.5" />
              Build ladder
            </button>
          )}
        </div>
        <div className="flex gap-2">
          {onClose && (
            <button type="button" onClick={onClose} className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1.5">
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={!title.trim() || createTask.isPending}
            className="text-xs font-medium bg-brand-600 hover:bg-brand-500 disabled:opacity-40 text-white px-4 py-1.5 rounded-lg transition-colors"
          >
            {createTask.isPending ? 'Saving…' : 'Add Task'}
          </button>
        </div>
      </div>
    </form>
  )
}
