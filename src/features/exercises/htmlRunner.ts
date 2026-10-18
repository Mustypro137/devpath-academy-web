// Checks an HTML/CSS exercise, the iframe version of runner.ts:
// put the learner's page in a hidden, sandboxed iframe, ask it to run the checks, and wait for
// the answer, but never longer than the time limit. A fresh iframe is used for every run.
import type { HtmlCssTestCase } from '../../types/content'
import type { RunOutcome, TestResult } from './checker'
import { checkDocument } from './domChecks'

export const CHECK_TIMEOUT_MS = 3000

// Messages between the page and the checker iframe.
type FromFrame =
  | { type: 'checker-ready' }
  | { type: 'check-results'; results: TestResult[] }
  | { type: 'check-error'; message: string }

// The first thing that runs inside the iframe. Like checkDocument, it is copied in as text, so
// it may only use its parameter. It waits to be asked, runs the checks, and posts the results.
function listenForChecks(check: typeof checkDocument) {
  addEventListener('message', (event: MessageEvent) => {
    // Only accept requests from the page that created this iframe.
    if (event.source !== parent || event.data?.type !== 'run-checks') return
    try {
      parent.postMessage({ type: 'check-results', results: check(document, event.data.tests) }, '*')
    } catch (error) {
      parent.postMessage({ type: 'check-error', message: String(error) }, '*')
    }
  })
  // DOMContentLoaded fires once the whole page is parsed, including its <style> elements.
  // (Not 'load', which also waits for images.)
  addEventListener('DOMContentLoaded', () => parent.postMessage({ type: 'checker-ready' }, '*'))
}

// The iframe's whole document: our script first, then the learner's code.
// - The Content-Security-Policy only lets scripts with this run's secret `nonce` run. Any
//   <script> or onclick="..." the learner writes is blocked, so it can't freeze the page or fake
//   the results. Inline <style> is allowed: CSS is what the learner is practising. Nothing else
//   (images, fonts, network requests) is loaded: the checks don't need it.
// - Our script comes first, so unfinished learner HTML (like an unclosed <!--) can't swallow it.
export function buildCheckerDocument(code: string, nonce: string): string {
  const policy = `default-src 'none'; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'`
  return [
    `<meta http-equiv="Content-Security-Policy" content="${policy}">`,
    `<script nonce="${nonce}">(${listenForChecks.toString()})(${checkDocument.toString()})</script>`,
    code,
  ].join('\n')
}

// The parts of the checker iframe we use. Tests pass in their own.
export interface CheckerFrame {
  window: Window // the iframe's window: messages to it, and the source of messages from it
  remove: () => void
}

function createCheckerFrame(srcdoc: string): CheckerFrame {
  const iframe = document.createElement('iframe')
  // allow-scripts lets our checker run. Without allow-same-origin the iframe counts as a
  // different website: it can't read this page, its cookies, or localStorage.
  iframe.setAttribute('sandbox', 'allow-scripts')
  iframe.srcdoc = srcdoc
  iframe.title = 'Exercise checker'
  iframe.setAttribute('aria-hidden', 'true')
  iframe.tabIndex = -1
  // Off-screen, but still laid out at a normal size, so styles compute like in a real page.
  iframe.style.cssText =
    'position:absolute; left:-10000px; top:0; width:1024px; height:768px; visibility:hidden'
  document.body.append(iframe)
  return { window: iframe.contentWindow!, remove: () => iframe.remove() }
}

export function runHtmlChecks(
  code: string,
  tests: HtmlCssTestCase[],
  { timeoutMs = CHECK_TIMEOUT_MS, createFrame = createCheckerFrame } = {},
): Promise<RunOutcome> {
  return new Promise((resolve) => {
    const frame = createFrame(buildCheckerDocument(code, crypto.randomUUID()))

    function finish(outcome: RunOutcome) {
      clearTimeout(timer)
      removeEventListener('message', handleMessage)
      frame.remove()
      resolve(outcome)
    }

    function handleMessage(event: MessageEvent<FromFrame>) {
      // Every iframe and browser extension can post messages to this page, so only listen to
      // the checker iframe we just created.
      if (event.source !== frame.window) return
      const message = event.data
      if (message.type === 'checker-ready') {
        // A sandboxed iframe has no real origin ("null"), so '*' is the only target that works.
        // The tests aren't secret.
        frame.window.postMessage({ type: 'run-checks', tests }, '*')
      } else if (message.type === 'check-results') {
        finish({ status: 'done', results: message.results })
      } else if (message.type === 'check-error') {
        finish({ status: 'error', message: message.message })
      }
    }

    const timer = setTimeout(() => finish({ status: 'timeout' }), timeoutMs)
    addEventListener('message', handleMessage)
  })
}
