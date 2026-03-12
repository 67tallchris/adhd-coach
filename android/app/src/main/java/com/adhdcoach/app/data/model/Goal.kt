package com.adhdcoach.app.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Goal(
    val id: String,
    val title: String,
    val description: String? = null,
    val targetDate: String? = null,
    val progress: Int = 0,
    val status: GoalStatus = GoalStatus.ACTIVE,
    val createdAt: String
)

@Serializable
enum class GoalStatus {
    active,
    completed,
    archived
}
