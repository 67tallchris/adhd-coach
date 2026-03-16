import { useState, useEffect } from 'react'
import { Video, Users, Plus, Copy, Check, Clock, Zap, Brain, Coffee, X } from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { JitsiMeeting } from '../../components/JitsiMeeting'
import { useVideoBodyDoublingStore } from '../../stores/videoBodyDoublingStore'
import { videoBodyDoublingApi } from '../../api/videoBodyDoubling'

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

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newRoomName, setNewRoomName] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Fetch active sessions
  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['video-body-doubling', 'active'],
    queryFn: () => videoBodyDoublingApi.getActive(),
    refetchInterval: 15000, // Refresh every 15 seconds
  })

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

  // Handle creating a new session
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

  // Auto-join from URL parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const joinId = params.get('join')
    if (joinId && !currentSession && !isInMeeting) {
      handleJoinMeeting({ id: joinId })
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    }
  }, [])

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
            <p className="text-sm text-gray-500 mt-0.5">
              Focus together with others
            </p>
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

  // Show session browser/creator
  return (
    <div>
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
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank for an auto-generated name
                </p>
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
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Room
          </button>
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
                        {session.tags && session.tags.length > 0 && (
                          <div className="flex gap-1">
                            {session.tags.slice(0, 3).map((tag, i) => (
                              <span
                                key={i}
                                className="text-xs px-2 py-0.5 rounded-full bg-brand-900/20 text-brand-400 border border-brand-700/30"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
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
                      className="px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
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

      {/* How it works */}
      <div className="mt-8 p-4 rounded-xl bg-gray-800/30 border border-gray-700/50">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">How Video Body Doubling Works</h4>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="w-8 h-8 rounded-lg bg-brand-900/30 border border-brand-700/30 flex items-center justify-center mb-2">
              <span className="text-brand-400 font-bold text-sm">1</span>
            </div>
            <p className="text-xs text-gray-400">
              Join or create a focus room with others
            </p>
          </div>
          <div>
            <div className="w-8 h-8 rounded-lg bg-brand-900/30 border border-brand-700/30 flex items-center justify-center mb-2">
              <span className="text-brand-400 font-bold text-sm">2</span>
            </div>
            <p className="text-xs text-gray-400">
              Work silently together on video - cameras optional
            </p>
          </div>
          <div>
            <div className="w-8 h-8 rounded-lg bg-brand-900/30 border border-brand-700/30 flex items-center justify-center mb-2">
              <span className="text-brand-400 font-bold text-sm">3</span>
            </div>
            <p className="text-xs text-gray-400">
              Feel the accountability and shared focus energy
            </p>
          </div>
        </div>
      </div>

      {/* Guidelines */}
      <div className="mt-4 p-4 rounded-xl bg-blue-900/10 border border-blue-700/20">
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
