import { describe, expect, it } from 'vitest'
import { EXERCISES, getExercisesForLesson, LESSONS, PROJECT, WRITING_PROMPTS } from '../../content'
import type { Progress } from '../../types/progress'
import { startExercise } from '../exercises/exerciseProgress'
import { createEmptyProgress } from '../progress/storage'
import { describePlace, nextStep, summarizeDashboard } from './dashboard'

const DATE = '2026-10-18T12:00:00.000Z'

// --- Building progress for each kind of learner ---

function withLessons(progress: Progress, lessonIds: string[]): Progress {
  const lessons = { ...progress.lessons }
  for (const id of lessonIds) lessons[id] = { completedAt: DATE }
  return { ...progress, lessons }
}

function withPassed(progress: Progress, exerciseIds: string[]): Progress {
  const exercises = { ...progress.exercises }
  for (const id of exerciseIds) {
    const exercise = EXERCISES.find((ex) => ex.id === id)!
    exercises[id] = { ...startExercise(exercise), status: 'passed', attempts: 1, solvedAt: DATE }
  }
  return { ...progress, exercises }
}

// Every lesson read, every exercise passed, every project task and writing prompt done.
function finished(): Progress {
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

const [firstLesson, secondLesson] = LESSONS
const firstExercise = getExercisesForLesson(firstLesson)[0]

describe('nextStep for a new learner', () => {
  it('suggests the skill assessment', () => {
    expect(nextStep(createEmptyProgress())).toMatchObject({ to: '/assessment' })
  })

  it('treats opening an exercise without running it as not started', () => {
    const progress = createEmptyProgress()
    progress.exercises[firstExercise.id] = startExercise(firstExercise) // 0 attempts
    expect(nextStep(progress).to).toBe('/assessment')
  })
})

describe('nextStep for a learner partway through', () => {
  it('suggests the first lesson after the assessment', () => {
    const progress = createEmptyProgress()
    progress.assessment.attempts.push({
      completedAt: DATE,
      correct: 10,
      total: 15,
      byTopic: {},
    })
    expect(nextStep(progress).to).toBe(`/learn/${firstLesson.id}`)
  })

  it("suggests a read lesson's exercises before the next lesson", () => {
    const progress = withLessons(createEmptyProgress(), [firstLesson.id])
    expect(nextStep(progress)).toMatchObject({
      to: `/exercises/${firstExercise.id}`,
      title: `Practise: “${firstExercise.title}”`,
    })
  })

  it('moves to the next lesson once the exercises are passed', () => {
    const progress = withPassed(
      withLessons(createEmptyProgress(), [firstLesson.id]),
      getExercisesForLesson(firstLesson).map((ex) => ex.id),
    )
    expect(nextStep(progress).to).toBe(`/learn/${secondLesson.id}`)
  })

  it('goes back to an earlier lesson that was skipped', () => {
    const progress = withLessons(createEmptyProgress(), [secondLesson.id])
    expect(nextStep(progress).to).toBe(`/learn/${firstLesson.id}`)
  })

  it('suggests the project once every lesson and exercise is done', () => {
    const progress = withPassed(
      withLessons(
        createEmptyProgress(),
        LESSONS.map((lesson) => lesson.id),
      ),
      EXERCISES.map((exercise) => exercise.id),
    )
    expect(nextStep(progress)).toMatchObject({ to: '/project', title: /milestone 1/ })
  })

  it('suggests writing once the project is done too', () => {
    const progress = finished()
    progress.writing = {}
    expect(nextStep(progress).to).toBe(`/career/${WRITING_PROMPTS[0].id}`)
  })

  it('counts a writing prompt as finished only with a draft and every item ticked', () => {
    const progress = finished()
    const [prompt] = WRITING_PROMPTS
    progress.writing[prompt.id] = { ...progress.writing[prompt.id], draft: '   ' }
    expect(nextStep(progress).to).toBe(`/career/${prompt.id}`)
  })
})

describe('nextStep for a learner who has finished', () => {
  it('congratulates them and suggests retaking the assessment', () => {
    expect(nextStep(finished())).toMatchObject({
      title: 'You’ve done everything!',
      to: '/assessment',
    })
  })
})

describe('summarizeDashboard', () => {
  it('counts nothing for a new learner', () => {
    const summary = summarizeDashboard(createEmptyProgress())
    expect(summary.course.done).toBe(0)
    expect(summary.course.total).toBe(LESSONS.length + EXERCISES.length)
    expect(summary.project).toEqual({ done: 0, total: expect.any(Number) })
    expect(summary.writing).toEqual({ started: 0, finished: 0, total: WRITING_PROMPTS.length })
    expect(summary.lastPlace).toBeUndefined()
  })

  it('counts lessons and passed exercises per module', () => {
    const progress = withPassed(withLessons(createEmptyProgress(), [firstLesson.id]), [
      firstExercise.id,
    ])
    const summary = summarizeDashboard(progress)
    const module = summary.modules.find((m) => m.module.id === firstLesson.moduleId)!
    expect(module.lessons.done).toBe(1)
    expect(module.exercises.done).toBe(1)
    expect(summary.course.done).toBe(2)
  })

  it("doesn't count an exercise that was attempted but not passed", () => {
    const progress = createEmptyProgress()
    progress.exercises[firstExercise.id] = { ...startExercise(firstExercise), attempts: 3 }
    expect(summarizeDashboard(progress).course.done).toBe(0)
  })

  it('counts everything for a learner who has finished', () => {
    const summary = summarizeDashboard(finished())
    expect(summary.course.done).toBe(summary.course.total)
    expect(summary.project.done).toBe(summary.project.total)
    expect(summary.writing.finished).toBe(WRITING_PROMPTS.length)
  })

  it('describes the last place visited', () => {
    const progress = { ...createEmptyProgress(), lastVisited: `/learn/${firstLesson.id}` }
    expect(summarizeDashboard(progress).lastPlace).toEqual({
      kind: 'Lesson',
      title: firstLesson.title,
      path: `/learn/${firstLesson.id}`,
    })
  })
})

describe('describePlace', () => {
  it('recognises each kind of content page', () => {
    expect(describePlace(`/exercises/${firstExercise.id}`)?.kind).toBe('Exercise')
    expect(describePlace(`/career/${WRITING_PROMPTS[0].id}`)?.kind).toBe('Writing')
    expect(describePlace('/project')?.kind).toBe('Project')
  })

  it.each(['/', '/settings', '/learn', '/learn/removed-lesson', '/career', '/exercises/nope'])(
    'ignores %s',
    (path) => {
      expect(describePlace(path)).toBeUndefined()
    },
  )
})
