package com.adhdcoach.app.data.repository

import com.adhdcoach.app.data.local.dao.TaskDao
import com.adhdcoach.app.data.local.entity.TaskEntity
import com.adhdcoach.app.data.model.Task
import com.adhdcoach.app.data.model.TaskStatus
import com.adhdcoach.app.data.remote.ApiService
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.flow.map
import kotlinx.coroutines.withContext

class TaskRepository(
    private val dao: TaskDao,
    private val api: ApiService
) {

    val allTasks: Flow<List<Task>> = dao.getAll().map { entities ->
        entities.map { it.toDomainModel() }
    }

    fun getTasksByStatus(status: TaskStatus): Flow<List<Task>> {
        return dao.getByStatus(status.name.lowercase()).map { entities ->
            entities.map { it.toDomainModel() }
        }
    }

    suspend fun syncTasks() = withContext(Dispatchers.IO) {
        try {
            val remoteTasks = api.getTasks(limit = 100)
            val entities = remoteTasks.map { it.toEntity() }
            dao.insertAll(entities)
        } catch (e: Exception) {
            // Handle sync error - use cached data
            e.printStackTrace()
        }
    }

    suspend fun createTask(
        title: String,
        description: String? = null,
        priority: String? = null,
        dueDate: String? = null
    ): Task = withContext(Dispatchers.IO) {
        val response = api.createTask(
            mapOf(
                "title" to title,
                "description" to description,
                "priority" to priority,
                "dueDate" to dueDate
            ).filterValues { it != null }
        )
        dao.insert(response.toEntity())
        response
    }

    suspend fun updateTaskStatus(id: String, status: TaskStatus) = withContext(Dispatchers.IO) {
        val response = api.updateTask(id, mapOf("status" to status.name.lowercase()))
        dao.insert(response.toEntity())
        response
    }

    suspend fun deleteTask(id: String) = withContext(Dispatchers.IO) {
        api.deleteTask(id)
        dao.deleteById(id)
    }
}

// Extension functions for mapping between layers
private fun Task.toEntity(): TaskEntity = TaskEntity(
    id = id,
    title = title,
    description = description,
    status = status.name.lowercase(),
    priority = priority?.name?.lowercase(),
    dueDate = dueDate,
    createdAt = createdAt,
    updatedAt = updatedAt
)

private fun TaskEntity.toDomainModel(): Task = Task(
    id = id,
    title = title,
    description = description,
    status = TaskStatus.valueOf(status.uppercase()),
    priority = priority?.let { Priority.valueOf(it.uppercase()) },
    dueDate = dueDate,
    createdAt = createdAt,
    updatedAt = updatedAt
)
