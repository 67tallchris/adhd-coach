package com.adhdcoach.app.data.repository

import com.adhdcoach.app.data.remote.ApiService
import com.adhdcoach.app.data.remote.BodyDoublingCheckInResponse
import com.adhdcoach.app.data.remote.BodyDoublingCount
import com.adhdcoach.app.data.remote.BodyDoublingPeers
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext

class BodyDoublingRepository(
    private val api: ApiService
) {
    suspend fun checkIn(taskType: String = "work"): BodyDoublingCheckInResponse =
        withContext(Dispatchers.IO) {
            api.bodyDoublingCheckIn(
                com.adhdcoach.app.data.remote.BodyDoublingCheckInRequest(taskType = taskType)
            )
        }

    suspend fun checkOut(sessionId: String) = withContext(Dispatchers.IO) {
        api.bodyDoublingCheckOut(sessionId)
    }

    suspend fun getCount(): BodyDoublingCount = withContext(Dispatchers.IO) {
        api.getBodyDoublingCount()
    }

    suspend fun getPeers(): BodyDoublingPeers = withContext(Dispatchers.IO) {
        api.getBodyDoublingPeers()
    }

    suspend fun heartbeat(sessionId: String, taskType: String = "work") =
        withContext(Dispatchers.IO) {
            api.bodyDoublingHeartbeat(
                sessionId,
                com.adhdcoach.app.data.remote.BodyDoublingHeartbeatRequest(taskType = taskType)
            )
        }
}
