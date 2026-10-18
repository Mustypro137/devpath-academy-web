import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAutosave } from './useAutosave'

beforeEach(() => {
  vi.useFakeTimers()
})
afterEach(() => {
  vi.useRealTimers()
})

// Renders the hook with a spy as the save function; `rerender` simulates typing.
function setup(initial = 'start') {
  const save = vi.fn()
  const hook = renderHook(({ value }) => useAutosave(value, save, 800), {
    initialProps: { value: initial },
  })
  return { save, ...hook }
}

describe('useAutosave', () => {
  it("doesn't save just because the page opened", () => {
    const { save } = setup()
    act(() => vi.advanceTimersByTime(5000))
    expect(save).not.toHaveBeenCalled()
  })

  it('saves once, after typing pauses', () => {
    const { save, rerender } = setup()
    rerender({ value: 'a' })
    act(() => vi.advanceTimersByTime(500))
    rerender({ value: 'ab' })
    act(() => vi.advanceTimersByTime(500))
    expect(save).not.toHaveBeenCalled() // still typing

    act(() => vi.advanceTimersByTime(300))
    expect(save).toHaveBeenCalledTimes(1)
    expect(save).toHaveBeenCalledWith('ab')
  })

  it('saves a pending change straight away when the component goes away', () => {
    const { save, rerender, unmount } = setup()
    rerender({ value: 'last words' })
    unmount()
    expect(save).toHaveBeenCalledWith('last words')
  })

  it('saves a pending change when the tab is hidden or closed', () => {
    const { save, rerender } = setup()
    rerender({ value: 'closing the tab' })
    window.dispatchEvent(new Event('pagehide'))
    expect(save).toHaveBeenCalledWith('closing the tab')

    // ...and doesn't save the same text again when the timer would have fired.
    act(() => vi.advanceTimersByTime(800))
    expect(save).toHaveBeenCalledTimes(1)
  })

  it('has nothing to flush once everything is saved', () => {
    const { save, rerender, unmount } = setup()
    rerender({ value: 'saved' })
    act(() => vi.advanceTimersByTime(800))
    unmount()
    expect(save).toHaveBeenCalledTimes(1)
  })
})
