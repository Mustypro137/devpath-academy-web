import { useState, type ChangeEvent } from 'react'
import { parseProgressJson, progressToJson } from '../features/progress/storage'
import { useProgress } from '../features/progress/useProgress'
import { useTheme } from '../features/theme/useTheme'
import type { ThemePreference } from '../features/theme/theme'
import styles from './SettingsPage.module.css'

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Match my device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

// The result of the last import or reset, shown under the buttons.
type Message = { kind: 'success' | 'error'; text: string }

export function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const { progress, replaceProgress, resetProgress } = useProgress()
  const [message, setMessage] = useState<Message | null>(null)

  // A data: URL puts the file's contents in the link itself, and `download` makes the browser
  // save it as a file instead of opening it. No server needed.
  const exportHref = `data:application/json;charset=utf-8,${encodeURIComponent(progressToJson(progress))}`
  const exportFileName = `devpath-progress-${new Date().toISOString().slice(0, 10)}.json`

  async function handleImport(event: ChangeEvent<HTMLInputElement>) {
    const input = event.target
    const file = input.files?.[0]
    // Clear the input so choosing the same file again still fires onChange.
    input.value = ''
    if (!file) return

    const imported = parseProgressJson(await file.text())
    if (!imported) {
      setMessage({ kind: 'error', text: `${file.name} is not a DevPath progress file.` })
      return
    }
    if (!window.confirm('Replace your current progress with the imported file?')) return

    replaceProgress(imported)
    setMessage({ kind: 'success', text: 'Progress imported.' })
  }

  function handleReset() {
    if (!window.confirm('Delete all your progress? Export it first if you want a backup.')) return
    resetProgress()
    setMessage({ kind: 'success', text: 'Progress reset.' })
  }

  return (
    <>
      <h1>Settings</h1>

      {/* A fieldset + legend groups radio buttons so screen readers announce the question. */}
      <fieldset className={styles.fieldset}>
        <legend>Theme</legend>
        {THEME_OPTIONS.map((option) => (
          <label key={option.value} className={styles.option}>
            <input
              type="radio"
              name="theme"
              value={option.value}
              checked={theme === option.value}
              onChange={() => setTheme(option.value)}
            />
            {option.label}
          </label>
        ))}
      </fieldset>

      <section aria-labelledby="progress-heading">
        <h2 id="progress-heading" className={styles.heading}>
          Your progress
        </h2>
        <p>
          Progress is saved in this browser only. Export it to keep a backup or move it to another
          device.
        </p>

        <div className={styles.actions}>
          <a href={exportHref} download={exportFileName} className={styles.button}>
            Export progress
          </a>
          {/* The real file input is hidden; its label is styled as the button. */}
          <label className={styles.button}>
            Import progress
            <input
              type="file"
              accept=".json,application/json"
              className="visually-hidden"
              onChange={handleImport}
            />
          </label>
          <button type="button" className={styles.danger} onClick={handleReset}>
            Reset progress
          </button>
        </div>

        {/* role="alert" interrupts a screen reader for errors; role="status" waits its turn. */}
        {message && (
          <p role={message.kind === 'error' ? 'alert' : 'status'} className={styles[message.kind]}>
            {message.text}
          </p>
        )}
      </section>
    </>
  )
}
