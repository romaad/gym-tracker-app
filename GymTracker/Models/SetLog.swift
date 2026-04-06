import Foundation
import SwiftData

/// A single logged set: timestamp, weight, and reps.
@Model
final class SetLog: Identifiable {
    @Attribute(.unique) var id: UUID
    var timestamp: Date
    var weightKg: Double
    var reps: Int
    var setNumber: Int

    var exercise: Exercise?
    var session: WorkoutSession?

    init(
        id: UUID = UUID(),
        timestamp: Date = Date(),
        weightKg: Double,
        reps: Int,
        setNumber: Int,
        exercise: Exercise? = nil,
        session: WorkoutSession? = nil
    ) {
        self.id = id
        self.timestamp = timestamp
        self.weightKg = weightKg
        self.reps = reps
        self.setNumber = setNumber
        self.exercise = exercise
        self.session = session
    }
}
