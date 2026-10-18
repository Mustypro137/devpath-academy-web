import { EditorView } from '@codemirror/view'
import { act, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { getExercise } from '../content'
import { checkCode, type RunRequest } from '../features/exercises/checker'
import { checkDocument } from '../features/exercises/domChecks'
import { PREVIEW_DELAY_MS } from '../features/exercises/HtmlPreview'
import type { HtmlCssTestCase } from '../types/content'
import { renderAt } from '../test/renderAt'

// jsdom has no Web Workers, so replace runCode with one that checks the code directly.
// The Worker and timeout plumbing is tested on its own in runner.test.ts.
// Code containing `while (true)` acts like a real infinite loop: it "times out".
vi.mock('../features/exercises/runner', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../features/exercises/runner')>()),
  runCode: async (request: RunRequest) =>
    request.code.includes('while (true)') ? { status: 'timeout' } : checkCode(request),
}))

// jsdom won't run the checker iframe's scripts, so check HTML/CSS directly instead: inside a
// plain iframe, so the app's own page (which has an <h1> too) doesn't get checked by mistake.
// The iframe messaging is tested on its own in htmlRunner.test.ts.
vi.mock('../features/exercises/htmlRunner', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../features/exercises/htmlRunner')>()),
  runHtmlChecks: async (code: string, tests: HtmlCssTestCase[]) => {
    const iframe = document.createElement('iframe')
    document.body.append(iframe)
    const page = iframe.contentDocument!
    page.body.innerHTML = code
    const results = checkDocument(page, tests)
    iframe.remove()
    return { status: 'done', results }
  },
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

// The exercise page is loaded lazily, so wait for its heading before going on.
async function openExercise(url = path) {
  const result = renderAt(url)
  await screen.findByRole('heading', { level: 1 })
  return result
}

// The explanation has `inline code`, which splits it across elements, so match a plain phrase.
const explanation = /single expression and no braces/

afterEach(() => {
  vi.restoreAllMocks()
})

describe('exercise page (/exercises/:exerciseId)', () => {
  it('shows the instructions, the starter code, and a link back to the lesson', async () => {
    await openExercise()
    expect(screen.getByRole('heading', { level: 1, name: exercise.title })).toBeInTheDocument()
    expect(screen.getByText('Not attempted yet')).toBeInTheDocument()
    expect(editorText()).toBe(exercise.starterCode)
    expect(screen.getByRole('link', { name: 'Functions' })).toHaveAttribute(
      'href',
      '/learn/js-functions',
    )
  })

  it('shows which tests failed, and what came back instead', async () => {
    const { user } = await openExercise()
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
    const { user } = await openExercise()
    typeCode(exercise.solution)
    await user.click(screen.getByRole('button', { name: 'Run tests' }))

    expect(await screen.findByText('All 3 tests passed. Well done!')).toBeInTheDocument()
    expect(screen.getByText('Passed (1 run)')).toBeInTheDocument()
    const history = screen.getByRole('region', { name: 'Your runs' })
    expect(within(history).getByText(/All 3 tests passed/)).toBeInTheDocument()
  })

  it('explains a code error', async () => {
    const { user } = await openExercise()
    typeCode('const double = (n) =>')
    await user.click(screen.getByRole('button', { name: 'Run tests' }))
    expect(await screen.findByText(/Your code couldn’t run/)).toHaveTextContent('SyntaxError')
  })

  it('stops code that never finishes', async () => {
    const { user } = await openExercise()
    typeCode('const double = (n) => { while (true) {} }')
    await user.click(screen.getByRole('button', { name: 'Run tests' }))
    expect(await screen.findByText(/so it was stopped/)).toBeInTheDocument()
  })

  it('keeps the code after a reload', async () => {
    const { unmount } = await openExercise()
    typeCode('const double = (n) => n * 3')
    unmount()

    await openExercise()
    expect(editorText()).toBe('const double = (n) => n * 3')
  })

  it('loads an earlier run back into the editor', async () => {
    const { user } = await openExercise()
    typeCode('const double = (n) => n + 4')
    await user.click(screen.getByRole('button', { name: 'Run tests' }))
    await screen.findByText('1 of 3 tests passed.')

    typeCode('something else')
    await user.click(screen.getByRole('button', { name: 'Load this code' }))
    expect(editorText()).toBe('const double = (n) => n + 4')
  })

  it('starts over with the starter code after confirming', async () => {
    const { user } = await openExercise()
    typeCode('my code')
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    await user.click(screen.getByRole('button', { name: 'Start over' }))
    expect(editorText()).toBe(exercise.starterCode)
  })

  it('shows "Exercise not found" for an unknown id', async () => {
    await openExercise('/exercises/nope')
    expect(
      screen.getByRole('heading', { level: 1, name: 'Exercise not found' }),
    ).toBeInTheDocument()
  })
})

describe('hints and solution', () => {
  it('reveals hints one at a time, then unlocks the solution', async () => {
    const { user } = await openExercise()
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
    const { user, unmount } = await openExercise()
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
    await openExercise()
    expect(screen.getByText(explanation)).toBeInTheDocument()
    expect(screen.getByText('That was the last hint.')).toBeInTheDocument()
  })
})

describe('HTML/CSS exercise', () => {
  const htmlExercise = getExercise('css-heading-color')!
  const htmlPath = `/exercises/${htmlExercise.id}`

  it('checks the page and shows which checks failed', async () => {
    const { user } = await openExercise(htmlPath)
    typeCode('<style> h1 { color: rebeccapurple; } </style><h1>Hi</h1><p>Text</p>')
    await user.click(screen.getByRole('button', { name: 'Run tests' }))

    expect(await screen.findByText('1 of 2 tests passed.')).toBeInTheDocument()
    const failed = screen.getByText('Paragraphs are 18px').closest('li')!
    expect(failed).toHaveTextContent('✗ Failed')
    // A real browser says 16px for the default size; jsdom says "medium".
    expect(failed).toHaveTextContent(/Expected font-size: 18px, but got font-size: (16px|medium)\./)
  })

  it('passes with the solution', async () => {
    const { user } = await openExercise(htmlPath)
    typeCode(htmlExercise.solution)
    await user.click(screen.getByRole('button', { name: 'Run tests' }))
    expect(await screen.findByText('All 2 tests passed. Well done!')).toBeInTheDocument()
  })

  it('updates the preview after a pause in typing', async () => {
    await openExercise(htmlPath)
    const preview = screen.getByTitle('Preview of your page')
    expect(preview).toHaveAttribute('srcdoc', htmlExercise.starterCode)

    vi.useFakeTimers()
    typeCode('<h1>New</h1>')
    expect(preview).toHaveAttribute('srcdoc', htmlExercise.starterCode) // not yet
    act(() => vi.advanceTimersByTime(PREVIEW_DELAY_MS))
    expect(preview).toHaveAttribute('srcdoc', '<h1>New</h1>')
    vi.useRealTimers()
  })

  it('locks the preview down completely', async () => {
    await openExercise(htmlPath)
    // An empty sandbox: no scripts, no same-origin access, no forms, no navigation.
    expect(screen.getByTitle('Preview of your page')).toHaveAttribute('sandbox', '')
  })

  it('has no preview on JavaScript exercises', async () => {
    await openExercise()
    expect(screen.queryByTitle('Preview of your page')).not.toBeInTheDocument()
  })
})
