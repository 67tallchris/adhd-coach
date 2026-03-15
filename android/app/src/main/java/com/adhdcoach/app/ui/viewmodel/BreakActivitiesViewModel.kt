package com.adhdcoach.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.adhdcoach.app.data.model.BREAK_ACTIVITIES
import com.adhdcoach.app.data.model.BreakActivity
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import kotlinx.coroutines.flow.update

data class BreakActivitiesState(
    val currentSuggestion: BreakActivity? = null,
    val preferredCategories: List<String> = emptyList(),
    val energyPreference: String? = null,
    val completedActivities: List<String> = emptyList(),
    val suggestionHistory: List<String> = emptyList(),
    val isComplete: Boolean = false
)

class BreakActivitiesViewModel(application: Application) : AndroidViewModel(application) {

    private val _state = MutableStateFlow(BreakActivitiesState())
    val state: StateFlow<BreakActivitiesState> = _state.asStateFlow()

    private companion object {
        const val MAX_HISTORY = 20
        const val RECENT_EXCLUDE_COUNT = 5
    }

    fun getSuggestion(durationMinutes: Int) {
        val currentState = _state.value
        val durationBucket = getDurationBucket(durationMinutes)

        val activities = filterActivities(
            duration = durationBucket,
            preferredCategories = currentState.preferredCategories,
            completedActivities = currentState.completedActivities,
            energyPreference = currentState.energyPreference,
            excludeIds = currentState.suggestionHistory.takeLast(RECENT_EXCLUDE_COUNT)
        )

        val activity = activities.randomOrNull() ?: BREAK_ACTIVITIES.first()

        _state.update {
            it.copy(
                currentSuggestion = activity,
                isComplete = false
            )
        }
    }

    fun refreshSuggestion(durationMinutes: Int) {
        getSuggestion(durationMinutes)
    }

    fun markCompleted() {
        val activity = _state.value.currentSuggestion ?: return
        _state.update {
            it.copy(
                completedActivities = (it.completedActivities + activity.id).takeLast(50),
                isComplete = true
            )
        }
    }

    fun setPreferredCategories(categories: List<String>) {
        _state.update { it.copy(preferredCategories = categories) }
    }

    fun toggleCategory(category: String) {
        _state.update {
            val newCategories = if (category in it.preferredCategories) {
                it.preferredCategories - category
            } else {
                it.preferredCategories + category
            }
            it.copy(preferredCategories = newCategories)
        }
    }

    fun setEnergyPreference(energy: String?) {
        _state.update { it.copy(energyPreference = energy) }
    }

    fun resetPreferences() {
        _state.update {
            it.copy(
                preferredCategories = emptyList(),
                energyPreference = null,
                completedActivities = emptyList(),
                suggestionHistory = emptyList()
            )
        }
    }

    private fun getDurationBucket(minutes: Int): Int {
        return when {
            minutes < 3 -> 1
            minutes < 8 -> 5
            minutes < 13 -> 10
            else -> 15
        }
    }

    private fun filterActivities(
        duration: Int,
        preferredCategories: List<String>,
        completedActivities: List<String>,
        energyPreference: String?,
        excludeIds: List<String>
    ): List<BreakActivity> {
        var filtered = BREAK_ACTIVITIES.filter { it.duration == duration }

        // Exclude recently shown activities
        if (excludeIds.isNotEmpty()) {
            filtered = filtered.filter { it.id !in excludeIds }
        }

        // Filter by preferred categories if set
        if (preferredCategories.isNotEmpty() && "all" !in preferredCategories) {
            val preferred = filtered.filter { it.category in preferredCategories }
            if (preferred.isNotEmpty()) {
                filtered = preferred
            }
        }

        // Filter by energy preference if set
        if (energyPreference != null) {
            val matching = filtered.filter { it.energyLevel == energyPreference }
            if (matching.isNotEmpty()) {
                filtered = matching
            }
        }

        // Prioritize not-yet-completed activities
        val notCompleted = filtered.filter { it.id !in completedActivities }

        return if (notCompleted.isNotEmpty()) notCompleted else filtered
    }

    override fun onCleared() {
        super.onCleared()
        // Save state if needed
    }
}
