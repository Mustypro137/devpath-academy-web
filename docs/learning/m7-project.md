# M7 — Practical project: learning notes

## Nested data

- The project is data three levels deep: a `Project` has `milestones`, and each milestone has
  `tasks`. The page code doesn't mention any particular milestone: it maps over whatever the
  content file contains.
- `flatMap` turns "a list of milestones, each with a list of tasks" into one flat list of tasks.
  That is how the overall count reuses the per-milestone `countTasks` function.
- Saved progress stays flat: `project.tasks` is `{ "setup-git": true, ... }`, keyed by task id.
  That is why every task has an `id` (the plan's `tasks: string[]` had none). Changing a task's
  wording keeps its tick; changing its id would lose it, so ids should never change.

## Computed percentages

- "6 of 30 tasks done (20%)" is calculated on every render from the saved ticks. Nothing stores
  the count or the percentage, so they can't disagree with the checkboxes.
- `Math.round((value / max) * 100)`, with a guard for `max === 0`: dividing by zero gives `NaN`.
- A tick saved for a task that no longer exists is simply not counted. A unit test covers this.

## Component reuse

- `MilestoneChecklist` is written once and rendered six times, each time with different props.
- `ProgressBar` lives in `src/components/` because nothing about it is project-specific. The
  dashboard (M9) will reuse it.

## Accessible checkboxes and progress bars

- Each checkbox sits inside its `<label>`: the task text is its name, and clicking the text
  ticks it. Space toggles it from the keyboard (checked in Chrome).
- Done tasks are crossed out and muted, but the checkbox itself carries the state, so it never
  depends on how the text looks.
- The native `<progress value max>` element is announced as a progress bar with its value. The
  numbers are written out next to it as well. `appearance: none` plus the browser-specific
  `::-webkit-progress-value` / `::-moz-progress-bar` selectors style it the same everywhere.
- `<details>` / `<summary>` fold the hints away with no JavaScript, and work with the keyboard.

## Forms: controlled inputs and validation

- The repository link input is **controlled**: its value comes from React state (`draft`), and
  `onChange` updates that state. The draft is only saved when the form is submitted.
- `event.preventDefault()` stops the browser from sending the form and reloading the page.
- `new URL(text)` throws for text that isn't a URL, so `parseRepoUrl` wraps it in try/catch and
  only accepts `http:` and `https:`. That also rejects `javascript:` links, which would run code
  when clicked.
- `noValidate` turns off the browser's own error bubbles, so our message is shown consistently.
  The error is linked to the input with `aria-describedby` and marked with `aria-invalid`.
