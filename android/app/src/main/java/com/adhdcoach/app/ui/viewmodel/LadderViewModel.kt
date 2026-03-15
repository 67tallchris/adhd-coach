package com.adhdcoach.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.adhdcoach.app.data.local.AppDatabase
import com.adhdcoach.app.data.local.DatabaseProvider
import com.adhdcoach.app.data.model.*
import com.adhdcoach.app.data.remote.ApiClient
import com.adhdcoach.app.data.repository.LadderRepository
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch

class LadderViewModel(application: Application) : AndroidViewModel(application) {

    private val database = DatabaseProvider.getInstance(application)
    private val api = ApiClient.apiService

    private val ladderRepo = LadderRepository(
        ladderGoalDao = database.ladderGoalDao(),
        ladderStepDao = database.ladderStepDao(),
        api = api
    )

    // State flows
    val allLadders: StateFlow<List<LadderGoal>> = ladderRepo.allLadders
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun getLaddersByStatus(status: LadderStatus): StateFlow<List<LadderGoal>> {
        return ladderRepo.getLaddersByStatus(status)
            .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
    }

    fun syncLadders() {
        viewModelScope.launch {
            ladderRepo.syncLadders()
        }
    }

    fun createLadder(
        title: String,
        description: String? = null,
        taskId: String? = null,
        goalId: String? = null,
        steps: List<CreateLadderStepRequest>? = null
    ) {
        viewModelScope.launch {
            ladderRepo.createLadder(title, description, taskId, goalId, steps)
        }
    }

    fun updateLadderStatus(id: String, status: LadderStatus) {
        viewModelScope.launch {
            ladderRepo.updateLadderStatus(id, status)
        }
    }

    fun deleteLadder(id: String) {
        viewModelScope.launch {
            ladderRepo.deleteLadder(id)
        }
    }

    fun addStep(
        ladderId: String,
        stepNumber: Int,
        title: String,
        notes: String? = null
    ) {
        viewModelScope.launch {
            ladderRepo.addStep(ladderId, stepNumber, title, notes)
        }
    }

    fun toggleStepCompletion(ladderId: String, stepId: String, isCompleted: Boolean) {
        viewModelScope.launch {
            ladderRepo.updateStepCompletion(ladderId, stepId, !isCompleted)
        }
    }

    fun deleteStep(ladderId: String, stepId: String) {
        viewModelScope.launch {
            ladderRepo.deleteStep(ladderId, stepId)
        }
    }
}
