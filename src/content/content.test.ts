import { describe, expect, it } from 'vitest'
import type { LessonBlock } from '../types/content'
import { loadFunction, runTests } from '../features/exercises/checker'
import { checkDocument } from '../features/exercises/domChecks'
import { countWords } from '../features/career/wordCount'
import type { Exercise } from '../types/content'
import {
  ASSESSMENT_QUESTIONS,
  ASSESSMENT_TOPICS,
  EXERCISES,
  getAdjacentLessons,
  getExercisesForLesson,
  getLesson,
  getLessonForExercise,
  getLessonsForModule,
  LESSONS,
  getWritingPrompt,
  MODULES,
  PROJECT,
  WRITING_CATEGORIES,
  WRITING_PROMPTS,
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

// Runs an exercise's tests against `code`, the same way the app does, minus the Worker/iframe.
function check(exercise: Exercise, code: string) {
  if (exercise.language === 'js') {
    return runTests(loadFunction(code, exercise.functionName), exercise.tests)
  }
  // HTML/CSS: put the code into this test's page and check it there.
  document.body.innerHTML = code
  const results = checkDocument(document, exercise.tests)
  document.body.innerHTML = ''
  return results
}

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
      for (const result of check(exercise, exercise.solution)) {
        expect(result, result.description).toMatchObject({ passed: true })
      }
    },
  )

  it.each(EXERCISES.map((exercise) => [exercise.id, exercise]))(
    '%s: the starter code does not already pass',
    (_id, exercise) => {
      expect(check(exercise, exercise.starterCode).every((result) => result.passed)).toBe(false)
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

describe('assessment questions', () => {
  it('has around 15 questions with unique ids', () => {
    expect(ASSESSMENT_QUESTIONS.length).toBeGreaterThanOrEqual(12)
    expect(ASSESSMENT_QUESTIONS.length).toBeLessThanOrEqual(18)
    const ids = ASSESSMENT_QUESTIONS.map((question) => question.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('gives every question distinct options and a valid correct answer', () => {
    for (const question of ASSESSMENT_QUESTIONS) {
      expect(question.options.length, question.id).toBeGreaterThanOrEqual(2)
      expect(new Set(question.options).size, question.id).toBe(question.options.length)
      expect(question.correctIndex, question.id).toBeGreaterThanOrEqual(0)
      expect(question.correctIndex, question.id).toBeLessThan(question.options.length)
    }
  })

  it('covers every topic with at least three questions', () => {
    for (const topic of Object.keys(ASSESSMENT_TOPICS)) {
      const count = ASSESSMENT_QUESTIONS.filter((question) => question.topic === topic).length
      expect(count, topic).toBeGreaterThanOrEqual(3)
    }
  })

  it('links every topic to a real lesson', () => {
    for (const { lessonId } of Object.values(ASSESSMENT_TOPICS)) {
      expect(getLesson(lessonId), lessonId).toBeDefined()
    }
  })

  it("doesn't always put the right answer in the same place", () => {
    const positions = new Set(ASSESSMENT_QUESTIONS.map((question) => question.correctIndex))
    expect(positions.size).toBeGreaterThanOrEqual(3)
  })

  it('closes every `inline code` backtick', () => {
    for (const question of ASSESSMENT_QUESTIONS) {
      for (const text of [question.prompt, ...question.options, question.explanation]) {
        const backticks = text.split('`').length - 1
        expect(backticks % 2, `Unbalanced backtick in "${question.id}": ${text}`).toBe(0)
      }
    }
  })
})

describe('project', () => {
  const tasks = PROJECT.milestones.flatMap((milestone) => milestone.tasks)

  it('has 5–6 milestones, each with tasks, a goal, and hints', () => {
    expect(PROJECT.milestones.length).toBeGreaterThanOrEqual(5)
    expect(PROJECT.milestones.length).toBeLessThanOrEqual(6)
    for (const milestone of PROJECT.milestones) {
      expect(milestone.tasks.length, milestone.id).toBeGreaterThan(0)
      expect(milestone.goal, milestone.id).not.toBe('')
      expect(milestone.hints.length, milestone.id).toBeGreaterThan(0)
    }
  })

  // Saved progress refers to tasks by id, so ids must be unique and must never be reused.
  it('gives every task and milestone a unique, URL-safe id', () => {
    const ids = [
      ...PROJECT.milestones.map((milestone) => milestone.id),
      ...tasks.map((task) => task.id),
    ]
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('closes every `inline code` backtick', () => {
    const texts = [
      ...PROJECT.brief,
      ...tasks.map((task) => task.text),
      ...PROJECT.milestones.flatMap((milestone) => [milestone.goal, ...milestone.hints]),
    ]
    for (const text of texts) {
      expect((text.split('`').length - 1) % 2, `Unbalanced backtick: ${text}`).toBe(0)
    }
  })
})

describe('writing prompts', () => {
  it('has around six prompts with unique, URL-safe ids', () => {
    expect(WRITING_PROMPTS.length).toBeGreaterThanOrEqual(5)
    const ids = WRITING_PROMPTS.map((prompt) => prompt.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const id of ids) expect(id).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
  })

  it('gives every category at least one prompt', () => {
    for (const category of Object.keys(WRITING_CATEGORIES)) {
      expect(
        WRITING_PROMPTS.some((prompt) => prompt.category === category),
        category,
      ).toBe(true)
    }
  })

  it('gives every prompt a scenario, tips, a checklist, and a sensible word range', () => {
    for (const prompt of WRITING_PROMPTS) {
      expect(prompt.scenario.length, prompt.id).toBeGreaterThan(0)
      expect(prompt.tips.length, prompt.id).toBeGreaterThan(0)
      expect(prompt.checklist.length, prompt.id).toBeGreaterThan(0)
      expect(prompt.targetWords.min, prompt.id).toBeLessThan(prompt.targetWords.max)
    }
  })

  // A good example should follow the advice it comes with.
  it('keeps every example within its own word range', () => {
    for (const prompt of WRITING_PROMPTS) {
      if (!prompt.example) continue
      const words = countWords(prompt.example)
      expect(words, prompt.id).toBeGreaterThanOrEqual(prompt.targetWords.min)
      expect(words, prompt.id).toBeLessThanOrEqual(prompt.targetWords.max)
    }
  })

  it('closes every `inline code` backtick in scenarios', () => {
    for (const text of WRITING_PROMPTS.flatMap((prompt) => prompt.scenario)) {
      expect((text.split('`').length - 1) % 2, `Unbalanced backtick: ${text}`).toBe(0)
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

  it('finds a writing prompt by id', () => {
    expect(getWritingPrompt('readme')?.title).toBe('A README for your project')
    expect(getWritingPrompt('nope')).toBeUndefined()
  })

  it('finds the lesson an exercise belongs to', () => {
    expect(getLessonForExercise('js-double')?.id).toBe('js-functions')
    expect(getLessonForExercise('nope')).toBeUndefined()
  })
})
