import { useState } from 'react'
import { applyTheme, loadTheme, saveTheme, type ThemePreference } from './theme'

// A custom hook: bundles the theme state with the side effects of changing it.
export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>(loadTheme)

  function setTheme(next: ThemePreference) {
    setThemeState(next)
    applyTheme(next)
    saveTheme(next)
  }

  return { theme, setTheme }
}
