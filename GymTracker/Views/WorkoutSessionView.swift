import SwiftUI
import SwiftData

/// The main workout screen – shows all exercises for the chosen routine,
/// tracks the active session, and coordinates the rest timer.
struct WorkoutSessionView: View {

    let routine: Routine

    // MARK: - Environment

    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss
    @EnvironmentObject private var restTimer: RestTimerManager
    @EnvironmentObject private var connectivity: WatchConnectivityManager
    @EnvironmentObject private var healthKit: HealthKitManager

    // MARK: - Session state

    @State private var session: WorkoutSession?
    @State private var expandedExerciseID: UUID?
    @State private var showFinishAlert = false
    @State private var showTimerSheet = false

    // MARK: - Sorted exercises

    private var sortedExercises: [Exercise] {
        routine.exercises.sorted { $0.order < $1.order }
    }

    // MARK: - Body

    var body: some View {
        ZStack(alignment: .bottom) {
            // Exercise list
            List {
                ForEach(sortedExercises) { exercise in
                    ExerciseRowView(
                        exercise: exercise,
                        session: session,
                        isExpanded: expandedExerciseID == exercise.id,
                        onToggleExpand: {
                            withAnimation(.spring()) {
                                expandedExerciseID = (expandedExerciseID == exercise.id) ? nil : exercise.id
                            }
                        },
                        onSetLogged: { weightKg, reps, setNumber in
                            logSet(exercise: exercise, weightKg: weightKg, reps: reps, setNumber: setNumber)
                        }
                    )
                    .listRowBackground(Color.black.opacity(0.001)) // transparent tap area
                }
            }
            .listStyle(.plain)
            .padding(.bottom, restTimer.isRunning ? 80 : 0)
        }
        .navigationTitle(routine.name)
        .navigationBarTitleDisplayMode(.inline)
        .toolbar {
            ToolbarItem(placement: .topBarTrailing) {
                Button("Finish", role: .destructive) {
                    showFinishAlert = true
                }
                .tint(.orange)
            }
        }
        .alert("Finish Workout?", isPresented: $showFinishAlert) {
            Button("Finish", role: .destructive) { finishSession() }
            Button("Cancel", role: .cancel) {}
        } message: {
            Text("This will end your session and save it to Apple Health.")
        }
        .onAppear(perform: startSession)
        .onDisappear { restTimer.cancel() }
    }

    // MARK: - Session lifecycle

    private func startSession() {
        let newSession = WorkoutSession(startDate: Date(), routine: routine)
        context.insert(newSession)
        try? context.save()
        session = newSession
    }

    private func finishSession() {
        guard let session else { return }
        session.endDate = Date()
        try? context.save()

        restTimer.cancel()

        // Save to HealthKit
        healthKit.save(session: session) { _, _ in }

        dismiss()
    }

    // MARK: - Logging a set

    private func logSet(exercise: Exercise, weightKg: Double, reps: Int, setNumber: Int) {
        guard let session else { return }

        let log = SetLog(
            weightKg: weightKg,
            reps: reps,
            setNumber: setNumber,
            exercise: exercise,
            session: session
        )
        context.insert(log)
        try? context.save()

        // Determine rest duration (per-exercise override or global default)
        let restSecs = exercise.restDurationSeconds > 0
            ? exercise.restDurationSeconds
            : restTimer.defaultRestSeconds
        restTimer.start(duration: restSecs)

        // Sync to watch
        connectivity.sendTimerState(secondsRemaining: restSecs, isRunning: true)
        connectivity.sendExerciseContext(
            exerciseID: exercise.id.uuidString,
            exerciseName: exercise.name,
            setNumber: setNumber + 1,
            lastWeight: weightKg,
            lastReps: reps
        )
    }
}
