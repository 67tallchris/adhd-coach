package com.adhdcoach.app.data.local.dao

import androidx.room.*
import com.adhdcoach.app.data.local.entity.NudgeEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface NudgeDao {

    @Query("SELECT * FROM nudges ORDER BY createdAt DESC LIMIT :limit")
    fun getRecent(limit: Int = 50): Flow<List<NudgeEntity>>

    @Query("SELECT * FROM nudges WHERE isRead = 0 ORDER BY createdAt DESC")
    fun getUnread(): Flow<List<NudgeEntity>>

    @Query("SELECT * FROM nudges WHERE id = :id")
    suspend fun getById(id: String): NudgeEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(nudge: NudgeEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(nudges: List<NudgeEntity>)

    @Update
    suspend fun update(nudge: NudgeEntity)

    @Query("UPDATE nudges SET isRead = 1 WHERE id = :id")
    suspend fun markAsRead(id: String)

    @Delete
    suspend fun delete(nudge: NudgeEntity)
}
