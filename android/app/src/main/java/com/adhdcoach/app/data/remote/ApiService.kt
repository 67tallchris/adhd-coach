package com.adhdcoach.app.data.remote

import com.adhdcoach.app.data.model.*
import retrofit2.http.*

interface ApiService {

    // Tasks
    @GET("/api/tasks")
    suspend fun getTasks(
        @Query("status") status: String? = null,
        @Query("limit") limit: Int = 50
    ): List<Task>

    @GET("/api/tasks/{id}")
    suspend fun getTask(@Path("id") id: String): Task

    @POST("/api/tasks")
    suspend fun createTask(@Body task: Map<String, Any?>): Task

    @PATCH("/api/tasks/{id}")
    suspend fun updateTask(
        @Path("id") id: String,
        @Body updates: Map<String, Any?>
    ): Task

    @DELETE("/api/tasks/{id}")
    suspend fun deleteTask(@Path("id") id: String)

    // Pomodoro Sessions
    @GET("/api/pomodoro/sessions")
    suspend fun getPomodoroSessions(
        @Query("limit") limit: Int = 20
    ): List<PomodoroSession>

    @POST("/api/pomodoro/sessions")
    suspend fun createPomodoroSession(
        @Body request: StartPomodoroRequest
    ): PomodoroSession

    @PATCH("/api/pomodoro/sessions/{id}")
    suspend fun updatePomodoroSession(
        @Path("id") id: String,
        @Body updates: Map<String, Any?>
    ): PomodoroSession

    @GET("/api/pomodoro/stats")
    suspend fun getPomodoroStats(): PomodoroStats

    // Nudges
    @GET("/api/nudges")
    suspend fun getNudges(
        @Query("limit") limit: Int = 50
    ): List<Nudge>

    @POST("/api/nudges/generate")
    suspend fun generateNudge(@Body request: Map<String, String>): Nudge

    // Habits
    @GET("/api/habits")
    suspend fun getHabits(): List<Habit>

    @POST("/api/habits")
    suspend fun createHabit(@Body habit: Map<String, Any?>): Habit

    @POST("/api/habits/{id}/complete")
    suspend fun completeHabit(@Path("id") id: String): Habit

    // Goals
    @GET("/api/goals")
    suspend fun getGoals(): List<Goal>

    @POST("/api/goals")
    suspend fun createGoal(@Body goal: Map<String, Any?>): Goal

    @PATCH("/api/goals/{id}")
    suspend fun updateGoal(
        @Path("id") id: String,
        @Body updates: Map<String, Any?>
    ): Goal

    // Device Registration for Push Notifications
    @POST("/api/devices")
    suspend fun registerDevice(@Body request: DeviceRegistrationRequest): DeviceRegistrationResponse

    @DELETE("/api/devices/{id}")
    suspend fun unregisterDevice(@Path("id") id: String)
}

data class DeviceRegistrationRequest(
    val token: String,
    val platform: String = "android",
    val userId: String? = null
)

data class DeviceRegistrationResponse(
    val deviceId: String,
    val token: String
)
