// The shape of all course content. Content files in src/content must match these types,
// so a typo or a missing field is caught by TypeScript before it reaches the page.

export type ModuleId = 'html' | 'css' | 'js'

export interface Module {
  id: ModuleId
  title: string
  summary: string
}

// Text in lessons may use `backticks` for inline code, e.g. "Use the `<p>` element."

export interface HeadingBlock {
  type: 'heading'
  text: string
}

export interface TextBlock {
  type: 'text'
  text: string
}

export interface ListBlock {
  type: 'list'
  items: string[]
}

export interface CodeBlock {
  type: 'code'
  language: 'html' | 'css' | 'js'
  code: string
  caption?: string // the ? means optional
}

export interface CalloutBlock {
  type: 'callout'
  variant: 'tip' | 'warning' | 'note'
  text: string
}

// A "discriminated union": the `type` field tells TypeScript (and us) which shape a block has.
export type LessonBlock = HeadingBlock | TextBlock | ListBlock | CodeBlock | CalloutBlock

export interface Lesson {
  id: string // used in the URL: /learn/<id>
  moduleId: ModuleId
  title: string
  summary: string
  estimatedMinutes: number
  blocks: LessonBlock[]
  exerciseIds: string[] // exercises to practise with after reading, in order
}

// --- Exercises --------------------------------------------------------------------------------
// Two kinds of exercise share most fields (see ExerciseBase):
// - JavaScript: the learner writes one function. Each test calls it with `args` and compares
//   the return value with `expected`.
// - HTML/CSS: the learner writes a page. Each test is a DomCheck run against that page.
// Tests are plain data (no functions), so they can be sent to a Worker or iframe with postMessage.

export interface JsTestCase {
  description: string // shown in the results, e.g. "greet('Ada') returns 'Hello, Ada!'"
  args: unknown[] // the arguments to call the function with
  expected: unknown // what it should return
}

interface ExerciseBase {
  id: string // used in the URL: /exercises/<id>
  title: string
  instructions: string[] // paragraphs; `backticks` become inline code
  starterCode: string
  hints: string[] // shown one at a time, in order
  solution: string
  explanation: string // why the solution works, shown with it
}

export interface JsExercise extends ExerciseBase {
  language: 'js'
  functionName: string // the function the tests call
  tests: JsTestCase[]
}

// One thing to check on the learner's page. `selector` is a CSS selector, e.g. "main h1".
export type DomCheck =
  | { type: 'exists'; selector: string } // at least one matching element
  | { type: 'count'; selector: string; min: number } // at least `min` matching elements
  | { type: 'text'; selector: string; text: string } // the first match's text equals `text`
  // The first match has the attribute; if `value` is given, it must equal it.
  | { type: 'attribute'; selector: string; name: string; value?: string }
  // The first match's computed style, e.g. property "color", value "rebeccapurple".
  | { type: 'style'; selector: string; property: string; value: string }

export interface HtmlCssTestCase {
  description: string
  check: DomCheck
}

export interface HtmlCssExercise extends ExerciseBase {
  language: 'html-css'
  tests: HtmlCssTestCase[]
}

export type Exercise = JsExercise | HtmlCssExercise

// --- Skill assessment -------------------------------------------------------------------------

export type AssessmentTopic = 'values' | 'strings' | 'operators' | 'functions'

export interface AssessmentQuestion {
  id: string
  topic: AssessmentTopic
  level: 'beginner' | 'intermediate'
  prompt: string // `backticks` become inline code
  code?: string // an optional code snippet shown under the prompt
  options: string[] // `backticks` become inline code
  correctIndex: number // which option is right (0 = the first)
  explanation: string // shown on the results screen
}

// --- Practical project ------------------------------------------------------------------------
// One guided project, split into milestones. Each task has its own id, so ticking it can be
// saved (progress stores which task ids are done).

export interface ProjectTask {
  id: string // unique across the whole project, e.g. "setup-git"
  text: string // `backticks` become inline code
}

export interface ProjectMilestone {
  id: string
  title: string
  goal: string // one sentence: what works when this milestone is done
  tasks: ProjectTask[]
  hints: string[] // `backticks` become inline code
}

export interface Project {
  id: string
  title: string
  brief: string[] // paragraphs introducing the project
  milestones: ProjectMilestone[]
}

// --- Career & writing -------------------------------------------------------------------------

export type WritingCategory = 'job-search' | 'teamwork' | 'technical'

export interface WritingPrompt {
  id: string // used in the URL: /career/<id>
  category: WritingCategory
  title: string
  scenario: string[] // paragraphs: the situation to write for; `backticks` become inline code
  tips: string[]
  checklist: string[] // self-review questions; progress saves one tick per item, by position
  targetWords: { min: number; max: number }
  example?: string // a sample answer, revealed on request; blank lines separate paragraphs
}
