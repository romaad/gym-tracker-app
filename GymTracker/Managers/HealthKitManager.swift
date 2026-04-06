import Foundation
import HealthKit
import SwiftData

/// Handles HealthKit authorization and saving workout sessions to Apple Health.
final class HealthKitManager: ObservableObject {

    // MARK: - State

    @Published var isAuthorized: Bool = false

    // MARK: - Private

    private let store = HKHealthStore()

    private let writeTypes: Set<HKSampleType> = [
        HKObjectType.workoutType(),
        HKSeriesType.workoutRoute(),
        HKQuantityType(.activeEnergyBurned),
        HKQuantityType(.heartRate),
    ]

    private let readTypes: Set<HKObjectType> = [
        HKObjectType.workoutType(),
        HKQuantityType(.activeEnergyBurned),
        HKQuantityType(.heartRate),
    ]

    // MARK: - Authorization

    func requestAuthorization() {
        guard HKHealthStore.isHealthDataAvailable() else { return }
        store.requestAuthorization(toShare: writeTypes, read: readTypes) { [weak self] success, _ in
            DispatchQueue.main.async {
                self?.isAuthorized = success
            }
        }
    }

    // MARK: - Save workout

    /// Saves a completed workout session to HealthKit.
    /// - Parameters:
    ///   - session: The finished `WorkoutSession`.
    ///   - completion: Called with the saved `HKWorkout` or an error.
    func save(session: WorkoutSession, completion: @escaping (HKWorkout?, Error?) -> Void) {
        guard HKHealthStore.isHealthDataAvailable() else {
            completion(nil, NSError(domain: "HealthKit", code: -1,
                                    userInfo: [NSLocalizedDescriptionKey: "HealthKit not available"]))
            return
        }

        let start = session.startDate
        let end   = session.endDate ?? Date()

        // Build active-energy sample
        let energyUnit  = HKUnit.kilocalorie()
        let energyQty   = HKQuantity(unit: energyUnit, doubleValue: estimateCalories(for: session))
        let energySample = HKQuantitySample(
            type: HKQuantityType(.activeEnergyBurned),
            quantity: energyQty,
            start: start,
            end: end
        )

        // Build workout
        let builder = HKWorkoutBuilder(healthStore: store,
                                       configuration: workoutConfiguration(),
                                       device: .local())
        builder.beginCollection(withStart: start) { success, error in
            guard success else { completion(nil, error); return }

            builder.add([energySample]) { _, _ in
                builder.endCollection(withEnd: end) { _, error in
                    if let error { completion(nil, error); return }
                    builder.finishWorkout { workout, error in
                        DispatchQueue.main.async {
                            completion(workout, error)
                        }
                    }
                }
            }
        }
    }

    // MARK: - Private helpers

    private func workoutConfiguration() -> HKWorkoutConfiguration {
        let config = HKWorkoutConfiguration()
        config.activityType = .traditionalStrengthTraining
        config.locationType  = .indoor
        return config
    }

    /// Rough MET-based calorie estimate (MET ≈ 5 for weight training).
    private func estimateCalories(for session: WorkoutSession) -> Double {
        let durationHours = session.durationSeconds / 3600
        let weightKg      = 80.0   // assumed body weight fallback
        let met           = 5.0
        return met * weightKg * durationHours
    }
}
