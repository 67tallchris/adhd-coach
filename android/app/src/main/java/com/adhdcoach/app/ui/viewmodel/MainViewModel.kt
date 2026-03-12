package com.adhdcoach.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.ViewModel
import androidx.lifecycle.ViewModelProvider
import androidx.lifecycle.viewModelScope
import com.adhdcoach.app.data.local.AppDatabase
import com.adhdcoach.app.data.local.DatabaseProvider
import com.adhdcoach.app.data.model.*
import com.adhdcoach.app.data.remote.ApiClient
import com.adhdcoach.app.data.repository.*
import com.adhdcoach.app.services.NotificationManager
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class MainViewModel(application: Application) : AndroidViewModel(application) {

    private val database = DatabaseProvider.getInstance(application)
    private val api = ApiClient.apiService

    private val taskRepo = TaskRepository(database.taskDao(), api)
    private val pomodoroRepo = PomodoroRepository(database.pomodoroSessionDao(), api)
    private val nudgeRepo = NudgeRepository(database.nudgeDao(), api)
    private val deviceRepo = DeviceRepository(database.deviceDao(), api)

    private val notificationManager = NotificationManager(application)

    // State flows
    val tasks: StateFlow<List<Task>> = taskRepo.allTasks
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val pomodoroSessions: StateFlow<List<PomodoroSession>> = pomodoroRepo.recentSessions
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val nudges: StateFlow<List<Nudge>> = nudgeRepo.recentNudges
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    val unreadNudges: StateFlow<List<Nudge>> = nudgeRepo.unreadNudges
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    // Current timer state
    private val _timerState = MutableStateFlow(TimerState())
    val timerState: StateFlow<TimerState> = _timerState.asStateFlow()

    fun checkNotificationPermission(callback: (Boolean) -> Unit) {
        val needsPermission = !notificationManager.hasNotificationPermission()
        callback(needsPermission)
    }

    fun onNotificationPermissionGranted() {
        // Register for FCM
        registerForPushNotifications()
    }

    private fun registerForPushNotifications() {
        viewModelScope.launch {
            // FCM token registration happens in FCMPushService
            // This is just a placeholder for any additional setup
        }
    }

    // Pomodoro actions
    fun startPomodoro(taskId: String? = null, durationMin: Int = 25) {
        viewModelScope.launch {
            try {
                val session = pomodoroRepo.startSession(taskId, durationMin)
                _timerState.value = TimerState(
                    sessionId = session.id,
                    isRunning = true,
                    durationSec = durationMin * 60,
                    remainingSec = durationMin * 60,
                    linkedTaskId = taskId
                )

                // Show notification
                notificationManager.showPomodoroStart(session)

                // Start foreground service
                // Note: In production, you'd start the service here

            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun stopPomodoro() {
        viewModelScope.launch {
            _timerState.value.sessionId?.let { sessionId ->
                pomodoroRepo.cancelSession(sessionId)
            }
            _timerState.value = TimerState()
            notificationManager.hidePomodoroStart()
        }
    }

    fun completePomodoro() {
        viewModelScope.launch {
            _timerState.value.sessionId?.let { sessionId ->
                pomodoroRepo.completeSession(sessionId)
                notificationManager.showPomodoroComplete(
                    PomodoroSession(
                        id = sessionId,
                        durationMin = _timerState.value.durationSec / 60
                    )
                )
            }
            _timerState.value = TimerState()
        }
    }

    fun tick() {
        val currentState = _timerState.value
        if (currentState.isRunning && currentState.remainingSec > 0) {
            _timerState.value = currentState.copy(remainingSec = currentState.remainingSec - 1)

            if (currentState.remainingSec == 1) {
                completePomodoro()
            }
        }
    }

    // Task actions
    fun createTask(title: String, description: String? = null) {
        viewModelScope.launch {
            taskRepo.createTask(title, description)
        }
    }

    fun completeTask(taskId: String) {
        viewModelScope.launch {
            taskRepo.updateTaskStatus(taskId, TaskStatus.COMPLETED)
        }
    }

    // Nudge actions
    fun generateNudge() {
        viewModelScope.launch {
            nudgeRepo.generateNudge()
        }
    }

    fun markNudgeAsRead(nudgeId: String) {
        viewModelScope.launch {
            nudgeRepo.markAsRead(nudgeId)
        }
    }

    data class TimerState(
        val sessionId: String? = null,
        val isRunning: Boolean = false,
        val durationSec: Int = 25 * 60,
        val remainingSec: Int = 25 * 60,
        val linkedTaskId: String? = null
    )
}

class MainViewModelFactory(
    private val application: Application
) : ViewModelProvider.Factory {

    @Suppress("UNCHECKED_CAST")
    override fun <T : ViewModel> create(modelClass: Class<T>): T {
        if (modelClass.isAssignableFrom(MainViewModel::class.java)) {
            return MainViewModel(application) as T
        }
        throw IllegalArgumentException("Unknown ViewModel class")
    }
}
