# M6 — JavaScript skill assessment: learning notes

## State machines

- The assessment is always on exactly **one** screen: `intro`, `question`, or `results`. Each
  screen has only the data it needs: there is no "current question" on the intro screen.
- A union type models this: `AssessmentState = { screen: 'intro' } | { screen: 'question', ... }
| { screen: 'results', ... }`. Checking `state.screen` narrows it, just like the exercise
  `language` field in M5.
- Every move is an **action** (`start`, `select`, `next`, `back`, `restart`), and the reducer
  decides where it leads. Actions that make no sense on the current screen (e.g. `next` on the
  intro) change nothing.
- The diagram at the top of `assessmentReducer.ts` is the whole flow. If the code and the diagram
  disagree, one of them is wrong.

## `useReducer`

- `const [state, dispatch] = useReducer(assessmentReducer, initialAssessmentState)`.
  `dispatch(action)` asks React to run `assessmentReducer(state, action)` and re-render with
  the result.
- Prefer it over several `useState`s when pieces of state change together and follow rules,
  e.g. "you can't reach the results with an unanswered question".
- The reducer is a pure function, so `assessmentReducer.test.ts` tests every path without
  rendering anything. `actions.reduce(assessmentReducer, initialState)` replays a whole click
  sequence in one line.
- The reducer never changes the old state; it returns a new object (`[...answers]`). A test
  checks this.

## Saving at the right moment

- The attempt is saved in the **click handler** for "See my results", not in a `useEffect`
  that watches for the results screen.
- The handler asks the reducer where `next` leads (`assessmentReducer(state, action)`) and
  saves only if that is the results. The rule "is this the end?" lives in one place.
- Effects are for syncing with things outside React. In development, React's Strict Mode runs
  effects twice on purpose, which would have saved every attempt twice.

## Derived state

- The results screen calculates the score from the answers on every render
  (`scoreAnswers(questions, answers)`). Only the answers are stored.
- Scoring and the recommendation are pure functions (`scoring.ts`) with their own unit tests.

## Accessible radio groups

- Each question is a `<fieldset>`, and its `<legend>` is the question. Screen readers announce
  the question with each option, and the group gets the question as its name (tests find it
  with `getByRole('group')`).
- All radios in one question share a `name`, so the browser treats them as one group: only one
  can be chosen, and the arrow keys move between them. Checked in Chrome: Tab enters the group,
  Space chooses, ArrowDown moves and chooses.
- Each `<input>` sits inside its `<label>`, so the whole row is clickable.
- `:has(input:checked)` in CSS highlights the chosen row without any JavaScript.

## Focus management

- When a new question or the results replace the old content, focus moves to the new heading
  (`tabIndex={-1}` + `ref.focus()` in an effect). Without this, keyboard and screen-reader users
  are left on a button that has just changed meaning, and don't hear the new question.
- "Choose an answer to continue." uses `role="alert"`, because it explains why nothing happened.
- The score table uses `<caption>`, `<th scope="col">` and `<th scope="row">`, so screen readers
  can say "Functions, Score, 75%".
