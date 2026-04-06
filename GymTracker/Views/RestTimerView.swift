import SwiftUI

// MARK: - Floating banner (pinned at top when timer is active)

/// Compact banner displayed at the very top of ContentView while the rest timer runs.
struct RestTimerBanner: View {
    @EnvironmentObject private var timer: RestTimerManager

    var body: some View {
        HStack(spacing: 12) {
            // Circular progress ring
            ZStack {
                Circle()
                    .stroke(Color.white.opacity(0.15), lineWidth: 3)
                Circle()
                    .trim(from: 0, to: 1 - timer.progress)
                    .stroke(Color.orange, style: StrokeStyle(lineWidth: 3, lineCap: .round))
                    .rotationEffect(.degrees(-90))
                    .animation(.linear(duration: 1), value: timer.progress)
            }
            .frame(width: 30, height: 30)

            Text("Rest: \(timer.formattedTime)")
                .font(.subheadline.bold())
                .foregroundStyle(.white)
                .monospacedDigit()

            Spacer()

            Button("Skip") {
                timer.cancel()
            }
            .font(.caption.bold())
            .foregroundStyle(.orange)
        }
        .padding(.horizontal, 16)
        .padding(.vertical, 10)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 14))
        .padding(.horizontal, 12)
        .padding(.top, 8)
        .shadow(radius: 4)
    }
}

// MARK: - Full-screen timer sheet

/// Full-screen rest timer view, shown from `WorkoutSessionView` on tap.
struct RestTimerView: View {
    @EnvironmentObject private var timer: RestTimerManager
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 40) {
                Text("Rest Timer")
                    .font(.title2.bold())
                    .foregroundStyle(.white)

                // Large ring
                ZStack {
                    Circle()
                        .stroke(Color.white.opacity(0.1), lineWidth: 14)
                        .frame(width: 220, height: 220)

                    Circle()
                        .trim(from: 0, to: 1 - timer.progress)
                        .stroke(
                            LinearGradient(colors: [.orange, .yellow], startPoint: .top, endPoint: .bottom),
                            style: StrokeStyle(lineWidth: 14, lineCap: .round)
                        )
                        .frame(width: 220, height: 220)
                        .rotationEffect(.degrees(-90))
                        .animation(.linear(duration: 1), value: timer.progress)

                    VStack(spacing: 4) {
                        Text(timer.formattedTime)
                            .font(.system(size: 60, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)
                            .monospacedDigit()

                        Text("remaining")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                }

                // Controls
                HStack(spacing: 30) {
                    Button {
                        timer.start(duration: timer.totalSeconds)
                    } label: {
                        Label("Restart", systemImage: "arrow.clockwise.circle.fill")
                            .font(.headline)
                    }
                    .buttonStyle(.bordered)
                    .tint(.white)

                    Button {
                        timer.cancel()
                        dismiss()
                    } label: {
                        Label("Skip", systemImage: "forward.fill")
                            .font(.headline)
                    }
                    .buttonStyle(.borderedProminent)
                    .tint(.orange)
                }
            }
            .padding()
        }
        .presentationDetents([.medium])
    }
}
