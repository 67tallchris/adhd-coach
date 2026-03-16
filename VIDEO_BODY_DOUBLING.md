# Video Body Doubling Feature

## Overview

A video-based body doubling feature that allows users to focus together in virtual co-working sessions using Jitsi Meet integration. This feature implements the "Body Doubling" concept from FEATURE_PLANS.md with real video capabilities.

## What is Body Doubling?

Body doubling is an ADHD support technique where you work alongside others (physically or virtually) to increase accountability and focus. The presence of others working creates a supportive environment that helps maintain attention on tasks.

## Features

### Video Focus Rooms
- **Create or join focus rooms** with other users
- **Anonymous participation** - no user identification required
- **Silent co-working** - this is not a chat room, but a focus space
- **Optional video** - users can choose to have cameras on or off
- **Real-time participant count** - see how many others are focusing

### Jitsi Meet Integration
- Uses **Jitsi Meet** (meet.jit.si) for video conferencing
- No account required
- End-to-end encrypted video calls
- Supports multiple participants per room
- Built-in controls for audio/video/screen sharing

### Room Management
- **Auto-generated room names** (e.g., "focused-space-123")
- **Custom room names** (optional)
- **Room descriptions** for context
- **Active session tracking** - see which rooms are currently active
- **Share join links** - copy URL to invite others

## Technical Implementation

### Frontend Components

#### `src/components/JitsiMeeting.tsx`
React component that embeds Jitsi Meet External API:
- Loads Jitsi script dynamically
- Manages meeting lifecycle (join/leave)
- Provides audio/video controls
- Shows participant count
- Handles events (participant join/leave)

#### `src/features/video-body-doubling/VideoBodyDoublingPage.tsx`
Main page component:
- Browse active focus rooms
- Create new rooms
- Join existing sessions
- Display room statistics
- Shows guidelines and how-to

### State Management

#### `src/stores/videoBodyDoublingStore.ts`
Zustand store for managing:
- Current session state
- Jitsi room ID
- Meeting status (in meeting / browsing)
- Loading and error states

### Backend API

#### `server/routes/videoBodyDoubling.ts`
Hono router with endpoints:
- `POST /sessions` - Create new video session
- `POST /sessions/:id/join` - Join existing session
- `POST /sessions/:id/leave` - Leave session
- `GET /sessions/active` - List active sessions
- `GET /sessions/:id` - Get session details
- `PATCH /sessions/:id` - Update session
- `DELETE /sessions/:id` - Delete session

### Database Schema

#### `video_body_doubling_sessions` table
```sql
- id: Session identifier
- roomName: Human-readable room name
- jitsiRoomId: Unique Jitsi room identifier
- createdBy: Anonymous creator ID (optional)
- isActive: Whether session is active
- participantCount: Current number of participants
- maxParticipants: Optional participant limit
- description: Room description
- tags: JSON array of tags
- lastActivityAt: Last activity timestamp
```

#### `video_body_doubling_participants` table
```sql
- id: Participant identifier
- sessionId: Reference to session
- jitsiParticipantId: Jitsi participant ID
- displayName: User's display name
- joinedAt: Join timestamp
- leftAt: Leave timestamp
- isActive: Whether still in session
```

### API Client

#### `src/api/videoBodyDoubling.ts`
Type-safe API client using `apiFetch`:
- `create()` - Create new session
- `join()` - Join session
- `leave()` - Leave session
- `getActive()` - Get active sessions
- `get()` - Get session details
- `update()` - Update session

## Usage

### Accessing the Feature
1. Navigate to **"Video Doubling"** in the sidebar
2. See active focus rooms and participant counts
3. Click **"Join"** to enter a room, or **"Create Room"** to start new one

### Creating a Room
1. Click **"Create Room"** button
2. Optionally provide a room name and description
3. Click **"Create Room"**
4. Automatically joins the created room

### Joining a Room
1. Browse active rooms list
2. Click **"Join"** on desired room
3. Enters Jitsi Meet video call
4. Can leave anytime with **"Leave Session"** button

### Sharing Rooms
- Click the **copy link** icon next to any room
- Share URL with others
- They can join directly via the link

## Room Guidelines

The feature includes built-in guidelines:
- Keep microphone muted unless speaking
- Video is optional - use what feels comfortable
- This is a silent co-working space, not a chat room
- Be respectful of others' focus time
- Feel free to join and leave as needed

## Privacy & Security

### Anonymity
- No user identification required
- Anonymous session IDs
- Display names are generic ("ADHD Focus Participant")
- No personal data stored

### Jitsi Security
- Uses Jitsi Meet's built-in security
- Rooms have unique, hard-to-guess IDs
- No recording by default
- HTTPS encrypted connections

### Data Retention
- Sessions marked inactive after 2 hours
- Participant records deleted on session cleanup
- No long-term tracking of participation

## Jitsi Configuration

### Default Settings
```javascript
{
  startWithAudioMuted: false,
  startWithVideoMuted: false,
  enableWelcomePage: false,
  disableJoinLeaveNotifications: false,
  toolbarButtons: [
    'microphone',
    'camera',
    'fullscreen',
    'tileview',
    'chat',
    'participants-pane',
    'hangup',
  ],
}
```

### Using JaaS (8x8)
Currently configured to use `meet.jit.si` (free public instance).

To use **JaaS (8x8.vc)** for enhanced features:
1. Sign up at https://jaas.8x8.vc/
2. Get your API key and domain
3. Update `JITSI_DOMAIN` in `JitsiMeeting.tsx`
4. Optionally add JWT authentication

## Migration

Database migration file: `drizzle/migrations/0011_video_body_doubling.sql`

Apply migrations:
```bash
# Local
npm run db:migrate:local

# Production
npm run db:migrate:remote
```

## Future Enhancements

Potential improvements:
- [ ] Scheduled focus sessions
- [ ] Room categories/tags filtering
- [ ] Session duration limits
- [ ] Host controls (mute all, kick participants)
- [ ] Break room integration
- [ ] Pomodoro timer integration
- [ ] Focus mode statistics
- [ ] Private rooms with passwords
- [ ] Custom branding for Jitsi UI
- [ ] JWT authentication for JaaS

## Troubleshooting

### Video not loading
- Check browser permissions for camera/microphone
- Ensure HTTPS connection (required for camera access)
- Try a different browser (Chrome/Edge recommended)

### Can't join room
- Room may be full (check participant count)
- Room may have been deactivated
- Refresh page and try again

### Jitsi script fails to load
- Check internet connection
- Firewall may be blocking meet.jit.si
- Try ad-blocker disable for the site

## Related Features

This feature complements:
- **Pomodoro Timer** - Use video doubling during focus sessions
- **Body Doubling (text-based)** - Anonymous text-based co-working
- **Focus Tracking** - Log focus sessions for insights
- **Stats** - Track video doubling participation

## Testing

### Manual Testing Checklist
- [ ] Create a new room
- [ ] Join an existing room
- [ ] Video/audio controls work
- [ ] Leave session properly
- [ ] Participant count updates
- [ ] Share link works
- [ ] Multiple participants can join
- [ ] Session cleanup after timeout

### Browser Compatibility
- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ⚠️ Mobile browsers (limited testing)

## Performance Considerations

- Participant count refreshes every 15 seconds
- Jitsi script loaded on-demand
- Sessions auto-cleanup after 2 hours of inactivity
- Maximum 20 active sessions displayed

## Dependencies

- **Jitsi Meet External API** - Loaded dynamically from CDN
- No additional npm packages required
- Works with existing React 19 + Vite setup

## Support

For issues or questions:
1. Check TROUBLESHOOTING.md
2. Review Jitsi documentation: https://jitsi.github.io/handbook/
3. Report bugs via GitHub issues
