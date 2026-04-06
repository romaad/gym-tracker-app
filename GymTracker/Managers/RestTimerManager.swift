import Foundation
import Combine
import UserNotifications

/// Manages the auto-rest countdown timer that starts each time the user logs a set.
/// Publishes state that both `WorkoutSessionView` (iOS) and the watchOS companion consume.
final class RestTimerManager: ObservableObject {

    // MARK: - Published state

    @Published var isRunning: Bool = false
    @Published var secondsRemaining: Int = 0
    @Published var totalSeconds: Int = 150   // default 2.5 min

    // MARK: - Private

    private var timer: AnyCancellable?
    private var backgroundTask: UIBackgroundTaskIdentifier = .invalid

    // MARK: - Default duration (user-configurable, persisted in UserDefaults)

    static let defaultRestKey = "defaultRestSeconds"

    var defaultRestSeconds: Int {
        get {
            let v = UserDefaults.standard.integer(forKey: Self.defaultRestKey)
            return v > 0 ? v : 150
        }
        set {
            UserDefaults.standard.set(newValue, forKey: Self.defaultRestKey)
        }
    }

    // MARK: - Public API

    /// Start (or restart) the timer.
    /// - Parameter duration: seconds to count down. Pass `nil` to use the default.
    func start(duration: Int? = nil) {
        cancel()
        let secs = duration ?? defaultRestSeconds
        totalSeconds = secs
        secondsRemaining = secs
        isRunning = true

        scheduleNotification(after: secs)
        beginBackgroundTask()

        timer = Timer
            .publish(every: 1, on: .main, in: .common)
            .autoconnect()
            .sink { [weak self] _ in
                guard let self else { return }
                if self.secondsRemaining > 0 {
                    self.secondsRemaining -= 1
                } else {
                    self.timerDidFinish()
                }
            }
    }

    /// Cancel the timer and pending notification.
    func cancel() {
        timer?.cancel()
        timer = nil
        isRunning = false
        secondsRemaining = 0
        UNUserNotificationCenter.current().removePendingNotificationRequests(withIdentifiers: ["rest-timer"])
        endBackgroundTask()
    }

    // MARK: - Private helpers

    private func timerDidFinish() {
        isRunning = false
        secondsRemaining = 0
        timer?.cancel()
        timer = nil
        endBackgroundTask()
    }

    private func scheduleNotification(after seconds: Int) {
        let center = UNUserNotificationCenter.current()
        center.removePendingNotificationRequests(withIdentifiers: ["rest-timer"])

        let content = UNMutableNotificationContent()
        content.title = "Rest Over! 💪"
        content.body = "Time for your next set."
        content.sound = .default

        let trigger = UNTimeIntervalNotificationTrigger(timeInterval: TimeInterval(seconds), repeats: false)
        let request = UNNotificationRequest(identifier: "rest-timer", content: content, trigger: trigger)
        center.add(request)
    }

    private func beginBackgroundTask() {
        backgroundTask = UIApplication.shared.beginBackgroundTask(withName: "RestTimer") { [weak self] in
            self?.endBackgroundTask()
        }
    }

    private func endBackgroundTask() {
        if backgroundTask != .invalid {
            UIApplication.shared.endBackgroundTask(backgroundTask)
            backgroundTask = .invalid
        }
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
