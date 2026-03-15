package com.adhdcoach.app.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class LadderGoal(
    val id: String,
    val title: String,
    val description: String? = null,
    val taskId: String? = null,
    val goalId: String? = null,
    val status: LadderStatus = LadderStatus.ACTIVE,
    val createdAt: String,
    val updatedAt: String,
    val completedAt: String? = null,
    val steps: List<LadderStep> = emptyList()
)

@Serializable
enum class LadderStatus {
    @SerialName("active")
    ACTIVE,
    @SerialName("completed")
    COMPLETED,
    @SerialName("archived")
    ARCHIVED
}

@Serializable
data class LadderStep(
    val id: String,
    val ladderId: String,
    val stepNumber: Int,
    val title: String,
    val notes: String? = null,
    val isCompleted: Boolean = false,
    val completedAt: String? = null,
    val createdAt: String
)

@Serializable
data class CreateLadderRequest(
    val title: String,
    val description: String? = null,
    val taskId: String? = null,
    val goalId: String? = null,
    val steps: List<CreateLadderStepRequest>? = null
)

@Serializable
data class CreateLadderStepRequest(
    val stepNumber: Int,
    val title: String,
    val notes: String? = null
)

@Serializable
data class UpdateLadderRequest(
    val title: String? = null,
    val description: String? = null,
    val status: LadderStatus? = null,
    val taskId: String? = null,
    val goalId: String? = null
)

@Serializable
data class AddLadderStepRequest(
    val stepNumber: Int,
    val title: String,
    val notes: String? = null
)

@Serializable
data class UpdateLadderStepRequest(
    val stepNumber: Int? = null,
    val title: String? = null,
    val notes: String? = null,
    val isCompleted: Boolean? = null
)
