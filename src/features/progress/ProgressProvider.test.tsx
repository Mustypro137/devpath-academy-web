import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ProgressProvider } from './ProgressProvider'
import { loadProgress } from './storage'
import { useProgress } from './useProgress'

// Runs useProgress() inside a ProgressProvider, without rendering any pages.
function setup() {
  return renderHook(() => useProgress(), { wrapper: ProgressProvider })
}

describe('ProgressProvider', () => {
  it('saves each change to storage straight away', () => {
    const { result } = setup()
    act(() => result.current.setProjectTask('setup-git', true))
    expect(loadProgress().project.tasks).toEqual({ 'setup-git': true })
  })

  it('keeps both of two changes made one right after the other', () => {
    const { result } = setup()
    // Same event, no re-render in between: the second must build on the first.
    act(() => {
      result.current.setProjectTask('setup-git', true)
      result.current.setProjectTask('setup-folder', true)
    })
    expect(result.current.progress.project.tasks).toEqual({
      'setup-git': true,
      'setup-folder': true,
    })
    expect(loadProgress().project.tasks).toEqual(result.current.progress.project.tasks)
  })

  it('still saves a change made while the app is being removed', () => {
    const { result, unmount } = setup()
    const { setProjectRepoUrl } = result.current
    unmount()
    // Like an autosave flushing as the page closes: React won't render again, but the change
    // must still reach storage.
    setProjectRepoUrl('https://github.com/me/tt')
    expect(loadProgress().project.repoUrl).toBe('https://github.com/me/tt')
  })
})
