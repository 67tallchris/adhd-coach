# ADHD Coach - Local Development Setup

## Issue: Habits not being created

If you're getting "Internal Server Error" when creating habits, it's likely a database migration issue.

### Solution

1. **Kill any running wrangler processes:**
   ```bash
   pkill -9 -f wrangler
   ```

2. **Clear wrangler state:**
   ```bash
   rm -rf .wrangler/state
   ```

3. **Apply migrations:**
   ```bash
   npx wrangler d1 migrations apply adhd-coach-db --local
   ```

4. **Start the dev server with the correct flags:**
   ```bash
   npx wrangler pages dev dist --d1 DB=adhd-coach-db --persist-to .wrangler/state --port 8788 --persist
   ```

### Alternative: Use the start script

```bash
chmod +x scripts/start-dev.sh
./scripts/start-dev.sh
```

### Verify database tables

```bash
npx wrangler d1 execute adhd-coach-db --local --command "SELECT name FROM sqlite_master WHERE type='table';"
```

You should see: goals, habits, habit_completions, tasks, pomodoro_sessions, nudges, devices, streak_config, body_doubling_sessions

### Frontend error handling

The app now shows an alert if habit creation fails. Check the browser console (F12) for detailed error messages.
