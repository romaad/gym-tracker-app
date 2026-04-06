import Foundation
import SwiftData

/// An exercise within a routine (e.g. "Bench Press").
@Model
final class Exercise: Identifiable {
    @Attribute(.unique) var id: UUID
    var name: String
    var targetMuscleGroup: String
    var defaultSets: Int
    var defaultReps: Int
    var order: Int                  // display order within the routine
    var restDurationSeconds: Int    // per-exercise override; 0 = use global default

    var routine: Routine?

    @Relationship(deleteRule: .cascade, inverse: \SetLog.exercise)
    var setLogs: [SetLog]

    init(
        id: UUID = UUID(),
        name: String,
        targetMuscleGroup: String,
        defaultSets: Int = 3,
        defaultReps: Int = 10,
        order: Int = 0,
        restDurationSeconds: Int = 0
    ) {
        self.id = id
        self.name = name
        self.targetMuscleGroup = targetMuscleGroup
        self.defaultSets = defaultSets
        self.defaultReps = defaultReps
        self.order = order
        self.restDurationSeconds = restDurationSeconds
        self.setLogs = []
    }
}
