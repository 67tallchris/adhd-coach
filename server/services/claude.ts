import Anthropic from '@anthropic-ai/sdk'
import type { Db } from '../db/index'
import { tasks, habits, habitCompletions, goals, nudges, pomodoroSessions } from '../db/schema'
import { eq, and, sql, desc } from 'drizzle-orm'

const SYSTEM_PROMPT = `You are an ADHD coach assistant embedded in a personal productivity app.
The user has ADHD and benefits from:
- Short, concrete, non-judgmental messages
- Picking ONE thing to focus on (not a list of everything they're behind on)
- Encouragement about what they DID complete
- Gentle reminders about things they care about (their long-term goals)

Based on the context below, generate a single nudge message (2-4 sentences max).
The nudge should:
1. Acknowledge something positive if possible (recent completion, streak, focus sessions)
2. Suggest ONE specific next action from their inbox or habits
3. Optionally connect it to a goal they care about
4. Be warm and non-shaming — never use words like "should", "must", "failed", "behind", "overdue"

Do not repeat the last nudge. Do not list multiple tasks. Be specific and personal.
Respond with ONLY the nudge text, no preamble, no quotes.`

export async function generateNudge(db: Db, apiKey: string): Promise<string> {
  const today = new Date().toISOString().slice(0, 10)
  const hour = new Date().getHours()
  const timeOfDay = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening'
  const dayOfWeek = new Date().toLocaleDateString('en-US', { weekday: 'long' })
  const twoDaysAgo = new Date(Date.now() - 2 * 86400000).toISOString()

  // Gather context in parallel
  const [
    inboxTasks,
    snoozedTasks,
    recentlyDone,
    activeGoals,
    allHabits,
    todayCompletions,
    pomodoroToday,
    lastNudge,
  ] = await Promise.all([
    db.select({ id: tasks.id, title: tasks.title, createdAt: tasks.createdAt })
      .from(tasks).where(eq(tasks.status, 'inbox'))
      .orderBy(sql`created_at ASC`).limit(5),

    db.select({ title: tasks.title })
      .from(tasks)
      .where(and(eq(tasks.status, 'snoozed'), sql`snooze_until < datetime('now')`))
      .limit(3),

    db.select({ title: tasks.title, completedAt: tasks.completedAt })
      .from(tasks)
      .where(and(eq(tasks.status, 'done'), sql`completed_at >= ${twoDaysAgo}`))
      .orderBy(desc(tasks.completedAt)).limit(3),

    db.select({ title: goals.title, targetDate: goals.targetDate })
      .from(goals).where(eq(goals.status, 'active')),

    db.select().from(habits).where(eq(habits.isActive, true)),

    db.select({ habitId: habitCompletions.habitId })
      .from(habitCompletions).where(eq(habitCompletions.date, today)),

    db.select({ count: sql<number>`count(*)` })
      .from(pomodoroSessions)
      .where(sql`started_at >= ${today} AND completed_at IS NOT NULL`),

    db.select({ content: nudges.content })
      .from(nudges).orderBy(desc(nudges.createdAt)).limit(1),
  ])

  const completedHabitIds = new Set(todayCompletions.map(c => c.habitId))
  const incompleteHabits = allHabits.filter(h => !completedHabitIds.has(h.id))

  const contextMessage = `Context:
- Time: ${dayOfWeek} ${timeOfDay}
- Tasks in inbox: ${inboxTasks.length + ' total'}${inboxTasks.length > 0 ? `, oldest: ${inboxTasks.map(t => `"${t.title}"`).join(', ')}` : ''}
- Snoozed tasks now due: ${snoozedTasks.length > 0 ? snoozedTasks.map(t => `"${t.title}"`).join(', ') : 'none'}
- Recently completed (last 48h): ${recentlyDone.length > 0 ? recentlyDone.map(t => `"${t.title}"`).join(', ') : 'none'}
- Habits not done today: ${incompleteHabits.length > 0 ? incompleteHabits.map(h => `"${h.title}"`).join(', ') : 'all done!'}
- Active goals: ${activeGoals.length > 0 ? activeGoals.map(g => `"${g.title}"${g.targetDate ? ` (by ${g.targetDate})` : ''}`).join(', ') : 'none set'}
- Focus sessions today: ${pomodoroToday[0].count}
- Last nudge: ${lastNudge[0]?.content ?? 'none'}`

  const client = new Anthropic({ apiKey })
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: contextMessage }],
  })

  const text = response.content[0]
  if (text.type !== 'text') throw new Error('Unexpected response type')
  return text.text.trim()
}
