package com.adhdcoach.app.data.model

import kotlinx.serialization.SerialName
import kotlinx.serialization.Serializable

@Serializable
data class Task(
    val id: String,
    val title: String,
    val description: String? = null,
    val status: TaskStatus = TaskStatus.INBOX,
    val priority: Priority? = null,
    val dueDate: String? = null,
    val createdAt: String,
    val updatedAt: String
)

@Serializable
enum class TaskStatus {
    @SerialName("inbox")
    INBOX,
    @SerialName("in_progress")
    IN_PROGRESS,
    @SerialName("completed")
    COMPLETED
}

@Serializable
enum class Priority {
    @SerialName("low")
    LOW,
    @SerialName("medium")
    MEDIUM,
    @SerialName("high")
    HIGH
}
