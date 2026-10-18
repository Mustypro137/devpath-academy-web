import { useEffect, useState } from 'react'

// Debouncing: wait until `value` has stopped changing for `delayMs`, then return it.
// While someone types, every keystroke restarts the timer, so the slow work that uses the
// result (like rebuilding a preview) happens once per pause instead of once per key.
export function useDebouncedValue<T>(value: T, delayMs: number): T {
  const [debounced, setDebounced] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs)
    // Cleanup runs before the next effect, i.e. when `value` changes again: cancel the old timer.
    return () => clearTimeout(timer)
  }, [value, delayMs])

  return debounced
}
