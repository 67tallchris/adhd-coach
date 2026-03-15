#!/bin/bash
# Start local development server with properly initialized D1 database
# This script handles the wrangler D1 database synchronization issue

set -e

cd "$(dirname "$0")/.."

echo "🧹 Cleaning up old state..."
rm -rf .wrangler/state .wrangler/tmp

echo "📦 Applying migrations to create initial database..."
npx wrangler d1 migrations apply adhd-coach-db --local 2>&1 | tail -5

# Find the source database file (created by migrations apply)
SOURCE_DB=$(find .wrangler/state/v3/d1 -name "*.sqlite" ! -name "*-shm" ! -name "*-wal" -type f | head -1)

if [ -z "$SOURCE_DB" ]; then
    echo "❌ Could not find source database file"
    exit 1
fi

echo "📁 Source database: $SOURCE_DB"

echo "🚀 Starting wrangler pages dev..."
npx wrangler pages dev dist --d1 DB=adhd-coach-db --port 8788 --persist-to=.wrangler/state > /tmp/wrangler.log 2>&1 &
WRANGLER_PID=$!

echo "⏳ Waiting for wrangler to create its database..."
sleep 12

# Find the target database file (created by pages dev)
TARGET_DB=$(find .wrangler/state/v3/d1 -name "*.sqlite" ! -name "*-shm" ! -name "*-wal" -type f | grep -v "$(basename $SOURCE_DB)" | head -1)

if [ -n "$TARGET_DB" ]; then
    echo "📁 Target database: $TARGET_DB"
    echo "📋 Copying migrations to target database..."
    cp "$SOURCE_DB" "$TARGET_DB"
    echo "✅ Database synchronized!"
else
    echo "⚠️  Could not find target database, migrations may not be available"
fi

echo ""
echo "✅ Development server ready!"
echo "   - Frontend: http://localhost:5173 (run 'npm run dev' in another terminal)"
echo "   - API: http://localhost:8788"
echo ""
echo "Press Ctrl+C to stop"

# Wait for wrangler process
wait $WRANGLER_PID
