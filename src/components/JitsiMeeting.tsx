import { useEffect, useRef, useState, useCallback } from 'react'
import { Video, VideoOff, Mic, MicOff, Users, LogOut, Copy, Check } from 'lucide-react'
import clsx from 'clsx'
import type { JitsiMeetExternalAPI, JitsiConfig, JitsiInterfaceConfig } from '../types/jitsi'

interface JitsiMeetingProps {
  roomName: string
  displayName?: string
  configOverwrite?: JitsiConfig
  interfaceConfigOverwrite?: JitsiInterfaceConfig
  onJoin?: () => void
  onLeave?: () => void
  onParticipantJoin?: (participantId: string) => void
  onParticipantLeave?: (participantId: string) => void
  className?: string
}

// Jitsi domain - using JaaS (8x8)
const JITSI_DOMAIN = 'meet.jit.si'

export function JitsiMeeting({
  roomName,
  displayName,
  configOverwrite,
  interfaceConfigOverwrite,
  onJoin,
  onLeave,
  onParticipantJoin,
  onParticipantLeave,
  className,
}: JitsiMeetingProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const jitsiRef = useRef<JitsiMeetExternalAPI | null>(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [participantCount, setParticipantCount] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [copied, setCopied] = useState(false)

  // Load Jitsi External API script
  useEffect(() => {
    if ((window as any).JitsiMeetExternalAPI) {
      setIsLoaded(true)
      return
    }

    const script = document.createElement('script')
    script.src = `https://${JITSI_DOMAIN}/external_api.js`
    script.async = true
    script.onload = () => setIsLoaded(true)
    script.onerror = () => {
      console.error('Failed to load Jitsi Meet API')
    }
    document.body.appendChild(script)

    return () => {
      document.body.removeChild(script)
    }
  }, [])

  // Initialize Jitsi meeting
  useEffect(() => {
    if (!isLoaded || !containerRef.current) return

    const defaultConfig: JitsiConfig = {
      startWithAudioMuted: false,
      startWithVideoMuted: false,
      enableWelcomePage: false,
      enableClosePage: false,
      disableDeepLinking: true,
      disableJoinLeaveNotifications: false,
      prejoinConfig: {
        enabled: false,
      },
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

    const defaultInterfaceConfig: JitsiInterfaceConfig = {
      SHOW_JITSI_WATERMARK: false,
      SHOW_WATERMARK_FOR_GUESTS: false,
      SHOW_BRAND_WATERMARK: false,
      SHOW_POWERED_BY: false,
      TOOLBAR_BUTTONS: [
        'microphone',
        'camera',
        'fullscreen',
        'tileview',
        'chat',
        'participants-pane',
        'hangup',
      ],
    }

    try {
      const jitsi = new (window as any).JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName,
        width: '100%',
        height: '100%',
        parentNode: containerRef.current,
        configOverwrite: { ...defaultConfig, ...configOverwrite },
        interfaceConfigOverwrite: { ...defaultInterfaceConfig, ...interfaceConfigOverwrite },
        userInfo: {
          displayName: displayName || 'ADHD Focus Participant',
        },
      })

      jitsiRef.current = jitsi

      // Event listeners
      jitsi.addEventListener('videoConferenceJoined', (data: any) => {
        console.log('Joined video conference:', data)
        onJoin?.()
        setParticipantCount(1)
      })

      jitsi.addEventListener('videoConferenceLeft', (data: any) => {
        console.log('Left video conference:', data)
        onLeave?.()
      })

      jitsi.addEventListener('participantJoined', (data: any) => {
        console.log('Participant joined:', data)
        setParticipantCount(prev => prev + 1)
        onParticipantJoin?.(data.id)
      })

      jitsi.addEventListener('participantLeft', (data: any) => {
        console.log('Participant left:', data)
        setParticipantCount(prev => Math.max(1, prev - 1))
        onParticipantLeave?.(data.id)
      })

      jitsi.addEventListener('audioMuteStatusChanged', (data: any) => {
        setIsMuted(data.muted)
      })

      jitsi.addEventListener('videoMuteStatusChanged', (data: any) => {
        setIsVideoOff(data.muted)
      })

      return () => {
        jitsi.dispose()
        jitsiRef.current = null
      }
    } catch (error) {
      console.error('Failed to initialize Jitsi:', error)
    }
  }, [isLoaded, roomName, displayName, configOverwrite, interfaceConfigOverwrite, onJoin, onLeave, onParticipantJoin, onParticipantLeave])

  const toggleAudio = useCallback(() => {
    jitsiRef.current?.executeCommand('toggleAudio')
  }, [])

  const toggleVideo = useCallback(() => {
    jitsiRef.current?.executeCommand('toggleVideo')
  }, [])

  const hangup = useCallback(() => {
    jitsiRef.current?.executeCommand('hangup')
  }, [])

  const copyLink = useCallback(async () => {
    const meetingUrl = `https://${JITSI_DOMAIN}/${roomName}`
    await navigator.clipboard.writeText(meetingUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [roomName])

  if (!isLoaded) {
    return (
      <div className={clsx('flex items-center justify-center bg-gray-900 rounded-xl', className)}>
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-brand-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-gray-400 text-sm">Loading video meeting...</p>
        </div>
      </div>
    )
  }

  return (
    <div className={clsx('flex flex-col h-full', className)}>
      {/* Control bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800/80 backdrop-blur-sm rounded-t-xl border-b border-gray-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">{participantCount}</span>
          </div>
          <span className="text-xs text-gray-500">in this room</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleAudio}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              isMuted
                ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            )}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <button
            onClick={toggleVideo}
            className={clsx(
              'p-2 rounded-lg transition-colors',
              isVideoOff
                ? 'bg-red-900/30 text-red-400 hover:bg-red-900/50'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            )}
            title={isVideoOff ? 'Turn on video' : 'Turn off video'}
          >
            {isVideoOff ? <VideoOff className="w-4 h-4" /> : <Video className="w-4 h-4" />}
          </button>

          <button
            onClick={copyLink}
            className="p-2 rounded-lg bg-gray-700 text-gray-300 hover:bg-gray-600 transition-colors"
            title="Copy meeting link"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>

          <button
            onClick={hangup}
            className="p-2 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors"
            title="Leave meeting"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Jitsi container */}
      <div ref={containerRef} className="flex-1 min-h-[500px] bg-gray-900 rounded-b-xl" />
    </div>
  )
}
