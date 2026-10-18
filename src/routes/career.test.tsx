import { screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { getWritingPrompt, WRITING_PROMPTS } from '../content'
import { loadProgress } from '../features/progress/storage'
import { renderAt } from '../test/renderAt'

const prompt = getWritingPrompt('bug-report')!
const path = `/career/${prompt.id}`

describe('writing prompt list (/career)', () => {
  it('lists every prompt by category, all not started', () => {
    renderAt('/career')
    for (const { title } of WRITING_PROMPTS) {
      expect(screen.getByRole('link', { name: new RegExp(title) })).toHaveTextContent('Not started')
    }
    expect(screen.getByRole('region', { name: 'Technical writing' })).toBeInTheDocument()
  })
})

describe('writing a draft (/career/:promptId)', () => {
  it('shows the scenario, tips, and target length', () => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: prompt.title })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Tips' })).toBeInTheDocument()
    expect(screen.getByLabelText('Your draft')).toHaveAccessibleDescription(
      new RegExp(`Aim for ${prompt.targetWords.min}–${prompt.targetWords.max} words`),
    )
  })

  it('counts words as you type', async () => {
    const { user } = renderAt(path)
    await user.type(screen.getByLabelText('Your draft'), 'Steps to reproduce')
    expect(screen.getByText(/^3 words\./)).toHaveTextContent(
      `Keep going: aim for at least ${prompt.targetWords.min}.`,
    )
  })

  it('autosaves after a pause in typing', async () => {
    const { user } = renderAt(path)
    await user.type(screen.getByLabelText('Your draft'), 'Title: empty task')
    expect(screen.getByText('Saving…')).toBeInTheDocument()

    // The debounce really waits (0.8 s), so give findBy a little longer than its default.
    expect(await screen.findByText('All changes saved', {}, { timeout: 3000 })).toBeInTheDocument()
    expect(loadProgress().writing[prompt.id].draft).toBe('Title: empty task')
  })

  it('keeps the draft when leaving before the autosave delay is over', async () => {
    const { user, unmount } = renderAt(path)
    await user.type(screen.getByLabelText('Your draft'), 'Quick note')
    unmount() // straight away, like clicking a link: the pending text is saved on the way out

    renderAt(path)
    expect(screen.getByLabelText('Your draft')).toHaveValue('Quick note')
  })

  it('saves checklist ticks straight away, and keeps them after a reload', async () => {
    const { user, unmount } = renderAt(path)
    const checklist = screen.getByRole('group', { name: /Self-review checklist/ })
    await user.click(within(checklist).getByRole('checkbox', { name: prompt.checklist[1] }))

    expect(checklist).toHaveAccessibleName(
      `Self-review checklist (1 of ${prompt.checklist.length})`,
    )
    expect(loadProgress().writing[prompt.id].checklist[1]).toBe(true)

    unmount()
    renderAt(path)
    expect(screen.getByRole('checkbox', { name: prompt.checklist[1] })).toBeChecked()
  })

  it('keeps the example folded away until asked for', async () => {
    const { user } = renderAt(path)
    const summary = screen.getByText('Show an example answer')
    expect(summary.closest('details')).not.toHaveAttribute('open')
    await user.click(summary)
    expect(summary.closest('details')).toHaveAttribute('open')
  })

  it('shows progress on the list after writing', async () => {
    const { user, unmount } = renderAt(path)
    await user.type(screen.getByLabelText('Your draft'), 'Three short words')
    await user.click(screen.getByRole('checkbox', { name: prompt.checklist[0] }))
    unmount()

    renderAt('/career')
    expect(screen.getByRole('link', { name: new RegExp(prompt.title) })).toHaveTextContent(
      `Draft: 3 words · checklist 1 of ${prompt.checklist.length}`,
    )
  })

  it('shows "Writing prompt not found" for an unknown id', () => {
    renderAt('/career/nope')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Writing prompt not found' }),
    ).toBeInTheDocument()
  })
})
