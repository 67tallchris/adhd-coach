#!/bin/bash
# Start wrangler pages dev with initialized database

set -e

cd /home/mercury/ADHD-Coach

# Apply migrations first
echo "Applying migrations..."
npx wrangler d1 migrations apply adhd-coach-db --local

# Start pages dev
echo "Starting pages dev server..."
npx wrangler pages dev dist --d1 DB=adhd-coach-db --persist-to .wrangler/state --port 8788
