package com.adhdcoach.app.data.model

data class DistractionType(
    val id: String,
    val label: String,
    val icon: String,
    val description: String
)

val DISTRACTION_TYPES = listOf(
    DistractionType(
        id = "internal",
        label = "Intrusive thought",
        icon = "💭",
        description = "Random thought or idea popped up"
    ),
    DistractionType(
        id = "external",
        label = "External interruption",
        icon = "🔔",
        description = "Someone or something interrupted"
    ),
    DistractionType(
        id = "urgent",
        label = "Something urgent",
        icon = "🚨",
        description = "Felt like I needed to do something else"
    ),
    DistractionType(
        id = "overwhelm",
        label = "Feeling overwhelmed",
        icon = "😰",
        description = "Task felt too big or difficult"
    ),
    DistractionType(
        id = "boredom",
        label = "Boredom/Resistance",
        icon = "😴",
        description = "This feels boring or hard"
    ),
    DistractionType(
        id = "rabbit-hole",
        label = "Went down rabbit hole",
        icon = "🐰",
        description = "Got sidetracked researching something"
    )
)

data class DistractionAction(
    val id: String,
    val label: String,
    val icon: String,
    val description: String,
    val color: String
)

val DISTRACTION_ACTIONS = listOf(
    DistractionAction(
        id = "resumed",
        label = "Resume",
        icon = "▶️",
        description = "Continue where you left off",
        color = "#4f46e5"
    ),
    DistractionAction(
        id = "restarted",
        label = "Restart",
        icon = "🔄",
        description = "Start a fresh session",
        color = "#2563eb"
    ),
    DistractionAction(
        id = "took_break",
        label = "Take a Break",
        icon = "☕",
        description = "Step away and come back later",
        color = "#16a34a"
    ),
    DistractionAction(
        id = "abandoned",
        label = "That's Enough",
        icon = "⏹️",
        description = "End session, no judgment",
        color = "#6b7280"
    )
)

val ENCOURAGEMENTS = listOf(
    "It's okay! Distractions happen to everyone.",
    "Your brain is learning. This is part of the process.",
    "Notice it, name it, and gently come back.",
    "Every time you notice a distraction, that's a win.",
    "Be kind to yourself. This is hard work.",
    "The fact that you noticed means you're making progress."
)
