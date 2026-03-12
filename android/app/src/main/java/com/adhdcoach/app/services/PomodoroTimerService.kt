package com.adhdcoach.app.services

import android.app.*
import android.content.Intent
import android.os.Build
import android.os.IBinder
import androidx.core.app.NotificationCompat
import com.adhdcoach.app.ADHDCoachApplication
import com.adhdcoach.app.MainActivity
import com.adhdcoach.app.R

class PomodoroTimerService : Service() {

    private val notificationManager by lazy {
        getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    }

    private var timerNotification: Notification? = null

    override fun onCreate() {
        super.onCreate()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_START -> {
                val durationMin = intent.getIntExtra(EXTRA_DURATION, 25)
                startForegroundService(durationMin)
            }

            ACTION_STOP -> {
                stopTimerService()
            }

            ACTION_PAUSE -> {
                // Update notification to show paused state
            }

            ACTION_RESUME -> {
                // Update notification to show running state
            }
        }

        return START_STICKY
    }

    private fun startForegroundService(durationMin: Int) {
        val channelId = ADHDCoachApplication.CHANNEL_POMODORO

        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TASK
            putExtra("navigate_to", "pomodoro")
        }

        val pendingIntent = PendingIntent.getActivity(
            this,
            0,
            intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val stopIntent = Intent(this, PomodoroTimerService::class.java).apply {
            action = ACTION_STOP
        }

        val stopPendingIntent = PendingIntent.getService(
            this,
            1,
            stopIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        timerNotification = NotificationCompat.Builder(this, channelId)
            .setSmallIcon(R.drawable.ic_notification)
            .setContentTitle("Focus Session")
            .setContentText("$durationMin minute pomodoro in progress")
            .setPriority(NotificationCompat.PRIORITY_LOW)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setOngoing(true)
            .setContentIntent(pendingIntent)
            .addAction(
                R.drawable.ic_stop,
                "Stop",
                stopPendingIntent
            )
            .build()

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.UPSIDE_DOWN_CAKE) {
            startForeground(
                TIMER_NOTIFICATION_ID,
                timerNotification,
                ServiceInfo.FOREGROUND_SERVICE_TYPE_DATA_SYNC
            )
        } else {
            startForeground(TIMER_NOTIFICATION_ID, timerNotification)
        }
    }

    private fun stopTimerService() {
        stopForeground(STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onBind(intent: Intent?): IBinder? = null

    companion object {
        private const val TIMER_NOTIFICATION_ID = 1001

        const val ACTION_START = "com.adhdcoach.app.START_TIMER"
        const val ACTION_STOP = "com.adhdcoach.app.STOP_TIMER"
        const val ACTION_PAUSE = "com.adhdcoach.app.PAUSE_TIMER"
        const val ACTION_RESUME = "com.adhdcoach.app.RESUME_TIMER"

        const val EXTRA_DURATION = "duration_min"
    }
}
