import { Hono } from 'hono'
import { sql } from 'drizzle-orm'
import { tasks } from './server/db/schema'
import { getDb } from './server/db/index'
import tasksRouter from './server/routes/tasks'
import habitsRouter from './server/routes/habits'
import goalsRouter from './server/routes/goals'
import pomodoroRouter from './server/routes/pomodoro'
import nudgesRouter from './server/routes/nudges'
import devicesRouter from './server/routes/devices'
import streaksRouter from './server/routes/streaks'
import bodyDoublingRouter from './server/routes/bodyDoubling'
import videoBodyDoublingRouter from './server/routes/videoBodyDoubling'
import laddersRouter from './server/routes/ladders'
import distractionsRouter from './server/routes/distractions'
import focusRouter from './server/routes/focus'
import levelsRouter from './server/routes/levels'
import settingsRouter from './server/routes/settings'

type Env = {
  Bindings: {
    DB: D1Database
    ANTHROPIC_API_KEY: string
    FCM_SERVER_KEY: string
  }
}

const app = new Hono<Env>().basePath('/api')

app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }))

app.get('/debug-db', async (c) => {
  try {
    const db = getDb(c.env.DB)
    const result = await db.select({ count: sql<number>`count(*)` }).from(tasks)
    return c.json({ ok: true, count: result, dbType: typeof c.env.DB })
  } catch (error: any) {
    return c.json({ ok: false, error: error.message, stack: error.stack }, 500)
  }
})

app.route('/tasks', tasksRouter)
app.route('/habits', habitsRouter)
app.route('/goals', goalsRouter)
app.route('/pomodoro', pomodoroRouter)
app.route('/nudges', nudgesRouter)
app.route('/devices', devicesRouter)
app.route('/streaks', streaksRouter)
app.route('/body-doubling', bodyDoublingRouter)
app.route('/video-body-doubling', videoBodyDoublingRouter)
app.route('/ladders', laddersRouter)
app.route('/distractions', distractionsRouter)
app.route('/focus', focusRouter)
app.route('/levels', levelsRouter)
app.route('/settings', settingsRouter)

export default app
