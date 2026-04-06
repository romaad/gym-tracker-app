import Foundation
import SwiftData

/// A named workout routine (e.g. "Push A", "Pull B").
@Model
final class Routine: Identifiable {
    @Attribute(.unique) var id: UUID
    var name: String
    var category: RoutineCategory   // push / pull / legs
    var variant: String             // "A" or "B"
    var isCustom: Bool              // true for user-created routines
    var authorName: String?         // for Marketplace-shared routines
    var shareID: String?            // opaque cloud share identifier

    @Relationship(deleteRule: .cascade, inverse: \Exercise.routine)
    var exercises: [Exercise]

    init(
        id: UUID = UUID(),
        name: String,
        category: RoutineCategory,
        variant: String,
        isCustom: Bool = false,
        authorName: String? = nil,
        shareID: String? = nil
    ) {
        self.id = id
        self.name = name
        self.category = category
        self.variant = variant
        self.isCustom = isCustom
        self.authorName = authorName
        self.shareID = shareID
        self.exercises = []
    }
}

enum RoutineCategory: String, Codable, CaseIterable {
    case push = "Push"
    case pull = "Pull"
    case legs = "Legs"

    var systemImage: String {
        switch self {
        case .push: return "figure.strengthtraining.traditional"
        case .pull: return "figure.rowing"
        case .legs: return "figure.run"
        }
    }
}
