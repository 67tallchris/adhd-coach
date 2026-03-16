import { useState } from 'react'
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
  X,
  ChevronDown,
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
    detailedContent: {
      title: 'Brain Dump',
      subtitle: 'Your external hard drive for thoughts',
      sections: [
        {
          title: 'The Problem',
          content: 'ADHD brains are idea generators — but working memory is limited. Brilliant thoughts, important tasks, and random observations compete for mental RAM, creating anxiety and mental clutter. By the time you remember to write them down, half are gone.',
        },
        {
          title: 'How It Works',
          content: 'Press "N" anywhere in the app to instantly capture a thought. No categorization required, no pressure to act — just dump it. Later, sort items into tasks, goals, or archive. Your brain can let go because it knows nothing will be lost.',
        },
        {
          title: 'Why It Helps ADHD',
          content: 'Externalizes working memory, reduces cognitive load, and eliminates the anxiety of "I\'ll remember this" (you won\'t). The Zeigarnik effect — where unfinished tasks loop in your head — is neutralized when everything has a trusted home.',
        },
      ],
    },
  },
  {
    icon: Timer,
    name: 'Pomodoro Timer',
    tagline: 'Work in focused sprints',
    description:
      'ADHD-tuned Pomodoro sessions with structured breaks, distraction logging, and break activity suggestions to keep momentum.',
    color: 'text-brand-400',
    bg: 'bg-brand-900/20 border-brand-800/30',
    detailedContent: {
      title: 'Pomodoro Timer',
      subtitle: 'Focus in manageable chunks',
      sections: [
        {
          title: 'The Problem',
          content: 'Starting is the hardest part. A 4-hour project feels overwhelming, so you procrastinate. Or you hyperfocus for 3 hours straight, burn out, and crash. ADHD brains struggle with time perception and sustainable pacing.',
        },
        {
          title: 'How It Works',
          content: 'Set a timer for 25 minutes (or customize). Work on ONE thing until it rings. Take a 5-minute break. Repeat. Log distractions that pop up instead of acting on them. Get break activity suggestions to actually recharge.',
        },
        {
          title: 'Why It Helps ADHD',
          content: 'Makes starting feel safe ("only 25 minutes"). Creates external time structure when internal time perception is unreliable. Breaks prevent burnout. Distraction logging acknowledges impulses without derailing you. Body doubling connects you with others working simultaneously.',
        },
      ],
    },
  },
  {
    icon: CheckSquare,
    name: 'Habit Tracker',
    tagline: 'Build routines that stick',
    description:
      'Daily habit check-offs with streak visualisation. See your 7-day completion graph and celebrate consistency.',
    color: 'text-emerald-400',
    bg: 'bg-emerald-900/20 border-emerald-800/30',
    detailedContent: {
      title: 'Habit Tracker',
      subtitle: 'Small actions, compound results',
      sections: [
        {
          title: 'The Problem',
          content: 'You know what would help — exercise, meditation, consistent sleep. But motivation is unreliable. You go hard for a week, miss a day, feel like a failure, and quit. ADHD makes consistency feel impossible.',
        },
        {
          title: 'How It Works',
          content: 'Create habits tied to your goals. Check them off daily. Watch your streak grow. See a 7-day completion graph. Get weekly summaries showing your progress. Set realistic weekly goals and celebrate when you hit them.',
        },
        {
          title: 'Why It Helps ADHD',
          content: 'Visual streaks create immediate accountability. Missing one day doesn\'t destroy weeks of progress — the graph shows you\'re still doing well overall. Weekly goals are more forgiving than "never miss." Dopamine from check-offs reinforces the behavior.',
        },
      ],
    },
  },
  {
    icon: Target,
    name: 'Goals',
    tagline: 'Know what you\'re working toward',
    description:
      'Link tasks and habits to long-term goals so every action feels connected to something meaningful.',
    color: 'text-orange-400',
    bg: 'bg-orange-900/20 border-orange-800/30',
    detailedContent: {
      title: 'Goals',
      subtitle: 'Connect daily actions to meaningful outcomes',
      sections: [
        {
          title: 'The Problem',
          content: 'ADHD brains struggle with delayed gratification. "Write thesis" feels abstract and distant, so you scroll instead. Without visible connection between today\'s effort and future outcomes, motivation evaporates.',
        },
        {
          title: 'How It Works',
          content: 'Set long-term goals with target dates. Link tasks and habits directly to goals. Every completed task shows progress toward something meaningful. See which goals are getting attention and which are neglected.',
        },
        {
          title: 'Why It Helps ADHD',
          content: 'Makes abstract goals concrete. Creates immediate meaning for mundane tasks ("this isn\'t just admin — it\'s moving me toward my business"). Visual progress counters the "I\'m getting nothing done" feeling that\'s common with ADHD.',
        },
      ],
    },
  },
  {
    icon: GitGraph,
    name: 'Ladders',
    tagline: 'Break big things into small steps',
    description:
      'Turn overwhelming goals into a step-by-step ladder. Climb one rung at a time — no paralysis, just progress.',
    color: 'text-cyan-400',
    bg: 'bg-cyan-900/20 border-cyan-800/30',
    detailedContent: {
      title: 'Ladders',
      subtitle: 'One rung at a time',
      sections: [
        {
          title: 'The Problem',
          content: '"Write book" isn\'t a task — it\'s 500 tasks wearing a trench coat. ADHD executive dysfunction freezes when faced with vague, multi-step projects. You don\'t know where to start, so you don\'t start.',
        },
        {
          title: 'How It Works',
          content: 'Create a ladder for any big goal. Break it into specific, actionable steps ordered from bottom (first action) to top (goal achieved). Focus only on the current rung. Mark steps complete as you climb.',
        },
        {
          title: 'Why It Helps ADHD',
          content: 'Eliminates decision paralysis by pre-defining the next action. Makes progress visible and concrete. Reduces overwhelm by hiding the full scope — you only see the current rung. The "just one step" framing is psychologically manageable.',
        },
      ],
    },
  },
  {
    icon: Focus,
    name: 'Focus Tracking',
    tagline: 'Understand your attention patterns',
    description:
      'Real-time focus check-ins reveal when, where, and how you actually focus — building self-knowledge without demanding self-discipline.',
    color: 'text-rose-400',
    bg: 'bg-rose-900/20 border-rose-800/30',
    detailedContent: {
      title: 'Focus Tracking',
      subtitle: 'The Case for Real-Time Focus Tracking in ADHD Support',
      sections: [
        {
          title: 'The Problem with Retrospective Tracking',
          content: 'Most tools designed for people with ADHD ask them to reflect on their day after the fact — logging tasks completed, rating their mood in the evening, or journaling about what went wrong. But this retrospective approach has a fundamental flaw: ADHD itself compromises the kind of working memory and self-awareness needed to accurately recall how focused or distracted you actually were. By the time someone sits down to review their day, the texture of those moments has already been lost or distorted.',
        },
        {
          title: 'Real-Time Check-Ins Change Everything',
          content: 'By periodically prompting users in the moment — catching them while they\'re working, resting, or switching between activities — the app captures psychological data that is far more accurate than any retrospective report. This is the core insight behind Csikszentmihalyi\'s Experience Sampling Method, and it\'s especially well-suited to ADHD, where the gap between how people think their day went and how it actually went tends to be unusually wide.',
        },
        {
          title: 'Surfacing Patterns That Are Otherwise Invisible',
          content: 'The real power of correlating focus data with tasks and habits is pattern discovery. Someone with ADHD may have a strong intuition that they "work better in the morning" or that a particular app is ruining their productivity — but intuitions are unreliable. By building up a dataset of real check-in moments linked to what the person was doing, the app can reveal whether those beliefs are accurate, and more importantly, surface patterns the user would never have noticed on their own. Perhaps their focus reliably drops in the hour after a video call, or spikes unexpectedly during a walk. These are actionable insights that can reshape how someone structures their day.',
        },
        {
          title: 'Building Self-Knowledge Without Demanding Self-Discipline',
          content: 'Traditional ADHD management strategies often require the very executive function that ADHD impairs — consistent journaling, scheduled reviews, sustained habit tracking. A check-in prompt sidesteps this by doing the heavy lifting automatically. The user doesn\'t have to remember to track anything; the app creates the data record for them. Over time, this builds a genuine picture of how that specific person\'s attention works, not a generic model based on population averages.',
        },
        {
          title: 'Closing the Feedback Loop on Habits and Interventions',
          content: 'One of the most frustrating aspects of ADHD is uncertainty about whether any given strategy is actually helping. Does taking a break every 45 minutes improve focus, or just feel like it does? Does exercise in the morning make a measurable difference? With focus check-ins correlated to tracked habits, the app can give users real evidence about what\'s working for them personally — turning experimentation from guesswork into something closer to self-directed science.',
        },
        {
          title: 'Reducing Shame Through Objective Data',
          content: 'There\'s a less obvious but important benefit: the app reframes how users relate to their own attention. People with ADHD are frequently told — and often tell themselves — that their difficulty focusing is a personal failing. Seeing focus as data that fluctuates in response to real conditions (time of day, task type, sleep, context) makes it legible and less moralized. The message shifts from "I should be able to concentrate" to "here are the conditions under which I actually do."',
        },
      ],
    },
  },
  {
    icon: TrendingUp,
    name: 'Level & Progress',
    tagline: 'Gamify your productivity',
    description:
      'Earn XP, level up, and unlock new modes as you build consistency. Progress feels tangible and rewarding.',
    color: 'text-yellow-400',
    bg: 'bg-yellow-900/20 border-yellow-800/30',
    detailedContent: {
      title: 'Level & Progress System',
      subtitle: 'Gamification that actually motivates',
      sections: [
        {
          title: 'The Problem',
          content: 'ADHD brains crave immediate rewards, but productivity is inherently long-term. "You\'ll thank yourself later" doesn\'t compete with TikTok\'s instant dopamine. Progress feels invisible, making it hard to stay motivated.',
        },
        {
          title: 'How It Works',
          content: 'Earn XP for completing pomodoros, checking off habits, logging focus, and maintaining streaks. Level up through tiers (Wood → Iron → Steel → Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster). Unlock new features as you progress. See exactly how much XP until your next level.',
        },
        {
          title: 'Why It Helps ADHD',
          content: 'Provides immediate, tangible rewards for productive behavior. The "just X more XP" effect makes it easier to do one more task. Tier names and visual progress create identity ("I\'m a Gold-level user now"). Feature unlocks create anticipation and reward consistency.',
        },
      ],
    },
  },
  {
    icon: Sparkles,
    name: 'AI Nudges',
    tagline: 'Personalised coaching moments',
    description:
      'Claude AI analyses your tasks, habits, and patterns to deliver timely, context-aware encouragement — not generic advice.',
    color: 'text-brand-300',
    bg: 'bg-brand-900/20 border-brand-800/30',
    detailedContent: {
      title: 'AI Nudges',
      subtitle: 'Your personal ADHD coach, powered by Claude AI',
      sections: [
        {
          title: 'The Problem',
          content: 'Generic productivity advice ("just use a planner!") fails ADHD brains because it\'s not personalized to how you actually work. You need insights based on YOUR patterns, not population averages. But hiring a coach is expensive.',
        },
        {
          title: 'How It Works',
          content: 'Claude AI analyzes your completed pomodoros, habit streaks, focus check-ins, and task completions. It identifies patterns ("Your focus peaks at 10am") and delivers timely, contextual nudges ("You\'ve got 40 minutes left in your best focus window — want to tackle that hard thing?").',
        },
        {
          title: 'Why It Helps ADHD',
          content: 'Provides external perspective on your own behavior — seeing patterns you\'d miss. Delivers encouragement at the exact moment you need it. Reduces shame by framing struggles as data, not failure. Makes you feel seen and understood by something that actually knows your patterns.',
        },
      ],
    },
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
  const [expandedFeature, setExpandedFeature] = useState<typeof features[0] | null>(null)

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      {/* Feature Detail Modal */}
      {expandedFeature && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedFeature(null)}
        >
          <div 
            className="bg-gray-900 rounded-3xl border border-gray-700 w-full max-w-3xl max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gray-800 flex items-center justify-center ${expandedFeature.color}`}>
                  <expandedFeature.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{expandedFeature.detailedContent.title}</h3>
                  <p className="text-sm text-gray-400">{expandedFeature.detailedContent.subtitle}</p>
                </div>
              </div>
              <button
                onClick={() => setExpandedFeature(null)}
                className="p-2 text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {expandedFeature.detailedContent.sections.map((section) => (
                <div key={section.title} className="bg-gray-800/40 rounded-2xl border border-gray-700/40 p-5">
                  <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                    {section.title === 'The Problem' && '🎯'}
                    {section.title === 'The Problem with Retrospective Tracking' && '🎯'}
                    {section.title === 'How It Works' && '⚙️'}
                    {section.title === 'Real-Time Check-Ins Change Everything' && '⚙️'}
                    {section.title === 'Why It Helps ADHD' && '🧠'}
                    {section.title === 'Surfacing Patterns That Are Otherwise Invisible' && '🔍'}
                    {section.title === 'Building Self-Knowledge Without Demanding Self-Discipline' && '📚'}
                    {section.title === 'Closing the Feedback Loop on Habits and Interventions' && '🔄'}
                    {section.title === 'Reducing Shame Through Objective Data' && '💙'}
                    {' '}
                    {section.title}
                  </h4>
                  <p className="text-gray-300 leading-relaxed">{section.content}</p>
                </div>
              ))}

              {/* CTA */}
              <div className="pt-4">
                <button
                  onClick={() => {
                    setExpandedFeature(null)
                    navigate('/app/brain-dump')
                  }}
                  className="w-full py-4 rounded-xl bg-brand-600 hover:bg-brand-500 text-white font-semibold transition-colors flex items-center justify-center gap-2"
                >
                  Try {expandedFeature.detailedContent.title} <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
          {features.map(({ icon: Icon, name, tagline, description, color, bg, detailedContent }) => (
            <button
              key={name}
              onClick={() => setExpandedFeature({ icon: Icon, name, tagline, description, color, bg, detailedContent })}
              className={`rounded-2xl border p-5 ${bg} flex flex-col gap-3 hover:scale-[1.02] transition-transform text-left group`}
            >
              <div className={`w-10 h-10 rounded-xl bg-gray-900/80 flex items-center justify-center ${color}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-white text-sm">{name}</p>
                  <ChevronDown className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
                <p className={`text-xs font-medium mt-0.5 ${color}`}>{tagline}</p>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">{description}</p>
            </button>
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
