// The single entry point for reading course content. Pages import from here, never from the
// individual lesson files, so the content can be reorganised without touching the pages.
import type { Exercise, Lesson, Module, ModuleId, WritingPrompt } from '../types/content'
import { htmlCssExercises } from './exercises/htmlCss'
import { jsExercises } from './exercises/js'
import { cssLessons } from './lessons/css'
import { htmlLessons } from './lessons/html'
import { jsLessons } from './lessons/js'
import { MODULES } from './modules'
import { WRITING_PROMPTS } from './writingPrompts'

export { MODULES }
export { ASSESSMENT_QUESTIONS, ASSESSMENT_TOPICS } from './assessment'
export { PROJECT } from './project'
export { WRITING_CATEGORIES, WRITING_PROMPTS } from './writingPrompts'

// All lessons in course order: module by module, lessons in file order.
export const LESSONS: readonly Lesson[] = [...htmlLessons, ...cssLessons, ...jsLessons]

export function getLesson(id: string | undefined): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.id === id)
}

export function getModule(id: ModuleId): Module | undefined {
  return MODULES.find((module) => module.id === id)
}

export function getLessonsForModule(moduleId: ModuleId): Lesson[] {
  return LESSONS.filter((lesson) => lesson.moduleId === moduleId)
}

// The lessons just before and after this one in the whole course (undefined at either end).
export function getAdjacentLessons(id: string): { previous?: Lesson; next?: Lesson } {
  const index = LESSONS.findIndex((lesson) => lesson.id === id)
  if (index === -1) return {}
  return { previous: LESSONS[index - 1], next: LESSONS[index + 1] }
}

export const EXERCISES: readonly Exercise[] = [...htmlCssExercises, ...jsExercises]

export function getExercise(id: string | undefined): Exercise | undefined {
  return EXERCISES.find((exercise) => exercise.id === id)
}

// The exercises listed on a lesson, in the lesson's order. Unknown ids are skipped (and caught
// by content.test.ts).
export function getExercisesForLesson(lesson: Lesson): Exercise[] {
  return lesson.exerciseIds.flatMap((id) => getExercise(id) ?? [])
}

// The lesson that links to an exercise, used for the "back to lesson" link.
export function getLessonForExercise(exerciseId: string): Lesson | undefined {
  return LESSONS.find((lesson) => lesson.exerciseIds.includes(exerciseId))
}

export function getWritingPrompt(id: string | undefined): WritingPrompt | undefined {
  return WRITING_PROMPTS.find((prompt) => prompt.id === id)
}
