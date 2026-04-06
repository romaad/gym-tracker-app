import Foundation
import WatchConnectivity
import WatchKit

/// watchOS-side WatchConnectivity delegate.
/// Receives timer state and exercise context from the phone and
/// sends logged sets back.
final class WatchConnectivityManager: NSObject, ObservableObject {

    @Published var exerciseName: String = "Waiting for phone…"
    @Published var currentExerciseID: String = ""
    @Published var nextSetNumber: Int   = 1
    @Published var lastWeight: Double   = 0
    @Published var lastReps: Int        = 0

    private weak var timerManager: WatchRestTimerManager?
    private let session: WCSession = .default

    func activate(timerManager: WatchRestTimerManager) {
        self.timerManager = timerManager
        guard WCSession.isSupported() else { return }
        session.delegate = self
        session.activate()
    }

    // MARK: - Send set log to phone

    func sendLoggedSet(exerciseID: String, weightKg: Double, reps: Int, setNumber: Int) {
        guard session.isReachable else { return }
        let payload: [String: Any] = [
            "type": "logSet",
            "exerciseID": exerciseID,
            "weightKg": weightKg,
            "reps": reps,
            "setNumber": setNumber,
        ]
        session.sendMessage(payload, replyHandler: nil, errorHandler: nil)
    }
}

// MARK: - WCSessionDelegate

extension WatchConnectivityManager: WCSessionDelegate {

    func session(_ session: WCSession,
                 activationDidCompleteWith activationState: WCSessionActivationState,
                 error: Error?) {}

    func session(_ session: WCSession, didReceiveMessage message: [String: Any]) {
        DispatchQueue.main.async {
            self.handle(message: message)
        }
    }

    func session(_ session: WCSession, didReceiveApplicationContext applicationContext: [String: Any]) {
        DispatchQueue.main.async {
            self.handle(message: applicationContext)
        }
    }

    private func handle(message: [String: Any]) {
        switch message["type"] as? String {
        case "timerState":
            let secs    = message["secondsRemaining"] as? Int ?? 0
            let running = message["isRunning"] as? Bool ?? false
            if running {
                timerManager?.startWith(secondsRemaining: secs)
            } else {
                timerManager?.cancel()
            }
        case "exerciseContext":
            exerciseName      = message["exerciseName"]  as? String ?? exerciseName
            currentExerciseID = message["exerciseID"]    as? String ?? currentExerciseID
            nextSetNumber     = message["setNumber"]      as? Int    ?? nextSetNumber
            lastWeight        = message["lastWeight"]     as? Double ?? lastWeight
            lastReps          = message["lastReps"]       as? Int    ?? lastReps
        default:
            break
        }
    }
}
