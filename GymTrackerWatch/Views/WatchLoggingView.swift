import SwiftUI

/// Watch-native set logging view.
/// Uses the Digital Crown to adjust weight and reps quickly.
struct WatchLoggingView: View {

    @EnvironmentObject private var restTimer:    WatchRestTimerManager
    @EnvironmentObject private var connectivity: WatchConnectivityManager

    // Digital Crown focus
    @State private var crownValue: Double = 0
    @State private var crownField: CrownField = .weight
    @FocusState private var isFocused: Bool

    @State private var weight: Double = 20.0
    @State private var reps: Int      = 10
    @State private var confirmed      = false

    enum CrownField { case weight, reps }

    var body: some View {
        ScrollView {
            VStack(spacing: 10) {
                // Exercise name from phone
                Text(connectivity.exerciseName)
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                    .lineLimit(1)

                Text("Set \(connectivity.nextSetNumber)")
                    .font(.headline)

                Divider()

                // Weight picker
                HStack {
                    Text("Weight")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Text("\(weight, specifier: "%.1f") kg")
                        .font(.subheadline.bold())
                        .foregroundStyle(crownField == .weight ? .orange : .white)
                }
                .onTapGesture { crownField = .weight }

                // Reps picker
                HStack {
                    Text("Reps")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                    Spacer()
                    Text("\(reps)")
                        .font(.subheadline.bold())
                        .foregroundStyle(crownField == .reps ? .orange : .white)
                }
                .onTapGesture { crownField = .reps }

                Divider()

                if confirmed {
                    HStack {
                        Image(systemName: "checkmark.circle.fill")
                            .foregroundStyle(.green)
                        Text("Logged!")
                            .foregroundStyle(.green)
                    }
                    .font(.caption)
                } else {
                    Button("Log Set") {
                        logSet()
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.orange)
                    .font(.caption.bold())
                }
            }
            .padding(.horizontal, 4)
        }
        .focusable()
        .focused($isFocused)
        .digitalCrownRotation(
            $crownValue,
            from: -9999, through: 9999,
            by: crownField == .weight ? 0.5 : 1,
            sensitivity: .medium,
            isContinuous: true,
            isHapticFeedbackEnabled: true
        )
        .onChange(of: crownValue) { _, newVal in
            applyCrownDelta(newVal)
        }
        .onAppear {
            isFocused = true
            weight = connectivity.lastWeight > 0 ? connectivity.lastWeight : 20
            reps   = connectivity.lastReps   > 0 ? connectivity.lastReps   : 10
        }
    }

    // MARK: - Crown handling

    private func applyCrownDelta(_ value: Double) {
        switch crownField {
        case .weight:
            weight = max(0, weight + value * 0.5)
            crownValue = 0
        case .reps:
            reps = max(1, reps + Int(value))
            crownValue = 0
        }
    }

    // MARK: - Log action

    private func logSet() {
        connectivity.sendLoggedSet(
            exerciseID: "unknown",   // ID not available without SwiftData on watch
            weightKg: weight,
            reps: reps,
            setNumber: connectivity.nextSetNumber - 1
        )

        // Visual confirmation
        confirmed = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) {
            confirmed = false
            connectivity.nextSetNumber += 1
        }
    }
}
