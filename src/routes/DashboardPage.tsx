import { useMemo } from 'react'
import { Link } from 'react-router'
import { ProgressBar } from '../components/ProgressBar'
import { percent } from '../features/assessment/scoring'
import styles from '../features/dashboard/dashboard.module.css'
import { summarizeDashboard } from '../features/dashboard/dashboard'
import { useProgress } from '../features/progress/useProgress'

export function DashboardPage() {
  const { progress } = useProgress()
  // useMemo keeps the result between renders and only recalculates when `progress` changes.
  // summarizeDashboard walks every lesson, exercise, task, and prompt, so there is no need to
  // redo that when nothing it depends on has changed.
  const summary = useMemo(() => summarizeDashboard(progress), [progress])
  const { lastPlace, next, course, modules, project, writing } = summary
  // .at(-1) is the last item: attempts are saved oldest first.
  const lastAttempt = progress.assessment.attempts.at(-1)

  return (
    <>
      <h1>Dashboard</h1>

      <section aria-labelledby="next-heading" className={styles.next}>
        <h2 id="next-heading" className={styles.label}>
          Up next
        </h2>
        <p className={styles.nextTitle}>{next.title}</p>
        <p>{next.reason}</p>
        <Link to={next.to} className={styles.button}>
          {next.linkText}
        </Link>
      </section>

      {/* Only shown when it differs from "Up next", so the same link isn't offered twice. */}
      {lastPlace && lastPlace.path !== next.to && (
        <section aria-labelledby="continue-heading" className={styles.card}>
          <h2 id="continue-heading" className={styles.label}>
            Continue where you left off
          </h2>
          <p>
            {lastPlace.kind}: <Link to={lastPlace.path}>{lastPlace.title}</Link>
          </p>
        </section>
      )}

      <section aria-labelledby="course-heading" className={styles.section}>
        <h2 id="course-heading">Course progress</h2>
        <ProgressBar
          label="Whole course"
          value={course.done}
          max={course.total}
          unit="lessons and exercises"
        />
        <ul className={styles.modules}>
          {modules.map(({ module, lessons, exercises }) => (
            <li key={module.id}>
              <ProgressBar
                label={module.title}
                value={lessons.done + exercises.done}
                max={lessons.total + exercises.total}
                unit="items"
              />
              <p className={styles.detail}>
                Lessons {lessons.done} of {lessons.total} · Exercises passed {exercises.done} of{' '}
                {exercises.total}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <div className={styles.cards}>
        <section aria-labelledby="assessment-heading" className={styles.card}>
          <h2 id="assessment-heading">Skill assessment</h2>
          {lastAttempt ? (
            <p>
              Latest score: {lastAttempt.correct} of {lastAttempt.total} ({percent(lastAttempt)}%)
              on{' '}
              <time dateTime={lastAttempt.completedAt}>
                {new Date(lastAttempt.completedAt).toLocaleDateString()}
              </time>
              . <Link to="/assessment">Take it again</Link>
            </p>
          ) : (
            <p>
              Not sure where to start? <Link to="/assessment">Take the skill assessment</Link> to
              get a recommended starting point.
            </p>
          )}
        </section>

        <section aria-labelledby="project-heading" className={styles.card}>
          <h2 id="project-heading">Project</h2>
          <p>
            {project.done} of {project.total} tasks done.{' '}
            <Link to="/project">Open the project</Link>
          </p>
        </section>

        <section aria-labelledby="writing-heading" className={styles.card}>
          <h2 id="writing-heading">Writing</h2>
          <p>
            {writing.started} of {writing.total} prompts started, {writing.finished} finished.{' '}
            <Link to="/career">Practise writing</Link>
          </p>
        </section>
      </div>
    </>
  )
}
