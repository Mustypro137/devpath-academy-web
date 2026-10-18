import { useEffect, useRef } from 'react'
import { Link } from 'react-router'
import type { AssessmentQuestion, AssessmentTopic } from '../../types/content'
import type { AssessmentAttempt } from '../../types/progress'
import { InlineText } from '../lessons/InlineText'
import styles from './assessment.module.css'
import { percent, recommend } from './scoring'

interface AssessmentResultsProps {
  questions: readonly AssessmentQuestion[]
  answers: number[]
  attempt: AssessmentAttempt
  topics: Record<AssessmentTopic, { title: string; lessonId: string }>
  onRestart: () => void
}

export function AssessmentResults({
  questions,
  answers,
  attempt,
  topics,
  onRestart,
}: AssessmentResultsProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const recommendation = recommend(attempt, topics)

  // Same as moving between questions: put focus on the new content's heading.
  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  return (
    <>
      <h2 ref={headingRef} tabIndex={-1} className={styles.questionNumber}>
        Your results
      </h2>
      <p className={styles.score}>
        You got {attempt.correct} of {attempt.total} right ({percent(attempt)}%).
      </p>

      <table className={styles.table}>
        <caption>Score by topic</caption>
        <thead>
          <tr>
            <th scope="col">Topic</th>
            <th scope="col">Correct</th>
            <th scope="col">Score</th>
          </tr>
        </thead>
        <tbody>
          {(Object.keys(topics) as AssessmentTopic[]).map((topic) => {
            const score = attempt.byTopic[topic]
            if (!score) return null
            return (
              <tr key={topic}>
                <th scope="row">{topics[topic].title}</th>
                <td>
                  {score.correct} of {score.total}
                </td>
                <td>{percent(score)}%</td>
              </tr>
            )
          })}
        </tbody>
      </table>

      <section aria-labelledby="recommendation-heading" className={styles.recommendation}>
        <h3 id="recommendation-heading">What to do next</h3>
        <p>{recommendation.summary}</p>
        <p>
          <Link to={recommendation.to}>{recommendation.linkText}</Link>
        </p>
      </section>

      <h3>Review your answers</h3>
      <ol className={styles.review}>
        {questions.map((question, index) => {
          const chosen = answers[index]
          const correct = chosen === question.correctIndex
          return (
            <li key={question.id} className={styles.reviewItem}>
              <p className={styles.reviewPrompt}>
                <InlineText text={question.prompt} />
              </p>
              {question.code && (
                <pre className={styles.reviewCode}>
                  <code>{question.code}</code>
                </pre>
              )}
              {/* "Correct" / "Incorrect" in words, never colour alone. */}
              <p className={correct ? styles.correct : styles.incorrect}>
                {correct ? '✓ Correct' : '✗ Incorrect'}: you answered{' '}
                <InlineText text={question.options[chosen]} />.
                {!correct && (
                  <>
                    {' '}
                    The answer is <InlineText text={question.options[question.correctIndex]} />.
                  </>
                )}
              </p>
              <p>
                <InlineText text={question.explanation} />
              </p>
            </li>
          )
        })}
      </ol>

      <button type="button" onClick={onRestart}>
        Take the assessment again
      </button>
    </>
  )
}
