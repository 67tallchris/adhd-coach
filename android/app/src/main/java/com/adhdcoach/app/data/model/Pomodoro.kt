package com.adhdcoach.app.data.model

import kotlinx.serialization.Serializable

@Serializable
data class PomodoroSession(
    val id: String,
    val taskId: String? = null,
    val durationMin: Int,
    val completedAt: String? = null,
    val notes: String? = null,
    val startedAt: String,
    val endedAt: String? = null
)

@Serializable
data class PomodoroStats(
    val today: Int,
    val week: Int,
    val total: Int
)

@Serializable
data class StartPomodoroRequest(
    val taskId: String? = null,
    val durationMin: Int = 25
)
