import { useNavigate } from 'react-router-dom'
import {
  Brain,
  CheckSquare,
  Timer,
  Target,
  GitGraph,
  Focus,
  TrendingUp,
  Sparkles,
  Zap,
  ShieldCheck,
  ArrowRight,
  Users,
} from 'lucide-react'

const features = [
  {
    icon: Brain,
    name: 'Brain Dump',
    tagline: 'Clear the mental clutter',
    description:
      'Capture every thought, task, and idea instantly before it vanishes. Prioritise later — just get it out of your head first.',
    color: 'text-violet-400',
    bg: 'bg-violet-900/20 border-violet-800/30',
  },
  {
    icon: Timer,
    name: 'Pomodoro Timer',
    tagline: 'Work in focused sprints',
    description:
      'ADHD-tuned Pomodoro sessions with structured breaks, distraction logging, and break activity suggestions to keep momentum.',
    color: 'text-brand-400',
    bg: 'bg-brand-900/20 border-brand-800/30',
  },
  {
    icon: CheckSquare,
    name: 'Habit Tracker',
    tagline: 'Build routines that stick',
    description:
      'Daily habit check-offs with streak visualisation. See your 7-day completion graph and celebrate consistency.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/20 border-emerald-800/30',
  },
  {
    icon: Target,
    name: 'Goals',
    tagline: 'Know what you\'re working toward',
    description:
      'Link tasks and habits to long-term goals so every action feels connected to something meaningful.',
    color: 'text-orange-400',
    bg: 'bg-orange-900/20 border-orange-800/30',
  },
  {
    icon: GitGraph,
    name: 'Ladders',
    tagline: 'Break big things into small steps',
    description:
      'Turn overwhelming goals into a step-by-step ladder. Climb one rung at a time — no paralysis, just progress.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-900/20 border-cyan-800/30',
  },
  {
    icon: Focus,
    name: 'Focus Mode',
    tagline: 'Single-task, distraction-free',
    description:
      'Lock in on one task at a time. Focus reminders, a dedicated work surface, and nothing else to pull your attention away.',
    color: 'text-rose-400',
    bg: 'bg-rose-900/20 border-rose-800/30',
  },
  {
    icon: TrendingUp,
    name: 'Level & Progress',
    tagline: 'Gamify your productivity',
    description:
      'Earn XP, level up, and unlock new modes as you build consistency. Progress feels tangible and rewarding.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/20 border-yellow-800/30',
  },
  {
    icon: Sparkles,
    name: 'AI Nudges',
    tagline: 'Personalised coaching moments',
    description:
      'Claude AI analyses your tasks, habits, and patterns to deliver timely, context-aware encouragement — not generic advice.',
    color: 'text-brand-300',
    bg: 'bg-brand-900/20 border-brand-800/30',
  },
]

const painPoints = [
  { icon: Zap, text: 'Tasks pile up and you don\'t know where to start' },
  { icon: ShieldCheck, text: 'You start strong then lose momentum by afternoon' },
  { icon: Users, text: 'Advice built for neurotypical brains never quite fits' },
  { icon: Brain, text: 'Brilliant ideas disappear before you can act on them' },
]

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">

      {/* Nav */}
      <header className="border-b border-gray-800/60 bg-gray-950/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <Brain className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">ADHD Coach</span>
          </div>
          <button
            onClick={() => navigate('/app/brain-dump')}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            Open App <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 bg-brand-900/40 border border-brand-800/50 text-brand-300 text-xs font-medium px-3 py-1.5 rounded-full mb-8">
          <Sparkles className="w-3.5 h-3.5" />
          Built for ADHD brains, by someone who gets it
        </div>

        <h1 className="text-5xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
          Find your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-violet-400">
            focus and flow
          </span>
          <br />
          on your own terms
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed mb-10">
          ADHD Coach is a productivity companion designed around how ADHD minds actually work —
          capturing ideas instantly, working in short sprints, building habits gradually, and
          celebrating every bit of progress.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => navigate('/app/brain-dump')}
            className="flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-7 py-3.5 rounded-xl text-base transition-colors shadow-lg shadow-brand-900/50"
          >
            Start for free <ArrowRight className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-500">No account needed · runs in your browser</span>
        </div>

        {/* Hero visual — fake app preview */}
        <div className="mt-16 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-transparent to-transparent z-10 pointer-events-none rounded-2xl" />
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-left shadow-2xl shadow-black/60 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500/60" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <span className="ml-3 text-xs text-gray-500 font-mono">ADHD Coach · Pomodoro</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 bg-gray-800/60 rounded-xl p-4 border border-gray-700/50">
                <p className="text-xs text-gray-500 mb-1">Current task</p>
                <p className="font-medium text-white text-sm">Write project proposal draft</p>
                <div className="mt-3 flex items-center gap-3">
                  <div className="text-3xl font-mono font-bold text-brand-300">23:41</div>
                  <div className="text-xs text-gray-500">Focus session #3</div>
                </div>
                <div className="mt-3 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-brand-600 to-brand-400 rounded-full" style={{ width: '55%' }} />
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <div className="bg-emerald-900/30 border border-emerald-800/30 rounded-xl p-3 text-center">
                  <p className="text-2xl font-bold text-emerald-400">7</p>
                  <p className="text-xs text-gray-500 mt-0.5">day streak</p>
                </div>
                <div className="bg-gray-800/60 border border-gray-700/50 rounded-xl p-3">
                  <p className="text-xs text-gray-500 mb-1.5">Today</p>
                  <div className="space-y-1">
                    {['Morning walk ✓', 'Deep work ✓', 'Review tasks'].map((t, i) => (
                      <div key={t} className="flex items-center gap-1.5 text-xs">
                        <div className={`w-3 h-3 rounded-sm border ${i < 2 ? 'bg-brand-600 border-brand-500' : 'border-gray-600'}`} />
                        <span className={i < 2 ? 'text-gray-300 line-through opacity-60' : 'text-gray-300'}>{t}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-3 bg-brand-950/60 border border-brand-900/50 rounded-xl px-4 py-3 flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-brand-400 shrink-0 mt-0.5" />
              <p className="text-xs text-gray-300 leading-relaxed">
                <span className="text-brand-300 font-medium">Nice momentum!</span> You've completed 3 sessions today.
                Your best focus window is usually mid-morning — you still have 40 minutes in it. Go for one more sprint.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pain points */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="bg-gray-900/60 border border-gray-800 rounded-2xl p-8 md:p-12">
          <h2 className="text-2xl font-bold text-center mb-2">Sound familiar?</h2>
          <p className="text-gray-400 text-center mb-10 max-w-xl mx-auto">
            ADHD Coach is built to tackle the exact friction points that make standard productivity tools fail ADHD brains.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            {painPoints.map(({ icon: Icon, text }) => (
              <div key={text} className="flex items-start gap-3 bg-gray-800/50 rounded-xl p-4 border border-gray-700/40">
                <div className="w-8 h-8 rounded-lg bg-brand-900/60 border border-brand-800/50 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-brand-400" />
                </div>
                <p className="text-sm text-gray-300 leading-relaxed pt-1">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-3">Everything your brain needs</h2>
          <p className="text-gray-400 max-w-xl mx-auto">
            Eight tools, one coherent system — each designed specifically for the way ADHD minds think and work.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map(({ icon: Icon, name, tagline, description, color, bg }) => (
            <div
              key={name}
              className={`rounded-2xl border p-5 ${bg} flex flex-col gap-3 hover:scale-[1.02] transition-transform`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gray-900/80 flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-white text-sm">{name}</p>
                <p className={`text-xs font-medium mt-0.5 ${color}`}>{tagline}</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it helps */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid md:grid-cols-3 gap-6 text-center">
          {[
            {
              stat: '25 min',
              label: 'Focused sprints',
              detail: 'Short enough to start, long enough to make real progress',
            },
            {
              stat: 'AI-powered',
              label: 'Personalised nudges',
              detail: 'Context-aware coaching from Claude AI — not generic productivity tips',
            },
            {
              stat: '1 key',
              label: 'Instant capture',
              detail: 'Press N anywhere to dump a thought before the moment passes',
            },
          ].map(({ stat, label, detail }) => (
            <div key={label} className="bg-gray-900/40 border border-gray-800 rounded-2xl p-8">
              <p className="text-4xl font-extrabold text-brand-300 mb-2">{stat}</p>
              <p className="font-semibold text-white mb-2">{label}</p>
              <p className="text-sm text-gray-400 leading-relaxed">{detail}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-6xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-br from-brand-950 via-gray-900 to-gray-950 border border-brand-900/60 rounded-3xl p-12 md:p-16">
          <h2 className="text-4xl font-extrabold mb-4">
            Ready to find your flow?
          </h2>
          <p className="text-gray-400 text-lg max-w-lg mx-auto mb-8">
            No sign-up, no credit card, no friction. Open the app and start where you are — right now.
          </p>
          <button
            onClick={() => navigate('/app/brain-dump')}
            className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors shadow-xl shadow-brand-900/60"
          >
            Launch ADHD Coach <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800/60 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <div className="w-6 h-6 rounded bg-brand-700 flex items-center justify-center">
              <Brain className="w-3.5 h-3.5 text-white" />
            </div>
            ADHD Coach — built with care for focus-challenged minds
          </div>
          <p className="text-xs text-gray-600">
            Open source · Runs on Cloudflare Pages
          </p>
        </div>
      </footer>

    </div>
  )
}
