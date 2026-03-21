# Multi-Step Onboarding Flow

## Overview

The onboarding experience has been enhanced from a single screen to a comprehensive multi-step flow that personalizes the user experience based on their experience level and challenges.

## Flow Structure

### Step 1: Mode Selection (Existing, Enhanced)
Users choose between two primary focus modes:
- **Pomodoro Mode**: Structured work/break cycles (25-min sessions)
- **Focus Tracking Mode**: Flexible focus logging throughout the day

Both modes unlock at level 3, but users start with one to avoid overwhelm.

### Step 2: Experience Assessment
Users rate their familiarity with 5 core features on a 1-5 scale:
1. **Pomodoro Timer** - Work in focused sprints with timed breaks
2. **Body Doubling** - Work alongside others for accountability
3. **Goal Setting** - Set and track long-term objectives
4. **Task Lists** - Organize and prioritize tasks
5. **Focus Tracking** - Monitor attention throughout the day

**Purpose**: Helps tailor recommendations and avoid suggesting features they've already mastered.

### Step 3: Challenges Assessment
Users select up to 3 challenges they want to work on, ordered by priority:

Available challenges:
- **Staying focused for long periods** → Related: Pomodoro, Focus Tracking, Body Doubling
- **Getting started on tasks** → Related: Pomodoro, Task Lists, Body Doubling
- **Following through to completion** → Related: Task Lists, Goal Setting, Pomodoro
- **Mental clutter and forgetfulness** → Related: Task Lists, Goal Setting, Focus Tracking
- **Time blindness** → Related: Pomodoro, Focus Tracking
- **Inconsistent motivation** → Related: Goal Setting, Focus Tracking, Body Doubling
- **Feeling overwhelmed** → Related: Task Lists, Pomodoro, Goal Setting
- **Lack of accountability** → Related: Body Doubling, Goal Setting, Focus Tracking

**Purpose**: Maps user struggles to specific features that can help.

### Step 4: Personalized Recommendations
Based on the selected challenges, the system generates a customized plan:

**Features are recommended with**:
- A clear reason why it's recommended first
- Specific usage goals (e.g., "Complete 4 Pomodoro sessions per day")
- Duration commitment (e.g., "for 2 weeks")
- Unlock progression (complete one feature to unlock the next)

**Example recommendations**:
1. **Pomodoro Timer** (Priority 1): "Helps you build sustained attention and time awareness"
   - Commitment: 4 sessions/day for 2 weeks
   
2. **Task Lists & Brain Dump** (Priority 2): "Clears mental clutter by externalizing thoughts"
   - Commitment: Daily brain dump + morning review for 1 week
   
3. **Focus Tracking** (Priority 3): "Builds self-awareness about when you focus best"
   - Commitment: Log focus 3x daily for 2 weeks

## Technical Implementation

### New Files Created

#### Types & Data Structures
- `src/types/onboarding.ts` - Core types and recommendation logic
  - `FeatureExperience` - User's experience level with each feature
  - `SelectedChallenge` - Challenges user wants to work on
  - `FeatureRecommendation` - Generated recommendations with goals
  - `generateRecommendations()` - Algorithm to map challenges to features

#### UI Components
- `src/features/onboarding/ExperienceAssessment.tsx` - Step 2 UI
- `src/features/onboarding/ChallengesAssessment.tsx` - Step 3 UI
- `src/features/onboarding/Recommendations.tsx` - Step 4 UI
- `src/features/onboarding/OnboardingModal.tsx` - Main wrapper with navigation
- `src/features/onboarding/index.ts` - Exports

#### State Management
- Updated `src/stores/levelStore.ts` - Added `onboardingData` state and `saveOnboardingData()` action

#### Integration
- Updated `src/features/level/ModeSelector.tsx` - Now wraps `OnboardingModal`

### Recommendation Algorithm

The `generateRecommendations()` function:
1. Counts feature mentions across selected challenges
2. Applies business logic for specific challenge combinations
3. Prioritizes based on mode selection (Pomodoro vs Focus Tracking)
4. Returns ordered list with usage goals and durations

### Data Persistence

Currently, onboarding data is saved to:
- **Zustand store** (client-side): `onboardingData` in `levelStore`

Future enhancement: Save to backend via API endpoint for cross-device sync.

## User Experience

### Progress Indicators
- Visual progress bar showing step completion
- "Step X of 4" counter
- Animated transitions between steps

### Validation
- Step 1: All features must be rated before proceeding
- Step 2: At least 1 challenge must be selected (max 3)
- Step 3: Review and confirm recommendations

### Accessibility
- Keyboard navigation support
- Clear visual feedback for selections
- Descriptive labels and help text

## Future Enhancements

1. **Backend Integration**: Save full onboarding data to user profile
2. **Dynamic Adjustments**: Re-assess challenges after completing first phase
3. **Progress Tracking**: Show users how they're progressing through their personalized plan
4. **Nudge Integration**: Use onboarding data to personalize AI nudge content
5. **A/B Testing**: Test different recommendation algorithms

## Usage

The onboarding modal automatically appears when `needsOnboarding` is true (i.e., `hasSeenOnboarding === false`).

```typescript
// In App.tsx
<ModeSelectorWrapper show={needsOnboarding} />

// ModeSelector now renders the full multi-step onboarding
```

## Design Principles

1. **Progressive Disclosure**: Only show one step at a time to avoid overwhelm
2. **Personalization**: Every user gets a unique plan based on their input
3. **Clear Expectations**: Users know exactly what's expected before they start
4. **Gamification**: Unlock system creates anticipation and rewards consistency
5. **ADHD-Friendly**: 
   - Short, focused steps
   - Visual progress indicators
   - Immediate feedback
   - No judgment (all experience levels are valid)
