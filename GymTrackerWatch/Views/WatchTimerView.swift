import SwiftUI

/// Full-screen rest timer for the Apple Watch.
/// Shows a circular progress ring and the remaining time.
struct WatchTimerView: View {
    @EnvironmentObject private var timer: WatchRestTimerManager

    var body: some View {
        ZStack {
            if timer.isRunning {
                activeTimerView
            } else {
                idleView
            }
        }
    }

    // MARK: - Active state

    private var activeTimerView: some View {
        VStack(spacing: 6) {
            ZStack {
                // Background ring
                Circle()
                    .stroke(Color.white.opacity(0.15), lineWidth: 6)

                // Progress ring
                Circle()
                    .trim(from: 0, to: 1 - timer.progress)
                    .stroke(
                        AngularGradient(colors: [.orange, .yellow, .orange], center: .center),
                        style: StrokeStyle(lineWidth: 6, lineCap: .round)
                    )
                    .rotationEffect(.degrees(-90))
                    .animation(.linear(duration: 1), value: timer.progress)

                // Time label
                VStack(spacing: 0) {
                    Text(timer.formattedTime)
                        .font(.system(.title2, design: .rounded).weight(.bold))
                        .monospacedDigit()
                        .foregroundStyle(.white)
                    Text("rest")
                        .font(.caption2)
                        .foregroundStyle(.secondary)
                }
            }
            .frame(width: 100, height: 100)

            Button("Skip") {
                timer.cancel()
            }
            .font(.caption.bold())
            .foregroundStyle(.orange)
            .buttonStyle(.plain)
        }
        .padding()
    }

    // MARK: - Idle state

    private var idleView: some View {
        VStack(spacing: 8) {
            Image(systemName: "timer")
                .font(.largeTitle)
                .foregroundStyle(.orange)
            Text("Rest timer\nwaiting…")
                .font(.caption)
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
        }
    }
}
