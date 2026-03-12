package com.adhdcoach.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "habits")
data class HabitEntity(
    @PrimaryKey
    val id: String,
    val name: String,
    val frequency: String,
    val streak: Int = 0,
    val lastCompletedAt: String? = null,
    val createdAt: String,
    val lastSyncedAt: Long = System.currentTimeMillis()
)
