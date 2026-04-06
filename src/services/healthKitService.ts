/**
 * HealthKit integration (iOS only).
 *
 * On Android (or when HealthKit is unavailable) all methods are no-ops.
 * The library used is `react-native-health`.
 */

import {Platform} from 'react-native';
import type {WorkoutSession} from '../types/models';

// Lazily import the native module only on iOS
let AppleHealthKit: typeof import('react-native-health').default | null = null;

if (Platform.OS === 'ios') {
  try {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const RNHealth = require('react-native-health');
    AppleHealthKit = RNHealth.default ?? RNHealth;
  } catch {
    // Library not linked – silently degrade
  }
}

const PERMISSIONS = AppleHealthKit
  ? {
      permissions: {
        read: [
          (AppleHealthKit as any).Constants.Permissions.ActiveEnergyBurned,
          (AppleHealthKit as any).Constants.Permissions.Workout,
        ],
        write: [
          (AppleHealthKit as any).Constants.Permissions.ActiveEnergyBurned,
          (AppleHealthKit as any).Constants.Permissions.Workout,
        ],
      },
    }
  : null;

/** Request HealthKit authorization. Safe to call on Android. */
function requestAuthorization(): void {
  if (!AppleHealthKit || !PERMISSIONS) {
    return;
  }
  AppleHealthKit.initHealthKit(PERMISSIONS, (err: Error | null) => {
    if (err) {
      console.warn('[HealthKit] Authorization failed:', err);
    }
  });
}

/**
 * Save a finished workout session to Apple Health.
 * Saves both the Workout activity and an active-energy sample.
 */
function saveWorkout(session: WorkoutSession): void {
  if (!AppleHealthKit) {
    return;
  }
  const startDate = session.startDate;
  const endDate = session.endDate ?? new Date().toISOString();

  // Duration in seconds
  const durationMs =
    new Date(endDate).getTime() - new Date(startDate).getTime();
  const durationSec = Math.round(durationMs / 1000);

  // MET-based calorie estimate (MET ≈ 5, body weight 80 kg assumed)
  const calories = Math.round(5 * 80 * (durationSec / 3600));

  const options = {
    type: 'TraditionalStrengthTraining',
    startDate,
    endDate,
    duration: durationSec,
    totalEnergyBurned: calories,
    totalEnergyBurnedUnit: 'kilocalorie',
  };

  (AppleHealthKit as any).saveWorkout(options, (err: Error | null) => {
    if (err) {
      console.warn('[HealthKit] Failed to save workout:', err);
    }
  });
}

export const healthKitService = {
  requestAuthorization,
  saveWorkout,
};
