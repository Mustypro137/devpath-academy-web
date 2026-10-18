import { describe, expect, it } from 'vitest'
import { getExercise } from '../../content'
import { MAX_SUBMISSIONS } from '../progress/storage'
import type { RunOutcome } from './checker'
import { addSubmission, revealNextHint, startExercise, toSubmission } from './exerciseProgress'

const exercise = getExercise('js-double')!
// A finished run where each test passed (true) or failed (false).
function runWith(...passes: boolean[]): RunOutcome {
  return {
    status: 'done',
    results: passes.map((passed) => ({ description: 'a test', passed, expected: '1' })),
  }
}

const passed = toSubmission('right', runWith(true, true), 2, '2026-10-18T10:00:00.000Z')
const failed = toSubmission('wrong', runWith(true, false), 2, '2026-10-18T11:00:00.000Z')

describe('toSubmission', () => {
  it('counts passed tests', () => {
    expect(passed).toMatchObject({ outcome: 'passed', passedCount: 2, testCount: 2 })
    expect(failed).toMatchObject({ outcome: 'failed', passedCount: 1, testCount: 2 })
  })

  it('records errors and timeouts as zero passed', () => {
    expect(toSubmission('x', { status: 'timeout' }, 3)).toMatchObject({
      outcome: 'timeout',
      passedCount: 0,
      testCount: 3,
    })
  })
})

describe('addSubmission', () => {
  it('counts the attempt and saves the code', () => {
    const next = addSubmission(startExercise(exercise), failed)
    expect(next).toMatchObject({ status: 'in-progress', attempts: 1, lastCode: 'wrong' })
    expect(next.submissions).toEqual([failed])
  })

  it('marks the exercise passed, and a later failure does not undo it', () => {
    const afterPass = addSubmission(startExercise(exercise), passed)
    const afterFail = addSubmission(afterPass, failed)

    expect(afterFail.status).toBe('passed')
    expect(afterFail.solvedAt).toBe(passed.submittedAt) // the first passing run
    expect(afterFail.submissions).toEqual([failed, passed]) // newest first
  })

  it(`keeps only the newest ${MAX_SUBMISSIONS} submissions`, () => {
    let entry = startExercise(exercise)
    for (let i = 0; i < MAX_SUBMISSIONS + 3; i++) entry = addSubmission(entry, failed)
    expect(entry.attempts).toBe(MAX_SUBMISSIONS + 3)
    expect(entry.submissions).toHaveLength(MAX_SUBMISSIONS)
  })
})

describe('revealNextHint', () => {
  it('reveals hints one at a time, and stops at the last one', () => {
    let entry = startExercise(exercise)
    for (let i = 0; i < exercise.hints.length + 2; i++) entry = revealNextHint(entry, exercise)
    expect(entry.hintsUsed).toBe(exercise.hints.length)
  })
})
