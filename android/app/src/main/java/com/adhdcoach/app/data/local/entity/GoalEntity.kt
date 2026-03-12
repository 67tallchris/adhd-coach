package com.adhdcoach.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "goals")
data class GoalEntity(
    @PrimaryKey
    val id: String,
    val title: String,
    val description: String? = null,
    val targetDate: String? = null,
    val progress: Int = 0,
    val status: String = "active",
    val createdAt: String,
    val lastSyncedAt: Long = System.currentTimeMillis()
)
