// The rules for how an exercise's saved progress changes. Pure functions: each takes the current
// entry and returns a new one, and ExercisePage hands them to updateExercise().
import { MAX_SUBMISSIONS } from '../progress/storage'
import type { Exercise } from '../../types/content'
import type { ExerciseProgress, Submission } from '../../types/progress'
import type { RunOutcome } from './checker'

// The entry for an exercise opened for the first time.
export function startExercise(exercise: Exercise): ExerciseProgress {
  return {
    status: 'in-progress',
    attempts: 0,
    hintsUsed: 0,
    lastCode: exercise.starterCode,
    solutionViewed: false,
    submissions: [],
  }
}

// Sums up one run for the history list.
export function toSubmission(
  code: string,
  outcome: RunOutcome,
  testCount: number,
  submittedAt = new Date().toISOString(),
): Submission {
  if (outcome.status !== 'done') {
    return { submittedAt, code, outcome: outcome.status, passedCount: 0, testCount }
  }
  const passedCount = outcome.results.filter((result) => result.passed).length
  return {
    submittedAt,
    code,
    outcome: passedCount === testCount ? 'passed' : 'failed',
    passedCount,
    testCount,
  }
}

export function addSubmission(current: ExerciseProgress, submission: Submission): ExerciseProgress {
  const passed = submission.outcome === 'passed'
  return {
    ...current,
    status: passed ? 'passed' : current.status, // once passed, a later mistake doesn't undo it
    attempts: current.attempts + 1,
    lastCode: submission.code,
    solvedAt: current.solvedAt ?? (passed ? submission.submittedAt : undefined),
    // Newest first; `slice` keeps only the newest MAX_SUBMISSIONS.
    submissions: [submission, ...current.submissions].slice(0, MAX_SUBMISSIONS),
  }
}

export function revealNextHint(current: ExerciseProgress, exercise: Exercise): ExerciseProgress {
  return { ...current, hintsUsed: Math.min(current.hintsUsed + 1, exercise.hints.length) }
}
