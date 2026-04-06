/**
 * AsyncStorage-backed database layer.
 *
 * Keys used:
 *   gt_routines      → Routine[]
 *   gt_exercises     → Exercise[]
 *   gt_sessions      → WorkoutSession[]
 *   gt_setlogs       → SetLog[]
 *   gt_seeded        → 'true' once sample data has been written
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import {v4 as uuidv4} from 'uuid';
import type {Exercise, Routine, SetLog, WorkoutSession} from '../types/models';
import {buildSeedData} from '../data/sampleData';

// ─── Storage keys ─────────────────────────────────────────────────────────────

const KEYS = {
  routines: 'gt_routines',
  exercises: 'gt_exercises',
  sessions: 'gt_sessions',
  setLogs: 'gt_setlogs',
  seeded: 'gt_seeded',
} as const;

// ─── Generic helpers ──────────────────────────────────────────────────────────

async function readAll<T>(key: string): Promise<T[]> {
  const raw = await AsyncStorage.getItem(key);
  return raw ? (JSON.parse(raw) as T[]) : [];
}

async function writeAll<T>(key: string, items: T[]): Promise<void> {
  await AsyncStorage.setItem(key, JSON.stringify(items));
}

// ─── Seed ─────────────────────────────────────────────────────────────────────

/** Call once at app start. Inserts the 6 PPL routines if not already present. */
export async function seedIfNeeded(): Promise<void> {
  const seeded = await AsyncStorage.getItem(KEYS.seeded);
  if (seeded === 'true') {
    return;
  }
  const {routines, exercises} = buildSeedData();
  await writeAll(KEYS.routines, routines);
  await writeAll(KEYS.exercises, exercises);
  await AsyncStorage.setItem(KEYS.seeded, 'true');
}

// ─── Routines ─────────────────────────────────────────────────────────────────

export async function getRoutines(): Promise<Routine[]> {
  return readAll<Routine>(KEYS.routines);
}

export async function saveRoutine(routine: Routine): Promise<void> {
  const all = await getRoutines();
  const idx = all.findIndex(r => r.id === routine.id);
  if (idx >= 0) {
    all[idx] = routine;
  } else {
    all.push(routine);
  }
  await writeAll(KEYS.routines, all);
}

// ─── Exercises ────────────────────────────────────────────────────────────────

export async function getExercises(routineId?: string): Promise<Exercise[]> {
  const all = await readAll<Exercise>(KEYS.exercises);
  return routineId ? all.filter(e => e.routineId === routineId) : all;
}

export async function saveExercise(exercise: Exercise): Promise<void> {
  const all = await readAll<Exercise>(KEYS.exercises);
  const idx = all.findIndex(e => e.id === exercise.id);
  if (idx >= 0) {
    all[idx] = exercise;
  } else {
    all.push(exercise);
  }
  await writeAll(KEYS.exercises, all);
}

export async function saveExercises(exercises: Exercise[]): Promise<void> {
  const all = await readAll<Exercise>(KEYS.exercises);
  for (const ex of exercises) {
    const idx = all.findIndex(e => e.id === ex.id);
    if (idx >= 0) {
      all[idx] = ex;
    } else {
      all.push(ex);
    }
  }
  await writeAll(KEYS.exercises, all);
}

// ─── Workout sessions ─────────────────────────────────────────────────────────

export async function getSessions(): Promise<WorkoutSession[]> {
  return readAll<WorkoutSession>(KEYS.sessions);
}

export async function createSession(routineId: string, routineName: string): Promise<WorkoutSession> {
  const session: WorkoutSession = {
    id: uuidv4(),
    routineId,
    routineName,
    startDate: new Date().toISOString(),
    activeCalories: 0,
  };
  const all = await getSessions();
  all.push(session);
  await writeAll(KEYS.sessions, all);
  return session;
}

export async function updateSession(session: WorkoutSession): Promise<void> {
  const all = await getSessions();
  const idx = all.findIndex(s => s.id === session.id);
  if (idx >= 0) {
    all[idx] = session;
    await writeAll(KEYS.sessions, all);
  }
}

// ─── Set logs ─────────────────────────────────────────────────────────────────

export async function getSetLogs(sessionId?: string): Promise<SetLog[]> {
  const all = await readAll<SetLog>(KEYS.setLogs);
  return sessionId ? all.filter(l => l.sessionId === sessionId) : all;
}

export async function addSetLog(
  sessionId: string,
  exerciseId: string,
  setNumber: number,
  weightKg: number,
  reps: number,
): Promise<SetLog> {
  const log: SetLog = {
    id: uuidv4(),
    sessionId,
    exerciseId,
    setNumber,
    weightKg,
    reps,
    timestamp: new Date().toISOString(),
  };
  const all = await readAll<SetLog>(KEYS.setLogs);
  all.push(log);
  await writeAll(KEYS.setLogs, all);
  return log;
}

/**
 * Returns the most recent SetLog for the given exercise from any *previous*
 * (completed) session – used to show smart weight/rep suggestions.
 */
export async function getLastSetForExercise(
  exerciseId: string,
  currentSessionId: string,
): Promise<SetLog | null> {
  const all = await readAll<SetLog>(KEYS.setLogs);
  const previous = all
    .filter(l => l.exerciseId === exerciseId && l.sessionId !== currentSessionId)
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  return previous[0] ?? null;
}
