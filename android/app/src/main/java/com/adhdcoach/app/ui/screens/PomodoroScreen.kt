package com.adhdcoach.app.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material.icons.filled.PlayArrow
import androidx.compose.material.icons.filled.Stop
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.adhdcoach.app.ui.viewmodel.MainViewModel
import java.util.concurrent.TimeUnit

@Composable
fun PomodoroScreen(
    onNavigateBack: () -> Unit,
    viewModel: MainViewModel
) {
    val timerState by viewModel.timerState.collectAsState()
    var selectedTaskId by remember { mutableStateOf<String?>(null) }

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

        Spacer(modifier = Modifier.height(32.dp))

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
    }
}
