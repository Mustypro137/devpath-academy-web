import { LessonContent } from '../lessons/LessonContent'
import styles from './exercises.module.css'

interface SolutionRevealProps {
  solution: string
  explanation: string
  revealed: boolean
  canReveal: boolean // the solution unlocks once every hint has been shown
  onReveal: () => void
}

export function SolutionReveal({
  solution,
  explanation,
  revealed,
  canReveal,
  onReveal,
}: SolutionRevealProps) {
  function handleClick() {
    if (window.confirm('Show the solution? Trying a little longer is often how it clicks.')) {
      onReveal()
    }
  }

  return (
    <section aria-labelledby="solution-heading">
      <h2 id="solution-heading" className={styles.heading}>
        Solution
      </h2>
      {revealed ? (
        // Reuses the lesson renderer, so the code looks the same as in lessons.
        <LessonContent
          blocks={[
            { type: 'code', language: 'js', code: solution },
            { type: 'text', text: explanation },
          ]}
        />
      ) : canReveal ? (
        <button type="button" onClick={handleClick}>
          Show solution
        </button>
      ) : (
        <p className={styles.muted}>The solution unlocks after the last hint.</p>
      )}
    </section>
  )
}
