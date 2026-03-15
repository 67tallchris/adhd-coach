package com.adhdcoach.app.data.local.dao

import androidx.room.*
import com.adhdcoach.app.data.local.entity.LadderStepEntity
import kotlinx.coroutines.flow.Flow

@Dao
interface LadderStepDao {

    @Query("SELECT * FROM ladder_steps WHERE ladderId = :ladderId ORDER BY stepNumber ASC")
    fun getByLadderId(ladderId: String): Flow<List<LadderStepEntity>>

    @Query("SELECT * FROM ladder_steps WHERE ladderId = :ladderId ORDER BY stepNumber ASC")
    suspend fun getByLadderIdSync(ladderId: String): List<LadderStepEntity>

    @Query("SELECT * FROM ladder_steps WHERE id = :id")
    suspend fun getById(id: String): LadderStepEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(step: LadderStepEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(steps: List<LadderStepEntity>)

    @Update
    suspend fun update(step: LadderStepEntity)

    @Delete
    suspend fun delete(step: LadderStepEntity)

    @Query("DELETE FROM ladder_steps WHERE id = :id")
    suspend fun deleteById(id: String)

    @Query("DELETE FROM ladder_steps WHERE ladderId = :ladderId")
    suspend fun deleteByLadderId(ladderId: String)

    @Query("UPDATE ladder_steps SET lastSyncedAt = :timestamp WHERE id = :id")
    suspend fun updateSyncTimestamp(id: String, timestamp: Long)
}
