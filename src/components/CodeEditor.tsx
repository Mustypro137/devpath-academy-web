import { indentWithTab } from '@codemirror/commands'
import { javascript } from '@codemirror/lang-javascript'
import { HighlightStyle, syntaxHighlighting } from '@codemirror/language'
import { EditorView, keymap } from '@codemirror/view'
import { tags } from '@lezer/highlight'
import { basicSetup } from 'codemirror'
import { useEffect, useId, useRef } from 'react'
import styles from './CodeEditor.module.css'

interface CodeEditorProps {
  label: string // read out by screen readers, e.g. "Your code"
  value: string
  onChange: (value: string) => void
}

// Colours come from tokens.css, so the editor follows the light/dark theme like everything else.
const highlightStyle = HighlightStyle.define([
  { tag: tags.keyword, color: 'var(--code-keyword)' },
  { tag: [tags.string, tags.special(tags.string)], color: 'var(--code-string)' },
  { tag: [tags.number, tags.bool, tags.null], color: 'var(--code-number)' },
  { tag: tags.comment, color: 'var(--code-comment)', fontStyle: 'italic' },
  { tag: tags.function(tags.variableName), color: 'var(--code-function)' },
])

const editorTheme = EditorView.theme({
  '&': {
    backgroundColor: 'var(--color-bg)',
    color: 'var(--color-text)',
    fontSize: 'var(--text-sm)',
  },
  '.cm-content': { fontFamily: 'var(--font-mono)', caretColor: 'var(--color-text)' },
  '.cm-content, .cm-gutter': { minHeight: '10rem' }, // room to write, even for short starter code
  '.cm-gutters': {
    backgroundColor: 'var(--color-surface)',
    color: 'var(--color-text-muted)',
    border: 'none',
  },
  '.cm-activeLine, .cm-activeLineGutter': { backgroundColor: 'var(--color-accent-soft)' },
  '&.cm-focused': { outline: 'none' }, // the wrapper shows the focus ring instead (see CSS)
})

// A "controlled" editor: the parent owns `value` and hears about every edit through onChange,
// just like a React <input value onChange>.
export function CodeEditor({ label, value, onChange }: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef<EditorView | null>(null)
  const helpId = useId()

  // Keep the latest onChange in a ref, so the editor (created once) always calls the current one.
  const onChangeRef = useRef(onChange)
  useEffect(() => {
    onChangeRef.current = onChange
  })

  // CodeMirror manages its own DOM, so React only gives it an empty <div> to fill. Create the
  // editor once when the component appears, and destroy it when the component goes away.
  useEffect(() => {
    const view = new EditorView({
      parent: containerRef.current!,
      doc: value,
      extensions: [
        basicSetup,
        javascript(),
        keymap.of([indentWithTab]),
        syntaxHighlighting(highlightStyle),
        editorTheme,
        EditorView.contentAttributes.of({ 'aria-label': label, 'aria-describedby': helpId }),
        EditorView.updateListener.of((update) => {
          if (update.docChanged) onChangeRef.current(update.state.doc.toString())
        }),
      ],
    })
    viewRef.current = view
    return () => view.destroy()
    // Only on mount: later `value` changes are handled by the effect below, and the editor
    // shouldn't be rebuilt (losing cursor and undo history) on every keystroke.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // When the parent changes `value` itself (e.g. "Start over"), put the new text in the editor.
  // When the change came from typing, the text already matches, so nothing happens.
  useEffect(() => {
    const view = viewRef.current
    if (view && view.state.doc.toString() !== value) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value } })
    }
  }, [value])

  return (
    <div>
      <div ref={containerRef} className={styles.editor} />
      <p id={helpId} className={styles.help}>
        Tab indents. To leave the editor with the keyboard, press Esc, then Tab.
      </p>
    </div>
  )
}
