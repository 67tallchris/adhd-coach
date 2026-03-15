package com.adhdcoach.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material.icons.filled.ChatBubble
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.adhdcoach.app.ui.viewmodel.BodyDoublingViewModel
import com.adhdcoach.app.ui.viewmodel.BreakActivitiesViewModel
import com.adhdcoach.app.ui.viewmodel.DistractionViewModel
import com.adhdcoach.app.ui.viewmodel.MainViewModel
import java.util.concurrent.TimeUnit

@Composable
fun PomodoroScreen(
    onNavigateBack: () -> Unit,
    viewModel: MainViewModel,
    bodyDoublingViewModel: BodyDoublingViewModel,
    breakActivitiesViewModel: BreakActivitiesViewModel,
    distractionViewModel: DistractionViewModel
) {
    val timerState by viewModel.timerState.collectAsState()
    var selectedTaskId by remember { mutableStateOf<String?>(null) }
    val isBreak = timerState.durationSec == 5 * 60 || timerState.durationSec == 10 * 60 // Simplified break detection
    val isWorkSession = !isBreak && timerState.isRunning

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(16.dp)
    ) {
        // Header
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(onClick = onNavigateBack) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back"
                )
            }

            Spacer(modifier = Modifier.width(8.dp))

            Text(
                text = "Pomodoro",
                style = MaterialTheme.typography.headlineMedium,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Body Doubling Indicator
        BodyDoublingIndicator(
            viewModel = bodyDoublingViewModel,
            modifier = Modifier.padding(bottom = 16.dp)
        )

        Spacer(modifier = Modifier.height(16.dp))

        // Timer display
        Box(
            modifier = Modifier
                .size(280.dp)
                .align(Alignment.CenterHorizontally),
            contentAlignment = Alignment.Center
        ) {
            // Circular progress
            CircularProgressIndicator(
                progress = if (timerState.durationSec > 0) {
                    timerState.remainingSec.toFloat() / timerState.durationSec
                } else {
                    0f
                },
                modifier = Modifier.size(280.dp),
                strokeWidth = 12.dp,
                strokeCap = StrokeCap.Round,
                color = if (timerState.remainingSec == 0 && timerState.isRunning) {
                    MaterialTheme.colorScheme.tertiary
                } else {
                    MaterialTheme.colorScheme.primary
                }
            )

            // Time text
            Column(
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                val minutes = TimeUnit.SECONDS.toMinutes(timerState.remainingSec.toLong())
                val seconds = timerState.remainingSec % 60

                Text(
                    text = String.format("%02d:%02d", minutes, seconds),
                    style = MaterialTheme.typography.displayLarge,
                    fontWeight = FontWeight.Bold,
                    color = MaterialTheme.colorScheme.onBackground
                )

                Text(
                    text = when {
                        timerState.isRunning -> "Focus time"
                        timerState.remainingSec < timerState.durationSec -> "Paused"
                        else -> "Ready"
                    },
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )

                if (timerState.remainingSec == 0 && !timerState.isRunning) {
                    Spacer(modifier = Modifier.height(8.dp))
                    AssistChip(
                        onClick = { },
                        label = { Text("Session complete!") },
                        colors = AssistChipDefaults.assistChipColors(
                            containerColor = MaterialTheme.colorScheme.tertiary
                        )
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(48.dp))

        // Controls
        Row(
            modifier = Modifier.align(Alignment.CenterHorizontally),
            horizontalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            if (!timerState.isRunning) {
                Button(
                    onClick = {
                        if (timerState.remainingSec < timerState.durationSec) {
                            // Resume
                            viewModel.startPomodoro(selectedTaskId, timerState.durationSec / 60)
                        } else {
                            // Start new
                            viewModel.startPomodoro(selectedTaskId)
                        }
                    },
                    modifier = Modifier
                        .width(140.dp)
                        .height(56.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.PlayArrow,
                        contentDescription = null,
                        modifier = Modifier.padding(end = 8.dp)
                    )
                    Text(
                        if (timerState.remainingSec < timerState.durationSec) "Resume" else "Start"
                    )
                }
            } else {
                Button(
                    onClick = { viewModel.stopPomodoro() },
                    modifier = Modifier
                        .width(140.dp)
                        .height(56.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Icon(
                        imageVector = Icons.Default.Stop,
                        contentDescription = null,
                        modifier = Modifier.padding(end = 8.dp)
                    )
                    Text("Stop")
                }
            }
        }

        // Break Activity Suggestions - Only show during breaks
        if (isBreak && !timerState.isRunning) {
            Spacer(modifier = Modifier.height(24.dp))
            BreakActivitySuggestions(
                viewModel = breakActivitiesViewModel,
                breakDurationMin = timerState.durationSec / 60,
                onActivityComplete = {
                    // Could trigger notification or analytics here
                }
            )
        }

        // Got Distracted button - Only show during work sessions
        if (isWorkSession) {
            Spacer(modifier = Modifier.height(16.dp))
            OutlinedButton(
                onClick = { distractionViewModel.openModal() },
                modifier = Modifier.fillMaxWidth(),
                colors = ButtonDefaults.outlinedButtonColors(
                    contentColor = Color(0xFFf59e0b)
                ),
                border = androidx.compose.foundation.border(
                    width = 1.dp,
                    color = Color(0xFFf59e0b).copy(alpha = 0.3f),
                    shape = MaterialTheme.shapes.medium
                )
            ) {
                Icon(
                    Icons.Default.ChatBubble,
                    contentDescription = null,
                    modifier = Modifier.padding(end = 8.dp).size(18.dp)
                )
                Text("Got Distracted?")
            }
        }

        // Distraction Modal
        DistractionModal(
            viewModel = distractionViewModel,
            timeRemaining = if (timerState.isRunning && !isBreak) {
                String.format("%02d:%02d", timerState.remainingSec / 60, timerState.remainingSec % 60)
            } else null,
            onActionSelected = { action ->
                // Handle the selected action
                when (action) {
                    "resumed" -> {
                        // Resume timer
                    }
                    "restarted" -> {
                        // Restart timer
                        viewModel.stopPomodoro()
                        viewModel.startPomodoro(selectedTaskId)
                    }
                    "took_break" -> {
                        // Switch to break mode
                        viewModel.stopPomodoro()
                    }
                    "abandoned" -> {
                        // End session
                        viewModel.stopPomodoro()
                    }
                }
            }
        )
    }
}
