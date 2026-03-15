package com.adhdcoach.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.adhdcoach.app.data.model.DistractionLog
import com.adhdcoach.app.data.model.DistractionInsights
import com.adhdcoach.app.data.remote.ApiService
import com.adhdcoach.app.data.remote.LogDistractionRequest
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class DistractionState(
    val isModalOpen: Boolean = false,
    val selectedType: String? = null,
    val selectedAction: String? = null,
    val notes: String = "",
    val insights: DistractionInsights? = null,
    val isLoading: Boolean = false
)

class DistractionViewModel(
    application: Application,
    private val api: ApiService
) : AndroidViewModel(application) {

    private val _state = MutableStateFlow(DistractionState())
    val state: StateFlow<DistractionState> = _state.asStateFlow()

    fun openModal() {
        _state.value = _state.value.copy(
            isModalOpen = true,
            selectedType = null,
            selectedAction = null,
            notes = ""
        )
    }

    fun closeModal() {
        _state.value = _state.value.copy(isModalOpen = false)
    }

    fun selectType(typeId: String) {
        _state.value = _state.value.copy(selectedType = typeId)
    }

    fun selectAction(actionId: String) {
        _state.value = _state.value.copy(selectedAction = actionId)
    }

    fun setNotes(notes: String) {
        _state.value = _state.value.copy(notes = notes)
    }

    fun logDistraction(
        sessionId: String,
        timeElapsed: Int,
        onComplete: (String) -> Unit
    ) {
        val typeId = _state.value.selectedType ?: return
        val actionId = _state.value.selectedAction ?: return

        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true)
            try {
                val request = LogDistractionRequest(
                    sessionId = sessionId,
                    distractionType = typeId,
                    notes = _state.value.notes.ifBlank { null },
                    action = actionId,
                    timeElapsed = timeElapsed
                )
                api.logDistraction(request)
                _state.value = _state.value.copy(isLoading = false, isModalOpen = false)
                onComplete(actionId)
                loadInsights()
            } catch (e: Exception) {
                _state.value = _state.value.copy(isLoading = false)
            }
        }
    }

    fun loadInsights() {
        viewModelScope.launch {
            try {
                val insights = api.getDistractionInsights(100)
                _state.value = _state.value.copy(insights = insights)
            } catch (e: Exception) {
                // Ignore errors
            }
        }
    }
}
