// The ONLY code that reads or writes saved progress. Everything else goes through useProgress().
// If progress moves to a server later, only this file needs to change.
import {
  PROGRESS_VERSION,
  type AssessmentAttempt,
  type ExerciseProgress,
  type LessonProgress,
  type Progress,
  type Submission,
  type TopicScore,
} from '../../types/progress'

export const PROGRESS_STORAGE_KEY = 'devpath-progress'
// Unreadable saved data is copied here before we start fresh, so it isn't lost for good.
export const CORRUPT_BACKUP_KEY = 'devpath-progress-corrupt'

// Older submissions are dropped, so saved data (and exported files) stay small.
export const MAX_SUBMISSIONS = 10

export function createEmptyProgress(): Progress {
  return { version: PROGRESS_VERSION, lessons: {}, exercises: {}, assessment: { attempts: [] } }
}

// --- Validation -------------------------------------------------------------------------------
// Saved data and imported files come from outside our code, so their type is `unknown` until
// checked. These type guards check the shape at runtime.

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isLessonProgress(value: unknown): value is LessonProgress {
  return isRecord(value) && typeof value.completedAt === 'string'
}

const OUTCOMES: readonly unknown[] = ['passed', 'failed', 'error', 'timeout']

function isSubmission(value: unknown): value is Submission {
  return (
    isRecord(value) &&
    typeof value.submittedAt === 'string' &&
    typeof value.code === 'string' &&
    OUTCOMES.includes(value.outcome) &&
    typeof value.passedCount === 'number' &&
    typeof value.testCount === 'number'
  )
}

function isExerciseProgress(value: unknown): value is ExerciseProgress {
  return (
    isRecord(value) &&
    (value.status === 'in-progress' || value.status === 'passed') &&
    typeof value.attempts === 'number' &&
    typeof value.hintsUsed === 'number' &&
    typeof value.lastCode === 'string' &&
    (value.solvedAt === undefined || typeof value.solvedAt === 'string') &&
    typeof value.solutionViewed === 'boolean' &&
    Array.isArray(value.submissions) &&
    value.submissions.every(isSubmission)
  )
}

// Checks one section: a record whose every value passes `isItem`.
// A missing section is treated as empty, so data saved before the section existed still loads.
function isTopicScore(value: unknown): value is TopicScore {
  return isRecord(value) && typeof value.correct === 'number' && typeof value.total === 'number'
}

function isAssessmentAttempt(value: unknown): value is AssessmentAttempt {
  return (
    isRecord(value) &&
    typeof value.completedAt === 'string' &&
    isTopicScore(value) && // an attempt has `correct` and `total` too
    isRecord(value.byTopic) &&
    Object.values(value.byTopic).every(isTopicScore)
  )
}

// The assessment section is `{ attempts: [...] }` rather than a record keyed by id.
function parseAssessment(value: unknown): Progress['assessment'] | null {
  if (value === undefined) return { attempts: [] } // saved before Milestone 6
  if (!isRecord(value) || !Array.isArray(value.attempts)) return null
  return value.attempts.every(isAssessmentAttempt) ? { attempts: value.attempts } : null
}

function parseSection<T>(
  value: unknown,
  isItem: (item: unknown) => item is T,
): Record<string, T> | null {
  if (value === undefined) return {}
  if (!isRecord(value)) return null
  return Object.values(value).every(isItem) ? (value as Record<string, T>) : null
}

// Turns any value into valid Progress, or null if it can't be trusted.
// Old versions are upgraded step by step. There is only version 1 so far; a future change adds
// e.g. `if (data.version === 1) data = migrateV1toV2(data)` above the version check.
export function migrate(data: unknown): Progress | null {
  if (!isRecord(data)) return null
  if (data.version !== PROGRESS_VERSION) return null // unknown, or from a newer app version

  const lessons = parseSection(data.lessons, isLessonProgress)
  const exercises = parseSection(data.exercises, isExerciseProgress)
  const assessment = parseAssessment(data.assessment)
  if (!lessons || !exercises || !assessment) return null

  // Build a fresh object rather than returning `data`, so unknown extra fields are dropped.
  return { version: PROGRESS_VERSION, lessons, exercises, assessment }
}

// --- localStorage -----------------------------------------------------------------------------

export function loadProgress(): Progress {
  let raw: string | null
  try {
    raw = localStorage.getItem(PROGRESS_STORAGE_KEY)
  } catch {
    return createEmptyProgress() // storage blocked (e.g. some private modes)
  }
  if (raw === null) return createEmptyProgress() // first visit

  const progress = parseProgressJson(raw)
  if (progress) return progress

  // Corrupted or unrecognised data: keep a copy, then start fresh instead of crashing.
  try {
    localStorage.setItem(CORRUPT_BACKUP_KEY, raw)
  } catch {
    // Nothing more we can do.
  }
  return createEmptyProgress()
}

export function saveProgress(progress: Progress): void {
  try {
    localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(progress))
  } catch {
    // Storage full or blocked. Progress still works for this visit; export is the backup.
  }
}

// --- Export / import --------------------------------------------------------------------------

export function progressToJson(progress: Progress): string {
  return JSON.stringify(progress, null, 2) // indented, so the file is readable
}

// Returns null for anything that isn't valid progress JSON: bad syntax or the wrong shape.
export function parseProgressJson(text: string): Progress | null {
  try {
    return migrate(JSON.parse(text))
  } catch {
    return null // JSON.parse throws on invalid JSON
  }
}
