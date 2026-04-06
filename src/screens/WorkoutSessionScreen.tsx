import React, {useCallback, useEffect, useState} from 'react';
import {
  Alert,
  FlatList,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import type {NativeStackScreenProps} from '@react-navigation/native-stack';
import type {HomeStackParamList} from '../navigation/AppNavigator';
import type {Exercise} from '../types/models';
import {getExercises} from '../storage/database';
import {ExerciseRow} from '../components/ExerciseRow';
import {RestTimerOverlay} from '../components/RestTimerBanner';
import {useTimer} from '../context/TimerContext';
import {useWorkout} from '../context/WorkoutContext';

type Props = NativeStackScreenProps<HomeStackParamList, 'WorkoutSession'>;

export function WorkoutSessionScreen({route, navigation}: Props): React.JSX.Element {
  const {routine} = route.params;
  const timer = useTimer();
  const workout = useWorkout();

  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [showTimerOverlay, setShowTimerOverlay] = useState(false);

  // Start session when screen mounts
  useEffect(() => {
    workout.startSession(routine);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Cancel timer when leaving
  useEffect(
    () => () => {
      timer.cancel();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    getExercises(routine.id).then(all =>
      setExercises(all.sort((a, b) => a.order - b.order)),
    );
  }, [routine.id]);

  const handleLogSet = useCallback(
    async (exercise: Exercise, weightKg: number, reps: number) => {
      await workout.logSet(exercise, weightKg, reps);
      const restSecs =
        exercise.restDurationSeconds > 0
          ? exercise.restDurationSeconds
          : timer.defaultRestSeconds;
      timer.start(restSecs);
    },
    [workout, timer],
  );

  const handleFinish = useCallback(() => {
    Alert.alert(
      'Finish Workout?',
      Platform.OS === 'ios'
        ? 'This will end your session and save it to Apple Health.'
        : 'This will end and save your session.',
      [
        {text: 'Cancel', style: 'cancel'},
        {
          text: 'Finish',
          style: 'destructive',
          onPress: async () => {
            await workout.finishSession();
            timer.cancel();
            navigation.goBack();
          },
        },
      ],
    );
  }, [workout, timer, navigation]);

  const sessionId = workout.activeSession?.id ?? '';

  return (
    <View style={styles.container}>
      {/* Floating timer strip */}
      {timer.isRunning && (
        <TouchableOpacity
          style={styles.timerStrip}
          onPress={() => setShowTimerOverlay(true)}
          activeOpacity={0.85}>
          <View style={[styles.timerProgress, {flex: 1 - timer.progress}]} />
          <Text style={styles.timerStripText}>
            ⏱ Rest: {timer.formattedTime}  ·  tap to expand
          </Text>
        </TouchableOpacity>
      )}

      <FlatList
        data={exercises}
        keyExtractor={ex => ex.id}
        contentContainerStyle={styles.listContent}
        renderItem={({item: exercise}) => (
          <ExerciseRow
            exercise={exercise}
            sessionId={sessionId}
            sessionLogs={workout.sessionLogs[exercise.id] ?? []}
            onLogSet={(weightKg, reps) =>
              handleLogSet(exercise, weightKg, reps)
            }
          />
        )}
        ListFooterComponent={
          <TouchableOpacity style={styles.finishBtn} onPress={handleFinish}>
            <Text style={styles.finishBtnText}>Finish Workout</Text>
          </TouchableOpacity>
        }
      />

      {/* Full-screen timer overlay */}
      <Modal
        visible={showTimerOverlay}
        animationType="slide"
        onRequestClose={() => setShowTimerOverlay(false)}>
        <RestTimerOverlay onClose={() => setShowTimerOverlay(false)} />
      </Modal>
    </View>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  timerStrip: {
    backgroundColor: '#1A1A00',
    borderBottomWidth: 1,
    borderBottomColor: '#F97316',
    height: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  timerProgress: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(249,115,22,0.12)',
    left: 0,
  },
  timerStripText: {
    color: '#F97316',
    fontSize: 13,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 40,
  },
  finishBtn: {
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: '#7F1D1D',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  finishBtnText: {
    color: '#FECACA',
    fontSize: 16,
    fontWeight: '700',
  },
});
