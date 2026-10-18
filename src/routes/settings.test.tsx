import { screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { loadProgress, PROGRESS_STORAGE_KEY, progressToJson } from '../features/progress/storage'
import { renderAt } from '../test/renderAt'
import type { Progress } from '../types/progress'

const SAVED: Progress = {
  version: 1,
  lessons: { 'html-what-is-html': { completedAt: '2026-10-18T12:00:00.000Z' } },
  exercises: {},
  assessment: { attempts: [] },
  project: { tasks: {}, repoUrl: '' },
  writing: {},
}

// Starts the app with progress already saved, like a returning learner.
function renderSettingsWithSavedProgress() {
  localStorage.setItem(PROGRESS_STORAGE_KEY, JSON.stringify(SAVED))
  return renderAt('/settings')
}

// Answers the browser's confirm() dialog, which jsdom can't show.
function answerConfirm(answer: boolean) {
  return vi.spyOn(window, 'confirm').mockReturnValue(answer)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('progress on the Settings page', () => {
  it('exports progress as a JSON file', () => {
    renderSettingsWithSavedProgress()
    const link = screen.getByRole('link', { name: 'Export progress' })

    expect(link).toHaveAttribute('download', expect.stringMatching(/^devpath-progress-.*\.json$/))
    const href = link.getAttribute('href') ?? ''
    const json = decodeURIComponent(href.slice(href.indexOf(',') + 1))
    expect(JSON.parse(json)).toEqual(SAVED)
  })

  it('restores progress after export → reset → import', async () => {
    const { user } = renderSettingsWithSavedProgress()
    const exported = new File([progressToJson(SAVED)], 'backup.json', { type: 'application/json' })
    answerConfirm(true)

    await user.click(screen.getByRole('button', { name: 'Reset progress' }))
    expect(screen.getByRole('status')).toHaveTextContent('Progress reset.')
    expect(loadProgress().lessons).toEqual({})

    await user.upload(screen.getByLabelText('Import progress'), exported)
    expect(await screen.findByText('Progress imported.')).toBeInTheDocument()
    expect(loadProgress()).toEqual(SAVED)
  })

  it('rejects a file that is not valid progress, and keeps the current progress', async () => {
    const { user } = renderSettingsWithSavedProgress()
    const confirm = answerConfirm(true)
    const bad = new File(['{"hello": "world"}'], 'notes.json', { type: 'application/json' })

    await user.upload(screen.getByLabelText('Import progress'), bad)

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'notes.json is not a DevPath progress file.',
    )
    expect(confirm).not.toHaveBeenCalled()
    expect(loadProgress()).toEqual(SAVED)
  })

  it('does nothing when the learner cancels the reset', async () => {
    const { user } = renderSettingsWithSavedProgress()
    answerConfirm(false)

    await user.click(screen.getByRole('button', { name: 'Reset progress' }))

    expect(screen.queryByRole('status')).not.toBeInTheDocument()
    expect(loadProgress()).toEqual(SAVED)
  })
})
