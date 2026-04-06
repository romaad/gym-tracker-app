# Copilot Gym Tracker App Prompt

**Role:** Expert iOS and watchOS Developer (Swift, SwiftUI, SwiftData, HealthKit).

**Task:** Build a native iOS app and a companion watchOS app for tracking gym workouts, specifically tailored to a Push/Pull/Legs (PPL) split.

## Core Features & Requirements

### 1. Auto-Rest Timer (Crucial)
- Every time a user logs a set (marks it as complete with weight and reps), the app MUST automatically start a 2.5-minute (150-second) countdown timer.
- This timer should be visible on both the Phone and the Watch.
- When the timer reaches zero, trigger a local notification with sound/haptics: "Rest Over! Time for your next set."

### 2. Workout Structure & Data Model (SwiftData)
- **Routines:** Pre-populated with Push A, Pull A, Legs A, Push B, Pull B, Legs B.
- **Exercises:** Name, target muscle group, default sets/reps target.
- **Logs:** Needs to record Timestamp, Weight (kg), and Reps for every single set.
- **Smart Suggestions:** When starting a new exercise, the UI must display the weight and reps achieved in the *last* logged session for that specific exercise to help the user know what weight to pick.

### 3. Apple Watch Integration
- The watchOS app should allow standalone logging.
- Quick input UI using the Digital Crown to adjust weight and reps quickly.
- Haptic taps on the wrist when the 2.5-minute rest timer expires.
- Real-time sync between the iOS app and watchOS app using `WatchConnectivity`.

### 4. User Interface (SwiftUI)
- Minimalist, dark-mode optimized design.
- "Current Workout" view showing a list of exercises for today's split.
- Expandable rows for each exercise to log Set 1, Set 2, Set 3, etc.
- A prominent, floating or pinned Rest Timer at the top/bottom of the screen when active.

### 5. HealthKit Integration
- Request permission to save Workouts.
- When a workout session is finished, save it to Apple Health with the total duration, start time, end time, and active calories burned.

## Getting Started
Please scaffold the Xcode project structure, define the `SwiftData` models, and implement the main `WorkoutSessionView` and `RestTimerManager` for both iOS and watchOS.