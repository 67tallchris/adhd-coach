// FCM Server configuration
// Add FCM_SERVER_KEY to your Cloudflare Workers secrets/environment variables
const FCM_SERVER_KEY = 'YOUR_FCM_SERVER_KEY'

export interface FcmNotificationPayload {
  to?: string
  topic?: string
  data: {
    type: string
    [key: string]: string
  }
}

export interface PomodoroSessionData {
  id: string
  durationMin: number
  taskId?: string | null
  completedAt?: string | null
}

export interface TaskData {
  id: string
  title: string
  description?: string | null
  dueDate?: string | null
}

export interface NudgeData {
  id: string
  content: string
  type: string
  createdAt: string
}

/**
 * Send push notification via Firebase Cloud Messaging
 */
export async function sendPushNotification(
  fcmToken: string,
  payload: FcmNotificationPayload
): Promise<boolean> {
  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${FCM_SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: fcmToken,
        data: payload.data,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('FCM send error:', error)
      return false
    }

    const result = await response.json() as { success?: number }
    console.log('FCM send result:', result)
    return result.success === 1
  } catch (error) {
    console.error('FCM send failed:', error)
    return false
  }
}

/**
 * Send notification when pomodoro session completes
 */
export async function sendPomodoroCompleteNotification(
  fcmToken: string,
  session: PomodoroSessionData
): Promise<boolean> {
  return sendPushNotification(fcmToken, {
    data: {
      type: 'pomodoro_complete',
      session: JSON.stringify({
        id: session.id,
        durationMin: session.durationMin,
        taskId: session.taskId ?? '',
        completedAt: session.completedAt ?? new Date().toISOString(),
      }),
    },
  })
}

/**
 * Send notification when pomodoro session starts
 */
export async function sendPomodoroStartNotification(
  fcmToken: string,
  session: PomodoroSessionData
): Promise<boolean> {
  return sendPushNotification(fcmToken, {
    data: {
      type: 'pomodoro_start',
      session: JSON.stringify({
        id: session.id,
        durationMin: session.durationMin,
        taskId: session.taskId ?? '',
      }),
    },
  })
}

/**
 * Send task reminder notification
 */
export async function sendTaskReminderNotification(
  fcmToken: string,
  task: TaskData
): Promise<boolean> {
  return sendPushNotification(fcmToken, {
    data: {
      type: 'task_reminder',
      task: JSON.stringify({
        id: task.id,
        title: task.title,
        description: task.description ?? '',
        dueDate: task.dueDate ?? '',
      }),
    },
  })
}

/**
 * Send task due soon notification (high priority)
 */
export async function sendTaskDueSoonNotification(
  fcmToken: string,
  task: TaskData
): Promise<boolean> {
  return sendPushNotification(fcmToken, {
    data: {
      type: 'task_due_soon',
      task: JSON.stringify({
        id: task.id,
        title: task.title,
        description: task.description ?? '',
        dueDate: task.dueDate ?? '',
      }),
    },
  })
}

/**
 * Send coaching nudge notification
 */
export async function sendNudgeNotification(
  fcmToken: string,
  nudge: NudgeData
): Promise<boolean> {
  return sendPushNotification(fcmToken, {
    data: {
      type: 'nudge',
      nudge: JSON.stringify({
        id: nudge.id,
        content: nudge.content,
        type: nudge.type,
        createdAt: nudge.createdAt,
      }),
    },
  })
}

/**
 * Send habit reminder notification
 */
export async function sendHabitReminderNotification(
  fcmToken: string,
  habitName: string,
  streak: number
): Promise<boolean> {
  return sendPushNotification(fcmToken, {
    data: {
      type: 'habit_reminder',
      habit_name: habitName,
      streak: streak.toString(),
    },
  })
}

/**
 * Send notification to all registered devices for a user
 */
export async function broadcastToUserDevices(
  devices: Array<{ fcmToken: string }>,
  payload: FcmNotificationPayload
): Promise<void> {
  await Promise.all(
    devices.map(device => sendPushNotification(device.fcmToken, payload))
  )
}
