import { useEffect, useRef, useState } from 'react'
import { videoBodyDoublingApi, type VideoAnnouncement } from '../api/videoBodyDoubling'

const SEEN_KEY = 'bd_seen_announcements'
const POLL_MS = 10_000

export type VisibleAnnouncement = VideoAnnouncement & {
  session: { roomName: string; description?: string }
}

function getSeenIds(): Set<string> {
  try {
    return new Set(JSON.parse(sessionStorage.getItem(SEEN_KEY) || '[]'))
  } catch {
    return new Set()
  }
}

function saveSeenId(id: string, seen: Set<string>) {
  seen.add(id)
  sessionStorage.setItem(SEEN_KEY, JSON.stringify([...seen]))
}

export function useAnnouncementNotifier() {
  const [current, setCurrent] = useState<VisibleAnnouncement | null>(null)
  const seen = useRef(getSeenIds())

  useEffect(() => {
    async function poll() {
      try {
        const { announcements } = await videoBodyDoublingApi.getActiveAnnouncements()
        const unseen = announcements.filter(
          a => a.status === 'waiting' && !seen.current.has(a.id)
        )
        if (!unseen.length) return

        const latest = unseen[0]
        saveSeenId(latest.id, seen.current)

        const roomName = latest.roomName || 'Focus Session'

        // Browser notification (if permission granted)
        if ('Notification' in window) {
          if (Notification.permission === 'default') {
            await Notification.requestPermission()
          }
          if (Notification.permission === 'granted') {
            const n = new Notification('New focus session starting', {
              body: `${roomName} · ${latest.sessionDurationMin} min · Join in the first 5 min`,
              icon: '/pwa-192x192.png',
              tag: `bd-${latest.id}`,
            })
            n.onclick = () => window.focus()
          }
        }

        // In-app toast
        setCurrent({
          ...latest,
          session: { roomName, description: latest.description ?? undefined },
        })
      } catch {
        // silently ignore poll errors
      }
    }

    poll()
    const id = setInterval(poll, POLL_MS)
    return () => clearInterval(id)
  }, [])

  return {
    announcement: current,
    dismiss: () => setCurrent(null),
  }
}
