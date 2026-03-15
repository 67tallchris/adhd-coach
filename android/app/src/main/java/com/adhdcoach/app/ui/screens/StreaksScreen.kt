package com.adhdcoach.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.adhdcoach.app.ui.viewmodel.StreakStats
import com.adhdcoach.app.ui.viewmodel.StreaksViewModel

@Composable
fun StreaksScreen(
    viewModel: StreaksViewModel,
    modifier: Modifier = Modifier
) {
    val pomodoroStats by viewModel.pomodoroStats.collectAsState()
    val habitsStats by viewModel.habitsStats.collectAsState()
    val tasksStats by viewModel.tasksStats.collectAsState()
    var showGoalEditor by remember { mutableStateOf<StreakType?>(null) }

    Column(
        modifier = modifier
            .fillMaxSize()
            .padding(16.dp)
            .verticalScroll(),
        verticalArrangement = Arrangement.spacedBy(24.dp)
    ) {
        // Header
        Column {
            Text(
                text = "Progress & Achievements",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
            Text(
                text = "Track your weekly progress and celebrate milestones",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Weekly Summary
        WeeklySummarySection(
            pomodoroStats = pomodoroStats,
            habitsStats = habitsStats,
            tasksStats = tasksStats,
            onEditGoal = { showGoalEditor = it }
        )

        // Achievements
        AchievementsPanel(
            pomodoroStats = pomodoroStats,
            habitsStats = habitsStats,
            tasksStats = tasksStats
        )

        // Goal Editor Dialog
        showGoalEditor?.let { type ->
            WeeklyGoalEditor(
                type = type,
                currentGoal = when (type) {
                    StreakType.POMODORO -> pomodoroStats?.weeklyGoal ?: 5
                    StreakType.HABITS -> habitsStats?.weeklyGoal ?: 5
                    StreakType.TASKS -> tasksStats?.weeklyGoal ?: 10
                },
                onDismiss = { showGoalEditor = null },
                onSave = { newGoal ->
                    viewModel.updateWeeklyGoal(type, newGoal)
                    showGoalEditor = null
                }
            )
        }
    }
}

@Composable
private fun WeeklySummarySection(
    pomodoroStats: StreakStats?,
    habitsStats: StreakStats?,
    tasksStats: StreakStats?,
    onEditGoal: (StreakType) -> Unit
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "Weekly Summary",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.SemiBold
            )
            Text(
                text = "Week starts Monday",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        StreakType.entries.forEach { type ->
            val stats = when (type) {
                StreakType.POMODORO -> pomodoroStats
                StreakType.HABITS -> habitsStats
                StreakType.TASKS -> tasksStats
            }
            WeeklyProgressCard(
                type = type,
                stats = stats,
                onEditGoal = { onEditGoal(type) }
            )
        }
    }
}

@Composable
private fun WeeklyProgressCard(
    type: StreakType,
    stats: StreakStats?,
    onEditGoal: () -> Unit
) {
    val (title, icon, color) = when (type) {
        StreakType.POMODORO -> "Focus Sessions" to Icons.Default.TrendingUp to Color(0xFF4f46e5)
        StreakType.HABITS -> "Habit Completions" to Icons.Default.CalendarToday to Color(0xFF16a34a)
        StreakType.TASKS -> "Tasks Completed" to Icons.Default.Trophy to Color(0xFF2563eb)
    }

    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = color.copy(alpha = 0.1f),
        border = androidx.compose.foundation.border(
            width = 1.dp,
            color = color.copy(alpha = 0.3f),
            shape = MaterialTheme.shapes.medium
        ),
        shape = MaterialTheme.shapes.medium
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Surface(
                        color = color.copy(alpha = 0.2f),
                        shape = MaterialTheme.shapes.small
                    ) {
                        Icon(
                            imageVector = icon,
                            contentDescription = null,
                            tint = color,
                            modifier = Modifier.padding(8.dp).size(20.dp)
                        )
                    }
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )
                }
                TextButton(onClick = onEditGoal) {
                    Text("Edit goal")
                }
            }

            if (stats != null) {
                // Progress
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.Bottom
                ) {
                    Column {
                        Text(
                            text = "${stats.currentStreak}",
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "/ ${stats.weeklyGoal}",
                            style = MaterialTheme.typography.bodyMedium,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Surface(
                        color = if (stats.isOnTrack) {
                            Color(0xFF22c55e).copy(alpha = 0.2f)
                        } else if (stats.progress >= 50) {
                            Color(0xFFfbbf24).copy(alpha = 0.2f)
                        } else {
                            MaterialTheme.colorScheme.surfaceVariant
                        },
                        shape = RoundedCornerShape(12.dp)
                    ) {
                        Text(
                            text = if (stats.isOnTrack) "✓ On track" else "${Math.round(stats.progress)}% complete",
                            style = MaterialTheme.typography.labelMedium,
                            color = if (stats.isOnTrack) {
                                Color(0xFF22c55e)
                            } else if (stats.progress >= 50) {
                                Color(0xFFf59e0b)
                            } else {
                                MaterialTheme.colorScheme.onSurfaceVariant
                            },
                            modifier = Modifier.padding(horizontal = 12.dp, vertical = 6.dp)
                        )
                    }
                }

                // Progress bar
                LinearProgressIndicator(
                    progress = stats.progress / 100,
                    modifier = Modifier.fillMaxWidth().height(8.dp),
                    color = color,
                    trackColor = MaterialTheme.colorScheme.surfaceVariant
                )

                // Stats
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    Column {
                        Text(
                            text = "Best week",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = stats.bestStreak.toString(),
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium
                        )
                    }
                    Column {
                        Text(
                            text = "Last week",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                        Text(
                            text = stats.lastWeekCount.toString(),
                            style = MaterialTheme.typography.bodyMedium,
                            fontWeight = FontWeight.Medium
                        )
                    }
                }
            }
        }
    }
}

@Composable
private fun AchievementsPanel(
    pomodoroStats: StreakStats?,
    habitsStats: StreakStats?,
    tasksStats: StreakStats?
) {
    Column(
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween
        ) {
            Text(
                text = "Achievements",
                style = MaterialTheme.typography.titleLarge,
                fontWeight = FontWeight.SemiBold
            )
            val total = calculateUnlockedAchievements(pomodoroStats, habitsStats, tasksStats)
            Text(
                text = "$total / 12 unlocked",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }

        // Pomodoro achievements
        AchievementCard(
            icon = Icons.Default.Zap,
            title = "Getting Started",
            description = "Complete 5 focus sessions",
            unlocked = (pomodoroStats?.totalSessions ?: 0) >= 5,
            color = Color(0xFFf59e0b)
        )
        AchievementCard(
            icon = Icons.Default.LocalFireDepartment,
            title = "Focus Champion",
            description = "Complete 25 focus sessions",
            unlocked = (pomodoroStats?.totalSessions ?: 0) >= 25,
            color = Color(0xFFf97316)
        )
        AchievementCard(
            icon = Icons.Default.EmojiEvents,
            title = "Focus Master",
            description = "Complete 100 focus sessions",
            unlocked = (pomodoroStats?.totalSessions ?: 0) >= 100,
            color = Color(0xFFeab308)
        )
        AchievementCard(
            icon = Icons.Default.Target,
            title = "Weekly Warrior",
            description = "Hit your weekly goal",
            unlocked = pomodoroStats?.isOnTrack == true,
            color = Color(0xFF22c55e)
        )

        // Habits achievements
        AchievementCard(
            icon = Icons.Default.Star,
            title = "Habit Builder",
            description = "Complete habits on 5 different days",
            unlocked = (habitsStats?.totalSessions ?: 0) >= 5,
            color = Color(0xFF3b82f6)
        )
        AchievementCard(
            icon = Icons.Default.Work,
            title = "Consistency King",
            description = "Complete habits on 25 different days",
            unlocked = (habitsStats?.totalSessions ?: 0) >= 25,
            color = Color(0xFF8b5cf6)
        )

        // Tasks achievements
        AchievementCard(
            icon = Icons.Default.CheckCircle,
            title = "Task Crusher",
            description = "Complete 10 tasks",
            unlocked = (tasksStats?.totalSessions ?: 0) >= 10,
            color = Color(0xFFec4899)
        )
        AchievementCard(
            icon = Icons.Default.StarOutline,
            title = "Productivity Pro",
            description = "Complete 50 tasks",
            unlocked = (tasksStats?.totalSessions ?: 0) >= 50,
            color = Color(0xFF14b8a6)
        )
    }
}

@Composable
private fun AchievementCard(
    icon: ImageVector,
    title: String,
    description: String,
    unlocked: Boolean,
    color: Color
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = if (unlocked) {
            color.copy(alpha = 0.1f)
        } else {
            MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.3f)
        },
        border = if (unlocked) {
            androidx.compose.foundation.border(
                width = 1.dp,
                color = color.copy(alpha = 0.3f),
                shape = MaterialTheme.shapes.medium
            )
        } else null,
        shape = MaterialTheme.shapes.medium
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                color = if (unlocked) {
                    color.copy(alpha = 0.2f)
                } else {
                    MaterialTheme.colorScheme.surfaceVariant
                },
                shape = MaterialTheme.shapes.medium
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = if (unlocked) color else MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f),
                    modifier = Modifier.padding(12.dp).size(24.dp)
                )
            }
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Row(
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = title,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = if (unlocked) {
                            MaterialTheme.colorScheme.onSurface
                        } else {
                            MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                        }
                    )
                    if (unlocked) {
                        AssistChip(
                            onClick = { },
                            label = { Text("Unlocked") },
                            colors = AssistChipDefaults.assistChipColors(
                                containerColor = color
                            )
                        )
                    }
                }
                Text(
                    text = description,
                    style = MaterialTheme.typography.bodySmall,
                    color = if (unlocked) {
                        MaterialTheme.colorScheme.onSurfaceVariant
                    } else {
                        MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.5f)
                    }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun WeeklyGoalEditor(
    type: StreakType,
    currentGoal: Int,
    onDismiss: () -> Unit,
    onSave: (Int) -> Unit
) {
    var goal by remember { mutableStateOf(currentGoal) }

    AlertDialog(
        onDismissRequest = onDismiss,
        icon = {
            Icon(
                Icons.Default.Edit,
                contentDescription = null,
                tint = MaterialTheme.colorScheme.primary
            )
        },
        title = { Text("Edit Weekly Goal") },
        text = {
            Column(
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                Text(
                    text = "Set a realistic weekly goal. Remember: it's better to start small and build momentum!",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                // Quick suggestions
                val suggestions = when (type) {
                    StreakType.POMODORO -> listOf(3, 5, 10, 15)
                    StreakType.HABITS -> listOf(5, 10, 15, 20)
                    StreakType.TASKS -> listOf(5, 10, 20, 30)
                }
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    suggestions.forEach { suggestion ->
                        FilterChip(
                            selected = goal == suggestion,
                            onClick = { goal = suggestion },
                            label = { Text(suggestion.toString()) }
                        )
                    }
                }

                // Custom input
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(16.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    IconButton(
                        onClick = { goal = maxOf(1, goal - 1) }
                    ) {
                        Icon(Icons.Default.Remove, contentDescription = "Decrease")
                    }
                    Column(
                        horizontalAlignment = Alignment.CenterHorizontally,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text(
                            text = goal.toString(),
                            style = MaterialTheme.typography.headlineMedium,
                            fontWeight = FontWeight.Bold
                        )
                        Text(
                            text = "per week",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    IconButton(
                        onClick = { goal = goal + 1 }
                    ) {
                        Icon(Icons.Default.Add, contentDescription = "Increase")
                    }
                }
            }
        },
        confirmButton = {
            Button(onClick = { onSave(goal) }) {
                Text("Save Goal")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

private fun calculateUnlockedAchievements(
    pomodoroStats: StreakStats?,
    habitsStats: StreakStats?,
    tasksStats: StreakStats?
): Int {
    var count = 0
    if ((pomodoroStats?.totalSessions ?: 0) >= 5) count++
    if ((pomodoroStats?.totalSessions ?: 0) >= 25) count++
    if ((pomodoroStats?.totalSessions ?: 0) >= 100) count++
    if (pomodoroStats?.isOnTrack == true) count++
    if ((habitsStats?.totalSessions ?: 0) >= 5) count++
    if ((habitsStats?.totalSessions ?: 0) >= 25) count++
    if ((tasksStats?.totalSessions ?: 0) >= 10) count++
    if ((tasksStats?.totalSessions ?: 0) >= 50) count++
    return count
}

enum class StreakType {
    POMODORO,
    HABITS,
    TASKS
}
