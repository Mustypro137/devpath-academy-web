import { EditorView } from '@codemirror/view'
import { act, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getExercise } from '../content'
import { checkCode, type RunRequest } from '../features/exercises/checker'
import { renderAt } from '../test/renderAt'

// jsdom has no Web Workers, so replace runCode with one that checks the code directly.
// The Worker and timeout plumbing is tested on its own in runner.test.ts.
// Code containing `while (true)` acts like a real infinite loop: it "times out".
vi.mock('../features/exercises/runner', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../features/exercises/runner')>()),
  runCode: async (request: RunRequest) =>
    request.code.includes('while (true)') ? { status: 'timeout' } : checkCode(request),
}))

const exercise = getExercise('js-double')!
const path = `/exercises/${exercise.id}`

// CodeMirror draws its own text box, which simulated typing can't drive in jsdom, so these
// helpers use CodeMirror's API to read and replace the editor's text.
function editor() {
  return EditorView.findFromDOM(screen.getByRole('textbox', { name: 'Your code' }))!
}
function typeCode(code: string) {
  const view = editor()
  // act() makes React finish the resulting update (and save it) before the test goes on.
  act(() => view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: code } }))
}
function editorText() {
  return editor().state.doc.toString()
}

// The explanation has `inline code`, which splits it across elements, so match a plain phrase.
const explanation = /single expression and no braces/

afterEach(() => {
  vi.restoreAllMocks()
})

describe('exercise page (/exercises/:exerciseId)', () => {
  it('shows the instructions, the starter code, and a link back to the lesson', () => {
    renderAt(path)
    expect(screen.getByRole('heading', { level: 1, name: exercise.title })).toBeInTheDocument()
    expect(screen.getByText('Not attempted yet')).toBeInTheDocument()
    expect(editorText()).toBe(exercise.starterCode)
    expect(screen.getByRole('link', { name: 'Functions' })).toHaveAttribute(
      'href',
      '/learn/js-functions',
    )
  })

  it('shows which tests failed, and what came back instead', async () => {
    const { user } = renderAt(path)
    typeCode('const double = (n) => n + 4')
    await user.click(screen.getByRole('button', { name: 'Run tests' }))

    expect(await screen.findByText('1 of 3 tests passed.')).toBeInTheDocument()
    const passed = screen.getByText(/double\(4\) returns 8/).closest('li')!
    expect(passed).toHaveTextContent('✓ Passed')
    const failed = screen.getByText(/double\(0\) returns 0/).closest('li')!
    expect(failed).toHaveTextContent('✗ Failed')
    expect(failed).toHaveTextContent('Expected 0, but got 4.')
    expect(screen.getByText('In progress (1 run)')).toBeInTheDocument()
  })

  it('passes with a correct solution and records the run in the history', async () => {
    const { user } = renderAt(path)
    typeCode(exercise.solution)
    await user.click(screen.getByRole('button', { name: 'Run tests' }))

    expect(await screen.findByText('All 3 tests passed. Well done!')).toBeInTheDocument()
    expect(screen.getByText('Passed (1 run)')).toBeInTheDocument()
    const history = screen.getByRole('region', { name: 'Your runs' })
    expect(within(history).getByText(/All 3 tests passed/)).toBeInTheDocument()
  })

  it('explains a code error', async () => {
    const { user } = renderAt(path)
    typeCode('const double = (n) =>')
    await user.click(screen.getByRole('button', { name: 'Run tests' }))
    expect(await screen.findByText(/Your code couldn’t run/)).toHaveTextContent('SyntaxError')
  })

  it('stops code that never finishes', async () => {
    const { user } = renderAt(path)
    typeCode('const double = (n) => { while (true) {} }')
    await user.click(screen.getByRole('button', { name: 'Run tests' }))
    expect(await screen.findByText(/so it was stopped/)).toBeInTheDocument()
  })

  it('keeps the code after a reload', () => {
    const { unmount } = renderAt(path)
    typeCode('const double = (n) => n * 3')
    unmount()

    renderAt(path)
    expect(editorText()).toBe('const double = (n) => n * 3')
  })

  it('loads an earlier run back into the editor', async () => {
    const { user } = renderAt(path)
    typeCode('const double = (n) => n + 4')
    await user.click(screen.getByRole('button', { name: 'Run tests' }))
    await screen.findByText('1 of 3 tests passed.')

    typeCode('something else')
    await user.click(screen.getByRole('button', { name: 'Load this code' }))
    expect(editorText()).toBe('const double = (n) => n + 4')
  })

  it('starts over with the starter code after confirming', async () => {
    const { user } = renderAt(path)
    typeCode('my code')
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Start over' }))
    expect(editorText()).toBe(exercise.starterCode)
  })

  it('shows "Exercise not found" for an unknown id', () => {
    renderAt('/exercises/nope')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Exercise not found' }),
    ).toBeInTheDocument()
  })
})

describe('hints and solution', () => {
  it('reveals hints one at a time, then unlocks the solution', async () => {
    const { user } = renderAt(path)
    const hints = screen.getByRole('region', { name: 'Hints' })
    const solution = screen.getByRole('region', { name: 'Solution' })

    expect(within(hints).queryAllByRole('listitem')).toHaveLength(0)
    expect(within(solution).getByText(/unlocks after the last hint/)).toBeInTheDocument()

    for (let shown = 1; shown <= exercise.hints.length; shown++) {
      await user.click(
        within(hints).getByRole('button', {
          name: `Show hint ${shown} of ${exercise.hints.length}`,
        }),
      )
      expect(within(hints).getAllByRole('listitem')).toHaveLength(shown)
    }
    expect(within(hints).getByText('That was the last hint.')).toBeInTheDocument()
    expect(within(solution).getByRole('button', { name: 'Show solution' })).toBeInTheDocument()
  })

  it('shows the solution only after confirming, and remembers it was viewed', async () => {
    const { user, unmount } = renderAt(path)
    const showHints = async () => {
      for (let i = 0; i < exercise.hints.length; i++) {
        await user.click(screen.getByRole('button', { name: /Show hint/ }))
      }
    }
    await showHints()

    const confirm = vi.spyOn(window, 'confirm').mockReturnValue(false)
    await user.click(screen.getByRole('button', { name: 'Show solution' }))
    expect(screen.queryByText(explanation)).not.toBeInTheDocument()

    confirm.mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Show solution' }))
    expect(screen.getByText(explanation)).toBeInTheDocument()

    // Pass after viewing the solution: recorded as "solved with the solution".
    typeCode(exercise.solution)
    await user.click(screen.getByRole('button', { name: 'Run tests' }))
    expect(await screen.findByText('Solved with the solution (1 run)')).toBeInTheDocument()

    // Hints and the solution stay revealed after a reload.
    unmount()
    renderAt(path)
    expect(screen.getByText(explanation)).toBeInTheDocument()
    expect(screen.getByText('That was the last hint.')).toBeInTheDocument()
  })
})
