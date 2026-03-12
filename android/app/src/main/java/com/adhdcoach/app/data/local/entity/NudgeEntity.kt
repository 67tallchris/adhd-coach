package com.adhdcoach.app.data.local.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "nudges")
data class NudgeEntity(
    @PrimaryKey
    val id: String,
    val content: String,
    val type: String,
    val createdAt: String,
    val isRead: Boolean = false,
    val lastSyncedAt: Long = System.currentTimeMillis()
)
