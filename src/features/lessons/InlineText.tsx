// Renders lesson text, turning `backtick` sections into <code> elements.
// Splitting on the backtick gives alternating pieces: normal, code, normal, code, ...
// e.g. "Use `<p>` here" -> ["Use ", "<p>", " here"]
// React escapes all text, so "<p>" shows as characters on screen and is never run as HTML.
export function InlineText({ text }: { text: string }) {
  const parts = text.split('`')

  return (
    <>{parts.map((part, index) => (index % 2 === 1 ? <code key={index}>{part}</code> : part))}</>
  )
}
