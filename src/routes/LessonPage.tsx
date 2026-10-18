import { useParams } from 'react-router'

export function LessonPage() {
  // useParams reads the :lessonId part of the URL, e.g. /learn/html-basics → "html-basics".
  const { lessonId } = useParams()

  return (
    <>
      <h1>Lesson</h1>
      <p>
        Showing <code>{lessonId}</code>. Lesson content arrives in Milestone 2.
      </p>
    </>
  )
}
