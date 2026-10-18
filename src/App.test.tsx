import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('shows the site name as the main heading', () => {
    render(<App />)

    // Query the way a user (or screen reader) finds things: by role and name.
    expect(screen.getByRole('heading', { level: 1, name: 'DevPath Academy' })).toBeInTheDocument()
  })
})
