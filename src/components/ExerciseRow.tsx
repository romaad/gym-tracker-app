import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import type {Exercise, SetLog} from '../types/models';
import {getLastSetForExercise} from '../storage/database';

interface Props {
  exercise: Exercise;
  sessionId: string;
  sessionLogs: SetLog[];  // logs already recorded this session for this exercise
  onLogSet: (weightKg: number, reps: number) => void;
}

export function ExerciseRow({
  exercise,
  sessionId,
  sessionLogs,
  onLogSet,
}: Props): React.JSX.Element {
  const [expanded, setExpanded] = useState(false);
  const [weight, setWeight] = useState('');
  const [reps, setReps] = useState('');
  const [suggestion, setSuggestion] = useState<SetLog | null>(null);

  // Load the last-session suggestion once
  useEffect(() => {
    getLastSetForExercise(exercise.id, sessionId).then(setSuggestion);
  }, [exercise.id, sessionId]);

  // Pre-fill inputs from suggestion on first expand
  useEffect(() => {
    if (expanded && suggestion && weight === '' && reps === '') {
      setWeight(String(suggestion.weightKg));
      setReps(String(suggestion.reps));
    }
  }, [expanded, suggestion, weight, reps]);

  const setsCompleted = sessionLogs.length;
  const allDone = setsCompleted >= exercise.defaultSets;

  const handleLog = useCallback(() => {
    const w = parseFloat(weight);
    const r = parseInt(reps, 10);
    if (isNaN(w) || isNaN(r) || r <= 0) {
      return;
    }
    onLogSet(w, r);
    setReps('');   // keep weight for next set, clear reps
  }, [weight, reps, onLogSet]);

  const badgeColor = allDone ? '#22C55E' : '#F97316';

  return (
    <View style={styles.card}>
      {/* Header row */}
      <TouchableOpacity
        style={styles.header}
        onPress={() => setExpanded(e => !e)}
        activeOpacity={0.75}>
        <View style={styles.headerLeft}>
          <Text style={styles.exerciseName}>{exercise.name}</Text>
          <Text style={styles.muscleGroup}>{exercise.targetMuscleGroup}</Text>
        </View>
        <View style={[styles.badge, {backgroundColor: badgeColor}]}>
          <Text style={styles.badgeText}>
            {setsCompleted}/{exercise.defaultSets}
          </Text>
        </View>
        <Text style={styles.chevron}>{expanded ? '▲' : '▼'}</Text>
      </TouchableOpacity>

      {/* Expanded content */}
      {expanded && (
        <View style={styles.expandedContent}>
          {/* Smart suggestion */}
          {suggestion && (
            <View style={styles.suggestion}>
              <Text style={styles.suggestionText}>
                💡 Last time: {suggestion.weightKg} kg × {suggestion.reps} reps
              </Text>
            </View>
          )}

          {/* Already-logged sets */}
          {sessionLogs.map(log => (
            <View key={log.id} style={styles.logRow}>
              <Text style={styles.logSetLabel}>Set {log.setNumber + 1}</Text>
              <Text style={styles.logValue}>{log.weightKg} kg</Text>
              <Text style={styles.logSep}>×</Text>
              <Text style={styles.logValue}>{log.reps} reps</Text>
              <Text style={styles.logCheck}>✓</Text>
            </View>
          ))}

          {/* Input for next set */}
          {!allDone && (
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>
                Set {setsCompleted + 1} of {exercise.defaultSets}
              </Text>
              <View style={styles.inputRow}>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputHint}>Weight (kg)</Text>
                  <TextInput
                    style={styles.input}
                    value={weight}
                    onChangeText={setWeight}
                    keyboardType="decimal-pad"
                    placeholder="0.0"
                    placeholderTextColor="#4B5563"
                    returnKeyType="done"
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputHint}>Reps</Text>
                  <TextInput
                    style={styles.input}
                    value={reps}
                    onChangeText={setReps}
                    keyboardType="number-pad"
                    placeholder={String(exercise.defaultReps)}
                    placeholderTextColor="#4B5563"
                    returnKeyType="done"
                  />
                </View>
                <TouchableOpacity
                  style={[styles.logBtn, !weight && styles.logBtnDisabled]}
                  onPress={handleLog}
                  disabled={!weight}>
                  <Text style={styles.logBtnText}>Log</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#1C1C1E',
    borderRadius: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
  },
  headerLeft: {
    flex: 1,
  },
  exerciseName: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  muscleGroup: {
    color: '#6B7280',
    fontSize: 12,
    marginTop: 2,
  },
  badge: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 8,
  },
  badgeText: {
    color: '#000000',
    fontSize: 12,
    fontWeight: '700',
  },
  chevron: {
    color: '#4B5563',
    fontSize: 11,
  },
  expandedContent: {
    borderTopWidth: 1,
    borderTopColor: '#2D2D2F',
    paddingBottom: 14,
  },
  suggestion: {
    backgroundColor: '#1A1A00',
    margin: 10,
    borderRadius: 8,
    padding: 8,
  },
  suggestionText: {
    color: '#FCD34D',
    fontSize: 12,
  },
  logRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  logSetLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '600',
    width: 44,
  },
  logValue: {
    color: '#FFFFFF',
    fontSize: 14,
  },
  logSep: {
    color: '#4B5563',
    fontSize: 14,
  },
  logCheck: {
    color: '#22C55E',
    fontSize: 16,
    marginLeft: 'auto',
  },
  inputSection: {
    paddingHorizontal: 14,
    paddingTop: 10,
  },
  inputLabel: {
    color: '#6B7280',
    fontSize: 12,
    marginBottom: 8,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  inputGroup: {
    flex: 1,
    alignItems: 'center',
  },
  inputHint: {
    color: '#4B5563',
    fontSize: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#2C2C2E',
    color: '#FFFFFF',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 16,
    textAlign: 'center',
    width: '100%',
  },
  logBtn: {
    backgroundColor: '#F97316',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logBtnDisabled: {
    opacity: 0.4,
  },
  logBtnText: {
    color: '#000000',
    fontWeight: '700',
    fontSize: 15,
  },
});
