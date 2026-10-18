import { Link } from 'react-router'
import { getLessonsForModule, MODULES } from '../content'
import styles from './LearnPage.module.css'

// The course map: every module and its lessons, in order.
export function LearnPage() {
  return (
    <>
      <h1>Learn</h1>
      <p>Work through the modules in order, or jump to any lesson.</p>

      {MODULES.map((module, moduleIndex) => (
        <section key={module.id} className={styles.module} aria-labelledby={`module-${module.id}`}>
          <h2 id={`module-${module.id}`}>
            {moduleIndex + 1}. {module.title}
          </h2>
          <p className={styles.summary}>{module.summary}</p>

          <ol className={styles.lessons}>
            {getLessonsForModule(module.id).map((lesson) => (
              <li key={lesson.id}>
                <Link to={`/learn/${lesson.id}`} className={styles.lessonLink}>
                  <span className={styles.lessonTitle}>{lesson.title}</span>
                  <span className={styles.lessonMeta}>
                    {lesson.summary} · {lesson.estimatedMinutes} min
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ))}
    </>
  )
}
