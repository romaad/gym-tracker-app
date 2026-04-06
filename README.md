# GymTracker

A native iOS + watchOS app for tracking Push/Pull/Legs gym workouts.

## Features

| Feature | Details |
|---------|---------|
| **Auto-Rest Timer** | Starts automatically after every logged set. Default 2.5 min, configurable globally or per-exercise. Local notification + haptics when rest is over. |
| **SwiftData models** | `Routine`, `Exercise`, `WorkoutSession`, `SetLog` – full relational graph persisted on-device. |
| **6 Pre-built Routines** | Push A/B, Pull A/B, Legs A/B – immediately ready after first launch. |
| **Smart Suggestions** | Shows last-session weight × reps for every exercise so you always know what to load. |
| **Apple Watch** | Standalone set logging with Digital Crown adjustment. Haptic tap when rest expires. Real-time sync via WatchConnectivity. |
| **HealthKit** | Saves each finished session as an `HKWorkout` (Traditional Strength Training) with duration and estimated active calories. |
| **Routine Marketplace** | Browse, import, and publish custom PPL splits. Search by name, author, or category. |

## Project Structure

```
GymTracker.xcodeproj/        – Xcode project
GymTracker/
  GymTrackerApp.swift        – @main App entry point
  Models/
    Routine.swift            – @Model: name, category, variant, marketplace fields
    Exercise.swift           – @Model: name, muscle group, sets/reps, rest override
    WorkoutSession.swift     – @Model: session tied to routine + set logs
    SetLog.swift             – @Model: timestamp, weight (kg), reps, set number
    SharedRoutinePayload.swift – Codable DTO for Marketplace sharing
  Managers/
    RestTimerManager.swift   – Combine countdown, UNNotification, background task
    HealthKitManager.swift   – HKWorkout save with active-energy sample
    WatchConnectivityManager.swift – iOS ↔ Watch bridge
  Views/
    ContentView.swift        – Tab bar + floating rest-timer banner
    RoutineSelectionView.swift
    WorkoutSessionView.swift – Active session + finish flow
    ExerciseRowView.swift    – Collapsible row with set logging
    RestTimerView.swift      – Animated ring banner + full-screen sheet
    MarketplaceView.swift    – Community routine sharing
    MarketplaceViewModel.swift
  Resources/
    SampleData.swift         – Pre-populates 6 PPL routines on first launch
    Info.plist               – HealthKit usage strings
    GymTracker.entitlements  – HealthKit capability
GymTrackerWatch/
  GymTrackerWatchApp.swift
  Managers/
    WatchConnectivityManager.swift – Receives timer/exercise state from phone
    WatchRestTimerManager.swift    – Mirrors timer; haptic on expiry
  Views/
    WatchContentView.swift   – PageTabView: timer page + logging page
    WatchTimerView.swift     – Circular progress ring + Skip
    WatchLoggingView.swift   – Digital Crown weight/reps; logs set to phone
```

## Requirements

- Xcode 15+
- iOS 17+ deployment target
- watchOS 10+ deployment target
- HealthKit capability (configured in `GymTracker.entitlements`)
- A physical device or simulator for WatchConnectivity testing

## Getting Started

1. Open `GymTracker.xcodeproj` in Xcode 15.
2. Select your development team in both targets' **Signing & Capabilities**.
3. Build and run the **GymTracker** scheme on an iPhone (iOS 17+).
4. Build and run the **GymTrackerWatch** scheme on a paired Apple Watch (watchOS 10+).
5. On first launch the app seeds all 6 PPL routines automatically.
6. Grant HealthKit permission when prompted.

## Architecture

- **SwiftUI + SwiftData** – full reactive data stack, no UIKit.
- **Combine** – powers the countdown timer (`Timer.publish`) and reactive state propagation.
- **WatchConnectivity** – bidirectional messaging; timer state pushed to watch, set logs returned to phone.
- **UserNotifications** – scheduled local notification when rest period ends.
- **HealthKit** – `HKWorkoutBuilder` API used to write sessions.
- **MVVM-ish** – views read `@Query` directly from SwiftData; side-effect logic lives in `ObservableObject` managers injected as environment objects.
