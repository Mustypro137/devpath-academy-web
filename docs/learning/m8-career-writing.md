# M8 — Career & writing practice: learning notes

## Debounced autosave that never loses the last words

- `useAutosave(value, save, 800)` is M5's debounce plus two safety nets:
  - **Not on open:** it remembers the last saved text, so just opening a prompt doesn't count
    as a change.
  - **Flush on leave:** when the component goes away (an effect's cleanup) or the tab is hidden
    or closed (the `pagehide` event), any text still waiting is saved at once.
- Refs (`useRef`) hold the pending text and the latest `save` function between renders without
  causing re-renders.
- A unit test found a double save: after a flush, the timer still fired. The timer now checks
  whether anything is still pending.
- Checked in Chrome: typing and then refreshing or clicking away after 100 ms (well inside the
  800 ms delay) kept the text.

## Saving must not wait for a render

- Until now, `ProgressProvider` saved in a `useEffect`, which only runs after React re-renders.
  A save that happens as the page closes never got that render, so it was lost.
- Now every change goes through `commit()`: work out the next progress, write it to
  `localStorage` straight away, then give it to React.
- `commit()` reads the latest progress from a ref, because the `progress` variable only updates
  on the next render. Two changes in the same click still build on each other.
- `ProgressProvider.test.tsx` covers this. Run against the old provider, those tests fail.

## Where state lives

- The text being typed lives in the editor's own `useState`, so the whole app doesn't re-render
  and save on every key. Saved progress is updated after a pause.
- Checklist ticks go straight to progress: one click is one change, so there is nothing to
  debounce.
- "Saving…" / "All changes saved" compares the editor's text with the saved text, so it can't
  be wrong.

## Textarea accessibility

- A visible `<label>` names the textarea. `aria-describedby` points at two other elements, the
  target length and the live word count, so screen readers read both when it gets focus.
- The word count is **not** an `aria-live` region: announcing it on every keystroke would drown
  out the typing.
- The checklist is a `<fieldset>` whose `<legend>` includes the count ("Self-review checklist (2
  of 5)").
- `white-space: pre-wrap` shows the example answer's line breaks without a `<pre>` element's
  code font.

## String processing

- `countWords` splits on any whitespace (`/\s+/`) and keeps pieces that contain a letter or
  digit (`/[\p{L}\p{N}]/u`). So a lone `-` or `#` isn't a word, while `don't`, `well-known`,
  `café`, and `日本` each count as one.
- Edge cases are a table in `wordCount.test.ts` (`it.each`): empty text, only spaces, new lines,
  tabs, punctuation, numbers, other alphabets, URLs.
- A content test checks that every example answer fits its own word range. It caught two
  examples that were too short for their targets.

## Technical writing

- Every prompt's tips and checklist follow the same idea: write for a reader who has none of
  your context. Lead with the point, give concrete details (steps, versions, code), say what you
  already tried, and end with a clear ask or next step.
