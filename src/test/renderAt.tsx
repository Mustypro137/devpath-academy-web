import { render } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router'
import { AppRoutes } from '../AppRoutes'

// Renders the whole app as if the browser were at `path`. MemoryRouter keeps the URL in memory
// instead of the real address bar, so each test starts fresh and isolated.
export function renderAt(path: string) {
  const user = userEvent.setup()
  const result = render(
    <MemoryRouter initialEntries={[path]}>
      <AppRoutes />
    </MemoryRouter>,
  )
  return { user, ...result }
}
