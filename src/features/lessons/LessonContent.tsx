import type { LessonBlock } from '../../types/content'
import { InlineText } from './InlineText'
import styles from './LessonContent.module.css'

const CALLOUT_LABELS = { tip: 'Tip', warning: 'Watch out', note: 'Note' } as const

const LANGUAGE_LABELS = { html: 'HTML', css: 'CSS', js: 'JavaScript' } as const

// Draws one block. The switch on `block.type` "narrows" the union: inside each case,
// TypeScript knows exactly which fields exist (e.g. only code blocks have `language`).
function Block({ block }: { block: LessonBlock }) {
  switch (block.type) {
    case 'heading':
      // Lesson sections are <h2>: the lesson title on the page is the <h1>.
      return (
        <h2>
          <InlineText text={block.text} />
        </h2>
      )
    case 'text':
      return (
        <p>
          <InlineText text={block.text} />
        </p>
      )
    case 'list':
      return (
        <ul>
          {block.items.map((item, index) => (
            <li key={index}>
              <InlineText text={item} />
            </li>
          ))}
        </ul>
      )
    case 'code':
      return (
        <figure className={styles.codeFigure}>
          <div className={styles.codeLanguage}>{LANGUAGE_LABELS[block.language]}</div>
          {/* tabIndex lets keyboard users focus the block and scroll long lines sideways. */}
          <pre className={styles.code} tabIndex={0}>
            <code>{block.code}</code>
          </pre>
          {block.caption && <figcaption className={styles.caption}>{block.caption}</figcaption>}
        </figure>
      )
    case 'callout':
      // The visible label ("Tip", "Watch out") carries the meaning, not just the colour.
      return (
        <div role="note" className={styles.callout} data-variant={block.variant}>
          <strong>{CALLOUT_LABELS[block.variant]}: </strong>
          <InlineText text={block.text} />
        </div>
      )
    default: {
      // If a new block type is added to the union but not handled above, this line stops
      // compiling: `block` would no longer be `never`. A compile-time safety net.
      const unhandled: never = block
      return unhandled
    }
  }
}

export function LessonContent({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className={styles.content}>
      {/* Index keys are fine here: lesson blocks are fixed data that never re-order. */}
      {blocks.map((block, index) => (
        <Block key={index} block={block} />
      ))}
    </div>
  )
}
