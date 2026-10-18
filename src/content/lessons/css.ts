import type { Lesson } from '../../types/content'

export const cssLessons: Lesson[] = [
  {
    id: 'css-how-css-works',
    moduleId: 'css',
    title: 'How CSS works',
    summary: 'Rules, selectors, properties, and the cascade.',
    estimatedMinutes: 12,
    exerciseIds: ['css-heading-color'],
    blocks: [
      {
        type: 'text',
        text: 'CSS (Cascading Style Sheets) controls how HTML looks. You write rules that pick some elements and set some of their properties.',
      },
      { type: 'heading', text: 'Anatomy of a rule' },
      {
        type: 'code',
        language: 'css',
        code: 'p {\n  color: navy;\n  font-size: 1.125rem;\n}',
        caption: 'Selector, then declarations (property: value;) inside braces.',
      },
      {
        type: 'list',
        items: [
          'The selector (`p`) picks which elements the rule applies to.',
          'Each declaration sets one property (`color`) to one value (`navy`).',
          'Every declaration ends with a semicolon.',
        ],
      },
      { type: 'heading', text: 'Common selectors' },
      {
        type: 'code',
        language: 'css',
        code: '/* every <h2> */\nh2 { margin-top: 2rem; }\n\n/* any element with class="card" */\n.card { padding: 1rem; }\n\n/* links inside a <nav> */\nnav a { text-decoration: none; }',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'Prefer classes (`.card`) for styling. They are reusable and easy to override. Avoid styling by `id`.',
      },
      { type: 'heading', text: 'The cascade' },
      {
        type: 'text',
        text: 'When two rules set the same property on the same element, the browser must pick one. Roughly, it decides by:',
      },
      {
        type: 'list',
        items: [
          'Specificity — a more specific selector wins (an `id` beats a class, a class beats an element name).',
          'Order — if specificity is equal, the rule that comes later wins.',
        ],
      },
      {
        type: 'code',
        language: 'css',
        code: 'p { color: navy; }\np { color: crimson; } /* later, so paragraphs are crimson */',
      },
      { type: 'heading', text: 'Connecting CSS to HTML' },
      {
        type: 'code',
        language: 'html',
        code: '<head>\n  <link rel="stylesheet" href="styles.css">\n</head>',
        caption: 'The usual way: a separate .css file linked from <head>.',
      },
    ],
  },
  {
    id: 'css-box-model',
    moduleId: 'css',
    title: 'The box model',
    summary: 'Content, padding, border, and margin — the space around every element.',
    estimatedMinutes: 10,
    exerciseIds: ['css-card-box'],
    blocks: [
      {
        type: 'text',
        text: 'Every element is a rectangular box. Understanding the layers of that box explains most spacing puzzles.',
      },
      { type: 'heading', text: 'The four layers' },
      {
        type: 'list',
        items: [
          'Content — the text or image itself.',
          'Padding — space inside the border, around the content. It shows the background colour.',
          'Border — a line around the padding.',
          'Margin — space outside the border, pushing other elements away. It is always transparent.',
        ],
      },
      {
        type: 'code',
        language: 'css',
        code: '.card {\n  padding: 1rem;\n  border: 2px solid #ccc;\n  margin-bottom: 1.5rem;\n}',
      },
      { type: 'heading', text: 'box-sizing' },
      {
        type: 'text',
        text: 'By default, `width` sets only the content width, so padding and border make the box bigger than you asked. Most projects switch to `border-box`, where `width` includes padding and border:',
      },
      {
        type: 'code',
        language: 'css',
        code: '*,\n*::before,\n*::after {\n  box-sizing: border-box;\n}',
        caption: 'This app’s own global stylesheet starts with exactly this rule.',
      },
      {
        type: 'callout',
        variant: 'tip',
        text: 'In your browser’s developer tools (F12), select an element and look at the box diagram in the Styles or Computed panel. It shows all four layers with their sizes.',
      },
      { type: 'heading', text: 'Shorthand' },
      {
        type: 'code',
        language: 'css',
        code: 'padding: 1rem;            /* all four sides */\npadding: 1rem 2rem;       /* top/bottom, left/right */\npadding: 1rem 2rem 0.5rem 0; /* top, right, bottom, left (clockwise) */',
      },
      {
        type: 'callout',
        variant: 'note',
        text: 'Vertical margins between blocks can “collapse”: two 20px margins touching become 20px, not 40px. This surprises everyone once.',
      },
    ],
  },
]
