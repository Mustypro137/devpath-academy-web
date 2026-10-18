import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('App', () => {
  it('starts on the dashboard inside the site layout', () => {
    render(<App />)

    // Query the way a user (or screen reader) finds things: by role and name.
    expect(screen.getByRole('link', { name: 'DevPath Academy' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: 'Dashboard' })).toBeInTheDocument()
  })
})
