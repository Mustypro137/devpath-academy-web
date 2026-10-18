import { useContext } from 'react'
import { ProgressContext, type ProgressContextValue } from './ProgressContext'

// A custom hook: the one way components get at progress.
export function useProgress(): ProgressContextValue {
  const value = useContext(ProgressContext)
  if (!value) {
    // Fail loudly: a missing Provider is a setup mistake, not something to handle quietly.
    throw new Error('useProgress must be used inside <ProgressProvider>')
  }
  return value
}
