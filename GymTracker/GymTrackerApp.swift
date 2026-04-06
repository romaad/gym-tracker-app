import SwiftUI
import SwiftData

@main
struct GymTrackerApp: App {

    // MARK: - SwiftData container

    let container: ModelContainer = {
        let schema = Schema([
            Routine.self,
            Exercise.self,
            WorkoutSession.self,
            SetLog.self,
        ])
        let config = ModelConfiguration(schema: schema, isStoredInMemoryOnly: false)
        do {
            return try ModelContainer(for: schema, configurations: [config])
        } catch {
            fatalError("Failed to create ModelContainer: \(error)")
        }
    }()

    // MARK: - Shared managers

    @StateObject private var restTimerManager = RestTimerManager()
    @StateObject private var connectivityManager = WatchConnectivityManager()
    @StateObject private var healthKitManager = HealthKitManager()

    // MARK: - Scene

    var body: some Scene {
        WindowGroup {
            ContentView()
                .environmentObject(restTimerManager)
                .environmentObject(connectivityManager)
                .environmentObject(healthKitManager)
                .onAppear {
                    SampleData.populateIfNeeded(context: container.mainContext)
                    healthKitManager.requestAuthorization()
                    connectivityManager.activate()
                }
        }
        .modelContainer(container)
    }
}
