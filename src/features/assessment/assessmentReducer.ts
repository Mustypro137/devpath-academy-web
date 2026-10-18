// The assessment as a "state machine": it is always on exactly one screen, and each action
// moves it to a known next state. useReducer runs this function: given the current state and an
// action, it returns the next state. It is pure, so every path can be unit-tested.
//
//   intro ──start──► question 1 ⇄ question 2 ⇄ ... ⇄ question N ──next──► results
//     ▲                                                                       │
//     └─────────────────────────────── restart ───────────────────────────────┘

export type AssessmentState =
  | { screen: 'intro' }
  | {
      screen: 'question'
      index: number // which question is showing (0 = the first)
      answers: (number | null)[] // the option chosen for each question; null = not yet
      showUnanswered: boolean // true after "Next" was pressed without choosing an answer
    }
  | { screen: 'results'; answers: number[] }

export type AssessmentAction =
  | { type: 'start'; questionCount: number }
  | { type: 'select'; option: number }
  | { type: 'next' }
  | { type: 'back' }
  | { type: 'restart' }

export const initialAssessmentState: AssessmentState = { screen: 'intro' }

export function assessmentReducer(
  state: AssessmentState,
  action: AssessmentAction,
): AssessmentState {
  if (action.type === 'restart') return initialAssessmentState

  switch (state.screen) {
    case 'intro':
      if (action.type !== 'start') return state
      return {
        screen: 'question',
        index: 0,
        answers: Array<number | null>(action.questionCount).fill(null),
        showUnanswered: false,
      }

    case 'question': {
      const { index, answers } = state
      switch (action.type) {
        case 'select': {
          const next = [...answers] // a new array: never change state in place
          next[index] = action.option
          return { ...state, answers: next, showUnanswered: false }
        }
        case 'next':
          // An unanswered question can't be skipped: stay here and say why.
          if (answers[index] === null) return { ...state, showUnanswered: true }
          if (index < answers.length - 1) {
            return { ...state, index: index + 1, showUnanswered: false }
          }
          // Every question has an answer by now, because none could be skipped.
          return { screen: 'results', answers: answers as number[] }
        case 'back':
          return index === 0 ? state : { ...state, index: index - 1, showUnanswered: false }
        default:
          return state
      }
    }

    case 'results':
      return state // only 'restart' (handled above) leaves the results
  }
}
