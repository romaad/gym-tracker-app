import SwiftUI
import SwiftData

/// Community Routine Marketplace – browse, download, and publish workout routines.
struct MarketplaceView: View {

    @Environment(\.modelContext) private var context
    @StateObject private var viewModel = MarketplaceViewModel()
    @State private var showPublishSheet = false
    @State private var searchText = ""

    private var filtered: [SharedRoutinePayload] {
        if searchText.isEmpty { return viewModel.listings }
        return viewModel.listings.filter {
            $0.name.localizedCaseInsensitiveContains(searchText) ||
            $0.authorName.localizedCaseInsensitiveContains(searchText) ||
            $0.category.localizedCaseInsensitiveContains(searchText)
        }
    }

    var body: some View {
        NavigationStack {
            Group {
                if viewModel.isLoading {
                    ProgressView("Loading community routines…")
                        .frame(maxWidth: .infinity, maxHeight: .infinity)
                } else if filtered.isEmpty && !searchText.isEmpty {
                    ContentUnavailableView.search
                } else if filtered.isEmpty {
                    ContentUnavailableView(
                        "No routines yet",
                        systemImage: "square.grid.2x2",
                        description: Text("Be the first to publish a routine!")
                    )
                } else {
                    listContent
                }
            }
            .navigationTitle("Marketplace")
            .searchable(text: $searchText, prompt: "Search routines…")
            .toolbar {
                ToolbarItem(placement: .topBarTrailing) {
                    Button {
                        showPublishSheet = true
                    } label: {
                        Image(systemName: "square.and.arrow.up")
                    }
                    .tint(.orange)
                }
            }
            .sheet(isPresented: $showPublishSheet) {
                PublishRoutineSheet(viewModel: viewModel)
            }
            .onAppear {
                if viewModel.listings.isEmpty {
                    viewModel.fetchListings()
                }
            }
        }
    }

    // MARK: - List content

    private var listContent: some View {
        List(filtered) { payload in
            MarketplaceRowView(
                payload: payload,
                isImported: viewModel.importedIDs.contains(payload.id)
            ) {
                viewModel.importRoutine(payload, into: context)
            }
        }
        .listStyle(.plain)
    }
}

// MARK: - Single marketplace row

struct MarketplaceRowView: View {
    let payload: SharedRoutinePayload
    let isImported: Bool
    let onImport: () -> Void

    var body: some View {
        HStack(alignment: .top, spacing: 12) {
            // Category icon
            ZStack {
                RoundedRectangle(cornerRadius: 10)
                    .fill(categoryColor.opacity(0.15))
                    .frame(width: 48, height: 48)
                Image(systemName: categoryIcon)
                    .foregroundStyle(categoryColor)
                    .font(.title3)
            }

            VStack(alignment: .leading, spacing: 4) {
                Text(payload.name)
                    .font(.headline)
                HStack(spacing: 6) {
                    Text(payload.category)
                        .font(.caption.bold())
                        .foregroundStyle(categoryColor)
                        .padding(.horizontal, 6)
                        .padding(.vertical, 2)
                        .background(categoryColor.opacity(0.15))
                        .clipShape(Capsule())
                    Text("by \(payload.authorName)")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                Text("\(payload.exercises.count) exercises · \(payload.downloadCount) downloads")
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            Spacer()

            // Import / checkmark
            Button(action: onImport) {
                Image(systemName: isImported ? "checkmark.circle.fill" : "arrow.down.circle.fill")
                    .font(.title2)
                    .foregroundStyle(isImported ? .green : .orange)
            }
            .buttonStyle(.plain)
            .disabled(isImported)
        }
        .padding(.vertical, 6)
    }

    private var categoryColor: Color {
        switch payload.category {
        case "Push":  return .orange
        case "Pull":  return .blue
        case "Legs":  return .green
        default:      return .gray
        }
    }

    private var categoryIcon: String {
        switch payload.category {
        case "Push":  return "figure.strengthtraining.traditional"
        case "Pull":  return "figure.rowing"
        case "Legs":  return "figure.run"
        default:      return "dumbbell"
        }
    }
}

// MARK: - Publish sheet

struct PublishRoutineSheet: View {
    @ObservedObject var viewModel: MarketplaceViewModel
    @Environment(\.modelContext) private var context
    @Environment(\.dismiss) private var dismiss

    @Query(sort: \Routine.name) private var myRoutines: [Routine]

    @State private var selectedRoutine: Routine?
    @State private var authorName: String = ""
    @State private var publishedSuccessfully = false

    var body: some View {
        NavigationStack {
            Form {
                Section("Your Name") {
                    TextField("Display name", text: $authorName)
                }

                Section("Choose Routine to Publish") {
                    if myRoutines.isEmpty {
                        Text("No routines found. Complete a workout first.")
                            .foregroundStyle(.secondary)
                    } else {
                        ForEach(myRoutines) { routine in
                            Button {
                                selectedRoutine = routine
                            } label: {
                                HStack {
                                    Text(routine.name)
                                        .foregroundStyle(.primary)
                                    Spacer()
                                    if selectedRoutine?.id == routine.id {
                                        Image(systemName: "checkmark")
                                            .foregroundStyle(.orange)
                                    }
                                }
                            }
                        }
                    }
                }

                if publishedSuccessfully {
                    Section {
                        Label("Published successfully!", systemImage: "checkmark.circle.fill")
                            .foregroundStyle(.green)
                    }
                }
            }
            .navigationTitle("Publish Routine")
            .navigationBarTitleDisplayMode(.inline)
            .toolbar {
                ToolbarItem(placement: .topBarLeading) {
                    Button("Cancel") { dismiss() }
                }
                ToolbarItem(placement: .topBarTrailing) {
                    Button("Publish") {
                        publish()
                    }
                    .tint(.orange)
                    .disabled(selectedRoutine == nil || authorName.trimmingCharacters(in: .whitespaces).isEmpty)
                }
            }
        }
    }

    private func publish() {
        guard let routine = selectedRoutine,
              !authorName.trimmingCharacters(in: .whitespaces).isEmpty else { return }
        viewModel.publishRoutine(routine, authorName: authorName, into: context)
        publishedSuccessfully = true
        DispatchQueue.main.asyncAfter(deadline: .now() + 1.5) { dismiss() }
    }
}
