package com.adhdcoach.app.data.model

import kotlinx.serialization.Serializable

@Serializable
data class BreakActivity(
    val id: String,
    val title: String,
    val description: String,
    val duration: Int, // 1, 5, 10, or 15 minutes
    val category: String, // physical, mental, restful, social, nourish, eyes
    val energyLevel: String, // low, medium, high
    val tags: List<String>,
    val icon: String
)

@Serializable
data class BreakActivityCategory(
    val id: String,
    val label: String,
    val color: String
)

val BREAK_ACTIVITIES = listOf(
    // 1-minute activities
    BreakActivity(
        id = "stretch-reach",
        title = "Reach for the Sky",
        description = "Stand up, reach your arms overhead, stretch your whole body",
        duration = 1,
        category = "physical",
        energyLevel = "low",
        tags = listOf("stretch", "body"),
        icon = "🧘"
    ),
    BreakActivity(
        id = "water",
        title = "Drink Water",
        description = "Hydrate! Your brain works better when you're hydrated",
        duration = 1,
        category = "nourish",
        energyLevel = "low",
        tags = listOf("health", "hydration"),
        icon = "💧"
    ),
    BreakActivity(
        id = "breathe-box",
        title = "Box Breathing",
        description = "Inhale 4 counts, hold 4, exhale 4, hold 4. Repeat.",
        duration = 1,
        category = "restful",
        energyLevel = "low",
        tags = listOf("calm", "breathing"),
        icon = "🌬️"
    ),
    BreakActivity(
        id = "eye-rest",
        title = "20-20-20 Eye Rest",
        description = "Look at something 20 feet away for 20 seconds",
        duration = 1,
        category = "eyes",
        energyLevel = "low",
        tags = listOf("eyes", "screen"),
        icon = "👀"
    ),
    BreakActivity(
        id = "neck-rolls",
        title = "Neck & Shoulder Release",
        description = "Gently roll your shoulders and tilt your head side to side",
        duration = 1,
        category = "physical",
        energyLevel = "low",
        tags = listOf("stretch", "tension"),
        icon = "💆"
    ),
    BreakActivity(
        id = "fist-squeeze",
        title = "Progressive Relaxation",
        description = "Clench fists tight for 5 seconds, then release. Feel the tension melt.",
        duration = 1,
        category = "restful",
        energyLevel = "low",
        tags = listOf("relax", "tension"),
        icon = "✊"
    ),
    BreakActivity(
        id = "gratitude",
        title = "Quick Gratitude",
        description = "Think of 3 things you're grateful for right now",
        duration = 1,
        category = "mental",
        energyLevel = "low",
        tags = listOf("mindset", "positivity"),
        icon = "🙏"
    ),
    BreakActivity(
        id = "palming",
        title = "Eye Palming",
        description = "Rub hands warm, cup over closed eyes. Breathe deeply.",
        duration = 1,
        category = "eyes",
        energyLevel = "low",
        tags = listOf("eyes", "relax"),
        icon = "👐"
    ),
    // 5-minute activities
    BreakActivity(
        id = "walk-around",
        title = "Mini Walk",
        description = "Walk around the block, up/down stairs, or through your space",
        duration = 5,
        category = "physical",
        energyLevel = "medium",
        tags = listOf("movement", "cardio"),
        icon = "🚶"
    ),
    BreakActivity(
        id = "sunlight",
        title = "Get Sunlight",
        description = "Step outside, feel the sun, look at the sky (not directly!)",
        duration = 5,
        category = "physical",
        energyLevel = "low",
        tags = listOf("nature", "eyes", "mood"),
        icon = "☀️"
    ),
    BreakActivity(
        id = "tidy-one-thing",
        title = "Tidy One Small Thing",
        description = "Pick up one area - your desk, a drawer, one surface",
        duration = 5,
        category = "mental",
        energyLevel = "medium",
        tags = listOf("organize", "accomplishment"),
        icon = "🧹"
    ),
    BreakActivity(
        id = "music-dance",
        title = "Dance to One Song",
        description = "Put on your favorite song and move however feels good",
        duration = 5,
        category = "physical",
        energyLevel = "high",
        tags = listOf("fun", "dopamine", "movement"),
        icon = "🎵"
    ),
    BreakActivity(
        id = "pet-someone",
        title = "Pet Your Pet (or Plant)",
        description = "Spend quality time with a living thing. Plants count!",
        duration = 5,
        category = "social",
        energyLevel = "low",
        tags = listOf("connection", "calm"),
        icon = "🐱"
    ),
    BreakActivity(
        id = "healthy-snack",
        title = "Grab a Healthy Snack",
        description = "Something with protein or fruit. Fuel your brain.",
        duration = 5,
        category = "nourish",
        energyLevel = "low",
        tags = listOf("food", "energy"),
        icon = "🍎"
    ),
    BreakActivity(
        id = "text-friend",
        title = "Send a Quick Hello",
        description = "Text a friend something nice. Connection boosts mood.",
        duration = 5,
        category = "social",
        energyLevel = "low",
        tags = listOf("connection", "dopamine"),
        icon = "💬"
    ),
    BreakActivity(
        id = "meditate-short",
        title = "Mini Meditation",
        description = "Sit quietly. Focus on breath. When mind wanders, gently return.",
        duration = 5,
        category = "restful",
        energyLevel = "low",
        tags = listOf("calm", "mindfulness"),
        icon = "🧘‍♀️"
    ),
    BreakActivity(
        id = "wall-sit",
        title = "Wall Sit Challenge",
        description = "Back against wall, sit in imaginary chair. Hold as long as you can!",
        duration = 5,
        category = "physical",
        energyLevel = "high",
        tags = listOf("strength", "challenge"),
        icon = "🪑"
    ),
    // 10-minute activities
    BreakActivity(
        id = "power-pose",
        title = "Power Pose & Affirmations",
        description = "Stand tall, hands on hips. Say 3 things you're proud of",
        duration = 10,
        category = "mental",
        energyLevel = "medium",
        tags = listOf("confidence", "mindset"),
        icon = "💪"
    ),
    BreakActivity(
        id = "quick-shower",
        title = "Splash Face / Quick Refresh",
        description = "Cold water on your face. Wake up your nervous system.",
        duration = 10,
        category = "physical",
        energyLevel = "medium",
        tags = listOf("refresh", "alert"),
        icon = "🚿"
    ),
    BreakActivity(
        id = "meditate",
        title = "Meditation Session",
        description = "Sit quietly, focus on breath. When mind wanders, gently return.",
        duration = 10,
        category = "restful",
        energyLevel = "low",
        tags = listOf("calm", "focus"),
        icon = "🧘"
    ),
    BreakActivity(
        id = "journal-dump",
        title = "Brain Dump Journal",
        description = "Write down everything in your head. No filter, no judgment.",
        duration = 10,
        category = "mental",
        energyLevel = "low",
        tags = listOf("clarity", "processing"),
        icon = "📝"
    ),
    BreakActivity(
        id = "power-nap",
        title = "Power Nap",
        description = "Set alarm for 10-20 min. Don't oversleep!",
        duration = 10,
        category = "restful",
        energyLevel = "low",
        tags = listOf("rest", "recovery"),
        icon = "😴"
    ),
    BreakActivity(
        id = "read",
        title = "Read for Pleasure",
        description = "A few pages of a book (not work-related!)",
        duration = 10,
        category = "mental",
        energyLevel = "low",
        tags = listOf("relax", "learning"),
        icon = "📚"
    ),
    // 15-minute activities
    BreakActivity(
        id = "yoga-flow",
        title = "Quick Yoga Flow",
        description = "Follow a short yoga video or do your favorite stretches",
        duration = 15,
        category = "physical",
        energyLevel = "medium",
        tags = listOf("stretch", "strength", "calm"),
        icon = "🧘‍♀️"
    ),
    BreakActivity(
        id = "nature-walk",
        title = "Nature Walk",
        description = "Walk somewhere green. Notice 5 things you see, hear, feel.",
        duration = 15,
        category = "physical",
        energyLevel = "medium",
        tags = listOf("nature", "grounding", "movement"),
        icon = "🌳"
    ),
    BreakActivity(
        id = "read-fiction",
        title = "Read Something Fun",
        description = "A few pages of fiction. Let your brain escape somewhere else.",
        duration = 15,
        category = "restful",
        energyLevel = "low",
        tags = listOf("escape", "enjoyment"),
        icon = "📚"
    ),
    BreakActivity(
        id = "creative-doodle",
        title = "Doodle or Color",
        description = "No goal, no skill needed. Just make marks on paper.",
        duration = 15,
        category = "mental",
        energyLevel = "low",
        tags = listOf("creative", "calm"),
        icon = "🎨"
    ),
    BreakActivity(
        id = "workout",
        title = "Quick Workout",
        description = "Bodyweight exercises, resistance bands, or weights",
        duration = 15,
        category = "physical",
        energyLevel = "high",
        tags = listOf("strength", "cardio", "energy"),
        icon = "💪"
    ),
    BreakActivity(
        id = "bath",
        title = "Relaxing Bath",
        description = "Warm bath with Epsom salts. Let your muscles relax.",
        duration = 15,
        category = "restful",
        energyLevel = "low",
        tags = listOf("relax", "recovery"),
        icon = "🛁"
    ),
    BreakActivity(
        id = "call-loved-one",
        title = "Call a Loved One",
        description = "Have a real conversation with someone who matters",
        duration = 15,
        category = "social",
        energyLevel = "medium",
        tags = listOf("connection", "relationships"),
        icon = "☎️"
    ),
    BreakActivity(
        id = "cook",
        title = "Cook Something New",
        description = "Try a new recipe or technique. Enjoy the process!",
        duration = 15,
        category = "nourish",
        energyLevel = "medium",
        tags = listOf("creativity", "food"),
        icon = "👨‍🍳"
    )
)

val BREAK_CATEGORIES = listOf(
    BreakActivityCategory("all", "All", ""),
    BreakActivityCategory("physical", "Physical", "#dc2626"),
    BreakActivityCategory("mental", "Mental", "#2563eb"),
    BreakActivityCategory("restful", "Restful", "#7c3aed"),
    BreakActivityCategory("social", "Social", "#db2777"),
    BreakActivityCategory("nourish", "Nourish", "#16a34a"),
    BreakActivityCategory("eyes", "Eye Care", "#ca8a04")
)
