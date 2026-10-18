// Light/dark theme preference. "system" means "follow the operating system setting".
// This is a display preference, not learning progress, so it is stored on its own key
// rather than in features/progress (see docs/DECISIONS.md).

export type ThemePreference = 'system' | 'light' | 'dark'

export const THEME_STORAGE_KEY = 'devpath-theme'

const THEMES: readonly ThemePreference[] = ['system', 'light', 'dark']

// A "type guard": if this returns true, TypeScript treats `value` as a ThemePreference.
export function isThemePreference(value: unknown): value is ThemePreference {
  return THEMES.includes(value as ThemePreference)
}

export function loadTheme(): ThemePreference {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(stored) ? stored : 'system'
  } catch {
    // localStorage can throw (e.g. blocked in private mode). Fall back to the default.
    return 'system'
  }
}

export function saveTheme(theme: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  } catch {
    // Not saving is acceptable: the theme still applies for this visit.
  }
}

// Sets <html data-theme="..."> which the CSS in src/styles/tokens.css reacts to.
export function applyTheme(theme: ThemePreference): void {
  const root = document.documentElement
  if (theme === 'system') {
    delete root.dataset.theme
  } else {
    root.dataset.theme = theme
  }
}
