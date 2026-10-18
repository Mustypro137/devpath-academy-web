// Saved progress for different kinds of learner, built from the real course content.
// Shared by the dashboard's logic tests and page tests.
import { EXERCISES, LESSONS, PROJECT, WRITING_PROMPTS } from '../content'
import { startExercise } from '../features/exercises/exerciseProgress'
import { createEmptyProgress } from '../features/progress/storage'
import type { Progress } from '../types/progress'

export const DATE = '2026-10-18T12:00:00.000Z'

export function withLessons(progress: Progress, lessonIds: string[]): Progress {
  const lessons = { ...progress.lessons }
  for (const id of lessonIds) lessons[id] = { completedAt: DATE }
  return { ...progress, lessons }
}

export function withPassed(progress: Progress, exerciseIds: string[]): Progress {
  const exercises = { ...progress.exercises }
  for (const id of exerciseIds) {
    const exercise = EXERCISES.find((ex) => ex.id === id)!
    exercises[id] = { ...startExercise(exercise), status: 'passed', attempts: 1, solvedAt: DATE }
  }
  return { ...progress, exercises }
}

// Every lesson read, every exercise passed, every project task and writing prompt done.
export function finished(): Progress {
  let progress = withLessons(
    createEmptyProgress(),
    LESSONS.map((lesson) => lesson.id),
  )
  progress = withPassed(
    progress,
    EXERCISES.map((exercise) => exercise.id),
  )
  const tasks = PROJECT.milestones.flatMap((m) => m.tasks).map((task) => [task.id, true])
  progress.project = { tasks: Object.fromEntries(tasks), repoUrl: '' }
  progress.writing = Object.fromEntries(
    WRITING_PROMPTS.map((prompt) => [
      prompt.id,
      { draft: 'Done.', checklist: prompt.checklist.map(() => true), updatedAt: DATE },
    ]),
  )
  return progress
}
