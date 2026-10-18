import { describe, expect, it } from 'vitest'
import {
  assessmentReducer,
  initialAssessmentState,
  type AssessmentAction,
  type AssessmentState,
} from './assessmentReducer'

// Applies actions one after another, like a learner clicking through.
function run(...actions: AssessmentAction[]): AssessmentState {
  return actions.reduce(assessmentReducer, initialAssessmentState)
}

const start: AssessmentAction = { type: 'start', questionCount: 2 }
const choose = (option: number): AssessmentAction => ({ type: 'select', option })
const next: AssessmentAction = { type: 'next' }

describe('assessmentReducer', () => {
  it('starts on the intro, then shows the first question with no answers', () => {
    expect(initialAssessmentState).toEqual({ screen: 'intro' })
    expect(run(start)).toEqual({
      screen: 'question',
      index: 0,
      answers: [null, null],
      showUnanswered: false,
    })
  })

  it("won't move on from an unanswered question, and says so", () => {
    expect(run(start, next)).toMatchObject({ screen: 'question', index: 0, showUnanswered: true })
    // Choosing an answer clears the message.
    expect(run(start, next, choose(1))).toMatchObject({ showUnanswered: false, answers: [1, null] })
  })

  it('moves forward and back, keeping the answers', () => {
    const onSecond = run(start, choose(1), next)
    expect(onSecond).toMatchObject({ index: 1, answers: [1, null] })
    expect(assessmentReducer(onSecond, { type: 'back' })).toMatchObject({
      index: 0,
      answers: [1, null],
    })
  })

  it('does nothing on "back" from the first question', () => {
    const first = run(start)
    expect(assessmentReducer(first, { type: 'back' })).toBe(first)
  })

  it('lets an answer be changed', () => {
    expect(run(start, choose(1), choose(0))).toMatchObject({ answers: [0, null] })
  })

  it('shows the results after the last question is answered', () => {
    expect(run(start, choose(1), next, choose(0), next)).toEqual({
      screen: 'results',
      answers: [1, 0],
    })
  })

  it('can only leave the results by restarting', () => {
    const results = run(start, choose(1), next, choose(0), next)
    expect(assessmentReducer(results, next)).toBe(results)
    expect(assessmentReducer(results, { type: 'restart' })).toEqual({ screen: 'intro' })
  })

  it('ignores actions that make no sense on the current screen', () => {
    expect(run(next)).toEqual({ screen: 'intro' })
    expect(run(choose(1))).toEqual({ screen: 'intro' })
  })

  it('never changes the previous state object', () => {
    const before = run(start)
    const frozen = structuredClone(before)
    assessmentReducer(before, choose(1))
    expect(before).toEqual(frozen)
  })
})
