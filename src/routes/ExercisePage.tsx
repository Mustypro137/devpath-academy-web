import { useParams } from 'react-router'

export function ExercisePage() {
  // useParams reads the :exerciseId part of the URL, e.g. /exercises/sum-array → "sum-array".
  const { exerciseId } = useParams()

  return (
    <>
      <h1>Exercise</h1>
      <p>
        Showing <code>{exerciseId}</code>. The code editor and tests arrive in Milestone 4.
      </p>
    </>
  )
}
