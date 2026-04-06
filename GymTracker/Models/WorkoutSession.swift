import Foundation
import SwiftData

/// A single gym session tied to a routine.
@Model
final class WorkoutSession: Identifiable {
    @Attribute(.unique) var id: UUID
    var startDate: Date
    var endDate: Date?
    var routine: Routine?

    @Relationship(deleteRule: .cascade, inverse: \SetLog.session)
    var setLogs: [SetLog]

    /// Computed total active seconds (derived from HKWorkout if available).
    var durationSeconds: Double {
        guard let end = endDate else { return Date().timeIntervalSince(startDate) }
        return end.timeIntervalSince(startDate)
    }

    /// Estimated active calories (populated after HealthKit save).
    var activeCalories: Double

    init(id: UUID = UUID(), startDate: Date = Date(), routine: Routine? = nil) {
        self.id = id
        self.startDate = startDate
        self.endDate = nil
        self.routine = routine
        self.setLogs = []
        self.activeCalories = 0
    }
}
