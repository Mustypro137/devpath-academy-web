import { Link, useParams } from 'react-router'
import { getWritingPrompt, WRITING_CATEGORIES } from '../content'
import styles from '../features/career/career.module.css'
import { WritingEditor } from '../features/career/WritingEditor'
import {
  countChecked,
  startWriting,
  withCheck,
  withDraft,
} from '../features/career/writingProgress'
import { InlineText } from '../features/lessons/InlineText'
import { useProgress } from '../features/progress/useProgress'
import type { WritingPrompt } from '../types/content'
import type { WritingProgress } from '../types/progress'

export function WritingPromptPage() {
  // useParams reads the :promptId part of the URL, e.g. /career/cover-letter → "cover-letter".
  const { promptId } = useParams()
  const prompt = getWritingPrompt(promptId)

  if (!prompt) {
    return (
      <>
        <h1>Writing prompt not found</h1>
        <p>There is no writing prompt with this address.</p>
        <p>
          <Link to="/career">Back to all writing prompts</Link>
        </p>
      </>
    )
  }
  // `key`: a fresh workspace (and editor text) for each prompt.
  return <WritingWorkspace key={prompt.id} prompt={prompt} />
}

function WritingWorkspace({ prompt }: { prompt: WritingPrompt }) {
  const { progress, updateWriting } = useProgress()
  const entry = progress.writing[prompt.id]

  function update(change: (current: WritingProgress) => WritingProgress) {
    updateWriting(prompt.id, (current) => change(current ?? startWriting(prompt)))
  }

  return (
    <article>
      <p className={styles.muted}>
        <Link to="/career">Career &amp; writing</Link> / {WRITING_CATEGORIES[prompt.category].title}
      </p>
      <h1>{prompt.title}</h1>
      {prompt.scenario.map((paragraph, index) => (
        <p key={index}>
          <InlineText text={paragraph} />
        </p>
      ))}

      <section aria-labelledby="tips-heading" className={styles.section}>
        <h2 id="tips-heading">Tips</h2>
        <ul>
          {prompt.tips.map((tip, index) => (
            <li key={index}>{tip}</li>
          ))}
        </ul>
      </section>

      <div className={styles.section}>
        <WritingEditor
          savedDraft={entry?.draft ?? ''}
          onSave={(draft) => update((current) => withDraft(current, draft))}
          targetWords={prompt.targetWords}
        />
      </div>

      <div className={styles.section}>
        {/* Ticks are saved straight away: one click is one change, so there is nothing to
            debounce. */}
        <fieldset className={styles.checklist}>
          <legend>
            Self-review checklist ({countChecked(entry, prompt)} of {prompt.checklist.length})
          </legend>
          {prompt.checklist.map((item, index) => (
            <label key={index} className={styles.checkItem}>
              <input
                type="checkbox"
                checked={entry?.checklist[index] ?? false}
                onChange={(event) =>
                  update((current) => withCheck(current, index, event.target.checked))
                }
              />
              <span>{item}</span>
            </label>
          ))}
        </fieldset>
      </div>

      {prompt.example && (
        <details className={`${styles.section} ${styles.example}`}>
          <summary>Show an example answer</summary>
          <p className={styles.muted}>
            One way to answer it. Try writing your own first: comparing afterwards teaches more.
          </p>
          <div className={styles.exampleText}>{prompt.example}</div>
        </details>
      )}
    </article>
  )
}
