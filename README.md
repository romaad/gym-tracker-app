# GymTracker

A **cross-platform** React Native app for tracking Push/Pull/Legs gym workouts — runs on iOS **and** Android.

## Features

| Feature | Details |
|---------|---------|
| **Auto-Rest Timer** | Starts automatically after every logged set. Default 2.5 min, adjustable in Settings. Local notification (Notifee) fires when rest is over. |
| **AsyncStorage persistence** | `Routine`, `Exercise`, `WorkoutSession`, `SetLog` all persisted locally via `@react-native-async-storage/async-storage`. |
| **6 Pre-built Routines** | Push A/B, Pull A/B, Legs A/B – seeded on first launch. |
| **Smart Suggestions** | Shows last-session weight × reps for every exercise so you always know what to load. |
| **HealthKit** | Saves each finished session to Apple Health on iOS (degrades silently on Android). |
| **Routine Marketplace** | Browse, search, import, and publish custom PPL splits. |
| **Cross-platform** | Single codebase targets both iOS (17+) and Android (API 26+). |

## Project Structure

```
index.js               – App registry
App.tsx                – Root providers (Navigation, Timer, Workout)
src/
  types/models.ts      – TypeScript interfaces: Routine, Exercise, SetLog, WorkoutSession, SharedRoutine
  data/sampleData.ts   – buildSeedData() (6 PPL routines), MARKETPLACE_LISTINGS (4 community routines)
  storage/database.ts  – AsyncStorage CRUD helpers + seedIfNeeded(), getLastSetForExercise()
  context/
    TimerContext.tsx   – Global rest timer (setInterval + persisted default); start/cancel/formattedTime/progress
    WorkoutContext.tsx – Active session management; startSession, logSet (0-based), finishSession + HealthKit
  services/
    notificationService.ts – @notifee/react-native local notifications; bootstrap(), scheduleRestNotification()
    healthKitService.ts    – react-native-health wrapper (iOS only, safe no-op on Android)
  navigation/
    AppNavigator.tsx   – Bottom tab (Workout/History/Marketplace/Settings) + Home stack
  screens/
    HomeScreen.tsx           – Routine list grouped by Push/Pull/Legs; seeds data on first launch
    WorkoutSessionScreen.tsx – Active workout; floating timer strip; finish alert
    HistoryScreen.tsx        – Completed sessions (duration, set count)
    MarketplaceScreen.tsx    – Community routines; search, import, publish modal
    SettingsScreen.tsx       – Rest duration picker (7 presets)
  components/
    ExerciseRow.tsx          – Collapsible row with smart suggestion, logged sets, weight/reps input
    RestTimerBanner.tsx      – Header badge + RestTimerOverlay full-screen modal
```

## Requirements

- Node 18+
- React Native 0.74 CLI environment ([official setup guide](https://reactnative.dev/docs/environment-setup))
- iOS: Xcode 15+, iOS 17+ simulator or device
- Android: Android Studio, API 26+ AVD or device

## Getting Started

```bash
# 1. Install JS dependencies
npm install

# 2. iOS: install CocoaPods
cd ios && pod install && cd ..

# 3. Run on iOS simulator
npm run ios

# 4. Run on Android emulator
npm run android
```

### HealthKit (iOS)

Add the HealthKit capability in Xcode and include usage strings in `Info.plist`:

```xml
<key>NSHealthShareUsageDescription</key>
<string>GymTracker saves your workout sessions to Apple Health.</string>
<key>NSHealthUpdateUsageDescription</key>
<string>GymTracker writes workout data after each session.</string>
```

### Notifications (both platforms)

`@notifee/react-native` handles permissions automatically on first launch.  
On Android, no extra manifest changes are needed for React Native 0.74+.

## Tech Stack

| Concern | Library |
|---------|---------|
| Navigation | `@react-navigation/native`, `bottom-tabs`, `native-stack` |
| Persistence | `@react-native-async-storage/async-storage` |
| Notifications | `@notifee/react-native` |
| HealthKit | `react-native-health` |
| IDs | `uuid` |
| State | React Context (`TimerContext`, `WorkoutContext`) |

## Architecture

- **Context + hooks** – `TimerContext` owns the global countdown timer; `WorkoutContext` owns the active session and set logs.
- **Service layer** – `notificationService` and `healthKitService` isolate platform APIs behind stable interfaces.
- **Storage layer** – `database.ts` provides simple async CRUD over AsyncStorage; each entity type has its own storage key.
- **Dark-mode-first UI** – All colours are hardcoded to a dark palette (`#000`, `#1C1C1E`, `#F97316` orange accent).
