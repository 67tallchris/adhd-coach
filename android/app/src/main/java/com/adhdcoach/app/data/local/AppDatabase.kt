package com.adhdcoach.app.data.local

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.adhdcoach.app.data.local.dao.*
import com.adhdcoach.app.data.local.entity.*

@Database(
    entities = [
        TaskEntity::class,
        PomodoroSessionEntity::class,
        NudgeEntity::class,
        HabitEntity::class,
        GoalEntity::class,
        DeviceEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class AppDatabase : RoomDatabase() {
    abstract fun taskDao(): TaskDao
    abstract fun pomodoroSessionDao(): PomodoroSessionDao
    abstract fun nudgeDao(): NudgeDao
    abstract fun habitDao(): HabitDao
    abstract fun goalDao(): GoalDao
    abstract fun deviceDao(): DeviceDao
}
