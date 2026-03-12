package com.adhdcoach.app.receivers

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.util.Log
import com.adhdcoach.app.data.repository.TaskRepository

class NotificationActionReceiver : BroadcastReceiver() {

    override fun onReceive(context: Context, intent: Intent) {
        val action = intent.action ?: return
        val taskId = intent.getStringExtra("task_id") ?: return

        Log.d(TAG, "Notification action: $action for task: $taskId")

        when (action) {
            ACTION_COMPLETE_TASK -> {
                // Complete the task
                completeTask(context, taskId)
            }

            ACTION_SNOOZE -> {
                // Snooze the reminder
                snoozeReminder(context, taskId)
            }
        }
    }

    private fun completeTask(context: Context, taskId: String) {
        // TODO: Inject repository properly
        Log.d(TAG, "Completing task: $taskId")
    }

    private fun snoozeReminder(context: Context, taskId: String) {
        // TODO: Schedule snooze
        Log.d(TAG, "Snoozing task: $taskId")
    }

    companion object {
        private const val TAG = "NotificationActionReceiver"

        const val ACTION_COMPLETE_TASK = "com.adhdcoach.app.COMPLETE_TASK"
        const val ACTION_SNOOZE = "com.adhdcoach.app.SNOOZE"
    }
}
