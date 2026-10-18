import { Link } from 'react-router'
import { WRITING_CATEGORIES, WRITING_PROMPTS } from '../content'
import styles from '../features/career/career.module.css'
import { countWords } from '../features/career/wordCount'
import { countChecked } from '../features/career/writingProgress'
import { useProgress } from '../features/progress/useProgress'
import type { WritingCategory, WritingPrompt } from '../types/content'
import type { WritingProgress } from '../types/progress'

function statusText(entry: WritingProgress | undefined, prompt: WritingPrompt): string {
  if (!entry || (entry.draft.trim() === '' && !entry.checklist.some(Boolean))) return 'Not started'
  const words = countWords(entry.draft)
  return `Draft: ${words} ${words === 1 ? 'word' : 'words'} · checklist ${countChecked(entry, prompt)} of ${prompt.checklist.length}`
}

export function CareerPage() {
  const { progress } = useProgress()

  return (
    <>
      <h1>Career &amp; writing</h1>
      <p>
        Developers write every day: pull requests, bug reports, messages to teammates, and job
        applications. Pick a prompt, write a draft, and check it against the list. Drafts save
        automatically.
      </p>

      {(Object.keys(WRITING_CATEGORIES) as WritingCategory[]).map((category) => (
        <section
          key={category}
          aria-labelledby={`category-${category}`}
          className={styles.category}
        >
          <h2 id={`category-${category}`}>{WRITING_CATEGORIES[category].title}</h2>
          <p className={styles.muted}>{WRITING_CATEGORIES[category].summary}</p>
          <ul className={styles.prompts}>
            {WRITING_PROMPTS.filter((prompt) => prompt.category === category).map((prompt) => (
              <li key={prompt.id}>
                <Link to={`/career/${prompt.id}`} className={styles.promptLink}>
                  <span className={styles.promptTitle}>{prompt.title}</span>
                  <span className={styles.promptStatus}>
                    {statusText(progress.writing[prompt.id], prompt)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  )
}
