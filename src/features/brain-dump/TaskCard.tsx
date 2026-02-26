import { useState } from 'react'
import { Clock, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import clsx from 'clsx'
import { formatDistanceToNow } from 'date-fns'
import type { Task } from '../../types'
import { useCompleteTask, useDeleteTask, useSnoozeTask } from './useTasks'

const PRIORITY_COLORS = {
  high: 'border-l-red-500',
  medium: 'border-l-yellow-600',
  low: 'border-l-gray-600',
}

const SNOOZE_OPTIONS = [
  { label: '1 hour', hours: 1 },
  { label: '3 hours', hours: 3 },
  { label: 'Tomorrow', hours: 24 },
  { label: '3 days', hours: 72 },
]

interface Props {
  task: Task
}

export default function TaskCard({ task }: Props) {
  const [expanded, setExpanded] = useState(false)
  const [showSnooze, setShowSnooze] = useState(false)

  const completeTask = useCompleteTask()
  const deleteTask = useDeleteTask()
  const snoozeTask = useSnoozeTask()

  const tags = (() => {
    try { return JSON.parse(task.tags) as string[] }
    catch { return [] }
  })()

  function snooze(hours: number) {
    const until = new Date(Date.now() + hours * 3600000).toISOString()
    snoozeTask.mutate({ id: task.id, until })
    setShowSnooze(false)
  }

  return (
    <div className={clsx(
      'group bg-gray-800/40 hover:bg-gray-800/60 rounded-xl border border-gray-700/50 border-l-4 transition-all',
      PRIORITY_COLORS[task.priority],
    )}>
      <div className="flex items-start gap-3 p-3">
        {/* Complete button */}
        <button
          onClick={() => completeTask.mutate(task.id)}
          disabled={completeTask.isPending}
          className="mt-0.5 w-5 h-5 rounded-full border-2 border-gray-600 hover:border-green-500 hover:bg-green-500/20 transition-all shrink-0 flex items-center justify-center"
          title="Mark complete"
        >
          {completeTask.isPending && <div className="w-2 h-2 rounded-full bg-gray-500 animate-pulse" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-200 leading-snug">{task.title}</p>

          {task.notes && !expanded && (
            <p className="text-xs text-gray-500 mt-0.5 truncate">{task.notes}</p>
          )}
          {expanded && task.notes && (
            <p className="text-xs text-gray-400 mt-1 whitespace-pre-wrap">{task.notes}</p>
          )}

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5">
              {tags.map(t => (
                <span key={t} className="text-xs bg-gray-700/60 text-gray-400 px-1.5 py-0.5 rounded-full">
                  {t}
                </span>
              ))}
            </div>
          )}

          <p className="text-xs text-gray-600 mt-1">
            {formatDistanceToNow(new Date(task.createdAt), { addSuffix: true })}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {(task.notes || tags.length > 0) && (
            <button
              onClick={() => setExpanded(!expanded)}
              className="p-1 rounded text-gray-500 hover:text-gray-300"
            >
              {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          )}
          <div className="relative">
            <button
              onClick={() => setShowSnooze(!showSnooze)}
              className="p-1 rounded text-gray-500 hover:text-gray-300"
              title="Snooze"
            >
              <Clock className="w-3.5 h-3.5" />
            </button>
            {showSnooze && (
              <div className="absolute right-0 top-6 z-10 bg-gray-800 border border-gray-700 rounded-lg shadow-xl py-1 min-w-32">
                {SNOOZE_OPTIONS.map(opt => (
                  <button
                    key={opt.label}
                    onClick={() => snooze(opt.hours)}
                    className="block w-full text-left px-3 py-1.5 text-xs text-gray-300 hover:bg-gray-700 transition-colors"
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            onClick={() => deleteTask.mutate(task.id)}
            className="p-1 rounded text-gray-500 hover:text-red-400"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
