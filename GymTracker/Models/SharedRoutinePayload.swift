import Foundation
import SwiftData

// MARK: - Transfer object used for Marketplace sharing

/// A Codable snapshot of a routine that can be serialised to JSON and shared
/// via the Marketplace.  It is *not* a SwiftData model – it lives in memory
/// only and is converted to/from `Routine` on import/export.
struct SharedRoutinePayload: Codable, Identifiable {

    var id: String                      // stable UUID string
    var name: String
    var category: String                // "Push" / "Pull" / "Legs"
    var variant: String                 // "A" / "B"
    var authorName: String
    var exercises: [SharedExercisePayload]
    var publishedAt: Date
    var downloadCount: Int

    init(from routine: Routine, authorName: String) {
        self.id            = routine.id.uuidString
        self.name          = routine.name
        self.category      = routine.category.rawValue
        self.variant       = routine.variant
        self.authorName    = authorName
        self.exercises     = routine.exercises
                                    .sorted { $0.order < $1.order }
                                    .map { SharedExercisePayload(from: $0) }
        self.publishedAt   = Date()
        self.downloadCount = 0
    }

    /// Converts this payload back into SwiftData `Routine` + `Exercise` objects.
    func toRoutine(context: ModelContext) -> Routine {
        let cat = RoutineCategory(rawValue: category) ?? .push
        let routine = Routine(
            name: name,
            category: cat,
            variant: variant,
            isCustom: true,
            authorName: authorName,
            shareID: id
        )
        context.insert(routine)
        for (idx, ex) in exercises.enumerated() {
            let exercise = Exercise(
                name: ex.name,
                targetMuscleGroup: ex.targetMuscleGroup,
                defaultSets: ex.defaultSets,
                defaultReps: ex.defaultReps,
                order: idx
            )
            exercise.routine = routine
            context.insert(exercise)
        }
        return routine
    }
}

struct SharedExercisePayload: Codable {
    var name: String
    var targetMuscleGroup: String
    var defaultSets: Int
    var defaultReps: Int

    init(from exercise: Exercise) {
        self.name              = exercise.name
        self.targetMuscleGroup = exercise.targetMuscleGroup
        self.defaultSets       = exercise.defaultSets
        self.defaultReps       = exercise.defaultReps
    }
}
