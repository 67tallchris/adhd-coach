package com.adhdcoach.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "pomodoro_sessions")
data class PomodoroSessionEntity(
    @PrimaryKey
    val id: String,
    val taskId: String? = null,
    val durationMin: Int,
    val completedAt: String? = null,
    val notes: String? = null,
    val startedAt: String,
    val endedAt: String? = null,
    val lastSyncedAt: Long = System.currentTimeMillis()
)
