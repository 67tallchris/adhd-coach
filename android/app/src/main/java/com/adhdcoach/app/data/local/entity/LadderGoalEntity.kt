package com.adhdcoach.app.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "ladder_goals",
    indices = [
        Index(value = ["status"]),
        Index(value = ["taskId"]),
        Index(value = ["goalId"])
    ]
)
data class LadderGoalEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val description: String? = null,
    val taskId: String? = null,
    val goalId: String? = null,
    val status: String = "active",
    val createdAt: String,
    val updatedAt: String,
    val completedAt: String? = null,
    val lastSyncedAt: Long = System.currentTimeMillis()
)
