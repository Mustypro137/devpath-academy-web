// Pure functions for marking an assessment and choosing what to recommend.
import type { AssessmentQuestion, AssessmentTopic } from '../../types/content'
import type { AssessmentAttempt, TopicScore } from '../../types/progress'

// `answers[i]` is the option chosen for `questions[i]`.
export function scoreAnswers(
  questions: readonly AssessmentQuestion[],
  answers: readonly number[],
  completedAt = new Date().toISOString(),
): AssessmentAttempt {
  const byTopic: Record<string, TopicScore> = {}
  let correct = 0

  questions.forEach((question, index) => {
    const isCorrect = answers[index] === question.correctIndex
    if (isCorrect) correct++
    // Start each topic at 0 of 0 the first time we see it, then count.
    const topic = (byTopic[question.topic] ??= { correct: 0, total: 0 })
    topic.total++
    if (isCorrect) topic.correct++
  })

  return { completedAt, correct, total: questions.length, byTopic }
}

// Whole-number percentage, e.g. 2 of 3 → 67.
export function percent({ correct, total }: TopicScore): number {
  return total === 0 ? 0 : Math.round((correct / total) * 100)
}

export interface Recommendation {
  summary: string
  to: string // where the link goes
  linkText: string
}

type TopicInfo = Record<AssessmentTopic, { title: string; lessonId: string }>

// Below this overall score, start from the beginning of the module.
export const START_OVER_BELOW = 50
// A topic below this score is worth reviewing.
export const REVIEW_BELOW = 70

export function recommend(attempt: AssessmentAttempt, topics: TopicInfo): Recommendation {
  const topicIds = Object.keys(topics) as AssessmentTopic[]
  const firstLessonId = topics[topicIds[0]].lessonId

  if (percent(attempt) < START_OVER_BELOW) {
    return {
      summary:
        'Start at the beginning of the JavaScript module. The first lessons cover everything in this assessment.',
      to: `/learn/${firstLessonId}`,
      linkText: 'Start the first JavaScript lesson',
    }
  }

  // The weakest topic, in topic order when there is a tie.
  const weakest = topicIds
    .filter((id) => attempt.byTopic[id])
    .map((id) => ({ id, score: percent(attempt.byTopic[id]) }))
    .reduce<{ id: AssessmentTopic; score: number } | null>(
      (lowest, topic) => (lowest === null || topic.score < lowest.score ? topic : lowest),
      null,
    )

  if (weakest && weakest.score < REVIEW_BELOW) {
    const topic = topics[weakest.id]
    const { correct, total } = attempt.byTopic[weakest.id]
    return {
      summary: `You know a good amount already. Review ${topic.title.toLowerCase()} next: you got ${correct} of ${total} right.`,
      to: `/learn/${topic.lessonId}`,
      linkText: `Review “${topic.title}”`,
    }
  }

  return {
    summary: 'You know the basics well. Put them into practice with the exercises.',
    to: '/learn',
    linkText: 'Go to the course and pick an exercise',
  }
}
