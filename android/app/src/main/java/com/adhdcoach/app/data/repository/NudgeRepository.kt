package com.adhdcoach.app.data.repository

import com.adhdcoach.app.data.local.dao.NudgeDao
import com.adhdcoach.app.data.local.entity.NudgeEntity
import com.adhdcoach.app.data.model.Nudge
import com.adhdcoach.app.data.remote.ApiService
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class NudgeRepository(
    private val dao: NudgeDao,
    private val api: ApiService
) {

    val recentNudges: Flow<List<Nudge>> = dao.getRecent(50).map { entities ->
        entities.map { it.toDomainModel() }
    }

    val unreadNudges: Flow<List<Nudge>> = dao.getUnread().map { entities ->
        entities.map { it.toDomainModel() }
    }

    suspend fun syncNudges() = withContext(Dispatchers.IO) {
        try {
            val remoteNudges = api.getNudges(limit = 50)
            val entities = remoteNudges.map { it.toEntity() }
            dao.insertAll(entities)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun generateNudge(model: String = "qwen"): Nudge = withContext(Dispatchers.IO) {
        val response = api.generateNudge(mapOf("model" to model))
        dao.insert(response.toEntity())
        response
    }

    suspend fun markAsRead(id: String) = withContext(Dispatchers.IO) {
        dao.markAsRead(id)
    }
}

private fun Nudge.toEntity(): NudgeEntity = NudgeEntity(
    id = id,
    content = content,
    type = type.name,
    createdAt = createdAt,
    isRead = false
)

private fun NudgeEntity.toDomainModel(): Nudge = Nudge(
    id = id,
    content = content,
    type = com.adhdcoach.app.data.model.NudgeType.valueOf(type.lowercase().replace("-", "_")),
    createdAt = createdAt
)
