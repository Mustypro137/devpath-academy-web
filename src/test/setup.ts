// Runs before every test file (see `test.setupFiles` in vite.config.ts).
import '@testing-library/jest-dom/vitest' // adds matchers like toBeInTheDocument()
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

// Remove anything rendered by one test so it can't leak into the next.
afterEach(() => {
  cleanup()
})
