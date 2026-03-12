import { useState } from 'react'
import { RefreshCw, Check, Heart } from 'lucide-react'
import clsx from 'clsx'
import { useBreakActivitiesStore } from './breakActivitiesStore'
import { CATEGORY_FILTERS, BreakActivity } from './breakActivities'

interface BreakSuggestionsProps {
  breakDurationMin: number
  onActivitySelect?: (activity: BreakActivity) => void
}

export function BreakSuggestions({ breakDurationMin, onActivitySelect }: BreakSuggestionsProps) {
  const store = useBreakActivitiesStore()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [markedFavorite, setMarkedFavorite] = useState(false)

  // Get or refresh suggestion when component mounts or duration changes
  const suggestion = store.currentSuggestion || store.getSuggestion(breakDurationMin)

  const handleRefresh = () => {
    store.refreshSuggestion(breakDurationMin)
    setMarkedFavorite(false)
  }

  const handleComplete = () => {
    if (suggestion) {
      store.markCompleted(suggestion.id)
      onActivitySelect?.(suggestion)
    }
  }

  const handleCategoryFilter = (categoryId: string) => {
    setSelectedCategory(categoryId)
    if (categoryId === 'all') {
      store.setPreferredCategories([])
    } else {
      store.setPreferredCategories([categoryId])
    }
    handleRefresh()
  }

  if (!suggestion) return null

  return (
    <div className="w-full max-w-md mt-6">
      <div className="bg-gradient-to-br from-green-900/40 to-emerald-900/40 rounded-2xl border border-green-700/30 p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">💡</span>
          <div>
            <h3 className="text-sm font-medium text-green-300">Break Suggestion</h3>
            <p className="text-xs text-green-400/70">
              {suggestion.duration} min • {suggestion.category}
            </p>
          </div>
        </div>

        {/* Activity Card */}
        <div className="bg-gray-900/60 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="text-4xl">{suggestion.icon}</span>
            <div className="flex-1">
              <h4 className="text-lg font-semibold text-white mb-1">
                {suggestion.title}
              </h4>
              <p className="text-sm text-gray-400 leading-relaxed">
                {suggestion.description}
              </p>
              <div className="flex flex-wrap gap-1.5 mt-3">
                {suggestion.tags.map(tag => (
                  <span
                    key={tag}
                    className="text-xs px-2 py-0.5 bg-green-900/30 text-green-400 rounded-full"
                  >
                    {tag}
                  </span>
                ))}
                <span className="text-xs px-2 py-0.5 bg-gray-700/50 text-gray-400 rounded-full capitalize">
                  {suggestion.energyLevel} energy
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {CATEGORY_FILTERS.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryFilter(cat.id)}
              className={clsx(
                'text-xs px-3 py-1.5 rounded-full transition-colors flex items-center gap-1',
                selectedCategory === cat.id
                  ? 'bg-green-700 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-700/50 hover:text-gray-300'
              )}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={handleRefresh}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-gray-800/60 text-gray-300 hover:bg-gray-700/60 hover:text-white transition-colors text-sm font-medium"
          >
            <RefreshCw className="w-4 h-4" />
            Not feeling this
          </button>
          
          <button
            onClick={() => setMarkedFavorite(!markedFavorite)}
            className={clsx(
              'p-2.5 rounded-xl transition-colors',
              markedFavorite
                ? 'bg-pink-900/40 text-pink-400'
                : 'bg-gray-800/60 text-gray-400 hover:text-pink-400'
            )}
            title="Mark as favorite"
          >
            <Heart className={clsx('w-5 h-5', markedFavorite && 'fill-current')} />
          </button>
          
          <button
            onClick={handleComplete}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-green-700 text-white hover:bg-green-600 transition-colors text-sm font-medium"
          >
            <Check className="w-4 h-4" />
            Did this!
          </button>
        </div>

        {/* Energy Preference Quick Set */}
        <div className="mt-4 pt-4 border-t border-gray-700/50">
          <p className="text-xs text-gray-500 mb-2">How's your energy right now?</p>
          <div className="flex gap-2">
            {(['low', 'medium', 'high'] as const).map(energy => (
              <button
                key={energy}
                onClick={() => store.setEnergyPreference(
                  store.energyPreference === energy ? null : energy
                )}
                className={clsx(
                  'flex-1 text-xs px-3 py-2 rounded-lg transition-colors capitalize',
                  store.energyPreference === energy
                    ? 'bg-green-800/60 text-green-300 border border-green-700/50'
                    : 'bg-gray-800/30 text-gray-500 hover:bg-gray-700/30 hover:text-gray-400'
                )}
              >
                {energy}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
