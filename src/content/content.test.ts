import { describe, expect, it } from 'vitest'
import type { LessonBlock } from '../types/content'
import { loadFunction, runTests } from '../features/exercises/checker'
import {
  EXERCISES,
  getAdjacentLessons,
  getExercisesForLesson,
  getLesson,
  getLessonForExercise,
  getLessonsForModule,
  LESSONS,
  MODULES,
} from '.'

// These tests check the content itself, so mistakes in lesson data fail the build
// instead of showing up as a broken page.

// Every piece of text in a block that may contain `inline code`.
function textsOf(block: LessonBlock): string[] {
  switch (block.type) {
    case 'heading':
    case 'text':
    case 'callout':
      return [block.text]
    case 'list':
      return block.items
    case 'code':
      return []
  }
}

describe('course content', () => {
  it('gives every lesson a unique id', () => {
    const ids = LESSONS.map((lesson) => lesson.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('uses URL-safe lesson ids (lowercase letters, digits, dashes)', () => {
    for (const lesson of LESSONS) {
      expect(lesson.id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
    }
  })

  it('gives every module at least two lessons', () => {
    for (const module of MODULES) {
      expect(getLessonsForModule(module.id).length).toBeGreaterThanOrEqual(2)
    }
  })

  it('gives every lesson content and a sensible reading time', () => {
    for (const lesson of LESSONS) {
      expect(lesson.blocks.length).toBeGreaterThan(0)
      expect(lesson.estimatedMinutes).toBeGreaterThan(0)
    }
  })

  it('closes every `inline code` backtick', () => {
    for (const lesson of LESSONS) {
      for (const text of lesson.blocks.flatMap(textsOf)) {
        const backticks = text.split('`').length - 1
        expect(backticks % 2, `Unbalanced backtick in "${lesson.id}": ${text}`).toBe(0)
      }
    }
  })
})

describe('exercises', () => {
  it('gives every exercise a unique, URL-safe id', () => {
    const ids = EXERCISES.map((exercise) => exercise.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('links every exercise from exactly one lesson, and every link to a real exercise', () => {
    for (const exercise of EXERCISES) {
      const linkingLessons = LESSONS.filter((lesson) => lesson.exerciseIds.includes(exercise.id))
      expect(linkingLessons, exercise.id).toHaveLength(1)
    }
    for (const lesson of LESSONS) {
      expect(getExercisesForLesson(lesson)).toHaveLength(lesson.exerciseIds.length)
    }
  })

  it('gives every exercise instructions, at least two tests, and at least one hint', () => {
    for (const exercise of EXERCISES) {
      expect(exercise.instructions.length, exercise.id).toBeGreaterThan(0)
      expect(exercise.tests.length, exercise.id).toBeGreaterThanOrEqual(2)
      expect(exercise.hints.length, exercise.id).toBeGreaterThan(0)
    }
  })

  // The most important content test: a wrong solution or test would make an exercise impossible.
  it.each(EXERCISES.map((exercise) => [exercise.id, exercise]))(
    '%s: the solution passes every test',
    (_id, exercise) => {
      const results = runTests(
        loadFunction(exercise.solution, exercise.functionName),
        exercise.tests,
      )
      for (const result of results)
        expect(result, result.description).toMatchObject({ passed: true })
    },
  )

  it.each(EXERCISES.map((exercise) => [exercise.id, exercise]))(
    '%s: the starter code does not already pass',
    (_id, exercise) => {
      const results = runTests(
        loadFunction(exercise.starterCode, exercise.functionName),
        exercise.tests,
      )
      expect(results.every((result) => result.passed)).toBe(false)
    },
  )

  it('closes every `inline code` backtick in instructions, hints, and explanations', () => {
    for (const exercise of EXERCISES) {
      for (const text of [...exercise.instructions, ...exercise.hints, exercise.explanation]) {
        const backticks = text.split('`').length - 1
        expect(backticks % 2, `Unbalanced backtick in "${exercise.id}": ${text}`).toBe(0)
      }
    }
  })
})

describe('content helpers', () => {
  it('finds a lesson by id, and returns undefined for unknown ids', () => {
    expect(getLesson('css-box-model')?.title).toBe('The box model')
    expect(getLesson('nope')).toBeUndefined()
    expect(getLesson(undefined)).toBeUndefined()
  })

  it('finds the previous and next lessons across module boundaries', () => {
    const first = LESSONS[0]
    const last = LESSONS[LESSONS.length - 1]

    expect(getAdjacentLessons(first.id)).toEqual({ previous: undefined, next: LESSONS[1] })
    expect(getAdjacentLessons(last.id).next).toBeUndefined()

    // The last HTML lesson leads into the first CSS lesson.
    const lastHtml = getLessonsForModule('html').at(-1)!
    expect(getAdjacentLessons(lastHtml.id).next).toBe(getLessonsForModule('css')[0])
  })

  it('finds the lesson an exercise belongs to', () => {
    expect(getLessonForExercise('js-double')?.id).toBe('js-functions')
    expect(getLessonForExercise('nope')).toBeUndefined()
  })
})
