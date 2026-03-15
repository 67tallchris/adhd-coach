package com.adhdcoach.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Delete
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import com.adhdcoach.app.data.model.LadderStatus
import com.adhdcoach.app.ui.viewmodel.LadderViewModel

@Composable
fun LaddersScreen(
    viewModel: LadderViewModel = viewModel()
) {
    val ladders by viewModel.allLadders.collectAsState()

    var showCreateDialog by remember { mutableStateOf(false) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        Text(
            text = "Reverse Task Mapping",
            style = MaterialTheme.typography.headlineLarge,
            fontWeight = FontWeight.Bold,
            color = MaterialTheme.colorScheme.onBackground
        )

        Text(
            text = "Work backwards from your goal",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.padding(top = 4.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            FilterChips(
                onFilterSelected = { status ->
                    // Filter logic would go here
                }
            )

            Spacer(modifier = Modifier.width(8.dp))

            Button(onClick = { showCreateDialog = true }) {
                Icon(
                    imageVector = Icons.Default.Add,
                    contentDescription = null,
                    modifier = Modifier.size(18.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text("Build Ladder")
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        if (ladders.isEmpty()) {
            Box(
                modifier = Modifier
                    .fillMaxSize()
                    .wrapContentSize(Alignment.Center)
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    Text(
                        text = "No ladders yet",
                        style = MaterialTheme.typography.titleMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "Build a ladder to break down big goals",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.7f),
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }
            }
        } else {
            LazyColumn(
                verticalArrangement = Arrangement.spacedBy(12.dp)
            ) {
                items(ladders) { ladder ->
                    LadderCard(
                        ladder = ladder,
                        onToggleStep = { stepId, isCompleted ->
                            viewModel.toggleStepCompletion(ladder.id, stepId, isCompleted)
                        },
                        onDeleteStep = { stepId ->
                            viewModel.deleteStep(ladder.id, stepId)
                        },
                        onDeleteLadder = {
                            viewModel.deleteLadder(ladder.id)
                        }
                    )
                }
            }
        }
    }

    if (showCreateDialog) {
        CreateLadderDialog(
            onDismiss = { showCreateDialog = false },
            onCreateLadder = { title, description, steps ->
                viewModel.createLadder(
                    title = title,
                    description = description,
                    steps = steps
                )
                showCreateDialog = false
            }
        )
    }
}

@Composable
private fun FilterChips(
    onFilterSelected: (LadderStatus) -> Unit
) {
    Row {
        LadderStatus.values().forEach { status ->
            FilterChip(
                selected = false,
                onClick = { onFilterSelected(status) },
                label = { Text(status.name.lowercase().capitalize()) },
                modifier = Modifier.padding(end = 8.dp)
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun CreateLadderDialog(
    onDismiss: () -> Unit,
    onCreateLadder: (String, String?, List<CreateLadderStepRequest>) -> Unit
) {
    var title by remember { mutableStateOf("") }
    var description by remember { mutableStateOf("") }
    val steps = remember { mutableStateListOf<CreateLadderStepRequest>() }

    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Build Your Ladder") },
        text = {
            Column {
                OutlinedTextField(
                    value = title,
                    onValueChange = { title = it },
                    label = { Text("End Goal") },
                    placeholder = { Text("e.g., Submit a job application") },
                    modifier = Modifier.fillMaxWidth()
                )

                Spacer(modifier = Modifier.height(8.dp))

                OutlinedTextField(
                    value = description,
                    onValueChange = { description = it },
                    label = { Text("Description (optional)") },
                    modifier = Modifier.fillMaxWidth(),
                    maxLines = 3
                )

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = "Steps (working backwards)",
                    style = MaterialTheme.typography.titleSmall
                )

                Spacer(modifier = Modifier.height(8.dp))

                steps.forEachIndexed { index, step ->
                    OutlinedTextField(
                        value = step.title,
                        onValueChange = {
                            steps[index] = step.copy(title = it)
                        },
                        label = { Text("Step ${index + 1}") },
                        modifier = Modifier.fillMaxWidth()
                    )
                    Spacer(modifier = Modifier.height(4.dp))
                }

                TextButton(
                    onClick = {
                        steps.add(CreateLadderStepRequest(steps.size + 1, ""))
                    }
                ) {
                    Text("Add Step")
                }
            }
        },
        confirmButton = {
            Button(
                enabled = title.isNotBlank() && steps.isNotEmpty(),
                onClick = {
                    val validSteps = steps.filter { it.title.isNotBlank() }
                        .mapIndexed { index, step -> step.copy(stepNumber = index + 1) }
                    onCreateLadder(title, description.ifBlank { null }, validSteps)
                }
            ) {
                Text("Create Ladder")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
private fun LadderCard(
    ladder: com.adhdcoach.app.data.model.LadderGoal,
    onToggleStep: (String, Boolean) -> Unit,
    onDeleteStep: (String) -> Unit,
    onDeleteLadder: () -> Unit
) {
    val completedSteps = ladder.steps.count { it.isCompleted }
    val totalSteps = ladder.steps.size
    val progress = if (totalSteps > 0) completedSteps.toFloat() / totalSteps else 0f

    Card(
        modifier = Modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = ladder.title,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.SemiBold
                    )

                    if (ladder.description != null) {
                        Text(
                            text = ladder.description,
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant,
                            modifier = Modifier.padding(top = 4.dp)
                        )
                    }
                }

                IconButton(onClick = onDeleteLadder) {
                    Icon(
                        imageVector = Icons.Default.Delete,
                        contentDescription = "Delete ladder",
                        tint = MaterialTheme.colorScheme.error
                    )
                }
            }

            Spacer(modifier = Modifier.height(12.dp))

            // Progress bar
            LinearProgressIndicator(
                progress = progress,
                modifier = Modifier.fillMaxWidth()
            )

            Text(
                text = "$completedSteps of $totalSteps steps completed",
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant,
                modifier = Modifier.padding(top = 8.dp)
            )

            Spacer(modifier = Modifier.height(12.dp))

            // Steps
            ladder.steps.sortedBy { it.stepNumber }.forEach { step ->
                Row(
                    modifier = Modifier
                        .fillMaxWidth()
                        .padding(vertical = 4.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Checkbox(
                        checked = step.isCompleted,
                        onCheckedChange = { onToggleStep(step.id, step.isCompleted) }
                    )

                    Column(modifier = Modifier.weight(1f)) {
                        Text(
                            text = step.title,
                            style = MaterialTheme.typography.bodyMedium,
                            textDecoration = if (step.isCompleted) TextDecoration.LineThrough else null,
                            color = if (step.isCompleted)
                                MaterialTheme.colorScheme.onSurfaceVariant.copy(alpha = 0.6f)
                            else
                                MaterialTheme.colorScheme.onSurface
                        )

                        if (step.notes != null) {
                            Text(
                                text = step.notes,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                }
            }
        }
    }
}
