import { useLadderStore } from '../../stores/ladderStore'
import { useCreateTask } from '../brain-dump/useTasks'
import { useCreateLadder } from './useLadders'
import { GitGraph, Plus, X, ArrowUp, ArrowDown, Trash2, Target, FileText } from 'lucide-react'

export default function LadderBuilder() {
  const {
    isBuilderOpen,
    closeBuilder,
    builderGoalTitle,
    builderGoalDescription,
    builderSteps,
    setGoalTitle,
    setGoalDescription,
    addStep,
    updateStep,
    removeStep,
    moveStepUp,
    moveStepDown,
    resetBuilder,
  } = useLadderStore()

  const createLadder = useCreateLadder()
  const createTask = useCreateTask()

  const handleSave = async () => {
    if (!builderGoalTitle.trim()) return

    // Filter out empty steps
    const validSteps = builderSteps.filter(s => s.title.trim())

    // Create the ladder
    await createLadder.mutateAsync({
      title: builderGoalTitle.trim(),
      description: builderGoalDescription.trim() || undefined,
      steps: validSteps.map((step, index) => ({
        stepNumber: index + 1,
        title: step.title.trim(),
        notes: step.notes?.trim() || undefined,
      })),
    })

    resetBuilder()
    closeBuilder()
  }

  const handleSaveAndCreateTask = async () => {
    if (!builderGoalTitle.trim() || builderSteps.length === 0) return

    const firstStep = builderSteps[0]
    if (!firstStep?.title.trim()) return

    // Create the ladder
    const ladder = await createLadder.mutateAsync({
      title: builderGoalTitle.trim(),
      description: builderGoalDescription.trim() || undefined,
      steps: builderSteps.filter(s => s.title.trim()).map((step, index) => ({
        stepNumber: index + 1,
        title: step.title.trim(),
        notes: step.notes?.trim() || undefined,
      })),
    })

    // Create a task for the first step
    if (ladder.id) {
      await createTask.mutateAsync({
        title: firstStep.title.trim(),
        notes: firstStep.notes?.trim() || `Step 1 of ladder: ${builderGoalTitle}`,
      })
    }

    resetBuilder()
    closeBuilder()
  }

  if (!isBuilderOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-2xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 border-b border-gray-700 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-brand-600/20 text-brand-400">
              <GitGraph className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Build Your Ladder</h2>
              <p className="text-xs text-gray-500">Work backwards from your goal</p>
            </div>
          </div>
          <button
            onClick={closeBuilder}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Goal at the top */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <Target className="w-4 h-4" />
              <span>Start with the end goal (top of ladder)</span>
            </div>
            <input
              type="text"
              value={builderGoalTitle}
              onChange={(e) => setGoalTitle(e.target.value)}
              placeholder="e.g., Submit a job application"
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-600"
              autoFocus
            />
            <textarea
              value={builderGoalDescription}
              onChange={(e) => setGoalDescription(e.target.value)}
              placeholder="Optional description..."
              rows={2}
              className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-600 resize-none"
            />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <FileText className="w-4 h-4" />
                <span>Add steps (working backwards)</span>
              </div>
              <button
                onClick={addStep}
                className="flex items-center gap-1.5 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Step
              </button>
            </div>

            <div className="space-y-2">
              {builderSteps.map((step, index) => (
                <div
                  key={index}
                  className="bg-gray-800/50 border border-gray-700 rounded-xl p-4 space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-1 flex items-center gap-2 text-sm text-gray-400">
                      <span className="text-xs font-mono bg-gray-700 px-2 py-0.5 rounded">
                        Step {index + 1}
                      </span>
                      {index > 0 && (
                        <span className="text-xs">← What needs to happen before step {index}?</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <button
                          onClick={() => moveStepUp(index)}
                          className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          title="Move up"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                      )}
                      {index < builderSteps.length - 1 && (
                        <button
                          onClick={() => moveStepDown(index)}
                          className="p-1.5 rounded hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
                          title="Move down"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeStep(index)}
                        className="p-1.5 rounded hover:bg-red-900/30 text-gray-400 hover:text-red-400 transition-colors"
                        title="Remove step"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={step.title}
                    onChange={(e) => updateStep(index, { title: e.target.value })}
                    placeholder={index === 0 ? "What's the very first action?" : "What needs to happen before this?"}
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-600"
                  />
                  <input
                    type="text"
                    value={step.notes || ''}
                    onChange={(e) => updateStep(index, { notes: e.target.value })}
                    placeholder="Optional notes..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-600 text-sm"
                  />
                </div>
              ))}

              {builderSteps.length === 0 && (
                <div className="text-center py-8 text-gray-500 border-2 border-dashed border-gray-700 rounded-xl">
                  <p className="text-sm">No steps yet. Click "Add Step" to start building your ladder.</p>
                  <p className="text-xs mt-2">Start with what needs to happen right before your goal, then keep working backwards.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 border-t border-gray-700 p-4 flex items-center justify-between">
          <button
            onClick={addStep}
            className="flex items-center gap-2 text-sm font-medium text-brand-400 hover:text-brand-300 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Another Step
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleSave}
              disabled={!builderGoalTitle.trim()}
              className="px-4 py-2 rounded-lg text-sm font-medium text-gray-300 hover:text-white hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Ladder
            </button>
            <button
              onClick={handleSaveAndCreateTask}
              disabled={!builderGoalTitle.trim() || builderSteps.length === 0}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-brand-600 hover:bg-brand-500 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save & Create First Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
