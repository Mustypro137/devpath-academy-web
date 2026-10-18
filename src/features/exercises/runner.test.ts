import { afterEach, describe, expect, it, vi } from 'vitest'
import { checkCode, type RunOutcome, type RunRequest } from './checker'
import { RUN_TIMEOUT_MS, runCode, type WorkerLike } from './runner'

const request: RunRequest = {
  code: 'const double = (n) => n * 2',
  functionName: 'double',
  tests: [{ description: 'double(2) returns 4', args: [2], expected: 4 }],
}

// Stands in for a real Worker. `reply` plays the part of the worker answering.
class FakeWorker implements WorkerLike {
  onmessage: WorkerLike['onmessage'] = null
  onerror: WorkerLike['onerror'] = null
  received: RunRequest[] = []
  terminated = false

  postMessage(message: RunRequest) {
    this.received.push(message)
  }
  terminate() {
    this.terminated = true
  }
  reply(outcome: RunOutcome) {
    this.onmessage?.(new MessageEvent('message', { data: outcome }))
  }
}

afterEach(() => {
  vi.useRealTimers()
})

describe('runCode', () => {
  it('sends the code to a worker and resolves with its answer', async () => {
    const worker = new FakeWorker()
    const promise = runCode(request, { createWorker: () => worker })

    expect(worker.received).toEqual([request])
    worker.reply(checkCode(worker.received[0]))

    expect(await promise).toEqual({
      status: 'done',
      results: [expect.objectContaining({ passed: true })],
    })
    expect(worker.terminated).toBe(true)
  })

  it('stops a worker that never answers (an infinite loop) after the time limit', async () => {
    vi.useFakeTimers() // lets the test move the clock forward instead of really waiting 3s
    const worker = new FakeWorker() // never replies, just like `while (true) {}`
    const promise = runCode(request, { createWorker: () => worker })

    vi.advanceTimersByTime(RUN_TIMEOUT_MS - 1)
    expect(worker.terminated).toBe(false)

    vi.advanceTimersByTime(1)
    expect(await promise).toEqual({ status: 'timeout' })
    expect(worker.terminated).toBe(true)
  })

  it('reports an error if the worker crashes', async () => {
    const worker = new FakeWorker()
    const promise = runCode(request, { createWorker: () => worker })

    worker.onerror?.(new ErrorEvent('error', { message: 'Worker failed' }))

    expect(await promise).toEqual({ status: 'error', message: 'Worker failed' })
    expect(worker.terminated).toBe(true)
  })
})

describe('checkCode (what the worker does)', () => {
  it('reports a syntax error instead of throwing', () => {
    const outcome = checkCode({ ...request, code: 'const double = (n) =>' })
    expect(outcome).toEqual({ status: 'error', message: expect.stringMatching(/^SyntaxError/) })
  })

  it('runs the tests when the code is valid', () => {
    expect(checkCode(request)).toMatchObject({ status: 'done', results: [{ passed: true }] })
  })
})
