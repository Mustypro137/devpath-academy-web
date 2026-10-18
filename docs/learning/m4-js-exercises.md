# M4 — JavaScript exercises: learning notes

## How an exercise is checked

- An exercise asks for **one function** (`functionName`). Each test calls it with `args` and
  compares the result with `expected`. Example: `double(4)` should return `8`.
- `checker.ts` holds the checking logic as **pure functions** (no DOM, no storage):
  - `loadFunction` runs the code and returns the learner's function
  - `runTests` calls it once per test
  - `isEqual` compares results
  - `formatValue` turns values into readable text

  Pure functions are easy to unit-test, so most of the checking is tested without a browser.

- `isEqual` is a **deep** comparison: `[1] === [1]` is `false` (two different arrays), but
  `isEqual([1], [1])` is `true`.
- `formatValue` shows strings with quotes, so the learner can tell `"5"` (text) from `5`.
- Each test gets a copy of its arguments (`structuredClone`), so a function that changes its
  input can't break the next test.

## Why `eval` (and `new Function`) is dangerous

- `new Function(code)` runs any text as code, like `eval`. On the main page, learner code could
  read or wipe `localStorage`, change the page, or freeze the tab with an endless loop.
- So learner code **only** runs inside a Web Worker.

## Web Workers and `postMessage`

- A **Web Worker** is JavaScript running in a separate thread. It has no access to the page, the
  DOM, or `localStorage`.
- The page and the worker can't share variables. They send copies of data with
  `postMessage(data)` and receive them in a `message` event.
- `runner.worker.ts` is three lines: receive a request, call `checkCode`, post the answer back.
- Vite bundles the worker because of the exact pattern
  `new Worker(new URL('./runner.worker.ts', import.meta.url), { type: 'module' })`.

## Promises and timeouts

- `runCode` returns a **Promise**: a value that arrives later. `await runCode(...)` pauses the
  click handler until the answer arrives; the rest of the page keeps working.
- `setTimeout` starts a 3-second timer. Whichever happens first wins:
  - the worker answers: cancel the timer (`clearTimeout`), stop the worker, resolve with results
  - the timer fires: stop the worker with `worker.terminate()`, resolve with `timeout`
- `terminate()` stops a worker even in the middle of `while (true) {}`. That is the whole reason
  for using a worker: a loop on the main thread could never be interrupted.
- Checked in real Chrome: during an infinite loop the page's own timers kept running (34 ticks
  in 3.4 s), so the page never froze.

## Testing code you can't run in tests

- jsdom (the simulated browser in Vitest) has no Workers. `runCode` takes a `createWorker`
  option, so `runner.test.ts` passes in a `FakeWorker` and controls when (or if) it replies.
- `vi.useFakeTimers()` + `vi.advanceTimersByTime(3000)` tests the timeout without waiting 3 s.
- Page tests swap `runCode` for `checkCode` with `vi.mock`. The Worker plumbing is already
  covered by `runner.test.ts`.
- `content.test.ts` runs **every solution** against its tests, and checks that **every starter
  code fails**, so a broken exercise can't ship.

## CodeMirror in React

- CodeMirror manages its own DOM. React gives it an empty `<div>` (via `useRef`) and creates the
  editor once in a `useEffect`. The effect's cleanup function destroys it.
- It still behaves like a **controlled input**: the parent owns `value` and gets every edit
  through `onChange`. A second effect copies outside changes (e.g. "Start over") into the
  editor.
- `onChangeRef` keeps the latest `onChange` in a ref, so the editor (created once) never calls
  an old version.
- Tests drive the editor through `EditorView.findFromDOM(...).dispatch(...)`, because simulated
  typing can't drive CodeMirror in jsdom. `act()` makes React finish the update before the test
  checks it.

## Saved progress

- `exercises` was added to `Progress` without a version bump: a missing section loads as empty,
  so Milestone 3 data still works (there is a test for it).
- The rules for changing an exercise's entry (count attempts, keep 10 submissions, "passed"
  stays passed) are pure functions in `exerciseProgress.ts`. The page passes them to
  `updateExercise`.
- The editor text is saved on every change, so it survives a refresh.

## Accessibility details

- Test results sit in an `aria-live="polite"` region that is always on the page. Screen readers
  only announce changes to live regions that already exist.
- Each result says "✓ Passed" or "✗ Failed" in words, never colour alone.
- Tab indents in the editor; **Esc, then Tab** leaves it. The help text is linked with
  `aria-describedby`.
- The Run button uses `aria-disabled` while running, not `disabled`: a disabled button drops
  keyboard focus.
- Code fonts have ligatures turned off, so `=>` shows as typed, not as a single arrow.

## Performance

- CodeMirror is large. `React.lazy` + `<Suspense>` load the exercise page (and CodeMirror) only
  when an exercise is opened. The main bundle stayed at ~93 kB gzipped instead of ~263 kB.
