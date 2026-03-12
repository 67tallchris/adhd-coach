package com.adhdcoach.app.data.repository

import com.adhdcoach.app.data.local.dao.DeviceDao
import com.adhdcoach.app.data.local.entity.DeviceEntity
import com.adhdcoach.app.data.remote.ApiService
import com.adhdcoach.app.data.remote.DeviceRegistrationRequest
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class DeviceRepository(
    private val dao: DeviceDao,
    private val api: ApiService
) {

    suspend fun registerDevice(token: String, userId: String? = null): String? =
        withContext(Dispatchers.IO) {
            try {
                // Register with backend
                val response = api.registerDevice(
                    DeviceRegistrationRequest(token = token, platform = "android", userId = userId)
                )

                // Save locally
                dao.insert(
                    DeviceEntity(
                        id = response.deviceId,
                        token = token,
                        platform = "android",
                        registeredAt = System.currentTimeMillis()
                    )
                )

                response.deviceId
            } catch (e: Exception) {
                e.printStackTrace()
                null
            }
        }

    suspend fun unregisterDevice(deviceId: String) = withContext(Dispatchers.IO) {
        try {
            api.unregisterDevice(deviceId)
            dao.deleteById(deviceId)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun getRegisteredDeviceId(): String? = withContext(Dispatchers.IO) {
        dao.getLatest()?.id
    }
}
