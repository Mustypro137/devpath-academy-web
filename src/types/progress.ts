// The shape of the learner's saved progress. Stored in localStorage and in exported files.
// Later milestones add sections (exercises, assessment, ...). A section missing from older saved
// data is filled in as empty when loading, so adding one doesn't need a new version.
// Bump `version` (and add a migration in features/progress/storage.ts) only when an existing
// field changes meaning or shape.

export const PROGRESS_VERSION = 1

export interface LessonProgress {
  completedAt: string // ISO date, e.g. "2026-10-18T13:00:00.000Z"
}

// One press of Run. Only the newest few are kept (see MAX_SUBMISSIONS in storage.ts).
export interface Submission {
  submittedAt: string // ISO date
  code: string
  outcome: 'passed' | 'failed' | 'error' | 'timeout'
  passedCount: number // tests passed, out of testCount
  testCount: number
}

export interface ExerciseProgress {
  status: 'in-progress' | 'passed' // passed stays passed, even if a later run fails
  attempts: number // how many times Run was pressed
  hintsUsed: number // hints revealed so far; they are shown in order
  lastCode: string // what is in the editor, so it comes back after a refresh
  solvedAt?: string // ISO date of the first passing run
  solutionViewed: boolean
  submissions: Submission[] // newest first
}

export interface TopicScore {
  correct: number
  total: number
}

// One completed skill assessment.
export interface AssessmentAttempt {
  completedAt: string // ISO date
  correct: number // questions answered correctly, out of `total`
  total: number
  byTopic: Record<string, TopicScore> // keyed by topic, e.g. "functions"
}

export interface Progress {
  version: typeof PROGRESS_VERSION
  lessons: Record<string, LessonProgress> // keyed by lesson id
  exercises: Record<string, ExerciseProgress> // keyed by exercise id
  assessment: { attempts: AssessmentAttempt[] } // oldest first
}
