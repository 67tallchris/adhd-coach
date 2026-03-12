# Backend FCM Integration - Summary

## Files Created/Modified

### New Files

1. **`server/services/fcm.ts`**
   - FCM push notification service
   - Functions for all notification types
   - Payload builders for different events

2. **`server/routes/devices.ts`**
   - Device registration API
   - Token management endpoints
   - Device listing/unregistration

3. **`drizzle/migrations/0001_polite_famine.sql`**
   - Creates `devices` table
   - Indexes for efficient lookups

4. **`android/FCM_SETUP.md`**
   - Complete Firebase setup guide
   - Step-by-step instructions
   - Troubleshooting tips

5. **`README.md`**
   - Project overview
   - Quick start guide
   - API reference

### Modified Files

1. **`server/db/schema.ts`**
   - Added `devices` table schema
   - Added `Device` and `NewDevice` types

2. **`functions/api/[[route]].ts`**
   - Added `devicesRouter`
   - Added `FCM_SERVER_KEY` to Env type

3. **`server/routes/pomodoro.ts`**
   - Integrated FCM on session completion
   - Sends push to all registered devices

4. **`server/routes/tasks.ts`**
   - Added `/remind` endpoint
   - Manual task reminder trigger

## API Endpoints Added

### Device Management

```http
POST /api/devices
Content-Type: application/json

{
  "token": "fcm-token",
  "platform": "android",
  "userId": "optional"
}

Response: 201
{
  "deviceId": "uuid",
  "token": "fcm-token"
}
```

```http
DELETE /api/devices/{id}

Response: 200
{
  "success": true
}
```

```http
GET /api/devices?userId=optional

Response: 200
[
  {
    "id": "uuid",
    "fcmToken": "token",
    "platform": "android",
    "createdAt": "...",
    "lastActiveAt": "..."
  }
]
```

### Task Reminder

```http
POST /api/tasks/{id}/remind

Response: 200
{
  "ok": true,
  "sent": 2
}
```

## Notification Payloads

### Pomodoro Complete
```json
{
  "type": "pomodoro_complete",
  "session": "{\"id\":\"123\",\"durationMin\":25,\"taskId\":\"456\"}"
}
```

### Task Reminder
```json
{
  "type": "task_reminder",
  "task": "{\"id\":\"789\",\"title\":\"My Task\",\"dueDate\":\"2024-01-01\"}"
}
```

### Nudge
```json
{
  "type": "nudge",
  "nudge": "{\"id\":\"abc\",\"content\":\"Great job!\",\"type\":\"motivation\"}"
}
```

## Setup Checklist

- [ ] Create Firebase project
- [ ] Get FCM Server Key
- [ ] Add secret to Workers: `npx wrangler secret put FCM_SERVER_KEY`
- [ ] Apply migration: `npm run db:migrate:local`
- [ ] Download `google-services.json` from Firebase
- [ ] Place in `android/app/google-services.json`
- [ ] Update `API_BASE_URL` in Android `build.gradle.kts`
- [ ] Build and test Android app

## Testing

### 1. Register Device

Build Android app and grant notification permission, or manually:

```bash
curl -X POST http://localhost:8788/api/devices \
  -H "Content-Type: application/json" \
  -d '{"token":"test-token","platform":"android"}'
```

### 2. Verify in Database

```bash
npx wrangler d1 execute adhd-coach-db --local \
  --command "SELECT * FROM devices;"
```

### 3. Test Pomodoro Notification

Complete a pomodoro session and check Android device for notification.

### 4. Test Task Reminder

```bash
curl -X POST http://localhost:8788/api/tasks/TASK_ID/remind
```

## Next Steps

### Multi-user Support
- Add authentication (Cloudflare Access, Auth0, etc.)
- Associate devices with user IDs
- Filter notifications by user

### Advanced Features
- Scheduled task reminders (cron + WorkManager)
- Notification actions (complete task from notification)
- Rich notifications (images, expanded text)
- Notification preferences per user

### Monitoring
- Track notification delivery rates
- Log FCM errors
- Monitor device token refreshes

## Troubleshooting

### Common Issues

1. **FCM returns 401 Unauthorized**
   - Check `FCM_SERVER_KEY` is correct
   - Ensure secret is set in Workers

2. **No notification on Android**
   - Check notification permission granted
   - Verify FCM token in `devices` table
   - Check Android logs for FCM errors

3. **Device not registering**
   - Check `API_BASE_URL` in Android app
   - Verify network connectivity
   - Check Workers logs for errors

## Resources

- [FCM Documentation](https://firebase.google.com/docs/cloud-messaging)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/platform/environment-variables/#secrets)
- [Drizzle ORM](https://orm.drizzle.team/)
