import type {Exercise, Routine, SharedRoutine} from '../types/models';
import {v4 as uuidv4} from 'uuid';

// ─── Pre-populated PPL routines ───────────────────────────────────────────────

type ExerciseSeed = Omit<Exercise, 'id' | 'routineId'>;

const pushA: ExerciseSeed[] = [
  {name: 'Barbell Bench Press',    targetMuscleGroup: 'Chest',       defaultSets: 4, defaultReps: 8,  order: 0, restDurationSeconds: 0},
  {name: 'Incline Dumbbell Press', targetMuscleGroup: 'Upper Chest', defaultSets: 3, defaultReps: 10, order: 1, restDurationSeconds: 0},
  {name: 'Overhead Press',         targetMuscleGroup: 'Shoulders',   defaultSets: 4, defaultReps: 8,  order: 2, restDurationSeconds: 0},
  {name: 'Lateral Raises',         targetMuscleGroup: 'Shoulders',   defaultSets: 3, defaultReps: 15, order: 3, restDurationSeconds: 0},
  {name: 'Tricep Pushdowns',       targetMuscleGroup: 'Triceps',     defaultSets: 3, defaultReps: 12, order: 4, restDurationSeconds: 0},
  {name: 'Overhead Tricep Ext.',   targetMuscleGroup: 'Triceps',     defaultSets: 3, defaultReps: 12, order: 5, restDurationSeconds: 0},
];

const pushB: ExerciseSeed[] = [
  {name: 'Dumbbell Shoulder Press', targetMuscleGroup: 'Shoulders', defaultSets: 4, defaultReps: 10, order: 0, restDurationSeconds: 0},
  {name: 'Cable Crossovers',        targetMuscleGroup: 'Chest',     defaultSets: 3, defaultReps: 15, order: 1, restDurationSeconds: 0},
  {name: 'Close-Grip Bench Press',  targetMuscleGroup: 'Triceps',   defaultSets: 4, defaultReps: 8,  order: 2, restDurationSeconds: 0},
  {name: 'Machine Chest Fly',       targetMuscleGroup: 'Chest',     defaultSets: 3, defaultReps: 12, order: 3, restDurationSeconds: 0},
  {name: 'Skull Crushers',          targetMuscleGroup: 'Triceps',   defaultSets: 3, defaultReps: 12, order: 4, restDurationSeconds: 0},
];

const pullA: ExerciseSeed[] = [
  {name: 'Barbell Deadlift',      targetMuscleGroup: 'Back',       defaultSets: 4, defaultReps: 6,  order: 0, restDurationSeconds: 0},
  {name: 'Pull-Ups',              targetMuscleGroup: 'Lats',       defaultSets: 4, defaultReps: 8,  order: 1, restDurationSeconds: 0},
  {name: 'Barbell Row',           targetMuscleGroup: 'Back',       defaultSets: 4, defaultReps: 8,  order: 2, restDurationSeconds: 0},
  {name: 'Face Pulls',            targetMuscleGroup: 'Rear Delts', defaultSets: 3, defaultReps: 15, order: 3, restDurationSeconds: 0},
  {name: 'Dumbbell Bicep Curls',  targetMuscleGroup: 'Biceps',     defaultSets: 3, defaultReps: 12, order: 4, restDurationSeconds: 0},
  {name: 'Hammer Curls',          targetMuscleGroup: 'Biceps',     defaultSets: 3, defaultReps: 12, order: 5, restDurationSeconds: 0},
];

const pullB: ExerciseSeed[] = [
  {name: 'Weighted Pull-Ups',    targetMuscleGroup: 'Lats',   defaultSets: 4, defaultReps: 6,  order: 0, restDurationSeconds: 0},
  {name: 'Seated Cable Row',     targetMuscleGroup: 'Back',   defaultSets: 4, defaultReps: 10, order: 1, restDurationSeconds: 0},
  {name: 'Lat Pulldown',         targetMuscleGroup: 'Lats',   defaultSets: 3, defaultReps: 12, order: 2, restDurationSeconds: 0},
  {name: 'Incline Dumbbell Curl',targetMuscleGroup: 'Biceps', defaultSets: 3, defaultReps: 12, order: 3, restDurationSeconds: 0},
  {name: 'Cable Curls',          targetMuscleGroup: 'Biceps', defaultSets: 3, defaultReps: 15, order: 4, restDurationSeconds: 0},
];

const legsA: ExerciseSeed[] = [
  {name: 'Barbell Back Squat', targetMuscleGroup: 'Quads',      defaultSets: 4, defaultReps: 8,  order: 0, restDurationSeconds: 0},
  {name: 'Romanian Deadlift',  targetMuscleGroup: 'Hamstrings', defaultSets: 4, defaultReps: 10, order: 1, restDurationSeconds: 0},
  {name: 'Leg Press',          targetMuscleGroup: 'Quads',      defaultSets: 3, defaultReps: 12, order: 2, restDurationSeconds: 0},
  {name: 'Leg Curls',          targetMuscleGroup: 'Hamstrings', defaultSets: 3, defaultReps: 12, order: 3, restDurationSeconds: 0},
  {name: 'Calf Raises',        targetMuscleGroup: 'Calves',     defaultSets: 4, defaultReps: 15, order: 4, restDurationSeconds: 0},
];

const legsB: ExerciseSeed[] = [
  {name: 'Front Squat',          targetMuscleGroup: 'Quads',      defaultSets: 4, defaultReps: 8,  order: 0, restDurationSeconds: 0},
  {name: 'Sumo Deadlift',        targetMuscleGroup: 'Hamstrings', defaultSets: 4, defaultReps: 8,  order: 1, restDurationSeconds: 0},
  {name: 'Walking Lunges',       targetMuscleGroup: 'Quads',      defaultSets: 3, defaultReps: 12, order: 2, restDurationSeconds: 0},
  {name: 'Seated Leg Curls',     targetMuscleGroup: 'Hamstrings', defaultSets: 3, defaultReps: 12, order: 3, restDurationSeconds: 0},
  {name: 'Leg Extension',        targetMuscleGroup: 'Quads',      defaultSets: 3, defaultReps: 15, order: 4, restDurationSeconds: 0},
  {name: 'Standing Calf Raises', targetMuscleGroup: 'Calves',     defaultSets: 4, defaultReps: 15, order: 5, restDurationSeconds: 0},
];

type RoutineSeed = {name: string; category: Routine['category']; variant: Routine['variant']; exercises: ExerciseSeed[]};

const ROUTINE_SEEDS: RoutineSeed[] = [
  {name: 'Push A', category: 'Push', variant: 'A', exercises: pushA},
  {name: 'Pull A', category: 'Pull', variant: 'A', exercises: pullA},
  {name: 'Legs A', category: 'Legs', variant: 'A', exercises: legsA},
  {name: 'Push B', category: 'Push', variant: 'B', exercises: pushB},
  {name: 'Pull B', category: 'Pull', variant: 'B', exercises: pullB},
  {name: 'Legs B', category: 'Legs', variant: 'B', exercises: legsB},
];

/** Returns fully-hydrated Routine + Exercise objects ready to persist. */
export function buildSeedData(): {routines: Routine[]; exercises: Exercise[]} {
  const routines: Routine[] = [];
  const exercises: Exercise[] = [];

  for (const seed of ROUTINE_SEEDS) {
    const routineId = uuidv4();
    routines.push({
      id: routineId,
      name: seed.name,
      category: seed.category,
      variant: seed.variant,
      isCustom: false,
    });
    for (const ex of seed.exercises) {
      exercises.push({...ex, id: uuidv4(), routineId});
    }
  }

  return {routines, exercises};
}

// ─── Simulated Marketplace feed ───────────────────────────────────────────────

export const MARKETPLACE_LISTINGS: SharedRoutine[] = [
  {
    id: 'A1B2C3D4-E5F6-7890-ABCD-EF1234567890',
    name: 'Hypertrophy Push',
    category: 'Push',
    variant: 'A',
    authorName: 'Alex M.',
    publishedAt: '2025-01-15T10:00:00Z',
    downloadCount: 142,
    exercises: [
      {name: 'Incline Smith Press',    targetMuscleGroup: 'Upper Chest', defaultSets: 4, defaultReps: 10},
      {name: 'Cable Lateral Raise',    targetMuscleGroup: 'Shoulders',   defaultSets: 4, defaultReps: 15},
      {name: 'Pec Deck Fly',           targetMuscleGroup: 'Chest',       defaultSets: 3, defaultReps: 12},
      {name: 'Rope Pushdown',          targetMuscleGroup: 'Triceps',     defaultSets: 3, defaultReps: 15},
    ],
  },
  {
    id: 'B2C3D4E5-F6A7-8901-BCDE-F12345678901',
    name: 'Deadlift-Focused Pull',
    category: 'Pull',
    variant: 'A',
    authorName: 'Jamie K.',
    publishedAt: '2025-02-03T08:30:00Z',
    downloadCount: 98,
    exercises: [
      {name: 'Conventional Deadlift', targetMuscleGroup: 'Back',   defaultSets: 5, defaultReps: 5},
      {name: 'Weighted Chin-Up',      targetMuscleGroup: 'Lats',   defaultSets: 4, defaultReps: 6},
      {name: 'Pendlay Row',           targetMuscleGroup: 'Back',   defaultSets: 4, defaultReps: 8},
      {name: 'Preacher Curl',         targetMuscleGroup: 'Biceps', defaultSets: 3, defaultReps: 12},
    ],
  },
  {
    id: 'C3D4E5F6-A7B8-9012-CDEF-012345678902',
    name: 'Athletic Legs',
    category: 'Legs',
    variant: 'A',
    authorName: 'Sam R.',
    publishedAt: '2025-03-20T12:00:00Z',
    downloadCount: 213,
    exercises: [
      {name: 'Bulgarian Split Squat',   targetMuscleGroup: 'Quads',      defaultSets: 4, defaultReps: 10},
      {name: 'Nordic Hamstring Curl',   targetMuscleGroup: 'Hamstrings', defaultSets: 3, defaultReps: 6},
      {name: 'Hack Squat',              targetMuscleGroup: 'Quads',      defaultSets: 3, defaultReps: 12},
      {name: 'Seated Calf Raise',       targetMuscleGroup: 'Calves',     defaultSets: 4, defaultReps: 20},
    ],
  },
  {
    id: 'D4E5F6A7-B8C9-0123-DEF0-123456789003',
    name: 'Upper/Push Volume',
    category: 'Push',
    variant: 'B',
    authorName: 'Chris T.',
    publishedAt: '2025-04-01T07:45:00Z',
    downloadCount: 57,
    exercises: [
      {name: 'Flat DB Press',           targetMuscleGroup: 'Chest',     defaultSets: 4, defaultReps: 12},
      {name: 'Arnold Press',            targetMuscleGroup: 'Shoulders', defaultSets: 4, defaultReps: 10},
      {name: 'Cable Flye High',         targetMuscleGroup: 'Lower Chest',defaultSets: 3, defaultReps: 15},
      {name: 'EZ-Bar Skullcrusher',     targetMuscleGroup: 'Triceps',   defaultSets: 3, defaultReps: 12},
      {name: 'Lateral Raise Machine',   targetMuscleGroup: 'Shoulders', defaultSets: 3, defaultReps: 15},
    ],
  },
];
