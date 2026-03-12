# ADHD Coach - Android App

Native Android companion app for the ADHD Coach web application, featuring real-time notifications for pomodoro timers, tasks, habits, and coaching nudges.

## Features

- **Pomodoro Timer Notifications**: Get notified on your phone when a focus session completes on the web app
- **Task Reminders**: See tasks on your lock screen with due date alerts
- **Coaching Nudges**: Receive motivational messages and coaching prompts
- **Habit Tracking**: Get reminders for daily habits and celebrate streaks
- **Offline Support**: All data is cached locally using Room database
- **Background Sync**: Automatic data synchronization every 15 minutes
- **Push Notifications**: Real-time updates via Firebase Cloud Messaging

## Tech Stack

- **Language**: Kotlin
- **UI**: Jetpack Compose with Material 3
- **Database**: Room (SQLite)
- **Networking**: Retrofit + OkHttp + Kotlinx Serialization
- **Push Notifications**: Firebase Cloud Messaging (FCM)
- **Background Work**: WorkManager
- **Architecture**: MVVM with Repository pattern

## Project Structure

```
android/
├── app/
│   ├── src/main/
│   │   ├── java/com/adhdcoach/app/
│   │   │   ├── data/
│   │   │   │   ├── local/          # Room entities, DAOs, database
│   │   │   │   ├── model/          # Domain models
│   │   │   │   ├── remote/         # API client, Retrofit services
│   │   │   │   └── repository/     # Data repositories
│   │   │   ├── receivers/          # Broadcast receivers (boot, notifications)
│   │   │   ├── services/           # FCM service, timer service, notifications
│   │   │   ├── ui/
│   │   │   │   ├── screens/        # Compose screens
│   │   │   │   ├── theme/          # Material theme
│   │   │   │   └── viewmodel/      # ViewModels
│   │   │   ├── workers/            # WorkManager workers
│   │   │   ├── ADHDCoachApplication.kt
│   │   │   └── MainActivity.kt
│   │   ├── res/
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
├── build.gradle.kts
└── settings.gradle.kts
```

## Setup Instructions

### Prerequisites

1. **Android Studio**: Hedgehog (2023.1.1) or newer
2. **JDK**: Version 17 or higher
3. **Firebase Project**: For push notifications

### Step 1: Clone and Open

```bash
cd android
# Open the 'android' folder in Android Studio
```

### Step 2: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or use existing)
3. Add an Android app with package name: `com.adhdcoach.app`
4. Download `google-services.json`
5. Place it in: `android/app/google-services.json`

### Step 3: Configure API Base URL

Edit `android/app/build.gradle.kts`:

```kotlin
buildConfigField("String", "API_BASE_URL", "\"https://your-adhd-coach.workers.dev\"")
```

Replace with your Cloudflare Workers URL.

### Step 4: Backend API Endpoints

Ensure your Cloudflare Workers backend has these endpoints:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | List tasks |
| POST | `/api/tasks` | Create task |
| PATCH | `/api/tasks/{id}` | Update task |
| GET | `/api/pomodoro/sessions` | List sessions |
| POST | `/api/pomodoro/sessions` | Start session |
| PATCH | `/api/pomodoro/sessions/{id}` | Complete session |
| GET | `/api/pomodoro/stats` | Get stats |
| GET | `/api/nudges` | List nudges |
| POST | `/api/nudges/generate` | Generate nudge |
| POST | `/api/devices` | Register FCM token |
| DELETE | `/api/devices/{id}` | Unregister device |

### Step 5: Build and Run

```bash
# In Android Studio, click Run
# Or via command line:
./gradlew assembleDebug
```

## Notification Channels

The app creates these notification channels:

| Channel | ID | Priority | Purpose |
|---------|-----|----------|---------|
| Pomodoro Timer | `pomodoro` | High | Timer completion alerts |
| Tasks & Reminders | `tasks` | Default | Task due dates, reminders |
| Coaching Nudges | `nudges` | Low | Motivational messages |
| Habit Reminders | `habits` | Default | Habit tracking |
| Sync Status | `sync` | Low | Background sync status |

## Push Notification Payload Format

Send FCM messages with this data payload:

### Pomodoro Complete
```json
{
  "type": "pomodoro_complete",
  "session": "{\"id\":\"123\",\"durationMin\":25,\"completedAt\":\"2024-01-01T10:00:00Z\"}"
}
```

### Task Reminder
```json
{
  "type": "task_reminder",
  "task": "{\"id\":\"456\",\"title\":\"My Task\",\"dueDate\":\"2024-01-02\"}"
}
```

### Nudge
```json
{
  "type": "nudge",
  "nudge": "{\"id\":\"789\",\"content\":\"Great job today!\",\"type\":\"motivation\"}"
}
```

## Backend Integration (Cloudflare Workers)

Add this to your Workers backend to send push notifications:

```typescript
// Example: Send FCM notification when pomodoro completes
async function sendPomodoroCompleteNotification(userId: string, session: PomodoroSession) {
  const device = await db.select().from(devices).where(eq(devices.userId, userId)).first();
  
  if (device?.fcmToken) {
    await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: device.fcmToken,
        data: {
          type: 'pomodoro_complete',
          session: JSON.stringify(session)
        }
      })
    });
  }
}
```

## Development

### Running Tests
```bash
./gradlew test
```

### Building Release APK
```bash
./gradlew assembleRelease
```

### Code Style
The project uses Kotlin standard conventions. No additional linting configured.

## Troubleshooting

### Notifications not showing
1. Check notification permission is granted
2. Verify FCM token is registered with backend
3. Check notification channel settings in system settings

### Sync not working
1. Ensure API_BASE_URL is correct
2. Check network connectivity
3. Review WorkManager logs in Logcat

### Build errors
1. Ensure JDK 17 is configured
2. Sync Gradle files
3. Clean and rebuild: `./gradlew clean build`

## Future Enhancements

- [ ] Widget for home screen pomodoro timer
- [ ] Wear OS support for watch notifications
- [ ] Voice commands for starting timers
- [ ] Adaptive icons
- [ ] Dark/Light theme toggle
- [ ] Custom notification sounds
- [ ] Task completion from notification
- [ ] Calendar integration

## License

MIT License - See LICENSE file for details
