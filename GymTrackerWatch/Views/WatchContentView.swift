import SwiftUI

/// Root view for the watchOS app. Shows either the rest timer or the logging interface.
struct WatchContentView: View {
    @EnvironmentObject private var restTimer:    WatchRestTimerManager
    @EnvironmentObject private var connectivity: WatchConnectivityManager

    var body: some View {
        TabView {
            // Timer page
            WatchTimerView()
                .environmentObject(restTimer)

            // Logging page
            WatchLoggingView()
                .environmentObject(restTimer)
                .environmentObject(connectivity)
        }
        .tabViewStyle(.page)
    }
}
