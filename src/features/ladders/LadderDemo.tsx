import { useState, useEffect } from 'react'
import { GitGraph, CheckCircle, Circle, ArrowRight, X } from 'lucide-react'
import clsx from 'clsx'

const DEMO_GOAL = 'Launch My Blog'
const DEMO_STEPS = [
  { title: 'Pick a topic — jot down 3 bullet points', note: '~10 min' },
  { title: 'Set up a free blog on Substack or Ghost', note: '~15 min' },
  { title: 'Write a rough first draft — no editing yet', note: '1–2 hours' },
  { title: 'Edit, tidy up, add a cover image', note: '~30 min' },
  { title: 'Hit publish and share with one friend', note: 'The scary part — just do it' },
]

interface LadderDemoProps {
  onDismiss: () => void
  onBuildLadder: () => void
}

export function LadderDemo({ onDismiss, onBuildLadder }: LadderDemoProps) {
  const [visibleSteps, setVisibleSteps] = useState(0)
  const [showHighlight, setShowHighlight] = useState(false)
  const [showCta, setShowCta] = useState(false)

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [
      setTimeout(() => setVisibleSteps(1), 500),
      setTimeout(() => setVisibleSteps(2), 1050),
      setTimeout(() => setVisibleSteps(3), 1600),
      setTimeout(() => setVisibleSteps(4), 2150),
      setTimeout(() => setVisibleSteps(5), 2700),
      setTimeout(() => setShowHighlight(true), 3400),
      setTimeout(() => setShowCta(true), 4100),
    ]
    return () => timers.forEach(clearTimeout)
  }, [])

  return (
    <div className="bg-gradient-to-br from-brand-900/20 to-purple-900/20 rounded-2xl border border-brand-700/30 p-5">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-brand-600/20 text-brand-400 shrink-0 mt-0.5">
            <GitGraph className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-white">How Ladders Work</h3>
            <p className="text-sm text-gray-400 mt-0.5 leading-relaxed">
              Break any big goal into small steps, then start at the bottom rung — the one action you can take today.
            </p>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="p-1 text-gray-500 hover:text-gray-300 transition-colors shrink-0 ml-2"
          aria-label="Dismiss"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Animated ladder */}
      <div className="bg-gray-900/50 rounded-xl border border-gray-700/40 p-4 mb-4">
        {/* Goal row */}
        <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-700/50">
          <span className="text-lg leading-none">🎯</span>
          <div>
            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold mb-0.5">Goal</p>
            <p className="text-sm font-semibold text-white">{DEMO_GOAL}</p>
          </div>
        </div>

        {/* Steps — always rendered, animated in via CSS */}
        <div className="space-y-2">
          {DEMO_STEPS.map((step, i) => {
            const isVisible = i < visibleSteps
            const isFirst = i === 0
            const highlighted = showHighlight && isFirst

            return (
              <div
                key={i}
                className={clsx(
                  'flex items-start gap-3 p-3 rounded-lg border transition-all duration-500',
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2',
                  highlighted
                    ? 'bg-green-900/30 border-green-600/50'
                    : 'bg-gray-800/50 border-gray-700/40',
                )}
              >
                {/* Circle / check */}
                <div className={clsx(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all duration-300',
                  highlighted ? 'bg-green-600 border-green-600' : 'border-gray-600',
                )}>
                  {highlighted
                    ? <CheckCircle className="w-3.5 h-3.5 text-white" />
                    : <Circle className="w-3 h-3 text-transparent" />}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-mono text-gray-500">#{i + 1}</span>
                    <span className={clsx(
                      'text-sm font-medium',
                      highlighted ? 'text-green-300' : 'text-white',
                    )}>
                      {step.title}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{step.note}</p>
                </div>

                {/* "Start here" badge on step 1 */}
                {highlighted && (
                  <span className="shrink-0 text-[10px] font-semibold bg-green-700/40 text-green-300 px-2 py-0.5 rounded-full whitespace-nowrap self-center">
                    Start here ↑
                  </span>
                )}
              </div>
            )
          })}
        </div>

        {/* Bottom label */}
        <p className={clsx(
          'text-xs text-center mt-3 transition-all duration-500',
          showHighlight ? 'text-green-500 opacity-100' : 'text-transparent opacity-0',
        )}>
          Step #1 is your next action — small enough to do today
        </p>
      </div>

      {/* CTA */}
      <div className={clsx(
        'space-y-2 transition-all duration-500',
        showCta ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none',
      )}>
        <button
          onClick={onBuildLadder}
          className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-medium py-2.5 px-4 rounded-xl transition-colors text-sm"
        >
          Build Your First Ladder
          <ArrowRight className="w-4 h-4" />
        </button>
        <button
          onClick={onDismiss}
          className="w-full text-xs text-gray-500 hover:text-gray-400 transition-colors py-1"
        >
          I already get it — skip intro
        </button>
      </div>
    </div>
  )
}
