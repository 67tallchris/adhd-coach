package com.adhdcoach.app.data.repository

import com.adhdcoach.app.data.local.dao.PomodoroSessionDao
import com.adhdcoach.app.data.local.entity.PomodoroSessionEntity
import com.adhdcoach.app.data.model.PomodoroSession
import com.adhdcoach.app.data.model.PomodoroStats
import com.adhdcoach.app.data.model.StartPomodoroRequest
import com.adhdcoach.app.data.remote.ApiService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class PomodoroRepository(
    private val dao: PomodoroSessionDao,
    private val api: ApiService
) {

    val recentSessions: Flow<List<PomodoroSession>> = dao.getRecent(20).map { entities ->
        entities.map { it.toDomainModel() }
    }

    suspend fun syncSessions() = withContext(Dispatchers.IO) {
        try {
            val remoteSessions = api.getPomodoroSessions(limit = 50)
            val entities = remoteSessions.map { it.toEntity() }
            dao.insertAll(entities)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun startSession(
        taskId: String? = null,
        durationMin: Int = 25
    ): PomodoroSession = withContext(Dispatchers.IO) {
        val request = StartPomodoroRequest(taskId = taskId, durationMin = durationMin)
        val response = api.createPomodoroSession(request)
        dao.insert(response.toEntity())
        response
    }

    suspend fun completeSession(id: String, notes: String? = null) = withContext(Dispatchers.IO) {
        val completedAt = java.time.Instant.now().toString()
        val response = api.updatePomodoroSession(
            id,
            mapOf("completedAt" to completedAt, "notes" to notes).filterValues { it != null }
        )
        dao.insert(response.toEntity())
        response
    }

    suspend fun cancelSession(id: String) = withContext(Dispatchers.IO) {
        val response = api.updatePomodoroSession(id, mapOf())
        dao.insert(response.toEntity())
        response
    }

    suspend fun getStats(): PomodoroStats = withContext(Dispatchers.IO) {
        try {
            api.getPomodoroStats()
        } catch (e: Exception) {
            PomodoroStats(today = 0, week = 0, total = 0)
        }
    }
}

private fun PomodoroSession.toEntity(): PomodoroSessionEntity = PomodoroSessionEntity(
    id = id,
    taskId = taskId,
    durationMin = durationMin,
    completedAt = completedAt,
    notes = notes,
    startedAt = startedAt,
    endedAt = endedAt
)

private fun PomodoroSessionEntity.toDomainModel(): PomodoroSession = PomodoroSession(
    id = id,
    taskId = taskId,
    durationMin = durationMin,
    completedAt = completedAt,
    notes = notes,
    startedAt = startedAt,
    endedAt = endedAt
)
