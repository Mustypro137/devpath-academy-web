# M2 — Content model & lesson reader: learning notes

## Data vs presentation

- Lessons are **data** (`src/content/`), drawn by **components** (`src/features/lessons/`,
  `src/routes/`). To add a lesson you edit a data file. No component changes.
- Pages read content only through `src/content/index.ts` (`getLesson`, `getLessonsForModule`,
  ...). The files behind it can be reorganised without touching any page.

## Interfaces and union types

- An **interface** describes the shape of an object: `Lesson` must have an `id`, a `title`,
  `blocks`, and so on. A missing or misspelled field is a compile error, not a broken page.
- `caption?: string` means the field is **optional**.
- `'tip' | 'warning' | 'note'` is a **union of literal types**: only those three strings are
  allowed.
- `LessonBlock = HeadingBlock | TextBlock | ...` is a **discriminated union**. Every member has
  a `type` field with a different value. Checking `block.type` tells TypeScript which shape you
  have. This is called **narrowing**.
- The `never` check in `LessonContent`'s `default:` case is a safety net. If someone adds a new
  block type and forgets to render it, the code stops compiling.

## `.map()` with keys

- `blocks.map((block, index) => <Block key={index} ... />)` turns data into elements.
- `key` helps React match elements between renders. Prefer a stable id (`lesson.id`,
  `module.id`). The array index is only OK for lists that never re-order, like lesson blocks.

## URL params

- `/learn/:lessonId` + `useParams()` gives the id from the address bar.
- A URL can contain anything, so `getLesson()` may return `undefined`. `LessonPage` shows
  "Lesson not found" in that case. TypeScript forces us to handle it before using `lesson`.

## Safe rendering

- React **escapes** text: `"<p>"` in a string shows as the characters `<p>`, never as an HTML
  element. That's why lessons can show HTML examples safely, and why we never need
  `dangerouslySetInnerHTML`.
- `InlineText` splits on the backtick: odd-numbered pieces become `<code>`.

## Accessibility details

- One `<h1>` per page (the lesson title). Lesson section headings are `<h2>`.
- Code blocks have `tabIndex={0}`, so keyboard users can focus them and scroll long lines.
- Callouts show a written label ("Tip", "Watch out"), so the meaning doesn't depend on colour.
- Each module on `/learn` is a `<section>` with `aria-labelledby`, so screen readers list it as
  a named region.

## Testing content

- `content.test.ts` tests the **data itself**: unique, URL-safe ids, at least two lessons per
  module, closed backticks. Content mistakes fail `npm test` instead of reaching the page.
- `lessons.test.tsx` uses `it.each(LESSONS...)`, so every new lesson is tested automatically.

## Troubleshooting

- Vitest ran out of memory with the default settings. Running test files in threads with half
  the CPU cores fixed it (see `vite.config.ts` and `DECISIONS.md`).
