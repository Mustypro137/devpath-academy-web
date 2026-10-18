// The page's side of running learner code: start a Worker, send it the code, and wait for an
// answer, but never longer than the time limit.
import type { RunOutcome, RunRequest } from './checker'

export const RUN_TIMEOUT_MS = 3000

// The parts of a Worker we use. Tests pass in a fake with the same shape, because jsdom (the
// simulated browser tests run in) has no real Workers.
export interface WorkerLike {
  onmessage: ((event: MessageEvent<RunOutcome>) => void) | null
  onerror: ((event: ErrorEvent) => void) | null
  postMessage: (message: RunRequest) => void
  terminate: () => void
}

function createRunnerWorker(): WorkerLike {
  // This exact `new Worker(new URL(...), ...)` pattern tells Vite to bundle the worker file.
  return new Worker(new URL('./runner.worker.ts', import.meta.url), { type: 'module' })
}

// Returns a Promise: a value that arrives later. `await runCode(...)` waits for it.
export function runCode(
  request: RunRequest,
  { timeoutMs = RUN_TIMEOUT_MS, createWorker = createRunnerWorker } = {},
): Promise<RunOutcome> {
  return new Promise((resolve) => {
    // A fresh Worker for every run, so nothing from the last run (variables, loops) is left over.
    const worker = createWorker()

    function finish(outcome: RunOutcome) {
      clearTimeout(timer)
      worker.terminate() // stops the thread, even in the middle of an infinite loop
      resolve(outcome)
    }

    const timer = setTimeout(() => finish({ status: 'timeout' }), timeoutMs)
    worker.onmessage = (event) => finish(event.data)
    // Fires if the worker itself fails to start or crashes.
    worker.onerror = (event) => {
      event.preventDefault() // we report it ourselves; don't also log it as uncaught
      finish({ status: 'error', message: event.message || 'Your code could not be run.' })
    }

    worker.postMessage(request)
  })
}
