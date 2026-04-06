// ─── Domain types ────────────────────────────────────────────────────────────

export type RoutineCategory = 'Push' | 'Pull' | 'Legs';

export interface Exercise {
  id: string;
  routineId: string;
  name: string;
  targetMuscleGroup: string;
  defaultSets: number;
  defaultReps: number;
  order: number;
  /** Per-exercise rest duration in seconds; 0 = use global default */
  restDurationSeconds: number;
}

export interface Routine {
  id: string;
  name: string;
  category: RoutineCategory;
  variant: 'A' | 'B';
  isCustom: boolean;
  /** Display name of the author (Marketplace routines) */
  authorName?: string;
  /** Opaque identifier used to prevent duplicate marketplace imports */
  shareId?: string;
}

export interface SetLog {
  id: string;
  sessionId: string;
  exerciseId: string;
  /** 0-based internal index. Display as setNumber + 1 in the UI. */
  setNumber: number;
  weightKg: number;
  reps: number;
  timestamp: string;  // ISO-8601
}

export interface WorkoutSession {
  id: string;
  routineId: string;
  routineName: string;
  startDate: string;   // ISO-8601
  endDate?: string;    // ISO-8601; undefined if still active
  activeCalories: number;
}

// ─── Marketplace types ────────────────────────────────────────────────────────

export interface SharedExercise {
  name: string;
  targetMuscleGroup: string;
  defaultSets: number;
  defaultReps: number;
}

export interface SharedRoutine {
  id: string;
  name: string;
  category: RoutineCategory;
  variant: 'A' | 'B';
  authorName: string;
  publishedAt: string;  // ISO-8601
  downloadCount: number;
  exercises: SharedExercise[];
}

// ─── Helper ───────────────────────────────────────────────────────────────────

export const CATEGORY_EMOJI: Record<RoutineCategory, string> = {
  Push: '🏋️',
  Pull: '🚣',
  Legs: '🏃',
};

export const CATEGORY_COLOR: Record<RoutineCategory, string> = {
  Push: '#F97316',   // orange
  Pull: '#3B82F6',   // blue
  Legs: '#22C55E',   // green
};
