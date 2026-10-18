import { describe, expect, it } from 'vitest'
import { ASSESSMENT_TOPICS } from '../../content'
import type { AssessmentQuestion, AssessmentTopic } from '../../types/content'
import type { AssessmentAttempt } from '../../types/progress'
import { percent, recommend, scoreAnswers } from './scoring'

// A small made-up quiz: the right answer is always option 0.
function question(id: string, topic: AssessmentTopic): AssessmentQuestion {
  return {
    id,
    topic,
    level: 'beginner',
    prompt: id,
    options: ['right', 'wrong'],
    correctIndex: 0,
    explanation: '',
  }
}
const quiz = [question('a', 'values'), question('b', 'values'), question('c', 'functions')]

describe('scoreAnswers', () => {
  it('counts correct answers overall and per topic', () => {
    expect(scoreAnswers(quiz, [0, 1, 0], 'when')).toEqual({
      completedAt: 'when',
      correct: 2,
      total: 3,
      byTopic: { values: { correct: 1, total: 2 }, functions: { correct: 1, total: 1 } },
    })
  })

  it('scores all wrong as zero, not as missing', () => {
    expect(scoreAnswers(quiz, [1, 1, 1]).byTopic.functions).toEqual({ correct: 0, total: 1 })
  })
})

describe('percent', () => {
  it('rounds to a whole number', () => {
    expect(percent({ correct: 2, total: 3 })).toBe(67)
    expect(percent({ correct: 0, total: 0 })).toBe(0)
  })
})

describe('recommend', () => {
  // An attempt with these per-topic scores ([correct, total]).
  function attempt(scores: Partial<Record<AssessmentTopic, [number, number]>>): AssessmentAttempt {
    const byTopic = Object.fromEntries(
      Object.entries(scores).map(([topic, [correct, total]]) => [topic, { correct, total }]),
    )
    const correct = Object.values(scores).reduce((sum, [c]) => sum + c, 0)
    const total = Object.values(scores).reduce((sum, [, t]) => sum + t, 0)
    return { completedAt: '', correct, total, byTopic }
  }

  it('sends a low overall score to the first lesson', () => {
    const result = recommend(attempt({ values: [1, 4], functions: [1, 4] }), ASSESSMENT_TOPICS)
    expect(result.to).toBe('/learn/js-values-and-variables')
  })

  it('points to the weakest topic when one needs review', () => {
    const result = recommend(
      attempt({ values: [4, 4], strings: [4, 4], operators: [3, 3], functions: [1, 4] }),
      ASSESSMENT_TOPICS,
    )
    expect(result.to).toBe('/learn/js-functions')
    expect(result.summary).toContain('1 of 4')
  })

  it('suggests exercises when every topic is strong', () => {
    const result = recommend(
      attempt({ values: [4, 4], strings: [3, 4], operators: [3, 3], functions: [4, 4] }),
      ASSESSMENT_TOPICS,
    )
    expect(result.to).toBe('/learn')
  })
})
