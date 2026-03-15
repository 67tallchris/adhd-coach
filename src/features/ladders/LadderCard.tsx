import { GitGraph, CheckCircle, Circle, Trash2, ArrowUp } from 'lucide-react'
import clsx from 'clsx'
import type { LadderGoal } from '../../types'
import { useDeleteLadder, useUpdateStep } from './useLadders'

interface LadderCardProps {
  ladder: LadderGoal
  onViewDetail?: (id: string) => void
}

export default function LadderCard({ ladder, onViewDetail }: LadderCardProps) {
  const deleteLadder = useDeleteLadder()
  const updateStep = useUpdateStep()

  const completedSteps = ladder.steps?.filter(s => s.isCompleted).length || 0
  const totalSteps = ladder.steps?.length || 0
  const progress = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  const handleToggleStep = async (stepId: string, isCompleted: boolean) => {
    await updateStep.mutateAsync({
      ladderId: ladder.id,
      stepId,
      isCompleted: !isCompleted,
    })
  }

  const handleDelete = async () => {
    if (confirm('Delete this ladder?')) {
      await deleteLadder.mutateAsync(ladder.id)
    }
  }

  return (
    <div className="bg-gray-800/40 border border-gray-700/50 rounded-xl overflow-hidden hover:border-gray-600 transition-colors">
      {/* Header */}
      <div className="p-4 border-b border-gray-700/50">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 rounded-lg bg-brand-600/20 text-brand-400 mt-0.5">
              <GitGraph className="w-5 h-5" />
            </div>
            <div className="flex-1">
              <h3 className="text-base font-semibold text-white">{ladder.title}</h3>
              {ladder.description && (
                <p className="text-sm text-gray-400 mt-1">{ladder.description}</p>
              )}
            </div>
          </div>
          <button
            onClick={handleDelete}
            className="p-2 rounded-lg hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>

        {/* Progress bar */}
        {totalSteps > 0 && (
          <div className="mt-4">
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1.5">
              <span>{completedSteps} of {totalSteps} steps completed</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-600 to-brand-500 transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Steps */}
      {ladder.steps && ladder.steps.length > 0 && (
        <div className="p-4 space-y-2">
          {/* Display steps from bottom (1) to top (highest) */}
          {[...ladder.steps].sort((a, b) => a.stepNumber - b.stepNumber).map((step) => (
            <button
              key={step.id}
              onClick={() => handleToggleStep(step.id, step.isCompleted)}
              className={clsx(
                'w-full flex items-center gap-3 p-3 rounded-lg border transition-all text-left',
                step.isCompleted
                  ? 'bg-green-900/20 border-green-700/30'
                  : 'bg-gray-900/50 border-gray-700/50 hover:border-gray-600',
              )}
            >
              <div className={clsx(
                'flex-shrink-0 w-5 h-5 rounded-full border-2 flex items-center justify-center',
                step.isCompleted
                  ? 'bg-green-600 border-green-600 text-white'
                  : 'border-gray-500 text-transparent',
              )}>
                {step.isCompleted ? <CheckCircle className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-gray-500">#{step.stepNumber}</span>
                  <span className={clsx(
                    'text-sm font-medium',
                    step.isCompleted ? 'text-green-400 line-through' : 'text-white',
                  )}>
                    {step.title}
                  </span>
                </div>
                {step.notes && (
                  <p className={clsx(
                    'text-xs mt-1',
                    step.isCompleted ? 'text-green-400/60' : 'text-gray-500',
                  )}>
                    {step.notes}
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Footer */}
      <div className="px-4 py-3 bg-gray-900/30 border-t border-gray-700/50 flex items-center justify-between">
        <span className="text-xs text-gray-500">
          {totalSteps === 0
            ? 'No steps yet'
            : completedSteps === totalSteps
              ? '🎉 Ladder complete!'
              : `${totalSteps - completedSteps} steps remaining`}
        </span>
        {onViewDetail && (
          <button
            onClick={() => onViewDetail(ladder.id)}
            className="text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
          >
            View Details
            <ArrowUp className="w-3.5 h-3.5 rotate-45" />
          </button>
        )}
      </div>
    </div>
  )
}
