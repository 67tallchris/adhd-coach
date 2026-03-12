package com.adhdcoach.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build
import androidx.work.ExistingPeriodicWorkPolicy
import androidx.work.PeriodicWorkRequestBuilder
import androidx.work.WorkManager
import com.adhdcoach.app.workers.SyncWorker
import java.util.concurrent.TimeUnit

class ADHDCoachApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
        scheduleBackgroundSync()
    }

    private fun createNotificationChannels() {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // Pomodoro Timer Channel - High priority for timer completion
        val pomodoroChannel = NotificationChannel(
            CHANNEL_POMODORO,
            "Pomodoro Timer",
            NotificationManager.IMPORTANCE_HIGH
        ).apply {
            description = "Notifications for pomodoro timer start and completion"
            enableVibration(true)
            enableLights(true)
            lightColor = android.graphics.Color.parseColor("#4F5BFF")
            lockscreenVisibility = NotificationChannel.VISIBILITY_PUBLIC
        }

        // Tasks Channel - For task reminders and due dates
        val tasksChannel = NotificationChannel(
            CHANNEL_TASKS,
            "Tasks & Reminders",
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            description = "Task reminders and due date notifications"
            enableVibration(true)
            lockscreenVisibility = NotificationChannel.VISIBILITY_PUBLIC
        }

        // Nudges Channel - For coaching messages
        val nudgesChannel = NotificationChannel(
            CHANNEL_NUDGES,
            "Coaching Nudges",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Daily coaching messages and motivational nudges"
            enableVibration(false)
            lockscreenVisibility = NotificationChannel.VISIBILITY_PRIVATE
        }

        // Habits Channel - For habit tracking reminders
        val habitsChannel = NotificationChannel(
            CHANNEL_HABITS,
            "Habit Reminders",
            NotificationManager.IMPORTANCE_DEFAULT
        ).apply {
            description = "Habit tracking reminders and streaks"
            enableVibration(true)
            lockscreenVisibility = NotificationChannel.VISIBILITY_PUBLIC
        }

        // Sync Channel - For background sync status
        val syncChannel = NotificationChannel(
            CHANNEL_SYNC,
            "Sync Status",
            NotificationManager.IMPORTANCE_LOW
        ).apply {
            description = "Background sync notifications"
            enableVibration(false)
            lockscreenVisibility = NotificationChannel.VISIBILITY_PRIVATE
        }

        notificationManager.createNotificationChannels(
            listOf(
                pomodoroChannel,
                tasksChannel,
                nudgesChannel,
                habitsChannel,
                syncChannel
            )
        )
    }

    private fun scheduleBackgroundSync() {
        // Sync every 15 minutes (minimum interval for PeriodicWorkRequest)
        val syncRequest = PeriodicWorkRequestBuilder<SyncWorker>(
            15, TimeUnit.MINUTES
        )
            .setInitialDelay(5, TimeUnit.MINUTES)
            .build()

        WorkManager.getInstance(this).enqueueUniquePeriodicWork(
            "sync_data",
            ExistingPeriodicWorkPolicy.KEEP,
            syncRequest
        )
    }

    companion object {
        const val CHANNEL_POMODORO = "pomodoro"
        const val CHANNEL_TASKS = "tasks"
        const val CHANNEL_NUDGES = "nudges"
        const val CHANNEL_HABITS = "habits"
        const val CHANNEL_SYNC = "sync"
    }
}
