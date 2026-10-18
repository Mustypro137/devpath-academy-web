import { useEffect, useState, type ReactNode } from 'react'
import type { Progress } from '../../types/progress'
import { ProgressContext, type ProgressContextValue } from './ProgressContext'
import { createEmptyProgress, loadProgress, saveProgress } from './storage'

// Holds progress in React state for the whole app, and saves it whenever it changes.
export function ProgressProvider({ children }: { children: ReactNode }) {
  // Passing the function (not calling it) means it runs only on the first render.
  const [progress, setProgress] = useState<Progress>(loadProgress)

  // An effect runs after React updates the page. Listing [progress] means "run again whenever
  // progress changes", so every change is saved without each action having to remember to.
  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  const value: ProgressContextValue = {
    progress,
    isLessonComplete: (lessonId) => lessonId in progress.lessons,
    setLessonComplete: (lessonId, complete) =>
      // The updater form `(current) => next` always starts from the latest state.
      // We build new objects instead of changing the old ones: React only notices a change
      // when it gets a different object.
      setProgress((current) => {
        const lessons = { ...current.lessons }
        if (complete) {
          lessons[lessonId] = { completedAt: new Date().toISOString() }
        } else {
          delete lessons[lessonId]
        }
        return { ...current, lessons }
      }),
    getExerciseProgress: (exerciseId) => progress.exercises[exerciseId],
    updateExercise: (exerciseId, change) =>
      setProgress((current) => ({
        ...current,
        exercises: { ...current.exercises, [exerciseId]: change(current.exercises[exerciseId]) },
      })),
    recordAssessmentAttempt: (attempt) =>
      setProgress((current) => ({
        ...current,
        assessment: { attempts: [...current.assessment.attempts, attempt] },
      })),
    setProjectTask: (taskId, done) =>
      setProgress((current) => ({
        ...current,
        project: { ...current.project, tasks: { ...current.project.tasks, [taskId]: done } },
      })),
    setProjectRepoUrl: (repoUrl) =>
      setProgress((current) => ({ ...current, project: { ...current.project, repoUrl } })),
    updateWriting: (promptId, change) =>
      setProgress((current) => ({
        ...current,
        writing: { ...current.writing, [promptId]: change(current.writing[promptId]) },
      })),
    replaceProgress: setProgress,
    resetProgress: () => setProgress(createEmptyProgress()),
  }

  return <ProgressContext value={value}>{children}</ProgressContext>
}
