import Foundation
import Combine
import WatchKit

/// Lightweight rest-timer for the watchOS app.
/// Mirrors state received from the phone via WatchConnectivity.
final class WatchRestTimerManager: ObservableObject {

    @Published var isRunning: Bool = false
    @Published var secondsRemaining: Int = 0
    @Published var totalSeconds: Int = 150

    private var timer: AnyCancellable?

    // MARK: - Start with a known remaining value (synced from phone)

    func startWith(secondsRemaining: Int) {
        cancel()
        totalSeconds = secondsRemaining
        self.secondsRemaining = secondsRemaining
        isRunning = true

        timer = Timer
            .publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                guard let self else { return }
                if self.secondsRemaining > 0 {
                    self.secondsRemaining -= 1
                } else {
                    self.finish()
                }
            }
    }

    func cancel() {
        timer?.cancel()
        timer = nil
        isRunning = false
        secondsRemaining = 0
    }

    // MARK: - Private

    private func finish() {
        isRunning = false
        secondsRemaining = 0
        timer?.cancel()
        timer = nil

        // Haptic tap on wrist
        WKInterfaceDevice.current().play(.notification)
    }

    // MARK: - Convenience

    var formattedTime: String {
        let m = secondsRemaining / 60
        let s = secondsRemaining % 60
        return String(format: "%d:%02d", m, s)
    }

    var progress: Double {
        guard totalSeconds > 0 else { return 0 }
        return Double(totalSeconds - secondsRemaining) / Double(totalSeconds)
    }
}
