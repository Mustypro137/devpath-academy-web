import { useRef, useState, type ReactNode } from 'react'
import type { Progress } from '../../types/progress'
import { ProgressContext, type ProgressContextValue } from './ProgressContext'
import { createEmptyProgress, loadProgress, saveProgress } from './storage'

// Holds progress in React state for the whole app, and saves it on every change.
export function ProgressProvider({ children }: { children: ReactNode }) {
  // Passing the function (not calling it) means it runs only on the first render.
  const [progress, setProgress] = useState<Progress>(loadProgress)
  // The latest progress, readable at any moment. (`progress` above only catches up on the next
  // render, so two quick changes in a row would otherwise both start from the same old value.)
  const latest = useRef(progress)

  // Every action goes through here: work out the next progress from the latest, save it
  // straight away, then give it to React to re-render.
  // Saving here, not in an effect after rendering, matters when the page is closing: an
  // autosave that runs as the tab closes (see useAutosave) is written before the page is gone.
  function commit(update: (current: Progress) => Progress) {
    const next = update(latest.current)
    latest.current = next
    saveProgress(next)
    setProgress(next)
  }

  const value: ProgressContextValue = {
    progress,
    isLessonComplete: (lessonId) => lessonId in progress.lessons,
    setLessonComplete: (lessonId, complete) =>
      // We build new objects instead of changing the old ones: React only notices a change
      // when it gets a different object.
      commit((current) => {
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
      commit((current) => ({
        ...current,
        exercises: { ...current.exercises, [exerciseId]: change(current.exercises[exerciseId]) },
      })),
    recordAssessmentAttempt: (attempt) =>
      commit((current) => ({
        ...current,
        assessment: { attempts: [...current.assessment.attempts, attempt] },
      })),
    setProjectTask: (taskId, done) =>
      commit((current) => ({
        ...current,
        project: { ...current.project, tasks: { ...current.project.tasks, [taskId]: done } },
      })),
    setProjectRepoUrl: (repoUrl) =>
      commit((current) => ({ ...current, project: { ...current.project, repoUrl } })),
    updateWriting: (promptId, change) =>
      commit((current) => ({
        ...current,
        writing: { ...current.writing, [promptId]: change(current.writing[promptId]) },
      })),
    replaceProgress: (imported) => commit(() => imported),
    resetProgress: () => commit(createEmptyProgress),
  }

  return <ProgressContext value={value}>{children}</ProgressContext>
}
