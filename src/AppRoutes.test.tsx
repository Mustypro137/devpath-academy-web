import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { renderAt } from './test/renderAt'

describe('routing', () => {
  // it.each runs the same test once per row.
  it.each([
    ['/', 'Dashboard'],
    ['/learn', 'Learn'],
    ['/learn/html-basics', 'Lesson'],
    ['/exercises/sum-array', 'Exercise'],
    ['/assessment', 'Skill assessment'],
    ['/project', 'Project: Personal Task Tracker'],
    ['/career', 'Career & writing'],
    ['/career/cover-letter', 'Writing prompt'],
    ['/settings', 'Settings'],
  ])('%s shows the "%s" page', (path, heading) => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: heading })).toBeInTheDocument()
  })

  it('reads the id from the URL', () => {
    renderAt('/learn/html-basics')
    expect(screen.getByText('html-basics')).toBeInTheDocument()
  })

  it('shows a not-found page for unknown URLs, with a way back', async () => {
    const { user } = renderAt('/no-such-page')

    expect(screen.getByRole('heading', { level: 1, name: 'Page not found' })).toBeInTheDocument()

    await user.click(screen.getByRole('link', { name: 'Go to the dashboard' }))
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument()
  })

  it('navigates when a sidebar link is clicked and marks it as the current page', async () => {
    const { user } = renderAt('/')
    const nav = screen.getByRole('navigation', { name: 'Main' })

    await user.click(within(nav).getByRole('link', { name: 'Learn' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Learn' })).toBeInTheDocument()
    expect(within(nav).getByRole('link', { name: 'Learn' })).toHaveAttribute('aria-current', 'page')
    expect(within(nav).getByRole('link', { name: 'Dashboard' })).not.toHaveAttribute('aria-current')
  })

  it('keeps "Learn" marked as current inside a lesson', () => {
    renderAt('/learn/html-basics')
    const nav = screen.getByRole('navigation', { name: 'Main' })
    expect(within(nav).getByRole('link', { name: 'Learn' })).toHaveAttribute('aria-current', 'page')
  })
})
