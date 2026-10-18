import { screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAt } from '../../test/renderAt'
import { applyTheme, loadTheme, saveTheme, THEME_STORAGE_KEY } from './theme'

describe('theme storage', () => {
  it('defaults to "system" when nothing is saved', () => {
    expect(loadTheme()).toBe('system')
  })

  it('loads a saved theme', () => {
    saveTheme('dark')
    expect(loadTheme()).toBe('dark')
  })

  it('ignores an invalid saved value', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'purple')
    expect(loadTheme()).toBe('system')
  })
})

describe('applyTheme', () => {
  it('sets data-theme on <html> for light and dark', () => {
    applyTheme('dark')
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    applyTheme('light')
    expect(document.documentElement).toHaveAttribute('data-theme', 'light')
  })

  it('removes data-theme for "system" so the OS setting applies', () => {
    applyTheme('dark')
    applyTheme('system')
    expect(document.documentElement).not.toHaveAttribute('data-theme')
  })
})

describe('theme setting on the Settings page', () => {
  it('applies and remembers the chosen theme', async () => {
    const { user } = renderAt('/settings')

    expect(screen.getByRole('radio', { name: 'Match my device' })).toBeChecked()

    await user.click(screen.getByRole('radio', { name: 'Dark' }))

    expect(screen.getByRole('radio', { name: 'Dark' })).toBeChecked()
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark')
    expect(loadTheme()).toBe('dark')
  })
})
