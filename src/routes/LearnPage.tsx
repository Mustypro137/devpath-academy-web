import { Link } from 'react-router'
import { getLessonsForModule, MODULES } from '../content'
import { useProgress } from '../features/progress/useProgress'
import styles from './LearnPage.module.css'

// The course map: every module and its lessons, in order.
export function LearnPage() {
  const { isLessonComplete } = useProgress()

  return (
    <>
      <h1>Learn</h1>
      <p>Work through the modules in order, or jump to any lesson.</p>

      {MODULES.map((module, moduleIndex) => {
        const lessons = getLessonsForModule(module.id)
        // Derived from progress on every render, never stored, so it can't get out of date.
        const completedCount = lessons.filter((lesson) => isLessonComplete(lesson.id)).length

        return (
          <section
            key={module.id}
            className={styles.module}
            aria-labelledby={`module-${module.id}`}
          >
            <h2 id={`module-${module.id}`}>
              {moduleIndex + 1}. {module.title}
            </h2>
            <p className={styles.summary}>
              {module.summary} · {completedCount} of {lessons.length} complete
            </p>

            <ol className={styles.lessons}>
              {lessons.map((lesson) => {
                const complete = isLessonComplete(lesson.id)
                return (
                  <li key={lesson.id}>
                    <Link to={`/learn/${lesson.id}`} className={styles.lessonLink}>
                      <span className={styles.lessonTitle}>
                        {lesson.title}
                        {complete && (
                          <>
                            {/* aria-hidden: screen readers read the hidden word instead. */}
                            <span aria-hidden="true" className={styles.check}>
                              ✓
                            </span>
                            {/* A separate space: one inside the span gets trimmed. */}{' '}
                            <span className="visually-hidden">(completed)</span>
                          </>
                        )}
                      </span>
                      <span className={styles.lessonMeta}>
                        {lesson.summary} · {lesson.estimatedMinutes} min
                      </span>
                    </Link>
                  </li>
                )
              })}
            </ol>
          </section>
        )
      })}
    </>
  )
}
