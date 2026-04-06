import SwiftUI
import SwiftData

/// A collapsible row for a single exercise. Displays smart weight/rep suggestions
/// from the last session and lets the user log each set.
struct ExerciseRowView: View {

    let exercise: Exercise
    let session: WorkoutSession?
    let isExpanded: Bool
    let onToggleExpand: () -> Void
    let onSetLogged: (Double, Int, Int) -> Void   // (weightKg, reps, setNumber)

    // MARK: - Persisted logs for this session

    @Environment(\.modelContext) private var context
    @Query private var allLogs: [SetLog]

    // Logs for this exercise in the current session
    private var sessionLogs: [SetLog] {
        allLogs.filter { $0.exercise?.id == exercise.id && $0.session?.id == session?.id }
              .sorted { $0.setNumber < $1.setNumber }
    }

    // MARK: - Smart suggestions: last *previous* session weight/reps

    @Query(sort: \SetLog.timestamp, order: .reverse) private var historicLogs: [SetLog]

    private var lastSessionSuggestion: SetLog? {
        historicLogs.first {
            $0.exercise?.id == exercise.id && $0.session?.id != session?.id
        }
    }

    // MARK: - Local input state

    @State private var inputWeight: String = ""
    @State private var inputReps: String   = ""

    // MARK: - Body

    var body: some View {
        VStack(alignment: .leading, spacing: 0) {
            // Header row (always visible)
            headerRow

            // Expanded content
            if isExpanded {
                Divider().padding(.horizontal)
                expandedContent
                    .transition(.opacity.combined(with: .move(edge: .top)))
            }
        }
        .background(Color(.secondarySystemBackground))
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .padding(.horizontal)
        .padding(.vertical, 4)
        .onAppear { prefillFromSuggestion() }
    }

    // MARK: - Header

    private var headerRow: some View {
        Button(action: onToggleExpand) {
            HStack {
                VStack(alignment: .leading, spacing: 2) {
                    Text(exercise.name)
                        .font(.headline)
                        .foregroundStyle(.primary)
                    Text(exercise.targetMuscleGroup)
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Spacer()
                // Sets completed badge
                Text("\(sessionLogs.count)/\(exercise.defaultSets)")
                    .font(.caption.bold())
                    .padding(.horizontal, 8)
                    .padding(.vertical, 4)
                    .background(sessionLogs.count >= exercise.defaultSets ? Color.green : Color.orange)
                    .foregroundStyle(.black)
                    .clipShape(Capsule())

                Image(systemName: isExpanded ? "chevron.up" : "chevron.down")
                    .foregroundStyle(.secondary)
                    .padding(.leading, 4)
            }
            .padding()
        }
        .buttonStyle(.plain)
    }

    // MARK: - Expanded content

    private var expandedContent: some View {
        VStack(alignment: .leading, spacing: 12) {
            // Smart suggestion banner
            if let sug = lastSessionSuggestion {
                HStack {
                    Image(systemName: "lightbulb.fill")
                        .foregroundStyle(.yellow)
                    Text("Last time: \(sug.weightKg.formatted()) kg × \(sug.reps) reps")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .padding(.horizontal)
                .padding(.top, 8)
            }

            // Logged sets
            if !sessionLogs.isEmpty {
                loggedSetsSection
            }

            // Input row for next set
            if sessionLogs.count < exercise.defaultSets {
                inputRow
            }
        }
        .padding(.bottom, 12)
    }

    private var loggedSetsSection: some View {
        VStack(spacing: 4) {
            ForEach(sessionLogs) { log in
                HStack {
                    Text("Set \(log.setNumber + 1)")
                        .font(.caption.bold())
                        .foregroundStyle(.secondary)
                        .frame(width: 45, alignment: .leading)
                    Text("\(log.weightKg.formatted()) kg")
                        .font(.subheadline)
                    Text("×")
                        .foregroundStyle(.secondary)
                    Text("\(log.reps) reps")
                        .font(.subheadline)
                    Spacer()
                    Image(systemName: "checkmark.circle.fill")
                        .foregroundStyle(.green)
                }
                .padding(.horizontal)
            }
        }
    }

    private var inputRow: some View {
        VStack(spacing: 10) {
            Text("Set \(sessionLogs.count + 1) of \(exercise.defaultSets)")
                .font(.caption)
                .foregroundStyle(.secondary)
                .frame(maxWidth: .infinity, alignment: .center)

            HStack(spacing: 12) {
                // Weight input
                VStack(spacing: 2) {
                    Text("Weight (kg)")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                    TextField("0.0", text: $inputWeight)
                        .keyboardType(.decimalPad)
                        .multilineTextAlignment(.center)
                        .frame(width: 80)
                        .padding(8)
                        .background(Color(.tertiarySystemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }

                // Reps input
                VStack(spacing: 2) {
                    Text("Reps")
                        .font(.caption2)
                        .foregroundStyle(.tertiary)
                    TextField("\(exercise.defaultReps)", text: $inputReps)
                        .keyboardType(.numberPad)
                        .multilineTextAlignment(.center)
                        .frame(width: 60)
                        .padding(8)
                        .background(Color(.tertiarySystemBackground))
                        .clipShape(RoundedRectangle(cornerRadius: 8))
                }

                // Log button
                Button {
                    logSet()
                } label: {
                    Label("Log Set", systemImage: "plus.circle.fill")
                        .font(.subheadline.bold())
                        .padding(.horizontal, 14)
                        .padding(.vertical, 10)
                        .background(Color.orange)
                        .foregroundStyle(.black)
                        .clipShape(Capsule())
                }
                .disabled(inputWeight.isEmpty)
            }
            .padding(.horizontal)
        }
    }

    // MARK: - Actions

    private func logSet() {
        let weight = Double(inputWeight) ?? 0
        let reps   = Int(inputReps) ?? exercise.defaultReps
        let setNum = sessionLogs.count
        onSetLogged(weight, reps, setNum)

        // Reset input for next set (keep weight, clear reps)
        inputReps = ""
    }

    private func prefillFromSuggestion() {
        guard let sug = lastSessionSuggestion else { return }
        if inputWeight.isEmpty { inputWeight = sug.weightKg.formatted() }
        if inputReps.isEmpty   { inputReps   = "\(sug.reps)" }
    }
}
