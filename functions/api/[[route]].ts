import { Hono } from 'hono'
import { handle } from 'hono/cloudflare-pages'
import tasksRouter from '../../server/routes/tasks'
import habitsRouter from '../../server/routes/habits'
import goalsRouter from '../../server/routes/goals'
import pomodoroRouter from '../../server/routes/pomodoro'
import nudgesRouter from '../../server/routes/nudges'
import devicesRouter from '../../server/routes/devices'
import streaksRouter from '../../server/routes/streaks'
import bodyDoublingRouter from '../../server/routes/bodyDoubling'

type Env = {
  Bindings: {
    DB: D1Database
    ANTHROPIC_API_KEY: string
    FCM_SERVER_KEY: string
  }
}

const app = new Hono<Env>().basePath('/api')

app.get('/health', (c) => c.json({ ok: true, ts: new Date().toISOString() }))

app.route('/tasks', tasksRouter)
app.route('/habits', habitsRouter)
app.route('/goals', goalsRouter)
app.route('/pomodoro', pomodoroRouter)
app.route('/nudges', nudgesRouter)
app.route('/devices', devicesRouter)
app.route('/streaks', streaksRouter)
app.route('/body-doubling', bodyDoublingRouter)

export const onRequest = handle(app)
