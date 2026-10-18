import { useEffect } from 'react'
import { useLocation } from 'react-router'
import { useProgress } from '../progress/useProgress'
import { describePlace } from './dashboard'

// Remembers the last content page opened (a lesson, exercise, writing prompt, or the project),
// so the dashboard can offer "Continue where you left off". Used once, in AppShell, so every
// page is covered without each page having to remember to call it.
export function useTrackLastVisited() {
  const { pathname } = useLocation()
  const { recordVisit } = useProgress()

  // Syncing with something outside the page itself (the address bar) is a job for an effect.
  // recordVisit does nothing when the address is already saved, so re-running is harmless.
  useEffect(() => {
    if (describePlace(pathname)) recordVisit(pathname)
  }, [pathname, recordVisit])
}
