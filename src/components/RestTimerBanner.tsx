import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import {useTimer} from '../context/TimerContext';

/**
 * Compact rest timer shown in the navigation bar header while a timer is running.
 * Pressing it cancels the timer.
 */
export function RestTimerBanner(): React.JSX.Element {
  const timer = useTimer();

  if (!timer.isRunning) {
    return <View />;
  }

  // Circular progress ring drawn with a simple border trick
  const circumference = 2 * Math.PI * 12; // r=12
  const strokeDashoffset = circumference * timer.progress;

  return (
    <TouchableOpacity style={styles.container} onPress={timer.cancel} activeOpacity={0.7}>
      {/* Inline SVG-style ring using absolute border */}
      <View style={styles.ringOuter}>
        <View
          style={[
            styles.ringFill,
            {
              borderColor: '#F97316',
              transform: [{rotate: `${timer.progress * 360}deg`}],
            },
          ]}
        />
        <View style={styles.ringInner} />
      </View>
      <Text style={styles.time}>{timer.formattedTime}</Text>
      <Text style={styles.skip}>✕</Text>
    </TouchableOpacity>
  );
}

// ─── Full-screen rest timer overlay (shown on tap in WorkoutSessionScreen) ────

export function RestTimerOverlay({onClose}: {onClose: () => void}): React.JSX.Element {
  const timer = useTimer();

  return (
    <View style={overlay.container}>
      <Text style={overlay.label}>Rest Timer</Text>

      {/* Large progress ring */}
      <View style={overlay.ringContainer}>
        <View style={overlay.ringBg} />
        <Text style={overlay.timeText}>{timer.formattedTime}</Text>
        <Text style={overlay.remainingLabel}>remaining</Text>
      </View>

      {/* Progress bar */}
      <View style={overlay.progressTrack}>
        <View style={[overlay.progressFill, {flex: 1 - timer.progress}]} />
      </View>

      <View style={overlay.buttons}>
        <TouchableOpacity
          style={[overlay.btn, overlay.btnOutline]}
          onPress={() => timer.start(timer.totalSeconds)}>
          <Text style={overlay.btnTextOutline}>↺  Restart</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[overlay.btn, overlay.btnPrimary]}
          onPress={() => {
            timer.cancel();
            onClose();
          }}>
          <Text style={overlay.btnTextPrimary}>⏭  Skip</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249,115,22,0.15)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 6,
  },
  ringOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#4B3A28',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  ringFill: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
  },
  ringInner: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#111111',
  },
  time: {
    color: '#F97316',
    fontSize: 13,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  skip: {
    color: '#9CA3AF',
    fontSize: 12,
  },
});

const overlay = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  label: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 40,
  },
  ringContainer: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#222222',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
  },
  ringBg: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 100,
    borderWidth: 8,
    borderColor: '#F97316',
    opacity: 0.25,
  },
  timeText: {
    color: '#FFFFFF',
    fontSize: 52,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  remainingLabel: {
    color: '#6B7280',
    fontSize: 14,
  },
  progressTrack: {
    flexDirection: 'row',
    width: '100%',
    height: 4,
    backgroundColor: '#222222',
    borderRadius: 2,
    marginBottom: 40,
    overflow: 'hidden',
  },
  progressFill: {
    backgroundColor: '#F97316',
    borderRadius: 2,
  },
  buttons: {
    flexDirection: 'row',
    gap: 16,
  },
  btn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  btnOutline: {
    borderWidth: 1,
    borderColor: '#374151',
  },
  btnPrimary: {
    backgroundColor: '#F97316',
  },
  btnTextOutline: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  btnTextPrimary: {
    color: '#000000',
    fontWeight: '700',
  },
});
