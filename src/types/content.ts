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
  exerciseIds: string[] // filled in from Milestone 4
}
