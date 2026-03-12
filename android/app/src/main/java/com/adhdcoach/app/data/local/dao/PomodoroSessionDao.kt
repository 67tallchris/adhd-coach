package com.adhdcoach.app.data.local.dao

import androidx.room.*
import com.adhdcoach.app.data.local.entity.PomodoroSessionEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface PomodoroSessionDao {

    @Query("SELECT * FROM pomodoro_sessions ORDER BY startedAt DESC LIMIT :limit")
    fun getRecent(limit: Int = 20): Flow<List<PomodoroSessionEntity>>

    @Query("SELECT * FROM pomodoro_sessions WHERE id = :id")
    suspend fun getById(id: String): PomodoroSessionEntity?

    @Query("SELECT * FROM pomodoro_sessions WHERE completedAt IS NOT NULL AND date(completedAt) = date(:date)")
    suspend fun getTodayCount(date: String): Int

    @Query("SELECT COUNT(*) FROM pomodoro_sessions WHERE completedAt IS NOT NULL")
    suspend fun getTotalCount(): Int

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(session: PomodoroSessionEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(sessions: List<PomodoroSessionEntity>)

    @Update
    suspend fun update(session: PomodoroSessionEntity)

    @Delete
    suspend fun delete(session: PomodoroSessionEntity)
}
