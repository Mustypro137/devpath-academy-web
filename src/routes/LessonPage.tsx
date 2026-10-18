import { Link, useParams } from 'react-router'
import { getAdjacentLessons, getLesson, getModule } from '../content'
import { LessonContent } from '../features/lessons/LessonContent'
import styles from './LessonPage.module.css'

export function LessonPage() {
  // useParams reads the :lessonId part of the URL, e.g. /learn/css-box-model → "css-box-model".
  const { lessonId } = useParams()
  const lesson = getLesson(lessonId)

  // A URL can contain anything, so handle lessons that don't exist.
  if (!lesson) {
    return (
      <>
        <h1>Lesson not found</h1>
        <p>There is no lesson with this address.</p>
        <p>
          <Link to="/learn">Back to all lessons</Link>
        </p>
      </>
    )
  }

  const module = getModule(lesson.moduleId)
  const { previous, next } = getAdjacentLessons(lesson.id)

  return (
    <article>
      <p className={styles.breadcrumb}>
        <Link to="/learn">Learn</Link> / {module?.title}
      </p>
      <h1>{lesson.title}</h1>
      <p className={styles.meta}>{lesson.estimatedMinutes} min read</p>

      <LessonContent blocks={lesson.blocks} />

      <nav aria-label="Lesson" className={styles.pager}>
        {previous && (
          <Link to={`/learn/${previous.id}`} className={styles.pagerLink}>
            <span className={styles.pagerLabel}>Previous</span>
            {previous.title}
          </Link>
        )}
        {next && (
          <Link to={`/learn/${next.id}`} className={`${styles.pagerLink} ${styles.next}`}>
            <span className={styles.pagerLabel}>Next</span>
            {next.title}
          </Link>
        )}
      </nav>
    </article>
  )
}
