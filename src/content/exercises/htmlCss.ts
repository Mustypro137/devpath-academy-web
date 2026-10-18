import type { HtmlCssExercise } from '../../types/content'

// HTML/CSS exercises: the learner edits one HTML document (CSS goes in a <style> element), and
// each test is a DomCheck run against the result.
// content.test.ts checks that every solution passes its own tests and every starter code fails.

export const htmlCssExercises: HtmlCssExercise[] = [
  // --- What HTML is ---
  {
    id: 'html-first-page',
    language: 'html-css',
    title: 'Your first page',
    instructions: [
      'Add a main heading that says `My first page`, and a paragraph under it with any text you like.',
      'Use `<h1>` for the heading and `<p>` for the paragraph.',
    ],
    starterCode: '<!-- Add your heading and paragraph below -->\n',
    tests: [
      { description: 'The page has an <h1>', check: { type: 'exists', selector: 'h1' } },
      {
        description: 'The <h1> says "My first page"',
        check: { type: 'text', selector: 'h1', text: 'My first page' },
      },
      { description: 'The page has a <p>', check: { type: 'exists', selector: 'p' } },
    ],
    hints: [
      'Most elements have an opening tag and a closing tag, with the content between them.',
      'A heading looks like `<h1>My first page</h1>`.',
      'Put the paragraph on the next line: `<p>Some text</p>`.',
    ],
    solution: '<h1>My first page</h1>\n<p>Hello! This is my first web page.</p>\n',
    explanation:
      '`<h1>` is the most important heading on the page, and `<p>` holds a paragraph of text. The browser shows each on its own line because both are block elements.',
  },
  {
    id: 'html-link',
    language: 'html-css',
    title: 'Make a link',
    instructions: [
      'Turn the text `MDN Web Docs` into a link to `https://developer.mozilla.org`.',
      'Links use the `<a>` element. The `href` attribute says where the link goes.',
    ],
    starterCode: '<p>The best reference for HTML is MDN Web Docs.</p>\n',
    tests: [
      { description: 'The page has a link (<a>)', check: { type: 'exists', selector: 'a' } },
      {
        description: 'The link goes to https://developer.mozilla.org',
        check: {
          type: 'attribute',
          selector: 'a',
          name: 'href',
          value: 'https://developer.mozilla.org',
        },
      },
      {
        description: 'The link text is "MDN Web Docs"',
        check: { type: 'text', selector: 'a', text: 'MDN Web Docs' },
      },
    ],
    hints: [
      'Wrap only the words `MDN Web Docs` in the `<a>` element, and leave the rest of the sentence as it is.',
      'Attributes go inside the opening tag: `<a href="...">`.',
      'The result: `<a href="https://developer.mozilla.org">MDN Web Docs</a>`.',
    ],
    solution:
      '<p>The best reference for HTML is <a href="https://developer.mozilla.org">MDN Web Docs</a>.</p>\n',
    explanation:
      'The `<a>` element makes its content clickable, and `href` holds the address. The link sits inside the paragraph, so it flows with the sentence.',
  },

  // --- Semantic HTML ---
  {
    id: 'html-page-layout',
    language: 'html-css',
    title: 'Give the page structure',
    instructions: [
      'This page is built from `<div>` elements, which tell browsers and screen readers nothing about what each part is.',
      'Replace each `<div>` with the matching semantic element: `<header>`, `<nav>`, `<main>`, and `<footer>`. Keep the content inside them.',
    ],
    starterCode:
      '<div class="header">\n  <div class="nav">\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </div>\n</div>\n<div class="main">\n  <h1>Welcome</h1>\n  <p>Thanks for visiting.</p>\n</div>\n<div class="footer">\n  <p>© 2026 My Site</p>\n</div>\n',
    tests: [
      { description: 'The page has a <header>', check: { type: 'exists', selector: 'header' } },
      { description: 'The page has a <nav>', check: { type: 'exists', selector: 'nav' } },
      { description: 'The page has a <main>', check: { type: 'exists', selector: 'main' } },
      { description: 'The page has a <footer>', check: { type: 'exists', selector: 'footer' } },
      {
        description: 'The <h1> is inside <main>',
        check: { type: 'exists', selector: 'main h1' },
      },
      {
        description: 'The links are inside <nav>',
        check: { type: 'count', selector: 'nav a', min: 2 },
      },
    ],
    hints: [
      'The class names tell you which element each `<div>` should become.',
      'Change both the opening and the closing tag: `<div class="main">` … `</div>` becomes `<main>` … `</main>`.',
      'The `class` attributes are no longer needed: the element name says it all.',
    ],
    solution:
      '<header>\n  <nav>\n    <a href="/">Home</a>\n    <a href="/about">About</a>\n  </nav>\n</header>\n<main>\n  <h1>Welcome</h1>\n  <p>Thanks for visiting.</p>\n</main>\n<footer>\n  <p>© 2026 My Site</p>\n</footer>\n',
    explanation:
      'Semantic elements describe their content. Screen readers list `<nav>` and `<main>` as landmarks that users can jump to, and search engines understand the page better.',
  },

  // --- How CSS works ---
  {
    id: 'css-heading-color',
    language: 'html-css',
    title: 'Style the text',
    instructions: [
      'In the `<style>` element, write two rules:',
      'Make the `h1` text `rebeccapurple`, and make paragraphs (`p`) `18px` in size.',
    ],
    starterCode:
      '<style>\n  /* Your CSS here */\n</style>\n\n<h1>Welcome</h1>\n<p>CSS controls how a page looks.</p>\n',
    tests: [
      {
        description: 'The <h1> is rebeccapurple',
        check: { type: 'style', selector: 'h1', property: 'color', value: 'rebeccapurple' },
      },
      {
        description: 'Paragraphs are 18px',
        check: { type: 'style', selector: 'p', property: 'font-size', value: '18px' },
      },
    ],
    hints: [
      'A rule is a selector, then declarations inside `{ }`: `h1 { ... }`.',
      'Each declaration is `property: value;`. Text colour is `color`, text size is `font-size`.',
      'For example: `h1 { color: rebeccapurple; }`.',
    ],
    solution:
      '<style>\n  h1 {\n    color: rebeccapurple;\n  }\n\n  p {\n    font-size: 18px;\n  }\n</style>\n\n<h1>Welcome</h1>\n<p>CSS controls how a page looks.</p>\n',
    explanation:
      'The selector (`h1`, `p`) picks the elements, and each declaration sets one property. Every matching element on the page gets the style.',
  },

  // --- The box model ---
  {
    id: 'css-card-box',
    language: 'html-css',
    title: 'Build a card',
    instructions: [
      'Style the `.card` element using the box model:',
      'Give it `16px` of padding on every side, a `2px solid black` border, and `24px` of margin below it.',
    ],
    starterCode:
      '<style>\n  .card {\n    /* Your CSS here */\n  }\n</style>\n\n<div class="card">\n  <h2>Card title</h2>\n  <p>Cards group related content.</p>\n</div>\n<p>Some text after the card.</p>\n',
    tests: [
      {
        description: 'The card has 16px padding on top',
        check: { type: 'style', selector: '.card', property: 'padding-top', value: '16px' },
      },
      {
        description: 'The card has 16px padding on the left',
        check: { type: 'style', selector: '.card', property: 'padding-left', value: '16px' },
      },
      {
        description: 'The card border is 2px wide',
        check: { type: 'style', selector: '.card', property: 'border-top-width', value: '2px' },
      },
      {
        description: 'The card border is solid',
        check: { type: 'style', selector: '.card', property: 'border-top-style', value: 'solid' },
      },
      {
        description: 'The card has 24px margin below it',
        check: { type: 'style', selector: '.card', property: 'margin-bottom', value: '24px' },
      },
    ],
    hints: [
      'Padding is the space inside the border; margin is the space outside it.',
      '`padding: 16px;` sets all four sides at once.',
      'The `border` shorthand takes width, style, and colour: `border: 2px solid black;`.',
    ],
    solution:
      '<style>\n  .card {\n    padding: 16px;\n    border: 2px solid black;\n    margin-bottom: 24px;\n  }\n</style>\n\n<div class="card">\n  <h2>Card title</h2>\n  <p>Cards group related content.</p>\n</div>\n<p>Some text after the card.</p>\n',
    explanation:
      'From the inside out: content, then padding, then border, then margin. Shorthands like `padding` and `border` set several properties in one line.',
  },
]
