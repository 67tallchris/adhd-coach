package com.adhdcoach.app

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.adhdcoach.app.data.remote.ApiClient
import com.adhdcoach.app.data.repository.BodyDoublingRepository
import com.adhdcoach.app.ui.screens.*
import com.adhdcoach.app.ui.theme.ADHDCoachTheme
import com.adhdcoach.app.ui.viewmodel.BodyDoublingViewModel
import com.adhdcoach.app.ui.viewmodel.BreakActivitiesViewModel
import com.adhdcoach.app.ui.viewmodel.DistractionViewModel
import com.adhdcoach.app.ui.viewmodel.StreaksViewModel
import com.adhdcoach.app.ui.viewmodel.MainViewModel
import com.adhdcoach.app.ui.viewmodel.MainViewModelFactory

class MainActivity : ComponentActivity() {

    private val viewModel: MainViewModel by lazy {
        MainViewModel(this.application)
    }

    private val bodyDoublingRepository: BodyDoublingRepository by lazy {
        BodyDoublingRepository(ApiClient.apiService)
    }

    private val bodyDoublingViewModel: BodyDoublingViewModel by lazy {
        BodyDoublingViewModel(this.application, bodyDoublingRepository)
    }

    private val breakActivitiesViewModel: BreakActivitiesViewModel by lazy {
        BreakActivitiesViewModel(this.application)
    }

    private val distractionViewModel: DistractionViewModel by lazy {
        DistractionViewModel(this.application, ApiClient.apiService)
    }

    private val streaksViewModel: StreaksViewModel by lazy {
        StreaksViewModel(this.application, ApiClient.apiService)
    }

    private val requestPermissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestPermission()
    ) { isGranted ->
        if (isGranted) {
            viewModel.onNotificationPermissionGranted()
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()

        viewModel.checkNotificationPermission { needsPermission ->
            if (needsPermission) {
                requestPermissionLauncher.launch(android.Manifest.permission.POST_NOTIFICATIONS)
            }
        }

        setContent {
            ADHDCoachTheme {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = MaterialTheme.colorScheme.background
                ) {
                    val navController = rememberNavController()
                    val startDestination = intent.getStringExtra("navigate_to")

                    ADHDCoachApp(
                        navController = navController,
                        startDestination = startDestination,
                        viewModel = viewModel,
                        bodyDoublingViewModel = bodyDoublingViewModel,
                        breakActivitiesViewModel = breakActivitiesViewModel,
                        distractionViewModel = distractionViewModel,
                        streaksViewModel = streaksViewModel
                    )
                }
            }
        }
    }
}

@Composable
fun ADHDCoachApp(
    navController: androidx.navigation.NavHostController,
    startDestination: String?,
    viewModel: MainViewModel,
    bodyDoublingViewModel: BodyDoublingViewModel,
    breakActivitiesViewModel: BreakActivitiesViewModel,
    distractionViewModel: DistractionViewModel,
    streaksViewModel: StreaksViewModel
) {
    val initialRoute = when (startDestination) {
        "pomodoro" -> "pomodoro"
        "tasks" -> "tasks"
        "nudges" -> "nudges"
        "habits" -> "habits"
        "goals" -> "goals"
        "ladders" -> "ladders"
        else -> "home"
    }

    NavHost(
        navController = navController,
        startDestination = initialRoute
    ) {
        composable("home") {
            HomeScreen(
                onNavigateToPomodoro = { navController.navigate("pomodoro") },
                onNavigateToTasks = { navController.navigate("tasks") },
                onNavigateToNudges = { navController.navigate("nudges") },
                onNavigateToHabits = { navController.navigate("habits") },
                onNavigateToGoals = { navController.navigate("goals") },
                onNavigateToLadders = { navController.navigate("ladders") },
                onNavigateToStreaks = { navController.navigate("streaks") }
            )
        }

        composable("pomodoro") {
            PomodoroScreen(
                onNavigateBack = { navController.popBackStack() },
                viewModel = viewModel,
                bodyDoublingViewModel = bodyDoublingViewModel,
                breakActivitiesViewModel = breakActivitiesViewModel
            )
        }

        composable("tasks") {
            TasksScreen(
                onNavigateBack = { navController.popBackStack() },
                viewModel = viewModel
            )
        }

        composable("nudges") {
            NudgesScreen(
                onNavigateBack = { navController.popBackStack() },
                viewModel = viewModel
            )
        }

        composable("habits") {
            HabitsScreen(
                onNavigateBack = { navController.popBackStack() },
                viewModel = viewModel
            )
        }

        composable("goals") {
            GoalsScreen(
                onNavigateBack = { navController.popBackStack() },
                viewModel = viewModel
            )
        }

        composable("ladders") {
            LaddersScreen()
        }

        composable("streaks") {
            StreaksScreen(viewModel = streaksViewModel)
        }
    }
}
