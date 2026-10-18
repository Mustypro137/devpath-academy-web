import { useId, useState, type FormEvent } from 'react'
import styles from './project.module.css'
import { parseRepoUrl } from './projectProgress'

interface RepoLinkFormProps {
  savedUrl: string // '' when none is saved
  onSave: (url: string) => void
}

export function RepoLinkForm({ savedUrl, onSave }: RepoLinkFormProps) {
  // A controlled input: React state holds the text, and the input always shows that state.
  // It is a draft: nothing is saved until the form is submitted.
  const [draft, setDraft] = useState(savedUrl)
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)
  const inputId = useId()
  const errorId = useId()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // stay on the page instead of the browser sending the form
    setSaved(false)

    if (draft.trim() === '') {
      onSave('') // an empty box removes the link
      setError('')
      return
    }
    const url = parseRepoUrl(draft)
    if (!url) {
      setError('Enter the full web address, starting with https://')
      return
    }
    onSave(url)
    setDraft(url)
    setError('')
    setSaved(true)
  }

  return (
    <section aria-labelledby="repo-heading" className={styles.repo}>
      <h2 id="repo-heading" className={styles.milestoneTitle}>
        Your repository
      </h2>
      {savedUrl ? (
        <p>
          Your project lives at <a href={savedUrl}>{savedUrl}</a>.
        </p>
      ) : (
        <p>Add the link to your project on GitHub, so it is always one click away.</p>
      )}

      {/* noValidate: show our own error message instead of the browser's built-in one, so it
          looks and sounds the same in every browser. */}
      <form onSubmit={handleSubmit} noValidate className={styles.repoForm}>
        <label htmlFor={inputId}>Repository link</label>
        <input
          id={inputId}
          type="url" // phones show a keyboard with "/" and ".com"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="https://github.com/your-name/task-tracker"
          aria-invalid={error !== ''}
          aria-describedby={error ? errorId : undefined}
          className={styles.repoInput}
        />
        <button type="submit">Save link</button>
      </form>
      {error && (
        <p id={errorId} role="alert" className={styles.error}>
          {error}
        </p>
      )}
      {saved && <p role="status">Link saved.</p>}
    </section>
  )
}
