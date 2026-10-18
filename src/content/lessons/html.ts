import type { Lesson } from '../../types/content'

export const htmlLessons: Lesson[] = [
  {
    id: 'html-what-is-html',
    moduleId: 'html',
    title: 'What HTML is',
    summary: 'Elements, tags, attributes, and the skeleton every page shares.',
    estimatedMinutes: 10,
    exerciseIds: [],
    blocks: [
      {
        type: 'text',
        text: 'HTML (HyperText Markup Language) describes what each part of a page is: a heading, a paragraph, a link, an image. The browser reads it and builds the page. HTML is about structure and meaning, not looks — that is CSS’s job.',
      },
      { type: 'heading', text: 'Elements and tags' },
      {
        type: 'text',
        text: 'An element is usually an opening tag, some content, and a closing tag. The closing tag has a `/` before the name.',
      },
      {
        type: 'code',
        language: 'html',
        code: '<p>This is a paragraph.</p>',
        caption: 'Opening tag, content, closing tag.',
      },
      {
        type: 'text',
        text: 'Some elements have no content, so they have no closing tag. `<img>` and `<br>` are examples. These are called void elements.',
      },
      { type: 'heading', text: 'Attributes' },
      {
        type: 'text',
        text: 'Attributes add extra information to an element. They go inside the opening tag as `name="value"`.',
      },
      {
        type: 'code',
        language: 'html',
        code: '<a href="https://developer.mozilla.org">MDN Web Docs</a>\n<img src="cat.jpg" alt="A grey cat asleep on a keyboard">',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'Always give images an `alt` attribute that describes them. Screen readers read it aloud, and it shows if the image fails to load.',
      },
      { type: 'heading', text: 'The page skeleton' },
      {
        type: 'text',
        text: 'Every HTML page shares the same basic structure:',
      },
      {
        type: 'code',
        language: 'html',
        code: '<!doctype html>\n<html lang="en">\n  <head>\n    <meta charset="UTF-8">\n    <title>My first page</title>\n  </head>\n  <body>\n    <h1>Hello!</h1>\n    <p>Welcome to my page.</p>\n  </body>\n</html>',
      },
      {
        type: 'list',
        items: [
          '`<!doctype html>` tells the browser this is modern HTML.',
          '`<html lang="en">` wraps everything and states the language.',
          '`<head>` holds information about the page, like its `<title>` (shown in the browser tab).',
          '`<body>` holds everything visible on the page.',
        ],
      },
    ],
  },
  {
    id: 'html-semantic-html',
    moduleId: 'html',
    title: 'Semantic HTML',
    summary: 'Choosing elements for their meaning, and why it matters.',
    estimatedMinutes: 12,
    exerciseIds: [],
    blocks: [
      {
        type: 'text',
        text: '“Semantic” means “related to meaning”. Semantic HTML uses the element that best describes the content, instead of a generic `<div>` for everything.',
      },
      { type: 'heading', text: 'Why it matters' },
      {
        type: 'list',
        items: [
          'Screen readers use elements to describe the page and let people jump between headings and regions.',
          'Search engines understand the page better.',
          'Built-in behaviour comes free: a `<button>` works with the keyboard; a `<div>` does not.',
          'Your code is easier to read.',
        ],
      },
      { type: 'heading', text: 'Headings' },
      {
        type: 'text',
        text: 'Use `<h1>` to `<h6>` to build an outline, like chapters in a book. Use one `<h1>` per page, and don’t skip levels (an `<h3>` belongs under an `<h2>`).',
      },
      {
        type: 'callout',
        variant: 'warning',
        text: 'Don’t choose a heading level because of its size. Pick the level for its place in the outline, then size it with CSS.',
      },
      { type: 'heading', text: 'Page regions (landmarks)' },
      {
        type: 'code',
        language: 'html',
        code: '<header>Site name and logo</header>\n<nav>Main links</nav>\n<main>\n  <article>\n    <h1>Article title</h1>\n    <p>…</p>\n  </article>\n</main>\n<footer>Copyright and contact</footer>',
        caption: 'This very app uses <header>, <nav>, and <main>.',
      },
      { type: 'heading', text: 'Lists' },
      {
        type: 'text',
        text: 'Use `<ul>` (unordered) when order doesn’t matter, and `<ol>` (ordered) when it does, like steps in a recipe. Each item goes in an `<li>`.',
      },
      {
        type: 'code',
        language: 'html',
        code: '<ol>\n  <li>Boil the water.</li>\n  <li>Add the pasta.</li>\n  <li>Wait ten minutes.</li>\n</ol>',
      },
      {
        type: 'callout',
        variant: 'note',
        text: 'A quick test: if CSS failed to load, would the page still make sense? With semantic HTML, it would.',
      },
    ],
  },
]
