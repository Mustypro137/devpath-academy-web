import { afterEach, describe, expect, it, vi } from 'vitest'
import type { HtmlCssTestCase } from '../../types/content'
import { buildCheckerDocument, CHECK_TIMEOUT_MS, runHtmlChecks } from './htmlRunner'

const tests: HtmlCssTestCase[] = [
  { description: 'has an h1', check: { type: 'exists', selector: 'h1' } },
]

// Stands in for the checker iframe. jsdom won't run the iframe's scripts, so the test plays the
// iframe's part: `send` posts a message to the page as if it came from inside the frame.
function fakeFrame() {
  const iframe = document.createElement('iframe')
  document.body.append(iframe)
  const frameWindow = iframe.contentWindow!
  const received = vi.spyOn(frameWindow, 'postMessage').mockImplementation(() => {})
  let removed = false
  return {
    frame: { window: frameWindow, remove: () => (removed = true) },
    received, // what the page sent to the iframe
    isRemoved: () => removed,
    send(data: unknown, source: Window = frameWindow) {
      window.dispatchEvent(new MessageEvent('message', { data, source }))
    },
  }
}

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  document.body.innerHTML = ''
})

describe('runHtmlChecks', () => {
  it('sends the tests once the iframe is ready, and resolves with its results', async () => {
    const fake = fakeFrame()
    const promise = runHtmlChecks('<h1>Hi</h1>', tests, { createFrame: () => fake.frame })

    fake.send({ type: 'checker-ready' })
    expect(fake.received).toHaveBeenCalledWith({ type: 'run-checks', tests }, '*')

    const results = [{ description: 'has an h1', passed: true, expected: 'x', actual: 'found' }]
    fake.send({ type: 'check-results', results })

    expect(await promise).toEqual({ status: 'done', results })
    expect(fake.isRemoved()).toBe(true)
  })

  it('ignores messages from any other window', async () => {
    vi.useFakeTimers()
    const fake = fakeFrame()
    const promise = runHtmlChecks('', tests, { createFrame: () => fake.frame })

    // A message that looks right, but from this page's own window instead of the iframe.
    fake.send({ type: 'check-results', results: [] }, window)
    vi.advanceTimersByTime(CHECK_TIMEOUT_MS)

    expect(await promise).toEqual({ status: 'timeout' })
  })

  it('gives up and removes the iframe after the time limit', async () => {
    vi.useFakeTimers()
    const fake = fakeFrame()
    const promise = runHtmlChecks('', tests, { createFrame: () => fake.frame })

    vi.advanceTimersByTime(CHECK_TIMEOUT_MS)
    expect(await promise).toEqual({ status: 'timeout' })
    expect(fake.isRemoved()).toBe(true)
  })

  it('reports an error from inside the iframe', async () => {
    const fake = fakeFrame()
    const promise = runHtmlChecks('', tests, { createFrame: () => fake.frame })
    fake.send({ type: 'check-error', message: 'Oops' })
    expect(await promise).toEqual({ status: 'error', message: 'Oops' })
  })
})

describe('buildCheckerDocument', () => {
  const html = buildCheckerDocument('<h1>Mine</h1><script>while (true) {}</script>', 'abc123')

  it('starts with a policy that only allows our own script', () => {
    expect(html.startsWith('<meta http-equiv="Content-Security-Policy"')).toBe(true)
    expect(html).toContain("script-src 'nonce-abc123'")
    expect(html).toContain('<script nonce="abc123">')
  })

  it("puts the learner's code last, after our script", () => {
    expect(html.indexOf('<script nonce="abc123">')).toBeLessThan(html.indexOf('<h1>Mine</h1>'))
    // The learner's script has no nonce, so the policy blocks it.
    expect(html).toContain('<script>while (true) {}</script>')
  })
})
