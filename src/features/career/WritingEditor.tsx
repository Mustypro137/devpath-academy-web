import { useId, useState } from 'react'
import { useAutosave } from '../../hooks/useAutosave'
import styles from './career.module.css'
import { countWords, wordRangeStatus } from './wordCount'

export const AUTOSAVE_DELAY_MS = 800

interface WritingEditorProps {
  savedDraft: string // what is saved in progress right now
  onSave: (draft: string) => void
  targetWords: { min: number; max: number }
}

const RANGE_MESSAGES = {
  empty: () => '',
  under: (min: number) => `Keep going: aim for at least ${min}.`,
  within: () => '✓ Within the target length.',
  over: (_: number, max: number) => `A little long: try to cut it to ${max}.`,
}

export function WritingEditor({ savedDraft, onSave, targetWords }: WritingEditorProps) {
  // The text being typed lives here, so typing doesn't save on every key; useAutosave saves it
  // after a pause. `savedDraft` only sets the starting text.
  const [draft, setDraft] = useState(savedDraft)
  useAutosave(draft, onSave, AUTOSAVE_DELAY_MS)

  const words = countWords(draft)
  const status = wordRangeStatus(words, targetWords)
  const textareaId = useId()
  const targetId = useId()
  const countId = useId()

  return (
    <div>
      <label htmlFor={textareaId} className={styles.editorLabel}>
        Your draft
      </label>
      <p id={targetId} className={styles.muted}>
        Aim for {targetWords.min}–{targetWords.max} words.
      </p>
      {/* aria-describedby: when the textarea is focused, screen readers also read the target
          length and the current count. */}
      <textarea
        id={textareaId}
        value={draft}
        onChange={(event) => setDraft(event.target.value)}
        rows={14}
        aria-describedby={`${targetId} ${countId}`}
        className={styles.textarea}
      />
      <div className={styles.editorFooter}>
        <p id={countId} className={styles.count}>
          {words} {words === 1 ? 'word' : 'words'}.{' '}
          {RANGE_MESSAGES[status](targetWords.min, targetWords.max)}
        </p>
        {/* Compares with what is saved, so it is always accurate. */}
        <p className={styles.muted}>{draft === savedDraft ? 'All changes saved' : 'Saving…'}</p>
      </div>
    </div>
  )
}
