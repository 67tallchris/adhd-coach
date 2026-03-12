package com.adhdcoach.app.workers

import android.content.Context
import android.util.Log
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.adhdcoach.app.data.local.DatabaseProvider
import com.adhdcoach.app.data.remote.ApiClient
import com.adhdcoach.app.data.repository.*

class SyncWorker(
    context: Context,
    params: WorkerParameters
) : CoroutineWorker(context, params) {

    private val database = DatabaseProvider.getInstance(context)
    private val api = ApiClient.apiService

    override suspend fun doWork(): Result {
        Log.d(TAG, "Starting background sync")

        try {
            // Initialize repositories
            val taskRepo = TaskRepository(database.taskDao(), api)
            val pomodoroRepo = PomodoroRepository(database.pomodoroSessionDao(), api)
            val nudgeRepo = NudgeRepository(database.nudgeDao(), api)

            // Sync data
            taskRepo.syncTasks()
            Log.d(TAG, "Tasks synced")

            pomodoroRepo.syncSessions()
            Log.d(TAG, "Pomodoro sessions synced")

            nudgeRepo.syncNudges()
            Log.d(TAG, "Nudges synced")

            Log.d(TAG, "Background sync completed successfully")
            return Result.success()

        } catch (e: Exception) {
            Log.e(TAG, "Sync failed", e)
            return Result.retry()
        }
    }

    companion object {
        private const val TAG = "SyncWorker"
    }
}
