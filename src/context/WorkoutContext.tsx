/**
 * WorkoutContext – manages the currently active workout session.
 *
 * Provides CRUD helpers used by WorkoutSessionScreen and ExerciseRow.
 */

import React, {createContext, useCallback, useContext, useState} from 'react';
import type {Exercise, Routine, SetLog, WorkoutSession} from '../types/models';
import {
  addSetLog,
  createSession,
  getSetLogs,
  updateSession,
} from '../storage/database';
import {healthKitService} from '../services/healthKitService';

interface WorkoutContextValue {
  /** Null when no session is active */
  activeSession: WorkoutSession | null;
  /** Set logs for the active session, keyed by exerciseId */
  sessionLogs: Record<string, SetLog[]>;
  /** Start a new session for the given routine */
  startSession: (routine: Routine) => Promise<void>;
  /** Log a set; returns the saved SetLog */
  logSet: (exercise: Exercise, weightKg: number, reps: number) => Promise<SetLog | null>;
  /** Finish the active session and save to HealthKit */
  finishSession: () => Promise<void>;
}

const WorkoutContext = createContext<WorkoutContextValue | null>(null);

export function WorkoutProvider({children}: {children: React.ReactNode}): React.JSX.Element {
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [sessionLogs, setSessionLogs] = useState<Record<string, SetLog[]>>({});

  const startSession = useCallback(async (routine: Routine) => {
    const session = await createSession(routine.id, routine.name);
    setActiveSession(session);
    setSessionLogs({});
  }, []);

  const logSet = useCallback(
    async (exercise: Exercise, weightKg: number, reps: number): Promise<SetLog | null> => {
      if (!activeSession) {
        return null;
      }
      const existingLogs = sessionLogs[exercise.id] ?? [];
      const setNumber = existingLogs.length; // 0-based
      const log = await addSetLog(
        activeSession.id,
        exercise.id,
        setNumber,
        weightKg,
        reps,
      );
      setSessionLogs(prev => ({
        ...prev,
        [exercise.id]: [...(prev[exercise.id] ?? []), log],
      }));
      return log;
    },
    [activeSession, sessionLogs],
  );

  const finishSession = useCallback(async () => {
    if (!activeSession) {
      return;
    }
    const finished: WorkoutSession = {
      ...activeSession,
      endDate: new Date().toISOString(),
    };
    await updateSession(finished);
    healthKitService.saveWorkout(finished);

    // Reload logs from storage to ensure consistency
    await getSetLogs(finished.id);

    setActiveSession(null);
    setSessionLogs({});
  }, [activeSession]);

  return (
    <WorkoutContext.Provider
      value={{activeSession, sessionLogs, startSession, logSet, finishSession}}>
      {children}
    </WorkoutContext.Provider>
  );
}

export function useWorkout(): WorkoutContextValue {
  const ctx = useContext(WorkoutContext);
  if (!ctx) {
    throw new Error('useWorkout must be used within a WorkoutProvider');
  }
  return ctx;
}
