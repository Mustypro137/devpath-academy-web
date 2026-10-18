import { createContext } from 'react'
import type { AssessmentAttempt, ExerciseProgress, Progress } from '../../types/progress'

// Everything a component can read or do with progress.
export interface ProgressContextValue {
  progress: Progress
  isLessonComplete: (lessonId: string) => boolean
  setLessonComplete: (lessonId: string, complete: boolean) => void
  getExerciseProgress: (exerciseId: string) => ExerciseProgress | undefined
  // `change` gets the current entry (undefined if the exercise was never opened) and returns
  // the new one. The rules for what changes live in features/exercises/exerciseProgress.ts.
  updateExercise: (
    exerciseId: string,
    change: (current: ExerciseProgress | undefined) => ExerciseProgress,
  ) => void
  recordAssessmentAttempt: (attempt: AssessmentAttempt) => void
  setProjectTask: (taskId: string, done: boolean) => void
  setProjectRepoUrl: (url: string) => void
  replaceProgress: (progress: Progress) => void // used by import
  resetProgress: () => void
}

// A Context passes a value to every component below its Provider, without threading props
// through each level. `null` is the value when there is no Provider (a bug; see useProgress).
export const ProgressContext = createContext<ProgressContextValue | null>(null)
