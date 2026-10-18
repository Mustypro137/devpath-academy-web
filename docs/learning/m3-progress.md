# M3 — Progress tracking: learning notes

## One owner for saved data

- `features/progress/storage.ts` is the **only** code that touches `localStorage` for progress.
  Components go through `useProgress()`. Moving progress to a server later changes one file.
- Saved data and imported files come from outside our code, so they start as `unknown`.
  **Type guards** (`isRecord`, `isLessonProgress`) check the shape at runtime, and `migrate()`
  turns anything into valid `Progress` or `null`.
- `JSON.parse` **throws** on bad JSON, so it sits inside `try/catch`. `localStorage` can throw
  too (storage full, or blocked in some private modes).
- Corrupted saved data is copied to `devpath-progress-corrupt` and the app starts fresh, instead
  of crashing.

## `useState` and `useEffect`

- `useState(loadProgress)` passes the function, not its result, so it only runs on the first
  render.
- State is never changed in place. `setLessonComplete` builds a **new** `lessons` object, because
  React only re-renders when it gets a different object.
- The updater form `setProgress((current) => next)` always starts from the latest state, even if
  several updates happen quickly.
- `useEffect(() => saveProgress(progress), [progress])` saves after **every** change, so no
  action can forget to save.

## Context and custom hooks

- `ProgressContext` passes progress to every component under `<ProgressProvider>`, without
  threading props through each level.
- `useProgress()` is a **custom hook** (a function whose name starts with `use` and that calls
  other hooks). It throws if there is no Provider: a setup mistake should fail loudly.
- Tests get the Provider through `renderAt()`, just like the real app gets it in `App.tsx`.

## Derived state

- "2 of 4 complete" on `/learn` is **calculated** from `progress` on each render, not stored.
  Stored copies can get out of date; calculated values can't.

## Export / import / reset

- **Export** is a plain link: a `data:` URL holds the JSON, and the `download` attribute saves it
  as a file. No server, no extra JavaScript.
- **Import** uses `<input type="file">`. `await file.text()` reads it, then the same
  `parseProgressJson()` used for `localStorage` validates it. A bad file shows an error and
  changes nothing.
- Import and reset ask `window.confirm()` first, because both throw away current progress.
- The theme is not part of progress, so export/import leave it alone (see `DECISIONS.md`, M1).

## Accessibility details

- "I've completed this lesson" is a **checkbox**, not a button: it is an on/off state, and
  screen readers announce it as "checked" / "not checked".
- The ✓ on `/learn` is `aria-hidden`; a visually hidden "(completed)" is read instead. A space
  inside the hidden span was trimmed from the link's name, so the space is its own text node.
- Messages use `role="status"` (polite) for success and `role="alert"` (interrupts) for errors.
- The file input is visually hidden inside a `<label>` styled as a button. `:focus-within` on
  the label shows the focus ring.

## Testing

- **Reload test:** `unmount()` throws away React state; rendering again reads only
  `localStorage`, just like a page refresh.
- `vi.spyOn(window, 'confirm').mockReturnValue(true)` answers the dialog, which jsdom can't
  show. `vi.restoreAllMocks()` undoes it after each test.
- `user.upload(input, file)` simulates choosing a file.
- The acceptance test runs export → reset → import and checks the saved progress is restored.
