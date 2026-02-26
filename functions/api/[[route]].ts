import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import tasksRouter from '../../server/routes/tasks'
import habitsRouter from '../../server/routes/habits'
import goalsRouter from '../../server/routes/goals'
import pomodoroRouter from '../../server/routes/pomodoro'
import nudgesRouter from '../../server/routes/nudges'

type Env = {
  Bindings: {
    DB: D1Database
    ANTHROPIC_API_KEY: string
  }
}

const app = new Hono<Env>().basePath('/api')

app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }))

app.route('/tasks', tasksRouter)
app.route('/habits', habitsRouter)
app.route('/goals', goalsRouter)
app.route('/pomodoro', pomodoroRouter)
app.route('/nudges', nudgesRouter)

export const onRequest = handle(app)
