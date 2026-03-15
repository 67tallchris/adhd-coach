package com.adhdcoach.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.adhdcoach.app.data.remote.ApiService
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class StreakStats(
    val currentStreak: Int = 0,
    val weeklyGoal: Int = 5,
    val progress: Float = 0f,
    val isOnTrack: Boolean = false,
    val bestStreak: Int = 0,
    val totalSessions: Int = 0,
    val lastWeekCount: Int = 0
)

class StreaksViewModel(
    application: Application,
    private val api: ApiService
) : AndroidViewModel(application) {

    private val _pomodoroStats = MutableStateFlow<StreakStats?>(null)
    val pomodoroStats: StateFlow<StreakStats?> = _pomodoroStats.asStateFlow()

    private val _habitsStats = MutableStateFlow<StreakStats?>(null)
    val habitsStats: StateFlow<StreakStats?> = _habitsStats.asStateFlow()

    private val _tasksStats = MutableStateFlow<StreakStats?>(null)
    val tasksStats: StateFlow<StreakStats?> = _tasksStats.asStateFlow()

    init {
        loadAllStats()
    }

    fun loadAllStats() {
        loadPomodoroStats()
        loadHabitsStats()
        loadTasksStats()
    }

    private fun loadPomodoroStats() {
        viewModelScope.launch {
            try {
                // Would call actual API endpoint here
                // For now, using placeholder
                _pomodoroStats.value = StreakStats(
                    currentStreak = 3,
                    weeklyGoal = 5,
                    progress = 60f,
                    isOnTrack = false,
                    bestStreak = 8,
                    totalSessions = 23,
                    lastWeekCount = 5
                )
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    private fun loadHabitsStats() {
        viewModelScope.launch {
            try {
                _habitsStats.value = StreakStats(
                    currentStreak = 2,
                    weeklyGoal = 5,
                    progress = 40f,
                    isOnTrack = false,
                    bestStreak = 5,
                    totalSessions = 12,
                    lastWeekCount = 4
                )
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    private fun loadTasksStats() {
        viewModelScope.launch {
            try {
                _tasksStats.value = StreakStats(
                    currentStreak = 7,
                    weeklyGoal = 10,
                    progress = 70f,
                    isOnTrack = false,
                    bestStreak = 15,
                    totalSessions = 45,
                    lastWeekCount = 8
                )
            } catch (e: Exception) {
                // Handle error
            }
        }
    }

    fun updateWeeklyGoal(type: StreakType, goal: Int) {
        viewModelScope.launch {
            try {
                api.updateStreakGoal(type.name.lowercase(), goal)
                loadAllStats()
            } catch (e: Exception) {
                // Handle error
            }
        }
    }
}
