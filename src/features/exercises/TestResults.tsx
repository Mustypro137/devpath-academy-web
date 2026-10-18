import type { RunOutcome } from './checker'
import { RUN_TIMEOUT_MS } from './runner'
import styles from './exercises.module.css'

// The results of the last run. The wrapper is always on the page with aria-live, so screen
// readers announce new results when they appear (a live region must exist before it changes).
export function TestResults({ outcome }: { outcome: RunOutcome | null }) {
  return (
    <div aria-live="polite" className={styles.results}>
      {outcome && <ResultsBody outcome={outcome} />}
    </div>
  )
}

function ResultsBody({ outcome }: { outcome: RunOutcome }) {
  if (outcome.status === 'timeout') {
    return (
      <p className={styles.problem}>
        Your code was still running after {RUN_TIMEOUT_MS / 1000} seconds, so it was stopped. Look
        for a loop that never ends.
      </p>
    )
  }
  if (outcome.status === 'error') {
    return (
      <p className={styles.problem}>
        Your code couldn’t run: <code>{outcome.message}</code>
      </p>
    )
  }

  const passedCount = outcome.results.filter((result) => result.passed).length
  const total = outcome.results.length

  return (
    <>
      <p className={styles.summary}>
        {passedCount === total
          ? `All ${total} tests passed. Well done!`
          : `${passedCount} of ${total} tests passed.`}
      </p>
      <ul className={styles.testList}>
        {outcome.results.map((result) => (
          // Each result says "Passed" or "Failed" in words, so it never relies on colour alone.
          <li key={result.description} className={result.passed ? styles.pass : styles.fail}>
            <span className={styles.testStatus}>{result.passed ? '✓ Passed' : '✗ Failed'}</span>{' '}
            {result.description}
            {!result.passed && (
              <span className={styles.testDetail}>
                {result.error ? (
                  <>
                    It threw an error: <code>{result.error}</code>
                  </>
                ) : (
                  <>
                    Expected <code>{result.expected}</code>, but got <code>{result.actual}</code>.
                  </>
                )}
              </span>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
