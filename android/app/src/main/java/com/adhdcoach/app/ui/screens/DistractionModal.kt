package com.adhdcoach.app.ui.screens

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridCells
import androidx.compose.foundation.lazy.grid.LazyVerticalGrid
import androidx.compose.foundation.lazy.grid.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.adhdcoach.app.data.model.*
import com.adhdcoach.app.ui.viewmodel.DistractionViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun DistractionModal(
    viewModel: DistractionViewModel,
    timeRemaining: String? = null,
    onActionSelected: (String) -> Unit
) {
    val state by viewModel.state.collectAsState()

    if (!state.isModalOpen) return

    val encouragement = remember { ENCOURAGEMENTS.random() }

    Surface(
        modifier = Modifier.fillMaxSize(),
        color = Color.Black.copy(alpha = 0.6f)
    ) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.9f)
                .align(Alignment.BottomCenter),
            shape = RoundedCornerShape(topStart = 24.dp, topEnd = 24.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .verticalScroll(rememberScrollState())
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
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
                            imageVector = Icons.Default.ChatBubble,
                            contentDescription = null,
                            tint = Color(0xFFf59e0b),
                            modifier = Modifier.size(28.dp)
                        )
                        Column {
                            Text(
                                text = "Got Distracted?",
                                style = MaterialTheme.typography.titleLarge,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "It happens. Let's figure out what helped.",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                    IconButton(onClick = { viewModel.closeModal() }) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }

                // Encouragement
                Surface(
                    modifier = Modifier.fillMaxWidth(),
                    color = Color(0xFFfef3c7),
                    shape = MaterialTheme.shapes.medium
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = encouragement,
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color(0xFF92400e),
                            fontStyle = androidx.compose.ui.text.font.FontStyle.Italic
                        )
                        TextButton(
                            onClick = { },
                            contentPadding = PaddingValues(0.dp)
                        ) {
                            Text(
                                text = "Don't show encouragement",
                                style = MaterialTheme.typography.labelSmall,
                                color = Color(0xFF92400e).copy(alpha = 0.6f)
                            )
                        }
                    }
                }

                // Distraction Types
                Column(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "What pulled you away?",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Medium
                    )
                    LazyVerticalGrid(
                        columns = GridCells.Fixed(2),
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        items(DISTRACTION_TYPES) { type ->
                            DistractionTypeCard(
                                type = type,
                                selected = state.selectedType == type.id,
                                onClick = { viewModel.selectType(type.id) }
                            )
                        }
                    }
                }

                // Notes
                Column(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "What happened? (optional)",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Medium
                    )
                    OutlinedTextField(
                        value = state.notes,
                        onValueChange = { viewModel.setNotes(it) },
                        modifier = Modifier.fillMaxWidth(),
                        placeholder = { Text("Jot down what distracted you...") },
                        minLines = 2,
                        maxLines = 4
                    )
                }

                // Actions
                Column(
                    verticalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    Text(
                        text = "What would you like to do?",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.Medium
                    )
                    DISTRACTION_ACTIONS.forEach { action ->
                        DistractionActionCard(
                            action = action,
                            selected = state.selectedAction == action.id,
                            timeRemaining = if (action.id == "resumed") timeRemaining else null,
                            onClick = { viewModel.selectAction(action.id) }
                        )
                    }
                }

                // Submit Button
                Spacer(modifier = Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween
                ) {
                    TextButton(onClick = { viewModel.closeModal() }) {
                        Text("Cancel")
                    }
                    Button(
                        onClick = {
                            viewModel.logDistraction(
                                sessionId = "", // Would be passed in
                                timeElapsed = 0, // Would be passed in
                                onComplete = onActionSelected
                            )
                        },
                        enabled = state.selectedType != null && state.selectedAction != null
                    ) {
                        Text("Continue")
                    }
                }
            }
        }
    }
}

@Composable
private fun DistractionTypeCard(
    type: DistractionType,
    selected: Boolean,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = if (selected) {
            Color(0xFFfef3c7)
        } else {
            MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        },
        border = if (selected) {
            androidx.compose.foundation.border(
                width = 2.dp,
                color = Color(0xFFf59e0b),
                shape = MaterialTheme.shapes.medium
            )
        } else null,
        shape = MaterialTheme.shapes.medium,
        onClick = onClick
    ) {
        Column(
            modifier = Modifier.padding(12.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Text(
                text = type.icon,
                style = MaterialTheme.typography.titleLarge
            )
            Column(
                verticalArrangement = Arrangement.spacedBy(4.dp)
            ) {
                Text(
                    text = type.label,
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.Medium,
                    color = if (selected) {
                        Color(0xFF92400e)
                    } else {
                        MaterialTheme.colorScheme.onSurface
                    }
                )
                Text(
                    text = type.description,
                    style = MaterialTheme.typography.labelSmall,
                    color = if (selected) {
                        Color(0xFF92400e).copy(alpha = 0.7f)
                    } else {
                        MaterialTheme.colorScheme.onSurfaceVariant
                    }
                )
            }
        }
    }
}

@Composable
private fun DistractionActionCard(
    action: DistractionAction,
    selected: Boolean,
    timeRemaining: String?,
    onClick: () -> Unit
) {
    Surface(
        modifier = Modifier.fillMaxWidth(),
        color = if (selected) {
            Color(action.color).copy(alpha = 0.2f)
        } else {
            MaterialTheme.colorScheme.surfaceVariant.copy(alpha = 0.5f)
        },
        border = if (selected) {
            androidx.compose.foundation.border(
                width = 2.dp,
                color = Color(action.color),
                shape = MaterialTheme.shapes.medium
            )
        } else null,
        shape = MaterialTheme.shapes.medium,
        onClick = onClick
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Surface(
                modifier = Modifier.size(40.dp),
                color = if (selected) {
                    Color(action.color).copy(alpha = 0.3f)
                } else {
                    MaterialTheme.colorScheme.surfaceVariant
                },
                shape = MaterialTheme.shapes.small
            ) {
                Box(contentAlignment = Alignment.Center) {
                    Text(
                        text = action.icon,
                        style = MaterialTheme.typography.titleMedium
                    )
                }
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
                        text = action.label,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                    if (timeRemaining != null) {
                        Text(
                            text = "($timeRemaining left)",
                            style = MaterialTheme.typography.labelSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }
                Text(
                    text = action.description,
                    style = MaterialTheme.typography.labelSmall,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
    }
}
