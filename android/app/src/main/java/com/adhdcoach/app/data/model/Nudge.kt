package com.adhdcoach.app.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Nudge(
    val id: String,
    val content: String,
    val type: NudgeType,
    val createdAt: String
)

@Serializable
enum class NudgeType {
    motivation,
    focus,
    break_reminder,
    task_prompt,
    reflection
}
