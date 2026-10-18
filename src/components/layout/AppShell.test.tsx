import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAt } from '../../test/renderAt'

// Note: jsdom doesn't apply CSS, so these tests check behaviour and ARIA state
// (aria-expanded, focus), not what is visually shown or hidden.

describe('AppShell', () => {
  it('has header, navigation, and main landmarks', () => {
    renderAt('/')
    expect(screen.getByRole('banner')).toBeInTheDocument()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
  })

  it('opens and closes the mobile menu with the menu button', async () => {
    const { user } = renderAt('/')
    const button = screen.getByRole('button', { name: 'Menu' })

    expect(button).toHaveAttribute('aria-expanded', 'false')
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'true')
    await user.click(button)
    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the menu after choosing a page', async () => {
    const { user } = renderAt('/')
    const button = screen.getByRole('button', { name: 'Menu' })

    await user.click(button)
    const nav = screen.getByRole('navigation', { name: 'Main' })
    await user.click(within(nav).getByRole('link', { name: 'Project' }))

    expect(button).toHaveAttribute('aria-expanded', 'false')
  })

  it('closes the menu with Escape and returns focus to the button', async () => {
    const { user } = renderAt('/')
    const button = screen.getByRole('button', { name: 'Menu' })

    await user.click(button)
    await user.keyboard('{Escape}')

    expect(button).toHaveAttribute('aria-expanded', 'false')
    expect(button).toHaveFocus()
  })

  it('can be used with the keyboard: skip link first, then the links in order', async () => {
    const { user } = renderAt('/')

    await user.tab()
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('link', { name: 'DevPath Academy' })).toHaveFocus()
    await user.tab()
    expect(screen.getByRole('button', { name: 'Menu' })).toHaveFocus()

    // Enter on a focused link follows it, just like a click.
    await user.tab() // Dashboard
    await user.tab() // Learn
    await user.keyboard('{Enter}')
    expect(screen.getByRole('heading', { level: 1, name: 'Learn' })).toBeInTheDocument()
  })

  it('skip link points at the main content', () => {
    renderAt('/')
    expect(screen.getByRole('link', { name: 'Skip to main content' })).toHaveAttribute(
      'href',
      '#main',
    )
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main')
  })
})
