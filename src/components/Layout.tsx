import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Brain, CheckSquare, Target, Timer, Sparkles, GitGraph, Focus, TrendingUp, Settings, BarChart3, Video } from 'lucide-react'
import clsx from 'clsx'
import NudgePanel from './NudgePanel'
import QuickCapture from './QuickCapture'
import { useAppOpen } from '../hooks/useAppOpen'
import { LevelProgress } from '../features/level/LevelProgress'
import { usePomodoroTicker } from '../hooks/usePomodoroTicker'
import { useAnnouncementNotifier } from '../hooks/useAnnouncementNotifier'
import { SessionNotification } from '../features/video-body-doubling/SessionNotification'

const nav = [
  { to: '/app/brain-dump', label: 'Brain Dump', icon: Brain },
  { to: '/app/habits', label: 'Habits', icon: CheckSquare },
  { to: '/app/pomodoro', label: 'Pomodoro', icon: Timer },
  { to: '/app/video-body-doubling', label: 'Body Doubling', icon: Video },
  { to: '/app/goals', label: 'Goals', icon: Target },
  { to: '/app/ladders', label: 'Ladders', icon: GitGraph },
  { to: '/app/focus', label: 'Focus', icon: Focus },
  { to: '/app/stats', label: 'Stats', icon: BarChart3 },
  { to: '/app/progress', label: 'Progress', icon: TrendingUp },
  { to: '/app/nudges', label: 'Nudge History', icon: Sparkles },
]

const bottomNav = [
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export default function Layout() {
  useAppOpen()
  usePomodoroTicker()
  const navigate = useNavigate()
  const location = useLocation()
  const { announcement: bdAnnouncement, dismiss: dismissBD } = useAnnouncementNotifier()

  // Don't show the in-app toast if user is already on the body doubling page
  const showBDToast = bdAnnouncement && !location.pathname.includes('video-body-doubling')

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="px-5 py-5 border-b border-gray-800">
          <h1 className="font-bold text-lg text-white tracking-tight">ADHD Coach</h1>
          <p className="text-xs text-gray-500 mt-0.5">Your personal focus companion</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-900/60 text-brand-300 border border-brand-800/50'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Level Progress in Sidebar */}
        <div className="p-3 border-t border-gray-800">
          <LevelProgress onClick={() => navigate('/app/progress')} compact={false} />
        </div>

        {/* Bottom Navigation */}
        <div className="p-3 border-t border-gray-800">
          {bottomNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-900/60 text-brand-300 border border-brand-800/50'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800',
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-600 text-center">
            Press <kbd className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-xs font-mono">N</kbd> to capture a thought
          </p>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-6 py-8">
          <NudgePanel />
          <Outlet />
        </div>
      </main>

      <QuickCapture />

      {showBDToast && (
        <SessionNotification
          announcement={bdAnnouncement}
          onJoin={() => {
            dismissBD()
            navigate('/app/video-body-doubling')
          }}
          onDismiss={dismissBD}
        />
      )}
    </div>
  )
}
