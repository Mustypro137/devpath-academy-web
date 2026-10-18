import { Link } from 'react-router'
import { percent } from '../features/assessment/scoring'
import { useProgress } from '../features/progress/useProgress'

export function DashboardPage() {
  const { progress } = useProgress()
  // .at(-1) is the last item: attempts are saved oldest first.
  const lastAttempt = progress.assessment.attempts.at(-1)

  return (
    <>
      <h1>Dashboard</h1>
      <p>Your progress, where to continue, and what to learn next. More arrives in Milestone 9.</p>

      <section aria-labelledby="assessment-heading">
        <h2 id="assessment-heading">Skill assessment</h2>
        {lastAttempt ? (
          <p>
            Latest score: {lastAttempt.correct} of {lastAttempt.total} ({percent(lastAttempt)}%) on{' '}
            <time dateTime={lastAttempt.completedAt}>
              {new Date(lastAttempt.completedAt).toLocaleDateString()}
            </time>
            . <Link to="/assessment">Take it again</Link>
          </p>
        ) : (
          <p>
            Not sure where to start? <Link to="/assessment">Take the skill assessment</Link> to get
            a recommended starting point.
          </p>
        )}
      </section>
    </>
  )
}
