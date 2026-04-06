import SwiftUI
import SwiftData

/// Lets the user pick which routine to run today.
struct RoutineSelectionView: View {

    @Query(sort: \Routine.name) private var routines: [Routine]
    @State private var activeSession: WorkoutSession?
    @State private var selectedRoutine: Routine?

    var body: some View {
        NavigationStack {
            List {
                ForEach(RoutineCategory.allCases, id: \.self) { cat in
                    Section(cat.rawValue) {
                        ForEach(routines.filter { $0.category == cat }) { routine in
                            Button {
                                selectedRoutine = routine
                            } label: {
                                HStack {
                                    Image(systemName: cat.systemImage)
                                        .foregroundStyle(.orange)
                                        .frame(width: 30)
                                    VStack(alignment: .leading) {
                                        Text(routine.name)
                                            .font(.headline)
                                            .foregroundStyle(.primary)
                                        Text("\(routine.exercises.count) exercises")
                                            .font(.caption)
                                            .foregroundStyle(.secondary)
                                    }
                                    Spacer()
                                    Image(systemName: "chevron.right")
                                        .foregroundStyle(.tertiary)
                                }
                            }
                        }
                    }
                }
            }
            .navigationTitle("Choose Routine")
            .navigationDestination(item: $selectedRoutine) { routine in
                WorkoutSessionView(routine: routine)
            }
        }
    }
}
