package com.adhdcoach.app.services

import android.util.Log
import com.adhdcoach.app.data.model.Nudge
import com.adhdcoach.app.data.model.PomodoroSession
import com.adhdcoach.app.data.model.Task
import com.google.firebase.messaging.FirebaseMessagingService
import com.google.firebase.messaging.RemoteMessage
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import kotlinx.serialization.json.Json

class FCMPushService : FirebaseMessagingService() {

    private val serviceScope = CoroutineScope(SupervisorJob() + Dispatchers.IO)
    private val notificationManager by lazy { NotificationManager(this) }
    private val json = Json { ignoreUnknownKeys = true }

    override fun onNewToken(token: String) {
        super.onNewToken(token)
        Log.d(TAG, "New FCM token: $token")
        // Send token to backend
        sendTokenToBackend(token)
    }

    override fun onMessageReceived(message: RemoteMessage) {
        super.onMessageReceived(message)
        Log.d(TAG, "Message received from: ${message.from}")

        message.data.isNotEmpty().let {
            handleDataMessage(message.data)
        }

        message.notification?.let {
            handleNotificationMessage(it)
        }
    }

    private fun handleDataMessage(data: Map<String, String>) {
        Log.d(TAG, "Data message: $data")

        val type = data["type"] ?: return

        when (type) {
            "pomodoro_complete" -> {
                val session = try {
                    json.decodeFromString<PomodoroSession>(data["session"] ?: "{}")
                } catch (e: Exception) {
                    PomodoroSession(id = "", durationMin = 25)
                }
                notificationManager.showPomodoroComplete(session)
            }

            "pomodoro_start" -> {
                val session = try {
                    json.decodeFromString<PomodoroSession>(data["session"] ?: "{}")
                } catch (e: Exception) {
                    PomodoroSession(id = "", durationMin = 25)
                }
                notificationManager.showPomodoroStart(session)
            }

            "task_reminder" -> {
                val task = try {
                    json.decodeFromString<Task>(data["task"] ?: "{}")
                } catch (e: Exception) {
                    Task(id = "", title = "Task", createdAt = "", updatedAt = "")
                }
                notificationManager.showTaskReminder(task)
            }

            "task_due_soon" -> {
                val task = try {
                    json.decodeFromString<Task>(data["task"] ?: "{}")
                } catch (e: Exception) {
                    Task(id = "", title = "Task", createdAt = "", updatedAt = "")
                }
                notificationManager.showTaskDueSoon(task)
            }

            "nudge" -> {
                val nudge = try {
                    json.decodeFromString<Nudge>(data["nudge"] ?: "{}")
                } catch (e: Exception) {
                    Nudge(id = "", content = "Check your coach", type = com.adhdcoach.app.data.model.NudgeType.motivation, createdAt = "")
                }
                notificationManager.showNudge(nudge)
            }

            "habit_reminder" -> {
                val habitName = data["habit_name"] ?: "your habit"
                val streak = data["streak"]?.toIntOrNull() ?: 0
                notificationManager.showHabitReminder(habitName, streak)
            }

            else -> {
                Log.w(TAG, "Unknown message type: $type")
            }
        }
    }

    private fun handleNotificationMessage(notification: RemoteMessage.Notification) {
        // Fallback for simple notification messages
        Log.d(TAG, "Notification message: ${notification.body}")
    }

    private fun sendTokenToBackend(token: String) {
        serviceScope.launch {
            try {
                // TODO: Implement device registration with backend
                // This would typically call your Cloudflare Worker to register the token
                Log.d(TAG, "Token sent to backend: $token")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to send token to backend", e)
            }
        }
    }

    companion object {
        private const val TAG = "FCMPushService"

        fun subscribeToTopic(topic: String) {
            FirebaseMessaging.getInstance().subscribeToTopic(topic)
                .addOnCompleteListener { task ->
                    Log.d(TAG, "Subscribed to $topic: ${task.isSuccessful}")
                }
        }

        fun unsubscribeFromTopic(topic: String) {
            FirebaseMessaging.getInstance().unsubscribeFromTopic(topic)
                .addOnCompleteListener { task ->
                    Log.d(TAG, "Unsubscribed from $topic: ${task.isSuccessful}")
                }
        }
    }
}
