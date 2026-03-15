import { useState } from 'react'
import { GitGraph, Plus } from 'lucide-react'
import clsx from 'clsx'
import { useLadders } from './useLadders'
import LadderCard from './LadderCard'
import LadderBuilder from './LadderBuilder'
import { useLadderStore } from '../../stores/ladderStore'

type TabStatus = 'active' | 'completed' | 'archived'

const TABS: { status: TabStatus; label: string }[] = [
  { status: 'active', label: 'Active' },
  { status: 'completed', label: 'Completed' },
  { status: 'archived', label: 'Archived' },
]

export default function LadderPage() {
  const [activeTab, setActiveTab] = useState<TabStatus>('active')
  const { openBuilder } = useLadderStore()

  const { data: ladders = [], isLoading } = useLadders({ status: activeTab })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <GitGraph className="w-5 h-5 text-brand-400" />
            Reverse Task Mapping
          </h2>
          <p className="text-sm text-gray-500 mt-0.5">
            Work backwards from your goal to find the first action
          </p>
        </div>
        <button
          onClick={() => openBuilder()}
          className="flex items-center gap-1.5 text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white px-3 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          Build Ladder
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-800/50 rounded-xl p-1">
        {TABS.map(({ status, label }) => (
          <button
            key={status}
            onClick={() => setActiveTab(status)}
            className={clsx(
              'flex-1 py-2 px-3 rounded-lg text-sm font-medium transition-colors',
              activeTab === status
                ? 'bg-gray-700 text-white'
                : 'text-gray-500 hover:text-gray-300',
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Ladder list */}
      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-gray-800/40 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : ladders.length === 0 ? (
        <div className="text-center py-16 text-gray-600">
          {activeTab === 'active' ? (
            <>
              <GitGraph className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p className="font-medium text-gray-500">No ladders yet</p>
              <p className="text-sm mt-1">Build a ladder to break down big goals into manageable steps.</p>
            </>
          ) : activeTab === 'completed' ? (
            <p>No completed ladders yet.</p>
          ) : (
            <p>No archived ladders.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {ladders.map(ladder => (
            <LadderCard key={ladder.id} ladder={ladder} />
          ))}
        </div>
      )}

      {/* Builder modal */}
      <LadderBuilder />
    </div>
  )
}
