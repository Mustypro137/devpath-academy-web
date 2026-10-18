import { useReducer } from 'react'
import { ASSESSMENT_QUESTIONS, ASSESSMENT_TOPICS } from '../content'
import {
  assessmentReducer,
  initialAssessmentState,
  type AssessmentAction,
} from '../features/assessment/assessmentReducer'
import { AssessmentResults } from '../features/assessment/AssessmentResults'
import styles from '../features/assessment/assessment.module.css'
import { QuestionCard } from '../features/assessment/QuestionCard'
import { percent, scoreAnswers } from '../features/assessment/scoring'
import { useProgress } from '../features/progress/useProgress'

const questions = ASSESSMENT_QUESTIONS

export function AssessmentPage() {
  // useReducer is like useState for state with several connected parts and rules for how it
  // may change. All the rules live in assessmentReducer; this component only sends actions.
  const [state, dispatch] = useReducer(assessmentReducer, initialAssessmentState)
  const { progress, recordAssessmentAttempt } = useProgress()
  const lastAttempt = progress.assessment.attempts.at(-1)

  function handleNext() {
    const action: AssessmentAction = { type: 'next' }
    // Ask the reducer where "next" leads. If it is the results, save the attempt now, in the
    // click handler, so it is saved exactly once per finished assessment.
    const nextState = assessmentReducer(state, action)
    if (nextState.screen === 'results') {
      recordAssessmentAttempt(scoreAnswers(questions, nextState.answers))
    }
    dispatch(action)
  }

  return (
    <>
      <h1>Skill assessment</h1>

      {state.screen === 'intro' && (
        <>
          <p>
            {questions.length} multiple-choice questions on JavaScript basics, one at a time. There
            is no time limit, and you can go back to change an answer before the end.
          </p>
          <p>
            At the end you’ll see your score for each topic, an explanation for every question, and
            where to start in the course.
          </p>
          {lastAttempt && (
            <p>
              Your last result: {lastAttempt.correct} of {lastAttempt.total} ({percent(lastAttempt)}
              %) on{' '}
              <time dateTime={lastAttempt.completedAt}>
                {new Date(lastAttempt.completedAt).toLocaleDateString()}
              </time>
              .
            </p>
          )}
          <button
            type="button"
            className={styles.primary}
            onClick={() => dispatch({ type: 'start', questionCount: questions.length })}
          >
            {lastAttempt ? 'Take the assessment again' : 'Start the assessment'}
          </button>
        </>
      )}

      {state.screen === 'question' && (
        <>
          <QuestionCard
            question={questions[state.index]}
            number={state.index + 1}
            total={questions.length}
            selected={state.answers[state.index]}
            onSelect={(option) => dispatch({ type: 'select', option })}
          />
          {state.showUnanswered && (
            // role="alert": read out straight away, because it explains why nothing happened.
            <p role="alert" className={styles.unanswered}>
              Choose an answer to continue.
            </p>
          )}
          <div className={styles.actions}>
            {state.index > 0 && (
              <button type="button" onClick={() => dispatch({ type: 'back' })}>
                Back
              </button>
            )}
            <button type="button" className={styles.primary} onClick={handleNext}>
              {state.index === questions.length - 1 ? 'See my results' : 'Next question'}
            </button>
          </div>
        </>
      )}

      {state.screen === 'results' && (
        <AssessmentResults
          questions={questions}
          answers={state.answers}
          // Derived from the answers on each render, not stored separately.
          attempt={scoreAnswers(questions, state.answers)}
          topics={ASSESSMENT_TOPICS}
          onRestart={() => dispatch({ type: 'restart' })}
        />
      )}
    </>
  )
}
