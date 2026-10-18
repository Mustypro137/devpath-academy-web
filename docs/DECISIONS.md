# Decision log

Decisions made during implementation that refine or deviate from [`PLAN.md`](PLAN.md).
Newest first.

## 2026-10-18 — M5: One HTML document per exercise, with the preview below the editor

- **Context:** The plan says "split editor + sandboxed iframe preview".
- **Decision:** One editor holds a whole HTML document, with CSS in a `<style>` element. The
  preview sits below the editor and its results, not beside it.
- **Why:** One string keeps saved progress the same shape as for JavaScript (no migration). A
  `<style>` element is real HTML that beginners meet anyway. The content column (48rem) is too
  narrow for an editor and a preview side by side.
- **Revisit:** Separate HTML and CSS tabs, or a wider side-by-side layout, if exercises grow.

## 2026-10-18 — M5: HTML/CSS checks run in a throwaway hidden iframe

- **Decision:** Checks are plain `DomCheck` data. For each run, a hidden iframe is created with
  `sandbox="allow-scripts"` (no `allow-same-origin`) and a Content-Security-Policy that only
  lets our nonce-tagged checker script run. Results come back by `postMessage`, are accepted
  only from that iframe, and time out after 3 s. The visible preview is a separate iframe with
  `sandbox=""`.
- **Why:** The same shape as the JavaScript Worker: a fresh, isolated environment per run. The
  learner's scripts never run, so they can't freeze the page or fake results.
- **Consequence:** `checkDocument` must stay self-contained, because it is copied into the iframe
  as text. A unit test guards this.

## 2026-10-18 — M5: Saving editor code is still not debounced

- **Context:** M4 left "debounce saving" to revisit in M5.
- **Decision:** Keep saving on every change. Only the preview is debounced.
- **Why:** Saving is fast for progress this small. A debounced save can lose the last
  keystrokes if the tab closes during the delay, and would need extra code to flush on exit.
- **Revisit:** If typing feels slow, or progress gets much bigger.

## 2026-10-18 — M4: Exercise tests are `{ args, expected }` for one named function

- **Context:** The plan's `TestCase` is `{ description, check }`.
- **Decision:** A JS exercise names one function (`functionName`). Each test is
  `{ description, args, expected }`, compared with a deep-equality check.
- **Why:** Tests stay plain data (no functions), so they can be sent to the Worker with
  `postMessage`. Failures can show "expected X, got Y", and every solution is checked
  automatically in `content.test.ts`.
- **Revisit:** Exercises that need console output or several functions would need a richer test
  shape.

## 2026-10-18 — M4: Submission history is saved in progress

- **Context:** The plan's `exercises` entry has `lastCode` but no history, while M4 asks for
  submission history.
- **Decision:** Each entry also stores `submissions`: the newest 10 runs, with code, outcome, and
  pass count. The `exercises` section was added without a version bump, because a missing
  section loads as empty.
- **Consequence:** Exported files include the history. The cap keeps them small.

## 2026-10-18 — M4: The solution unlocks after the last hint

- **Context:** The plan's "Stuck" journey: exhaust hints, then confirm, then reveal the solution.
- **Decision:** "Show solution" appears only once every hint is shown, and still asks for
  confirmation. Passing after viewing it shows "Solved with the solution".

## 2026-10-18 — M4: Editor code is saved on every change, without debouncing

- **Decision:** Each edit updates progress, which saves the whole progress object to
  `localStorage`.
- **Why:** Simple, and the code survives a refresh immediately. Progress is small, so this is
  fast enough.
- **Revisit:** Debounce saving in M5 (the plan teaches debouncing there) or if typing feels slow.

## 2026-10-18 — M4: The exercise page is lazy-loaded

- **Context:** CodeMirror grew the main bundle from ~90 kB to ~263 kB gzipped.
- **Decision:** `React.lazy` loads the exercise page in its own chunk (~171 kB gzipped).
- **Consequence:** Vite warns that this chunk is over 500 kB before gzip. That is CodeMirror's
  real size, so the warning is left visible rather than silenced.

## 2026-10-18 — M4: Page tests don't run a real Worker

- **Context:** jsdom has no Web Workers.
- **Decision:** `runner.test.ts` tests the timeout logic with a fake worker. Page tests replace
  `runCode` with `checkCode`. The real Worker was checked by hand in Chrome: an infinite loop is
  stopped after ~3 s and the page stays responsive.
- **Revisit:** Cover it with a Playwright E2E test in M10.

## 2026-10-18 — M3: Lesson completion is a checkbox; export is a `data:` link

- **Context:** The plan says "Mark complete".
- **Decision:** A labelled checkbox ("I've completed this lesson") instead of a button. Export is
  an `<a download>` with a `data:` URL instead of building a `Blob` in a click handler.
- **Why:** A checkbox is a native on/off control, so it can be unticked and screen readers
  announce its state. The `data:` link needs no JavaScript and is easy to test (jsdom has no
  `URL.createObjectURL`).
- **Revisit:** If exported files get large (many submissions in M4+), switch to a `Blob` URL.

## 2026-10-18 — M2: Vitest runs in threads, at most half the CPU cores

- **Context:** With the defaults, `npm test` crashed with "Fatal process out of memory" on this
  8-core / 16 GB machine once the lesson tests were added (one jsdom environment per test file,
  all started at once).
- **Decision:** In `vite.config.ts`, set `pool: 'threads'` and `maxWorkers: '50%'`.
- **Consequence:** Tests run a little slower but reliably. Revisit if the suite grows a lot.

## 2026-10-18 — M2: Lesson content format details

- **Context:** The plan lists the block types as `text | code | callout | heading`.
- **Decision:**
  - Added a fifth block type, `list` (bullet points), because almost every lesson needed one.
  - Inline code inside text is written with `backticks`, rendered by `InlineText` as `<code>`.
    This is the only formatting inside text: no Markdown parser, as decided in the plan.
  - Lessons have Previous / Next links that follow course order across modules.
- **Safety:** All text is rendered by React as text (never as HTML), so a `<script>` in lesson
  data shows on screen and never runs. A content test fails on an unclosed backtick.

## 2026-10-18 — M1: React Router 8 needs Node 22.22+

- **Context:** `react-router@8` declares `"node": ">=22.22.0"`. This machine has Node 22.17.1.
  Everything works today (tests, build, dev server), but it's officially unsupported.
- **Decision:** Keep React Router 8 and raise the README requirement to Node 22.22+.
- **Action for the owner:** update Node to the latest 22.x (or 24 LTS) from nodejs.org.

## 2026-10-18 — M1: Theme preference stored outside `features/progress`

- **Context:** The plan says `features/progress/` is the only place that reads/writes saved
  progress. The light/dark choice is a display preference, not learning progress.
- **Decision:** `features/theme/` stores it under its own localStorage key, `devpath-theme`.
- **Consequence:** Export/import (M3) will not include the theme. That is intended.

## 2026-10-18 — M1: One `Sidebar` instead of separate `Sidebar` + `MobileNav`

- **Context:** The plan lists both components.
- **Decision:** A single `Sidebar` renders the nav links once. CSS shows it as a dropdown under the
  header on phones and as a fixed sidebar from 768px up.
- **Why:** One list of links means no duplicate markup to keep in sync, and screen readers
  never see two "Main" navigation landmarks.

## 2026-10-18 — M0: ESLint 10 without `eslint-plugin-jsx-a11y`

- **Context:** The current Vite template ships with oxlint, but the plan specifies ESLint. We kept
  ESLint (larger plugin ecosystem, matches the plan). `eslint-plugin-jsx-a11y` only supports ESLint
  ≤ 9, and ESLint 9 is end-of-life (no more fixes).
- **Decision:** Use ESLint 10 and leave out `jsx-a11y` for now.
- **Consequence:** Accessibility is not linted automatically yet. It is still covered by manual
  review and the axe audit in M10.
- **Revisit:** Add `jsx-a11y` back when it releases ESLint 10 support
  (check with `npm view eslint-plugin-jsx-a11y peerDependencies`).

## 2026-10-18 — M0: Tool versions

Starting versions: Vite 8, React 19, TypeScript 6, Vitest 5, ESLint 10, Prettier 3, Node 22.
