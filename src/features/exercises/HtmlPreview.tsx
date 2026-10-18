import { useDebouncedValue } from '../../hooks/useDebouncedValue'
import styles from './exercises.module.css'

export const PREVIEW_DELAY_MS = 400

// Shows the learner's page as they type. The checks run in a separate iframe (htmlRunner.ts);
// this one is only for looking at.
export function HtmlPreview({ code }: { code: string }) {
  // Rebuilding the page on every keystroke would flicker, so wait for a short pause.
  const previewCode = useDebouncedValue(code, PREVIEW_DELAY_MS)

  return (
    <section aria-labelledby="preview-heading">
      <h2 id="preview-heading" className={styles.heading}>
        Preview
      </h2>
      {/* srcDoc: the iframe shows this HTML string as its page.
          sandbox="" turns everything risky off: no scripts, no forms, no pop-ups, no navigating
          this app away, and a separate origin, so it can't touch this page or its storage. */}
      <iframe
        title="Preview of your page"
        sandbox=""
        srcDoc={previewCode}
        className={styles.preview}
      />
    </section>
  )
}
