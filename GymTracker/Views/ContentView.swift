import SwiftUI
import SwiftData

/// Top-level navigation for the iOS app.
struct ContentView: View {

    @EnvironmentObject private var restTimer: RestTimerManager

    var body: some View {
        TabView {
            // Today's workout
            RoutineSelectionView()
                .tabItem {
                    Label("Workout", systemImage: "dumbbell.fill")
                }

            // History
            HistoryView()
                .tabItem {
                    Label("History", systemImage: "clock.fill")
                }

            // Marketplace
            MarketplaceView()
                .tabItem {
                    Label("Marketplace", systemImage: "square.grid.2x2.fill")
                }

            // Settings
            SettingsView()
                .tabItem {
                    Label("Settings", systemImage: "gearshape.fill")
                }
        }
        .tint(.orange)
        .preferredColorScheme(.dark)
        .overlay(alignment: .top) {
            if restTimer.isRunning {
                RestTimerBanner()
                    .transition(.move(edge: .top).combined(with: .opacity))
                    .animation(.spring(), value: restTimer.isRunning)
            }
        }
    }
}

// MARK: - History stub

struct HistoryView: View {
    @Query(sort: \WorkoutSession.startDate, order: .reverse)
    private var sessions: [WorkoutSession]

    var body: some View {
        NavigationStack {
            List {
                if sessions.isEmpty {
                    ContentUnavailableView(
                        "No workouts yet",
                        systemImage: "calendar.badge.clock",
                        description: Text("Complete a session to see your history here.")
                    )
                } else {
                    ForEach(sessions) { session in
                        VStack(alignment: .leading, spacing: 4) {
                            Text(session.routine?.name ?? "Workout")
                                .font(.headline)
                            Text(session.startDate.formatted(date: .abbreviated, time: .shortened))
                                .font(.caption)
                                .foregroundStyle(.secondary)
                            Text("\(Int(session.durationSeconds / 60)) min · \(session.setLogs.count) sets")
                                .font(.caption2)
                                .foregroundStyle(.tertiary)
                        }
                        .padding(.vertical, 4)
                    }
                }
            }
            .navigationTitle("History")
        }
    }
}

// MARK: - Settings stub

struct SettingsView: View {
    @EnvironmentObject private var restTimer: RestTimerManager

    private let options: [(label: String, seconds: Int)] = [
        ("1:00", 60), ("1:30", 90), ("2:00", 120),
        ("2:30", 150), ("3:00", 180), ("3:30", 210), ("4:00", 240),
    ]

    var body: some View {
        NavigationStack {
            Form {
                Section("Default Rest Timer") {
                    Picker("Duration", selection: Binding(
                        get: { restTimer.defaultRestSeconds },
                        set: { restTimer.defaultRestSeconds = $0 }
                    )) {
                        ForEach(options, id: \.seconds) { option in
                            Text(option.label).tag(option.seconds)
                        }
                    }
                    .pickerStyle(.wheel)
                }

                Section("About") {
                    LabeledContent("Version", value: "1.0")
                    LabeledContent("Build", value: "1")
                }
            }
            .navigationTitle("Settings")
        }
    }
}
