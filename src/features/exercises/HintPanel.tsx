import { InlineText } from '../lessons/InlineText'
import styles from './exercises.module.css'

interface HintPanelProps {
  hints: string[]
  hintsUsed: number // how many are revealed; they are always revealed in order
  onReveal: () => void
}

export function HintPanel({ hints, hintsUsed, onReveal }: HintPanelProps) {
  return (
    <section aria-labelledby="hints-heading">
      <h2 id="hints-heading" className={styles.heading}>
        Hints
      </h2>
      {/* aria-live: a screen reader reads each new hint as it appears. */}
      <ol aria-live="polite" className={styles.hints}>
        {hints.slice(0, hintsUsed).map((hint, index) => (
          <li key={index}>
            <InlineText text={hint} />
          </li>
        ))}
      </ol>
      {hintsUsed < hints.length ? (
        <button type="button" onClick={onReveal}>
          Show hint {hintsUsed + 1} of {hints.length}
        </button>
      ) : (
        <p className={styles.muted}>That was the last hint.</p>
      )}
    </section>
  )
}
