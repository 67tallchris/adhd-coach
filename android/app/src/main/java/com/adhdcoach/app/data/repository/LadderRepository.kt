package com.adhdcoach.app.data.repository

import com.adhdcoach.app.data.local.dao.LadderGoalDao
import com.adhdcoach.app.data.local.dao.LadderStepDao
import com.adhdcoach.app.data.local.entity.LadderGoalEntity
import com.adhdcoach.app.data.local.entity.LadderStepEntity
import com.adhdcoach.app.data.model.*
import com.adhdcoach.app.data.remote.ApiService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class LadderRepository(
    private val ladderGoalDao: LadderGoalDao,
    private val ladderStepDao: LadderStepDao,
    private val api: ApiService
) {

    val allLadders: Flow<List<LadderGoal>> = ladderGoalDao.getAll().map { entities ->
        entities.map { it.toDomainModel() }
    }

    fun getLaddersByStatus(status: LadderStatus): Flow<List<LadderGoal>> {
        return ladderGoalDao.getByStatus(status.name.lowercase()).map { entities ->
            entities.map { it.toDomainModel() }
        }
    }

    suspend fun getLadderWithSteps(id: String): LadderGoal? = withContext(Dispatchers.IO) {
        val entity = ladderGoalDao.getById(id)
        entity?.let {
            val steps = ladderStepDao.getByLadderIdSync(id)
            it.toDomainModel(steps.map { s -> s.toDomainModel() })
        }
    }

    suspend fun syncLadders() = withContext(Dispatchers.IO) {
        try {
            val remoteLadders = api.getLadders()
            remoteLadders.forEach { ladder ->
                ladderGoalDao.insert(ladder.toEntity())
                ladder.steps.forEach { step ->
                    ladderStepDao.insert(step.toEntity())
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    suspend fun createLadder(
        title: String,
        description: String? = null,
        taskId: String? = null,
        goalId: String? = null,
        steps: List<CreateLadderStepRequest>? = null
    ): LadderGoal = withContext(Dispatchers.IO) {
        val request = CreateLadderRequest(
            title = title,
            description = description,
            taskId = taskId,
            goalId = goalId,
            steps = steps
        )
        val response = api.createLadder(request)
        ladderGoalDao.insert(response.toEntity())
        response.steps.forEach { step ->
            ladderStepDao.insert(step.toEntity())
        }
        response
    }

    suspend fun updateLadderStatus(id: String, status: LadderStatus) = withContext(Dispatchers.IO) {
        val response = api.updateLadder(id, UpdateLadderRequest(status = status))
        ladderGoalDao.insert(response.toEntity())
        response
    }

    suspend fun deleteLadder(id: String) = withContext(Dispatchers.IO) {
        api.deleteLadder(id)
        ladderGoalDao.deleteById(id)
        ladderStepDao.deleteByLadderId(id)
    }

    suspend fun addStep(
        ladderId: String,
        stepNumber: Int,
        title: String,
        notes: String? = null
    ): LadderStep = withContext(Dispatchers.IO) {
        val request = AddLadderStepRequest(
            stepNumber = stepNumber,
            title = title,
            notes = notes
        )
        val response = api.addLadderStep(ladderId, request)
        ladderStepDao.insert(response.toEntity())
        response
    }

    suspend fun updateStepCompletion(
        ladderId: String,
        stepId: String,
        isCompleted: Boolean
    ): LadderStep = withContext(Dispatchers.IO) {
        val response = api.updateLadderStep(
            ladderId = ladderId,
            stepId = stepId,
            updates = UpdateLadderStepRequest(isCompleted = isCompleted)
        )
        ladderStepDao.insert(response.toEntity())
        response
    }

    suspend fun deleteStep(ladderId: String, stepId: String) = withContext(Dispatchers.IO) {
        api.deleteLadderStep(ladderId, stepId)
        ladderStepDao.deleteById(stepId)
    }
}

// Extension functions for mapping between layers
private fun LadderGoal.toEntity(): LadderGoalEntity = LadderGoalEntity(
    id = id,
    title = title,
    description = description,
    taskId = taskId,
    goalId = goalId,
    status = status.name.lowercase(),
    createdAt = createdAt,
    updatedAt = updatedAt,
    completedAt = completedAt
)

private fun LadderGoalEntity.toDomainModel(steps: List<LadderStep> = emptyList()): LadderGoal = LadderGoal(
    id = id,
    title = title,
    description = description,
    taskId = taskId,
    goalId = goalId,
    status = LadderStatus.valueOf(status.uppercase()),
    createdAt = createdAt,
    updatedAt = updatedAt,
    completedAt = completedAt,
    steps = steps
)

private fun LadderStep.toEntity(): LadderStepEntity = LadderStepEntity(
    id = id,
    ladderId = ladderId,
    stepNumber = stepNumber,
    title = title,
    notes = notes,
    isCompleted = isCompleted,
    completedAt = completedAt,
    createdAt = createdAt
)

private fun LadderStepEntity.toDomainModel(): LadderStep = LadderStep(
    id = id,
    ladderId = ladderId,
    stepNumber = stepNumber,
    title = title,
    notes = notes,
    isCompleted = isCompleted,
    completedAt = completedAt,
    createdAt = createdAt
)
