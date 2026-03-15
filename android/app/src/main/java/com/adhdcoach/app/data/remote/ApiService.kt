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

    // Ladders (Reverse Task Mapping)
    @GET("/api/ladders")
    suspend fun getLadders(
        @Query("status") status: String? = null
    ): List<LadderGoal>

    @GET("/api/ladders/{id}")
    suspend fun getLadder(@Path("id") id: String): LadderGoal

    @POST("/api/ladders")
    suspend fun createLadder(@Body request: CreateLadderRequest): LadderGoal

    @PATCH("/api/ladders/{id}")
    suspend fun updateLadder(
        @Path("id") id: String,
        @Body updates: UpdateLadderRequest
    ): LadderGoal

    @DELETE("/api/ladders/{id}")
    suspend fun deleteLadder(@Path("id") id: String)

    @POST("/api/ladders/{id}/steps")
    suspend fun addLadderStep(
        @Path("id") id: String,
        @Body request: AddLadderStepRequest
    ): LadderStep

    @PATCH("/api/ladders/{id}/steps/{stepId}")
    suspend fun updateLadderStep(
        @Path("id") ladderId: String,
        @Path("stepId") stepId: String,
        @Body updates: UpdateLadderStepRequest
    ): LadderStep

    @DELETE("/api/ladders/{id}/steps/{stepId}")
    suspend fun deleteLadderStep(
        @Path("id") ladderId: String,
        @Path("stepId") stepId: String
    )

    // Body Doubling
    @POST("/api/body-doubling/checkin")
    suspend fun bodyDoublingCheckIn(
        @Body request: BodyDoublingCheckInRequest
    ): BodyDoublingCheckInResponse

    @DELETE("/api/body-doubling/checkin/{sessionId}")
    suspend fun bodyDoublingCheckOut(@Path("sessionId") sessionId: String)

    @GET("/api/body-doubling/count")
    suspend fun getBodyDoublingCount(): BodyDoublingCount

    @GET("/api/body-doubling/peers")
    suspend fun getBodyDoublingPeers(): BodyDoublingPeers

    @POST("/api/body-doubling/heartbeat/{sessionId}")
    suspend fun bodyDoublingHeartbeat(
        @Path("sessionId") sessionId: String,
        @Body request: BodyDoublingHeartbeatRequest
    ): BodyDoublingHeartbeatResponse

    // Distraction Tracking
    @POST("/api/distractions")
    suspend fun logDistraction(@Body request: LogDistractionRequest): DistractionLog

    @GET("/api/distractions/insights")
    suspend fun getDistractionInsights(@Query("limit") limit: Int = 50): DistractionInsights

    @PATCH("/api/streaks/goal")
    suspend fun updateStreakGoal(
        @Query("type") type: String,
        @Query("weeklyGoal") weeklyGoal: Int
    ): Map<String, Any>
}

data class BodyDoublingCheckInRequest(
    val sessionId: String? = null,
    val taskType: String = "work"
)

data class BodyDoublingCheckInResponse(
    val sessionId: String,
    val startedAt: String,
    val taskType: String,
    val isNew: Boolean? = false
)

data class BodyDoublingCount(
    val total: Int,
    val working: Int,
    val onBreak: Int,
    val timestamp: String
)

data class BodyDoublingPeers(
    val total: Int,
    val regions: Map<String, Int>,
    val messages: List<BodyDoublingMessage>
)

data class BodyDoublingMessage(
    val text: String,
    val taskType: String
)

data class BodyDoublingHeartbeatRequest(
    val taskType: String = "work"
)

data class BodyDoublingHeartbeatResponse(
    val sessionId: String,
    val taskType: String,
    val ok: Boolean
)

// Distraction Tracking
data class LogDistractionRequest(
    val sessionId: String,
    val distractionType: String,
    val notes: String? = null,
    val action: String,
    val timeElapsed: Int
)

data class DistractionLog(
    val id: String,
    val sessionId: String?,
    val timestamp: String,
    val distractionType: String,
    val notes: String?,
    val action: String,
    val timeElapsed: Int
)

data class DistractionInsights(
    val total: Int,
    val recentLogs: List<DistractionLog>,
    val byType: Map<String, Int>,
    val byAction: Map<String, Int>,
    val averageTimeToDistraction: Int,
    val peakDistractionHour: String?,
    val peakDistractionCount: Int
)

data class DeviceRegistrationRequest(
    val token: String,
    val platform: String = "android",
    val userId: String? = null
)

data class DeviceRegistrationResponse(
    val deviceId: String,
    val token: String
)
