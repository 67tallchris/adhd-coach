import { NavLink, Outlet } from 'react-router-dom'
import { Brain, CheckSquare, Target, Timer, Sparkles } from 'lucide-react'
import clsx from 'clsx'
import NudgePanel from './NudgePanel'
import QuickCapture from './QuickCapture'
import { useAppOpen } from '../hooks/useAppOpen'

const nav = [
  { to: '/brain-dump', label: 'Brain Dump', icon: Brain },
  { to: '/habits', label: 'Habits', icon: CheckSquare },
  { to: '/pomodoro', label: 'Pomodoro', icon: Timer },
  { to: '/goals', label: 'Goals', icon: Target },
  { to: '/nudges', label: 'Nudge History', icon: Sparkles },
]

export default function Layout() {
  useAppOpen()

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
    </div>
  )
}
