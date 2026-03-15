package com.adhdcoach.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.FilterList
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Zap
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.adhdcoach.app.data.model.BREAK_CATEGORIES
import com.adhdcoach.app.ui.viewmodel.BreakActivitiesViewModel
import com.adhdcoach.app.ui.viewmodel.BreakActivitiesState
import java.util.concurrent.TimeUnit

@Composable
fun BreakActivitySuggestions(
    viewModel: BreakActivitiesViewModel,
    breakDurationMin: Int,
    onActivityComplete: () -> Unit = {}
) {
    val state by viewModel.state.collectAsState()
    var showFilters by remember { mutableStateOf(false) }
    var timeRemaining by remember { mutableStateOf(breakDurationMin * 60) }

    // Initialize suggestion on first load
    LaunchedEffect(Unit) {
        if (state.currentSuggestion == null) {
            viewModel.getSuggestion(breakDurationMin)
        }
    }

    // Countdown timer
    LaunchedEffect(timeRemaining, state.isComplete) {
        if (timeRemaining > 0 && !state.isComplete) {
            kotlinx.coroutines.delay(1000)
            timeRemaining--
        }
    }

    val suggestion = state.currentSuggestion ?: return

    Card(
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(
            containerColor = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.8f)
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            // Header
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Zap,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.primary,
                        modifier = Modifier.size(24.dp)
                    )
                    Column {
                        Text(
                            text = "Break Activity",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.SemiBold
                        )
                        Text(
                            text = "${getDurationBucket(breakDurationMin)}-minute break",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                IconButton(onClick = { showFilters = !showFilters }) {
                    Icon(
                        imageVector = if (showFilters) Icons.Default.Close else Icons.Default.FilterList,
                        contentDescription = "Filters",
                        tint = if (showFilters) MaterialTheme.colorScheme.primary
                             else MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Filters Panel
            AnimatedVisibility(visible = showFilters) {
                FilterPanel(
                    state = state,
                    onToggleCategory = viewModel::toggleCategory,
                    onSetEnergy = viewModel::setEnergyPreference,
                    modifier = Modifier.padding(top = 16.dp)
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Activity Card
            ActivityCard(
                activity = suggestion,
                timeRemaining = timeRemaining,
                isComplete = state.isComplete,
                onRefresh = { viewModel.refreshSuggestion(breakDurationMin) },
                onComplete = {
                    viewModel.markCompleted()
                    onActivityComplete()
                }
            )

            // Tip
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "💡 Taking regular breaks improves focus and prevents burnout",
                style = MaterialTheme.typography.labelSmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f)
            )
        }
    }
}

@Composable
private fun FilterPanel(
    state: BreakActivitiesState,
    onToggleCategory: (String) -> Unit,
    onSetEnergy: (String?) -> Unit,
    modifier: Modifier = Modifier
) {
    Surface(
        modifier = modifier.fillMaxWidth(),
        color = MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f),
        shape = MaterialTheme.shapes.small
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Categories
            Text(
                text = "Preferred Categories",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                items(BREAK_CATEGORIES.filter { it.id != "all" }) { category ->
                    FilterChip(
                        selected = category.id in state.preferredCategories,
                        onClick = { onToggleCategory(category.id) },
                        label = { Text(category.label) },
                        colors = FilterChipDefaults.filterChipColors(
                            selectedContainerColor = Color(category.color)
                        )
                    )
                }
            }

            // Energy Level
            Text(
                text = "Energy Level",
                style = MaterialTheme.typography.labelMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                listOf("low", "medium", "high").forEach { energy ->
                    FilterChip(
                        selected = state.energyPreference == energy,
                        onClick = { onSetEnergy(if (state.energyPreference == energy) null else energy) },
                        label = { Text(energy.capitalize()) },
                        leadingIcon = if (state.energyPreference == energy) {
                            {
                                Icon(
                                    Icons.Default.Check,
                                    contentDescription = null,
                                    modifier = Modifier.size(16.dp)
                                )
                            }
                        } else null
                    )
                }
            }
        }
    }
}

@Composable
private fun ActivityCard(
    activity: com.adhdcoach.app.data.model.BreakActivity,
    timeRemaining: Int,
    isComplete: Boolean,
    onRefresh: () -> Unit,
    onComplete: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = if (isComplete) {
            MaterialTheme.colorScheme.secondaryContainer.copy(alpha = 0.3f)
        } else {
            MaterialTheme.colorScheme.surface.copy(alpha = 0.6f)
        },
        shape = MaterialTheme.shapes.medium
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            // Icon & Timer
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.Top
            ) {
                Text(
                    text = activity.icon,
                    style = MaterialTheme.typography.displayMedium
                )

                Column(
                    horizontalAlignment = Alignment.End
                ) {
                    Text(
                        text = formatTime(timeRemaining),
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold,
                        color = if (timeRemaining < 30) {
                            MaterialTheme.colorScheme.error
                        } else {
                            MaterialTheme.colorScheme.onSurface
                        }
                    )
                    Text(
                        text = "remaining",
                        style = MaterialTheme.typography.labelSmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            // Activity Info
            Column(
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = activity.title,
                    style = MaterialTheme.typography.titleMedium,
                    fontWeight = FontWeight.SemiBold,
                    color = if (isComplete) {
                        MaterialTheme.colorScheme.secondary
                    } else {
                        MaterialTheme.colorScheme.onSurface
                    }
                )
                Text(
                    text = activity.description,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            // Tags
            LazyRow(
                horizontalArrangement = Arrangement.spacedBy(6.dp)
            ) {
                item {
                    AssistChip(
                        onClick = { },
                        label = { Text(getCategoryLabel(activity.category)) },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = Color(
                                BREAK_CATEGORIES.find { it.id == activity.category }?.color
                                    ?: "#6b7280"
                            )
                        )
                    )
                }
                item {
                    AssistChip(
                        onClick = { },
                        label = { Text("${activity.energyLevel} energy") },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                    )
                }
                items(activity.tags.take(2)) { tag ->
                    AssistChip(
                        onClick = { },
                        label = { Text("#$tag") },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = MaterialTheme.colorScheme.surfaceVariant
                        )
                    )
                }
            }

            // Actions
            if (!isComplete) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onRefresh,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(
                            Icons.Default.Refresh,
                            contentDescription = null,
                            modifier = Modifier.padding(end = 4.dp).size(16.dp)
                        )
                        Text("Not this one")
                    }
                    Button(
                        onClick = onComplete,
                        modifier = Modifier.weight(1f)
                    ) {
                        Icon(
                            Icons.Default.Check,
                            contentDescription = null,
                            modifier = Modifier.padding(end = 4.dp).size(16.dp)
                        )
                        Text("Did it!")
                    }
                }
            } else {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Icon(
                        Icons.Default.Check,
                        contentDescription = null,
                        tint = MaterialTheme.colorScheme.secondary,
                        modifier = Modifier.size(20.dp)
                    )
                    Text(
                        text = "Activity completed! Great job taking care of yourself.",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.secondary
                    )
                }
            }
        }
    }
}

private fun getDurationBucket(minutes: Int): Int {
    return when {
        minutes < 3 -> 1
        minutes < 8 -> 5
        minutes < 13 -> 10
        else -> 15
    }
}

private fun formatTime(seconds: Int): String {
    val m = TimeUnit.SECONDS.toMinutes(seconds.toLong())
    val s = seconds % 60
    return String.format("%02d:%02d", m, s)
}

private fun getCategoryLabel(category: String): String {
    return BREAK_CATEGORIES.find { it.id == category }?.label ?: category
}
