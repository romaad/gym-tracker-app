import Foundation
import SwiftData

// MARK: - Pre-populated sample data

struct SampleData {

    // MARK: Routines

    static func populateIfNeeded(context: ModelContext) {
        let descriptor = FetchDescriptor<Routine>()
        let existing = (try? context.fetch(descriptor)) ?? []
        guard existing.isEmpty else { return }

        let routines: [(name: String, cat: RoutineCategory, variant: String)] = [
            ("Push A", .push,  "A"),
            ("Pull A", .pull,  "A"),
            ("Legs A", .legs,  "A"),
            ("Push B", .push,  "B"),
            ("Pull B", .pull,  "B"),
            ("Legs B", .legs,  "B"),
        ]

        for r in routines {
            let routine = Routine(name: r.name, category: r.cat, variant: r.variant)
            context.insert(routine)
            let exercises = exerciseList(for: r.cat, variant: r.variant)
            for (idx, ex) in exercises.enumerated() {
                ex.order = idx
                ex.routine = routine
                context.insert(ex)
            }
        }

        try? context.save()
    }

    // MARK: - Exercise definitions per routine

    private static func exerciseList(for category: RoutineCategory, variant: String) -> [Exercise] {
        switch (category, variant) {
        case (.push, "A"):
            return [
                Exercise(name: "Barbell Bench Press",     targetMuscleGroup: "Chest",      defaultSets: 4, defaultReps: 8),
                Exercise(name: "Incline Dumbbell Press",  targetMuscleGroup: "Upper Chest",defaultSets: 3, defaultReps: 10),
                Exercise(name: "Overhead Press",          targetMuscleGroup: "Shoulders",  defaultSets: 4, defaultReps: 8),
                Exercise(name: "Lateral Raises",          targetMuscleGroup: "Shoulders",  defaultSets: 3, defaultReps: 15),
                Exercise(name: "Tricep Pushdowns",        targetMuscleGroup: "Triceps",    defaultSets: 3, defaultReps: 12),
                Exercise(name: "Overhead Tricep Ext.",    targetMuscleGroup: "Triceps",    defaultSets: 3, defaultReps: 12),
            ]
        case (.push, "B"):
            return [
                Exercise(name: "Dumbbell Shoulder Press", targetMuscleGroup: "Shoulders", defaultSets: 4, defaultReps: 10),
                Exercise(name: "Cable Crossovers",        targetMuscleGroup: "Chest",     defaultSets: 3, defaultReps: 15),
                Exercise(name: "Close-Grip Bench Press",  targetMuscleGroup: "Triceps",   defaultSets: 4, defaultReps: 8),
                Exercise(name: "Machine Chest Fly",       targetMuscleGroup: "Chest",     defaultSets: 3, defaultReps: 12),
                Exercise(name: "Skull Crushers",          targetMuscleGroup: "Triceps",   defaultSets: 3, defaultReps: 12),
            ]
        case (.pull, "A"):
            return [
                Exercise(name: "Barbell Deadlift",        targetMuscleGroup: "Back",       defaultSets: 4, defaultReps: 6),
                Exercise(name: "Pull-Ups",                targetMuscleGroup: "Lats",       defaultSets: 4, defaultReps: 8),
                Exercise(name: "Barbell Row",             targetMuscleGroup: "Back",       defaultSets: 4, defaultReps: 8),
                Exercise(name: "Face Pulls",              targetMuscleGroup: "Rear Delts", defaultSets: 3, defaultReps: 15),
                Exercise(name: "Dumbbell Bicep Curls",    targetMuscleGroup: "Biceps",     defaultSets: 3, defaultReps: 12),
                Exercise(name: "Hammer Curls",            targetMuscleGroup: "Biceps",     defaultSets: 3, defaultReps: 12),
            ]
        case (.pull, "B"):
            return [
                Exercise(name: "Weighted Pull-Ups",       targetMuscleGroup: "Lats",       defaultSets: 4, defaultReps: 6),
                Exercise(name: "Seated Cable Row",        targetMuscleGroup: "Back",       defaultSets: 4, defaultReps: 10),
                Exercise(name: "Lat Pulldown",            targetMuscleGroup: "Lats",       defaultSets: 3, defaultReps: 12),
                Exercise(name: "Incline Dumbbell Curl",   targetMuscleGroup: "Biceps",     defaultSets: 3, defaultReps: 12),
                Exercise(name: "Cable Curls",             targetMuscleGroup: "Biceps",     defaultSets: 3, defaultReps: 15),
            ]
        case (.legs, "A"):
            return [
                Exercise(name: "Barbell Back Squat",      targetMuscleGroup: "Quads",      defaultSets: 4, defaultReps: 8),
                Exercise(name: "Romanian Deadlift",       targetMuscleGroup: "Hamstrings", defaultSets: 4, defaultReps: 10),
                Exercise(name: "Leg Press",               targetMuscleGroup: "Quads",      defaultSets: 3, defaultReps: 12),
                Exercise(name: "Leg Curls",               targetMuscleGroup: "Hamstrings", defaultSets: 3, defaultReps: 12),
                Exercise(name: "Calf Raises",             targetMuscleGroup: "Calves",     defaultSets: 4, defaultReps: 15),
            ]
        case (.legs, "B"):
            return [
                Exercise(name: "Front Squat",             targetMuscleGroup: "Quads",      defaultSets: 4, defaultReps: 8),
                Exercise(name: "Sumo Deadlift",           targetMuscleGroup: "Hamstrings", defaultSets: 4, defaultReps: 8),
                Exercise(name: "Walking Lunges",          targetMuscleGroup: "Quads",      defaultSets: 3, defaultReps: 12),
                Exercise(name: "Seated Leg Curls",        targetMuscleGroup: "Hamstrings", defaultSets: 3, defaultReps: 12),
                Exercise(name: "Leg Extension",           targetMuscleGroup: "Quads",      defaultSets: 3, defaultReps: 15),
                Exercise(name: "Standing Calf Raises",    targetMuscleGroup: "Calves",     defaultSets: 4, defaultReps: 15),
            ]
        default:
            return []
        }
    }
}
