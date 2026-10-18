import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LessonContent } from './LessonContent'

describe('LessonContent', () => {
  it('renders a heading block as a level-2 heading', () => {
    render(<LessonContent blocks={[{ type: 'heading', text: 'Attributes' }]} />)
    expect(screen.getByRole('heading', { level: 2, name: 'Attributes' })).toBeInTheDocument()
  })

  it('renders a text block as a paragraph', () => {
    render(<LessonContent blocks={[{ type: 'text', text: 'Hello there.' }]} />)
    expect(screen.getByText('Hello there.').tagName).toBe('P')
  })

  it('renders a list block as a list of items', () => {
    render(<LessonContent blocks={[{ type: 'list', items: ['One', 'Two', 'Three'] }]} />)
    expect(screen.getAllByRole('listitem').map((li) => li.textContent)).toEqual([
      'One',
      'Two',
      'Three',
    ])
  })

  it('renders a code block exactly as written, with its language and caption', () => {
    const code = '<p class="x">\n  Hi\n</p>'
    render(
      <LessonContent
        blocks={[{ type: 'code', language: 'html', code, caption: 'A paragraph.' }]}
      />,
    )

    // The HTML is shown as text, not turned into a real <p> element.
    expect(
      screen.getByText((_, element) => element?.tagName === 'CODE' && element.textContent === code),
    ).toBeInTheDocument()
    expect(screen.getByText('HTML')).toBeInTheDocument()
    expect(screen.getByText('A paragraph.')).toBeInTheDocument()
  })

  it('renders a callout with a visible label for its meaning', () => {
    render(<LessonContent blocks={[{ type: 'callout', variant: 'warning', text: 'Careful.' }]} />)
    const note = screen.getByRole('note')
    expect(note).toHaveTextContent('Watch out: Careful.')
  })

  it('turns `backticks` into inline code, safely', () => {
    const { container } = render(
      <LessonContent blocks={[{ type: 'text', text: 'Use the `<script>` element.' }]} />,
    )

    const code = screen.getByText('<script>')
    expect(code.tagName).toBe('CODE')
    // No real <script> element was created from the lesson text.
    expect(container.querySelector('script')).toBeNull()
  })
})
