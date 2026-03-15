package com.adhdcoach.app.data.local.entity

import androidx.room.Entity
import androidx.room.ForeignKey
import androidx.room.Index
import androidx.room.PrimaryKey

@Entity(
    tableName = "ladder_steps",
    foreignKeys = [
        ForeignKey(
            entity = LadderGoalEntity::class,
            parentColumns = ["id"],
            childColumns = ["ladderId"],
            onDelete = ForeignKey.CASCADE
        )
    ],
    indices = [
        Index(value = ["ladderId"]),
        Index(value = ["stepNumber"]),
        Index(value = ["isCompleted"])
    ]
)
data class LadderStepEntity(
    @PrimaryKey
    val id: String,
    val ladderId: String,
    val stepNumber: Int,
    val title: String,
    val notes: String? = null,
    val isCompleted: Boolean = false,
    val completedAt: String? = null,
    val createdAt: String,
    val lastSyncedAt: Long = System.currentTimeMillis()
)
