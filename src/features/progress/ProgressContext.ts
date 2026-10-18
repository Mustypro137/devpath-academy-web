import { createContext } from 'react'
import type { Progress } from '../../types/progress'

// Everything a component can read or do with progress.
export interface ProgressContextValue {
  progress: Progress
  isLessonComplete: (lessonId: string) => boolean
  setLessonComplete: (lessonId: string, complete: boolean) => void
  replaceProgress: (progress: Progress) => void // used by import
  resetProgress: () => void
}

// A Context passes a value to every component below its Provider, without threading props
// through each level. `null` is the value when there is no Provider (a bug; see useProgress).
export const ProgressContext = createContext<ProgressContextValue | null>(null)
