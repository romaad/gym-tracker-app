import SwiftUI

@main
struct GymTrackerWatchApp: App {

    @StateObject private var restTimer   = WatchRestTimerManager()
    @StateObject private var connectivity = WatchConnectivityManager()

    var body: some Scene {
        WindowGroup {
            WatchContentView()
                .environmentObject(restTimer)
                .environmentObject(connectivity)
                .onAppear {
                    connectivity.activate(timerManager: restTimer)
                }
        }
    }
}
