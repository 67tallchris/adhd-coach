// Jitsi Meet External API types
// Based on: https://jitsi.github.io/handbook/docs/dev-guide/dev-guide-iframe

export interface JitsiMeetExternalAPI {
  new (
    domain: string,
    options: JitsiOptions
  ): JitsiMeetExternalAPI

  // Event listeners
  addEventListener(event: string, listener: (data: any) => void): void
  removeEventListener(event: string, listener: (data: any) => void): void

  // Commands
  executeCommand(command: string, ...args: any[]): void

  // Dispose
  dispose(): void

  // Get iframe
  getIFrame(): HTMLIFrameElement
}

export interface JitsiOptions {
  roomName: string
  width: number | string
  height: number | string
  parentNode?: HTMLElement
  configOverwrite?: JitsiConfig
  interfaceConfigOverwrite?: JitsiInterfaceConfig
  userInfo?: {
    displayName?: string
    email?: string
  }
  lang?: string
  devices?: {
    audioInput?: string
    audioOutput?: string
    videoInput?: string
  }
}

export interface JitsiConfig {
  // Pre-join screen
  prejoinConfig?: {
    enabled: boolean
    showDisplayName?: boolean
    showDeviceSelection?: boolean
  }

  // Welcome page
  enableWelcomePage?: boolean

  // Close page
  enableClosePage?: boolean

  // Features
  disableDeepLinking?: boolean
  disablePolldots?: boolean
  disableJoinLeaveNotifications?: boolean
  disableModeratorIndicator?: boolean
  enableEmailInStats?: boolean

  // UI
  startWithAudioMuted?: boolean
  startWithVideoMuted?: boolean
  enableNoisyMicDetection?: boolean

  // Toolbar
  toolbarButtons?: string[]
  filmStripOnly?: boolean

  // Constraints
  constraints?: {
    video?: {
      height?: {
        ideal?: number
        max?: number
        min?: number
      }
      width?: {
        ideal?: number
        max?: number
        min?: number
      }
    }
    audio?: boolean
  }

  // Background blur
  enableBackgroundBlur?: boolean

  // Testing
  testing?: {
    enableMockParticipant?: boolean
  }

  // JWT token (for authenticated access)
  jwt?: string
}

export interface JitsiInterfaceConfig {
  // Branding
  DEFAULT_BACKGROUND?: string
  DEFAULT_WELCOME_PAGE_LOGO_URL?: string

  // UI elements
  SHOW_JITSI_WATERMARK?: boolean
  SHOW_WATERMARK_FOR_GUESTS?: boolean
  SHOW_BRAND_WATERMARK?: boolean
  BRAND_WATERMARK_LINK?: string
  SHOW_POWERED_BY?: boolean
  SHOW_PROMOTIONAL_CLOSE_PAGE?: boolean
  SHOW_DEEP_LINKING_IMAGE?: boolean

  // Toolbar
  TOOLBAR_BUTTONS?: string[]
  MAIN_TOOLBAR_BUTTONS?: string[]

  // Settings
  SETTINGS_SECTIONS?: string[]

  // Filmstrip
  filmStripOnly?: boolean
  VERTICAL_FILMSTRIP?: boolean

  // Other
  JITSI_WATERMARK_LINK?: string
}

// Jitsi events
export type JitsiEvent =
  | 'videoConferenceJoined'
  | 'videoConferenceLeft'
  | 'audioMuteStatusChanged'
  | 'videoMuteStatusChanged'
  | 'participantJoined'
  | 'participantLeft'
  | 'dominantSpeakerChanged'
  | 'audioAvailabilityChanged'
  | 'videoAvailabilityChanged'
  | 'incomingMessage'
  | 'outgoingMessage'
  | 'screenSharingStatusChanged'
  | 'participantJoined'
  | 'participantKicked'
  | 'suspendDetected'
  | 'readyToClose'

export interface JitsiEventMap {
  videoConferenceJoined: {
    roomName: string
    id: string
    displayName: string
    formattedDisplayName: string
  }
  videoConferenceLeft: {
    roomName: string
  }
  audioMuteStatusChanged: {
    muted: boolean
  }
  videoMuteStatusChanged: {
    muted: boolean
  }
  participantJoined: {
    id: string
    displayName: string
    formattedDisplayName: string
  }
  participantLeft: {
    id: string
    displayName: string
  }
  dominantSpeakerChanged: {
    id: string
  }
  audioAvailabilityChanged: {
    available: boolean
  }
  videoAvailabilityChanged: {
    available: boolean
  }
  incomingMessage: {
    senderId: string
    senderName: string
    message: string
    stamp: number
    isPrivate: boolean
  }
  outgoingMessage: {
    message: string
    stamp: number
  }
  screenSharingStatusChanged: {
    participantId: string
    sharing: boolean
  }
  suspendDetected: Record<string, never>
  readyToClose: Record<string, never>
  participantKicked: {
    kicked: string
    kicker: string
  }
}

// Video body doubling session types
export interface VideoSession {
  id: string
  roomName: string
  jitsiRoomId: string
  createdAt: string
  createdBy: string
  isActive: boolean
  participantCount: number
  maxParticipants?: number
  description?: string
  tags?: string[]
}

export interface CreateVideoSessionRequest {
  roomName?: string
  description?: string
  maxParticipants?: number
  tags?: string[]
}

export interface CreateVideoSessionResponse {
  session: VideoSession
  jitsiRoomId: string
  jwt?: string
}

export interface VideoSessionStats {
  activeSessions: number
  totalParticipants: number
  sessions: Array<{
    id: string
    roomName: string
    participantCount: number
    tags?: string[]
  }>
}

export interface JitsiMeetLib {
  JitsiMeetExternalAPI: JitsiMeetExternalAPI
}
