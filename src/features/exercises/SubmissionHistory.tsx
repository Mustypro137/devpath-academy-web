import type { Submission } from '../../types/progress'
import styles from './exercises.module.css'

interface SubmissionHistoryProps {
  submissions: Submission[] // newest first
  onLoad: (code: string) => void
}

function describeOutcome(submission: Submission): string {
  switch (submission.outcome) {
    case 'passed':
      return `All ${submission.testCount} tests passed`
    case 'failed':
      return `${submission.passedCount} of ${submission.testCount} tests passed`
    case 'error':
      return 'Error: the code couldn’t run'
    case 'timeout':
      return 'Stopped: took too long'
  }
}

export function SubmissionHistory({ submissions, onLoad }: SubmissionHistoryProps) {
  return (
    <section aria-labelledby="history-heading">
      <h2 id="history-heading" className={styles.heading}>
        Your runs
      </h2>
      {submissions.length === 0 ? (
        <p className={styles.muted}>No runs yet. Press “Run tests” to check your code.</p>
      ) : (
        <ol className={styles.history}>
          {submissions.map((submission) => (
            <li key={submission.submittedAt} className={styles.historyItem}>
              <span>
                {/* <time> tells browsers and screen readers this text is a date. */}
                <time dateTime={submission.submittedAt}>
                  {new Date(submission.submittedAt).toLocaleString()}
                </time>
                : {describeOutcome(submission)}
              </span>
              <button type="button" onClick={() => onLoad(submission.code)}>
                Load this code
              </button>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
