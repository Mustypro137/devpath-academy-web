import { describe, expect, it } from 'vitest'
import type { LessonBlock } from '../types/content'
import { getAdjacentLessons, getLesson, getLessonsForModule, LESSONS, MODULES } from '.'

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
})
