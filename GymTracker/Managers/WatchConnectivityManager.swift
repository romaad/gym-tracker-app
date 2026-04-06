import Foundation
import WatchConnectivity

/// Bridges the iOS app and the watchOS companion using WatchConnectivity.
/// Sends timer state and new set-log events to the watch, and receives
/// set logs logged natively on the watch.
final class WatchConnectivityManager: NSObject, ObservableObject {

    // MARK: - Published state (reflects what the watch reports)

    @Published var watchReachable: Bool = false
    @Published var lastReceivedSets: [WatchSetPayload] = []

    // MARK: - Session

    private let session: WCSession = .default

    func activate() {
        guard WCSession.isSupported() else { return }
        session.delegate = self
        session.activate()
    }

    // MARK: - Sending to watch

    /// Sends the current timer state so the watch face can mirror it.
    func sendTimerState(secondsRemaining: Int, isRunning: Bool) {
        guard session.isReachable else { return }
        let payload: [String: Any] = [
            "type": "timerState",
            "secondsRemaining": secondsRemaining,
            "isRunning": isRunning,
        ]
        session.sendMessage(payload, replyHandler: nil, errorHandler: nil)
    }

    /// Sends the current exercise context so the watch can display it.
    func sendExerciseContext(exerciseID: String, exerciseName: String, setNumber: Int, lastWeight: Double, lastReps: Int) {
        guard session.isReachable else { return }
        let payload: [String: Any] = [
            "type": "exerciseContext",
            "exerciseID": exerciseID,
            "exerciseName": exerciseName,
            "setNumber": setNumber,
            "lastWeight": lastWeight,
            "lastReps": lastReps,
        ]
        session.sendMessage(payload, replyHandler: nil, errorHandler: nil)
    }

    /// Transfers application context (used when watch is not reachable).
    func updateApplicationContext(secondsRemaining: Int, isRunning: Bool) {
        let ctx: [String: Any] = [
            "secondsRemaining": secondsRemaining,
            "isRunning": isRunning,
        ]
        try? session.updateApplicationContext(ctx)
    }
}

// MARK: - WCSessionDelegate

extension WatchConnectivityManager: WCSessionDelegate {

    func session(_ session: WCSession,
                 activationDidCompleteWith activationState: WCSessionActivationState,
                 error: Error?) {
        DispatchQueue.main.async {
            self.watchReachable = (activationState == .activated) && session.isReachable
        }
    }

    func sessionReachabilityDidChange(_ session: WCSession) {
        DispatchQueue.main.async {
            self.watchReachable = session.isReachable
        }
    }

    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        guard let type = message["type"] as? String else { return }
        if type == "logSet", let payload = WatchSetPayload(message: message) {
            DispatchQueue.main.async {
                self.lastReceivedSets.append(payload)
            }
        }
    }

    // Required on iOS only
    func sessionDidBecomeInactive(_ session: WCSession) {}
    func sessionDidDeactivate(_ session: WCSession) {
        session.activate()
    }
}

// MARK: - Data transfer object

struct WatchSetPayload: Identifiable {
    let id: UUID
    let exerciseID: UUID
    let weightKg: Double
    let reps: Int
    let setNumber: Int

    init?(message: [String: Any]) {
        guard
            let idStr  = message["exerciseID"] as? String,
            let exID   = UUID(uuidString: idStr),
            let weight = message["weightKg"] as? Double,
            let reps   = message["reps"] as? Int,
            let setNum = message["setNumber"] as? Int
        else { return nil }

        self.id          = UUID()
        self.exerciseID  = exID
        self.weightKg    = weight
        self.reps        = reps
        self.setNumber   = setNum
    }
}
