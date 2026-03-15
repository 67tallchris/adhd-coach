package com.adhdcoach.app.ui.viewmodel

import android.app.Application
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.adhdcoach.app.data.remote.BodyDoublingCheckInResponse
import com.adhdcoach.app.data.remote.BodyDoublingCount
import com.adhdcoach.app.data.remote.BodyDoublingMessage
import com.adhdcoach.app.data.remote.BodyDoublingPeers
import com.adhdcoach.app.data.repository.BodyDoublingRepository
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch

data class BodyDoublingState(
    val isEnabled: Boolean = false,
    val sessionId: String? = null,
    val taskType: BodyDoublingTaskType = BodyDoublingTaskType.WORK,
    val totalCount: Int = 0,
    val workingCount: Int = 0,
    val onBreakCount: Int = 0,
    val messages: List<BodyDoublingMessage> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null
)

enum class BodyDoublingTaskType {
    WORK,
    BREAK
}

class BodyDoublingViewModel(
    application: Application,
    private val repository: BodyDoublingRepository
) : AndroidViewModel(application) {

    private val _state = MutableStateFlow(BodyDoublingState())
    val state: StateFlow<BodyDoublingState> = _state.asStateFlow()

    private var heartbeatJob: Job? = null
    private var countRefreshJob: Job? = null

    private companion object {
        const val HEARTBEAT_INTERVAL_MS = 30_000L // 30 seconds
        const val COUNT_REFRESH_INTERVAL_MS = 10_000L // 10 seconds
    }

    fun toggleEnabled() {
        if (_state.value.isEnabled) {
            disable()
        } else {
            enable()
        }
    }

    private fun enable() {
        viewModelScope.launch {
            _state.value = _state.value.copy(isLoading = true, error = null)
            try {
                val response = repository.checkIn(_state.value.taskType.name.lowercase())
                _state.value = _state.value.copy(
                    isEnabled = true,
                    sessionId = response.sessionId,
                    taskType = response.taskType.toTaskType(),
                    isLoading = false
                )
                startHeartbeat()
                startCountRefresh()
                refreshCount()
                refreshPeers()
            } catch (e: Exception) {
                _state.value = _state.value.copy(
                    isLoading = false,
                    error = "Failed to join session: ${e.message}"
                )
            }
        }
    }

    private fun disable() {
        viewModelScope.launch {
            val sessionId = _state.value.sessionId
            if (sessionId != null) {
                try {
                    repository.checkOut(sessionId)
                } catch (e: Exception) {
                    // Ignore errors on checkout
                }
            }
            stopHeartbeat()
            stopCountRefresh()
            _state.value = _state.value.copy(
                isEnabled = false,
                sessionId = null,
                totalCount = 0,
                workingCount = 0,
                onBreakCount = 0,
                messages = emptyList()
            )
        }
    }

    fun setTaskType(taskType: BodyDoublingTaskType) {
        viewModelScope.launch {
            val sessionId = _state.value.sessionId
            if (sessionId != null) {
                try {
                    repository.heartbeat(sessionId, taskType.name.lowercase())
                } catch (e: Exception) {
                    // Ignore errors
                }
            }
            _state.value = _state.value.copy(taskType = taskType)
            refreshCount()
        }
    }

    private fun startHeartbeat() {
        heartbeatJob?.cancel()
        heartbeatJob = viewModelScope.launch {
            while (true) {
                delay(HEARTBEAT_INTERVAL_MS)
                val sessionId = _state.value.sessionId
                if (sessionId != null) {
                    try {
                        repository.heartbeat(sessionId, _state.value.taskType.name.lowercase())
                    } catch (e: Exception) {
                        // Ignore heartbeat errors
                    }
                }
            }
        }
    }

    private fun stopHeartbeat() {
        heartbeatJob?.cancel()
        heartbeatJob = null
    }

    private fun startCountRefresh() {
        countRefreshJob?.cancel()
        countRefreshJob = viewModelScope.launch {
            while (true) {
                delay(COUNT_REFRESH_INTERVAL_MS)
                refreshCount()
                refreshPeers()
            }
        }
    }

    private fun stopCountRefresh() {
        countRefreshJob?.cancel()
        countRefreshJob = null
    }

    private fun refreshCount() {
        viewModelScope.launch {
            try {
                val count = repository.getCount()
                _state.value = _state.value.copy(
                    totalCount = count.total,
                    workingCount = count.working,
                    onBreakCount = count.onBreak
                )
            } catch (e: Exception) {
                // Ignore count refresh errors
            }
        }
    }

    private fun refreshPeers() {
        viewModelScope.launch {
            try {
                val peers = repository.getPeers()
                _state.value = _state.value.copy(messages = peers.messages)
            } catch (e: Exception) {
                // Ignore peers refresh errors
            }
        }
    }

    override fun onCleared() {
        super.onCleared()
        stopHeartbeat()
        stopCountRefresh()
        // Auto-checkout when ViewModel is cleared
        disable()
    }
}

private fun String.toTaskType(): BodyDoublingTaskType {
    return when (this.lowercase()) {
        "break" -> BodyDoublingTaskType.BREAK
        else -> BodyDoublingTaskType.WORK
    }
}
