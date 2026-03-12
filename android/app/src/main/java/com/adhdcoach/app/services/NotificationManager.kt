package com.adhdcoach.app.services

import android.Manifest
import android.app.Notification
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import androidx.core.content.ContextCompat
import com.adhdcoach.app.ADHDCoachApplication
import com.adhdcoach.app.MainActivity
import com.adhdcoach.app.R
import com.adhdcoach.app.data.model.Nudge
import com.adhdcoach.app.data.model.PomodoroSession
import com.adhdcoach.app.data.model.Task

class NotificationManager(private val context: Context) {

    private val notificationManager = NotificationManagerCompat.from(context)

    fun hasNotificationPermission(): Boolean {
        return ContextCompat.checkSelfPermission(
            context,
            Manifest.permission.POST_NOTIFICATIONS
        ) == PackageManager.PERMISSION_GRANTED
    }

    fun showPomodoroComplete(session: PomodoroSession) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("navigate_to", "pomodoro")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            POMODORO_COMPLETE_REQUEST,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, ADHDCoachApplication.CHANNEL_POMODORO)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("Focus Session Complete!")
            .setContentText("Great job! You completed ${session.durationMin} minutes of focused work.")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        notificationManager.notify(POMODORO_COMPLETE_NOTIFICATION, notification)
    }

    fun showPomodoroStart(session: PomodoroSession) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("navigate_to", "pomodoro")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            POMODORO_START_REQUEST,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, ADHDCoachApplication.CHANNEL_POMODORO)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("Focus Session Started")
            .setContentText("${session.durationMin} minute pomodoro in progress")
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .build()

        notificationManager.notify(POMODORO_START_NOTIFICATION, notification)
    }

    fun hidePomodoroStart() {
        notificationManager.cancel(POMODORO_START_NOTIFICATION)
    }

    fun showTaskReminder(task: Task) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("navigate_to", "tasks")
            putExtra("task_id", task.id)
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            TASK_REMINDER_REQUEST,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, ADHDCoachApplication.CHANNEL_TASKS)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle(task.title)
            .setContentText(task.description ?: "Task reminder")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        notificationManager.notify(task.id.hashCode(), notification)
    }

    fun showTaskDueSoon(task: Task) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("navigate_to", "tasks")
            putExtra("task_id", task.id)
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            TASK_DUE_REQUEST,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, ADHDCoachApplication.CHANNEL_TASKS)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("Task Due Soon")
            .setContentText("${task.title} is due ${task.dueDate}")
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        notificationManager.notify(task.id.hashCode() + 1000, notification)
    }

    fun showNudge(nudge: Nudge) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("navigate_to", "nudges")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            NUDGE_REQUEST,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, ADHDCoachApplication.CHANNEL_NUDGES)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("Coach Nudge")
            .setContentText(nudge.content)
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_MESSAGE)
            .setVisibility(NotificationCompat.VISIBILITY_PRIVATE)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .setStyle(NotificationCompat.BigTextStyle().bigText(nudge.content))
            .build()

        notificationManager.notify(nudge.id.hashCode(), notification)
    }

    fun showHabitReminder(habitName: String, streak: Int) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("navigate_to", "habits")
        }

        val pendingIntent = PendingIntent.getActivity(
            context,
            HABIT_REMINDER_REQUEST,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, ADHDCoachApplication.CHANNEL_HABITS)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("Habit Reminder")
            .setContentText("Time to $habitName! Current streak: $streak days 🔥")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setAutoCancel(true)
            .setContentIntent(pendingIntent)
            .build()

        notificationManager.notify(habitName.hashCode(), notification)
    }

    fun showHabitCompleted(habitName: String, newStreak: Int) {
        val notification = NotificationCompat.Builder(context, ADHDCoachApplication.CHANNEL_HABITS)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("Habit Completed! 🎉")
            .setContentText("$habitName - New streak: $newStreak days!")
            .setPriority(NotificationCompat.PRIORITY_DEFAULT)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(habitName.hashCode() + 2000, notification)
    }

    companion object {
        private const val POMODORO_COMPLETE_NOTIFICATION = 1
        private const val POMODORO_COMPLETE_REQUEST = 101

        private const val POMODORO_START_NOTIFICATION = 2
        private const val POMODORO_START_REQUEST = 102

        private const val TASK_REMINDER_REQUEST = 103
        private const val TASK_DUE_REQUEST = 104

        private const val NUDGE_REQUEST = 105

        private const val HABIT_REMINDER_REQUEST = 106
    }
}
