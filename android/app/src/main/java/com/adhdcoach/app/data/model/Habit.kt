package com.adhdcoach.app.data.model

import kotlinx.serialization.Serializable

@Serializable
data class Habit(
    val id: String,
    val name: String,
    val frequency: HabitFrequency,
    val streak: Int = 0,
    val lastCompletedAt: String? = null,
    val createdAt: String
)

@Serializable
enum class HabitFrequency {
    daily,
    weekly,
    custom
}

@Serializable
data class HabitCompletion(
    val id: String,
    val habitId: String,
    val completedAt: String
)
