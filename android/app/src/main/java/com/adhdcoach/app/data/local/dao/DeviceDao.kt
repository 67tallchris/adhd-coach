package com.adhdcoach.app.data.local.dao

import androidx.room.*
import com.adhdcoach.app.data.local.entity.DeviceEntity

@Dao
interface DeviceDao {

    @Query("SELECT * FROM devices ORDER BY registeredAt DESC LIMIT 1")
    suspend fun getLatest(): DeviceEntity?

    @Query("SELECT * FROM devices WHERE id = :id")
    suspend fun getById(id: String): DeviceEntity?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(device: DeviceEntity)

    @Delete
    suspend fun delete(device: DeviceEntity)

    @Query("DELETE FROM devices WHERE id = :id")
    suspend fun deleteById(id: String)
}
