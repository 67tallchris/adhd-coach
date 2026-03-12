# Firebase Cloud Messaging Setup Guide

This guide walks you through setting up push notifications for your ADHD Coach app.

## Overview

The backend uses Firebase Cloud Messaging (FCM) to send push notifications to Android devices when:
- Pomodoro timer completes
- Task reminders are triggered
- Coaching nudges are generated
- Habit reminders fire

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click **Add project** (or select existing)
3. Enter project name: `adhd-coach` (or your preferred name)
4. Disable Google Analytics (optional for this use case)
5. Click **Create project**

## Step 2: Get FCM Server Key

1. In Firebase Console, click the **Settings gear** icon → **Project settings**
2. Go to the **Service accounts** tab
3. Under **Firebase Admin SDK**, click **Generate new private key**
4. Download the JSON file - this contains your credentials
5. Extract the `client_email` and `private_key` from the JSON

**Alternative: Legacy Server Key (simpler for Cloudflare Workers)**

1. In Firebase Console, go to **Project settings** → **Cloud Messaging** tab
2. Under **Cloud Messaging API (Legacy)**, click **Generate** or copy existing key
3. Copy the **Server key** (long string starting with `AAAA...`)

## Step 3: Add FCM Key to Cloudflare Workers

### Option A: Using Wrangler CLI (Recommended)

```bash
# Navigate to your project
cd /home/mercury/ADHD-Coach

# Add the FCM server key as a secret
npx wrangler secret put FCM_SERVER_KEY
# When prompted, paste your FCM server key
```

### Option B: Manual (wrangler.toml)

For development only - never commit secrets to version control:

```toml
# wrangler.toml
[vars]
FCM_SERVER_KEY = "YOUR_FCM_SERVER_KEY_HERE"
```

## Step 4: Apply Database Migration

Run the migration to add the `devices` table:

```bash
# For local development
npm run db:migrate:local

# For production
npm run db:migrate:remote
```

Or manually:

```bash
npx wrangler d1 migrations apply adhd-coach-db --local
```

## Step 5: Update Android App Configuration

### Replace google-services.json

1. In Firebase Console, go to **Project settings**
2. Under **Your apps**, click the Android icon
3. Download `google-services.json`
4. Replace the placeholder file at: `android/app/google-services.json`

### Update API Base URL

Edit `android/app/build.gradle.kts`:

```kotlin
buildConfigField("String", "API_BASE_URL", "\"https://adhd-coach.your-domain.workers.dev\"")
```

## Step 6: Test Push Notifications

### Test Device Registration

Build and run the Android app. The app will automatically register its FCM token with the backend when notifications permission is granted.

Check the database:

```bash
npx wrangler d1 execute adhd-coach-db --local --command "SELECT * FROM devices;"
```

You should see your device's FCM token.

### Test Pomodoro Notification

1. Start a pomodoro session in the web app
2. Wait for it to complete (or use the Android app)
3. You should receive a push notification on your Android device

### Test Task Reminder

```bash
# Get a task ID from your database
curl -X POST https://your-adhd-coach.workers.dev/api/tasks/YOUR_TASK_ID/remind
```

## Troubleshooting

### Notifications not appearing

1. **Check permission**: Ensure notification permission is granted on Android
2. **Check FCM token**: Verify token is registered in `devices` table
3. **Check logs**: Review Cloudflare Workers logs in the dashboard

### FCM errors in logs

1. **Invalid key**: Verify `FCM_SERVER_KEY` is correct
2. **Token expired**: Android app should re-register token on refresh
3. **Quota exceeded**: FCM has rate limits (check Firebase console)

### Build errors

1. **google-services.json missing**: Download from Firebase
2. **Package name mismatch**: Ensure `com.adhdcoach.app` matches Firebase config

## Testing with curl

### Register a device manually (for testing)

```bash
curl -X POST https://your-adhd-coach.workers.dev/api/devices \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_FCM_TOKEN",
    "platform": "android"
  }'
```

### Send test notification

```bash
# Via FCM directly (use for debugging)
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_FCM_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "YOUR_FCM_TOKEN",
    "data": {
      "type": "pomodoro_complete",
      "session": "{\"id\":\"test\",\"durationMin\":25}"
    }
  }'
```

## Production Considerations

### Multi-user Support

Currently, notifications are sent to all registered devices. For multi-user support:

1. Add user authentication (e.g., Cloudflare Access, Auth0)
2. Associate devices with user IDs
3. Filter notifications by user

### Notification Topics

For better targeting, use FCM topics:

```typescript
// Subscribe to topic in Android app
FirebaseMessaging.getInstance().subscribeToTopic("pomodoro_reminders")

// Send to topic from backend
await fetch('https://fcm.googleapis.com/fcm/send', {
  to: '/topics/pomodoro_reminders',
  data: { ... }
})
```

### Background Sync

The Android app syncs every 15 minutes via WorkManager. Adjust in:
`android/app/src/main/java/com/adhdcoach/app/ADHDCoachApplication.kt`

## API Reference

### Device Registration

```http
POST /api/devices
Content-Type: application/json

{
  "token": "fcm-token-here",
  "platform": "android",
  "userId": "optional-user-id"
}

Response: 201
{
  "deviceId": "uuid",
  "token": "fcm-token-here"
}
```

### Device Unregistration

```http
DELETE /api/devices/{deviceId}

Response: 200
{
  "success": true
}
```

### Task Reminder

```http
POST /api/tasks/{taskId}/remind

Response: 200
{
  "ok": true,
  "sent": 2  // number of devices notified
}
```

## Resources

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging)
- [Cloudflare Workers Secrets](https://developers.cloudflare.com/workers/platform/environment-variables/#secrets)
- [Android Notifications Guide](https://developer.android.com/develop/ui/views/notifications)
