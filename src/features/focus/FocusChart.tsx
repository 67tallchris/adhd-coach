import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import clsx from 'clsx'
import { FOCUS_LEVELS } from '../../types'

interface DailyFocusData {
  date: string
  avgFocus: number
  logCount: number
}

interface FocusChartProps {
  data: DailyFocusData[]
  days?: number
  title?: string
}

export function FocusChart({ data, days = 7, title }: FocusChartProps) {
  const chartData = useMemo(() => {
    // Sort by date ascending and take last N days
    const sorted = [...data].sort((a, b) => a.date.localeCompare(b.date)).slice(-days)
    return sorted
  }, [data, days])

  const { trend, avgFocus, minFocus, maxFocus } = useMemo(() => {
    if (chartData.length === 0) {
      return { trend: 'stable', avgFocus: 0, minFocus: 0, maxFocus: 0 }
    }

    const avg = chartData.reduce((sum, d) => sum + d.avgFocus, 0) / chartData.length
    const min = Math.min(...chartData.map(d => d.avgFocus))
    const max = Math.max(...chartData.map(d => d.avgFocus))

    // Calculate trend (compare first half to second half)
    const midpoint = Math.floor(chartData.length / 2)
    const firstHalfAvg = chartData.slice(0, midpoint).reduce((sum, d) => sum + d.avgFocus, 0) / midpoint || 0
    const secondHalfAvg = chartData.slice(midpoint).reduce((sum, d) => sum + d.avgFocus, 0) / (chartData.length - midpoint) || 0
    const diff = secondHalfAvg - firstHalfAvg

    let trend: 'up' | 'down' | 'stable' = 'stable'
    if (diff > 0.3) trend = 'up'
    else if (diff < -0.3) trend = 'down'

    return { trend, avgFocus: Math.round(avg * 10) / 10, minFocus: Math.round(min * 10) / 10, maxFocus: Math.round(max * 10) / 10 }
  }, [chartData])

  const chartHeight = 200
  const chartWidth = 100
  const padding = 10
  const graphHeight = chartHeight - padding * 2
  const graphWidth = chartWidth - padding * 2

  // Scale functions
  const xScale = (index: number) => padding + (index / (chartData.length - 1 || 1)) * graphWidth
  const yScale = (value: number) => chartHeight - padding - ((value - 1) / 4) * graphHeight

  // Generate path for line chart
  const linePath = useMemo(() => {
    if (chartData.length === 0) return ''
    return chartData.map((d, i) => {
      const x = xScale(i)
      const y = yScale(d.avgFocus)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }, [chartData])

  // Generate area path
  const areaPath = useMemo(() => {
    if (chartData.length === 0) return ''
    const line = chartData.map((d, i) => {
      const x = xScale(i)
      const y = yScale(d.avgFocus)
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
    const lastX = xScale(chartData.length - 1)
    const firstX = xScale(0)
    const baseline = chartHeight - padding
    return `${line} L ${lastX} ${baseline} L ${firstX} ${baseline} Z`
  }, [chartData])

  // Get color for focus level
  const getColor = (level: number) => {
    return FOCUS_LEVELS.find(f => f.level === Math.round(level))?.color || '#6b7280'
  }

  // Get emoji for focus level
  const getEmoji = (level: number) => {
    return FOCUS_LEVELS.find(f => f.level === Math.round(level))?.emoji || '😐'
  }

  if (chartData.length === 0) {
    return (
      <div className="bg-gray-800/40 rounded-2xl border border-gray-700/40 p-6 text-center">
        <p className="text-gray-400">No focus data yet</p>
        <p className="text-sm text-gray-500 mt-1">Start logging your focus to see trends</p>
      </div>
    )
  }

  return (
    <div className="bg-gray-800/40 rounded-2xl border border-gray-700/40 p-5">
      {title && (
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold text-white">{title}</h3>
          <div className="flex items-center gap-2">
            <span className={clsx(
              'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full',
              trend === 'up' ? 'bg-green-900/30 text-green-400' :
              trend === 'down' ? 'bg-red-900/30 text-red-400' :
              'bg-gray-700/50 text-gray-400'
            )}>
              {trend === 'up' && <TrendingUp className="w-3 h-3" />}
              {trend === 'down' && <TrendingDown className="w-3 h-3" />}
              {trend === 'stable' && <Minus className="w-3 h-3" />}
              {trend === 'up' ? 'Improving' : trend === 'down' ? 'Declining' : 'Stable'}
            </span>
          </div>
        </div>
      )}

      {/* Stats Summary */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="bg-gray-900/50 rounded-lg p-2.5 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Average</p>
          <p className="text-lg font-bold text-white">{avgFocus}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2.5 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Best</p>
          <p className="text-lg font-bold text-green-400">{maxFocus}</p>
        </div>
        <div className="bg-gray-900/50 rounded-lg p-2.5 text-center">
          <p className="text-xs text-gray-500 mb-0.5">Lowest</p>
          <p className="text-lg font-bold text-orange-400">{minFocus}</p>
        </div>
      </div>

      {/* Chart */}
      <div className="relative" style={{ height: chartHeight }}>
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          {/* Grid lines */}
          {[1, 2, 3, 4, 5].map((level) => (
            <line
              key={level}
              x1={padding}
              y1={yScale(level)}
              x2={chartWidth - padding}
              y2={yScale(level)}
              stroke="#374151"
              strokeWidth="0.5"
              strokeDasharray="2,2"
            />
          ))}

          {/* Area fill */}
          <path
            d={areaPath}
            fill="url(#gradient)"
            opacity="0.3"
          />

          {/* Line */}
          <path
            d={linePath}
            fill="none"
            stroke="#4f5bff"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Data points */}
          {chartData.map((d, i) => (
            <g key={d.date}>
              <circle
                cx={xScale(i)}
                cy={yScale(d.avgFocus)}
                r="2"
                fill="#1f2937"
                stroke={getColor(d.avgFocus)}
                strokeWidth="1"
              />
              {/* Tooltip on hover (simplified) */}
            </g>
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#4f5bff" stopOpacity="0.5" />
              <stop offset="100%" stopColor="#4f5bff" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs text-gray-500 py-2.5 pointer-events-none">
          <span>5</span>
          <span>4</span>
          <span>3</span>
          <span>2</span>
          <span>1</span>
        </div>
      </div>

      {/* X-axis labels */}
      <div className="flex justify-between mt-2 text-xs text-gray-500">
        {chartData.map((d, i) => {
          const date = new Date(d.date)
          const label = i === 0 ? 'Start' : i === chartData.length - 1 ? 'Today' :
            date.toLocaleDateString('en-US', { weekday: 'short' })
          return (
            <span key={d.date} className="text-center">
              {label}
            </span>
          )
        })}
      </div>

      {/* Hover info (simplified - shows last point) */}
      {chartData.length > 0 && (
        <div className="mt-3 flex items-center justify-center gap-2 text-sm">
          <span className="text-2xl">{getEmoji(chartData[chartData.length - 1].avgFocus)}</span>
          <span className="text-gray-400">
            {chartData[chartData.length - 1].logCount} logs on {new Date(chartData[chartData.length - 1].date).toLocaleDateString()}
          </span>
        </div>
      )}
    </div>
  )
}
