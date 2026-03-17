import { useState, useEffect, useCallback } from 'react'
import { Video, Users, Plus, Copy, Check, Clock, Zap, Brain, Coffee, X, Radio } from 'lucide-react'
import clsx from 'clsx'

const JOIN_WINDOW_SEC = 5 * 60 // 5 minutes

function SessionTimer({ createdAt }: { createdAt: string }) {
  const getElapsed = useCallback(
    () => Math.max(0, Math.floor((Date.now() - new Date(createdAt).getTime()) / 1000)),
    [createdAt]
  )
  const [elapsed, setElapsed] = useState(getElapsed)

  useEffect(() => {
    const id = setInterval(() => setElapsed(getElapsed()), 1000)
    return () => clearInterval(id)
  }, [getElapsed])

  const mins = Math.floor(elapsed / 60)
  const secs = elapsed % 60
  const open = elapsed < JOIN_WINDOW_SEC

  return (
    <span className={clsx('text-xs flex items-center gap-1 font-mono', open ? 'text-green-400' : 'text-amber-400')}>
      <Clock className="w-3 h-3" />
      {mins}:{secs.toString().padStart(2, '0')}
      <span className="font-sans ml-0.5">{open ? '· Open' : '· Late'}</span>
    </span>
  )
}
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { JitsiMeeting } from '../../components/JitsiMeeting'
import { useVideoBodyDoublingStore } from '../../stores/videoBodyDoublingStore'
import { videoBodyDoublingApi, type VideoAnnouncement } from '../../api/videoBodyDoubling'
import { WaitingRoom } from './WaitingRoom'

export default function VideoBodyDoublingPage() {
  const qc = useQueryClient()
  const {
    currentSession,
    jitsiRoomId,
    isInMeeting,
    isLoading,
    error,
    createSession,
    joinSession,
    leaveSession,
    setCurrentSession,
    setInMeeting,
  } = useVideoBodyDoublingStore()

  // Announcement state
  const [activeAnnouncement, setActiveAnnouncement] = useState<(VideoAnnouncement & {
    session: { roomName: string; jitsiRoomId: string; description?: string }
  }) | null>(null)
  const [isCreatingAnnouncement, setIsCreatingAnnouncement] = useState(false)
  const [announcementRoomName, setAnnouncementRoomName] = useState('')
  const [announcementDescription, setAnnouncementDescription] = useState('')

  // UI state
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAnnouncementModal, setShowAnnouncementModal] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Fetch active sessions
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['video-body-doubling', 'active'],
    queryFn: () => videoBodyDoublingApi.getActive(),
    refetchInterval: 15000,
  })

  // Fetch active announcements
  const { data: announcementsData, refetch: refetchAnnouncements } = useQuery({
    queryKey: ['video-body-doubling', 'announcements'],
    queryFn: () => videoBodyDoublingApi.getActiveAnnouncements(),
    refetchInterval: 5000,
  })

  // Auto-join from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const joinId = params.get('join')
    const announcementId = params.get('announcement')
    
    if (announcementId && !activeAnnouncement) {
      loadAnnouncement(announcementId)
    } else if (joinId && !currentSession && !isInMeeting) {
      handleJoinMeeting({ id: joinId })
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

  const loadAnnouncement = async (id: string) => {
    try {
      const data = await videoBodyDoublingApi.getAnnouncement(id)
      setActiveAnnouncement(data.announcement as any)
    } catch (err) {
      console.error('Failed to load announcement:', err)
    }
  }

  // Handle creating an announcement (scheduled session)
  const handleCreateAnnouncement = async () => {
    setIsCreatingAnnouncement(true)
    try {
      const response = await videoBodyDoublingApi.createAnnouncement({
        roomName: announcementRoomName || undefined,
        description: announcementDescription || undefined,
        sessionDurationMin: 25,
      })
      setActiveAnnouncement(response.announcement as any)
      setShowAnnouncementModal(false)
      setAnnouncementRoomName('')
      setAnnouncementDescription('')
      refetchAnnouncements()
    } catch (err) {
      console.error('Failed to create announcement:', err)
    } finally {
      setIsCreatingAnnouncement(false)
    }
  }

  // Handle joining a meeting
  const handleJoinMeeting = async (session: { id: string }) => {
    try {
      await joinSession(session.id)
      setInMeeting(true)
    } catch (err) {
      console.error('Failed to join session:', err)
    }
  }

  // Handle leaving a meeting
  const handleLeaveMeeting = async () => {
    await leaveSession()
    setInMeeting(false)
    qc.invalidateQueries({ queryKey: ['video-body-doubling', 'active'] })
  }

  // Handle creating a regular session (immediate start)
  const handleCreateSession = async () => {
    try {
      const session = await createSession(
        newRoomName || undefined,
        newDescription || undefined
      )
      setCurrentSession(session)
      setShowCreateModal(false)
      setNewRoomName('')
      setNewDescription('')
      qc.invalidateQueries({ queryKey: ['video-body-doubling', 'active'] })
    } catch (err) {
      console.error('Failed to create session:', err)
    }
  }

  // Copy session link
  const copySessionLink = async (sessionId: string) => {
    const url = `${window.location.origin}/video-body-doubling?join=${sessionId}`
    await navigator.clipboard.writeText(url)
    setCopiedId(sessionId)
    setTimeout(() => setCopiedId(null), 2000)
  }


  // If in meeting, show only the meeting interface
  if (isInMeeting && currentSession && jitsiRoomId) {
    return (
      <div className="h-full flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-brand-400" />
              {currentSession.roomName}
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">Focus together with others</p>
          </div>
          <button
            onClick={handleLeaveMeeting}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm font-medium transition-colors"
          >
            <X className="w-4 h-4" />
            Leave Session
          </button>
        </div>

        <div className="flex-1 min-h-[600px]">
          <JitsiMeeting
            roomName={jitsiRoomId}
            displayName="ADHD Focus Participant"
            onLeave={handleLeaveMeeting}
            configOverwrite={{
              startWithAudioMuted: false,
              startWithVideoMuted: false,
              enableWelcomePage: false,
              disableJoinLeaveNotifications: false,
            }}
          />
        </div>
      </div>
    )
  }

  // If in waiting room (announcement waiting to start)
  if (activeAnnouncement) {
    return (
      <div className="max-w-2xl mx-auto">
        <WaitingRoom
          announcement={activeAnnouncement}
          isCreator={true}
          onJoin={(_roomId) => {
            // Session started, join the meeting
            handleJoinMeeting({ id: activeAnnouncement.sessionId })
          }}
          onCancel={() => {
            setActiveAnnouncement(null)
          }}
        />
      </div>
    )
  }

  // Show session browser/creator
  return (
    <div>
      {/* Create Session Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-gray-700/50 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Create Focus Room</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Name (optional)
                </label>
                <input
                  type="text"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g., Morning Focus Session"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-brand-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="e.g., Deep work session for coding"
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-brand-500 resize-none"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateSession}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {isLoading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Announcement Modal */}
      {showAnnouncementModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-900 rounded-2xl border border-purple-700/50 w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-purple-400" />
                  Announce Session
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Wait 2 min for others, then start together
                </p>
              </div>
              <button
                onClick={() => setShowAnnouncementModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Room Name (optional)
                </label>
                <input
                  type="text"
                  value={announcementRoomName}
                  onChange={(e) => setAnnouncementRoomName(e.target.value)}
                  placeholder="e.g., Evening Focus Group"
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description (optional)
                </label>
                <textarea
                  value={announcementDescription}
                  onChange={(e) => setAnnouncementDescription(e.target.value)}
                  placeholder="e.g., 25-min focus session for everyone"
                  rows={3}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                />
              </div>

              {/* Timeline info */}
              <div className="bg-purple-900/20 rounded-lg border border-purple-700/30 p-3 space-y-2">
                <div className="flex items-center gap-2 text-xs text-purple-300">
                  <Clock className="w-3.5 h-3.5" />
                  <span>Wait 2 min for others to join</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-purple-300">
                  <Video className="w-3.5 h-3.5" />
                  <span>Start 25-min session together</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-purple-300">
                  <Users className="w-3.5 h-3.5" />
                  <span>Late joiners allowed for 5 min</span>
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowAnnouncementModal(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAnnouncement}
                  disabled={isCreatingAnnouncement}
                  className="flex-1 px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-medium transition-colors disabled:opacity-50"
                >
                  {isCreatingAnnouncement ? 'Announcing...' : 'Announce Session'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-brand-400" />
              Video Body Doubling
            </h2>
            <p className="text-sm text-gray-500 mt-0.5">
              Focus alongside others via video call
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAnnouncementModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 text-white text-sm font-medium transition-all shadow-lg shadow-purple-900/30"
            >
              <Radio className="w-4 h-4" />
              Announce Session
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
            >
              <Plus className="w-4 h-4" />
              Create Room
            </button>
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mb-4 p-4 rounded-lg bg-red-900/20 border border-red-700/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-xl border border-blue-700/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-900/30 border border-blue-700/30">
              <Users className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats?.activeSessions || 0}
              </p>
              <p className="text-xs text-blue-500 mt-0.5">Active Rooms</p>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-green-900/20 to-green-800/10 rounded-xl border border-green-700/30 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-900/30 border border-green-700/30">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-2xl font-bold text-white">
                {stats?.totalParticipants || 0}
              </p>
              <p className="text-xs text-green-500 mt-0.5">People Focusing</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active announcements */}
      {announcementsData && announcementsData.announcements.length > 0 && (
        <div className="space-y-3 mb-6">
          <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
            <Radio className="w-4 h-4 text-purple-400" />
            Sessions Starting Soon
          </h3>
          <div className="space-y-2">
            {announcementsData.announcements.map((announcement) => (
              <div
                key={announcement.id}
                className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 rounded-xl border border-purple-700/30 p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-purple-900/30 border border-purple-700/30">
                      <Clock className="w-5 h-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">
                        {announcement.status === 'waiting' ? 'Waiting to Start' : 'Active Now'}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {announcement.interestedCount} interested
                        </span>
                        <span className="text-xs text-gray-500">
                          {announcement.sessionDurationMin} min
                        </span>
                        {announcement.status === 'waiting' && (
                          <span className="text-xs text-purple-400">
                            Starts in {Math.ceil((new Date(announcement.waitUntil).getTime() - Date.now()) / 60000)}m
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => loadAnnouncement(announcement.id)}
                    className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white text-sm font-medium transition-colors"
                  >
                    {announcement.status === 'waiting' ? 'View' : 'Join'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active sessions list */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Active Focus Rooms
        </h3>

        {isLoadingStats ? (
          <div className="text-center py-8">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-gray-500 text-sm">Loading rooms...</p>
          </div>
        ) : stats && stats.sessions.length > 0 ? (
          <div className="space-y-2">
            {stats.sessions.map((session) => (
              <div
                key={session.id}
                className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-4 hover:border-gray-600/50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="p-2 rounded-lg bg-green-900/20 border border-green-700/30">
                      <Brain className="w-5 h-5 text-green-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-white truncate">
                        {session.roomName}
                      </h4>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-500 flex items-center gap-1">
                          <Users className="w-3 h-3" />
                          {session.participantCount} focusing
                        </span>
                        <SessionTimer createdAt={session.createdAt} />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copySessionLink(session.id)}
                      className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
                      title="Copy join link"
                    >
                      {copiedId === session.id ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => handleJoinMeeting(session)}
                      disabled={isLoading}
                      className={clsx(
                        'px-4 py-2 rounded-lg text-white text-sm font-medium transition-colors disabled:opacity-50',
                        (Date.now() - new Date(session.createdAt).getTime()) < JOIN_WINDOW_SEC * 1000
                          ? 'bg-brand-600 hover:bg-brand-500'
                          : 'bg-gray-600 hover:bg-gray-500'
                      )}
                      title={(Date.now() - new Date(session.createdAt).getTime()) >= JOIN_WINDOW_SEC * 1000 ? 'Session already in progress' : undefined}
                    >
                      {isLoading ? 'Joining...' : 'Join'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-gray-800/40 rounded-xl border border-gray-700/50 p-8 text-center">
            <Coffee className="w-8 h-8 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400 text-sm mb-1">No active rooms yet</p>
            <p className="text-gray-500 text-xs">
              Be the first to start a focus session!
            </p>
          </div>
        )}
      </div>

      {/* Guidelines */}
      <div className="mt-8 p-4 rounded-xl bg-blue-900/10 border border-blue-700/20">
        <h4 className="text-xs font-semibold text-blue-300 mb-2">📋 Room Guidelines</h4>
        <ul className="space-y-1 text-xs text-gray-400">
          <li>• Keep your microphone muted unless speaking</li>
          <li>• Video is optional - use what feels comfortable</li>
          <li>• This is a silent co-working space, not a chat room</li>
          <li>• Be respectful of others' focus time</li>
          <li>• Feel free to join and leave as needed</li>
        </ul>
      </div>
    </div>
  )
}
