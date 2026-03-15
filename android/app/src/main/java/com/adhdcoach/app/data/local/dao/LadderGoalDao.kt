package com.adhdcoach.app.data.local.dao

import androidx.room.*
import com.adhdcoach.app.data.local.entity.LadderGoalEntity
import com.adhdcoach.app.data.local.entity.LadderStepEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface LadderGoalDao {

    @Query("SELECT * FROM ladder_goals ORDER BY createdAt DESC")
    fun getAll(): Flow<List<LadderGoalEntity>>

    @Query("SELECT * FROM ladder_goals WHERE status = :status ORDER BY createdAt DESC")
    fun getByStatus(status: String): Flow<List<LadderGoalEntity>>

    @Query("SELECT * FROM ladder_goals WHERE id = :id")
    suspend fun getById(id: String): LadderGoalEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(ladder: LadderGoalEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(ladders: List<LadderGoalEntity>)

    @Update
    suspend fun update(ladder: LadderGoalEntity)

    @Delete
    suspend fun delete(ladder: LadderGoalEntity)

    @Query("DELETE FROM ladder_goals WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("UPDATE ladder_goals SET lastSyncedAt = :timestamp WHERE id = :id")
    suspend fun updateSyncTimestamp(id: String, timestamp: Long)
}
