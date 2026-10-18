# M9 — Real dashboard: learning notes

## Pure derived state

- The dashboard stores nothing of its own. Everything on it comes from saved progress:
  - progress counts
  - the "Up next" suggestion
  - the summaries

  `summarizeDashboard(progress)` calculates all of it.

- Because it is a **pure function** (same progress in, same summary out, no side effects), it
  is tested without rendering anything (`dashboard.test.ts`). The page tests only check that
  the results appear.
- A stored copy of a count can disagree with the data it was counted from. A calculated count
  can't.

## `useMemo`

- `useMemo(() => summarizeDashboard(progress), [progress])` keeps the result between renders,
  and only recalculates when `progress` is a different object.
- That works because progress is never changed in place: every change makes a new object (see
  `commit()` in `ProgressProvider`). A new object means "something changed"; the same object
  means "nothing did".
- Rule of thumb: reach for `useMemo` when a calculation walks a lot of data, or when a value is
  passed to something that compares by identity. For small calculations, plain code is fine.

## Testing the three kinds of learner

- `src/test/progressFixtures.ts` builds saved progress for learners from the real content:
  `withLessons`, `withPassed`, and `finished()`. The logic tests and the page tests share them.
- `nextStep` is tested for:
  - a new learner (take the assessment)
  - learners partway through (the next lesson, that lesson's exercises first, an earlier skipped
    lesson, then the project, then writing)
  - a learner who has finished
- Edge cases count as "not done": opening an exercise without running it, and a writing draft of
  only spaces.

## "Continue where you left off"

- `lastVisited` saves an address (`/learn/js-functions`), not a title. The title is looked up
  from the content when shown, so renaming a lesson can't leave an old title behind. An address
  for removed content is ignored.
- One hook, `useTrackLastVisited`, is called once in `AppShell`, so every page is covered. It
  uses `useLocation()` and an effect: syncing with the address bar, which is outside React, is
  what effects are for.
- `recordVisit` skips the save when the address hasn't changed, so the effect re-running is
  harmless.
- The "Continue" card is hidden when it would link to the same place as "Up next".

## CSS specificity

- `.card h2` (a class plus an element) beats `.label` (just a class), so a heading with both got
  the card's larger size. `.card h2:not(.label)` leaves labels alone. Specificity is counted per
  selector part: IDs, then classes/attributes/pseudo-classes, then elements.
