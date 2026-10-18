import { EditorView } from '@codemirror/view'
import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { CodeEditor } from './CodeEditor'

// CodeMirror draws its own text box, which simulated typing can't drive reliably in jsdom.
// So these tests talk to the editor through CodeMirror's API (EditorView.findFromDOM).
function getView() {
  const textbox = screen.getByRole('textbox', { name: 'Your code' })
  return EditorView.findFromDOM(textbox)!
}

describe('CodeEditor', () => {
  it('shows the value in a labelled text box with keyboard help', () => {
    render(<CodeEditor label="Your code" value="const a = 1" onChange={() => {}} />)
    expect(getView().state.doc.toString()).toBe('const a = 1')
    expect(screen.getByRole('textbox', { name: 'Your code' })).toHaveAccessibleDescription(
      /press Esc, then Tab/,
    )
  })

  it('calls onChange with the new text after an edit', () => {
    const onChange = vi.fn()
    render(<CodeEditor label="Your code" value="a" onChange={onChange} />)
    getView().dispatch({ changes: { from: 1, insert: 'b' } })
    expect(onChange).toHaveBeenCalledWith('ab')
  })

  it('replaces the text when the parent passes a new value', () => {
    const { rerender } = render(<CodeEditor label="Your code" value="old" onChange={() => {}} />)
    rerender(<CodeEditor label="Your code" value="new" onChange={() => {}} />)
    expect(getView().state.doc.toString()).toBe('new')
  })
})
