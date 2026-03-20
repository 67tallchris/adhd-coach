import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom'
import { Brain, CheckSquare, Target, Timer, Sparkles, GitGraph, Focus, TrendingUp, Settings, BarChart3, Video, Menu, X } from 'lucide-react'
import clsx from 'clsx'
import { useState } from 'react'
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

// Mobile bottom nav items (most frequently used)
const mobileBottomNav = [
  { to: '/app/brain-dump', label: 'Brain Dump', icon: Brain },
  { to: '/app/habits', label: 'Habits', icon: CheckSquare },
  { to: '/app/pomodoro', label: 'Timer', icon: Timer },
  { to: '/app/video-body-doubling', label: 'Body Doubling', icon: Video },
  { to: '/app/settings', label: 'Settings', icon: Settings },
]

export default function Layout() {
  useAppOpen()
  usePomodoroTicker()
  const navigate = useNavigate()
  const location = useLocation()
  const { announcement: bdAnnouncement, dismiss: dismissBD } = useAnnouncementNotifier()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Don't show the in-app toast if user is already on the body doubling page
  const showBDToast = bdAnnouncement && !location.pathname.includes('video-body-doubling')

  const navLinkClass = (isActive: boolean) => clsx(
    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
    isActive
      ? 'bg-brand-900/60 text-brand-300 border border-brand-800/50'
      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800',
  )

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar - hidden on mobile, shown on lg screens */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-gray-900 border-r border-gray-800 flex-col">
        <div className="px-5 py-5 border-b border-gray-800">
          <h1 className="font-bold text-lg text-white tracking-tight">ADHD Coach</h1>
          <p className="text-xs text-gray-500 mt-0.5">Your personal focus companion</p>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => navLinkClass(isActive)}
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
              className={({ isActive }) => navLinkClass(isActive)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-gray-800">
          <p className="text-xs text-gray-600 text-center">
            Press <kbd className="bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded text-xs font-mono">N</kbd> to capture
          </p>
        </div>
      </aside>

      {/* Mobile sidebar drawer */}
      <aside className={clsx(
        'fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform duration-300 lg:hidden',
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-800">
          <div>
            <h1 className="font-bold text-lg text-white tracking-tight">ADHD Coach</h1>
            <p className="text-xs text-gray-500 mt-0.5">Your personal focus companion</p>
          </div>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {nav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-3 border-t border-gray-800">
          <LevelProgress onClick={() => { setMobileMenuOpen(false); navigate('/app/progress'); }} compact={false} />
        </div>

        <div className="p-3 border-t border-gray-800">
          {bottomNav.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              onClick={() => setMobileMenuOpen(false)}
              className={({ isActive }) => navLinkClass(isActive)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </NavLink>
          ))}
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto flex flex-col">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-30 bg-gray-950/95 backdrop-blur border-b border-gray-800">
          <div className="flex items-center justify-between px-4 py-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
            <h1 className="font-bold text-base text-white">ADHD Coach</h1>
            <div className="w-10" /> {/* Spacer for balance */}
          </div>
        </header>

        {/* Page content */}
        <div className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-4 sm:py-6 pb-24 lg:pb-6">
          <NudgePanel />
          <Outlet />
        </div>

        {/* Mobile bottom navigation */}
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-gray-900/95 backdrop-blur border-t border-gray-800 z-30 safe-area-bottom">
          <div className="flex items-center justify-around">
            {mobileBottomNav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) => clsx(
                  'flex flex-col items-center justify-center py-3 px-2 flex-1 transition-colors',
                  isActive
                    ? 'text-brand-400'
                    : 'text-gray-500 hover:text-gray-300',
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs mt-0.5 font-medium">{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
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
