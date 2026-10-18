// The single entry point for reading course content. Pages import from here, never from the
// individual lesson files, so the content can be reorganised without touching the pages.
import type { Lesson, Module, ModuleId } from '../types/content'
import { cssLessons } from './lessons/css'
import { htmlLessons } from './lessons/html'
import { jsLessons } from './lessons/js'
import { MODULES } from './modules'

export { MODULES }

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
