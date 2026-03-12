# ADHD-Focused Feature Plans

## 1. Streak Visualization

**Goal:** Motivate through progress tracking without creating anxiety or shame around "breaking chains."

### Design Principles
- **Forgiving:** Focus on "sessions completed" not "days in a row"
- **Flexible:** Weekly goals, not daily pressure
- **Visual:** Satisfying progress indicators
- **Celebratory:** Micro-celebrations on milestones

### Implementation

#### Database Changes (`server/db/schema.ts`)
```typescript
// Add to existing pomodoro sessions table or create new stats table
- weeklyGoal: number (default: 5 sessions/week)
- streakConfig: { 
    type: 'weekly' | 'flexible',
    targetSessions: number,
    timezone: string 
  }
```

#### State Management (`src/stores/pomodoroStore.ts`)
```typescript
interface StreakState {
  currentStreak: number        // sessions this week
  weeklyGoal: number           // target sessions per week
  progress: number             // percentage (0-100)
  bestStreak: number           // personal best week
  totalSessions: number        // all-time
  lastSessionDate: string | null
  milestones: { sessions: number, unlocked: boolean }[]
}
```

#### UI Components (`src/features/pomodoro/StreakCard.tsx`)
- **Progress ring or bar** showing weekly progress
- **"X sessions this week"** with gentle messaging
- **Milestone badges** (5, 10, 25, 50, 100 sessions)
- **Celebration animation** when completing sessions (confetti, subtle glow)
- **Weekly summary** on Monday: "Last week you completed X sessions!"

#### API Endpoints (`server/routes/pomodoro.ts`)
```typescript
GET  /api/pomodoro/stats       // existing - enhance with streak data
POST /api/pomodoro/streak/goal // update weekly goal
```

#### Key Considerations
- Reset streaks on Monday (configurable)
- Show "You're on track!" when progressing well
- Never show "You failed" - instead "You got X sessions, want to try for one more?"
- Optional: Share milestones (social accountability)

---

## 2. Body Doubling

**Goal:** Create sense of shared focus space - knowing others are working alongside you.

### Design Principles
- **Ambient awareness** not social pressure
- **Anonymous** - no profiles, no judgment
- **Opt-in** - choose to see others or work privately
- **Lightweight** - minimal server load

### Implementation

#### Database (`server/db/schema.ts`)
```typescript
// New table: activeSessions
{
  id: string (uuid)
  sessionId: string (anonymous, rotated hourly)
  startedAt: timestamp
  lastHeartbeat: timestamp
  taskType: 'work' | 'break'
  // No user identification stored
}
```

#### Backend (`server/routes/bodyDoubling.ts`)
```typescript
POST   /api/body-doubling/checkin   // announce presence
DELETE /api/body-doubling/checkin   // leave session
GET    /api/body-doubling/count     // get current active count
GET    /api/body-doubling/peers     // get anonymized peer list (optional)
```

#### Frontend Store (`src/stores/bodyDoublingStore.ts`)
```typescript
interface BodyDoublingState {
  isEnabled: boolean
  currentCount: number
  sessionId: string | null
  lastHeartbeat: number | null
  checkin: () => Promise<void>
  checkout: () => Promise<void>
  startHeartbeat: () => void
  stopHeartbeat: () => void
}
```

#### UI Components (`src/features/pomodoro/BodyDoublingIndicator.tsx`)
- **Small badge** showing "🟢 23 others focusing now"
- **Optional:** List of anonymized peers "Someone in Tokyo is focusing"
- **Toggle** to join/leave the shared space
- **Subtle animation** when count changes

#### Technical Details
- Heartbeat every 30 seconds
- Clean up stale sessions after 2 minutes
- Use Cloudflare D1 for storage
- Consider Cloudflare Durable Objects for real-time count

#### Privacy & Safety
- No user identification
- Session IDs rotate hourly
- No location data beyond coarse region
- Clear messaging: "This is anonymous - we don't track who you are"

---

## 3. Suggested Break Activities

**Goal:** Reduce decision fatigue during breaks with rotating, contextual suggestions.

### Design Principles
- **Variety** - physical, mental, restful options
- **Time-appropriate** - 5 min vs 15 min breaks
- **ADHD-friendly** - dopamine-boosting, not draining
- **Customizable** - learn preferences over time

### Implementation

#### Activity Database (frontend constant or DB)
```typescript
interface BreakActivity {
  id: string
  title: string
  description: string
  duration: 1 | 5 | 10 | 15  // minutes
  category: 'physical' | 'mental' | 'restful' | 'social' | 'nourish'
  energyLevel: 'low' | 'medium' | 'high'
  tags: string[]
}

const ACTIVITIES: BreakActivity[] = [
  { id: 'stretch', title: 'Quick Stretch', description: 'Stand up, reach for the sky, touch your toes', duration: 1, category: 'physical', energyLevel: 'low', tags: ['body'] },
  { id: 'water', title: 'Drink Water', description: 'Hydrate! Your brain needs it.', duration: 1, category: 'nourish', energyLevel: 'low', tags: ['health'] },
  { id: 'breathe', title: 'Box Breathing', description: 'Inhale 4, hold 4, exhale 4, hold 4', duration: 1, category: 'restful', energyLevel: 'low', tags: ['calm'] },
  { id: 'walk', title: 'Mini Walk', description: 'Walk around the block or up/down stairs', duration: 5, category: 'physical', energyLevel: 'medium', tags: ['movement'] },
  { id: 'sunlight', title: 'Get Sunlight', description: 'Step outside, look at the sky', duration: 5, category: 'physical', energyLevel: 'low', tags: ['nature', 'eyes'] },
  // ... more activities
]
```

#### State Management (`src/stores/breakActivitiesStore.ts`)
```typescript
interface BreakActivitiesState {
  preferredCategories: string[]
  completedActivities: string[]  // for variety
  energyPreference: 'low' | 'medium' | 'high' | null
  getSuggestion: (duration: number) => BreakActivity
  markCompleted: (activityId: string) => void
  refreshSuggestion: () => void
}
```

#### UI Components (`src/features/pomodoro/BreakSuggestions.tsx`)
- **Card showing activity** with title, description, timer
- **"Not feeling this?"** button to get new suggestion
- **Category filters** (toggle physical/mental/restful)
- **"Mark done"** checkbox for satisfaction
- **Break timer** integrated with activity

#### Smart Suggestions
- Track which activities user completes
- Prioritize未完成 activities for variety
- Consider time of day (morning = energizing, evening = calming)
- After long focus sessions, suggest movement

#### Integration Points
- Show when break starts automatically
- Show when user manually starts break
- Optional: notification with suggestion when break begins

---

## 4. "I Got Distracted" Button

**Goal:** Non-judgmental way to handle interruptions, capture what happened, and decide next steps.

### Design Principles
- **No shame** - distractions happen, it's brain science
- **Quick** - frictionless to use mid-distraction
- **Insightful** - helps identify patterns over time
- **Flexible** - multiple recovery paths

### Implementation

#### Database (`server/db/schema.ts`)
```typescript
// New table: distractionLogs
{
  id: string
  sessionId: string (references pomodoro session)
  timestamp: timestamp
  distractionType: 'internal' | 'external' | 'urgent' | 'overwhelm'
  notes: string | null
  action: 'resumed' | 'restarted' | 'abandoned' | 'took_break'
  timeElapsed: number (seconds into session)
}
```

#### State Management (extend `pomodoroStore.ts`)
```typescript
interface DistractionState {
  isDistractedModalOpen: boolean
  distractionTypes: { id: string, label: string, icon: string }[]
  logDistraction: (type: string, notes?: string) => Promise<void>
  resumeSession: () => void
  restartSession: () => void
  takeBreak: () => void
  abandonSession: () => void
}

const DISTRACTION_TYPES = [
  { id: 'internal', label: 'Intrusive thought', icon: '💭' },
  { id: 'external', label: 'External interruption', icon: '🔔' },
  { id: 'urgent', label: 'Something urgent came up', icon: '🚨' },
  { id: 'overwhelm', label: 'Feeling overwhelmed', icon: '😰' },
  { id: 'boredom', label: 'This feels boring/hard', icon: '😴' },
  { id: 'rabbit-hole', label: 'Went down a rabbit hole', icon: '🐰' },
]
```

#### UI Components (`src/features/pomodoro/DistractionModal.tsx`)
```tsx
// Modal that appears when distraction button clicked
- "It's okay! Distractions happen." (validating message)
- Quick type selection (buttons with icons)
- Optional notes field: "What pulled you away?"
- Action buttons:
  - "Resume (X:XX remaining)" - continue timer
  - "Restart" - fresh session
  - "Take a break instead" - switch to break mode
  - "That's enough for now" - end session, no judgment
```

#### Integration in PomodoroPage.tsx
- **Small button** visible during sessions: "Got distracted?"
- Keyboard shortcut: `D` key
- Appears more prominently if timer paused > 30 seconds

#### Insights & Patterns (`src/features/pomodoro/DistractionInsights.tsx`)
- Weekly summary: "You got distracted 5 times this week"
- Common patterns: "Most distractions happen around 3pm"
- Common types: "Intrusive thoughts are your top distraction"
- Non-judgmental framing: "Your brain is learning. Here's what we noticed."

#### Compassionate Messaging
| Instead of | Say |
|------------|-----|
| "You broke your streak" | "You got 2 sessions done. That counts." |
| "Session failed" | "Session paused" |
| "Try harder" | "Want to try a shorter timer?" |
| "Don't get distracted" | "Distractions are normal. What helps?" |

---

## Implementation Priority

**Phase 1 (Quick wins, high impact):**
1. Suggested Break Activities - standalone, immediate value
2. "I Got Distracted" Button - addresses real pain point

**Phase 2 (Engagement builders):**
3. Streak Visualization - builds on existing stats
4. Body Doubling - requires more backend work

**Estimated effort:**
- Break Activities: 2-3 hours
- Distraction Button: 3-4 hours
- Streak Visualization: 4-6 hours
- Body Doubling: 6-8 hours (includes real-time infrastructure)
