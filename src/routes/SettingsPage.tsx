import { useTheme } from '../features/theme/useTheme'
import type { ThemePreference } from '../features/theme/theme'
import styles from './SettingsPage.module.css'

const THEME_OPTIONS: { value: ThemePreference; label: string }[] = [
  { value: 'system', label: 'Match my device' },
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
]

export function SettingsPage() {
  const { theme, setTheme } = useTheme()

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

      <p>Export, import, and reset progress arrive in Milestone 3.</p>
    </>
  )
}
