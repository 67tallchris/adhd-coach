# ADHD Coach

A comprehensive ADHD productivity coaching web application with native Android companion app for real-time notifications.

## Features

### Web App
- **Pomodoro Timer**: Focus sessions with 25-minute intervals
- **Task Management**: Inbox-style task tracking with priorities
- **Habit Tracking**: Build and maintain daily habits
- **Goal Setting**: Long-term objective tracking
- **AI Coaching Nudges**: Personalized motivational messages (Qwen/Claude)

### Android App
- **Native Notifications**: Lock screen alerts for all events
- **Pomodoro Alerts**: Get notified when timer completes
- **Task Reminders**: Due date and custom reminders
- **Background Sync**: Automatic data synchronization every 15 minutes
- **Offline Support**: Room database for offline access

## Tech Stack

### Web App
- **Frontend**: React 19 + Vite + TypeScript
- **UI**: Tailwind CSS 4 + Radix UI + Lucide Icons
- **State**: Zustand + TanStack Query
- **Backend**: Cloudflare Workers (Hono)
- **Database**: Cloudflare D1 (SQLite)
- **AI**: OpenAI + Anthropic APIs

### Android App
- **Language**: Kotlin
- **UI**: Jetpack Compose + Material 3
- **Database**: Room (SQLite)
- **Networking**: Retrofit + OkHttp + Kotlinx Serialization
- **Push**: Firebase Cloud Messaging (FCM)
- **Background**: WorkManager

## Project Structure

```
ADHD-Coach/
├── src/                    # React web app source
│   ├── api/               # API client
│   ├── components/        # Shared components
│   ├── features/          # Feature modules
│   │   ├── pomodoro/
│   │   ├── brain-dump/
│   │   ├── habits/
│   │   ├── goals/
│   │   └── nudges/
│   └── stores/            # Zustand stores
├── server/                # Cloudflare Workers backend
│   ├── db/                # Database schema & config
│   ├── routes/            # API route handlers
│   └── services/          # Business logic (FCM, AI)
├── functions/             # Cloudflare Pages functions
│   └── api/[[route]].ts   # API entry point
├── drizzle/               # Database migrations
├── android/               # Native Android app
│   ├── app/               # Android app source
│   ├── README.md          # Android setup guide
│   └── FCM_SETUP.md       # Firebase setup guide
└── package.json
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm/pnpm
- Cloudflare account (for Workers/D1)
- Android Studio (for mobile app)

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.dev.vars` for local development:

```
ANTHROPIC_API_KEY=your_key_here
OPENAI_API_KEY=your_key_here
FCM_SERVER_KEY=your_fcm_key_here
```

### 3. Setup Database

```bash
# Generate migrations
npm run db:generate

# Apply local migrations
npm run db:migrate:local

# For production
npm run db:migrate:remote
```

### 4. Run Development Server

```bash
# Start Vite dev server
npm run dev

# In another terminal, start Workers
npm run dev:worker
```

Visit `http://localhost:5173`

### 5. Build for Production

```bash
npm run build
```

## Android App Setup

See [android/README.md](android/README.md) for detailed instructions.

### Quick Start

1. Open `android/` folder in Android Studio
2. Download `google-services.json` from Firebase
3. Place in `android/app/google-services.json`
4. Update `API_BASE_URL` in `build.gradle.kts`
5. Run on emulator or device

## API Endpoints

### Tasks
- `GET /api/tasks` - List tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/:id/complete` - Mark complete
- `POST /api/tasks/:id/remind` - Send reminder notification

### Pomodoro
- `GET /api/pomodoro/sessions` - List sessions
- `POST /api/pomodoro/sessions` - Start session
- `PATCH /api/pomodoro/sessions/:id` - Complete session
- `GET /api/pomodoro/stats` - Get statistics

### Habits
- `GET /api/habits` - List habits
- `POST /api/habits` - Create habit
- `POST /api/habits/:id/complete` - Complete habit

### Goals
- `GET /api/goals` - List goals
- `POST /api/goals` - Create goal
- `PATCH /api/goals/:id` - Update goal

### Nudges
- `GET /api/nudges` - List nudges
- `POST /api/nudges/generate` - Generate AI nudge

### Devices (Push Notifications)
- `POST /api/devices` - Register FCM token
- `DELETE /api/devices/:id` - Unregister device
- `GET /api/devices?userId=X` - List user devices

## Push Notifications

See [android/FCM_SETUP.md](android/FCM_SETUP.md) for Firebase setup.

### Quick Setup

1. Create Firebase project
2. Get FCM Server Key
3. Add to Workers: `npx wrangler secret put FCM_SERVER_KEY`
4. Apply migration: `npm run db:migrate:local`
5. Configure Android app with `google-services.json`

### Notification Types

| Event | Channel | Priority |
|-------|---------|----------|
| Pomodoro complete | Timer | High |
| Task reminder | Tasks | Default |
| Task due soon | Tasks | High |
| Coaching nudge | Nudges | Low |
| Habit reminder | Habits | Default |

## Scripts

```bash
npm run dev              # Start Vite dev server
npm run dev:worker       # Start Workers locally
npm run build            # Build for production
npm run preview          # Preview production build
npm run db:generate      # Generate Drizzle migrations
npm run db:migrate:local # Apply migrations locally
npm run db:migrate:remote# Apply migrations to production
npm run db:studio        # Open Drizzle Studio
```

## Deployment

### Cloudflare Pages + Workers

```bash
# Deploy to Cloudflare
npx wrangler pages deploy dist/

# Or use Cloudflare dashboard for Git integration
```

### Environment Variables (Production)

Set in Cloudflare dashboard:
- `ANTHROPIC_API_KEY`
- `OPENAI_API_KEY`
- `FCM_SERVER_KEY`

## Database Schema

See `server/db/schema.ts` for full schema.

### Tables
- `goals` - Long-term objectives
- `tasks` - Action items with priorities
- `habits` - Recurring activities
- `habit_completions` - Habit tracking log
- `pomodoro_sessions` - Focus session history
- `nudges` - AI coaching messages
- `devices` - Registered FCM devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT License

## Acknowledgments

Built with:
- [Hono](https://hono.dev/) - Web framework
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM
- [Cloudflare Workers](https://workers.cloudflare.com/) - Edge computing
- [Jetpack Compose](https://developer.android.com/jetpack/compose) - Android UI
- [Firebase](https://firebase.google.com/) - Push notifications
