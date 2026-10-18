import { useEffect, useRef } from 'react'

// Debounced autosave: call `save(value)` once `value` has stopped changing for `delayMs`.
// Unlike a plain debounce, it never loses the last change:
// - when the component goes away (e.g. the learner clicks a link), and
// - when the browser tab is hidden or closed (the `pagehide` event),
// any change still waiting is saved straight away.
export function useAutosave(value: string, save: (value: string) => void, delayMs: number) {
  // Refs hold values between renders without causing re-renders.
  const lastSaved = useRef(value) // so opening a page doesn't count as a change
  const pending = useRef<string | null>(null) // a change that hasn't been saved yet
  const saveRef = useRef(save) // always the latest save function
  useEffect(() => {
    saveRef.current = save
  })

  // The debounce: every change restarts the timer.
  useEffect(() => {
    if (value === lastSaved.current) return
    pending.current = value
    const timer = setTimeout(() => {
      if (pending.current === null) return // already saved by the flush below
      saveRef.current(value)
      lastSaved.current = value
      pending.current = null
    }, delayMs)
    return () => clearTimeout(timer)
  }, [value, delayMs])

  // The safety net: save anything still pending when leaving.
  useEffect(() => {
    function flush() {
      if (pending.current === null) return
      saveRef.current(pending.current)
      lastSaved.current = pending.current
      pending.current = null
    }
    addEventListener('pagehide', flush)
    return () => {
      removeEventListener('pagehide', flush)
      flush() // this cleanup runs when the component unmounts
    }
  }, [])
}
