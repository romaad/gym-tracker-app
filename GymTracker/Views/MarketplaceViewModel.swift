import Foundation
import SwiftData

/// Provides a simulated in-memory Marketplace feed.
/// In a production app this would call a real REST/CloudKit backend.
@MainActor
final class MarketplaceViewModel: ObservableObject {

    @Published var listings: [SharedRoutinePayload] = []
    @Published var isLoading: Bool = false
    @Published var errorMessage: String?
    @Published var importedIDs: Set<String> = []

    // MARK: - Fetch (simulated)

    func fetchListings() {
        isLoading = true
        errorMessage = nil

        // Simulate network delay
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.8) {
            self.listings = Self.sampleListings
            self.isLoading = false
        }
    }

    // MARK: - Import

    func importRoutine(_ payload: SharedRoutinePayload, into context: ModelContext) {
        // Prevent duplicate imports
        guard !importedIDs.contains(payload.id) else { return }

        let descriptor = FetchDescriptor<Routine>()
        let existing = (try? context.fetch(descriptor)) ?? []
        let alreadyExists = existing.contains { $0.shareID == payload.id }
        guard !alreadyExists else {
            importedIDs.insert(payload.id)
            return
        }

        _ = payload.toRoutine(context: context)
        try? context.save()
        importedIDs.insert(payload.id)
    }

    // MARK: - Export (publish current user routine)

    func publishRoutine(_ routine: Routine, authorName: String, into context: ModelContext) {
        let payload = SharedRoutinePayload(from: routine, authorName: authorName)
        // In production: POST payload to backend.
        // For now just prepend to local feed so the user sees it.
        listings.insert(payload, at: 0)

        // Mark routine as published
        routine.authorName = authorName
        routine.shareID    = payload.id
        try? context.save()
    }

    // MARK: - Sample data (stand-in for a remote feed)

    private static var sampleListings: [SharedRoutinePayload] = {
        let decoder = JSONDecoder()
        decoder.dateDecodingStrategy = .iso8601
        return sampleJSON.compactMap { try? decoder.decode(SharedRoutinePayload.self, from: Data($0.utf8)) }
    }()

    private static let sampleJSON: [String] = [
        """
        {
          "id":"A1B2C3D4-E5F6-7890-ABCD-EF1234567890",
          "name":"Hypertrophy Push",
          "category":"Push",
          "variant":"A",
          "authorName":"Alex M.",
          "publishedAt":"2025-01-15T10:00:00Z",
          "downloadCount":142,
          "exercises":[
            {"name":"Incline Smith Press","targetMuscleGroup":"Upper Chest","defaultSets":4,"defaultReps":10},
            {"name":"Cable Lateral Raise","targetMuscleGroup":"Shoulders","defaultSets":4,"defaultReps":15},
            {"name":"Pec Deck Fly","targetMuscleGroup":"Chest","defaultSets":3,"defaultReps":12},
            {"name":"Rope Pushdown","targetMuscleGroup":"Triceps","defaultSets":3,"defaultReps":15}
          ]
        }
        """,
        """
        {
          "id":"B2C3D4E5-F6A7-8901-BCDE-F12345678901",
          "name":"Deadlift-Focused Pull",
          "category":"Pull",
          "variant":"A",
          "authorName":"Jamie K.",
          "publishedAt":"2025-02-03T08:30:00Z",
          "downloadCount":98,
          "exercises":[
            {"name":"Conventional Deadlift","targetMuscleGroup":"Back","defaultSets":5,"defaultReps":5},
            {"name":"Weighted Chin-Up","targetMuscleGroup":"Lats","defaultSets":4,"defaultReps":6},
            {"name":"Pendlay Row","targetMuscleGroup":"Back","defaultSets":4,"defaultReps":8},
            {"name":"Preacher Curl","targetMuscleGroup":"Biceps","defaultSets":3,"defaultReps":12}
          ]
        }
        """,
        """
        {
          "id":"C3D4E5F6-A7B8-9012-CDEF-012345678902",
          "name":"Athletic Legs",
          "category":"Legs",
          "variant":"A",
          "authorName":"Sam R.",
          "publishedAt":"2025-03-20T12:00:00Z",
          "downloadCount":213,
          "exercises":[
            {"name":"Bulgarian Split Squat","targetMuscleGroup":"Quads","defaultSets":4,"defaultReps":10},
            {"name":"Nordic Hamstring Curl","targetMuscleGroup":"Hamstrings","defaultSets":3,"defaultReps":6},
            {"name":"Hack Squat","targetMuscleGroup":"Quads","defaultSets":3,"defaultReps":12},
            {"name":"Seated Calf Raise","targetMuscleGroup":"Calves","defaultSets":4,"defaultReps":20}
          ]
        }
        """,
        """
        {
          "id":"D4E5F6A7-B8C9-0123-DEF0-123456789003",
          "name":"Upper/Push Volume",
          "category":"Push",
          "variant":"B",
          "authorName":"Chris T.",
          "publishedAt":"2025-04-01T07:45:00Z",
          "downloadCount":57,
          "exercises":[
            {"name":"Flat DB Press","targetMuscleGroup":"Chest","defaultSets":4,"defaultReps":12},
            {"name":"Arnold Press","targetMuscleGroup":"Shoulders","defaultSets":4,"defaultReps":10},
            {"name":"Cable Flye High","targetMuscleGroup":"Lower Chest","defaultSets":3,"defaultReps":15},
            {"name":"EZ-Bar Skullcrusher","targetMuscleGroup":"Triceps","defaultSets":3,"defaultReps":12},
            {"name":"Lateral Raise Machine","targetMuscleGroup":"Shoulders","defaultSets":3,"defaultReps":15}
          ]
        }
        """,
    ]
}
