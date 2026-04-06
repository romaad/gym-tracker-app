import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import {useTimer} from '../context/TimerContext';

const DURATION_OPTIONS: {label: string; seconds: number}[] = [
  {label: '1:00', seconds: 60},
  {label: '1:30', seconds: 90},
  {label: '2:00', seconds: 120},
  {label: '2:30', seconds: 150},
  {label: '3:00', seconds: 180},
  {label: '3:30', seconds: 210},
  {label: '4:00', seconds: 240},
];

export function SettingsScreen(): React.JSX.Element {
  const timer = useTimer();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Settings</Text>

      {/* Rest timer duration */}
      <Text style={styles.sectionHeader}>Default Rest Duration</Text>
      <View style={styles.durationGrid}>
        {DURATION_OPTIONS.map(opt => {
          const selected = timer.defaultRestSeconds === opt.seconds;
          return (
            <TouchableOpacity
              key={opt.seconds}
              style={[styles.durationPill, selected && styles.durationPillSelected]}
              onPress={() => timer.setDefaultRestSeconds(opt.seconds)}
              activeOpacity={0.7}>
              <Text
                style={[
                  styles.durationPillText,
                  selected && styles.durationPillTextSelected,
                ]}>
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* About */}
      <Text style={styles.sectionHeader}>About</Text>
      <View style={styles.card}>
        <SettingsRow label="App" value="GymTracker" />
        <SettingsRow label="Version" value="1.0.0" />
        <SettingsRow label="Platform" value="React Native (iOS + Android)" />
      </View>
    </ScrollView>
  );
}

function SettingsRow({label, value}: {label: string; value: string}): React.JSX.Element {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: 16,
    paddingBottom: 40,
  },
  title: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: '700',
    marginTop: 20,
    marginBottom: 24,
  },
  sectionHeader: {
    color: '#6B7280',
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: 10,
    marginTop: 8,
  },
  durationGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 28,
  },
  durationPill: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#1C1C1E',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#2D2D2F',
  },
  durationPillSelected: {
    backgroundColor: '#F97316',
    borderColor: '#F97316',
  },
  durationPillText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  durationPillTextSelected: {
    color: '#000000',
  },
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#2D2D2F',
  },
  rowLabel: {
    color: '#FFFFFF',
    fontSize: 15,
  },
  rowValue: {
    color: '#6B7280',
    fontSize: 15,
  },
});
