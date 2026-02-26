import { useState } from 'react'
import { Brain, Plus, Inbox, Clock, CheckCircle } from 'lucide-react'
import clsx from 'clsx'
import type { TaskStatus } from '../../types'
import { useTasks } from './useTasks'
import TaskCard from './TaskCard'
import TaskForm from './TaskForm'

const TABS: { status: TaskStatus; label: string; icon: typeof Inbox }[] = [
  { status: 'inbox', label: 'Inbox', icon: Inbox },
  { status: 'snoozed', label: 'Snoozed', icon: Clock },
  { status: 'done', label: 'Done', icon: CheckCircle },
]

export default function BrainDumpPage() {
  const [activeTab, setActiveTab] = useState<TaskStatus>('inbox')
  const [showForm, setShowForm] = useState(false)

  const { data: tasks = [], isLoading } = useTasks({ status: activeTab })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Brain className="w-5 h-5 text-brand-400" />
            Brain Dump
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">Get it out of your head</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-1.5 text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      </div>

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
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
              activeTab === status
                ? 'bg-gray-700 text-white'
                : 'text-gray-500 hover:text-gray-300',
            )}
          >
            <Icon className="w-3.5 h-3.5" />
            {label}
          </button>
        ))}
      </div>

      {/* Task list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-16 bg-gray-800/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          {activeTab === 'inbox' ? (
            <>
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-gray-500">Inbox is clear!</p>
              <p className="text-sm mt-1">Press <kbd className="bg-gray-800 px-1.5 py-0.5 rounded text-xs font-mono">N</kbd> anywhere to capture a thought.</p>
            </>
          ) : activeTab === 'snoozed' ? (
            <p>No snoozed tasks.</p>
          ) : (
            <p>Nothing completed yet — go get something done!</p>
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
